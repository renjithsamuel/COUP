import { Variants } from 'framer-motion';
import { ANIM, EASING } from './constants';

/** Card flip (front ↔ back) */
export const cardFlipVariants: Variants = {
  faceDown: { rotateY: 180, transition: { duration: ANIM.CARD_FLIP, ease: EASING.smooth } },
  faceUp: { rotateY: 0, transition: { duration: ANIM.CARD_FLIP, ease: EASING.smooth } },
};

/** Card deal — slide in from deck position with stagger */
export const cardDealVariants: Variants = {
  hidden: { opacity: 0, y: -60, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * ANIM.STAGGER_DELAY,
      duration: ANIM.CARD_DEAL,
      ease: EASING.snappy,
    },
  }),
};

/** Card hover lift */
export const cardHoverVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -12, scale: 1.05, transition: { duration: ANIM.CARD_HOVER_LIFT, ease: EASING.smooth } },
};

/** Coin transfer — arc path */
export const coinTransferVariants: Variants = {
  start: { opacity: 1, x: 0, y: 0 },
  end: (target: { x: number; y: number }) => ({
    opacity: 0,
    x: target.x,
    y: target.y,
    transition: { duration: ANIM.COIN_TRANSFER, ease: EASING.easeOut },
  }),
};

/** Coin bounce on arrival */
export const coinBounceVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.3, 1],
    opacity: 1,
    transition: { duration: ANIM.COIN_BOUNCE, ease: EASING.bounce },
  },
};

/** Player elimination — fade + desaturate */
export const eliminateVariants: Variants = {
  alive: { opacity: 1, filter: 'grayscale(0%)' },
  eliminated: {
    opacity: 0.5,
    filter: 'grayscale(100%)',
    transition: { duration: ANIM.PLAYER_ELIMINATE, ease: EASING.smooth },
  },
};

/** Generic fade in */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: ANIM.FADE_IN } },
};

/** Slide in from bottom */
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: ANIM.SLIDE_IN, ease: EASING.snappy } },
};

/** Scale pop — for action buttons, notifications */
export const scalePopVariants: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: ANIM.SCALE_POP, ease: EASING.bounce } },
  exit: { scale: 0.6, opacity: 0, transition: { duration: ANIM.FADE_OUT } },
};

/** Shake — for errors, failed challenges */
export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: ANIM.SHAKE },
  },
};

/** Glow pulse — for active turn indicator */
export const glowPulseVariants: Variants = {
  idle: { boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
  glow: {
    boxShadow: [
      '0 0 16px rgba(255,193,7,0.35), 0 0 32px rgba(255,193,7,0.2), 0 2px 8px rgba(0,0,0,0.3)',
      '0 0 36px rgba(255,193,7,0.65), 0 0 72px rgba(255,193,7,0.4), 0 2px 8px rgba(0,0,0,0.3)',
      '0 0 16px rgba(255,193,7,0.35), 0 0 32px rgba(255,193,7,0.2), 0 2px 8px rgba(0,0,0,0.3)',
    ],
    transition: { duration: ANIM.GLOW_PULSE, repeat: Infinity },
  },
};
