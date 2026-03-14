import {
  GamePhase,
  type GameStatePrivate,
  type GameStatePublic,
} from "@/models/game";

type GameStateLike = GameStatePublic | GameStatePrivate | null | undefined;

export function getEligibleResponderIds(gameState: GameStateLike): string[] {
  if (!gameState?.pendingAction) {
    return [];
  }

  const aliveIds = new Set(
    gameState.players
      .filter((player) => player.isAlive)
      .map((player) => player.id),
  );
  const { actorId, blockerId, targetId } = gameState.pendingAction;

  if (gameState.phase === GamePhase.CHALLENGE_WINDOW) {
    if (targetId) {
      return aliveIds.has(targetId) ? [targetId] : [];
    }
    return gameState.players
      .filter((player) => player.isAlive && player.id !== actorId)
      .map((player) => player.id);
  }

  if (gameState.phase === GamePhase.BLOCK_WINDOW) {
    if (targetId) {
      return aliveIds.has(targetId) ? [targetId] : [];
    }
    return gameState.players
      .filter((player) => player.isAlive && player.id !== actorId)
      .map((player) => player.id);
  }

  if (gameState.phase === GamePhase.BLOCK_CHALLENGE_WINDOW) {
    return actorId && aliveIds.has(actorId) && blockerId !== actorId
      ? [actorId]
      : [];
  }

  return [];
}

export function isPlayerEligibleForCurrentResponse(
  gameState: GameStateLike,
  playerId: string,
): boolean {
  return getEligibleResponderIds(gameState).includes(playerId);
}
