"""WebSocket game handler — processes incoming messages and dispatches responses."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from app.models.game import GamePhase
from app.models.websocket_message import ClientMessage, ClientMessageType, ServerMessageType
from app.services.game_service import GameService
from app.ws.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)


class GameWSHandler:
    """Handles WebSocket messages for a game session."""

    def __init__(
        self, connection_manager: ConnectionManager, game_service: GameService
    ) -> None:
        self._cm = connection_manager
        self._gs = game_service

    async def handle_connection(
        self,
        websocket: WebSocket,
        game_id: str,
        player_id: str,
    ) -> None:
        """Main WebSocket loop for a player connection."""
        await self._cm.connect(websocket, game_id, player_id)

        try:
            # Send initial game state
            await self._send_game_state(game_id, player_id)

            # Broadcast connection event
            await self._cm.broadcast_to_game(
                game_id,
                {"type": ServerMessageType.PLAYER_CONNECTED.value, "payload": {"playerId": player_id}},
                exclude=player_id,
            )

            # Message loop
            while True:
                raw = await websocket.receive_text()
                await self._process_message(game_id, player_id, raw)

        except WebSocketDisconnect:
            logger.info(f"Player {player_id} disconnected from game {game_id}")
        except Exception as e:
            logger.error(f"Error in WS handler: {e}")
        finally:
            self._cm.disconnect(game_id, player_id)
            await self._cm.broadcast_to_game(
                game_id,
                {"type": ServerMessageType.PLAYER_DISCONNECTED.value, "payload": {"playerId": player_id}},
            )
            # Auto-accept on behalf of disconnected player if in a response window
            await self._handle_disconnect_accept(game_id, player_id)

    async def _process_message(
        self, game_id: str, player_id: str, raw: str
    ) -> None:
        """Parse and dispatch a client message."""
        try:
            data = json.loads(raw)
            msg = ClientMessage.model_validate(data, strict=False)
        except Exception as e:
            await self._send_error(game_id, player_id, f"Invalid message: {e}")
            return

        try:
            handler = self._get_handler(msg.type)
            await handler(game_id, player_id, msg.payload)
        except ValueError as e:
            error_msg = str(e)
            if self._is_stale_phase_error(error_msg):
                logger.debug(
                    "Ignoring stale %s from player %s: %s", msg.type, player_id, error_msg
                )
                return
            await self._send_error(game_id, player_id, error_msg)
        except Exception as e:
            logger.error(f"Error processing {msg.type}: {e}")
            await self._send_error(game_id, player_id, "Internal error")

    def _get_handler(self, msg_type: ClientMessageType):
        handlers = {
            ClientMessageType.ACTION: self._handle_action,
            ClientMessageType.CHALLENGE: self._handle_challenge,
            ClientMessageType.BLOCK: self._handle_block,
            ClientMessageType.ACCEPT: self._handle_accept,
            ClientMessageType.CHOOSE_INFLUENCE: self._handle_choose_influence,
            ClientMessageType.EXCHANGE_RETURN: self._handle_exchange_return,
        }
        handler = handlers.get(msg_type)
        if handler is None:
            raise ValueError(f"Unknown message type: {msg_type}")
        return handler

    async def _handle_action(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        action_type = payload.get("action")
        target_id = payload.get("targetId")
        if not action_type:
            raise ValueError("Missing 'action' in payload")

        state = await self._gs.process_action(game_id, player_id, action_type, target_id)

        actor = state.get_player(player_id)
        target = state.get_player(target_id) if target_id else None
        await self._cm.broadcast_to_game(game_id, {
            "type": ServerMessageType.ACTION_DECLARED.value,
            "payload": {
                "actorId": player_id,
                "actorName": actor.name if actor else "",
                "actionType": action_type,
                "targetId": target_id or "",
                "targetName": target.name if target else "",
            },
        })
        await self._broadcast_phase_event(game_id, state)
        await self._broadcast_state(game_id)

    async def _handle_challenge(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        state, challenger_won = await self._gs.process_challenge(game_id, player_id)

        challenger = state.get_player(player_id)
        # Broadcast challenge result
        await self._cm.broadcast_to_game(game_id, {
            "type": ServerMessageType.CHALLENGE_RESULT.value,
            "payload": {
                "challengerId": player_id,
                "challengerName": challenger.name if challenger else "",
                "challengerWon": challenger_won,
                "success": challenger_won,
            },
        })
        await self._broadcast_state(game_id)

    async def _handle_block(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        blocking_character = payload.get("blockingCharacter")
        if not blocking_character:
            raise ValueError("Missing 'blockingCharacter' in payload")

        state = await self._gs.process_block(game_id, player_id, blocking_character)

        blocker = state.get_player(player_id)
        await self._cm.broadcast_to_game(game_id, {
            "type": ServerMessageType.BLOCK_DECLARED.value,
            "payload": {
                "blockerId": player_id,
                "blockerName": blocker.name if blocker else "",
                "blockingCharacter": blocking_character,
                "character": blocking_character,
            },
        })
        await self._broadcast_state(game_id)

    async def _handle_accept(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        state, processed = await self._gs.process_accept(game_id, player_id)
        if not processed:
            # Partial accept (not all players responded yet) — broadcast updated state
            # so other clients can see who has accepted
            await self._broadcast_state(game_id)
            return
        await self._broadcast_phase_event(game_id, state)
        await self._broadcast_state(game_id)

    async def _handle_choose_influence(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        card_index = payload.get("cardIndex")
        if card_index is None:
            raise ValueError("Missing 'cardIndex' in payload")

        # Capture revealed card info before processing
        pre_state = await self._gs.get_game(game_id)
        player_before = pre_state.get_player(player_id) if pre_state else None
        alive_before = [c for c in player_before.influences if not c.revealed] if player_before else []
        lost_character = alive_before[int(card_index)].character if 0 <= int(card_index) < len(alive_before) else ""

        state = await self._gs.process_influence_loss(game_id, player_id, int(card_index))

        loser = state.get_player(player_id)
        await self._cm.broadcast_to_game(game_id, {
            "type": ServerMessageType.INFLUENCE_LOST.value,
            "payload": {
                "playerId": player_id,
                "playerName": loser.name if loser else "",
                "character": lost_character,
            },
        })

        # Check if eliminated
        if loser and not loser.is_alive:
            await self._cm.broadcast_to_game(game_id, {
                "type": ServerMessageType.PLAYER_ELIMINATED.value,
                "payload": {
                    "playerId": player_id,
                    "playerName": loser.name if loser else "",
                },
            })
        await self._broadcast_phase_event(game_id, state)
        await self._broadcast_state(game_id)

    async def _handle_exchange_return(
        self, game_id: str, player_id: str, payload: dict[str, Any]
    ) -> None:
        keep_indices = payload.get("keepIndices")
        if keep_indices is None:
            raise ValueError("Missing 'keepIndices' in payload")

        state = await self._gs.process_exchange_return(
            game_id, player_id, [int(i) for i in keep_indices]
        )
        await self._broadcast_phase_event(game_id, state)
        await self._broadcast_state(game_id)

    async def _send_game_state(self, game_id: str, player_id: str) -> None:
        state = await self._gs.get_game(game_id)
        if state is None:
            return
        public = self._gs.get_public_state(state, player_id)
        await self._cm.send_to_player(game_id, player_id, {
            "type": ServerMessageType.GAME_STATE.value,
            "payload": json.loads(public.model_dump_json()),
        })

    async def _broadcast_state(self, game_id: str) -> None:
        """Send personalized state to each player."""
        state = await self._gs.get_game(game_id)
        if state is None:
            return

        async def send_to_each():
            for pid in self._cm.get_connected_players(game_id):
                public = self._gs.get_public_state(state, pid)
                await self._cm.send_to_player(game_id, pid, {
                    "type": ServerMessageType.GAME_STATE.value,
                    "payload": json.loads(public.model_dump_json()),
                })

        await send_to_each()

    async def _send_error(
        self, game_id: str, player_id: str, message: str
    ) -> None:
        await self._cm.send_to_player(game_id, player_id, {
            "type": ServerMessageType.ERROR.value,
            "payload": {"message": message},
        })

    @staticmethod
    def _is_stale_phase_error(error_msg: str) -> bool:
        """Detect phase-mismatch errors caused by multiplayer race conditions."""
        stale_patterns = (
            "Not your turn",
            "Cannot accept in phase",
            "Cannot challenge in current phase",
            "Cannot block in current phase",
            "Cannot take action in current phase",
            "Not in a challenge window phase",
            "Not in block window phase",
        )
        return any(p in error_msg for p in stale_patterns)

    async def _handle_disconnect_accept(
        self, game_id: str, player_id: str
    ) -> None:
        """Auto-accept on behalf of a disconnected player during response windows."""
        try:
            state = await self._gs.get_game(game_id)
            if state is None or state.pending_action is None:
                return
            if state.phase not in (
                GamePhase.CHALLENGE_WINDOW,
                GamePhase.BLOCK_WINDOW,
                GamePhase.BLOCK_CHALLENGE_WINDOW,
            ):
                return

            state, processed = await self._gs.process_accept(game_id, player_id)
            if processed:
                await self._broadcast_phase_event(game_id, state)
                await self._broadcast_state(game_id)
        except Exception as e:
            logger.debug("Error handling disconnect accept for %s: %s", player_id, e)

    async def _broadcast_phase_event(self, game_id: str, state) -> None:
        """Broadcast turn/game boundary events after service-side state transitions."""
        if state.phase == GamePhase.TURN_START:
            current_player = state.get_player(state.current_turn_player_id) if state.current_turn_player_id else None
            await self._cm.broadcast_to_game(game_id, {
                "type": ServerMessageType.TURN_CHANGED.value,
                "payload": {
                    "turnNumber": state.turn_number,
                    "playerId": state.current_turn_player_id or "",
                    "playerName": current_player.name if current_player else "",
                },
            })
        elif state.phase == GamePhase.GAME_OVER:
            winner = state.get_player(state.winner_id) if state.winner_id else None
            await self._cm.broadcast_to_game(game_id, {
                "type": ServerMessageType.GAME_OVER.value,
                "payload": {
                    "winnerId": state.winner_id or "",
                    "winnerName": winner.name if winner else "",
                },
            })
