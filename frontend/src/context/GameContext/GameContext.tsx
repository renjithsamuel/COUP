import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  GameStatePublic,
  GameStatePrivate,
  GamePhase,
  GameStatus,
} from '@/models/game';
import { Card } from '@/models/card';

// ─── State ───────────────────────────────────────────────────────────
export interface GameContextState {
  gameState: GameStatePublic | null;
  myCards: Card[];
  exchangeCards: Card[];
  myPlayerId: string | null;
  gameLog: GameLogEntry[];
}

export interface GameLogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'action' | 'challenge' | 'block' | 'reveal' | 'elimination' | 'system' | 'turn';
}

const initialState: GameContextState = {
  gameState: null,
  myCards: [],
  exchangeCards: [],
  myPlayerId: null,
  gameLog: [],
};

// ─── Actions ─────────────────────────────────────────────────────────
type GameAction =
  | { type: 'SET_GAME_STATE'; payload: GameStatePublic }
  | { type: 'SET_PRIVATE_STATE'; payload: { myCards: Card[]; exchangeCards: Card[] } }
  | { type: 'SET_MY_PLAYER_ID'; payload: string }
  | { type: 'UPDATE_TURN'; payload: { currentPlayerId: string; turnNumber: number } }
  | { type: 'ADD_LOG'; payload: Omit<GameLogEntry, 'id' | 'timestamp'> }
  | { type: 'CLEAR_LOG' }
  | { type: 'RESET' };

// ─── Reducer ─────────────────────────────────────────────────────────
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return { ...state, gameState: action.payload };
    case 'SET_PRIVATE_STATE':
      return {
        ...state,
        myCards: action.payload.myCards,
        exchangeCards: action.payload.exchangeCards,
      };
    case 'SET_MY_PLAYER_ID':
      return { ...state, myPlayerId: action.payload };
    case 'UPDATE_TURN':
      if (state.gameState == null) {
        return state;
      }
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentPlayerId: action.payload.currentPlayerId,
          turnNumber: action.payload.turnNumber,
          phase: GamePhase.TURN_START,
          pendingAction: null,
          awaitingInfluenceLossFrom: null,
        },
      };
    case 'ADD_LOG':
      return {
        ...state,
        gameLog: [
          ...state.gameLog,
          {
            ...action.payload,
            id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
          },
        ],
      };
    case 'CLEAR_LOG':
      return { ...state, gameLog: [] };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────
interface GameContextValue {
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
  // Derived helpers
  isMyTurn: boolean;
  amIAlive: boolean;
  currentPhase: GamePhase | null;
}

const GameContext = createContext<GameContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const isMyTurn = useMemo(
    () =>
      state.gameState?.currentPlayerId != null &&
      state.gameState.currentPlayerId === state.myPlayerId,
    [state.gameState?.currentPlayerId, state.myPlayerId],
  );

  const amIAlive = useMemo(() => {
    if (!state.gameState || !state.myPlayerId) return false;
    const me = state.gameState.players.find((p) => p.id === state.myPlayerId);
    return me?.isAlive ?? false;
  }, [state.gameState, state.myPlayerId]);

  const currentPhase = state.gameState?.phase ?? null;

  const value = useMemo(
    () => ({ state, dispatch, isMyTurn, amIAlive, currentPhase }),
    [state, dispatch, isMyTurn, amIAlive, currentPhase],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within <GameProvider>');
  return ctx;
}
