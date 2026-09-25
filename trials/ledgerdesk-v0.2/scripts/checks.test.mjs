import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  cpSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { files, productInputs } from './lib.mjs';
import { validate, validateWorkflow } from './check-foundation.mjs';
import { preflight } from './check-product.mjs';

const root = process.cwd();
function copy() {
  mkdirSync(resolve(root, '.verification'), { recursive: true });
  const target = mkdtempSync(resolve(root, '.verification/guards-'));
  for (const source of files(root)) {
    const dest = resolve(target, relative(root, source));
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(source, dest);
  }
  return target;
}
function trial(callback) {
  const target = copy();
  try {
    callback(target);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
}

test('portable copy validates routes, then broken skill route fails and restoration passes', () =>
  trial((target) => {
    validate(target);
    const path = resolve(target, 'docs/engineering/skills.md');
    const before = readFileSync(path, 'utf8');
    writeFileSync(
      path,
      before.replace(
        'skills/ledgerdesk-backend/SKILL.md',
        'skills/missing/SKILL.md',
      ),
    );
    assert.throws(
      () => validate(target),
      /AGENT-01: missing or linked artifact/,
    );
    writeFileSync(path, before);
    validate(target);
  }));

test('a ready claim with outstanding blockers fails', () =>
  trial((target) => {
    const path = resolve(target, 'docs/engineering/foundation.json');
    const data = JSON.parse(readFileSync(path, 'utf8'));
    data.status = 'ready';
    data.blockers = ['deliberate unresolved verification'];
    writeFileSync(path, JSON.stringify(data));
    assert.throws(() => validate(target), /unsupported ready claim/);
  }));

test('new workflow with mutable action pin fails CI-01', () =>
  trial((target) => {
    const text = readFileSync(
      resolve(target, '.github/workflows/quality.yml'),
      'utf8',
    );
    const path = resolve(target, '.github/workflows/added.yml');
    writeFileSync(path, text.replace(/@[a-f0-9]{40}/, '@main'));
    assert.throws(() => validate(target), /CI-01: action must be pinned/);
    writeFileSync(path, text);
    validateWorkflow(path);
  }));

test('workflow cannot swallow a required step failure', () =>
  trial((target) => {
    const path = resolve(target, '.github/workflows/quality.yml');
    const text = readFileSync(path, 'utf8');
    writeFileSync(
      path,
      text.replace('run: npm run check', 'run: npm run check || true'),
    );
    assert.throws(() => validate(target), /CI-01:/);
    writeFileSync(path, text);
    validateWorkflow(path);
  }));

test('null privileged trigger and false step condition are rejected by key presence', () =>
  trial((target) => {
    const path = resolve(target, '.github/workflows/quality.yml');
    const text = readFileSync(path, 'utf8');
    writeFileSync(path, text.replace('on:\n', 'on:\n  pull_request_target:\n'));
    assert.throws(
      () => validate(target),
      /CI-01: pull_request_target is forbidden/,
    );
    writeFileSync(
      path,
      text.replace(
        'run: npm run check',
        'run: npm run check\n        if: false',
      ),
    );
    assert.throws(
      () => validate(target),
      /CI-01: required steps cannot silently skip/,
    );
    writeFileSync(path, text);
    validateWorkflow(path);
  }));

test('new product file activates gate and missing inputs fail', () =>
  trial((target) => {
    mkdirSync(resolve(target, 'frontend/src'), { recursive: true });
    writeFileSync(resolve(target, 'frontend/src/new.ts'), 'export {};\n');
    assert.ok(productInputs(target).some((file) => file.endsWith('new.ts')));
    assert.throws(
      () => preflight(target),
      /PRODUCT BLOCKED: missing application\/tool inputs/,
    );
  }));

test('ESLint rejects newly added TypeScript any and passes restored narrowing', () => {
  mkdirSync(resolve(root, '.verification'), { recursive: true });
  const target = mkdtempSync(resolve(root, '.verification/lint-'));
  const file = resolve(target, 'new.ts');
  const lint = () =>
    spawnSync(
      resolve(root, 'node_modules/.bin/eslint'),
      [
        '--no-ignore',
        '--no-warn-ignored',
        '--stdin',
        '--stdin-filename',
        'tooling/negative-fixture.ts',
      ],
      { cwd: root, input: readFileSync(file, 'utf8'), encoding: 'utf8' },
    );
  try {
    writeFileSync(file, 'export const value: any = 1;\n');
    const bad = lint();
    assert.equal(bad.status, 1);
    assert.match(bad.stdout, /no-explicit-any/);
    writeFileSync(file, 'export const value: unknown = 1;\n');
    const good = lint();
    assert.equal(good.status, 0, good.stdout + good.stderr);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test('Redocly rejects an unresolved local schema reference and accepts restoration', () => {
  mkdirSync(resolve(root, '.verification'), { recursive: true });
  const target = mkdtempSync(resolve(root, '.verification/contract-guard-'));
  const file = resolve(target, 'schema.yaml');
  const schema = {
    openapi: '3.1.1',
    info: {
      title: 'Tool validation fixture',
      version: '1.0.0',
      license: { name: 'UNLICENSED' },
    },
    servers: [{ url: 'https://example.invalid' }],
    security: [],
    paths: {},
    components: {
      schemas: { Probe: { $ref: '#/components/schemas/Missing' } },
    },
  };
  const lint = () =>
    spawnSync(
      resolve(root, 'node_modules/.bin/redocly'),
      ['lint', file, '--config', 'tooling/redocly.yaml'],
      { cwd: root, encoding: 'utf8' },
    );
  try {
    writeFileSync(file, JSON.stringify(schema));
    const bad = lint();
    assert.equal(bad.status, 1);
    assert.match(bad.stdout + bad.stderr, /no-unresolved-refs|Can't resolve/);
    schema.components.schemas.Probe = { type: 'string' };
    writeFileSync(file, JSON.stringify(schema));
    const good = lint();
    assert.equal(good.status, 0, good.stdout + good.stderr);
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
