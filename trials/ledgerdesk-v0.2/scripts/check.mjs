import { resolve } from 'node:path';
import { run, productInputs, files } from './lib.mjs';
import { validate } from './check-foundation.mjs';
import { checkProduct } from './check-product.mjs';

try {
  const root = process.cwd();
  if (Number(process.versions.node.split('.')[0]) !== 22)
    throw new Error('DEV-01: use approved Node 22 runtime');
  const bin = (name) => resolve(root, 'node_modules', '.bin', name);
  const outcome = validate(root);
  run(resolve(root, 'tooling/bin/actionlint'), [
    '-shellcheck=',
    '-pyflakes=',
    ...files(root).filter((path) =>
      /\.github\/workflows\/.*\.ya?ml$/.test(path),
    ),
  ]);
  run(bin('prettier'), ['--check', '.']);
  run(bin('eslint'), ['.']);
  run(bin('secretlint'), ['**/*', '.github/**/*']);
  run(process.execPath, ['--test', 'scripts/checks.test.mjs']);
  run('npm', ['audit', '--audit-level=high']);
  if (productInputs(root).length) checkProduct(root);
  else
    console.log(
      'Product checks NOT RUN: no product inputs. Explicit npm run check:product fails until authorized implementation exists.',
    );
  console.log(
    `Foundation check PASS; recorded acceptance outcome: ${outcome}. See verification.md for unavailable PHP/Docker/hosted checks.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
