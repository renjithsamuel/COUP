'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionType } from '@/models/action';

const storageKey = 'coup:game-audio-muted';

type AudioProfile = {
  notes: number[];
  duration: number;
  gain: number;
  type: OscillatorType;
};

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

const actionProfiles: Record<ActionType, AudioProfile> = {
  income: { notes: [392, 440], duration: 0.095, gain: 0.028, type: 'sine' },
  foreign_aid: { notes: [349.23, 392], duration: 0.1, gain: 0.03, type: 'sine' },
  tax: { notes: [392, 466.16], duration: 0.105, gain: 0.03, type: 'triangle' },
  steal: { notes: [311.13, 349.23], duration: 0.085, gain: 0.02, type: 'triangle' },
  exchange: { notes: [349.23, 392], duration: 0.09, gain: 0.024, type: 'sine' },
  assassinate: { notes: [246.94, 220], duration: 0.08, gain: 0.018, type: 'triangle' },
  coup: { notes: [261.63, 220], duration: 0.11, gain: 0.032, type: 'triangle' },
};

function readMutedPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(storageKey) === 'true';
}

export function useGameAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(readMutedPreference);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(storageKey, String(isMuted));
  }, [isMuted]);

  useEffect(() => () => {
    void audioContextRef.current?.close();
  }, []);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const audioWindow = window as AudioWindow;
    const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    return audioContextRef.current;
  }, []);

  const playActionSound = useCallback(async (actionType: ActionType) => {
    if (isMuted) {
      return;
    }

    const audioContext = getAudioContext();
    if (!audioContext) {
      return;
    }

    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return;
      }
    }

    const profile = actionProfiles[actionType];
    const now = audioContext.currentTime;

    profile.notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      const startAt = now + index * 0.035;
      const stopAt = startAt + profile.duration;

      oscillator.type = profile.type;
      oscillator.frequency.setValueAtTime(frequency, startAt);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4200, startAt);
      filter.Q.setValueAtTime(0.2, startAt);

      oscillator.connect(filter);
      filter.connect(envelope);
      envelope.connect(audioContext.destination);

      envelope.gain.setValueAtTime(0.0001, startAt);
      envelope.gain.exponentialRampToValueAtTime(profile.gain, startAt + 0.014);
      envelope.gain.exponentialRampToValueAtTime(0.0001, stopAt);

      oscillator.start(startAt);
      oscillator.stop(stopAt + 0.02);
    });
  }, [getAudioContext, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => !current);
  }, []);

  return {
    isMuted,
    playActionSound,
    toggleMute,
  };
}