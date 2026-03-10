"""Game events ORM entity (append-only log)."""

from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text

from app.entities.base import Base


class GameEventEntity(Base):
    __tablename__ = "game_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    game_id = Column(String, nullable=False, index=True)
    turn_number = Column(Integer, nullable=False)
    event_type = Column(String, nullable=False)
    payload = Column(Text, nullable=False, default="{}")
    created_at = Column(String, nullable=False)
