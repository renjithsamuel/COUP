import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const turnIndicatorStyles = {
  wrapper: (isMyTurn: boolean): CSSProperties => ({
    padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
    borderRadius: 24,
    background: isMyTurn
      ? `linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,143,0,0.1))`
      : tokens.surface.card,
    border: isMyTurn
      ? `2px solid rgba(255,193,7,0.6)`
      : `1px solid ${tokens.surface.border}`,
    display: "inline-flex",
    alignItems: "center",
    gap: tokens.spacing.sm,
    fontSize: 13,
    fontWeight: 600,
    color: isMyTurn ? tokens.text.accent : tokens.text.secondary,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }),
};
