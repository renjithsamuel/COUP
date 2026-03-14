"use client";

import React from "react";
import { GameStatePublic } from "@/models/game";
import { tokens } from "@/theme/tokens";

export interface GameDashboardProps {
  gameState: GameStatePublic;
  myPlayerId: string;
  isMobile?: boolean;
}

export function GameDashboard({
  gameState,
  myPlayerId,
  isMobile = false,
}: GameDashboardProps) {
  const players = gameState.players;
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isAlive !== b.isAlive) return a.isAlive ? -1 : 1;
    return b.coins - a.coins;
  });

  const playersAlive = players.filter((player) => player.isAlive).length;

  return (
    <div style={styles.wrapper(isMobile)}>
      <div style={styles.summaryRow(isMobile)}>
        <div style={styles.summaryCard(isMobile)}>
          <span style={styles.summaryLabel(isMobile)}>Turn</span>
          <span style={styles.summaryValue(isMobile)}>
            {gameState.turnNumber}
          </span>
        </div>
        <div style={styles.summaryCard(isMobile)}>
          <span style={styles.summaryLabel(isMobile)}>Deck</span>
          <span style={styles.summaryValue(isMobile)}>
            {gameState.deckSize} cards
          </span>
        </div>
        <div style={styles.summaryCard(isMobile)}>
          <span style={styles.summaryLabel(isMobile)}>Alive</span>
          <span style={styles.summaryValue(isMobile)}>
            {playersAlive} players
          </span>
        </div>
      </div>

      {!isMobile && (
        <div style={styles.listHeader}>
          <span style={styles.headerName}>Player</span>
          <span style={styles.headerStat}>Coins</span>
          <span style={styles.headerStat}>Inf</span>
          <span style={styles.headerStat}>Rev</span>
          <span style={styles.headerStatus}>Status</span>
        </div>
      )}

      <div style={styles.playerList(isMobile)}>
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === myPlayerId;
          const isCurrent = player.id === gameState.currentPlayerId;
          return (
            <div
              key={player.id}
              style={styles.playerCard(isCurrent, isMe, isMobile)}
            >
              {isMobile ? (
                <>
                  <div style={styles.mobileTopRow}>
                    <div style={styles.playerIdentity}>
                      <span style={styles.rankChip(isMobile)}>{index + 1}</span>
                      <div style={styles.playerCopy}>
                        <div style={styles.playerNameRow}>
                          <span style={styles.playerName(isMe, isMobile)}>
                            {player.name}
                          </span>
                          {isMe && (
                            <span style={styles.softBadge(isMobile)}>You</span>
                          )}
                          {isCurrent && (
                            <span style={styles.accentBadge(isMobile)}>
                              Turn
                            </span>
                          )}
                        </div>
                        {player.revealedCards.length > 0 && (
                          <div style={styles.revealedInlineWrap}>
                            {player.revealedCards.map((card, i) => (
                              <span
                                key={`${player.id}-${i}`}
                                style={styles.revealedCard(isMobile)}
                              >
                                {card.character}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.statusCellMobile}>
                      <span
                        style={
                          player.isAlive
                            ? styles.aliveBadge(isMobile)
                            : styles.eliminatedBadge(isMobile)
                        }
                      >
                        {player.isAlive ? "Alive" : "Out"}
                      </span>
                    </div>
                  </div>
                  <div style={styles.mobileStatGrid}>
                    <div style={styles.mobileStatCard}>
                      <span style={styles.mobileStatLabel}>Coins</span>
                      <span style={styles.mobileStatValueAccent}>
                        {player.coins}
                      </span>
                    </div>
                    <div style={styles.mobileStatCard}>
                      <span style={styles.mobileStatLabel}>Inf</span>
                      <span style={styles.mobileStatValue}>
                        {player.influenceCount}
                      </span>
                    </div>
                    <div style={styles.mobileStatCard}>
                      <span style={styles.mobileStatLabel}>Rev</span>
                      <span style={styles.mobileStatValue}>
                        {player.revealedCards.length}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.playerIdentity}>
                    <span style={styles.rankChip(isMobile)}>{index + 1}</span>
                    <div style={styles.playerCopy}>
                      <div style={styles.playerNameRow}>
                        <span style={styles.playerName(isMe, isMobile)}>
                          {player.name}
                        </span>
                        {isMe && (
                          <span style={styles.softBadge(isMobile)}>You</span>
                        )}
                        {isCurrent && (
                          <span style={styles.accentBadge(isMobile)}>Turn</span>
                        )}
                      </div>
                      {player.revealedCards.length > 0 && (
                        <div style={styles.revealedInlineWrap}>
                          {player.revealedCards.map((card, i) => (
                            <span
                              key={`${player.id}-${i}`}
                              style={styles.revealedCard(isMobile)}
                            >
                              {card.character}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.statCellAccent}>{player.coins}</div>
                  <div style={styles.statCell}>{player.influenceCount}</div>
                  <div style={styles.statCell}>
                    {player.revealedCards.length}
                  </div>
                  <div style={styles.statusCell}>
                    <span
                      style={
                        player.isAlive
                          ? styles.aliveBadge(isMobile)
                          : styles.eliminatedBadge(isMobile)
                      }
                    >
                      {player.isAlive ? "Alive" : "Out"}
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {gameState.pendingAction && (
        <div style={styles.pendingActionCard(isMobile)}>
          <div style={styles.sectionTitle(isMobile)}>Current Action</div>
          <div style={styles.pendingAction(isMobile)}>
            <span style={{ color: tokens.text.accent }}>
              {players.find((p) => p.id === gameState.pendingAction?.actorId)
                ?.name ?? "?"}
            </span>
            {" declared "}
            <span style={{ fontWeight: 700 }}>
              {gameState.pendingAction.actionType.replace("_", " ")}
            </span>
            {gameState.pendingAction.targetId && (
              <>
                {" on "}
                <span style={{ color: "#EF5350" }}>
                  {players.find(
                    (p) => p.id === gameState.pendingAction?.targetId,
                  )?.name ?? "?"}
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
  wrapper: (isMobile: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? 12 : 16,
  }),
  summaryRow: (isMobile: boolean) => ({
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: isMobile ? 6 : 8,
  }),
  summaryCard: (isMobile: boolean) => ({
    padding: isMobile ? "8px 10px" : "10px 12px",
    borderRadius: isMobile ? 12 : 14,
    background: "rgba(255,255,255,0.035)",
    border: `1px solid ${tokens.surface.border}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? 1 : 2,
  }),
  summaryLabel: (isMobile: boolean) => ({
    fontSize: isMobile ? 8 : 9,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: isMobile ? 1 : 1.2,
    textTransform: "uppercase" as const,
  }),
  summaryValue: (isMobile: boolean) => ({
    fontSize: isMobile ? 12 : 14,
    color: tokens.text.primary,
    fontWeight: 800,
  }),
  listHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) 68px 52px 52px 80px",
    gap: 8,
    alignItems: "center",
    padding: "0 12px",
  },
  headerName: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  headerStat: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
  },
  headerStatus: {
    fontSize: 10,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
    textAlign: "right" as const,
  },
  sectionTitle: (isMobile: boolean) => ({
    fontSize: isMobile ? 10 : 11,
    fontWeight: 700,
    color: tokens.text.secondary,
    textTransform: "uppercase" as const,
    letterSpacing: isMobile ? 1.2 : 1.5,
    marginTop: isMobile ? 2 : 8,
  }),
  playerList: (isMobile: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? 6 : 8,
  }),
  playerCard: (isCurrent: boolean, isMe: boolean, isMobile: boolean) => ({
    padding: isMobile ? "8px 10px" : "10px 12px",
    borderRadius: isMobile ? 14 : 16,
    background: isCurrent
      ? "linear-gradient(180deg, rgba(34, 46, 68, 0.95) 0%, rgba(18, 25, 39, 0.98) 100%)"
      : "linear-gradient(180deg, rgba(19, 27, 43, 0.92) 0%, rgba(12, 18, 30, 0.98) 100%)",
    border: isMe
      ? "1px solid rgba(255,193,7,0.18)"
      : "1px solid rgba(255,255,255,0.06)",
    boxShadow: isCurrent ? "0 12px 24px rgba(0,0,0,0.24)" : "none",
    display: isMobile ? "flex" : "grid",
    flexDirection: isMobile ? ("column" as const) : undefined,
    gridTemplateColumns: isMobile
      ? undefined
      : "minmax(0, 1.7fr) 68px 52px 52px 80px",
    gap: isMobile ? 8 : 8,
    alignItems: "center",
  }),
  mobileTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
  },
  playerIdentity: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
    flex: 1,
  },
  rankChip: (isMobile: boolean) => ({
    width: isMobile ? 24 : 28,
    height: isMobile ? 24 : 28,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,193,7,0.12)",
    border: "1px solid rgba(255,193,7,0.22)",
    color: tokens.text.accent,
    fontSize: isMobile ? 11 : 12,
    fontWeight: 800,
    flexShrink: 0,
  }),
  playerCopy: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    minWidth: 0,
  },
  playerNameRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  playerName: (isMe: boolean, isMobile: boolean) => ({
    fontSize: isMobile ? 13 : 14,
    fontWeight: 800,
    color: isMe ? tokens.text.accent : tokens.text.primary,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  }),
  softBadge: (isMobile: boolean) => ({
    fontSize: isMobile ? 9 : 10,
    fontWeight: 800,
    letterSpacing: isMobile ? 0.5 : 0.8,
    textTransform: "uppercase" as const,
    color: tokens.text.secondary,
    padding: isMobile ? "2px 6px" : "3px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  }),
  accentBadge: (isMobile: boolean) => ({
    fontSize: isMobile ? 9 : 10,
    fontWeight: 800,
    letterSpacing: isMobile ? 0.5 : 0.8,
    textTransform: "uppercase" as const,
    color: tokens.text.accent,
    padding: isMobile ? "2px 6px" : "3px 8px",
    borderRadius: 999,
    background: "rgba(255,193,7,0.1)",
    border: "1px solid rgba(255,193,7,0.16)",
  }),
  statCell: {
    fontSize: 13,
    color: tokens.text.primary,
    fontWeight: 800,
    textAlign: "center" as const,
  },
  statCellAccent: {
    fontSize: 13,
    color: tokens.text.accent,
    fontWeight: 900,
    textAlign: "center" as const,
  },
  statusCell: {
    display: "flex",
    justifyContent: "flex-end",
  },
  statusCellMobile: {
    display: "flex",
    justifyContent: "flex-end",
    flexShrink: 0,
  },
  mobileStatGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
    width: "100%",
  },
  mobileStatCard: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    padding: "8px 10px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.035)",
    border: `1px solid ${tokens.surface.border}`,
    minWidth: 0,
  },
  mobileStatLabel: {
    fontSize: 8,
    color: tokens.text.muted,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  mobileStatValue: {
    fontSize: 14,
    color: tokens.text.primary,
    fontWeight: 800,
  },
  mobileStatValueAccent: {
    fontSize: 14,
    color: tokens.text.accent,
    fontWeight: 900,
  },
  eliminatedBadge: (isMobile: boolean) => ({
    fontSize: isMobile ? 9 : 10,
    fontWeight: 800,
    color: "#EF5350",
    background: "rgba(239,83,80,0.12)",
    borderRadius: 999,
    padding: isMobile ? "3px 7px" : "4px 8px",
    letterSpacing: isMobile ? 0.5 : 0.8,
    textTransform: "uppercase" as const,
  }),
  aliveBadge: (isMobile: boolean) => ({
    fontSize: isMobile ? 9 : 10,
    fontWeight: 800,
    color: "#66BB6A",
    background: "rgba(102,187,106,0.1)",
    borderRadius: 999,
    padding: isMobile ? "3px 7px" : "4px 8px",
    letterSpacing: isMobile ? 0.5 : 0.8,
    textTransform: "uppercase" as const,
  }),
  revealedInlineWrap: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 4,
  },
  revealedCard: (isMobile: boolean) => ({
    fontSize: isMobile ? 8 : 9,
    fontWeight: 700,
    color: tokens.text.primary,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 999,
    padding: isMobile ? "2px 6px" : "3px 7px",
    textTransform: "capitalize" as const,
  }),
  pendingActionCard: (isMobile: boolean) => ({
    padding: isMobile ? "10px 12px" : "14px 16px",
    borderRadius: isMobile ? 14 : 18,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? 6 : 8,
  }),
  pendingAction: (isMobile: boolean) => ({
    fontSize: isMobile ? 11 : 12,
    color: tokens.text.primary,
    lineHeight: 1.6,
    textTransform: "capitalize" as const,
  }),
};
