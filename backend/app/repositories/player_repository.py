"""Player repository — persists player data to SQLite."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.entities.player_entity import PlayerEntity
from app.models.card import Card
from app.models.player import Player


class PlayerRepository:
    """Persists Player data to/from SQLite."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @staticmethod
    def _db_player_id(player_id: str, game_id: str) -> str:
        return f"{game_id}:{player_id}"

    @staticmethod
    def _model_player_id(entity_id: str) -> str:
        parts = entity_id.split(":", 1)
        return parts[1] if len(parts) == 2 else entity_id

    async def get_by_game_id(self, game_id: str) -> list[Player]:
        result = await self._session.execute(
            select(PlayerEntity)
            .where(PlayerEntity.game_id == game_id)
            .order_by(PlayerEntity.seat_index)
        )
        entities = result.scalars().all()
        return [self._to_model(e) for e in entities]

    async def get_by_session_token(self, token: str) -> Player | None:
        result = await self._session.execute(
            select(PlayerEntity).where(PlayerEntity.session_token == token)
        )
        entity = result.scalar_one_or_none()
        return self._to_model(entity) if entity else None

    async def create(self, player: Player, game_id: str) -> Player:
        entity = PlayerEntity(
            id=self._db_player_id(player.id, game_id),
            game_id=game_id,
            name=player.name,
            profile_id=player.profile_id,
            coins=player.coins,
            seat_index=player.seat_index,
            is_alive=player.is_alive,
            session_token=player.session_token,
            connected=player.connected,
            influences=json.dumps([c.model_dump() for c in player.influences]),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._session.add(entity)
        return player

    async def update_player(self, player: Player, game_id: str) -> Player:
        result = await self._session.execute(
            select(PlayerEntity).where(
                PlayerEntity.id == self._db_player_id(player.id, game_id),
                PlayerEntity.game_id == game_id,
            )
        )
        entity = result.scalar_one_or_none()
        if entity is None:
            return await self.create(player, game_id)

        entity.name = player.name
        entity.profile_id = player.profile_id
        entity.coins = player.coins
        entity.seat_index = player.seat_index
        entity.is_alive = player.is_alive
        entity.connected = player.connected
        entity.influences = json.dumps([c.model_dump() for c in player.influences])
        return player

    async def delete_by_game_id(self, game_id: str) -> None:
        await self._session.execute(
            delete(PlayerEntity).where(PlayerEntity.game_id == game_id)
        )

    def _to_model(self, entity: PlayerEntity) -> Player:
        influences_data = json.loads(entity.influences) if entity.influences else []
        influences = [Card.model_validate(c, strict=False) for c in influences_data]
        return Player(
            id=self._model_player_id(entity.id),
            name=entity.name,
            profile_id=entity.profile_id,
            coins=entity.coins,
            influences=influences,
            is_alive=entity.is_alive,
            session_token=entity.session_token,
            connected=entity.connected,
            seat_index=entity.seat_index,
        )
