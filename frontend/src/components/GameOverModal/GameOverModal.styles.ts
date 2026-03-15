import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const gameOverModalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 20%, rgba(246,196,69,0.12) 0%, rgba(5,10,20,0.82) 42%, rgba(2,6,14,0.94) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: tokens.zIndex.modal,
    backdropFilter: "blur(12px)",
    padding: `${tokens.spacing.md}px`,
  } satisfies CSSProperties,

  modal: (mobile: boolean, isWinner: boolean): CSSProperties => ({
    background:
      "linear-gradient(160deg, rgba(19, 31, 54, 0.98) 0%, rgba(12, 20, 37, 0.99) 48%, rgba(6, 11, 22, 1) 100%)",
    borderRadius: mobile ? 22 : 26,
    boxSizing: "border-box",
    padding: mobile
      ? `${tokens.spacing.sm + 3}px ${tokens.spacing.sm}px ${tokens.spacing.sm + 1}px`
      : isWinner
        ? `${tokens.spacing.md + 4}px ${tokens.spacing.md + 6}px ${tokens.spacing.md}px`
        : `${tokens.spacing.md + 2}px ${tokens.spacing.md + 2}px ${tokens.spacing.md}px`,
    textAlign: "center",
    boxShadow:
      "0 0 0 1px rgba(255,193,7,0.18), 0 30px 80px rgba(0,0,0,0.62), 0 0 64px rgba(255,193,7,0.12)",
    border: "1px solid rgba(255,193,7,0.22)",
    maxWidth: mobile ? 372 : isWinner ? 544 : 444,
    width: mobile
      ? "min(100%, 372px)"
      : isWinner
        ? "min(62vw, 544px)"
        : "min(56vw, 444px)",
    maxHeight: mobile ? "88dvh" : "min(80dvh, 640px)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: mobile ? 6 : 8,
  }),

  scrollArea: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: 0,
    minHeight: 0,
  } satisfies CSSProperties,

  aura: {
    position: "absolute",
    inset: "auto -20% -24% auto",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(246,196,69,0.22) 0%, rgba(246,196,69,0.04) 42%, rgba(246,196,69,0) 72%)",
    pointerEvents: "none",
  } satisfies CSSProperties,

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 11px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,193,7,0.18)",
    color: tokens.text.accent,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 2,
  } satisfies CSSProperties,

  headerCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    maxWidth: 300,
  } satisfies CSSProperties,

  topBar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  } satisfies CSSProperties,

  topCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: tokens.text.secondary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  } satisfies CSSProperties,

  compactHero: (mobile: boolean): CSSProperties => ({
    width: "100%",
    display: "flex",
    flexDirection: mobile ? "column" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: mobile ? 8 : 12,
  }),

  heroIdentity: (mobile: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: mobile ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: mobile ? 8 : 6,
    flexShrink: 0,
  }),

  markWrap: {
    display: "flex",
    justifyContent: "center",
    filter: "drop-shadow(0 18px 36px rgba(246,196,69,0.18))",
    transform: "scale(0.64)",
  } satisfies CSSProperties,

  title: (isWinner: boolean): CSSProperties => ({
    fontSize: 13,
    fontWeight: 900,
    background: isWinner
      ? "linear-gradient(135deg, #FFC107 0%, #FFD54F 40%, #FF8F00 100%)"
      : "linear-gradient(135deg, #9CC8FF 0%, #E2E8F0 45%, #7DD3FC 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  }),

  winnerName: {
    fontSize: 17,
    fontWeight: 900,
    color: tokens.text.primary,
    letterSpacing: 0.2,
    lineHeight: 1,
  } satisfies CSSProperties,

  subtitle: {
    fontSize: 12,
    fontWeight: 600,
    color: tokens.text.secondary,
    lineHeight: 1.4,
    margin: "0 auto",
    maxWidth: 300,
  } satisfies CSSProperties,

  summaryCard: (isWinner: boolean): CSSProperties => ({
    width: "100%",
    borderRadius: 16,
    padding: isWinner ? "12px 12px 10px" : "10px 12px",
    background: isWinner
      ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)"
      : "linear-gradient(180deg, rgba(125,211,252,0.08) 0%, rgba(255,255,255,0.03) 100%)",
    border: isWinner
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(125,211,252,0.18)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "flex-start",
    textAlign: "left",
  }),

  summaryHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  } satisfies CSSProperties,

  summaryEyebrow: (isWinner: boolean): CSSProperties => ({
    color: isWinner ? tokens.text.accent : "#9CC8FF",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  }),

  summaryThemeNote: {
    color: tokens.text.muted,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    textAlign: "right",
  } satisfies CSSProperties,

  summaryText: {
    color: tokens.text.primary,
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 700,
  } satisfies CSSProperties,

  previewShell: (mobile: boolean): CSSProperties => ({
    width: "100%",
    maxWidth: mobile ? "100%" : 420,
    alignSelf: "center",
    borderRadius: 16,
    padding: mobile ? 6 : 8,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  }),

  previewChrome: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  } satisfies CSSProperties,

  previewActions: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  } satisfies CSSProperties,

  previewLabel: {
    color: tokens.text.primary,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  } satisfies CSSProperties,

  iconButton: (disabled = false): CSSProperties => ({
    width: 30,
    height: 30,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.1)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(246,196,69,0.08))",
    color: tokens.text.primary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "wait" : "pointer",
    opacity: disabled ? 0.68 : 1,
    flexShrink: 0,
  }),

  previewImage: (mobile: boolean): CSSProperties => ({
    width: "100%",
    height: "auto",
    display: "block",
    borderRadius: 12,
    aspectRatio: "1200 / 630",
    objectFit: "contain",
    maxHeight: mobile ? 132 : 214,
  }),

  footerNote: {
    width: "100%",
    color: tokens.text.muted,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.45,
    textAlign: "center",
  } satisfies CSSProperties,

  buttonRow: (hasPrimaryAction: boolean): CSSProperties => ({
    display: "grid",
    width: "100%",
    gridTemplateColumns: hasPrimaryAction
      ? "repeat(2, minmax(0, 1fr))"
      : "minmax(0, 1fr)",
    gap: 8,
  }),

  primaryButton: (disabled = false): CSSProperties => ({
    padding: `${tokens.spacing.sm - 2}px ${tokens.spacing.md + 6}px`,
    borderRadius: 12,
    border: `1px solid rgba(255,193,7,0.45)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))`,
    color: tokens.text.accent,
    fontWeight: 900,
    fontSize: 10,
    cursor: disabled ? "wait" : "pointer",
    boxShadow: "0 0 20px rgba(255,193,7,0.18), 0 10px 24px rgba(0,0,0,0.32)",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    minHeight: 40,
    opacity: disabled ? 0.72 : 1,
  }),

  secondaryButton: {
    padding: `${tokens.spacing.sm - 2}px ${tokens.spacing.md + 2}px`,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: tokens.text.primary,
    fontWeight: 800,
    fontSize: 10,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(0,0,0,0.24)",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    minHeight: 40,
    opacity: 1,
  } satisfies CSSProperties,
};
