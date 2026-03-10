'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { GameProvider } from '@/context/GameContext';
import { GameBoard } from '@/containers/GameBoard';

export function GamePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = params.id as string;
  const playerId = searchParams.get('playerId') ?? '';

  const handlePlayAgain = () => {
    router.push('/');
  };

  return (
    <GameProvider>
      <GameBoard gameId={gameId} playerId={playerId} onPlayAgain={handlePlayAgain} />
    </GameProvider>
  );
}
