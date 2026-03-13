'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { ActionGlyph } from '@/components/ActionGlyph';
import { useGameContext } from '@/context/GameContext';
import { ACTION_PRESENTATIONS, ACTION_RULES } from '@/models/action';
import { gameLogStyles } from './GameLog.styles';

export interface GameLogProps {
  variant?: 'panel' | 'modal';
}

function getEntryVisual(type: string, actionType?: keyof typeof ACTION_PRESENTATIONS) {
  if (actionType && ACTION_PRESENTATIONS[actionType]) {
    return {
      accent: ACTION_PRESENTATIONS[actionType].accent,
      tint: ACTION_PRESENTATIONS[actionType].tint,
      icon: ACTION_PRESENTATIONS[actionType].icon,
    };
  }

  switch (type) {
    case 'challenge':
      return { accent: '#F3C969', tint: 'rgba(243, 201, 105, 0.14)', icon: 'challenge' as const };
    case 'block':
      return { accent: '#B693FF', tint: 'rgba(182, 147, 255, 0.14)', icon: 'block' as const };
    case 'reveal':
      return { accent: '#F08A94', tint: 'rgba(240, 138, 148, 0.14)', icon: 'reveal' as const };
    case 'elimination':
      return { accent: '#F06B7D', tint: 'rgba(240, 107, 125, 0.14)', icon: 'elimination' as const };
    case 'turn':
      return { accent: '#75D6A9', tint: 'rgba(117, 214, 169, 0.14)', icon: 'turn' as const };
    default:
      return { accent: '#F6C445', tint: 'rgba(246, 196, 69, 0.12)', icon: 'system' as const };
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
        {entries.map((entry, index) => {
          const visual = getEntryVisual(entry.type, entry.actionType);
          const sequence = String(entries.length - index).padStart(2, '0');
          const actionLabel = entry.actionType ? ACTION_RULES[entry.actionType].label : null;

          return (
            <article key={entry.id} style={gameLogStyles.entryRow}>
              <div style={gameLogStyles.metaColumn}>
                <span style={gameLogStyles.sequence}>{sequence}</span>
                <span style={gameLogStyles.timestamp}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={gameLogStyles.messageColumn(visual, variant)}>
                <span style={gameLogStyles.iconShell(visual)}>
                  <ActionGlyph name={visual.icon} size={15} />
                </span>
                <div style={gameLogStyles.messageStack}>
                  {actionLabel && <span style={gameLogStyles.actionPill(visual)}>{actionLabel}</span>}
                  <div style={gameLogStyles.message}>{entry.message}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
