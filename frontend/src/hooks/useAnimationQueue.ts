import { useCallback, useRef, useState } from 'react';

interface AnimationQueueItem {
  id: string;
  execute: () => Promise<void>;
}

/**
 * Queues animations to play sequentially, preventing overlap.
 * Useful for chaining coin transfers, card flips, eliminations etc.
 */
export function useAnimationQueue() {
  const [isPlaying, setIsPlaying] = useState(false);
  const queueRef = useRef<AnimationQueueItem[]>([]);
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsPlaying(true);

    while (queueRef.current.length > 0) {
      const item = queueRef.current.shift()!;
      await item.execute();
    }

    processingRef.current = false;
    setIsPlaying(false);
  }, []);

  const enqueue = useCallback(
    (id: string, execute: () => Promise<void>) => {
      queueRef.current.push({ id, execute });
      processQueue();
    },
    [processQueue],
  );

  const clear = useCallback(() => {
    queueRef.current = [];
  }, []);

  return { enqueue, clear, isPlaying };
}
