"""Game ORM entity."""

from __future__ import annotations

from sqlalchemy import Column, Integer, String, Text

from app.entities.base import Base


class GameEntity(Base):
    __tablename__ = "games"

    id = Column(String, primary_key=True)
    room_id = Column(String, nullable=True, index=True)
    status = Column(String, nullable=False, default="waiting")
    config = Column(Text, nullable=False, default="{}")
    deck = Column(Text, nullable=False, default="[]")
    current_turn_player_id = Column(String, nullable=True)
    turn_number = Column(Integer, nullable=False, default=0)
    state_phase = Column(String, nullable=False, default="waiting_for_players")
    pending_action = Column(Text, nullable=True)
    awaiting_influence_loss_from = Column(String, nullable=True)
    exchange_cards = Column(Text, nullable=True)
    winner_id = Column(String, nullable=True)
    event_log = Column(Text, nullable=False, default="[]")
    created_at = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)
