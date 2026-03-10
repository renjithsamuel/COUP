import { api } from './api';
import { Lobby, LobbyCreate, LobbyJoin, LobbyPlayer, LobbyResponse, GameConfig } from '@/models/lobby';

/* eslint-disable @typescript-eslint/no-explicit-any */
function toLobbyPlayer(raw: any): LobbyPlayer {
  return {
    id: raw.id,
    name: raw.name,
    isHost: raw.is_host,
    isReady: raw.is_ready,
  };
}

function toLobby(raw: any): Lobby {
  return {
    id: raw.id,
    name: raw.name ?? '',
    players: raw.players.map(toLobbyPlayer),
    maxPlayers: raw.max_players,
    status: raw.status,
    gameId: raw.game_id ?? null,
    playerCount: raw.player_count,
  };
}

function toCreateResponse(raw: any): LobbyResponse {
  const lobby = toLobby(raw);
  const host = lobby.players.find((p) => p.isHost);
  return { lobby, playerId: host?.id ?? lobby.players[0]?.id ?? '', sessionToken: raw.session_token ?? null };
}

function toJoinResponse(raw: any): LobbyResponse {
  const lobby = toLobby(raw);
  // The newly joined player is the last one in the list
  const playerId = lobby.players[lobby.players.length - 1]?.id ?? '';
  return { lobby, playerId, sessionToken: raw.session_token ?? null };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const lobbyService = {
  list: () => api.get<any[]>('/api/lobbies').then((arr) => arr.map(toLobby)),

  get: (lobbyId: string) => api.get<any>(`/api/lobbies/${lobbyId}`).then(toLobby),

  create: (data: LobbyCreate) =>
    api.post<any>('/api/lobbies', {
      host_name: data.playerName,
      name: data.name,
      max_players: data.maxPlayers,
    }).then(toCreateResponse),

  join: (lobbyId: string, data: LobbyJoin) =>
    api.post<any>(`/api/lobbies/${lobbyId}/join`, {
      player_name: data.playerName,
    }).then(toJoinResponse),

  leave: (lobbyId: string, playerId: string) =>
    api.post<void>(`/api/lobbies/${lobbyId}/leave?player_id=${encodeURIComponent(playerId)}`),

  start: (lobbyId: string, config?: GameConfig) =>
    api.post<{ game_id: string }>(`/api/lobbies/${lobbyId}/start`, config ? {
      turn_timer_seconds: config.turnTimerSeconds,
      challenge_window_seconds: config.challengeWindowSeconds,
      block_window_seconds: config.blockWindowSeconds,
      starting_coins: config.startingCoins,
    } : undefined),
};
