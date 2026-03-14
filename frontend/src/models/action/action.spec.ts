import { describe, it, expect } from "vitest";
import { ActionType, ACTION_RULES } from "@/models/action";
import { Character } from "@/models/card";
import { GAME_CONSTANTS } from "@/utils/constants";

describe("ACTION_RULES", () => {
  it("has rules for all action types", () => {
    const types = Object.values(ActionType);
    types.forEach((t) => {
      expect(ACTION_RULES[t]).toBeDefined();
      expect(ACTION_RULES[t].type).toBe(t);
    });
  });

  it("coup costs match GAME_CONSTANTS", () => {
    expect(ACTION_RULES[ActionType.COUP].cost).toBe(GAME_CONSTANTS.COUP_COST);
  });

  it("assassinate costs match GAME_CONSTANTS", () => {
    expect(ACTION_RULES[ActionType.ASSASSINATE].cost).toBe(
      GAME_CONSTANTS.ASSASSINATE_COST,
    );
  });

  it("income and foreign aid have no cost", () => {
    expect(ACTION_RULES[ActionType.INCOME].cost).toBe(0);
    expect(ACTION_RULES[ActionType.FOREIGN_AID].cost).toBe(0);
  });

  it("duke blocks foreign aid", () => {
    expect(ACTION_RULES[ActionType.FOREIGN_AID].blockedBy).toContain(
      Character.DUKE,
    );
  });

  it("contessa blocks assassination", () => {
    expect(ACTION_RULES[ActionType.ASSASSINATE].blockedBy).toContain(
      Character.CONTESSA,
    );
  });

  it("captain and ambassador block stealing", () => {
    expect(ACTION_RULES[ActionType.STEAL].blockedBy).toContain(
      Character.CAPTAIN,
    );
    expect(ACTION_RULES[ActionType.STEAL].blockedBy).toContain(
      Character.AMBASSADOR,
    );
  });

  it("targeted actions require target", () => {
    expect(ACTION_RULES[ActionType.COUP].requiresTarget).toBe(true);
    expect(ACTION_RULES[ActionType.ASSASSINATE].requiresTarget).toBe(true);
    expect(ACTION_RULES[ActionType.STEAL].requiresTarget).toBe(true);
  });

  it("non-targeted actions do not require target", () => {
    expect(ACTION_RULES[ActionType.INCOME].requiresTarget).toBe(false);
    expect(ACTION_RULES[ActionType.TAX].requiresTarget).toBe(false);
    expect(ACTION_RULES[ActionType.EXCHANGE].requiresTarget).toBe(false);
    expect(ACTION_RULES[ActionType.FOREIGN_AID].requiresTarget).toBe(false);
  });
});
