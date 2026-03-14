"use client";

import React from "react";
import { timerStyles } from "./Timer.styles";

export interface TimerProps {
  remaining: number;
  progress: number;
}

export function Timer({ remaining, progress }: TimerProps) {
  return (
    <div
      style={timerStyles.wrapper}
      role="timer"
      aria-label={`${remaining} seconds remaining`}
    >
      <div style={timerStyles.bar}>
        <div style={timerStyles.fill(progress)} />
      </div>
      <span style={timerStyles.text}>{remaining}s</span>
    </div>
  );
}
