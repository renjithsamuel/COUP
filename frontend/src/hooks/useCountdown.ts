import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Countdown timer hook with auto-start option.
 * Returns remaining seconds and control functions.
 */
export function useCountdown(totalSeconds: number, autoStart = false) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setRemaining(totalSeconds);
    setIsRunning(true);
  }, [totalSeconds, stop]);

  const reset = useCallback(() => {
    stop();
    setRemaining(totalSeconds);
  }, [totalSeconds, stop]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return { remaining, progress, isRunning, start, stop, reset };
}
