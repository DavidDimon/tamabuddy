import assert from 'node:assert/strict';
import test from 'node:test';

import {
  diagnosticTail,
  nxArguments,
  parseArguments,
  summarizeProject,
} from '../agent-command.mjs';

test('builds a focused test command with compact output', () => {
  const request = parseArguments([
    'check',
    'test',
    '@tamabuddy/tamabuddy-desktop',
    '--file',
    'src/app/app.spec.tsx',
  ]);

  assert.deepEqual(nxArguments(request), [
    'nx',
    'test',
    '@tamabuddy/tamabuddy-desktop',
    '--run',
    'src/app/app.spec.tsx',
    '--reporter=dot',
  ]);
});

test('builds a workspace-wide closure command', () => {
  const request = parseArguments(['all', 'test:coverage']);

  assert.deepEqual(nxArguments(request), [
    'nx',
    'run-many',
    '-t',
    'test:coverage',
    '--reporter=dot',
  ]);
});

test('rejects incomplete and unknown wrapper options', () => {
  assert.equal(parseArguments(['check', 'test']), null);
  assert.equal(parseArguments(['check', 'lint', 'project', '--unknown']), null);
  assert.equal(parseArguments(['check', 'test', 'project', '--file']), null);
});

test('summarizes project discovery fields and target names', () => {
  const output = summarizeProject(
    JSON.stringify({
      name: '@tamabuddy/example',
      root: 'apps/example',
      sourceRoot: 'apps/example/src',
      projectType: 'application',
      tags: ['type:app'],
      targets: { test: {}, build: {} },
    }),
  );

  assert.equal(
    output,
    'name=@tamabuddy/example root=apps/example sourceRoot=apps/example/src type=application tags=type:app targets=build,test',
  );
});

test('keeps only the actionable end of a failed command', () => {
  assert.equal(diagnosticTail('one\ntwo\nthree\n', 'four\n', 2), 'three\nfour');
});
