'use client';

import React from 'react';
import { GameStatePublic } from '@/models/game';
import { tokens } from '@/theme/tokens';

export interface GameDashboardProps {
  gameState: GameStatePublic;
  myPlayerId: string;
}

export function GameDashboard({ gameState, myPlayerId }: GameDashboardProps) {
  const players = gameState.players;
  const sortedPlayers = [...players].sort((a, b) => {
    // Alive players first, then by coins
    if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
    return b.coins - a.coins;
  });

  return (
    <div style={styles.wrapper}>
      <div style={styles.subtitle}>Turn {gameState.turnNumber} · {gameState.deckSize} cards in deck</div>

      {/* Player standings table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={{ ...styles.th, textAlign: 'left' }}>Player</th>
            <th style={styles.th}>Coins</th>
            <th style={styles.th}>Cards</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, i) => {
            const isMe = player.id === myPlayerId;
            const isCurrent = player.id === gameState.currentPlayerId;
            return (
              <tr key={player.id} style={styles.tr(isCurrent)}>
                <td style={styles.td}>{i + 1}</td>
                <td style={{
                  ...styles.td,
                  textAlign: 'left',
                  fontWeight: isMe ? 800 : 600,
                  color: isMe ? tokens.text.accent : tokens.text.primary,
                }}>
                  {player.name}
                  {isMe && <span style={styles.youBadge}>YOU</span>}
                  {isCurrent && <span style={styles.turnBadge}>⏎</span>}
                </td>
                <td style={{ ...styles.td, color: tokens.coin.color, fontWeight: 700 }}>
                  {player.coins}
                </td>
                <td style={styles.td}>
                  {player.influenceCount}
                </td>
                <td style={styles.td}>
                  {!player.isAlive ? (
                    <span style={styles.eliminatedBadge}>OUT</span>
                  ) : (
                    <span style={styles.aliveBadge}>ALIVE</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Revealed influences section */}
      <div style={styles.sectionTitle}>Revealed Influences</div>
      <div style={styles.revealedGrid}>
        {players.map((player) =>
          player.revealedCards.length > 0 ? (
            <div key={player.id} style={styles.revealedRow}>
              <span style={styles.revealedName}>{player.name}:</span>
              {player.revealedCards.map((card, i) => (
                <span key={i} style={styles.revealedCard}>
                  {card.character}
                </span>
              ))}
            </div>
          ) : null,
        )}
        {players.every((p) => p.revealedCards.length === 0) && (
          <div style={{ color: tokens.text.muted, fontSize: 11 }}>No influences revealed yet</div>
        )}
      </div>

      {/* Pending action */}
      {gameState.pendingAction && (
        <>
          <div style={styles.sectionTitle}>Current Action</div>
          <div style={styles.pendingAction}>
            <span style={{ color: tokens.text.accent }}>
              {players.find((p) => p.id === gameState.pendingAction?.actorId)?.name ?? '?'}
            </span>
            {' → '}
            <span style={{ fontWeight: 700 }}>
              {gameState.pendingAction.actionType.replace('_', ' ')}
            </span>
            {gameState.pendingAction.targetId && (
              <>
                {' → '}
                <span style={{ color: '#EF5350' }}>
                  {players.find((p) => p.id === gameState.pendingAction?.targetId)?.name ?? '?'}
                </span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 800,
    color: tokens.text.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: tokens.text.muted,
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: tokens.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 12,
  },
  th: {
    fontSize: 10,
    fontWeight: 700,
    color: tokens.text.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    padding: '6px 4px',
    borderBottom: `1px solid ${tokens.surface.border}`,
    textAlign: 'center' as const,
  },
  tr: (isCurrent: boolean) => ({
    background: isCurrent ? 'rgba(255,193,7,0.05)' : 'transparent',
  }),
  td: {
    padding: '6px 4px',
    borderBottom: `1px solid ${tokens.surface.border}`,
    textAlign: 'center' as const,
    fontSize: 12,
    color: tokens.text.primary,
  },
  youBadge: {
    fontSize: 8,
    fontWeight: 800,
    color: tokens.text.accent,
    background: 'rgba(255,193,7,0.15)',
    borderRadius: 4,
    padding: '1px 4px',
    marginLeft: 4,
    verticalAlign: 'middle' as const,
    letterSpacing: 1,
  },
  turnBadge: {
    fontSize: 10,
    marginLeft: 4,
    color: tokens.text.accent,
  },
  eliminatedBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#EF5350',
    background: 'rgba(239,83,80,0.12)',
    borderRadius: 4,
    padding: '2px 6px',
    letterSpacing: 1,
  },
  aliveBadge: {
    fontSize: 9,
    fontWeight: 800,
    color: '#66BB6A',
    background: 'rgba(102,187,106,0.1)',
    borderRadius: 4,
    padding: '2px 6px',
    letterSpacing: 1,
  },
  revealedGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  revealedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
  },
  revealedName: {
    color: tokens.text.secondary,
    fontWeight: 600,
    minWidth: 50,
  },
  revealedCard: {
    fontSize: 10,
    fontWeight: 700,
    color: tokens.text.primary,
    background: tokens.surface.elevated,
    borderRadius: 4,
    padding: '2px 6px',
    textTransform: 'capitalize' as const,
  },
  pendingAction: {
    fontSize: 12,
    color: tokens.text.primary,
    padding: '6px 8px',
    background: tokens.surface.elevated,
    borderRadius: 8,
    textTransform: 'capitalize' as const,
  },
};
