import { render } from '@testing-library/react';

import App from '../app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should identify the application', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('heading', { name: 'Tamabuddy' })).toBeTruthy();
  });

  it('should render the authoritative engine behavior', () => {
    const { getByText } = render(<App />);
    expect(getByText('egg')).toBeTruthy();
  });
});
