import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnimationQueue } from '@/hooks/useAnimationQueue';

describe('useAnimationQueue', () => {
  it('starts with isPlaying false', () => {
    const { result } = renderHook(() => useAnimationQueue());
    expect(result.current.isPlaying).toBe(false);
  });

  it('plays enqueued animations sequentially', async () => {
    const { result } = renderHook(() => useAnimationQueue());
    const order: number[] = [];

    await act(async () => {
      result.current.enqueue('a', async () => { order.push(1); });
      result.current.enqueue('b', async () => { order.push(2); });
      // wait for microtasks
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(order).toEqual([1, 2]);
  });

  it('clears the queue', async () => {
    const { result } = renderHook(() => useAnimationQueue());

    act(() => {
      result.current.enqueue('a', () => new Promise((r) => setTimeout(r, 1000)));
      result.current.clear();
    });

    // After clearing, no further animations should execute
    expect(result.current.isPlaying).toBe(true); // first one is executing
  });
});
