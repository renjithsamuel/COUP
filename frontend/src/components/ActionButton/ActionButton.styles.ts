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
    padding: compact ? "6px 8px" : "9px 11px",
    borderRadius: compact ? 9 : 14,
    border: disabled
      ? `1px solid ${tokens.surface.border}`
      : pressed && presentation
        ? `1px solid ${presentation.accent}`
        : selected
          ? "1px solid rgba(246, 196, 69, 0.5)"
          : isBluff
            ? "1px solid rgba(239,83,80,0.26)"
            : "1px solid rgba(255,255,255,0.1)",
    fontWeight: 700,
    fontSize: compact ? 8 : 10,
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled
      ? "linear-gradient(180deg, rgba(20, 28, 45, 0.92) 0%, rgba(12, 18, 30, 0.95) 100%)"
      : selected
        ? "linear-gradient(180deg, rgba(56, 40, 10, 0.98) 0%, rgba(25, 19, 8, 0.98) 100%)"
        : isBluff
          ? "linear-gradient(180deg, rgba(31, 22, 33, 0.98) 0%, rgba(18, 14, 24, 0.98) 100%)"
          : "linear-gradient(180deg, rgba(18, 27, 45, 0.98) 0%, rgba(10, 16, 28, 0.985) 100%)",
    color: disabled ? tokens.text.muted : tokens.text.primary,
    boxShadow: disabled
      ? "none"
      : pressed && presentation
        ? `0 0 0 1px ${presentation.accent}66, 0 14px 26px rgba(0,0,0,0.24), 0 0 22px ${presentation.accent}33, inset 0 0 0 1px ${presentation.accent}33`
        : selected
          ? "0 14px 24px rgba(0,0,0,0.24), 0 0 0 1px rgba(246,196,69,0.14), 0 0 16px rgba(246,196,69,0.08)"
          : isBluff
            ? "0 12px 22px rgba(0,0,0,0.22), 0 0 0 1px rgba(239,83,80,0.08), inset 0 1px 0 rgba(255,255,255,0.045)"
            : "0 10px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.045)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    position: "relative",
    minWidth: 0,
    minHeight: compact ? 44 : 54,
    width: "100%",
    boxSizing: "border-box",
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
    gap: compact ? 6 : 8,
    minWidth: 0,
    flex: 1,
    width: "100%",
  }),

  leadingGroup: (compact: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: compact ? 6 : 8,
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
    compact: boolean,
    presentation: ActionPresentation,
  ): CSSProperties => ({
    width: compact ? 22 : 24,
    height: compact ? 22 : 24,
    minWidth: compact ? 22 : 24,
    borderRadius: compact ? 8 : 8,
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
    fontSize: compact ? 9 : 11,
    letterSpacing: compact ? 0 : 0.08,
    textTransform: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: disabled ? tokens.text.muted : tokens.text.primary,
    lineHeight: compact ? 1.05 : 1.1,
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
    padding: compact ? "1px 0" : "3px 0",
    minWidth: compact ? 18 : 24,
    fontSize: compact ? 8 : 10,
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
    width: compact ? 14 : 18,
    height: compact ? 14 : 18,
    borderRadius: 999,
    border: "1px solid rgba(239, 83, 80, 0.32)",
    background: "rgba(239, 83, 80, 0.12)",
    fontSize: compact ? 8 : 10,
    fontWeight: 900,
    color: "rgba(255, 210, 208, 0.95)",
    lineHeight: 1,
    boxShadow: "0 0 10px rgba(239,83,80,0.14)",
    flexShrink: 0,
  }),
};
