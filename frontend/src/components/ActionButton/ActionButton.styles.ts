import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const actionButtonStyles = {
  button: (disabled: boolean, isBluff = false, compact = false, selected = false): CSSProperties => ({
    padding: compact
      ? '8px 10px'
      : '9px 10px',
    borderRadius: compact ? 10 : 12,
    border: disabled
      ? `1px solid ${tokens.surface.border}`
      : selected
        ? '1px solid rgba(246, 196, 69, 0.65)'
      : isBluff
        ? '1px solid rgba(239,83,80,0.25)'
        : '1px solid rgba(255,255,255,0.12)',
    fontWeight: 700,
    fontSize: compact ? 10 : 11,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? 'linear-gradient(180deg, rgba(20, 28, 45, 0.92) 0%, rgba(12, 18, 30, 0.95) 100%)'
      : selected
        ? 'linear-gradient(180deg, rgba(56, 40, 10, 0.98) 0%, rgba(25, 19, 8, 0.98) 100%)'
      : isBluff
        ? 'linear-gradient(180deg, rgba(62, 19, 19, 0.98) 0%, rgba(25, 14, 18, 0.96) 100%)'
        : 'linear-gradient(180deg, rgba(18, 28, 48, 0.98) 0%, rgba(10, 16, 30, 0.98) 100%)',
    color: disabled ? tokens.text.muted : tokens.text.primary,
    boxShadow: disabled
      ? 'none'
      : selected
        ? '0 10px 18px rgba(0,0,0,0.24), 0 0 0 1px rgba(246,196,69,0.16), 0 0 18px rgba(246,196,69,0.1)'
        : '0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: compact ? 4 : 6,
    position: 'relative',
    minWidth: 0,
    minHeight: compact ? 40 : 44,
    textAlign: 'left',
  }),

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.xs,
    minWidth: 0,
    flex: 1,
  } satisfies CSSProperties,

  title: {
    fontWeight: 800,
    fontSize: 11,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } satisfies CSSProperties,

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
      gap: 4,
    flexWrap: 'wrap',
  } satisfies CSSProperties,

  costBadge: (compact = false): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: compact ? 8 : 10,
    color: tokens.text.accent,
    fontWeight: 800,
    letterSpacing: 0.3,
  }),

  targetBadge: (compact = false, selected = false): CSSProperties => ({
    fontSize: compact ? 7 : 8,
    fontWeight: 800,
    color: selected ? tokens.text.accent : 'rgba(160, 188, 224, 0.9)',
    letterSpacing: 0.6,
    padding: compact ? '1px 4px' : '2px 6px',
    borderRadius: 999,
    background: selected ? 'rgba(246,196,69,0.14)' : 'rgba(96, 165, 250, 0.12)',
    border: selected ? '1px solid rgba(246,196,69,0.28)' : '1px solid rgba(96,165,250,0.22)',
    textTransform: 'uppercase',
  }),

  bluffBadge: (compact = false): CSSProperties => ({
    fontSize: compact ? 6 : 7,
    fontWeight: 800,
    color: '#EF5350',
    letterSpacing: compact ? 0.4 : 0.8,
    padding: compact ? '0px 3px' : '1px 4px',
    borderRadius: 4,
    background: 'rgba(239,83,80,0.15)',
    border: '1px solid rgba(239,83,80,0.2)',
    textTransform: 'uppercase',
  }),
};
