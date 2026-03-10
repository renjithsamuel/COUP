"""Game state models."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.models.card import Card, Character
from app.models.player import Player, PlayerPublic


class GamePhase(str, Enum):
    """All possible game state phases."""

    WAITING_FOR_PLAYERS = "waiting_for_players"
    TURN_START = "turn_start"
    ACTION_DECLARED = "action_declared"
    CHALLENGE_WINDOW = "challenge_window"
    RESOLVING_CHALLENGE = "resolving_challenge"
    BLOCK_WINDOW = "block_window"
    BLOCK_CHALLENGE_WINDOW = "block_challenge_window"
    RESOLVING_BLOCK_CHALLENGE = "resolving_block_challenge"
    ACTION_RESOLVING = "action_resolving"
    AWAITING_INFLUENCE_LOSS = "awaiting_influence_loss"
    AWAITING_EXCHANGE = "awaiting_exchange"
    TURN_END = "turn_end"
    GAME_OVER = "game_over"


class GameStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class PendingAction(BaseModel):
    """Tracks the currently pending action during a turn."""

    model_config = ConfigDict(strict=True)

    action_type: str
    player_id: str
    target_id: str | None = None
    blocked_by: str | None = None  # player_id of blocker
    blocking_character: str | None = None
    challenged_by: str | None = None
    accepted_by: list[str] = Field(default_factory=list)  # player_ids who accepted/passed


class GameConfig(BaseModel):
    """Configurable game settings."""

    model_config = ConfigDict(strict=True)

    max_players: int = 6
    turn_timer_seconds: int = 30
    challenge_window_seconds: int = 10
    block_window_seconds: int = 10
    starting_coins: int = 2


class GameState(BaseModel):
    """Complete server-side game state."""

    model_config = ConfigDict(strict=True)

    id: str
    status: GameStatus = GameStatus.WAITING
    phase: GamePhase = GamePhase.WAITING_FOR_PLAYERS
    config: GameConfig = Field(default_factory=GameConfig)
    players: list[Player] = Field(default_factory=list)
    deck: list[Card] = Field(default_factory=list)
    current_turn_player_id: str | None = None
    turn_number: int = 0
    pending_action: PendingAction | None = None
    awaiting_influence_loss_from: str | None = None
    exchange_cards: list[Card] = Field(default_factory=list)
    winner_id: str | None = None
    event_log: list[dict] = Field(default_factory=list)

    @property
    def alive_players(self) -> list[Player]:
        return [p for p in self.players if p.is_alive]

    def get_player(self, player_id: str) -> Player | None:
        for p in self.players:
            if p.id == player_id:
                return p
        return None


class GameStatePublic(BaseModel):
    """Public game state — sent to clients. Hides deck and other players' cards."""

    model_config = ConfigDict(strict=True)

    id: str
    status: GameStatus
    phase: GamePhase
    config: GameConfig
    players: list[PlayerPublic]
    current_turn_player_id: str | None
    turn_number: int
    pending_action: PendingAction | None
    awaiting_influence_loss_from: str | None
    winner_id: str | None
    deck_count: int
    event_log: list[dict]
    your_cards: list[Card]  # only the requesting player's cards
    exchange_cards: list[Card] = Field(default_factory=list)  # only during AWAITING_EXCHANGE
