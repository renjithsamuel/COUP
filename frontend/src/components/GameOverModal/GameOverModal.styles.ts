import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameOverModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(10px)',
  } satisfies CSSProperties,

  modal: {
    background: `linear-gradient(160deg, #1a2540 0%, #111b2e 60%, #0b1120 100%)`,
    borderRadius: 20,
    padding: `${tokens.spacing.lg}px ${tokens.spacing.xl}px`,
    textAlign: 'center',
    boxShadow: '0 0 0 1px rgba(255,193,7,0.22), 0 20px 56px rgba(0,0,0,0.62), 0 0 34px rgba(255,193,7,0.1)',
    border: `1px solid rgba(255,193,7,0.3)`,
    maxWidth: 360,
    width: '90%',
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,

  title: {
    fontSize: 26,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 40%, #FF8F00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: tokens.spacing.xs + 4,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  winnerName: {
    fontSize: 18,
    fontWeight: 800,
    color: tokens.text.primary,
    marginBottom: tokens.spacing.md,
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  button: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.lg + 4}px`,
    borderRadius: 10,
    border: `1px solid rgba(255,193,7,0.45)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))`,
    color: tokens.text.accent,
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 0 14px rgba(255,193,7,0.16), 0 4px 12px rgba(0,0,0,0.35)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,
};
