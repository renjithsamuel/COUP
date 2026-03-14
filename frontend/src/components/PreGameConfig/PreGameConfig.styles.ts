import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

// Check if running in browser for mobile detection
const isMobile =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;

export const preGameConfigStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: tokens.zIndex.modal,
    backdropFilter: "blur(8px)",
    padding: "12px",
  } satisfies CSSProperties,

  modal: {
    background: `linear-gradient(160deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
    borderRadius: 16,
    padding: isMobile
      ? `${tokens.spacing.md}px ${tokens.spacing.sm}px`
      : tokens.spacing.xl,
    boxShadow: tokens.elevation.dp24,
    border: `1px solid ${tokens.surface.borderLight}`,
    maxWidth: 420,
    width: "100%",
    maxHeight: "90dvh",
    overflow: "auto",
  } satisfies CSSProperties,

  title: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 900,
    color: tokens.text.primary,
    textAlign: "center",
    marginBottom: isMobile ? tokens.spacing.md : tokens.spacing.lg,
    letterSpacing: 0.5,
  } satisfies CSSProperties,

  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${isMobile ? tokens.spacing.xs : tokens.spacing.sm}px 0`,
    borderBottom: `1px solid ${tokens.surface.border}`,
    gap: tokens.spacing.sm,
  } satisfies CSSProperties,

  settingLabel: {
    fontSize: isMobile ? 12 : 13,
    color: tokens.text.secondary,
    fontWeight: 600,
    wordBreak: "break-word",
  } satisfies CSSProperties,

  settingValue: {
    fontSize: isMobile ? 13 : 14,
    color: tokens.text.primary,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  } satisfies CSSProperties,

  select: {
    appearance: "none",
    WebkitAppearance: "none",
    padding: "6px 28px 6px 12px",
    borderRadius: 8,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: `${tokens.surface.elevated} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238B95A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`,
    color: tokens.text.primary,
    fontSize: isMobile ? 12 : 13,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    cursor: "pointer",
    outline: "none",
    transition: "border-color 0.2s ease",
    minWidth: 70,
    textAlign: "right",
    flexShrink: 0,
  } satisfies CSSProperties,

  peacefulRow: {
    marginTop: isMobile ? tokens.spacing.sm : tokens.spacing.md,
    padding: `${isMobile ? tokens.spacing.xs : tokens.spacing.sm}px 0`,
    borderBottom: `1px solid ${tokens.surface.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacing.sm,
  } satisfies CSSProperties,

  peacefulTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    flex: 1,
  } satisfies CSSProperties,

  peacefulLabel: {
    fontSize: isMobile ? 12 : 13,
    fontWeight: 700,
    color: tokens.text.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  } satisfies CSSProperties,

  peacefulHint: {
    fontSize: isMobile ? 10 : 11,
    fontWeight: 500,
    color: tokens.text.muted,
    lineHeight: 1.3,
  } satisfies CSSProperties,

  peacefulToggle: (enabled: boolean): CSSProperties => ({
    padding: isMobile ? "5px 12px" : "6px 14px",
    minWidth: 50,
    borderRadius: 999,
    border: `1px solid ${enabled ? "#7DD3FC" : tokens.surface.borderLight}`,
    background: enabled
      ? "linear-gradient(135deg, rgba(14, 116, 144, 0.22), rgba(3, 105, 161, 0.2))"
      : tokens.surface.elevated,
    color: enabled ? "#BAE6FD" : tokens.text.secondary,
    fontSize: isMobile ? 11 : 12,
    fontWeight: 800,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
  }),

  buttons: {
    display: "flex",
    gap: isMobile ? tokens.spacing.sm : tokens.spacing.md,
    marginTop: isMobile ? tokens.spacing.md : tokens.spacing.lg,
    justifyContent: "center",
  } satisfies CSSProperties,

  startBtn: {
    padding: `${isMobile ? tokens.spacing.xs + 2 : tokens.spacing.sm + 2}px ${isMobile ? tokens.spacing.md : tokens.spacing.xl}px`,
    borderRadius: 10,
    border: "1px solid rgba(76,175,80,0.3)",
    background:
      "linear-gradient(135deg, rgba(46,125,50,0.2), rgba(76,175,80,0.15))",
    color: "#81C784",
    fontWeight: 700,
    fontSize: isMobile ? 12 : 14,
    cursor: "pointer",
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 0.5,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    flex: 1,
  } satisfies CSSProperties,

  cancelBtn: {
    padding: `${isMobile ? tokens.spacing.xs + 2 : tokens.spacing.sm + 2}px ${isMobile ? tokens.spacing.md : tokens.spacing.xl}px`,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: tokens.surface.elevated,
    color: tokens.text.secondary,
    fontWeight: 700,
    fontSize: isMobile ? 12 : 14,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    flex: 1,
  } satisfies CSSProperties,

  note: {
    fontSize: isMobile ? 10 : 11,
    color: tokens.text.muted,
    textAlign: "center",
    marginTop: tokens.spacing.md,
    lineHeight: 1.5,
  } satisfies CSSProperties,
};
