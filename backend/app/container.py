"""Dependency Injection container using dependency-injector."""

from __future__ import annotations

from dependency_injector import containers, providers

from app.config import settings
from app.engine.game_engine import GameEngine
from app.entities.base import async_session_factory
from app.repositories.game_repository import GameRepository
from app.services.game_service import GameService
from app.services.lobby_service import LobbyService
from app.ws.connection_manager import ConnectionManager
from app.ws.game_ws_handler import GameWSHandler


class AppContainer(containers.DeclarativeContainer):
    """Application-wide DI container."""

    wiring_config = containers.WiringConfiguration(
        modules=["app.main", "app.api.lobby_router"]
    )

    # Infrastructure
    db_session = providers.Factory(async_session_factory)

    # Engine (singleton — stateless)
    game_engine = providers.Singleton(GameEngine)

    # Repositories
    game_repository = providers.Factory(
        GameRepository,
        session=db_session,
    )

    # Services
    lobby_service = providers.Singleton(
        LobbyService,
        inactive_player_seconds=settings.reconnect_grace_seconds,
    )

    game_service = providers.Factory(
        GameService,
        engine=game_engine,
        game_repo=game_repository,
    )

    # WebSocket
    connection_manager = providers.Singleton(ConnectionManager)

    game_ws_handler = providers.Factory(
        GameWSHandler,
        connection_manager=connection_manager,
        game_service=game_service,
    )
