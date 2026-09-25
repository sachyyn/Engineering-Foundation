# Verification

Date: 2026-09-25. Target: this repository, `repos/takewise`. Foundation outcome is recorded in foundation.json. No product code, migrations, remote repository or deployment was created.

## Verified

- Node24.21.0 Linux x64, downloaded from official Node distribution and SHA256 checked against its published checksum list. pnpm10.32.1 used with isolated temporary package cache/store; no global installation. Root `pnpm install --frozen-lockfile --ignore-scripts` resolves the committed lock. An initial install attempt hit a read-only personal cache; using the writable temporary cache fixed it without changing global configuration.
- `pnpm setup:tools`: actionlint1.7.12 official release checksum matched; local executable installed. Initial archive license filename mismatch was corrected to LICENSE.txt and bootstrap rerun successfully.
- `pnpm check`: exit0. Foundation route/path/YAML/JSON checks, four Node gate tests, Prettier, Secretlint and actionlint pass. Root dependency audit reports no known vulnerabilities at verification time; license inventory produced. Product state explicitly backend=false/frontend=false, so no product tests claimed.
- Git initialized with main and no commit or remote; pre-existing parent files preserved. Required artifacts and all nine skills are repository-owned and not ignored. Four upstream skills preserve pinned content and adjacent MIT notices; five project skills are proprietary.
- Clean-copy trial: copied only repository deliverables into a fresh directory, initialized Git, installed frozen dependencies from the package store and separately bootstrapped actionlint, then ran `pnpm check` with exit0. No author home-directory guidance or skill symlinks required. Node runtime/package cache are normal external prerequisites, not hidden guidance dependencies.
- Bundled `check_foundation.py` validates this target's artifact map, links, all skills and decision coverage; final status validation is recorded after independent review. This checks structure, not content truth.
- Independent substantive review passed after documented fixes; see [review evidence](review.md). Fresh-agent direct-file discovery/planning passed, distinct from actual feature implementation.

## Negative trials in disposable copy

Each change was restored; final foundation check returned0.

| Mutation                                                      | Intended result observed                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------ |
| Ignored local .env file                                       | Foundation remains green0, matching onboarding               |
| Force-stage that .env                                         | Exit1, tracked secret environment file                       |
| Break AGENTS rules link                                       | Exit1, missing entry route                                   |
| Replace checkout SHA with main                                | Exit1, immutable action SHA required                         |
| Add null pull_request_target event                            | Exit1, privileged trigger prohibited                         |
| Add backend/composer.json alone                               | Exit1, activated backend missing required files              |
| Add frontend/package.json alone                               | Exit1, activated frontend missing required files             |
| Add synthetic credential-bearing PostgreSQL URL under .github | Secretlint exit1, PostgreSQLConnection detection             |
| Unit fixtures with zero/skipped Vitest/Playwright reports     | Rejected by report guards; passing nonempty reports accepted |
| Unit fixture with if:false on quality job                     | Rejected as conditional required gate                        |

Initial AWS access-ID fixture was not detected because recommended Secretlint rules disable identifier-only scanning; this is a scanner coverage limit, not evidence of enforcement. The subsequent synthetic credential URL trial confirmed credential detection, including hidden workflow-directory files. The CI-only connection-string suppression is limited to one clearly documented disposable-service URL, not an ignored workflow.

## Proxy verified / not verified

- PHP8.3 syntax check of the PHP-CS-Fixer template passed. This is **proxy verification**, not PHP8.5 or installed PHP-tool execution.
- YAML parser/config policy validates Compose syntax, versioned images and loopback binding; image tags exist in Docker registry. Docker daemon/service startup is not verified here. An optional Compose CLI download stalled and was cancelled without executing the incomplete binary; only the YAML/config-policy validation is claimed.
- Product-dependent PHP8.5/Symfony/Doctrine/PG RLS transactions, Vue builds/tests, generated contracts, Deptrac collection and E2E setup are not active because applications were deliberately not scaffolded. Templates must be integrated and their actual tools run during the first authorized implementation PR. The gate fails incomplete activation.
- macOS execution and native Cursor/Claude Code discovery are not verified; portable source/check commands and a fresh direct-file agent trial were verified.
- GitHub workflow execution, branch protection and failing-PR trial require remote activation. Hosting, mail provider, production key custody, release identities, SLO/RPO/RTO, retention decisions and restore exercise remain pre-launch work in [delivery](delivery.md).
- No pre-existing target failures: the target was new. This report distinguishes discovered setup defects (fixed) from unbuilt application behavior and external activation.
