export class TamagotchiId {
  private constructor(public readonly value: string) {}

  static create(value: string): TamagotchiId {
    const normalizedValue = value.trim();

    if (normalizedValue.length === 0) {
      throw new RangeError('TamagotchiId cannot be empty');
    }

    return new TamagotchiId(normalizedValue);
  }
}
