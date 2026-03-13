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
  const phaseTitle =
    currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW
      ? 'Block Window'
      : currentPhase === GamePhase.BLOCK_WINDOW
        ? 'Decision Time'
        : 'Challenge Window';

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
          <div style={s.panel}>
            <div style={s.headerRow}>
              <span style={s.phasePill}>{phaseTitle}</span>
              <span style={s.headerHint}>{iAlreadyAccepted ? 'Response sent' : 'Your response is required'}</span>
            </div>
            <div style={s.message}>{message}</div>
            <div style={s.responseHint}>{responseHint}</div>
            {iAlreadyAccepted ? (
              <div style={s.waitingState}>
                <span style={s.waitingTitle}>Allowed. Resolving response.</span>
                <span style={s.waitingDetail}>{waitingForText}</span>
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
                <div style={s.waitingFooter}>{waitingForText}</div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
