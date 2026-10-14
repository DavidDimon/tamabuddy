import { fireEvent, render, screen } from '@testing-library/react';

import { PINGO_MANIFEST } from '../features/mascot/catalog/pingo.js';
import { toDesktopPet } from '../features/pet/model/toDesktopPet.js';
import { tamabuddyDesktopClient } from '../features/pet/services/TamabuddyDesktopClient.js';
import { GameView } from './GameView.js';

describe('GameView', () => {
  it('renders the care composition and delegates opening settings', () => {
    const onOpenSettings = vi.fn();

    render(
      <GameView
        busy={false}
        disabled={false}
        hatchDeadline={null}
        manifest={PINGO_MANIFEST}
        message="Tudo certo."
        messageIsError={false}
        onAction={() => undefined}
        onOpenSettings={onOpenSettings}
        onRefresh={() => undefined}
        reaction={null}
        state={toDesktopPet(tamabuddyDesktopClient.getSnapshot().state)}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Cuidados' })).toBeTruthy();
    expect(screen.getByLabelText(/fome: \d de 4/)).toBeTruthy();
    expect(screen.getByText('Tudo certo.')).toBeTruthy();
    expect(screen.getByRole('main').getAttribute('aria-busy')).toBe('false');

    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir configurações' }),
    );
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('announces loading and error feedback', () => {
    const state = toDesktopPet(tamabuddyDesktopClient.getSnapshot().state);
    const { rerender } = render(
      <GameView
        busy
        disabled
        hatchDeadline={null}
        manifest={PINGO_MANIFEST}
        message="Seu mascote está chegando..."
        messageIsError={false}
        onAction={() => undefined}
        onOpenSettings={() => undefined}
        onRefresh={() => undefined}
        reaction={null}
        state={state}
      />,
    );

    expect(screen.getByRole('main').getAttribute('aria-busy')).toBe('true');
    expect(screen.getByText('Seu mascote está chegando...')).toBeTruthy();

    rerender(
      <GameView
        busy={false}
        disabled
        hatchDeadline={null}
        manifest={PINGO_MANIFEST}
        message="Não foi possível carregar o save local."
        messageIsError
        onAction={() => undefined}
        onOpenSettings={() => undefined}
        onRefresh={() => undefined}
        reaction={null}
        state={state}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain('Não foi possível');
  });
});
