import { fireEvent, render, screen, within } from '@testing-library/react';

import { LifeLab } from '../LifeLab.js';

function configureShortRandomLife(seed = 7): void {
  fireEvent.change(screen.getByLabelText('Duration'), {
    target: { value: '2' },
  });
  fireEvent.change(screen.getByLabelText('Duration unit'), {
    target: { value: 'hours' },
  });
  fireEvent.change(screen.getByLabelText('Seed'), {
    target: { value: String(seed) },
  });
  fireEvent.change(screen.getByLabelText('Response probability'), {
    target: { value: '0' },
  });
  fireEvent.change(screen.getByLabelText('Maximum response delay'), {
    target: { value: '0' },
  });
}

describe('LifeLab', () => {
  it('renders its empty state and reports invalid configuration', async () => {
    render(<LifeLab />);
    expect(screen.getByText('No life loaded')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run simulation' }));

    expect(
      await screen.findByText(/Duration must be an integer from 1 to 30 days/),
    ).toBeTruthy();
  });

  it('runs, filters, expands, copies, and exactly replays a configured life', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<LifeLab />);
    configureShortRandomLife();

    fireEvent.click(screen.getByRole('button', { name: 'Run simulation' }));
    expect(screen.getByRole('status')).toBeTruthy();
    const summary = await screen.findByRole('heading', {
      name: 'Simulation summary',
    });
    const summarySection = summary.closest('section');
    expect(summarySection).not.toBeNull();
    expect(within(summarySection as HTMLElement).getByText('7')).toBeTruthy();
    expect(
      within(summarySection as HTMLElement).getByText('2h 0m'),
    ).toBeTruthy();

    const firstFinalState = screen.getByTestId(
      'life-lab-final-state',
    ).textContent;
    const replay = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Replay descriptor',
    });
    const descriptor = JSON.parse(replay.value) as {
      seed: number;
      until: number;
    };
    expect(descriptor).toMatchObject({ seed: 7, until: 7_200_000 });

    fireEvent.change(screen.getByLabelText('Timeline filter'), {
      target: { value: 'lifecycle' },
    });
    const evolvedEvent = await screen.findByRole('button', {
      name: /evolved/i,
    });
    fireEvent.click(evolvedEvent);
    expect(screen.getByLabelText('Event details')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith(replay.value);

    fireEvent.click(screen.getByRole('button', { name: 'Rerun replay' }));
    expect(await screen.findByText('Replay reproduced exactly.')).toBeTruthy();
    expect(screen.getByTestId('life-lab-final-state').textContent).toBe(
      firstFinalState,
    );
  });

  it('shows bounded batch invariant failures with their seed', async () => {
    render(<LifeLab />);
    fireEvent.change(screen.getByLabelText('Response probability'), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText('Batch runs'), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Run batch' }));

    const results = await screen.findByRole('heading', {
      name: 'Batch results',
    });
    const section = results.closest('section');
    expect(section).not.toBeNull();
    expect(within(section as HTMLElement).getByText('FAIL')).toBeTruthy();
    expect(
      within(section as HTMLElement).getByText(/Seed 0 · survives-duration/),
    ).toBeTruthy();
  });
});
