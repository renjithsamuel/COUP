import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';

export const preGameConfigStyles = {
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
    maxWidth: 420,
    width: '90%',
  } satisfies CSSProperties,

  title: {
    fontSize: 22,
    fontWeight: 900,
    color: tokens.text.primary,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacing.sm}px 0`,
    borderBottom: `1px solid ${tokens.surface.border}`,
  } satisfies CSSProperties,

  settingLabel: {
    fontSize: 13,
    color: tokens.text.secondary,
    fontWeight: 600,
  } satisfies CSSProperties,

  settingValue: {
    fontSize: 14,
    color: tokens.text.primary,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  } satisfies CSSProperties,

  select: {
    appearance: 'none',
    WebkitAppearance: 'none',
    padding: '6px 28px 6px 12px',
    borderRadius: 8,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: `${tokens.surface.elevated} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238B95A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`,
    color: tokens.text.primary,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    minWidth: 80,
    textAlign: 'right',
  } satisfies CSSProperties,

  buttons: {
    display: 'flex',
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.lg,
    justifyContent: 'center',
  } satisfies CSSProperties,

  startBtn: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.xl}px`,
    borderRadius: 10,
    border: '1px solid rgba(76,175,80,0.3)',
    background: 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(76,175,80,0.15))',
    color: '#81C784',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 0.5,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flex: 1,
  } satisfies CSSProperties,

  cancelBtn: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.xl}px`,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: tokens.surface.elevated,
    color: tokens.text.secondary,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    flex: 1,
  } satisfies CSSProperties,

  note: {
    fontSize: 11,
    color: tokens.text.muted,
    textAlign: 'center',
    marginTop: tokens.spacing.md,
    lineHeight: 1.5,
  } satisfies CSSProperties,
};
