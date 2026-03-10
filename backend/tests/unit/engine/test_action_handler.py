"""Tests for action handlers."""

import pytest

from app.engine.action_handler import resolve_action
from app.models.action import ActionType, PlayerAction
from app.models.game import GamePhase, GameState


class TestStealResolve:
    def test_steal_caps_at_target_coins(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        target = state.players[1]
        target.coins = 1

        action = PlayerAction(
            action_type=ActionType.STEAL,
            player_id=player.id,
            target_id=target.id,
        )
        state = resolve_action(state, action)

        assert target.coins == 0
        assert player.coins == 3  # 2 + 1 stolen

    def test_steal_from_zero_coins(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        target = state.players[1]
        target.coins = 0
        initial = player.coins

        action = PlayerAction(
            action_type=ActionType.STEAL,
            player_id=player.id,
            target_id=target.id,
        )
        state = resolve_action(state, action)

        assert target.coins == 0
        assert player.coins == initial  # no change

    def test_steal_full_amount(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        target = state.players[1]
        target.coins = 5
        initial = player.coins

        action = PlayerAction(
            action_type=ActionType.STEAL,
            player_id=player.id,
            target_id=target.id,
        )
        state = resolve_action(state, action)

        assert target.coins == 3  # 5 - 2
        assert player.coins == initial + 2


class TestIncomeResolve:
    def test_income_adds_one(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        initial = player.coins

        action = PlayerAction(action_type=ActionType.INCOME, player_id=player.id)
        state = resolve_action(state, action)

        assert player.coins == initial + 1
        assert state.phase == GamePhase.TURN_END


class TestTaxResolve:
    def test_tax_adds_three(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        initial = player.coins

        action = PlayerAction(action_type=ActionType.TAX, player_id=player.id)
        state = resolve_action(state, action)

        assert player.coins == initial + 3


class TestForeignAidResolve:
    def test_foreign_aid_adds_two(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        initial = player.coins

        action = PlayerAction(action_type=ActionType.FOREIGN_AID, player_id=player.id)
        state = resolve_action(state, action)

        assert player.coins == initial + 2
