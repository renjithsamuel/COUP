import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export function getGuideModalStyles(mobile: boolean) {
  return {
    overlay: {
      position: "fixed",
      inset: 0,
      background:
        "radial-gradient(circle at 50% 24%, rgba(255,193,7,0.08) 0%, rgba(2,6,15,0.78) 28%, rgba(2,6,15,0.9) 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: tokens.zIndex.modal,
      backdropFilter: "blur(12px)",
      padding: mobile ? "10px 8px" : "24px 16px",
    } satisfies CSSProperties,

    modal: {
      background:
        "linear-gradient(180deg, rgba(17, 27, 47, 0.98) 0%, rgba(13, 20, 36, 0.99) 100%)",
      borderRadius: mobile ? 22 : 28,
      padding: mobile ? "16px 14px" : "28px",
      boxShadow: "0 30px 80px rgba(0,0,0,0.46)",
      border: `1px solid ${tokens.surface.borderLight}`,
      width: mobile ? "min(100%, 420px)" : "min(920px, 100%)",
      maxHeight: mobile ? "min(92vh, 760px)" : "min(88vh, 860px)",
      overflow: "auto",
    } satisfies CSSProperties,

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: mobile ? 12 : 16,
      marginBottom: mobile ? 14 : 20,
    } satisfies CSSProperties,

    headerCopy: {
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 4 : 6,
      minWidth: 0,
    } satisfies CSSProperties,

    eyebrow: {
      fontSize: mobile ? 10 : 11,
      fontWeight: 800,
      letterSpacing: mobile ? 1.2 : 1.6,
      textTransform: "uppercase",
      color: tokens.text.accent,
    } satisfies CSSProperties,

    title: {
      fontSize: mobile ? 20 : 34,
      lineHeight: mobile ? 1.12 : 1.06,
      fontWeight: 900,
      color: tokens.text.accent,
      letterSpacing: 0.2,
    } satisfies CSSProperties,

    subtitle: {
      fontSize: mobile ? 11 : 14,
      color: tokens.text.secondary,
      lineHeight: mobile ? 1.55 : 1.6,
      maxWidth: 520,
    } satisfies CSSProperties,

    closeBtn: {
      width: mobile ? 38 : 44,
      height: mobile ? 38 : 44,
      borderRadius: "50%",
      border: `1px solid ${tokens.surface.borderLight}`,
      background: "rgba(255,255,255,0.03)",
      color: tokens.text.secondary,
      fontSize: mobile ? 18 : 22,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } satisfies CSSProperties,

    sectionGrid: {
      display: "grid",
      gridTemplateColumns: mobile
        ? "1fr"
        : "repeat(auto-fit, minmax(240px, 1fr))",
      gap: mobile ? 10 : 14,
    } satisfies CSSProperties,

    section: {
      marginBottom: mobile ? 10 : 14,
      padding: mobile ? "12px 12px" : "16px 18px",
      borderRadius: mobile ? 16 : 18,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${tokens.surface.border}`,
    } satisfies CSSProperties,

    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: mobile ? 8 : 10,
    } satisfies CSSProperties,

    sectionTitle: {
      fontSize: mobile ? 11 : 14,
      fontWeight: 800,
      color: tokens.text.primary,
      textTransform: "uppercase",
      letterSpacing: mobile ? 1.1 : 1.5,
    } satisfies CSSProperties,

    pinBtn: {
      padding: mobile ? "4px 8px" : "5px 10px",
      borderRadius: 999,
      border: "1px solid rgba(96,165,250,0.22)",
      background: "rgba(96,165,250,0.08)",
      color: "#B9D6FF",
      fontSize: mobile ? 9 : 10,
      fontWeight: 800,
      letterSpacing: 0.7,
      textTransform: "uppercase",
      cursor: "pointer",
      whiteSpace: "nowrap",
    } satisfies CSSProperties,

    text: {
      fontSize: mobile ? 12 : 14,
      color: tokens.text.secondary,
      lineHeight: mobile ? 1.65 : 1.8,
    } satisfies CSSProperties,

    characterRow: {
      display: "flex",
      alignItems: mobile ? "flex-start" : "center",
      gap: mobile ? 8 : tokens.spacing.sm,
      padding: mobile ? "8px 0" : "10px 0",
      borderBottom: `1px solid ${tokens.surface.border}`,
    } satisfies CSSProperties,

    characterDot: (color: string): CSSProperties => ({
      width: mobile ? 7 : 8,
      height: mobile ? 7 : 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      boxShadow: `0 0 6px ${color}66`,
      marginTop: mobile ? 4 : 0,
    }),

    characterName: {
      fontSize: mobile ? 12 : 14,
      fontWeight: 700,
      minWidth: mobile ? 84 : 110,
    } satisfies CSSProperties,

    characterAbility: {
      fontSize: mobile ? 11 : 13,
      color: tokens.text.secondary,
      lineHeight: mobile ? 1.45 : 1.6,
    } satisfies CSSProperties,
  };
}
