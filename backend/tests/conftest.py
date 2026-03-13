"""Shared test fixtures."""

from __future__ import annotations

import pytest

from app.engine.game_engine import GameEngine
from app.models.action import ActionType, PlayerAction
from app.models.card import Card, Character
from app.models.game import GameConfig, GamePhase, GameState, GameStatus, PendingAction
from app.models.player import Player


@pytest.fixture
def engine() -> GameEngine:
    return GameEngine()


@pytest.fixture
def two_player_game(engine: GameEngine, monkeypatch: pytest.MonkeyPatch) -> GameState:
    """A started 2-player game, ready for first turn."""
    monkeypatch.setattr("app.engine.game_engine.random.choice", lambda players: players[0])
    state = engine.create_game("test-game")
    state, p1 = engine.add_player(state, "Alice")
    state, p2 = engine.add_player(state, "Bob")
    state = engine.start_game(state)
    return state


@pytest.fixture
def rich_player_game(engine: GameEngine, monkeypatch: pytest.MonkeyPatch) -> GameState:
    """A game where the first player has 10 coins (must coup)."""
    monkeypatch.setattr("app.engine.game_engine.random.choice", lambda players: players[0])
    state = engine.create_game("rich-game")
    state, p1 = engine.add_player(state, "Alice")
    state, p2 = engine.add_player(state, "Bob")
    state = engine.start_game(state)
    state.players[0].coins = 10
    return state
