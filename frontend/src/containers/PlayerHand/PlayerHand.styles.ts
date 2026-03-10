import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export function getPlayerHandStyles(mobile: boolean) {
  return {
    wrapper: {
      display: 'flex',
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      padding: mobile
        ? `${tokens.spacing.xs}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
      background: `linear-gradient(180deg, transparent 0%, ${tokens.surface.overlay} 100%)`,
      borderRadius: mobile ? 8 : 16,
    } satisfies CSSProperties,
  };
}
