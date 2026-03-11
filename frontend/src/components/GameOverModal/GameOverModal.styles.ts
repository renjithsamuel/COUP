import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameOverModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(12px)',
  } satisfies CSSProperties,

  modal: {
    background: `linear-gradient(160deg, #1a2540 0%, #111b2e 60%, #0b1120 100%)`,
    borderRadius: 24,
    padding: tokens.spacing.xxl,
    textAlign: 'center',
    boxShadow: '0 0 0 1px rgba(255,193,7,0.25), 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,193,7,0.12)',
    border: `1px solid rgba(255,193,7,0.3)`,
    maxWidth: 420,
    width: '90%',
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,

  title: {
    fontSize: 34,
    fontWeight: 900,
    background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 40%, #FF8F00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: tokens.spacing.md,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  winnerName: {
    fontSize: 24,
    fontWeight: 800,
    color: tokens.text.primary,
    marginBottom: tokens.spacing.lg,
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  button: {
    padding: `${tokens.spacing.sm + 4}px ${tokens.spacing.xl + 8}px`,
    borderRadius: 12,
    border: `1px solid rgba(255,193,7,0.45)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))`,
    color: tokens.text.accent,
    fontWeight: 800,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255,193,7,0.18), 0 4px 12px rgba(0,0,0,0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,
};
