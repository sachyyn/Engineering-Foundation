// Download a reviewed check dependency, not an application or global installer.
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { run } from './lib.mjs';

if (process.platform !== 'linux' || process.arch !== 'x64') {
  throw new Error(
    'Actionlint package is pinned for Linux x64; use WSL/Linux or review an official matching artifact and checksum.',
  );
}
const url =
  'https://github.com/rhysd/actionlint/releases/download/v1.7.12/actionlint_1.7.12_linux_amd64.tar.gz';
const sha256 =
  '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8';
const response = await fetch(url);
if (!response.ok)
  throw new Error(`Actionlint download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(bytes).digest('hex') !== sha256)
  throw new Error('Actionlint checksum mismatch');
const directory = resolve('tooling/bin');
mkdirSync(directory, { recursive: true });
const archive = resolve(directory, 'actionlint.tar.gz');
writeFileSync(archive, bytes);
run('tar', ['-xzf', archive, '-C', directory, 'actionlint', 'LICENSE.txt']);
chmodSync(resolve(directory, 'actionlint'), 0o755);
console.log('Installed verified actionlint 1.7.12 under tooling/bin only.');
