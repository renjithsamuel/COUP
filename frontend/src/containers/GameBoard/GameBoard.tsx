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
  CHARACTER_GUIDE_DETAILS,
  CHARACTER_LABELS,
  CHARACTER_TEXT_COLORS,
} from "@/models/card";
import { LeaderboardEntry } from "@/models/lobby";
import { useActionPanel } from "@/containers/ActionPanel/ActionPanel.hooks";
import {
  chooseVictoryCardDesign,
  downloadVictoryCard,
  shareVictoryCard,
  type VictoryCardDesign,
} from "@/utils/shareVictoryCard";
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
  lobbyId?: string;
  onPlayAgain: () => void | Promise<void>;
  showPlayAgainAction?: boolean;
  playAgainLabel?: string;
  playAgainPendingLabel?: string;
  onExit?: () => void;
  roomLeaderboard?: LeaderboardEntry[];
}

const CONFETTI_COLORS = [
  "#F6C445",
  "#EDE4CF",
  "#8CCBFF",
  "#F7B7A3",
];
const CONFETTI_PIECES = Array.from({ length: 44 }, (_, index) => ({
  id: index,
  x: (index * 17) % 100,
  delay: (index % 11) * 0.08,
  duration: 2.8 + (index % 5) * 0.45,
  rotation: -140 + ((index * 29) % 280),
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
}));
const CONFETTI_DUST = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  x: (index * 23 + 9) % 100,
  delay: (index % 8) * 0.12,
  duration: 3.8 + (index % 4) * 0.55,
  drift: -40 + ((index * 19) % 80),
  size: 4 + (index % 3) * 2,
  color: CONFETTI_COLORS[(index + 1) % CONFETTI_COLORS.length],
}));

const PINNED_CHARACTERS = [
  Character.DUKE,
  Character.ASSASSIN,
  Character.CAPTAIN,
  Character.AMBASSADOR,
  Character.CONTESSA,
];

const GAME_START_COUNTDOWN = [
  {
    label: "3",
    accent: "#F6C445",
    eyebrow: "Match starting",
    detail: "Take a breath. The table is about to open.",
  },
  {
    label: "2",
    accent: "#8FB8FF",
    eyebrow: "Seats locked",
    detail: "Everyone is in. Your opening read starts now.",
  },
  {
    label: "1",
    accent: "#7BE0B8",
    eyebrow: "Focus up",
    detail: "Cards are live and your first move is next.",
  },
  {
    label: "GO",
    accent: "#F59E0B",
    eyebrow: "Table live",
    detail: "Play sharp.",
  },
] as const;

const GAME_START_STEP_MS = 700;
const GAME_START_EXIT_MS = 200;
const GAME_OVER_HOLD_MS = 3000;
const VICTORY_CONFETTI_DURATION_MS = 10000;
const PINNED_GUIDE_MIN_WIDTH = 300;
const PINNED_GUIDE_MAX_WIDTH = 520;
const PINNED_GUIDE_MIN_HEIGHT = 250;
const PINNED_GUIDE_MAX_HEIGHT = 620;
const POST_GAME_TRAY_MIN_WIDTH = 228;
const POST_GAME_TRAY_MAX_WIDTH = 360;
const POST_GAME_TRAY_MIN_HEIGHT = 148;
const POST_GAME_TRAY_MAX_HEIGHT = 280;
const gameStartCountdownStorageKey = (gameId: string) =>
  `coup:game-start-countdown:${gameId}`;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function GameBoard({
  gameId,
  playerId,
  lobbyId,
  onPlayAgain,
  showPlayAgainAction = true,
  playAgainLabel = "Play Again",
  playAgainPendingLabel = "Returning...",
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
  const [countdownStepIndex, setCountdownStepIndex] = useState<number | null>(
    null,
  );
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isReplayPending, setIsReplayPending] = useState(false);
  const [isSharingVictory, setIsSharingVictory] = useState(false);
  const [showVictoryConfetti, setShowVictoryConfetti] = useState(false);
  const [victoryCardDesign, setVictoryCardDesign] =
    useState<VictoryCardDesign | null>(null);
  const [isMobilePostGameTrayExpanded, setIsMobilePostGameTrayExpanded] =
    useState(false);
  const [postGameTraySize, setPostGameTraySize] = useState({
    width: 296,
    height: 188,
  });
  const [pinnedGuideSize, setPinnedGuideSize] = useState({
    width: 348,
    height: 364,
  });
  const postGameTrayDragControls = useDragControls();
  const pinnedGuideDragControls = useDragControls();
  const postGameTrayResizeRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const pinnedGuideResizeRef = React.useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const [timelinePreferenceTouched, setTimelinePreferenceTouched] =
    useState(false);
  const isMobile = useIsMobile();
  const s = gameBoardStyles(isMobile);
  const actionPanel = useActionPanel(send);
  const { isMuted, playActionSound, playTurnSound, toggleMute } =
    useGameAudio();
  const previousIsMyTurnRef = React.useRef(false);
  const hasGameLoaded = gameState != null;

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
    if (isMyTurn) {
      setActionHint(null);
    }
  }, [isMyTurn]);

  useEffect(() => {
    if (!showPinnedGuide) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = pinnedGuideResizeRef.current;
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }

      const maxWidth = Math.min(PINNED_GUIDE_MAX_WIDTH, window.innerWidth - 80);
      const maxHeight = Math.min(
        PINNED_GUIDE_MAX_HEIGHT,
        window.innerHeight - 140,
      );

      setPinnedGuideSize({
        width: clamp(
          resizeState.startWidth + event.clientX - resizeState.startX,
          PINNED_GUIDE_MIN_WIDTH,
          Math.max(PINNED_GUIDE_MIN_WIDTH, maxWidth),
        ),
        height: clamp(
          resizeState.startHeight + event.clientY - resizeState.startY,
          PINNED_GUIDE_MIN_HEIGHT,
          Math.max(PINNED_GUIDE_MIN_HEIGHT, maxHeight),
        ),
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (pinnedGuideResizeRef.current?.pointerId === event.pointerId) {
        pinnedGuideResizeRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [showPinnedGuide]);

  useEffect(() => {
    if (isMobile) {
      return undefined;
    }

    const postGameTray = isGameOver && !showGameOverModal;
    if (!postGameTray) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = postGameTrayResizeRef.current;
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }

      const maxWidth = Math.min(POST_GAME_TRAY_MAX_WIDTH, window.innerWidth - 24);
      const maxHeight = Math.min(POST_GAME_TRAY_MAX_HEIGHT, window.innerHeight - 110);

      setPostGameTraySize({
        width: clamp(
          resizeState.startWidth + event.clientX - resizeState.startX,
          POST_GAME_TRAY_MIN_WIDTH,
          Math.max(POST_GAME_TRAY_MIN_WIDTH, maxWidth),
        ),
        height: clamp(
          resizeState.startHeight + event.clientY - resizeState.startY,
          POST_GAME_TRAY_MIN_HEIGHT,
          Math.max(POST_GAME_TRAY_MIN_HEIGHT, maxHeight),
        ),
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (postGameTrayResizeRef.current?.pointerId === event.pointerId) {
        postGameTrayResizeRef.current = null;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isGameOver, isMobile, showGameOverModal]);

  useEffect(() => {
    if (!isGameOver) {
      setShowGameOverModal(false);
      setIsReplayPending(false);
      setIsSharingVictory(false);
      setShowVictoryConfetti(false);
      setVictoryCardDesign(null);
      setIsMobilePostGameTrayExpanded(false);
      return undefined;
    }

    setVictoryCardDesign(
      chooseVictoryCardDesign(
        `${gameId}:${winnerName || playerId || "winner"}:${gameState?.turnNumber ?? 0}`,
      ),
    );
    setPostGameTraySize(
      isMobile
        ? { width: 228, height: isWinner ? 146 : 136 }
        : { width: 304, height: isWinner ? 196 : 176 },
    );
    setIsMobilePostGameTrayExpanded(false);
    setShowGameOverModal(false);
    const timerId = window.setTimeout(() => {
      setShowGameOverModal(true);
    }, GAME_OVER_HOLD_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [gameId, gameState?.turnNumber, isGameOver, isMobile, isWinner, playerId, winnerName]);

  useEffect(() => {
    if (!isGameOver || !isWinner) {
      setShowVictoryConfetti(false);
      return undefined;
    }

    setShowVictoryConfetti(true);
    const timerId = window.setTimeout(() => {
      setShowVictoryConfetti(false);
    }, VICTORY_CONFETTI_DURATION_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isGameOver, isWinner]);

  useEffect(() => {
    if (isMyTurn && !previousIsMyTurnRef.current && !isGameOver) {
      void playTurnSound();
    }

    previousIsMyTurnRef.current = isMyTurn;
  }, [isGameOver, isMyTurn, playTurnSound]);

  useEffect(() => {
    if (!hasGameLoaded || isGameOver || typeof window === "undefined") {
      return;
    }

    const storageKey = gameStartCountdownStorageKey(gameId);
    if (window.sessionStorage.getItem(storageKey) === "shown") {
      setCountdownStepIndex(null);
      return;
    }

    window.sessionStorage.setItem(storageKey, "shown");
    setCountdownStepIndex(0);

    const stepTimers = GAME_START_COUNTDOWN.slice(1).map((_, index) =>
      window.setTimeout(
        () => {
          setCountdownStepIndex(index + 1);
        },
        (index + 1) * GAME_START_STEP_MS,
      ),
    );
    const finishTimer = window.setTimeout(
      () => {
        setCountdownStepIndex(null);
      },
      GAME_START_COUNTDOWN.length * GAME_START_STEP_MS + GAME_START_EXIT_MS,
    );

    return () => {
      stepTimers.forEach((timerId) => window.clearTimeout(timerId));
      window.clearTimeout(finishTimer);
    };
  }, [gameId, hasGameLoaded, isGameOver]);

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
  const activeCountdownStep =
    countdownStepIndex == null
      ? null
      : GAME_START_COUNTDOWN[countdownStepIndex];
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
    const loadingLabel =
      status === "connecting"
        ? "Connecting to table..."
        : status === "error" || status === "disconnected"
          ? "Reconnecting to table..."
          : "Loading game...";

    return (
      <div
        style={{ ...s.wrapper, alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ color: "#8B95A8", fontSize: 16 }}>
          {loadingLabel}
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
      onClick={mobilePanel ? (event) => event.stopPropagation() : undefined}
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

  const handleExitHome = () => {
    setShowExitConfirm(false);
    if (onExit) {
      onExit();
      return;
    }
    router.push("/");
  };

  const handlePlayAgain = async () => {
    if (!showPlayAgainAction || isReplayPending) {
      return;
    }

    setShowGameOverModal(false);
    setIsReplayPending(true);
    try {
      await onPlayAgain();
    } catch {
      setIsReplayPending(false);
      setActionHint("Unable to start the next round.");
    }
  };

  const handleShareWin = async () => {
    if (!isWinner || isSharingVictory || !victoryCardDesign) {
      return;
    }

    setIsSharingVictory(true);
    try {
      const outcome = await shareVictoryCard(
        winnerName || myPlayer?.name || "Winner",
        victoryCardDesign,
      );
      setActionHint(outcome === "shared" ? "Victory card shared." : "Victory card downloaded.");
    } catch {
      setActionHint("Could not prepare the victory card.");
    } finally {
      setIsSharingVictory(false);
    }
  };

  const handleDownloadWin = async () => {
    if (!isWinner || isSharingVictory || !victoryCardDesign) {
      return;
    }

    setIsSharingVictory(true);
    try {
      await downloadVictoryCard(
        winnerName || myPlayer?.name || "Winner",
        victoryCardDesign,
      );
      setActionHint("Victory card downloaded.");
    } catch {
      setActionHint("Could not export the victory card.");
    } finally {
      setIsSharingVictory(false);
    }
  };

  const postGameTray = isGameOver && !showGameOverModal;
  const shouldShowPostGameTray =
    postGameTray && !(isMobile && (showTimeline || showDashboard || showGuide));
  const showMobileTopPostGameRecap = shouldShowPostGameTray && isMobile;
  const postGameTrayTitle = isWinner
    ? "You won the table"
    : `${winnerName || "Winner"} won the table`;
  const postGameTrayCopy = lobbyId
    ? showPlayAgainAction
      ? "Open the summary, then pull the whole room back to the lobby when you are ready."
      : "The host controls the return. Stay here and you will be pulled back to the lobby automatically."
    : isWinner
      ? victoryCardDesign?.tagline ?? "Share the finish or run the room again."
      : "Open the summary for the result, then reset when you are ready.";
  const widthRatio =
    (pinnedGuideSize.width - PINNED_GUIDE_MIN_WIDTH) /
    (PINNED_GUIDE_MAX_WIDTH - PINNED_GUIDE_MIN_WIDTH);
  const heightRatio =
    (pinnedGuideSize.height - PINNED_GUIDE_MIN_HEIGHT) /
    (PINNED_GUIDE_MAX_HEIGHT - PINNED_GUIDE_MIN_HEIGHT);
  const pinnedGuideScale = 0.94 + clamp((widthRatio + heightRatio) / 2, 0, 1) * 0.22;

  const handlePinnedGuideResizeStart = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    pinnedGuideResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: pinnedGuideSize.width,
      startHeight: pinnedGuideSize.height,
    };
  };

  const handlePostGameTrayResizeStart = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    postGameTrayResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: postGameTraySize.width,
      startHeight: postGameTraySize.height,
    };
  };

  const renderPinnedGuideSegments = (character: Character) =>
    CHARACTER_GUIDE_DETAILS[character].segments.map((segment, index) => {
      if (segment.tone === "action") {
        return (
          <span
            key={`${character}-guide-${index}`}
            style={s.pinnedGuideInlineAction(CHARACTER_TEXT_COLORS[character])}
          >
            {segment.text}
          </span>
        );
      }

      if (segment.tone === "card") {
        return (
          <span
            key={`${character}-guide-${index}`}
            style={s.pinnedGuideInlineCard(CHARACTER_TEXT_COLORS[character])}
          >
            {segment.text}
          </span>
        );
      }

      return (
        <React.Fragment key={`${character}-guide-${index}`}>
          {segment.text}
        </React.Fragment>
      );
    });

  return (
    <div style={s.wrapper}>
      <CoupBackgroundSVG />
      <div style={s.topBar}>
        <div style={s.topBarLeft}>
          {isMobile ? (
            showMobileTopPostGameRecap ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background:
                      "linear-gradient(140deg, rgba(12,20,37,0.94), rgba(18,30,53,0.96))",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
                    backdropFilter: "blur(16px)",
                    padding: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: isWinner ? "#F6C445" : "#9CC8FF",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1.1,
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      {isWinner ? "Victory recap" : "Round summary"}
                    </div>
                    <div
                      style={{
                        color: "#F5F7FB",
                        fontSize: 13,
                        fontWeight: 800,
                        lineHeight: 1.25,
                      }}
                    >
                      {postGameTrayTitle}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobilePostGameTrayExpanded(false);
                        setShowGameOverModal(true);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(125,211,252,0.18)",
                        background: "rgba(125,211,252,0.08)",
                        color: "#D6F2FF",
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      Summary
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIsMobilePostGameTrayExpanded((value) => !value)
                      }
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.05)",
                        color: "#DCE6F6",
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      {isMobilePostGameTrayExpanded ? "Hide" : "More"}
                    </button>
                  </div>
                </div>
                {isMobilePostGameTrayExpanded && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      borderRadius: 18,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background:
                        "linear-gradient(140deg, rgba(12,20,37,0.98), rgba(18,30,53,0.99))",
                      boxShadow: "0 14px 32px rgba(0,0,0,0.34)",
                      backdropFilter: "blur(16px)",
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        color: "#B7C4D8",
                        fontSize: 11,
                        lineHeight: 1.5,
                      }}
                    >
                      {postGameTrayCopy}
                    </div>
                    {isWinner && victoryCardDesign && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignSelf: "flex-start",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 9px",
                          borderRadius: 999,
                          background: "rgba(255,193,7,0.1)",
                          border: "1px solid rgba(255,193,7,0.18)",
                          color: "#F6C445",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {victoryCardDesign.themeLabel}
                      </div>
                    )}
                    {showPlayAgainAction && (
                      <button
                        type="button"
                        onClick={() => void handlePlayAgain()}
                        disabled={isReplayPending}
                        style={{
                          minWidth: 0,
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,193,7,0.42)",
                          background:
                            "linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))",
                          color: "#F6C445",
                          fontWeight: 900,
                          fontSize: 12,
                          letterSpacing: 0.5,
                          cursor: isReplayPending ? "wait" : "pointer",
                          opacity: isReplayPending ? 0.72 : 1,
                        }}
                      >
                        {isReplayPending ? playAgainPendingLabel : playAgainLabel}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
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
            )
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

              {isMobile ? (
                <>
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
                </>
              ) : (
                <div style={s.bottomDesktopRow}>
                  <div style={s.playerCardAreaDesktop(isMyTurn && !isGameOver)}>
                    <div style={s.playerInfoInline(isMyTurn && !isGameOver)}>
                      <span style={s.playerNameLarge}>
                        {myPlayer?.name ?? "You"}
                      </span>
                      <span style={s.playerCoinsLarge}>
                        <CoinIcon size={20} /> {myPlayer?.coins ?? 0}
                      </span>
                    </div>
                    <PlayerHand
                      send={send}
                      isMobile={false}
                      activeCardEffect={activeCardEffect}
                    />
                  </div>
                  <div style={s.actionPanelDesktopWrap}>
                    <ActionPanel
                      {...actionPanel}
                      isMobile={false}
                      desktopTwoColumn
                      onInactiveActionAttempt={handleInactiveActionAttempt}
                      onActionPress={playActionSound}
                    />
                  </div>
                </div>
              )}
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
        {activeCountdownStep && !isGameOver && (
          <motion.div
            style={s.startCountdownOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <motion.div
              style={s.startCountdownAura(activeCountdownStep.accent)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              style={s.startCountdownCard(activeCountdownStep.accent)}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.03, y: -10 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={s.startCountdownHeader}>
                <span style={s.startCountdownEyebrow}>Ready</span>
                <div style={s.startCountdownDots} aria-hidden="true">
                  {GAME_START_COUNTDOWN.map((step, index) => (
                    <span
                      key={step.label}
                      style={s.startCountdownDot(
                        index === countdownStepIndex,
                        index <= (countdownStepIndex ?? -1),
                        step.accent,
                      )}
                    />
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCountdownStep.label}
                  style={s.startCountdownContent}
                  initial={{
                    opacity: 0,
                    scale: 0.82,
                    y: 22,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.08,
                    y: -12,
                    filter: "blur(10px)",
                  }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span
                    style={s.startCountdownStepLabel(
                      activeCountdownStep.accent,
                    )}
                  >
                    {activeCountdownStep.eyebrow}
                  </span>
                  <span
                    style={s.startCountdownValue(
                      activeCountdownStep.accent,
                      activeCountdownStep.label === "GO",
                    )}
                  >
                    {activeCountdownStep.label}
                  </span>
                  <span style={s.startCountdownDetail}>
                    {activeCountdownStep.detail}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && isWinner && showVictoryConfetti && (
          <motion.div
            style={s.confettiLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={s.victoryHalo}
              animate={{
                opacity: [0.42, 0.82, 0.42],
                scale: [0.92, 1.05, 0.96],
              }}
              transition={{
                duration: 2.6,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
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
            {CONFETTI_DUST.map((particle) => (
              <motion.span
                key={`dust-${particle.id}`}
                style={s.confettiDust(particle.x, particle.size, particle.color)}
                initial={{ x: 0, y: "-6vh", opacity: 0, scale: 0.72 }}
                animate={{
                  x: [0, particle.drift * 0.45, particle.drift],
                  y: ["-6vh", "38vh", "106vh"],
                  opacity: [0, 0.75, 0.42, 0],
                  scale: [0.72, 1, 0.9],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.1,
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
        isOpen={isGameOver && showGameOverModal}
        winnerName={winnerName}
        isWinner={isWinner}
        onPlayAgain={handlePlayAgain}
        showPrimaryAction={showPlayAgainAction}
        primaryActionLabel={playAgainLabel}
        primaryActionPendingLabel={playAgainPendingLabel}
        onClose={() => setShowGameOverModal(false)}
        onShareWin={handleShareWin}
        onDownloadWin={handleDownloadWin}
        isSharingWin={isSharingVictory}
        victoryCardDesign={victoryCardDesign}
        onExit={() => {
          setShowGameOverModal(false);
          setShowExitConfirm(true);
        }}
      />

      <AnimatePresence>
        {shouldShowPostGameTray && !isMobile && (
          <motion.div
            drag
            dragControls={postGameTrayDragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: isMobile
                ? "calc(env(safe-area-inset-top, 0px) + 58px)"
                : "calc(env(safe-area-inset-top, 0px) + 98px)",
              right: isMobile ? 10 : 24,
              zIndex: 220,
              display: "flex",
              justifyContent: "flex-end",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                width: isMobile
                  ? `min(84vw, ${postGameTraySize.width}px)`
                  : `${postGameTraySize.width}px`,
                minHeight: postGameTraySize.height,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.1)",
                background:
                  "linear-gradient(140deg, rgba(12,20,37,0.94), rgba(18,30,53,0.96))",
                boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
                backdropFilter: "blur(16px)",
                padding: isMobile ? 12 : 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  cursor: "grab",
                }}
                onPointerDown={(event) => postGameTrayDragControls.start(event)}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      color: isWinner ? "#F6C445" : "#9CC8FF",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.1,
                      textTransform: "uppercase",
                      marginBottom: 3,
                    }}
                  >
                    {isWinner ? "Victory recap" : "Round summary"}
                  </div>
                  <div
                    style={{
                      color: "#F5F7FB",
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 800,
                      marginBottom: 2,
                      lineHeight: 1.3,
                    }}
                  >
                    {postGameTrayTitle}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePostGameTrayResizeStart}
                  aria-label="Resize summary tray"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#DCE6F6",
                    cursor: "nwse-resize",
                    flexShrink: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  +
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 0,
                  justifyContent: "space-between",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    color: "#B7C4D8",
                    fontSize: 12,
                    lineHeight: 1.55,
                  }}
                >
                  {postGameTrayCopy}
                </div>
                {isWinner && victoryCardDesign && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(255,193,7,0.1)",
                      border: "1px solid rgba(255,193,7,0.18)",
                      color: "#F6C445",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {victoryCardDesign.themeLabel}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowGameOverModal(true)}
                  style={{
                    minWidth: 0,
                    padding: isMobile ? "10px 12px" : "11px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(125,211,252,0.18)",
                    background: "rgba(125,211,252,0.08)",
                    color: "#D6F2FF",
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: 0.5,
                    cursor: "pointer",
                  }}
                >
                  Summary
                </button>
                {showPlayAgainAction && (
                  <button
                    type="button"
                    onClick={() => void handlePlayAgain()}
                    disabled={isReplayPending}
                    style={{
                      minWidth: 0,
                      padding: isMobile ? "10px 12px" : "11px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,193,7,0.42)",
                      background:
                        "linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,143,0,0.15))",
                      color: "#F6C445",
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: 0.5,
                      cursor: isReplayPending ? "wait" : "pointer",
                      opacity: isReplayPending ? 0.72 : 1,
                    }}
                  >
                    {isReplayPending ? playAgainPendingLabel : playAgainLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            style={s.pinnedGuidePanel(pinnedGuideSize.width, pinnedGuideSize.height)}
          >
            <div
              style={s.pinnedGuideHandle}
              onPointerDown={(event) => pinnedGuideDragControls.start(event)}
            >
              <span style={s.pinnedGuideHandleLabel(pinnedGuideScale)}>
                Character Actions
              </span>
              <div style={s.pinnedGuideHandleActions}>
                <span style={s.pinnedGuideGrabber(pinnedGuideScale)}>Drag</span>
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
            <div style={s.pinnedGuideBody(pinnedGuideSize.height)}>
              {PINNED_CHARACTERS.map((character) => (
                <div key={character} style={s.pinnedGuideRow}>
                  <div style={s.pinnedGuideTitleRow}>
                    <span
                      style={s.pinnedGuideName(
                        CHARACTER_TEXT_COLORS[character],
                        pinnedGuideScale,
                      )}
                    >
                      {CHARACTER_LABELS[character]}
                    </span>
                    <span
                      style={s.pinnedGuideActionBadge(
                        CHARACTER_TEXT_COLORS[character],
                        pinnedGuideScale,
                      )}
                    >
                      {CHARACTER_GUIDE_DETAILS[character].actionLabel}
                    </span>
                  </div>
                  <span style={s.pinnedGuideText(pinnedGuideScale)}>
                    {renderPinnedGuideSegments(character)}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="Resize pinned guide"
              onPointerDown={handlePinnedGuideResizeStart}
              style={s.pinnedGuideResizeHandle}
            >
              <span style={s.pinnedGuideResizeGlyph}>↘</span>
            </button>
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
                        Leave the table and return to the home screen. The match will continue for anyone still connected.
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
                      Cancel
                    </button>
                    <button
                      style={s.confirmModalDangerBtn}
                      onClick={handleExitHome}
                    >
                      Quit
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
            {renderTimelinePanel(true)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
