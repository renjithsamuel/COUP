import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const timerStyles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: '8px 12px',
    borderRadius: 999,
    background: 'rgba(7, 12, 24, 0.72)',
    border: '1px solid rgba(255,255,255,0.08)',
  } satisfies CSSProperties,

  bar: {
    width: 148,
    height: 7,
    borderRadius: 999,
    background: tokens.surface.card,
    overflow: 'hidden',
    border: `1px solid ${tokens.surface.border}`,
  } satisfies CSSProperties,

  fill: (progress: number): CSSProperties => ({
    width: `${progress * 100}%`,
    height: '100%',
    borderRadius: 3,
    background:
      progress > 0.5
        ? 'linear-gradient(90deg, #2E7D32, #4CAF50)'
        : progress > 0.2
          ? `linear-gradient(90deg, #FF8F00, ${tokens.text.accent})`
          : 'linear-gradient(90deg, #C62828, #EF5350)',
    transition: 'width 0.3s linear, background 0.3s',
  }),

  text: {
    fontSize: 12,
    fontWeight: 800,
    color: tokens.text.primary,
    minWidth: 32,
    fontVariantNumeric: 'tabular-nums',
  } satisfies CSSProperties,
};
