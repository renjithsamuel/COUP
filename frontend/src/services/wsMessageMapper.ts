/**
 * Maps raw snake_case WebSocket messages from the backend to typed camelCase frontend models.
 * Follows the same pattern as lobbyService.ts for REST response mapping.
 */

import { ServerMessage, ServerMessageType } from "@/models/websocket-message";
import {
  GameStatePublic,
  GameStatePrivate,
  GameConfigState,
  PendingAction,
} from "@/models/game";
import { PlayerPublic } from "@/models/player";
import { Card, Character } from "@/models/card";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Map backend UPPER_CASE message types to frontend lowercase enum values */
const MESSAGE_TYPE_MAP: Record<string, ServerMessageType> = {
  GAME_STATE: ServerMessageType.GAME_STATE,
  PRIVATE_STATE: ServerMessageType.PRIVATE_STATE,
  ACTION_DECLARED: ServerMessageType.ACTION_DECLARED,
  CHALLENGE_ISSUED: ServerMessageType.CHALLENGE_ISSUED,
  CHALLENGE_RESULT: ServerMessageType.CHALLENGE_RESULT,
  BLOCK_DECLARED: ServerMessageType.BLOCK_DECLARED,
  BLOCK_CHALLENGE_RESULT: ServerMessageType.BLOCK_CHALLENGE_RESULT,
  ACTION_RESOLVED: ServerMessageType.ACTION_RESOLVED,
  INFLUENCE_LOST: ServerMessageType.INFLUENCE_LOST,
  PLAYER_ELIMINATED: ServerMessageType.PLAYER_ELIMINATED,
  TURN_CHANGED: ServerMessageType.TURN_CHANGED,
  GAME_OVER: ServerMessageType.GAME_OVER,
  PLAYER_JOINED: ServerMessageType.PLAYER_JOINED,
  PLAYER_LEFT: ServerMessageType.PLAYER_LEFT,
  RETURN_TO_LOBBY: ServerMessageType.RETURN_TO_LOBBY,
  ERROR: ServerMessageType.ERROR,
  EXCHANGE_CARDS: ServerMessageType.EXCHANGE_CARDS,
  PLAYER_CONNECTED: ServerMessageType.PLAYER_JOINED,
  PLAYER_DISCONNECTED: ServerMessageType.PLAYER_LEFT,
  CHALLENGE_WINDOW_OPEN: ServerMessageType.GAME_STATE,
  BLOCK_WINDOW_OPEN: ServerMessageType.GAME_STATE,
  EXCHANGE_STARTED: ServerMessageType.EXCHANGE_CARDS,
};

function toCard(raw: any): Card {
  return {
    character: (raw.character ?? raw) as Character,
    isRevealed: raw.revealed ?? raw.is_revealed ?? false,
  };
}

function toPlayerPublic(raw: any): PlayerPublic {
  return {
    id: raw.id,
    name: raw.name,
    coins: raw.coins,
    influenceCount: raw.influence_count ?? raw.influenceCount ?? 0,
    revealedCards: (raw.revealed_characters ?? raw.revealedCards ?? []).map(
      (c: any) =>
        typeof c === "string"
          ? { character: c as Character, isRevealed: true }
          : toCard(c),
    ),
    isAlive: raw.is_alive ?? raw.isAlive ?? true,
    connected: raw.connected ?? true,
  };
}

function toPendingAction(raw: any): PendingAction | null {
  if (!raw) return null;
  return {
    actorId: raw.player_id ?? raw.actorId ?? "",
    actionType: raw.action_type ?? raw.actionType ?? "",
    targetId: raw.target_id ?? raw.targetId ?? null,
    blockerId: raw.blocked_by ?? raw.blockerId ?? null,
    blockerCharacter: raw.blocking_character ?? raw.blockerCharacter ?? null,
    acceptedBy: raw.accepted_by ?? raw.acceptedBy ?? [],
  };
}

function toGameConfigState(raw: any): GameConfigState {
  return {
    turnTimerSeconds: raw?.turn_timer_seconds ?? raw?.turnTimerSeconds ?? 30,
    challengeWindowSeconds:
      raw?.challenge_window_seconds ?? raw?.challengeWindowSeconds ?? 10,
    blockWindowSeconds:
      raw?.block_window_seconds ?? raw?.blockWindowSeconds ?? 10,
    startingCoins: raw?.starting_coins ?? raw?.startingCoins ?? 2,
  };
}

function toGameStatePublic(raw: any): GameStatePublic {
  return {
    gameId: raw.id ?? raw.gameId ?? raw.game_id ?? "",
    status: raw.status,
    phase: raw.phase ?? raw.state_phase ?? "",
    config: toGameConfigState(raw.config),
    players: (raw.players ?? []).map(toPlayerPublic),
    currentPlayerId: raw.current_turn_player_id ?? raw.currentPlayerId ?? null,
    pendingAction: toPendingAction(raw.pending_action ?? raw.pendingAction),
    phaseStartedAt: raw.phase_started_at ?? raw.phaseStartedAt ?? null,
    phaseDeadlineAt: raw.phase_deadline_at ?? raw.phaseDeadlineAt ?? null,
    awaitingInfluenceLossFrom:
      raw.awaiting_influence_loss_from ?? raw.awaitingInfluenceLossFrom ?? null,
    turnNumber: raw.turn_number ?? raw.turnNumber ?? 0,
    winnerId: raw.winner_id ?? raw.winnerId ?? null,
    deckSize: raw.deck_count ?? raw.deckSize ?? 0,
  };
}

function toGameStatePrivate(raw: any): GameStatePrivate {
  const pub = toGameStatePublic(raw);
  return {
    ...pub,
    myCards: (raw.your_cards ?? raw.myCards ?? raw.my_cards ?? []).map(toCard),
    exchangeCards: (raw.exchange_cards ?? raw.exchangeCards ?? []).map(toCard),
  };
}

function toLobbyGameConfig(raw: any) {
  if (!raw) {
    return undefined;
  }

  return {
    turnTimerSeconds: raw.turn_timer_seconds ?? raw.turnTimerSeconds ?? 30,
    challengeWindowSeconds:
      raw.challenge_window_seconds ?? raw.challengeWindowSeconds ?? 10,
    blockWindowSeconds:
      raw.block_window_seconds ?? raw.blockWindowSeconds ?? 10,
    startingCoins: raw.starting_coins ?? raw.startingCoins ?? 2,
  };
}

function mapPayload(type: ServerMessageType, raw: any): Record<string, unknown> {
  if (type === ServerMessageType.RETURN_TO_LOBBY) {
    return {
      lobbyId: raw?.lobby_id ?? raw?.lobbyId ?? "",
      config: toLobbyGameConfig(raw?.config),
    };
  }

  return raw ?? {};
}

/** Convert a raw JSON WebSocket message from the backend into a typed ServerMessage. */
export function mapServerMessage(raw: any): ServerMessage {
  const backendType: string = raw.type ?? "";
  const type =
    MESSAGE_TYPE_MAP[backendType] ??
    (backendType.toLowerCase() as ServerMessageType);
  const payload = mapPayload(type, raw.payload ?? {});

  // For GAME_STATE messages the payload IS the game state
  let gameState: GameStatePublic | undefined;
  let privateState: GameStatePrivate | undefined;

  if (
    backendType === "GAME_STATE" ||
    backendType === "CHALLENGE_WINDOW_OPEN" ||
    backendType === "BLOCK_WINDOW_OPEN"
  ) {
    // The payload contains the game state with your_cards → treat as private
    if (payload.your_cards || payload.myCards) {
      privateState = toGameStatePrivate(payload);
      gameState = toGameStatePublic(payload);
    } else {
      gameState = toGameStatePublic(payload);
    }
  }

  return {
    type,
    payload,
    gameState,
    privateState,
    timestamp: raw.timestamp ?? new Date().toISOString(),
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
