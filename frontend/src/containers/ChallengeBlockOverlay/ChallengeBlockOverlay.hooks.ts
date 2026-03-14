import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import { GamePhase } from "@/models/game";
import { ClientMessage, ClientMessageType } from "@/models/websocket-message";
import { ACTION_RULES, ActionType } from "@/models/action";
import { Character } from "@/models/card";
import { getEligibleResponderIds } from "@/utils/responseWindows";

export function useChallengeBlockOverlay(
  send: (msg: ClientMessage) => boolean,
) {
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
  useEffect(
    () => () => {
      if (submittingTimerRef.current) clearTimeout(submittingTimerRef.current);
    },
    [],
  );

  const startSubmitting = useCallback(() => {
    setSubmitting(true);
    // Safety timeout: reset submitting if no phase change within 5s
    if (submittingTimerRef.current) clearTimeout(submittingTimerRef.current);
    submittingTimerRef.current = setTimeout(() => {
      setSubmitting(false);
    }, 5000);
  }, []);

  const eligibleResponderIds = getEligibleResponderIds(state.gameState);
  const canRespondNow = myId != null && eligibleResponderIds.includes(myId);

  const showChallengeWindow =
    currentPhase === GamePhase.CHALLENGE_WINDOW &&
    pending != null &&
    canRespondNow;

  const showBlockWindow =
    currentPhase === GamePhase.BLOCK_WINDOW && pending != null && canRespondNow;

  const showBlockChallengeWindow =
    currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW &&
    pending != null &&
    canRespondNow;

  const canChallenge = showChallengeWindow || showBlockChallengeWindow;

  const canSeeBlock = showBlockWindow;

  const blockableCharacters = useMemo(() => {
    if (!canSeeBlock || !pending) return [];
    const rule = ACTION_RULES[pending.actionType as ActionType];
    return rule?.blockedBy ?? [];
  }, [canSeeBlock, pending]);

  const canBlock = blockableCharacters.length > 0;

  const actorName = useMemo(() => {
    if (!pending || !state.gameState) return "";
    return (
      state.gameState.players.find((p) => p.id === pending.actorId)?.name ?? ""
    );
  }, [pending, state.gameState]);

  const blockerName = useMemo(() => {
    if (!pending?.blockerId || !state.gameState) return "";
    return (
      state.gameState.players.find((p) => p.id === pending.blockerId)?.name ??
      ""
    );
  }, [pending, state.gameState]);

  const iAlreadyAccepted =
    myId != null && (pending?.acceptedBy ?? []).includes(myId);

  const waitingForText = useMemo(() => {
    if (!pending || !state.gameState) return "";

    const eligibleIds = getEligibleResponderIds(state.gameState);

    const accepted = new Set(pending.acceptedBy ?? []);
    const waitingNames = eligibleIds
      .filter((id) => !accepted.has(id))
      .map((id) => state.gameState?.players.find((p) => p.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    if (waitingNames.length === 0) {
      return "Resolving...";
    }
    return waitingNames.length === 1
      ? `Waiting for ${waitingNames[0]}.`
      : `Waiting for ${waitingNames.join(", ")}.`;
  }, [pending, state.gameState]);

  const responseHint = useMemo(() => {
    if (iAlreadyAccepted) {
      return "You already allowed this action. The game is resolving now.";
    }
    if (currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW) {
      return "Only the acting player can challenge this block.";
    }
    if (currentPhase === GamePhase.BLOCK_WINDOW) {
      return pending?.targetId
        ? "Only the targeted player can block here."
        : "Any opponent may block. The table window closes after everyone else allows it.";
    }
    return pending?.targetId
      ? "Only the targeted player can challenge this action."
      : "Any opponent may challenge. The table window closes after everyone else allows it.";
  }, [iAlreadyAccepted, currentPhase, pending?.targetId]);

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
      const sent = send({
        type: ClientMessageType.BLOCK,
        payload: { blockingCharacter: character },
      });
      if (sent) startSubmitting();
    },
    [send, submitting, startSubmitting],
  );

  const onAccept = useCallback(() => {
    if (submitting) return;
    const sent = send({ type: ClientMessageType.ACCEPT, payload: {} });
    if (sent) startSubmitting();
  }, [send, submitting, startSubmitting]);

  const amIAlive =
    myId != null
      ? (state.gameState?.players.find((p) => p.id === myId)?.isAlive ?? true)
      : true;
  const isGameOver =
    state.gameState?.phase === GamePhase.GAME_OVER ||
    Boolean(state.gameState?.winnerId) ||
    ((state.gameState?.players.filter((p) => p.isAlive).length ?? 0) <= 1 &&
      (state.gameState?.players.length ?? 0) > 0);
  const isVisible =
    !isGameOver && amIAlive && (canChallenge || canBlock) && canRespondNow;

  return {
    isVisible,
    iAlreadyAccepted,
    canChallenge,
    canBlock,
    blockableCharacters,
    actorName,
    blockerName,
    waitingForText,
    responseHint,
    pending,
    currentPhase,
    submitting,
    onChallenge,
    onBlock,
    onAccept,
  };
}
