"""Action models — single source of truth for game actions and their rules."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict

from app.models.card import Character


class ActionType(str, Enum):
    """All possible actions a player can take."""

    INCOME = "income"
    FOREIGN_AID = "foreign_aid"
    COUP = "coup"
    TAX = "tax"
    ASSASSINATE = "assassinate"
    STEAL = "steal"
    EXCHANGE = "exchange"


class ActionRule(BaseModel):
    """Defines the rules for a single action type."""

    model_config = ConfigDict(strict=True)

    action_type: ActionType
    cost: int = 0
    character_required: Character | None = None
    is_challengeable: bool = False
    blocked_by: list[Character] = []
    requires_target: bool = False


# ── Single source of truth: action rules lookup ──────────────────────────────

ACTION_RULES: dict[ActionType, ActionRule] = {
    ActionType.INCOME: ActionRule(
        action_type=ActionType.INCOME,
        cost=0,
        character_required=None,
        is_challengeable=False,
        blocked_by=[],
        requires_target=False,
    ),
    ActionType.FOREIGN_AID: ActionRule(
        action_type=ActionType.FOREIGN_AID,
        cost=0,
        character_required=None,
        is_challengeable=False,
        blocked_by=[Character.DUKE],
        requires_target=False,
    ),
    ActionType.COUP: ActionRule(
        action_type=ActionType.COUP,
        cost=7,
        character_required=None,
        is_challengeable=False,
        blocked_by=[],
        requires_target=True,
    ),
    ActionType.TAX: ActionRule(
        action_type=ActionType.TAX,
        cost=0,
        character_required=Character.DUKE,
        is_challengeable=True,
        blocked_by=[],
        requires_target=False,
    ),
    ActionType.ASSASSINATE: ActionRule(
        action_type=ActionType.ASSASSINATE,
        cost=3,
        character_required=Character.ASSASSIN,
        is_challengeable=True,
        blocked_by=[Character.CONTESSA],
        requires_target=True,
    ),
    ActionType.STEAL: ActionRule(
        action_type=ActionType.STEAL,
        cost=0,
        character_required=Character.CAPTAIN,
        is_challengeable=True,
        blocked_by=[Character.CAPTAIN, Character.AMBASSADOR],
        requires_target=True,
    ),
    ActionType.EXCHANGE: ActionRule(
        action_type=ActionType.EXCHANGE,
        cost=0,
        character_required=Character.AMBASSADOR,
        is_challengeable=True,
        blocked_by=[],
        requires_target=False,
    ),
}


class PlayerAction(BaseModel):
    """An action submitted by a player."""

    model_config = ConfigDict(strict=True)

    action_type: ActionType
    player_id: str
    target_id: str | None = None


class ActionResult(BaseModel):
    """The result after an action resolves."""

    model_config = ConfigDict(strict=True)

    success: bool
    action: PlayerAction
    coins_changed: dict[str, int] = {}  # player_id -> delta
    influences_lost: dict[str, int] = {}  # player_id -> card_index
    message: str = ""
