"use client";

import React, {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  interactiveHoverMotion,
  interactiveTapMotion,
  scalePopVariants,
} from "@/animations";
import { ActionGlyph } from "@/components/ActionGlyph";
import {
  ActionType,
  ACTION_RULES,
  ACTION_PRESENTATIONS,
} from "@/models/action";
import { actionButtonStyles } from "./ActionButton.styles";

interface ActionButtonRipple {
  id: number;
  left: number;
  top: number;
  size: number;
}

function hexToRgba(hex: string, alpha: number) {
  const normalizedHex = hex.replace("#", "");
  if (normalizedHex.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export interface ActionButtonProps {
  actionType: ActionType;
  onClick: () => void;
  disabled?: boolean;
  playerCoins?: number;
  isBluff?: boolean;
  canAfford?: boolean;
  compact?: boolean;
  selected?: boolean;
  helperText?: string;
}

function getButtonAriaLabel(
  rule: (typeof ACTION_RULES)[ActionType],
  isBluff: boolean,
) {
  const segments = [rule.label];
  if (rule.cost > 0) {
    segments.push(`${rule.cost} coins`);
  }
  if (isBluff) {
    segments.push("bluff");
  }
  return segments.join(", ");
}

export function ActionButton({
  actionType,
  onClick,
  disabled = false,
  playerCoins,
  isBluff = false,
  canAfford = true,
  compact = false,
  selected = false,
  helperText,
}: ActionButtonProps) {
  const rule = ACTION_RULES[actionType];
  const presentation = ACTION_PRESENTATIONS[actionType];
  const cantAfford =
    !canAfford ||
    (playerCoins != null && rule.cost > 0 && playerCoins < rule.cost);
  const isDisabled = disabled || cantAfford;
  const hint = helperText ?? rule.description;
  const [ripples, setRipples] = useState<ActionButtonRipple[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const pressedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rippleInner = selected
    ? "rgba(246, 196, 69, 0.62)"
    : isBluff
      ? "rgba(239, 83, 80, 0.56)"
      : hexToRgba(presentation.accent, 0.54);
  const rippleMid = selected
    ? "rgba(246, 196, 69, 0.28)"
    : isBluff
      ? "rgba(239, 83, 80, 0.24)"
      : hexToRgba(presentation.accent, 0.24);
  const rippleOuter = selected
    ? "rgba(246, 196, 69, 0)"
    : isBluff
      ? "rgba(239, 83, 80, 0)"
      : hexToRgba(presentation.accent, 0);

  const spawnRipple = (
    buttonElement: HTMLButtonElement,
    clientX?: number,
    clientY?: number,
  ) => {
    const bounds = buttonElement.getBoundingClientRect();
    const rippleSize = Math.max(bounds.width, bounds.height) * 1.7;
    const originX = clientX != null ? clientX - bounds.left : bounds.width / 2;
    const originY = clientY != null ? clientY - bounds.top : bounds.height / 2;

    setRipples((currentRipples) => [
      ...currentRipples.slice(-3),
      {
        id: Date.now() + currentRipples.length,
        left: originX - rippleSize / 2,
        top: originY - rippleSize / 2,
        size: rippleSize,
      },
    ]);
  };

  useEffect(() => {
    return () => {
      if (pressedTimerRef.current) {
        clearTimeout(pressedTimerRef.current);
      }
    };
  }, []);

  const flashPressedState = () => {
    if (pressedTimerRef.current) {
      clearTimeout(pressedTimerRef.current);
    }

    setIsPressed(true);
    pressedTimerRef.current = setTimeout(() => {
      setIsPressed(false);
      pressedTimerRef.current = null;
    }, 220);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    flashPressedState();
    spawnRipple(event.currentTarget, event.clientX, event.clientY);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled || event.repeat) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      flashPressedState();
      spawnRipple(event.currentTarget);
    }
  };

  const clearRipple = (rippleId: number) => {
    setRipples((currentRipples) =>
      currentRipples.filter((ripple) => ripple.id !== rippleId),
    );
  };

  return (
    <motion.button
      type="button"
      variants={scalePopVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={isDisabled ? undefined : interactiveHoverMotion}
      whileTap={isDisabled ? undefined : interactiveTapMotion}
      style={actionButtonStyles.button(
        isDisabled,
        isBluff,
        compact,
        selected,
        isPressed,
        presentation,
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      title={`${hint}${isBluff ? " (Bluff - you do not have this character)" : ""}`}
      aria-label={getButtonAriaLabel(rule, isBluff)}
    >
      <span style={actionButtonStyles.rippleLayer} aria-hidden="true">
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            style={actionButtonStyles.ripple(
              ripple,
              rippleInner,
              rippleMid,
              rippleOuter,
            )}
            initial={{ scale: 0.16, opacity: 0.52 }}
            animate={{ scale: 1.42, opacity: 0 }}
            transition={{ duration: 0.56, ease: [0.16, 0.72, 0.28, 1] }}
            onAnimationComplete={() => clearRipple(ripple.id)}
          />
        ))}
      </span>
      <span style={actionButtonStyles.content}>
        <div style={actionButtonStyles.row(compact)}>
          <div style={actionButtonStyles.leadingGroup(compact)}>
            <span
              style={actionButtonStyles.iconShell(
                isDisabled,
                selected,
                compact,
                presentation,
              )}
            >
              <ActionGlyph name={presentation.icon} size={compact ? 11 : 16} />
            </span>
            <span
              style={actionButtonStyles.title(
                isDisabled,
                presentation,
                compact,
              )}
            >
              {rule.label}
            </span>
          </div>
          <div style={actionButtonStyles.trailingGroup(compact)}>
            {isBluff && (
              <span
                style={actionButtonStyles.bluffIcon(compact)}
                aria-label="Bluff action"
                title="Bluff action"
              >
                ?
              </span>
            )}
            {rule.cost > 0 && (
              <span style={actionButtonStyles.costBadge(compact, presentation)}>
                {rule.cost}c
              </span>
            )}
          </div>
        </div>
      </span>
    </motion.button>
  );
}
