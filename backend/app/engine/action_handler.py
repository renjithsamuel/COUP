"""Action handlers — strategy pattern for each action type.

Each handler is a pure function: (GameState, PlayerAction) -> GameState
No I/O, no side effects beyond returning new state.
"""

from __future__ import annotations

from app.config import settings
from app.models.action import ActionType, PlayerAction
from app.models.game import GamePhase, GameState


def handle_income(state: GameState, action: PlayerAction) -> GameState:
    """Income: +1 coin, no challenge/block possible."""
    player = state.get_player(action.player_id)
    if player is None:
        raise ValueError(f"Player {action.player_id} not found")
    player.coins += settings.income_coins
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.INCOME.value,
        "player_id": action.player_id,
        "coins_gained": settings.income_coins,
    })
    state.phase = GamePhase.TURN_END
    return state


def handle_foreign_aid_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Foreign Aid resolves: +2 coins."""
    player = state.get_player(action.player_id)
    if player is None:
        raise ValueError(f"Player {action.player_id} not found")
    player.coins += settings.foreign_aid_coins
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.FOREIGN_AID.value,
        "player_id": action.player_id,
        "coins_gained": settings.foreign_aid_coins,
    })
    state.phase = GamePhase.TURN_END
    return state


def handle_coup_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Coup resolves: target must lose influence. Cost already deducted."""
    state.awaiting_influence_loss_from = action.target_id
    state.phase = GamePhase.AWAITING_INFLUENCE_LOSS
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.COUP.value,
        "player_id": action.player_id,
        "target_id": action.target_id,
    })
    return state


def handle_tax_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Tax resolves: +3 coins."""
    player = state.get_player(action.player_id)
    if player is None:
        raise ValueError(f"Player {action.player_id} not found")
    player.coins += settings.tax_coins
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.TAX.value,
        "player_id": action.player_id,
        "coins_gained": settings.tax_coins,
    })
    state.phase = GamePhase.TURN_END
    return state


def handle_assassinate_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Assassinate resolves: target must lose influence. Cost already deducted."""
    state.awaiting_influence_loss_from = action.target_id
    state.phase = GamePhase.AWAITING_INFLUENCE_LOSS
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.ASSASSINATE.value,
        "player_id": action.player_id,
        "target_id": action.target_id,
    })
    return state


def handle_steal_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Steal resolves: take up to 2 coins from target."""
    player = state.get_player(action.player_id)
    target = state.get_player(action.target_id) if action.target_id else None
    if player is None or target is None:
        raise ValueError("Player or target not found")
    stolen = min(settings.steal_coins, target.coins)
    target.coins -= stolen
    player.coins += stolen
    state.event_log.append({
        "type": "action_resolved",
        "action": ActionType.STEAL.value,
        "player_id": action.player_id,
        "target_id": action.target_id,
        "coins_stolen": stolen,
    })
    state.phase = GamePhase.TURN_END
    return state


def handle_exchange_resolve(state: GameState, action: PlayerAction) -> GameState:
    """Exchange: draw 2 cards, player picks which to keep (handled in AWAITING_EXCHANGE)."""
    from app.engine.deck import draw_cards

    drawn, remaining_deck = draw_cards(state.deck, 2)
    state.deck = remaining_deck
    state.exchange_cards = drawn
    state.phase = GamePhase.AWAITING_EXCHANGE
    state.event_log.append({
        "type": "exchange_started",
        "player_id": action.player_id,
    })
    return state


# ── Handler registry (strategy pattern) ──────────────────────────────────────

RESOLVE_HANDLERS: dict = {
    ActionType.INCOME: handle_income,
    ActionType.FOREIGN_AID: handle_foreign_aid_resolve,
    ActionType.COUP: handle_coup_resolve,
    ActionType.TAX: handle_tax_resolve,
    ActionType.ASSASSINATE: handle_assassinate_resolve,
    ActionType.STEAL: handle_steal_resolve,
    ActionType.EXCHANGE: handle_exchange_resolve,
}


def resolve_action(state: GameState, action: PlayerAction) -> GameState:
    """Dispatch to the appropriate resolve handler."""
    handler = RESOLVE_HANDLERS.get(action.action_type)
    if handler is None:
        raise ValueError(f"No handler for action type: {action.action_type}")
    return handler(state, action)
