'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCreateLobby, useJoinLobby } from '@/queries/useLobbyQueries';
import { fadeInVariants, slideUpVariants, scalePopVariants } from '@/animations';
import { tokens } from '@/theme/tokens';
import { GAME_CONSTANTS } from '@/utils/constants';

const s = {
  page: {
    minHeight: '100vh',
    background: tokens.board.bg,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: tokens.spacing.xxl,
  },
  title: {
    fontSize: 52,
    fontWeight: 900,
    color: tokens.text.primary,
    letterSpacing: 6,
    marginBottom: tokens.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: tokens.text.secondary,
    marginBottom: tokens.spacing.xxl,
    textAlign: 'center' as const,
    lineHeight: 1.6,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: tokens.spacing.xl,
    borderRadius: 18,
    background: tokens.surface.card,
    border: `1px solid ${tokens.surface.border}`,
    boxShadow: tokens.elevation.dp4,
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: tokens.text.primary,
    textAlign: 'center' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  input: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`,
    borderRadius: 10,
    border: `1px solid ${tokens.surface.borderLight}`,
    background: tokens.surface.elevated,
    color: tokens.text.primary,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  createBtn: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.xl}px`,
    borderRadius: 10,
    border: `1px solid rgba(255,193,7,0.3)`,
    background: `linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,143,0,0.08))`,
    color: tokens.text.accent,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    width: '100%',
  },
  joinBtn: {
    padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.xl}px`,
    borderRadius: 10,
    border: '1px solid rgba(76,175,80,0.3)',
    background: 'linear-gradient(135deg, rgba(46,125,50,0.2), rgba(76,175,80,0.15))',
    color: '#81C784',
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp2,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    width: '100%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: tokens.spacing.md,
    width: '100%',
    maxWidth: 420,
    marginBottom: tokens.spacing.lg,
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
    textTransform: 'uppercase' as const,
  },
  error: {
    color: '#ef5350',
    fontSize: 12,
    textAlign: 'center' as const,
  },
};

export default function HomePage() {
  const router = useRouter();
  const createLobby = useCreateLobby();
  const joinLobby = useJoinLobby();

  const [playerName, setPlayerName] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    const res = await createLobby.mutateAsync({
      name: lobbyName.trim() || `${playerName.trim()}'s lobby`,
      playerName: playerName.trim(),
      maxPlayers: GAME_CONSTANTS.MAX_PLAYERS,
    });
    router.push(`/lobby/${res.lobby.id}?playerId=${res.playerId}`);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setJoinError('');
    try {
      const res = await joinLobby.mutateAsync({
        lobbyId: roomCode.trim(),
        data: { playerName: playerName.trim() },
      });
      router.push(`/lobby/${res.lobby.id}?playerId=${res.playerId}`);
    } catch {
      setJoinError('Room not found or is full.');
    }
  };

  return (
    <motion.div style={s.page} variants={fadeInVariants} initial="hidden" animate="visible">
      <div style={s.title}>COUP</div>
      <div style={s.subtitle}>
        Bluff, deceive, and outmanoeuvre your opponents.
        <br />
        The last player standing wins.
      </div>

      {/* Shared name input */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: tokens.spacing.lg }}>
        <input
          style={s.input}
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
      </div>

      {/* Create Room */}
      <motion.div style={s.card} variants={slideUpVariants} initial="hidden" animate="visible">
        <div style={s.cardTitle}>Create Room</div>
        <input
          style={s.input}
          placeholder="Room name (optional)"
          value={lobbyName}
          onChange={(e) => setLobbyName(e.target.value)}
          maxLength={30}
        />
        <motion.button
          style={{
            ...s.createBtn,
            opacity: !playerName.trim() ? 0.5 : 1,
            cursor: !playerName.trim() ? 'not-allowed' : 'pointer',
          }}
          variants={scalePopVariants}
          whileHover={playerName.trim() ? { scale: 1.02 } : {}}
          whileTap={playerName.trim() ? { scale: 0.98 } : {}}
          onClick={handleCreate}
          disabled={createLobby.isPending || !playerName.trim()}
        >
          {createLobby.isPending ? 'Creating...' : 'Create Room'}
        </motion.button>
      </motion.div>

      {/* Divider */}
      <div style={s.divider}>
        <div style={s.dividerLine} />
        <div style={s.dividerText}>or</div>
        <div style={s.dividerLine} />
      </div>

      {/* Join Room */}
      <motion.div style={s.card} variants={slideUpVariants} initial="hidden" animate="visible">
        <div style={s.cardTitle}>Join Room</div>
        <input
          style={s.input}
          placeholder="Room code"
          value={roomCode}
          onChange={(e) => {
            setRoomCode(e.target.value);
            setJoinError('');
          }}
          maxLength={8}
        />
        {joinError && <div style={s.error}>{joinError}</div>}
        <motion.button
          style={{
            ...s.joinBtn,
            opacity: !playerName.trim() || !roomCode.trim() ? 0.5 : 1,
            cursor: !playerName.trim() || !roomCode.trim() ? 'not-allowed' : 'pointer',
          }}
          variants={scalePopVariants}
          whileHover={playerName.trim() && roomCode.trim() ? { scale: 1.02 } : {}}
          whileTap={playerName.trim() && roomCode.trim() ? { scale: 0.98 } : {}}
          onClick={handleJoin}
          disabled={joinLobby.isPending || !playerName.trim() || !roomCode.trim()}
        >
          {joinLobby.isPending ? 'Joining...' : 'Join Room'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
