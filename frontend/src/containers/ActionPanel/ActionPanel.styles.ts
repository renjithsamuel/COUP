import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export function getActionPanelStyles(mobile: boolean) {
  return {
    wrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: mobile ? 4 : tokens.spacing.sm,
      justifyContent: 'center',
      padding: mobile ? `${tokens.spacing.xs}px ${tokens.spacing.xs}px` : tokens.spacing.md,
      background: tokens.surface.card,
      borderRadius: mobile ? 8 : 14,
      border: `1px solid ${tokens.surface.border}`,
      backdropFilter: 'blur(12px)',
      boxShadow: tokens.elevation.dp2,
    } satisfies CSSProperties,

    targetSelect: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.xs}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
      background: tokens.surface.card,
      borderRadius: mobile ? 6 : 12,
      border: `1px solid ${tokens.surface.border}`,
      marginBottom: 2,
    } satisfies CSSProperties,

    targetRow: {
      display: 'flex',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      flexWrap: 'wrap',
      justifyContent: 'center',
    } satisfies CSSProperties,

    targetButton: (isSelected: boolean): CSSProperties => ({
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.xs + 2}px ${tokens.spacing.md}px`,
      borderRadius: mobile ? 8 : 10,
      border: isSelected ? `2px solid ${tokens.text.accent}` : `1px solid ${tokens.surface.borderLight}`,
      background: isSelected ? 'rgba(255,193,7,0.12)' : tokens.surface.elevated,
      color: isSelected ? tokens.text.accent : tokens.text.primary,
      fontWeight: 600,
      fontSize: mobile ? 11 : 12,
      cursor: 'pointer',
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: mobile ? 4 : 6,
    }),

    targetAvatar: (isSelected: boolean): CSSProperties => ({
      width: mobile ? 18 : 22,
      height: mobile ? 18 : 22,
      borderRadius: '50%',
      background: isSelected ? 'rgba(255,193,7,0.25)' : tokens.surface.card,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: mobile ? 9 : 11,
      fontWeight: 700,
      color: isSelected ? tokens.text.accent : tokens.text.secondary,
    }),

    label: {
      fontSize: mobile ? 10 : 11,
      color: tokens.text.muted,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: mobile ? 1 : 2,
      marginBottom: tokens.spacing.xs,
      textAlign: 'center',
      width: '100%',
    } satisfies CSSProperties,
  };
}
