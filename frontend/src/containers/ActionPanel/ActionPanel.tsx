"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { ActionButton } from "@/components/ActionButton";
import { ActionType } from "@/models/action";
import { getActionPanelStyles } from "./ActionPanel.styles";
import { ACTION_RULES } from "@/models/action";
import { ActionPanelController } from "./ActionPanel.hooks";

const DEFAULT_ACTION_TYPES = new Set<ActionType>([
  ActionType.INCOME,
  ActionType.FOREIGN_AID,
  ActionType.COUP,
]);

export interface ActionPanelProps extends ActionPanelController {
  isMobile?: boolean;
  desktopTwoColumn?: boolean;
  onInactiveActionAttempt?: () => void;
  onActionPress?: (actionType: ActionType) => void;
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
  desktopTwoColumn = false,
  onInactiveActionAttempt,
  onActionPress,
}: ActionPanelProps) {
  const s = getActionPanelStyles(isMobile, desktopTwoColumn);
  const selectedRule = selectedAction ? ACTION_RULES[selectedAction] : null;
  const defaultActions = availableActions.filter((rule) =>
    DEFAULT_ACTION_TYPES.has(rule.type),
  );
  const specialActions = availableActions.filter(
    (rule) => !DEFAULT_ACTION_TYPES.has(rule.type),
  );
  const orderedActions = [...defaultActions, ...specialActions];

  const panelState = (() => {
    if (selectedRule) {
      return {
        tone: "warn" as const,
        eyebrow: "Target mode",
        title: `Choose a player for ${selectedRule.label}`,
        chip: selectedRule.label,
      };
    }
    if (isWaitingForResponse) {
      return {
        tone: "info" as const,
        eyebrow: "Stand by",
        title: "Response window open",
        chip: "Waiting",
      };
    }
    if (isWaitingForInfluenceLoss) {
      return {
        tone: "danger" as const,
        eyebrow: "Stand by",
        title: "Waiting for reveal",
        chip: "Reveal",
      };
    }
    if (isExchangePhase) {
      return {
        tone: "warn" as const,
        eyebrow: "Exchange",
        title: "Choose the cards you want to keep",
        chip: "Exchange",
      };
    }
    return null;
  })();
  const compactMobileBar =
    isMobile &&
    panelState != null &&
    !selectedRule &&
    !isExchangePhase &&
    !mustCoup;
  const shouldCaptureInactiveTap =
    !canAct &&
    !isWaitingForResponse &&
    !isExchangePhase &&
    !isWaitingForInfluenceLoss &&
    !selectedRule;
  const showPanelBar =
    mustCoup ||
    selectedRule != null ||
    isExchangePhase ||
    isWaitingForInfluenceLoss ||
    (isMobile && panelState != null);

  const renderActionButton = (rule: (typeof availableActions)[number]) => (
    <ActionButton
      key={rule.type}
      actionType={rule.type}
      onClick={() => {
        onActionPress?.(rule.type);
        beginAction(rule.type);
      }}
      selected={selectedAction === rule.type}
      disabled={!canAct}
      playerCoins={myCoins}
      isBluff={rule.isBluff}
      canAfford={rule.canAfford}
      compact={isMobile}
      helperText={undefined}
    />
  );

  return (
    <div style={s.dock}>
      {showPanelBar && (
        <div style={s.bar(panelState?.tone ?? "ok", compactMobileBar)}>
          <div style={s.barCopy(compactMobileBar)}>
            <span style={s.barEyebrow}>
              {panelState?.eyebrow ??
                (mustCoup ? "Forced move" : "Command deck")}
            </span>
            <span style={s.barTitle}>
              {mustCoup
                ? "Coup is mandatory at 10+ coins"
                : (panelState?.title ?? "Choose an action")}
            </span>
          </div>
          <div style={s.barMeta(compactMobileBar)}>
            <span style={s.metaChip("ok")}>{myCoins}c</span>
            {panelState?.chip && (
              <span style={s.metaChip(panelState.tone)}>{panelState.chip}</span>
            )}
            {selectedRule && (
              <button
                type="button"
                style={s.cancelTargeting}
                onClick={cancelTargeting}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <div style={s.wrapperShell}>
        {shouldCaptureInactiveTap && onInactiveActionAttempt && (
          <button
            type="button"
            style={s.inactiveOverlay}
            onClick={onInactiveActionAttempt}
            aria-label="Not your turn"
          />
        )}
        <div style={s.wrapper}>
          <AnimatePresence>
            {isMobile || desktopTwoColumn ? (
              orderedActions.map((rule) => renderActionButton(rule))
            ) : (
              <>
                <div style={s.desktopRow("default")}>
                  {defaultActions.map((rule) => (
                    <div key={rule.type} style={s.desktopButtonSlot}>
                      {renderActionButton(rule)}
                    </div>
                  ))}
                </div>
                <div style={s.desktopRow("special")}>
                  {specialActions.map((rule) => (
                    <div key={rule.type} style={s.desktopButtonSlot}>
                      {renderActionButton(rule)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
