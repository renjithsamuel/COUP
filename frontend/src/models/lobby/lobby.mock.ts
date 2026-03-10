import { Lobby, LobbyPlayer, LobbyResponse, LobbyCreate, LobbyJoin } from './lobby';

export const mockLobbyPlayer1: LobbyPlayer = {
  id: 'player-1',
  name: 'Alice',
  isHost: true,
  isReady: true,
};

export const mockLobbyPlayer2: LobbyPlayer = {
  id: 'player-2',
  name: 'Bob',
  isHost: false,
  isReady: false,
};

export const mockLobbyPlayer3: LobbyPlayer = {
  id: 'player-3',
  name: 'Charlie',
  isHost: false,
  isReady: true,
};

export const mockLobby: Lobby = {
  id: 'lobby-xyz789',
  name: "Alice's lobby",
  players: [mockLobbyPlayer1, mockLobbyPlayer2],
  maxPlayers: 6,
  status: 'waiting',
  gameId: null,
  playerCount: 2,
};

export const mockFullLobby: Lobby = {
  ...mockLobby,
  players: [mockLobbyPlayer1, mockLobbyPlayer2, mockLobbyPlayer3],
  playerCount: 3,
};

export const mockLobbyResponse: LobbyResponse = {
  lobby: mockLobby,
  playerId: 'player-1',
  sessionToken: 'mock-token',
};

export const mockLobbyCreate: LobbyCreate = {
  name: 'Coup Night',
  playerName: 'Alice',
  maxPlayers: 6,
};

export const mockLobbyJoin: LobbyJoin = {
  playerName: 'Bob',
};
