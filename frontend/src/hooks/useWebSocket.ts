import { useCallback, useEffect, useRef, useState } from "react";
import { WS_URL } from "@/utils/constants";
import { ClientMessage, ServerMessage } from "@/models/websocket-message";
import { mapServerMessage } from "@/services/wsMessageMapper";

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseWebSocketOptions {
  gameId: string;
  playerId: string;
  onMessage: (msg: ServerMessage) => void;
  autoReconnect?: boolean;
  maxRetries?: number;
}

export function useWebSocket({
  gameId,
  playerId,
  onMessage,
  autoReconnect = true,
  maxRetries = 5,
}: UseWebSocketOptions) {
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const closedManuallyRef = useRef(false);
  const connectAttemptRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getReconnectDelay = useCallback(
    (retryCount: number, openedOnce: boolean) => {
      if (!openedOnce) {
        return 120;
      }

      return Math.min(1000 * 2 ** retryCount, 16000);
    },
    [],
  );

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current != null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimeout();
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    closedManuallyRef.current = false;
    const attemptId = ++connectAttemptRef.current;
    let openedOnce = false;

    const encodedPlayerId = encodeURIComponent(playerId);
    const ws = new WebSocket(
      `${WS_URL}/ws/game/${gameId}?player_id=${encodedPlayerId}`,
    );
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      if (attemptId != connectAttemptRef.current) {
        ws.close();
        return;
      }
      openedOnce = true;
      setStatus("connected");
      retriesRef.current = 0;
      clearReconnectTimeout();
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const msg: ServerMessage = mapServerMessage(raw);
        onMessageRef.current(msg);
      } catch {
        console.error("Failed to parse WS message");
      }
    };

    ws.onerror = () => {
      if (attemptId === connectAttemptRef.current) {
        setStatus("error");
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      if (attemptId !== connectAttemptRef.current) {
        return;
      }

      setStatus("disconnected");
      if (
        !closedManuallyRef.current &&
        autoReconnect &&
        retriesRef.current < maxRetries
      ) {
        retriesRef.current += 1;
        const delay = getReconnectDelay(retriesRef.current, openedOnce);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, delay);
      }
    };
  }, [
    clearReconnectTimeout,
    gameId,
    playerId,
    autoReconnect,
    getReconnectDelay,
    maxRetries,
  ]);

  const disconnect = useCallback(() => {
    closedManuallyRef.current = true;
    clearReconnectTimeout();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [clearReconnectTimeout]);

  const send = useCallback((msg: ClientMessage): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = { ...msg.payload } as Record<string, unknown>;
      // Map frontend field names to backend expectations
      if ("actionType" in payload) {
        payload.action = payload.actionType;
        delete payload.actionType;
      }
      const outgoing = { type: msg.type.toUpperCase(), payload };
      wsRef.current.send(JSON.stringify(outgoing));
      return true;
    }
    console.warn(
      "[WS] Cannot send — not connected. Message dropped:",
      msg.type,
    );
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, send, disconnect, connect };
}
