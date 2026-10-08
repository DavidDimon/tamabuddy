import { Clock } from '../application/ports/Clock.js';
import { TamabuddyRepository } from '../application/ports/TamabuddyRepository.js';
import { Tamabuddy } from '../domain/entities/Tamabuddy.js';
import { TamabuddyState } from '../domain/models/TamabuddyState.js';
import { TamabuddyCommand, ActionRejection } from '../domain/rules/actions.js';
import { TamabuddyId } from '../domain/value-objects/TamabuddyId.js';
import {
  TamabuddyCommandResult,
  TamabuddyProcessor,
} from './processors/TamabuddyProcessor.js';

export interface EngineCommandResult {
  readonly state: TamabuddyState;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export interface EngineHatchResult {
  readonly state: TamabuddyState;
  readonly hatched: boolean;
}

export class TamabuddyEngine {
  private readonly processor: TamabuddyProcessor;

  constructor(
    private readonly clock: Clock,
    private readonly repository: TamabuddyRepository,
  ) {
    this.processor = new TamabuddyProcessor(clock);
  }

  async create(id: TamabuddyId): Promise<TamabuddyState> {
    const tamabuddy = Tamabuddy.create(id, this.now());
    await this.repository.save(tamabuddy);
    return tamabuddy.snapshot();
  }

  async load(id: TamabuddyId): Promise<TamabuddyState | null> {
    const stored = await this.repository.findById(id);
    if (stored === null) return null;

    const processed = this.processor.process(stored);
    await this.repository.save(processed);
    return processed.snapshot();
  }

  async hatchNow(id: TamabuddyId): Promise<EngineHatchResult | null> {
    const stored = await this.repository.findById(id);
    if (stored === null) return null;

    const result = this.processor.hatchNow(stored);
    await this.repository.save(result.tamabuddy);
    return {
      state: result.tamabuddy.snapshot(),
      hatched: result.hatched,
    };
  }

  async command(
    id: TamabuddyId,
    command: TamabuddyCommand,
  ): Promise<EngineCommandResult | null> {
    const stored = await this.repository.findById(id);
    if (stored === null) return null;

    const result = this.processor.command(stored, command);
    await this.repository.save(result.tamabuddy);
    return toEngineResult(result);
  }

  private now(): number {
    const now = this.clock.now();
    if (!Number.isInteger(now) || now < 0) {
      throw new RangeError(
        'Clock must return a non-negative integer timestamp',
      );
    }
    return now;
  }
}

function toEngineResult(result: TamabuddyCommandResult): EngineCommandResult {
  return {
    state: result.tamabuddy.snapshot(),
    accepted: result.accepted,
    ...(result.rejection === undefined ? {} : { rejection: result.rejection }),
  };
}
