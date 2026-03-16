import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

export function getOpponentAreaStyles(mobile: boolean, count: number) {
  const gap = mobile ? tokens.spacing.xs + 2 : tokens.spacing.xs + 2;
  const seatWidth = mobile ? 148 : 206;
  const fadeWidth = mobile ? 14 : 20;
  const railInset = mobile ? fadeWidth + 10 : fadeWidth;
  const shouldCenterTrack = mobile ? count <= 2 : count <= 3;
  const fitsViewport = !mobile && count <= 3;

  return {
    shell: {
      position: "relative",
      width: "100%",
      minHeight: mobile ? 186 : 248,
      paddingBottom: mobile ? 2 : 4,
      minWidth: 0,
    } satisfies CSSProperties,

    viewport: {
      width: "100%",
      maxWidth: "100%",
      overflowX: fitsViewport ? "hidden" : "auto",
      overflowY: "hidden",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      scrollSnapType: "x proximity",
      scrollPaddingLeft: railInset,
      scrollPaddingRight: railInset,
      padding: `${mobile ? 2 : tokens.spacing.xs}px ${railInset}px ${mobile ? tokens.spacing.xs : tokens.spacing.sm + 4}px`,
      boxSizing: "border-box",
    } satisfies CSSProperties,

    track: {
      display: "flex",
      alignItems: "stretch",
      justifyContent: shouldCenterTrack ? "center" : "flex-start",
      gap,
      width: shouldCenterTrack ? "100%" : "max-content",
      minWidth: shouldCenterTrack ? "100%" : "max-content",
      maxWidth: fitsViewport ? "100%" : "none",
      boxSizing: "border-box",
    } satisfies CSSProperties,

    railSpacer: {
      flex: `0 0 ${railInset}px`,
      width: railInset,
      minWidth: railInset,
      pointerEvents: "none",
    } satisfies CSSProperties,

    edgeFade: (side: "left" | "right", visible: boolean): CSSProperties => ({
      position: "absolute",
      top: 0,
      bottom: mobile ? 2 : 4,
      [side]: 0,
      width: fadeWidth,
      zIndex: 3,
      pointerEvents: "none",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.22s ease",
      background:
        side === "left"
          ? "linear-gradient(90deg, rgba(8, 14, 28, 0.34) 0%, rgba(8, 14, 28, 0.16) 36%, rgba(8, 14, 28, 0.04) 68%, rgba(8, 14, 28, 0) 100%)"
          : "linear-gradient(270deg, rgba(8, 14, 28, 0.34) 0%, rgba(8, 14, 28, 0.16) 36%, rgba(8, 14, 28, 0.04) 68%, rgba(8, 14, 28, 0) 100%)",
      backdropFilter: "blur(2px)",
    }),

    opponentSlot: (
      isActive: boolean,
      isAlive: boolean,
      isSelectable: boolean,
      isTargetMode: boolean,
    ): CSSProperties => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      position: "relative",
      overflow: "hidden",
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      padding: mobile
        ? `${tokens.spacing.xs + 4}px ${tokens.spacing.xs + 4}px`
        : `${tokens.spacing.sm}px ${tokens.spacing.sm}px`,
      background: isActive
        ? "linear-gradient(180deg, rgba(38, 31, 10, 0.95) 0%, rgba(20, 18, 10, 0.96) 100%)"
        : isSelectable
          ? "linear-gradient(180deg, rgba(19, 35, 60, 0.98) 0%, rgba(10, 17, 31, 0.98) 100%)"
          : "linear-gradient(180deg, rgba(16, 24, 40, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)",
      borderRadius: mobile ? 16 : 20,
      border: isActive
        ? "1.5px solid rgba(255,193,7,0.45)"
        : isSelectable
          ? "1.5px solid rgba(96,165,250,0.42)"
          : `1px solid ${tokens.surface.border}`,
      boxShadow: isActive
        ? "0 20px 38px rgba(0,0,0,0.3), 0 0 30px rgba(255,193,7,0.1)"
        : isSelectable
          ? "0 18px 32px rgba(0,0,0,0.26), 0 0 26px rgba(96,165,250,0.1)"
          : "0 16px 28px rgba(0,0,0,0.22)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      width: seatWidth,
      minWidth: seatWidth,
      maxWidth: seatWidth,
      flex: `0 0 ${seatWidth}px`,
      scrollSnapAlign: "center",
      opacity: isAlive ? 1 : 0.4,
      filter: isAlive ? "none" : "grayscale(80%)",
      cursor: isSelectable ? "pointer" : "default",
      transform: isTargetMode && !isSelectable ? "scale(0.98)" : "none",
    }),

    topRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    } satisfies CSSProperties,

    cardsRow: {
      display: "flex",
      gap: mobile ? 6 : tokens.spacing.xs + 2,
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "nowrap",
      padding: "0",
    } satisfies CSSProperties,

    showdownCardShell: (isInteractive: boolean): CSSProperties => ({
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      cursor: isInteractive ? "pointer" : "default",
      borderRadius: tokens.card.borderRadius + 4,
      outline: "none",
    }),

    showdownRevealBadge: {
      position: "absolute",
      bottom: 8,
      left: "50%",
      transform: "translateX(-50%)",
      padding: mobile ? "3px 8px" : "4px 10px",
      borderRadius: 999,
      background: "rgba(8, 14, 28, 0.88)",
      border: "1px solid rgba(255,193,7,0.28)",
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
      color: tokens.text.accent,
      fontSize: mobile ? 8 : 9,
      fontWeight: 800,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    } satisfies CSSProperties,

    statsRow: {
      display: "flex",
      alignItems: "center",
      gap: mobile ? tokens.spacing.xs + 2 : tokens.spacing.xs + 6,
      paddingTop: mobile ? 2 : 5,
      borderTop: `1px solid rgba(255,255,255,0.08)`,
      width: "100%",
      justifyContent: "space-between",
    } satisfies CSSProperties,

    coinBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: mobile ? "2px 7px" : "4px 10px",
      borderRadius: 999,
      background: "rgba(255, 193, 7, 0.12)",
      border: "1px solid rgba(255, 193, 7, 0.2)",
      boxShadow: "0 0 18px rgba(255, 193, 7, 0.08)",
    } satisfies CSSProperties,

    coinDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#FFC107",
      boxShadow: "0 0 10px rgba(255, 193, 7, 0.6)",
      flexShrink: 0,
    } satisfies CSSProperties,

    coinLabel: {
      fontSize: mobile ? 11 : 13,
      fontWeight: 800,
      color: tokens.coin.color,
      display: "flex",
      alignItems: "center",
      fontVariantNumeric: "tabular-nums",
    } satisfies CSSProperties,

    influenceLabel: {
      fontSize: mobile ? 9 : 11,
      fontWeight: 600,
      color: tokens.text.muted,
    } satisfies CSSProperties,

    outBadge: {
      fontSize: mobile ? 8 : 9,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: "#FB7185",
      padding: "3px 7px",
      borderRadius: 999,
      background: "rgba(251,113,133,0.12)",
      border: "1px solid rgba(251,113,133,0.2)",
    } satisfies CSSProperties,

    selectTag: {
      position: "absolute",
      top: 8,
      left: 8,
      zIndex: 4,
      padding: "3px 8px",
      borderRadius: 999,
      background: "rgba(8, 14, 28, 0.92)",
      border: "1px solid rgba(96,165,250,0.32)",
      color: "#9CC8FF",
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      pointerEvents: "none",
    } satisfies CSSProperties,

    offlineOverlay: {
      position: "absolute",
      inset: 0,
      borderRadius: mobile ? 14 : 16,
      background: "rgba(8, 12, 22, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 4,
      pointerEvents: "none",
    } satisfies CSSProperties,

    offlineBadge: {
      fontSize: mobile ? 9 : 10,
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      color: "#8B95A8",
      background: "rgba(11, 17, 32, 0.88)",
      border: "1px solid rgba(139,149,168,0.25)",
      borderRadius: 6,
      padding: mobile ? "2px 6px" : "3px 8px",
    } satisfies CSSProperties,

    effectHalo: (
      role: "actor" | "target" | "blocker",
      accent: string,
    ): CSSProperties => {
      void accent;
      const roleColors = {
        actor: "#F59E0B", // Amber - who is acting
        target: "#EF4444", // Red - who is targeted
        blocker: "#7C3AED", // Violet - who is blocking
      };
      const color = roleColors[role];
      const roleOpacity =
        role === "target" ? "44" : role === "blocker" ? "32" : "20";
      return {
        position: "absolute",
        inset: -2,
        borderRadius: mobile ? 16 : 18,
        border: `1.5px solid ${color}`,
        boxShadow: `0 0 24px ${color}${roleOpacity}`,
        pointerEvents: "none",
      };
    },

    effectTag: (
      role: "actor" | "target" | "blocker",
      accent: string,
    ): CSSProperties => {
      void accent;
      const roleColors = {
        actor: "#F59E0B", // Amber
        target: "#EF4444", // Red
        blocker: "#7C3AED", // Violet
      };
      const color = roleColors[role];
      return {
        position: "absolute",
        top: 6,
        right: 6,
        padding: "2px 7px",
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: "rgba(7, 12, 24, 0.92)",
        color: color,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.7,
        textTransform: "uppercase",
        pointerEvents: "none",
        boxShadow: `0 0 10px ${color}66`,
      };
    },
  };
}
