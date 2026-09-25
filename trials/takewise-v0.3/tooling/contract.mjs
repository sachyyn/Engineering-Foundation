import { spawnSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { assert } from "./foundation.mjs";
mkdirSync(".tooling-output", { recursive: true });
const exported = spawnSync(
  "php",
  ["bin/console", "nelmio:apidoc:dump", "--format=json"],
  { cwd: "backend", encoding: "utf8", env: process.env },
);
assert(exported.status === 0, `OpenAPI export failed: ${exported.stderr}`);
assert(
  JSON.stringify(JSON.parse(exported.stdout)) ===
    JSON.stringify(JSON.parse(readFileSync("backend/openapi.json", "utf8"))),
  "OpenAPI is stale: regenerate backend/openapi.json",
);
const result = spawnSync(
  "pnpm",
  [
    "exec",
    "openapi-typescript",
    "../backend/openapi.json",
    "--output",
    resolve(".tooling-output/schema.d.ts"),
  ],
  { cwd: "frontend", stdio: "inherit" },
);
assert(result.status === 0, "Client schema generation failed");
assert(
  readFileSync(".tooling-output/schema.d.ts", "utf8") ===
    readFileSync("frontend/src/api/schema.d.ts", "utf8"),
  "Client schema is stale: regenerate frontend/src/api/schema.d.ts",
);
