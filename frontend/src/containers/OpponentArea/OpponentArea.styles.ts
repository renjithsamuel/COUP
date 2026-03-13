import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export function getOpponentAreaStyles(mobile: boolean, count: number) {
  const isMany = count > 3;
  const gap = mobile
    ? tokens.spacing.xs + 6
    : (isMany ? tokens.spacing.xs + 2 : tokens.spacing.xs + 6);

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
          padding: `${tokens.spacing.xs + 4}px 0 ${tokens.spacing.sm + 4}px`,
        } satisfies CSSProperties,

    opponentSlot: (isActive: boolean, isAlive: boolean, isSelectable: boolean, isTargetMode: boolean): CSSProperties => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      padding: mobile
        ? `${tokens.spacing.xs + 6}px ${tokens.spacing.xs + 6}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.sm}px`,
      background: isActive
        ? 'linear-gradient(180deg, rgba(38, 31, 10, 0.95) 0%, rgba(20, 18, 10, 0.96) 100%)'
        : isSelectable
          ? 'linear-gradient(180deg, rgba(19, 35, 60, 0.98) 0%, rgba(10, 17, 31, 0.98) 100%)'
          : 'linear-gradient(180deg, rgba(16, 24, 40, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)',
      borderRadius: mobile ? 18 : 20,
      border: isActive
        ? '1.5px solid rgba(255,193,7,0.45)'
        : isSelectable
          ? '1.5px solid rgba(96,165,250,0.42)'
          : `1px solid ${tokens.surface.border}`,
      boxShadow: isActive
        ? '0 22px 42px rgba(0,0,0,0.32), 0 0 36px rgba(255,193,7,0.12)'
        : isSelectable
          ? '0 18px 36px rgba(0,0,0,0.28), 0 0 30px rgba(96,165,250,0.12)'
          : '0 16px 30px rgba(0,0,0,0.22)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      ...(mobile
        ? {
            flex: '0 0 auto',
            minWidth: 144,
            scrollSnapAlign: 'center' as const,
          }
        : {
            minWidth: isMany ? 150 : 176,
            maxWidth: 208,
            flex: isMany ? '1 1 auto' : '0 0 auto',
          }),
      opacity: isAlive ? 1 : 0.4,
      filter: isAlive ? 'none' : 'grayscale(80%)',
      cursor: isSelectable ? 'pointer' : 'default',
      transform: isTargetMode && !isSelectable ? 'scale(0.98)' : 'none',
    }),

    topRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    } satisfies CSSProperties,

    cardsRow: {
      display: 'flex',
      gap: mobile ? 6 : tokens.spacing.xs + 2,
      justifyContent: 'center',
      padding: '0',
    } satisfies CSSProperties,

    statsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.xs + 2 : tokens.spacing.sm,
      paddingTop: mobile ? 3 : 5,
      borderTop: `1px solid rgba(255,255,255,0.08)`,
      width: '100%',
      justifyContent: 'space-between',
    } satisfies CSSProperties,

    coinBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: mobile ? '3px 8px' : '4px 10px',
      borderRadius: 999,
      background: 'rgba(255, 193, 7, 0.12)',
      border: '1px solid rgba(255, 193, 7, 0.2)',
      boxShadow: '0 0 18px rgba(255, 193, 7, 0.08)',
    } satisfies CSSProperties,

    coinDot: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#FFC107',
      boxShadow: '0 0 10px rgba(255, 193, 7, 0.6)',
      flexShrink: 0,
    } satisfies CSSProperties,

    coinLabel: {
      fontSize: mobile ? 12 : 13,
      fontWeight: 800,
      color: tokens.coin.color,
      display: 'flex',
      alignItems: 'center',
      fontVariantNumeric: 'tabular-nums',
    } satisfies CSSProperties,

    influenceLabel: {
      fontSize: mobile ? 10 : 11,
      fontWeight: 600,
      color: tokens.text.muted,
    } satisfies CSSProperties,

    outBadge: {
      fontSize: mobile ? 8 : 9,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: '#FB7185',
      padding: '3px 7px',
      borderRadius: 999,
      background: 'rgba(251,113,133,0.12)',
      border: '1px solid rgba(251,113,133,0.2)',
    } satisfies CSSProperties,

    selectTag: {
      position: 'absolute',
      top: 8,
      left: 8,
      zIndex: 4,
      padding: '3px 8px',
      borderRadius: 999,
      background: 'rgba(8, 14, 28, 0.92)',
      border: '1px solid rgba(96,165,250,0.32)',
      color: '#9CC8FF',
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      pointerEvents: 'none',
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
        right: 6,
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
