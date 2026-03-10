"""Game service — orchestrates game flow between engine, repository, and WS."""

from __future__ import annotations

import asyncio
import logging
import uuid
from typing import TYPE_CHECKING, ClassVar

from app.engine.game_engine import GameEngine
from app.models.action import ActionType, PlayerAction
from app.models.game import GameConfig, GamePhase, GameState, GameStatus
from app.models.lobby import GameConfig as LobbyGameConfig, Lobby

if TYPE_CHECKING:
    from app.repositories.game_repository import GameRepository


class GameService:
    """Orchestrates game lifecycle. Delegates logic to GameEngine, persistence to repo."""

    _logger = logging.getLogger(__name__)
    _games: ClassVar[dict[str, GameState]] = {}
    _game_locks: ClassVar[dict[str, asyncio.Lock]] = {}

    def __init__(self, engine: GameEngine, game_repo: GameRepository) -> None:
        self._engine = engine
        self._repo = game_repo

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

        # Add all lobby players (preserve their IDs)
        for lp in lobby.players:
            state, _ = self._engine.add_player(state, lp.name, player_id=lp.id)

        # Start the game
        state = self._engine.start_game(state)

        # Persist and cache
        await self._repo.create(state)
        self._games[game_id] = state
        return state

    async def get_game(self, game_id: str) -> GameState | None:
        """Get game state, preferring cache."""
        shared_games = type(self)._games
        if game_id in shared_games:
            return shared_games[game_id]
        state = await self._repo.get_by_id(game_id)
        if state:
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
            await self._save(state)
            return state

    async def process_challenge(
        self, game_id: str, challenger_id: str
    ) -> tuple[GameState, bool]:
        """Process a challenge."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state, challenger_won = self._engine.handle_challenge(state, challenger_id)
            await self._save(state)
            return state, challenger_won

    async def process_block(
        self, game_id: str, blocker_id: str, blocking_character: str
    ) -> GameState:
        """Process a block."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.handle_block(state, blocker_id, blocking_character)
            await self._save(state)
            return state

    async def process_accept(
        self, game_id: str, player_id: str | None = None
    ) -> tuple[GameState, bool]:
        """Process an accept/pass (challenge or block window expires).

        Returns (state, was_processed). was_processed=False means the phase had
        already advanced — a harmless race condition in multiplayer that should
        be silently ignored.

        For multiplayer: tracks individual accepts and only resolves the window
        when ALL eligible responders have accepted (or a single accept for targeted
        block windows where only the target can respond).
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
                    # Only resolve when all eligible players have accepted
                    if not eligible.issubset(set(state.pending_action.accepted_by)):
                        await self._save(state)
                        return state, False
                state = self._engine.handle_no_challenge(state)
            elif state.phase == GamePhase.BLOCK_WINDOW:
                if state.pending_action is not None and state.pending_action.target_id is not None:
                    # For targeted actions, only the target's accept resolves the block window
                    if (
                        player_id is not None
                        and player_id != state.pending_action.target_id
                    ):
                        return state, False
                else:
                    # For untargeted actions (e.g., Foreign Aid), wait for ALL non-actors
                    if player_id and state.pending_action:
                        eligible = self._get_eligible_responders(state)
                        if player_id not in eligible:
                            return state, False
                        if player_id not in state.pending_action.accepted_by:
                            state.pending_action.accepted_by.append(player_id)
                        if not eligible.issubset(set(state.pending_action.accepted_by)):
                            await self._save(state)
                            return state, False
                state = self._engine.handle_no_block(state)
            else:
                self._logger.debug(
                    "Ignoring stale accept in game %s (phase=%s)", game_id, state.phase
                )
                return state, False
            state = self._advance_if_turn_end(state)
            await self._save(state)
            return state, True

    def _get_eligible_responders(self, state: GameState) -> set[str]:
        """Determine which players need to accept for the current window to close."""
        if state.pending_action is None:
            return set()

        alive_ids = {p.id for p in state.alive_players}
        actor_id = state.pending_action.player_id

        if state.phase == GamePhase.CHALLENGE_WINDOW:
            # All alive players except the actor can challenge
            return alive_ids - {actor_id}
        elif state.phase == GamePhase.BLOCK_WINDOW:
            if state.pending_action.target_id is not None:
                # Only target can block targeted actions
                return {state.pending_action.target_id} & alive_ids
            else:
                # Anyone except the actor can block untargeted actions
                return alive_ids - {actor_id}
        elif state.phase == GamePhase.BLOCK_CHALLENGE_WINDOW:
            # Everyone except the blocker can challenge the block
            blocker_id = state.pending_action.blocked_by
            return alive_ids - ({blocker_id} if blocker_id else set())
        return set()

    async def process_influence_loss(
        self, game_id: str, player_id: str, card_index: int
    ) -> GameState:
        """Process influence loss choice."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.handle_influence_loss(state, player_id, card_index)
            state = self._advance_if_turn_end(state)
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
            await self._save(state)
            return state

    async def advance_turn(self, game_id: str) -> GameState:
        """Explicitly advance to next turn."""
        async with self._get_game_lock(game_id):
            state = await self._get_or_raise(game_id)
            state = self._engine.advance_turn(state)
            await self._save(state)
            return state

    def get_public_state(self, state: GameState, player_id: str):
        """Get public state for a player."""
        return self._engine.to_public_state(state, player_id)

    async def _get_or_raise(self, game_id: str) -> GameState:
        state = await self.get_game(game_id)
        if state is None:
            raise ValueError(f"Game {game_id} not found")
        return state

    async def _save(self, state: GameState) -> None:
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
