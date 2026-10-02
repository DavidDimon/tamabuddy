import { Tamagotchi } from '../../domain/entities/Tamagotchi.js';
import { TamagotchiId } from '../../domain/value-objects/TamagotchiId.js';

export interface TamagotchiRepository {
  findById(id: TamagotchiId): Promise<Tamagotchi | null>;
  save(tamagotchi: Tamagotchi): Promise<void>;
}
