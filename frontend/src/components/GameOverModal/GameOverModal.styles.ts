import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameOverModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(8px)',
  } satisfies CSSProperties,

  modal: {
    background: `linear-gradient(160deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
    borderRadius: 20,
    padding: tokens.spacing.xxl,
    textAlign: 'center',
    boxShadow: tokens.elevation.dp24,
    border: `1px solid ${tokens.surface.borderLight}`,
    maxWidth: 420,
    width: '90%',
  } satisfies CSSProperties,

  title: {
    fontSize: 30,
    fontWeight: 900,
    color: tokens.text.accent,
    marginBottom: tokens.spacing.md,
    letterSpacing: 1,
  } satisfies CSSProperties,

  winnerName: {
    fontSize: 22,
    fontWeight: 700,
    color: tokens.text.primary,
    marginBottom: tokens.spacing.lg,
  } satisfies CSSProperties,

  button: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.xl}px`,
    borderRadius: 10,
    border: `1px solid rgba(255,193,7,0.3)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,143,0,0.1))`,
    color: tokens.text.accent,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,
};
