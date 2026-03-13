'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glowPulseVariants } from '@/animations';
import { playerAvatarStyles } from './PlayerAvatar.styles';

export interface PlayerAvatarProps {
  name: string;
  isActive: boolean;
  isAlive: boolean;
}

export function PlayerAvatar({ name, isActive, isAlive }: PlayerAvatarProps) {
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
      <div style={playerAvatarStyles.meta}>
        <span style={playerAvatarStyles.name}>{name}</span>
        <span style={playerAvatarStyles.status(isActive, isAlive)}>
          {isActive ? 'Acting' : isAlive ? 'In play' : 'Eliminated'}
        </span>
      </div>
    </div>
  );
}
