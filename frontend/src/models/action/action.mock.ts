import { ActionType, ActionRule, ACTION_RULES } from "./action";

export const mockIncomeRule: ActionRule = ACTION_RULES[ActionType.INCOME];
export const mockCoupRule: ActionRule = ACTION_RULES[ActionType.COUP];
export const mockTaxRule: ActionRule = ACTION_RULES[ActionType.TAX];
export const mockAssassinateRule: ActionRule =
  ACTION_RULES[ActionType.ASSASSINATE];
export const mockStealRule: ActionRule = ACTION_RULES[ActionType.STEAL];
export const mockExchangeRule: ActionRule = ACTION_RULES[ActionType.EXCHANGE];
export const mockForeignAidRule: ActionRule =
  ACTION_RULES[ActionType.FOREIGN_AID];

export const mockAllRules: ActionRule[] = Object.values(ACTION_RULES);
