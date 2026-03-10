'use client';

import React, { useEffect, useRef } from 'react';
import { useGameContext } from '@/context/GameContext';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Card } from '@/components/Card';
import { Character } from '@/models/card';
import { getOpponentAreaStyles } from './OpponentArea.styles';

export interface OpponentAreaProps {
  isMobile?: boolean;
}

export function OpponentArea({ isMobile = false }: OpponentAreaProps) {
  const { state } = useGameContext();
  const gs = state.gameState;
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-scroll to active player's card on mobile
  useEffect(() => {
    if (!isMobile || !gs?.currentPlayerId) return;
    const el = slotRefs.current.get(gs.currentPlayerId);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [isMobile, gs?.currentPlayerId]);

  if (!gs) return null;

  const opponents = gs.players.filter((p) => p.id !== state.myPlayerId);
  const s = getOpponentAreaStyles(isMobile, opponents.length);
  const cardSize = isMobile ? 'xs' : 'sm';

  return (
    <div ref={scrollRef} style={s.wrapper} className={isMobile ? 'hide-scrollbar' : undefined}>
      {opponents.map((opp) => (
        <div
          key={opp.id}
          ref={(el) => {
            if (el) slotRefs.current.set(opp.id, el);
          }}
          style={s.opponentSlot(gs.currentPlayerId === opp.id, opp.isAlive)}
        >
          <div style={s.infoRow}>
            <PlayerAvatar
              name={opp.name}
              isActive={gs.currentPlayerId === opp.id}
              isAlive={opp.isAlive}
              coins={opp.coins}
            />
          </div>
          <div style={s.cardsRow}>
            {opp.revealedCards.map((card, i) => (
              <Card
                key={`revealed-${i}`}
                character={card.character}
                isRevealed
                size={cardSize}
                disabled
              />
            ))}
            {Array.from({ length: opp.influenceCount }).map((_, i) => (
              <Card
                key={`hidden-${i}`}
                character={Character.DUKE}
                isFaceDown
                size={cardSize}
                disabled
              />
            ))}
          </div>
          <div style={s.statsRow}>
            <span style={s.coinLabel}>
              <span style={{ color: '#FFC107' }}>●</span> {opp.coins}
            </span>
            <span style={s.influenceLabel}>
              {opp.influenceCount} card{opp.influenceCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
