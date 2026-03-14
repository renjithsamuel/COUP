import { CSSProperties } from 'react';
import { ActionPresentation } from '@/models/action';
import { tokens } from '@/theme/tokens';

interface ActionButtonRippleStyle {
  left: number;
  top: number;
  size: number;
}

export const actionButtonStyles = {
  button: (
    disabled: boolean,
    isBluff = false,
    compact = false,
    selected = false,
    pressed = false,
    presentation?: ActionPresentation,
  ): CSSProperties => ({
    padding: compact
      ? '7px 7px 8px'
      : '10px 12px 9px',
    borderRadius: compact ? 10 : 12,
    border: disabled
      ? `1px solid ${tokens.surface.border}`
      : pressed && presentation
        ? `1px solid ${presentation.accent}`
      : selected
        ? '1px solid rgba(246, 196, 69, 0.5)'
      : isBluff
        ? '1px solid rgba(239,83,80,0.16)'
        : '1px solid rgba(255,255,255,0.12)',
    fontWeight: 700,
    fontSize: compact ? 9 : 11,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? 'linear-gradient(180deg, rgba(20, 28, 45, 0.92) 0%, rgba(12, 18, 30, 0.95) 100%)'
      : selected
        ? 'linear-gradient(180deg, rgba(56, 40, 10, 0.98) 0%, rgba(25, 19, 8, 0.98) 100%)'
        : 'linear-gradient(180deg, rgba(18, 28, 48, 0.98) 0%, rgba(10, 16, 30, 0.98) 100%)',
    color: disabled ? tokens.text.muted : tokens.text.primary,
    boxShadow: disabled
      ? 'none'
      : pressed && presentation
        ? `0 0 0 1px ${presentation.accent}66, 0 12px 24px rgba(0,0,0,0.24), 0 0 24px ${presentation.accent}3d, inset 0 0 0 1px ${presentation.accent}40`
      : selected
        ? '0 10px 18px rgba(0,0,0,0.24), 0 0 0 1px rgba(246,196,69,0.16), 0 0 18px rgba(246,196,69,0.1)'
        : '0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
    display: 'flex',
    alignItems: compact ? 'stretch' : 'center',
    justifyContent: 'space-between',
    gap: compact ? 4 : 8,
    position: 'relative',
    minWidth: 0,
    minHeight: compact ? 52 : 46,
    textAlign: compact ? 'center' : 'left',
    overflow: 'hidden',
    isolation: 'isolate',
  }),

  rippleLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    borderRadius: 'inherit',
    zIndex: 1,
  } satisfies CSSProperties,

  ripple: (ripple: ActionButtonRippleStyle, innerColor: string, midColor: string, outerColor: string): CSSProperties => ({
    position: 'absolute',
    left: ripple.left,
    top: ripple.top,
    width: ripple.size,
    height: ripple.size,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${innerColor} 0%, ${midColor} 34%, ${outerColor} 72%)`,
    boxShadow: `0 0 42px ${midColor}`,
    filter: 'blur(0.5px)',
    opacity: 0.95,
  }),

  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flex: 1,
    minWidth: 0,
  } satisfies CSSProperties,

  header: (compact: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: compact ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    flexDirection: compact ? 'column' : 'row',
    gap: compact ? 3 : tokens.spacing.xs,
    minWidth: 0,
    flex: 1,
    width: '100%',
  }),

  identityRow: (compact: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: compact ? 'center' : 'flex-start',
    gap: compact ? 5 : 8,
    minWidth: 0,
    flex: 1,
    width: '100%',
  }),

  iconShell: (disabled: boolean, selected: boolean, presentation: ActionPresentation): CSSProperties => ({
    width: 22,
    height: 22,
    minWidth: 22,
    borderRadius: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: disabled ? tokens.text.muted : presentation.accent,
    background: disabled
      ? 'rgba(255,255,255,0.05)'
      : selected
        ? presentation.tint
        : 'rgba(255,255,255,0.04)',
    border: `1px solid ${disabled ? 'rgba(255,255,255,0.08)' : selected ? presentation.accent : 'rgba(255,255,255,0.08)'}`,
  }),

  title: (disabled: boolean, presentation: ActionPresentation, compact = false): CSSProperties => ({
    fontWeight: 800,
    fontSize: compact ? 10 : 12,
    letterSpacing: compact ? 0 : 0.1,
    textTransform: 'uppercase',
    whiteSpace: compact ? 'normal' : 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: disabled ? tokens.text.muted : tokens.text.primary,
    lineHeight: compact ? 1 : 1.1,
    textAlign: compact ? 'left' : 'inherit',
  }),

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    flexWrap: 'wrap',
    flexShrink: 0,
  } satisfies CSSProperties,

  costBadge: (compact = false, presentation: ActionPresentation): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: compact ? 8 : 9,
    color: presentation.accent,
    fontWeight: 800,
    letterSpacing: 0.3,
    fontVariantNumeric: 'tabular-nums',
  }),

  targetHint: {
    position: 'absolute',
    right: 6,
    bottom: 4,
    fontSize: 6,
    fontWeight: 800,
    color: 'rgba(96, 165, 250, 0.72)',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  } satisfies CSSProperties,

  bluffHint: {
    position: 'absolute',
    right: 6,
    top: 4,
    fontSize: 6,
    fontWeight: 800,
    color: 'rgba(239, 83, 80, 0.84)',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  } satisfies CSSProperties,
};
