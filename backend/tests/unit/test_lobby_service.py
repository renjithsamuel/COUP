from __future__ import annotations

from datetime import timedelta

import pytest

from app.services.lobby_service import LobbyService


def test_get_lobby_restores_player_id_from_session_token() -> None:
    service = LobbyService()
    created = service.create_lobby("Alice")

    restored = service.get_lobby(created.id, session_token=created.session_token)

    assert restored is not None
    assert restored.player_id == created.player_id
    assert restored.players[0].name == "Alice"


def test_stale_lobby_player_is_pruned_and_host_is_reassigned() -> None:
    service = LobbyService()
    host = service.create_lobby("Alice")
    joiner = service.join_lobby(host.id, "Bob")

    stale_time = (service._utc_now() - timedelta(seconds=25)).isoformat()
    service._player_last_seen[host.session_token] = stale_time

    refreshed = service.get_lobby(host.id, session_token=joiner.session_token)

    assert refreshed is not None
    assert len(refreshed.players) == 1
    assert refreshed.players[0].name == "Bob"
    assert refreshed.players[0].is_host is True


def test_join_lobby_reuses_existing_player_for_same_session_token() -> None:
    service = LobbyService()
    host = service.create_lobby("Alice", profile_id="profile-alice")

    first_join = service.join_lobby(host.id, "Bob", profile_id="profile-bob")
    second_join = service.join_lobby(
        host.id,
        "Bobby",
        profile_id="profile-bob-updated",
        session_token=first_join.session_token,
    )

    assert len(second_join.players) == 2
    assert first_join.player_id == second_join.player_id
    bob = next(player for player in second_join.players if player.id == second_join.player_id)
    assert bob.name == "Bobby"


def test_join_lobby_creates_distinct_players_without_session_token_even_with_same_profile_id() -> None:
    service = LobbyService()
    host = service.create_lobby("Alice", profile_id="profile-alice")

    first_join = service.join_lobby(host.id, "Bob", profile_id="shared-profile")
    second_join = service.join_lobby(host.id, "Bobby", profile_id="shared-profile")

    assert len(second_join.players) == 3
    assert first_join.player_id != second_join.player_id


def test_reset_lobby_refreshes_all_player_sessions() -> None:
    service = LobbyService()
    host = service.create_lobby("Alice", profile_id="profile-alice")
    joiner = service.join_lobby(host.id, "Bob", profile_id="profile-bob")

    stale_time = (service._utc_now() - timedelta(minutes=5)).isoformat()
    service._player_last_seen[host.session_token] = stale_time
    service._player_last_seen[joiner.session_token] = stale_time
    service.mark_started(host.id, "game-123")

    service.reset_lobby(host.id)
    refreshed = service.get_lobby(host.id, session_token=joiner.session_token)

    assert refreshed is not None
    assert len(refreshed.players) == 2
    assert refreshed.player_id == joiner.player_id


def test_any_player_can_kick_another_but_not_self() -> None:
    service = LobbyService()
    host = service.create_lobby("Alice", profile_id="profile-alice")
    bob = service.join_lobby(host.id, "Bob", profile_id="profile-bob")
    charlie = service.join_lobby(host.id, "Charlie", profile_id="profile-charlie")

    updated = service.kick_player(
        host.id,
        host.player_id,
        session_token=bob.session_token,
    )

    assert updated is not None
    assert len(updated.players) == 2
    assert all(player.id != host.player_id for player in updated.players)
    assert any(player.id == bob.player_id and player.is_host for player in updated.players)

    with pytest.raises(ValueError, match="Players cannot kick themselves"):
        service.kick_player(
            host.id,
            bob.player_id,
            session_token=bob.session_token,
        )