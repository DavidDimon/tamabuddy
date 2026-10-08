import { act, render, screen } from '@testing-library/react';

import { HatchCountdown } from '../HatchCountdown.js';

describe('HatchCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the visible remaining time every second', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    render(<HatchCountdown deadline={301_000} onElapsed={() => undefined} />);

    expect(screen.getByText('05:00')).toBeTruthy();

    act(() => vi.advanceTimersByTime(1_000));

    expect(screen.getByText('04:59')).toBeTruthy();
  });

  it('requests elapsed-time processing once when the deadline arrives', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onElapsed = vi.fn();
    render(<HatchCountdown deadline={2_000} onElapsed={onElapsed} />);

    act(() => vi.advanceTimersByTime(2_000));
    act(() => vi.advanceTimersByTime(5_000));

    expect(screen.getByText('00:00')).toBeTruthy();
    expect(onElapsed).toHaveBeenCalledTimes(1);
  });
});
