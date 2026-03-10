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
      <div style={s.title}>{lobby.name || `Lobby ${lobby.id}`}</div>

      {/* Room code */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.spacing.sm,
      }}>
        <div style={{
          fontSize: 11,
          color: tokens.text.muted,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
        }}>Room Code</div>
        <div style={{
          fontSize: 20,
          fontWeight: 900,
          color: tokens.text.accent,
          letterSpacing: 3,
          fontFamily: 'monospace',
        }}>{lobby.id}</div>
        <button
          onClick={handleCopyCode}
          style={{
            background: 'transparent',
            border: `1px solid ${tokens.surface.border}`,
            borderRadius: 6,
            color: copied ? '#81C784' : tokens.text.secondary,
            fontSize: 11,
            padding: '3px 10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div style={{ textAlign: 'center', color: '#8B95A8', fontSize: 12, letterSpacing: 0.5 }}>
        {lobby.players.length} / {lobby.maxPlayers} players
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
            <span>
              {player.name}
              {player.id === myPlayerId && ' (you)'}
            </span>
            {player.isHost && <span style={s.hostBadge}>Host</span>}
          </motion.div>
        ))}
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

      {onLeave && (
        <button
          onClick={onLeave}
          style={{
            padding: `${tokens.spacing.sm}px`,
            borderRadius: 10,
            border: '1px solid rgba(239,83,80,0.3)',
            background: 'rgba(239,83,80,0.08)',
            color: '#ef5350',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          Leave Room
        </button>
      )}
      </div>
    </motion.div>
  );
}
