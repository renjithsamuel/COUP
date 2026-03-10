import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lobbyService } from '@/services/lobbyService';
import { LobbyCreate, LobbyJoin, GameConfig } from '@/models/lobby';

export const lobbyKeys = {
  all: ['lobbies'] as const,
  list: () => [...lobbyKeys.all, 'list'] as const,
  detail: (id: string) => [...lobbyKeys.all, 'detail', id] as const,
};

export function useLobbies() {
  return useQuery({
    queryKey: lobbyKeys.list(),
    queryFn: lobbyService.list,
    refetchInterval: 5000,
  });
}

export function useLobby(lobbyId: string) {
  return useQuery({
    queryKey: lobbyKeys.detail(lobbyId),
    queryFn: () => lobbyService.get(lobbyId),
    enabled: !!lobbyId,
    refetchInterval: 3000,
  });
}

export function useCreateLobby() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LobbyCreate) => lobbyService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: lobbyKeys.list() }),
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
    mutationFn: ({ lobbyId, config }: { lobbyId: string; config?: GameConfig }) =>
      lobbyService.start(lobbyId, config),
  });
}
