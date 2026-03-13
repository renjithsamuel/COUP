'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ActionButton } from '@/components/ActionButton';
import { getActionPanelStyles } from './ActionPanel.styles';
import { ACTION_RULES } from '@/models/action';
import { ActionPanelController } from './ActionPanel.hooks';

export interface ActionPanelProps extends ActionPanelController {
  isMobile?: boolean;
}

export function ActionPanel({
  canAct,
  isWaitingForResponse,
  isExchangePhase,
  isWaitingForInfluenceLoss,
  availableActions,
  selectedAction,
  beginAction,
  cancelTargeting,
  myCoins,
  mustCoup,
  isMobile = false,
}: ActionPanelProps) {
  const s = getActionPanelStyles(isMobile);
  const selectedRule = selectedAction ? ACTION_RULES[selectedAction] : null;

  const panelState = (() => {
    if (selectedRule) {
      return {
        tone: 'warn' as const,
        eyebrow: 'Target mode',
        title: `Choose a player for ${selectedRule.label}`,
        chip: selectedRule.label,
      };
    }
    if (isWaitingForResponse) {
      return {
        tone: 'info' as const,
        eyebrow: 'Stand by',
        title: 'Response window open',
        chip: 'Waiting',
      };
    }
    if (isWaitingForInfluenceLoss) {
      return {
        tone: 'danger' as const,
        eyebrow: 'Stand by',
        title: 'Waiting for reveal',
        chip: 'Reveal',
      };
    }
    if (isExchangePhase) {
      return {
        tone: 'warn' as const,
        eyebrow: 'Exchange',
        title: 'Choose the cards you want to keep',
        chip: 'Exchange',
      };
    }
    if (!canAct) {
      return {
        tone: 'info' as const,
        eyebrow: 'Stand by',
        title: 'Not your turn',
        chip: 'Disabled',
      };
    }
    return null;
  })();
  const showPanelBar =
    mustCoup ||
    selectedRule != null ||
    isExchangePhase ||
    isWaitingForInfluenceLoss ||
    (isMobile && panelState != null);

  return (
    <div style={s.dock}>
      {showPanelBar && (
        <div style={s.bar(panelState?.tone ?? 'ok')}>
          <div style={s.barCopy}>
            <span style={s.barEyebrow}>{panelState?.eyebrow ?? (mustCoup ? 'Forced move' : 'Command deck')}</span>
            <span style={s.barTitle}>
              {mustCoup
                ? 'Coup is mandatory at 10+ coins'
                : panelState?.title ?? 'Choose an action'}
            </span>
          </div>
          <div style={s.barMeta}>
            <span style={s.metaChip('ok')}>{myCoins}c</span>
            {panelState?.chip && <span style={s.metaChip(panelState.tone)}>{panelState.chip}</span>}
            {selectedRule && (
              <button type="button" style={s.cancelTargeting} onClick={cancelTargeting}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div style={s.wrapper}>
        <AnimatePresence>
          {availableActions.map((rule) => (
            <ActionButton
              key={rule.type}
              actionType={rule.type}
              onClick={() => beginAction(rule.type)}
              selected={selectedAction === rule.type}
              disabled={!canAct}
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
