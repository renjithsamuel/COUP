"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { tokens } from "@/theme/tokens";

export interface ConnectionOverlayProps {
  isVisible: boolean;
  state: "online" | "connecting" | "offline";
  title: string;
  detail: string;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <motion.path
        d="M4 10.5 8 14.5 16 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <motion.path
        d="M5 5 15 15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M15 5 5 15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
      />
    </svg>
  );
}

function ConnectingGlyph() {
  return (
    <div style={styles.connectingGlyphWrap} aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          style={styles.connectingDot}
          animate={{ opacity: [0.28, 1, 0.28], scale: [0.9, 1.15, 0.9] }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: index * 0.12,
          }}
        />
      ))}
    </div>
  );
}

export function ConnectionOverlay({
  isVisible,
  state,
  title,
  detail,
}: ConnectionOverlayProps) {
  const palette =
    state === "online"
      ? {
          accent: "#4ADE80",
          text: "#DFFAE9",
          background:
            "linear-gradient(135deg, rgba(14, 40, 29, 0.95), rgba(8, 20, 16, 0.94))",
          border: "rgba(74, 222, 128, 0.22)",
          glow: "rgba(74, 222, 128, 0.22)",
        }
      : state === "offline"
        ? {
            accent: "#FB7185",
            text: "#FFE6EC",
            background:
              "linear-gradient(135deg, rgba(48, 20, 28, 0.95), rgba(22, 10, 16, 0.94))",
            border: "rgba(251, 113, 133, 0.22)",
            glow: "rgba(251, 113, 133, 0.2)",
          }
        : {
            accent: "#F6C445",
            text: "#FFF5D9",
            background:
              "linear-gradient(135deg, rgba(48, 34, 12, 0.95), rgba(19, 14, 8, 0.94))",
            border: "rgba(246, 196, 69, 0.22)",
            glow: "rgba(246, 196, 69, 0.2)",
          };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          style={styles.shell}
        >
          <div
            style={{
              ...styles.card,
              background: palette.background,
              borderColor: palette.border,
              boxShadow: `0 24px 48px rgba(0,0,0,0.28), 0 0 0 1px ${palette.border}, 0 0 30px ${palette.glow}`,
            }}
          >
            <div
              style={{
                ...styles.iconWrap,
                color: palette.accent,
                background: `${palette.accent}14`,
                borderColor: palette.border,
              }}
            >
              {state === "online" ? (
                <CheckIcon />
              ) : state === "offline" ? (
                <CrossIcon />
              ) : (
                <ConnectingGlyph />
              )}
            </div>
            <div style={styles.copyWrap}>
              <span style={{ ...styles.title, color: palette.text }}>{title}</span>
              <span style={styles.detail}>{detail}</span>
            </div>
            <motion.div
              style={{ ...styles.progressBar, background: `${palette.accent}28` }}
              animate={
                state === "connecting"
                  ? { scaleX: [0.2, 1, 0.35], opacity: [0.55, 1, 0.65] }
                  : { scaleX: 1, opacity: 0.9 }
              }
              transition={
                state === "connecting"
                  ? {
                      duration: 1.3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
                  : { duration: 0.22, ease: "easeOut" }
              }
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  shell: {
    position: "fixed",
    top: "calc(env(safe-area-inset-top, 0px) + 12px)",
    left: 0,
    right: 0,
    margin: "0 auto",
    width: "min(100vw - 24px, 420px)",
    zIndex: tokens.zIndex.toast,
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px 14px",
    borderRadius: 20,
    border: "1px solid transparent",
    backdropFilter: "blur(16px)",
    overflow: "hidden",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid transparent",
    flexShrink: 0,
  },
  copyWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.2,
    lineHeight: 1.1,
  },
  detail: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(232, 234, 240, 0.72)",
    lineHeight: 1.35,
  },
  progressBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 8,
    height: 3,
    borderRadius: 999,
    transformOrigin: "left center",
  },
  connectingGlyphWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  connectingDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "currentColor",
    display: "block",
  },
} as const;