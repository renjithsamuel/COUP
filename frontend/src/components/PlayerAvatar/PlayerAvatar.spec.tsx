import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/utils/testUtils";
import { PlayerAvatar } from "@/components/PlayerAvatar";

describe("PlayerAvatar", () => {
  it("renders player initial", () => {
    render(<PlayerAvatar name="Alice" isActive={false} isAlive />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("shows active turn in aria-label", () => {
    render(<PlayerAvatar name="Bob" isActive isAlive />);
    expect(screen.getByLabelText("Bob (active turn)")).toBeTruthy();
  });

  it("shows eliminated in aria-label when not alive", () => {
    render(<PlayerAvatar name="Charlie" isActive={false} isAlive={false} />);
    expect(screen.getByLabelText("Charlie (eliminated)")).toBeTruthy();
  });

  it("shows in-play status for an alive inactive player", () => {
    render(<PlayerAvatar name="Diana" isActive={false} isAlive />);
    expect(screen.getByText("In play")).toBeTruthy();
  });
});
