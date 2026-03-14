'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useLobby, useLobbyLeaderboard, useStartGame } from '@/queries/useLobbyQueries';
import { useLobbyContext } from '@/context/LobbyContext';
import { LobbyRoom } from '@/containers/LobbyRoom';
import { PreGameConfig } from '@/components/PreGameConfig';
import { CoupBackgroundSVG } from '@/components/CoupBackgroundSVG';
import { GameConfig } from '@/models/lobby';
import { lobbyService, lobbySessionStore } from '@/services/lobbyService';
import { tokens } from '@/theme/tokens';

export default function LobbyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const lobbyId = params.id as string;
  const playerIdParam = searchParams.get('playerId');

  const { state, dispatch } = useLobbyContext();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const { data: lobbyResponse, isLoading, isError } = useLobby(lobbyId, sessionToken);
  const { data: leaderboard = [] } = useLobbyLeaderboard(6);
  const startGame = useStartGame();
  const [showConfig, setShowConfig] = useState(false);

  const lobby = lobbyResponse?.lobby ?? null;

  useEffect(() => {
    const storedSession = lobbySessionStore.read(lobbyId);
    setSessionToken(storedSession?.sessionToken ?? null);

    if (!playerIdParam && storedSession?.playerId && state.myPlayerId !== storedSession.playerId) {
      dispatch({ type: 'SET_MY_PLAYER_ID', payload: storedSession.playerId });
    }
  }, [dispatch, lobbyId, playerIdParam, state.myPlayerId]);

  // Set playerId from URL param (creator redirect or join redirect)
  useEffect(() => {
    if (playerIdParam && state.myPlayerId !== playerIdParam) {
      dispatch({ type: 'SET_MY_PLAYER_ID', payload: playerIdParam });
    }
  }, [playerIdParam, state.myPlayerId, dispatch]);

  useEffect(() => {
    if (lobbyResponse?.playerId && state.myPlayerId !== lobbyResponse.playerId) {
      dispatch({ type: 'SET_MY_PLAYER_ID', payload: lobbyResponse.playerId });
    }
  }, [dispatch, lobbyResponse?.playerId, state.myPlayerId]);

  // Keep lobby in sync
  useEffect(() => {
    if (lobby) dispatch({ type: 'SET_LOBBY', payload: lobby });
  }, [lobby, dispatch]);

  useEffect(() => {
    if (lobbyResponse?.playerId && lobbyResponse.sessionToken) {
      lobbySessionStore.save(lobbyId, lobbyResponse.playerId, lobbyResponse.sessionToken);
      setSessionToken(lobbyResponse.sessionToken);
    }
  }, [lobbyId, lobbyResponse?.playerId, lobbyResponse?.sessionToken]);

  useEffect(() => {
    if (!lobby || !state.myPlayerId) {
      return;
    }

    if (!lobby.players.some((player) => player.id === state.myPlayerId)) {
      lobbySessionStore.clear(lobbyId);
      dispatch({ type: 'LEAVE_LOBBY' });
      router.replace('/');
    }
  }, [dispatch, lobby, lobbyId, router, state.myPlayerId]);

  // Redirect to game when lobby starts (for non-host players)
  useEffect(() => {
    if (lobby && lobby.gameId && state.myPlayerId) {
      router.push(`/game/${lobby.gameId}?playerId=${state.myPlayerId}&lobbyId=${lobbyId}`);
    }
  }, [lobby, lobbyId, router, state.myPlayerId]);

  const handleLeave = async () => {
    if (!state.myPlayerId) {
      lobbySessionStore.clear(lobbyId);
      router.push('/');
      return;
    }
    try {
      await lobbyService.leave(lobbyId, {
        playerId: state.myPlayerId,
        sessionToken,
      });
    } catch { /* lobby may already be gone */ }
    lobbySessionStore.clear(lobbyId);
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
    router.push(`/game/${res.game_id}?playerId=${state.myPlayerId}&lobbyId=${lobbyId}`);
  };

  if (isLoading || !lobby) {
    if (isError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: tokens.board.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: tokens.spacing.md,
            color: tokens.text.secondary,
            fontSize: 16,
            padding: tokens.spacing.lg,
          }}
        >
          <div>Lobby unavailable.</div>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: tokens.text.primary,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back Home
          </button>
        </div>
      );
    }

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
        minHeight: '100dvh',
        background: tokens.board.bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
          ? `${tokens.spacing.md}px ${tokens.spacing.sm}px`
          : tokens.spacing.xl,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      >
        <div
          style={{
            width: '62vw',
            minWidth: 360,
            maxWidth: 900,
            height: '100%',
            transform: 'translateX(12%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 32%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 32%, rgba(0,0,0,1) 100%)',
          }}
        >
          <CoupBackgroundSVG />
        </div>
      </div>
      <LobbyRoom
        lobby={lobby}
        myPlayerId={state.myPlayerId ?? ''}
        isHost={isHost}
        leaderboard={leaderboard}
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
