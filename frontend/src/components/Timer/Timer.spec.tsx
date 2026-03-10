import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/utils/testUtils';
import { Timer } from '@/components/Timer';

describe('Timer', () => {
  it('renders remaining seconds', () => {
    render(<Timer remaining={15} progress={0.5} />);
    expect(screen.getByText('15s')).toBeTruthy();
  });

  it('has accessible timer role', () => {
    render(<Timer remaining={10} progress={0.33} />);
    expect(screen.getByRole('timer')).toBeTruthy();
  });
});
