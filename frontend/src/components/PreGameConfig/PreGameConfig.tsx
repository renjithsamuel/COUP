"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameConfig } from "@/models/lobby";
import { preGameConfigStyles as s } from "./PreGameConfig.styles";

export interface PreGameConfigProps {
  isOpen: boolean;
  playerCount: number;
  onConfirm: (config: GameConfig) => void;
  onCancel: () => void;
}

interface SettingDef {
  key: keyof GameConfig;
  label: string;
  options: { value: number; label: string }[];
  defaultValue: number;
}

const TIMER_OPTIONS = [0, 15, 30, 45, 60, 90, 120].map((v) => ({
  value: v,
  label: v === 0 ? "Off" : `${v}s`,
}));
const WINDOW_OPTIONS = [0, 5, 8, 10, 15, 20, 30].map((v) => ({
  value: v,
  label: v === 0 ? "Off" : `${v}s`,
}));
const COIN_OPTIONS = [1, 2, 3, 4, 5].map((v) => ({ value: v, label: `${v}` }));

const SETTINGS: SettingDef[] = [
  {
    key: "turnTimerSeconds",
    label: "Turn Timer",
    options: TIMER_OPTIONS,
    defaultValue: 30,
  },
  {
    key: "challengeWindowSeconds",
    label: "Challenge Window",
    options: WINDOW_OPTIONS,
    defaultValue: 10,
  },
  {
    key: "blockWindowSeconds",
    label: "Block Window",
    options: WINDOW_OPTIONS,
    defaultValue: 10,
  },
  {
    key: "startingCoins",
    label: "Starting Coins",
    options: COIN_OPTIONS,
    defaultValue: 2,
  },
];

const DEFAULT_CONFIG: GameConfig = {
  turnTimerSeconds: 30,
  challengeWindowSeconds: 10,
  blockWindowSeconds: 10,
  startingCoins: 2,
};

export function PreGameConfig({
  isOpen,
  playerCount,
  onConfirm,
  onCancel,
}: PreGameConfigProps) {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [isPeacefulMode, setIsPeacefulMode] = useState(false);
  const previousTimedConfig = useRef(DEFAULT_CONFIG);

  const handleChange = (key: keyof GameConfig, value: number) => {
    if (key !== "startingCoins" && value > 0) {
      previousTimedConfig.current = {
        ...previousTimedConfig.current,
        [key]: value,
      };
    }
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const onTogglePeacefulMode = () => {
    if (!isPeacefulMode) {
      previousTimedConfig.current = config;
      setConfig((prev) => ({
        ...prev,
        turnTimerSeconds: 0,
        challengeWindowSeconds: 0,
        blockWindowSeconds: 0,
      }));
      setIsPeacefulMode(true);
      return;
    }

    setConfig((prev) => ({
      ...prev,
      turnTimerSeconds:
        previousTimedConfig.current.turnTimerSeconds ||
        DEFAULT_CONFIG.turnTimerSeconds,
      challengeWindowSeconds:
        previousTimedConfig.current.challengeWindowSeconds ||
        DEFAULT_CONFIG.challengeWindowSeconds,
      blockWindowSeconds:
        previousTimedConfig.current.blockWindowSeconds ||
        DEFAULT_CONFIG.blockWindowSeconds,
    }));
    setIsPeacefulMode(false);
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={s.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            style={s.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={s.title}>Game Configuration</div>

            <div style={s.settingRow}>
              <span style={s.settingLabel}>Players</span>
              <span style={s.settingValue}>{playerCount}</span>
            </div>

            {SETTINGS.map(({ key, label, options }) => (
              <div key={key} style={s.settingRow}>
                <span style={s.settingLabel}>{label}</span>
                <select
                  style={s.select}
                  value={config[key]}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  disabled={isPeacefulMode && key !== "startingCoins"}
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div style={s.peacefulRow}>
              <div style={s.peacefulTextWrap}>
                <span style={s.peacefulLabel}>Peaceful Mode</span>
                <span style={s.peacefulHint}>
                  No turn or response timers. Players decide manually.
                </span>
              </div>
              <button
                type="button"
                onClick={onTogglePeacefulMode}
                style={s.peacefulToggle(isPeacefulMode)}
              >
                {isPeacefulMode ? "On" : "Off"}
              </button>
            </div>

            <div style={s.buttons}>
              <button style={s.cancelBtn} onClick={onCancel}>
                Cancel
              </button>
              <button style={s.startBtn} onClick={() => onConfirm(config)}>
                Start Game
              </button>
            </div>

            <div style={s.note}>
              Each player receives 2 influence cards and {config.startingCoins}{" "}
              coins.{" "}
              {isPeacefulMode
                ? "Peaceful Mode is enabled."
                : "Timers are enabled."}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
