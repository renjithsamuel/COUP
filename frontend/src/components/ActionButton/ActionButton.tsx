'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { scalePopVariants } from '@/animations';
import { ActionGlyph } from '@/components/ActionGlyph';
import { ActionType, ACTION_RULES, ACTION_PRESENTATIONS } from '@/models/action';
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
  const presentation = ACTION_PRESENTATIONS[actionType];
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
      <div style={actionButtonStyles.header(compact)}>
        <div style={actionButtonStyles.identityRow(compact)}>
          <span style={actionButtonStyles.iconShell(isDisabled, selected, presentation)}>
            <ActionGlyph name={presentation.icon} size={compact ? 12 : 16} />
          </span>
          <span style={actionButtonStyles.title(isDisabled, presentation, compact)}>{rule.label}</span>
        </div>
        <div style={actionButtonStyles.metaRow}>
          {rule.cost > 0 && (
            <span style={actionButtonStyles.costBadge(compact, presentation)}>
              {rule.cost}c
            </span>
          )}
        </div>
      </div>
      {isBluff && <span style={actionButtonStyles.bluffHint}>bluff</span>}
      {rule.requiresTarget && <span style={actionButtonStyles.targetHint}>target</span>}
    </motion.button>
  );
}
