"""Tests for challenge handler."""

import pytest

from app.engine.challenge_handler import apply_influence_loss, resolve_challenge
from app.models.card import Card, Character
from app.models.game import GamePhase, GameState


class TestResolveChallenge:
    def test_challenger_wins_when_no_card(self, two_player_game: GameState):
        state = two_player_game
        actor = state.players[0]
        challenger = state.players[1]

        # Give actor cards that don't include Duke
        actor.influences = [
            Card(character=Character.CAPTAIN),
            Card(character=Character.CONTESSA),
        ]

        state, won = resolve_challenge(
            state, challenger.id, actor.id, "duke"
        )

        assert won is True
        assert state.awaiting_influence_loss_from == actor.id

    def test_challenger_loses_when_card_exists(self, two_player_game: GameState):
        state = two_player_game
        actor = state.players[0]
        challenger = state.players[1]

        # Give actor a Duke
        actor.influences = [
            Card(character=Character.DUKE),
            Card(character=Character.CONTESSA),
        ]

        state, won = resolve_challenge(
            state, challenger.id, actor.id, "duke"
        )

        assert won is False
        assert state.awaiting_influence_loss_from == challenger.id

    def test_successful_defense_replaces_card(self, two_player_game: GameState):
        state = two_player_game
        actor = state.players[0]
        challenger = state.players[1]
        initial_deck_size = len(state.deck)

        actor.influences = [
            Card(character=Character.DUKE),
            Card(character=Character.CONTESSA),
        ]

        state, won = resolve_challenge(
            state, challenger.id, actor.id, "duke"
        )

        # Actor should still have 2 unrevealed cards
        assert actor.influence_count == 2
        # Deck size unchanged (returned 1, drew 1)
        assert len(state.deck) == initial_deck_size


class TestApplyInfluenceLoss:
    def test_reveals_chosen_card(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        state.awaiting_influence_loss_from = player.id

        state = apply_influence_loss(state, player.id, 0)

        assert player.influences[0].revealed is True
        assert player.influence_count == 1

    def test_eliminates_on_last_card(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        player.influences[0].revealed = True
        state.awaiting_influence_loss_from = player.id

        state = apply_influence_loss(state, player.id, 0)

        assert player.is_alive is False
        assert player.influence_count == 0

    def test_invalid_card_index_raises(self, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        state.awaiting_influence_loss_from = player.id

        with pytest.raises(ValueError, match="Invalid card index"):
            apply_influence_loss(state, player.id, 5)
