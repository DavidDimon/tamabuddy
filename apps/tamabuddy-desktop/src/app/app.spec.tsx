import { act, render, screen } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders Pingo and the persistent care menu', async () => {
    render(<App />);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    expect(screen.getByText('PINGO')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Cuidados' })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });
});
