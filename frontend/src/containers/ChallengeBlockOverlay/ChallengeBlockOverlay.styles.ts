import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

const btnBase = (mobile: boolean): CSSProperties => ({
  padding: mobile
    ? `${tokens.spacing.md}px ${tokens.spacing.md}px`
    : `${tokens.spacing.md}px ${tokens.spacing.xl + 6}px`,
  borderRadius: mobile ? 14 : 18,
  fontWeight: 700,
  fontSize: mobile ? 14 : 16,
  cursor: "pointer",
  letterSpacing: 0.8,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  minWidth: mobile ? 128 : 160,
  minHeight: mobile ? 48 : 56,
});

export function getChallengeBlockOverlayStyles(mobile: boolean) {
  return {
    wrapper: {
      position: "fixed",
      bottom: mobile ? 8 : 16,
      left: 0,
      right: 0,
      padding: mobile ? `0 ${tokens.spacing.sm}px` : `0 ${tokens.spacing.xl}px`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: tokens.zIndex.overlay,
    } satisfies CSSProperties,

    panel: {
      width: "100%",
      maxWidth: 1080,
      display: "flex",
      flexDirection: "column",
      gap: mobile ? tokens.spacing.sm : tokens.spacing.md,
      padding: mobile
        ? `${tokens.spacing.md}px`
        : `${tokens.spacing.lg}px ${tokens.spacing.xl}px`,
      borderRadius: mobile ? 22 : 28,
      background:
        "linear-gradient(180deg, rgba(12, 18, 34, 0.98) 0%, rgba(8, 12, 24, 0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.1)",
      boxShadow: "0 28px 60px rgba(0,0,0,0.34), 0 0 40px rgba(96,165,250,0.1)",
      backdropFilter: "blur(14px)",
    } satisfies CSSProperties,

    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing.sm,
      flexWrap: "wrap",
    } satisfies CSSProperties,

    phasePill: {
      padding: "6px 10px",
      borderRadius: 999,
      background: "rgba(96,165,250,0.12)",
      border: "1px solid rgba(96,165,250,0.22)",
      color: "#9CC8FF",
      fontSize: mobile ? 10 : 11,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
    } satisfies CSSProperties,

    headerHint: {
      fontSize: mobile ? 11 : 12,
      fontWeight: 700,
      color: tokens.text.accent,
      letterSpacing: 0.5,
    } satisfies CSSProperties,

    message: {
      fontSize: mobile ? 18 : 24,
      fontWeight: 800,
      color: tokens.text.primary,
      textAlign: "left",
      lineHeight: 1.25,
    } satisfies CSSProperties,

    responseHint: {
      fontSize: mobile ? 12 : 14,
      color: "#9FB0CB",
      fontWeight: 600,
      lineHeight: 1.5,
    } satisfies CSSProperties,

    buttons: {
      display: "flex",
      gap: mobile ? tokens.spacing.sm : tokens.spacing.md,
      flexWrap: "wrap",
      justifyContent: "flex-start",
    } satisfies CSSProperties,

    waitingState: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: mobile ? `${tokens.spacing.sm}px` : `${tokens.spacing.md}px`,
      borderRadius: mobile ? 16 : 18,
      background: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.18)",
    } satisfies CSSProperties,

    waitingTitle: {
      fontSize: mobile ? 13 : 15,
      color: "#81C784",
      fontWeight: 700,
    } satisfies CSSProperties,

    waitingDetail: {
      fontSize: mobile ? 11 : 12,
      color: "#A5D6A7",
      fontWeight: 600,
    } satisfies CSSProperties,

    waitingFooter: {
      fontSize: mobile ? 11 : 12,
      color: "#8EA3C2",
      fontWeight: 600,
    } satisfies CSSProperties,

    challengeBtn: {
      ...btnBase(mobile),
      border: "1px solid rgba(239,83,80,0.3)",
      background:
        "linear-gradient(180deg, rgba(88,24,24,0.98) 0%, rgba(45,16,18,0.96) 100%)",
      color: "#FEB2B2",
      boxShadow: "0 16px 30px rgba(0,0,0,0.24)",
    } satisfies CSSProperties,

    blockBtn: {
      ...btnBase(mobile),
      border: "1px solid rgba(30,136,229,0.3)",
      background:
        "linear-gradient(180deg, rgba(22, 46, 84, 0.98) 0%, rgba(12, 25, 48, 0.96) 100%)",
      color: "#9CC8FF",
      boxShadow: "0 16px 30px rgba(0,0,0,0.24)",
    } satisfies CSSProperties,

    acceptBtn: {
      ...btnBase(mobile),
      border: "1px solid rgba(255,255,255,0.14)",
      background:
        "linear-gradient(180deg, rgba(24, 36, 58, 0.98) 0%, rgba(12, 18, 32, 0.98) 100%)",
      color: tokens.text.primary,
    } satisfies CSSProperties,
  };
}
