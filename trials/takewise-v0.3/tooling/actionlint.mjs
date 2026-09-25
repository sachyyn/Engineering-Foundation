import { spawnSync } from "node:child_process";
const result = spawnSync(
  ".tools/actionlint/actionlint",
  ["-shellcheck=", "-pyflakes="],
  { stdio: "inherit" },
);
if (result.error) console.error("Missing actionlint: run pnpm setup:tools");
process.exit(result.status ?? 1);
