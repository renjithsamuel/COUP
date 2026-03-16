"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { targetSlotHoverMotion, targetSlotTapMotion } from "@/animations";
import { useGameContext } from "@/context/GameContext";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { Card } from "@/components/Card";
import { Character } from "@/models/card";
import { GamePhase } from "@/models/game";
import { ActionType, ACTION_RULES } from "@/models/action";
import { getOpponentAreaStyles } from "./OpponentArea.styles";

export interface OpponentAreaProps {
  isMobile?: boolean;
  activeCardEffect?: {
    eventId: number;
    effect: string;
    accent: string;
    actorId?: string;
    targetId?: string;
    blockerId?: string;
  } | null;
  targetModeAction?: ActionType | null;
  selectableTargetIds?: string[];
  onSelectTarget?: (playerId: string) => void;
}

export function OpponentArea({
  isMobile = false,
  activeCardEffect = null,
  targetModeAction = null,
  selectableTargetIds = [],
  onSelectTarget,
}: OpponentAreaProps) {
  const { state } = useGameContext();
  const gs = state.gameState;
  const scrollRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const previousCurrentPlayerIdRef = useRef<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [revealedShowdownCards, setRevealedShowdownCards] = useState<
    Record<string, boolean[]>
  >({});

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollLeft(node.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - node.scrollLeft > 8);
  }, []);

  const handleViewportWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const node = scrollRef.current;
      if (!node) {
        return;
      }

      const maxScrollLeft = node.scrollWidth - node.clientWidth;
      if (maxScrollLeft <= 0) {
        return;
      }

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (delta === 0) {
        return;
      }

      event.preventDefault();
      node.scrollBy({ left: delta, behavior: "auto" });
      updateScrollState();
    },
    [updateScrollState],
  );

  useEffect(() => {
    if (!gs?.currentPlayerId) {
      previousCurrentPlayerIdRef.current = null;
      updateScrollState();
      return;
    }

    if (isMobile) {
      const didTurnChange =
        previousCurrentPlayerIdRef.current != null &&
        previousCurrentPlayerIdRef.current !== gs.currentPlayerId;
      previousCurrentPlayerIdRef.current = gs.currentPlayerId;

      if (!didTurnChange) {
        updateScrollState();
        return;
      }
    } else {
      previousCurrentPlayerIdRef.current = gs.currentPlayerId;
    }

    if (gs.players.filter((p) => p.id !== state.myPlayerId).length <= 2) {
      updateScrollState();
      return;
    }

    const el = slotRefs.current.get(gs.currentPlayerId);
    if (el && scrollRef.current) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [
    gs?.currentPlayerId,
    gs?.players,
    isMobile,
    state.myPlayerId,
    updateScrollState,
  ]);

  useEffect(() => {
    updateScrollState();

    const node = scrollRef.current;
    if (!node) {
      return undefined;
    }

    const handleResize = () => {
      updateScrollState();
    };

    node.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateScrollState]);

  const shellClassName = useMemo(
    () => (isMobile ? "hide-scrollbar" : undefined),
    [isMobile],
  );

  const opponents = gs?.players.filter((p) => p.id !== state.myPlayerId) ?? [];
  const showdownSignature = opponents
    .map(
      (opp) =>
        `${opp.id}:${opp.showdownCards.map((card) => card.character).join(",")}`,
    )
    .join("|");
  const s = getOpponentAreaStyles(isMobile, opponents.length);
  const cardSize = isMobile ? "xs" : "sm";
  const targetActionLabel = targetModeAction
    ? ACTION_RULES[targetModeAction].label
    : null;
  const showRailMargins = isMobile && opponents.length > 2;

  useEffect(() => {
    if (!gs || gs.phase !== GamePhase.GAME_OVER) {
      setRevealedShowdownCards({});
      return;
    }

    setRevealedShowdownCards((current) => {
      const next: Record<string, boolean[]> = {};
      let didChange = false;

      for (const opponent of opponents) {
        const currentFlags = current[opponent.id] ?? [];
        const nextFlags = opponent.showdownCards.map(
          (_, index) => currentFlags[index] ?? false,
        );
        next[opponent.id] = nextFlags;

        if (
          !didChange &&
          (currentFlags.length !== nextFlags.length ||
            currentFlags.some((value, index) => value !== nextFlags[index]))
        ) {
          didChange = true;
        }
      }

      if (
        !didChange &&
        Object.keys(current).every((playerId) => playerId in next)
      ) {
        return current;
      }

      return next;
    });
  }, [gs?.phase, opponents, showdownSignature]);

  const handleRevealShowdownCard = useCallback(
    (playerId: string, cardIndex: number) => {
      if (!gs || gs.phase !== GamePhase.GAME_OVER) {
        return;
      }

      setRevealedShowdownCards((current) => {
        const currentFlags = current[playerId] ?? [];
        if (currentFlags[cardIndex]) {
          return current;
        }

        const nextFlags = [...currentFlags];
        nextFlags[cardIndex] = true;
        return {
          ...current,
          [playerId]: nextFlags,
        };
      });
    },
    [gs],
  );

  if (!gs) return null;

  return (
    <div style={s.shell}>
      <div style={s.edgeFade("left", canScrollLeft)} />
      <div style={s.edgeFade("right", canScrollRight)} />
      <div
        ref={scrollRef}
        style={s.viewport}
        className={shellClassName}
        onWheel={handleViewportWheel}
      >
        <div style={s.track}>
          {showRailMargins && <div style={s.railSpacer} aria-hidden="true" />}
          {opponents.map((opp) => (
            <motion.div
              key={opp.id}
              ref={(el) => {
                if (el) {
                  slotRefs.current.set(opp.id, el);
                } else {
                  slotRefs.current.delete(opp.id);
                }
              }}
              style={s.opponentSlot(
                gs.currentPlayerId === opp.id,
                opp.isAlive,
                selectableTargetIds.includes(opp.id),
                targetModeAction != null,
              )}
              whileHover={
                opp.isAlive && selectableTargetIds.includes(opp.id)
                  ? targetSlotHoverMotion
                  : undefined
              }
              whileTap={
                opp.isAlive && selectableTargetIds.includes(opp.id)
                  ? targetSlotTapMotion
                  : undefined
              }
              onClick={
                opp.isAlive &&
                selectableTargetIds.includes(opp.id) &&
                onSelectTarget
                  ? () => onSelectTarget(opp.id)
                  : undefined
              }
              role={selectableTargetIds.includes(opp.id) ? "button" : undefined}
              aria-label={
                selectableTargetIds.includes(opp.id) && targetActionLabel
                  ? `Target ${opp.name} with ${targetActionLabel}`
                  : undefined
              }
            >
              <AnimatePresence>
                {targetModeAction && selectableTargetIds.includes(opp.id) && (
                  <motion.span
                    key={`targetable-${targetModeAction}-${opp.id}`}
                    style={s.selectTag}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.18 }}
                  >
                    Select for {ACTION_RULES[targetModeAction].label}
                  </motion.span>
                )}
                {activeCardEffect &&
                  (activeCardEffect.actorId === opp.id ||
                    activeCardEffect.targetId === opp.id ||
                    activeCardEffect.blockerId === opp.id) && (
                    <>
                      <motion.div
                        key={`halo-${activeCardEffect.eventId}-${opp.id}`}
                        style={s.effectHalo(
                          activeCardEffect.targetId === opp.id
                            ? "target"
                            : activeCardEffect.blockerId === opp.id
                              ? "blocker"
                              : "actor",
                          activeCardEffect.accent,
                        )}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{
                          opacity: [0, 1, 0.65],
                          scale: [0.92, 1.02, 1],
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                      <motion.span
                        key={`tag-${activeCardEffect.eventId}-${opp.id}`}
                        style={s.effectTag(
                          activeCardEffect.targetId === opp.id
                            ? "target"
                            : activeCardEffect.blockerId === opp.id
                              ? "blocker"
                              : "actor",
                          activeCardEffect.accent,
                        )}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeCardEffect.targetId === opp.id
                          ? "Target"
                          : activeCardEffect.blockerId === opp.id
                            ? "Blocker"
                            : "Actor"}
                      </motion.span>
                    </>
                  )}
              </AnimatePresence>

              <div style={s.topRow}>
                <PlayerAvatar
                  name={opp.name}
                  isActive={gs.currentPlayerId === opp.id}
                  isAlive={opp.isAlive}
                />
              </div>
              <div style={s.cardsRow}>
                {opp.revealedCards.map((card, i) => (
                  <Card
                    key={`revealed-${i}`}
                    character={card.character}
                    isRevealed
                    size={cardSize}
                    disabled
                  />
                ))}
                {gs.phase === GamePhase.GAME_OVER &&
                opp.showdownCards.length > 0
                  ? opp.showdownCards.map((card, index) => {
                      const isRevealed =
                        revealedShowdownCards[opp.id]?.[index] ?? false;

                      return (
                        <motion.div
                          key={`showdown-${opp.id}-${index}-${card.character}`}
                          style={s.showdownCardShell(!isRevealed)}
                          initial={false}
                          animate={
                            isRevealed
                              ? {
                                  y: [0, -10, -4],
                                  scale: [1, 1.06, 1.02],
                                  filter: [
                                    "drop-shadow(0 0 0 rgba(255,193,7,0))",
                                    "drop-shadow(0 0 18px rgba(255,193,7,0.28))",
                                    "drop-shadow(0 0 10px rgba(255,193,7,0.14))",
                                  ],
                                }
                              : undefined
                          }
                          transition={{ duration: 0.48, ease: "easeOut" }}
                          whileHover={
                            !isRevealed ? { y: -4, scale: 1.03 } : undefined
                          }
                          whileTap={!isRevealed ? { scale: 0.98 } : undefined}
                          onClick={() =>
                            handleRevealShowdownCard(opp.id, index)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleRevealShowdownCard(opp.id, index);
                            }
                          }}
                          role={isRevealed ? undefined : "button"}
                          tabIndex={isRevealed ? -1 : 0}
                          aria-label={
                            isRevealed
                              ? `${opp.name} final card ${index + 1}`
                              : `Reveal ${opp.name} final card ${index + 1}`
                          }
                        >
                          <Card
                            character={card.character}
                            isFaceDown={!isRevealed}
                            size={cardSize}
                            disabled
                          />
                          {!isRevealed && (
                            <motion.span
                              style={s.showdownRevealBadge}
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{
                                duration: 1.6,
                                ease: "easeInOut",
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            >
                              Reveal
                            </motion.span>
                          )}
                        </motion.div>
                      );
                    })
                  : Array.from({ length: opp.influenceCount }).map((_, i) => (
                      <Card
                        key={`hidden-${i}`}
                        character={Character.DUKE}
                        isFaceDown
                        size={cardSize}
                        disabled
                      />
                    ))}
              </div>
              <div style={s.statsRow}>
                <span style={s.coinBadge}>
                  <span style={s.coinDot} />
                  <span style={s.coinLabel}>{opp.coins}</span>
                </span>
                <span style={s.influenceLabel}>
                  {opp.influenceCount} card{opp.influenceCount !== 1 ? "s" : ""}
                </span>
                {!opp.isAlive && <span style={s.outBadge}>out</span>}
              </div>
              {opp.isAlive && opp.connected === false && (
                <div style={s.offlineOverlay}>
                  <span style={s.offlineBadge}>offline</span>
                </div>
              )}
            </motion.div>
          ))}
          {showRailMargins && <div style={s.railSpacer} aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
