import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const lobbyRoomStyles = {
  wrapper: {
    maxWidth: 720,
    margin: '0 auto',
    padding: 'clamp(22px, 5vw, 34px)',
    background: 'linear-gradient(165deg, rgba(10, 18, 36, 0.95) 0%, rgba(17, 28, 48, 0.94) 48%, rgba(18, 20, 36, 0.95) 100%)',
    borderRadius: 28,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: tokens.elevation.dp16,
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
    gap: 18,
  } satisfies CSSProperties,

  hero: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
    alignItems: 'stretch',
  } satisfies CSSProperties,

  heroCard: {
    padding: '16px 18px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,

  eyebrow: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.56)',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: 800,
  } satisfies CSSProperties,

  title: {
    fontSize: 28,
    fontWeight: 900,
    color: tokens.text.primary,
    textAlign: 'left',
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  subtitle: {
    color: tokens.text.secondary,
    fontSize: 13,
    lineHeight: 1.55,
  } satisfies CSSProperties,

  roomCodeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  } satisfies CSSProperties,

  roomCodeLabel: {
    fontSize: 11,
    color: tokens.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  } satisfies CSSProperties,

  roomCodeValue: {
    fontSize: 22,
    fontWeight: 900,
    color: tokens.text.accent,
    letterSpacing: 4,
    fontFamily: 'monospace',
  } satisfies CSSProperties,

  copyButton: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 999,
    color: tokens.text.secondary,
    fontSize: 11,
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 10,
  } satisfies CSSProperties,

  statCard: {
    padding: '14px 16px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } satisfies CSSProperties,

  statLabel: {
    color: tokens.text.muted,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  statValue: {
    color: tokens.text.primary,
    fontSize: 18,
    fontWeight: 800,
  } satisfies CSSProperties,

  playerList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
  } satisfies CSSProperties,

  playerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'linear-gradient(180deg, rgba(20, 31, 53, 0.94) 0%, rgba(12, 18, 32, 0.98) 100%)',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 14,
    color: tokens.text.primary,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  } satisfies CSSProperties,

  playerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } satisfies CSSProperties,

  playerName: {
    fontSize: 14,
    fontWeight: 700,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  playerCaption: {
    fontSize: 11,
    color: tokens.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    borderRadius: 14,
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
    padding: '8px 0 2px',
  } satisfies CSSProperties,

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  } satisfies CSSProperties,
};
