import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/utils/testUtils";
import { Card } from "./Card";
import { Character } from "@/models/card";

describe("Card", () => {
  it("renders the character label face up", () => {
    render(<Card character={Character.DUKE} />);
    expect(screen.getByText("Duke")).toBeTruthy();
  });

  it("shows REVEALED text when card is revealed", () => {
    render(<Card character={Character.ASSASSIN} isRevealed />);
    expect(screen.getByText("REVEALED")).toBeTruthy();
  });

  it("has hidden card aria-label when face down", () => {
    render(<Card character={Character.CAPTAIN} isFaceDown />);
    expect(screen.getByRole("button", { name: "Hidden card" })).toBeTruthy();
  });

  it("has character aria-label when face up", () => {
    render(<Card character={Character.CONTESSA} />);
    expect(screen.getByRole("button", { name: "Contessa card" })).toBeTruthy();
  });
});
