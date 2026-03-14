import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameOverModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at 50% 30%, rgba(246,196,69,0.12) 0%, rgba(0,0,0,0.84) 42%, rgba(0,0,0,0.92) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(10px)',
  } satisfies CSSProperties,

  modal: {
    background: 'linear-gradient(160deg, rgba(24, 38, 67, 0.98) 0%, rgba(14, 23, 40, 0.99) 52%, rgba(7, 12, 22, 1) 100%)',
    borderRadius: 28,
    padding: `${tokens.spacing.xl}px ${tokens.spacing.xl}px ${tokens.spacing.lg + 4}px`,
    textAlign: 'center',
    boxShadow: '0 0 0 1px rgba(255,193,7,0.18), 0 30px 80px rgba(0,0,0,0.68), 0 0 64px rgba(255,193,7,0.16)',
    border: '1px solid rgba(255,193,7,0.28)',
    maxWidth: 520,
    width: 'min(92vw, 520px)',
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,

  aura: {
    position: 'absolute',
    inset: 'auto -20% -24% auto',
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(246,196,69,0.22) 0%, rgba(246,196,69,0.04) 42%, rgba(246,196,69,0) 72%)',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,193,7,0.18)',
    color: tokens.text.accent,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: tokens.spacing.md,
  } satisfies CSSProperties,

  markWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
    filter: 'drop-shadow(0 18px 36px rgba(246,196,69,0.18))',
  } satisfies CSSProperties,

  title: (isWinner: boolean): CSSProperties => ({
    fontSize: 16,
    fontWeight: 900,
    background: isWinner
      ? 'linear-gradient(135deg, #FFC107 0%, #FFD54F 40%, #FF8F00 100%)'
      : 'linear-gradient(135deg, #9CC8FF 0%, #E2E8F0 45%, #7DD3FC 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 8,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  }),

  winnerName: {
    fontSize: 34,
    fontWeight: 900,
    color: tokens.text.primary,
    marginBottom: 10,
    letterSpacing: 0.2,
  } satisfies CSSProperties,

  subtitle: {
    fontSize: 14,
    fontWeight: 600,
    color: tokens.text.secondary,
    lineHeight: 1.6,
    margin: `0 auto ${tokens.spacing.lg}px`,
    maxWidth: 340,
  } satisfies CSSProperties,

  buttonRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: 12,
  } satisfies CSSProperties,

  primaryButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.lg + 4}px`,
    borderRadius: 14,
    border: `1px solid rgba(255,193,7,0.45)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))`,
    color: tokens.text.accent,
    fontWeight: 900,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(255,193,7,0.18), 0 10px 24px rgba(0,0,0,0.32)',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,

  secondaryButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: tokens.text.primary,
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,
};
