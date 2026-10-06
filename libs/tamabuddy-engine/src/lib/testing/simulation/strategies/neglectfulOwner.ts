import { OwnerStrategy } from './OwnerStrategy.js';

export function neglectfulOwner(): OwnerStrategy {
  return {
    name: 'neglectful-owner',
    propose: () => null,
  };
}
