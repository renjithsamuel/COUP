import { Character } from "../card/card";
import { ActionType } from "../action/action";
import {
  GameConfigState,
  GamePhase,
  GameStatus,
  GameStatePublic,
  GameStatePrivate,
  PendingAction,
} from "./game";

const mockConfig: GameConfigState = {
  turnTimerSeconds: 30,
  challengeWindowSeconds: 10,
  blockWindowSeconds: 10,
  startingCoins: 2,
};

export const mockPendingAction: PendingAction = {
  actorId: "player-1",
  actionType: ActionType.TAX,
  targetId: null,
  blockerId: null,
  blockerCharacter: null,
  acceptedBy: [],
};

export const mockPendingAssassinate: PendingAction = {
  actorId: "player-1",
  actionType: ActionType.ASSASSINATE,
  targetId: "player-2",
  blockerId: null,
  blockerCharacter: null,
  acceptedBy: [],
};

export const mockGameStateWaiting: GameStatePublic = {
  gameId: "game-abc123",
  status: GameStatus.WAITING,
  phase: GamePhase.WAITING_FOR_PLAYERS,
  config: mockConfig,
  players: [
    {
      id: "player-1",
      name: "Alice",
      coins: 2,
      influenceCount: 2,
      revealedCards: [],
      showdownCards: [],
      isAlive: true,
    },
    {
      id: "player-2",
      name: "Bob",
      coins: 2,
      influenceCount: 2,
      revealedCards: [],
      showdownCards: [],
      isAlive: true,
    },
  ],
  currentPlayerId: null,
  pendingAction: null,
  phaseStartedAt: null,
  phaseDeadlineAt: null,
  awaitingInfluenceLossFrom: null,
  turnNumber: 0,
  winnerId: null,
  deckSize: 11,
};

export const mockGameStatePlaying: GameStatePublic = {
  gameId: "game-abc123",
  status: GameStatus.IN_PROGRESS,
  phase: GamePhase.TURN_START,
  config: mockConfig,
  players: [
    {
      id: "player-1",
      name: "Alice",
      coins: 2,
      influenceCount: 2,
      revealedCards: [],
      showdownCards: [],
      isAlive: true,
    },
    {
      id: "player-2",
      name: "Bob",
      coins: 2,
      influenceCount: 2,
      revealedCards: [],
      showdownCards: [],
      isAlive: true,
    },
    {
      id: "player-3",
      name: "Charlie",
      coins: 5,
      influenceCount: 2,
      revealedCards: [],
      showdownCards: [],
      isAlive: true,
    },
  ],
  currentPlayerId: "player-1",
  pendingAction: null,
  phaseStartedAt: "2026-03-14T10:00:00+00:00",
  phaseDeadlineAt: "2026-03-14T10:00:30+00:00",
  awaitingInfluenceLossFrom: null,
  turnNumber: 1,
  winnerId: null,
  deckSize: 9,
};

export const mockGameStateChallengeWindow: GameStatePublic = {
  ...mockGameStatePlaying,
  phase: GamePhase.CHALLENGE_WINDOW,
  pendingAction: mockPendingAction,
};

export const mockGameStateOver: GameStatePublic = {
  gameId: "game-abc123",
  status: GameStatus.FINISHED,
  phase: GamePhase.GAME_OVER,
  config: mockConfig,
  players: [
    {
      id: "player-1",
      name: "Alice",
      coins: 8,
      influenceCount: 1,
      revealedCards: [{ character: Character.DUKE, isRevealed: true }],
      showdownCards: [{ character: Character.CAPTAIN, isRevealed: false }],
      isAlive: true,
    },
    {
      id: "player-2",
      name: "Bob",
      coins: 0,
      influenceCount: 0,
      revealedCards: [
        { character: Character.ASSASSIN, isRevealed: true },
        { character: Character.CONTESSA, isRevealed: true },
      ],
      showdownCards: [],
      isAlive: false,
    },
  ],
  currentPlayerId: null,
  pendingAction: null,
  phaseStartedAt: null,
  phaseDeadlineAt: null,
  awaitingInfluenceLossFrom: null,
  turnNumber: 12,
  winnerId: "player-1",
  deckSize: 11,
};

export const mockGameStatePrivate: GameStatePrivate = {
  ...mockGameStatePlaying,
  myCards: [
    { character: Character.DUKE, isRevealed: false },
    { character: Character.CAPTAIN, isRevealed: false },
  ],
  exchangeCards: [],
};
