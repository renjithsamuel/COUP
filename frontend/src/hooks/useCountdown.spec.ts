import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with full time', () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current.remaining).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down when started', () => {
    const { result } = renderHook(() => useCountdown(5));

    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);

    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.remaining).toBe(2);
  });

  it('stops at zero', () => {
    const { result } = renderHook(() => useCountdown(3));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('resets correctly', () => {
    const { result } = renderHook(() => useCountdown(10));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(4000));
    expect(result.current.remaining).toBe(6);

    act(() => result.current.reset());
    expect(result.current.remaining).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current.progress).toBe(1);

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.progress).toBe(0.5);
  });
});
