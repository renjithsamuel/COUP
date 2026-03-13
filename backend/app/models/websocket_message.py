"""WebSocket message schemas — discriminated union for type safety."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict


# ── Client → Server message types ────────────────────────────────────────────


class ClientMessageType(str, Enum):
    ACTION = "ACTION"
    CHALLENGE = "CHALLENGE"
    BLOCK = "BLOCK"
    ACCEPT = "ACCEPT"  # Accept / pass on challenge/block window
    CHOOSE_INFLUENCE = "CHOOSE_INFLUENCE"
    EXCHANGE_RETURN = "EXCHANGE_RETURN"


class ClientMessage(BaseModel):
    """Message from client to server."""

    model_config = ConfigDict(strict=True)

    type: ClientMessageType
    payload: dict[str, Any] = {}


# ── Server → Client message types ────────────────────────────────────────────


class ServerMessageType(str, Enum):
    GAME_STATE = "GAME_STATE"
    ACTION_DECLARED = "ACTION_DECLARED"
    CHALLENGE_ISSUED = "CHALLENGE_ISSUED"
    CHALLENGE_WINDOW_OPEN = "CHALLENGE_WINDOW_OPEN"
    BLOCK_WINDOW_OPEN = "BLOCK_WINDOW_OPEN"
    CHALLENGE_RESULT = "CHALLENGE_RESULT"
    BLOCK_DECLARED = "BLOCK_DECLARED"
    BLOCK_CHALLENGE_RESULT = "BLOCK_CHALLENGE_RESULT"
    ACTION_RESOLVED = "ACTION_RESOLVED"
    INFLUENCE_LOST = "INFLUENCE_LOST"
    EXCHANGE_STARTED = "EXCHANGE_STARTED"
    PLAYER_ELIMINATED = "PLAYER_ELIMINATED"
    TURN_CHANGED = "TURN_CHANGED"
    GAME_OVER = "GAME_OVER"
    ERROR = "ERROR"
    PLAYER_CONNECTED = "PLAYER_CONNECTED"
    PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED"
    WAITING_FOR = "WAITING_FOR"


class ServerMessage(BaseModel):
    """Message from server to client."""

    model_config = ConfigDict(strict=True)

    type: ServerMessageType
    payload: dict[str, Any] = {}
