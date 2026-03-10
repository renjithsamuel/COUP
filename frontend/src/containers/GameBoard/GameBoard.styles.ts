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
      };
    },

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
  };
}

export function gameBoardStyles(mobile: boolean) {
  return s(mobile);
}

