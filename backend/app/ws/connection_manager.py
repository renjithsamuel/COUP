"""WebSocket connection manager — tracks active connections per game."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections grouped by game_id."""

    def __init__(self) -> None:
        # game_id -> {player_id -> WebSocket}
        self._connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(
        self, websocket: WebSocket, game_id: str, player_id: str
    ) -> None:
        previous = self._connections.get(game_id, {}).get(player_id)
        if previous is not None and previous is not websocket:
            try:
                await previous.close()
            except Exception:
                logger.debug("Failed to close stale websocket for %s in %s", player_id, game_id)
        await websocket.accept()
        if game_id not in self._connections:
            self._connections[game_id] = {}
        self._connections[game_id][player_id] = websocket
        logger.info(f"Player {player_id} connected to game {game_id}")

    def disconnect(
        self,
        game_id: str,
        player_id: str,
        websocket: WebSocket | None = None,
    ) -> bool:
        connections = self._connections.get(game_id)
        if not connections:
            return False

        current = connections.get(player_id)
        if current is None:
            return False

        if websocket is not None and current is not websocket:
            logger.debug(
                "Ignoring stale disconnect for %s in %s",
                player_id,
                game_id,
            )
            return False

        connections.pop(player_id, None)
        if not connections:
            del self._connections[game_id]
        logger.info(f"Player {player_id} disconnected from game {game_id}")
        return True

    async def send_to_player(
        self, game_id: str, player_id: str, message: dict[str, Any]
    ) -> None:
        ws = self._connections.get(game_id, {}).get(player_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                logger.warning(f"Failed to send to {player_id} in {game_id}")
                self.disconnect(game_id, player_id, ws)

    async def broadcast_to_game(
        self, game_id: str, message: dict[str, Any], exclude: str | None = None
    ) -> None:
        connections = self._connections.get(game_id, {})
        for player_id, ws in list(connections.items()):
            if player_id == exclude:
                continue
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                logger.warning(f"Failed to broadcast to {player_id}")
                self.disconnect(game_id, player_id, ws)

    async def send_personal_states(
        self, game_id: str, get_state_for_player
    ) -> None:
        """Send personalized game state to each connected player."""
        connections = self._connections.get(game_id, {})
        for player_id, ws in list(connections.items()):
            try:
                state = get_state_for_player(player_id)
                await ws.send_text(json.dumps(state))
            except Exception:
                logger.warning(f"Failed to send state to {player_id}")
                self.disconnect(game_id, player_id, ws)

    def get_connected_players(self, game_id: str) -> list[str]:
        return list(self._connections.get(game_id, {}).keys())
