import { TamabuddyRepository } from '../../application/ports/TamabuddyRepository.js';
import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';
import { TamabuddyState } from '../../domain/models/TamabuddyState.js';

export class InMemoryTamabuddyRepository implements TamabuddyRepository {
  private readonly tamabuddys = new Map<string, TamabuddyState>();

  findById(id: TamabuddyId): Promise<Tamabuddy | null> {
    const state = this.tamabuddys.get(id.value);
    return Promise.resolve(
      state === undefined ? null : Tamabuddy.restore(state),
    );
  }

  save(tamabuddy: Tamabuddy): Promise<void> {
    this.tamabuddys.set(tamabuddy.id.value, tamabuddy.snapshot());
    return Promise.resolve();
  }
}
