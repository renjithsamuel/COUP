import { PlayerPublic } from '../player/player';
import { ActionType } from '../action/action';
import { Card } from '../card/card';

export enum GamePhase {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  TURN_START = 'turn_start',
  ACTION_DECLARED = 'action_declared',
  CHALLENGE_WINDOW = 'challenge_window',
  RESOLVING_CHALLENGE = 'resolving_challenge',
  BLOCK_WINDOW = 'block_window',
  BLOCK_DECLARED = 'block_declared',
  BLOCK_CHALLENGE_WINDOW = 'block_challenge_window',
  RESOLVING_BLOCK_CHALLENGE = 'resolving_block_challenge',
  ACTION_RESOLVING = 'action_resolving',
  AWAITING_INFLUENCE_LOSS = 'awaiting_influence_loss',
  AWAITING_EXCHANGE = 'awaiting_exchange',
  TURN_END = 'turn_end',
  GAME_OVER = 'game_over',
}

export enum GameStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export interface PendingAction {
  actorId: string;
  actionType: ActionType;
  targetId: string | null;
  blockerId: string | null;
  blockerCharacter: string | null;
  acceptedBy: string[];
}

export interface GameConfigState {
  turnTimerSeconds: number;
  challengeWindowSeconds: number;
  blockWindowSeconds: number;
  startingCoins: number;
}

export interface GameStatePublic {
  gameId: string;
  status: GameStatus;
  phase: GamePhase;
  config: GameConfigState;
  players: PlayerPublic[];
  currentPlayerId: string | null;
  pendingAction: PendingAction | null;
  phaseStartedAt: string | null;
  phaseDeadlineAt: string | null;
  awaitingInfluenceLossFrom: string | null;
  turnNumber: number;
  winnerId: string | null;
  deckSize: number;
}

/** Full game state — only used for the current player's private view */
export interface GameStatePrivate extends GameStatePublic {
  myCards: Card[];
  exchangeCards: Card[];
}
