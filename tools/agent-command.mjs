import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function parseArguments(args) {
  const [mode, name, ...rest] = args;

  if (
    mode === 'project' &&
    name &&
    rest.every((option) => option === '--verbose') &&
    rest.length <= 1
  ) {
    return { mode, project: name, verbose: rest.includes('--verbose') };
  }

  if (
    mode === 'all' &&
    name &&
    rest.every((option) => option === '--verbose') &&
    rest.length <= 1
  ) {
    return {
      mode,
      target: name,
      project: 'workspace',
      verbose: rest.includes('--verbose'),
      passthrough: [],
    };
  }

  const [project, ...options] = rest;
  if (mode !== 'check' || !name || !project) return null;

  const separator = options.indexOf('--');
  const wrapperOptions =
    separator === -1 ? options : options.slice(0, separator);
  const passthrough = separator === -1 ? [] : options.slice(separator + 1);
  const fileIndex = wrapperOptions.indexOf('--file');

  if (
    wrapperOptions.some(
      (option, index) =>
        option !== '--verbose' &&
        option !== '--file' &&
        !(fileIndex !== -1 && index === fileIndex + 1),
    ) ||
    (fileIndex !== -1 && !wrapperOptions[fileIndex + 1])
  ) {
    return null;
  }

  return {
    mode,
    target: name,
    project,
    file: fileIndex === -1 ? undefined : wrapperOptions[fileIndex + 1],
    verbose: wrapperOptions.includes('--verbose'),
    passthrough,
  };
}

export function nxArguments(request) {
  if (request.mode === 'project') {
    return ['nx', 'show', 'project', request.project, '--json'];
  }

  const args =
    request.mode === 'all'
      ? ['nx', 'run-many', '-t', request.target]
      : ['nx', request.target, request.project];
  if (request.file) args.push('--run', request.file);
  if (request.target.startsWith('test')) args.push('--reporter=dot');
  return [...args, ...request.passthrough];
}

export function summarizeProject(stdout) {
  const project = JSON.parse(stdout);
  const targets = Object.keys(project.targets ?? {})
    .filter((target) => !target.includes('--'))
    .sort();
  const fields = [
    `name=${project.name}`,
    `root=${project.root}`,
    `sourceRoot=${project.sourceRoot ?? '-'}`,
    `type=${project.projectType ?? '-'}`,
    `tags=${(project.tags ?? []).join(',') || '-'}`,
    `targets=${targets.join(',') || '-'}`,
  ];
  return fields.join(' ');
}

export function diagnosticTail(stdout, stderr, lineLimit = 30) {
  return [stdout, stderr]
    .map((value) => value.trim())
    .filter(Boolean)
    .join('\n')
    .split(/\r?\n/)
    .slice(-lineLimit)
    .join('\n');
}

function usage() {
  console.error(`Usage:
  pnpm agent:run project <project> [--verbose]
  pnpm agent:run check <target> <project> [--file <path>] [--verbose] [-- <nx args>]
  pnpm agent:run all <target> [--verbose]`);
}

function run(request) {
  const args = nxArguments(request);
  const startedAt = performance.now();
  const result = spawnSync('pnpm', args, {
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
  const stderr = [result.stderr, result.error?.message]
    .filter(Boolean)
    .join('\n');
  const exitCode = result.status ?? 1;
  const command = ['pnpm', ...args]
    .map((part) => JSON.stringify(part))
    .join(' ');
  const runId = `${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${process.pid}`;
  const logDirectory = join(root, '.ai-harness/.agent-runs');
  const logPath = join(logDirectory, `${runId}.log`);
  mkdirSync(logDirectory, { recursive: true });
  writeFileSync(
    logPath,
    `$ ${command}\n\n[stdout]\n${stdout}\n[stderr]\n${stderr}`,
  );
  const relativeLogPath = logPath.slice(root.length + 1);

  if (request.verbose) {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  }

  if (exitCode !== 0) {
    if (!request.verbose) {
      const diagnostic = diagnosticTail(stdout, stderr);
      if (diagnostic) console.error(diagnostic);
    }
    console.error(
      `FAIL command=${command} target=${request.target ?? 'project'} project=${request.project} exit=${exitCode} duration=${durationMs}ms log=${relativeLogPath}`,
    );
    console.error('Fallback: inspect the log or rerun with --verbose.');
    return exitCode;
  }

  if (request.mode === 'project') {
    try {
      console.log(
        `PASS command=${command} target=project ${summarizeProject(stdout)} log=${relativeLogPath}`,
      );
    } catch {
      console.error(
        `FAIL command=${command} target=project project=${request.project} exit=1 log=${relativeLogPath}`,
      );
      console.error(
        'Nx returned invalid JSON. Inspect the log or rerun with --verbose.',
      );
      return 1;
    }
  } else {
    console.log(
      `PASS command=${command} target=${request.target} project=${request.project} duration=${durationMs}ms log=${relativeLogPath}`,
    );
  }

  return 0;
}

export function main(args = process.argv.slice(2)) {
  const request = parseArguments(args);
  if (!request) {
    usage();
    return 2;
  }
  return run(request);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = main();
}
