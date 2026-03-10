'use client';

import React, { useRef, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { gameLogStyles } from './GameLog.styles';

export function GameLog() {
  const { state } = useGameContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.gameLog.length]);

  return (
    <div>
      <div style={gameLogStyles.wrapper}>
        {state.gameLog.length === 0 && (
          <div style={{ color: '#5A6478', fontSize: 11 }}>No events yet...</div>
        )}
        {state.gameLog.map((entry) => (
          <div key={entry.id} style={gameLogStyles.entry(entry.type)}>
            <span style={gameLogStyles.timestamp}>
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
