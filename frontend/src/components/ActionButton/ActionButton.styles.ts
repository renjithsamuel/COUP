import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const actionButtonStyles = {
  button: (disabled: boolean, isBluff = false, compact = false): CSSProperties => ({
    padding: compact
      ? `${tokens.spacing.xs + 1}px ${tokens.spacing.sm + 2}px`
      : `${tokens.spacing.sm + 2}px ${tokens.spacing.lg}px`,
    borderRadius: compact ? 8 : 10,
    border: disabled
      ? '1px solid transparent'
      : isBluff
        ? '1px solid rgba(239,83,80,0.25)'
        : '1px solid rgba(255,255,255,0.08)',
    fontWeight: 700,
    fontSize: compact ? 11 : 13,
    textTransform: 'uppercase',
    letterSpacing: compact ? 0.8 : 1.5,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? tokens.surface.card
      : isBluff
        ? 'linear-gradient(135deg, rgba(198,40,40,0.1) 0%, rgba(30,30,40,0.8) 100%)'
        : `linear-gradient(135deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
    color: disabled ? tokens.text.muted : tokens.text.primary,
    boxShadow: disabled ? 'none' : tokens.elevation.dp2,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: compact ? 4 : 6,
    position: 'relative',
  }),

  costBadge: (compact = false): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    marginLeft: compact ? 2 : tokens.spacing.xs,
    fontSize: compact ? 9 : 11,
    color: tokens.text.accent,
    fontWeight: 800,
  }),

  bluffBadge: (compact = false): CSSProperties => ({
    fontSize: compact ? 7 : 9,
    fontWeight: 800,
    color: '#EF5350',
    letterSpacing: compact ? 0.5 : 1,
    padding: compact ? '0px 3px' : '1px 5px',
    borderRadius: 4,
    background: 'rgba(239,83,80,0.15)',
    border: '1px solid rgba(239,83,80,0.2)',
    marginLeft: 2,
  }),
};
