import React, { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { waitFor, renderHook, act } from "@/utils/testUtils";
import { GameProvider, useGameContext } from "@/context/GameContext";
import { useActionPanel } from "./ActionPanel.hooks";
import {
  mockGameStatePlaying,
  mockGameStatePrivate,
} from "@/models/game/game.mock";
import { ActionType } from "@/models/action";
import { GamePhase, GameStatePublic, GameStatePrivate } from "@/models/game";
import { ClientMessage } from "@/models/websocket-message";

function createSendMock() {
  return vi.fn<[ClientMessage], boolean>().mockReturnValue(true);
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}

function useHydratedActionPanel({
  send,
  gameState,
  privateState,
}: {
  send: ReturnType<typeof createSendMock>;
  gameState: GameStatePublic;
  privateState: GameStatePrivate;
}) {
  const { dispatch } = useGameContext();

  useEffect(() => {
    dispatch({ type: "SET_MY_PLAYER_ID", payload: "player-1" });
    dispatch({ type: "SET_GAME_STATE", payload: gameState });
    dispatch({
      type: "SET_PRIVATE_STATE",
      payload: {
        myCards: privateState.myCards,
        exchangeCards: privateState.exchangeCards,
      },
    });
  }, [dispatch, gameState, privateState]);

  return useActionPanel(send);
}

describe("useActionPanel", () => {
  it("sends targetId for target-required actions", async () => {
    const send = createSendMock();
    const { result } = renderHook(useHydratedActionPanel, {
      initialProps: {
        send,
        gameState: mockGameStatePlaying,
        privateState: mockGameStatePrivate,
      },
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canAct).toBe(true);
    });

    act(() => {
      result.current.setSelectedTarget("player-2");
    });

    act(() => {
      result.current.performAction(ActionType.STEAL);
    });

    expect(send).toHaveBeenCalledWith({
      type: "action",
      payload: {
        actionType: ActionType.STEAL,
        targetId: "player-2",
      },
    });
    expect(result.current.selectedTarget).toBeNull();
  });

  it("clears stale selected target when the turn is no longer actionable", async () => {
    const send = createSendMock();
    const { result, rerender } = renderHook(useHydratedActionPanel, {
      initialProps: {
        send,
        gameState: mockGameStatePlaying,
        privateState: mockGameStatePrivate,
      },
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.canAct).toBe(true);
    });

    act(() => {
      result.current.setSelectedTarget("player-2");
    });
    expect(result.current.selectedTarget).toBe("player-2");

    rerender({
      send,
      gameState: {
        ...mockGameStatePlaying,
        currentPlayerId: "player-2",
        phase: GamePhase.TURN_START,
      },
      privateState: {
        ...mockGameStatePrivate,
        currentPlayerId: "player-2",
        phase: GamePhase.TURN_START,
      },
    });

    await waitFor(() => {
      expect(result.current.canAct).toBe(false);
    });
    expect(result.current.selectedTarget).toBeNull();
  });
});
