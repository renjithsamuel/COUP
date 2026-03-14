import { describe, it, expect } from "vitest";
import { render } from "@/utils/testUtils";
import { ActionButton } from "@/components/ActionButton";
import { ActionType } from "@/models/action";

describe("ActionButton", () => {
  it("renders the action label", () => {
    const { getByText } = render(
      <ActionButton actionType={ActionType.TAX} onClick={() => {}} />,
    );
    expect(getByText("Tax")).toBeTruthy();
  });

  it("shows cost badge for actions with cost", () => {
    const { getByText } = render(
      <ActionButton actionType={ActionType.ASSASSINATE} onClick={() => {}} />,
    );
    expect(getByText("3c")).toBeTruthy();
  });

  it("is disabled when player cannot afford", () => {
    const { getByRole } = render(
      <ActionButton
        actionType={ActionType.COUP}
        onClick={() => {}}
        playerCoins={3}
      />,
    );
    const btn = getByRole("button");
    expect(btn.getAttribute("disabled")).not.toBeNull();
  });

  it("has aria-label with cost info", () => {
    const { getByLabelText } = render(
      <ActionButton actionType={ActionType.ASSASSINATE} onClick={() => {}} />,
    );
    expect(getByLabelText("Assassinate, 3 coins")).toBeTruthy();
  });

  it("shows a compact bluff marker without extra text", () => {
    const { getByLabelText, queryByText } = render(
      <ActionButton actionType={ActionType.TAX} onClick={() => {}} isBluff />,
    );
    expect(getByLabelText("Bluff action")).toBeTruthy();
    expect(queryByText("Bluff")).toBeNull();
  });
});
