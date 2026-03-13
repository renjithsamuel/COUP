'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCreateLobby, useJoinLobby } from '@/queries/useLobbyQueries';
import { fadeInVariants, slideUpVariants, scalePopVariants } from '@/animations';
import { CoupBackgroundSVG } from '@/components/CoupBackgroundSVG';
import { useIsMobile } from '@/hooks/useIsMobile';
import { tokens } from '@/theme/tokens';
import { GAME_CONSTANTS } from '@/utils/constants';

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
      <rect x="8" y="8" width="72" height="72" rx="24" fill="url(#logoBg)" stroke="rgba(255,255,255,0.12)" />
      <rect x="22" y="30" width="20" height="30" rx="6" transform="rotate(-8 22 30)" fill="#10213d" stroke="#36598b" />
      <rect x="46" y="30" width="20" height="30" rx="6" transform="rotate(8 46 30)" fill="#10213d" stroke="#36598b" />
      <path d="M44 16 51 26 62 23 58 35 67 42 55 44 51 56 44 47 37 56 33 44 21 42 30 35 26 23 37 26Z" fill="url(#logoGold)" stroke="#fff2be" />
      <path d="M36 60h16" stroke="#f6c445" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const s = {
  page: {
    minHeight: '100dvh',
    background: tokens.board.bg,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacing.md}px`,
    zIndex: 1,
  },
  stage: {
    width: '100%',
    maxWidth: 1180,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 'clamp(20px, 4vw, 40px)',
    alignItems: 'stretch',
    position: 'relative' as const,
    zIndex: 1,
  },
  heroCard: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 28,
    padding: 'clamp(24px, 5vw, 40px)',
    background: 'linear-gradient(155deg, rgba(10, 16, 30, 0.94) 0%, rgba(18, 28, 48, 0.9) 45%, rgba(11, 17, 32, 0.96) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: tokens.elevation.dp24,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: 540,
  },
  heroGlow: {
    position: 'absolute' as const,
    inset: 'auto -20% -20% auto',
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,193,7,0.18) 0%, rgba(255,193,7,0) 72%)',
    pointerEvents: 'none' as const,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.56)',
    marginBottom: 12,
    fontWeight: 800,
  },
  title: {
    fontSize: 'clamp(32px, 8vw, 52px)',
    fontWeight: 900,
    color: tokens.text.primary,
    letterSpacing: 'clamp(3px, 1vw, 6px)',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: tokens.text.secondary,
    marginBottom: 'clamp(18px, 4vw, 32px)',
    textAlign: 'left' as const,
    lineHeight: 1.6,
    maxWidth: 520,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
    marginTop: 'auto',
  },
  featureCard: {
    padding: '14px 14px 15px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
  },
  featureTitle: {
    color: tokens.text.primary,
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 6,
  },
  featureText: {
    color: tokens.text.secondary,
    fontSize: 12,
    lineHeight: 1.55,
  },
  actionColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  actionShell: {
    width: '100%',
    padding: 'clamp(18px, 4vw, 26px)',
    borderRadius: 24,
    background: 'linear-gradient(180deg, rgba(9, 15, 28, 0.96) 0%, rgba(14, 22, 40, 0.96) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: tokens.elevation.dp16,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  mobilePlayButton: {
    padding: '16px 20px',
    borderRadius: 18,
    border: '1px solid rgba(255, 193, 7, 0.26)',
    background: 'linear-gradient(135deg, rgba(255,193,7,0.16), rgba(255,143,0,0.12))',
    color: tokens.text.primary,
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    boxShadow: tokens.elevation.dp8,
  },
  mobileChoiceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  mobileChoiceButton: {
    padding: '14px 12px',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: tokens.text.primary,
    fontWeight: 800,
    fontSize: 13,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  },
  mobileBackButton: {
    alignSelf: 'flex-start',
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: tokens.text.secondary,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  },
  actionHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
  actionSubtitle: {
    fontSize: 14,
    color: tokens.text.secondary,
    lineHeight: 1.5,
  },
  card: {
    width: '100%',
    padding: 'clamp(16px, 4vw, 22px)',
    borderRadius: 20,
    background: 'linear-gradient(180deg, rgba(18, 27, 45, 0.92) 0%, rgba(11, 17, 32, 0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: tokens.elevation.dp8,
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
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
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
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
    margin: '2px 0',
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
    textAlign: 'left' as const,
  },
};

export default function HomePage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const createLobby = useCreateLobby();
  const joinLobby = useJoinLobby();

  const [playerName, setPlayerName] = useState('');
  const [lobbyName, setLobbyName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [mobileFlow, setMobileFlow] = useState<'home' | 'choose' | 'create' | 'join'>('home');

  useEffect(() => {
    if (!isMobile) {
      setMobileFlow('choose');
    } else {
      setMobileFlow('home');
    }
  }, [isMobile]);

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
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
          opacity: 0.88,
          zIndex: 0,
        }}
      >
        <div
          style={{
            width: '64vw',
            minWidth: 360,
            maxWidth: 940,
            height: '100%',
            transform: 'translateX(12%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.86) 30%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.86) 30%, rgba(0,0,0,1) 100%)',
          }}
        >
          <CoupBackgroundSVG />
        </div>
      </div>

      <div style={s.stage}>
        <motion.section style={{ ...s.heroCard, minHeight: isMobile ? 320 : 540 }} variants={slideUpVariants} initial="hidden" animate="visible">
          <div style={s.heroGlow} />
          <div>
            <div style={s.heroEyebrow}>Realtime multiplayer bluffing</div>
            <div style={{ marginBottom: 18 }}>
              <CoupLogo compact={isMobile} />
            </div>
            <div style={s.title}>COUP</div>
            <div style={s.subtitle}>
              Run the table with clean reads, false confidence, and timed pressure. Every action is public.
              Every bluff can be challenged. The last player with influence wins.
            </div>
          </div>

          <div style={{ ...s.featureGrid, gridTemplateColumns: isMobile ? '1fr' : s.featureGrid.gridTemplateColumns }}>
            <div style={s.featureCard}>
              <div style={s.featureTitle}>Fast Table Reads</div>
              <div style={s.featureText}>Targeted actions and response windows keep pressure clear instead of noisy.</div>
            </div>
            {!isMobile && <div style={s.featureCard}>
              <div style={s.featureTitle}>Live Timeline</div>
              <div style={s.featureText}>Track every declaration, challenge, reveal, and elimination in one feed.</div>
            </div>}
            {!isMobile && <div style={s.featureCard}>
              <div style={s.featureTitle}>Phone Ready</div>
              <div style={s.featureText}>Compact controls, bottom utility dock, and cleaner boards on smaller screens.</div>
            </div>}
          </div>
        </motion.section>

        <motion.section style={s.actionColumn} variants={fadeInVariants} initial="hidden" animate="visible">
          <div style={s.actionShell}>
            <div style={s.actionHeader}>
              <div style={s.actionTitle}>Enter the table</div>
              <div style={s.actionSubtitle}>Pick a name once, then create a room or join an existing code.</div>
            </div>

            <input
              style={s.input}
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />

            {isMobile && mobileFlow === 'home' && (
              <button style={s.mobilePlayButton} onClick={() => setMobileFlow('choose')}>
                Play
              </button>
            )}

            {(!isMobile || mobileFlow === 'choose') && (
              <>
                {isMobile && (
                  <div style={s.mobileChoiceGrid}>
                    <button style={s.mobileChoiceButton} onClick={() => setMobileFlow('create')}>Create</button>
                    <button style={s.mobileChoiceButton} onClick={() => setMobileFlow('join')}>Join</button>
                  </div>
                )}

                {!isMobile && (
                  <>
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

                    <div style={s.divider}>
                      <div style={s.dividerLine} />
                      <div style={s.dividerText}>or</div>
                      <div style={s.dividerLine} />
                    </div>

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
                  </>
                )}
              </>
            )}

            {isMobile && mobileFlow === 'create' && (
              <motion.div style={s.card} variants={slideUpVariants} initial="hidden" animate="visible">
                <button style={s.mobileBackButton} onClick={() => setMobileFlow('choose')}>Back</button>
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
            )}

            {isMobile && mobileFlow === 'join' && (
              <motion.div style={s.card} variants={slideUpVariants} initial="hidden" animate="visible">
                <button style={s.mobileBackButton} onClick={() => setMobileFlow('choose')}>Back</button>
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
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
