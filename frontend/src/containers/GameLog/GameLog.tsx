'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { gameLogStyles } from './GameLog.styles';

export interface GameLogProps {
  variant?: 'panel' | 'modal';
}

function getEntryLabel(type: string) {
  switch (type) {
    case 'action':
      return 'Action';
    case 'challenge':
      return 'Challenge';
    case 'block':
      return 'Block';
    case 'reveal':
      return 'Reveal';
    case 'elimination':
      return 'Eliminated';
    case 'turn':
      return 'Turn';
    default:
      return 'Update';
  }
}

export function GameLog({ variant = 'modal' }: GameLogProps) {
  const { state } = useGameContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoPinnedToTop, setAutoPinnedToTop] = useState(true);
  const entries = useMemo(() => [...state.gameLog].reverse(), [state.gameLog]);

  useEffect(() => {
    if (!scrollRef.current || !autoPinnedToTop) {
      return;
    }
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [entries.length, autoPinnedToTop]);

  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    setAutoPinnedToTop(scrollRef.current.scrollTop <= 32);
  };

  return (
    <div style={gameLogStyles.container(variant)}>
      <div ref={scrollRef} style={gameLogStyles.wrapper(variant)} onScroll={handleScroll}>
        {entries.length === 0 && (
          <div style={gameLogStyles.emptyState(variant)}>No events yet...</div>
        )}
        {entries.map((entry) => (
          entry.type === 'turn' ? (
            <div key={entry.id} style={gameLogStyles.turnMarker}>
              <span style={gameLogStyles.turnLine} />
              <span style={gameLogStyles.turnBadge}>{entry.message}</span>
              <span style={gameLogStyles.turnLine} />
            </div>
          ) : (
            <article key={entry.id} style={gameLogStyles.entryRow}>
              <div style={gameLogStyles.metaColumn}>
                <span style={gameLogStyles.typeLabel(entry.type)}>{getEntryLabel(entry.type)}</span>
                <span style={gameLogStyles.timestamp}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={gameLogStyles.messageColumn(entry.type, variant)}>
                <div style={gameLogStyles.message}>{entry.message}</div>
              </div>
            </article>
          )
        ))}
      </div>
    </div>
  );
}
