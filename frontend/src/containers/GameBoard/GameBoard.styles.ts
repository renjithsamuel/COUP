import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

function s(mobile: boolean) {
  return {
    wrapper: {
      minHeight: '100vh',
      maxHeight: '100vh',
      background: tokens.board.bg,
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      gridTemplateColumns: '1fr',
      position: 'relative',
      overflow: 'hidden',
    } satisfies CSSProperties,

    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
      background: 'transparent',
      zIndex: 20,
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      minHeight: mobile ? 36 : 44,
    } satisfies CSSProperties,

    topBarLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      flex: 1,
      minWidth: 0,
    } satisfies CSSProperties,

    topBarRight: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      flexShrink: 0,
    } satisfies CSSProperties,

    center: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: mobile
        ? `0px ${tokens.spacing.xs}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
      overflow: 'auto',
      gap: mobile ? 2 : 0,
    } satisfies CSSProperties,

    statusBar: {
      minHeight: mobile ? 54 : 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobile ? `${tokens.spacing.xs}px 0` : `${tokens.spacing.sm}px 0`,
    } satisfies CSSProperties,

    responseStatus: (tone: 'danger' | 'warn' | 'info' | 'ok'): CSSProperties => {
      const palette = {
        danger: { border: '#FB7185', glow: 'rgba(251,113,133,0.2)' },
        warn: { border: '#F59E0B', glow: 'rgba(245,158,11,0.18)' },
        info: { border: '#60A5FA', glow: 'rgba(96,165,250,0.16)' },
        ok: { border: '#34D399', glow: 'rgba(52,211,153,0.16)' },
      }[tone];

      return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: mobile ? '6px 10px' : '8px 14px',
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        background: 'linear-gradient(145deg, rgba(12, 18, 34, 0.9) 0%, rgba(8, 12, 24, 0.88) 100%)',
        boxShadow: `0 8px 28px ${palette.glow}`,
        textAlign: 'center',
        maxWidth: mobile ? '100%' : 560,
      };
    },

    responseStatusTitle: {
      fontSize: mobile ? 11 : 12,
      fontWeight: 800,
      letterSpacing: 0.9,
      textTransform: 'uppercase',
      color: tokens.text.primary,
    } satisfies CSSProperties,

    responseStatusDetail: {
      fontSize: mobile ? 10 : 12,
      fontWeight: 600,
      color: tokens.text.secondary,
      letterSpacing: 0.2,
    } satisfies CSSProperties,

    turnArea: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: mobile ? '2px 0' : `${tokens.spacing.xs}px 0`,
    } satisfies CSSProperties,

    sidePanel: (_open: boolean): CSSProperties => ({
      display: 'none',
    }),

    dashboardPanel: (_open: boolean): CSSProperties => ({
      display: 'none',
    }),

    /* ── Modal styles (for leaderboard, game log) ── */
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: tokens.zIndex.modal,
      backdropFilter: 'blur(8px)',
    } satisfies CSSProperties,

    modalContent: {
      background: `linear-gradient(160deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
      borderRadius: 20,
      padding: tokens.spacing.xl,
      boxShadow: tokens.elevation.dp24,
      border: `1px solid ${tokens.surface.borderLight}`,
      maxWidth: 520,
      width: '92%',
      maxHeight: '85vh',
      overflow: 'auto',
    } satisfies CSSProperties,

    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.lg,
    } satisfies CSSProperties,

    modalTitle: {
      fontSize: 22,
      fontWeight: 900,
      color: tokens.text.accent,
      letterSpacing: 1,
    } satisfies CSSProperties,

    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: `1px solid ${tokens.surface.borderLight}`,
      background: 'transparent',
      color: tokens.text.secondary,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } satisfies CSSProperties,

    bottomArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: mobile ? 4 : tokens.spacing.sm,
      paddingBottom: mobile ? 2 : tokens.spacing.sm,
    } satisfies CSSProperties,

    playerCardArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: mobile ? 4 : tokens.spacing.sm,
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.md}px ${tokens.spacing.xl}px`,
      background: tokens.surface.card,
      borderRadius: mobile ? 10 : 18,
      border: `1px solid ${tokens.surface.border}`,
      boxShadow: tokens.elevation.dp4,
    } satisfies CSSProperties,

    playerInfoInline: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      paddingBottom: mobile ? 2 : tokens.spacing.sm,
      borderBottom: `1px solid ${tokens.surface.border}`,
      width: '100%',
      justifyContent: 'center',
    } satisfies CSSProperties,

    playerNameLarge: {
      fontSize: mobile ? 14 : 20,
      fontWeight: 800,
      color: tokens.text.primary,
      letterSpacing: 0.5,
    } satisfies CSSProperties,

    playerCoinsLarge: {
      fontSize: mobile ? 14 : 20,
      fontWeight: 800,
      color: tokens.coin.color,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    } satisfies CSSProperties,

    utilBtn: {
      width: mobile ? 30 : 34,
      height: mobile ? 30 : 34,
      borderRadius: '50%',
      border: `1px solid ${tokens.surface.borderLight}`,
      background: 'rgba(11, 17, 32, 0.5)',
      backdropFilter: 'blur(8px)',
      color: tokens.text.secondary,
      fontSize: mobile ? 14 : 16,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
      flexShrink: 0,
      padding: 0,
    } satisfies CSSProperties,

    exitBtn: {
      height: mobile ? 30 : 34,
      borderRadius: 999,
      border: '1px solid rgba(239,83,80,0.38)',
      background: 'rgba(239,83,80,0.12)',
      color: '#EF5350',
      fontSize: mobile ? 11 : 12,
      fontWeight: 800,
      letterSpacing: 0.4,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
      flexShrink: 0,
      padding: mobile ? '0 10px' : '0 12px',
    } satisfies CSSProperties,

    eventOverlay: (accent: string): CSSProperties => {
      return {
        position: 'fixed',
        top: mobile ? '14%' : '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: 'linear-gradient(155deg, rgba(9, 14, 28, 0.97) 0%, rgba(18, 27, 48, 0.94) 100%)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accent}`,
        borderRadius: 18,
        padding: mobile ? '14px 16px' : '18px 22px',
        minWidth: mobile ? 220 : 320,
        display: 'grid',
        gridTemplateColumns: mobile ? '52px 1fr' : '64px 1fr',
        gap: mobile ? 12 : 16,
        alignItems: 'center',
        pointerEvents: 'none',
        boxShadow: `0 18px 60px rgba(0,0,0,0.45), 0 0 32px ${accent}22`,
        overflow: 'hidden',
        isolation: 'isolate',
      };
    },

    eventEffectLayer: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    } satisfies CSSProperties,

    eventSymbol: (accent: string): CSSProperties => ({
      width: mobile ? 52 : 64,
      height: mobile ? 52 : 64,
      borderRadius: '50%',
      border: `1px solid ${accent}`,
      background: `radial-gradient(circle at 30% 30%, ${accent}44, rgba(255,255,255,0.05) 72%)`,
      color: accent,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: mobile ? 11 : 13,
      fontWeight: 900,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      boxShadow: `0 0 18px ${accent}22 inset`,
      position: 'relative',
      zIndex: 2,
    }),

    eventCoin: (accent: string): CSSProperties => ({
      position: 'absolute',
      left: '18%',
      bottom: '20%',
      width: mobile ? 12 : 14,
      height: mobile ? 12 : 14,
      borderRadius: '50%',
      background: `radial-gradient(circle at 35% 35%, #FFE082 0%, ${accent} 65%, rgba(0,0,0,0.2) 100%)`,
      boxShadow: `0 0 14px ${accent}77`,
    }),

    eventSlash: (accent: string): CSSProperties => ({
      position: 'absolute',
      left: '-10%',
      top: '48%',
      width: '60%',
      height: 3,
      background: `linear-gradient(90deg, transparent 0%, ${accent} 22%, #FFF1 55%, ${accent} 86%, transparent 100%)`,
      boxShadow: `0 0 16px ${accent}88`,
    }),

    eventSlashGlow: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '10%',
      top: '44%',
      width: '42%',
      height: 38,
      borderRadius: 999,
      background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
      filter: 'blur(2px)',
    }),

    eventShield: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '10%',
      top: '18%',
      width: mobile ? 90 : 110,
      height: mobile ? 90 : 110,
      borderRadius: '30% 30% 40% 40%',
      border: `1px solid ${accent}AA`,
      background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, transparent 72%)`,
      boxShadow: `0 0 28px ${accent}22 inset`,
      clipPath: 'polygon(50% 0%, 88% 18%, 82% 78%, 50% 100%, 18% 78%, 12% 18%)',
    }),

    eventSwapOrb: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '12%',
      top: '30%',
      width: mobile ? 14 : 16,
      height: mobile ? 14 : 16,
      borderRadius: '50%',
      background: accent,
      boxShadow: `0 0 16px ${accent}88`,
    }),

    eventImpactRing: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '14%',
      top: '22%',
      width: mobile ? 84 : 108,
      height: mobile ? 84 : 108,
      borderRadius: '50%',
      border: `2px solid ${accent}99`,
      boxShadow: `0 0 24px ${accent}33`,
    }),

    eventRevealCard: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '11%',
      top: '24%',
      width: mobile ? 54 : 64,
      height: mobile ? 76 : 88,
      borderRadius: 12,
      border: `1px solid ${accent}88`,
      background: `linear-gradient(160deg, ${accent}22 0%, rgba(255,255,255,0.05) 100%)`,
      boxShadow: `0 0 22px ${accent}1f`,
    }),

    eventChallengeMark: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '15%',
      top: '22%',
      color: accent,
      fontSize: mobile ? 48 : 62,
      fontWeight: 900,
      lineHeight: 1,
      textShadow: `0 0 24px ${accent}55`,
    }),

    eventVictoryGlow: (accent: string): CSSProperties => ({
      position: 'absolute',
      right: '12%',
      top: '18%',
      width: mobile ? 96 : 122,
      height: mobile ? 96 : 122,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${accent}33 0%, ${accent}11 42%, transparent 74%)`,
      boxShadow: `0 0 32px ${accent}22`,
    }),

    eventTextGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0,
      position: 'relative',
      zIndex: 2,
    } satisfies CSSProperties,

    eventTitle: (accent: string): CSSProperties => ({
      color: accent,
      fontSize: mobile ? 15 : 18,
      fontWeight: 900,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      lineHeight: 1.05,
    }),

    eventMessage: {
      color: tokens.text.primary,
      fontSize: mobile ? 12 : 14,
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: 0.2,
      textWrap: 'balance',
    } satisfies CSSProperties,

    eventPulse: (accent: string): CSSProperties => ({
      position: 'absolute',
      inset: 'auto 0 0 0',
      height: 3,
      background: `linear-gradient(90deg, transparent 0%, ${accent} 18%, ${accent} 82%, transparent 100%)`,
      boxShadow: `0 0 12px ${accent}66`,
      transformOrigin: 'center',
      zIndex: 1,
    }),

    confettiLayer: {
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 210,
    } satisfies CSSProperties,

    confettiPiece: (xPercent: number, color: string): CSSProperties => ({
      position: 'absolute',
      left: `${xPercent}%`,
      top: '-10vh',
      width: mobile ? 7 : 9,
      height: mobile ? 12 : 14,
      borderRadius: 2,
      background: color,
      boxShadow: `0 0 12px ${color}66`,
      transformOrigin: 'center',
    }),
  };
}

export function gameBoardStyles(mobile: boolean) {
  return s(mobile);
}

