"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { Timer } from "@/components/Timer";
import { GameOverModal } from "@/components/GameOverModal";
import { CoupBackgroundSVG } from "@/components/CoupBackgroundSVG";
import { OpponentArea } from "@/containers/OpponentArea";
import { ActionPanel } from "@/containers/ActionPanel";
import { PlayerHand } from "@/containers/PlayerHand";
import { ChallengeBlockOverlay } from "@/containers/ChallengeBlockOverlay";
import { GameLog } from "@/containers/GameLog";
import { GameDashboard } from "@/containers/GameDashboard";
import { GuideModal } from "@/components/GuideModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGameAudio } from "@/hooks/useGameAudio";
import { ACTION_RULES } from "@/models/action";
import {
  Character,
  CHARACTER_ABILITIES,
  CHARACTER_LABELS,
} from "@/models/card";
import { LeaderboardEntry } from "@/models/lobby";
import { useActionPanel } from "@/containers/ActionPanel/ActionPanel.hooks";
import { gameBoardStyles } from "./GameBoard.styles";
import { useGameBoard } from "./GameBoard.hooks";

/* ── Inline SVG icons (no emoji, theme-consistent) ── */
const LeaderboardIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="14" width="4" height="8" rx="1" />
    <rect x="10" y="6" width="4" height="16" rx="1" />
    <rect x="16" y="10" width="4" height="12" rx="1" />
  </svg>
);

const LogIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const HelpIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
);

const AudioIcon = ({ muted }: { muted: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    {muted ? (
      <>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </>
    )}
  </svg>
);

const ExitIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CoinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="#FFC107"
      opacity="0.2"
      stroke="#FFC107"
      strokeWidth="2"
    />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="#FFC107"
      fontSize="12"
      fontWeight="bold"
    >
      $
    </text>
  </svg>
);

export interface GameBoardProps {
  gameId: string;
  playerId: string;
  onPlayAgain: () => void | Promise<void>;
  onExit?: () => void;
  roomLeaderboard?: LeaderboardEntry[];
}

const CONFETTI_COLORS = [
  "#F6C445",
  "#7DD3FC",
  "#34D399",
  "#FB7185",
  "#C084FC",
  "#F97316",
];
const CONFETTI_PIECES = Array.from({ length: 44 }, (_, index) => ({
  id: index,
  x: (index * 17) % 100,
  delay: (index % 11) * 0.08,
  duration: 2.8 + (index % 5) * 0.45,
  rotation: -140 + ((index * 29) % 280),
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));

const PINNED_CHARACTERS = [
  Character.DUKE,
  Character.ASSASSIN,
  Character.CAPTAIN,
  Character.AMBASSADOR,
  Character.CONTESSA,
];

export function GameBoard({
  gameId,
  playerId,
  onPlayAgain,
  onExit,
  roomLeaderboard = [],
}: GameBoardProps) {
  const router = useRouter();
  const {
    status,
    send,
    gameState,
    isMyTurn,
    currentPlayerName,
    winnerName,
    isGameOver,
    timerRemaining,
    timerProgress,
    activeEvent,
    activeCardEffect,
    responseStatus,
    isWinner,
  } = useGameBoard(gameId, playerId);
  const [showGuide, setShowGuide] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPinnedGuide, setShowPinnedGuide] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"table" | "room">("table");
  const [actionHint, setActionHint] = useState<string | null>(null);
  const pinnedGuideDragControls = useDragControls();
  const [timelinePreferenceTouched, setTimelinePreferenceTouched] =
    useState(false);
  const isMobile = useIsMobile();
  const s = gameBoardStyles(isMobile);
  const actionPanel = useActionPanel(send);
  const { isMuted, playActionSound, playTurnSound, toggleMute } =
    useGameAudio();
  const previousIsMyTurnRef = React.useRef(false);

  useEffect(() => {
    if (timelinePreferenceTouched) {
      return;
    }
    setShowTimeline(!isMobile);
  }, [isMobile, timelinePreferenceTouched]);

  useEffect(() => {
    if (!actionHint) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setActionHint(null);
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actionHint]);

  useEffect(() => {
    if (isMyTurn || isGameOver) {
      setActionHint(null);
    }
  }, [isMyTurn, isGameOver]);

  useEffect(() => {
    if (isMyTurn && !previousIsMyTurnRef.current && !isGameOver) {
      void playTurnSound();
    }

    previousIsMyTurnRef.current = isMyTurn;
  }, [isGameOver, isMyTurn, playTurnSound]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (showExitConfirm) {
        setShowExitConfirm(false);
        return;
      }
      if (showDashboard) {
        setShowDashboard(false);
        return;
      }
      if (showGuide) {
        setShowGuide(false);
        return;
      }
      if (showTimeline) {
        setTimelinePreferenceTouched(true);
        setShowTimeline(false);
        return;
      }
      if (showPinnedGuide) {
        setShowPinnedGuide(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showDashboard,
    showExitConfirm,
    showGuide,
    showPinnedGuide,
    showTimeline,
  ]);

  const desktopEventCopy =
    activeEvent?.compactMessage ?? activeEvent?.message ?? "";
  const desktopEventTitle =
    activeEvent == null
      ? ""
      : activeEvent.type === "challenge"
        ? "Challenge Result"
        : activeEvent.type === "block"
          ? "Block Declared"
          : activeEvent.type === "action"
            ? activeEvent.title
            : activeEvent.title;

  if (!gameState) {
    return (
      <div
        style={{ ...s.wrapper, alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#8B95A8", fontSize: 16 }}>
          {status === "connecting" ? "Connecting..." : "Loading game..."}
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players.find((p) => p.id === playerId);
  const duplicateRoomNames = roomLeaderboard.reduce<Record<string, number>>(
    (counts, entry) => {
      counts[entry.playerName] = (counts[entry.playerName] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const roomLeaderboardRows = roomLeaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    participationCount: Math.max(entry.gamesPlayed - entry.wins, 0),
    displayName:
      (duplicateRoomNames[entry.playerName] ?? 0) > 1
        ? `${entry.playerName} #${entry.playerKey.slice(-4).toUpperCase()}`
        : entry.playerName,
  }));
  const selectedTargetAction = actionPanel.selectedAction
    ? ACTION_RULES[actionPanel.selectedAction]
    : null;
  const commandTone = selectedTargetAction
    ? "info"
    : (responseStatus?.tone ?? (isMyTurn ? "warn" : "info"));
  const compactCommandTitle = selectedTargetAction
    ? `${selectedTargetAction.label} target selection`
    : isGameOver
      ? `${winnerName || "Winner"} won the table`
      : responseStatus?.title === "Your Move"
        ? "Your turn"
        : responseStatus?.title === "Waiting For Turn"
          ? `${currentPlayerName} acting`
          : (responseStatus?.title ??
            (isMyTurn ? "Your turn" : `${currentPlayerName} acting`));
  const mobileNavTitle = selectedTargetAction
    ? `${selectedTargetAction.label} target`
    : isGameOver
      ? isWinner
        ? "You won the table"
        : `${winnerName || "Winner"} won`
      : responseStatus?.title === "Your Move"
        ? "Your turn"
        : responseStatus?.title === "Waiting For Turn"
          ? `${currentPlayerName} acting`
          : compactCommandTitle;
  const navTitle = selectedTargetAction
    ? `Pick a target for ${selectedTargetAction.label}`
    : isGameOver
      ? `${winnerName || "Winner"} won`
      : responseStatus?.title === "Your Move"
        ? "Your move"
        : responseStatus?.title === "Waiting For Turn"
          ? `${currentPlayerName} acting`
          : compactCommandTitle;
  const navEyebrow = selectedTargetAction
    ? "Target mode"
    : isGameOver
      ? "Game over"
      : `Turn ${gameState.turnNumber}`;

  const toggleTimeline = () => {
    setTimelinePreferenceTouched(true);
    setShowTimeline((open) => !open);
  };

  const closeTimeline = () => {
    setTimelinePreferenceTouched(true);
    setShowTimeline(false);
  };

  const handleInactiveActionAttempt = () => {
    if (isGameOver) {
      setActionHint("The round is over.");
      return;
    }

    setActionHint(
      isMyTurn
        ? "Your turn."
        : `${currentPlayerName || "Another player"} is acting.`,
    );
  };

  const renderUtilityButtons = () => (
    <>
      <button
        style={s.utilBtn}
        onClick={() => setShowDashboard(true)}
        title="Leaderboard"
        aria-label="Show leaderboard"
      >
        <LeaderboardIcon />
      </button>
      <button
        style={s.utilBtn}
        onClick={toggleTimeline}
        title={showTimeline ? "Hide timeline" : "Show timeline"}
        aria-label={showTimeline ? "Hide timeline" : "Show timeline"}
      >
        <LogIcon />
      </button>
      <button
        style={s.utilBtn}
        onClick={() => setShowGuide(true)}
        title="Game rules"
        aria-label="Show game rules"
      >
        <HelpIcon />
      </button>
      <button
        style={s.utilBtn}
        onClick={toggleMute}
        title={isMuted ? "Unmute game sounds" : "Mute game sounds"}
        aria-label={isMuted ? "Unmute game sounds" : "Mute game sounds"}
      >
        <AudioIcon muted={isMuted} />
      </button>
    </>
  );

  const renderTimelinePanel = (mobilePanel: boolean) => (
    <motion.aside
      style={s.sidePanel(true)}
      initial={mobilePanel ? { x: 32, opacity: 0 } : { x: 18, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={mobilePanel ? { x: 40, opacity: 0 } : { x: 18, opacity: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      aria-label="Game timeline"
    >
      <div style={s.sidePanelHeader}>
        <div style={s.sidePanelHeadingGroup}>
          <span style={s.sidePanelEyebrow}>Live recap</span>
          <span style={s.sidePanelTitle}>Game Timeline</span>
          <span style={s.sidePanelSubtitle}>
            Turn flow, challenges, blocks, and eliminations.
          </span>
        </div>
        <button
          style={s.sidePanelCloseBtn}
          onClick={closeTimeline}
          aria-label="Close timeline"
        >
          X
        </button>
      </div>
      <div style={s.sidePanelBody}>
        <GameLog variant="panel" />
      </div>
    </motion.aside>
  );

  const handleExitConfirmed = () => {
    setShowExitConfirm(false);
    if (onExit) {
      onExit();
      return;
    }
    router.push("/");
  };

  return (
    <div style={s.wrapper}>
      <CoupBackgroundSVG />
      <div style={s.topBar}>
        <div style={s.topBarLeft}>
          {isMobile ? (
            <div
              style={s.mobileStatusPill(commandTone)}
              title={`WebSocket: ${status}`}
            >
              <span style={s.mobileConnectionDot(status)} />
              <div style={s.mobileStatusCopy}>
                <span style={s.mobileStatusEyebrow}>{navEyebrow}</span>
                <span style={s.mobileStatusTitle}>{mobileNavTitle}</span>
              </div>
              {!isGameOver && timerRemaining > 0 && (
                <span style={s.mobileTimerChip(commandTone)}>
                  {timerRemaining}s
                </span>
              )}
            </div>
          ) : (
            <div style={s.topStatusGroup}>
              <div
                style={s.connectionBadge(status)}
                title={`WebSocket: ${status}`}
              >
                <span style={s.connectionDot(status)} />
                <span style={s.connectionText}>
                  {status === "connected"
                    ? "Live"
                    : status === "connecting"
                      ? "Retrying"
                      : "Offline"}
                </span>
              </div>
              <div style={s.navStatusPill(commandTone)}>
                <div style={s.navStatusCopy}>
                  <span style={s.navStatusEyebrow}>{navEyebrow}</span>
                  <span style={s.navStatusTitle}>{navTitle}</span>
                </div>
              </div>
              {timerRemaining > 0 && (
                <div style={s.topTimerWrap}>
                  <Timer remaining={timerRemaining} progress={timerProgress} />
                </div>
              )}
            </div>
          )}
        </div>
        {!isMobile && (
          <div style={s.topBarCenter}>
            <AnimatePresence>
              {activeEvent && (
                <motion.div
                  key={activeEvent.id}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  style={s.topEventToast(activeEvent.accent)}
                >
                  <span style={s.topEventTitle(activeEvent.accent)}>
                    {desktopEventTitle}
                  </span>
                  <span style={s.topEventMessage}>{desktopEventCopy}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <div style={s.topBarRight}>
          {!isMobile && renderUtilityButtons()}
          <button
            style={s.exitBtn}
            onClick={() => setShowExitConfirm(true)}
            title="Exit game"
            aria-label="Exit game"
          >
            <ExitIcon />
            <span>Exit</span>
          </button>
        </div>
      </div>

      <div style={s.center}>
        <div style={s.contentGrid(showTimeline && !isMobile)}>
          <div style={s.mainColumn}>
            <div style={s.boardArea}>
              <OpponentArea
                isMobile={isMobile}
                activeCardEffect={activeCardEffect}
                targetModeAction={actionPanel.selectedAction}
                selectableTargetIds={actionPanel.selectableTargetIds}
                onSelectTarget={actionPanel.selectTarget}
              />
            </div>

            <div style={s.bottomArea}>
              <AnimatePresence>
                {actionHint && (
                  <motion.div
                    key={actionHint}
                    style={s.actionHintToast}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {actionHint}
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={s.playerCardArea(isMyTurn && !isGameOver)}>
                <div style={s.playerInfoInline(isMyTurn && !isGameOver)}>
                  <span style={s.playerNameLarge}>
                    {myPlayer?.name ?? "You"}
                  </span>
                  <span style={s.playerCoinsLarge}>
                    <CoinIcon size={isMobile ? 16 : 20} />{" "}
                    {myPlayer?.coins ?? 0}
                  </span>
                </div>
                <PlayerHand
                  send={send}
                  isMobile={isMobile}
                  activeCardEffect={activeCardEffect}
                />
              </div>
              <ActionPanel
                {...actionPanel}
                isMobile={isMobile}
                onInactiveActionAttempt={handleInactiveActionAttempt}
                onActionPress={playActionSound}
              />
            </div>
          </div>

          <AnimatePresence>
            {!isMobile && showTimeline && renderTimelinePanel(false)}
          </AnimatePresence>
        </div>
      </div>

      {isMobile && (
        <div style={s.mobileUtilityDock}>{renderUtilityButtons()}</div>
      )}

      <AnimatePresence>
        {isGameOver && isWinner && (
          <motion.div
            style={s.confettiLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {CONFETTI_PIECES.map((piece) => (
              <motion.span
                key={piece.id}
                style={s.confettiPiece(piece.x, piece.color)}
                initial={{ y: "-8vh", opacity: 0, rotate: 0 }}
                animate={{
                  y: "112vh",
                  opacity: [0, 1, 1, 0],
                  rotate: piece.rotation,
                }}
                transition={{
                  duration: piece.duration,
                  delay: piece.delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.7,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action event toast — outer div handles centering; inner motion.div owns its own transforms */}
      <AnimatePresence>
        {activeEvent && isMobile && (
          <div style={s.eventOverlayContainer}>
            <motion.div
              key={activeEvent.id}
              initial={{ opacity: 0, y: 28, scale: 0.86, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, scale: 0.94, filter: "blur(8px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={s.eventOverlay(activeEvent.accent)}
            >
              <div style={s.eventEffectLayer}>
                {activeEvent.effect === "coins" && (
                  <>
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={`coin-${index}`}
                        initial={{
                          opacity: 0,
                          x: -30 + index * 18,
                          y: 20,
                          scale: 0.7,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: 26 + index * 14,
                          y: -18 - index * 8,
                          scale: [0.7, 1, 0.85],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.08,
                          repeat: 1,
                          repeatDelay: 0.05,
                        }}
                        style={s.eventCoin(activeEvent.accent)}
                      />
                    ))}
                  </>
                )}
                {activeEvent.effect === "slash" && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -120, rotate: -24 }}
                      animate={{ opacity: [0, 1, 0], x: 150, rotate: -24 }}
                      transition={{ duration: 0.55, ease: "easeInOut" }}
                      style={s.eventSlash(activeEvent.accent)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0.2 }}
                      animate={{
                        opacity: [0, 0.85, 0],
                        scaleX: [0.2, 1, 1.05],
                      }}
                      transition={{ duration: 0.45, delay: 0.1 }}
                      style={s.eventSlashGlow(activeEvent.accent)}
                    />
                  </>
                )}
                {activeEvent.effect === "shield" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{
                      opacity: [0, 1, 0.15],
                      scale: [0.7, 1.05, 1.15],
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    style={s.eventShield(activeEvent.accent)}
                  />
                )}
                {activeEvent.effect === "swap" && (
                  <>
                    {[0, 1].map((index) => (
                      <motion.div
                        key={`swap-${index}`}
                        initial={{
                          opacity: 0,
                          x: index === 0 ? -18 : 18,
                          y: index === 0 ? -10 : 10,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          x: index === 0 ? [-18, 18, -18] : [18, -18, 18],
                          y: index === 0 ? [-10, 10, -10] : [10, -10, 10],
                        }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                        style={s.eventSwapOrb(activeEvent.accent)}
                      />
                    ))}
                  </>
                )}
                {activeEvent.effect === "impact" && (
                  <>
                    {[0, 1].map((index) => (
                      <motion.div
                        key={`impact-${index}`}
                        initial={{ opacity: 0.7, scale: 0.3 }}
                        animate={{
                          opacity: [0.7, 0],
                          scale: [0.3, 1.35 + index * 0.25],
                        }}
                        transition={{
                          duration: 0.75,
                          delay: index * 0.12,
                          ease: "easeOut",
                        }}
                        style={s.eventImpactRing(activeEvent.accent)}
                      />
                    ))}
                  </>
                )}
                {activeEvent.effect === "reveal" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, rotate: -6 }}
                    animate={{
                      opacity: [0, 0.95, 0.25],
                      y: [12, 0, -4],
                      rotate: [-6, 0, 0],
                    }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    style={s.eventRevealCard(activeEvent.accent)}
                  />
                )}
                {activeEvent.effect === "challenge" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.65 }}
                    animate={{ opacity: [0, 1, 0.2], scale: [0.65, 1.15, 1] }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    style={s.eventChallengeMark(activeEvent.accent)}
                  >
                    ?
                  </motion.div>
                )}
                {activeEvent.effect === "victory" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{
                      opacity: [0, 1, 0.3],
                      y: [8, -8, -12],
                      scale: [0.8, 1.08, 1.1],
                    }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                    style={s.eventVictoryGlow(activeEvent.accent)}
                  />
                )}
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.9, 1.08, 1], opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.45 }}
                style={s.eventSymbol(activeEvent.accent)}
              >
                {activeEvent.symbol}
              </motion.div>
              <div style={s.eventTextGroup}>
                <span style={s.eventTitle(activeEvent.accent)}>
                  {activeEvent.title}
                </span>
                <span style={s.eventMessage}>{activeEvent.message}</span>
              </div>
              <motion.div
                initial={{ scaleX: 0.35, opacity: 0.5 }}
                animate={{ scaleX: [0.35, 1, 0.85], opacity: [0.5, 1, 0.85] }}
                exit={{ scaleX: 0.2, opacity: 0 }}
                transition={{ duration: 0.7 }}
                style={s.eventPulse(activeEvent.accent)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Challenge / Block overlay */}
      <ChallengeBlockOverlay send={send} isMobile={isMobile} />

      {/* Game over modal */}
      <GameOverModal
        isOpen={isGameOver}
        winnerName={winnerName}
        isWinner={isWinner}
        onPlayAgain={onPlayAgain}
        onExit={() => {
          if (onExit) {
            onExit();
            return;
          }
          router.push("/");
        }}
      />

      {/* Guide modal */}
      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        canPinCharacterActions={!isMobile}
        onPinCharacterActions={
          !isMobile ? () => setShowPinnedGuide(true) : undefined
        }
      />

      <AnimatePresence>
        {!isMobile && showPinnedGuide && (
          <motion.div
            drag
            dragControls={pinnedGuideDragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.96, x: 24, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: 16, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={s.pinnedGuidePanel}
          >
            <div
              style={s.pinnedGuideHandle}
              onPointerDown={(event) => pinnedGuideDragControls.start(event)}
            >
              <span style={s.pinnedGuideHandleLabel}>Character Actions</span>
              <div style={s.pinnedGuideHandleActions}>
                <span style={s.pinnedGuideGrabber}>Drag</span>
                <button
                  type="button"
                  style={s.pinnedGuideCloseBtn}
                  onClick={() => setShowPinnedGuide(false)}
                  aria-label="Close pinned guide"
                >
                  ✕
                </button>
              </div>
            </div>
            <div style={s.pinnedGuideBody}>
              {PINNED_CHARACTERS.map((character) => (
                <div key={character} style={s.pinnedGuideRow}>
                  <span style={s.pinnedGuideName}>
                    {CHARACTER_LABELS[character]}
                  </span>
                  <span style={s.pinnedGuideText}>
                    {CHARACTER_ABILITIES[character]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit confirmation */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showExitConfirm && (
              <motion.div
                style={s.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowExitConfirm(false)}
              >
                <motion.div
                  style={s.confirmModalContent}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div style={s.modalHeader}>
                    <div style={s.modalHeaderCopy}>
                      <span style={s.modalEyebrow}>Exit game</span>
                      <span style={s.modalTitle}>Leave this match?</span>
                      <span style={s.modalSubtitle}>
                        You will leave the table and return to the home screen.
                        The match will continue for anyone still connected.
                      </span>
                    </div>
                    <button
                      style={s.modalCloseBtn}
                      onClick={() => setShowExitConfirm(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div style={s.confirmModalActions}>
                    <button
                      style={s.confirmModalCancelBtn}
                      onClick={() => setShowExitConfirm(false)}
                    >
                      Stay
                    </button>
                    <button
                      style={s.confirmModalDangerBtn}
                      onClick={handleExitConfirmed}
                    >
                      Exit game
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* Leaderboard modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showDashboard && gameState && (
              <motion.div
                style={s.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDashboard(false)}
              >
                <motion.div
                  style={s.modalContent}
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={s.modalHeader}>
                    <div style={s.modalHeaderCopy}>
                      <span style={s.modalEyebrow}>Leaderboard</span>
                      <span style={s.modalTitle}>Standings</span>
                      <span style={s.modalSubtitle}>
                        Switch between the live table and this room&apos;s
                        cross-game scores.
                      </span>
                    </div>
                    <button
                      style={s.modalCloseBtn}
                      onClick={() => setShowDashboard(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <div style={s.modalTabs}>
                    <button
                      style={s.modalTab(dashboardTab === "table")}
                      onClick={() => setDashboardTab("table")}
                    >
                      Current table
                    </button>
                    <button
                      style={s.modalTab(dashboardTab === "room")}
                      onClick={() => setDashboardTab("room")}
                    >
                      Room scores
                    </button>
                  </div>

                  {dashboardTab === "table" ? (
                    <GameDashboard
                      gameState={gameState}
                      myPlayerId={playerId}
                      isMobile={isMobile}
                    />
                  ) : roomLeaderboardRows.length > 0 ? (
                    <div style={s.roomScoreList}>
                      {roomLeaderboardRows.map((entry) => (
                        <div
                          key={`${entry.playerKey}-${entry.rank}`}
                          style={s.roomScoreRow}
                        >
                          <div style={s.roomScoreMeta}>
                            <span style={s.rankBadge}>{entry.rank}</span>
                            <div style={s.roomScoreCopy}>
                              <span style={s.roomScoreName}>
                                {entry.displayName}
                              </span>
                              <span style={s.roomScoreSubline}>
                                {entry.wins} wins + {entry.participationCount}{" "}
                                participation · {entry.gamesPlayed} games ·{" "}
                                {(entry.winRate * 100).toFixed(0)}% win rate
                              </span>
                            </div>
                          </div>
                          <span style={s.roomScoreBadge}>
                            {entry.score} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={s.roomScoreEmpty}>
                      No completed games for this room yet. Finish the first
                      round and room-only cross-game scores will appear here.
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <AnimatePresence>
        {isMobile && showTimeline && (
          <motion.div
            style={s.mobileSidePanelOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeTimeline}
          >
            <div
              style={s.mobileSidePanelShell}
              onClick={(e) => e.stopPropagation()}
            >
              {renderTimelinePanel(true)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
