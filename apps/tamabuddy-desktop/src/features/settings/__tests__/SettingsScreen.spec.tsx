import { fireEvent, render, screen } from '@testing-library/react';

import { SettingsScreen } from '../SettingsScreen.js';

describe('SettingsScreen', () => {
  it('returns to the game when Escape is pressed', () => {
    const onBack = vi.fn();
    render(
      <SettingsScreen
        canHatchNow
        onBack={onBack}
        onHatchNow={() => Promise.resolve()}
        onReset={() => Promise.resolve()}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('keeps settings open and reports a failed reset', async () => {
    render(
      <SettingsScreen
        canHatchNow
        onBack={() => undefined}
        onHatchNow={() => Promise.resolve()}
        onReset={() => Promise.reject(new Error('write failed'))}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Reiniciar jogo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reset' }));

    expect(
      await screen.findByText(
        'Não foi possível reiniciar o jogo. Tente novamente.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Confirmar reset' }),
    ).toBeTruthy();
  });

  it('moves focus into the reset confirmation', () => {
    render(
      <SettingsScreen
        canHatchNow
        onBack={() => undefined}
        onHatchNow={() => Promise.resolve()}
        onReset={() => Promise.resolve()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Reiniciar jogo/ }));

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Cancelar' }),
    );
  });

  it('reports a failed quick hatch and keeps the action available', async () => {
    render(
      <SettingsScreen
        canHatchNow
        onBack={() => undefined}
        onHatchNow={() => Promise.reject(new Error('write failed'))}
        onReset={() => Promise.resolve()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Chocar agora/ }));

    expect(
      await screen.findByText(
        'Não foi possível chocar o ovo agora. Tente novamente.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /Chocar agora/ })).toBeTruthy();
  });

  it('disables quick hatch after the egg stage', () => {
    render(
      <SettingsScreen
        canHatchNow={false}
        onBack={() => undefined}
        onHatchNow={() => Promise.resolve()}
        onReset={() => Promise.resolve()}
      />,
    );

    expect(
      (
        screen.getByRole('button', {
          name: /Chocar agora/,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
