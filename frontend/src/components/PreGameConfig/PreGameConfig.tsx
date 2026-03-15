"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Select } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { AiDifficulty, GameConfig } from "@/models/lobby";
import { getPreGameConfigStyles } from "./PreGameConfig.styles";

export interface PreGameConfigProps {
  isOpen: boolean;
  playerCount: number;
  showBotFillControls?: boolean;
  initialConfig?: GameConfig;
  confirmLabel?: string;
  onConfirm: (config: GameConfig) => void;
  onCancel: () => void;
}

type ConfigTab = "simple" | "advanced";
type TempoPresetId =
  | "quick"
  | "balanced"
  | "deliberate"
  | "peaceful"
  | "custom";

interface TimerSettingDef {
  key: "turnTimerSeconds" | "challengeWindowSeconds" | "blockWindowSeconds";
  label: string;
  description: string;
  options: { value: number; label: string }[];
}

interface TempoPreset {
  id: Exclude<TempoPresetId, "custom">;
  title: string;
  description: string;
  values: Pick<
    GameConfig,
    "turnTimerSeconds" | "challengeWindowSeconds" | "blockWindowSeconds"
  >;
}

const BOT_DIFFICULTIES: AiDifficulty[] = ["easy", "medium", "hard", "lethal"];

const TIMER_OPTIONS = [0, 15, 30, 45, 60, 90, 120].map((value) => ({
  value,
  label: value === 0 ? "Off" : `${value}s`,
}));

const WINDOW_OPTIONS = [0, 5, 8, 10, 15, 20, 30].map((value) => ({
  value,
  label: value === 0 ? "Off" : `${value}s`,
}));

const COIN_OPTIONS = [1, 2, 3, 4, 5];

const TIMER_SETTINGS: TimerSettingDef[] = [
  {
    key: "turnTimerSeconds",
    label: "Turn timer",
    description: "How long an active turn can stay open.",
    options: TIMER_OPTIONS,
  },
  {
    key: "challengeWindowSeconds",
    label: "Challenge window",
    description: "Time for the table to challenge a claim.",
    options: WINDOW_OPTIONS,
  },
  {
    key: "blockWindowSeconds",
    label: "Block window",
    description: "Time to answer a declared block.",
    options: WINDOW_OPTIONS,
  },
];

const TEMPO_PRESETS: TempoPreset[] = [
  {
    id: "quick",
    title: "Quick",
    description: "Fast table, faster reads.",
    values: {
      turnTimerSeconds: 15,
      challengeWindowSeconds: 5,
      blockWindowSeconds: 5,
    },
  },
  {
    id: "balanced",
    title: "Balanced",
    description: "Recommended default for most rooms.",
    values: {
      turnTimerSeconds: 30,
      challengeWindowSeconds: 10,
      blockWindowSeconds: 10,
    },
  },
  {
    id: "deliberate",
    title: "Deliberate",
    description: "More time for bluff-heavy tables.",
    values: {
      turnTimerSeconds: 60,
      challengeWindowSeconds: 15,
      blockWindowSeconds: 15,
    },
  },
  {
    id: "peaceful",
    title: "Peaceful",
    description: "No timers. Let the table self-pace.",
    values: {
      turnTimerSeconds: 0,
      challengeWindowSeconds: 0,
      blockWindowSeconds: 0,
    },
  },
];

const DEFAULT_CONFIG: GameConfig = {
  turnTimerSeconds: 30,
  challengeWindowSeconds: 10,
  blockWindowSeconds: 10,
  startingCoins: 2,
  botCount: 0,
  botDifficulty: "medium",
};

const getTempoPresetId = (config: GameConfig): TempoPresetId => {
  const preset = TEMPO_PRESETS.find(
    ({ values }) =>
      values.turnTimerSeconds === config.turnTimerSeconds &&
      values.challengeWindowSeconds === config.challengeWindowSeconds &&
      values.blockWindowSeconds === config.blockWindowSeconds,
  );

  return preset?.id ?? "custom";
};

const formatDifficultyLabel = (difficulty: AiDifficulty): string =>
  difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

export function PreGameConfig({
  isOpen,
  playerCount,
  showBotFillControls = false,
  initialConfig,
  confirmLabel = "Start Game",
  onConfirm,
  onCancel,
}: PreGameConfigProps) {
  const isMobile = useIsMobile();
  const s = getPreGameConfigStyles(isMobile);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<ConfigTab>("simple");
  const maxBotCount = Math.max(0, 6 - playerCount);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("simple");
    const nextConfig = initialConfig ?? DEFAULT_CONFIG;
    setConfig({
      ...nextConfig,
      botCount: showBotFillControls
        ? Math.min(nextConfig.botCount ?? 0, maxBotCount)
        : 0,
      botDifficulty: nextConfig.botDifficulty ?? "medium",
    });
  }, [initialConfig, isOpen, maxBotCount, showBotFillControls]);

  const botCount = Math.min(config.botCount ?? 0, maxBotCount);
  const botDifficulty = config.botDifficulty ?? "medium";
  const tempoPresetId = getTempoPresetId(config);
  const activeTempoPreset = TEMPO_PRESETS.find(
    ({ id }) => id === tempoPresetId,
  );
  const botSeatOptions = useMemo(
    () => Array.from({ length: maxBotCount + 1 }, (_, index) => index),
    [maxBotCount],
  );
  const tempoOptions = useMemo(
    () => [
      ...TEMPO_PRESETS.map((preset) => ({
        value: preset.id,
        label: preset.title,
      })),
      {
        value: "custom",
        label: "Custom overrides",
        disabled: true,
      },
    ],
    [],
  );
  const coinOptions = useMemo(
    () =>
      COIN_OPTIONS.map((value) => ({
        value: String(value),
        label: `${value} ${value === 1 ? "coin" : "coins"}`,
      })),
    [],
  );
  const botCountOptions = useMemo(
    () =>
      botSeatOptions.map((value) => ({
        value: String(value),
        label:
          value === 0 ? "No bots" : `${value} ${value === 1 ? "bot" : "bots"}`,
      })),
    [botSeatOptions],
  );
  const botDifficultyOptions = useMemo(
    () =>
      BOT_DIFFICULTIES.map((level) => ({
        value: level,
        label: formatDifficultyLabel(level),
      })),
    [],
  );
  const timerSelectOptions = useMemo(
    () => ({
      turnTimerSeconds: TIMER_OPTIONS.map((option) => ({
        value: String(option.value),
        label: option.label,
      })),
      challengeWindowSeconds: WINDOW_OPTIONS.map((option) => ({
        value: String(option.value),
        label: option.label,
      })),
      blockWindowSeconds: WINDOW_OPTIONS.map((option) => ({
        value: String(option.value),
        label: option.label,
      })),
    }),
    [],
  );

  const applyTempoPreset = (presetId: Exclude<TempoPresetId, "custom">) => {
    const preset = TEMPO_PRESETS.find(({ id }) => id === presetId);

    if (!preset) {
      return;
    }

    setConfig((prev) => ({
      ...prev,
      ...preset.values,
    }));
  };

  const updateTimerSetting = (key: TimerSettingDef["key"], value: number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateBotCount = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      botCount: value,
      botDifficulty: value > 0 ? (prev.botDifficulty ?? "medium") : "medium",
    }));
  };

  const summaryBits = [
    `${playerCount + botCount} seats`,
    `${config.startingCoins} starting coins`,
    tempoPresetId === "custom"
      ? `${config.turnTimerSeconds}s / ${config.challengeWindowSeconds}s / ${config.blockWindowSeconds}s`
      : (activeTempoPreset?.title ?? "Balanced"),
  ];

  if (showBotFillControls) {
    summaryBits.push(
      botCount > 0
        ? `${botCount} bots • ${formatDifficultyLabel(botDifficulty)}`
        : "no bots",
    );
  }

  const summary = summaryBits.join(" • ");
  const selectStyles = {
    input: s.selectInput,
    dropdown: s.selectDropdown,
    option: s.selectOption,
    section: s.selectSection,
  };

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
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={s.glow} />
            <div style={s.header}>
              <div style={s.eyebrow}>Pre-game setup</div>
              <div style={s.title}>Game Configuration</div>
              <div style={s.subtitle}>
                Keep it to tempo, bots, and coins first. Open Advanced only if
                you need to override timer windows.
              </div>
            </div>

            <div style={s.tabRail}>
              <button
                type="button"
                style={s.tabButton(activeTab === "simple")}
                onClick={() => setActiveTab("simple")}
              >
                <span style={s.tabTitle}>Simple</span>
                <span style={s.tabCaption}>Only the main decisions</span>
              </button>
              <button
                type="button"
                style={s.tabButton(activeTab === "advanced")}
                onClick={() => setActiveTab("advanced")}
              >
                <span style={s.tabTitle}>Advanced</span>
                <span style={s.tabCaption}>Compact timer breakdown</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "simple" ? (
                <motion.div
                  key="simple"
                  style={s.panel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={s.summaryStrip}>
                    <span style={s.summaryLabel}>Setup</span>
                    <span style={s.summaryValue}>{summary}</span>
                  </div>

                  <div style={s.simpleGrid}>
                    <div style={s.primaryCard}>
                      <div style={s.fieldHeader}>
                        <div style={s.fieldLabel}>Tempo</div>
                        <div style={s.fieldHint}>
                          Pick one room pace and move on.
                        </div>
                      </div>
                      <Select
                        aria-label="Tempo preset"
                        data={tempoOptions}
                        value={tempoPresetId}
                        allowDeselect={false}
                        checkIconPosition="right"
                        withCheckIcon={false}
                        radius="xl"
                        styles={selectStyles}
                        onChange={(value) => {
                          if (!value || value === "custom") {
                            return;
                          }

                          applyTempoPreset(
                            value as Exclude<TempoPresetId, "custom">,
                          );
                        }}
                      />
                      <div style={s.inlineNote}>
                        {activeTempoPreset?.description ??
                          "Custom timer values are active. Open Advanced to fine-tune them."}
                      </div>
                    </div>

                    <div style={s.primaryCard}>
                      <div style={s.fieldHeader}>
                        <div style={s.fieldLabel}>Starting coins</div>
                        <div style={s.fieldHint}>
                          Opening economy for every seat.
                        </div>
                      </div>
                      <Select
                        aria-label="Starting coins"
                        data={coinOptions}
                        value={String(config.startingCoins)}
                        allowDeselect={false}
                        checkIconPosition="right"
                        withCheckIcon={false}
                        radius="xl"
                        styles={selectStyles}
                        onChange={(value) => {
                          if (!value) {
                            return;
                          }

                          setConfig((prev) => ({
                            ...prev,
                            startingCoins: Number(value),
                          }));
                        }}
                      />
                    </div>

                    {showBotFillControls && (
                      <div style={s.primaryCard}>
                        <div style={s.fieldHeader}>
                          <div style={s.fieldLabel}>AI fill bots</div>
                          <div style={s.fieldHint}>
                            Add bots only if you want to auto-fill open seats.
                          </div>
                        </div>
                        <Select
                          aria-label="AI fill bots"
                          data={botCountOptions}
                          value={String(botCount)}
                          allowDeselect={false}
                          checkIconPosition="right"
                          withCheckIcon={false}
                          radius="xl"
                          styles={selectStyles}
                          onChange={(value) => {
                            if (!value) {
                              return;
                            }

                            updateBotCount(Number(value));
                          }}
                        />
                        {botCount > 0 && (
                          <div style={s.difficultyWrap}>
                            <div style={s.difficultyLabel}>Difficulty</div>
                            <Select
                              aria-label="Bot difficulty"
                              data={botDifficultyOptions}
                              value={botDifficulty}
                              allowDeselect={false}
                              checkIconPosition="right"
                              withCheckIcon={false}
                              radius="xl"
                              styles={selectStyles}
                              onChange={(value) => {
                                if (!value) {
                                  return;
                                }

                                setConfig((prev) => ({
                                  ...prev,
                                  botDifficulty: value as AiDifficulty,
                                }));
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="advanced"
                  style={s.panel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div style={s.summaryStrip}>
                    <span style={s.summaryLabel}>Advanced</span>
                    <span style={s.summaryValue}>
                      Override timer windows only when the default tempo is not
                      enough.
                    </span>
                  </div>

                  <div style={s.advancedGrid}>
                    {TIMER_SETTINGS.map((setting) => (
                      <div key={setting.key} style={s.advancedCard}>
                        <div style={s.fieldHeader}>
                          <div style={s.fieldLabel}>{setting.label}</div>
                          <div style={s.fieldHint}>{setting.description}</div>
                        </div>
                        <Select
                          aria-label={setting.label}
                          data={timerSelectOptions[setting.key]}
                          value={String(config[setting.key])}
                          allowDeselect={false}
                          checkIconPosition="right"
                          withCheckIcon={false}
                          radius="xl"
                          styles={selectStyles}
                          onChange={(value) => {
                            if (!value) {
                              return;
                            }

                            updateTimerSetting(setting.key, Number(value));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={s.secondaryCard}>
                    <div style={s.secondaryTitle}>Current timer profile</div>
                    <div style={s.secondaryText}>
                      {tempoPresetId === "custom"
                        ? "Custom timing is active for this room."
                        : `${activeTempoPreset?.title ?? "Balanced"} preset is active.`}
                    </div>
                    <div style={s.metricRow}>
                      <div style={s.metricCard}>
                        <div style={s.metricLabel}>Turn</div>
                        <div style={s.metricValue}>
                          {config.turnTimerSeconds}s
                        </div>
                      </div>
                      <div style={s.metricCard}>
                        <div style={s.metricLabel}>Challenge</div>
                        <div style={s.metricValue}>
                          {config.challengeWindowSeconds}s
                        </div>
                      </div>
                      <div style={s.metricCard}>
                        <div style={s.metricLabel}>Block</div>
                        <div style={s.metricValue}>
                          {config.blockWindowSeconds}s
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={s.footer}>
              <div style={s.footerSummary}>{summary}</div>
              <div style={s.buttonRow}>
                <button type="button" style={s.cancelButton} onClick={onCancel}>
                  Cancel
                </button>
                <button
                  type="button"
                  style={s.confirmButton}
                  onClick={() => onConfirm(config)}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
