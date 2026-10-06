import { render, screen } from '@testing-library/react';

import App from '../app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App developerMode={false} />);
    expect(baseElement).toBeTruthy();
  });

  it('should identify the application', () => {
    const { getByRole } = render(<App developerMode={false} />);
    expect(getByRole('heading', { name: 'Tamabuddy' })).toBeTruthy();
  });

  it('should render the authoritative engine behavior', () => {
    const { getByText } = render(<App developerMode={false} />);
    expect(getByText('egg')).toBeTruthy();
  });

  it('gates the Life Lab behind developer mode', async () => {
    const { rerender } = render(<App developerMode={false} />);
    expect(screen.queryByRole('heading', { name: 'Life Lab' })).toBeNull();

    rerender(<App developerMode />);
    expect(
      await screen.findByRole('heading', { name: 'Life Lab' }),
    ).toBeTruthy();
  });
});
