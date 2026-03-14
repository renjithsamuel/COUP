"""Lobby models."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AiDifficulty(str, Enum):
    """Supported bot difficulty levels for solo matches."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class LobbyPlayer(BaseModel):
    """A player in a lobby."""

    model_config = ConfigDict(strict=True)

    id: str
    name: str
    profile_id: str = ""
    is_host: bool = False
    is_ready: bool = False


class LobbyCreate(BaseModel):
    """Request body to create a new lobby."""

    model_config = ConfigDict(strict=True)

    host_name: str = Field(..., min_length=1, max_length=20)
    name: str = Field(default="", max_length=30)
    max_players: int = Field(default=6, ge=2, le=6)
    profile_id: str = Field(default="", max_length=64)


class LobbyJoin(BaseModel):
    """Request body to join a lobby."""

    model_config = ConfigDict(strict=True)

    player_name: str = Field(..., min_length=1, max_length=20)
    profile_id: str = Field(default="", max_length=64)
    session_token: str = Field(default="", max_length=128)


class LobbyKickRequest(BaseModel):
    """Request body to remove another player from a waiting lobby."""

    model_config = ConfigDict(strict=True)

    target_player_id: str = Field(..., min_length=1, max_length=64)
    actor_player_id: str = Field(default="", max_length=64)
    session_token: str = Field(default="", max_length=128)


class Lobby(BaseModel):
    """A game lobby."""

    model_config = ConfigDict(strict=True)

    id: str
    name: str = ""
    players: list[LobbyPlayer] = Field(default_factory=list)
    max_players: int = 6
    status: str = "waiting"  # waiting | in_progress
    game_id: str | None = None
    created_at: str = ""

    @property
    def host(self) -> LobbyPlayer | None:
        for p in self.players:
            if p.is_host:
                return p
        return None

    @property
    def is_full(self) -> bool:
        return len(self.players) >= self.max_players


class LobbyResponse(BaseModel):
    """API response for a lobby."""

    model_config = ConfigDict(strict=True)

    id: str
    name: str = ""
    players: list[LobbyPlayer]
    max_players: int
    status: str
    game_id: str | None = None
    player_count: int
    player_id: str | None = None
    session_token: str | None = None  # only returned on create/join


class LeaderboardEntry(BaseModel):
    """Aggregated finished-game standings for lobby views."""

    model_config = ConfigDict(strict=True)

    player_name: str
    player_key: str
    wins: int
    games_played: int
    win_rate: float
    score: int


class GameConfig(BaseModel):
    """Host-configurable game settings sent at game start."""

    model_config = ConfigDict(strict=True)

    turn_timer_seconds: int = Field(default=30, ge=0, le=120)
    challenge_window_seconds: int = Field(default=10, ge=0, le=30)
    block_window_seconds: int = Field(default=10, ge=0, le=30)
    starting_coins: int = Field(default=2, ge=1, le=5)


class AiMatchCreate(BaseModel):
    """Request body to start a human-vs-bots match immediately."""

    model_config = ConfigDict(strict=True)

    player_name: str = Field(..., min_length=1, max_length=20)
    bot_count: int = Field(..., ge=1, le=5)
    difficulty: str = Field(default=AiDifficulty.MEDIUM.value, pattern="^(easy|medium|hard)$")
    profile_id: str = Field(default="", max_length=64)
    config: GameConfig | None = None


class AiMatchResponse(BaseModel):
    """Response body returned after creating an AI match."""

    model_config = ConfigDict(strict=True)

    ok: bool = True
    game_id: str
    player_id: str
