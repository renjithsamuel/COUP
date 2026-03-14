import { api } from './api';
import { GameConfig, LeaderboardEntry, Lobby, LobbyCreate, LobbyJoin, LobbyPlayer, LobbyResponse } from '@/models/lobby';

export interface StoredLobbySession {
  lobbyId: string;
  playerId: string;
  sessionToken: string;
}

export interface StoredPlayerIdentity {
  profileId: string;
}

const lobbySessionKey = (lobbyId: string) => `coup:lobby-session:${lobbyId.toUpperCase()}`;
const playerIdentityKey = 'coup:player-identity';

const createProfileId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `profile-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

export const playerIdentityStore = {
  getOrCreate(): StoredPlayerIdentity {
    if (typeof window === 'undefined') {
      return { profileId: 'server-profile' };
    }

    const existing = window.localStorage.getItem(playerIdentityKey);
    if (existing) {
      try {
        return JSON.parse(existing) as StoredPlayerIdentity;
      } catch {
        window.localStorage.removeItem(playerIdentityKey);
      }
    }

    const created = { profileId: createProfileId() } satisfies StoredPlayerIdentity;
    window.localStorage.setItem(playerIdentityKey, JSON.stringify(created));
    return created;
  },
};

export const lobbySessionStore = {
  read(lobbyId: string): StoredLobbySession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(lobbySessionKey(lobbyId));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredLobbySession;
    } catch {
      window.localStorage.removeItem(lobbySessionKey(lobbyId));
      return null;
    }
  },

  save(lobbyId: string, playerId: string, sessionToken: string) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(lobbySessionKey(lobbyId), JSON.stringify({
      lobbyId: lobbyId.toUpperCase(),
      playerId,
      sessionToken,
    } satisfies StoredLobbySession));
  },

  clear(lobbyId: string) {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(lobbySessionKey(lobbyId));
  },
};

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

function toLobbyResponse(raw: any, fallbackPlayerId: string | null = null): LobbyResponse {
  return {
    lobby: toLobby(raw),
    playerId: raw.player_id ?? raw.playerId ?? fallbackPlayerId,
    sessionToken: raw.session_token ?? raw.sessionToken ?? null,
  };
}

function toCreateResponse(raw: any): LobbyResponse {
  const lobby = toLobby(raw);
  const host = lobby.players.find((p) => p.isHost);
  return toLobbyResponse(raw, host?.id ?? lobby.players[0]?.id ?? null);
}

function toJoinResponse(raw: any): LobbyResponse {
  const lobby = toLobby(raw);
  // The newly joined player is the last one in the list
  const playerId = lobby.players[lobby.players.length - 1]?.id ?? null;
  return toLobbyResponse(raw, playerId);
}

function toLeaderboardEntry(raw: any): LeaderboardEntry {
  return {
    playerName: raw.player_name ?? raw.playerName ?? '',
    playerKey: raw.player_key ?? raw.playerKey ?? '',
    wins: raw.wins ?? 0,
    gamesPlayed: raw.games_played ?? raw.gamesPlayed ?? 0,
    winRate: raw.win_rate ?? raw.winRate ?? 0,
    score: raw.score ?? 0,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const lobbyService = {
  list: () => api.get<any[]>('/api/lobbies').then((arr) => arr.map(toLobby)),

  get: (lobbyId: string, sessionToken?: string | null) =>
    api.get<any>(`/api/lobbies/${lobbyId}${sessionToken ? `?session_token=${encodeURIComponent(sessionToken)}` : ''}`)
      .then((raw) => toLobbyResponse(raw)),

  create: (data: LobbyCreate) =>
    api.post<any>('/api/lobbies', {
      host_name: data.playerName,
      name: data.name,
      max_players: data.maxPlayers,
      profile_id: playerIdentityStore.getOrCreate().profileId,
    }).then(toCreateResponse),

  join: (lobbyId: string, data: LobbyJoin) =>
    api.post<any>(`/api/lobbies/${lobbyId}/join`, {
      player_name: data.playerName,
      profile_id: playerIdentityStore.getOrCreate().profileId,
    }).then(toJoinResponse),

  leave: (lobbyId: string, options: { playerId?: string | null; sessionToken?: string | null }) => {
    const params = new URLSearchParams();
    if (options.playerId) {
      params.set('player_id', options.playerId);
    }
    if (options.sessionToken) {
      params.set('session_token', options.sessionToken);
    }
    return api.post<void>(`/api/lobbies/${lobbyId}/leave?${params.toString()}`);
  },

  reset: (lobbyId: string) =>
    api.post<any>(`/api/lobbies/${lobbyId}/reset`).then(toLobby),

  start: (lobbyId: string, config?: GameConfig) =>
    api.post<{ game_id: string }>(`/api/lobbies/${lobbyId}/start`, config ? {
      turn_timer_seconds: config.turnTimerSeconds,
      challenge_window_seconds: config.challengeWindowSeconds,
      block_window_seconds: config.blockWindowSeconds,
      starting_coins: config.startingCoins,
    } : undefined),

  leaderboard: (limit = 6) =>
    api.get<any[]>(`/api/lobbies/leaderboard?limit=${limit}`).then((rows) => rows.map(toLeaderboardEntry)),
};
