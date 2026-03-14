"""Integration tests for lobby API."""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import create_app


@pytest_asyncio.fixture
async def client():
    app = create_app()
    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as c:
            yield c
    await transport.aclose()


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestLobbyAPI:
    @pytest.mark.asyncio
    async def test_create_lobby(self, client: AsyncClient):
        resp = await client.post(
            "/api/lobbies",
            json={"host_name": "Alice", "max_players": 4},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["player_count"] == 1
        assert data["max_players"] == 4
        assert data["session_token"] is not None

    @pytest.mark.asyncio
    async def test_list_lobbies(self, client: AsyncClient):
        await client.post("/api/lobbies", json={"host_name": "Alice"})
        resp = await client.get("/api/lobbies")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    @pytest.mark.asyncio
    async def test_join_lobby(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice"}
        )
        lobby_id = create_resp.json()["id"]

        join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob"},
        )
        assert join_resp.status_code == 200
        assert join_resp.json()["player_count"] == 2

    @pytest.mark.asyncio
    async def test_join_lobby_reuses_existing_session(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]

        first_join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob", "profile_id": "profile-bob"},
        )
        second_join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={
                "player_name": "Bobby",
                "profile_id": "profile-bob-updated",
                "session_token": first_join_resp.json()["session_token"],
            },
        )

        assert first_join_resp.status_code == 200
        assert second_join_resp.status_code == 200
        assert second_join_resp.json()["player_count"] == 2
        assert second_join_resp.json()["player_id"] == first_join_resp.json()["player_id"]

    @pytest.mark.asyncio
    async def test_join_lobby_allows_distinct_players_without_session_token(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]

        first_join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob", "profile_id": "shared-profile"},
        )
        second_join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bobby", "profile_id": "shared-profile"},
        )

        assert first_join_resp.status_code == 200
        assert second_join_resp.status_code == 200
        assert second_join_resp.json()["player_count"] == 3
        assert second_join_resp.json()["player_id"] != first_join_resp.json()["player_id"]

    @pytest.mark.asyncio
    async def test_get_lobby(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice"}
        )
        lobby_id = create_resp.json()["id"]

        resp = await client.get(f"/api/lobbies/{lobby_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == lobby_id

    @pytest.mark.asyncio
    async def test_any_player_can_kick_another_player(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]
        host_id = create_resp.json()["player_id"]

        join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob", "profile_id": "profile-bob"},
        )
        bob_token = join_resp.json()["session_token"]

        kick_resp = await client.post(
            f"/api/lobbies/{lobby_id}/kick",
            json={
                "target_player_id": host_id,
                "session_token": bob_token,
            },
        )

        assert kick_resp.status_code == 200
        assert kick_resp.json()["player_count"] == 1
        assert kick_resp.json()["players"][0]["name"] == "Bob"
        assert kick_resp.json()["players"][0]["is_host"] is True

    @pytest.mark.asyncio
    async def test_player_cannot_kick_self(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]

        kick_resp = await client.post(
            f"/api/lobbies/{lobby_id}/kick",
            json={
                "target_player_id": create_resp.json()["player_id"],
                "session_token": create_resp.json()["session_token"],
            },
        )

        assert kick_resp.status_code == 400
        assert kick_resp.json()["detail"] == "Players cannot kick themselves"

    @pytest.mark.asyncio
    async def test_room_leaderboard_is_scoped_to_room(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]

        resp = await client.get(f"/api/lobbies/{lobby_id}/leaderboard")

        assert resp.status_code == 200
        assert resp.json() == []

    @pytest.mark.asyncio
    async def test_get_nonexistent_lobby(self, client: AsyncClient):
        resp = await client.get("/api/lobbies/nonexistent")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_start_game(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice"}
        )
        lobby_id = create_resp.json()["id"]

        await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob"},
        )

        start_resp = await client.post(f"/api/lobbies/{lobby_id}/start")
        assert start_resp.status_code == 200
        assert start_resp.json()["game_id"] is not None

    @pytest.mark.asyncio
    async def test_cannot_start_with_one_player(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice"}
        )
        lobby_id = create_resp.json()["id"]

        start_resp = await client.post(f"/api/lobbies/{lobby_id}/start")
        assert start_resp.status_code == 400

    @pytest.mark.asyncio
    async def test_can_start_same_room_again_after_reset(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice", "profile_id": "profile-alice"}
        )
        lobby_id = create_resp.json()["id"]
        host_token = create_resp.json()["session_token"]

        join_resp = await client.post(
            f"/api/lobbies/{lobby_id}/join",
            json={"player_name": "Bob", "profile_id": "profile-bob"},
        )
        join_token = join_resp.json()["session_token"]

        first_start_resp = await client.post(f"/api/lobbies/{lobby_id}/start")
        assert first_start_resp.status_code == 200

        reset_resp = await client.post(f"/api/lobbies/{lobby_id}/reset")
        assert reset_resp.status_code == 200

        host_lobby_resp = await client.get(
            f"/api/lobbies/{lobby_id}?session_token={host_token}"
        )
        join_lobby_resp = await client.get(
            f"/api/lobbies/{lobby_id}?session_token={join_token}"
        )
        assert host_lobby_resp.status_code == 200
        assert join_lobby_resp.status_code == 200
        assert host_lobby_resp.json()["player_count"] == 2
        assert join_lobby_resp.json()["player_count"] == 2

        second_start_resp = await client.post(f"/api/lobbies/{lobby_id}/start")
        assert second_start_resp.status_code == 200
        assert second_start_resp.json()["game_id"] != first_start_resp.json()["game_id"]
