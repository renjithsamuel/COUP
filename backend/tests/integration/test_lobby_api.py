"""Integration tests for lobby API."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app


@pytest.fixture
async def client():
    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


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
    async def test_get_lobby(self, client: AsyncClient):
        create_resp = await client.post(
            "/api/lobbies", json={"host_name": "Alice"}
        )
        lobby_id = create_resp.json()["id"]

        resp = await client.get(f"/api/lobbies/{lobby_id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == lobby_id

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
