import React, { createContext, useContext, useReducer, useMemo } from "react";
import { Lobby, LobbyPlayer } from "@/models/lobby";

// ─── State ───────────────────────────────────────────────────────────
export interface LobbyContextState {
  lobby: Lobby | null;
  myPlayerId: string | null;
  lobbies: Lobby[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LobbyContextState = {
  lobby: null,
  myPlayerId: null,
  lobbies: [],
  isLoading: false,
  error: null,
};

// ─── Actions ─────────────────────────────────────────────────────────
type LobbyAction =
  | { type: "SET_LOBBY"; payload: Lobby }
  | { type: "SET_MY_PLAYER_ID"; payload: string }
  | { type: "CLEAR_MY_PLAYER_ID" }
  | { type: "SET_LOBBIES"; payload: Lobby[] }
  | { type: "PLAYER_JOINED"; payload: LobbyPlayer }
  | { type: "PLAYER_LEFT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOBBY_STARTED" }
  | { type: "LEAVE_LOBBY" }
  | { type: "RESET" };

// ─── Reducer ─────────────────────────────────────────────────────────
function lobbyReducer(
  state: LobbyContextState,
  action: LobbyAction,
): LobbyContextState {
  switch (action.type) {
    case "SET_LOBBY":
      return { ...state, lobby: action.payload, error: null };
    case "SET_MY_PLAYER_ID":
      return { ...state, myPlayerId: action.payload };
    case "CLEAR_MY_PLAYER_ID":
      return { ...state, myPlayerId: null };
    case "SET_LOBBIES":
      return { ...state, lobbies: action.payload, isLoading: false };
    case "PLAYER_JOINED":
      if (!state.lobby) return state;
      return {
        ...state,
        lobby: {
          ...state.lobby,
          players: [...state.lobby.players, action.payload],
        },
      };
    case "PLAYER_LEFT":
      if (!state.lobby) return state;
      return {
        ...state,
        lobby: {
          ...state.lobby,
          players: state.lobby.players.filter((p) => p.id !== action.payload),
        },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "LOBBY_STARTED":
      if (!state.lobby) return state;
      return { ...state, lobby: { ...state.lobby, status: "in_progress" } };
    case "LEAVE_LOBBY":
      return { ...state, lobby: null, myPlayerId: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────
interface LobbyContextValue {
  state: LobbyContextState;
  dispatch: React.Dispatch<LobbyAction>;
  isHost: boolean;
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────
export function LobbyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(lobbyReducer, initialState);

  const isHost = useMemo(
    () =>
      !!state.myPlayerId &&
      !!state.lobby?.players.some((p) => p.isHost && p.id === state.myPlayerId),
    [state.lobby?.players, state.myPlayerId],
  );

  const value = useMemo(
    () => ({ state, dispatch, isHost }),
    [state, dispatch, isHost],
  );

  return (
    <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useLobbyContext() {
  const ctx = useContext(LobbyContext);
  if (!ctx)
    throw new Error("useLobbyContext must be used within <LobbyProvider>");
  return ctx;
}
