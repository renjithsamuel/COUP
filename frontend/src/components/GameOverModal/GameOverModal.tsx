"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { createVictoryTimeline } from "@/animations";
import { gameOverModalStyles } from "./GameOverModal.styles";

export interface GameOverModalProps {
  isOpen: boolean;
  winnerName: string;
  isWinner: boolean;
  onPlayAgain: () => void | Promise<void>;
  onExit: () => void;
}

function CrownMark() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="crownGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#F6C445" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="rgba(246,196,69,0.08)"
        stroke="rgba(246,196,69,0.2)"
      />
      <path
        d="M16 42h32l-3-18-8 8-5-12-5 12-8-8Z"
        fill="url(#crownGlow)"
        stroke="#FFF1B8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 46h24"
        stroke="#F6C445"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GameOverModal({
  isOpen,
  winnerName,
  isWinner,
  onPlayAgain,
  onExit,
}: GameOverModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const outcomeTitle = isWinner ? "Victory" : "Defeat";
  const subtitle = isWinner
    ? "You own the table. Return to the room for another round or leave now."
    : `${winnerName || "Another player"} took the table. Return to the room for another round or leave now.`;

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const tl = createVictoryTimeline(modalRef.current);
      return () => {
        tl.kill();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsReplaying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isReplaying) {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isReplaying, onExit]);

  const handlePlayAgain = async () => {
    if (isReplaying) {
      return;
    }

    setIsReplaying(true);
    try {
      await onPlayAgain();
    } catch {
      setIsReplaying(false);
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={gameOverModalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div ref={modalRef} style={gameOverModalStyles.modal}>
            <div style={gameOverModalStyles.aura} />
            <div style={gameOverModalStyles.badge}>Final table</div>
            <div style={gameOverModalStyles.headerCopy}>
              <div style={gameOverModalStyles.title(isWinner)}>
                {outcomeTitle}
              </div>
              <div style={gameOverModalStyles.subtitle}>{subtitle}</div>
            </div>
            <div style={gameOverModalStyles.markWrap}>
              <CrownMark />
            </div>
            <div style={gameOverModalStyles.winnerName}>{winnerName}</div>
            <div style={gameOverModalStyles.buttonRow}>
              <button
                style={gameOverModalStyles.secondaryButton}
                onClick={onExit}
                disabled={isReplaying}
              >
                Exit
              </button>
              <button
                style={gameOverModalStyles.primaryButton(isReplaying)}
                onClick={handlePlayAgain}
                disabled={isReplaying}
              >
                {isReplaying ? "Returning..." : "Play Again"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
