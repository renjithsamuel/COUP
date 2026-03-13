'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { GameProvider } from '@/context/GameContext';
import { GameBoard } from '@/containers/GameBoard';
import { lobbyKeys } from '@/queries/useLobbyQueries';
import { lobbyService } from '@/services/lobbyService';

export function GamePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const gameId = params.id as string;
  const playerId = searchParams.get('playerId') ?? '';
  const lobbyId = searchParams.get('lobbyId') ?? '';

  const handlePlayAgain = async () => {
    if (lobbyId && playerId) {
      try {
        const resetLobby = await lobbyService.reset(lobbyId);
        queryClient.setQueryData(lobbyKeys.detail(lobbyId), resetLobby);
        queryClient.invalidateQueries({ queryKey: lobbyKeys.detail(lobbyId) });
        queryClient.invalidateQueries({ queryKey: lobbyKeys.list() });
      } catch {
        router.push('/');
        return;
      }
      router.replace(`/lobby/${lobbyId}?playerId=${playerId}`);
      return;
    }
    router.push('/');
  };

  return (
    <GameProvider>
      <GameBoard gameId={gameId} playerId={playerId} onPlayAgain={handlePlayAgain} />
    </GameProvider>
  );
}
