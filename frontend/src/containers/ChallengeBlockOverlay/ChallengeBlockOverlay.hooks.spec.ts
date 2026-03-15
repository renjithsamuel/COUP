import { describe, expect, it } from "vitest";
import { Character } from "@/models/card";
import { getBlockOptions } from "./ChallengeBlockOverlay.hooks";

describe("getBlockOptions", () => {
  it("does not mark duke as a bluff when the player can really block foreign aid", () => {
    const options = getBlockOptions([Character.DUKE], [Character.DUKE]);

    expect(options).toEqual([{ character: Character.DUKE, isBluff: false }]);
  });

  it("marks only the missing steal block roles as bluff", () => {
    const options = getBlockOptions(
      [Character.CAPTAIN, Character.AMBASSADOR],
      [Character.CAPTAIN],
    );

    expect(options).toEqual([
      { character: Character.CAPTAIN, isBluff: false },
      { character: Character.AMBASSADOR, isBluff: true },
    ]);
  });

  it("marks contessa as a bluff when the player cannot block assassination honestly", () => {
    const options = getBlockOptions([Character.CONTESSA], [Character.DUKE]);

    expect(options).toEqual([
      { character: Character.CONTESSA, isBluff: true },
    ]);
  });
});