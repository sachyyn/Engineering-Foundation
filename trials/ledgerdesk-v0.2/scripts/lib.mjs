import { readdirSync, lstatSync, readFileSync, existsSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

export const excluded = new Set([
  'node_modules',
  'vendor',
  '.git',
  '.agents',
  '.codex',
  '.cache',
  '.verification',
  'dist',
  'var',
  'bin',
  'playwright-report',
  'test-results',
]);

export function files(root, directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`CHECK-01: unexpected symlink ${relative(root, path)}`);
    return entry.isDirectory() ? files(root, path) : [path];
  });
}

export function localFile(root, path) {
  if (typeof path !== 'string' || !path.trim())
    throw new Error('AGENT-01: missing artifact path');
  const target = resolve(root, path);
  const rel = relative(root, target);
  if (rel.startsWith('..') || rel.split(sep).some((part) => excluded.has(part)))
    throw new Error(`AGENT-01: non-repository artifact ${path}`);
  let current = root;
  for (const part of rel.split(sep)) {
    current = resolve(current, part);
    if (!existsSync(current) || lstatSync(current).isSymbolicLink())
      throw new Error(`AGENT-01: missing or linked artifact ${path}`);
  }
  if (!lstatSync(target).isFile() || !readFileSync(target, 'utf8').trim())
    throw new Error(`AGENT-01: empty artifact ${path}`);
  return target;
}

export function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error)
    throw new Error(
      `CHECK-01: cannot execute ${command}: ${result.error.message}`,
    );
  if (result.status !== 0)
    throw new Error(
      `CHECK-01: ${command} failed (${result.status ?? result.signal})`,
    );
}

export function productInputs(root) {
  return files(root).filter((file) =>
    /^(frontend|backend|contracts|tests\/e2e)\//.test(
      relative(root, file).split(sep).join('/'),
    ),
  );
}
