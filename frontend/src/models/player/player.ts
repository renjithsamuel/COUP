import { Card } from '../card/card';

export interface Player {
  id: string;
  name: string;
  coins: number;
  influences: Card[];
  isAlive: boolean;
}

/** Public view of a player — hides unrevealed cards */
export interface PlayerPublic {
  id: string;
  name: string;
  coins: number;
  influenceCount: number;
  revealedCards: Card[];
  isAlive: boolean;
}
