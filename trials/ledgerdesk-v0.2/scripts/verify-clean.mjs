import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { files, run } from './lib.mjs';

const root = process.cwd();
mkdirSync(resolve(root, '.verification'), { recursive: true });
const target = mkdtempSync(resolve(root, '.verification/clean-'));
try {
  for (const source of files(root)) {
    const destination = resolve(target, relative(root, source));
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(source, destination);
  }
  console.log(`Clean-copy target: ${target}`);
  run(
    'npm',
    ['ci', '--ignore-scripts', '--cache', resolve(root, '.cache/npm')],
    { cwd: target },
  );
  run(process.execPath, ['scripts/setup-tools.mjs'], { cwd: target });
  run('npm', ['run', 'check'], { cwd: target });
  console.log(
    'Clean-copy setup/check PASS. This proves local file/dependency portability, not native agent discovery or product behavior.',
  );
} finally {
  rmSync(target, { recursive: true, force: true });
}
