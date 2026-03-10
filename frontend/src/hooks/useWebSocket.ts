import { useCallback, useEffect, useRef, useState } from 'react';
import { WS_URL } from '@/utils/constants';
import { ClientMessage, ServerMessage } from '@/models/websocket-message';
import { mapServerMessage } from '@/services/wsMessageMapper';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

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
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const encodedPlayerId = encodeURIComponent(playerId);
    const ws = new WebSocket(`${WS_URL}/ws/game/${gameId}?player_id=${encodedPlayerId}`);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('connected');
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        const msg: ServerMessage = mapServerMessage(raw);
        onMessageRef.current(msg);
      } catch {
        console.error('Failed to parse WS message');
      }
    };

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      if (autoReconnect && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        const delay = Math.min(1000 * 2 ** retriesRef.current, 16000);
        setTimeout(connect, delay);
      }
    };
  }, [gameId, playerId, autoReconnect, maxRetries]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((msg: ClientMessage): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = { ...msg.payload } as Record<string, unknown>;
      // Map frontend field names to backend expectations
      if ('actionType' in payload) {
        payload.action = payload.actionType;
        delete payload.actionType;
      }
      const outgoing = { type: msg.type.toUpperCase(), payload };
      wsRef.current.send(JSON.stringify(outgoing));
      return true;
    }
    console.warn('[WS] Cannot send — not connected. Message dropped:', msg.type);
    return false;
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { status, send, disconnect, connect };
}
