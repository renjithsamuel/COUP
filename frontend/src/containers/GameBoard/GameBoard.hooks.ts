import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAnimationQueue } from '@/hooks/useAnimationQueue';
import { useCountdown } from '@/hooks/useCountdown';
import { ServerMessage, ServerMessageType, ClientMessageType } from '@/models/websocket-message';
import { GamePhase } from '@/models/game';
import { ACTION_RULES, ActionType } from '@/models/action';
import { GAME_CONSTANTS } from '@/utils/constants';

export interface GameEvent {
  accent: string;
  effect: 'coins' | 'slash' | 'shield' | 'swap' | 'impact' | 'reveal' | 'challenge' | 'victory';
  message: string;
  symbol: string;
  title: string;
  type: 'action' | 'challenge' | 'block' | 'elimination' | 'turn' | 'system';
  id: number;
  actorId?: string;
  targetId?: string;
  blockerId?: string;
}

export interface ResponseStatus {
  tone: 'danger' | 'warn' | 'info' | 'ok';
  title: string;
  detail: string;
}

let eventIdCounter = 0;
const ACTION_EVENT_DURATION_MS = 1650;
const ACTION_EVENT_GAP_MS = 120;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getActionPresentation(actionType: string) {
  switch (actionType) {
    case ActionType.INCOME:
      return { accent: '#F6C445', effect: 'coins' as const, symbol: '+1', title: ACTION_RULES[ActionType.INCOME].label };
    case ActionType.FOREIGN_AID:
      return { accent: '#7DD3FC', effect: 'coins' as const, symbol: '+2', title: ACTION_RULES[ActionType.FOREIGN_AID].label };
    case ActionType.TAX:
      return { accent: '#F59E0B', effect: 'coins' as const, symbol: '+3', title: ACTION_RULES[ActionType.TAX].label };
    case ActionType.STEAL:
      return { accent: '#38BDF8', effect: 'coins' as const, symbol: '2C', title: ACTION_RULES[ActionType.STEAL].label };
    case ActionType.EXCHANGE:
      return { accent: '#34D399', effect: 'swap' as const, symbol: 'SWAP', title: ACTION_RULES[ActionType.EXCHANGE].label };
    case ActionType.ASSASSINATE:
      return { accent: '#F97316', effect: 'slash' as const, symbol: 'HIT', title: ACTION_RULES[ActionType.ASSASSINATE].label };
    case ActionType.COUP:
      return { accent: '#EF4444', effect: 'impact' as const, symbol: 'KO', title: ACTION_RULES[ActionType.COUP].label };
    default:
      return {
        accent: '#90A4AE',
        effect: 'challenge' as const,
        symbol: actionType.replace(/_/g, ' ').slice(0, 6).toUpperCase(),
        title: actionType.replace(/_/g, ' '),
      };
  }
}

function getTimerExpiredConsequence(phase: GamePhase): ResponseStatus | null {
  switch (phase) {
    case GamePhase.CHALLENGE_WINDOW:
      return {
        tone: 'ok',
        title: '⏱ Time Expired',
        detail: 'No one challenged — the action succeeds.',
      };
    case GamePhase.BLOCK_WINDOW:
      return {
        tone: 'ok',
        title: '⏱ Time Expired',
        detail: 'No one blocked — the action proceeds.',
      };
    case GamePhase.BLOCK_CHALLENGE_WINDOW:
      return {
        tone: 'ok',
        title: '⏱ Time Expired',
        detail: 'Block not challenged — it stands.',
      };
    case GamePhase.TURN_START:
      return {
        tone: 'warn',
        title: '⏱ Time Expired',
        detail: 'Turn ended — no action was taken.',
      };
    default:
      return null;
  }
}

export function useGameBoard(gameId: string, playerId: string) {
  const { state, dispatch, isMyTurn, currentPhase } = useGameContext();
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const mountedRef = useRef(true);
  const { enqueue, clear } = useAnimationQueue();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clear();
    };
  }, [clear]);

  const queueEvent = useCallback((event: Omit<GameEvent, 'id'>) => {
    const id = ++eventIdCounter;
    enqueue(`game-event-${id}`, async () => {
      if (!mountedRef.current) {
        return;
      }

      setActiveEvent({ ...event, id });
      await wait(ACTION_EVENT_DURATION_MS);

      if (mountedRef.current) {
        setActiveEvent((current) => (current?.id === id ? null : current));
      }

      await wait(ACTION_EVENT_GAP_MS);
    });
  }, [enqueue]);

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case ServerMessageType.GAME_STATE:
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          if (msg.privateState) {
            dispatch({
              type: 'SET_PRIVATE_STATE',
              payload: {
                myCards: msg.privateState.myCards,
                exchangeCards: msg.privateState.exchangeCards,
              },
            });
          }
          break;
        case ServerMessageType.PRIVATE_STATE:
          if (msg.privateState) {
            dispatch({ type: 'SET_GAME_STATE', payload: msg.privateState });
            dispatch({
              type: 'SET_PRIVATE_STATE',
              payload: {
                myCards: msg.privateState.myCards,
                exchangeCards: msg.privateState.exchangeCards,
              },
            });
          }
          break;
        case ServerMessageType.ACTION_DECLARED:
          {
            const actorName = String(msg.payload.actorName ?? '');
            const actionType = String(msg.payload.actionType ?? '');
            const targetName = String(msg.payload.targetName ?? '');
            const presentation = getActionPresentation(actionType);
            const text = targetName
              ? `${actorName} targets ${targetName}`
              : `${actorName} makes a move`;
            queueEvent({
              accent: presentation.accent,
              effect: presentation.effect,
              message: text,
              symbol: presentation.symbol,
              title: presentation.title,
              type: 'action',
              actorId: String(msg.payload.actorId ?? ''),
              targetId: targetName ? String(msg.payload.targetId ?? '') : undefined,
            });
            dispatch({
              type: 'ADD_LOG',
              payload: {
                message: targetName
                  ? `${actorName} -> ${presentation.title} -> ${targetName}`
                  : `${actorName} -> ${presentation.title}`,
                type: 'action',
              },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.CHALLENGE_ISSUED:
          {
            const name = String(msg.payload.challengerName ?? '');
            queueEvent({
              accent: '#FACC15',
              effect: 'challenge',
              message: `${name} calls the bluff`,
              symbol: '?!',
              title: 'Challenge',
              type: 'challenge',
              actorId: String(msg.payload.challengerId ?? ''),
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: `${name} challenges!`, type: 'challenge' },
            });
          }
          break;
        case ServerMessageType.CHALLENGE_RESULT:
          {
            const won = msg.payload.success ?? msg.payload.challengerWon;
            const text = `Challenge ${won ? 'succeeded' : 'failed'}`;
            queueEvent({
              accent: won ? '#EF4444' : '#10B981',
              effect: 'challenge',
              message: won ? 'The claim collapses' : 'The claim stands',
              symbol: won ? 'WIN' : 'SAFE',
              title: text,
              type: 'challenge',
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: text, type: 'challenge' },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.BLOCK_DECLARED:
          {
            const blockerName = String(msg.payload.blockerName ?? '');
            const char = String(msg.payload.character ?? msg.payload.blockingCharacter ?? '');
            const text = `${blockerName} blocks as ${char}`;
            queueEvent({
              accent: '#C084FC',
              effect: 'shield',
              message: blockerName ? `${blockerName} steps in` : 'A defense is declared',
              symbol: 'BLOCK',
              title: char ? `${char} block` : 'Block',
              type: 'block',
              blockerId: String(msg.payload.blockerId ?? ''),
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: text, type: 'block' },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.INFLUENCE_LOST:
          {
            const name = String(msg.payload.playerName ?? '');
            const char = String(msg.payload.character ?? '');
            const text = `${name} lost ${char}`;
            queueEvent({
              accent: '#FB7185',
              effect: 'reveal',
              message: name ? `${name} reveals ${char}` : `${char} is revealed`,
              symbol: 'LOSS',
              title: 'Influence lost',
              type: 'elimination',
              targetId: String(msg.payload.playerId ?? ''),
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: text, type: 'elimination' },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.PLAYER_ELIMINATED:
          {
            const name = String(msg.payload.playerName ?? '');
            queueEvent({
              accent: '#EF4444',
              effect: 'reveal',
              message: `${name} is out of the game`,
              symbol: 'OUT',
              title: 'Eliminated',
              type: 'elimination',
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: `${name} eliminated!`, type: 'elimination' },
            });
          }
          break;
        case ServerMessageType.TURN_CHANGED:
          {
            const name = String(msg.payload.playerName ?? '');
            const turn = Number(msg.payload.turnNumber ?? 0);
            const currentPlayerId = String(msg.payload.playerId ?? '');
            // Trust GAME_STATE when present to avoid one-tick stale turn UI.
            if (currentPlayerId && !msg.gameState) {
              dispatch({
                type: 'UPDATE_TURN',
                payload: {
                  currentPlayerId,
                  turnNumber: turn,
                },
              });
            }
            // Clear action emphasis when the turn advances.
            clear();
            setActiveEvent(null);
            dispatch({
              type: 'ADD_LOG',
              payload: { message: `Turn ${turn}: ${name}'s turn`, type: 'turn' },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.GAME_OVER:
          {
            const name = String(msg.payload.winnerName ?? '');
            queueEvent({
              accent: '#FBBF24',
              effect: 'victory',
              message: `${name} takes the table`,
              symbol: 'WIN',
              title: 'Game over',
              type: 'system',
            });
            dispatch({
              type: 'ADD_LOG',
              payload: { message: `Game over! ${name} wins!`, type: 'system' },
            });
          }
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
          break;
        case ServerMessageType.ERROR:
          {
            const errorMsg = String(msg.payload.message ?? '');
            const isStalePhaseError =
              errorMsg.includes('Not your turn') ||
              errorMsg.includes('Cannot accept in phase') ||
              errorMsg.includes('Cannot challenge in current phase') ||
              errorMsg.includes('Cannot block in current phase') ||
              errorMsg.includes('Cannot take action in current phase') ||
              errorMsg.includes('Not in a challenge window phase') ||
              errorMsg.includes('Not in block window phase');
            if (!isStalePhaseError) {
              dispatch({
                type: 'ADD_LOG',
                payload: { message: `Error: ${errorMsg}`, type: 'system' },
              });
            }
          }
          break;
        default:
          if (msg.gameState) dispatch({ type: 'SET_GAME_STATE', payload: msg.gameState });
      }
    },
    [dispatch, queueEvent, clear],
  );

  const { status, send } = useWebSocket({ gameId, playerId, onMessage });

  useEffect(() => {
    dispatch({ type: 'SET_MY_PLAYER_ID', payload: playerId });
  }, [dispatch, playerId]);

  // Timer for challenge/block windows — prefer game config, fall back to constants
  const gameConfig = state.gameState?.config;
  const timerSeconds =
    currentPhase === GamePhase.CHALLENGE_WINDOW || currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW
      ? (gameConfig?.challengeWindowSeconds ?? GAME_CONSTANTS.CHALLENGE_WINDOW_SECONDS)
      : currentPhase === GamePhase.BLOCK_WINDOW
        ? (gameConfig?.blockWindowSeconds ?? GAME_CONSTANTS.BLOCK_WINDOW_SECONDS)
        : isMyTurn
          ? (gameConfig?.turnTimerSeconds ?? GAME_CONSTANTS.TURN_TIMER_SECONDS)
          : 0;

  const { remaining, progress, isRunning, start: startTimer, reset: resetTimer } = useCountdown(timerSeconds, false);

  useEffect(() => {
    if (timerSeconds > 0) {
      startTimer();
    } else {
      resetTimer();
    }
  }, [timerSeconds, currentPhase, startTimer, resetTimer]);

  // Auto-accept when timer expires during challenge/block windows
  // Only auto-accept if we can actually respond (not the actor/blocker)
  const autoAcceptedRef = useRef(false);
  const timerHasStartedRef = useRef(false);
  const pendingAction = state.gameState?.pendingAction;
  const amIActor = pendingAction?.actorId === playerId;
  const amIBlocker = pendingAction?.blockerId === playerId;

  useEffect(() => {
    // Reset flags when phase changes
    autoAcceptedRef.current = false;
    timerHasStartedRef.current = false;
  }, [currentPhase]);

  // Track when the timer actually starts running (deferred state update applied)
  useEffect(() => {
    if (isRunning) {
      timerHasStartedRef.current = true;
    }
  }, [isRunning]);

  // Track timer expiration to show consequence
  const timerExpiredRef = useRef(false);
  const [timerExpiredMessage, setTimerExpiredMessage] = useState<ResponseStatus | null>(null);

  useEffect(() => {
    timerExpiredRef.current = false;
    setTimerExpiredMessage(null);
  }, [currentPhase]);

  useEffect(() => {
    // Show timer expiration consequence and auto-accept
    // This prevents a race condition where deferred state updates from
    // startTimer() haven't applied yet (remaining=0, isRunning=false from
    // the previous phase), which would cause immediate auto-accept.
    if (!timerHasStartedRef.current) return;
    if (remaining > 0 || isRunning || autoAcceptedRef.current) return;

    // Compute and show the consequence
    if (!timerExpiredRef.current && currentPhase) {
      timerExpiredRef.current = true;
      const consequence = getTimerExpiredConsequence(currentPhase);
      if (consequence) {
        setTimerExpiredMessage(consequence);
      }
    }

    // Auto-accept if we can respond
    const canRespond =
      (currentPhase === GamePhase.CHALLENGE_WINDOW && !amIActor) ||
      (currentPhase === GamePhase.BLOCK_WINDOW && !amIActor) ||
      (currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW && !amIBlocker);
    if (canRespond) {
      autoAcceptedRef.current = true;
      send({ type: ClientMessageType.ACCEPT, payload: {} });
    }
  }, [remaining, isRunning, currentPhase, send, amIActor, amIBlocker]);

  const gs = state.gameState;
  const currentPlayerName = useMemo(
    () => gs?.players.find((p) => p.id === gs.currentPlayerId)?.name ?? '',
    [gs],
  );

  const winnerName = useMemo(
    () => gs?.players.find((p) => p.id === gs.winnerId)?.name ?? '',
    [gs],
  );

  const isGameOver = currentPhase === GamePhase.GAME_OVER;

  const responseStatus: ResponseStatus | null = useMemo(() => {
    const gameState = state.gameState;
    if (!gameState) return null;

    const pending = gameState.pendingAction;
    const me = gameState.players.find((p) => p.id === playerId);
    const myName = me?.name ?? 'You';

    if (gameState.phase === GamePhase.AWAITING_INFLUENCE_LOSS) {
      const losingPlayer = gameState.players.find((p) => p.id === gameState.awaitingInfluenceLossFrom);
      if (gameState.awaitingInfluenceLossFrom === playerId) {
        return {
          tone: 'danger',
          title: 'Choose Influence To Lose',
          detail: 'Select one of your unrevealed cards to continue the turn.',
        };
      }
      return {
        tone: 'warn',
        title: 'Waiting For Influence Choice',
        detail: `${losingPlayer?.name ?? 'A player'} must reveal a card.`,
      };
    }

    if (gameState.phase === GamePhase.AWAITING_EXCHANGE && pending) {
      const actor = gameState.players.find((p) => p.id === pending.actorId);
      if (pending.actorId === playerId) {
        return {
          tone: 'info',
          title: 'Exchange In Progress',
          detail: 'Pick which cards to keep, then confirm.',
        };
      }
      return {
        tone: 'info',
        title: 'Waiting For Exchange',
        detail: `${actor?.name ?? 'A player'} is choosing exchanged cards.`,
      };
    }

    if (gameState.phase === GamePhase.TURN_START) {
      if (gameState.currentPlayerId === playerId) {
        return {
          tone: 'warn',
          title: 'Your Move',
          detail: 'Choose an action for this turn.',
        };
      }
      const activePlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
      return {
        tone: 'info',
        title: 'Waiting For Turn',
        detail: `${activePlayer?.name ?? 'A player'} is deciding an action.`,
      };
    }

    const isResponseWindow =
      gameState.phase === GamePhase.CHALLENGE_WINDOW ||
      gameState.phase === GamePhase.BLOCK_WINDOW ||
      gameState.phase === GamePhase.BLOCK_CHALLENGE_WINDOW;

    if (!isResponseWindow || !pending) {
      return null;
    }

    const aliveIds = new Set(gameState.players.filter((p) => p.isAlive).map((p) => p.id));
    let eligibleIds: string[] = [];

    if (gameState.phase === GamePhase.CHALLENGE_WINDOW) {
      eligibleIds = gameState.players
        .filter((p) => aliveIds.has(p.id) && p.id !== pending.actorId)
        .map((p) => p.id);
    } else if (gameState.phase === GamePhase.BLOCK_WINDOW) {
      if (pending.targetId) {
        eligibleIds = aliveIds.has(pending.targetId) ? [pending.targetId] : [];
      } else {
        eligibleIds = gameState.players
          .filter((p) => aliveIds.has(p.id) && p.id !== pending.actorId)
          .map((p) => p.id);
      }
    } else if (gameState.phase === GamePhase.BLOCK_CHALLENGE_WINDOW) {
      eligibleIds = gameState.players
        .filter((p) => aliveIds.has(p.id) && p.id !== pending.blockerId)
        .map((p) => p.id);
    }

    const accepted = new Set(pending.acceptedBy);
    const waitingIds = eligibleIds.filter((id) => !accepted.has(id));
    const waitingNames = waitingIds
      .map((id) => gameState.players.find((p) => p.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    if (eligibleIds.includes(playerId) && !accepted.has(playerId)) {
      const actionName = ACTION_RULES[pending.actionType as ActionType]?.label ?? pending.actionType;
      return {
        tone: 'warn',
        title: 'Your Response Is Needed',
        detail: `Decide now: ${pending.actorId === playerId ? myName : actionName}.`,
      };
    }

    if (accepted.has(playerId) && waitingNames.length > 0) {
      return {
        tone: 'ok',
        title: 'Allowed - Waiting For Others',
        detail: waitingNames.join(', '),
      };
    }

    if (waitingNames.length > 0) {
      return {
        tone: 'info',
        title: 'Waiting For Responses',
        detail: waitingNames.join(', '),
      };
    }

    return {
      tone: 'info',
      title: 'Resolving Turn',
      detail: 'Applying final response and updating game state.',
    };
  }, [state.gameState, playerId]);

  const activeCardEffect = useMemo(() => {
    if (!activeEvent) {
      return null;
    }
    if (currentPhase === GamePhase.TURN_START) {
      return null;
    }
    return {
      eventId: activeEvent.id,
      effect: activeEvent.effect,
      accent: activeEvent.accent,
      actorId: activeEvent.actorId,
      targetId: activeEvent.targetId,
      blockerId: activeEvent.blockerId,
    };
  }, [activeEvent, currentPhase]);

  return {
    status,
    send,
    gameState: gs,
    isMyTurn,
    currentPhase,
    currentPlayerName,
    winnerName,
    isGameOver,
    timerRemaining: remaining,
    timerProgress: progress,
    activeEvent,
    activeCardEffect,
    responseStatus: timerExpiredMessage || responseStatus,
    isWinner: state.gameState?.winnerId === playerId,
  };
}
