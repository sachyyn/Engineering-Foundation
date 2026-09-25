import { mkdir, writeFile, chmod } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { platform, arch } from "node:os";
const hashes = {
  darwin_amd64:
    "5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644",
  darwin_arm64:
    "aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f",
  linux_amd64:
    "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
  linux_arm64:
    "325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6",
};
const target = `${platform()}_${arch() === "x64" ? "amd64" : arch()}`;
if (!hashes[target]) throw new Error(`Unsupported platform: ${target}`);
const file = `actionlint_1.7.12_${target}.tar.gz`;
const response = await fetch(
  `https://github.com/rhysd/actionlint/releases/download/v1.7.12/${file}`,
);
if (!response.ok) throw new Error(`Download failed: ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash("sha256").update(bytes).digest("hex") !== hashes[target])
  throw new Error("actionlint checksum mismatch");
await mkdir(".tools/actionlint", { recursive: true });
await writeFile(".tools/actionlint/archive.tar.gz", bytes);
const result = spawnSync(
  "tar",
  [
    "-xzf",
    ".tools/actionlint/archive.tar.gz",
    "-C",
    ".tools/actionlint",
    "actionlint",
    "LICENSE.txt",
  ],
  { stdio: "inherit" },
);
if (result.status !== 0)
  throw new Error("Cannot extract verified actionlint archive");
await chmod(".tools/actionlint/actionlint", 0o755);
console.log("Installed repository-local actionlint 1.7.12; no global changes.");
