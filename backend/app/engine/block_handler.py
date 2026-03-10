"""Block resolution — pure logic."""

from __future__ import annotations

from app.models.action import ACTION_RULES, ActionType
from app.models.card import Character
from app.models.game import GamePhase, GameState, PendingAction


def can_block_action(action_type: str, blocking_character: str) -> bool:
    """Check if a character can block an action."""
    try:
        at = ActionType(action_type)
        bc = Character(blocking_character)
    except ValueError:
        return False
    rule = ACTION_RULES.get(at)
    if rule is None:
        return False
    return bc in rule.blocked_by


def apply_block(state: GameState, blocker_id: str, blocking_character: str) -> GameState:
    """Apply a block declaration to the game state."""
    if state.pending_action is None:
        raise ValueError("No pending action to block")

    if not can_block_action(state.pending_action.action_type, blocking_character):
        raise ValueError(
            f"{blocking_character} cannot block {state.pending_action.action_type}"
        )

    blocker = state.get_player(blocker_id)
    if blocker is None or not blocker.is_alive:
        raise ValueError("Blocker not found or not alive")

    # For targeted actions (steal, assassinate), only the target may block
    if state.pending_action.target_id is not None:
        if blocker_id != state.pending_action.target_id:
            raise ValueError("Only the target of this action can block it")

    state.pending_action.blocked_by = blocker_id
    state.pending_action.blocking_character = blocking_character
    state.phase = GamePhase.BLOCK_CHALLENGE_WINDOW

    state.event_log.append({
        "type": "block_declared",
        "blocker_id": blocker_id,
        "blocking_character": blocking_character,
        "action_type": state.pending_action.action_type,
    })
    return state


def resolve_successful_block(state: GameState) -> GameState:
    """Block was not challenged or blocker won the challenge — action is cancelled."""
    if state.pending_action is None:
        raise ValueError("No pending action")

    state.event_log.append({
        "type": "block_successful",
        "blocker_id": state.pending_action.blocked_by,
        "action_type": state.pending_action.action_type,
    })

    state.pending_action = None
    state.phase = GamePhase.TURN_END
    return state
