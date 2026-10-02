import { TamagotchiRepository } from '../../application/ports/TamagotchiRepository.js';
import { Tamagotchi } from '../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../domain/value-objects/TamagotchiId.js';
import { TamagotchiState } from '../../domain/models/TamagotchiState.js';

export class InMemoryTamagotchiRepository implements TamagotchiRepository {
  private readonly tamagotchis = new Map<string, TamagotchiState>();

  findById(id: TamagotchiId): Promise<Tamagotchi | null> {
    const state = this.tamagotchis.get(id.value);
    return Promise.resolve(
      state === undefined ? null : Tamagotchi.restore(state),
    );
  }

  save(tamagotchi: Tamagotchi): Promise<void> {
    this.tamagotchis.set(tamagotchi.id.value, tamagotchi.snapshot());
    return Promise.resolve();
  }
}
