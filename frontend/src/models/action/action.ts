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
    description: 'Claim Duke — take 3 coins from the treasury.',
    cost: 0,
    characterRequired: Character.DUKE,
    isChallengeble: true,
    blockedBy: [],
    requiresTarget: false,
  },
  [ActionType.ASSASSINATE]: {
    type: ActionType.ASSASSINATE,
    label: 'Assassinate',
    description: 'Claim Assassin — pay 3 coins to kill an influence.',
    cost: 3,
    characterRequired: Character.ASSASSIN,
    isChallengeble: true,
    blockedBy: [Character.CONTESSA],
    requiresTarget: true,
  },
  [ActionType.STEAL]: {
    type: ActionType.STEAL,
    label: 'Steal',
    description: 'Claim Captain — take 2 coins from another player.',
    cost: 0,
    characterRequired: Character.CAPTAIN,
    isChallengeble: true,
    blockedBy: [Character.CAPTAIN, Character.AMBASSADOR],
    requiresTarget: true,
  },
  [ActionType.EXCHANGE]: {
    type: ActionType.EXCHANGE,
    label: 'Exchange',
    description: 'Claim Ambassador — swap cards with the Court Deck.',
    cost: 0,
    characterRequired: Character.AMBASSADOR,
    isChallengeble: true,
    blockedBy: [],
    requiresTarget: false,
  },
};
