import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export function getPlayerHandStyles(mobile: boolean) {
  return {
    wrapper: {
      display: 'flex',
      gap: mobile ? 6 : tokens.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobile
        ? `4px ${tokens.spacing.xs + 4}px`
        : `${tokens.spacing.xs + 4}px ${tokens.spacing.md}px`,
      background: `linear-gradient(180deg, transparent 0%, ${tokens.surface.overlay} 100%)`,
      borderRadius: mobile ? 8 : 14,
      position: 'relative',
      overflow: 'visible',
    } satisfies CSSProperties,

    effectFrame: (role: 'actor' | 'target' | 'blocker', accent: string): CSSProperties => {
      const roleColors = {
        actor: '#F59E0B',    // Amber
        target: '#EF4444',   // Red
        blocker: '#7C3AED',  // Violet
      };
      const color = roleColors[role];
      const roleOpacity = {
        target: '66',
        blocker: '55',
        actor: '44',
      };
      return {
        position: 'absolute',
        inset: mobile ? -3 : -5,
        borderRadius: mobile ? 10 : 16,
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 24px ${color}${roleOpacity[role]}`,
        pointerEvents: 'none',
      };
    },

    effectLabel: (accent: string, role?: 'actor' | 'target' | 'blocker'): CSSProperties => {
      const roleColors = {
        actor: '#F59E0B',    // Amber
        target: '#EF4444',   // Red
        blocker: '#7C3AED',  // Violet
      };
      const color = role ? roleColors[role] : accent;
      return {
        position: 'absolute',
        top: mobile ? -16 : -18,
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: 'rgba(7, 12, 24, 0.92)',
        color: color,
        fontSize: mobile ? 8 : 9,
        fontWeight: 800,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      };
    },
  };
}
