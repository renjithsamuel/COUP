'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, slideUpVariants } from '@/animations';
import { LeaderboardEntry, Lobby } from '@/models/lobby';
import { GAME_CONSTANTS } from '@/utils/constants';
import { lobbyRoomStyles as s } from './LobbyRoom.styles';
import { tokens } from '@/theme/tokens';

export interface LobbyRoomProps {
  lobby: Lobby;
  myPlayerId: string;
  isHost: boolean;
  leaderboard: LeaderboardEntry[];
  onStart: () => void;
  onLeave?: () => void;
}

export function LobbyRoom({ lobby, myPlayerId, isHost, leaderboard, onStart, onLeave }: LobbyRoomProps) {
  const canStart =
    isHost && lobby.players.length >= GAME_CONSTANTS.MIN_PLAYERS && lobby.status === 'waiting';
  const [copied, setCopied] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const hostName = lobby.players.find((player) => player.isHost)?.name ?? 'TBD';
  const duplicateNameCounts = leaderboard.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.playerName] = (counts[entry.playerName] ?? 0) + 1;
    return counts;
  }, {});

  const leaderboardRows = leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
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
      if (event.key === 'Escape') {
        setShowLeaderboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLeaderboard]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(lobby.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div style={s.subtitle}>Gather the table, share the code, and start when the room is ready.</div>
          <div style={s.roomCodeRow}>
            <div style={s.roomCodeLabel}>Room Code</div>
            <div style={s.roomCodeValue}>{lobby.id}</div>
            <button
              onClick={handleCopyCode}
              style={{
                ...s.copyButton,
                color: copied ? '#81C784' : tokens.text.secondary,
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Players</div>
            <div style={s.statValue}>{lobby.players.length} / {lobby.maxPlayers}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Status</div>
            <div style={s.statValue}>{lobby.status === 'waiting' ? 'Waiting' : 'Starting'}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Host</div>
            <div style={s.statValue}>{hostName}</div>
          </div>
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
              <span style={s.playerCaption}>{player.id === myPlayerId ? 'You' : 'Player seat'}</span>
            </div>
            {player.isHost && <span style={s.hostBadge}>Host</span>}
          </motion.div>
        ))}
      </div>

      <div style={s.footer}>
        <div style={s.footerActions}>
          <button style={s.secondaryButton} onClick={() => setShowLeaderboard(true)}>
            Leaderboard
          </button>

          {onLeave && (
            <button
              onClick={onLeave}
              style={{
                ...s.secondaryButton,
                border: '1px solid rgba(239,83,80,0.3)',
                background: 'rgba(239,83,80,0.08)',
                color: '#ef5350',
              }}
            >
              Leave Room
            </button>
          )}
        </div>

        {canStart ? (
          <button style={s.startButton} onClick={onStart}>
            Start Game
          </button>
        ) : (
          <div style={s.waitingText}>
            {lobby.status !== 'waiting'
              ? 'Game starting...'
              : isHost
                ? `Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`
                : 'Waiting for host to start...'}
          </div>
        )}
      </div>

      {showLeaderboard && (
        <div style={s.modalOverlay} onClick={() => setShowLeaderboard(false)}>
          <motion.div
            style={s.modalCard}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            onClick={(event) => event.stopPropagation()}
          >
            <div style={s.modalHeader}>
              <div style={s.sectionHeader}>
                <span style={s.sectionEyebrow}>Leaderboard</span>
                <span style={s.sectionTitle}>Cross-game scores</span>
              </div>
              <button style={s.closeButton} onClick={() => setShowLeaderboard(false)}>
                Close
              </button>
            </div>

            {leaderboardRows.length > 0 ? (
              <div style={s.leaderboardList}>
                {leaderboardRows.map((entry) => (
                  <div key={`${entry.playerName}-${entry.rank}`} style={s.leaderboardRow}>
                    <div style={s.leaderboardMeta}>
                      <span style={s.rankBadge}>{entry.rank}</span>
                      <div style={s.leaderboardCopy}>
                        <span style={s.leaderboardName}>{entry.displayName}</span>
                        <span style={s.leaderboardSubline}>
                          {entry.wins} wins · {entry.gamesPlayed} games · {(entry.winRate * 100).toFixed(0)}% win rate
                        </span>
                      </div>
                    </div>
                    <span style={s.scoreBadge}>{entry.score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={s.emptyLeaderboard}>
                No completed games yet. Finish the first round and player scores will appear here.
              </div>
            )}
          </motion.div>
        </div>
      )}
      </div>
    </motion.div>
  );
}
