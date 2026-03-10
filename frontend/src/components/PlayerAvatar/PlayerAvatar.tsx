'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glowPulseVariants } from '@/animations';
import { playerAvatarStyles } from './PlayerAvatar.styles';

export interface PlayerAvatarProps {
  name: string;
  isActive: boolean;
  isAlive: boolean;
  coins?: number;
}

export function PlayerAvatar({ name, isActive, isAlive, coins }: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={playerAvatarStyles.wrapper(isActive, isAlive)}>
      <motion.div
        variants={glowPulseVariants}
        animate={isActive ? 'glow' : 'idle'}
        style={playerAvatarStyles.avatar(isActive)}
        aria-label={`${name}${isActive ? ' (active turn)' : ''}${!isAlive ? ' (eliminated)' : ''}`}
      >
        {initial}
      </motion.div>
      <span style={playerAvatarStyles.name}>{name}</span>
      {coins != null && (
        <span style={{ fontSize: 11, color: '#FFC107', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{coins}c</span>
      )}
    </div>
  );
}
