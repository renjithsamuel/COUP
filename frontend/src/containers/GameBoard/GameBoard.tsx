'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TurnIndicator } from '@/components/TurnIndicator';
import { Timer } from '@/components/Timer';
import { GameOverModal } from '@/components/GameOverModal';
import { OpponentArea } from '@/containers/OpponentArea';
import { ActionPanel } from '@/containers/ActionPanel';
import { PlayerHand } from '@/containers/PlayerHand';
import { ChallengeBlockOverlay } from '@/containers/ChallengeBlockOverlay';
import { GameLog } from '@/containers/GameLog';
import { GameDashboard } from '@/containers/GameDashboard';
import { GuideModal } from '@/components/GuideModal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { gameBoardStyles } from './GameBoard.styles';
import { useGameBoard } from './GameBoard.hooks';

/* ── Inline SVG icons (no emoji, theme-consistent) ── */
const LeaderboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="14" width="4" height="8" rx="1" />
    <rect x="10" y="6" width="4" height="16" rx="1" />
    <rect x="16" y="10" width="4" height="12" rx="1" />
  </svg>
);

const LogIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
  </svg>
);

const CoinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#FFC107" opacity="0.2" stroke="#FFC107" strokeWidth="2" />
    <text x="12" y="16" textAnchor="middle" fill="#FFC107" fontSize="12" fontWeight="bold">$</text>
  </svg>
);

export interface GameBoardProps {
  gameId: string;
  playerId: string;
  onPlayAgain: () => void;
}

export function GameBoard({ gameId, playerId, onPlayAgain }: GameBoardProps) {
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
  } = useGameBoard(gameId, playerId);
  const [showGuide, setShowGuide] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const isMobile = useIsMobile();
  const s = gameBoardStyles(isMobile);

  if (!gameState) {
    return (
      <div style={{ ...s.wrapper, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#8B95A8', fontSize: 16 }}>
          {status === 'connecting' ? 'Connecting...' : 'Loading game...'}
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players.find((p) => p.id === playerId);

  return (
    <div style={s.wrapper}>
      {/* Top bar — minimal transparent with utility buttons */}
      <div style={s.topBar}>
        <div style={s.topBarLeft}>
          {/* Connection status dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status === 'connected' ? '#4CAF50' : status === 'connecting' ? '#FFC107' : '#EF5350',
              boxShadow: status === 'connected' ? '0 0 6px #4CAF5080' : status === 'connecting' ? '0 0 6px #FFC10780' : '0 0 6px #EF535080',
              flexShrink: 0,
            }}
            title={`WebSocket: ${status}`}
          />
          {timerRemaining > 0 && (
            <Timer remaining={timerRemaining} progress={timerProgress} />
          )}
        </div>
        <div style={s.topBarRight}>
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
            onClick={() => setShowLog(true)}
            title="Game log"
            aria-label="Show game log"
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
        </div>
      </div>

      {/* Center area */}
      <div style={s.center}>
        {/* Opponents at the top */}
        <OpponentArea isMobile={isMobile} />

        {/* Turn indicator — centered between opponents and player */}
        <div style={s.turnArea}>
          <TurnIndicator
            currentPlayerName={currentPlayerName}
            isMyTurn={isMyTurn}
            turnNumber={gameState.turnNumber}
          />
        </div>

        {/* Current player's actions & hand at the bottom */}
        <div style={s.bottomArea}>
          <ActionPanel send={send} isMobile={isMobile} />
          {/* Player hand with integrated player info */}
          <div style={s.playerCardArea}>
            <div style={s.playerInfoInline}>
              <span style={s.playerNameLarge}>{myPlayer?.name ?? 'You'}</span>
              <span style={s.playerCoinsLarge}>
                <CoinIcon size={isMobile ? 16 : 20} /> {myPlayer?.coins ?? 0}
              </span>
            </div>
            <PlayerHand send={send} isMobile={isMobile} />
          </div>
        </div>
      </div>

      {/* Action event toast */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            key={activeEvent.id}
            initial={{ opacity: 0, y: 28, scale: 0.86, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -18, scale: 0.94, filter: 'blur(8px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={s.eventOverlay(activeEvent.accent)}
          >
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
              <span style={s.eventTitle(activeEvent.accent)}>{activeEvent.title}</span>
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
        )}
      </AnimatePresence>

      {/* Challenge / Block overlay */}
      <ChallengeBlockOverlay send={send} isMobile={isMobile} />

      {/* Game over modal */}
      <GameOverModal
        isOpen={isGameOver}
        winnerName={winnerName}
        onPlayAgain={onPlayAgain}
      />

      {/* Guide modal */}
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* Leaderboard modal */}
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={s.modalHeader}>
                <span style={s.modalTitle}>Leaderboard</span>
                <button style={s.modalCloseBtn} onClick={() => setShowDashboard(false)} aria-label="Close">✕</button>
              </div>
              <GameDashboard gameState={gameState} myPlayerId={playerId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game log modal */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            style={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLog(false)}
          >
            <motion.div
              style={s.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={s.modalHeader}>
                <span style={s.modalTitle}>Game Log</span>
                <button style={s.modalCloseBtn} onClick={() => setShowLog(false)} aria-label="Close">✕</button>
              </div>
              <GameLog />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
