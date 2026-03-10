import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/utils/testUtils';
import { ActionButton } from '@/components/ActionButton';
import { ActionType } from '@/models/action';

describe('ActionButton', () => {
  it('renders the action label', () => {
    render(<ActionButton actionType={ActionType.TAX} onClick={() => {}} />);
    expect(screen.getByText('Tax')).toBeTruthy();
  });

  it('shows cost badge for actions with cost', () => {
    render(<ActionButton actionType={ActionType.ASSASSINATE} onClick={() => {}} />);
    expect(screen.getByText('💰3')).toBeTruthy();
  });

  it('is disabled when player cannot afford', () => {
    render(
      <ActionButton actionType={ActionType.COUP} onClick={() => {}} playerCoins={3} />,
    );
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('disabled')).not.toBeNull();
  });

  it('has aria-label with cost info', () => {
    render(<ActionButton actionType={ActionType.ASSASSINATE} onClick={() => {}} />);
    expect(screen.getByLabelText('Assassinate (3 coins)')).toBeTruthy();
  });
});
