'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createVictoryTimeline } from '@/animations';
import { gameOverModalStyles } from './GameOverModal.styles';

export interface GameOverModalProps {
  isOpen: boolean;
  winnerName: string;
  onPlayAgain: () => void;
}

export function GameOverModal({ isOpen, winnerName, onPlayAgain }: GameOverModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const tl = createVictoryTimeline(modalRef.current);
      return () => { tl.kill(); };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={gameOverModalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div ref={modalRef} style={gameOverModalStyles.modal}>
            <div style={gameOverModalStyles.title}>Game Over</div>
            <div style={gameOverModalStyles.winnerName}>{winnerName} wins the match.</div>
            <button style={gameOverModalStyles.button} onClick={onPlayAgain}>
              Play Again
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
