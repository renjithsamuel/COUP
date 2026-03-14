import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const playerAvatarStyles = {
  wrapper: (isActive: boolean, isAlive: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing.xs + 6,
    opacity: isAlive ? 1 : 0.35,
    filter: isAlive ? "none" : "grayscale(90%) brightness(0.7)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  }),

  avatar: (isActive: boolean): CSSProperties => ({
    width: 42,
    height: 42,
    borderRadius: 14,
    background: isActive
      ? "linear-gradient(145deg, #F6C445 0%, #B8860B 100%)"
      : "linear-gradient(145deg, rgba(27, 41, 67, 0.98) 0%, rgba(13, 20, 34, 0.98) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    color: isActive ? tokens.surface.bg : tokens.text.primary,
    boxShadow: isActive
      ? "0 16px 28px rgba(0,0,0,0.24), 0 0 28px rgba(246,196,69,0.24)"
      : "0 12px 24px rgba(0,0,0,0.2)",
    border: isActive
      ? "1px solid rgba(255,193,7,0.55)"
      : `1px solid ${tokens.surface.border}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
  }),

  meta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    minWidth: 0,
  } satisfies CSSProperties,

  name: {
    fontSize: 13,
    fontWeight: 700,
    color: tokens.text.primary,
    maxWidth: 88,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  status: (isActive: boolean, isAlive: boolean): CSSProperties => ({
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: isActive
      ? tokens.text.accent
      : isAlive
        ? tokens.text.secondary
        : "#FB7185",
  }),
};
