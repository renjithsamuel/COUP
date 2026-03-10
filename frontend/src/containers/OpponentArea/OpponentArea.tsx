'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameContext } from '@/context/GameContext';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Card } from '@/components/Card';
import { Character } from '@/models/card';
import { getOpponentAreaStyles } from './OpponentArea.styles';

export interface OpponentAreaProps {
  isMobile?: boolean;
  activeCardEffect?: {
    eventId: number;
    effect: string;
    accent: string;
    actorId?: string;
    targetId?: string;
    blockerId?: string;
  } | null;
}

export function OpponentArea({ isMobile = false, activeCardEffect = null }: OpponentAreaProps) {
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
          <AnimatePresence>
            {activeCardEffect && (activeCardEffect.actorId === opp.id || activeCardEffect.targetId === opp.id || activeCardEffect.blockerId === opp.id) && (
              <>
                <motion.div
                  key={`halo-${activeCardEffect.eventId}-${opp.id}`}
                  style={s.effectHalo(
                    activeCardEffect.targetId === opp.id ? 'target' : activeCardEffect.blockerId === opp.id ? 'blocker' : 'actor',
                    activeCardEffect.accent,
                  )}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: [0, 1, 0.65], scale: [0.92, 1.02, 1] }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                <motion.span
                  key={`tag-${activeCardEffect.eventId}-${opp.id}`}
                  style={s.effectTag(
                    activeCardEffect.targetId === opp.id ? 'target' : activeCardEffect.blockerId === opp.id ? 'blocker' : 'actor',
                    activeCardEffect.accent,
                  )}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeCardEffect.targetId === opp.id ? 'Target' : activeCardEffect.blockerId === opp.id ? 'Blocker' : 'Actor'}
                </motion.span>
              </>
            )}
          </AnimatePresence>

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
