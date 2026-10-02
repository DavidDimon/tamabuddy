import { useTamagotchiEngine } from '../hooks/useTamagotchiEngine.js';

export function PetStatus() {
  const { snapshot } = useTamagotchiEngine();

  return (
    <section aria-labelledby="pet-status-title">
      <h2 id="pet-status-title">Engine status</h2>
      <p>
        Behavior: <output>{snapshot.behavior}</output>
      </p>
    </section>
  );
}
