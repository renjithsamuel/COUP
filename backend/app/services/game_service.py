"""Game service — orchestrates game flow between engine, repository, and WS."""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, ClassVar

from app.engine.game_engine import GameEngine
from app.models.action import ActionType, PlayerAction
from app.models.game import GameConfig, GamePhase, GameState, GameStatus
from app.models.lobby import AiDifficulty, GameConfig as LobbyGameConfig, LeaderboardEntry, Lobby
from app.services.bot_logic import (
    choose_bot_block,
    choose_bot_turn_action,
    choose_exchange_keep_indices,
    choose_influence_loss_index,
    normalize_difficulty,
    should_bot_challenge,
)

if TYPE_CHECKING:
    from app.repositories.game_repository import GameRepository


class GameService:
    """Orchestrates game lifecycle. Delegates logic to GameEngine, persistence to repo."""

    _logger = logging.getLogger(__name__)
    _games: ClassVar[dict[str, GameState]] = {}
    _game_locks: ClassVar[dict[str, asyncio.Lock]] = {}
    _phase_clocks: ClassVar[dict[str, dict[str, str | None]]] = {}
    _bot_activation: ClassVar[set[str]] = set()

    def __init__(self, engine: GameEngine, game_repo: GameRepository) -> None:
        self._engine = engine
        self._repo = game_repo

    async def close(self) -> None:
        await self._repo.close()

    async def create_game_from_lobby(
        self, lobby: Lobby, lobby_config: LobbyGameConfig | None = None,
    ) -> GameState:
        """Create a new game from a lobby and start it."""
        game_id = str(uuid.uuid4())[:8]
        lc = lobby_config or LobbyGameConfig()
        config = GameConfig(
            max_players=lobby.max_players,
            turn_timer_seconds=lc.turn_timer_seconds,
            challenge_window_seconds=lc.challenge_window_seconds,
            block_window_seconds=lc.block_window_seconds,
            starting_coins=lc.starting_coins,
        )
        state = self._engine.create_game(game_id, config)
        state.room_id = lobby.id

        # Add all lobby players (preserve their IDs)
        for lp in lobby.players:
            state, _ = self._engine.add_player(
                state,
                lp.name,
                player_id=lp.id,
                profile_id=lp.profile_id,
            )

        # Start the game
        state = self._engine.start_game(state)
        self._sync_phase_clock(state)

        # Persist and cache
        await self._repo.create(state)
        self._games[game_id] = state
        return state

    async def create_ai_match(
        self,
        *,
        player_name: str,
        bot_count: int,
        difficulty: AiDifficulty,
        profile_id: str = "",
        lobby_config: LobbyGameConfig | None = None,
    ) -> tuple[GameState, str]:
        """Create and start a single-human match against AI bots."""
        if bot_count < 1 or bot_count > 5:
            raise ValueError("Bot count must be between 1 and 5")

        game_id = str(uuid.uuid4())[:8]
        lc = lobby_config or LobbyGameConfig()
        config = GameConfig(
            max_players=bot_count + 1,
            turn_timer_seconds=lc.turn_timer_seconds,
            challenge_window_seconds=lc.challenge_window_seconds,
            block_window_seconds=lc.block_window_seconds,
            starting_coins=lc.starting_coins,
        )

        state = self._engine.create_game(game_id, config)
        state, human_player = self._engine.add_player(
            state,
            player_name,
            profile_id=profile_id.strip() or str(uuid.uuid4()),
            connected=False,
        )

        for index in range(bot_count):
            state, _ = self._engine.add_player(
                state,
                self._build_bot_name(index),
                profile_id=f"bot::{difficulty.value}::{game_id}::{index + 1}",
                connected=True,
                is_bot=True,
                bot_difficulty=difficulty.value,
            )

        state = self._engine.start_game(state)
        self._sync_phase_clock(state)
        await self._repo.create(state)
        self._games[game_id] = state
        type(self)._bot_activation.discard(game_id)
        return state, human_player.id

    async def get_game(self, game_id: str) -> GameState | None:
        """Get game state, preferring cache."""
        shared_games = type(self)._games
        if game_id in shared_games:
            self._sync_phase_clock(shared_games[game_id])
            return shared_games[game_id]
        state = await self._repo.get_by_id(game_id)
        if state:
            self._sync_phase_clock(state)
            shared_games[game_id] = state
        return state

    async def process_action(
        self, game_id: str, player_id: str, action_type: str, target_id: str | None = None
    ) -> GameState:
        """Process a player action."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            action = PlayerAction(
                action_type=ActionType(action_type),
                player_id=player_id,
                target_id=target_id,
            )
            state = self._engine.declare_action(state, action)
            state = self._advance_if_turn_end(state)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state

    async def process_challenge(
        self, game_id: str, challenger_id: str
    ) -> tuple[GameState, bool]:
        """Process a challenge."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            if challenger_id not in self._get_eligible_responders(state):
                raise ValueError("Player cannot challenge this action")
            state, challenger_won = self._engine.handle_challenge(state, challenger_id)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state, challenger_won

    async def process_block(
        self, game_id: str, blocker_id: str, blocking_character: str
    ) -> GameState:
        """Process a block."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.handle_block(state, blocker_id, blocking_character)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state

    async def process_accept(
        self, game_id: str, player_id: str | None = None
    ) -> tuple[GameState, bool]:
        """Process an accept/pass (challenge or block window expires).

        Returns (state, was_processed). was_processed=False means the phase had
        already advanced — a harmless race condition in multiplayer that should
        be silently ignored.

        Targeted challenge/block decisions are resolved one-on-one between the
        directly involved players. Untargeted windows remain table-wide and only
        close once every eligible responder has allowed the action/window.
        """
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)

            if state.phase in (GamePhase.CHALLENGE_WINDOW, GamePhase.BLOCK_CHALLENGE_WINDOW):
                if player_id and state.pending_action:
                    eligible = self._get_eligible_responders(state)
                    if player_id not in eligible:
                        return state, False
                    if player_id not in state.pending_action.accepted_by:
                        state.pending_action.accepted_by.append(player_id)
                    if (
                        state.phase == GamePhase.CHALLENGE_WINDOW
                        and state.pending_action.target_id is None
                        and not eligible.issubset(set(state.pending_action.accepted_by))
                    ):
                        await self._save(state)
                        return state, False
                state = self._engine.handle_no_challenge(state)
            elif state.phase == GamePhase.BLOCK_WINDOW:
                if player_id and state.pending_action:
                    eligible = self._get_eligible_responders(state)
                    if player_id not in eligible:
                        return state, False
                    if player_id not in state.pending_action.accepted_by:
                        state.pending_action.accepted_by.append(player_id)
                    if (
                        state.pending_action.target_id is None
                        and not eligible.issubset(set(state.pending_action.accepted_by))
                    ):
                        await self._save(state)
                        return state, False
                state = self._engine.handle_no_block(state)
            else:
                self._logger.debug(
                    "Ignoring stale accept in game %s (phase=%s)", game_id, state.phase
                )
                return state, False
            state = self._advance_if_turn_end(state)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state, True

    def _get_eligible_responders(self, state: GameState) -> set[str]:
        """Determine who may respond during the current challenge/block window."""
        if state.pending_action is None:
            return set()

        alive_ids = {p.id for p in state.alive_players}
        actor_id = state.pending_action.player_id
        target_id = state.pending_action.target_id

        if state.phase == GamePhase.CHALLENGE_WINDOW:
            if target_id is not None:
                return {target_id} & alive_ids
            return alive_ids - {actor_id}
        elif state.phase == GamePhase.BLOCK_WINDOW:
            if target_id is not None:
                return {target_id} & alive_ids
            return alive_ids - {actor_id}
        elif state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW:
            return {actor_id} & alive_ids
        return set()

    def _ensure_terminal_state(self, state: GameState) -> GameState:
        """Promote the game into GAME_OVER as soon as only one player survives."""
        alive_players = state.alive_players
        if len(alive_players) > 1:
            return state

        if (
            state.phase == GamePhase.AWAITING_INFLUENCE_LOSS
            and state.awaiting_influence_loss_from is not None
        ):
            return state

        if state.phase == GamePhase.GAME_OVER:
            return state

        state.pending_action = None
        state.awaiting_influence_loss_from = None
        state.phase = GamePhase.TURN_END
        return self._advance_if_turn_end(state)

    async def process_influence_loss(
        self, game_id: str, player_id: str, card_index: int
    ) -> GameState:
        """Process influence loss choice."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.handle_influence_loss(state, player_id, card_index)
            state = self._advance_if_turn_end(state)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state

    async def process_exchange_return(
        self, game_id: str, player_id: str, keep_indices: list[int]
    ) -> GameState:
        """Process exchange card return."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.handle_exchange_return(state, player_id, keep_indices)
            state = self._advance_if_turn_end(state)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state

    async def set_player_connected(
        self, game_id: str, player_id: str, connected: bool
    ) -> GameState | None:
        """Update and persist a player's connection status."""
        async with self._get_game_lock(game_id):
            state = await self.get_game(game_id)
            if state is None:
                return None

            player = state.get_player(player_id)
            if player is None:
                return state

            is_ai_match_human = connected and not player.is_bot and any(p.is_bot for p in state.players)
            if is_ai_match_human:
                type(self)._bot_activation.add(game_id)

            if player.connected == connected:
                return state

            player.connected = connected
            await self._save(state)
            return state

    async def process_bot_turns(self) -> list[dict[str, object]]:
        outcomes: list[dict[str, object]] = []
        for game_id in list(type(self)._games.keys()):
            outcome = await self.process_bot_step(game_id)
            if outcome is not None:
                outcomes.append(outcome)
        return outcomes

    async def process_bot_step(self, game_id: str) -> dict[str, object] | None:
        state = await self.get_game(game_id)
        if state is None or state.status != GameStatus.IN_PROGRESS:
            return None
        if not any(player.is_bot and player.is_alive for player in state.players):
            return None
        if any(not player.is_bot for player in state.players) and game_id not in type(self)._bot_activation:
            return None

        previous_phase = state.phase
        previous_turn_number = state.turn_number
        previous_player_id = state.current_turn_player_id
        events: list[dict[str, object]] = []

        try:
            if state.phase == GamePhase.TURN_START:
                acting_player = state.get_player(state.current_turn_player_id) if state.current_turn_player_id else None
                if acting_player is None or not acting_player.is_bot or not acting_player.is_alive:
                    return None
                if not self._bot_delay_elapsed(state, acting_player, role="turn"):
                    return None

                action_type, target_id = choose_bot_turn_action(state, acting_player)
                actor_name = acting_player.name
                target_name = state.get_player(target_id).name if target_id and state.get_player(target_id) else ""
                state = await self.process_action(game_id, acting_player.id, action_type.value, target_id)
                events.append({
                    "type": "ACTION_DECLARED",
                    "payload": {
                        "actorId": acting_player.id,
                        "actorName": actor_name,
                        "actionType": action_type.value,
                        "targetId": target_id or "",
                        "targetName": target_name,
                    },
                })
            elif state.phase in (GamePhase.CHALLENGE_WINDOW, GamePhase.BLOCK_CHALLENGE_WINDOW):
                responder = self._next_ready_bot_responder(state)
                if responder is None:
                    return None

                pending = state.pending_action
                if pending is None:
                    return None

                challenged_player_id = (
                    pending.blocked_by
                    if state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW
                    else pending.player_id
                ) or ""
                challenged_player = state.get_player(challenged_player_id)
                if should_bot_challenge(state, responder):
                    state, challenger_won = await self.process_challenge(game_id, responder.id)
                    events.append({
                        "type": "CHALLENGE_ISSUED",
                        "payload": {
                            "challengerId": responder.id,
                            "challengerName": responder.name,
                            "challengedPlayerId": challenged_player_id,
                            "challengedPlayerName": challenged_player.name if challenged_player else "",
                            "actionType": pending.action_type,
                            "blockingCharacter": pending.blocking_character or "",
                            "window": previous_phase.value,
                        },
                    })
                    events.append({
                        "type": "CHALLENGE_RESULT",
                        "payload": {
                            "challengerId": responder.id,
                            "challengerName": responder.name,
                            "challengedPlayerId": challenged_player_id,
                            "challengedPlayerName": challenged_player.name if challenged_player else "",
                            "actionType": pending.action_type,
                            "blockingCharacter": pending.blocking_character or "",
                            "window": previous_phase.value,
                            "challengerWon": challenger_won,
                            "success": challenger_won,
                        },
                    })
                else:
                    state, _ = await self.process_accept(game_id, responder.id)
            elif state.phase == GamePhase.BLOCK_WINDOW:
                responder = self._next_ready_bot_responder(state)
                if responder is None:
                    return None

                blocking_character = choose_bot_block(state, responder)
                if blocking_character is not None:
                    pending = state.pending_action
                    state = await self.process_block(game_id, responder.id, blocking_character.value)
                    events.append({
                        "type": "BLOCK_DECLARED",
                        "payload": {
                            "blockerId": responder.id,
                            "blockerName": responder.name,
                            "actionType": pending.action_type if pending else "",
                            "actorId": pending.player_id if pending else "",
                            "blockingCharacter": blocking_character.value,
                            "character": blocking_character.value,
                        },
                    })
                else:
                    state, _ = await self.process_accept(game_id, responder.id)
            elif state.phase == GamePhase.AWAITING_INFLUENCE_LOSS:
                player_id = state.awaiting_influence_loss_from
                player = state.get_player(player_id) if player_id else None
                if player is None or not player.is_bot or not player.is_alive:
                    return None
                if not self._bot_delay_elapsed(state, player, role="reveal"):
                    return None

                alive_cards = [card for card in player.influences if not card.revealed]
                card_index = choose_influence_loss_index(state, player)
                lost_character = alive_cards[card_index].character.value if 0 <= card_index < len(alive_cards) else ""
                state = await self.process_influence_loss(game_id, player.id, card_index)
                updated_player = state.get_player(player.id)
                events.append({
                    "type": "INFLUENCE_LOST",
                    "payload": {
                        "playerId": player.id,
                        "playerName": player.name,
                        "character": lost_character,
                    },
                })
                if updated_player is not None and not updated_player.is_alive:
                    events.append({
                        "type": "PLAYER_ELIMINATED",
                        "payload": {
                            "playerId": player.id,
                            "playerName": player.name,
                        },
                    })
            elif state.phase == GamePhase.AWAITING_EXCHANGE:
                pending = state.pending_action
                player = state.get_player(pending.player_id) if pending else None
                if player is None or not player.is_bot or not self._bot_delay_elapsed(state, player, role="exchange"):
                    return None

                keep_indices = choose_exchange_keep_indices(state, player)
                state = await self.process_exchange_return(game_id, player.id, keep_indices)
            else:
                return None
        except ValueError as exc:
            self._logger.debug("Ignoring stale bot step in game %s: %s", game_id, exc)
            return None

        self._append_phase_boundary_event(
            events,
            state,
            previous_phase=previous_phase,
            previous_turn_number=previous_turn_number,
            previous_player_id=previous_player_id,
        )
        return {"game_id": game_id, "state": state, "events": events}

    async def advance_turn(self, game_id: str) -> GameState:
        """Explicitly advance to next turn."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.advance_turn(state)
            state = self._ensure_terminal_state(state)
            await self._save(state)
            return state

    async def delete_game(self, game_id: str) -> bool:
        """Delete a finished or abandoned game from persistence and cache."""
        async with self._get_game_lock(game_id):
            deleted = await self._repo.delete(game_id)
            type(self)._games.pop(game_id, None)
            type(self)._game_locks.pop(game_id, None)
            type(self)._phase_clocks.pop(game_id, None)
            type(self)._bot_activation.discard(game_id)
            return deleted

    def get_public_state(self, state: GameState, player_id: str):
        """Get public state for a player."""
        self._sync_phase_clock(state)
        return self._engine.to_public_state(state, player_id)

    async def get_leaderboard(self, room_id: str, limit: int = 10) -> list[LeaderboardEntry]:
        rows = await self._repo.get_leaderboard(room_id=room_id, limit=limit)
        return [LeaderboardEntry.model_validate(row) for row in rows]

    async def cleanup_finished_games(self, retention_minutes: int) -> int:
        if retention_minutes <= 0:
            return 0

        cutoff = self._utc_now() - timedelta(minutes=retention_minutes)
        deleted_game_ids = await self._repo.delete_finished_before(cutoff)
        for game_id in deleted_game_ids:
            type(self)._games.pop(game_id, None)
            type(self)._game_locks.pop(game_id, None)
            type(self)._phase_clocks.pop(game_id, None)
        return len(deleted_game_ids)

    async def process_expired_timers(self) -> list[dict[str, object]]:
        resolutions: list[dict[str, object]] = []
        for game_id in list(type(self)._games.keys()):
            resolution = await self.process_timeout(game_id)
            if resolution is not None:
                resolutions.append(resolution)
        return resolutions

    async def process_timeout(self, game_id: str) -> dict[str, object] | None:
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            self._sync_phase_clock(state)

            deadline_at = self._parse_iso8601(state.phase_deadline_at)
            if deadline_at is None or deadline_at > self._utc_now():
                return None

            previous_phase = state.phase
            previous_turn_number = state.turn_number
            previous_player_id = state.current_turn_player_id

            if state.phase == GamePhase.TURN_START:
                timed_out_player_id = state.current_turn_player_id
                state.event_log.append({
                    "type": "turn_timed_out",
                    "player_id": timed_out_player_id,
                    "turn_number": state.turn_number,
                })
                state.phase = GamePhase.TURN_END
                state = self._advance_if_turn_end(state)
            elif state.phase in (
                GamePhase.CHALLENGE_WINDOW,
                GamePhase.BLOCK_CHALLENGE_WINDOW,
            ):
                state = self._engine.handle_no_challenge(state)
                state = self._advance_if_turn_end(state)
            elif state.phase == GamePhase.BLOCK_WINDOW:
                state = self._engine.handle_no_block(state)
                state = self._advance_if_turn_end(state)
            else:
                return None

            state = self._ensure_terminal_state(state)
            await self._save(state)

            return {
                "game_id": game_id,
                "state": state,
                "previous_phase": previous_phase.value,
                "previous_turn_number": previous_turn_number,
                "previous_player_id": previous_player_id,
            }

    async def _get_or_raise(self, game_id: str) -> GameState:
        state = await self.get_game(game_id)
        if state is None:
            raise ValueError(f"Game {game_id} not found")
        return state

    async def _save(self, state: GameState) -> None:
        self._sync_phase_clock(state)
        type(self)._games[state.id] = state
        await self._repo.update(state)

    def _get_game_lock(self, game_id: str) -> asyncio.Lock:
        shared_locks = type(self)._game_locks
        lock = shared_locks.get(game_id)
        if lock is None:
            lock = asyncio.Lock()
            shared_locks[game_id] = lock
        return lock

    def _advance_if_turn_end(self, state: GameState) -> GameState:
        """Advance the game immediately after any turn-ending resolution."""
        if state.phase == GamePhase.TURN_END:
            return self._engine.advance_turn(state)
        return state

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _parse_iso8601(value: str | None) -> datetime | None:
        if not value:
            return None
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return None

    def _sync_phase_clock(self, state: GameState) -> None:
        signature = self._build_phase_signature(state)
        current = type(self)._phase_clocks.get(state.id)

        if current is None or current.get("signature") != signature:
            now = self._utc_now()
            timer_seconds = self._get_phase_timer_seconds(state)
            deadline_at = (
                (now + timedelta(seconds=timer_seconds)).isoformat()
                if timer_seconds > 0
                else None
            )
            current = {
                "signature": signature,
                "phase_started_at": now.isoformat(),
                "phase_deadline_at": deadline_at,
            }
            type(self)._phase_clocks[state.id] = current

        state.phase_started_at = current.get("phase_started_at")
        state.phase_deadline_at = current.get("phase_deadline_at")

    def _bot_delay_elapsed(self, state: GameState, player, *, role: str) -> bool:
        started_at = self._parse_iso8601(state.phase_started_at)
        if started_at is None:
            return True
        elapsed = (self._utc_now() - started_at).total_seconds()
        return elapsed >= self._bot_delay_seconds(state, player.id, player.bot_difficulty, role=role)

    def _bot_delay_seconds(self, state: GameState, player_id: str, difficulty: str, *, role: str) -> float:
        normalized = normalize_difficulty(difficulty)
        base = {
            "turn": {"easy": 2.4, "medium": 1.7, "hard": 1.15},
            "response": {"easy": 1.8, "medium": 1.25, "hard": 0.85},
            "reveal": {"easy": 1.6, "medium": 1.1, "hard": 0.8},
            "exchange": {"easy": 1.9, "medium": 1.35, "hard": 0.95},
        }[role][normalized]
        signature = f"{state.id}|{self._build_phase_signature(state)}|{player_id}|{role}"
        jitter = (sum(ord(char) for char in signature) % 7) * 0.18
        return base + jitter

    def _next_ready_bot_responder(self, state: GameState):
        eligible_ids = self._get_eligible_responders(state)
        ready_players = []
        for player_id in eligible_ids:
            player = state.get_player(player_id)
            if player is None or not player.is_bot or not player.is_alive:
                continue
            if state.pending_action and player.id in state.pending_action.accepted_by:
                continue
            delay = self._bot_delay_seconds(state, player.id, player.bot_difficulty, role="response")
            if self._bot_delay_elapsed(state, player, role="response"):
                ready_players.append((delay, player))

        if not ready_players:
            return None

        ready_players.sort(key=lambda item: item[0])
        return ready_players[0][1]

    @staticmethod
    def _append_phase_boundary_event(
        events: list[dict[str, object]],
        state: GameState,
        *,
        previous_phase: GamePhase,
        previous_turn_number: int,
        previous_player_id: str | None,
    ) -> None:
        if state.phase == GamePhase.GAME_OVER and previous_phase != GamePhase.GAME_OVER:
            winner = state.get_player(state.winner_id) if state.winner_id else None
            events.append({
                "type": "GAME_OVER",
                "payload": {
                    "winnerId": state.winner_id or "",
                    "winnerName": winner.name if winner else "",
                },
            })
        elif state.turn_number != previous_turn_number or state.current_turn_player_id != previous_player_id:
            current_player = state.get_player(state.current_turn_player_id) if state.current_turn_player_id else None
            events.append({
                "type": "TURN_CHANGED",
                "payload": {
                    "turnNumber": state.turn_number,
                    "playerId": state.current_turn_player_id or "",
                    "playerName": current_player.name if current_player else "",
                },
            })

    @staticmethod
    def _build_bot_name(index: int) -> str:
        names = [
            "Silk Bot",
            "Marlow Bot",
            "Iris Bot",
            "Vale Bot",
            "Rook Bot",
        ]
        return names[index % len(names)]

    @staticmethod
    def _build_phase_signature(state: GameState) -> str:
        pending = state.pending_action
        pending_bits = "|".join([
            pending.action_type if pending else "",
            pending.player_id if pending else "",
            pending.target_id or "" if pending else "",
            pending.blocked_by or "" if pending else "",
            pending.blocking_character or "" if pending else "",
            pending.challenged_by or "" if pending else "",
        ])
        return "::".join([
            state.phase.value,
            state.current_turn_player_id or "",
            str(state.turn_number),
            pending_bits,
            state.awaiting_influence_loss_from or "",
        ])

    @staticmethod
    def _get_phase_timer_seconds(state: GameState) -> int:
        if state.phase == GamePhase.TURN_START:
            return state.config.turn_timer_seconds
        if state.phase in (GamePhase.CHALLENGE_WINDOW, GamePhase.BLOCK_CHALLENGE_WINDOW):
            return state.config.challenge_window_seconds
        if state.phase == GamePhase.BLOCK_WINDOW:
            return state.config.block_window_seconds
        return 0
