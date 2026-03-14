import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export function getActionPanelStyles(mobile: boolean) {
  return {
    dock: {
      width: "100%",
      maxWidth: mobile ? "100%" : 1080,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 5 : 8,
      boxSizing: "border-box",
    } satisfies CSSProperties,

    bar: (
      tone: "info" | "warn" | "danger" | "ok",
      compact = false,
    ): CSSProperties => ({
      display: "flex",
      alignItems: mobile ? "center" : "center",
      justifyContent: "space-between",
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      flexDirection: mobile && compact ? "row" : mobile ? "column" : "row",
      padding: mobile
        ? compact
          ? `6px ${tokens.spacing.sm}px`
          : `${tokens.spacing.xs + 2}px ${tokens.spacing.sm}px`
        : `${tokens.spacing.xs + 4}px ${tokens.spacing.sm + 2}px`,
      background:
        "linear-gradient(180deg, rgba(15, 23, 39, 0.96) 0%, rgba(9, 14, 25, 0.98) 100%)",
      borderRadius: mobile ? 14 : 16,
      border:
        tone === "danger"
          ? "1px solid rgba(251,113,133,0.24)"
          : tone === "warn"
            ? "1px solid rgba(246,196,69,0.24)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(96,165,250,0.2)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
      minHeight: mobile ? (compact ? 38 : 48) : 52,
    }),

    barCopy: (compact = false): CSSProperties => ({
      display: "flex",
      flexDirection: compact ? "row" : "column",
      alignItems: compact ? "baseline" : "stretch",
      gap: compact ? 6 : 4,
      minWidth: 0,
      flex: 1,
    }),

    barEyebrow: {
      fontSize: mobile ? 10 : 11,
      color: tokens.text.accent,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: mobile ? 1 : 1.6,
    } satisfies CSSProperties,

    barTitle: {
      fontSize: mobile ? 12 : 13,
      color: tokens.text.primary,
      fontWeight: 800,
      lineHeight: 1.2,
    } satisfies CSSProperties,

    barMeta: (compact = false): CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexWrap: "wrap",
      justifyContent: compact ? "flex-end" : "flex-start",
      flexShrink: 0,
    }),

    metaChip: (
      tone: "info" | "warn" | "danger" | "ok" = "info",
    ): CSSProperties => ({
      padding: mobile ? "4px 7px" : "5px 8px",
      borderRadius: 999,
      border:
        tone === "danger"
          ? "1px solid rgba(251,113,133,0.2)"
          : tone === "warn"
            ? "1px solid rgba(246,196,69,0.2)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.18)"
              : "1px solid rgba(96,165,250,0.18)",
      background: "rgba(255,255,255,0.04)",
      color: tone === "warn" ? tokens.text.accent : tokens.text.secondary,
      fontSize: mobile ? 9 : 10,
      fontWeight: 800,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    }),

    cancelTargeting: {
      padding: mobile ? "5px 8px" : "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: tokens.text.secondary,
      fontSize: mobile ? 10 : 11,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      cursor: "pointer",
      whiteSpace: "nowrap",
    } satisfies CSSProperties,

    wrapperShell: {
      position: "relative",
      width: "100%",
      minWidth: 0,
    } satisfies CSSProperties,

    wrapper: {
      display: "grid",
      gridTemplateColumns: mobile
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(7, minmax(136px, 1fr))",
      gap: mobile ? 5 : 8,
      justifyContent: "stretch",
      padding: mobile ? "5px" : "8px",
      background:
        "linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(8, 13, 24, 0.98) 100%)",
      borderRadius: mobile ? 14 : 16,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
      maxWidth: mobile ? "100%" : 1100,
      margin: "0 auto",
      minWidth: 0,
      boxSizing: "border-box",
    } satisfies CSSProperties,

    inactiveOverlay: {
      position: "absolute",
      inset: 0,
      border: "none",
      borderRadius: mobile ? 14 : 16,
      background: "transparent",
      cursor: "not-allowed",
      zIndex: 2,
      padding: 0,
    } satisfies CSSProperties,
  };
}
