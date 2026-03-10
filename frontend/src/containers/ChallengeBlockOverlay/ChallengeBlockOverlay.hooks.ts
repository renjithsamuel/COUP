import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GamePhase } from '@/models/game';
import { ClientMessage, ClientMessageType } from '@/models/websocket-message';
import { ACTION_RULES, ActionType } from '@/models/action';
import { Character } from '@/models/card';

export function useChallengeBlockOverlay(send: (msg: ClientMessage) => boolean) {
  const { state, currentPhase } = useGameContext();
  const pending = state.gameState?.pendingAction;
  const myId = state.myPlayerId;
  const [submitting, setSubmitting] = useState(false);
  const submittingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset submitting state when phase changes
  useEffect(() => {
    setSubmitting(false);
    if (submittingTimerRef.current) {
      clearTimeout(submittingTimerRef.current);
      submittingTimerRef.current = null;
    }
  }, [currentPhase]);

  // Cleanup timeout on unmount
  useEffect(() => () => {
    if (submittingTimerRef.current) clearTimeout(submittingTimerRef.current);
  }, []);

  const startSubmitting = useCallback(() => {
    setSubmitting(true);
    // Safety timeout: reset submitting if no phase change within 5s
    if (submittingTimerRef.current) clearTimeout(submittingTimerRef.current);
    submittingTimerRef.current = setTimeout(() => {
      setSubmitting(false);
    }, 5000);
  }, []);

  const showChallengeWindow =
    currentPhase === GamePhase.CHALLENGE_WINDOW &&
    pending != null &&
    pending.actorId !== myId;

  const showBlockWindow =
    currentPhase === GamePhase.BLOCK_WINDOW &&
    pending != null &&
    pending.actorId !== myId;

  const showBlockChallengeWindow =
    currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW &&
    pending != null &&
    pending.blockerId !== myId;

  const canChallenge = showChallengeWindow || showBlockChallengeWindow;

  // For targeted actions (steal, assassinate), only the target can block
  const isTargetedAction = pending?.targetId != null;
  const amITarget = isTargetedAction && pending?.targetId === myId;
  const canSeeBlock = showBlockWindow && (!isTargetedAction || amITarget);

  const blockableCharacters = useMemo(() => {
    if (!canSeeBlock || !pending) return [];
    const rule = ACTION_RULES[pending.actionType as ActionType];
    return rule?.blockedBy ?? [];
  }, [canSeeBlock, pending]);

  const canBlock = blockableCharacters.length > 0;

  const actorName = useMemo(() => {
    if (!pending || !state.gameState) return '';
    return state.gameState.players.find((p) => p.id === pending.actorId)?.name ?? '';
  }, [pending, state.gameState]);

  const blockerName = useMemo(() => {
    if (!pending?.blockerId || !state.gameState) return '';
    return state.gameState.players.find((p) => p.id === pending.blockerId)?.name ?? '';
  }, [pending, state.gameState]);

  const onChallenge = useCallback(() => {
    if (!pending || submitting) return;
    const sent = send({
      type: ClientMessageType.CHALLENGE,
      payload: { targetPlayerId: pending.actorId },
    });
    if (sent) startSubmitting();
  }, [send, pending, submitting, startSubmitting]);

  const onBlock = useCallback(
    (character: Character) => {
      if (submitting) return;
      const sent = send({ type: ClientMessageType.BLOCK, payload: { blockingCharacter: character } });
      if (sent) startSubmitting();
    },
    [send, submitting, startSubmitting],
  );

  const onAccept = useCallback(() => {
    if (submitting) return;
    const sent = send({ type: ClientMessageType.ACCEPT, payload: {} });
    if (sent) startSubmitting();
  }, [send, submitting, startSubmitting]);

  // Extra safety: overlay should NEVER show for the actor during their own action
  // or for the blocker during block challenge window
  const isVisible =
    (canChallenge || canBlock) &&
    !(pending?.actorId === myId && currentPhase !== GamePhase.BLOCK_CHALLENGE_WINDOW) &&
    !(pending?.blockerId === myId && currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW);

  // Check if this player already accepted (waiting for others)
  // Only count accepts for the CURRENT phase (accepted_by is cleared on phase transitions)
  const iAlreadyAccepted = myId != null && (pending?.acceptedBy ?? []).includes(myId);

  return {
    isVisible,
    iAlreadyAccepted,
    canChallenge,
    canBlock,
    blockableCharacters,
    actorName,
    blockerName,
    pending,
    currentPhase,
    submitting,
    onChallenge,
    onBlock,
    onAccept,
  };
}
