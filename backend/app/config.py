"""Application configuration — single source of truth for all settings."""

from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """All app settings, loaded from environment / .env file."""

    # General
    app_env: str = "development"
    app_debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./coup.db"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Game rules — single source of truth
    turn_timer_seconds: int = 30
    challenge_window_seconds: int = 10
    block_window_seconds: int = 10
    reconnect_grace_seconds: int = 60
    max_messages_per_second: int = 10
    min_players: int = 2
    max_players: int = 6
    starting_coins: int = 2
    starting_influences: int = 2
    coup_cost: int = 7
    assassinate_cost: int = 3
    mandatory_coup_threshold: int = 10
    foreign_aid_coins: int = 2
    income_coins: int = 1
    tax_coins: int = 3
    steal_coins: int = 2
    cards_per_character: int = 3

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
