'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Character, CHARACTER_LABELS } from '@/models/card';
import { cardHoverVariants } from '@/animations';
import { cardStyles } from './Card.styles';
import { useCardHover } from './Card.hooks';
import dukeArt from '@/assets/card_faces/duke.jpg';
import assassinArt from '@/assets/card_faces/assassin.jpg';
import captainArt from '@/assets/card_faces/captain.jpg';
import ambassadorArt from '@/assets/card_faces/ambassador.jpg';
import contessaArt from '@/assets/card_faces/contessa.jpg';

export interface CardProps {
  character: Character;
  isRevealed?: boolean;
  isFaceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SCALE: Record<string, number> = { xs: 0.5, sm: 0.7, md: 1, lg: 1.25 };
const CARD_ART = {
  [Character.DUKE]: dukeArt,
  [Character.ASSASSIN]: assassinArt,
  [Character.CAPTAIN]: captainArt,
  [Character.AMBASSADOR]: ambassadorArt,
  [Character.CONTESSA]: contessaArt,
};

export function Card({
  character,
  isRevealed = false,
  isFaceDown = false,
  onClick,
  disabled = false,
  size = 'md',
}: CardProps) {
  const { isHovered, onMouseEnter, onMouseLeave } = useCardHover();
  const scale = SCALE[size];

  const showBack = isFaceDown && !isRevealed;

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover={disabled ? undefined : 'hover'}
      style={{
        ...cardStyles.wrapper,
        width: cardStyles.wrapper.width * scale,
        height: cardStyles.wrapper.height * scale,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={showBack ? 'Hidden card' : `${CHARACTER_LABELS[character]} card`}
    >
      <div style={cardStyles.inner(showBack)}>
        {/* Front face */}
        <div
          style={{
            ...cardStyles.face(character),
            ...(isRevealed ? cardStyles.revealed : {}),
            boxShadow: isHovered && !disabled ? cardStyles.hoverShadowFor(character) : cardStyles.face(character).boxShadow,
          }}
        >
          <img src={CARD_ART[character].src} alt="" style={cardStyles.faceImage} draggable={false} />
          <div style={cardStyles.faceOverlay(character)} />
          <div style={cardStyles.cardBorder(character)} />
          <div style={cardStyles.faceFooter}>
            <span style={cardStyles.characterName}>{CHARACTER_LABELS[character]}</span>
          </div>

          {isRevealed && (
            <span style={cardStyles.revealedBadge}>REVEALED</span>
          )}
        </div>

        {/* Back face */}
        <div style={cardStyles.back}>
          <div style={cardStyles.backBorderOuter} />
          <div style={cardStyles.backBorderInner} />
          <div style={cardStyles.backPattern} />
          <div style={cardStyles.backCrest}>
            <div style={cardStyles.backCrestInner} />
          </div>
          <span style={cardStyles.backSymbol}>COUP</span>
          <span style={cardStyles.backLabel}>Influence</span>
        </div>
      </div>
    </motion.div>
  );
}
