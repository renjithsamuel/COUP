'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ActionButton } from '@/components/ActionButton';
import { tokens } from '@/theme/tokens';
import { getActionPanelStyles } from './ActionPanel.styles';
import { useActionPanel } from './ActionPanel.hooks';

import { ClientMessage } from '@/models/websocket-message';

export interface ActionPanelProps {
  send: (msg: ClientMessage) => boolean;
  isMobile?: boolean;
}

export function ActionPanel({ send, isMobile = false }: ActionPanelProps) {
  const {
    canAct,
    isWaitingForResponse,
    isExchangePhase,
    isWaitingForInfluenceLoss,
    availableActions,
    targetablePlayers,
    selectedTarget,
    setSelectedTarget,
    performAction,
    myCoins,
    mustCoup,
  } = useActionPanel(send);

  const s = getActionPanelStyles(isMobile);

  if (isWaitingForResponse) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '6px 10px' : '10px 16px',
        borderRadius: 10,
        background: tokens.surface.overlay,
        border: `1px solid ${tokens.surface.borderLight}`,
      }}>
        <span style={{
          fontSize: isMobile ? 11 : 14,
          fontWeight: 600,
          color: tokens.text.secondary,
          letterSpacing: 0.5,
        }}>
          Waiting for other players to respond…
        </span>
      </div>
    );
  }

  if (isWaitingForInfluenceLoss) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '6px 10px' : '10px 16px',
        borderRadius: 10,
        background: tokens.surface.overlay,
        border: `1px solid ${tokens.surface.borderLight}`,
      }}>
        <span style={{
          fontSize: isMobile ? 11 : 14,
          fontWeight: 600,
          color: '#FF7043',
          letterSpacing: 0.5,
        }}>
          Waiting for player to choose an influence to lose…
        </span>
      </div>
    );
  }

  if (isExchangePhase) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '6px 10px' : '10px 16px',
      }}>
        <span style={{
          fontSize: isMobile ? 11 : 14,
          fontWeight: 600,
          color: tokens.text.accent,
          letterSpacing: 0.5,
        }}>
          Choose your cards below
        </span>
      </div>
    );
  }

  if (!canAct) return null;

  return (
    <div>
      {mustCoup && (
        <div style={s.label}>You have 10+ coins — you must Coup!</div>
      )}

      {/* Target selection for targeted actions */}
      {targetablePlayers.length > 0 && (
        <div style={s.targetSelect}>
          <span style={{ ...s.label, marginBottom: 2 }}>
            {selectedTarget ? '✓ Target selected' : '⬇ Select target for Steal / Assassinate / Coup'}
          </span>
          <div style={s.targetRow}>
            {targetablePlayers.map((p) => (
              <button
                key={p.id}
                type="button"
                style={s.targetButton(selectedTarget === p.id)}
                onClick={() => setSelectedTarget(selectedTarget === p.id ? null : p.id)}
              >
                <span style={s.targetAvatar(selectedTarget === p.id)}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={s.wrapper}>
        <AnimatePresence>
          {availableActions.map((rule) => (
            <ActionButton
              key={rule.type}
              actionType={rule.type}
              onClick={() => performAction(rule.type)}
              disabled={rule.requiresTarget && !selectedTarget}
              playerCoins={myCoins}
              isBluff={rule.isBluff}
              canAfford={rule.canAfford}
              compact={isMobile}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
