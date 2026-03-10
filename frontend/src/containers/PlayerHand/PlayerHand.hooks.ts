import { useCallback } from 'react';
import { useGameContext } from '@/context/GameContext';
import { GamePhase } from '@/models/game';
import { ClientMessage, ClientMessageType } from '@/models/websocket-message';

export function usePlayerHand(send: (msg: ClientMessage) => boolean) {
  const { state, currentPhase } = useGameContext();

  const needsInfluenceChoice =
    currentPhase === GamePhase.AWAITING_INFLUENCE_LOSS &&
    state.gameState?.awaitingInfluenceLossFrom === state.myPlayerId;

  const needsExchangeReturn =
    currentPhase === GamePhase.AWAITING_EXCHANGE;

  const exchangeCards = state.exchangeCards;

  const onChooseInfluence = useCallback(
    (cardIndex: number) => {
      send({ type: ClientMessageType.CHOOSE_INFLUENCE, payload: { cardIndex } });
    },
    [send],
  );

  const onExchangeReturn = useCallback(
    (keepIndices: number[]) => {
      send({ type: ClientMessageType.EXCHANGE_RETURN, payload: { keepIndices } });
    },
    [send],
  );

  return { myCards: state.myCards, exchangeCards, needsInfluenceChoice, needsExchangeReturn, onChooseInfluence, onExchangeReturn };
}
