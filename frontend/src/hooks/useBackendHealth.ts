import { useEffect, useState } from "react";
import type { WebSocketStatus } from "@/hooks/useWebSocket";
import { API_URL } from "@/utils/constants";

export type BackendHealthStatus = "checking" | "online" | "offline";

interface UseBackendHealthOptions {
  websocketStatus: WebSocketStatus;
  enabled?: boolean;
  activeIntervalMs?: number;
  passiveIntervalMs?: number;
  timeoutMs?: number;
}

export function useBackendHealth({
  websocketStatus,
  enabled = true,
  activeIntervalMs = 6000,
  passiveIntervalMs = 45000,
  timeoutMs = 4500,
}: UseBackendHealthOptions) {
  const [status, setStatus] = useState<BackendHealthStatus>("checking");

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let isCancelled = false;
    let intervalId: number | null = null;

    const runCheck = async () => {
      const controller = new AbortController();
      const abortTimeoutId = window.setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      setStatus((current) =>
        current === "online" && websocketStatus === "connected"
          ? current
          : "checking",
      );

      try {
        const response = await fetch(`${API_URL}/api/health`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await response.json().catch(() => null);

        if (isCancelled) {
          return;
        }

        setStatus(
          response.ok && payload?.status === "ok" ? "online" : "offline",
        );
      } catch {
        if (!isCancelled) {
          setStatus("offline");
        }
      } finally {
        window.clearTimeout(abortTimeoutId);
      }
    };

    void runCheck();
    intervalId = window.setInterval(
      runCheck,
      websocketStatus === "connected" ? passiveIntervalMs : activeIntervalMs,
    );

    return () => {
      isCancelled = true;
      if (intervalId != null) {
        window.clearInterval(intervalId);
      }
    };
  }, [
    activeIntervalMs,
    enabled,
    passiveIntervalMs,
    timeoutMs,
    websocketStatus,
  ]);

  return { status };
}
