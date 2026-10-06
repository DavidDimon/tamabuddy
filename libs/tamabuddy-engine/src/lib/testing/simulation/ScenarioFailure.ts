import { LifeTimeline } from './LifeTimeline.js';

export interface ScenarioFailureDetails {
  readonly scenarioName: string;
  readonly offset: number;
  readonly origin?: number;
  readonly reason: string;
  readonly expected?: unknown;
  readonly actual?: unknown;
  readonly timeline?: LifeTimeline;
}

export class ScenarioFailure extends Error {
  readonly scenarioName: string;
  readonly offset: number;
  readonly at?: number;

  constructor(details: ScenarioFailureDetails) {
    super(formatFailure(details));
    this.name = 'ScenarioFailure';
    this.scenarioName = details.scenarioName;
    this.offset = details.offset;
    this.at =
      details.origin === undefined
        ? undefined
        : details.origin + details.offset;
  }
}

function formatFailure(details: ScenarioFailureDetails): string {
  const absolute =
    details.origin === undefined
      ? 'unavailable'
      : String(details.origin + details.offset);
  const lines = [
    `Scenario "${details.scenarioName}" failed`,
    `Relative offset: ${details.offset}`,
    `Absolute time: ${absolute}`,
    `Reason: ${details.reason}`,
  ];

  if ('expected' in details) {
    lines.push(`Expected: ${formatValue(details.expected)}`);
  }
  if ('actual' in details) {
    lines.push(`Actual: ${formatValue(details.actual)}`);
  }
  lines.push(
    `Recent timeline:\n${recentTimeline(details.timeline, details.offset)}`,
  );
  return lines.join('\n');
}

function recentTimeline(
  timeline: LifeTimeline | undefined,
  offset: number,
): string {
  if (timeline === undefined) return '  unavailable';
  const entries = timeline.entries
    .filter((entry) => entry.offset <= offset)
    .slice(-5);
  if (entries.length === 0) return '  (no entries)';
  return entries
    .map((entry) => {
      const label = entry.kind === 'snapshot' ? 'snapshot' : entry.type;
      return `  ${label} at absolute ${entry.at}, offset ${entry.offset}`;
    })
    .join('\n');
}

function formatValue(value: unknown): string {
  const serialized = JSON.stringify(value, null, 2);
  return serialized ?? String(value);
}
