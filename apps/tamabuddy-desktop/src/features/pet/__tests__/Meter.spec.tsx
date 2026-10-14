import { render, screen } from '@testing-library/react';

import { Meter } from '../components/Meter.js';

describe('Meter', () => {
  it('exposes the value and maximum through its accessible name', () => {
    render(<Meter label="fome" value={3} />);

    expect(screen.getByLabelText('fome: 3 de 4').textContent).toBe('■■■·');
  });
});
