import { api } from "./api";
import {
  AiMatchCreate,
  AiMatchResponse,
  GameConfig,
  LeaderboardEntry,
  Lobby,
  LobbyCreate,
  LobbyJoin,
  LobbyPlayer,
  LobbyResponse,
} from "@/models/lobby";

export interface StoredLobbySession {
  lobbyId: string;
  playerId: string;
  sessionToken: string;
  playerName?: string;
  isHost?: boolean;
}

export interface StoredPlayerIdentity {
  profileId: string;
}

interface LobbyPlayerApi {
  id: string;
  name: string;
  is_host: boolean;
  is_ready: boolean;
}

interface LobbyApi {
  id: string;
  name?: string | null;
  players: LobbyPlayerApi[];
  max_players: number;
  status: Lobby["status"];
  game_id?: string | null;
  player_count: number;
  player_id?: string | null;
  playerId?: string | null;
  session_token?: string | null;
  sessionToken?: string | null;
}

interface LeaderboardEntryApi {
  player_name?: string;
  playerName?: string;
  player_key?: string;
  playerKey?: string;
  wins?: number;
  games_played?: number;
  gamesPlayed?: number;
  win_rate?: number;
  winRate?: number;
  score?: number;
}

interface AiMatchResponseApi {
  ok?: boolean;
  game_id?: string;
  gameId?: string;
  player_id?: string;
  playerId?: string;
}

const lobbySessionKey = (lobbyId: string) =>
  `coup:lobby-session:${lobbyId.toUpperCase()}`;
const lobbyConfigKey = (lobbyId: string) =>
  `coup:lobby-config:${lobbyId.toUpperCase()}`;
const lobbyReturnKey = (lobbyId: string) =>
  `coup:lobby-return:${lobbyId.toUpperCase()}`;
const playerIdentityKey = "coup:player-identity";

const getBrowserStorage = (kind: "local" | "session"): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const createProfileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `profile-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
};

export const playerIdentityStore = {
  getOrCreate(): StoredPlayerIdentity {
    const storage = getBrowserStorage("local");
    if (!storage) {
      return { profileId: "server-profile" };
    }

    const existing = storage.getItem(playerIdentityKey);
    if (existing) {
      try {
        return JSON.parse(existing) as StoredPlayerIdentity;
      } catch {
        storage.removeItem(playerIdentityKey);
      }
    }

    const created = {
      profileId: createProfileId(),
    } satisfies StoredPlayerIdentity;
    storage.setItem(playerIdentityKey, JSON.stringify(created));
    return created;
  },
};

export const lobbySessionStore = {
  read(lobbyId: string): StoredLobbySession | null {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(lobbySessionKey(lobbyId));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredLobbySession;
    } catch {
      storage.removeItem(lobbySessionKey(lobbyId));
      return null;
    }
  },

  save(
    lobbyId: string,
    playerId: string,
    sessionToken: string,
    playerName?: string,
    isHost?: boolean,
  ) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.setItem(
      lobbySessionKey(lobbyId),
      JSON.stringify({
        lobbyId: lobbyId.toUpperCase(),
        playerId,
        sessionToken,
        ...(playerName ? { playerName } : {}),
        ...(typeof isHost === "boolean" ? { isHost } : {}),
      } satisfies StoredLobbySession),
    );
  },

  clear(lobbyId: string) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.removeItem(lobbySessionKey(lobbyId));
  },
};

export const lobbyConfigStore = {
  read(lobbyId: string): GameConfig | null {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(lobbyConfigKey(lobbyId));
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as GameConfig;
    } catch {
      storage.removeItem(lobbyConfigKey(lobbyId));
      return null;
    }
  },

  save(lobbyId: string, config: GameConfig) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.setItem(lobbyConfigKey(lobbyId), JSON.stringify(config));
  },

  clear(lobbyId: string) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.removeItem(lobbyConfigKey(lobbyId));
  },
};

export const lobbyReturnStore = {
  read(lobbyId: string): boolean {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return false;
    }

    return storage.getItem(lobbyReturnKey(lobbyId)) === "1";
  },

  save(lobbyId: string) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.setItem(lobbyReturnKey(lobbyId), "1");
  },

  clear(lobbyId: string) {
    const storage = getBrowserStorage("session");
    if (!storage) {
      return;
    }

    storage.removeItem(lobbyReturnKey(lobbyId));
  },
};

function toLobbyPlayer(raw: LobbyPlayerApi): LobbyPlayer {
  return {
    id: raw.id,
    name: raw.name,
    isHost: raw.is_host,
    isReady: raw.is_ready,
  };
}

function toLobby(raw: LobbyApi): Lobby {
  return {
    id: raw.id,
    name: raw.name ?? "",
    players: raw.players.map(toLobbyPlayer),
    maxPlayers: raw.max_players,
    status: raw.status,
    gameId: raw.game_id ?? null,
    playerCount: raw.player_count,
  };
}

function toLobbyResponse(
  raw: LobbyApi,
  fallbackPlayerId: string | null = null,
): LobbyResponse {
  return {
    lobby: toLobby(raw),
    playerId: raw.player_id ?? raw.playerId ?? fallbackPlayerId,
    sessionToken: raw.session_token ?? raw.sessionToken ?? null,
  };
}

function toCreateResponse(raw: LobbyApi): LobbyResponse {
  const lobby = toLobby(raw);
  const host = lobby.players.find((p) => p.isHost);
  return toLobbyResponse(raw, host?.id ?? lobby.players[0]?.id ?? null);
}

function toJoinResponse(raw: LobbyApi): LobbyResponse {
  const lobby = toLobby(raw);
  // The newly joined player is the last one in the list
  const playerId = lobby.players[lobby.players.length - 1]?.id ?? null;
  return toLobbyResponse(raw, playerId);
}

function toLeaderboardEntry(raw: LeaderboardEntryApi): LeaderboardEntry {
  return {
    playerName: raw.player_name ?? raw.playerName ?? "",
    playerKey: raw.player_key ?? raw.playerKey ?? "",
    wins: raw.wins ?? 0,
    gamesPlayed: raw.games_played ?? raw.gamesPlayed ?? 0,
    winRate: raw.win_rate ?? raw.winRate ?? 0,
    score: raw.score ?? 0,
  };
}

function toAiMatchResponse(raw: AiMatchResponseApi): AiMatchResponse {
  return {
    ok: raw.ok ?? true,
    gameId: raw.game_id ?? raw.gameId ?? "",
    playerId: raw.player_id ?? raw.playerId ?? "",
  };
}
export const lobbyService = {
  list: () =>
    api.get<LobbyApi[]>("/api/lobbies").then((arr) => arr.map(toLobby)),

  get: (lobbyId: string, sessionToken?: string | null) =>
    api
      .get<LobbyApi>(
        `/api/lobbies/${lobbyId}${sessionToken ? `?session_token=${encodeURIComponent(sessionToken)}` : ""}`,
      )
      .then((raw) => toLobbyResponse(raw)),

  create: (data: LobbyCreate) =>
    api
      .post<LobbyApi>("/api/lobbies", {
        host_name: data.playerName,
        name: data.name,
        max_players: data.maxPlayers,
        profile_id: playerIdentityStore.getOrCreate().profileId,
      })
      .then(toCreateResponse),

  createAiMatch: (data: AiMatchCreate) =>
    api
      .post<AiMatchResponseApi>("/api/games/ai-match", {
        player_name: data.playerName,
        bot_count: data.botCount,
        difficulty: data.difficulty,
        profile_id: playerIdentityStore.getOrCreate().profileId,
        ...(data.config
          ? {
              config: {
                turn_timer_seconds: data.config.turnTimerSeconds,
                challenge_window_seconds: data.config.challengeWindowSeconds,
                block_window_seconds: data.config.blockWindowSeconds,
                starting_coins: data.config.startingCoins,
              },
            }
          : {}),
      })
      .then(toAiMatchResponse),

  join: (lobbyId: string, data: LobbyJoin) =>
    api
      .post<LobbyApi>(`/api/lobbies/${lobbyId}/join`, {
        player_name: data.playerName,
        profile_id: playerIdentityStore.getOrCreate().profileId,
        session_token: data.sessionToken ?? "",
      })
      .then(toJoinResponse),

  leave: (
    lobbyId: string,
    options: { playerId?: string | null; sessionToken?: string | null },
  ) => {
    const params = new URLSearchParams();
    if (options.playerId) {
      params.set("player_id", options.playerId);
    }
    if (options.sessionToken) {
      params.set("session_token", options.sessionToken);
    }
    return api.post<void>(`/api/lobbies/${lobbyId}/leave?${params.toString()}`);
  },

  kick: (
    lobbyId: string,
    options: {
      targetPlayerId: string;
      actorPlayerId?: string | null;
      sessionToken?: string | null;
    },
  ) =>
    api
      .post<LobbyApi>(`/api/lobbies/${lobbyId}/kick`, {
        target_player_id: options.targetPlayerId,
        actor_player_id: options.actorPlayerId ?? "",
        session_token: options.sessionToken ?? "",
      })
      .then(toLobbyResponse),

  reset: (
    lobbyId: string,
    options: { playerId?: string | null; sessionToken?: string | null },
  ) => {
    const params = new URLSearchParams();
    if (options.playerId) {
      params.set("player_id", options.playerId);
    }
    if (options.sessionToken) {
      params.set("session_token", options.sessionToken);
    }

    return api
      .post<LobbyApi>(`/api/lobbies/${lobbyId}/reset?${params.toString()}`)
      .then(toLobby);
  },

  start: (lobbyId: string, config?: GameConfig) =>
    api.post<{ game_id: string }>(
      `/api/lobbies/${lobbyId}/start`,
      config
        ? {
            turn_timer_seconds: config.turnTimerSeconds,
            challenge_window_seconds: config.challengeWindowSeconds,
            block_window_seconds: config.blockWindowSeconds,
            starting_coins: config.startingCoins,
            bot_count: config.botCount ?? 0,
            bot_difficulty: config.botDifficulty ?? "medium",
          }
        : undefined,
    ),

  leaderboard: (lobbyId: string, limit = 6) =>
    api
      .get<
        LeaderboardEntryApi[]
      >(`/api/lobbies/${lobbyId}/leaderboard?limit=${limit}`)
      .then((rows) => rows.map(toLeaderboardEntry)),
};
