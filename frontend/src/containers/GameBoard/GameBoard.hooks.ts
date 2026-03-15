import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameContext, type GameLogSegment } from "@/context/GameContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAnimationQueue } from "@/hooks/useAnimationQueue";
import { ServerMessage, ServerMessageType } from "@/models/websocket-message";
import { GamePhase } from "@/models/game";
import { GameConfig } from "@/models/lobby";
import {
  ACTION_PRESENTATIONS,
  ACTION_RULES,
  ActionType,
} from "@/models/action";
import { GAME_CONSTANTS } from "@/utils/constants";
import { getEligibleResponderIds } from "@/utils/responseWindows";

export interface GameEvent {
  accent: string;
  effect:
    | "coins"
    | "slash"
    | "shield"
    | "swap"
    | "impact"
    | "reveal"
    | "challenge"
    | "victory";
  message: string;
  symbol: string;
  title: string;
  type: "action" | "challenge" | "block" | "elimination" | "turn" | "system";
  id: number;
  actorId?: string;
  targetId?: string;
  blockerId?: string;
  compactMessage?: string;
}

export interface ResponseStatus {
  tone: "danger" | "warn" | "info" | "ok";
  title: string;
  detail: string;
}

export interface ReturnToLobbyState {
  lobbyId: string;
  config?: GameConfig;
}

let eventIdCounter = 0;
const ACTION_EVENT_DURATION_MS = 2400;
const ACTION_EVENT_GAP_MS = 70;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getActionPresentation(actionType: string) {
  const rule = ACTION_RULES[actionType as ActionType];
  const presentation = ACTION_PRESENTATIONS[actionType as ActionType];
  if (!rule || !presentation) {
    return {
      accent: "#90A4AE",
      effect: "challenge" as const,
      symbol: actionType.replace(/_/g, " ").slice(0, 6).toUpperCase(),
      title: actionType.replace(/_/g, " "),
    };
  }

  return {
    accent: presentation.accent,
    effect:
      actionType === ActionType.EXCHANGE
        ? ("swap" as const)
        : actionType === ActionType.ASSASSINATE
          ? ("slash" as const)
          : actionType === ActionType.COUP
            ? ("impact" as const)
            : ("coins" as const),
    symbol:
      actionType === ActionType.INCOME
        ? "+1"
        : actionType === ActionType.FOREIGN_AID
          ? "+2"
          : actionType === ActionType.TAX
            ? "+3"
            : actionType === ActionType.STEAL
              ? "2C"
              : actionType === ActionType.EXCHANGE
                ? "SWAP"
                : actionType === ActionType.ASSASSINATE
                  ? "HIT"
                  : actionType === ActionType.COUP
                    ? "KO"
                    : rule.label.slice(0, 4).toUpperCase(),
    title: rule.label,
  };
}

function playerSegment(text: string): GameLogSegment {
  return { text, tone: "player" };
}

function actionSegment(text: string): GameLogSegment {
  return { text, tone: "action" };
}

function cardSegment(text: string): GameLogSegment {
  return { text, tone: "card" };
}

function plainSegment(text: string): GameLogSegment {
  return { text, tone: "plain" };
}

function errorSegment(text: string): GameLogSegment {
  return { text, tone: "error" };
}

function buildLogMessage(segments: GameLogSegment[]) {
  return segments.map((segment) => segment.text).join("");
}

function formatActionLogSegments(
  actionType: string,
  actorName: string,
  targetName: string,
) {
  const rule = ACTION_RULES[actionType as ActionType];
  let segments: GameLogSegment[];

  if (!rule) {
    segments = targetName
      ? [
          playerSegment(actorName),
          plainSegment(" acted on "),
          playerSegment(targetName),
          plainSegment("."),
        ]
      : [playerSegment(actorName), plainSegment(" took an action.")];

    return { message: buildLogMessage(segments), segments };
  }

  switch (actionType) {
    case ActionType.INCOME:
      segments = [
        playerSegment(actorName),
        plainSegment(" took "),
        actionSegment("Income"),
        plainSegment("."),
      ];
      break;
    case ActionType.FOREIGN_AID:
      segments = [
        playerSegment(actorName),
        plainSegment(" took "),
        actionSegment("Foreign Aid"),
        plainSegment("."),
      ];
      break;
    case ActionType.COUP:
      segments = [
        playerSegment(actorName),
        plainSegment(" launched "),
        actionSegment("Coup"),
        plainSegment(" on "),
        playerSegment(targetName),
        plainSegment("."),
      ];
      break;
    case ActionType.TAX:
      segments = [
        playerSegment(actorName),
        plainSegment(" used "),
        actionSegment("Tax"),
        plainSegment("."),
      ];
      break;
    case ActionType.ASSASSINATE:
      segments = [
        playerSegment(actorName),
        plainSegment(" used "),
        actionSegment("Assassinate"),
        plainSegment(" on "),
        playerSegment(targetName),
        plainSegment("."),
      ];
      break;
    case ActionType.STEAL:
      segments = [
        playerSegment(actorName),
        plainSegment(" used "),
        actionSegment("Steal"),
        plainSegment(" on "),
        playerSegment(targetName),
        plainSegment("."),
      ];
      break;
    case ActionType.EXCHANGE:
      segments = [
        playerSegment(actorName),
        plainSegment(" used "),
        actionSegment("Exchange"),
        plainSegment("."),
      ];
      break;
    default:
      segments = targetName
        ? [
            playerSegment(actorName),
            plainSegment(" used "),
            actionSegment(rule.label),
            plainSegment(" on "),
            playerSegment(targetName),
            plainSegment("."),
          ]
        : [
            playerSegment(actorName),
            plainSegment(" used "),
            actionSegment(rule.label),
            plainSegment("."),
          ];
  }

  return { message: buildLogMessage(segments), segments };
}

function getTimerExpiredConsequence(phase: GamePhase): ResponseStatus | null {
  switch (phase) {
    case GamePhase.CHALLENGE_WINDOW:
      return {
        tone: "ok",
        title: "⏱ Time Expired",
        detail: "No one challenged — the action succeeds.",
      };
    case GamePhase.BLOCK_WINDOW:
      return {
        tone: "ok",
        title: "⏱ Time Expired",
        detail: "No one blocked — the action proceeds.",
      };
    case GamePhase.BLOCK_CHALLENGE_WINDOW:
      return {
        tone: "ok",
        title: "⏱ Time Expired",
        detail: "Block not challenged — it stands.",
      };
    case GamePhase.TURN_START:
      return {
        tone: "warn",
        title: "⏱ Time Expired",
        detail: "Turn ended — no action was taken.",
      };
    default:
      return null;
  }
}

export function useGameBoard(gameId: string, playerId: string) {
  const { state, dispatch, isMyTurn, currentPhase } = useGameContext();
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [returnToLobby, setReturnToLobby] =
    useState<ReturnToLobbyState | null>(null);
  const mountedRef = useRef(true);
  const { enqueue, clear } = useAnimationQueue();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clear();
    };
  }, [clear]);

  const queueEvent = useCallback(
    (event: Omit<GameEvent, "id">) => {
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
    },
    [enqueue],
  );

  const queuePriorityEvent = useCallback(
    (event: Omit<GameEvent, "id">) => {
      clear();
      queueEvent(event);
    },
    [clear, queueEvent],
  );

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case ServerMessageType.GAME_STATE:
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          if (msg.privateState) {
            dispatch({
              type: "SET_PRIVATE_STATE",
              payload: {
                myCards: msg.privateState.myCards,
                exchangeCards: msg.privateState.exchangeCards,
              },
            });
          }
          break;
        case ServerMessageType.PRIVATE_STATE:
          if (msg.privateState) {
            dispatch({ type: "SET_GAME_STATE", payload: msg.privateState });
            dispatch({
              type: "SET_PRIVATE_STATE",
              payload: {
                myCards: msg.privateState.myCards,
                exchangeCards: msg.privateState.exchangeCards,
              },
            });
          }
          break;
        case ServerMessageType.ACTION_DECLARED:
          {
            const actorName = String(msg.payload.actorName ?? "");
            const actionType = String(msg.payload.actionType ?? "");
            const targetName = String(msg.payload.targetName ?? "");
            const presentation = getActionPresentation(actionType);
            const text = targetName
              ? `${actorName} plays ${presentation.title} on ${targetName}`
              : `${actorName} plays ${presentation.title}`;
            queueEvent({
              accent: presentation.accent,
              effect: presentation.effect,
              message: text,
              compactMessage: text,
              symbol: presentation.symbol,
              title: presentation.title,
              type: "action",
              actorId: String(msg.payload.actorId ?? ""),
              targetId: targetName
                ? String(msg.payload.targetId ?? "")
                : undefined,
            });
            dispatch({
              type: "ADD_LOG",
              payload: {
                ...formatActionLogSegments(actionType, actorName, targetName),
                type: "action",
                actionType: actionType as ActionType,
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.CHALLENGE_ISSUED:
          {
            const name = String(msg.payload.challengerName ?? "");
            const challenged = String(msg.payload.challengedPlayerName ?? "");
            const actionType = String(msg.payload.actionType ?? "");
            const blockingCharacter = String(
              msg.payload.blockingCharacter ?? "",
            );
            const window = String(msg.payload.window ?? "");
            const actionLabel =
              ACTION_RULES[actionType as ActionType]?.label ?? actionType;
            const segments =
              window === GamePhase.BLOCK_CHALLENGE_WINDOW
                ? [
                    playerSegment(name),
                    plainSegment(" challenged "),
                    playerSegment(challenged),
                    plainSegment("'s "),
                    cardSegment(blockingCharacter),
                    plainSegment(" block."),
                  ]
                : [
                    playerSegment(name),
                    plainSegment(" challenged "),
                    playerSegment(challenged),
                    plainSegment("'s "),
                    actionSegment(actionLabel),
                    plainSegment("."),
                  ];
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage(segments),
                segments,
                type: "challenge",
                actionType: actionType as ActionType,
              },
            });
          }
          break;
        case ServerMessageType.CHALLENGE_RESULT:
          {
            const won = msg.payload.success ?? msg.payload.challengerWon;
            const challengerName = String(msg.payload.challengerName ?? "");
            const challenged = String(msg.payload.challengedPlayerName ?? "");
            const actionType = String(msg.payload.actionType ?? "");
            const blockingCharacter = String(
              msg.payload.blockingCharacter ?? "",
            );
            const window = String(msg.payload.window ?? "");
            const subject =
              window === GamePhase.BLOCK_CHALLENGE_WINDOW
                ? `${challenged}'s ${blockingCharacter} block`
                : `${challenged}'s ${ACTION_RULES[actionType as ActionType]?.label ?? actionType}`;
            const text = won
              ? `${challengerName} won the challenge against ${subject}.`
              : `${challengerName} lost the challenge against ${subject}.`;
            queueEvent({
              accent: won ? "#EF4444" : "#10B981",
              effect: "challenge",
              message: won ? "The bluff collapses" : "The bluff stands",
              compactMessage: text,
              symbol: won ? "WIN" : "SAFE",
              title: text,
              type: "challenge",
            });
            const segments =
              window === GamePhase.BLOCK_CHALLENGE_WINDOW
                ? [
                    playerSegment(challengerName),
                    plainSegment(
                      won
                        ? " won the challenge against "
                        : " lost the challenge against ",
                    ),
                    playerSegment(challenged),
                    plainSegment("'s "),
                    cardSegment(blockingCharacter),
                    plainSegment(" block."),
                  ]
                : [
                    playerSegment(challengerName),
                    plainSegment(
                      won
                        ? " won the challenge against "
                        : " lost the challenge against ",
                    ),
                    playerSegment(challenged),
                    plainSegment("'s "),
                    actionSegment(
                      ACTION_RULES[actionType as ActionType]?.label ?? actionType,
                    ),
                    plainSegment("."),
                  ];
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage(segments),
                segments,
                type: "challenge",
                actionType: actionType as ActionType,
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.BLOCK_DECLARED:
          {
            const blockerName = String(msg.payload.blockerName ?? "");
            const char = String(
              msg.payload.character ?? msg.payload.blockingCharacter ?? "",
            );
            const actorId = String(msg.payload.actorId ?? "");
            const actorName =
              state.gameState?.players.find((player) => player.id === actorId)
                ?.name ?? "The acting player";
            const actionType = String(msg.payload.actionType ?? "");
            const actionLabel =
              ACTION_RULES[actionType as ActionType]?.label ?? actionType;
            const text = `${blockerName} blocked ${actorName}'s ${actionLabel} with ${char}.`;
            queueEvent({
              accent: "#C084FC",
              effect: "shield",
              message: blockerName
                ? `${blockerName} steps in`
                : "A defense is declared",
              compactMessage: text,
              symbol: "BLOCK",
              title: char ? `${char} block` : "Block",
              type: "block",
              blockerId: String(msg.payload.blockerId ?? ""),
            });
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage([
                  playerSegment(blockerName),
                  plainSegment(" blocked "),
                  playerSegment(actorName),
                  plainSegment("'s "),
                  actionSegment(actionLabel),
                  plainSegment(" with "),
                  cardSegment(char),
                  plainSegment("."),
                ]),
                segments: [
                  playerSegment(blockerName),
                  plainSegment(" blocked "),
                  playerSegment(actorName),
                  plainSegment("'s "),
                  actionSegment(actionLabel),
                  plainSegment(" with "),
                  cardSegment(char),
                  plainSegment("."),
                ],
                type: "block",
                actionType: actionType as ActionType,
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.INFLUENCE_LOST:
          {
            const name = String(msg.payload.playerName ?? "");
            const char = String(msg.payload.character ?? "");
            const text = `${name} revealed ${char}.`;
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: text,
                segments: [
                  playerSegment(name),
                  plainSegment(" revealed "),
                  cardSegment(char),
                  plainSegment("."),
                ],
                type: "reveal",
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.PLAYER_ELIMINATED:
          {
            const name = String(msg.payload.playerName ?? "");
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage([
                  playerSegment(name),
                  plainSegment(" was eliminated from the table."),
                ]),
                segments: [
                  playerSegment(name),
                  plainSegment(" was eliminated from the table."),
                ],
                type: "elimination",
              },
            });
          }
          break;
        case ServerMessageType.TURN_CHANGED:
          {
            const name = String(msg.payload.playerName ?? "");
            const turn = Number(msg.payload.turnNumber ?? 0);
            const currentPlayerId = String(msg.payload.playerId ?? "");
            // Trust GAME_STATE when present to avoid one-tick stale turn UI.
            if (currentPlayerId && !msg.gameState) {
              dispatch({
                type: "UPDATE_TURN",
                payload: {
                  currentPlayerId,
                  turnNumber: turn,
                },
              });
            }
            // Clear queued-but-not-yet-shown events when the turn advances.
            // Do NOT nullify the currently-displaying event — let it finish naturally.
            clear();
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage([
                  plainSegment(`Turn ${turn} · `),
                  playerSegment(name),
                  plainSegment(" to act"),
                ]),
                segments: [
                  plainSegment(`Turn ${turn} · `),
                  playerSegment(name),
                  plainSegment(" to act"),
                ],
                type: "turn",
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.GAME_OVER:
          {
            const name = String(msg.payload.winnerName ?? "");
            queuePriorityEvent({
              accent: "#FBBF24",
              effect: "victory",
              message: `${name} takes the table`,
              symbol: "WIN",
              title: "Game over",
              type: "system",
            });
            dispatch({
              type: "ADD_LOG",
              payload: {
                message: buildLogMessage([
                  playerSegment(name),
                  plainSegment(" won the table."),
                ]),
                segments: [
                  playerSegment(name),
                  plainSegment(" won the table."),
                ],
                type: "system",
              },
            });
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.ERROR:
          {
            const errorMsg = String(msg.payload.message ?? "");
            const isStalePhaseError =
              errorMsg.includes("Not your turn") ||
              errorMsg.includes("Cannot accept in phase") ||
              errorMsg.includes("Cannot challenge in current phase") ||
              errorMsg.includes("Cannot block in current phase") ||
              errorMsg.includes("Cannot take action in current phase") ||
              errorMsg.includes("Not in a challenge window phase") ||
              errorMsg.includes("Not in block window phase");
            if (!isStalePhaseError) {
              dispatch({
                type: "ADD_LOG",
                payload: {
                  message: buildLogMessage([
                    errorSegment("Error"),
                    plainSegment(`: ${errorMsg}`),
                  ]),
                  segments: [
                    errorSegment("Error"),
                    plainSegment(`: ${errorMsg}`),
                  ],
                  type: "system",
                },
              });
            }
          }
          break;
        case ServerMessageType.PLAYER_LEFT:
          {
            const disconnectedPlayerId = String(msg.payload.playerId ?? "");
            const disconnectedPlayer = state.gameState?.players.find(
              (p) => p.id === disconnectedPlayerId,
            );
            if (disconnectedPlayer) {
              dispatch({
                type: "ADD_LOG",
                payload: {
                  message: buildLogMessage([
                    playerSegment(disconnectedPlayer.name),
                    plainSegment(" disconnected"),
                  ]),
                  segments: [
                    playerSegment(disconnectedPlayer.name),
                    plainSegment(" disconnected"),
                  ],
                  type: "system",
                },
              });
            }
          }
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
          break;
        case ServerMessageType.RETURN_TO_LOBBY:
          {
            const lobbyId = String(msg.payload.lobbyId ?? "");
            if (lobbyId) {
              setReturnToLobby({
                lobbyId,
                config: (msg.payload.config as GameConfig | undefined) ?? undefined,
              });
            }
          }
          break;
        default:
          if (msg.gameState)
            dispatch({ type: "SET_GAME_STATE", payload: msg.gameState });
      }
    },
    [dispatch, queueEvent, queuePriorityEvent, clear, state.gameState?.players],
  );

  const { status, send } = useWebSocket({ gameId, playerId, onMessage });

  useEffect(() => {
    dispatch({ type: "SET_MY_PLAYER_ID", payload: playerId });
  }, [dispatch, playerId]);

  // Timer for challenge/block windows — prefer game config, fall back to constants
  const gameConfig = state.gameState?.config;
  const timerSeconds =
    currentPhase === GamePhase.CHALLENGE_WINDOW ||
    currentPhase === GamePhase.BLOCK_CHALLENGE_WINDOW
      ? (gameConfig?.challengeWindowSeconds ??
        GAME_CONSTANTS.CHALLENGE_WINDOW_SECONDS)
      : currentPhase === GamePhase.BLOCK_WINDOW
        ? (gameConfig?.blockWindowSeconds ??
          GAME_CONSTANTS.BLOCK_WINDOW_SECONDS)
        : isMyTurn
          ? (gameConfig?.turnTimerSeconds ?? GAME_CONSTANTS.TURN_TIMER_SECONDS)
          : 0;

  const phaseStartedAt = state.gameState?.phaseStartedAt ?? null;
  const phaseDeadlineAt = state.gameState?.phaseDeadlineAt ?? null;
  const [clockNow, setClockNow] = useState(() => Date.now());

  useEffect(() => {
    if (timerSeconds <= 0 || !phaseDeadlineAt) {
      setClockNow(Date.now());
      return undefined;
    }

    setClockNow(Date.now());
    const intervalId = window.setInterval(() => {
      setClockNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [phaseDeadlineAt, timerSeconds]);

  const remaining = useMemo(() => {
    if (timerSeconds <= 0 || !phaseDeadlineAt) {
      return 0;
    }

    const deadlineMs = Date.parse(phaseDeadlineAt);
    if (Number.isNaN(deadlineMs)) {
      return 0;
    }

    return Math.max(0, Math.ceil((deadlineMs - clockNow) / 1000));
  }, [clockNow, phaseDeadlineAt, timerSeconds]);

  const progress = useMemo(() => {
    if (timerSeconds <= 0 || !phaseDeadlineAt) {
      return 0;
    }

    const deadlineMs = Date.parse(phaseDeadlineAt);
    const startedMs = phaseStartedAt ? Date.parse(phaseStartedAt) : Number.NaN;
    if (Number.isNaN(deadlineMs)) {
      return 0;
    }

    const totalMs = Number.isNaN(startedMs)
      ? timerSeconds * 1000
      : Math.max(deadlineMs - startedMs, 1);
    return Math.min(1, Math.max(0, (deadlineMs - clockNow) / totalMs));
  }, [clockNow, phaseDeadlineAt, phaseStartedAt, timerSeconds]);

  const isRunning =
    timerSeconds > 0 && Boolean(phaseDeadlineAt) && remaining > 0;

  // Track timer expiration to show consequence
  const timerExpiredRef = useRef(false);
  const [timerExpiredMessage, setTimerExpiredMessage] =
    useState<ResponseStatus | null>(null);

  useEffect(() => {
    timerExpiredRef.current = false;
    setTimerExpiredMessage(null);
  }, [currentPhase, phaseDeadlineAt]);

  useEffect(() => {
    if (timerSeconds <= 0 || !phaseDeadlineAt || remaining > 0 || isRunning)
      return;

    if (!timerExpiredRef.current && currentPhase) {
      timerExpiredRef.current = true;
      const consequence = getTimerExpiredConsequence(currentPhase);
      if (consequence) {
        setTimerExpiredMessage(consequence);
      }
    }
  }, [currentPhase, isRunning, phaseDeadlineAt, remaining, timerSeconds]);

  const gs = state.gameState;
  const currentPlayerName = useMemo(
    () => gs?.players.find((p) => p.id === gs.currentPlayerId)?.name ?? "",
    [gs],
  );

  const winnerName = useMemo(
    () =>
      gs?.players.find((p) => p.id === gs.winnerId)?.name ??
      gs?.players.find((p) => p.isAlive)?.name ??
      "",
    [gs],
  );

  const isGameOver =
    currentPhase === GamePhase.GAME_OVER ||
    Boolean(gs?.winnerId) ||
    ((gs?.players.filter((player) => player.isAlive).length ?? 0) <= 1 &&
      (gs?.players.length ?? 0) > 0);

  const responseStatus: ResponseStatus | null = useMemo(() => {
    const gameState = state.gameState;
    if (!gameState) return null;

    const alivePlayers = gameState.players.filter((player) => player.isAlive);
    const inferredGameOver =
      gameState.phase === GamePhase.GAME_OVER ||
      Boolean(gameState.winnerId) ||
      (alivePlayers.length <= 1 && gameState.players.length > 0);
    const resolvedWinnerName =
      gameState.players.find((p) => p.id === gameState.winnerId)?.name ??
      alivePlayers[0]?.name ??
      winnerName;

    if (inferredGameOver) {
      return {
        tone: "ok",
        title: "Game Over",
        detail: `${resolvedWinnerName || "A player"} wins the table.`,
      };
    }

    const pending = gameState.pendingAction;
    const actor = pending
      ? gameState.players.find((p) => p.id === pending.actorId)
      : null;
    const blocker = pending?.blockerId
      ? gameState.players.find((p) => p.id === pending.blockerId)
      : null;
    const target = pending?.targetId
      ? gameState.players.find((p) => p.id === pending.targetId)
      : null;
    const actionLabel = pending
      ? (ACTION_RULES[pending.actionType as ActionType]?.label ??
        pending.actionType)
      : "";

    if (gameState.phase === GamePhase.AWAITING_INFLUENCE_LOSS) {
      const losingPlayer = gameState.players.find(
        (p) => p.id === gameState.awaitingInfluenceLossFrom,
      );
      if (gameState.awaitingInfluenceLossFrom === playerId) {
        return {
          tone: "danger",
          title: "Choose Influence To Lose",
          detail:
            "You were hit. Reveal one unrevealed card to continue the turn.",
        };
      }
      return {
        tone: "warn",
        title: "Waiting For Influence Choice",
        detail: `${losingPlayer?.name ?? "A player"} must reveal a card.`,
      };
    }

    if (gameState.phase === GamePhase.AWAITING_EXCHANGE && pending) {
      const actor = gameState.players.find((p) => p.id === pending.actorId);
      if (pending.actorId === playerId) {
        return {
          tone: "info",
          title: "Exchange In Progress",
          detail: "Pick which cards to keep, then confirm.",
        };
      }
      return {
        tone: "info",
        title: "Waiting For Exchange",
        detail: `${actor?.name ?? "A player"} is choosing exchanged cards.`,
      };
    }

    if (gameState.phase === GamePhase.TURN_START) {
      if (gameState.currentPlayerId === playerId) {
        return {
          tone: "warn",
          title: "Your Move",
          detail:
            "Choose an action. Targeted moves will let you pick a player on the board next.",
        };
      }
      const activePlayer = gameState.players.find(
        (p) => p.id === gameState.currentPlayerId,
      );
      return {
        tone: "info",
        title: "Waiting For Turn",
        detail: `${activePlayer?.name ?? "A player"} is deciding an action.`,
      };
    }

    const isResponseWindow =
      gameState.phase === GamePhase.CHALLENGE_WINDOW ||
      gameState.phase === GamePhase.BLOCK_WINDOW ||
      gameState.phase === GamePhase.BLOCK_CHALLENGE_WINDOW;

    if (!isResponseWindow || !pending) {
      return null;
    }

    const eligibleIds = getEligibleResponderIds(gameState);

    const accepted = new Set(pending.acceptedBy);
    const waitingIds = eligibleIds.filter((id) => !accepted.has(id));
    const waitingNames = waitingIds
      .map((id) => gameState.players.find((p) => p.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    if (eligibleIds.includes(playerId) && !accepted.has(playerId)) {
      if (gameState.phase === GamePhase.BLOCK_CHALLENGE_WINDOW) {
        return {
          tone: "warn",
          title: "Challenge Or Allow The Block",
          detail: `${blocker?.name ?? "A player"} says they have ${pending.blockerCharacter ?? "a blocking card"} to stop ${actor?.name ?? "the action"}.`,
        };
      }
      if (gameState.phase === GamePhase.BLOCK_WINDOW) {
        return {
          tone: "warn",
          title: "Block Or Allow",
          detail: `${actor?.name ?? "A player"} declared ${actionLabel}${target ? ` against ${target.name}` : ""}. Decide now.`,
        };
      }
      return {
        tone: "warn",
        title: "Your Response Is Needed",
        detail: `${actor?.name ?? "A player"} declared ${actionLabel}${target ? ` targeting ${target.name}` : ""}. Challenge or allow it.`,
      };
    }

    if (accepted.has(playerId) && waitingNames.length > 0) {
      return {
        tone: "ok",
        title: "Response Sent",
        detail: "Resolving the current window.",
      };
    }

    if (waitingNames.length > 0) {
      return {
        tone: "info",
        title: "Waiting For Responses",
        detail:
          waitingNames.length === 1
            ? `Waiting on ${waitingNames[0]}.`
            : `${actor?.name ?? "A player"} declared ${actionLabel}. Waiting on ${waitingNames.join(", ")}.`,
      };
    }

    return {
      tone: "info",
      title: "Resolving Turn",
      detail: "Applying final response and updating game state.",
    };
  }, [state.gameState, playerId, winnerName]);

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
    returnToLobby,
  };
}
