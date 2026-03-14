"""Player models."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from app.models.card import Card


class Player(BaseModel):
    """Full player model (server-side, includes hidden info)."""

    model_config = ConfigDict(strict=True)

    id: str
    name: str
    profile_id: str = ""
    coins: int = 2
    influences: list[Card] = Field(default_factory=list)
    is_alive: bool = True
    session_token: str = ""
    connected: bool = False
    seat_index: int = 0
    is_bot: bool = False
    bot_difficulty: str = ""

    @property
    def alive_influences(self) -> list[Card]:
        return [c for c in self.influences if not c.revealed]

    @property
    def revealed_influences(self) -> list[Card]:
        return [c for c in self.influences if c.revealed]

    @property
    def influence_count(self) -> int:
        return len(self.alive_influences)


class PlayerPublic(BaseModel):
    """Public player view — hides face-down card characters from other players."""

    model_config = ConfigDict(strict=True)

    id: str
    name: str
    coins: int
    influence_count: int
    revealed_characters: list[str]
    is_alive: bool
    connected: bool
    seat_index: int
    is_bot: bool = False
    bot_difficulty: str = ""


def to_public(player: Player) -> PlayerPublic:
    """Convert a full Player to a public view (no hidden card info)."""
    return PlayerPublic(
        id=player.id,
        name=player.name,
        coins=player.coins,
        influence_count=player.influence_count,
        revealed_characters=[c.character.value for c in player.revealed_influences],
        is_alive=player.is_alive,
        connected=player.connected,
        seat_index=player.seat_index,
        is_bot=player.is_bot,
        bot_difficulty=player.bot_difficulty,
    )
