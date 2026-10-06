import { Tamabuddy } from '../../../domain/entities/Tamabuddy.js';
import { TamabuddyId } from '../../../domain/value-objects/TamabuddyId.js';
import { TamabuddyRepository } from '../../ports/TamabuddyRepository.js';

export class TamabuddyRepositoryMock implements TamabuddyRepository {
  requestedId: TamabuddyId | null = null;

  constructor(private readonly result: Tamabuddy | null = null) {}

  findById(id: TamabuddyId): Promise<Tamabuddy | null> {
    this.requestedId = id;
    return Promise.resolve(this.result);
  }

  save(): Promise<void> {
    return Promise.resolve();
  }
}
