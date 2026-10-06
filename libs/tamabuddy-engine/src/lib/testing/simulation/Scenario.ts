import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../../domain/models/TamabuddyState.js';
import { TamabuddyCommand } from '../../domain/rules/actions.js';
import { assertDuration } from './durations.js';
import {
  LifeSimulationRunner,
  ScheduledCommand,
} from './LifeSimulationRunner.js';
import { LifeEvent, LifeTimeline } from './LifeTimeline.js';
import { needLevel, NeedLevel } from './needLevels.js';
import { ScenarioFailure } from './ScenarioFailure.js';

export type DeepPartial<Value> = Value extends readonly (infer Item)[]
  ? readonly DeepPartial<Item>[]
  : Value extends object
    ? { readonly [Key in keyof Value]?: DeepPartial<Value[Key]> }
    : Value;

export interface SemanticStateExpectation {
  readonly needs?: {
    readonly hunger?: NeedLevel;
    readonly happiness?: NeedLevel;
  };
}

export type EventExpectation<Type extends LifeEvent['type']> = DeepPartial<
  Omit<Extract<LifeEvent, { readonly type: Type }>, 'kind' | 'type'>
>;

interface CommandStep {
  readonly kind: 'command';
  readonly at: number;
  readonly command: TamabuddyCommand;
}

interface StateExpectationStep {
  readonly kind: 'state-expectation';
  readonly at: number;
  readonly expected: DeepPartial<TamabuddyState>;
}

interface SemanticExpectationStep {
  readonly kind: 'semantic-expectation';
  readonly at: number;
  readonly expected: SemanticStateExpectation;
}

interface EventExpectationStep {
  readonly kind: 'event-expectation';
  readonly at: number;
  readonly type: LifeEvent['type'];
  readonly expected?: unknown;
  readonly absent: boolean;
}

type ScenarioStep =
  | CommandStep
  | StateExpectationStep
  | SemanticExpectationStep
  | EventExpectationStep;

export class Scenario {
  private constructor(
    readonly name: string,
    private readonly initialState: TamabuddyState | undefined,
    private readonly cursor: number,
    private readonly steps: readonly ScenarioStep[],
  ) {}

  static create(name: string): Scenario {
    if (name.trim().length === 0) {
      throw new RangeError('Scenario name cannot be empty');
    }
    return new Scenario(name, undefined, 0, []);
  }

  given(initial: Tamabuddy | TamabuddyState): Scenario {
    if (this.initialState !== undefined) {
      throw this.failure(
        'Initial state is already configured',
        this.cursor,
        'one given() call',
        'multiple given() calls',
      );
    }
    const state = Tamabuddy.restore(
      initial instanceof Tamabuddy ? initial.snapshot() : initial,
    ).snapshot();
    return new Scenario(this.name, state, this.cursor, this.steps);
  }

  at(offset: number): Scenario {
    this.validateDuration(offset, 'at');
    if (offset < this.cursor) {
      throw this.failure(
        `Time cannot move backwards from offset ${this.cursor} to ${offset}`,
        offset,
        { minimumOffset: this.cursor },
        { requestedOffset: offset },
      );
    }
    return new Scenario(this.name, this.initialState, offset, this.steps);
  }

  wait(duration: number): Scenario {
    this.validateDuration(duration, 'wait');
    const next = this.cursor + duration;
    this.validateDuration(next, 'wait result');
    return new Scenario(this.name, this.initialState, next, this.steps);
  }

  feed(): Scenario {
    return this.command({ type: 'feedMeal' });
  }

  snack(): Scenario {
    return this.command({ type: 'feedSnack' });
  }

  play(result: 'win' | 'loss'): Scenario {
    return this.command({ type: 'play', result });
  }

  clean(): Scenario {
    return this.command({ type: 'clean' });
  }

  giveMedicine(): Scenario {
    return this.command({ type: 'giveMedicine' });
  }

  discipline(): Scenario {
    return this.command({ type: 'discipline' });
  }

  turnLightsOff(): Scenario {
    return this.command({ type: 'turnLightsOff' });
  }

  expectState(expected: DeepPartial<TamabuddyState>): Scenario {
    return this.withStep({
      kind: 'state-expectation',
      at: this.cursor,
      expected: cloneValue(expected),
    });
  }

  expect(expected: SemanticStateExpectation): Scenario {
    return this.withStep({
      kind: 'semantic-expectation',
      at: this.cursor,
      expected: cloneValue(expected),
    });
  }

  expectEvent<Type extends LifeEvent['type']>(
    type: Type,
    expected?: EventExpectation<Type>,
  ): Scenario {
    return this.eventExpectation(type, expected, false);
  }

  expectNoEvent<Type extends LifeEvent['type']>(
    type: Type,
    expected?: EventExpectation<Type>,
  ): Scenario {
    return this.eventExpectation(type, expected, true);
  }

  async run(): Promise<LifeTimeline> {
    const initial = this.initialState;
    if (initial === undefined) {
      throw this.failure(
        'Missing given() initial state',
        this.cursor,
        'a valid initial Tamabuddy from given()',
        'missing',
      );
    }

    const runner = new LifeSimulationRunner();
    const commands: ScheduledCommand[] = [];
    let timeline: LifeTimeline;

    for (const step of this.steps) {
      if (step.kind === 'command') {
        const scheduled = { at: step.at, command: { ...step.command } };
        try {
          timeline = await runner.run({
            initial,
            commands: [...commands, scheduled],
            until: step.at,
          });
        } catch (error) {
          const context = await runner.run({
            initial,
            commands,
            until: step.at,
          });
          throw this.failure(
            `Command ${step.command.type} could not execute: ${errorMessage(error)}`,
            step.at,
            { accepted: true, command: step.command },
            { error: errorMessage(error) },
            context,
          );
        }
        commands.push(scheduled);
        const outcome = timeline.events('command').at(-1);
        if (outcome === undefined || !outcome.accepted) {
          throw this.failure(
            `Command ${step.command.type} was rejected`,
            step.at,
            { accepted: true, command: step.command },
            outcome,
            timeline,
          );
        }
        continue;
      }

      timeline = await runner.run({ initial, commands, until: step.at });
      this.assertStep(step, timeline);
    }

    return runner.run({ initial, commands, until: this.cursor });
  }

  private command(command: TamabuddyCommand): Scenario {
    return this.withStep({
      kind: 'command',
      at: this.cursor,
      command: { ...command },
    });
  }

  private eventExpectation<Type extends LifeEvent['type']>(
    type: Type,
    expected: EventExpectation<Type> | undefined,
    absent: boolean,
  ): Scenario {
    return this.withStep({
      kind: 'event-expectation',
      at: this.cursor,
      type,
      ...(expected === undefined ? {} : { expected: cloneValue(expected) }),
      absent,
    });
  }

  private withStep(step: ScenarioStep): Scenario {
    return new Scenario(this.name, this.initialState, this.cursor, [
      ...this.steps,
      step,
    ]);
  }

  private assertStep(
    step: Exclude<ScenarioStep, CommandStep>,
    timeline: LifeTimeline,
  ): void {
    if (step.kind === 'state-expectation') {
      const actual = timeline.at(step.at);
      if (!matchesSubset(actual, step.expected)) {
        throw this.failure(
          'State expectation did not match',
          step.at,
          step.expected,
          actual,
          timeline,
        );
      }
      return;
    }

    if (step.kind === 'semantic-expectation') {
      const state = timeline.at(step.at);
      const actual: SemanticStateExpectation = {
        needs: {
          hunger: needLevel(state.hunger),
          happiness: needLevel(state.happiness),
        },
      };
      if (!matchesSubset(actual, step.expected)) {
        throw this.failure(
          'Semantic state expectation did not match',
          step.at,
          step.expected,
          {
            ...actual,
            meters: { hunger: state.hunger, happiness: state.happiness },
          },
          timeline,
        );
      }
      return;
    }

    const matchingEvents = timeline
      .events(step.type)
      .filter((event) => matchesSubset(event, step.expected ?? {}));
    const matched = matchingEvents.length > 0;
    if (step.absent ? matched : !matched) {
      throw this.failure(
        step.absent
          ? `Unexpected ${step.type} event`
          : `Expected ${step.type} event was not observed`,
        step.at,
        step.absent
          ? { type: step.type, absent: true, payload: step.expected }
          : { type: step.type, payload: step.expected },
        timeline.events(step.type),
        timeline,
      );
    }
  }

  private validateDuration(value: number, operation: string): void {
    try {
      assertDuration(value, operation);
    } catch (error) {
      throw this.failure(
        `Invalid ${operation} duration: ${errorMessage(error)}`,
        this.cursor,
        'non-negative integer milliseconds',
        value,
      );
    }
  }

  private failure(
    reason: string,
    offset = this.cursor,
    expected?: unknown,
    actual?: unknown,
    timeline?: LifeTimeline,
  ): ScenarioFailure {
    return new ScenarioFailure({
      scenarioName: this.name,
      offset,
      ...(this.initialState === undefined
        ? {}
        : { origin: this.initialState.lastProcessedAt }),
      reason,
      ...(expected === undefined ? {} : { expected }),
      ...(actual === undefined ? {} : { actual }),
      ...(timeline === undefined ? {} : { timeline }),
    });
  }
}

export function scenario(name: string): Scenario {
  return Scenario.create(name);
}

function matchesSubset(actual: unknown, expected: unknown): boolean {
  if (Object.is(actual, expected)) return true;
  if (Array.isArray(expected)) {
    return (
      Array.isArray(actual) &&
      actual.length === expected.length &&
      expected.every((value, index) => matchesSubset(actual[index], value))
    );
  }
  if (!isRecord(expected) || !isRecord(actual)) return false;
  return Object.entries(expected).every(([key, value]) =>
    matchesSubset(actual[key], value),
  );
}

function cloneValue<Value>(value: Value): Value {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as Value;
  }
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, cloneValue(item)]),
  ) as Value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
