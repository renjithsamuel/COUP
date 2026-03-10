export enum Character {
  DUKE = 'duke',
  ASSASSIN = 'assassin',
  CAPTAIN = 'captain',
  AMBASSADOR = 'ambassador',
  CONTESSA = 'contessa',
}

export interface Card {
  character: Character;
  isRevealed: boolean;
}

export const CHARACTER_LABELS: Record<Character, string> = {
  [Character.DUKE]: 'Duke',
  [Character.ASSASSIN]: 'Assassin',
  [Character.CAPTAIN]: 'Captain',
  [Character.AMBASSADOR]: 'Ambassador',
  [Character.CONTESSA]: 'Contessa',
};

export const CHARACTER_COLORS: Record<Character, string> = {
  [Character.DUKE]: '#7B2D8E',
  [Character.ASSASSIN]: '#1A1A2E',
  [Character.CAPTAIN]: '#1565C0',
  [Character.AMBASSADOR]: '#2E7D32',
  [Character.CONTESSA]: '#C62828',
};

export const CHARACTER_ABILITIES: Record<Character, string> = {
  [Character.DUKE]: 'Tax — Take 3 coins. Blocks Foreign Aid.',
  [Character.ASSASSIN]: 'Assassinate — Pay 3 coins to kill an influence.',
  [Character.CAPTAIN]: 'Steal — Take 2 coins from another player. Blocks Stealing.',
  [Character.AMBASSADOR]: 'Exchange — Swap cards with the Court Deck. Blocks Stealing.',
  [Character.CONTESSA]: 'Blocks Assassination.',
};
