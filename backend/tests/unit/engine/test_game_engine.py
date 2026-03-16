"""Tests for the game engine — core game logic."""

import pytest

from app.engine.game_engine import GameEngine
from app.models.action import ActionType, PlayerAction
from app.models.card import Card, Character
from app.models.game import GameConfig, GamePhase, GameState, GameStatus


class TestGameCreation:
    def test_create_game(self, engine: GameEngine):
        state = engine.create_game("test-1")
        assert state.id == "test-1"
        assert state.status == GameStatus.WAITING
        assert state.phase == GamePhase.WAITING_FOR_PLAYERS
        assert len(state.players) == 0

    def test_create_game_with_config(self, engine: GameEngine):
        config = GameConfig(max_players=4)
        state = engine.create_game("test-2", config)
        assert state.config.max_players == 4


class TestAddPlayer:
    def test_add_player(self, engine: GameEngine):
        state = engine.create_game("test")
        state, player = engine.add_player(state, "Alice")
        assert len(state.players) == 1
        assert player.name == "Alice"
        assert player.coins == 2
        assert player.seat_index == 0

    def test_add_multiple_players(self, engine: GameEngine):
        state = engine.create_game("test")
        state, p1 = engine.add_player(state, "Alice")
        state, p2 = engine.add_player(state, "Bob")
        assert len(state.players) == 2
        assert p2.seat_index == 1

    def test_cannot_exceed_max_players(self, engine: GameEngine):
        config = GameConfig(max_players=2)
        state = engine.create_game("test", config)
        state, _ = engine.add_player(state, "Alice")
        state, _ = engine.add_player(state, "Bob")
        with pytest.raises(ValueError, match="full"):
            engine.add_player(state, "Charlie")

    def test_cannot_join_started_game(self, engine: GameEngine, two_player_game: GameState):
        with pytest.raises(ValueError, match="not in waiting"):
            engine.add_player(two_player_game, "Charlie")


class TestStartGame:
    def test_start_game(self, engine: GameEngine):
        state = engine.create_game("test")
        state, _ = engine.add_player(state, "Alice")
        state, _ = engine.add_player(state, "Bob")
        state = engine.start_game(state)

        assert state.status == GameStatus.IN_PROGRESS
        assert state.phase == GamePhase.TURN_START
        assert state.turn_number == 1
        assert state.current_turn_player_id in {player.id for player in state.players}

        # Each player should have 2 cards
        for p in state.players:
            assert len(p.influences) == 2
            assert all(not c.revealed for c in p.influences)
            assert p.coins == 2

    def test_start_game_randomizes_first_player(self, engine: GameEngine, monkeypatch: pytest.MonkeyPatch):
        state = engine.create_game("test")
        state, first_player = engine.add_player(state, "Alice")
        state, second_player = engine.add_player(state, "Bob")
        monkeypatch.setattr(
            "app.engine.game_engine.random.choice",
            lambda players: players[1],
        )

        state = engine.start_game(state)

        assert state.current_turn_player_id == second_player.id
        assert state.current_turn_player_id != first_player.id

    def test_cannot_start_with_one_player(self, engine: GameEngine):
        state = engine.create_game("test")
        state, _ = engine.add_player(state, "Alice")
        with pytest.raises(ValueError, match="at least"):
            engine.start_game(state)

    def test_deck_has_remaining_cards(self, engine: GameEngine):
        state = engine.create_game("test")
        state, _ = engine.add_player(state, "Alice")
        state, _ = engine.add_player(state, "Bob")
        state = engine.start_game(state)
        # 15 total - 4 dealt = 11 remaining
        assert len(state.deck) == 11


class TestIncome:
    def test_income_adds_one_coin(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player_id = state.current_turn_player_id
        initial_coins = state.get_player(player_id).coins

        action = PlayerAction(
            action_type=ActionType.INCOME,
            player_id=player_id,
        )
        state = engine.declare_action(state, action)

        assert state.get_player(player_id).coins == initial_coins + 1
        assert state.phase == GamePhase.TURN_END


class TestCoup:
    def test_coup_costs_7_coins(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        target = state.players[1]
        player.coins = 7

        action = PlayerAction(
            action_type=ActionType.COUP,
            player_id=player.id,
            target_id=target.id,
        )
        state = engine.declare_action(state, action)

        assert player.coins == 0
        assert state.phase == GamePhase.AWAITING_INFLUENCE_LOSS
        assert state.awaiting_influence_loss_from == target.id

    def test_cannot_coup_without_coins(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        player.coins = 6

        action = PlayerAction(
            action_type=ActionType.COUP,
            player_id=player.id,
            target_id=state.players[1].id,
        )
        with pytest.raises(ValueError, match="Not enough coins"):
            engine.declare_action(state, action)

    def test_cannot_self_coup(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        player.coins = 7

        action = PlayerAction(
            action_type=ActionType.COUP,
            player_id=player.id,
            target_id=player.id,
        )
        with pytest.raises(ValueError, match="yourself"):
            engine.declare_action(state, action)


class TestMandatoryCoup:
    def test_must_coup_with_10_coins(self, engine: GameEngine, rich_player_game: GameState):
        state = rich_player_game
        player_id = state.current_turn_player_id

        action = PlayerAction(
            action_type=ActionType.INCOME,
            player_id=player_id,
        )
        with pytest.raises(ValueError, match="Must coup"):
            engine.declare_action(state, action)

    def test_can_coup_with_10_coins(self, engine: GameEngine, rich_player_game: GameState):
        state = rich_player_game
        player = state.players[0]
        target = state.players[1]

        action = PlayerAction(
            action_type=ActionType.COUP,
            player_id=player.id,
            target_id=target.id,
        )
        state = engine.declare_action(state, action)
        assert player.coins == 3  # 10 - 7


class TestTax:
    def test_tax_enters_challenge_window(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player_id = state.current_turn_player_id

        action = PlayerAction(action_type=ActionType.TAX, player_id=player_id)
        state = engine.declare_action(state, action)

        assert state.phase == GamePhase.CHALLENGE_WINDOW
        assert state.pending_action is not None
        assert state.pending_action.action_type == "tax"


class TestAssassinate:
    def test_assassinate_costs_3(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        target = state.players[1]
        player.coins = 5

        action = PlayerAction(
            action_type=ActionType.ASSASSINATE,
            player_id=player.id,
            target_id=target.id,
        )
        state = engine.declare_action(state, action)

        assert player.coins == 2  # 5 - 3 paid upfront
        assert state.phase == GamePhase.CHALLENGE_WINDOW

    def test_cannot_assassinate_without_coins(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[0]
        player.coins = 2

        action = PlayerAction(
            action_type=ActionType.ASSASSINATE,
            player_id=player.id,
            target_id=state.players[1].id,
        )
        with pytest.raises(ValueError, match="Not enough coins"):
            engine.declare_action(state, action)


class TestSteal:
    def test_steal_enters_challenge_window(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player_id = state.current_turn_player_id
        target_id = state.players[1].id

        action = PlayerAction(
            action_type=ActionType.STEAL,
            player_id=player_id,
            target_id=target_id,
        )
        state = engine.declare_action(state, action)
        assert state.phase == GamePhase.CHALLENGE_WINDOW


class TestForeignAid:
    def test_foreign_aid_enters_block_window(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player_id = state.current_turn_player_id

        action = PlayerAction(action_type=ActionType.FOREIGN_AID, player_id=player_id)
        state = engine.declare_action(state, action)

        assert state.phase == GamePhase.BLOCK_WINDOW


class TestTurnAdvancement:
    def test_advance_to_next_player(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        first = state.current_turn_player_id

        # Take income (resolves immediately to TURN_END)
        action = PlayerAction(action_type=ActionType.INCOME, player_id=first)
        state = engine.declare_action(state, action)
        state = engine.advance_turn(state)

        assert state.current_turn_player_id != first
        assert state.turn_number == 2
        assert state.phase == GamePhase.TURN_START

    def test_skip_dead_players(self, engine: GameEngine, monkeypatch: pytest.MonkeyPatch):
        monkeypatch.setattr("app.engine.game_engine.random.choice", lambda players: players[0])
        state = engine.create_game("test")
        state, p1 = engine.add_player(state, "Alice")
        state, p2 = engine.add_player(state, "Bob")
        state, p3 = engine.add_player(state, "Charlie")
        state = engine.start_game(state)

        # Kill Bob
        state.players[1].is_alive = False
        state.players[1].influences[0].revealed = True
        state.players[1].influences[1].revealed = True

        # Alice takes income
        action = PlayerAction(action_type=ActionType.INCOME, player_id=state.players[0].id)
        state = engine.declare_action(state, action)
        state = engine.advance_turn(state)

        # Should skip Bob and go to Charlie
        assert state.current_turn_player_id == state.players[2].id


class TestGameOver:
    def test_game_over_when_one_player_left(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        # Kill player 2
        state.players[1].is_alive = False
        state.players[1].influences[0].revealed = True
        state.players[1].influences[1].revealed = True

        # Set phase to TURN_END for advance
        state.phase = GamePhase.TURN_END
        state = engine.advance_turn(state)

        assert state.phase == GamePhase.GAME_OVER
        assert state.status == GameStatus.FINISHED
        assert state.winner_id == state.players[0].id


class TestInfluenceLoss:
    def test_choose_influence_to_lose(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[1]
        state.awaiting_influence_loss_from = player.id
        state.phase = GamePhase.AWAITING_INFLUENCE_LOSS

        state = engine.handle_influence_loss(state, player.id, 0)

        assert player.influences[0].revealed is True
        assert player.influence_count == 1
        assert player.is_alive is True

    def test_eliminated_on_second_loss(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        player = state.players[1]
        player.influences[0].revealed = True
        state.awaiting_influence_loss_from = player.id
        state.phase = GamePhase.AWAITING_INFLUENCE_LOSS

        # Create pending action for context
        state.pending_action = None

        state = engine.handle_influence_loss(state, player.id, 0)

        assert player.influence_count == 0
        assert player.is_alive is False


class TestPublicState:
    def test_hides_other_players_cards(self, engine: GameEngine, two_player_game: GameState):
        state = two_player_game
        p1 = state.players[0]
        p2 = state.players[1]

        public = engine.to_public_state(state, p1.id)

        # Should see own cards
        assert len(public.your_cards) == 2

        # Other player should only show influence count, not card characters
        other = next(p for p in public.players if p.id == p2.id)
        assert other.influence_count == 2
        assert len(other.revealed_characters) == 0
        assert other.showdown_characters == []

    def test_game_over_state_exposes_showdown_characters(
        self, engine: GameEngine, two_player_game: GameState
    ):
        state = two_player_game
        winner = state.players[0]
        loser = state.players[1]

        winner.influences = [
            Card(character=Character.DUKE),
            Card(character=Character.CAPTAIN),
        ]
        loser.influences[0].revealed = True
        loser.influences[1].revealed = True
        loser.is_alive = False
        state.phase = GamePhase.GAME_OVER
        state.status = GameStatus.FINISHED
        state.winner_id = winner.id

        public = engine.to_public_state(state, loser.id)
        winner_public = next(p for p in public.players if p.id == winner.id)

        assert winner_public.revealed_characters == []
        assert winner_public.showdown_characters == ["duke", "captain"]

    def test_shows_deck_count_not_contents(self, engine: GameEngine, two_player_game: GameState):
        public = engine.to_public_state(two_player_game, two_player_game.players[0].id)
        assert public.deck_count == len(two_player_game.deck)
