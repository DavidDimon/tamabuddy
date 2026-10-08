import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { desktopPreferencesStore } from '../features/settings/DesktopPreferencesStore.js';

import App from './app';

describe('App', () => {
  beforeEach(() => {
    desktopPreferencesStore.clear();
  });

  it('asks the player to choose a mascot on first use', () => {
    render(<App />);

    expect(screen.getByText('Escolha seu mascote')).toBeTruthy();
    expect(
      screen.getByRole('region', { name: 'Mascotes disponíveis' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });

  it('persists a selection and opens the care screen', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Nexo' }));
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    expect(screen.getByText('Nexo')).toBeTruthy();
    const careMenu = screen.getByRole('navigation', { name: 'Cuidados' });
    expect(within(careMenu).getAllByRole('button')).toHaveLength(6);
    expect(desktopPreferencesStore.getMascotId()).toBe('nexo');
  });

  it('restores the selected mascot without showing onboarding', async () => {
    desktopPreferencesStore.setMascotId('broto');

    const { container } = render(<App />);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    expect(screen.queryByText('Escolha seu mascote')).toBeNull();
    expect(screen.getByText('Broto')).toBeTruthy();
    expect(container.querySelector('[data-mascot="broto"]')).not.toBeNull();
  });

  it('opens settings and requires confirmation before resetting', async () => {
    desktopPreferencesStore.setMascotId('pingo');
    render(<App />);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir configurações' }),
    );
    expect(screen.getByRole('heading', { name: 'Configurações' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Reiniciar jogo/ }));
    expect(screen.getByText('Reiniciar todo o progresso?')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Reiniciar todo o progresso?')).toBeNull();
    expect(desktopPreferencesStore.getMascotId()).toBe('pingo');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao jogo' }));
    expect(screen.getByRole('navigation', { name: 'Cuidados' })).toBeTruthy();
  });

  it('quick-hatches the egg from settings and returns to the game', async () => {
    desktopPreferencesStore.setMascotId('broto');
    render(<App />);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir configurações' }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Chocar agora/ }));

    expect(
      await screen.findByText('O ovo chocou antes do tempo!'),
    ).toBeTruthy();
    expect(screen.getByText('bebê')).toBeTruthy();
    expect(screen.queryByText('Configurações')).toBeNull();
  });

  it('resets the pet and returns to mascot selection', async () => {
    desktopPreferencesStore.setMascotId('mimo');
    render(<App />);
    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir configurações' }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Reiniciar jogo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reset' }));

    expect(await screen.findByText('Escolha seu mascote')).toBeTruthy();
    expect(desktopPreferencesStore.getMascotId()).toBeNull();
  });
});
