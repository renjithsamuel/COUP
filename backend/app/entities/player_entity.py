"""Player ORM entity."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, Integer, String, Text

from app.entities.base import Base


class PlayerEntity(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True)
    game_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    profile_id = Column(String, nullable=False, default="", index=True)
    coins = Column(Integer, nullable=False, default=2)
    seat_index = Column(Integer, nullable=False)
    is_alive = Column(Boolean, nullable=False, default=True)
    session_token = Column(String, nullable=False, unique=True)
    connected = Column(Boolean, nullable=False, default=False)
    is_bot = Column(Boolean, nullable=False, default=False)
    bot_difficulty = Column(String, nullable=False, default="")
    influences = Column(Text, nullable=False, default="[]")  # JSON: list of Card
    created_at = Column(String, nullable=False)
