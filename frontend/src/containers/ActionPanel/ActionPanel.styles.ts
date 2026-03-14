import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export function getActionPanelStyles(
  mobile: boolean,
  desktopTwoColumn = false,
) {
  return {
    dock: {
      width: "100%",
      maxWidth: mobile ? "100%" : desktopTwoColumn ? 404 : 860,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 4 : 8,
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
          ? `5px ${tokens.spacing.sm}px`
          : `${tokens.spacing.xs + 1}px ${tokens.spacing.sm - 1}px`
        : desktopTwoColumn
          ? `${tokens.spacing.xs + 5}px ${tokens.spacing.md}px`
          : `${tokens.spacing.xs + 4}px ${tokens.spacing.sm + 2}px`,
      background:
        "linear-gradient(180deg, rgba(15, 23, 39, 0.96) 0%, rgba(9, 14, 25, 0.98) 100%)",
      borderRadius: mobile ? 13 : desktopTwoColumn ? 18 : 16,
      border:
        tone === "danger"
          ? "1px solid rgba(251,113,133,0.24)"
          : tone === "warn"
            ? "1px solid rgba(246,196,69,0.24)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(96,165,250,0.2)",
      boxShadow: desktopTwoColumn
        ? "0 14px 28px rgba(0,0,0,0.2)"
        : "0 12px 24px rgba(0,0,0,0.18)",
      minHeight: mobile ? (compact ? 34 : 42) : desktopTwoColumn ? 58 : 52,
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
      padding: mobile ? "3px 6px" : "5px 8px",
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
      fontSize: mobile ? 8 : 10,
      fontWeight: 800,
      letterSpacing: 0.5,
      textTransform: "uppercase",
    }),

    cancelTargeting: {
      padding: mobile ? "4px 7px" : "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
      color: tokens.text.secondary,
      fontSize: mobile ? 9 : 11,
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
      display: mobile || desktopTwoColumn ? "grid" : "flex",
      gridTemplateColumns:
        mobile || desktopTwoColumn ? "repeat(2, minmax(0, 1fr))" : undefined,
      flexDirection: mobile || desktopTwoColumn ? undefined : "column",
      alignItems: mobile || desktopTwoColumn ? undefined : "center",
      gap: mobile ? 4 : desktopTwoColumn ? 8 : 8,
      justifyContent: mobile ? "stretch" : "center",
      padding: mobile ? "4px" : desktopTwoColumn ? "8px" : "10px",
      background: mobile
        ? "linear-gradient(180deg, rgba(14, 21, 38, 0.98) 0%, rgba(8, 13, 24, 0.98) 100%)"
        : "linear-gradient(180deg, rgba(15, 22, 38, 0.96) 0%, rgba(9, 14, 24, 0.985) 100%)",
      borderRadius: mobile ? 13 : desktopTwoColumn ? 18 : 18,
      border: mobile
        ? "1px solid rgba(255,255,255,0.08)"
        : "1px solid rgba(255,255,255,0.075)",
      boxShadow: mobile
        ? "0 12px 24px rgba(0,0,0,0.18)"
        : desktopTwoColumn
          ? "0 16px 30px rgba(0,0,0,0.22)"
          : "0 18px 34px rgba(0,0,0,0.24)",
      maxWidth: mobile ? "100%" : desktopTwoColumn ? "100%" : "fit-content",
      width: mobile ? "100%" : desktopTwoColumn ? "100%" : "fit-content",
      margin: "0 auto",
      minWidth: 0,
      boxSizing: "border-box",
    } satisfies CSSProperties,

    desktopRow: (row: "default" | "special"): CSSProperties => ({
      display: "grid",
      gridTemplateColumns:
        row === "default"
          ? "repeat(3, minmax(0, 164px))"
          : "repeat(4, minmax(0, 164px))",
      justifyContent: "stretch",
      alignItems: "stretch",
      gap: 6,
      width: "fit-content",
      maxWidth: "100%",
      minWidth: 0,
      padding: "3px",
      borderRadius: 14,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.012) 100%)",
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      marginInline: "auto",
    }),

    desktopButtonSlot: {
      width: 164,
      minWidth: 0,
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
