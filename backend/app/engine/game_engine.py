"""Game engine — pure state machine. No I/O, no side effects.

All game logic flows through this engine. It validates actions,
manages phase transitions, and delegates to specific handlers.
"""

from __future__ import annotations

import random
import uuid

from app.config import settings
from app.engine.action_handler import resolve_action
from app.engine.block_handler import apply_block, can_block_action, resolve_successful_block
from app.engine.challenge_handler import apply_influence_loss, resolve_challenge
from app.engine.deck import create_full_deck, draw_cards, return_cards_to_deck, shuffle_deck
from app.models.action import ACTION_RULES, ActionType, PlayerAction
from app.models.card import Card
from app.models.game import (
    GameConfig,
    GamePhase,
    GameState,
    GameStatePublic,
    GameStatus,
    PendingAction,
)
from app.models.player import Player, PlayerPublic, to_public


class GameEngine:
    """Pure game logic engine. Stateless — operates on GameState passed in."""

    def create_game(self, game_id: str, config: GameConfig | None = None) -> GameState:
        """Create a new game in WAITING_FOR_PLAYERS phase."""
        return GameState(
            id=game_id,
            status=GameStatus.WAITING,
            phase=GamePhase.WAITING_FOR_PLAYERS,
            config=config or GameConfig(),
        )

    def add_player(
        self,
        state: GameState,
        name: str,
        player_id: str | None = None,
        profile_id: str | None = None,
        *,
        connected: bool = True,
        is_bot: bool = False,
        bot_difficulty: str = "",
    ) -> tuple[GameState, Player]:
        """Add a player to a waiting game."""
        if state.status != GameStatus.WAITING:
            raise ValueError("Cannot join a game that is not in waiting status")
        if len(state.players) >= state.config.max_players:
            raise ValueError("Game is full")

        player = Player(
            id=player_id or str(uuid.uuid4()),
            name=name,
            profile_id=profile_id or "",
            coins=state.config.starting_coins,
            session_token=str(uuid.uuid4()),
            seat_index=len(state.players),
            connected=connected,
            is_bot=is_bot,
            bot_difficulty=bot_difficulty,
        )
        state.players.append(player)
        return state, player

    def remove_player(self, state: GameState, player_id: str) -> GameState:
        """Remove a player from a waiting game."""
        if state.status != GameStatus.WAITING:
            raise ValueError("Cannot leave a game that has started")
        state.players = [p for p in state.players if p.id != player_id]
        # Re-index seats
        for i, p in enumerate(state.players):
            p.seat_index = i
        return state

    def start_game(self, state: GameState) -> GameState:
        """Start the game: deal cards, set up deck, begin first turn."""
        if len(state.players) < settings.min_players:
            raise ValueError(
                f"Need at least {settings.min_players} players to start"
            )
        if state.status != GameStatus.WAITING:
            raise ValueError("Game already started")

        # Create and shuffle deck
        deck = shuffle_deck(create_full_deck(settings.cards_per_character))

        # Deal cards to each player
        for player in state.players:
            drawn, deck = draw_cards(deck, settings.starting_influences)
            player.influences = drawn
            player.coins = settings.starting_coins

        state.deck = deck
        state.status = GameStatus.IN_PROGRESS
        state.turn_number = 1
        state.current_turn_player_id = random.choice(state.players).id
        state.phase = GamePhase.TURN_START

        state.event_log.append({
            "type": "game_started",
            "player_ids": [p.id for p in state.players],
        })
        return state

    def validate_action(self, state: GameState, action: PlayerAction) -> str | None:
        """Validate if an action is legal. Returns error message or None."""
        player = state.get_player(action.player_id)
        if player is None:
            return "Player not found"
        if not player.is_alive:
            return "Dead players cannot act"
        if state.current_turn_player_id != action.player_id:
            return "Not your turn"
        if state.phase != GamePhase.TURN_START:
            return "Cannot take action in current phase"

        rule = ACTION_RULES.get(action.action_type)
        if rule is None:
            return f"Unknown action: {action.action_type}"

        # Mandatory coup check
        if player.coins >= settings.mandatory_coup_threshold:
            if action.action_type != ActionType.COUP:
                return f"Must coup with {settings.mandatory_coup_threshold}+ coins"

        # Cost check
        if player.coins < rule.cost:
            return f"Not enough coins (need {rule.cost}, have {player.coins})"

        # Target validation
        if rule.requires_target:
            if action.target_id is None:
                return "This action requires a target"
            target = state.get_player(action.target_id)
            if target is None:
                return "Target not found"
            if not target.is_alive:
                return "Cannot target eliminated player"
            if action.target_id == action.player_id:
                return "Cannot target yourself"

        return None

    def declare_action(self, state: GameState, action: PlayerAction) -> GameState:
        """Player declares an action. Deducts cost and sets up challenge/block windows."""
        error = self.validate_action(state, action)
        if error:
            raise ValueError(error)

        player = state.get_player(action.player_id)
        rule = ACTION_RULES[action.action_type]

        # Deduct cost immediately (assassination cost is paid upfront)
        if rule.cost > 0:
            player.coins -= rule.cost

        # Income resolves immediately — no challenge/block
        if action.action_type == ActionType.INCOME:
            state.pending_action = None
            return resolve_action(state, action)

        # Coup resolves immediately — no challenge/block
        if action.action_type == ActionType.COUP:
            state.pending_action = PendingAction(
                action_type=action.action_type.value,
                player_id=action.player_id,
                target_id=action.target_id,
            )
            return resolve_action(state, action)

        # Set pending action
        state.pending_action = PendingAction(
            action_type=action.action_type.value,
            player_id=action.player_id,
            target_id=action.target_id,
        )

        state.event_log.append({
            "type": "action_declared",
            "action": action.action_type.value,
            "player_id": action.player_id,
            "target_id": action.target_id,
        })

        # Determine next phase
        if rule.is_challengeable:
            state.phase = GamePhase.CHALLENGE_WINDOW
        elif rule.blocked_by:
            state.phase = GamePhase.BLOCK_WINDOW
        else:
            state.phase = GamePhase.ACTION_RESOLVING
            return resolve_action(state, action)

        return state

    def handle_challenge(
        self, state: GameState, challenger_id: str
    ) -> tuple[GameState, bool]:
        """A player challenges the current action."""
        if state.phase not in (
            GamePhase.CHALLENGE_WINDOW,
            GamePhase.BLOCK_CHALLENGE_WINDOW,
        ):
            raise ValueError("Cannot challenge in current phase")

        challenger = state.get_player(challenger_id)
        if challenger is None or not challenger.is_alive:
            raise ValueError("Challenger not found or not alive")

        if state.pending_action is None:
            raise ValueError("No pending action to challenge")

        # Determine who is being challenged and what character
        if state.phase == GamePhase.CHALLENGE_WINDOW:
            challenged_id = state.pending_action.player_id
            action_type = ActionType(state.pending_action.action_type)
            claimed_character = ACTION_RULES[action_type].character_required
            if claimed_character is None:
                raise ValueError("This action cannot be challenged")
        else:
            # Block challenge
            challenged_id = state.pending_action.blocked_by
            if challenged_id is None:
                raise ValueError("No blocker to challenge")
            claimed_character_str = state.pending_action.blocking_character
            if claimed_character_str is None:
                raise ValueError("No blocking character")
            claimed_character_val = claimed_character_str
            state.phase = GamePhase.RESOLVING_BLOCK_CHALLENGE
            state, challenger_won = resolve_challenge(
                state, challenger_id, challenged_id, claimed_character_val
            )
            if challenger_won:
                # Block failed — action proceeds after influence loss resolved
                state.phase = GamePhase.AWAITING_INFLUENCE_LOSS
            else:
                # Block stands — action cancelled after challenger loses influence
                state.phase = GamePhase.AWAITING_INFLUENCE_LOSS
            return state, challenger_won

        if challenger_id == challenged_id:
            raise ValueError("Cannot challenge yourself")

        state.pending_action.challenged_by = challenger_id
        state.phase = GamePhase.RESOLVING_CHALLENGE

        state, challenger_won = resolve_challenge(
            state, challenger_id, challenged_id, claimed_character.value
        )

        if challenger_won:
            # Action is cancelled; challenged player loses influence
            state.phase = GamePhase.AWAITING_INFLUENCE_LOSS
        else:
            # Challenger loses influence; action will proceed after
            state.phase = GamePhase.AWAITING_INFLUENCE_LOSS

        return state, challenger_won

    def handle_block(
        self, state: GameState, blocker_id: str, blocking_character: str
    ) -> GameState:
        """A player declares a block."""
        if state.phase != GamePhase.BLOCK_WINDOW:
            raise ValueError("Cannot block in current phase")
        return apply_block(state, blocker_id, blocking_character)

    def handle_no_challenge(self, state: GameState) -> GameState:
        """Challenge window expires with no challenge — move to block or resolve."""
        if state.phase == GamePhase.CHALLENGE_WINDOW:
            if state.pending_action is None:
                raise ValueError("No pending action")
            action_type = ActionType(state.pending_action.action_type)
            rule = ACTION_RULES[action_type]
            if rule.blocked_by:
                # Clear accepts from challenge phase — block phase needs fresh responses
                state.pending_action.accepted_by = []
                state.phase = GamePhase.BLOCK_WINDOW
            else:
                action = PlayerAction(
                    action_type=action_type,
                    player_id=state.pending_action.player_id,
                    target_id=state.pending_action.target_id,
                )
                state.phase = GamePhase.ACTION_RESOLVING
                state = resolve_action(state, action)
            return state
        elif state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW:
            return resolve_successful_block(state)
        else:
            raise ValueError("Not in a challenge window phase")

    def handle_no_block(self, state: GameState) -> GameState:
        """Block window expires with no block — resolve the action."""
        if state.phase != GamePhase.BLOCK_WINDOW:
            raise ValueError("Not in block window phase")
        if state.pending_action is None:
            raise ValueError("No pending action")

        action_type = ActionType(state.pending_action.action_type)
        action = PlayerAction(
            action_type=action_type,
            player_id=state.pending_action.player_id,
            target_id=state.pending_action.target_id,
        )
        state.phase = GamePhase.ACTION_RESOLVING
        return resolve_action(state, action)

    def handle_influence_loss(
        self, state: GameState, player_id: str, card_index: int
    ) -> GameState:
        """Player chooses which card to reveal when losing influence."""
        if state.awaiting_influence_loss_from != player_id:
            raise ValueError(f"Not waiting for influence loss from {player_id}")

        state = apply_influence_loss(state, player_id, card_index)

        # Determine next phase based on context
        if state.pending_action is not None:
            pending = state.pending_action
            challenger_won = pending.challenged_by is not None

            # If this was a challenge resolution
            if state.phase != GamePhase.AWAITING_INFLUENCE_LOSS:
                pass  # Already handled
            elif pending.blocked_by is not None:
                # Block challenge was resolved
                if player_id == pending.blocked_by:
                    # Blocker lost the challenge — action proceeds
                    action_type = ActionType(pending.action_type)
                    action = PlayerAction(
                        action_type=action_type,
                        player_id=pending.player_id,
                        target_id=pending.target_id,
                    )
                    state.phase = GamePhase.ACTION_RESOLVING
                    state = resolve_action(state, action)
                else:
                    # Challenger of block lost — block stands
                    state = resolve_successful_block(state)
            elif pending.challenged_by is not None:
                if player_id == pending.player_id:
                    # Actor lost the challenge — action cancelled
                    state.pending_action = None
                    state.phase = GamePhase.TURN_END
                else:
                    # Challenger lost — action proceeds
                    action_type = ActionType(pending.action_type)
                    rule = ACTION_RULES[action_type]
                    if rule.blocked_by:
                        # Clear accepts — block phase needs fresh responses
                        pending.accepted_by = []
                        state.phase = GamePhase.BLOCK_WINDOW
                    else:
                        action = PlayerAction(
                            action_type=action_type,
                            player_id=pending.player_id,
                            target_id=pending.target_id,
                        )
                        state.phase = GamePhase.ACTION_RESOLVING
                        state = resolve_action(state, action)
            else:
                # Regular influence loss (coup/assassinate target chose card)
                state.pending_action = None
                state.phase = GamePhase.TURN_END
        else:
            state.phase = GamePhase.TURN_END

        return state

    def handle_exchange_return(
        self, state: GameState, player_id: str, keep_indices: list[int]
    ) -> GameState:
        """Player returns cards during exchange."""
        if state.phase != GamePhase.AWAITING_EXCHANGE:
            raise ValueError("Not in exchange phase")
        player = state.get_player(player_id)
        if player is None:
            raise ValueError(f"Player {player_id} not found")

        alive_cards = [c for c in player.influences if not c.revealed]
        all_cards = alive_cards + state.exchange_cards

        if len(keep_indices) != len(alive_cards):
            raise ValueError(
                f"Must keep exactly {len(alive_cards)} cards"
            )
        if any(i < 0 or i >= len(all_cards) for i in keep_indices):
            raise ValueError("Invalid card index")
        if len(set(keep_indices)) != len(keep_indices):
            raise ValueError("Duplicate card indices")

        kept = [all_cards[i] for i in keep_indices]
        returned = [c for i, c in enumerate(all_cards) if i not in keep_indices]

        # Replace alive influences with kept cards
        new_influences = [c for c in player.influences if c.revealed] + kept
        player.influences = new_influences
        state.deck = return_cards_to_deck(state.deck, returned)
        state.exchange_cards = []
        state.pending_action = None
        state.phase = GamePhase.TURN_END

        state.event_log.append({
            "type": "exchange_completed",
            "player_id": player_id,
        })
        return state

    def advance_turn(self, state: GameState) -> GameState:
        """Move to the next alive player's turn."""
        if state.phase != GamePhase.TURN_END:
            raise ValueError("Cannot advance turn outside TURN_END phase")

        state.pending_action = None
        state.awaiting_influence_loss_from = None

        # Check for winner
        alive = state.alive_players
        if len(alive) <= 1:
            state.phase = GamePhase.GAME_OVER
            state.status = GameStatus.FINISHED
            state.winner_id = alive[0].id if alive else None
            state.event_log.append({
                "type": "game_over",
                "winner_id": state.winner_id,
            })
            return state

        # Find next alive player
        current_idx = next(
            (i for i, p in enumerate(state.players)
             if p.id == state.current_turn_player_id),
            0,
        )
        next_idx = (current_idx + 1) % len(state.players)
        while not state.players[next_idx].is_alive:
            next_idx = (next_idx + 1) % len(state.players)

        state.current_turn_player_id = state.players[next_idx].id
        state.turn_number += 1
        state.phase = GamePhase.TURN_START

        state.event_log.append({
            "type": "turn_changed",
            "player_id": state.current_turn_player_id,
            "turn_number": state.turn_number,
        })
        return state

    def to_public_state(
        self, state: GameState, for_player_id: str
    ) -> GameStatePublic:
        """Convert to public state for a specific player (hides other cards)."""
        player = state.get_player(for_player_id)
        your_cards = player.influences if player else []

        # Only show exchange cards to the player doing the exchange
        show_exchange = (
            state.phase == GamePhase.AWAITING_EXCHANGE
            and state.pending_action is not None
            and state.pending_action.player_id == for_player_id
        )

        return GameStatePublic(
            id=state.id,
            status=state.status,
            phase=state.phase,
            config=state.config,
            players=[to_public(p) for p in state.players],
            current_turn_player_id=state.current_turn_player_id,
            turn_number=state.turn_number,
            pending_action=state.pending_action,
            phase_started_at=state.phase_started_at,
            phase_deadline_at=state.phase_deadline_at,
            awaiting_influence_loss_from=state.awaiting_influence_loss_from,
            winner_id=state.winner_id,
            deck_count=len(state.deck),
            event_log=state.event_log[-20:],  # last 20 events
            your_cards=your_cards,
            exchange_cards=state.exchange_cards if show_exchange else [],
        )
