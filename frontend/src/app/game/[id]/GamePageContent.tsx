"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { GameProvider } from "@/context/GameContext";
import { GameBoard } from "@/containers/GameBoard";
import {
  lobbyKeys,
  useLobby,
  useLobbyLeaderboard,
} from "@/queries/useLobbyQueries";
import {
  StoredLobbySession,
  lobbyReturnStore,
  lobbyService,
  lobbySessionStore,
} from "@/services/lobbyService";
import { AiDifficulty, GameConfig } from "@/models/lobby";

function readAiReplayConfig(searchParams: ReturnType<typeof useSearchParams>) {
  if (searchParams.get("ai") !== "1") {
    return null;
  }

  const playerName = searchParams.get("playerName") ?? "";
  const botCount = Number(searchParams.get("botCount") ?? "0");
  const difficulty = (searchParams.get("difficulty") ??
    "medium") as AiDifficulty;
  const config: GameConfig = {
    turnTimerSeconds: Number(searchParams.get("turnTimerSeconds") ?? "30"),
    challengeWindowSeconds: Number(
      searchParams.get("challengeWindowSeconds") ?? "10",
    ),
    blockWindowSeconds: Number(searchParams.get("blockWindowSeconds") ?? "10"),
    startingCoins: Number(searchParams.get("startingCoins") ?? "2"),
  };

  if (!playerName || botCount < 1 || botCount > 5) {
    return null;
  }

  return { playerName, botCount, difficulty, config };
}

export function GamePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const gameId = params.id as string;
  const playerId = searchParams.get("playerId") ?? "";
  const lobbyId = searchParams.get("lobbyId") ?? "";
  const [lobbySession, setLobbySession] = useState<StoredLobbySession | null>(
    null,
  );
  const [hasResolvedLobbySession, setHasResolvedLobbySession] = useState(
    !lobbyId,
  );
  const aiReplay = readAiReplayConfig(searchParams);
  const { data: lobbyResponse } = useLobby(
    lobbyId,
    lobbySession?.sessionToken,
    {
      enabled: Boolean(lobbyId) && hasResolvedLobbySession,
    },
  );
  const { data: roomLeaderboard = [] } = useLobbyLeaderboard(lobbyId, 8);
  const resolvedLobbyPlayerId =
    lobbyResponse?.playerId ?? lobbySession?.playerId ?? playerId;
  const isLobbyHost = useMemo(
    () =>
      Boolean(
        lobbyId &&
          resolvedLobbyPlayerId &&
          (lobbyResponse?.lobby.players.some(
            (player) =>
              player.id === resolvedLobbyPlayerId && player.isHost,
          ) ||
            (lobbySession?.playerId === resolvedLobbyPlayerId &&
              lobbySession?.isHost === true)),
      ),
    [lobbyId, lobbyResponse?.lobby.players, lobbySession, resolvedLobbyPlayerId],
  );
  const showPlayAgainAction = lobbyId ? true : Boolean(aiReplay);
  const playAgainLabel = lobbyId ? "Back To Lobby" : "Play Again";

  useEffect(() => {
    if (!lobbyId) {
      setLobbySession(null);
      setHasResolvedLobbySession(true);
      return;
    }

    setLobbySession(lobbySessionStore.read(lobbyId));
    setHasResolvedLobbySession(true);
  }, [lobbyId]);

  useEffect(() => {
    if (
      !lobbyId ||
      !lobbyResponse ||
      lobbyResponse.lobby.status !== "waiting" ||
      lobbyResponse.lobby.gameId
    ) {
      return;
    }

    const targetPlayerId =
      lobbyResponse.playerId ?? lobbySession?.playerId ?? playerId;
    router.replace(`/lobby/${lobbyId}?playerId=${targetPlayerId}`);
  }, [
    lobbyId,
    lobbyResponse,
    lobbySession?.playerId,
    playerId,
    router,
  ]);

  const handlePlayAgain = async () => {
    if (lobbyId && playerId) {
      lobbyReturnStore.save(lobbyId);

      if (!isLobbyHost) {
        router.replace(`/lobby/${lobbyId}?playerId=${playerId}`);
        return;
      }

      try {
        const resetLobby = await lobbyService.reset(lobbyId, {
          playerId,
          sessionToken: lobbySession?.sessionToken,
        });
        queryClient.setQueryData(
          [...lobbyKeys.detail(lobbyId), lobbySession?.sessionToken ?? "anonymous"],
          {
            lobby: resetLobby,
            playerId,
            sessionToken: lobbySession?.sessionToken ?? null,
          },
        );
        if (lobbySession?.sessionToken) {
          lobbySessionStore.save(
            lobbyId,
            playerId,
            lobbySession.sessionToken,
            lobbySession.playerName,
            resetLobby.players.find((player) => player.id === playerId)?.isHost ??
              lobbySession.isHost,
          );
        }
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: lobbyKeys.detail(lobbyId),
          }),
          queryClient.invalidateQueries({ queryKey: lobbyKeys.list() }),
        ]);
        lobbyReturnStore.clear(lobbyId);
        router.replace(`/lobby/${lobbyId}?playerId=${playerId}`);
        return;
      } catch (error) {
        lobbyReturnStore.clear(lobbyId);
        throw error;
      }
    }

    if (aiReplay) {
      try {
        const res = await lobbyService.createAiMatch(aiReplay);
        const params = new URLSearchParams({
          playerId: res.playerId,
          ai: "1",
          playerName: aiReplay.playerName,
          botCount: String(aiReplay.botCount),
          difficulty: aiReplay.difficulty,
          turnTimerSeconds: String(aiReplay.config.turnTimerSeconds),
          challengeWindowSeconds: String(
            aiReplay.config.challengeWindowSeconds,
          ),
          blockWindowSeconds: String(aiReplay.config.blockWindowSeconds),
          startingCoins: String(aiReplay.config.startingCoins),
        });
        router.replace(`/game/${res.gameId}?${params.toString()}`);
        return;
      } catch {
        router.push("/");
        return;
      }
    }

    router.push("/");
  };

  return (
    <GameProvider>
      <GameBoard
        gameId={gameId}
        playerId={playerId}
        lobbyId={lobbyId}
        onPlayAgain={handlePlayAgain}
        showPlayAgainAction={showPlayAgainAction}
        playAgainLabel={playAgainLabel}
        roomLeaderboard={roomLeaderboard}
      />
    </GameProvider>
  );
}
