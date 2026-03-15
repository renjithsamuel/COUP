import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const getPreGameConfigStyles = (isMobile: boolean) => ({
  overlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "12px" : "20px",
    background:
      "radial-gradient(circle at top, rgba(246,196,69,0.14) 0%, rgba(5,10,20,0.84) 38%, rgba(2,6,14,0.95) 100%)",
    backdropFilter: "blur(12px)",
    zIndex: tokens.zIndex.modal,
  } satisfies CSSProperties,

  modal: {
    position: "relative",
    width: "100%",
    maxWidth: 640,
    maxHeight: "92dvh",
    overflow: "auto",
    boxSizing: "border-box",
    borderRadius: isMobile ? 20 : 24,
    padding: isMobile
      ? `${tokens.spacing.md}px ${tokens.spacing.sm + 2}px ${tokens.spacing.sm + 4}px`
      : `${tokens.spacing.xl}px ${tokens.spacing.xl}px ${tokens.spacing.lg + 4}px`,
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "linear-gradient(180deg, rgba(18,29,47,0.98) 0%, rgba(10,17,30,0.99) 52%, rgba(7,12,23,1) 100%)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.06), 0 28px 70px rgba(0,0,0,0.54), 0 18px 44px rgba(0,0,0,0.36)",
  } satisfies CSSProperties,

  glow: {
    position: "absolute",
    top: -30,
    right: -10,
    width: isMobile ? 160 : 220,
    height: isMobile ? 160 : 220,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(246,196,69,0.18) 0%, rgba(246,196,69,0.03) 48%, rgba(246,196,69,0) 72%)",
    pointerEvents: "none",
  } satisfies CSSProperties,

  header: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: isMobile ? 14 : 18,
  } satisfies CSSProperties,

  eyebrow: {
    fontSize: isMobile ? 10 : 11,
    fontWeight: 800,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: tokens.text.accent,
  } satisfies CSSProperties,

  title: {
    fontSize: isMobile ? 22 : 28,
    fontWeight: 900,
    letterSpacing: 0.3,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  subtitle: {
    fontSize: isMobile ? 12 : 13,
    lineHeight: 1.45,
    color: tokens.text.secondary,
    maxWidth: 500,
  } satisfies CSSProperties,

  tabRail: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
    marginBottom: isMobile ? 12 : 16,
  } satisfies CSSProperties,

  tabButton: (active: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    minHeight: isMobile ? 58 : 64,
    padding: isMobile ? "10px 12px" : "12px 14px",
    borderRadius: 16,
    border: active
      ? "1px solid rgba(255,193,7,0.28)"
      : "1px solid rgba(255,255,255,0.08)",
    background: active
      ? "linear-gradient(180deg, rgba(255,193,7,0.14) 0%, rgba(255,255,255,0.05) 100%)"
      : "rgba(255,255,255,0.04)",
    textAlign: "left",
    cursor: "pointer",
  }),

  tabTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  tabCaption: {
    fontSize: 11,
    lineHeight: 1.35,
    color: tokens.text.muted,
  } satisfies CSSProperties,

  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  } satisfies CSSProperties,

  summaryStrip: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "space-between",
    gap: 6,
    padding: isMobile ? "10px 12px" : "12px 14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  } satisfies CSSProperties,

  summaryLabel: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: tokens.text.accent,
  } satisfies CSSProperties,

  summaryValue: {
    fontSize: 12,
    lineHeight: 1.45,
    color: tokens.text.secondary,
  } satisfies CSSProperties,

  heroCard: {
    padding: isMobile ? "15px" : "18px",
    borderRadius: 22,
    border: "1px solid rgba(255,193,7,0.16)",
    background:
      "linear-gradient(180deg, rgba(255,193,7,0.1) 0%, rgba(255,255,255,0.03) 100%)",
  } satisfies CSSProperties,

  heroEyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: tokens.text.accent,
  } satisfies CSSProperties,

  heroTitle: {
    marginTop: 8,
    fontSize: isMobile ? 20 : 24,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  heroText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.55,
    color: tokens.text.secondary,
  } satisfies CSSProperties,

  simpleGrid: {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 10,
  } satisfies CSSProperties,

  primaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: isMobile ? "12px" : "14px",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)",
    boxShadow: "0 10px 28px rgba(0,0,0,0.16)",
  } satisfies CSSProperties,

  secondaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: isMobile ? "12px" : "14px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  } satisfies CSSProperties,

  secondaryTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  secondaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: tokens.text.secondary,
  } satisfies CSSProperties,

  fieldHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  } satisfies CSSProperties,

  fieldLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  fieldHint: {
    fontSize: 11,
    lineHeight: 1.35,
    color: tokens.text.muted,
  } satisfies CSSProperties,

  selectField: {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(7,12,22,0.68)",
    color: tokens.text.primary,
    padding: "0 14px",
    fontSize: 13,
    fontWeight: 700,
    outline: "none",
    appearance: "none",
  } satisfies CSSProperties,

  selectInput: {
    minHeight: isMobile ? 48 : 50,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "linear-gradient(180deg, rgba(15,24,40,0.96) 0%, rgba(9,15,28,0.98) 100%)",
    color: tokens.text.primary,
    fontSize: 13,
    fontWeight: 700,
    paddingInline: 14,
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.18)",
  } satisfies CSSProperties,

  selectDropdown: {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(18,29,47,0.98) 0%, rgba(9,15,28,0.99) 100%)",
    padding: 8,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 50px rgba(0,0,0,0.42)",
    backdropFilter: "blur(18px)",
  } satisfies CSSProperties,

  selectOption: {
    borderRadius: 14,
    padding: "10px 12px",
    fontSize: 12,
    fontWeight: 700,
    color: tokens.text.primary,
    background: "rgba(255,255,255,0.025)",
  } satisfies CSSProperties,

  selectSection: {
    color: tokens.text.accent,
  } satisfies CSSProperties,

  inlineNote: {
    fontSize: 11,
    lineHeight: 1.35,
    color: tokens.text.secondary,
  } satisfies CSSProperties,

  difficultyWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 2,
  } satisfies CSSProperties,

  difficultyLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: tokens.text.muted,
  } satisfies CSSProperties,

  advancedGrid: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
    gap: 10,
  } satisfies CSSProperties,

  advancedCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: isMobile ? "12px" : "14px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
  } satisfies CSSProperties,

  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  } satisfies CSSProperties,

  metricCard: {
    padding: isMobile ? "12px" : "14px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(7,12,22,0.54)",
  } satisfies CSSProperties,

  metricLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: tokens.text.muted,
  } satisfies CSSProperties,

  metricValue: {
    marginTop: 8,
    fontSize: isMobile ? 18 : 20,
    fontWeight: 800,
    color: tokens.text.primary,
  } satisfies CSSProperties,

  footer: {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: 14,
    marginTop: isMobile ? 16 : 18,
  } satisfies CSSProperties,

  footerSummary: {
    fontSize: 12,
    lineHeight: 1.5,
    color: tokens.text.secondary,
    flex: 1,
  } satisfies CSSProperties,

  buttonRow: {
    display: "flex",
    gap: 10,
    justifyContent: isMobile ? "stretch" : "flex-end",
  } satisfies CSSProperties,

  cancelButton: {
    minWidth: isMobile ? 110 : 120,
    padding: `${isMobile ? tokens.spacing.xs + 3 : tokens.spacing.sm + 3}px ${isMobile ? tokens.spacing.md : tokens.spacing.lg}px`,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: tokens.text.primary,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 700,
    cursor: "pointer",
    flex: isMobile ? 1 : "0 0 auto",
  } satisfies CSSProperties,

  confirmButton: {
    minWidth: isMobile ? 140 : 150,
    padding: `${isMobile ? tokens.spacing.xs + 3 : tokens.spacing.sm + 3}px ${isMobile ? tokens.spacing.md : tokens.spacing.xl}px`,
    borderRadius: 12,
    border: "1px solid rgba(255,193,7,0.34)",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.22), rgba(255,143,0,0.14))",
    color: tokens.text.accent,
    fontSize: isMobile ? 12 : 14,
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(0,0,0,0.24)",
    flex: isMobile ? 1 : "0 0 auto",
  } satisfies CSSProperties,
});
