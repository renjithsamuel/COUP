"""Regression tests for game service turn progression."""

from __future__ import annotations

import asyncio

from app.engine.game_engine import GameEngine
from app.models.game import GamePhase, GameState
from app.services.game_service import GameService


class InMemoryGameRepository:
    """Minimal async repository for service tests."""

    def __init__(self) -> None:
        self._states: dict[str, GameState] = {}

    async def get_by_id(self, id: str) -> GameState | None:
        return self._states.get(id)

    async def get_all(self) -> list[GameState]:
        return list(self._states.values())

    async def create(self, entity: GameState) -> GameState:
        self._states[entity.id] = entity
        return entity

    async def update(self, entity: GameState) -> GameState:
        self._states[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        return self._states.pop(id, None) is not None


async def _create_service_with_state(state: GameState) -> GameService:
    GameService._games.pop(state.id, None)
    GameService._game_locks.pop(state.id, None)
    repo = InMemoryGameRepository()
    await repo.create(state)
    service = GameService(GameEngine(), repo)
    GameService._games[state.id] = state
    return service


def test_process_action_advances_turn_after_income(two_player_game: GameState) -> None:
    async def scenario() -> None:
        service = await _create_service_with_state(two_player_game)
        actor = two_player_game.players[0]
        target = two_player_game.players[1]

        state = await service.process_action(two_player_game.id, actor.id, "income")

        assert state.phase == GamePhase.TURN_START
        assert state.current_turn_player_id == target.id
        assert state.turn_number == 2
        assert actor.coins == 3

    asyncio.run(scenario())


def test_foreign_aid_allow_advances_turn_and_awards_coins(two_player_game: GameState) -> None:
    async def scenario() -> None:
        service = await _create_service_with_state(two_player_game)
        actor = two_player_game.players[0]
        responder = two_player_game.players[1]

        state = await service.process_action(two_player_game.id, actor.id, "foreign_aid")
        assert state.phase == GamePhase.BLOCK_WINDOW

        state, processed = await service.process_accept(two_player_game.id, responder.id)

        assert processed is True
        assert state.phase == GamePhase.TURN_START
        assert state.current_turn_player_id == responder.id
        assert state.turn_number == 2
        assert actor.coins == 4

    asyncio.run(scenario())


def test_steal_target_flow_resolves_after_dual_accept(two_player_game: GameState) -> None:
    async def scenario() -> None:
        service = await _create_service_with_state(two_player_game)
        actor = two_player_game.players[0]
        target = two_player_game.players[1]

        state = await service.process_action(two_player_game.id, actor.id, "steal", target.id)

        assert state.phase == GamePhase.CHALLENGE_WINDOW
        assert state.pending_action is not None
        assert state.pending_action.target_id == target.id

        state, processed = await service.process_accept(two_player_game.id, target.id)

        assert processed is True
        assert state.phase == GamePhase.BLOCK_WINDOW
        assert state.pending_action is not None
        assert state.pending_action.target_id == target.id

        state, processed = await service.process_accept(two_player_game.id, target.id)

        assert processed is True
        assert state.phase == GamePhase.TURN_START
        assert state.current_turn_player_id == target.id
        assert state.turn_number == 2
        assert actor.coins == 4
        assert target.coins == 0
        assert state.pending_action is None

    asyncio.run(scenario())


def test_duplicate_rapid_action_only_resolves_once(two_player_game: GameState) -> None:
    async def scenario() -> None:
        service = await _create_service_with_state(two_player_game)
        actor = two_player_game.players[0]
        responder = two_player_game.players[1]

        first, second = await asyncio.gather(
            service.process_action(two_player_game.id, actor.id, "income"),
            service.process_action(two_player_game.id, actor.id, "income"),
            return_exceptions=True,
        )

        successes = [result for result in (first, second) if isinstance(result, GameState)]
        failures = [result for result in (first, second) if isinstance(result, Exception)]

        assert len(successes) == 1
        assert len(failures) == 1
        assert isinstance(failures[0], ValueError)
        assert "Not your turn" in str(failures[0])

        final_state = await service.get_game(two_player_game.id)
        assert final_state is not None
        assert final_state.current_turn_player_id == responder.id
        assert final_state.turn_number == 2
        assert actor.coins == 3

    asyncio.run(scenario())


def test_multiple_service_instances_share_live_game_state(two_player_game: GameState) -> None:
    async def scenario() -> None:
        GameService._games.pop(two_player_game.id, None)
        GameService._game_locks.pop(two_player_game.id, None)

        shared_repo = InMemoryGameRepository()
        await shared_repo.create(two_player_game)

        service_one = GameService(GameEngine(), shared_repo)
        service_two = GameService(GameEngine(), shared_repo)

        actor = two_player_game.players[0]
        responder = two_player_game.players[1]

        # Simulate each websocket connection priming its own service view.
        await service_one.get_game(two_player_game.id)
        await service_two.get_game(two_player_game.id)

        state_after_first = await service_one.process_action(two_player_game.id, actor.id, "income")
        assert state_after_first.current_turn_player_id == responder.id

        state_after_second = await service_two.process_action(two_player_game.id, responder.id, "income")

        assert state_after_second.current_turn_player_id == actor.id
        assert state_after_second.turn_number == 3
        assert actor.coins == 3
        assert responder.coins == 3

    asyncio.run(scenario())


def test_assassination_finishes_game_after_last_influence_loss(two_player_game: GameState) -> None:
    async def scenario() -> None:
        service = await _create_service_with_state(two_player_game)
        actor = two_player_game.players[0]
        target = two_player_game.players[1]

        actor.coins = 3
        target.influences[0].revealed = True

        state = await service.process_action(two_player_game.id, actor.id, "assassinate", target.id)
        assert state.phase == GamePhase.CHALLENGE_WINDOW

        state, processed = await service.process_accept(two_player_game.id, target.id)
        assert processed is True
        assert state.phase == GamePhase.BLOCK_WINDOW

        state, processed = await service.process_accept(two_player_game.id, target.id)
        assert processed is True
        assert state.phase == GamePhase.AWAITING_INFLUENCE_LOSS

        state = await service.process_influence_loss(two_player_game.id, target.id, 0)

        assert state.phase == GamePhase.GAME_OVER
        assert state.winner_id == actor.id
        assert target.is_alive is False

    asyncio.run(scenario())


def test_untargeted_allow_waits_for_all_eligible_responses(
    engine: GameEngine,
    monkeypatch,
) -> None:
    async def scenario() -> None:
        monkeypatch.setattr("app.engine.game_engine.random.choice", lambda players: players[0])
        state = engine.create_game("three-player-game")
        state, actor = engine.add_player(state, "Alice")
        state, responder = engine.add_player(state, "Bob")
        state, third_player = engine.add_player(state, "Charlie")
        state = engine.start_game(state)

        service = await _create_service_with_state(state)

        state = await service.process_action(state.id, actor.id, "foreign_aid")
        assert state.phase == GamePhase.BLOCK_WINDOW

        state, processed = await service.process_accept(state.id, third_player.id)

        assert processed is False
        assert state.phase == GamePhase.BLOCK_WINDOW

        state, processed = await service.process_accept(state.id, responder.id)

        assert processed is True
        assert state.phase == GamePhase.TURN_START
        assert state.current_turn_player_id == responder.id
        assert state.turn_number == 2
        assert actor.coins == 4

    asyncio.run(scenario())


def test_targeted_challenge_rejects_uninvolved_player(engine: GameEngine, monkeypatch) -> None:
    async def scenario() -> None:
        monkeypatch.setattr("app.engine.game_engine.random.choice", lambda players: players[0])
        state = engine.create_game("targeted-challenge-game")
        state, actor = engine.add_player(state, "Alice")
        state, target = engine.add_player(state, "Bob")
        state, outsider = engine.add_player(state, "Charlie")
        state = engine.start_game(state)

        service = await _create_service_with_state(state)

        state = await service.process_action(state.id, actor.id, "steal", target.id)
        assert state.phase == GamePhase.CHALLENGE_WINDOW

        try:
            await service.process_challenge(state.id, outsider.id)
            assert False, "Expected uninvolved challenger to be rejected"
        except ValueError as exc:
            assert "cannot challenge" in str(exc).lower()

    asyncio.run(scenario())


def test_delete_game_clears_repository_and_cache(two_player_game: GameState) -> None:
    async def scenario() -> None:
        GameService._games.pop(two_player_game.id, None)
        GameService._game_locks.pop(two_player_game.id, None)

        repo = InMemoryGameRepository()
        await repo.create(two_player_game)
        service = GameService(GameEngine(), repo)
        GameService._games[two_player_game.id] = two_player_game
        GameService._game_locks[two_player_game.id] = asyncio.Lock()

        deleted = await service.delete_game(two_player_game.id)

        assert deleted is True
        assert await repo.get_by_id(two_player_game.id) is None
        assert two_player_game.id not in GameService._games
        assert two_player_game.id not in GameService._game_locks

    asyncio.run(scenario())