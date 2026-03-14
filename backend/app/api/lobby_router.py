"""Lobby REST API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.game import GamePhase
from app.models.lobby import GameConfig, LeaderboardEntry, LobbyCreate, LobbyJoin, LobbyResponse

router = APIRouter(prefix="/api/lobbies", tags=["lobbies"])

# Will be injected via dependency
_lobby_service = None
_game_service = None


def init_lobby_router(lobby_service, game_service) -> None:
    """Wire services into the router (called from main.py after DI setup)."""
    global _lobby_service, _game_service
    _lobby_service = lobby_service
    _game_service = game_service


@router.post("", response_model=LobbyResponse)
async def create_lobby(body: LobbyCreate) -> LobbyResponse:
    return _lobby_service.create_lobby(
        body.host_name,
        body.max_players,
        body.name,
        body.profile_id,
    )


@router.get("", response_model=list[LobbyResponse])
async def list_lobbies() -> list[LobbyResponse]:
    return _lobby_service.list_lobbies()


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(limit: int = Query(default=10, ge=1, le=25)) -> list[LeaderboardEntry]:
    return await _game_service.get_leaderboard(limit=limit)


@router.get("/{lobby_id}", response_model=LobbyResponse)
async def get_lobby(
    lobby_id: str,
    session_token: str | None = Query(default=None),
) -> LobbyResponse:
    lobby = _lobby_service.get_lobby(lobby_id.upper(), session_token=session_token)
    if lobby is None:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@router.post("/{lobby_id}/join", response_model=LobbyResponse)
async def join_lobby(lobby_id: str, body: LobbyJoin) -> LobbyResponse:
    try:
        return _lobby_service.join_lobby(lobby_id.upper(), body.player_name, body.profile_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{lobby_id}/leave")
async def leave_lobby(
    lobby_id: str,
    player_id: str | None = Query(default=None),
    session_token: str | None = Query(default=None),
) -> dict:
    try:
        result = _lobby_service.leave_lobby(
            lobby_id.upper(),
            player_id=player_id,
            session_token=session_token,
        )
        return {"ok": True, "lobby": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{lobby_id}/start")
async def start_game(lobby_id: str, body: GameConfig | None = None) -> dict:
    lobby = _lobby_service.get_lobby_model(lobby_id)
    if lobby is None:
        raise HTTPException(status_code=404, detail="Lobby not found")
    if len(lobby.players) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players")
    try:
        config = body or GameConfig()
        game_state = await _game_service.create_game_from_lobby(lobby, config)
        _lobby_service.mark_started(lobby_id, game_state.id)
        return {"ok": True, "game_id": game_state.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{lobby_id}/reset", response_model=LobbyResponse)
async def reset_lobby(lobby_id: str) -> LobbyResponse:
    try:
        lobby = _lobby_service.get_lobby_model(lobby_id.upper())
        if lobby is None:
            raise ValueError("Lobby not found")

        if lobby.game_id:
            game = await _game_service.get_game(lobby.game_id)
            if game is not None and game.phase != GamePhase.GAME_OVER:
                await _game_service.delete_game(lobby.game_id)

        return _lobby_service.reset_lobby(lobby_id.upper())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
