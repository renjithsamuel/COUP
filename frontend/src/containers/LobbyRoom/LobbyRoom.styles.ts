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
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
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
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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

  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  } satisfies CSSProperties,

  sectionEyebrow: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: tokens.text.accent,
  } satisfies CSSProperties,

  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  modalRoomMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  } satisfies CSSProperties,

  modalRoomName: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: tokens.text.primary,
    fontSize: 12,
    fontWeight: 700,
  } satisfies CSSProperties,

  modalRoomCode: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 999,
    background: 'rgba(255,193,7,0.1)',
    border: '1px solid rgba(255,193,7,0.18)',
    color: tokens.text.accent,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.1,
    fontFamily: 'monospace',
  } satisfies CSSProperties,

  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } satisfies CSSProperties,

  leaderboardRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 16,
    background: 'linear-gradient(180deg, rgba(18, 29, 49, 0.92) 0%, rgba(10, 17, 31, 0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
  } satisfies CSSProperties,

  leaderboardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  } satisfies CSSProperties,

  leaderboardCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  } satisfies CSSProperties,

  leaderboardName: {
    fontSize: 14,
    fontWeight: 700,
    color: tokens.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } satisfies CSSProperties,

  leaderboardSubline: {
    fontSize: 11,
    color: tokens.text.muted,
  } satisfies CSSProperties,

  leaderboardWins: {
    fontSize: 13,
    fontWeight: 800,
    color: tokens.text.accent,
    flexShrink: 0,
  } satisfies CSSProperties,

  scoreBadge: {
    fontSize: 12,
    fontWeight: 800,
    color: '#FFD87A',
    flexShrink: 0,
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,216,122,0.18)',
    background: 'rgba(255,216,122,0.08)',
    letterSpacing: 0.4,
  } satisfies CSSProperties,

  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,193,7,0.14)',
    border: '1px solid rgba(255,193,7,0.2)',
    color: tokens.text.accent,
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  } satisfies CSSProperties,

  emptyLeaderboard: {
    fontSize: 12,
    color: tokens.text.muted,
    lineHeight: 1.5,
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

  playerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  } satisfies CSSProperties,

  kickButton: {
    minWidth: 88,
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid rgba(239,83,80,0.26)',
    background: 'rgba(239,83,80,0.1)',
    color: '#FEB2B2',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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

  footerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  } satisfies CSSProperties,

  secondaryButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: tokens.text.primary,
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  } satisfies CSSProperties,

  buttonIcon: {
    width: 16,
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } satisfies CSSProperties,

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: tokens.zIndex.modal,
    background: 'radial-gradient(circle at 50% 24%, rgba(255,193,7,0.08) 0%, rgba(3,7,16,0.82) 30%, rgba(3,7,16,0.92) 100%)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  } satisfies CSSProperties,

  modalCard: {
    width: 'min(760px, 100%)',
    maxHeight: 'min(84vh, 760px)',
    overflowY: 'auto',
    borderRadius: 28,
    padding: '26px 24px',
    background: 'linear-gradient(180deg, rgba(14, 22, 38, 0.99) 0%, rgba(18, 29, 49, 0.99) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.42)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  } satisfies CSSProperties,

  confirmCard: {
    width: 'min(440px, 100%)',
    borderRadius: 24,
    padding: '24px',
    background: 'linear-gradient(180deg, rgba(14, 22, 38, 0.99) 0%, rgba(8, 13, 24, 1) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.42)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  } satisfies CSSProperties,

  confirmCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,

  confirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  } satisfies CSSProperties,

  confirmDangerButton: {
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    borderRadius: 12,
    border: '1px solid rgba(239,83,80,0.3)',
    background: 'rgba(239,83,80,0.12)',
    color: '#FEB2B2',
    fontWeight: 800,
    fontSize: 12,
    cursor: 'pointer',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  } satisfies CSSProperties,

  modalHeaderCopy: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
  } satisfies CSSProperties,

  modalSubtitle: {
    fontSize: 13,
    color: tokens.text.secondary,
    lineHeight: 1.6,
    maxWidth: 520,
  } satisfies CSSProperties,

  closeButton: {
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: tokens.text.secondary,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    flexShrink: 0,
  } satisfies CSSProperties,
};
