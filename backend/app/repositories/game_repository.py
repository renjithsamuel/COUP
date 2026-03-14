"""Game repository — persists game state to SQLite."""

from __future__ import annotations

import json
from typing import Any
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.entities.game_entity import GameEntity
from app.entities.player_entity import PlayerEntity
from app.models.card import Card
from app.models.game import GameConfig, GamePhase, GameState, GameStatus, PendingAction
from app.models.player import Player
from app.repositories.base import Repository
from app.repositories.player_repository import PlayerRepository


class GameRepository(Repository[GameState]):
    """Persists GameState to/from SQLite via SQLAlchemy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._player_repo = PlayerRepository(session)

    async def get_by_id(self, id: str) -> GameState | None:
        result = await self._session.execute(
            select(GameEntity).where(GameEntity.id == id)
        )
        entity = result.scalar_one_or_none()
        if entity is None:
            return None
        players = await self._player_repo.get_by_game_id(id)
        return self._to_model(entity, players)

    async def get_all(self) -> list[GameState]:
        result = await self._session.execute(select(GameEntity))
        entities = result.scalars().all()
        states = []
        for entity in entities:
            players = await self._player_repo.get_by_game_id(entity.id)
            states.append(self._to_model(entity, players))
        return states

    async def get_by_status(self, status: str) -> list[GameState]:
        result = await self._session.execute(
            select(GameEntity).where(GameEntity.status == status)
        )
        entities = result.scalars().all()
        states = []
        for entity in entities:
            players = await self._player_repo.get_by_game_id(entity.id)
            states.append(self._to_model(entity, players))
        return states

    async def create(self, state: GameState) -> GameState:
        now = datetime.now(timezone.utc).isoformat()
        entity = GameEntity(
            id=state.id,
            status=state.status.value,
            config=state.config.model_dump_json(),
            deck=json.dumps([c.model_dump() for c in state.deck]),
            current_turn_player_id=state.current_turn_player_id,
            turn_number=state.turn_number,
            state_phase=state.phase.value,
            pending_action=state.pending_action.model_dump_json() if state.pending_action else None,
            awaiting_influence_loss_from=state.awaiting_influence_loss_from,
            exchange_cards=json.dumps([c.model_dump() for c in state.exchange_cards]),
            winner_id=state.winner_id,
            event_log=json.dumps(state.event_log),
            created_at=now,
            updated_at=now,
        )
        self._session.add(entity)

        try:
            for player in state.players:
                await self._player_repo.create(player, state.id)

            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return state

    async def update(self, state: GameState) -> GameState:
        result = await self._session.execute(
            select(GameEntity).where(GameEntity.id == state.id)
        )
        entity = result.scalar_one_or_none()
        if entity is None:
            raise ValueError(f"Game {state.id} not found")

        entity.status = state.status.value
        entity.config = state.config.model_dump_json()
        entity.deck = json.dumps([c.model_dump() for c in state.deck])
        entity.current_turn_player_id = state.current_turn_player_id
        entity.turn_number = state.turn_number
        entity.state_phase = state.phase.value
        entity.pending_action = (
            state.pending_action.model_dump_json() if state.pending_action else None
        )
        entity.awaiting_influence_loss_from = state.awaiting_influence_loss_from
        entity.exchange_cards = json.dumps([c.model_dump() for c in state.exchange_cards])
        entity.winner_id = state.winner_id
        entity.event_log = json.dumps(state.event_log)
        entity.updated_at = datetime.now(timezone.utc).isoformat()

        try:
            for player in state.players:
                await self._player_repo.update_player(player, state.id)

            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return state

    async def delete(self, id: str) -> bool:
        result = await self._session.execute(
            select(GameEntity).where(GameEntity.id == id)
        )
        entity = result.scalar_one_or_none()
        if entity is None:
            return False

        try:
            await self._player_repo.delete_by_game_id(id)
            await self._session.delete(entity)
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise
        return True

    async def get_leaderboard(self, limit: int = 10) -> list[dict[str, Any]]:
        result = await self._session.execute(
            select(GameEntity)
            .where(GameEntity.status == GameStatus.FINISHED.value)
            .order_by(GameEntity.updated_at.desc())
        )
        finished_games = result.scalars().all()

        standings: dict[str, dict[str, Any]] = {}

        for entity in finished_games:
            players = await self._player_repo.get_by_game_id(entity.id)
            for player in players:
                display_name = player.name.strip()
                if not display_name:
                    continue

                player_key = player.profile_id.strip() or f"name::{display_name.lower()}"

                entry = standings.setdefault(
                    player_key,
                    {
                        "player_name": display_name,
                        "player_key": player_key,
                        "wins": 0,
                        "games_played": 0,
                    },
                )
                entry["games_played"] += 1
                if player.id == entity.winner_id:
                    entry["wins"] += 1

        leaderboard = [
            {
                "player_name": entry["player_name"],
                "player_key": entry["player_key"],
                "wins": entry["wins"],
                "games_played": entry["games_played"],
                "win_rate": round(entry["wins"] / entry["games_played"], 3)
                if entry["games_played"]
                else 0.0,
                "score": entry["games_played"] + (entry["wins"] * 2),
            }
            for entry in standings.values()
        ]

        leaderboard.sort(
            key=lambda row: (
                -row["score"],
                -row["wins"],
                -row["win_rate"],
                -row["games_played"],
                row["player_name"].lower(),
            )
        )
        return leaderboard[:limit]

    async def delete_finished_before(self, cutoff: datetime) -> list[str]:
        cutoff_iso = cutoff.astimezone(timezone.utc).isoformat()
        result = await self._session.execute(
            select(GameEntity.id).where(
                GameEntity.status == GameStatus.FINISHED.value,
                GameEntity.updated_at < cutoff_iso,
            )
        )
        game_ids = list(result.scalars().all())
        if not game_ids:
            return []

        try:
            await self._session.execute(
                delete(PlayerEntity).where(PlayerEntity.game_id.in_(game_ids))
            )
            await self._session.execute(
                delete(GameEntity).where(GameEntity.id.in_(game_ids))
            )
            await self._session.commit()
        except Exception:
            await self._session.rollback()
            raise

        return game_ids

    def _to_model(self, entity: GameEntity, players: list[Player]) -> GameState:
        deck_data = json.loads(entity.deck) if entity.deck else []
        deck = [Card.model_validate(c, strict=False) for c in deck_data]
        exchange_data = json.loads(entity.exchange_cards) if entity.exchange_cards else []
        exchange_cards = [Card.model_validate(c, strict=False) for c in exchange_data]
        event_log = json.loads(entity.event_log) if entity.event_log else []
        config = GameConfig.model_validate_json(entity.config) if entity.config else GameConfig()
        pending = (
            PendingAction.model_validate_json(entity.pending_action)
            if entity.pending_action
            else None
        )

        return GameState(
            id=entity.id,
            status=GameStatus(entity.status),
            phase=GamePhase(entity.state_phase),
            config=config,
            players=players,
            deck=deck,
            current_turn_player_id=entity.current_turn_player_id,
            turn_number=entity.turn_number,
            pending_action=pending,
            awaiting_influence_loss_from=entity.awaiting_influence_loss_from,
            exchange_cards=exchange_cards,
            winner_id=entity.winner_id,
            event_log=event_log,
        )
