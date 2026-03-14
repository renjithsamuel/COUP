'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Character, CHARACTER_LABELS, CHARACTER_ABILITIES, CHARACTER_COLORS } from '@/models/card';
import { guideModalStyles as s } from './GuideModal.styles';

export interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHARACTERS = [
  Character.DUKE,
  Character.ASSASSIN,
  Character.CAPTAIN,
  Character.AMBASSADOR,
  Character.CONTESSA,
];

/** Readable accent colors for each character in text */
const CHAR_TEXT_COLORS: Record<Character, string> = {
  [Character.DUKE]: '#CE93D8',
  [Character.ASSASSIN]: '#90A4AE',
  [Character.CAPTAIN]: '#64B5F6',
  [Character.AMBASSADOR]: '#81C784',
  [Character.CONTESSA]: '#EF9A9A',
};

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={s.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            style={s.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.header}>
              <div style={s.headerCopy}>
                <span style={s.eyebrow}>Guide</span>
                <span style={s.title}>How to Play Coup</span>
                <span style={s.subtitle}>A clean summary of goals, actions, and responses at the table.</span>
              </div>
              <button style={s.closeBtn} onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div style={s.sectionGrid}>
            <div style={s.section}>
              <div style={s.sectionTitle}>Goal</div>
              <p style={s.text}>
                Eliminate all other players by making them lose both influence cards.
                The last player with influence wins.
              </p>
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>General Actions</div>
              <p style={s.text}>
                <span style={{ color: '#81C784', fontWeight: 700 }}>Income</span> — Take 1 coin. Cannot be blocked or challenged.<br />
                <span style={{ color: '#4FC3F7', fontWeight: 700 }}>Foreign Aid</span> — Take 2 coins. Can be blocked by <span style={{ color: CHAR_TEXT_COLORS[Character.DUKE], fontWeight: 700 }}>Duke</span>.<br />
                <span style={{ color: '#EF5350', fontWeight: 700 }}>Coup</span> — Pay 7 coins. Target loses an influence. Mandatory at 10+ coins.
              </p>
            </div>
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>Character Actions</div>
              <p style={{ ...s.text, marginBottom: 8 }}>
                You can bluff any character action — even if you don&apos;t have that card.
                Other players may challenge you.
              </p>
              {CHARACTERS.map((char) => (
                <div key={char} style={s.characterRow}>
                  <span style={s.characterDot(CHAR_TEXT_COLORS[char])} />
                  <span style={{ ...s.characterName, color: CHAR_TEXT_COLORS[char] }}>
                    {CHARACTER_LABELS[char]}
                  </span>
                  <span style={s.characterAbility}>{CHARACTER_ABILITIES[char]}</span>
                </div>
              ))}
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>Challenges &amp; Blocks</div>
              <p style={s.text}>
                <span style={{ color: '#FFD54F', fontWeight: 700 }}>Challenge</span> — If you think someone is bluffing, challenge them.
                If the challenger is right, the bluffer loses influence.
                If wrong, the challenger loses influence and the action proceeds.<br /><br />
                <span style={{ color: '#CE93D8', fontWeight: 700 }}>Block</span> — Bluff a blocking character to prevent an action.
                Blocks can be challenged too!
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    , document.body
  );
}
