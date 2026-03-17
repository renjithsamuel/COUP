"""Regression tests for websocket reconnect/presence race conditions."""

from __future__ import annotations

import asyncio

from app.ws.connection_manager import ConnectionManager
from app.ws.game_ws_handler import GameWSHandler


class StubWebSocket:
    """Minimal websocket double for connection manager and handler tests."""

    def __init__(self, *, disconnect_on_receive: bool = False) -> None:
        self.accepted = False
        self.closed = False
        self.disconnect_on_receive = disconnect_on_receive

    async def accept(self) -> None:
        self.accepted = True

    async def close(self) -> None:
        self.closed = True

    async def send_text(self, _: str) -> None:
        return

    async def receive_text(self) -> str:
        if self.disconnect_on_receive:
            raise RuntimeError("simulated socket close")
        return "{}"


class StubGameService:
    def __init__(self) -> None:
        self.connected_updates: list[tuple[str, str, bool]] = []

    async def set_player_connected(
        self,
        game_id: str,
        player_id: str,
        connected: bool,
    ):
        self.connected_updates.append((game_id, player_id, connected))
        return None

    async def get_game(self, game_id: str):
        return None


class StubConnectionManager:
    def __init__(self, *, disconnect_result: bool) -> None:
        self.disconnect_result = disconnect_result

    async def connect(self, websocket, game_id: str, player_id: str) -> None:
        return

    def disconnect(self, game_id: str, player_id: str, websocket=None) -> bool:
        return self.disconnect_result

    async def broadcast_to_game(self, game_id: str, message, exclude: str | None = None) -> None:
        return

    async def send_to_player(self, game_id: str, player_id: str, message) -> None:
        return

    def get_connected_players(self, game_id: str) -> list[str]:
        return []


def test_disconnect_ignores_stale_socket_after_reconnect() -> None:
    async def scenario() -> None:
        manager = ConnectionManager()
        old_socket = StubWebSocket()
        new_socket = StubWebSocket()

        await manager.connect(old_socket, "g1", "p1")
        await manager.connect(new_socket, "g1", "p1")

        # Reconnect closes the old socket but keeps the new mapping active.
        assert old_socket.closed is True
        assert manager.get_connected_players("g1") == ["p1"]

        removed_old = manager.disconnect("g1", "p1", old_socket)
        assert removed_old is False
        assert manager.get_connected_players("g1") == ["p1"]

        removed_new = manager.disconnect("g1", "p1", new_socket)
        assert removed_new is True
        assert manager.get_connected_players("g1") == []

    asyncio.run(scenario())


def test_handler_skips_disconnect_side_effects_for_stale_socket() -> None:
    async def scenario() -> None:
        manager = StubConnectionManager(disconnect_result=False)
        stale_socket = StubWebSocket(disconnect_on_receive=True)

        game_service = StubGameService()
        handler = GameWSHandler(manager, game_service)

        await handler.handle_connection(stale_socket, "g1", "p1")

        assert game_service.connected_updates == [("g1", "p1", True)]

    asyncio.run(scenario())
