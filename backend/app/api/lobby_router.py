"""Lobby REST API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.game import GamePhase
from app.models.lobby import GameConfig, LeaderboardEntry, LobbyCreate, LobbyJoin, LobbyKickRequest, LobbyResponse

router = APIRouter(prefix="/api/lobbies", tags=["lobbies"])

# Will be injected via dependency
_lobby_service = None
_game_service = None
_connection_manager = None


def init_lobby_router(lobby_service, game_service, connection_manager) -> None:
    """Wire services into the router (called from main.py after DI setup)."""
    global _lobby_service, _game_service, _connection_manager
    _lobby_service = lobby_service
    _game_service = game_service
    _connection_manager = connection_manager


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


@router.get("/{lobby_id}/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(lobby_id: str, limit: int = Query(default=10, ge=1, le=25)) -> list[LeaderboardEntry]:
    return await _game_service.get_leaderboard(room_id=lobby_id.upper(), limit=limit)


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
        return _lobby_service.join_lobby(
            lobby_id.upper(),
            body.player_name,
            body.profile_id,
            body.session_token or None,
        )
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


@router.post("/{lobby_id}/kick", response_model=LobbyResponse)
async def kick_player(lobby_id: str, body: LobbyKickRequest) -> LobbyResponse:
    try:
        lobby = _lobby_service.kick_player(
            lobby_id.upper(),
            body.target_player_id,
            actor_player_id=body.actor_player_id or None,
            session_token=body.session_token or None,
        )
        if lobby is None:
            raise HTTPException(status_code=404, detail="Lobby not found")
        return lobby
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
        # Instant notification to all lobby WebSocket clients
        lobby_key = f"lobby:{lobby_id.upper()}"
        await _connection_manager.broadcast_to_game(lobby_key, {
            "type": "LOBBY_GAME_STARTED",
            "payload": {"gameId": game_state.id},
        })
        return {"ok": True, "game_id": game_state.id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{lobby_id}/reset", response_model=LobbyResponse)
async def reset_lobby(
    lobby_id: str,
    player_id: str | None = Query(default=None),
    session_token: str | None = Query(default=None),
) -> LobbyResponse:
    try:
        lobby = _lobby_service.get_lobby_model(lobby_id.upper())
        if lobby is None:
            raise ValueError("Lobby not found")

        _lobby_service.require_host(
            lobby_id.upper(),
            player_id=player_id,
            session_token=session_token,
        )

        game_config_payload: dict | None = None
        game_id = lobby.game_id

        if game_id:
            game = await _game_service.get_game(game_id)
            if game is not None:
                game_config_payload = {
                    "turn_timer_seconds": game.config.turn_timer_seconds,
                    "challenge_window_seconds": game.config.challenge_window_seconds,
                    "block_window_seconds": game.config.block_window_seconds,
                    "starting_coins": game.config.starting_coins,
                }
            if game is not None and game.phase != GamePhase.GAME_OVER:
                await _game_service.delete_game(game_id)

        reset_lobby_response = _lobby_service.reset_lobby(lobby_id.upper())

        if game_id:
            await _connection_manager.broadcast_to_game(
                game_id,
                {
                    "type": "RETURN_TO_LOBBY",
                    "payload": {
                        "lobby_id": lobby.id,
                        "config": game_config_payload,
                    },
                },
            )

        return reset_lobby_response
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
