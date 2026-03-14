import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const gameOverModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(circle at 50% 20%, rgba(246,196,69,0.12) 0%, rgba(5,10,20,0.82) 42%, rgba(2,6,14,0.94) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(12px)',
    padding: `${tokens.spacing.lg}px`,
  } satisfies CSSProperties,

  modal: {
    background: 'linear-gradient(160deg, rgba(19, 31, 54, 0.98) 0%, rgba(12, 20, 37, 0.99) 48%, rgba(6, 11, 22, 1) 100%)',
    borderRadius: 28,
    padding: `${tokens.spacing.xl}px ${tokens.spacing.xl}px ${tokens.spacing.lg + 6}px`,
    textAlign: 'center',
    boxShadow: '0 0 0 1px rgba(255,193,7,0.18), 0 30px 80px rgba(0,0,0,0.62), 0 0 64px rgba(255,193,7,0.12)',
    border: '1px solid rgba(255,193,7,0.22)',
    maxWidth: 640,
    width: 'min(94vw, 640px)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.md,
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

  headerCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    maxWidth: 420,
  } satisfies CSSProperties,

  markWrap: {
    display: 'flex',
    justifyContent: 'center',
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
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  }),

  winnerName: {
    fontSize: 34,
    fontWeight: 900,
    color: tokens.text.primary,
    letterSpacing: 0.2,
  } satisfies CSSProperties,

  subtitle: {
    fontSize: 14,
    fontWeight: 600,
    color: tokens.text.secondary,
    lineHeight: 1.6,
    margin: '0 auto',
    maxWidth: 420,
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
