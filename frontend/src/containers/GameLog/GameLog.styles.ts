import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

interface LogVisual {
  accent: string;
  tint: string;
}

export const gameLogStyles = {
  container: (_variant: 'panel' | 'modal'): CSSProperties => ({
    minHeight: 0,
    height: '100%',
  }),

  wrapper: (variant: 'panel' | 'modal'): CSSProperties => ({
    maxHeight: '100%',
    height: '100%',
    overflowY: 'auto',
    padding: variant === 'panel' ? `${tokens.spacing.sm}px ${tokens.spacing.sm}px ${tokens.spacing.lg}px` : `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    background: variant === 'panel'
      ? 'linear-gradient(180deg, rgba(10, 16, 30, 0.42) 0%, rgba(10, 16, 30, 0.18) 100%)'
      : tokens.surface.card,
    borderRadius: variant === 'panel' ? 22 : 10,
    border: variant === 'panel' ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${tokens.surface.border}`,
    fontSize: 12,
    color: tokens.text.secondary,
    scrollBehavior: 'smooth',
  }),

  emptyState: (_variant: 'panel' | 'modal'): CSSProperties => ({
    color: '#5A6478',
    fontSize: 12,
    padding: `${tokens.spacing.md}px ${tokens.spacing.sm}px`,
  }),

  entryRow: {
    display: 'grid',
    gridTemplateColumns: '56px minmax(0, 1fr)',
    gap: tokens.spacing.sm,
    alignItems: 'start',
    padding: `${tokens.spacing.sm}px 0`,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } satisfies CSSProperties,

  metaColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    paddingTop: 2,
    alignItems: 'flex-start',
  } satisfies CSSProperties,

  sequence: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: 1,
  } satisfies CSSProperties,

  messageColumn: (visual: LogVisual, _variant: 'panel' | 'modal'): CSSProperties => ({
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '30px minmax(0, 1fr)',
    gap: 10,
    alignItems: 'start',
    padding: '2px 0 0 0',
  }),

  iconShell: (visual: LogVisual): CSSProperties => ({
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: visual.tint,
    color: visual.accent,
    border: `1px solid ${visual.accent}33`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 20px ${visual.accent}12`,
  }),

  messageStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
  } satisfies CSSProperties,

  actionPill: (visual: LogVisual): CSSProperties => ({
    width: 'fit-content',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: 999,
    background: visual.tint,
    color: visual.accent,
    border: `1px solid ${visual.accent}33`,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  }),

  message: {
    color: tokens.text.primary,
    fontSize: 13,
    lineHeight: 1.55,
    fontWeight: 700,
  } satisfies CSSProperties,

  timestamp: {
    fontSize: 10,
    color: tokens.text.muted,
    fontVariantNumeric: 'tabular-nums',
  } satisfies CSSProperties,
};
