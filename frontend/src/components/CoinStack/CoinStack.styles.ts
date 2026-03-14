import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export const coinStackStyles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacing.xs,
  } satisfies CSSProperties,

  coin: {
    width: tokens.coin.size,
    height: tokens.coin.size,
    borderRadius: "50%",
    background: `radial-gradient(circle at 30% 30%, #FFE082, ${tokens.coin.color} 55%, #FF8F00)`,
    boxShadow: tokens.coin.shadow,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
    color: "#4E342E",
    userSelect: "none",
    border: "1px solid rgba(255,193,7,0.3)",
  } satisfies CSSProperties,

  count: {
    fontWeight: 800,
    fontSize: 17,
    color: tokens.text.accent,
    minWidth: 24,
    textAlign: "center",
  } satisfies CSSProperties,
};
