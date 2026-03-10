import { ActionType } from '../action/action';
import { Character } from '../card/card';
import { GameStatePublic, GameStatePrivate } from '../game/game';

// --- Client → Server ---

export enum ClientMessageType {
  ACTION = 'action',
  CHALLENGE = 'challenge',
  BLOCK = 'block',
  ACCEPT = 'accept',
  CHOOSE_INFLUENCE = 'choose_influence',
  EXCHANGE_RETURN = 'exchange_return',
}

export interface ClientActionPayload {
  actionType: ActionType;
  targetId?: string;
}

export interface ClientChallengePayload {
  targetPlayerId: string;
}

export interface ClientBlockPayload {
  blockingCharacter: Character;
}

export interface ClientChooseInfluencePayload {
  cardIndex: number;
}

export interface ClientExchangeReturnPayload {
  keepIndices: number[];
}

export interface ClientMessage {
  type: ClientMessageType;
  payload:
    | ClientActionPayload
    | ClientChallengePayload
    | ClientBlockPayload
    | ClientChooseInfluencePayload
    | ClientExchangeReturnPayload
    | Record<string, never>;
}

// --- Server → Client ---

export enum ServerMessageType {
  GAME_STATE = 'game_state',
  PRIVATE_STATE = 'private_state',
  ACTION_DECLARED = 'action_declared',
  CHALLENGE_ISSUED = 'challenge_issued',
  CHALLENGE_RESULT = 'challenge_result',
  BLOCK_DECLARED = 'block_declared',
  BLOCK_CHALLENGE_RESULT = 'block_challenge_result',
  ACTION_RESOLVED = 'action_resolved',
  INFLUENCE_LOST = 'influence_lost',
  PLAYER_ELIMINATED = 'player_eliminated',
  TURN_CHANGED = 'turn_changed',
  GAME_OVER = 'game_over',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  ERROR = 'error',
  EXCHANGE_CARDS = 'exchange_cards',
}

export interface ServerMessage {
  type: ServerMessageType;
  payload: Record<string, unknown>;
  gameState?: GameStatePublic;
  privateState?: GameStatePrivate;
  timestamp: string;
}
