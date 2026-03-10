import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { ActionType, ACTION_RULES, ActionRule } from '@/models/action';
import { GamePhase } from '@/models/game';
import { ClientMessage, ClientMessageType } from '@/models/websocket-message';
import { GAME_CONSTANTS } from '@/utils/constants';

export interface ActionWithBluff extends ActionRule {
  isBluff: boolean;
  canAfford: boolean;
}

export function useActionPanel(send: (msg: ClientMessage) => boolean) {
  const { state, isMyTurn, currentPhase } = useGameContext();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const submitResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAction = state.gameState?.pendingAction;

  const myCoins =
    state.gameState?.players.find((p) => p.id === state.myPlayerId)?.coins ?? 0;

  const myCards = state.myCards
    .filter((c) => !c.isRevealed)
    .map((c) => c.character);

  const mustCoup = myCoins >= GAME_CONSTANTS.MANDATORY_COUP_THRESHOLD;

  const availableActions: ActionWithBluff[] = useMemo(() => {
    if (mustCoup) {
      const coupRule = ACTION_RULES[ActionType.COUP];
      return [{ ...coupRule, isBluff: false, canAfford: myCoins >= coupRule.cost }];
    }
    return Object.values(ACTION_RULES).map((rule) => {
      const canAfford = rule.cost === 0 || myCoins >= rule.cost;
      // An action is a bluff if it requires a character the player doesn't have
      const isBluff = rule.characterRequired != null && !myCards.includes(rule.characterRequired);
      return { ...rule, isBluff, canAfford };
    });
  }, [mustCoup, myCoins, myCards]);

  const targetablePlayers = useMemo(
    () =>
      state.gameState?.players.filter(
        (p) => p.id !== state.myPlayerId && p.isAlive,
      ) ?? [],
    [state.gameState?.players, state.myPlayerId],
  );

  const canAct =
    isMyTurn &&
    currentPhase === GamePhase.TURN_START &&
    pendingAction == null &&
    !isSubmittingAction;

  const isWaitingForResponse =
    isMyTurn &&
    (currentPhase === GamePhase.CHALLENGE_WINDOW ||
      currentPhase === GamePhase.BLOCK_WINDOW ||
      currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW);

  const isExchangePhase =
    isMyTurn && currentPhase === GamePhase.AWAITING_EXCHANGE;

  const isWaitingForInfluenceLoss =
    currentPhase === GamePhase.AWAITING_INFLUENCE_LOSS &&
    state.gameState?.awaitingInfluenceLossFrom != null &&
    state.gameState.awaitingInfluenceLossFrom !== state.myPlayerId;

  useEffect(() => () => {
    if (submitResetTimerRef.current) {
      clearTimeout(submitResetTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (currentPhase !== GamePhase.TURN_START || pendingAction != null || !isMyTurn) {
      setIsSubmittingAction(false);
      if (submitResetTimerRef.current) {
        clearTimeout(submitResetTimerRef.current);
        submitResetTimerRef.current = null;
      }
    }
  }, [currentPhase, pendingAction, isMyTurn]);

  useEffect(() => {
    if (!isSubmittingAction) {
      return;
    }

    if (submitResetTimerRef.current) {
      clearTimeout(submitResetTimerRef.current);
    }

    submitResetTimerRef.current = setTimeout(() => {
      setIsSubmittingAction(false);
      submitResetTimerRef.current = null;
    }, 2000);

    return () => {
      if (submitResetTimerRef.current) {
        clearTimeout(submitResetTimerRef.current);
        submitResetTimerRef.current = null;
      }
    };
  }, [isSubmittingAction]);

  useEffect(() => {
    if (!canAct) {
      setSelectedTarget(null);
      return;
    }

    if (selectedTarget == null) {
      return;
    }

    const selectedTargetIsAlive = targetablePlayers.some((player) => player.id === selectedTarget);
    if (!selectedTargetIsAlive) {
      setSelectedTarget(null);
    }
  }, [canAct, selectedTarget, targetablePlayers]);

  const performAction = useCallback(
    (actionType: ActionType) => {
      if (!canAct) {
        return;
      }

      const rule = ACTION_RULES[actionType];
      if (rule.requiresTarget && !selectedTarget) return;

      const sent = send({
        type: ClientMessageType.ACTION,
        payload: {
          actionType,
          ...(rule.requiresTarget && selectedTarget ? { targetId: selectedTarget } : {}),
        },
      });
      if (sent) {
        setIsSubmittingAction(true);
        setSelectedTarget(null);
      } else {
        setIsSubmittingAction(false);
      }
    },
    [canAct, send, selectedTarget],
  );

  return {
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
  };
}
