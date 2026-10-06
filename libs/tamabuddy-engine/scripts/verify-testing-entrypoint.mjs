import { readFile } from 'node:fs/promises';
import { Tamabuddy, TamabuddyId } from '@tamabuddy/tamabuddy-engine';
import * as root from '@tamabuddy/tamabuddy-engine';
import * as testing from '@tamabuddy/tamabuddy-engine/testing';

const expectedRuntimeExports = [
  'BatchSimulationRunner',
  'LifeSimulationRunner',
  'LifeTimeline',
  'OwnerSimulationRunner',
  'SEEDED_RANDOM_VERSION',
  'Scenario',
  'ScenarioFailure',
  'customOwner',
  'createLifePreset',
  'days',
  'hours',
  'minutes',
  'neglectfulOwner',
  'perfectOwner',
  'randomOwner',
  'replayRandomSimulation',
  'runRandomSimulation',
  'scenario',
  'structuralStateInvariant',
];

for (const name of expectedRuntimeExports) {
  if (!(name in testing)) {
    throw new Error(`Built testing entrypoint is missing ${name}`);
  }
}

const forbiddenTestingExports = [
  'Mulberry32RandomSource',
  'RandomSource',
  'TamabuddyBuilder',
  'VirtualClock',
  'normalizeRandomOwnerConfiguration',
  'runRandomOwnerSimulation',
];
for (const name of forbiddenTestingExports) {
  if (name in testing) {
    throw new Error(`Built testing entrypoint exposes internal symbol ${name}`);
  }
}

for (const name of expectedRuntimeExports) {
  if (name in root) {
    throw new Error(
      `Root entrypoint accidentally exposes testing symbol ${name}`,
    );
  }
}

const declaration = await readFile(
  new URL('../dist/lib/testing/public-api/index.d.ts', import.meta.url),
  'utf8',
);
for (const name of forbiddenTestingExports) {
  const exportedName = new RegExp(`\\b${name}\\b(?=\\s*[,}])`);
  if (exportedName.test(declaration)) {
    throw new Error(`Testing declarations expose internal symbol ${name}`);
  }
}

const initial = Tamabuddy.create(TamabuddyId.create('external-consumer'));
const timeline = await testing
  .scenario('built-package consumer')
  .given(initial)
  .at(testing.minutes(5))
  .expectState({ stage: 'baby' })
  .run();

if (timeline.finalState.stage !== 'baby') {
  throw new Error('Built-package scenario did not execute correctly');
}
