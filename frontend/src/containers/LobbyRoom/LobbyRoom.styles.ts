import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const lobbyRoomStyles = {
  wrapper: {
    maxWidth: 480,
    margin: '0 auto',
    padding: tokens.spacing.xl,
    background: 'linear-gradient(165deg, rgba(10, 18, 36, 0.95) 0%, rgba(17, 28, 48, 0.94) 48%, rgba(18, 20, 36, 0.95) 100%)',
    borderRadius: 18,
    border: `1px solid ${tokens.surface.border}`,
    boxShadow: tokens.elevation.dp4,
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,

  bgLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.95,
  } satisfies CSSProperties,

  bgSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  } satisfies CSSProperties,

  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.md,
  } satisfies CSSProperties,

  title: {
    fontSize: 24,
    fontWeight: 900,
    color: tokens.text.primary,
    textAlign: 'center',
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  playerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  } satisfies CSSProperties,

  playerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`,
    background: tokens.surface.elevated,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.border}`,
    fontSize: 14,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  hostBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: tokens.text.accent,
    background: 'rgba(255,193,7,0.1)',
    padding: '2px 10px',
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    border: '1px solid rgba(255,193,7,0.2)',
  } satisfies CSSProperties,

  startButton: {
    padding: `${tokens.spacing.md}px`,
    borderRadius: 10,
    border: '1px solid rgba(76,175,80,0.3)',
    background: 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(76,175,80,0.15))',
    color: '#81C784',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 0.5,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } satisfies CSSProperties,

  waitingText: {
    textAlign: 'center',
    color: tokens.text.muted,
    fontSize: 13,
  } satisfies CSSProperties,
};
