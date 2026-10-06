import { useMemo, useState } from 'react';
import {
  BatchSimulationRunner,
  createLifePreset,
  days,
  hours,
  neglectfulOwner,
  OwnerSimulationRunner,
  perfectOwner,
  randomOwner,
  replayRandomSimulation,
  runRandomSimulation,
  type BatchSimulationSummary,
  type LifePreset,
  type LifeTimeline,
  type RandomOwnerConfiguration,
  type RandomSimulationReplay,
} from '@tamabuddy/tamabuddy-engine/testing';

import { StateSeriesCharts } from './StateSeriesCharts.js';
import {
  filterTimelineEvents,
  formatOffset,
  type TimelineFilter,
} from './lifeLabModel.js';
import './LifeLab.css';

type OwnerChoice = 'random' | 'perfect' | 'neglectful';
type DurationUnit = 'hours' | 'days';
type PendingAction = 'simulation' | 'replay' | 'batch' | null;

interface SimulationMetadata {
  readonly preset: LifePreset | 'replay';
  readonly owner: OwnerChoice | 'replay';
  readonly duration: number;
  readonly seed?: number;
  readonly commands: number;
  readonly prngVersion?: string;
}

export function LifeLab() {
  const [preset, setPreset] = useState<LifePreset>('baby');
  const [durationAmount, setDurationAmount] = useState(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [owner, setOwner] = useState<OwnerChoice>('random');
  const [seed, setSeed] = useState(0);
  const [responseProbability, setResponseProbability] = useState(0.25);
  const [minimumDelay, setMinimumDelay] = useState(0);
  const [maximumDelay, setMaximumDelay] = useState(10);
  const [perfectDelay, setPerfectDelay] = useState(0);
  const [batchRuns, setBatchRuns] = useState(20);
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [timeline, setTimeline] = useState<LifeTimeline>();
  const [metadata, setMetadata] = useState<SimulationMetadata>();
  const [replayText, setReplayText] = useState('');
  const [batchSummary, setBatchSummary] = useState<BatchSimulationSummary>();
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<number>();

  const events = useMemo(
    () =>
      timeline === undefined ? [] : filterTimelineEvents(timeline, filter),
    [filter, timeline],
  );

  const duration = (): number =>
    durationUnit === 'days' ? days(durationAmount) : hours(durationAmount);
  const randomConfiguration = (): RandomOwnerConfiguration => ({
    responseProbability,
    minimumResponseDelay: minimumDelay * 60_000,
    maximumResponseDelay: maximumDelay * 60_000,
  });

  const begin = (action: Exclude<PendingAction, null>): void => {
    setPending(action);
    setError(undefined);
    setNotice(undefined);
  };

  const finish = (): void => setPending(null);

  const runSimulation = async (): Promise<void> => {
    begin('simulation');
    try {
      validateConfiguration();
      const until = duration();
      const initial = await createLifePreset(preset, `life-lab-${preset}`);

      if (owner === 'random') {
        const result = await runRandomSimulation({
          initial,
          seed,
          configuration: randomConfiguration(),
          until,
        });
        setTimeline(result.timeline);
        setReplayText(JSON.stringify(result.replay, null, 2));
        setMetadata({
          preset,
          owner,
          duration: until,
          seed,
          commands: result.replay.commands.length,
          prngVersion: result.replay.prngVersion,
        });
      } else {
        const strategy =
          owner === 'perfect'
            ? perfectOwner({ responseDelay: perfectDelay * 60_000 })
            : neglectfulOwner();
        const nextTimeline = await new OwnerSimulationRunner().run({
          initial,
          owner: strategy,
          until,
        });
        setTimeline(nextTimeline);
        setReplayText('');
        setMetadata({
          preset,
          owner,
          duration: until,
          commands: nextTimeline.events('command').length,
        });
      }
      setBatchSummary(undefined);
      setFilter('all');
      setSelectedEvent(undefined);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      finish();
    }
  };

  const rerunReplay = async (): Promise<void> => {
    begin('replay');
    try {
      const replay = parseReplay(replayText);
      const result = await replayRandomSimulation(replay);
      setTimeline(result.timeline);
      setReplayText(JSON.stringify(result.replay, null, 2));
      setMetadata({
        preset: 'replay',
        owner: 'replay',
        duration: result.replay.until,
        seed: result.replay.seed,
        commands: result.replay.commands.length,
        prngVersion: result.replay.prngVersion,
      });
      setFilter('all');
      setSelectedEvent(undefined);
      setNotice('Replay reproduced exactly.');
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      finish();
    }
  };

  const copyReplay = async (): Promise<void> => {
    try {
      if (replayText.length === 0) throw new Error('Run a random life first.');
      if (navigator.clipboard === undefined) {
        throw new Error('Clipboard access is unavailable in this browser.');
      }
      await navigator.clipboard.writeText(replayText);
      setNotice('Replay descriptor copied.');
      setError(undefined);
    } catch (caught) {
      setError(errorMessage(caught));
    }
  };

  const runBatch = async (): Promise<void> => {
    begin('batch');
    try {
      validateConfiguration();
      if (!Number.isInteger(batchRuns) || batchRuns < 1 || batchRuns > 100) {
        throw new RangeError('Batch runs must be an integer from 1 to 100.');
      }
      const lastSeed = seed + batchRuns - 1;
      if (lastSeed >= 0x1_0000_0000) {
        throw new RangeError('Batch seed range exceeds uint32.');
      }
      const initial = await createLifePreset(preset, `life-lab-${preset}`);
      const summary = await new BatchSimulationRunner().run({
        initial,
        seeds: { from: seed, to: lastSeed },
        until: duration(),
        strategyFactory: (currentSeed) =>
          randomOwner(currentSeed, randomConfiguration()),
        maximumConcurrency: Math.min(4, batchRuns),
        maximumRuns: 100,
        failureMode: 'collect-all',
        commandTailLength: 5,
        eventTailLength: 5,
        invariants: [
          {
            name: 'survives-duration',
            checkFinal: ({ state }) =>
              state.behavior === 'dead'
                ? 'Pet did not survive the configured duration'
                : undefined,
          },
        ],
      });
      setBatchSummary(summary);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      finish();
    }
  };

  const validateConfiguration = (): void => {
    const maximumDuration = durationUnit === 'days' ? 30 : 720;
    if (
      !Number.isInteger(durationAmount) ||
      durationAmount < 1 ||
      durationAmount > maximumDuration
    ) {
      throw new RangeError(
        `Duration must be an integer from 1 to ${maximumDuration} ${durationUnit}.`,
      );
    }
    if (!Number.isInteger(seed) || seed < 0 || seed >= 0x1_0000_0000) {
      throw new RangeError('Seed must be a uint32 integer.');
    }
    if (minimumDelay > maximumDelay) {
      throw new RangeError('Minimum delay cannot exceed maximum delay.');
    }
    if (
      !Number.isFinite(responseProbability) ||
      responseProbability < 0 ||
      responseProbability > 1
    ) {
      throw new RangeError('Response probability must be from 0 to 1.');
    }
    for (const [label, value] of [
      ['Minimum delay', minimumDelay],
      ['Maximum delay', maximumDelay],
      ['Perfect owner delay', perfectDelay],
    ] as const) {
      if (!Number.isInteger(value) || value < 0 || value > 15) {
        throw new RangeError(
          `${label} must be an integer from 0 to 15 minutes.`,
        );
      }
    }
  };

  const finalState = timeline?.finalState;

  return (
    <section
      className="life-lab"
      aria-labelledby="life-lab-title"
      data-bundle-marker="TAMABUDDY_LIFE_LAB"
    >
      <header className="life-lab__hero">
        <div>
          <p className="life-lab__eyebrow">Developer tool · deterministic</p>
          <h2 id="life-lab-title">Life Lab</h2>
          <p>
            Generate, inspect, and replay complete lives without changing the
            rules that produce them.
          </p>
        </div>
        <span className="life-lab__dev-badge">DEV ONLY</span>
      </header>

      <div className="life-lab__workspace">
        <aside
          className="life-lab__controls"
          aria-label="Simulation configuration"
        >
          <div className="life-lab__control-heading">
            <span>01</span>
            <div>
              <p className="life-lab__eyebrow">Inputs</p>
              <h3>Configure a life</h3>
            </div>
          </div>

          <label>
            Initial preset
            <select
              value={preset}
              onChange={(event) => setPreset(event.target.value as LifePreset)}
            >
              <option value="baby">Fresh baby</option>
              <option value="egg">New egg</option>
            </select>
          </label>

          <div className="life-lab__field-row">
            <label>
              Duration
              <input
                aria-label="Duration"
                type="number"
                min="1"
                max={durationUnit === 'days' ? 30 : 720}
                value={durationAmount}
                onChange={(event) =>
                  setDurationAmount(Number(event.target.value))
                }
              />
            </label>
            <label>
              Unit
              <select
                aria-label="Duration unit"
                value={durationUnit}
                onChange={(event) =>
                  setDurationUnit(event.target.value as DurationUnit)
                }
              >
                <option value="days">Days</option>
                <option value="hours">Hours</option>
              </select>
            </label>
          </div>

          <label>
            Owner strategy
            <select
              value={owner}
              onChange={(event) => setOwner(event.target.value as OwnerChoice)}
            >
              <option value="random">Random owner</option>
              <option value="perfect">Perfect owner</option>
              <option value="neglectful">Neglectful owner</option>
            </select>
          </label>

          {owner === 'random' && (
            <fieldset>
              <legend>Random owner options</legend>
              <label>
                Seed
                <input
                  aria-label="Seed"
                  type="number"
                  min="0"
                  max="4294967295"
                  value={seed}
                  onChange={(event) => setSeed(Number(event.target.value))}
                />
              </label>
              <label>
                Response probability
                <input
                  aria-label="Response probability"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={responseProbability}
                  onChange={(event) =>
                    setResponseProbability(Number(event.target.value))
                  }
                />
              </label>
              <div className="life-lab__field-row">
                <label>
                  Min delay (min)
                  <input
                    aria-label="Minimum response delay"
                    type="number"
                    min="0"
                    max="15"
                    value={minimumDelay}
                    onChange={(event) =>
                      setMinimumDelay(Number(event.target.value))
                    }
                  />
                </label>
                <label>
                  Max delay (min)
                  <input
                    aria-label="Maximum response delay"
                    type="number"
                    min="0"
                    max="15"
                    value={maximumDelay}
                    onChange={(event) =>
                      setMaximumDelay(Number(event.target.value))
                    }
                  />
                </label>
              </div>
            </fieldset>
          )}

          {owner === 'perfect' && (
            <label>
              Response delay (min)
              <input
                aria-label="Perfect owner response delay"
                type="number"
                min="0"
                max="15"
                value={perfectDelay}
                onChange={(event) =>
                  setPerfectDelay(Number(event.target.value))
                }
              />
            </label>
          )}

          <button
            className="life-lab__primary"
            disabled={pending !== null}
            onClick={() => void runSimulation()}
          >
            {pending === 'simulation' ? 'Running life…' : 'Run simulation'}
          </button>

          <div className="life-lab__batch">
            <div>
              <p className="life-lab__eyebrow">Bounded campaign</p>
              <h4>Survival invariant</h4>
            </div>
            <label>
              Runs (max 100)
              <input
                aria-label="Batch runs"
                type="number"
                min="1"
                max="100"
                value={batchRuns}
                onChange={(event) => setBatchRuns(Number(event.target.value))}
              />
            </label>
            <button
              disabled={pending !== null || owner !== 'random'}
              onClick={() => void runBatch()}
            >
              {pending === 'batch' ? 'Running batch…' : 'Run batch'}
            </button>
          </div>
        </aside>

        <div className="life-lab__results" aria-live="polite">
          {error !== undefined && (
            <div className="life-lab__alert life-lab__alert--error">
              {error}
            </div>
          )}
          {notice !== undefined && (
            <div className="life-lab__alert life-lab__alert--success">
              {notice}
            </div>
          )}

          {pending !== null && (
            <div className="life-lab__loading" role="status">
              <span /> Processing deterministic timeline…
            </div>
          )}

          {metadata === undefined && pending === null && (
            <div className="life-lab__empty">
              <span>◌</span>
              <h3>No life loaded</h3>
              <p>
                Choose a preset and run a simulation to reveal its timeline.
              </p>
            </div>
          )}

          {metadata !== undefined &&
            finalState !== undefined &&
            timeline !== undefined && (
              <>
                <section
                  className="life-lab__summary"
                  aria-labelledby="life-summary-title"
                >
                  <div className="life-lab__section-heading">
                    <div>
                      <p className="life-lab__eyebrow">Run metadata</p>
                      <h3 id="life-summary-title">Simulation summary</h3>
                    </div>
                    <span
                      className={`life-lab__behavior life-lab__behavior--${finalState.behavior}`}
                    >
                      {finalState.behavior}
                    </span>
                  </div>
                  <dl className="life-lab__metrics">
                    <div>
                      <dt>Preset</dt>
                      <dd>{metadata.preset}</dd>
                    </div>
                    <div>
                      <dt>Owner</dt>
                      <dd>{metadata.owner}</dd>
                    </div>
                    <div>
                      <dt>Duration</dt>
                      <dd>{formatOffset(metadata.duration)}</dd>
                    </div>
                    <div>
                      <dt>Seed</dt>
                      <dd>{metadata.seed ?? '—'}</dd>
                    </div>
                    <div>
                      <dt>Commands</dt>
                      <dd>{metadata.commands}</dd>
                    </div>
                    <div>
                      <dt>PRNG</dt>
                      <dd>{metadata.prngVersion ?? '—'}</dd>
                    </div>
                  </dl>
                  <div className="life-lab__final-grid">
                    <div>
                      <span>Stage</span>
                      <strong>{finalState.stage}</strong>
                    </div>
                    <div>
                      <span>Health</span>
                      <strong>{finalState.health}/4</strong>
                    </div>
                    <div>
                      <span>Hunger</span>
                      <strong>{finalState.hunger}/4</strong>
                    </div>
                    <div>
                      <span>Happiness</span>
                      <strong>{finalState.happiness}/4</strong>
                    </div>
                    <div>
                      <span>Weight</span>
                      <strong>{finalState.weight}</strong>
                    </div>
                    <div>
                      <span>Mistakes</span>
                      <strong>{finalState.careMistakes}</strong>
                    </div>
                  </div>
                  <pre
                    data-testid="life-lab-final-state"
                    className="life-lab__state-json"
                  >
                    {JSON.stringify(finalState, null, 2)}
                  </pre>
                </section>

                <StateSeriesCharts timeline={timeline} />

                <section
                  className="life-lab__timeline"
                  aria-labelledby="life-timeline-title"
                >
                  <div className="life-lab__section-heading">
                    <div>
                      <p className="life-lab__eyebrow">
                        Observed, never inferred
                      </p>
                      <h3 id="life-timeline-title">Event timeline</h3>
                    </div>
                    <label>
                      Filter
                      <select
                        aria-label="Timeline filter"
                        value={filter}
                        onChange={(event) => {
                          setFilter(event.target.value as TimelineFilter);
                          setSelectedEvent(undefined);
                        }}
                      >
                        <option value="all">All events</option>
                        <option value="commands">Commands</option>
                        <option value="care">Care</option>
                        <option value="lifecycle">Lifecycle</option>
                      </select>
                    </label>
                  </div>
                  <ol className="life-lab__event-list">
                    {events.map((event, index) => (
                      <li key={`${event.type}-${event.offset}-${index}`}>
                        <button
                          onClick={() =>
                            setSelectedEvent(
                              selectedEvent === index ? undefined : index,
                            )
                          }
                        >
                          <span
                            className={`life-lab__event-dot life-lab__event-dot--${event.type}`}
                          />
                          <span>
                            <strong>{event.type}</strong>
                            <small>{formatOffset(event.offset)}</small>
                          </span>
                          {event.type === 'command' && (
                            <em
                              className={
                                event.accepted ? 'is-accepted' : 'is-rejected'
                              }
                            >
                              {event.accepted ? 'accepted' : event.rejection}
                            </em>
                          )}
                        </button>
                        {selectedEvent === index && (
                          <pre aria-label="Event details">
                            {JSON.stringify(event, null, 2)}
                          </pre>
                        )}
                      </li>
                    ))}
                  </ol>
                  {events.length === 0 && (
                    <p className="life-lab__muted">
                      No events match this filter.
                    </p>
                  )}
                </section>

                <section
                  className="life-lab__replay"
                  aria-labelledby="life-replay-title"
                >
                  <div className="life-lab__section-heading">
                    <div>
                      <p className="life-lab__eyebrow">Portable reproduction</p>
                      <h3 id="life-replay-title">Replay descriptor</h3>
                    </div>
                    <div className="life-lab__button-row">
                      <button
                        disabled={replayText.length === 0}
                        onClick={() => void copyReplay()}
                      >
                        Copy
                      </button>
                      <button
                        disabled={replayText.length === 0 || pending !== null}
                        onClick={() => void rerunReplay()}
                      >
                        {pending === 'replay' ? 'Replaying…' : 'Rerun replay'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    aria-label="Replay descriptor"
                    value={replayText}
                    onChange={(event) => setReplayText(event.target.value)}
                    placeholder="Random-owner runs produce a replay descriptor here."
                    rows={12}
                  />
                </section>
              </>
            )}

          {batchSummary !== undefined && (
            <section
              className="life-lab__batch-results"
              aria-labelledby="batch-results-title"
            >
              <div className="life-lab__section-heading">
                <div>
                  <p className="life-lab__eyebrow">Invariant campaign</p>
                  <h3 id="batch-results-title">Batch results</h3>
                </div>
                <strong>
                  {batchSummary.failedRuns === 0 ? 'PASS' : 'FAIL'}
                </strong>
              </div>
              <p>
                {batchSummary.passedRuns} passed · {batchSummary.failedRuns}{' '}
                failed · {batchSummary.completedRuns} completed
              </p>
              {batchSummary.failures.map((failure) => (
                <details key={`${failure.seed}-${failure.invariant}`}>
                  <summary>
                    Seed {failure.seed} · {failure.invariant}
                  </summary>
                  <p>{failure.message}</p>
                  <pre>{JSON.stringify(failure.snapshot, null, 2)}</pre>
                </details>
              ))}
            </section>
          )}
        </div>
      </div>
    </section>
  );
}

function parseReplay(value: string): RandomSimulationReplay {
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new RangeError('Replay descriptor must be a JSON object.');
  }
  return parsed as RandomSimulationReplay;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
