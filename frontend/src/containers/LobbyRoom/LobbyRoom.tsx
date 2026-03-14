"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { fadeInVariants, slideUpVariants } from "@/animations";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LeaderboardEntry, Lobby } from "@/models/lobby";
import { GAME_CONSTANTS } from "@/utils/constants";
import { lobbyRoomStyles as s } from "./LobbyRoom.styles";
import { tokens } from "@/theme/tokens";

type ConfirmState =
  | { type: "leave" }
  | { type: "kick"; playerId: string; playerName: string }
  | null;

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
    aria-hidden="true"
  >
    <rect x="4" y="14" width="4" height="8" rx="1" />
    <rect x="10" y="6" width="4" height="16" rx="1" />
    <rect x="16" y="10" width="4" height="12" rx="1" />
  </svg>
);

const LeaveIcon = () => (
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

const KickIcon = () => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

export interface LobbyRoomProps {
  lobby: Lobby;
  myPlayerId: string;
  isHost: boolean;
  leaderboard: LeaderboardEntry[];
  onStart: () => void;
  onKick?: (playerId: string) => Promise<void> | void;
  onLeave?: () => void;
}

export function LobbyRoom({
  lobby,
  myPlayerId,
  isHost,
  leaderboard,
  onStart,
  onKick,
  onLeave,
}: LobbyRoomProps) {
  const isMobile = useIsMobile();
  const canStart =
    isHost &&
    lobby.players.length >= GAME_CONSTANTS.MIN_PLAYERS &&
    lobby.status === "waiting";
  const [copied, setCopied] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const hostName = lobby.players.find((player) => player.isHost)?.name ?? "TBD";
  const duplicateNameCounts = leaderboard.reduce<Record<string, number>>(
    (counts, entry) => {
      counts[entry.playerName] = (counts[entry.playerName] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const leaderboardRows = leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    participationCount: Math.max(entry.gamesPlayed - entry.wins, 0),
    displayName:
      (duplicateNameCounts[entry.playerName] ?? 0) > 1
        ? `${entry.playerName} #${entry.playerKey.slice(-4).toUpperCase()}`
        : entry.playerName,
  }));

  useEffect(() => {
    if (!showLeaderboard) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowLeaderboard(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLeaderboard]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(lobby.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeKick = async (targetPlayerId: string) => {
    if (!onKick || targetPlayerId === myPlayerId || kickingPlayerId) {
      return;
    }

    try {
      setKickingPlayerId(targetPlayerId);
      await onKick(targetPlayerId);
    } finally {
      setKickingPlayerId(null);
    }
  };

  const confirmationModal =
    confirmState && typeof document !== "undefined"
      ? createPortal(
          <div
            style={s.modalOverlay}
            onClick={() => !isConfirming && setConfirmState(null)}
          >
            <motion.div
              style={s.confirmCard}
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              onClick={(event) => event.stopPropagation()}
            >
              <div style={s.confirmCopy}>
                <span style={s.sectionEyebrow}>
                  {confirmState.type === "leave"
                    ? "Leave room"
                    : "Remove player"}
                </span>
                <span style={s.sectionTitle}>
                  {confirmState.type === "leave"
                    ? "Leave this lobby?"
                    : `Kick ${confirmState.playerName}?`}
                </span>
                <span style={s.modalSubtitle}>
                  {confirmState.type === "leave"
                    ? "You will return to the home screen and can rejoin later with the same saved profile identity."
                    : "They will be removed from the waiting room immediately. If they were host, host ownership will move to the next remaining player."}
                </span>
              </div>
              <div style={s.confirmActions}>
                <button
                  type="button"
                  style={s.secondaryButton}
                  onClick={() => setConfirmState(null)}
                  disabled={isConfirming}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={s.confirmDangerButton}
                  disabled={isConfirming}
                  onClick={async () => {
                    try {
                      setIsConfirming(true);
                      if (confirmState.type === "leave") {
                        await onLeave?.();
                      } else {
                        await executeKick(confirmState.playerId);
                      }
                      setConfirmState(null);
                    } finally {
                      setIsConfirming(false);
                    }
                  }}
                >
                  {isConfirming
                    ? "Working..."
                    : confirmState.type === "leave"
                      ? "Leave room"
                      : "Kick player"}
                </button>
              </div>
            </motion.div>
          </div>,
          document.body,
        )
      : null;

  const leaderboardModal =
    showLeaderboard && typeof document !== "undefined"
      ? createPortal(
          <div style={s.modalOverlay} onClick={() => setShowLeaderboard(false)}>
            <motion.div
              style={s.modalCard}
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              onClick={(event) => event.stopPropagation()}
            >
              <div style={s.modalHeader}>
                <div style={s.modalHeaderCopy}>
                  <span style={s.sectionEyebrow}>Room leaderboard</span>
                  <span style={s.sectionTitle}>Cross-game scores</span>
                  <div style={s.modalRoomMeta}>
                    <span style={s.modalRoomName}>
                      {lobby.name || "Untitled room"}
                    </span>
                    <span style={s.modalRoomCode}>{lobby.id}</span>
                  </div>
                  <span style={s.modalSubtitle}>
                    Only players who have played in this room appear here.
                    Scores expire with the room history after the configured
                    grace period.
                  </span>
                </div>
                <button
                  style={s.closeButton}
                  onClick={() => setShowLeaderboard(false)}
                >
                  Close
                </button>
              </div>

              {leaderboardRows.length > 0 ? (
                <div style={s.leaderboardList}>
                  {leaderboardRows.map((entry) => (
                    <div
                      key={`${entry.playerKey}-${entry.rank}`}
                      style={s.leaderboardRow}
                    >
                      <div style={s.leaderboardMeta}>
                        <span style={s.rankBadge}>{entry.rank}</span>
                        <div style={s.leaderboardCopy}>
                          <span style={s.leaderboardName}>
                            {entry.displayName}
                          </span>
                          <span style={s.leaderboardSubline}>
                            {entry.wins} wins + {entry.participationCount}{" "}
                            participation · {entry.gamesPlayed} games ·{" "}
                            {(entry.winRate * 100).toFixed(0)}% win rate
                          </span>
                        </div>
                      </div>
                      <span style={s.scoreBadge}>{entry.score} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.emptyLeaderboard}>
                  No completed games for this room yet. Finish the first round
                  and these room-only scores will appear here.
                </div>
              )}
            </motion.div>
          </div>,
          document.body,
        )
      : null;

  return (
    <motion.div
      style={s.wrapper}
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={s.content}>
        <div style={s.hero}>
          <div style={s.heroCard}>
            <div style={s.eyebrow}>Lobby room</div>
            <div style={s.title}>{lobby.name || `Lobby ${lobby.id}`}</div>
            <div style={s.subtitle}>
              Gather the table, share the code, and start when the room is
              ready.
            </div>
            <div style={s.roomCodeRow}>
              <div style={s.roomCodeLabel}>Room Code</div>
              <div style={s.roomCodeValue}>{lobby.id}</div>
              <button
                onClick={handleCopyCode}
                style={{
                  ...s.copyButton,
                  color: copied ? "#81C784" : tokens.text.secondary,
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statLabel}>Players</div>
              <div style={s.statValue}>
                {lobby.players.length} / {lobby.maxPlayers}
              </div>
            </div>
            <div style={s.statCard}>
              <div style={s.statLabel}>Status</div>
              <div style={s.statValue}>
                {lobby.status === "waiting" ? "Waiting" : "Starting"}
              </div>
            </div>
            {!isMobile && (
              <div style={s.statCard}>
                <div style={s.statLabel}>Host</div>
                <div style={s.statValue}>{hostName}</div>
              </div>
            )}
          </div>
        </div>

        <div style={s.playerList}>
          {lobby.players.map((player, i) => (
            <motion.div
              key={player.id}
              style={s.playerRow}
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div style={s.playerMeta}>
                <span style={s.playerName}>{player.name}</span>
                <span style={s.playerCaption}>
                  {player.id === myPlayerId ? "You" : "Player seat"}
                </span>
              </div>
              <div style={s.playerActions}>
                {player.isHost && <span style={s.hostBadge}>Host</span>}
                {player.id !== myPlayerId &&
                  onKick &&
                  lobby.status === "waiting" && (
                    <button
                      type="button"
                      style={s.kickButton}
                      onClick={() =>
                        setConfirmState({
                          type: "kick",
                          playerId: player.id,
                          playerName: player.name,
                        })
                      }
                      disabled={kickingPlayerId != null || isConfirming}
                    >
                      <span style={s.buttonIcon}>
                        <KickIcon />
                      </span>
                      <span>
                        {kickingPlayerId === player.id ? "Removing..." : "Kick"}
                      </span>
                    </button>
                  )}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={s.footer}>
          <div style={s.footerActions}>
            <button
              style={s.secondaryButton}
              onClick={() => setShowLeaderboard(true)}
            >
              <span style={s.buttonIcon}>
                <LeaderboardIcon />
              </span>
              <span>Leaderboard</span>
            </button>

            {onLeave && (
              <button
                onClick={() => setConfirmState({ type: "leave" })}
                style={{
                  ...s.secondaryButton,
                  border: "1px solid rgba(239,83,80,0.3)",
                  background: "rgba(239,83,80,0.08)",
                  color: "#ef5350",
                }}
              >
                <span style={s.buttonIcon}>
                  <LeaveIcon />
                </span>
                <span>Leave Room</span>
              </button>
            )}
          </div>

          {canStart ? (
            <button style={s.startButton} onClick={onStart}>
              Start Game
            </button>
          ) : (
            <div style={s.waitingText}>
              {lobby.status !== "waiting"
                ? "Game starting..."
                : isHost
                  ? `Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`
                  : "Waiting for host to start..."}
            </div>
          )}
        </div>
      </div>
      {leaderboardModal}
      {confirmationModal}
    </motion.div>
  );
}
