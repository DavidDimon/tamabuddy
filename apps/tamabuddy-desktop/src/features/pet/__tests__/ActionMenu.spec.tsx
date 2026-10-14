import { fireEvent, render, screen } from '@testing-library/react';

import type { DesktopPet } from '../../../entities/pet/index.js';
import { ActionMenu } from '../components/ActionMenu.js';

const READY_PET: DesktopPet = {
  behavior: 'idle',
  createdAt: 0,
  happiness: 4,
  health: 4,
  hunger: 4,
  isIll: false,
  lastProcessedAt: 0,
  needsAttention: false,
  poopCount: 0,
  stage: 'baby',
};

describe('ActionMenu', () => {
  it('dispatches actions by click and keyboard shortcut', () => {
    const onAction = vi.fn();
    render(<ActionMenu state={READY_PET} onAction={onAction} />);

    fireEvent.click(screen.getByRole('button', { name: /Comida/ }));
    fireEvent.keyDown(window, { key: '2' });
    fireEvent.keyDown(window, { key: 'x' });

    expect(onAction.mock.calls).toEqual([['feedMeal'], ['play']]);
  });

  it.each([
    ['the operation is disabled', { disabled: true, state: READY_PET }],
    [
      'the pet is dead',
      { disabled: false, state: { ...READY_PET, behavior: 'dead' as const } },
    ],
  ])('blocks actions when %s', (_, props) => {
    const onAction = vi.fn();
    render(<ActionMenu {...props} onAction={onAction} />);

    fireEvent.click(screen.getByRole('button', { name: /Comida/ }));
    fireEvent.keyDown(window, { key: '1' });

    expect(onAction).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole('button')
        .every((button) => (button as HTMLButtonElement).disabled),
    ).toBe(true);
  });
});
