import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';

export interface TamabuddyRepository {
  findById(id: TamabuddyId): Promise<Tamabuddy | null>;
  save(tamabuddy: Tamabuddy): Promise<void>;
}
