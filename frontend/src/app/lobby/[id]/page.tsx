'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLobby, useStartGame } from '@/queries/useLobbyQueries';
import { useLobbyContext } from '@/context/LobbyContext';
import { LobbyRoom } from '@/containers/LobbyRoom';
import { PreGameConfig } from '@/components/PreGameConfig';
import { GameConfig } from '@/models/lobby';
import { lobbyService } from '@/services/lobbyService';
import { tokens } from '@/theme/tokens';

export default function LobbyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lobbyId = params.id as string;
  const playerIdParam = searchParams.get('playerId');

  const { state, dispatch } = useLobbyContext();
  const { data: lobby, isLoading } = useLobby(lobbyId);
  const startGame = useStartGame();
  const [showConfig, setShowConfig] = useState(false);

  // Set playerId from URL param (creator redirect or join redirect)
  useEffect(() => {
    if (playerIdParam && state.myPlayerId !== playerIdParam) {
      dispatch({ type: 'SET_MY_PLAYER_ID', payload: playerIdParam });
    }
  }, [playerIdParam, state.myPlayerId, dispatch]);

  // Keep lobby in sync
  useEffect(() => {
    if (lobby) dispatch({ type: 'SET_LOBBY', payload: lobby });
  }, [lobby, dispatch]);

  // Redirect to game when lobby starts (for non-host players)
  useEffect(() => {
    if (lobby && lobby.gameId && state.myPlayerId) {
      router.push(`/game/${lobby.gameId}?playerId=${state.myPlayerId}`);
    }
  }, [lobby, state.myPlayerId, router]);

  // Leave lobby on beforeunload
  const leaveLobby = useCallback(() => {
    if (state.myPlayerId && lobbyId) {
      // Use sendBeacon for reliable unload delivery
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/lobbies/${encodeURIComponent(lobbyId)}/leave?player_id=${encodeURIComponent(state.myPlayerId)}`;
      navigator.sendBeacon(url);
    }
  }, [lobbyId, state.myPlayerId]);

  useEffect(() => {
    window.addEventListener('beforeunload', leaveLobby);
    return () => window.removeEventListener('beforeunload', leaveLobby);
  }, [leaveLobby]);

  const handleLeave = async () => {
    if (!state.myPlayerId) return;
    try {
      await lobbyService.leave(lobbyId, state.myPlayerId);
    } catch { /* lobby may already be gone */ }
    dispatch({ type: 'LEAVE_LOBBY' });
    router.push('/');
  };

  const handleStart = () => {
    setShowConfig(true);
  };

  const handleConfirmStart = async (config: GameConfig) => {
    setShowConfig(false);
    if (!state.myPlayerId) return;
    const res = await startGame.mutateAsync({ lobbyId, config });
    router.push(`/game/${res.game_id}?playerId=${state.myPlayerId}`);
  };

  if (isLoading || !lobby) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: tokens.board.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tokens.text.secondary,
          fontSize: 16,
        }}
      >
        Loading lobby...
      </div>
    );
  }

  const isHost = lobby.players.some((p) => p.isHost && p.id === state.myPlayerId);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: tokens.board.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacing.xl,
      }}
    >
      <LobbyRoom
        lobby={lobby}
        myPlayerId={state.myPlayerId ?? ''}
        isHost={isHost}
        onStart={handleStart}
        onLeave={handleLeave}
      />
      <PreGameConfig
        isOpen={showConfig}
        playerCount={lobby.players.length}
        onConfirm={handleConfirmStart}
        onCancel={() => setShowConfig(false)}
      />
    </div>
  );
}
