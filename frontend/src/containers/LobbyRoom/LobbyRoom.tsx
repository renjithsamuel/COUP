'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants, slideUpVariants } from '@/animations';
import { Lobby } from '@/models/lobby';
import { GAME_CONSTANTS } from '@/utils/constants';
import { lobbyRoomStyles as s } from './LobbyRoom.styles';
import { tokens } from '@/theme/tokens';

export interface LobbyRoomProps {
  lobby: Lobby;
  myPlayerId: string;
  isHost: boolean;
  onStart: () => void;
  onLeave?: () => void;
}

export function LobbyRoom({ lobby, myPlayerId, isHost, onStart, onLeave }: LobbyRoomProps) {
  const canStart =
    isHost && lobby.players.length >= GAME_CONSTANTS.MIN_PLAYERS && lobby.status === 'waiting';
  const [copied, setCopied] = useState(false);

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
            <div style={s.statLabel}>Host Control</div>
            <div style={s.statValue}>{isHost ? 'Ready' : 'Stand by'}</div>
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

        {onLeave && (
          <button
            onClick={onLeave}
            style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              borderRadius: 12,
              border: '1px solid rgba(239,83,80,0.3)',
              background: 'rgba(239,83,80,0.08)',
              color: '#ef5350',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            Leave Room
          </button>
        )}
      </div>
      </div>
    </motion.div>
  );
}
