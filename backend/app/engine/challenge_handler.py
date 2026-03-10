"""Challenge resolution — pure logic."""

from __future__ import annotations

from app.engine.deck import draw_cards, return_cards_to_deck
from app.models.card import Card, Character
from app.models.game import GamePhase, GameState


def resolve_challenge(
    state: GameState,
    challenger_id: str,
    challenged_id: str,
    claimed_character: str,
) -> tuple[GameState, bool]:
    """Resolve a challenge.

    Returns (new_state, challenger_won).
    - If challenged player HAS the card: challenger loses influence, challenged
      shuffles card back and draws new one. challenger_won = False.
    - If challenged player does NOT have the card: challenged loses influence.
      challenger_won = True.
    """
    challenged = state.get_player(challenged_id)
    challenger = state.get_player(challenger_id)
    if challenged is None or challenger is None:
        raise ValueError("Challenger or challenged player not found")

    character_enum = Character(claimed_character)

    # Check if challenged player actually has the card
    has_card = False
    card_index = -1
    for i, card in enumerate(challenged.influences):
        if not card.revealed and card.character == character_enum:
            has_card = True
            card_index = i
            break

    if has_card:
        # Challenged player has the card — challenger loses
        # Shuffle the revealed card back and draw a new one
        old_card = challenged.influences[card_index]
        challenged.influences.pop(card_index)
        state.deck = return_cards_to_deck(state.deck, [Card(character=old_card.character)])
        drawn, remaining = draw_cards(state.deck, 1)
        state.deck = remaining
        challenged.influences.insert(card_index, drawn[0])

        # Challenger must lose an influence
        state.awaiting_influence_loss_from = challenger_id

        state.event_log.append({
            "type": "challenge_result",
            "challenger_id": challenger_id,
            "challenged_id": challenged_id,
            "claimed_character": claimed_character,
            "challenger_won": False,
        })
        return state, False
    else:
        # Challenged player doesn't have the card — they lose influence
        state.awaiting_influence_loss_from = challenged_id

        state.event_log.append({
            "type": "challenge_result",
            "challenger_id": challenger_id,
            "challenged_id": challenged_id,
            "claimed_character": claimed_character,
            "challenger_won": True,
        })
        return state, True


def apply_influence_loss(
    state: GameState,
    player_id: str,
    card_index: int,
) -> GameState:
    """Player chooses which influence to lose (reveal)."""
    player = state.get_player(player_id)
    if player is None:
        raise ValueError(f"Player {player_id} not found")

    alive_cards = [(i, c) for i, c in enumerate(player.influences) if not c.revealed]
    if not alive_cards:
        raise ValueError(f"Player {player_id} has no unrevealed influences")

    if card_index < 0 or card_index >= len(alive_cards):
        raise ValueError(f"Invalid card index {card_index}")

    actual_index = alive_cards[card_index][0]
    player.influences[actual_index].revealed = True

    # Check if player is eliminated
    if player.influence_count == 0:
        player.is_alive = False
        state.event_log.append({
            "type": "player_eliminated",
            "player_id": player_id,
        })

    state.event_log.append({
        "type": "influence_lost",
        "player_id": player_id,
        "character": player.influences[actual_index].character.value,
    })

    state.awaiting_influence_loss_from = None
    return state
