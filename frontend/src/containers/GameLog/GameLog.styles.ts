import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameLogStyles = {
  wrapper: {
    maxHeight: 200,
    overflowY: 'auto',
    padding: tokens.spacing.sm,
    background: tokens.surface.card,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.border}`,
    fontSize: 12,
    color: tokens.text.secondary,
    scrollBehavior: 'smooth',
  } satisfies CSSProperties,

  entry: (type: string): CSSProperties => ({
    padding: `${tokens.spacing.xs + 1}px 0`,
    borderBottom: `1px solid ${tokens.surface.border}`,
    color:
      type === 'challenge'
        ? '#EF5350'
        : type === 'block'
          ? '#42A5F5'
          : type === 'elimination'
            ? '#FF7043'
            : type === 'turn'
              ? tokens.text.accent
              : tokens.text.secondary,
  }),

  timestamp: {
    fontSize: 10,
    color: tokens.text.muted,
    marginRight: tokens.spacing.xs,
    fontVariantNumeric: 'tabular-nums',
  } satisfies CSSProperties,

  title: {
    fontSize: 12,
    fontWeight: 700,
    color: tokens.text.primary,
    marginBottom: tokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  } satisfies CSSProperties,
};
