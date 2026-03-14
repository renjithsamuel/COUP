'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { targetSlotHoverMotion, targetSlotTapMotion } from '@/animations';
import { useGameContext } from '@/context/GameContext';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Card } from '@/components/Card';
import { Character } from '@/models/card';
import { ActionType, ACTION_RULES } from '@/models/action';
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
  targetModeAction?: ActionType | null;
  selectableTargetIds?: string[];
  onSelectTarget?: (playerId: string) => void;
}

export function OpponentArea({
  isMobile = false,
  activeCardEffect = null,
  targetModeAction = null,
  selectableTargetIds = [],
  onSelectTarget,
}: OpponentAreaProps) {
  const { state } = useGameContext();
  const gs = state.gameState;
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - node.scrollLeft > 8);
  }, []);

  useEffect(() => {
    if (!gs?.currentPlayerId) {
      updateScrollState();
      return;
    }

    const el = slotRefs.current.get(gs.currentPlayerId);
    if (el && scrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [gs?.currentPlayerId, updateScrollState]);

  useEffect(() => {
    updateScrollState();

    const node = scrollRef.current;
    if (!node) {
      return undefined;
    }

    const handleResize = () => {
      updateScrollState();
    };

    node.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      node.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollState]);

  if (!gs) return null;

  const opponents = gs.players.filter((p) => p.id !== state.myPlayerId);
  const s = getOpponentAreaStyles(isMobile, opponents.length);
  const cardSize = isMobile ? 'xs' : 'sm';
  const targetActionLabel = targetModeAction ? ACTION_RULES[targetModeAction].label : null;
  const shellClassName = useMemo(() => (isMobile ? 'hide-scrollbar' : undefined), [isMobile]);

  return (
    <div style={s.shell}>
      <div style={s.edgeFade('left', canScrollLeft)} />
      <div style={s.edgeFade('right', canScrollRight)} />
      <div ref={scrollRef} style={s.viewport} className={shellClassName}>
        <div style={s.track}>
          {opponents.map((opp) => (
            <motion.div
              key={opp.id}
              ref={(el) => {
                if (el) {
                  slotRefs.current.set(opp.id, el);
                } else {
                  slotRefs.current.delete(opp.id);
                }
              }}
              style={s.opponentSlot(
                gs.currentPlayerId === opp.id,
                opp.isAlive,
                selectableTargetIds.includes(opp.id),
                targetModeAction != null,
              )}
              whileHover={opp.isAlive && selectableTargetIds.includes(opp.id) ? targetSlotHoverMotion : undefined}
              whileTap={opp.isAlive && selectableTargetIds.includes(opp.id) ? targetSlotTapMotion : undefined}
              onClick={
                opp.isAlive && selectableTargetIds.includes(opp.id) && onSelectTarget
                  ? () => onSelectTarget(opp.id)
                  : undefined
              }
              role={selectableTargetIds.includes(opp.id) ? 'button' : undefined}
              aria-label={
                selectableTargetIds.includes(opp.id) && targetActionLabel
                  ? `Target ${opp.name} with ${targetActionLabel}`
                  : undefined
              }
            >
              <AnimatePresence>
                {targetModeAction && selectableTargetIds.includes(opp.id) && (
                  <motion.span
                    key={`targetable-${targetModeAction}-${opp.id}`}
                    style={s.selectTag}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.18 }}
                  >
                    Select for {ACTION_RULES[targetModeAction].label}
                  </motion.span>
                )}
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

              <div style={s.topRow}>
                <PlayerAvatar
                  name={opp.name}
                  isActive={gs.currentPlayerId === opp.id}
                  isAlive={opp.isAlive}
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
                <span style={s.coinBadge}>
                  <span style={s.coinDot} />
                  <span style={s.coinLabel}>{opp.coins}</span>
                </span>
                <span style={s.influenceLabel}>
                  {opp.influenceCount} card{opp.influenceCount !== 1 ? 's' : ''}
                </span>
                {!opp.isAlive && <span style={s.outBadge}>out</span>}
              </div>
              {opp.isAlive && opp.connected === false && (
                <div style={s.offlineOverlay}>
                  <span style={s.offlineBadge}>offline</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
