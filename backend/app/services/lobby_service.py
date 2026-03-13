"""Lobby service — manages game lobbies (in-memory for simplicity + speed)."""

from __future__ import annotations

import secrets
import string
import uuid
from datetime import datetime, timezone

from app.models.lobby import Lobby, LobbyPlayer, LobbyResponse

_CODE_ALPHABET = string.ascii_uppercase + string.digits
_CODE_LENGTH = 6


class LobbyService:
    """In-memory lobby management. Lobbies don't need persistence."""

    def __init__(self) -> None:
        self._lobbies: dict[str, Lobby] = {}
        self._player_tokens: dict[str, str] = {}  # token -> lobby_id

    def _generate_code(self) -> str:
        """Generate a short unique room code."""
        for _ in range(20):
            code = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_LENGTH))
            if code not in self._lobbies:
                return code
        return str(uuid.uuid4())[:_CODE_LENGTH].upper()

    def create_lobby(self, host_name: str, max_players: int = 6, name: str = "") -> LobbyResponse:
        lobby_id = self._generate_code()
        session_token = str(uuid.uuid4())
        host = LobbyPlayer(
            id=str(uuid.uuid4()),
            name=host_name,
            is_host=True,
            is_ready=True,
        )
        lobby = Lobby(
            id=lobby_id,
            name=name or f"{host_name}'s lobby",
            players=[host],
            max_players=max_players,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._lobbies[lobby_id] = lobby
        self._player_tokens[session_token] = lobby_id

        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            player_count=len(lobby.players),
            session_token=session_token,
        )

    def join_lobby(self, lobby_id: str, player_name: str) -> LobbyResponse:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            raise ValueError("Lobby not found")
        if lobby.is_full:
            raise ValueError("Lobby is full")
        if lobby.status != "waiting":
            raise ValueError("Game already started")

        session_token = str(uuid.uuid4())
        player = LobbyPlayer(
            id=str(uuid.uuid4()),
            name=player_name,
        )
        lobby.players.append(player)
        self._player_tokens[session_token] = lobby_id

        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            player_count=len(lobby.players),
            session_token=session_token,
        )

    def leave_lobby(self, lobby_id: str, player_id: str) -> LobbyResponse | None:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            raise ValueError("Lobby not found")

        lobby.players = [p for p in lobby.players if p.id != player_id]

        if not lobby.players:
            del self._lobbies[lobby_id]
            return None

        # Reassign host if needed
        if not any(p.is_host for p in lobby.players):
            lobby.players[0].is_host = True

        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            player_count=len(lobby.players),
        )

    def get_lobby(self, lobby_id: str) -> LobbyResponse | None:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            return None
        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            game_id=lobby.game_id,
            player_count=len(lobby.players),
        )

    def list_lobbies(self) -> list[LobbyResponse]:
        return [
            LobbyResponse(
                id=lobby.id,
                name=lobby.name,
                players=lobby.players,
                max_players=lobby.max_players,
                status=lobby.status,
                game_id=lobby.game_id,
                player_count=len(lobby.players),
            )
            for lobby in self._lobbies.values()
        ]

    def mark_started(self, lobby_id: str, game_id: str) -> None:
        lobby = self._lobbies.get(lobby_id)
        if lobby:
            lobby.status = "in_progress"
            lobby.game_id = game_id

    def reset_lobby(self, lobby_id: str) -> LobbyResponse:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            raise ValueError("Lobby not found")

        lobby.status = "waiting"
        lobby.game_id = None

        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            game_id=lobby.game_id,
            player_count=len(lobby.players),
        )

    def get_lobby_model(self, lobby_id: str) -> Lobby | None:
        return self._lobbies.get(lobby_id)

    def cleanup_stale_lobbies(self, max_age_minutes: int = 60) -> int:
        """Remove lobbies older than max_age_minutes. Returns count removed."""
        now = datetime.now(timezone.utc)
        stale_ids = []
        for lid, lobby in self._lobbies.items():
            if not lobby.created_at:
                continue
            created = datetime.fromisoformat(lobby.created_at)
            age = (now - created).total_seconds() / 60
            if age > max_age_minutes and not lobby.players:
                stale_ids.append(lid)
            elif age > max_age_minutes * 3:
                # Force-remove very old lobbies regardless of player count
                stale_ids.append(lid)
        for lid in stale_ids:
            del self._lobbies[lid]
        return len(stale_ids)
