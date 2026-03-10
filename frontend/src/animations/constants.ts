/** Animation duration constants (seconds) – single source of truth */
export const ANIM = {
  CARD_FLIP: 0.5,
  CARD_DEAL: 0.4,
  CARD_HOVER_LIFT: 0.2,
  COIN_TRANSFER: 0.6,
  COIN_BOUNCE: 0.35,
  PLAYER_ELIMINATE: 0.8,
  FADE_IN: 0.3,
  FADE_OUT: 0.25,
  SLIDE_IN: 0.35,
  SLIDE_OUT: 0.3,
  SCALE_POP: 0.25,
  SHAKE: 0.5,
  GLOW_PULSE: 1.2,
  STAGGER_DELAY: 0.08,
} as const;

/** Easing curves */
export const EASING = {
  bounce: [0.68, -0.55, 0.265, 1.55],
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.5, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
} as const;
