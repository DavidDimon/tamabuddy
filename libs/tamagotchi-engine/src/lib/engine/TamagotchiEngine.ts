import { Clock } from '../application/ports/Clock.js';
import { TamagotchiRepository } from '../application/ports/TamagotchiRepository.js';
import { Tamagotchi } from '../domain/entities/Tamagotchi.js';
import { TamagotchiState } from '../domain/models/TamagotchiState.js';
import { TamagotchiCommand, ActionRejection } from '../domain/rules/actions.js';
import { TamagotchiId } from '../domain/value-objects/TamagotchiId.js';
import {
  TamagotchiCommandResult,
  TamagotchiProcessor,
} from './processors/TamagotchiProcessor.js';

export interface EngineCommandResult {
  readonly state: TamagotchiState;
  readonly accepted: boolean;
  readonly rejection?: ActionRejection;
}

export class TamagotchiEngine {
  private readonly processor: TamagotchiProcessor;

  constructor(
    private readonly clock: Clock,
    private readonly repository: TamagotchiRepository,
  ) {
    this.processor = new TamagotchiProcessor(clock);
  }

  async create(id: TamagotchiId): Promise<TamagotchiState> {
    const tamagotchi = Tamagotchi.create(id, this.now());
    await this.repository.save(tamagotchi);
    return tamagotchi.snapshot();
  }

  async load(id: TamagotchiId): Promise<TamagotchiState | null> {
    const stored = await this.repository.findById(id);
    if (stored === null) return null;

    const processed = this.processor.process(stored);
    await this.repository.save(processed);
    return processed.snapshot();
  }

  async command(
    id: TamagotchiId,
    command: TamagotchiCommand,
  ): Promise<EngineCommandResult | null> {
    const stored = await this.repository.findById(id);
    if (stored === null) return null;

    const result = this.processor.command(stored, command);
    await this.repository.save(result.tamagotchi);
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

function toEngineResult(result: TamagotchiCommandResult): EngineCommandResult {
  return {
    state: result.tamagotchi.snapshot(),
    accepted: result.accepted,
    ...(result.rejection === undefined ? {} : { rejection: result.rejection }),
  };
}
