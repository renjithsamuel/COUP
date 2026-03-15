import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

interface LogVisual {
  accent: string;
  tint: string;
}

export const gameLogStyles = {
  container: (variant: "panel" | "modal"): CSSProperties => {
    void variant;
    return {
      minHeight: 0,
      height: "100%",
    };
  },

  wrapper: (variant: "panel" | "modal"): CSSProperties => ({
    maxHeight: "100%",
    height: "100%",
    overflowY: "auto",
    padding:
      variant === "panel"
        ? `0 ${tokens.spacing.xs}px ${tokens.spacing.md}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    background:
      variant === "panel"
        ? "transparent"
        : tokens.surface.card,
    borderRadius: variant === "panel" ? 0 : 10,
    border:
      variant === "panel"
        ? "none"
        : `1px solid ${tokens.surface.border}`,
    fontSize: 12,
    color: tokens.text.secondary,
    scrollBehavior: "smooth",
  }),

  emptyState: (variant: "panel" | "modal"): CSSProperties => {
    void variant;
    return {
      color: "#5A6478",
      fontSize: 12,
      padding: `${tokens.spacing.md}px ${tokens.spacing.sm}px`,
    };
  },

  entryRow: {
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr)",
    gap: tokens.spacing.sm,
    alignItems: "start",
    padding: `${tokens.spacing.sm}px 0`,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  } satisfies CSSProperties,

  metaColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    paddingTop: 2,
    alignItems: "flex-start",
  } satisfies CSSProperties,

  sequence: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: 1,
  } satisfies CSSProperties,

  messageColumn: (
    visual: LogVisual,
    variant: "panel" | "modal",
  ): CSSProperties => {
    void visual;
    void variant;
    return {
      position: "relative",
      display: "grid",
      gridTemplateColumns: "30px minmax(0, 1fr)",
      gap: 10,
      alignItems: "start",
      padding: "2px 0 0 0",
    };
  },

  iconShell: (visual: LogVisual): CSSProperties => ({
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: 10,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: visual.tint,
    color: visual.accent,
    border: `1px solid ${visual.accent}33`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 20px ${visual.accent}12`,
  }),

  messageStack: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  } satisfies CSSProperties,

  actionPill: (visual: LogVisual): CSSProperties => ({
    width: "fit-content",
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 999,
    background: visual.tint,
    color: visual.accent,
    border: `1px solid ${visual.accent}33`,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  }),

  message: {
    color: tokens.text.primary,
    fontSize: 13,
    lineHeight: 1.55,
    fontWeight: 500,
  } satisfies CSSProperties,

  messagePlain: {
    color: tokens.text.primary,
    fontWeight: 500,
  } satisfies CSSProperties,

  messagePlayer: (accent: string): CSSProperties => ({
    color: accent,
    fontWeight: 800,
  }),

  messageAction: (accent: string): CSSProperties => ({
    color: accent,
    fontWeight: 800,
  }),

  messageCard: (accent: string): CSSProperties => ({
    color: accent,
    fontWeight: 800,
  }),

  messageError: {
    color: "#FCA5A5",
    fontWeight: 800,
  } satisfies CSSProperties,

  timestamp: {
    fontSize: 10,
    color: tokens.text.muted,
    fontVariantNumeric: "tabular-nums",
  } satisfies CSSProperties,
};
