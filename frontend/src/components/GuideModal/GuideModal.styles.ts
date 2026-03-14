import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const guideModalStyles = {
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
    padding: "24px 16px",
  } satisfies CSSProperties,

  modal: {
    background:
      "linear-gradient(180deg, rgba(17, 27, 47, 0.98) 0%, rgba(13, 20, 36, 0.99) 100%)",
    borderRadius: 28,
    padding: "28px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.46)",
    border: `1px solid ${tokens.surface.borderLight}`,
    width: "min(920px, 100%)",
    maxHeight: "min(88vh, 860px)",
    overflow: "auto",
  } satisfies CSSProperties,

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
  } satisfies CSSProperties,

  headerCopy: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  } satisfies CSSProperties,

  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: tokens.text.accent,
  } satisfies CSSProperties,

  title: {
    fontSize: 34,
    fontWeight: 900,
    color: tokens.text.accent,
    letterSpacing: 0.2,
  } satisfies CSSProperties,

  subtitle: {
    fontSize: 14,
    color: tokens.text.secondary,
    lineHeight: 1.6,
    maxWidth: 520,
  } satisfies CSSProperties,

  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `1px solid ${tokens.surface.borderLight}`,
    background: "rgba(255,255,255,0.03)",
    color: tokens.text.secondary,
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } satisfies CSSProperties,

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  } satisfies CSSProperties,

  section: {
    marginBottom: 14,
    padding: "16px 18px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${tokens.surface.border}`,
  } satisfies CSSProperties,

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  } satisfies CSSProperties,

  sectionTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: tokens.text.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  } satisfies CSSProperties,

  pinBtn: {
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(96,165,250,0.22)",
    background: "rgba(96,165,250,0.08)",
    color: "#B9D6FF",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    cursor: "pointer",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  text: {
    fontSize: 14,
    color: tokens.text.secondary,
    lineHeight: 1.8,
  } satisfies CSSProperties,

  characterRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing.sm,
    padding: "10px 0",
    borderBottom: `1px solid ${tokens.surface.border}`,
  } satisfies CSSProperties,

  characterDot: (color: string): CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    boxShadow: `0 0 6px ${color}66`,
  }),

  characterName: {
    fontSize: 14,
    fontWeight: 700,
    minWidth: 110,
  } satisfies CSSProperties,

  characterAbility: {
    fontSize: 13,
    color: tokens.text.secondary,
    lineHeight: 1.6,
  } satisfies CSSProperties,
};
