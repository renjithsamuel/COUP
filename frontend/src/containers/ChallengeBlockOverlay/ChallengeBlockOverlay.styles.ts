import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

const btnBase = (mobile: boolean): CSSProperties => ({
  padding: mobile
    ? `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`
    : `${tokens.spacing.sm + 4}px ${tokens.spacing.xl + 4}px`,
  borderRadius: mobile ? 10 : 12,
  fontWeight: 700,
  fontSize: mobile ? 13 : 15,
  cursor: 'pointer',
  letterSpacing: 0.6,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  minWidth: mobile ? 90 : 110,
});

export function getChallengeBlockOverlayStyles(mobile: boolean) {
  return {
    wrapper: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: mobile ? `${tokens.spacing.sm}px ${tokens.spacing.sm}px` : tokens.spacing.lg,
      background: `linear-gradient(0deg, ${tokens.surface.bg} 0%, ${tokens.surface.overlay} 60%, transparent 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      zIndex: tokens.zIndex.overlay,
      backdropFilter: 'blur(8px)',
    } satisfies CSSProperties,

    message: {
      fontSize: mobile ? 12 : 15,
      fontWeight: 700,
      color: tokens.text.primary,
      textAlign: 'center',
    } satisfies CSSProperties,

    buttons: {
      display: 'flex',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      flexWrap: 'wrap',
      justifyContent: 'center',
    } satisfies CSSProperties,

    challengeBtn: {
      ...btnBase(mobile),
      border: '1px solid rgba(239,83,80,0.3)',
      background: 'linear-gradient(135deg, rgba(198,40,40,0.2), rgba(239,83,80,0.15))',
      color: '#EF5350',
      boxShadow: tokens.elevation.dp2,
    } satisfies CSSProperties,

    blockBtn: {
      ...btnBase(mobile),
      border: '1px solid rgba(30,136,229,0.3)',
      background: 'linear-gradient(135deg, rgba(21,101,192,0.2), rgba(30,136,229,0.15))',
      color: '#42A5F5',
      boxShadow: tokens.elevation.dp2,
    } satisfies CSSProperties,

    acceptBtn: {
      ...btnBase(mobile),
      border: `1px solid ${tokens.surface.borderLight}`,
      background: tokens.surface.elevated,
      color: tokens.text.secondary,
    } satisfies CSSProperties,
  };
}
