"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { createVictoryTimeline } from "@/animations";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  getVictoryCardPreviewSrc,
  type VictoryCardDesign,
} from "@/utils/shareVictoryCard";
import { gameOverModalStyles } from "./GameOverModal.styles";

export interface GameOverModalProps {
  isOpen: boolean;
  winnerName: string;
  isWinner: boolean;
  onPlayAgain: () => void | Promise<void>;
  showPrimaryAction?: boolean;
  primaryActionLabel?: string;
  primaryActionPendingLabel?: string;
  onClose: () => void;
  onShareWin?: () => void | Promise<void>;
  onDownloadWin?: () => void | Promise<void>;
  isSharingWin?: boolean;
  onExit: () => void;
  victoryCardDesign?: VictoryCardDesign | null;
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6 18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10h-7a5 5 0 0 0-5 5v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m8 10 4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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
  showPrimaryAction = true,
  primaryActionLabel = "Play Again",
  primaryActionPendingLabel = "Returning...",
  onClose,
  onShareWin,
  onDownloadWin,
  isSharingWin = false,
  onExit,
  victoryCardDesign,
}: GameOverModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const isMobile = useIsMobile();
  const isLobbyReturnAction = primaryActionLabel
    .toLowerCase()
    .includes("lobby");
  const outcomeTitle = isWinner ? "Victory" : "Defeat";
  const isAwaitingHostReset = !isWinner && !showPrimaryAction;
  const subtitle = isWinner
    ? isLobbyReturnAction
      ? "Share the finish, head back to the lobby, or leave the table."
      : "You closed the room cleanly. Share the finish, run it back, or leave the table."
    : isAwaitingHostReset
      ? `${winnerName || "Another player"} closed the table first. Stay here for the host reset, or step out.`
      : isLobbyReturnAction
        ? `${winnerName || "Another player"} closed the table first. Head back to the lobby now or step out.`
        : `${winnerName || "Another player"} closed the table first. Reset for another round or step out.`;
  const previewSrc =
    isWinner && victoryCardDesign
      ? getVictoryCardPreviewSrc(winnerName || "Winner", victoryCardDesign)
      : null;
  const resultSummary = isWinner
    ? (victoryCardDesign?.tagline ??
      "The table tilted your way and stayed there.")
    : isAwaitingHostReset
      ? "You'll be returned to the lobby automatically when the host resets."
      : isLobbyReturnAction
        ? "Ready when the room reopens."
        : "Clean slate. Run it back.";
  const previewLabel = isWinner ? "Victory Snapshot" : "Final Snapshot";

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
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isReplaying, onClose]);

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
          <div
            ref={modalRef}
            style={gameOverModalStyles.modal(isMobile, isWinner)}
          >
            <div style={gameOverModalStyles.aura} />
            <div style={gameOverModalStyles.scrollArea}>
              <div style={gameOverModalStyles.topBar}>
                <div style={gameOverModalStyles.badge}>Final table</div>
                <button
                  type="button"
                  style={gameOverModalStyles.topCloseButton}
                  onClick={onClose}
                  disabled={isReplaying || isSharingWin}
                  aria-label="Close game over modal"
                >
                  <CloseIcon />
                </button>
              </div>
              <div style={gameOverModalStyles.compactHero(isMobile)}>
                <div style={gameOverModalStyles.headerCopy}>
                  <div style={gameOverModalStyles.title(isWinner)}>
                    {outcomeTitle}
                  </div>
                  <div style={gameOverModalStyles.subtitle}>{subtitle}</div>
                </div>
                <div style={gameOverModalStyles.heroIdentity(isMobile)}>
                  <div style={gameOverModalStyles.markWrap}>
                    <CrownMark />
                  </div>
                  <div style={gameOverModalStyles.winnerName}>{winnerName}</div>
                </div>
              </div>
              <div style={gameOverModalStyles.summaryCard(isWinner)}>
                <div style={gameOverModalStyles.summaryHeader}>
                  <div style={gameOverModalStyles.summaryEyebrow(isWinner)}>
                    {isWinner ? "Finish quality" : "Next round"}
                  </div>
                  {isWinner && victoryCardDesign && (
                    <div style={gameOverModalStyles.summaryThemeNote}>
                      {victoryCardDesign.themeLabel}
                    </div>
                  )}
                </div>
                <div style={gameOverModalStyles.summaryText}>
                  {resultSummary}
                </div>
              </div>
              {previewSrc && (
                <div style={gameOverModalStyles.previewShell(isMobile)}>
                  <div style={gameOverModalStyles.previewChrome}>
                    <span style={gameOverModalStyles.previewLabel}>
                      {previewLabel}
                    </span>
                    <div style={gameOverModalStyles.previewActions}>
                      <button
                        type="button"
                        style={gameOverModalStyles.iconButton(
                          isReplaying || isSharingWin,
                        )}
                        onClick={() => void onShareWin?.()}
                        disabled={isReplaying || isSharingWin}
                        aria-label={
                          isSharingWin
                            ? "Preparing share card"
                            : "Share victory card"
                        }
                        title={
                          isSharingWin ? "Preparing..." : "Share victory card"
                        }
                      >
                        <ShareIcon />
                      </button>
                      <button
                        type="button"
                        style={gameOverModalStyles.iconButton(
                          isReplaying || isSharingWin,
                        )}
                        onClick={() => void onDownloadWin?.()}
                        disabled={isReplaying || isSharingWin}
                        aria-label={
                          isSharingWin
                            ? "Preparing download"
                            : "Download victory card"
                        }
                        title={
                          isSharingWin
                            ? "Preparing..."
                            : "Download victory card"
                        }
                      >
                        <DownloadIcon />
                      </button>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt={`Victory card preview for ${winnerName || "winner"}`}
                    style={gameOverModalStyles.previewImage(isMobile)}
                  />
                </div>
              )}
            </div>
            {isAwaitingHostReset && (
              <div style={gameOverModalStyles.footerNote}>
                Waiting for the host to reopen the room.
              </div>
            )}
            <div style={gameOverModalStyles.buttonRow(showPrimaryAction)}>
              {showPrimaryAction && (
                <button
                  style={gameOverModalStyles.primaryButton(isReplaying)}
                  onClick={handlePlayAgain}
                  disabled={isReplaying || isSharingWin}
                >
                  {isReplaying ? primaryActionPendingLabel : primaryActionLabel}
                </button>
              )}
              <button
                style={gameOverModalStyles.secondaryButton}
                onClick={onExit}
                disabled={isReplaying || isSharingWin}
              >
                Exit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
