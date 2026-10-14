import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(
  root,
  '.ai-harness/domains/product-delivery/baselines/agent-context/scenarios.json',
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const requestedIds = process.argv
  .slice(2)
  .filter((arg) => arg !== '--validate');

validateManifest(manifest);

if (process.argv.includes('--validate')) {
  console.log(`Validated ${manifest.scenarios.length} baseline scenarios.`);
  process.exit(0);
}

const scenarios = requestedIds.length
  ? manifest.scenarios.filter(({ id }) => requestedIds.includes(id))
  : manifest.scenarios;
const missingIds = requestedIds.filter(
  (id) => !manifest.scenarios.some((scenario) => scenario.id === id),
);

if (missingIds.length) {
  throw new Error(`Unknown scenario: ${missingIds.join(', ')}`);
}

const runId = new Date()
  .toISOString()
  .replaceAll(':', '-')
  .replaceAll('.', '-');
const outputDirectory = join(root, '.ai-harness/.baseline-runs', runId);
mkdirSync(outputDirectory, { recursive: true });

const report = {
  schemaVersion: 1,
  runId,
  repository: {
    commit: git(['rev-parse', 'HEAD']).trim(),
    dirty: Boolean(git(['status', '--porcelain']).trim()),
  },
  runtime: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
  },
  scenarios: scenarios.map(runScenario),
};

const reportPath = join(outputDirectory, 'report.json');
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

for (const scenario of report.scenarios) {
  const outputBytes = scenario.commands.reduce(
    (total, command) => total + command.output.bytes,
    0,
  );
  const status = scenario.commands.every((command) => command.exitCode === 0)
    ? 'pass'
    : 'fail';
  console.log(
    `${scenario.id}: ${status}; input=${scenario.input.total.characters} chars; output=${outputBytes} bytes`,
  );
}
console.log(`Report: ${reportPath}`);

if (
  report.scenarios.some(({ commands }) =>
    commands.some(({ exitCode }) => exitCode !== 0),
  )
) {
  process.exitCode = 1;
}

function runScenario(scenario) {
  const input = Object.fromEntries(
    Object.entries(scenario.inputs).map(([kind, paths]) => [
      kind,
      measureFiles(paths),
    ]),
  );

  input.total = addMeasurements(Object.values(input));

  return {
    id: scenario.id,
    class: scenario.class,
    description: scenario.description,
    input,
    commands: scenario.commands.map((command, index) =>
      runCommand(scenario.id, command, index),
    ),
  };
}

function measureFiles(paths) {
  const files = paths.map((path) => {
    const content = readFileSync(join(root, path), 'utf8');
    return {
      path,
      characters: content.length,
      bytes: Buffer.byteLength(content),
    };
  });

  return { files, ...addMeasurements(files) };
}

function addMeasurements(measurements) {
  return measurements.reduce(
    (total, measurement) => ({
      characters: total.characters + measurement.characters,
      bytes: total.bytes + measurement.bytes,
    }),
    { characters: 0, bytes: 0 },
  );
}

function runCommand(scenarioId, command, index) {
  const startedAt = performance.now();
  const result = spawnSync(command.executable, command.args, {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      NX_DAEMON: 'false',
      NX_ISOLATE_PLUGINS: 'false',
    },
  });
  const durationMs = Math.round(performance.now() - startedAt);
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const logPath = join(
    outputDirectory,
    `${scenarioId}-${index + 1}-${slug(command.label)}.log`,
  );
  const renderedCommand = [command.executable, ...command.args]
    .map((part) => JSON.stringify(part))
    .join(' ');
  writeFileSync(
    logPath,
    `$ ${renderedCommand}\n\n[stdout]\n${stdout}\n[stderr]\n${stderr}`,
  );

  return {
    label: command.label,
    command: [command.executable, ...command.args],
    exitCode: result.status ?? 1,
    signal: result.signal,
    durationMs,
    reruns: 0,
    output: {
      bytes: Buffer.byteLength(stdout) + Buffer.byteLength(stderr),
      lines: countLines(stdout) + countLines(stderr),
      stdoutBytes: Buffer.byteLength(stdout),
      stderrBytes: Buffer.byteLength(stderr),
    },
    logPath: logPath.slice(root.length + 1),
  };
}

function validateManifest(value) {
  if (
    value.version !== 1 ||
    !Array.isArray(value.scenarios) ||
    !value.scenarios.length
  ) {
    throw new Error('Baseline manifest must contain version 1 scenarios.');
  }

  const ids = new Set();
  for (const scenario of value.scenarios) {
    if (!scenario.id || ids.has(scenario.id)) {
      throw new Error(
        `Scenario ids must be present and unique: ${scenario.id}`,
      );
    }
    ids.add(scenario.id);
    if (
      !scenario.inputs ||
      !Array.isArray(scenario.commands) ||
      !scenario.commands.length
    ) {
      throw new Error(
        `Scenario ${scenario.id} must declare inputs and commands.`,
      );
    }
    for (const paths of Object.values(scenario.inputs)) {
      for (const path of paths) readFileSync(join(root, path));
    }
    for (const command of scenario.commands) {
      if (
        !command.label ||
        !command.executable ||
        !Array.isArray(command.args)
      ) {
        throw new Error(`Scenario ${scenario.id} contains an invalid command.`);
      }
    }
  }
}

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' });
}

function countLines(value) {
  return value ? value.split(/\r?\n/).length - Number(value.endsWith('\n')) : 0;
}

function slug(value) {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '');
}
