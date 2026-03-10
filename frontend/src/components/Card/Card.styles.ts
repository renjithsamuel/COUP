import { CSSProperties } from 'react';
import { tokens } from '@/theme/tokens';
import { Character } from '@/models/card';

type CharacterKey = 'duke' | 'assassin' | 'captain' | 'ambassador' | 'contessa';

function charKey(c: Character): CharacterKey {
  return c as CharacterKey;
}

function charGlow(c: Character): string {
  return tokens.character[charKey(c)].glow;
}

export const cardStyles = {
  wrapper: {
    width: tokens.card.width,
    height: tokens.card.height,
    perspective: '900px',
    cursor: 'pointer',
  } satisfies CSSProperties,

  inner: (isFlipped: boolean): CSSProperties => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
  }),

  face: (character: Character): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    borderRadius: tokens.card.borderRadius,
    background: tokens.character[charKey(character)].bg,
    color: tokens.character[charKey(character)].text,
    boxShadow: `${tokens.card.shadow.rest}, 0 0 20px ${charGlow(character)}`,
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: `0 ${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
    userSelect: 'none',
    overflow: 'hidden',
    border: `1.5px solid rgba(255,255,255,0.12)`,
  }),

  /** Accent glow border inset */
  cardBorder: (character: Character): CSSProperties => ({
    position: 'absolute',
    inset: 4,
    borderRadius: tokens.card.borderRadius - 3,
    border: `1.5px solid ${tokens.character[charKey(character)].accent}`,
    opacity: 0.35,
    pointerEvents: 'none',
    boxShadow: `inset 0 0 12px ${tokens.character[charKey(character)].accent}22`,
  }),

  /** Decorative corner flourishes */
  cornerDecor: (character: Character): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: tokens.card.borderRadius,
    background: `
      radial-gradient(circle at 8% 8%, ${tokens.character[charKey(character)].accent}18 0%, transparent 20%),
      radial-gradient(circle at 92% 8%, ${tokens.character[charKey(character)].accent}18 0%, transparent 20%),
      radial-gradient(circle at 8% 92%, ${tokens.character[charKey(character)].accent}10 0%, transparent 20%),
      radial-gradient(circle at 92% 92%, ${tokens.character[charKey(character)].accent}10 0%, transparent 20%)
    `,
  }),

  /** Subtle pattern/texture overlay */
  patternOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: tokens.card.borderRadius,
    pointerEvents: 'none',
    opacity: 0.04,
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      rgba(255,255,255,0.5) 4px,
      rgba(255,255,255,0.5) 5px
    )`,
  } satisfies CSSProperties,

  /** Vignette darkening at edges */
  vignette: {
    position: 'absolute',
    inset: 0,
    borderRadius: tokens.card.borderRadius,
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse at 50% 35%, transparent 40%, rgba(0,0,0,0.35) 100%)',
  } satisfies CSSProperties,

  /** Top shine highlight */
  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderRadius: `${tokens.card.borderRadius}px ${tokens.card.borderRadius}px 0 0`,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  iconArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
  } satisfies CSSProperties,

  characterName: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 3,
    textAlign: 'center',
    opacity: 0.95,
    position: 'relative',
    zIndex: 1,
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
  } satisfies CSSProperties,

  /** Decorative line above character name */
  nameDivider: (character: Character): CSSProperties => ({
    width: '50%',
    height: 1,
    background: `linear-gradient(90deg, transparent, ${tokens.character[charKey(character)].accent}88, transparent)`,
    marginBottom: 6,
    position: 'relative',
    zIndex: 1,
  }),

  back: {
    position: 'absolute',
    inset: 0,
    borderRadius: tokens.card.borderRadius,
    background: tokens.character.faceDown.bg,
    color: tokens.character.faceDown.text,
    boxShadow: tokens.card.shadow.rest,
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: 3,
    userSelect: 'none',
    border: `1.5px solid rgba(255,255,255,0.08)`,
    overflow: 'hidden',
  } satisfies CSSProperties,

  /** Ornate double border on card back */
  backBorderOuter: {
    position: 'absolute',
    inset: 5,
    borderRadius: tokens.card.borderRadius - 3,
    border: '1px solid rgba(255,255,255,0.08)',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  backBorderInner: {
    position: 'absolute',
    inset: 9,
    borderRadius: tokens.card.borderRadius - 5,
    border: '1px solid rgba(255,255,255,0.05)',
    pointerEvents: 'none',
  } satisfies CSSProperties,

  /** Diamond pattern on card back */
  backPattern: {
    position: 'absolute',
    inset: 12,
    borderRadius: tokens.card.borderRadius - 6,
    pointerEvents: 'none',
    opacity: 0.06,
    backgroundImage: `
      repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.8) 8px, rgba(255,255,255,0.8) 9px),
      repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.8) 8px, rgba(255,255,255,0.8) 9px)
    `,
  } satisfies CSSProperties,

  backSymbol: {
    fontSize: 24,
    fontWeight: 900,
    opacity: 0.35,
    letterSpacing: 5,
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
    position: 'relative',
    zIndex: 1,
  } satisfies CSSProperties,

  backLabel: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.25,
    position: 'relative',
    zIndex: 1,
  } satisfies CSSProperties,

  /** Decorative crest on card back */
  backCrest: {
    position: 'relative',
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    background: 'rgba(255,255,255,0.03)',
  } satisfies CSSProperties,

  backCrestInner: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  } satisfies CSSProperties,

  revealed: {
    filter: 'grayscale(70%) brightness(0.5)',
    boxShadow: tokens.card.shadow.revealed,
  } satisfies CSSProperties,

  revealedBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    opacity: 0.7,
    padding: '2px 10px',
    borderRadius: 4,
    background: 'rgba(0,0,0,0.4)',
    position: 'relative',
    zIndex: 1,
    marginTop: 4,
  } satisfies CSSProperties,

  hoverShadow: tokens.card.shadow.hover,
  hoverShadowFor: (character: Character): string =>
    `${tokens.card.shadow.hover}, 0 0 28px ${charGlow(character)}`,
  activeShadow: tokens.card.shadow.active,
};
