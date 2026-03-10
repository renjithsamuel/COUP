import gsap from 'gsap';
import { ANIM, EASING } from './constants';

/**
 * GSAP timeline factory for complex multi-step animations
 * that are hard to express with Framer Motion alone.
 */

/** Deal cards from deck to player hand positions */
export function createDealTimeline(
  cardElements: HTMLElement[],
  deckPosition: { x: number; y: number },
) {
  const tl = gsap.timeline();

  cardElements.forEach((el, i) => {
    tl.fromTo(
      el,
      { x: deckPosition.x, y: deckPosition.y, scale: 0.5, opacity: 0, rotateY: 180 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        rotateY: 0,
        duration: ANIM.CARD_DEAL,
        ease: 'back.out(1.4)',
      },
      i * ANIM.STAGGER_DELAY,
    );
  });

  return tl;
}

/** Coin transfer arc from source → target */
export function createCoinTransferTimeline(
  coinEl: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 60; // arc peak

  const tl = gsap.timeline();
  tl.fromTo(
    coinEl,
    { x: from.x, y: from.y, scale: 1, opacity: 1 },
    {
      motionPath: {
        path: [
          { x: midX, y: midY },
          { x: to.x, y: to.y },
        ],
        curviness: 1.2,
      },
      duration: ANIM.COIN_TRANSFER,
      ease: 'power2.out',
    },
  )
    .to(coinEl, { scale: 1.3, duration: 0.1, ease: 'power1.out' })
    .to(coinEl, { scale: 1, duration: 0.15, ease: 'bounce.out' });

  return tl;
}

/** Assassination effect — card shatters/dissolves */
export function createEliminationTimeline(cardEl: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(cardEl, {
    filter: 'grayscale(100%) brightness(0.5)',
    scale: 0.9,
    duration: ANIM.PLAYER_ELIMINATE * 0.4,
    ease: 'power2.in',
  })
    .to(cardEl, {
      rotateZ: gsap.utils.random(-5, 5),
      duration: ANIM.PLAYER_ELIMINATE * 0.3,
      ease: 'power1.out',
    })
    .to(cardEl, {
      opacity: 0.5,
      duration: ANIM.PLAYER_ELIMINATE * 0.3,
      ease: 'power1.out',
    });

  return tl;
}

/** Victory celebration — confetti-like burst */
export function createVictoryTimeline(containerEl: HTMLElement) {
  const tl = gsap.timeline();
  tl.fromTo(
    containerEl,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
  ).to(containerEl, {
    boxShadow: '0 0 40px rgba(255,215,0,0.6)',
    duration: 0.8,
    repeat: 2,
    yoyo: true,
    ease: 'sine.inOut',
  });

  return tl;
}
