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

const EditIcon = () => (
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
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export interface LobbyRoomProps {
  lobby: Lobby;
  myPlayerId: string;
  isHost: boolean;
  leaderboard: LeaderboardEntry[];
  onStart: () => void;
  onEditConfig?: () => void;
  onKick?: (playerId: string) => Promise<void> | void;
  onLeave?: () => void;
}

export function LobbyRoom({
  lobby,
  myPlayerId,
  isHost,
  leaderboard,
  onStart,
  onEditConfig,
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
      style={
        isMobile
          ? {
              ...s.wrapper,
              width: "100%",
              maxWidth: 560,
              padding: "16px 14px 18px",
              borderRadius: 24,
            }
          : s.wrapper
      }
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
    >
      <div style={isMobile ? { ...s.content, gap: 14 } : s.content}>
        <div style={isMobile ? { ...s.hero, gap: 10 } : s.hero}>
          <div
            style={
              isMobile
                ? { ...s.heroCard, padding: "14px 14px 12px", gap: 6, borderRadius: 18 }
                : s.heroCard
            }
          >
            <div style={s.eyebrow}>Lobby room</div>
            <div style={isMobile ? { ...s.title, fontSize: 22, lineHeight: 1.1 } : s.title}>
              {lobby.name || `Lobby ${lobby.id}`}
            </div>
            <div style={isMobile ? { ...s.subtitle, fontSize: 12 } : s.subtitle}>
              Gather the table, share the code, and start when the room is
              ready.
            </div>
            <div
              style={
                isMobile
                  ? {
                      ...s.roomCodeRow,
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }
                  : s.roomCodeRow
              }
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={s.roomCodeLabel}>Room Code</div>
                <div
                  style={
                    isMobile
                      ? { ...s.roomCodeValue, fontSize: 18, letterSpacing: 3 }
                      : s.roomCodeValue
                  }
                >
                  {lobby.id}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                style={{
                  ...s.copyButton,
                  ...(isMobile ? { padding: "7px 12px", fontSize: 10 } : {}),
                  color: copied ? "#81C784" : tokens.text.secondary,
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div
            style={
              isMobile
                ? { ...s.statsRow, gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }
                : s.statsRow
            }
          >
            <div style={isMobile ? { ...s.statCard, padding: "12px 12px", borderRadius: 16 } : s.statCard}>
              <div style={s.statLabel}>Players</div>
              <div style={isMobile ? { ...s.statValue, fontSize: 16 } : s.statValue}>
                {lobby.players.length} / {lobby.maxPlayers}
              </div>
            </div>
            <div style={isMobile ? { ...s.statCard, padding: "12px 12px", borderRadius: 16 } : s.statCard}>
              <div style={s.statLabel}>Status</div>
              <div style={isMobile ? { ...s.statValue, fontSize: 16 } : s.statValue}>
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

        <div style={isMobile ? { ...s.playerList, gap: 10 } : s.playerList}>
          {lobby.players.map((player, i) => (
            <motion.div
              key={player.id}
              style={
                isMobile
                  ? {
                      ...s.playerRow,
                      padding: "12px 12px",
                      borderRadius: 16,
                      gap: 10,
                    }
                  : s.playerRow
              }
              variants={slideUpVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div style={s.playerMeta}>
                <span style={isMobile ? { ...s.playerName, fontSize: 13 } : s.playerName}>{player.name}</span>
                <span style={isMobile ? { ...s.playerCaption, fontSize: 10 } : s.playerCaption}>
                  {player.id === myPlayerId ? "You" : "Player seat"}
                </span>
              </div>
              <div
                style={
                  isMobile
                    ? {
                        ...s.playerActions,
                        width: "100%",
                        justifyContent: "space-between",
                        marginLeft: 0,
                      }
                    : s.playerActions
                }
              >
                {player.isHost && <span style={s.hostBadge}>Host</span>}
                {player.id !== myPlayerId &&
                  onKick &&
                  lobby.status === "waiting" && (
                    <button
                      type="button"
                      style={isMobile ? { ...s.kickButton, minWidth: 80, padding: "7px 10px" } : s.kickButton}
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

        <div
          style={
            isMobile
              ? {
                  ...s.footer,
                  flexDirection: "column",
                  alignItems: "stretch",
                }
              : s.footer
          }
        >
          <div
            style={
              isMobile
                ? {
                    ...s.footerActions,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 8,
                    width: "100%",
                  }
                : s.footerActions
            }
          >
            <button
              style={
                isMobile
                  ? { ...s.secondaryButton, width: "100%", minHeight: 42, fontSize: 11 }
                  : s.secondaryButton
              }
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
                  ...(isMobile ? { width: "100%", minHeight: 42, fontSize: 11 } : {}),
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

            {isHost && onEditConfig && lobby.status === "waiting" && (
              <button
                type="button"
                onClick={onEditConfig}
                style={
                  isMobile
                    ? { ...s.secondaryButton, width: "100%", minHeight: 42, fontSize: 11 }
                    : s.secondaryButton
                }
              >
                <span style={s.buttonIcon}>
                  <EditIcon />
                </span>
                <span>Edit Config</span>
              </button>
            )}
          </div>

          {canStart ? (
            <button
              style={
                isMobile
                  ? { ...s.startButton, width: "100%", minHeight: 50, fontSize: 14, padding: "12px 14px" }
                  : s.startButton
              }
              onClick={onStart}
            >
              Start Game
            </button>
          ) : (
            <div style={isMobile ? { ...s.waitingText, width: "100%" } : s.waitingText}>
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
