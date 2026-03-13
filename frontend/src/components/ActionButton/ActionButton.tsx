'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { scalePopVariants } from '@/animations';
import { ActionType, ACTION_RULES } from '@/models/action';
import { actionButtonStyles } from './ActionButton.styles';

export interface ActionButtonProps {
  actionType: ActionType;
  onClick: () => void;
  disabled?: boolean;
  playerCoins?: number;
  isBluff?: boolean;
  canAfford?: boolean;
  compact?: boolean;
  selected?: boolean;
  helperText?: string;
}

export function ActionButton({
  actionType,
  onClick,
  disabled = false,
  playerCoins,
  isBluff = false,
  canAfford = true,
  compact = false,
  selected = false,
  helperText,
}: ActionButtonProps) {
  const rule = ACTION_RULES[actionType];
  const cantAfford = !canAfford || (playerCoins != null && rule.cost > 0 && playerCoins < rule.cost);
  const isDisabled = disabled || cantAfford;
  const hint = helperText ?? rule.description;

  return (
    <motion.button
      type="button"
      variants={scalePopVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={isDisabled ? undefined : { scale: 1.06 }}
      whileTap={isDisabled ? undefined : { scale: 0.95 }}
      style={actionButtonStyles.button(isDisabled, isBluff, compact, selected)}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={`${hint}${isBluff ? ' (Bluff - you do not have this character)' : ''}`}
      aria-label={`${rule.label}${rule.cost > 0 ? ` (${rule.cost} coins)` : ''}${isBluff ? ' (bluff)' : ''}`}
    >
      <div style={actionButtonStyles.header}>
        <span style={actionButtonStyles.title}>{rule.label}</span>
        <div style={actionButtonStyles.metaRow}>
          {rule.cost > 0 && (
            <span style={actionButtonStyles.costBadge(compact)}>
              {rule.cost}c
            </span>
          )}
          {rule.requiresTarget && (
            <span style={actionButtonStyles.targetBadge(compact, selected)}>
              target
            </span>
          )}
          {isBluff && (
            <span style={actionButtonStyles.bluffBadge(compact)}>BLUFF</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
