import { Tamagotchi } from '../../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../../domain/value-objects/TamagotchiId.js';
import { TamagotchiRepository } from '../../ports/TamagotchiRepository.js';

export class TamagotchiRepositoryMock implements TamagotchiRepository {
  requestedId: TamagotchiId | null = null;

  constructor(private readonly result: Tamagotchi | null = null) {}

  findById(id: TamagotchiId): Promise<Tamagotchi | null> {
    this.requestedId = id;
    return Promise.resolve(this.result);
  }

  save(): Promise<void> {
    return Promise.resolve();
  }
}
