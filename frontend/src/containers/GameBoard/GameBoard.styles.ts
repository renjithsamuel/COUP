import { CSSProperties } from "react";
import { tokens } from "@/theme/tokens";

function s(mobile: boolean) {
  type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

  return {
    wrapper: {
      height: "100dvh",
      background: tokens.board.bg,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflowX: "hidden",
      overflowY: "visible",
    } satisfies CSSProperties,

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: mobile ? "center" : "flex-start",
      padding: mobile
        ? `calc(env(safe-area-inset-top, 0px) + ${tokens.spacing.sm}px) ${tokens.spacing.sm}px ${tokens.spacing.xs}px`
        : `calc(env(safe-area-inset-top, 0px) + ${tokens.spacing.md}px) ${tokens.spacing.xl}px ${tokens.spacing.sm}px`,
      background: "transparent",
      zIndex: 20,
      gap: mobile ? tokens.spacing.sm : tokens.spacing.md,
      minHeight: mobile ? 40 : 92,
      flexShrink: 0,
      width: "100%",
      maxWidth: 1440,
      margin: "0 auto",
      overflow: "visible",
    } satisfies CSSProperties,

    topBarLeft: {
      display: "flex",
      alignItems: "center",
      gap: mobile ? tokens.spacing.sm : tokens.spacing.md,
      flex: 1,
      minWidth: 0,
    } satisfies CSSProperties,

    topBarRight: {
      display: "flex",
      alignItems: "center",
      gap: mobile ? tokens.spacing.xs : tokens.spacing.sm,
      flexShrink: 0,
    } satisfies CSSProperties,

    topBarCenter: {
      display: mobile ? "none" : "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: 1.2,
      minWidth: 0,
      padding: "0 12px",
      paddingTop: 4,
      overflow: "visible",
    } satisfies CSSProperties,

    connectionBadge: (status: ConnectionStatus): CSSProperties => ({
      display: "inline-flex",
      alignItems: "center",
      gap: mobile ? 8 : 10,
      padding: mobile ? "7px 11px" : "8px 12px",
      borderRadius: 999,
      border:
        status === "connected"
          ? "1px solid rgba(74, 222, 128, 0.24)"
          : status === "connecting"
            ? "1px solid rgba(250, 204, 21, 0.24)"
            : "1px solid rgba(248, 113, 113, 0.22)",
      background: "rgba(8, 14, 28, 0.72)",
      boxShadow: "0 14px 28px rgba(0,0,0,0.22)",
      backdropFilter: "blur(12px)",
    }),

    connectionDot: (status: ConnectionStatus): CSSProperties => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
      background:
        status === "connected"
          ? "#4ADE80"
          : status === "connecting"
            ? "#FACC15"
            : "#F87171",
      boxShadow:
        status === "connected"
          ? "0 0 12px rgba(74, 222, 128, 0.7)"
          : status === "connecting"
            ? "0 0 12px rgba(250, 204, 21, 0.7)"
            : "0 0 12px rgba(248, 113, 113, 0.7)",
      flexShrink: 0,
    }),

    connectionText: {
      fontSize: mobile ? 11 : 12,
      fontWeight: 700,
      color: tokens.text.primary,
      letterSpacing: 0.4,
      whiteSpace: "nowrap",
    } satisfies CSSProperties,

    topStatusGroup: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      flex: 1,
    } satisfies CSSProperties,

    navStatusPill: (
      tone: "danger" | "warn" | "info" | "ok",
    ): CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0,
      padding: "7px 12px",
      borderRadius: 999,
      border:
        tone === "warn"
          ? "1px solid rgba(246,196,69,0.26)"
          : tone === "danger"
            ? "1px solid rgba(251,113,133,0.22)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(96,165,250,0.22)",
      background: "rgba(8, 14, 28, 0.72)",
      boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
      maxWidth: 430,
    }),

    navStatusCopy: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 0,
    } satisfies CSSProperties,

    navStatusEyebrow: {
      fontSize: 8,
      fontWeight: 800,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: tokens.text.accent,
    } satisfies CSSProperties,

    navStatusTitle: {
      fontSize: 12,
      fontWeight: 800,
      color: tokens.text.primary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    } satisfies CSSProperties,

    topTimerWrap: {
      transform: "scale(0.88)",
      transformOrigin: "left center",
      marginLeft: -8,
      flexShrink: 0,
    } satisfies CSSProperties,

    topEventToast: (accent: string): CSSProperties => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 4,
      minWidth: 0,
      width: "min(420px, 100%)",
      maxWidth: 420,
      padding: "10px 14px",
      borderRadius: 16,
      border: `1px solid ${accent}55`,
      background: "rgba(8, 14, 28, 0.84)",
      boxShadow: `0 14px 30px rgba(0,0,0,0.24), 0 0 16px ${accent}18`,
      backdropFilter: "blur(14px)",
    }),

    topEventTitle: (accent: string): CSSProperties => ({
      color: accent,
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      whiteSpace: "normal",
      flexShrink: 0,
      lineHeight: 1.15,
    }),

    topEventMessage: {
      color: tokens.text.secondary,
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.3,
      whiteSpace: "normal",
      minWidth: 0,
    } satisfies CSSProperties,

    pinnedGuidePanel: {
      position: "fixed",
      top: 96,
      right: 26,
      width: 320,
      maxHeight: "min(68vh, 520px)",
      overflow: "hidden",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.1)",
      background:
        "linear-gradient(180deg, rgba(13, 20, 36, 0.96) 0%, rgba(8, 13, 24, 0.98) 100%)",
      boxShadow: "0 22px 50px rgba(0,0,0,0.34)",
      backdropFilter: "blur(14px)",
      zIndex: 120,
    } satisfies CSSProperties,

    pinnedGuideHandle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "10px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      cursor: "grab",
      background: "rgba(255,255,255,0.03)",
    } satisfies CSSProperties,

    pinnedGuideHandleLabel: {
      fontSize: 11,
      fontWeight: 900,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: tokens.text.primary,
    } satisfies CSSProperties,

    pinnedGuideHandleActions: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    } satisfies CSSProperties,

    pinnedGuideGrabber: {
      fontSize: 10,
      fontWeight: 700,
      color: tokens.text.muted,
      letterSpacing: 0.4,
      textTransform: "uppercase",
    } satisfies CSSProperties,

    pinnedGuideCloseBtn: {
      width: 28,
      height: 28,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      color: tokens.text.secondary,
      fontSize: 14,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    } satisfies CSSProperties,

    pinnedGuideBody: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "12px",
      maxHeight: "calc(min(68vh, 520px) - 50px)",
      overflowY: "auto",
    } satisfies CSSProperties,

    pinnedGuideRow: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      paddingBottom: 10,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    } satisfies CSSProperties,

    pinnedGuideName: {
      fontSize: 12,
      fontWeight: 800,
      color: tokens.text.accent,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    } satisfies CSSProperties,

    pinnedGuideText: {
      fontSize: 12,
      lineHeight: 1.45,
      color: tokens.text.secondary,
    } satisfies CSSProperties,

    mobileStatusPill: (
      tone: "danger" | "warn" | "info" | "ok",
    ): CSSProperties => ({
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr) auto",
      alignItems: "center",
      gap: 8,
      width: "100%",
      minWidth: 0,
      padding: "8px 10px",
      borderRadius: 18,
      border:
        tone === "warn"
          ? "1px solid rgba(246,196,69,0.24)"
          : tone === "danger"
            ? "1px solid rgba(251,113,133,0.22)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(96,165,250,0.2)",
      background: "rgba(8, 14, 28, 0.78)",
      boxShadow: "0 14px 28px rgba(0,0,0,0.2)",
      backdropFilter: "blur(14px)",
    }),

    mobileConnectionDot: (status: ConnectionStatus): CSSProperties => ({
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: status === "connected" ? "#4ADE80" : "#F87171",
      boxShadow:
        status === "connected"
          ? "0 0 10px rgba(74, 222, 128, 0.72)"
          : "0 0 10px rgba(248, 113, 113, 0.7)",
      flexShrink: 0,
    }),

    mobileStatusCopy: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      minWidth: 0,
    } satisfies CSSProperties,

    mobileStatusEyebrow: {
      fontSize: 8,
      fontWeight: 800,
      letterSpacing: 1,
      textTransform: "uppercase",
      color: tokens.text.accent,
    } satisfies CSSProperties,

    mobileStatusTitle: {
      fontSize: 12,
      fontWeight: 800,
      color: tokens.text.primary,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      lineHeight: 1.15,
    } satisfies CSSProperties,

    mobileTimerChip: (
      tone: "danger" | "warn" | "info" | "ok",
    ): CSSProperties => ({
      padding: "3px 7px",
      borderRadius: 999,
      border:
        tone === "warn"
          ? "1px solid rgba(246,196,69,0.24)"
          : tone === "danger"
            ? "1px solid rgba(251,113,133,0.22)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(96,165,250,0.2)",
      background: "rgba(255,255,255,0.04)",
      color: tokens.text.primary,
      fontSize: 10,
      fontWeight: 800,
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
    }),

    center: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: mobile
        ? `0 ${tokens.spacing.sm}px 78px`
        : `0 ${tokens.spacing.xl}px ${tokens.spacing.xl}px`,
      gap: mobile ? 10 : tokens.spacing.md,
      width: "100%",
      maxWidth: 1440,
      margin: "0 auto",
      minHeight: 0,
      overflowX: "hidden",
      overflowY: mobile ? "auto" : "hidden",
    } satisfies CSSProperties,

    contentGrid: (timelineOpen: boolean): CSSProperties => ({
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      display: "grid",
      gridTemplateColumns: mobile
        ? "1fr"
        : timelineOpen
          ? "minmax(0, 1fr) 340px"
          : "minmax(0, 1fr)",
      gap: mobile ? 0 : tokens.spacing.md,
      alignItems: "stretch",
    }),

    mainColumn: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 12 : tokens.spacing.md,
      overflow: mobile ? "visible" : "hidden",
    } satisfies CSSProperties,

    commandRail: (tone: "danger" | "warn" | "info" | "ok"): CSSProperties => {
      const palette = {
        danger: { border: "#FB7185", glow: "rgba(251,113,133,0.18)" },
        warn: { border: "#F6C445", glow: "rgba(246,196,69,0.18)" },
        info: { border: "#60A5FA", glow: "rgba(96,165,250,0.18)" },
        ok: { border: "#34D399", glow: "rgba(52,211,153,0.16)" },
      }[tone];

      return {
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: mobile ? 8 : tokens.spacing.md,
        padding: mobile ? `7px 10px` : `6px 12px`,
        borderRadius: mobile ? 18 : 20,
        border: `1px solid ${palette.border}`,
        background:
          "linear-gradient(180deg, rgba(14, 22, 40, 0.96) 0%, rgba(9, 14, 28, 0.98) 100%)",
        boxShadow: `0 14px 28px rgba(0,0,0,0.22), 0 0 20px ${palette.glow}`,
        backdropFilter: "blur(14px)",
        minHeight: mobile ? 46 : 42,
      };
    },

    commandMain: {
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 1 : 0,
      minWidth: 0,
    } satisfies CSSProperties,

    commandEyebrow: {
      fontSize: mobile ? 8 : 9,
      fontWeight: 800,
      letterSpacing: mobile ? 0.9 : 1.4,
      textTransform: "uppercase",
      color: tokens.text.accent,
    } satisfies CSSProperties,

    commandTitle: {
      fontSize: mobile ? 12 : 14,
      fontWeight: 800,
      color: tokens.text.primary,
      lineHeight: 1.2,
      wordBreak: "break-word",
    } satisfies CSSProperties,

    commandDetail: {
      fontSize: mobile ? 11 : 13,
      fontWeight: 600,
      color: "rgba(232, 234, 240, 0.76)",
      lineHeight: 1.35,
      maxWidth: 760,
      minHeight: mobile ? 30 : 36,
    } satisfies CSSProperties,

    commandAside: {
      display: "flex",
      flexDirection: "column",
      alignItems: mobile ? "flex-start" : "flex-end",
      justifyContent: "center",
      gap: 2,
      minWidth: mobile ? 0 : 132,
    } satisfies CSSProperties,

    commandMetaRow: {
      display: "flex",
      gap: tokens.spacing.xs,
      flexWrap: "wrap",
      justifyContent: mobile ? "flex-start" : "flex-end",
    } satisfies CSSProperties,

    commandMeta: (tone: "danger" | "warn" | "info" | "ok"): CSSProperties => ({
      padding: mobile ? "2px 7px" : "4px 8px",
      borderRadius: 999,
      border:
        tone === "warn"
          ? "1px solid rgba(246,196,69,0.28)"
          : tone === "danger"
            ? "1px solid rgba(251,113,133,0.26)"
            : tone === "ok"
              ? "1px solid rgba(52,211,153,0.24)"
              : "1px solid rgba(96,165,250,0.24)",
      background: "rgba(255,255,255,0.04)",
      color:
        tone === "warn"
          ? tokens.text.accent
          : tone === "danger"
            ? "#FCA5A5"
            : tone === "ok"
              ? "#6EE7B7"
              : "#9CC8FF",
      fontSize: mobile ? 7 : 9,
      fontWeight: 800,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    }),

    boardArea: {
      display: "flex",
      flexDirection: "column",
      justifyContent: mobile ? "flex-end" : "flex-start",
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflowX: "hidden",
      overflowY: "hidden",
      paddingTop: mobile ? 10 : 0,
      paddingBottom: mobile ? 10 : 0,
    } satisfies CSSProperties,

    sidePanel: (open: boolean): CSSProperties => {
      void open;
      return {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        overflow: "hidden",
        borderRadius: mobile ? 0 : 28,
        border: mobile ? "none" : "1px solid rgba(255,255,255,0.08)",
        background: mobile
          ? "linear-gradient(180deg, rgba(8, 13, 24, 0.98) 0%, rgba(12, 19, 34, 0.98) 100%)"
          : "linear-gradient(180deg, rgba(12, 19, 34, 0.94) 0%, rgba(8, 13, 24, 0.94) 100%)",
        boxShadow: mobile
          ? "0 24px 64px rgba(0,0,0,0.45)"
          : "0 24px 52px rgba(0,0,0,0.3)",
        backdropFilter: "blur(16px)",
      };
    },

    mobileSidePanelOverlay: {
      position: "fixed",
      inset: 0,
      zIndex: tokens.zIndex.modal,
      display: "flex",
      justifyContent: "flex-end",
      background: "rgba(2, 6, 14, 0.52)",
      backdropFilter: "blur(8px)",
    } satisfies CSSProperties,

    mobileSidePanelShell: {
      width: "min(92vw, 380px)",
      height: "100dvh",
      padding: `${tokens.spacing.md}px ${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    } satisfies CSSProperties,

    sidePanelHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: tokens.spacing.md,
      padding: mobile
        ? `${tokens.spacing.lg}px ${tokens.spacing.lg}px ${tokens.spacing.md}px`
        : `${tokens.spacing.lg}px ${tokens.spacing.lg}px ${tokens.spacing.sm}px`,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      flexShrink: 0,
    } satisfies CSSProperties,

    sidePanelHeadingGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 0,
    } satisfies CSSProperties,

    sidePanelEyebrow: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "#8FB8FF",
    } satisfies CSSProperties,

    sidePanelTitle: {
      fontSize: mobile ? 18 : 20,
      lineHeight: 1.15,
      fontWeight: 800,
      color: tokens.text.primary,
    } satisfies CSSProperties,

    sidePanelSubtitle: {
      fontSize: 12,
      lineHeight: 1.45,
      color: "rgba(232, 234, 240, 0.68)",
    } satisfies CSSProperties,

    sidePanelCloseBtn: {
      width: 38,
      height: 38,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)",
      color: tokens.text.primary,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: 18,
    } satisfies CSSProperties,

    sidePanelBody: {
      flex: 1,
      minHeight: 0,
      padding: mobile
        ? `0 ${tokens.spacing.sm} ${tokens.spacing.md}`
        : `0 ${tokens.spacing.sm} ${tokens.spacing.sm}`,
    } satisfies CSSProperties,

    dashboardPanel: (open: boolean): CSSProperties => {
      void open;
      return {
        display: "none",
      };
    },

    /* ── Modal styles (for leaderboard, game log) ── */
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: tokens.zIndex.modal,
      backdropFilter: "blur(8px)",
    } satisfies CSSProperties,

    modalContent: {
      background: `linear-gradient(160deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
      borderRadius: 20,
      padding: tokens.spacing.xl,
      boxShadow: tokens.elevation.dp24,
      border: `1px solid ${tokens.surface.borderLight}`,
      maxWidth: 860,
      width: "min(94vw, 860px)",
      maxHeight: "88vh",
      overflow: "auto",
    } satisfies CSSProperties,

    confirmModalContent: {
      background: `linear-gradient(160deg, ${tokens.surface.elevated} 0%, ${tokens.surface.card} 100%)`,
      borderRadius: 20,
      padding: tokens.spacing.xl,
      boxShadow: tokens.elevation.dp24,
      border: `1px solid ${tokens.surface.borderLight}`,
      width: "min(92vw, 480px)",
      maxHeight: "88vh",
      overflow: "auto",
    } satisfies CSSProperties,

    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: tokens.spacing.lg,
    } satisfies CSSProperties,

    modalHeaderCopy: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minWidth: 0,
    } satisfies CSSProperties,

    modalEyebrow: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      color: tokens.text.accent,
    } satisfies CSSProperties,

    modalTitle: {
      fontSize: 30,
      fontWeight: 900,
      color: tokens.text.primary,
      letterSpacing: 0.2,
    } satisfies CSSProperties,

    modalSubtitle: {
      fontSize: 13,
      color: tokens.text.secondary,
      lineHeight: 1.6,
      maxWidth: 520,
    } satisfies CSSProperties,

    modalCloseBtn: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: `1px solid ${tokens.surface.borderLight}`,
      background: "rgba(255,255,255,0.03)",
      color: tokens.text.secondary,
      fontSize: 18,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    } satisfies CSSProperties,

    confirmModalActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10,
      flexWrap: "wrap",
    } satisfies CSSProperties,

    confirmModalCancelBtn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: `1px solid ${tokens.surface.borderLight}`,
      background: "rgba(255,255,255,0.03)",
      color: tokens.text.primary,
      fontSize: 12,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      cursor: "pointer",
    } satisfies CSSProperties,

    confirmModalDangerBtn: {
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid rgba(239,83,80,0.34)",
      background: "rgba(239,83,80,0.12)",
      color: "#FEB2B2",
      fontSize: 12,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      cursor: "pointer",
    } satisfies CSSProperties,

    modalTabs: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: 4,
      borderRadius: 999,
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${tokens.surface.border}`,
      marginBottom: 18,
    } satisfies CSSProperties,

    modalTab: (active: boolean): CSSProperties => ({
      border: "none",
      background: active
        ? "linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.12))"
        : "transparent",
      color: active ? tokens.text.accent : tokens.text.secondary,
      padding: "10px 16px",
      borderRadius: 999,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    }),

    roomScoreList: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
    } satisfies CSSProperties,

    roomScoreRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px 16px",
      borderRadius: 18,
      background:
        "linear-gradient(180deg, rgba(19, 27, 43, 0.92) 0%, rgba(12, 18, 30, 0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.06)",
    } satisfies CSSProperties,

    roomScoreMeta: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0,
    } satisfies CSSProperties,

    rankBadge: {
      width: 30,
      height: 30,
      borderRadius: 999,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,193,7,0.12)",
      border: "1px solid rgba(255,193,7,0.22)",
      color: tokens.text.accent,
      fontSize: 12,
      fontWeight: 800,
      flexShrink: 0,
    } satisfies CSSProperties,

    roomScoreCopy: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 0,
    } satisfies CSSProperties,

    roomScoreName: {
      fontSize: 15,
      color: tokens.text.primary,
      fontWeight: 800,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    } satisfies CSSProperties,

    roomScoreSubline: {
      fontSize: 12,
      color: tokens.text.secondary,
      lineHeight: 1.5,
    } satisfies CSSProperties,

    roomScoreBadge: {
      padding: "8px 12px",
      borderRadius: 999,
      background: "rgba(255,193,7,0.1)",
      border: "1px solid rgba(255,193,7,0.16)",
      color: tokens.text.accent,
      fontSize: 12,
      fontWeight: 900,
      flexShrink: 0,
    } satisfies CSSProperties,

    roomScoreEmpty: {
      padding: "18px 20px",
      borderRadius: 18,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: tokens.text.secondary,
      fontSize: 13,
      lineHeight: 1.7,
    } satisfies CSSProperties,

    bottomArea: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: mobile ? 10 : 10,
      paddingBottom: mobile ? 4 : 10,
      width: "100%",
      flexShrink: 0,
      minWidth: 0,
      marginTop: mobile ? "auto" : 0,
      overflow: "visible",
    } satisfies CSSProperties,

    actionHintToast: {
      alignSelf: "center",
      padding: mobile ? "6px 10px" : "7px 12px",
      borderRadius: 999,
      border: "1px solid rgba(96,165,250,0.2)",
      background: "rgba(8, 14, 28, 0.9)",
      color: "#B9D6FF",
      fontSize: mobile ? 10 : 11,
      fontWeight: 800,
      letterSpacing: 0.4,
      boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
      backdropFilter: "blur(14px)",
      flexShrink: 0,
    } satisfies CSSProperties,

    playerCardArea: (active = false): CSSProperties => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: mobile ? 6 : 6,
      padding: mobile ? `7px 10px` : `6px 12px`,
      background: active
        ? "linear-gradient(180deg, rgba(44, 34, 12, 0.98) 0%, rgba(18, 14, 8, 0.99) 100%)"
        : "linear-gradient(180deg, rgba(16, 24, 40, 0.98) 0%, rgba(9, 14, 26, 0.98) 100%)",
      borderRadius: mobile ? 16 : 18,
      border: active
        ? "1px solid rgba(246,196,69,0.34)"
        : "1px solid rgba(255,255,255,0.08)",
      boxShadow: active
        ? "0 14px 30px rgba(0,0,0,0.24), 0 0 0 1px rgba(246,196,69,0.12), 0 0 24px rgba(246,196,69,0.18)"
        : "0 10px 20px rgba(0,0,0,0.18)",
      width: "100%",
      maxWidth: mobile ? "100%" : 560,
      flexShrink: 0,
      minWidth: 0,
      marginTop: mobile ? 4 : 0,
      boxSizing: "border-box",
      transition:
        "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    }),

    playerInfoInline: (active = false): CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: mobile ? tokens.spacing.xs : tokens.spacing.md,
      paddingBottom: mobile ? 4 : 8,
      borderBottom: active
        ? "1px solid rgba(246,196,69,0.22)"
        : `1px solid rgba(255,255,255,0.08)`,
      width: "100%",
      justifyContent: "center",
      flexShrink: 0,
      transition: "border-color 0.2s ease",
    }),

    playerNameLarge: {
      fontSize: mobile ? 11 : 15,
      fontWeight: 800,
      color: tokens.text.primary,
      letterSpacing: 0.3,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: mobile ? "60%" : "auto",
    } satisfies CSSProperties,

    playerCoinsLarge: {
      fontSize: mobile ? 12 : 15,
      fontWeight: 900,
      color: tokens.coin.color,
      display: "flex",
      alignItems: "center",
      gap: 6,
      flexShrink: 0,
      padding: mobile ? "3px 9px" : "5px 12px",
      borderRadius: 999,
      background: "rgba(255, 193, 7, 0.12)",
      border: "1px solid rgba(255, 193, 7, 0.22)",
      boxShadow: "0 0 18px rgba(255, 193, 7, 0.08)",
    } satisfies CSSProperties,

    utilBtn: {
      width: mobile ? 38 : 48,
      height: mobile ? 38 : 48,
      borderRadius: mobile ? 14 : 16,
      border: `1px solid ${tokens.surface.borderLight}`,
      background: "rgba(11, 17, 32, 0.68)",
      backdropFilter: "blur(10px)",
      color: tokens.text.primary,
      fontSize: mobile ? 14 : 18,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s ease",
      flexShrink: 0,
      padding: 0,
    } satisfies CSSProperties,

    exitBtn: {
      height: mobile ? 38 : 48,
      borderRadius: 999,
      border: "1px solid rgba(239,83,80,0.38)",
      background: "rgba(78, 17, 21, 0.56)",
      color: "#FEB2B2",
      fontSize: mobile ? 10 : 13,
      fontWeight: 800,
      letterSpacing: mobile ? 0.4 : 0.8,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "all 0.15s ease",
      flexShrink: 0,
      padding: mobile ? "0 12px" : "0 18px",
      whiteSpace: "nowrap",
    } satisfies CSSProperties,

    mobileUtilityDock: {
      position: "fixed",
      left: 12,
      right: 12,
      bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      zIndex: 60,
      display: "flex",
      justifyContent: "center",
      gap: 10,
      padding: "6px 8px",
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(8, 14, 28, 0.86)",
      boxShadow: "0 18px 34px rgba(0,0,0,0.34)",
      backdropFilter: "blur(16px)",
    } satisfies CSSProperties,

    eventOverlayContainer: {
      position: "fixed",
      top: mobile ? "9%" : "76px",
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: mobile ? "center" : "flex-start",
      alignItems: "flex-start",
      zIndex: 200,
      pointerEvents: "none",
      padding: mobile ? "0 10px" : "0 24px",
    } satisfies CSSProperties,

    eventOverlay: (accent: string): CSSProperties => {
      return {
        background:
          "linear-gradient(155deg, rgba(9, 14, 28, 0.97) 0%, rgba(18, 27, 48, 0.94) 100%)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${accent}`,
        borderRadius: mobile ? 12 : 16,
        padding: mobile ? "10px 11px" : "14px 16px",
        width: mobile
          ? "min(340px, calc(100vw - 20px))"
          : "min(420px, calc(100vw - 48px))",
        minWidth: mobile ? "auto" : 280,
        maxWidth: mobile ? 340 : 420,
        display: "grid",
        gridTemplateColumns: mobile ? "40px 1fr" : "52px 1fr",
        gap: mobile ? 8 : 12,
        alignItems: "center",
        pointerEvents: "none",
        boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 24px ${accent}22`,
        overflow: "hidden",
        isolation: "isolate",
        position: "relative",
      };
    },

    eventEffectLayer: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0,
    } satisfies CSSProperties,

    eventSymbol: (accent: string): CSSProperties => ({
      width: mobile ? 40 : 52,
      height: mobile ? 40 : 52,
      borderRadius: "50%",
      border: `1px solid ${accent}`,
      background: `radial-gradient(circle at 30% 30%, ${accent}44, rgba(255,255,255,0.05) 72%)`,
      color: accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: mobile ? 9 : 11,
      fontWeight: 900,
      letterSpacing: mobile ? 0.3 : 0.5,
      textTransform: "uppercase",
      boxShadow: `0 0 18px ${accent}22 inset`,
      position: "relative",
      zIndex: 2,
      flexShrink: 0,
    }),

    eventTextGroup: {
      display: "flex",
      flexDirection: "column",
      gap: mobile ? 1 : 3,
      minWidth: 0,
      zIndex: 2,
      position: "relative",
    } satisfies CSSProperties,

    eventTitle: (accent: string): CSSProperties => ({
      fontSize: mobile ? 11 : 13,
      fontWeight: 800,
      color: accent,
      letterSpacing: 0.35,
      textTransform: "uppercase",
      wordBreak: "break-word",
    }),

    eventMessage: {
      fontSize: mobile ? 9 : 10,
      color: tokens.text.secondary,
      fontWeight: 500,
      lineHeight: 1.35,
      wordBreak: "break-word",
    } satisfies CSSProperties,

    eventPulse: (accent: string): CSSProperties => ({
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 1.5,
      background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
      boxShadow: `0 0 12px ${accent}88`,
    }),

    eventCoin: (accent: string): CSSProperties => ({
      position: "absolute",
      left: "18%",
      bottom: "20%",
      width: mobile ? 12 : 14,
      height: mobile ? 12 : 14,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, #FFE082 0%, ${accent} 65%, rgba(0,0,0,0.2) 100%)`,
      boxShadow: `0 0 14px ${accent}77`,
    }),

    eventSlash: (accent: string): CSSProperties => ({
      position: "absolute",
      left: "-10%",
      top: "48%",
      width: "60%",
      height: 3,
      background: `linear-gradient(90deg, transparent 0%, ${accent} 22%, #FFF1 55%, ${accent} 86%, transparent 100%)`,
      boxShadow: `0 0 16px ${accent}88`,
    }),

    eventSlashGlow: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "10%",
      top: "44%",
      width: "42%",
      height: 38,
      borderRadius: 999,
      background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
      filter: "blur(2px)",
    }),

    eventShield: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "10%",
      top: "18%",
      width: mobile ? 90 : 110,
      height: mobile ? 90 : 110,
      borderRadius: "30% 30% 40% 40%",
      border: `1px solid ${accent}AA`,
      background: `radial-gradient(circle at 50% 35%, ${accent}22 0%, transparent 72%)`,
      boxShadow: `0 0 28px ${accent}22 inset`,
      clipPath: "polygon(50% 0%, 88% 18%, 82% 78%, 50% 100%, 18% 78%, 12% 18%)",
    }),

    eventSwapOrb: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "12%",
      top: "30%",
      width: mobile ? 14 : 16,
      height: mobile ? 14 : 16,
      borderRadius: "50%",
      background: accent,
      boxShadow: `0 0 16px ${accent}88`,
    }),

    eventImpactRing: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "14%",
      top: "22%",
      width: mobile ? 84 : 108,
      height: mobile ? 84 : 108,
      borderRadius: "50%",
      border: `2px solid ${accent}99`,
      boxShadow: `0 0 24px ${accent}33`,
    }),

    eventRevealCard: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "11%",
      top: "24%",
      width: mobile ? 54 : 64,
      height: mobile ? 76 : 88,
      borderRadius: 12,
      border: `1px solid ${accent}88`,
      background: `linear-gradient(160deg, ${accent}22 0%, rgba(255,255,255,0.05) 100%)`,
      boxShadow: `0 0 22px ${accent}1f`,
    }),

    eventChallengeMark: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "15%",
      top: "22%",
      color: accent,
      fontSize: mobile ? 48 : 62,
      fontWeight: 900,
      lineHeight: 1,
      textShadow: `0 0 24px ${accent}55`,
    }),

    eventVictoryGlow: (accent: string): CSSProperties => ({
      position: "absolute",
      right: "12%",
      top: "18%",
      width: mobile ? 96 : 122,
      height: mobile ? 96 : 122,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${accent}33 0%, ${accent}11 42%, transparent 74%)`,
      boxShadow: `0 0 32px ${accent}22`,
    }),

    confettiLayer: {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: 210,
    } satisfies CSSProperties,

    confettiPiece: (xPercent: number, color: string): CSSProperties => ({
      position: "absolute",
      left: `${xPercent}%`,
      top: "-10vh",
      width: mobile ? 7 : 9,
      height: mobile ? 12 : 14,
      borderRadius: 2,
      background: color,
      boxShadow: `0 0 12px ${color}66`,
      transformOrigin: "center",
    }),
  };
}

export function gameBoardStyles(mobile: boolean) {
  return s(mobile);
}
