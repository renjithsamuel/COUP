/** Design tokens — single source of truth for all UI measurements & colours */
export const tokens = {
  // Card dimensions
  card: {
    width: 130,
    height: 185,
    borderRadius: 14,
    /** Material Design elevation shadows */
    shadow: {
      rest: "0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.06)",
      hover:
        "0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
      active: "0 12px 32px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)",
      revealed: "inset 0 2px 12px rgba(0,0,0,0.5)",
    },
  },

  // Character palette — rich, atmospheric, each card has a distinct vibe
  character: {
    duke: {
      bg: "linear-gradient(145deg, #2A0845 0%, #4A148C 15%, #7B1FA2 40%, #9C27B0 55%, #7B1FA2 75%, #4A148C 90%, #2A0845 100%)",
      accent: "#CE93D8",
      text: "#F3E5F5",
      glow: "rgba(156, 39, 176, 0.35)",
    },
    assassin: {
      bg: "linear-gradient(145deg, #000000 0%, #0a0a14 15%, #1a1a2e 35%, #2d2d44 50%, #1a1a2e 70%, #0a0a14 90%, #000000 100%)",
      accent: "#78909C",
      text: "#CFD8DC",
      glow: "rgba(244, 67, 54, 0.25)",
    },
    captain: {
      bg: "linear-gradient(145deg, #062558 0%, #0D47A1 15%, #1565C0 35%, #1E88E5 50%, #1565C0 70%, #0D47A1 90%, #062558 100%)",
      accent: "#64B5F6",
      text: "#E3F2FD",
      glow: "rgba(30, 136, 229, 0.35)",
    },
    ambassador: {
      bg: "linear-gradient(145deg, #0a3012 0%, #1B5E20 15%, #2E7D32 35%, #43A047 50%, #2E7D32 70%, #1B5E20 90%, #0a3012 100%)",
      accent: "#81C784",
      text: "#E8F5E9",
      glow: "rgba(67, 160, 71, 0.30)",
    },
    contessa: {
      bg: "linear-gradient(145deg, #4a0000 0%, #B71C1C 15%, #C62828 35%, #E53935 50%, #C62828 70%, #B71C1C 90%, #4a0000 100%)",
      accent: "#EF9A9A",
      text: "#FFEBEE",
      glow: "rgba(229, 57, 53, 0.35)",
    },
    faceDown: {
      bg: "linear-gradient(145deg, #0f1a2a 0%, #1a2a3e 25%, #243448 50%, #1a2a3e 75%, #0f1a2a 100%)",
      accent: "#546E7A",
      text: "#78909C",
      glow: "rgba(84, 110, 122, 0.15)",
    },
  },

  // Coin
  coin: {
    size: 26,
    color: "#FFC107",
    shadow: "0 1px 3px rgba(0,0,0,0.3), 0 0 6px rgba(255,193,7,0.15)",
  },

  // Spacing scale (px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Timing (ms)
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    extraSlow: 800,
  },

  // Z-index layers
  zIndex: {
    cards: 10,
    overlay: 100,
    modal: 200,
    toast: 300,
  },

  // Surface colors
  surface: {
    bg: "#0B1120",
    card: "#111B2E",
    elevated: "#162033",
    overlay: "rgba(11, 17, 32, 0.85)",
    border: "rgba(255,255,255,0.06)",
    borderLight: "rgba(255,255,255,0.1)",
  },

  // Text colors
  text: {
    primary: "#E8EAF0",
    secondary: "#8B95A8",
    muted: "#5A6478",
    accent: "#FFC107",
  },

  // Board
  board: {
    bg: "radial-gradient(ellipse at 50% 40%, #162033 0%, #111B2E 40%, #0B1120 100%)",
    tableFelt: "#1a472a",
  },

  // Material elevation
  elevation: {
    dp1: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    dp2: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
    dp4: "0 6px 12px rgba(0,0,0,0.19), 0 4px 8px rgba(0,0,0,0.23)",
    dp8: "0 10px 20px rgba(0,0,0,0.19), 0 6px 12px rgba(0,0,0,0.23)",
    dp16: "0 14px 28px rgba(0,0,0,0.25), 0 10px 16px rgba(0,0,0,0.22)",
    dp24: "0 19px 38px rgba(0,0,0,0.30), 0 15px 20px rgba(0,0,0,0.22)",
  },
} as const;
