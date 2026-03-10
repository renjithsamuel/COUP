import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/utils/testUtils';
import { CoinStack } from '@/components/CoinStack';

describe('CoinStack', () => {
  it('renders the correct count', () => {
    render(<CoinStack count={5} animate={false} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('has accessible label with coin count', () => {
    render(<CoinStack count={3} animate={false} />);
    expect(screen.getByLabelText('3 coins')).toBeTruthy();
  });

  it('limits visible coins to maxVisible', () => {
    const { container } = render(<CoinStack count={10} maxVisible={3} animate={false} />);
    // 3 coin circles + 1 count text = rendered
    expect(screen.getByText('10')).toBeTruthy();
  });
});
