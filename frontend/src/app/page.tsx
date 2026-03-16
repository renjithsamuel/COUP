"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useCreateAiMatch,
  useCreateLobby,
  useJoinLobby,
} from "@/queries/useLobbyQueries";
import { lobbySessionStore } from "@/services/lobbyService";
import {
  fadeInVariants,
  interactiveHoverMotion,
  interactiveTapMotion,
  slideUpVariants,
  scalePopVariants,
} from "@/animations";
import { ConnectionOverlay } from "@/components/ConnectionOverlay";
import { CoupBackgroundSVG } from "@/components/CoupBackgroundSVG";
import { PreGameConfig } from "@/components/PreGameConfig";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { tokens } from "@/theme/tokens";
import { AiDifficulty, GameConfig } from "@/models/lobby";
import { ApiError } from "@/services/api";
import { GAME_CONSTANTS } from "@/utils/constants";

type PlayMode = "friends" | "ai";
type MobileFlow = "home" | "mode" | "friends" | "create" | "join" | "ai";

function CoupLogo({ compact = false }: { compact?: boolean }) {
  const size = compact ? 64 : 88;

  return (
    <svg width={size} height={size} viewBox="0 0 88 88" aria-hidden="true">
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1528" />
          <stop offset="100%" stopColor="#173257" />
        </linearGradient>
        <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe082" />
          <stop offset="100%" stopColor="#f6c445" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="72"
        height="72"
        rx="24"
        fill="url(#logoBg)"
        stroke="rgba(255,255,255,0.12)"
      />
      <rect
        x="22"
        y="30"
        width="20"
        height="30"
        rx="6"
        transform="rotate(-8 22 30)"
        fill="#10213d"
        stroke="#36598b"
      />
      <rect
        x="46"
        y="30"
        width="20"
        height="30"
        rx="6"
        transform="rotate(8 46 30)"
        fill="#10213d"
        stroke="#36598b"
      />
      <path
        d="M44 16 51 26 62 23 58 35 67 42 55 44 51 56 44 47 37 56 33 44 21 42 30 35 26 23 37 26Z"
        fill="url(#logoGold)"
        stroke="#fff2be"
      />
      <path
        d="M36 60h16"
        stroke="#f6c445"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const s = {
  page: {
    minHeight: "100dvh",
    background: tokens.board.bg,
    position: "relative" as const,
    overflow: "hidden" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(10px, 2vw, 16px)",
    boxSizing: "border-box" as const,
    zIndex: 1,
  },
  stage: {
    width: "100%",
    maxWidth: 1180,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "clamp(14px, 2.8vw, 28px)",
    alignItems: "stretch",
    position: "relative" as const,
    zIndex: 1,
  },
  heroCard: {
    position: "relative" as const,
    overflow: "hidden" as const,
    borderRadius: 28,
    padding: "clamp(24px, 5vw, 40px)",
    background:
      "linear-gradient(155deg, rgba(10, 16, 30, 0.94) 0%, rgba(18, 28, 48, 0.9) 45%, rgba(11, 17, 32, 0.96) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: tokens.elevation.dp24,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    minHeight: 500,
  },
  heroGlow: {
    position: "absolute" as const,
    inset: "auto -20% -20% auto",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,193,7,0.18) 0%, rgba(255,193,7,0) 72%)",
    pointerEvents: "none" as const,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.56)",
    marginBottom: 12,
    fontWeight: 800,
  },
  title: {
    fontSize: "clamp(28px, 7vw, 48px)",
    fontWeight: 900,
    color: tokens.text.primary,
    letterSpacing: "clamp(3px, 1vw, 6px)",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.text.secondary,
    marginBottom: "clamp(14px, 3vw, 24px)",
    textAlign: "left" as const,
    lineHeight: 1.55,
    maxWidth: 500,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 10,
    marginTop: 8,
  },
  featureCard: {
    padding: "12px 12px 13px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  },
  featureTitle: {
    color: tokens.text.primary,
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  featureText: {
    color: tokens.text.secondary,
    fontSize: 12,
    lineHeight: 1.55,
  },
  actionColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  actionShell: {
    width: "100%",
    padding: "clamp(14px, 3vw, 22px)",
    borderRadius: 22,
    background:
      "linear-gradient(180deg, rgba(9, 15, 28, 0.96) 0%, rgba(14, 22, 40, 0.96) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: tokens.elevation.dp16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  actionHeader: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.8,
    textTransform: "uppercase" as const,
  },
  actionSubtitle: {
    fontSize: 13,
    color: tokens.text.secondary,
    lineHeight: 1.45,
  },
  input: {
    padding: `${tokens.spacing.sm + 1}px ${tokens.spacing.md - 1}px`,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: tokens.surface.elevated,
    color: tokens.text.primary,
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  modeCard: {
    padding: "14px 14px 15px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: tokens.text.primary,
    textAlign: "left" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    cursor: "pointer",
  },
  modeCardActive: {
    border: "1px solid rgba(255,193,7,0.26)",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.16), rgba(255,143,0,0.08))",
    boxShadow: tokens.elevation.dp8,
  },
  modeCardTitle: {
    fontSize: 13,
    fontWeight: 800,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  modeCardText: {
    fontSize: 12,
    color: tokens.text.secondary,
    lineHeight: 1.55,
  },
  card: {
    width: "100%",
    padding: "clamp(14px, 3vw, 18px)",
    borderRadius: 18,
    background:
      "linear-gradient(180deg, rgba(18, 27, 45, 0.92) 0%, rgba(11, 17, 32, 0.98) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: tokens.elevation.dp8,
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: tokens.text.primary,
    textAlign: "center" as const,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  helperText: {
    color: tokens.text.secondary,
    fontSize: 11,
    lineHeight: 1.55,
    textAlign: "left" as const,
  },
  optionSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  optionLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
  },
  optionGridFour: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 6,
  },
  optionGridWide: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 6,
  },
  optionButton: {
    padding: "10px 8px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: tokens.text.primary,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  },
  optionButtonCompact: {
    padding: "10px 6px",
    fontSize: 11,
    letterSpacing: 0.2,
  },
  optionButtonActive: {
    border: "1px solid rgba(255,193,7,0.32)",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.16), rgba(255,143,0,0.08))",
    color: tokens.text.accent,
  },
  createBtn: {
    padding: `${tokens.spacing.sm + 1}px ${tokens.spacing.xl - 2}px`,
    borderRadius: 10,
    border: "1px solid rgba(255,193,7,0.3)",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,143,0,0.08))",
    color: tokens.text.accent,
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    width: "100%",
  },
  joinBtn: {
    padding: `${tokens.spacing.sm + 1}px ${tokens.spacing.xl - 2}px`,
    borderRadius: 10,
    border: "1px solid rgba(76,175,80,0.3)",
    background:
      "linear-gradient(135deg, rgba(46,125,50,0.2), rgba(76,175,80,0.15))",
    color: "#81C784",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    width: "100%",
  },
  divider: {
    display: "flex",
    alignItems: "center" as const,
    gap: tokens.spacing.md,
    width: "100%",
    margin: "0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: tokens.surface.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 700,
    color: tokens.text.muted,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  error: {
    color: "#ef5350",
    fontSize: 12,
    textAlign: "left" as const,
  },
  mobilePlayButton: {
    padding: "14px 18px",
    borderRadius: 16,
    border: "1px solid rgba(255, 193, 7, 0.26)",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.16), rgba(255,143,0,0.12))",
    color: tokens.text.primary,
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    cursor: "pointer",
    boxShadow: tokens.elevation.dp8,
  },
  mobileBackButton: {
    alignSelf: "flex-start",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: tokens.text.secondary,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    cursor: "pointer",
  },
};

const difficultyNotes: Record<AiDifficulty, string> = {
  easy: "Bluffs more, reads worse, and sometimes passes on strong plays.",
  medium: "Balanced bot table with believable pressure and occasional greed.",
  hard: "Sharper targeting and better challenges, but still not perfect.",
  lethal:
    "Punishes weak lines, counts public information better, and closes fast without feeling omniscient.",
};

const modeOptions: Array<{ key: PlayMode; title: string; text: string }> = [
  {
    key: "friends",
    title: "Play With Friends",
    text: "Create a private room or join by code. Same waiting room and replay flow as now.",
  },
  {
    key: "ai",
    title: "Play With AI",
    text: "Start immediately against 1 to 5 bots with difficulty-based bluff logic.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const createLobby = useCreateLobby();
  const joinLobby = useJoinLobby();
  const createAiMatch = useCreateAiMatch();

  const [playerName, setPlayerName] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [aiError, setAiError] = useState("");
  const [playMode, setPlayMode] = useState<PlayMode>("friends");
  const [mobileFlow, setMobileFlow] = useState<MobileFlow>("home");
  const [botCount, setBotCount] = useState(3);
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [isHomeConnecting, setIsHomeConnecting] = useState(false);
  const isMobileIntro = isMobile && mobileFlow === "home";
  const shouldShowNameInput = !isMobile || mobileFlow !== "home";
  const showCompactMobileHero = isMobile && mobileFlow !== "home";
  const hasPendingAction =
    createLobby.isPending || joinLobby.isPending || createAiMatch.isPending;
  const { status: backendHealthStatus } = useBackendHealth({
    websocketStatus:
      hasPendingAction || isHomeConnecting ? "connecting" : "disconnected",
    enabled: hasPendingAction || isHomeConnecting,
  });

  useEffect(() => {
    if (!isHomeConnecting || hasPendingAction) {
      return;
    }

    if (backendHealthStatus === "online") {
      setIsHomeConnecting(false);
    }
  }, [backendHealthStatus, hasPendingAction, isHomeConnecting]);

  useEffect(() => {
    setMobileFlow(isMobile ? "home" : "mode");
  }, [isMobile]);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setCreateError("");
    try {
      const res = await createLobby.mutateAsync({
        name: lobbyName.trim() || `${playerName.trim()}'s lobby`,
        playerName: playerName.trim(),
        maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
      });
      if (res.playerId && res.sessionToken) {
        const isHost =
          res.lobby.players.find((player) => player.id === res.playerId)
            ?.isHost ?? true;
        lobbySessionStore.save(
          res.lobby.id,
          res.playerId,
          res.sessionToken,
          playerName.trim(),
          isHost,
        );
      }
      router.push(`/lobby/${res.lobby.id}?playerId=${res.playerId}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        setCreateError("");
        setIsHomeConnecting(true);
      } else {
        setCreateError("Unable to create a room right now.");
      }
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setJoinError("");
    try {
      const normalizedRoomCode = roomCode.trim();
      const storedSession = lobbySessionStore.read(normalizedRoomCode);
      let sessionToken: string | null = null;

      if (storedSession?.sessionToken) {
        const shouldReuseSeat = window.confirm(
          "A saved seat was found for this room. Press OK to rejoin that seat, or Cancel to join as a new player.",
        );

        if (shouldReuseSeat) {
          sessionToken = storedSession.sessionToken;
        } else {
          lobbySessionStore.clear(normalizedRoomCode);
        }
      }

      const res = await joinLobby.mutateAsync({
        lobbyId: normalizedRoomCode,
        data: {
          playerName: playerName.trim(),
          sessionToken,
        },
      });
      if (res.playerId && res.sessionToken) {
        const isHost =
          res.lobby.players.find((player) => player.id === res.playerId)
            ?.isHost ?? false;
        lobbySessionStore.save(
          res.lobby.id,
          res.playerId,
          res.sessionToken,
          playerName.trim(),
          isHost,
        );
      }
      router.push(`/lobby/${res.lobby.id}?playerId=${res.playerId}`);
    } catch {
      setJoinError("Room not found or is full.");
    }
  };

  const handleStartAi = async (config: GameConfig) => {
    if (!playerName.trim()) return;
    setAiError("");
    try {
      const res = await createAiMatch.mutateAsync({
        playerName: playerName.trim(),
        botCount,
        difficulty,
        config,
      });
      const params = new URLSearchParams({
        playerId: res.playerId,
        ai: "1",
        playerName: playerName.trim(),
        botCount: String(botCount),
        difficulty,
        turnTimerSeconds: String(config.turnTimerSeconds),
        challengeWindowSeconds: String(config.challengeWindowSeconds),
        blockWindowSeconds: String(config.blockWindowSeconds),
        startingCoins: String(config.startingCoins),
      });
      router.push(`/game/${res.gameId}?${params.toString()}`);
    } catch {
      setAiError("Unable to start an AI table right now.");
    }
  };

  const modeCards = (
    <div
      style={{
        ...s.modeGrid,
        gridTemplateColumns: isMobile ? "1fr" : s.modeGrid.gridTemplateColumns,
      }}
    >
      {modeOptions.map((mode) => {
        const active = !isMobile && playMode === mode.key;
        return (
          <button
            key={mode.key}
            style={{ ...s.modeCard, ...(active ? s.modeCardActive : {}) }}
            onClick={() => {
              setPlayMode(mode.key);
              if (isMobile) {
                setMobileFlow(mode.key === "friends" ? "friends" : "ai");
              }
            }}
          >
            <span style={s.modeCardTitle}>{mode.title}</span>
            <span style={s.modeCardText}>{mode.text}</span>
          </button>
        );
      })}
    </div>
  );

  const friendsCards = (
    <>
      <motion.div
        style={s.card}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={s.cardTitle}>Create Room</div>
        <input
          style={s.input}
          placeholder="Room name (optional)"
          value={lobbyName}
          onChange={(event) => {
            setLobbyName(event.target.value);
            setCreateError("");
          }}
          maxLength={30}
        />
        {createError && <div style={s.error}>{createError}</div>}
        <motion.button
          style={{
            ...s.createBtn,
            opacity: !playerName.trim() ? 0.5 : 1,
            cursor: !playerName.trim() ? "not-allowed" : "pointer",
          }}
          variants={scalePopVariants}
          whileHover={playerName.trim() ? interactiveHoverMotion : undefined}
          whileTap={playerName.trim() ? interactiveTapMotion : undefined}
          onClick={handleCreate}
          disabled={createLobby.isPending || !playerName.trim()}
        >
          {createLobby.isPending ? "Creating..." : "Create Room"}
        </motion.button>
      </motion.div>

      <div style={s.divider}>
        <div style={s.dividerLine} />
        <div style={s.dividerText}>or</div>
        <div style={s.dividerLine} />
      </div>

      <motion.div
        style={s.card}
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={s.cardTitle}>Join Room</div>
        <input
          style={s.input}
          placeholder="Room code"
          value={roomCode}
          onChange={(event) => {
            setRoomCode(event.target.value);
            setJoinError("");
          }}
          maxLength={8}
        />
        {joinError && <div style={s.error}>{joinError}</div>}
        <motion.button
          style={{
            ...s.joinBtn,
            opacity: !playerName.trim() || !roomCode.trim() ? 0.5 : 1,
            cursor:
              !playerName.trim() || !roomCode.trim()
                ? "not-allowed"
                : "pointer",
          }}
          variants={scalePopVariants}
          whileHover={
            playerName.trim() && roomCode.trim()
              ? interactiveHoverMotion
              : undefined
          }
          whileTap={
            playerName.trim() && roomCode.trim()
              ? interactiveTapMotion
              : undefined
          }
          onClick={handleJoin}
          disabled={
            joinLobby.isPending || !playerName.trim() || !roomCode.trim()
          }
        >
          {joinLobby.isPending ? "Joining..." : "Join Room"}
        </motion.button>
      </motion.div>
    </>
  );

  const aiContent = (
    <>
      <div style={s.cardTitle}>AI Table</div>
      <div style={s.helperText}>
        Start a match instantly. Bots use lightweight bluff-and-response logic,
        not perfect information.
      </div>

      <div style={s.optionSection}>
        <div style={s.optionLabel}>Bot count</div>
        <div style={s.optionGridWide}>
          {[1, 2, 3, 4, 5].map((count) => (
            <button
              key={count}
              style={{
                ...s.optionButton,
                ...(botCount === count ? s.optionButtonActive : {}),
              }}
              onClick={() => setBotCount(count)}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div style={s.optionSection}>
        <div style={s.optionLabel}>Difficulty</div>
        <div style={s.optionGridFour}>
          {(["easy", "medium", "hard", "lethal"] as AiDifficulty[]).map(
            (level) => (
              <button
                key={level}
                style={{
                  ...s.optionButton,
                  ...s.optionButtonCompact,
                  ...(difficulty === level ? s.optionButtonActive : {}),
                }}
                onClick={() => setDifficulty(level)}
              >
                {level}
              </button>
            ),
          )}
        </div>
        <div style={s.helperText}>{difficultyNotes[difficulty]}</div>
      </div>

      {aiError && <div style={s.error}>{aiError}</div>}

      <motion.button
        style={{
          ...s.createBtn,
          opacity: !playerName.trim() ? 0.5 : 1,
          cursor: !playerName.trim() ? "not-allowed" : "pointer",
        }}
        variants={scalePopVariants}
        whileHover={playerName.trim() ? interactiveHoverMotion : undefined}
        whileTap={playerName.trim() ? interactiveTapMotion : undefined}
        onClick={() => setShowAiConfig(true)}
        disabled={createAiMatch.isPending || !playerName.trim()}
      >
        {createAiMatch.isPending
          ? "Starting..."
          : `Play vs ${botCount} AI${botCount > 1 ? " Bots" : " Bot"}`}
      </motion.button>
    </>
  );

  const playerNameInput = (
    <input
      style={s.input}
      placeholder="Your name"
      value={playerName}
      onChange={(event) => setPlayerName(event.target.value)}
      maxLength={20}
    />
  );

  return (
    <>
      <ConnectionOverlay
        isVisible={hasPendingAction || isHomeConnecting}
        state="connecting"
        title="Connecting to server"
        detail=""
      />
      <motion.div
        style={s.page}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
            opacity: 0.88,
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: "64vw",
              minWidth: 360,
              maxWidth: 940,
              height: "100%",
              transform: "translateX(12%)",
              maskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.86) 30%, rgba(0,0,0,1) 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.86) 30%, rgba(0,0,0,1) 100%)",
            }}
          >
            <CoupBackgroundSVG />
          </div>
        </div>

        <div style={s.stage}>
          <motion.section
            style={{
              ...s.heroCard,
              minHeight: showCompactMobileHero ? "auto" : isMobile ? 300 : 500,
              padding: showCompactMobileHero ? "18px 20px" : s.heroCard.padding,
              justifyContent: showCompactMobileHero
                ? "center"
                : s.heroCard.justifyContent,
            }}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={s.heroGlow} />
            {showCompactMobileHero ? (
              <div style={{ ...s.title, marginBottom: 0, textAlign: "center" }}>
                COUP
              </div>
            ) : (
              <>
                <div>
                  <div style={s.heroEyebrow}>Realtime multiplayer bluffing</div>
                  <div style={{ marginBottom: isMobile ? 12 : 14 }}>
                    <CoupLogo compact={isMobile} />
                  </div>
                  <div style={s.title}>COUP</div>
                  <div style={s.subtitle}>
                    Run the table with clean reads, false confidence, and timed
                    pressure. Every action is public. Every bluff can be
                    challenged. The last player with influence wins.
                  </div>
                </div>

                <div
                  style={{
                    ...s.featureGrid,
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : s.featureGrid.gridTemplateColumns,
                  }}
                >
                  <div style={s.featureCard}>
                    <div style={s.featureTitle}>Play Your Way</div>
                    <div style={s.featureText}>
                      Jump into a private room with friends or start a solo
                      table instantly against bots.
                    </div>
                  </div>
                  {!isMobile && (
                    <div style={s.featureCard}>
                      <div style={s.featureTitle}>Human-Like Bots</div>
                      <div style={s.featureText}>
                        Bots bluff, pass, and challenge with difficulty-based
                        mistakes instead of perfect play.
                      </div>
                    </div>
                  )}
                  {!isMobile && (
                    <div style={s.featureCard}>
                      <div style={s.featureTitle}>Same Live Board</div>
                      <div style={s.featureText}>
                        AI matches use the same real-time game board, turn
                        windows, and reveal flow as multiplayer games.
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.section>

          <motion.section
            style={s.actionColumn}
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
          >
            <div style={s.actionShell}>
              <div style={s.actionHeader}>
                <div style={s.actionTitle}>
                  {isMobileIntro ? "Quick start" : "Choose your table"}
                </div>
                <div style={s.actionSubtitle}>
                  {isMobileIntro
                    ? "Start clean on mobile, then choose friends or AI on the next screen."
                    : "Set your name once, then pick friends or AI and jump into the matching flow."}
                </div>
              </div>

              {shouldShowNameInput && playerNameInput}

              {isMobile && mobileFlow === "home" && (
                <button
                  style={s.mobilePlayButton}
                  onClick={() => setMobileFlow("mode")}
                >
                  Play
                </button>
              )}

              {!isMobile && (
                <>
                  {modeCards}
                  {playMode === "friends" ? (
                    friendsCards
                  ) : (
                    <motion.div
                      style={s.card}
                      variants={slideUpVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {aiContent}
                    </motion.div>
                  )}
                </>
              )}

              {isMobile && mobileFlow === "mode" && <>{modeCards}</>}

              {isMobile && mobileFlow === "friends" && (
                <motion.div
                  style={s.card}
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    style={s.mobileBackButton}
                    onClick={() => setMobileFlow("mode")}
                  >
                    Back
                  </button>
                  <div style={s.cardTitle}>Play With Friends</div>
                  <div style={s.helperText}>
                    Keep the existing room flow: create a private lobby or join
                    one by code.
                  </div>
                  <div
                    style={{ ...s.modeGrid, gridTemplateColumns: "1fr 1fr" }}
                  >
                    <button
                      style={s.modeCard}
                      onClick={() => setMobileFlow("create")}
                    >
                      Create Room
                    </button>
                    <button
                      style={s.modeCard}
                      onClick={() => setMobileFlow("join")}
                    >
                      Join Room
                    </button>
                  </div>
                </motion.div>
              )}

              {isMobile && mobileFlow === "create" && (
                <motion.div
                  style={s.card}
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    style={s.mobileBackButton}
                    onClick={() => setMobileFlow("friends")}
                  >
                    Back
                  </button>
                  <div style={s.cardTitle}>Create Room</div>
                  <input
                    style={s.input}
                    placeholder="Room name (optional)"
                    value={lobbyName}
                    onChange={(event) => {
                      setLobbyName(event.target.value);
                      setCreateError("");
                    }}
                    maxLength={30}
                  />
                  {createError && <div style={s.error}>{createError}</div>}
                  <motion.button
                    style={{
                      ...s.createBtn,
                      opacity: !playerName.trim() ? 0.5 : 1,
                      cursor: !playerName.trim() ? "not-allowed" : "pointer",
                    }}
                    variants={scalePopVariants}
                    whileHover={
                      playerName.trim() ? interactiveHoverMotion : undefined
                    }
                    whileTap={
                      playerName.trim() ? interactiveTapMotion : undefined
                    }
                    onClick={handleCreate}
                    disabled={createLobby.isPending || !playerName.trim()}
                  >
                    {createLobby.isPending ? "Creating..." : "Create Room"}
                  </motion.button>
                </motion.div>
              )}

              {isMobile && mobileFlow === "join" && (
                <motion.div
                  style={s.card}
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    style={s.mobileBackButton}
                    onClick={() => setMobileFlow("friends")}
                  >
                    Back
                  </button>
                  <div style={s.cardTitle}>Join Room</div>
                  <input
                    style={s.input}
                    placeholder="Room code"
                    value={roomCode}
                    onChange={(event) => {
                      setRoomCode(event.target.value);
                      setJoinError("");
                    }}
                    maxLength={8}
                  />
                  {joinError && <div style={s.error}>{joinError}</div>}
                  <motion.button
                    style={{
                      ...s.joinBtn,
                      opacity: !playerName.trim() || !roomCode.trim() ? 0.5 : 1,
                      cursor:
                        !playerName.trim() || !roomCode.trim()
                          ? "not-allowed"
                          : "pointer",
                    }}
                    variants={scalePopVariants}
                    whileHover={
                      playerName.trim() && roomCode.trim()
                        ? interactiveHoverMotion
                        : undefined
                    }
                    whileTap={
                      playerName.trim() && roomCode.trim()
                        ? interactiveTapMotion
                        : undefined
                    }
                    onClick={handleJoin}
                    disabled={
                      joinLobby.isPending ||
                      !playerName.trim() ||
                      !roomCode.trim()
                    }
                  >
                    {joinLobby.isPending ? "Joining..." : "Join Room"}
                  </motion.button>
                </motion.div>
              )}

              {isMobile && mobileFlow === "ai" && (
                <motion.div
                  style={s.card}
                  variants={slideUpVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    style={s.mobileBackButton}
                    onClick={() => setMobileFlow("mode")}
                  >
                    Back
                  </button>
                  {aiContent}
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>

        <PreGameConfig
          isOpen={showAiConfig}
          playerCount={botCount + 1}
          showBotFillControls={false}
          onCancel={() => setShowAiConfig(false)}
          onConfirm={async (config) => {
            setShowAiConfig(false);
            await handleStartAi(config);
          }}
        />
      </motion.div>
    </>
  );
}
