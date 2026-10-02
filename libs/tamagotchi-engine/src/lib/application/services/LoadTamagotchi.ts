import { Tamagotchi } from '../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../domain/value-objects/TamagotchiId.js';
import { TamagotchiRepository } from '../ports/TamagotchiRepository.js';

export class LoadTamagotchi {
  constructor(private readonly repository: TamagotchiRepository) {}

  execute(id: TamagotchiId): Promise<Tamagotchi | null> {
    return this.repository.findById(id);
  }
}
