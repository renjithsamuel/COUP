import { Character } from "../card/card";
import { Player, PlayerPublic } from "./player";

export const mockPlayer1: Player = {
  id: "player-1",
  name: "Alice",
  coins: 2,
  influences: [
    { character: Character.DUKE, isRevealed: false },
    { character: Character.CAPTAIN, isRevealed: false },
  ],
  isAlive: true,
};

export const mockPlayer2: Player = {
  id: "player-2",
  name: "Bob",
  coins: 2,
  influences: [
    { character: Character.ASSASSIN, isRevealed: false },
    { character: Character.CONTESSA, isRevealed: false },
  ],
  isAlive: true,
};

export const mockPlayer3: Player = {
  id: "player-3",
  name: "Charlie",
  coins: 5,
  influences: [
    { character: Character.AMBASSADOR, isRevealed: false },
    { character: Character.DUKE, isRevealed: false },
  ],
  isAlive: true,
};

export const mockDeadPlayer: Player = {
  id: "player-4",
  name: "Diana",
  coins: 0,
  influences: [
    { character: Character.ASSASSIN, isRevealed: true },
    { character: Character.CAPTAIN, isRevealed: true },
  ],
  isAlive: false,
};

export const mockPlayerPublic1: PlayerPublic = {
  id: "player-1",
  name: "Alice",
  coins: 2,
  influenceCount: 2,
  revealedCards: [],
  isAlive: true,
};

export const mockPlayerPublic2: PlayerPublic = {
  id: "player-2",
  name: "Bob",
  coins: 2,
  influenceCount: 2,
  revealedCards: [],
  isAlive: true,
};

export const mockDeadPlayerPublic: PlayerPublic = {
  id: "player-4",
  name: "Diana",
  coins: 0,
  influenceCount: 0,
  revealedCards: [
    { character: Character.ASSASSIN, isRevealed: true },
    { character: Character.CAPTAIN, isRevealed: true },
  ],
  isAlive: false,
};

export const mockPlayers: Player[] = [mockPlayer1, mockPlayer2, mockPlayer3];
export const mockPlayersPublic: PlayerPublic[] = [
  mockPlayerPublic1,
  mockPlayerPublic2,
  mockDeadPlayerPublic,
];
