"""Lobby service — manages game lobbies (in-memory for simplicity + speed)."""

from __future__ import annotations

import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone

from app.models.lobby import Lobby, LobbyPlayer, LobbyResponse

_CODE_ALPHABET = string.ascii_uppercase + string.digits
_CODE_LENGTH = 6
_INACTIVE_PLAYER_SECONDS = 20


class LobbyService:
    """In-memory lobby management. Lobbies don't need persistence."""

    def __init__(self) -> None:
        self._lobbies: dict[str, Lobby] = {}
        self._player_tokens: dict[str, tuple[str, str]] = {}  # token -> (lobby_id, player_id)
        self._player_last_seen: dict[str, str] = {}

    def _generate_code(self) -> str:
        """Generate a short unique room code."""
        for _ in range(20):
            code = "".join(secrets.choice(_CODE_ALPHABET) for _ in range(_CODE_LENGTH))
            if code not in self._lobbies:
                return code
        return str(uuid.uuid4())[:_CODE_LENGTH].upper()

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    def _build_response(
        self,
        lobby: Lobby,
        *,
        player_id: str | None = None,
        session_token: str | None = None,
    ) -> LobbyResponse:
        return LobbyResponse(
            id=lobby.id,
            name=lobby.name,
            players=lobby.players,
            max_players=lobby.max_players,
            status=lobby.status,
            game_id=lobby.game_id,
            player_count=len(lobby.players),
            player_id=player_id,
            session_token=session_token,
        )

    def _touch_session(self, session_token: str) -> None:
        self._player_last_seen[session_token] = self._utc_now().isoformat()

    @staticmethod
    def _normalize_profile_id(profile_id: str | None) -> str:
        return (profile_id or "").strip()

    @staticmethod
    def _find_player_by_profile_id(lobby: Lobby, profile_id: str) -> LobbyPlayer | None:
        if not profile_id:
            return None
        for player in lobby.players:
            if player.profile_id == profile_id:
                return player
        return None

    def _get_player_id_for_token(self, lobby_id: str, session_token: str | None) -> str | None:
        if not session_token:
            return None
        token_details = self._player_tokens.get(session_token)
        if token_details is None:
            return None
        token_lobby_id, player_id = token_details
        if token_lobby_id != lobby_id:
            return None
        return player_id

    def _remove_player_tokens(self, lobby_id: str, player_id: str) -> None:
        for token, token_details in list(self._player_tokens.items()):
            token_lobby_id, token_player_id = token_details
            if token_lobby_id == lobby_id and token_player_id == player_id:
                self._player_tokens.pop(token, None)
                self._player_last_seen.pop(token, None)

    def _remove_player(self, lobby_id: str, player_id: str) -> Lobby | None:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            return None

        lobby.players = [player for player in lobby.players if player.id != player_id]
        self._remove_player_tokens(lobby_id, player_id)

        if not lobby.players:
            self._lobbies.pop(lobby_id, None)
            return None

        if not any(player.is_host for player in lobby.players):
            lobby.players[0].is_host = True

        return lobby

    def _prune_inactive_players(self, lobby_id: str | None = None) -> None:
        now = self._utc_now()
        target_lobbies = {lobby_id} if lobby_id is not None else set(self._lobbies.keys())

        for token, token_details in list(self._player_tokens.items()):
            token_lobby_id, player_id = token_details
            if token_lobby_id not in target_lobbies:
                continue

            lobby = self._lobbies.get(token_lobby_id)
            if lobby is None or lobby.status != "waiting":
                continue

            last_seen_raw = self._player_last_seen.get(token)
            if last_seen_raw is None:
                continue

            try:
                last_seen = datetime.fromisoformat(last_seen_raw)
            except ValueError:
                last_seen = now - timedelta(seconds=_INACTIVE_PLAYER_SECONDS + 1)

            if now - last_seen <= timedelta(seconds=_INACTIVE_PLAYER_SECONDS):
                continue

            self._remove_player(token_lobby_id, player_id)

    def create_lobby(
        self,
        host_name: str,
        max_players: int = 6,
        name: str = "",
        profile_id: str = "",
    ) -> LobbyResponse:
        lobby_id = self._generate_code()
        session_token = str(uuid.uuid4())
        host = LobbyPlayer(
            id=str(uuid.uuid4()),
            name=host_name,
            profile_id=self._normalize_profile_id(profile_id) or str(uuid.uuid4()),
            is_host=True,
            is_ready=True,
        )
        lobby = Lobby(
            id=lobby_id,
            name=name or f"{host_name}'s lobby",
            players=[host],
            max_players=max_players,
            created_at=self._utc_now().isoformat(),
        )
        self._lobbies[lobby_id] = lobby
        self._player_tokens[session_token] = (lobby_id, host.id)
        self._touch_session(session_token)

        return self._build_response(
            lobby,
            player_id=host.id,
            session_token=session_token,
        )

    def join_lobby(self, lobby_id: str, player_name: str, profile_id: str = "") -> LobbyResponse:
        self._prune_inactive_players(lobby_id)
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            raise ValueError("Lobby not found")
        if lobby.status != "waiting":
            raise ValueError("Game already started")

        normalized_profile_id = self._normalize_profile_id(profile_id) or str(uuid.uuid4())
        existing_player = self._find_player_by_profile_id(lobby, normalized_profile_id)

        session_token = str(uuid.uuid4())
        if existing_player is not None:
            existing_player.name = player_name
            self._remove_player_tokens(lobby_id, existing_player.id)
            self._player_tokens[session_token] = (lobby_id, existing_player.id)
            self._touch_session(session_token)
            return self._build_response(
                lobby,
                player_id=existing_player.id,
                session_token=session_token,
            )

        if lobby.is_full:
            raise ValueError("Lobby is full")

        player = LobbyPlayer(
            id=str(uuid.uuid4()),
            name=player_name,
            profile_id=normalized_profile_id,
        )
        lobby.players.append(player)
        self._player_tokens[session_token] = (lobby_id, player.id)
        self._touch_session(session_token)

        return self._build_response(
            lobby,
            player_id=player.id,
            session_token=session_token,
        )

    def leave_lobby(
        self,
        lobby_id: str,
        player_id: str | None = None,
        session_token: str | None = None,
    ) -> LobbyResponse | None:
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            raise ValueError("Lobby not found")

        resolved_player_id = player_id or self._get_player_id_for_token(lobby_id, session_token)
        if resolved_player_id is None:
            raise ValueError("Player not found in lobby")

        updated_lobby = self._remove_player(lobby_id, resolved_player_id)
        if updated_lobby is None:
            return None

        return self._build_response(updated_lobby)

    def get_lobby(self, lobby_id: str, session_token: str | None = None) -> LobbyResponse | None:
        if session_token is not None and self._get_player_id_for_token(lobby_id, session_token) is not None:
            self._touch_session(session_token)

        self._prune_inactive_players(lobby_id)
        lobby = self._lobbies.get(lobby_id)
        if lobby is None:
            return None

        player_id = self._get_player_id_for_token(lobby_id, session_token)
        if player_id is not None:
            self._touch_session(session_token)

        return self._build_response(lobby, player_id=player_id)

    def list_lobbies(self) -> list[LobbyResponse]:
        self._prune_inactive_players()
        return [self._build_response(lobby) for lobby in self._lobbies.values()]

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

        for token, token_details in self._player_tokens.items():
            token_lobby_id, _ = token_details
            if token_lobby_id == lobby_id:
                self._touch_session(token)

        return self._build_response(lobby)

    def get_lobby_model(self, lobby_id: str) -> Lobby | None:
        return self._lobbies.get(lobby_id)

    def cleanup_stale_lobbies(self, max_age_minutes: int = 60) -> int:
        """Remove lobbies older than max_age_minutes. Returns count removed."""
        self._prune_inactive_players()
        now = self._utc_now()
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
            for token, token_details in list(self._player_tokens.items()):
                token_lobby_id, _ = token_details
                if token_lobby_id == lid:
                    self._player_tokens.pop(token, None)
                    self._player_last_seen.pop(token, None)
        return len(stale_ids)
