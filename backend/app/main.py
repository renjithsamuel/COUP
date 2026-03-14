"""FastAPI application factory."""

from __future__ import annotations

import asyncio
import json
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api.game_router import init_game_router
from app.api.lobby_router import init_lobby_router
from app.api.router import api_router
from app.config import settings
from app.container import AppContainer
from app.entities.base import close_db, init_db
from app.models.game import GamePhase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _run_lobby_cleanup_loop(lobby_service) -> None:
    """Periodically remove stale lobby state until shutdown."""
    try:
        while True:
            await asyncio.sleep(300)
            removed = lobby_service.cleanup_stale_lobbies(max_age_minutes=60)
            if removed:
                logger.info("Cleaned up %d stale lobby(ies)", removed)
    except asyncio.CancelledError:
        logger.debug("Lobby cleanup loop cancelled")
        raise


async def _run_persistence_cleanup_loop(game_service) -> None:
    """Periodically remove expired finished-game records until shutdown."""
    try:
        while True:
            await asyncio.sleep(300)
            removed = await game_service.cleanup_finished_games(
                settings.finished_game_retention_minutes
            )
            if removed:
                logger.info("Cleaned up %d expired finished game record(s)", removed)
    except asyncio.CancelledError:
        logger.debug("Persistence cleanup loop cancelled")
        raise


async def _run_game_timer_loop(game_service, connection_manager) -> None:
    """Resolve expired timed phases until shutdown."""
    try:
        while True:
            await asyncio.sleep(1)
            resolutions = await game_service.process_expired_timers()
            for resolution in resolutions:
                state = resolution["state"]
                previous_phase = resolution["previous_phase"]
                previous_turn_number = resolution["previous_turn_number"]
                previous_player_id = resolution["previous_player_id"]

                if (
                    state.phase == GamePhase.GAME_OVER
                    and previous_phase != GamePhase.GAME_OVER.value
                ):
                    winner = state.get_player(state.winner_id) if state.winner_id else None
                    await connection_manager.broadcast_to_game(state.id, {
                        "type": "GAME_OVER",
                        "payload": {
                            "winnerId": state.winner_id or "",
                            "winnerName": winner.name if winner else "",
                        },
                    })
                elif (
                    state.turn_number != previous_turn_number
                    or state.current_turn_player_id != previous_player_id
                ):
                    current_player = (
                        state.get_player(state.current_turn_player_id)
                        if state.current_turn_player_id
                        else None
                    )
                    await connection_manager.broadcast_to_game(state.id, {
                        "type": "TURN_CHANGED",
                        "payload": {
                            "turnNumber": state.turn_number,
                            "playerId": state.current_turn_player_id or "",
                            "playerName": current_player.name if current_player else "",
                        },
                    })

                for player_id in connection_manager.get_connected_players(state.id):
                    public_state = game_service.get_public_state(state, player_id)
                    await connection_manager.send_to_player(state.id, player_id, {
                        "type": "GAME_STATE",
                        "payload": json.loads(public_state.model_dump_json()),
                    })
    except asyncio.CancelledError:
        logger.debug("Game timer loop cancelled")
        raise


async def _run_bot_loop(game_service, connection_manager) -> None:
    """Progress server-side bot actions for AI matches."""
    try:
        while True:
            await asyncio.sleep(0.35)
            outcomes = await game_service.process_bot_turns()
            for outcome in outcomes:
                state = outcome["state"]
                for event in outcome["events"]:
                    await connection_manager.broadcast_to_game(state.id, event)

                for player_id in connection_manager.get_connected_players(state.id):
                    public_state = game_service.get_public_state(state, player_id)
                    await connection_manager.send_to_player(state.id, player_id, {
                        "type": "GAME_STATE",
                        "payload": json.loads(public_state.model_dump_json()),
                    })
    except asyncio.CancelledError:
        logger.debug("Bot loop cancelled")
        raise


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    container = AppContainer()

    lobby_service = container.lobby_service()
    game_service = container.game_service()
    connection_manager = container.connection_manager()

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await init_db()
        logger.info("Database initialized")

        background_tasks = [
            asyncio.create_task(_run_lobby_cleanup_loop(lobby_service), name="lobby-cleanup-loop"),
            asyncio.create_task(_run_persistence_cleanup_loop(game_service), name="persistence-cleanup-loop"),
            asyncio.create_task(_run_game_timer_loop(game_service, connection_manager), name="game-timer-loop"),
            asyncio.create_task(_run_bot_loop(game_service, connection_manager), name="bot-loop"),
        ]

        try:
            yield
        finally:
            for task in background_tasks:
                task.cancel()
            for task in background_tasks:
                with suppress(asyncio.CancelledError):
                    await task
            await game_service.close()
            await close_db()

    application = FastAPI(
        title="Coup Multiplayer Game",
        version="1.0.0",
        description="Real-time multiplayer Coup card game API",
        lifespan=lifespan,
    )

    # Store container on app for access in routes
    application.container = container

    # CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Wire services into lobby router
    init_lobby_router(lobby_service, game_service)
    init_game_router(game_service)

    # Include REST routes
    application.include_router(api_router)

    # WebSocket endpoint
    @application.websocket("/ws/game/{game_id}")
    async def game_websocket(
        websocket: WebSocket,
        game_id: str,
        player_id: str = Query(...),
    ):
        ws_handler = container.game_ws_handler()
        await ws_handler.handle_connection(websocket, game_id, player_id)

    return application


app = create_app()
