import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export function getOpponentAreaStyles(mobile: boolean, count: number) {
  const isMany = count > 3;
  const gap = mobile
    ? tokens.spacing.sm
    : (isMany ? tokens.spacing.sm : tokens.spacing.md);

  return {
    wrapper: mobile
      ? {
          display: 'flex',
          gap,
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          padding: `${tokens.spacing.xs}px ${tokens.spacing.xs}px`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } satisfies CSSProperties
      : {
          display: 'flex',
          justifyContent: 'center',
          gap,
          flexWrap: 'wrap' as const,
          padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
        } satisfies CSSProperties,

    opponentSlot: (isActive: boolean, isAlive: boolean): CSSProperties => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      gap: mobile ? 2 : tokens.spacing.sm,
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`,
      background: isActive
        ? 'rgba(255,193,7,0.06)'
        : tokens.surface.card,
      borderRadius: mobile ? 14 : 16,
      border: isActive
        ? '1.5px solid rgba(255,193,7,0.35)'
        : `1px solid ${tokens.surface.border}`,
      boxShadow: isActive
        ? '0 0 16px rgba(255,193,7,0.12), 0 2px 8px rgba(0,0,0,0.2)'
        : tokens.elevation.dp1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(mobile
        ? {
            flex: '0 0 auto',
            minWidth: 120,
            scrollSnapAlign: 'center' as const,
          }
        : {
            minWidth: isMany ? 110 : 140,
            maxWidth: 180,
            flex: isMany ? '1 1 auto' : '0 0 auto',
          }),
      opacity: isAlive ? 1 : 0.4,
      filter: isAlive ? 'none' : 'grayscale(80%)',
    }),

    infoRow: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: mobile ? 2 : tokens.spacing.xs,
    } satisfies CSSProperties,

    cardsRow: {
      display: 'flex',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      justifyContent: 'center',
    } satisfies CSSProperties,

    statsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.sm : tokens.spacing.md,
      paddingTop: mobile ? 2 : tokens.spacing.xs,
      borderTop: `1px solid ${tokens.surface.border}`,
      width: '100%',
      justifyContent: 'center',
    } satisfies CSSProperties,

    coinLabel: {
      fontSize: mobile ? 12 : 14,
      fontWeight: 700,
      color: tokens.coin.color,
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      fontVariantNumeric: 'tabular-nums',
    } satisfies CSSProperties,

    influenceLabel: {
      fontSize: mobile ? 10 : 12,
      fontWeight: 600,
      color: tokens.text.muted,
    } satisfies CSSProperties,

    offlineOverlay: {
      position: 'absolute',
      inset: 0,
      borderRadius: mobile ? 14 : 16,
      background: 'rgba(8, 12, 22, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4,
      pointerEvents: 'none',
    } satisfies CSSProperties,

    offlineBadge: {
      fontSize: mobile ? 9 : 10,
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: '#8B95A8',
      background: 'rgba(11, 17, 32, 0.88)',
      border: '1px solid rgba(139,149,168,0.25)',
      borderRadius: 6,
      padding: mobile ? '2px 6px' : '3px 8px',
    } satisfies CSSProperties,

    effectHalo: (role: 'actor' | 'target' | 'blocker', accent: string): CSSProperties => {
      const roleColors = {
        actor: '#F59E0B',    // Amber - who is acting
        target: '#EF4444',   // Red - who is targeted
        blocker: '#7C3AED',  // Violet - who is blocking
      };
      const color = roleColors[role];
      const roleOpacity = role === 'target' ? '44' : role === 'blocker' ? '32' : '20';
      return {
        position: 'absolute',
        inset: -2,
        borderRadius: mobile ? 16 : 18,
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 24px ${color}${roleOpacity}`,
        pointerEvents: 'none',
      };
    },

    effectTag: (role: 'actor' | 'target' | 'blocker', accent: string): CSSProperties => {
      const roleColors = {
        actor: '#F59E0B',    // Amber
        target: '#EF4444',   // Red
        blocker: '#7C3AED',  // Violet
      };
      const color = roleColors[role];
      return {
        position: 'absolute',
        top: 6,
        right: 8,
        padding: '2px 7px',
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: 'rgba(7, 12, 24, 0.92)',
        color: color,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.7,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        boxShadow: `0 0 10px ${color}66`,
      };
    },
  };
}
