import { useTamabuddyEngine } from '../hooks/useTamabuddyEngine.js';

export function PetStatus() {
  const { snapshot } = useTamabuddyEngine();

  return (
    <section aria-labelledby="pet-status-title">
      <h2 id="pet-status-title">Engine status</h2>
      <p>
        Behavior: <output>{snapshot.behavior}</output>
      </p>
    </section>
  );
}
