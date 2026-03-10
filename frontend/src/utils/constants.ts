export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

// Game constants — single source of truth (mirrors backend config.py)
export const GAME_CONSTANTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  STARTING_COINS: 2,
  STARTING_INFLUENCES: 2,
  COUP_COST: 7,
  ASSASSINATE_COST: 3,
  MANDATORY_COUP_THRESHOLD: 10,
  FOREIGN_AID_COINS: 2,
  INCOME_COINS: 1,
  TAX_COINS: 3,
  STEAL_COINS: 2,
  CHALLENGE_WINDOW_SECONDS: 10,
  BLOCK_WINDOW_SECONDS: 10,
  TURN_TIMER_SECONDS: 30,
} as const;
