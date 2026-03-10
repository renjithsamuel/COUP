"""Tests for deck operations."""

from app.engine.deck import create_full_deck, draw_cards, return_cards_to_deck, shuffle_deck
from app.models.card import Character


class TestCreateFullDeck:
    def test_creates_15_cards(self):
        deck = create_full_deck()
        assert len(deck) == 15

    def test_three_of_each_character(self):
        deck = create_full_deck()
        for character in Character:
            count = sum(1 for c in deck if c.character == character)
            assert count == 3, f"Expected 3 {character.value}, got {count}"

    def test_all_cards_face_down(self):
        deck = create_full_deck()
        assert all(not c.revealed for c in deck)

    def test_custom_cards_per_character(self):
        deck = create_full_deck(cards_per_character=2)
        assert len(deck) == 10


class TestShuffleDeck:
    def test_preserves_count(self):
        deck = create_full_deck()
        shuffled = shuffle_deck(deck)
        assert len(shuffled) == len(deck)

    def test_returns_new_list(self):
        deck = create_full_deck()
        shuffled = shuffle_deck(deck)
        assert shuffled is not deck


class TestDrawCards:
    def test_draws_correct_count(self):
        deck = create_full_deck()
        drawn, remaining = draw_cards(deck, 3)
        assert len(drawn) == 3
        assert len(remaining) == 12

    def test_draws_from_top(self):
        deck = create_full_deck()
        drawn, _ = draw_cards(deck, 2)
        assert drawn[0] == deck[0]
        assert drawn[1] == deck[1]

    def test_raises_on_overdraw(self):
        deck = create_full_deck()
        try:
            draw_cards(deck, 20)
            assert False, "Should have raised"
        except ValueError:
            pass


class TestReturnCards:
    def test_increases_deck_size(self):
        deck = create_full_deck()
        drawn, remaining = draw_cards(deck, 3)
        new_deck = return_cards_to_deck(remaining, drawn)
        assert len(new_deck) == 15
