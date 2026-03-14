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
    if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
    return b.coins - a.coins;
  });

  const playersAlive = players.filter((player) => player.isAlive).length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Turn</span>
          <span style={styles.summaryValue}>{gameState.turnNumber}</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Deck</span>
          <span style={styles.summaryValue}>{gameState.deckSize} cards</span>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>Alive</span>
          <span style={styles.summaryValue}>{playersAlive} players</span>
        </div>
      </div>

      <div style={styles.listHeader}>
        <span style={styles.headerName}>Player</span>
        <span style={styles.headerStat}>Coins</span>
        <span style={styles.headerStat}>Inf</span>
        <span style={styles.headerStat}>Rev</span>
        <span style={styles.headerStatus}>Status</span>
      </div>

      <div style={styles.playerList}>
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === myPlayerId;
          const isCurrent = player.id === gameState.currentPlayerId;
          return (
            <div key={player.id} style={styles.playerCard(isCurrent, isMe)}>
              <div style={styles.playerIdentity}>
                <span style={styles.rankChip}>{index + 1}</span>
                <div style={styles.playerCopy}>
                  <div style={styles.playerNameRow}>
                    <span style={styles.playerName(isMe)}>{player.name}</span>
                    {isMe && <span style={styles.softBadge}>You</span>}
                    {isCurrent && <span style={styles.accentBadge}>Turn</span>}
                  </div>
                  {player.revealedCards.length > 0 && (
                    <div style={styles.revealedInlineWrap}>
                      {player.revealedCards.map((card, i) => (
                        <span key={`${player.id}-${i}`} style={styles.revealedCard}>
                          {card.character}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.statCellAccent}>{player.coins}</div>
              <div style={styles.statCell}>{player.influenceCount}</div>
              <div style={styles.statCell}>{player.revealedCards.length}</div>
              <div style={styles.statusCell}>
                <span style={player.isAlive ? styles.aliveBadge : styles.eliminatedBadge}>
                  {player.isAlive ? 'Alive' : 'Out'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {gameState.pendingAction && (
        <div style={styles.pendingActionCard}>
          <div style={styles.sectionTitle}>Current Action</div>
          <div style={styles.pendingAction}>
            <span style={{ color: tokens.text.accent }}>
              {players.find((p) => p.id === gameState.pendingAction?.actorId)?.name ?? '?'}
            </span>
            {' declared '}
            <span style={{ fontWeight: 700 }}>
              {gameState.pendingAction.actionType.replace('_', ' ')}
            </span>
            {gameState.pendingAction.targetId && (
              <>
                {' on '}
                <span style={{ color: '#EF5350' }}>
                  {players.find((p) => p.id === gameState.pendingAction?.targetId)?.name ?? '?'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
  },
  summaryCard: {
    padding: '10px 12px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.035)',
    border: `1px solid ${tokens.surface.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 9,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  summaryValue: {
    fontSize: 14,
    color: tokens.text.primary,
    fontWeight: 800,
  },
  listHeader: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) 68px 52px 52px 80px',
    gap: 8,
    alignItems: 'center',
    padding: '0 12px',
  },
  headerName: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  headerStat: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },
  headerStatus: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    textAlign: 'right' as const,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: tokens.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  playerCard: (isCurrent: boolean, isMe: boolean) => ({
    padding: '10px 12px',
    borderRadius: 16,
    background: isCurrent
      ? 'linear-gradient(180deg, rgba(34, 46, 68, 0.95) 0%, rgba(18, 25, 39, 0.98) 100%)'
      : 'linear-gradient(180deg, rgba(19, 27, 43, 0.92) 0%, rgba(12, 18, 30, 0.98) 100%)',
    border: isMe
      ? '1px solid rgba(255,193,7,0.18)'
      : '1px solid rgba(255,255,255,0.06)',
    boxShadow: isCurrent ? '0 12px 24px rgba(0,0,0,0.24)' : 'none',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) 68px 52px 52px 80px',
    gap: 8,
    alignItems: 'center',
  }),
  playerIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  rankChip: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,193,7,0.12)',
    border: '1px solid rgba(255,193,7,0.22)',
    color: tokens.text.accent,
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
  playerCopy: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
    minWidth: 0,
  },
  playerNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  playerName: (isMe: boolean) => ({
    fontSize: 14,
    fontWeight: 800,
    color: isMe ? tokens.text.accent : tokens.text.primary,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  }),
  softBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: tokens.text.secondary,
    padding: '3px 8px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  accentBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: tokens.text.accent,
    padding: '3px 8px',
    borderRadius: 999,
    background: 'rgba(255,193,7,0.1)',
    border: '1px solid rgba(255,193,7,0.16)',
  },
  statCell: {
    fontSize: 13,
    color: tokens.text.primary,
    fontWeight: 800,
    textAlign: 'center' as const,
  },
  statCellAccent: {
    fontSize: 13,
    color: tokens.text.accent,
    fontWeight: 900,
    textAlign: 'center' as const,
  },
  statusCell: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  eliminatedBadge: {
    fontSize: 10,
    fontWeight: 800,
    color: '#EF5350',
    background: 'rgba(239,83,80,0.12)',
    borderRadius: 999,
    padding: '4px 8px',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  aliveBadge: {
    fontSize: 10,
    fontWeight: 800,
    color: '#66BB6A',
    background: 'rgba(102,187,106,0.1)',
    borderRadius: 999,
    padding: '4px 8px',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  revealedInlineWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  revealedCard: {
    fontSize: 9,
    fontWeight: 700,
    color: tokens.text.primary,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 999,
    padding: '3px 7px',
    textTransform: 'capitalize' as const,
  },
  pendingActionCard: {
    padding: '14px 16px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  pendingAction: {
    fontSize: 12,
    color: tokens.text.primary,
    lineHeight: 1.6,
    textTransform: 'capitalize' as const,
  },
};
