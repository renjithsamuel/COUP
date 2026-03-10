import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const guideModalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: tokens.zIndex.modal,
    backdropFilter: 'blur(8px)',
  } satisfies CSSProperties,

  modal: {
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

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.lg,
  } satisfies CSSProperties,

  title: {
    fontSize: 22,
    fontWeight: 900,
    color: tokens.text.accent,
    letterSpacing: 1,
  } satisfies CSSProperties,

  closeBtn: {
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

  section: {
    marginBottom: tokens.spacing.lg,
  } satisfies CSSProperties,

  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: tokens.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: tokens.spacing.sm,
  } satisfies CSSProperties,

  text: {
    fontSize: 13,
    color: tokens.text.secondary,
    lineHeight: 1.6,
  } satisfies CSSProperties,

  characterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm}px 0`,
    borderBottom: `1px solid ${tokens.surface.border}`,
  } satisfies CSSProperties,

  characterDot: (color: string): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
    boxShadow: `0 0 6px ${color}66`,
  }),

  characterName: {
    fontSize: 13,
    fontWeight: 700,
    minWidth: 90,
  } satisfies CSSProperties,

  characterAbility: {
    fontSize: 12,
    color: tokens.text.secondary,
    lineHeight: 1.4,
  } satisfies CSSProperties,
};
