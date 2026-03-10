"""FastAPI application factory."""

from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api.lobby_router import init_lobby_router
from app.api.router import api_router
from app.config import settings
from app.container import AppContainer
from app.entities.base import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    container = AppContainer()

    application = FastAPI(
        title="Coup Multiplayer Game",
        version="1.0.0",
        description="Real-time multiplayer Coup card game API",
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
    lobby_service = container.lobby_service()
    game_service = container.game_service()
    init_lobby_router(lobby_service, game_service)

    # Include REST routes
    application.include_router(api_router)

    # Startup event
    @application.on_event("startup")
    async def startup():
        await init_db()
        logger.info("Database initialized")

        # Background task to sweep stale lobbies every 5 minutes
        async def lobby_cleanup_loop():
            while True:
                await asyncio.sleep(300)  # 5 minutes
                removed = lobby_service.cleanup_stale_lobbies(max_age_minutes=60)
                if removed:
                    logger.info("Cleaned up %d stale lobby(ies)", removed)

        asyncio.create_task(lobby_cleanup_loop())

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
