"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { GameProvider } from "@/context/GameContext";
import { GameBoard } from "@/containers/GameBoard";
import { lobbyKeys, useLobbyLeaderboard } from "@/queries/useLobbyQueries";
import { lobbyService } from "@/services/lobbyService";
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
  const aiReplay = readAiReplayConfig(searchParams);
  const { data: roomLeaderboard = [] } = useLobbyLeaderboard(lobbyId, 8);

  const handlePlayAgain = async () => {
    if (lobbyId && playerId) {
      try {
        await lobbyService.reset(lobbyId);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: lobbyKeys.detail(lobbyId),
          }),
          queryClient.invalidateQueries({ queryKey: lobbyKeys.list() }),
        ]);
      } catch {
        router.push("/");
        return;
      }
      router.push(`/lobby/${lobbyId}?playerId=${playerId}`);
      return;
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
        router.push(`/game/${res.gameId}?${params.toString()}`);
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
        onPlayAgain={handlePlayAgain}
        roomLeaderboard={roomLeaderboard}
      />
    </GameProvider>
  );
}
