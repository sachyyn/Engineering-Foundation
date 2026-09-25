import {
  existsSync,
  readFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { files, run } from './lib.mjs';

export function preflight(root) {
  const required = [
    'frontend/index.html',
    'frontend/src/main.ts',
    'frontend/src/api/schema.d.ts',
    'backend/composer.json',
    'backend/composer.lock',
    'backend/vendor/autoload.php',
    'backend/bin/console',
    'backend/public/index.php',
    'backend/tests/bootstrap.php',
    'contracts/openapi.yaml',
    'tooling/php/composer.lock',
    'tooling/php/vendor/bin/phpunit',
  ];
  const missing = required.filter((path) => !existsSync(resolve(root, path)));
  if (missing.length)
    throw new Error(
      `PRODUCT BLOCKED: missing application/tool inputs: ${missing.join(', ')}. See docs/engineering/enforcement.md; do not add dummy inputs.`,
    );
  const all = files(root);
  for (const pattern of [
    /backend\/tests\/Unit\/.*Test\.php$/,
    /backend\/tests\/Integration\/.*Test\.php$/,
    /backend\/tests\/Functional\/.*Test\.php$/,
    /frontend\/src\/.*\.test\.ts$/,
    /tests\/e2e\/.*\.spec\.ts$/,
  ]) {
    if (!all.some((path) => pattern.test(path)))
      throw new Error(`PRODUCT BLOCKED: no tests discovered for ${pattern}`);
  }
}

export function checkProduct(root) {
  preflight(root);
  const cwd = { cwd: root };
  const bin = (name) => resolve(root, 'node_modules', '.bin', name);
  run(
    bin('vue-tsc'),
    ['--noEmit', '-p', 'tooling/tsconfig.frontend.json'],
    cwd,
  );
  run(
    bin('redocly'),
    ['lint', 'contracts/openapi.yaml', '--config', 'tooling/redocly.yaml'],
    cwd,
  );
  mkdirSync(resolve(root, '.verification'), { recursive: true });
  const temporary = mkdtempSync(resolve(root, '.verification/contract-'));
  try {
    const generated = join(temporary, 'schema.d.ts');
    run(
      bin('openapi-typescript'),
      ['contracts/openapi.yaml', '-o', generated],
      cwd,
    );
    if (
      readFileSync(generated, 'utf8') !==
      readFileSync(resolve(root, 'frontend/src/api/schema.d.ts'), 'utf8')
    )
      throw new Error(
        'API-01: generated types stale; regenerate with openapi-typescript contracts/openapi.yaml -o frontend/src/api/schema.d.ts',
      );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  run('php', ['--version'], cwd);
  run('composer', ['validate', '--strict', '--working-dir=tooling/php'], cwd);
  run('composer', ['validate', '--strict', '--working-dir=backend'], cwd);
  run('composer', ['audit', '--locked', '--working-dir=backend'], cwd);
  run('composer', ['audit', '--locked', '--working-dir=tooling/php'], cwd);
  run(
    'php',
    [
      'tooling/php/vendor/bin/php-cs-fixer',
      'fix',
      '--dry-run',
      '--diff',
      '--config=tooling/php-cs-fixer.php',
    ],
    cwd,
  );
  run(
    'php',
    [
      'tooling/php/vendor/bin/phpstan',
      'analyse',
      '-c',
      'tooling/phpstan.neon',
      '--no-progress',
    ],
    cwd,
  );
  run(
    'php',
    [
      'tooling/php/vendor/bin/deptrac',
      'analyse',
      '--config-file=tooling/deptrac.yaml',
    ],
    cwd,
  );
  for (const suite of ['unit', 'integration', 'functional'])
    run(
      'php',
      [
        'tooling/php/vendor/bin/phpunit',
        '-c',
        'tooling/phpunit.xml',
        '--testsuite',
        suite,
      ],
      cwd,
    );
  run(bin('vitest'), ['run', '--config', 'tooling/vitest.config.mjs'], cwd);
  run(bin('vite'), ['build', '--config', 'tooling/vite.config.mjs'], cwd);
  run(
    bin('playwright'),
    ['test', '--config', 'tooling/playwright.config.mjs'],
    cwd,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    checkProduct(process.cwd());
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
