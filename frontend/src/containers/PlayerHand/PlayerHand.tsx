'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/Card';
import { cardDealVariants } from '@/animations';
import { tokens } from '@/theme/tokens';
import { getPlayerHandStyles } from './PlayerHand.styles';
import { usePlayerHand } from './PlayerHand.hooks';

import { ClientMessage } from '@/models/websocket-message';

export interface PlayerHandProps {
  send: (msg: ClientMessage) => boolean;
  isMobile?: boolean;
}

export function PlayerHand({ send, isMobile = false }: PlayerHandProps) {
  const { myCards, exchangeCards, needsInfluenceChoice, needsExchangeReturn, onChooseInfluence, onExchangeReturn } = usePlayerHand(send);
  const [selectedKeep, setSelectedKeep] = useState<Set<number>>(new Set());

  const aliveCount = myCards.filter((c) => !c.isRevealed).length;
  const aliveCards = myCards.filter((c) => !c.isRevealed);
  const allCards = [...aliveCards, ...exchangeCards];

  const toggleKeep = useCallback((idx: number) => {
    setSelectedKeep((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else if (next.size < aliveCount) {
        next.add(idx);
      }
      return next;
    });
  }, [aliveCount]);

  const confirmExchange = useCallback(() => {
    if (selectedKeep.size === aliveCount) {
      onExchangeReturn(Array.from(selectedKeep));
      setSelectedKeep(new Set());
    }
  }, [selectedKeep, aliveCount, onExchangeReturn]);

  if (needsExchangeReturn && allCards.length > 0) {
    const cardSize = isMobile ? 'sm' : 'md';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
        <div style={{
          fontSize: isMobile ? 12 : 14,
          fontWeight: 700,
          color: tokens.text.accent,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>
          Exchange — pick {aliveCount} card{aliveCount !== 1 ? 's' : ''} to keep
        </div>
        <div style={{
          display: 'flex',
          gap: isMobile ? 6 : 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {allCards.map((card, i) => (
            <div
              key={`exchange-${i}`}
              style={{
                cursor: 'pointer',
                borderRadius: 10,
                outline: selectedKeep.has(i)
                  ? `3px solid ${tokens.text.accent}`
                  : '3px solid transparent',
                outlineOffset: 2,
                opacity: selectedKeep.size === aliveCount && !selectedKeep.has(i) ? 0.4 : 1,
                transition: 'all 0.15s ease',
              }}
              onClick={() => toggleKeep(i)}
            >
              <Card character={card.character} size={cardSize} />
            </div>
          ))}
        </div>
        <button
          disabled={selectedKeep.size !== aliveCount}
          onClick={confirmExchange}
          style={{
            padding: isMobile ? '6px 16px' : '8px 24px',
            borderRadius: 8,
            border: `1px solid ${tokens.surface.borderLight}`,
            background: selectedKeep.size === aliveCount
              ? `linear-gradient(135deg, ${tokens.surface.elevated}, ${tokens.surface.card})`
              : tokens.surface.card,
            color: selectedKeep.size === aliveCount ? tokens.text.accent : tokens.text.muted,
            fontWeight: 700,
            fontSize: isMobile ? 11 : 13,
            cursor: selectedKeep.size === aliveCount ? 'pointer' : 'not-allowed',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Confirm
        </button>
      </div>
    );
  }

  return (
    <div style={getPlayerHandStyles(isMobile).wrapper}>
      <AnimatePresence>
        {myCards.map((card, i) => (
          <motion.div
            key={`${card.character}-${i}`}
            custom={i}
            variants={cardDealVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card
              character={card.character}
              isRevealed={card.isRevealed}
              onClick={needsInfluenceChoice ? () => onChooseInfluence(i) : undefined}
              disabled={card.isRevealed}
              size={isMobile ? 'sm' : 'lg'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
