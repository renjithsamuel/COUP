"""Game repository — persists game state to SQLite."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.entities.game_entity import GameEntity
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

        for player in state.players:
            await self._player_repo.create(player, state.id)

        await self._session.commit()
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

        for player in state.players:
            await self._player_repo.update_player(player, state.id)

        await self._session.commit()
        return state

    async def delete(self, id: str) -> bool:
        result = await self._session.execute(
            select(GameEntity).where(GameEntity.id == id)
        )
        entity = result.scalar_one_or_none()
        if entity is None:
            return False
        await self._session.delete(entity)
        await self._session.commit()
        return True

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
