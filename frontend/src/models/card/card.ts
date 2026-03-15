export enum Character {
  DUKE = "duke",
  ASSASSIN = "assassin",
  CAPTAIN = "captain",
  AMBASSADOR = "ambassador",
  CONTESSA = "contessa",
}

export interface Card {
  character: Character;
  isRevealed: boolean;
}

export const CHARACTER_LABELS: Record<Character, string> = {
  [Character.DUKE]: "Duke",
  [Character.ASSASSIN]: "Assassin",
  [Character.CAPTAIN]: "Captain",
  [Character.AMBASSADOR]: "Ambassador",
  [Character.CONTESSA]: "Contessa",
};

export const CHARACTER_TEXT_COLORS: Record<Character, string> = {
  [Character.DUKE]: "#CE93D8",
  [Character.ASSASSIN]: "#90A4AE",
  [Character.CAPTAIN]: "#64B5F6",
  [Character.AMBASSADOR]: "#81C784",
  [Character.CONTESSA]: "#EF9A9A",
};

export const CHARACTER_COLORS: Record<Character, string> = {
  [Character.DUKE]: "#7B2D8E",
  [Character.ASSASSIN]: "#1A1A2E",
  [Character.CAPTAIN]: "#1565C0",
  [Character.AMBASSADOR]: "#2E7D32",
  [Character.CONTESSA]: "#C62828",
};

export const CHARACTER_ABILITIES: Record<Character, string> = {
  [Character.DUKE]: "Tax — Take 3 coins. Blocks Foreign Aid.",
  [Character.ASSASSIN]: "Assassinate — Pay 3 coins to kill an influence.",
  [Character.CAPTAIN]:
    "Steal — Take 2 coins from another player. Blocks Stealing.",
  [Character.AMBASSADOR]:
    "Exchange — Swap cards with the Court Deck. Blocks Stealing.",
  [Character.CONTESSA]: "Blocks Assassination.",
};

export interface CharacterGuideSegment {
  text: string;
  tone?: "plain" | "action" | "card";
}

export interface CharacterGuideDetail {
  actionLabel: string;
  segments: CharacterGuideSegment[];
}

export const CHARACTER_GUIDE_DETAILS: Record<Character, CharacterGuideDetail> =
  {
    [Character.DUKE]: {
      actionLabel: "Tax",
      segments: [
        { text: "Take 3 coins. Blocks " },
        { text: "Foreign Aid", tone: "action" },
        { text: "." },
      ],
    },
    [Character.ASSASSIN]: {
      actionLabel: "Assassinate",
      segments: [
        { text: "Pay 3 coins to force a target to lose an influence." },
      ],
    },
    [Character.CAPTAIN]: {
      actionLabel: "Steal",
      segments: [
        { text: "Take 2 coins from another player. Blocks " },
        { text: "Steal", tone: "action" },
        { text: "." },
      ],
    },
    [Character.AMBASSADOR]: {
      actionLabel: "Exchange",
      segments: [
        { text: "Swap cards with the Court Deck. Blocks " },
        { text: "Steal", tone: "action" },
        { text: "." },
      ],
    },
    [Character.CONTESSA]: {
      actionLabel: "Block Assassinate",
      segments: [
        { text: "Stops " },
        { text: "Assassinate", tone: "action" },
        { text: " against you." },
      ],
    },
  };
