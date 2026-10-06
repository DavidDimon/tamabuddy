export class TamabuddyId {
  private constructor(public readonly value: string) {}

  static create(value: string): TamabuddyId {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      throw new RangeError('TamabuddyId cannot be empty');
    }

    return new TamabuddyId(normalizedValue);
  }
}
