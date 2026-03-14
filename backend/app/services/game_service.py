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
from app.models.lobby import GameConfig as LobbyGameConfig, LeaderboardEntry, Lobby

if TYPE_CHECKING:
    from app.repositories.game_repository import GameRepository


class GameService:
    """Orchestrates game lifecycle. Delegates logic to GameEngine, persistence to repo."""

    _logger = logging.getLogger(__name__)
    _games: ClassVar[dict[str, GameState]] = {}
    _game_locks: ClassVar[dict[str, asyncio.Lock]] = {}
    _phase_clocks: ClassVar[dict[str, dict[str, str | None]]] = {}

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

            if player.connected == connected:
                return state

            player.connected = connected
            await self._save(state)
            return state

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
