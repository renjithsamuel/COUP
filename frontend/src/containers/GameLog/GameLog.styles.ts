import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

const logTypePalette: Record<string, { accent: string; border: string; badge: string }> = {
  action: { accent: '#7DD3FC', border: 'rgba(125, 211, 252, 0.24)', badge: 'rgba(125, 211, 252, 0.14)' },
  challenge: { accent: '#FACC15', border: 'rgba(250, 204, 21, 0.24)', badge: 'rgba(250, 204, 21, 0.14)' },
  block: { accent: '#C084FC', border: 'rgba(192, 132, 252, 0.26)', badge: 'rgba(192, 132, 252, 0.14)' },
  reveal: { accent: '#FB7185', border: 'rgba(251, 113, 133, 0.24)', badge: 'rgba(251, 113, 133, 0.14)' },
  elimination: { accent: '#FB7185', border: 'rgba(251, 113, 133, 0.24)', badge: 'rgba(251, 113, 133, 0.14)' },
  turn: { accent: '#34D399', border: 'rgba(52, 211, 153, 0.24)', badge: 'rgba(52, 211, 153, 0.14)' },
  system: { accent: '#F6C445', border: 'rgba(246, 196, 69, 0.24)', badge: 'rgba(246, 196, 69, 0.14)' },
};

function getPalette(type: string) {
  return logTypePalette[type] ?? { accent: '#90A4AE', border: 'rgba(144, 164, 174, 0.22)', badge: 'rgba(144, 164, 174, 0.12)' };
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
    gridTemplateColumns: '84px minmax(0, 1fr)',
    gap: tokens.spacing.sm,
    alignItems: 'start',
    padding: `${tokens.spacing.sm}px 0`,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } satisfies CSSProperties,

  metaColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingTop: 2,
  } satisfies CSSProperties,

  typeLabel: (type: string): CSSProperties => {
    const palette = getPalette(type);
    return {
      display: 'inline-flex',
      alignItems: 'center',
      width: 'fit-content',
      padding: '3px 8px',
      borderRadius: 999,
      background: palette.badge,
      color: palette.accent,
      border: `1px solid ${palette.border}`,
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    };
  },

  messageColumn: (type: string, _variant: 'panel' | 'modal'): CSSProperties => {
    const palette = getPalette(type);
    return {
      position: 'relative',
      paddingLeft: tokens.spacing.sm,
      borderLeft: `2px solid ${palette.border}`,
    };
  },

  turnMarker: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm}px 0 ${tokens.spacing.xs + 6}px`,
  } satisfies CSSProperties,

  turnLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.08)',
  } satisfies CSSProperties,

  turnBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 10px',
    borderRadius: 999,
    background: 'rgba(52, 211, 153, 0.12)',
    color: '#6EE7B7',
    border: '1px solid rgba(52, 211, 153, 0.18)',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  message: {
    color: tokens.text.primary,
    fontSize: 13,
    lineHeight: 1.6,
    fontWeight: 600,
  } satisfies CSSProperties,

  timestamp: {
    fontSize: 10,
    color: tokens.text.muted,
    fontVariantNumeric: 'tabular-nums',
  } satisfies CSSProperties,
};
