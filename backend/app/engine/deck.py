"""Deck management — shuffle, draw, return cards."""

from __future__ import annotations

import random

from app.models.card import Card, Character


def create_full_deck(cards_per_character: int = 3) -> list[Card]:
    """Create the full 15-card deck."""
    deck: list[Card] = []
    for character in Character:
        for _ in range(cards_per_character):
            deck.append(Card(character=character))
    return deck


def shuffle_deck(deck: list[Card]) -> list[Card]:
    """Return a shuffled copy of the deck."""
    shuffled = list(deck)
    random.shuffle(shuffled)
    return shuffled


def draw_cards(deck: list[Card], count: int) -> tuple[list[Card], list[Card]]:
    """Draw `count` cards from the top of the deck.

    Returns (drawn_cards, remaining_deck).
    Raises ValueError if not enough cards.
    """
    if count > len(deck):
        raise ValueError(f"Cannot draw {count} cards from deck of {len(deck)}")
    drawn = deck[:count]
    remaining = deck[count:]
    return drawn, remaining


def return_cards_to_deck(deck: list[Card], cards: list[Card]) -> list[Card]:
    """Return cards to the deck and shuffle."""
    new_deck = list(deck) + list(cards)
    random.shuffle(new_deck)
    return new_deck
