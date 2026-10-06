import { Tamabuddy } from '../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../domain/value-objects/TamabuddyId.js';
import { TamabuddyRepository } from '../ports/TamabuddyRepository.js';

export class LoadTamabuddy {
  constructor(private readonly repository: TamabuddyRepository) {}

  execute(id: TamabuddyId): Promise<Tamabuddy | null> {
    return this.repository.findById(id);
  }
}
