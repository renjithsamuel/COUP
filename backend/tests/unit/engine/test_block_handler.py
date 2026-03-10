"""Tests for block handler."""

import pytest

from app.engine.block_handler import apply_block, can_block_action, resolve_successful_block
from app.models.card import Character
from app.models.game import GamePhase, GameState, PendingAction


class TestCanBlockAction:
    def test_duke_blocks_foreign_aid(self):
        assert can_block_action("foreign_aid", "duke") is True

    def test_contessa_blocks_assassinate(self):
        assert can_block_action("assassinate", "contessa") is True

    def test_captain_blocks_steal(self):
        assert can_block_action("steal", "captain") is True

    def test_ambassador_blocks_steal(self):
        assert can_block_action("steal", "ambassador") is True

    def test_duke_cannot_block_steal(self):
        assert can_block_action("steal", "duke") is False

    def test_contessa_cannot_block_foreign_aid(self):
        assert can_block_action("foreign_aid", "contessa") is False

    def test_cannot_block_income(self):
        assert can_block_action("income", "duke") is False

    def test_cannot_block_coup(self):
        assert can_block_action("coup", "contessa") is False

    def test_cannot_block_tax(self):
        assert can_block_action("tax", "duke") is False


class TestApplyBlock:
    def test_block_sets_phase(self, two_player_game: GameState):
        state = two_player_game
        state.phase = GamePhase.BLOCK_WINDOW
        state.pending_action = PendingAction(
            action_type="foreign_aid",
            player_id=state.players[0].id,
        )

        state = apply_block(state, state.players[1].id, "duke")

        assert state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW
        assert state.pending_action.blocked_by == state.players[1].id
        assert state.pending_action.blocking_character == "duke"

    def test_invalid_block_raises(self, two_player_game: GameState):
        state = two_player_game
        state.phase = GamePhase.BLOCK_WINDOW
        state.pending_action = PendingAction(
            action_type="foreign_aid",
            player_id=state.players[0].id,
        )

        with pytest.raises(ValueError, match="cannot block"):
            apply_block(state, state.players[1].id, "contessa")


class TestResolveSuccessfulBlock:
    def test_block_cancels_action(self, two_player_game: GameState):
        state = two_player_game
        state.pending_action = PendingAction(
            action_type="foreign_aid",
            player_id=state.players[0].id,
            blocked_by=state.players[1].id,
        )

        state = resolve_successful_block(state)

        assert state.pending_action is None
        assert state.phase == GamePhase.TURN_END
