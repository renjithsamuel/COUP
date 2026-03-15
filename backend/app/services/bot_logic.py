"""Bot personalities, heuristics, and pacing helpers."""

from __future__ import annotations

from dataclasses import dataclass
import random

from app.models.action import ACTION_RULES, ActionType
from app.models.card import Character
from app.models.game import GamePhase, GameState
from app.models.player import Player

@dataclass(frozen=True)
class BotWorkshop:
    key: str
    archetype: str
    core_values: tuple[str, str, str]
    names: tuple[str, ...]
    aggression: float
    caution: float
    bluff: float
    challenge: float
    tempo: float
    economy: float
    control: float
    survival: float


@dataclass(frozen=True)
class BotPersona:
    key: str
    name: str
    archetype: str
    core_values: tuple[str, str, str]
    aggression: float
    caution: float
    bluff: float
    challenge: float
    tempo: float
    economy: float
    control: float
    survival: float


BOT_WORKSHOPS: tuple[BotWorkshop, ...] = (
    BotWorkshop(
        key="silk-court",
        archetype="Silk-smile bluffer",
        core_values=("table image", "calculated greed", "late pivots"),
        names=("Marlow", "Sabine", "Alaric", "Vesper"),
        aggression=0.16,
        caution=-0.06,
        bluff=0.2,
        challenge=-0.04,
        tempo=-0.04,
        economy=0.08,
        control=0.12,
        survival=-0.04,
    ),
    BotWorkshop(
        key="glass-ledger",
        archetype="Measured closer",
        core_values=("resource discipline", "clean timing", "safe edges"),
        names=("Iris", "Mina", "Corin", "Selene"),
        aggression=-0.02,
        caution=0.12,
        bluff=-0.08,
        challenge=0.08,
        tempo=0.06,
        economy=0.18,
        control=0.04,
        survival=0.14,
    ),
    BotWorkshop(
        key="ash-market",
        archetype="Cold opportunist",
        core_values=("pressure weak stacks", "punish waste", "never idle"),
        names=("Vale", "Nico", "Oren", "Tamsin"),
        aggression=0.1,
        caution=0.02,
        bluff=-0.04,
        challenge=0.12,
        tempo=-0.02,
        economy=0.1,
        control=0.16,
        survival=0.0,
    ),
    BotWorkshop(
        key="garden-mask",
        archetype="Warm liar",
        core_values=("misdirection", "soft tempo", "sudden turns"),
        names=("Juniper", "Elio", "Rosal", "Pia"),
        aggression=0.04,
        caution=-0.02,
        bluff=0.16,
        challenge=-0.08,
        tempo=0.08,
        economy=0.0,
        control=0.08,
        survival=-0.02,
    ),
    BotWorkshop(
        key="edge-reader",
        archetype="Knife-edge reader",
        core_values=("public info", "target focus", "tight punish windows"),
        names=("Soren", "Thea", "Kade", "Zoya"),
        aggression=0.14,
        caution=-0.04,
        bluff=-0.12,
        challenge=0.14,
        tempo=-0.08,
        economy=-0.02,
        control=0.18,
        survival=0.02,
    ),
    BotWorkshop(
        key="stone-veil",
        archetype="Stonewall defender",
        core_values=("survival first", "deny momentum", "stabilize chaos"),
        names=("Petra", "Ivo", "Maelle", "Toren"),
        aggression=-0.08,
        caution=0.18,
        bluff=-0.1,
        challenge=0.06,
        tempo=0.12,
        economy=0.02,
        control=0.04,
        survival=0.22,
    ),
    BotWorkshop(
        key="gilded-rush",
        archetype="Greedy charmer",
        core_values=("coin velocity", "showmanship", "snowball lines"),
        names=("Cass", "Riven", "Nadia", "Luca"),
        aggression=0.18,
        caution=-0.1,
        bluff=0.1,
        challenge=-0.02,
        tempo=-0.1,
        economy=0.2,
        control=0.08,
        survival=-0.1,
    ),
    BotWorkshop(
        key="night-engine",
        archetype="Patient trap-setter",
        core_values=("counterplay", "measured blocks", "quiet endgames"),
        names=("Noemi", "Cato", "Lyra", "Dorian"),
        aggression=0.0,
        caution=0.14,
        bluff=-0.06,
        challenge=0.16,
        tempo=0.14,
        economy=0.04,
        control=0.14,
        survival=0.12,
    ),
)


def _slug_name(value: str) -> str:
    return "".join(character.lower() for character in value if character.isalnum())


def _build_bot_personas() -> tuple[BotPersona, ...]:
    personas: list[BotPersona] = []
    for workshop in BOT_WORKSHOPS:
        for name in workshop.names:
            personas.append(
                BotPersona(
                    key=f"{workshop.key}-{_slug_name(name)}",
                    name=name,
                    archetype=workshop.archetype,
                    core_values=workshop.core_values,
                    aggression=workshop.aggression,
                    caution=workshop.caution,
                    bluff=workshop.bluff,
                    challenge=workshop.challenge,
                    tempo=workshop.tempo,
                    economy=workshop.economy,
                    control=workshop.control,
                    survival=workshop.survival,
                )
            )
    return tuple(personas)


BOT_PERSONAS = _build_bot_personas()

_PERSONAS_BY_KEY = {persona.key: persona for persona in BOT_PERSONAS}

_BLUFF_CHANCE = {
    "easy": 0.34,
    "medium": 0.22,
    "hard": 0.12,
    "lethal": 0.08,
}

_CHALLENGE_BASE = {
    "easy": 0.05,
    "medium": 0.1,
    "hard": 0.15,
    "lethal": 0.19,
}

_KNOWN_CHALLENGE = {
    "easy": 0.72,
    "medium": 0.84,
    "hard": 0.93,
    "lethal": 0.97,
}

_SELECTION_SHARPNESS = {
    "easy": 0.85,
    "medium": 1.0,
    "hard": 1.18,
    "lethal": 1.34,
}

_REVEAL_NOISE = {
    "easy": 1.4,
    "medium": 0.75,
    "hard": 0.25,
    "lethal": 0.12,
}


def choose_bot_personas(game_id: str, bot_count: int) -> list[BotPersona]:
    seed = sum(ord(char) for char in game_id)
    rng = random.Random(seed)
    roster = list(BOT_PERSONAS)
    rng.shuffle(roster)
    if bot_count <= len(roster):
        return roster[:bot_count]
    return [roster[index % len(roster)] for index in range(bot_count)]


def _personality_seed(bot: Player) -> int:
    source = bot.profile_id or bot.id or bot.name
    return sum(ord(char) for char in source)


def _personality_trait(bot: Player, offset: int, *, scale: float = 0.1) -> float:
    seed = _personality_seed(bot) + offset
    return (((seed % 21) - 10) / 10) * scale


def get_bot_persona(bot: Player) -> BotPersona:
    parts = (bot.profile_id or "").split("::")
    if len(parts) >= 3 and parts[0] == "bot":
        persona = _PERSONAS_BY_KEY.get(parts[2])
        if persona is not None:
            return persona

    for persona in BOT_PERSONAS:
        if persona.name.lower() == bot.name.lower():
            return persona

    return BOT_PERSONAS[_personality_seed(bot) % len(BOT_PERSONAS)]


def normalize_difficulty(value: str | None) -> str:
    difficulty = (value or "medium").strip().lower()
    if difficulty not in {"easy", "medium", "hard", "lethal"}:
        return "medium"
    return difficulty


def choose_bot_turn_action(state: GameState, bot: Player) -> tuple[ActionType, str | None]:
    opponents = [player for player in state.alive_players if player.id != bot.id]
    if not opponents:
        return ActionType.INCOME, None

    difficulty = normalize_difficulty(bot.bot_difficulty)
    persona = get_bot_persona(bot)
    bluff_chance = max(0.03, _BLUFF_CHANCE[difficulty] + persona.bluff + _personality_trait(bot, 3, scale=0.05))
    aggression = persona.aggression + _personality_trait(bot, 7, scale=0.05)
    caution = persona.caution + _personality_trait(bot, 11, scale=0.05)
    challenge_bias = persona.challenge + _personality_trait(bot, 17, scale=0.04)
    economy_bias = persona.economy + _personality_trait(bot, 29, scale=0.05)
    control_bias = persona.control + _personality_trait(bot, 31, scale=0.05)
    survival_bias = persona.survival + _personality_trait(bot, 37, scale=0.04)
    holds = {card.character for card in bot.alive_influences}
    duke_pressure = _character_pressure(state, opponents, Character.DUKE)
    captain_pressure = _character_pressure(state, opponents, Character.CAPTAIN) + _character_pressure(state, opponents, Character.AMBASSADOR) * 0.85
    best_target = _choose_target(state, bot, opponents, action_type=ActionType.COUP)

    if bot.coins >= 10:
        return ActionType.COUP, best_target.id

    if difficulty == "lethal":
        lethal_target = next((player for player in sorted(opponents, key=_low_influence_first) if player.influence_count <= 1), None)
        if bot.coins >= 7 and lethal_target is not None:
            return ActionType.COUP, lethal_target.id

    candidates: list[tuple[ActionType, str | None, float]] = [(ActionType.INCOME, None, 1.0)]

    if bot.coins >= 7:
        coup_weight = 4.2 + aggression + control_bias * 0.75 + (1.3 if best_target.influence_count <= 1 else 0.0)
        if best_target.coins >= 7:
            coup_weight += 0.6
        candidates.append((ActionType.COUP, best_target.id, coup_weight))

    tax_weight = (3.2 if Character.DUKE in holds else 1.2 + bluff_chance * 2.4) + aggression * 0.8 + economy_bias * 0.7 - challenge_bias * 0.2
    if Character.DUKE in holds or random.random() < bluff_chance:
        candidates.append((ActionType.TAX, None, tax_weight))

    if bot.coins < 6:
        foreign_aid_weight = 2.0 + economy_bias * 0.65 - caution * 0.7 - duke_pressure * 2.2
        if bot.coins >= 5:
            foreign_aid_weight -= 0.5
        if foreign_aid_weight > 0.1:
            candidates.append((ActionType.FOREIGN_AID, None, foreign_aid_weight))

    steal_targets = [player for player in opponents if player.coins > 0]
    if steal_targets and (Character.CAPTAIN in holds or random.random() < bluff_chance):
        target = _choose_target(state, bot, steal_targets, action_type=ActionType.STEAL)
        steal_weight = (2.5 if Character.CAPTAIN in holds else 1.1 + bluff_chance * 1.8) + aggression * 0.7 + economy_bias * 0.45 + control_bias * 0.28
        steal_weight += min(target.coins, 3) * 0.35
        steal_weight -= captain_pressure * 1.1
        if steal_weight > 0.1:
            candidates.append((ActionType.STEAL, target.id, steal_weight))

    if bot.coins >= 3 and (Character.ASSASSIN in holds or random.random() < (bluff_chance * 0.75)):
        target = _choose_target(state, bot, opponents, action_type=ActionType.ASSASSINATE)
        weight = (3.0 if Character.ASSASSIN in holds else 1.0 + bluff_chance * 1.6) + aggression + control_bias * 0.8 - survival_bias * 0.16
        if target.influence_count <= 1:
            weight += 1.8
        if target.coins >= 7:
            weight += 0.4
        if difficulty == "lethal" and len(opponents) <= 2:
            weight += 0.7
        candidates.append((ActionType.ASSASSINATE, target.id, weight))

    if Character.AMBASSADOR in holds or random.random() < (bluff_chance * 0.6):
        exchange_weight = (1.9 if Character.AMBASSADOR in holds else 0.9 + bluff_chance) + caution * 0.8 + survival_bias * 0.95 - control_bias * 0.14
        if len({card.character for card in bot.alive_influences}) == 1:
            exchange_weight += 0.6
        if bot.influence_count <= 1:
            exchange_weight -= 0.6
        candidates.append((ActionType.EXCHANGE, None, exchange_weight))

    return _weighted_choice(candidates, sharpness=_SELECTION_SHARPNESS[difficulty])


def choose_bot_block(state: GameState, bot: Player) -> Character | None:
    pending = state.pending_action
    if pending is None:
        return None

    difficulty = normalize_difficulty(bot.bot_difficulty)
    persona = get_bot_persona(bot)
    bluff_chance = max(0.03, _BLUFF_CHANCE[difficulty] + persona.bluff * 0.75 + _personality_trait(bot, 17, scale=0.05))
    survival_bias = persona.survival + _personality_trait(bot, 41, scale=0.05)
    holds = {card.character for card in bot.alive_influences}
    action_type = ActionType(pending.action_type)

    if action_type == ActionType.FOREIGN_AID:
        should_protect_coins = any(player.coins >= 5 for player in state.alive_players if player.id != bot.id)
        if Character.DUKE in holds:
            block_chance = 0.78 + max(0.0, persona.caution) * 0.2 + max(0.0, survival_bias) * 0.08
            if should_protect_coins:
                block_chance += 0.1
            return Character.DUKE if random.random() < min(block_chance, 0.95) else None
        return Character.DUKE if random.random() < (bluff_chance * (0.32 if difficulty == "lethal" else 0.45)) else None

    if pending.target_id != bot.id:
        return None

    if action_type == ActionType.ASSASSINATE:
        if Character.CONTESSA in holds:
            block_chance = 0.92 + max(0.0, persona.caution) * 0.08 + max(0.0, survival_bias) * 0.06
            return Character.CONTESSA if random.random() < min(block_chance, 0.98) else None
        return Character.CONTESSA if random.random() < (bluff_chance * 0.95) else None

    if action_type == ActionType.STEAL:
        real_blocks = [character for character in (Character.CAPTAIN, Character.AMBASSADOR) if character in holds]
        if real_blocks:
            block_chance = 0.86 + max(0.0, persona.caution) * 0.08 + max(0.0, survival_bias) * 0.05
            return random.choice(real_blocks) if random.random() < min(block_chance, 0.96) else None
        return random.choice([Character.CAPTAIN, Character.AMBASSADOR]) if random.random() < (bluff_chance * 0.7) else None

    return None


def should_bot_challenge(state: GameState, bot: Player) -> bool:
    pending = state.pending_action
    if pending is None:
        return False

    difficulty = normalize_difficulty(bot.bot_difficulty)
    persona = get_bot_persona(bot)
    control_bias = persona.control + _personality_trait(bot, 43, scale=0.04)
    survival_bias = persona.survival + _personality_trait(bot, 47, scale=0.04)
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

    probability = _CHALLENGE_BASE[difficulty] + persona.challenge + control_bias * 0.18 - max(0.0, survival_bias) * 0.08 + _personality_trait(bot, 23, scale=0.05)
    probability += _claim_pressure(state, pending.player_id if state.phase == GamePhase.CHALLENGE_WINDOW else pending.blocked_by or "", challenged_character) * 0.12
    if pending.target_id == bot.id:
        probability += 0.12
    if pending.action_type == ActionType.ASSASSINATE.value:
        probability += 0.14
    elif pending.action_type == ActionType.STEAL.value:
        probability += 0.08
    elif pending.action_type == ActionType.TAX.value:
        probability += 0.03

    return random.random() < min(max(probability, 0.01), 0.68 if difficulty == "lethal" else 0.6)


def choose_influence_loss_index(state: GameState, player: Player) -> int:
    alive_cards = [(index, card.character) for index, card in enumerate(player.influences) if not card.revealed]
    difficulty = normalize_difficulty(player.bot_difficulty)
    if not alive_cards:
        return 0

    scored_cards = []
    for public_index, (_, character) in enumerate(alive_cards):
        score = _card_value(character, state, player)
        score += random.random() * _REVEAL_NOISE[difficulty]
        score += _personality_trait(player, 31, scale=0.07)
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
        score += random.random() * (_REVEAL_NOISE[difficulty] * 0.75)
        score += _personality_trait(player, 37, scale=0.06)
        scored_cards.append((score, index))

    scored_cards.sort(key=lambda item: item[0], reverse=True)
    return sorted(index for _, index in scored_cards[:keep_count])


def estimate_bot_delay_seconds(state: GameState, player: Player, *, role: str) -> float:
    difficulty = normalize_difficulty(player.bot_difficulty)
    persona = get_bot_persona(player)
    base = {
        "turn": {"easy": 2.3, "medium": 2.0, "hard": 1.8, "lethal": 1.7},
        "response": {"easy": 1.9, "medium": 1.55, "hard": 1.35, "lethal": 1.25},
        "reveal": {"easy": 1.55, "medium": 1.3, "hard": 1.1, "lethal": 1.0},
        "exchange": {"easy": 2.25, "medium": 1.9, "hard": 1.7, "lethal": 1.55},
    }[role][difficulty]
    complexity = _decision_complexity(state, player, role=role)
    signature = f"{state.id}|{state.phase.value}|{state.turn_number}|{player.id}|{role}|{state.current_turn_player_id or ''}"
    jitter = (sum(ord(char) for char in signature) % 9) * 0.12
    human_breath = 0.22 if role != "reveal" else 0.08
    return max(0.65, base + complexity + human_breath + jitter + persona.tempo)


def _choose_target(
    state: GameState,
    bot: Player,
    opponents: list[Player],
    *,
    action_type: ActionType,
) -> Player:
    def threat_score(player: Player) -> float:
        score = (
            (player.influence_count * 3.2)
            + player.coins
            + (0.75 if not player.is_bot else 0.0)
        )
        if player.influence_count <= 1:
            score += 2.2 if action_type in (ActionType.COUP, ActionType.ASSASSINATE) else 0.8
        if action_type == ActionType.STEAL:
            score += player.coins * 0.75
        if action_type == ActionType.ASSASSINATE and player.coins >= 7:
            score += 0.6
        if _claim_pressure(state, player.id, Character.DUKE) > 0:
            score += 0.35
        score += random.random() * 0.5
        return score

    return max(opponents, key=threat_score)


def _weighted_choice(
    candidates: list[tuple[ActionType, str | None, float]],
    *,
    sharpness: float,
) -> tuple[ActionType, str | None]:
    weighted_candidates = [
        (action_type, target_id, max(weight, 0.05) ** sharpness)
        for action_type, target_id, weight in candidates
    ]
    total = sum(weight for _, _, weight in weighted_candidates)
    roll = random.random() * total
    cursor = 0.0
    for action_type, target_id, weight in weighted_candidates:
        cursor += weight
        if roll <= cursor:
            return action_type, target_id
    last_action, last_target, _ = weighted_candidates[-1]
    return last_action, last_target


def _known_character_count(state: GameState, bot: Player, character: Character) -> int:
    known_count = sum(1 for card in bot.alive_influences if card.character == character)
    for player in state.players:
        known_count += sum(1 for card in player.revealed_influences if card.character == character)
    return known_count


def _character_pressure(state: GameState, opponents: list[Player], character: Character) -> float:
    return sum(_claim_pressure(state, player.id, character) for player in opponents)


def _claim_pressure(state: GameState, player_id: str, character: Character) -> float:
    pressure = 0.0
    for event in state.event_log[-12:]:
        if event.get("player_id") == player_id and event.get("type") == "action_declared":
            action = event.get("action")
            if action:
                rule = ACTION_RULES.get(ActionType(action))
                if rule and rule.character_required == character:
                    pressure += 0.55
        if event.get("blocker_id") == player_id and event.get("type") == "block_declared":
            blocking_character = event.get("blocking_character")
            if blocking_character == character.value:
                pressure += 0.7

    player = state.get_player(player_id)
    if player is not None:
        pressure += sum(1.0 for card in player.revealed_influences if card.character == character)
    return pressure


def _decision_complexity(state: GameState, player: Player, *, role: str) -> float:
    opponents = [opponent for opponent in state.alive_players if opponent.id != player.id]
    if role == "turn":
        complexity = 0.0
        if player.coins >= 7:
            complexity += 0.3
        if player.coins >= 3:
            complexity += 0.22
        if len(opponents) >= 3:
            complexity += 0.18
        if any(opponent.influence_count <= 1 for opponent in opponents):
            complexity += 0.2
        if len({card.character for card in player.alive_influences}) == 1:
            complexity += 0.12
        return complexity

    if role == "response":
        pending = state.pending_action
        if pending is None:
            return 0.0
        complexity = 0.16
        if pending.target_id == player.id:
            complexity += 0.24
        if pending.action_type in {ActionType.ASSASSINATE.value, ActionType.STEAL.value}:
            complexity += 0.18
        if state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW:
            complexity += 0.12
        return complexity

    if role == "exchange":
        return 0.38 + (0.08 if player.influence_count > 1 else 0.0)

    if role == "reveal":
        return 0.06 if player.influence_count <= 1 else 0.18

    return 0.0


def _low_influence_first(player: Player) -> tuple[int, int, str]:
    return (player.influence_count, -player.coins, player.id)


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