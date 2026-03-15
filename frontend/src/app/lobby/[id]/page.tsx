"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useLobby,
  useLobbyLeaderboard,
  useStartGame,
} from "@/queries/useLobbyQueries";
import { useLobbyContext } from "@/context/LobbyContext";
import { LobbyRoom } from "@/containers/LobbyRoom";
import { PreGameConfig } from "@/components/PreGameConfig";
import { CoupBackgroundSVG } from "@/components/CoupBackgroundSVG";
import { GameConfig } from "@/models/lobby";
import {
  lobbyConfigStore,
  lobbyReturnStore,
  lobbyService,
  lobbySessionStore,
} from "@/services/lobbyService";
import { ApiError } from "@/services/api";
import { tokens } from "@/theme/tokens";

const DEFAULT_LOBBY_CONFIG: GameConfig = {
  turnTimerSeconds: 30,
  challengeWindowSeconds: 10,
  blockWindowSeconds: 10,
  startingCoins: 2,
  botCount: 0,
  botDifficulty: "medium",
};

export default function LobbyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const lobbyId = params.id as string;
  const playerIdParam = searchParams.get("playerId");

  const { state, dispatch } = useLobbyContext();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [savedPlayerName, setSavedPlayerName] = useState("");
  const [hasResolvedSession, setHasResolvedSession] = useState(false);
  const [showSeatRecovery, setShowSeatRecovery] = useState(false);
  const [isWaitingForLobbyReset, setIsWaitingForLobbyReset] = useState(false);
  const [isStartingGameLocally, setIsStartingGameLocally] = useState(false);
  const [isNavigatingToGame, setIsNavigatingToGame] = useState(false);
  const {
    data: lobbyResponse,
    isLoading,
    isError,
    error,
  } = useLobby(lobbyId, sessionToken, { enabled: hasResolvedSession });
  const isLobbyMissing = error instanceof ApiError && error.status === 404;
  const { data: leaderboard = [] } = useLobbyLeaderboard(lobbyId, 6, {
    enabled: hasResolvedSession && !isLobbyMissing,
  });
  const startGame = useStartGame();
  const [showConfig, setShowConfig] = useState(false);
  const [savedConfig, setSavedConfig] = useState<GameConfig>(DEFAULT_LOBBY_CONFIG);

  const lobby = lobbyResponse?.lobby ?? null;
  const activePlayer = useMemo(
    () =>
      lobby && state.myPlayerId
        ? lobby.players.find((player) => player.id === state.myPlayerId) ?? null
        : null,
    [lobby, state.myPlayerId],
  );

  useEffect(() => {
    const storedSession = lobbySessionStore.read(lobbyId);
    const storedConfig = lobbyConfigStore.read(lobbyId);
    setSessionToken(storedSession?.sessionToken ?? null);
    setSavedPlayerName(storedSession?.playerName ?? "");
    setSavedConfig(storedConfig ?? DEFAULT_LOBBY_CONFIG);
    setIsWaitingForLobbyReset(lobbyReturnStore.read(lobbyId));

    if (
      !playerIdParam &&
      storedSession?.playerId &&
      state.myPlayerId !== storedSession.playerId
    ) {
      dispatch({ type: "SET_MY_PLAYER_ID", payload: storedSession.playerId });
    }
    setHasResolvedSession(true);
  }, [dispatch, lobbyId, playerIdParam, state.myPlayerId]);

  // Set playerId from URL param (creator redirect or join redirect)
  useEffect(() => {
    if (playerIdParam && state.myPlayerId !== playerIdParam) {
      dispatch({ type: "SET_MY_PLAYER_ID", payload: playerIdParam });
    }
  }, [playerIdParam, state.myPlayerId, dispatch]);

  useEffect(() => {
    if (
      lobbyResponse?.playerId &&
      state.myPlayerId !== lobbyResponse.playerId
    ) {
      dispatch({ type: "SET_MY_PLAYER_ID", payload: lobbyResponse.playerId });
    }
  }, [dispatch, lobbyResponse?.playerId, state.myPlayerId]);

  // Keep lobby in sync
  useEffect(() => {
    if (lobby) dispatch({ type: "SET_LOBBY", payload: lobby });
  }, [lobby, dispatch]);

  useEffect(() => {
    if (lobbyResponse?.playerId && lobbyResponse.sessionToken) {
      const resolvedPlayerName =
        lobbyResponse.lobby.players.find(
          (player) => player.id === lobbyResponse.playerId,
        )?.name ?? savedPlayerName;
      lobbySessionStore.save(
        lobbyId,
        lobbyResponse.playerId,
        lobbyResponse.sessionToken,
        resolvedPlayerName,
        lobbyResponse.lobby.players.find(
          (player) => player.id === lobbyResponse.playerId,
        )?.isHost,
      );
      setSavedPlayerName(resolvedPlayerName);
      setSessionToken(lobbyResponse.sessionToken);
    }
  }, [
    lobbyId,
    lobbyResponse?.lobby.players,
    lobbyResponse?.playerId,
    lobbyResponse?.sessionToken,
    savedPlayerName,
  ]);

  useEffect(() => {
    if (!isLobbyMissing) {
      return;
    }

    lobbySessionStore.clear(lobbyId);
    lobbyReturnStore.clear(lobbyId);
    setSessionToken(null);
    setIsStartingGameLocally(false);
    setIsWaitingForLobbyReset(false);
    setShowSeatRecovery(false);
    dispatch({ type: "CLEAR_MY_PLAYER_ID" });
  }, [dispatch, isLobbyMissing, lobbyId]);

  useEffect(() => {
    if (!lobby || lobby.status !== "waiting") {
      return;
    }

    setIsStartingGameLocally(false);
    lobbyReturnStore.clear(lobbyId);
    setIsWaitingForLobbyReset(false);
  }, [lobby, lobbyId]);

  useEffect(() => {
    if (!lobby || !state.myPlayerId || activePlayer) {
      return;
    }

    lobbySessionStore.clear(lobbyId);
    setSessionToken(null);
    setShowConfig(false);
    setShowSeatRecovery(true);
    dispatch({ type: "CLEAR_MY_PLAYER_ID" });
  }, [activePlayer, dispatch, lobby, lobbyId, state.myPlayerId]);

  // Lobby WebSocket — instant game-start notification (replaces polling delay)
  useEffect(() => {
    if (
      !hasResolvedSession ||
      !state.myPlayerId ||
      !lobby ||
      lobby.status !== "waiting"
    ) {
      return;
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const ws = new WebSocket(
      `${WS_URL}/ws/lobby/${lobbyId}?player_id=${encodeURIComponent(state.myPlayerId)}`,
    );

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "LOBBY_GAME_STARTED" && msg.payload?.gameId) {
          setIsNavigatingToGame(true);
          router.push(
            `/game/${msg.payload.gameId}?playerId=${state.myPlayerId}&lobbyId=${lobbyId}`,
          );
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => {
      ws.close();
    };
  }, [hasResolvedSession, lobby?.status, lobbyId, router, state.myPlayerId]);

  // Redirect to game when lobby starts — polling fallback for non-host players
  useEffect(() => {
    if (
      lobby &&
      lobby.gameId &&
      lobby.status !== "waiting" &&
      state.myPlayerId &&
      !isWaitingForLobbyReset
    ) {
      setIsNavigatingToGame(true);
      router.push(
        `/game/${lobby.gameId}?playerId=${state.myPlayerId}&lobbyId=${lobbyId}`,
      );
    }
  }, [isWaitingForLobbyReset, lobby, lobbyId, router, state.myPlayerId]);

  const handleLeave = async () => {
    if (!state.myPlayerId) {
      lobbySessionStore.clear(lobbyId);
      dispatch({ type: "LEAVE_LOBBY" });
      router.replace("/");
      return;
    }
    try {
      if (sessionToken) {
        await lobbyService.leave(lobbyId, { sessionToken });
      } else {
        await lobbyService.leave(lobbyId, {
          playerId: state.myPlayerId,
        });
      }
    } catch {
      /* lobby may already be gone */
    }
    lobbySessionStore.clear(lobbyId);
    dispatch({ type: "LEAVE_LOBBY" });
    await queryClient.cancelQueries({ queryKey: ["lobbies", "detail", lobbyId] });
    queryClient.removeQueries({ queryKey: ["lobbies", "detail", lobbyId] });
    await queryClient.invalidateQueries({ queryKey: ["lobbies", "list"] });
    router.replace("/");
  };

  const handleStart = () => {
    if (!state.myPlayerId || isStartingGameLocally || startGame.isPending) {
      return;
    }

    void (async () => {
      lobbyReturnStore.clear(lobbyId);
      setIsWaitingForLobbyReset(false);
      setIsStartingGameLocally(true);
      try {
        const res = await startGame.mutateAsync({ lobbyId, config: savedConfig });
        router.replace(
          `/game/${res.game_id}?playerId=${state.myPlayerId}&lobbyId=${lobbyId}`,
        );
      } catch {
        setIsStartingGameLocally(false);
      }
    })();
  };

  const handleEditConfig = () => {
    setShowConfig(true);
  };

  const handleRejoinAsNewSeat = async () => {
    const nextPlayerName = savedPlayerName.trim();
    if (!nextPlayerName) {
      router.replace("/");
      return;
    }

    try {
      const res = await lobbyService.join(lobbyId, {
        playerName: nextPlayerName,
        sessionToken: null,
      });

      if (res.playerId && res.sessionToken) {
        lobbySessionStore.save(
          res.lobby.id,
          res.playerId,
          res.sessionToken,
          nextPlayerName,
          res.lobby.players.find((player) => player.id === res.playerId)?.isHost,
        );
        setSessionToken(res.sessionToken);
        dispatch({ type: "SET_MY_PLAYER_ID", payload: res.playerId });
        setShowSeatRecovery(false);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["lobbies", "detail", lobbyId],
          }),
          queryClient.invalidateQueries({ queryKey: ["lobbies", "list"] }),
        ]);
      }
    } catch {
      router.replace("/");
    }
  };

  const handleKick = async (targetPlayerId: string) => {
    await lobbyService.kick(lobbyId, {
      targetPlayerId,
      actorPlayerId: state.myPlayerId,
      sessionToken,
    });
    await queryClient.invalidateQueries({
      queryKey: ["lobbies", "detail", lobbyId],
    });
    await queryClient.invalidateQueries({ queryKey: ["lobbies", "list"] });
  };

  const handleConfirmConfig = async (config: GameConfig) => {
    lobbyConfigStore.save(lobbyId, config);
    setSavedConfig(config);
    setShowConfig(false);
  };

  if (!hasResolvedSession || (isLoading && !lobby)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: tokens.board.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.text.secondary,
          fontSize: 16,
        }}
      >
        Restoring your lobby seat...
      </div>
    );
  }

  if (isLobbyMissing || (isError && !lobby)) {
    if (isError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: tokens.board.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: tokens.spacing.md,
            color: tokens.text.secondary,
            fontSize: 16,
            padding: tokens.spacing.lg,
          }}
        >
          <div>That room is no longer available.</div>
          <div
            style={{
              maxWidth: 320,
              textAlign: "center",
              lineHeight: 1.5,
              fontSize: 13,
              color: tokens.text.muted,
            }}
          >
            The lobby was closed or all waiting seats expired before the game started.
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: tokens.text.primary,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back Home
          </button>
        </div>
      );
    }
  }

  if (!lobby) {
    return null;
  }

  if (isStartingGameLocally || isNavigatingToGame) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: tokens.board.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: tokens.spacing.lg,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(18,27,43,0.98) 0%, rgba(10,16,29,0.98) 100%)",
            boxShadow: tokens.elevation.dp24,
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.md,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: tokens.text.accent,
              fontWeight: 800,
            }}
          >
            Match start
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 800,
              color: tokens.text.primary,
            }}
          >
            {isStartingGameLocally ? "Dealing the table." : "Starting..."}
          </div>
          <div
            style={{
              color: tokens.text.secondary,
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            {isStartingGameLocally
              ? "Building the match and moving you into the game now."
              : "The host started the match. Joining the table now."}
          </div>
        </div>
      </div>
    );
  }

  if (isWaitingForLobbyReset && lobby.status !== "waiting") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: tokens.board.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: tokens.spacing.lg,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(18,27,43,0.98) 0%, rgba(10,16,29,0.98) 100%)",
            boxShadow: tokens.elevation.dp24,
            padding: tokens.spacing.xl,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.md,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: tokens.text.accent,
              fontWeight: 800,
            }}
          >
            Returning to lobby
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.1,
              fontWeight: 800,
              color: tokens.text.primary,
            }}
          >
            Waiting for the room to reopen.
          </div>
          <div
            style={{
              color: tokens.text.secondary,
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            You are back at the lobby route already. As soon as the room resets, this page will refresh into the waiting room automatically.
          </div>
          <button
            type="button"
            onClick={() => router.replace("/")}
            style={{
              minHeight: 46,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: tokens.text.primary,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = lobby.players.some(
    (p) => p.isHost && p.id === state.myPlayerId,
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: tokens.board.bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          typeof window !== "undefined" &&
          window.matchMedia("(max-width: 768px)").matches
            ? `${tokens.spacing.md}px ${tokens.spacing.sm}px`
            : tokens.spacing.xl,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "flex-end",
          pointerEvents: "none",
          opacity: 0.9,
        }}
      >
        <div
          style={{
            width: "62vw",
            minWidth: 360,
            maxWidth: 900,
            height: "100%",
            transform: "translateX(12%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 32%, rgba(0,0,0,1) 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 32%, rgba(0,0,0,1) 100%)",
          }}
        >
          <CoupBackgroundSVG />
        </div>
      </div>
      <LobbyRoom
        lobby={lobby}
        myPlayerId={state.myPlayerId ?? ""}
        isHost={isHost}
        leaderboard={leaderboard}
        onStart={handleStart}
        onEditConfig={handleEditConfig}
        onKick={handleKick}
        onLeave={handleLeave}
      />
      {showSeatRecovery && lobby && typeof document !== "undefined"
        ? createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: tokens.zIndex.modal + 2,
            background: "rgba(7, 12, 22, 0.72)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: tokens.spacing.md,
            pointerEvents: "auto",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              pointerEvents: "auto",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(18,27,43,0.98) 0%, rgba(10,16,29,0.98) 100%)",
              boxShadow: tokens.elevation.dp24,
              padding: tokens.spacing.xl,
              display: "flex",
              flexDirection: "column",
              gap: tokens.spacing.md,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: tokens.text.accent,
                fontWeight: 800,
              }}
            >
              Seat update
            </div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.1,
                fontWeight: 800,
                color: tokens.text.primary,
              }}
            >
              Your saved seat expired.
            </div>
            <div
              style={{
                color: tokens.text.secondary,
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              The room is still open, but this tab no longer owns a waiting-room seat. You can join again as a fresh player or head back home.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: tokens.spacing.sm,
              }}
            >
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.035)",
                  padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                }}
              >
                <div style={{ fontSize: 11, color: tokens.text.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Room
                </div>
                <div style={{ fontSize: 18, color: tokens.text.primary, fontWeight: 700, marginTop: 4 }}>
                  {lobby.id}
                </div>
              </div>
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.035)",
                  padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                }}
              >
                <div style={{ fontSize: 11, color: tokens.text.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Rejoin as
                </div>
                <div style={{ fontSize: 18, color: tokens.text.primary, fontWeight: 700, marginTop: 4 }}>
                  {savedPlayerName || "Previous name"}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: tokens.spacing.sm,
              }}
            >
              <button
                type="button"
                onClick={() => router.replace("/")}
                style={{
                  flex: 1,
                  minHeight: 46,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: tokens.text.primary,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Back Home
              </button>
              <button
                type="button"
                onClick={handleRejoinAsNewSeat}
                style={{
                  flex: 1,
                  minHeight: 46,
                  borderRadius: 14,
                  border: "1px solid rgba(255,193,7,0.28)",
                  background:
                    "linear-gradient(135deg, rgba(255,193,7,0.18), rgba(255,143,0,0.1))",
                  color: tokens.text.accent,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Join New Seat
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
        : null}
      <PreGameConfig
        isOpen={showConfig}
        playerCount={lobby.players.length}
        showBotFillControls
        initialConfig={savedConfig}
        confirmLabel="Save Configuration"
        onConfirm={handleConfirmConfig}
        onCancel={() => setShowConfig(false)}
      />
    </div>
  );
}
