"""Tests for Pydantic models."""

import pytest

from app.models.action import ACTION_RULES, ActionType
from app.models.card import Card, Character
from app.models.game import GameConfig, GamePhase, GameState, GameStatus
from app.models.lobby import Lobby, LobbyCreate, LobbyJoin, LobbyPlayer
from app.models.player import Player, to_public


class TestCardModel:
    def test_create_card(self):
        card = Card(character=Character.DUKE)
        assert card.character == Character.DUKE
        assert card.revealed is False

    def test_revealed_card(self):
        card = Card(character=Character.ASSASSIN, revealed=True)
        assert card.revealed is True


class TestPlayerModel:
    def test_alive_influences(self):
        player = Player(
            id="p1",
            name="Test",
            influences=[
                Card(character=Character.DUKE),
                Card(character=Character.CAPTAIN, revealed=True),
            ],
        )
        assert player.influence_count == 1

    def test_to_public_hides_cards(self):
        player = Player(
            id="p1",
            name="Test",
            coins=5,
            influences=[
                Card(character=Character.DUKE),
                Card(character=Character.CAPTAIN, revealed=True),
            ],
        )
        public = to_public(player)
        assert public.influence_count == 1
        assert public.revealed_characters == ["captain"]
        assert public.coins == 5


class TestActionRules:
    def test_all_actions_have_rules(self):
        for action_type in ActionType:
            assert action_type in ACTION_RULES

    def test_income_not_blockable(self):
        rule = ACTION_RULES[ActionType.INCOME]
        assert rule.blocked_by == []
        assert rule.is_challengeable is False

    def test_coup_costs_7(self):
        rule = ACTION_RULES[ActionType.COUP]
        assert rule.cost == 7
        assert rule.requires_target is True

    def test_assassinate_costs_3(self):
        rule = ACTION_RULES[ActionType.ASSASSINATE]
        assert rule.cost == 3
        assert rule.character_required == Character.ASSASSIN
        assert Character.CONTESSA in rule.blocked_by

    def test_steal_blocked_by_captain_ambassador(self):
        rule = ACTION_RULES[ActionType.STEAL]
        assert Character.CAPTAIN in rule.blocked_by
        assert Character.AMBASSADOR in rule.blocked_by


class TestLobbyModels:
    def test_lobby_create_validation(self):
        lobby = LobbyCreate(host_name="Alice", max_players=4)
        assert lobby.host_name == "Alice"
        assert lobby.max_players == 4

    def test_lobby_create_name_required(self):
        with pytest.raises(Exception):
            LobbyCreate(host_name="", max_players=4)

    def test_lobby_max_players_range(self):
        with pytest.raises(Exception):
            LobbyCreate(host_name="Alice", max_players=7)

    def test_lobby_is_full(self):
        lobby = Lobby(
            id="test",
            players=[LobbyPlayer(id=f"p{i}", name=f"P{i}") for i in range(6)],
            max_players=6,
        )
        assert lobby.is_full is True
