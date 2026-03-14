export interface LobbyPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Lobby {
  id: string;
  name: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  status: string;
  gameId: string | null;
  playerCount: number;
}

export interface LobbyCreate {
  name: string;
  playerName: string;
  maxPlayers: number;
}

export interface LobbyJoin {
  playerName: string;
  sessionToken?: string | null;
}

export interface LobbyResponse {
  lobby: Lobby;
  playerId: string | null;
  sessionToken: string | null;
}

export type AiDifficulty = "easy" | "medium" | "hard";

export interface AiMatchCreate {
  playerName: string;
  botCount: number;
  difficulty: AiDifficulty;
  config?: GameConfig;
}

export interface AiMatchResponse {
  ok: boolean;
  gameId: string;
  playerId: string;
}

export interface LeaderboardEntry {
  playerName: string;
  playerKey: string;
  wins: number;
  gamesPlayed: number;
  winRate: number;
  score: number;
}

/** Host-configurable game settings sent to the backend at game start. */
export interface GameConfig {
  turnTimerSeconds: number;
  challengeWindowSeconds: number;
  blockWindowSeconds: number;
  startingCoins: number;
}
