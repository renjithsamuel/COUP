"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { cardDealVariants } from "@/animations";
import { tokens } from "@/theme/tokens";
import { getPlayerHandStyles } from "./PlayerHand.styles";
import { usePlayerHand } from "./PlayerHand.hooks";
import { useGameContext } from "@/context/GameContext";

import { ClientMessage } from "@/models/websocket-message";

export interface PlayerHandProps {
  send: (msg: ClientMessage) => boolean;
  isMobile?: boolean;
  activeCardEffect?: {
    eventId: number;
    effect: string;
    accent: string;
    actorId?: string;
    targetId?: string;
    blockerId?: string;
  } | null;
}

export function PlayerHand({
  send,
  isMobile = false,
  activeCardEffect = null,
}: PlayerHandProps) {
  const { state } = useGameContext();
  const {
    myCards,
    exchangeCards,
    needsInfluenceChoice,
    needsExchangeReturn,
    onChooseInfluence,
    onExchangeReturn,
  } = usePlayerHand(send);
  const s = getPlayerHandStyles(isMobile);
  const [selectedKeep, setSelectedKeep] = useState<Set<number>>(new Set());

  const aliveCount = myCards.filter((c) => !c.isRevealed).length;
  const aliveCards = myCards.filter((c) => !c.isRevealed);
  const allCards = [...aliveCards, ...exchangeCards];

  const toggleKeep = useCallback(
    (idx: number) => {
      setSelectedKeep((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) {
          next.delete(idx);
        } else if (next.size < aliveCount) {
          next.add(idx);
        }
        return next;
      });
    },
    [aliveCount],
  );

  const confirmExchange = useCallback(() => {
    if (selectedKeep.size === aliveCount) {
      onExchangeReturn(Array.from(selectedKeep));
      setSelectedKeep(new Set());
    }
  }, [selectedKeep, aliveCount, onExchangeReturn]);

  const getAliveCardChoiceIndex = useCallback(
    (cardIndex: number) => {
      let aliveIndex = -1;
      for (let index = 0; index <= cardIndex; index += 1) {
        if (!myCards[index].isRevealed) {
          aliveIndex += 1;
        }
      }
      return aliveIndex;
    },
    [myCards],
  );

  if (needsExchangeReturn && allCards.length > 0) {
    const cardSize = isMobile ? "sm" : "md";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? 8 : 12,
        }}
      >
        <div
          style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: tokens.text.accent,
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          Exchange — pick {aliveCount} card{aliveCount !== 1 ? "s" : ""} to keep
        </div>
        <div
          style={{
            display: "flex",
            gap: isMobile ? 6 : 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {allCards.map((card, i) => (
            <div
              key={`exchange-${i}`}
              style={{
                cursor: "pointer",
                borderRadius: 10,
                outline: selectedKeep.has(i)
                  ? `3px solid ${tokens.text.accent}`
                  : "3px solid transparent",
                outlineOffset: 2,
                opacity:
                  selectedKeep.size === aliveCount && !selectedKeep.has(i)
                    ? 0.4
                    : 1,
                transition: "all 0.15s ease",
              }}
              onClick={() => toggleKeep(i)}
            >
              <Card character={card.character} size={cardSize} />
            </div>
          ))}
        </div>
        <button
          disabled={selectedKeep.size !== aliveCount}
          onClick={confirmExchange}
          style={{
            padding: isMobile ? "6px 16px" : "8px 24px",
            borderRadius: 8,
            border: `1px solid ${tokens.surface.borderLight}`,
            background:
              selectedKeep.size === aliveCount
                ? `linear-gradient(135deg, ${tokens.surface.elevated}, ${tokens.surface.card})`
                : tokens.surface.card,
            color:
              selectedKeep.size === aliveCount
                ? tokens.text.accent
                : tokens.text.muted,
            fontWeight: 700,
            fontSize: isMobile ? 11 : 13,
            cursor:
              selectedKeep.size === aliveCount ? "pointer" : "not-allowed",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Confirm
        </button>
      </div>
    );
  }

  const myPlayerId = state.myPlayerId;
  const myRole =
    activeCardEffect && myPlayerId
      ? activeCardEffect.targetId === myPlayerId
        ? "target"
        : activeCardEffect.blockerId === myPlayerId
          ? "blocker"
          : activeCardEffect.actorId === myPlayerId
            ? "actor"
            : null
      : null;

  return (
    <div style={s.wrapper}>
      <AnimatePresence>
        {activeCardEffect && myRole && (
          <>
            <motion.div
              key={`my-frame-${activeCardEffect.eventId}`}
              style={s.effectFrame(myRole, activeCardEffect.accent)}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: [0, 1, 0.7], scale: [0.94, 1.03, 1] }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
            <motion.div
              key={`my-label-${activeCardEffect.eventId}`}
              style={s.effectLabel(activeCardEffect.accent, myRole)}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.22 }}
            >
              {myRole === "target"
                ? "You are targeted"
                : myRole === "blocker"
                  ? "Your block"
                  : "Your move"}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {needsInfluenceChoice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            boxShadow: [
              "0 0 12px rgba(255, 112, 67, 0.2), 0 0 0 2px rgba(255,112,67,0.3)",
              "0 0 28px rgba(255, 112, 67, 0.55), 0 0 0 2px rgba(255,112,67,0.7)",
              "0 0 12px rgba(255, 112, 67, 0.2), 0 0 0 2px rgba(255,112,67,0.3)",
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            marginBottom: isMobile ? 8 : 10,
            padding: isMobile ? "10px 16px" : "12px 20px",
            borderRadius: 14,
            border: "1.5px solid rgba(255, 112, 67, 0.6)",
            background:
              "linear-gradient(135deg, rgba(80, 22, 14, 0.97) 0%, rgba(40, 10, 8, 0.95) 100%)",
            color: "#FFAB91",
            fontSize: isMobile ? 13 : 15,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            textAlign: "center",
            width: "100%",
          }}
        >
          ⚠ Choose an influence to lose
        </motion.div>
      )}
      <AnimatePresence>
        {myCards.map((card, i) => (
          <motion.div
            key={`${card.character}-${i}`}
            custom={i}
            variants={cardDealVariants}
            initial="hidden"
            animate={
              needsInfluenceChoice && !card.isRevealed
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    boxShadow: [
                      "0 0 0px rgba(255,112,67,0)",
                      "0 0 20px rgba(255,112,67,0.5)",
                      "0 0 0px rgba(255,112,67,0)",
                    ],
                  }
                : "visible"
            }
            transition={
              needsInfluenceChoice && !card.isRevealed
                ? { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
            exit="hidden"
            style={{
              borderRadius: 14,
              cursor:
                needsInfluenceChoice && !card.isRevealed
                  ? "pointer"
                  : undefined,
            }}
          >
            <Card
              character={card.character}
              isRevealed={card.isRevealed}
              onClick={
                needsInfluenceChoice && !card.isRevealed
                  ? () => onChooseInfluence(getAliveCardChoiceIndex(i))
                  : undefined
              }
              disabled={card.isRevealed}
              size={isMobile ? "sm" : "md"}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
