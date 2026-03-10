import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const playerAvatarStyles = {
  wrapper: (isActive: boolean, isAlive: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacing.xs + 2,
    opacity: isAlive ? 1 : 0.35,
    filter: isAlive ? 'none' : 'grayscale(90%) brightness(0.7)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }),

  avatar: (isActive: boolean): CSSProperties => ({
    width: 50,
    height: 50,
    borderRadius: '50%',
    background: isActive
      ? `linear-gradient(135deg, ${tokens.text.accent} 0%, #FF8F00 100%)`
      : `linear-gradient(135deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: isActive ? tokens.surface.bg : tokens.text.primary,
    boxShadow: isActive
      ? `0 0 16px rgba(255,193,7,0.35), ${tokens.elevation.dp4}`
      : tokens.elevation.dp2,
    border: isActive
      ? '2px solid rgba(255,193,7,0.5)'
      : `2px solid ${tokens.surface.border}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
  }),

  name: {
    fontSize: 12,
    fontWeight: 600,
    color: tokens.text.secondary,
    textAlign: 'center',
    maxWidth: 80,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,
};
