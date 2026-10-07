import { render, screen } from '@testing-library/react';

import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';

import { MASCOT_CATALOG } from '../catalog/index.js';
import { MascotSprite } from '../MascotSprite.js';
import { PingoSprite } from '../PingoSprite.js';

describe('MascotSprite', () => {
  const state = Tamabuddy.create(TamabuddyId.create('pingo'), 0).snapshot();

  it('renders the stable visual selected from the engine snapshot', () => {
    const { container } = render(<PingoSprite state={state} />);

    expect(container.querySelector('[data-visual="idle"]')).not.toBeNull();
    expect(
      screen.getByText('Pingo observa tudo com curiosidade.'),
    ).toBeTruthy();
  });

  it('renders a transient reaction above the stable visual', () => {
    const { container } = render(
      <PingoSprite reaction="playing" state={state} />,
    );

    expect(container.querySelector('[data-visual="playing"]')).not.toBeNull();
    expect(screen.getByText('Pingo está brincando.')).toBeTruthy();
  });

  it.each(MASCOT_CATALOG)(
    'renders the $name production manifest',
    (manifest) => {
      const { container } = render(
        <MascotSprite manifest={manifest} state={state} />,
      );

      expect(
        container.querySelector(`[data-mascot="${manifest.id}"]`),
      ).not.toBeNull();
    },
  );
});
