'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glowPulseVariants } from '@/animations';
import { turnIndicatorStyles } from './TurnIndicator.styles';

export interface TurnIndicatorProps {
  currentPlayerName: string;
  isMyTurn: boolean;
  turnNumber: number;
}

export function TurnIndicator({ currentPlayerName, isMyTurn, turnNumber }: TurnIndicatorProps) {
  return (
    <motion.div
      style={turnIndicatorStyles.wrapper(isMyTurn)}
      variants={glowPulseVariants}
      animate={isMyTurn ? 'glow' : 'idle'}
    >
      <span>Turn {turnNumber}</span>
      <span>•</span>
      <span>{isMyTurn ? 'Your turn!' : `${currentPlayerName}'s turn`}</span>
    </motion.div>
  );
}
