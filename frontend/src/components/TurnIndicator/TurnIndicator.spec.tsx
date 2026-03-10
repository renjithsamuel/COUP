import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/utils/testUtils';
import { TurnIndicator } from '@/components/TurnIndicator';

describe('TurnIndicator', () => {
  it('shows "Your turn!" when it is the player turn', () => {
    render(<TurnIndicator currentPlayerName="Alice" isMyTurn turnNumber={3} />);
    expect(screen.getByText('Your turn!')).toBeTruthy();
  });

  it('shows opponent name when not my turn', () => {
    render(<TurnIndicator currentPlayerName="Bob" isMyTurn={false} turnNumber={5} />);
    expect(screen.getByText("Bob's turn")).toBeTruthy();
  });

  it('shows the turn number', () => {
    render(<TurnIndicator currentPlayerName="Alice" isMyTurn turnNumber={7} />);
    expect(screen.getByText('Turn 7')).toBeTruthy();
  });
});
