import { existsSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { productState, assert } from "./foundation.mjs";
import { checkVitest, checkPlaywright } from "./test-report.mjs";
const root = process.cwd();
mkdirSync(".tooling-output", { recursive: true });
const state = productState(root);
function run(command, args, cwd = root, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function need(paths) {
  for (const p of paths)
    assert(
      existsSync(p),
      `Activated product is incomplete: missing ${p}. See tooling/README.md`,
    );
}
if (state.backend) {
  need([
    "backend/composer.json",
    "backend/composer.lock",
    "backend/phpunit.xml.dist",
    "backend/phpstan.neon",
    "backend/deptrac.yaml",
    "backend/.php-cs-fixer.dist.php",
    "backend/tests/Unit",
    "backend/tests/Integration",
    "backend/tests/Contract",
    "backend/bin/console",
  ]);
  run("php", [
    "-r",
    'if (PHP_MAJOR_VERSION !== 8 || PHP_MINOR_VERSION !== 5) {fwrite(STDERR,"PHP 8.5 required\n"); exit(1);}',
  ]);
  const cwd = resolve(root, "backend");
  run("composer", ["validate", "--strict"], cwd);
  run(
    "composer",
    ["install", "--no-interaction", "--prefer-dist", "--no-scripts"],
    cwd,
  );
  run("composer", ["audit", "--locked"], cwd);
  run("composer", ["licenses", "--format=json"], cwd);
  run("php", ["vendor/bin/php-cs-fixer", "fix", "--dry-run", "--diff"], cwd);
  run("php", ["bin/console", "cache:warmup", "--env=test"], cwd);
  run("php", ["vendor/bin/phpstan", "analyse", "--no-progress"], cwd);
  run("php", ["vendor/bin/deptrac", "analyse", "--no-progress"], cwd);
  for (const suite of ["Unit", "Integration", "Contract"])
    run(
      "php",
      [
        "vendor/bin/phpunit",
        "--testsuite",
        suite,
        "--fail-on-empty-test-suite",
        "--fail-on-skipped",
        "--fail-on-incomplete",
        "--fail-on-risky",
        "--fail-on-warning",
      ],
      cwd,
    );
}
if (state.frontend) {
  need([
    "frontend/package.json",
    "frontend/pnpm-lock.yaml",
    "frontend/tsconfig.json",
    "frontend/eslint.config.mjs",
    "frontend/vite.config.ts",
    "frontend/playwright.config.ts",
    "frontend/src",
    "frontend/tests/e2e",
  ]);
  const cwd = resolve(root, "frontend");
  run("pnpm", ["install", "--frozen-lockfile", "--ignore-scripts"], cwd);
  run("pnpm", ["audit", "--audit-level=high"], cwd);
  run("pnpm", ["licenses", "list", "--json"], cwd);
  run("pnpm", ["exec", "eslint", ".", "--max-warnings=0"], cwd);
  run("pnpm", ["exec", "vue-tsc", "--noEmit"], cwd);
  run("pnpm", ["exec", "prettier", "--check", "."], cwd);
  const vitestReport = resolve(root, ".tooling-output/vitest.json");
  rmSync(vitestReport, { force: true });
  run(
    "pnpm",
    [
      "exec",
      "vitest",
      "run",
      "--passWithNoTests=false",
      "--reporter=json",
      `--outputFile=${vitestReport}`,
    ],
    cwd,
  );
  checkVitest(JSON.parse(readFileSync(vitestReport, "utf8")));
  run("pnpm", ["exec", "vite", "build"], cwd);
  const playwrightReport = resolve(root, ".tooling-output/playwright.json");
  rmSync(playwrightReport, { force: true });
  run(
    "pnpm",
    [
      "exec",
      "playwright",
      "test",
      "--forbid-only",
      "--fail-on-flaky-tests",
      "--reporter=json",
    ],
    cwd,
    { PLAYWRIGHT_JSON_OUTPUT_NAME: playwrightReport },
  );
  checkPlaywright(JSON.parse(readFileSync(playwrightReport, "utf8")));
}
if (state.backend || state.frontend) {
  need([
    "backend/openapi.json",
    "frontend/src/api/schema.d.ts",
    "frontend/package.json",
  ]);
  // Full-stack contract coupling is intentional: API/frontend activation must establish the shared contract.
  run("node", ["tooling/contract.mjs"]);
} else
  console.log(
    "Product checks INACTIVE: no application inputs. No product tests claimed.",
  );
