import { ActionType } from '../action/action';
import { Character } from '../card/card';
import { mockGameStatePlaying, mockGameStatePrivate } from '../game/game.mock';
import {
  ClientMessage,
  ClientMessageType,
  ServerMessage,
  ServerMessageType,
} from './websocket-message';

export const mockClientActionMessage: ClientMessage = {
  type: ClientMessageType.ACTION,
  payload: { actionType: ActionType.TAX },
};

export const mockClientChallengeMessage: ClientMessage = {
  type: ClientMessageType.CHALLENGE,
  payload: { targetPlayerId: 'player-1' },
};

export const mockClientBlockMessage: ClientMessage = {
  type: ClientMessageType.BLOCK,
  payload: { blockingCharacter: Character.CONTESSA },
};

export const mockClientAcceptMessage: ClientMessage = {
  type: ClientMessageType.ACCEPT,
  payload: {},
};

export const mockClientChooseInfluenceMessage: ClientMessage = {
  type: ClientMessageType.CHOOSE_INFLUENCE,
  payload: { cardIndex: 0 },
};

export const mockClientExchangeReturnMessage: ClientMessage = {
  type: ClientMessageType.EXCHANGE_RETURN,
  payload: { keepIndices: [0, 1] },
};

const now = new Date().toISOString();

export const mockServerGameStateMessage: ServerMessage = {
  type: ServerMessageType.GAME_STATE,
  payload: {},
  gameState: mockGameStatePlaying,
  timestamp: now,
};

export const mockServerPrivateStateMessage: ServerMessage = {
  type: ServerMessageType.PRIVATE_STATE,
  payload: {},
  privateState: mockGameStatePrivate,
  timestamp: now,
};

export const mockServerActionDeclaredMessage: ServerMessage = {
  type: ServerMessageType.ACTION_DECLARED,
  payload: {
    actorId: 'player-1',
    actorName: 'Alice',
    actionType: ActionType.TAX,
  },
  gameState: mockGameStatePlaying,
  timestamp: now,
};

export const mockServerErrorMessage: ServerMessage = {
  type: ServerMessageType.ERROR,
  payload: { message: 'Not your turn' },
  timestamp: now,
};

export const mockServerGameOverMessage: ServerMessage = {
  type: ServerMessageType.GAME_OVER,
  payload: { winnerId: 'player-1', winnerName: 'Alice' },
  timestamp: now,
};
