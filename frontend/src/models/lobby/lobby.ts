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
}

export interface LobbyResponse {
  lobby: Lobby;
  playerId: string;
  sessionToken: string | null;
}

/** Host-configurable game settings sent to the backend at game start. */
export interface GameConfig {
  turnTimerSeconds: number;
  challengeWindowSeconds: number;
  blockWindowSeconds: number;
  startingCoins: number;
}
