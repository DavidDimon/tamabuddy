import { useEffect, useRef, useState } from 'react';

const SECOND_MS = 1_000;

export interface HatchCountdownProps {
  readonly deadline: number;
  readonly onElapsed: () => void;
}

export function HatchCountdown({ deadline, onElapsed }: HatchCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() => remaining(deadline));
  const elapsedDeadline = useRef<number | null>(null);

  useEffect(() => {
    let interval: number | undefined;
    const update = () => {
      const nextRemaining = remaining(deadline);
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0 && elapsedDeadline.current !== deadline) {
        elapsedDeadline.current = deadline;
        onElapsed();
        if (interval !== undefined) window.clearInterval(interval);
      }
    };

    update();
    if (deadline > Date.now()) {
      interval = window.setInterval(update, SECOND_MS);
    }
    return () => {
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [deadline, onElapsed]);

  const totalSeconds = Math.ceil(remainingMs / SECOND_MS);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <p className="hatch-countdown">
      <span>o ovo choca em</span>
      <output aria-label={`Tempo até o ovo chocar: ${formatted}`}>
        {formatted}
      </output>
    </p>
  );
}

function remaining(deadline: number): number {
  return Math.max(0, deadline - Date.now());
}
