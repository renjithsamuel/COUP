import { CSSProperties } from "react";
import { ActionPresentation } from "@/models/action";
import { tokens } from "@/theme/tokens";

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
    padding: compact ? "8px 10px" : "10px 12px",
    borderRadius: compact ? 10 : 12,
    border: disabled
      ? `1px solid ${tokens.surface.border}`
      : pressed && presentation
        ? `1px solid ${presentation.accent}`
        : selected
          ? "1px solid rgba(246, 196, 69, 0.5)"
          : isBluff
            ? "1px solid rgba(239,83,80,0.28)"
            : "1px solid rgba(255,255,255,0.12)",
    fontWeight: 700,
    fontSize: compact ? 9 : 11,
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled
      ? "linear-gradient(180deg, rgba(20, 28, 45, 0.92) 0%, rgba(12, 18, 30, 0.95) 100%)"
      : selected
        ? "linear-gradient(180deg, rgba(56, 40, 10, 0.98) 0%, rgba(25, 19, 8, 0.98) 100%)"
        : isBluff
          ? "linear-gradient(180deg, rgba(28, 21, 34, 0.98) 0%, rgba(18, 14, 26, 0.98) 100%)"
          : "linear-gradient(180deg, rgba(18, 28, 48, 0.98) 0%, rgba(10, 16, 30, 0.98) 100%)",
    color: disabled ? tokens.text.muted : tokens.text.primary,
    boxShadow: disabled
      ? "none"
      : pressed && presentation
        ? `0 0 0 1px ${presentation.accent}66, 0 12px 24px rgba(0,0,0,0.24), 0 0 24px ${presentation.accent}3d, inset 0 0 0 1px ${presentation.accent}40`
        : selected
          ? "0 10px 18px rgba(0,0,0,0.24), 0 0 0 1px rgba(246,196,69,0.16), 0 0 18px rgba(246,196,69,0.1)"
          : isBluff
            ? "0 10px 18px rgba(0,0,0,0.22), 0 0 0 1px rgba(239,83,80,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    position: "relative",
    minWidth: 0,
    minHeight: compact ? 52 : 56,
    textAlign: "left",
    overflow: "hidden",
    isolation: "isolate",
  }),

  rippleLayer: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
    borderRadius: "inherit",
    zIndex: 1,
  } satisfies CSSProperties,

  ripple: (
    ripple: ActionButtonRippleStyle,
    innerColor: string,
    midColor: string,
    outerColor: string,
  ): CSSProperties => ({
    position: "absolute",
    left: ripple.left,
    top: ripple.top,
    width: ripple.size,
    height: ripple.size,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${innerColor} 0%, ${midColor} 34%, ${outerColor} 72%)`,
    boxShadow: `0 0 42px ${midColor}`,
    filter: "blur(0.5px)",
    opacity: 0.95,
  }),

  content: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    width: "100%",
  } satisfies CSSProperties,

  row: (compact: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: compact ? 8 : 10,
    minWidth: 0,
    flex: 1,
    width: "100%",
  }),

  leadingGroup: (compact: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: compact ? 8 : 10,
    minWidth: 0,
    flex: 1,
  }),

  trailingGroup: (compact = false): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: compact ? 6 : 7,
    flexShrink: 0,
    minWidth: 0,
  }),

  iconShell: (
    disabled: boolean,
    selected: boolean,
    presentation: ActionPresentation,
  ): CSSProperties => ({
    width: 26,
    height: 26,
    minWidth: 26,
    borderRadius: 9,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: disabled ? tokens.text.muted : presentation.accent,
    background: disabled
      ? "rgba(255,255,255,0.05)"
      : selected
        ? presentation.tint
        : "rgba(255,255,255,0.04)",
    border: `1px solid ${disabled ? "rgba(255,255,255,0.08)" : selected ? presentation.accent : "rgba(255,255,255,0.08)"}`,
  }),

  title: (
    disabled: boolean,
    presentation: ActionPresentation,
    compact = false,
  ): CSSProperties => ({
    fontWeight: 800,
    fontSize: compact ? 10 : 12,
    letterSpacing: compact ? 0 : 0.1,
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: disabled ? tokens.text.muted : tokens.text.primary,
    lineHeight: 1.15,
    textAlign: "left",
    paddingRight: compact ? 2 : 4,
    display: "block",
  }),

  costBadge: (
    compact = false,
    presentation: ActionPresentation,
  ): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: compact ? "2px 0" : "3px 0",
    minWidth: compact ? 22 : 24,
    fontSize: compact ? 9 : 10,
    color: presentation.accent,
    fontWeight: 800,
    letterSpacing: 0.15,
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    flexShrink: 0,
    textAlign: "right",
  }),

  bluffIcon: (compact = false): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: compact ? 16 : 18,
    height: compact ? 16 : 18,
    borderRadius: 999,
    border: "1px solid rgba(239, 83, 80, 0.32)",
    background: "rgba(239, 83, 80, 0.12)",
    fontSize: compact ? 9 : 10,
    fontWeight: 900,
    color: "rgba(255, 210, 208, 0.95)",
    lineHeight: 1,
    boxShadow: "0 0 10px rgba(239,83,80,0.14)",
    flexShrink: 0,
  }),
};
