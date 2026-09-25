# Enforcement and activation

## Commands and scope

Run from repository root, with local dependencies from `npm ci --ignore-scripts` and
`npm run tools:setup` (official checksum-pinned actionlint, repository-local).
Scripts are readable under scripts/ and do not provision services or contact production.
`npm audit` submits dependency/version metadata to the configured public registry; no
source is uploaded. Registry access is required for the audit; a network failure fails the
command instead of asserting a clean audit. Missing command/configuration prerequisites fail rather than pass.

| Command                      | What it proves / limits                                                                                                                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`              | Foundation route/index/YAML/workflow guards and actionlint, format, lint, text-secret scan, guard negative tests, npm high/critical audit; invokes product gate if frontend/backend/contracts/e2e files exist. Prints product NOT RUN in an empty project. |
| `npm run check:foundation`   | Structural consistency and focused workflow safety; accepts an honestly recorded partial status. Does not certify substantive claims or application behavior.                                                                                              |
| `npm run check:negative`     | Disposable-copy trials for broken routing, unsupported ready claim, new mutable action, hidden check failure, new product activation TS-any lint and unresolved contract reference. No product behavior proof.                                             |
| `npm run check:product`      | Fails until actual application entries, locks, dependencies and suites exist; then executes language, contract, PHP boundary, test and build tools. This is intentionally unavailable now.                                                                 |
| `npm run format`             | Explicitly mutates formatting; CI runs check mode only.                                                                                                                                                                                                    |
| `npm run audit:dependencies` | Registry vulnerability findings, high/critical fail. No guarantee of absence of undisclosed vulnerabilities.                                                                                                                                               |

Product runner requires real input files and nonempty named test suites. A preflight
file check is only an early diagnostic: PHPUnit/Vitest/Playwright then execute tests and
must fail for empty suites. Preflight does not certify behavior. Contract lint and generated
type freshness are executable now as tooling, but the real contract is not created during
foundation setup. Real HTTP schema assertions and route/operation coverage must be authored
with the first operation; they remain a named test-review obligation rather than a current
automated behavior check.

PHP tooling manifest/configuration is under tooling/php and tooling/. It has **no resolved
lock/vendor installation** because PHP/Composer are unavailable. On an authorized PHP 8.4
environment resolve with `composer update --no-plugins --no-scripts --working-dir=tooling/php`,
inspect the resolution, preserve composer.lock, and subsequently use `composer install
--no-plugins --no-scripts --working-dir=tooling/php`. Configure COMPOSER_HOME and cache to
repository-local `.cache/composer` when reproducing this trial. Do not use ignore-platform-reqs.
Future backend dependencies (Symfony 7.4, Doctrine ORM/DBAL/migrations, Mailer/Messenger,
security/validator/serializer and Opis JSON Schema 2.x for contract assertions) belong in the
backend manifest only during separately authorized scaffolding. No fake backend manifest now.

## Rule-to-check/review matrix

| Rules     | Automated mechanism                                                                                             | Required reviewer criterion / gap                                                                                                                                                                                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARCH-01   | Deptrac config names app layers and Controller-to-Doctrine/HTTP edges; PHPStan                                  | Check unclassified dependencies, service authorization, raw DBAL and integration ownership. PHP runtime verification unavailable.                                                                                                                                                              |
| LANG-01   | Prettier, ESLint strict TS rules, vue-tsc strict config, PHP-CS-Fixer/PHPStan                                   | Explicit public signatures, immutable DTOs, safe money precision. PHP checks unavailable, app typecheck awaits inputs.                                                                                                                                                                         |
| API-01–03 | Redocly contract lint, generated type comparison; future functional schema tests                                | Review every operation/error/status, extra input rejection, DTO/entity mapping, pagination and idempotency authorization. No contract/app exists.                                                                                                                                              |
| SEC-01–03 | Required functional auth/reset test suite                                                                       | Check login CSRF, limiter/token lifecycle and P7 account-management authorization, tenant-first lock order, usable-owner quorum, record_version and auth_version. Require simultaneous owner-demotion, revocation/business-mutation race and rollback tests. Static lint cannot prove these.   |
| DATA-01   | Required real-role PostgreSQL integration tests                                                                 | Review RLS coverage/grants, tenant predicates, FK integrity, identity/queue exceptions and reused connection context. DB tests unavailable.                                                                                                                                                    |
| DATA-02   | Required money/concurrency/role tests                                                                           | Trace P3a bounds, pre-arithmetic guards and boundary vectors against DTO/DB/frontend types; trace P3b counter provisioning, grants, row locks, exhaustion and atomicity. Require different-draft contention, rollback and tenant independence. No production issuance until legal gate closed. |
| DATA-03   | Required migration tests from empty/prior schema                                                                | SQL locks, backfill impact, expand/contract and rollback/forward-fix review.                                                                                                                                                                                                                   |
| UI-01     | ESLint bans component fetch, selected cross-feature imports, explicit any and v-html; vue-tsc                   | Alias/relative imports can escape simple patterns; review every cross-feature edge and all storage/retry/401 state handling.                                                                                                                                                                   |
| UI-02     | Future Playwright/axe and keyboard scenarios                                                                    | Manual focus, screen-reader, contrast/zoom review. Browser engines are proxies.                                                                                                                                                                                                                |
| JOB-01    | Future worker retry/context tests                                                                               | At-least-once mail effects, queue data minimization and failure replay safety.                                                                                                                                                                                                                 |
| TEST-01   | Product preflight + suite runners fail closed/empty                                                             | Reviewer confirms assertions exercise risk, real roles and concurrent commits; filename count is not proof.                                                                                                                                                                                    |
| DEV-01    | npm engines/lock, npm ci, Node check                                                                            | PHP platform and container image/runtime verification missing. Linux/macOS/Windows-with-WSL commands documented, only this Linux target tested.                                                                                                                                                |
| CHECK-01  | Shared runner, negative guard trials, Secretlint, npm audit                                                     | Secret scan covers current text only, not Git history or every secret format. Review ignores and install scripts.                                                                                                                                                                              |
| CI-01     | Actionlint schema/expression validation, YAML parser and focused Node workflow guard; immutable action evidence | Actionlint shellcheck/pyflakes integrations are disabled (not installed); embedded shell/Python needs review. Hosted behavior and remote rules unverified. Review concurrency, fork handling, all scripts/actions and permissions.                                                             |
| OPS-01    | Future deployment smoke/restore checks                                                                          | Provider activation, immutable artifact identity, migrations, worker restart, log redaction, legal/retention and recovery gates per operations.md.                                                                                                                                             |
| AGENT-01  | Index/relative link/skill frontmatter checks and clean-copy trials                                              | Read actual rule/recipe/skill content; neither route checks nor model acknowledgments prove obedience.                                                                                                                                                                                         |

The generated Node structural check has a smaller scope than the supplied Python validator.
The supplied validator is also run directly for acceptance; Python is not a product or CI
dependency. Both verify structure, not source accuracy, technical completeness or review quality.
Reassess new mandatory rules by adding an existing-tool check or an explicit reviewer criterion.

## GitHub administrator handoff (not activated)

1. Create/choose the intended private GitHub repository and usable local Git worktree outside
   this trial. No remote or Git initialization was performed; protected `.git` was preserved.
2. Activate `.github/workflows/quality.yml` with GitHub-hosted ubuntu-24.04 runners. Workflow
   triggers are pull_request and push to main, with no schedule or deployment. Fork PRs use
   unprivileged context and no secrets; require approval of unknown contributor workflow runs.
3. Require the observed **quality** job from GitHub Actions for main after confirming its exact
   check identity in a real run. Require PR review, dismiss stale approvals, forbid direct/force
   pushes and deletion, and restrict bypass to an explicitly accountable emergency process.
4. Assign actual maintainers as owners/reviewers of AGENTS.md, docs/engineering, scripts,
   tooling, package/locks, and .github before adding CODEOWNERS. No usernames were invented.
5. Submit an intentionally failing PR (e.g. mutable action pin or TS-any violation); verify
   merge rejection and restoration. Record settings and observed result. No remote enforcement
   exists merely because this YAML is present.
6. Before the first product PR, provide PHP 8.4/Composer/PostgreSQL/browser test dependencies
   and local test-data bootstrap in CI under a reviewed foundation extension. The current
   product guard will reject missing prerequisites. Never weaken it to merge scaffolding.
7. If enabling a merge queue, add `merge_group` and test it before activation. No merge queue
   is assumed today. Production environments/identities/secrets/CD are a separate approved step.

Repo-only work cannot force arbitrary agents to read instructions or activate merge protection.
This limit does not remove the local checks, persistent guidance or review obligations.

## Content review for integrity changes

Reopen rules, worked recipes and every affected local skill together. Verify that named
bounds, SQL locks, initialization, error statuses and tests agree. Trace account creation,
role/email changes, deactivation/reactivation and password reset through P7/P4; trace
draft edits and issuance through P3. A structural pass cannot replace this review.
The concurrency and arithmetic tests named above are future product acceptance requirements,
not tests executed by the current foundation-only check.
