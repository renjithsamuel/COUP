import { Character } from '../card/card';

export enum ActionType {
  INCOME = 'income',
  FOREIGN_AID = 'foreign_aid',
  COUP = 'coup',
  TAX = 'tax',
  ASSASSINATE = 'assassinate',
  STEAL = 'steal',
  EXCHANGE = 'exchange',
}

export interface ActionRule {
  type: ActionType;
  label: string;
  description: string;
  cost: number;
  characterRequired: Character | null;
  isChallengeble: boolean;
  blockedBy: Character[];
  requiresTarget: boolean;
}

export interface ActionPresentation {
  accent: string;
  tint: string;
  icon: 'income' | 'aid' | 'coup' | 'tax' | 'assassinate' | 'steal' | 'exchange';
}

/**
 * Single source of truth for all action rules on the frontend.
 * Mirrors backend ACTION_RULES.
 */
export const ACTION_RULES: Record<ActionType, ActionRule> = {
  [ActionType.INCOME]: {
    type: ActionType.INCOME,
    label: 'Income',
    description: 'Take 1 coin from the treasury.',
    cost: 0,
    characterRequired: null,
    isChallengeble: false,
    blockedBy: [],
    requiresTarget: false,
  },
  [ActionType.FOREIGN_AID]: {
    type: ActionType.FOREIGN_AID,
    label: 'Foreign Aid',
    description: 'Take 2 coins from the treasury.',
    cost: 0,
    characterRequired: null,
    isChallengeble: false,
    blockedBy: [Character.DUKE],
    requiresTarget: false,
  },
  [ActionType.COUP]: {
    type: ActionType.COUP,
    label: 'Coup',
    description: 'Pay 7 coins to force a player to lose an influence.',
    cost: 7,
    characterRequired: null,
    isChallengeble: false,
    blockedBy: [],
    requiresTarget: true,
  },
  [ActionType.TAX]: {
    type: ActionType.TAX,
    label: 'Tax',
    description: 'Bluff Duke — take 3 coins from the treasury.',
    cost: 0,
    characterRequired: Character.DUKE,
    isChallengeble: true,
    blockedBy: [],
    requiresTarget: false,
  },
  [ActionType.ASSASSINATE]: {
    type: ActionType.ASSASSINATE,
    label: 'Assassinate',
    description: 'Bluff Assassin — pay 3 coins to kill an influence.',
    cost: 3,
    characterRequired: Character.ASSASSIN,
    isChallengeble: true,
    blockedBy: [Character.CONTESSA],
    requiresTarget: true,
  },
  [ActionType.STEAL]: {
    type: ActionType.STEAL,
    label: 'Steal',
    description: 'Bluff Captain — take 2 coins from another player.',
    cost: 0,
    characterRequired: Character.CAPTAIN,
    isChallengeble: true,
    blockedBy: [Character.CAPTAIN, Character.AMBASSADOR],
    requiresTarget: true,
  },
  [ActionType.EXCHANGE]: {
    type: ActionType.EXCHANGE,
    label: 'Exchange',
    description: 'Bluff Ambassador — swap cards with the Court Deck.',
    cost: 0,
    characterRequired: Character.AMBASSADOR,
    isChallengeble: true,
    blockedBy: [],
    requiresTarget: false,
  },
};

export const ACTION_PRESENTATIONS: Record<ActionType, ActionPresentation> = {
  [ActionType.INCOME]: {
    accent: '#D8B24A',
    tint: 'rgba(216, 178, 74, 0.14)',
    icon: 'income',
  },
  [ActionType.FOREIGN_AID]: {
    accent: '#7DB8D6',
    tint: 'rgba(125, 184, 214, 0.15)',
    icon: 'aid',
  },
  [ActionType.COUP]: {
    accent: '#E77F67',
    tint: 'rgba(231, 127, 103, 0.15)',
    icon: 'coup',
  },
  [ActionType.TAX]: {
    accent: '#C79AE8',
    tint: 'rgba(199, 154, 232, 0.16)',
    icon: 'tax',
  },
  [ActionType.ASSASSINATE]: {
    accent: '#E96A74',
    tint: 'rgba(233, 106, 116, 0.15)',
    icon: 'assassinate',
  },
  [ActionType.STEAL]: {
    accent: '#65B5E8',
    tint: 'rgba(101, 181, 232, 0.15)',
    icon: 'steal',
  },
  [ActionType.EXCHANGE]: {
    accent: '#6FC59B',
    tint: 'rgba(111, 197, 155, 0.15)',
    icon: 'exchange',
  },
};
