import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lobbyService } from "@/services/lobbyService";
import { ApiError } from "@/services/api";
import {
  AiMatchCreate,
  GameConfig,
  LobbyCreate,
  LobbyJoin,
} from "@/models/lobby";

export const lobbyKeys = {
  all: ["lobbies"] as const,
  list: () => [...lobbyKeys.all, "list"] as const,
  detail: (id: string) => [...lobbyKeys.all, "detail", id] as const,
};

interface LobbyQueryOptions {
  enabled?: boolean;
}

const shouldRetryLobbyQuery = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && error.status === 404) {
    return false;
  }

  return failureCount < 2;
};

export function useLobbies() {
  return useQuery({
    queryKey: lobbyKeys.list(),
    queryFn: lobbyService.list,
    refetchInterval: 5000,
  });
}

export function useLobby(
  lobbyId: string,
  sessionToken?: string | null,
  options: LobbyQueryOptions = {},
) {
  return useQuery({
    queryKey: [...lobbyKeys.detail(lobbyId), sessionToken ?? "anonymous"],
    queryFn: () => lobbyService.get(lobbyId, sessionToken),
    enabled: (options.enabled ?? true) && !!lobbyId,
    retry: shouldRetryLobbyQuery,
    refetchInterval: ({ state }) => {
      if (state.error instanceof ApiError && state.error.status === 404) {
        return false;
      }

      return 3000;
    },
  });
}

export function useLobbyLeaderboard(
  lobbyId: string,
  limit = 6,
  options: LobbyQueryOptions = {},
) {
  return useQuery({
    queryKey: [...lobbyKeys.detail(lobbyId), "leaderboard", limit],
    queryFn: () => lobbyService.leaderboard(lobbyId, limit),
    enabled: (options.enabled ?? true) && !!lobbyId,
    retry: shouldRetryLobbyQuery,
    refetchInterval: 15000,
  });
}

export function useCreateLobby() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LobbyCreate) => lobbyService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lobbyKeys.list() }),
  });
}

export function useCreateAiMatch() {
  return useMutation({
    mutationFn: (data: AiMatchCreate) => lobbyService.createAiMatch(data),
  });
}

export function useJoinLobby() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lobbyId, data }: { lobbyId: string; data: LobbyJoin }) =>
      lobbyService.join(lobbyId, data),
    onSuccess: (_res, { lobbyId }) =>
      qc.invalidateQueries({ queryKey: lobbyKeys.detail(lobbyId) }),
  });
}

export function useStartGame() {
  return useMutation({
    mutationFn: ({
      lobbyId,
      config,
    }: {
      lobbyId: string;
      config?: GameConfig;
    }) => lobbyService.start(lobbyId, config),
  });
}
