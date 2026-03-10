'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideUpVariants } from '@/animations';
import { CHARACTER_LABELS } from '@/models/card';
import { ACTION_RULES, ActionType } from '@/models/action';
import { GamePhase } from '@/models/game';
import { getChallengeBlockOverlayStyles } from './ChallengeBlockOverlay.styles';
import { useChallengeBlockOverlay } from './ChallengeBlockOverlay.hooks';

import { ClientMessage } from '@/models/websocket-message';

export interface ChallengeBlockOverlayProps {
  send: (msg: ClientMessage) => boolean;
  isMobile?: boolean;
}

export function ChallengeBlockOverlay({ send, isMobile = false }: ChallengeBlockOverlayProps) {
  const s = getChallengeBlockOverlayStyles(isMobile);
  const {
    isVisible,
    iAlreadyAccepted,
    canChallenge,
    canBlock,
    blockableCharacters,
    actorName,
    blockerName,
    waitingForText,
    responseHint,
    pending,
    currentPhase,
    submitting,
    onChallenge,
    onBlock,
    onAccept,
  } = useChallengeBlockOverlay(send);

  const actionLabel = pending
    ? ACTION_RULES[pending.actionType as ActionType]?.label ?? pending.actionType
    : '';

  const message =
    currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW
      ? `${blockerName || actorName} is blocking. Challenge the block?`
      : `${actorName} declared ${actionLabel}.`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={s.wrapper}
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div style={s.message}>{message}</div>
          <div style={{ fontSize: isMobile ? 11 : 12, color: '#9FB0CB', fontWeight: 600, lineHeight: 1.4 }}>
            {responseHint}
          </div>
          {iAlreadyAccepted ? (
            <div style={{ fontSize: isMobile ? 11 : 13, color: '#81C784', fontWeight: 600, lineHeight: 1.45 }}>
              Allowed - waiting for other players...<br />
              <span style={{ color: '#A5D6A7' }}>{waitingForText}</span>
            </div>
          ) : (
            <>
              <div style={s.buttons}>
                {canChallenge && (
                  <button type="button" style={s.challengeBtn} onClick={onChallenge} disabled={submitting}>
                    {submitting ? 'Sending…' : 'Challenge'}
                  </button>
                )}
                {canBlock &&
                  blockableCharacters.map((char) => (
                    <button
                      key={char}
                      type="button"
                      style={s.blockBtn}
                      onClick={() => onBlock(char)}
                      disabled={submitting}
                    >
                      {submitting ? 'Sending…' : `Block as ${CHARACTER_LABELS[char]}`}
                    </button>
                  ))}
                <button type="button" style={s.acceptBtn} onClick={onAccept} disabled={submitting}>
                  {submitting ? 'Sending…' : 'Allow'}
                </button>
              </div>
              <div style={{ fontSize: isMobile ? 10 : 11, color: '#8EA3C2', fontWeight: 600 }}>
                {waitingForText}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
