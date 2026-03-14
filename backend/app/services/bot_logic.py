"""Lightweight bot decision helpers for solo AI matches."""

from __future__ import annotations

import random

from app.models.action import ACTION_RULES, ActionType
from app.models.card import Character
from app.models.game import GamePhase, GameState
from app.models.player import Player

_BLUFF_CHANCE = {
    "easy": 0.34,
    "medium": 0.22,
    "hard": 0.12,
}

_CHALLENGE_BASE = {
    "easy": 0.05,
    "medium": 0.1,
    "hard": 0.15,
}

_KNOWN_CHALLENGE = {
    "easy": 0.72,
    "medium": 0.84,
    "hard": 0.93,
}


def _personality_seed(bot: Player) -> int:
    source = bot.profile_id or bot.id or bot.name
    return sum(ord(char) for char in source)


def _personality_trait(bot: Player, offset: int) -> float:
    seed = _personality_seed(bot) + offset
    return ((seed % 21) - 10) / 100


def normalize_difficulty(value: str | None) -> str:
    difficulty = (value or "medium").strip().lower()
    if difficulty not in {"easy", "medium", "hard"}:
        return "medium"
    return difficulty


def choose_bot_turn_action(state: GameState, bot: Player) -> tuple[ActionType, str | None]:
    opponents = [player for player in state.alive_players if player.id != bot.id]
    if not opponents:
        return ActionType.INCOME, None

    difficulty = normalize_difficulty(bot.bot_difficulty)
    bluff_chance = max(0.05, _BLUFF_CHANCE[difficulty] + _personality_trait(bot, 3))
    aggression = _personality_trait(bot, 7)
    caution = _personality_trait(bot, 11)
    holds = {card.character for card in bot.alive_influences}

    if bot.coins >= 10:
        target = _choose_target(opponents)
        return ActionType.COUP, target.id

    candidates: list[tuple[ActionType, str | None, float]] = [(ActionType.INCOME, None, 1.0)]

    if bot.coins >= 7:
        target = _choose_target(opponents)
        candidates.append((ActionType.COUP, target.id, 4.4 + aggression))

    if Character.DUKE in holds or random.random() < bluff_chance:
        candidates.append((ActionType.TAX, None, (2.8 if Character.DUKE in holds else 1.5) + aggression * 0.8))

    if bot.coins < 6:
        candidates.append((ActionType.FOREIGN_AID, None, 1.9 - caution * 0.7))

    steal_targets = [player for player in opponents if player.coins > 0]
    if steal_targets and (Character.CAPTAIN in holds or random.random() < bluff_chance):
        target = _choose_target(steal_targets)
        candidates.append((ActionType.STEAL, target.id, (2.2 if Character.CAPTAIN in holds else 1.3) + aggression * 0.7))

    if bot.coins >= 3 and (Character.ASSASSIN in holds or random.random() < (bluff_chance * 0.75)):
        target = _choose_target(opponents)
        weight = (2.6 if Character.ASSASSIN in holds else 1.3) + aggression
        if target.influence_count <= 1:
            weight += 1.2
        candidates.append((ActionType.ASSASSINATE, target.id, weight))

    if Character.AMBASSADOR in holds or random.random() < (bluff_chance * 0.6):
        exchange_weight = (1.8 if Character.AMBASSADOR in holds else 1.1) + caution * 0.8
        if len({card.character for card in bot.alive_influences}) == 1:
            exchange_weight += 0.6
        candidates.append((ActionType.EXCHANGE, None, exchange_weight))

    return _weighted_choice(candidates)


def choose_bot_block(state: GameState, bot: Player) -> Character | None:
    pending = state.pending_action
    if pending is None:
        return None

    difficulty = normalize_difficulty(bot.bot_difficulty)
    bluff_chance = max(0.04, _BLUFF_CHANCE[difficulty] + _personality_trait(bot, 17) * 0.8)
    holds = {card.character for card in bot.alive_influences}
    action_type = ActionType(pending.action_type)

    if action_type == ActionType.FOREIGN_AID:
        if Character.DUKE in holds:
            return Character.DUKE if random.random() < 0.88 else None
        return Character.DUKE if random.random() < (bluff_chance * 0.45) else None

    if pending.target_id != bot.id:
        return None

    if action_type == ActionType.ASSASSINATE:
        if Character.CONTESSA in holds:
            return Character.CONTESSA if random.random() < 0.95 else None
        return Character.CONTESSA if random.random() < (bluff_chance * 0.95) else None

    if action_type == ActionType.STEAL:
        real_blocks = [character for character in (Character.CAPTAIN, Character.AMBASSADOR) if character in holds]
        if real_blocks:
            return random.choice(real_blocks) if random.random() < 0.9 else None
        return random.choice([Character.CAPTAIN, Character.AMBASSADOR]) if random.random() < (bluff_chance * 0.7) else None

    return None


def should_bot_challenge(state: GameState, bot: Player) -> bool:
    pending = state.pending_action
    if pending is None:
        return False

    difficulty = normalize_difficulty(bot.bot_difficulty)
    challenged_character: Character | None = None

    if state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW and pending.blocking_character:
        challenged_character = Character(pending.blocking_character)
    else:
        action_rule = ACTION_RULES.get(ActionType(pending.action_type))
        challenged_character = action_rule.character_required if action_rule else None

    if challenged_character is None:
        return False

    known_count = _known_character_count(state, bot, challenged_character)
    if known_count >= 3:
        return random.random() < _KNOWN_CHALLENGE[difficulty]

    probability = _CHALLENGE_BASE[difficulty] + _personality_trait(bot, 23)
    if pending.target_id == bot.id:
        probability += 0.12
    if pending.action_type == ActionType.ASSASSINATE.value:
        probability += 0.14
    elif pending.action_type == ActionType.STEAL.value:
        probability += 0.08
    elif pending.action_type == ActionType.TAX.value:
        probability += 0.03

    return random.random() < min(max(probability, 0.01), 0.6)


def choose_influence_loss_index(state: GameState, player: Player) -> int:
    alive_cards = [(index, card.character) for index, card in enumerate(player.influences) if not card.revealed]
    difficulty = normalize_difficulty(player.bot_difficulty)
    if not alive_cards:
        return 0

    scored_cards = []
    for public_index, (_, character) in enumerate(alive_cards):
        score = _card_value(character, state, player)
        if difficulty == "easy":
            score += random.random() * 1.4
        elif difficulty == "medium":
            score += random.random() * 0.75
        else:
            score += random.random() * 0.25
        score += _personality_trait(player, 31)
        scored_cards.append((score, public_index))

    scored_cards.sort(key=lambda item: item[0])
    return scored_cards[0][1]


def choose_exchange_keep_indices(state: GameState, player: Player) -> list[int]:
    alive_cards = [card for card in player.influences if not card.revealed]
    combined = alive_cards + state.exchange_cards
    keep_count = len(alive_cards)
    difficulty = normalize_difficulty(player.bot_difficulty)

    scored_cards = []
    for index, card in enumerate(combined):
        score = _card_value(card.character, state, player)
        if difficulty == "easy":
            score += random.random() * 1.1
        elif difficulty == "medium":
            score += random.random() * 0.55
        else:
            score += random.random() * 0.2
        score += _personality_trait(player, 37)
        scored_cards.append((score, index))

    scored_cards.sort(key=lambda item: item[0], reverse=True)
    return sorted(index for _, index in scored_cards[:keep_count])


def _choose_target(opponents: list[Player]) -> Player:
    def threat_score(player: Player) -> float:
        return (
            (player.influence_count * 3.2)
            + player.coins
            + (0.75 if not player.is_bot else 0.0)
            + random.random() * 0.8
        )

    return max(opponents, key=threat_score)


def _weighted_choice(candidates: list[tuple[ActionType, str | None, float]]) -> tuple[ActionType, str | None]:
    total = sum(weight for _, _, weight in candidates)
    roll = random.random() * total
    cursor = 0.0
    for action_type, target_id, weight in candidates:
        cursor += weight
        if roll <= cursor:
            return action_type, target_id
    last_action, last_target, _ = candidates[-1]
    return last_action, last_target


def _known_character_count(state: GameState, bot: Player, character: Character) -> int:
    known_count = sum(1 for card in bot.alive_influences if card.character == character)
    for player in state.players:
        known_count += sum(1 for card in player.revealed_influences if card.character == character)
    return known_count


def _card_value(character: Character, state: GameState, player: Player) -> float:
    value = {
        Character.AMBASSADOR: 1.0,
        Character.CONTESSA: 1.2,
        Character.CAPTAIN: 1.6,
        Character.ASSASSIN: 1.8,
        Character.DUKE: 2.2,
    }[character]

    if character == Character.CONTESSA and any(opponent.coins >= 3 for opponent in state.alive_players if opponent.id != player.id):
        value += 0.45
    if character == Character.CAPTAIN and any(opponent.coins > 0 for opponent in state.alive_players if opponent.id != player.id):
        value += 0.35
    if character == Character.ASSASSIN and player.coins >= 3:
        value += 0.35
    if character == Character.AMBASSADOR and player.influence_count <= 1:
        value -= 0.15

    return value