# Verification and acceptance report

**Outcome: partial.** The approved documentation, five original local skills, recipes,
Node tooling/lock, CI and local-service definitions are present. Node foundation checks
pass. The earlier substantive pass was superseded by three confirmed external findings;
corrections have been made; independent re-review results are recorded below. PHP/Composer and Docker verification
remain unavailable and prevent a ready claim under the supplied acceptance contract.
No scope reduction was approved, and no product implementation was added.

Date: 2026-09-25. Exact target: `<repo>`.
Approval: user's simulated tech-lead response after the proposal, with Node 22,
owner/staff permissions and USD/no-tax adjustments. The current skill, output and
acceptance contract were reread before implementation, including the added review `mode`
field, core-area readiness restriction, and documentation-only application snippets rule.

## Verified on the exact target

| Command / inspection                                            | Outcome and scope                                                                                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --version`, `npm --version`                               | 22.23.1 / 10.9.8; no global installation                                                                                                                                           |
| `npm install --ignore-scripts --no-audit` after compatible pins | Exit 0; repository-local node_modules and package-lock.json. Final peers are compatible; vite override deduplicates an allowed version, no force/legacy-peer-deps.                 |
| `npm run tools:setup`                                           | Exit 0 after correcting archive license filename; official actionlint 1.7.12 SHA256 verified, executable and LICENSE.txt extracted locally.                                        |
| `npm run check`                                                 | Exit 0: actionlint, foundation structure/YAML/workflow guards, Prettier, ESLint, Secretlint, eight guard tests and npm audit. Prints product NOT RUN and recorded outcome partial. |
| `npm run check:negative` / Node test runner                     | Eight tests pass, zero skipped/cancelled. See mutation table below.                                                                                                                |
| `npm audit --json`                                              | Exit 0; zero known vulnerabilities in final resolution at retrieval time. [Final registry result](evidence/npm-audit-final.json). No guarantee against future advisories.          |
| `npm run check:product`                                         | Expected exit 1: PRODUCT BLOCKED names missing frontend/backend/contracts/tool inputs. This is a verified fail-closed gate, not product test success.                              |
| Import Vite/Vitest/Playwright configuration modules with Node   | Exit 0 for all three. jsdom synthetic DOM smoke check passed. No application or browser executable was launched.                                                                   |
| Python stdlib XML parse of tooling/phpunit.xml                  | Well-formed XML only. Does not validate PHP behavior or PHPUnit schema/runtime.                                                                                                    |
| Supplied structural validator, exact command below              | Structure passes; exit 2 because recorded outcome is partial. Git ignore verification unavailable because target is not a usable worktree.                                         |

```sh
python3 <engineering-foundation>/scripts/check_foundation.py <repo>
```

Actual diagnostic: `STRUCTURE PASS; recorded outcome: partial.` The supplied validator
does not certify source claims or engineering substance; exit 2 is intentionally retained.
The repository-native structural check returns success for a structurally consistent partial
record and explicitly labels its scope. These are different command contracts, not a hidden
conversion of acceptance to ready.

## Proxy verified: deliberate violations and clean copy

Trials are implemented in scripts/checks.test.mjs. Temporary files exist only beneath
repository `.verification/` and are removed afterward. Node test exit 0 means the expected
failure AND restoration assertions passed; individual negative subprocesses return 1.

| Rule     | Mutation and actual expected failure                                                                              | Restoration / limit                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| AGENT-01 | Break a skill-index link in a copied repo; validator throws missing/linked artifact diagnostic                    | Restore link; copied routes validate. Proves direct-file portability, not automatic discovery. |
| AGENT-01 | Claim ready with an unresolved blocker; validator throws unsupported ready claim                                  | Disposable copy removed; original remains partial.                                             |
| CI-01    | Add a new workflow containing `@main`; validator throws full-commit pin requirement                               | Restore immutable pin; workflow guard passes. Tests new-file coverage.                         |
| CI-01    | Append a shell failure-swallowing suffix to the required check; guard rejects the changed command                 | Restore command; guard passes.                                                                 |
| CHECK-01 | Add new frontend TypeScript file in copy                                                                          | Product detection activates; preflight throws PRODUCT BLOCKED. No fabricated app to pass it.   |
| LANG-01  | Synthetic new TS source declares explicit any; ESLint stdin with .ts filename exits 1 and names no-explicit-any   | Replace with unknown; exit 0. Actual parser/rule execution, not text grep.                     |
| API-01   | Synthetic local OpenAPI fixture references absent component; Redocly exits 1 with unresolved-reference diagnostic | Replace with valid schema; exit 0. Does not prove real application response contracts.         |

`node scripts/verify-clean.mjs` exited 0. It copied repository-owned files without
node_modules/vendor/global skills, ran `npm ci --ignore-scripts` using the local download
cache, independently installed the checksum-pinned actionlint, and ran `npm run check`.
All eight trials and audit passed in the copy; original application inputs remained absent.
The copy and its installed dependencies were removed. The download cache is not a global
configuration or skill dependency. This verifies a clean local copy, not a Git checkout
or actual hosted runner. A real Git checkout cannot be tested in this protected trial.

A final author inspection also corrected truthiness-based workflow checks: null
`pull_request_target` and boolean-false step conditions now fail based on key presence.
The eighth test verifies both failures and restoration.

## Earlier independent substantive review (superseded by external findings)

Mode: **independent**. Reviewer: separate Codex read-only agent `/root/foundation_review`.
The reviewer read the current supplied output/acceptance contracts and actual entry,
research, rules, recipes, five skills, enforcement, operations and tooling. It did not
edit files or certify runtime behavior. The initial review found four issues:

1. Invoice issuance locked the numbering counter without first locking/rechecking the
   invoice. Corrected DATA-02/P3 to reserve unique idempotency key, lock invoice then
   check state/version, then lock counter; specify same-key replay and consistent order.
2. Vitest lacked Vite's `@` alias. Added the equivalent mapping and imported config successfully.
3. Copyable DTO example omitted extra-attribute rejection. Added explicit serializationContext.
4. Isolation mutation claim conflated predicate enforcement with RLS. P2 now requires separate
   query-shape and database-policy tests; intact RLS can mask a missing predicate.

The reviewer reread the corrections and the additional Opis local-schema assertion recipe, and
returned **scoped substantive pass**, with no further content blockers. It explicitly
recommended partial overall due to unavailable PHP/Composer/Docker verification. This is
independent content review, not a fresh-agent implementation or native-discovery trial.

Acceptance challenge answers are in actual artifacts: P1 names operation/consumer files,
entry/index route the skills, API-02/UI-01 describe errors and interruption, P1 specifies
contract assertion and generation, P2–P4 handle tenant/permission/reset/concurrency risks,
and enforcement/operations define local/CI/release/recovery flow. No product code was needed
to resolve these conventions.

## Unavailable verification and closure actions

- **PHP 8.4/Composer:** not installed. Tooling composer manifest exists without a resolved
  lock/vendor. On an authorized capable environment resolve/inspect/lock dependencies and
  execute formatter, PHPStan, Deptrac and PHPUnit configuration checks. A missing interpreter
  is not a successful architecture check. This is an unfinished foundation verification item.
- **Docker:** not installed. Validate Compose, build the PHP tool image and test service
  connectivity/role setup with synthetic data. YAML parsing is insufficient. Development tags
  are not production digest pins. This is an unfinished foundation verification item.
- **Application behavior:** intentionally no application entries, routes, schemas, migrations
  or product tests. No auth/RLS/invoice/accessibility/build behavior has been verified. Product
  implementation requires separate authorization. Guidance completeness is subject to the
  external review corrections recorded below.
- **Hosted GitHub CI/merge protection:** no remote operations. Administrator activation and
  failing-PR trial in enforcement.md remain necessary; no claim of merge blocking.
- **Agent discovery:** native `.agents/skills` path is read-only; approved persistent skills
  are under docs/engineering/skills. Direct-file links and copied contents verified. Native
  automatic discovery/obedience in Codex or other tools is not verified.
- **Production:** provider, legal issuance/cancellation, retention, recovery objectives,
  mail service, secret identities, monitoring owner and restore drill remain launch gates.
  These do not excuse omitted architecture; operations.md gives actionable interim rules.
- **Rerun idempotence:** no second foundation reassessment was performed. Check repeatability
  and clean-copy installation are evidenced; a no-change reassessment claim is not made.

## Baseline and resolved setup failures

Pre-existing: empty project; protected `.git` is not a usable worktree; `.agents`/`.codex`
are read-only; PHP/Docker absent. No unrelated product work existed to overwrite. Protected
directories were not changed; no Git init/commit/push, cloud mutation, credentials or global
install occurred. Final application-source directories remain absent.

Resolved during setup: npm peer-graph `edgesOut` error; rejected temporary vulnerable
Vite/Vitest pins; deprecated ESLint 9 replaced with supported 10; actionlint archive's
LICENSE.txt filename corrected. Final checks use the corrected files and zero-advisory
lock. Initial audit is retained as history, not an accepted exception. No suppressions or
audit threshold changes were used to hide these findings.

## External review correction — 2026-09-25

The simulated lead confirmed three substantive failures in the final guidance: no defined
safe money/arithmetic limits, no concrete invoice-counter storage/locking/initialization
mechanism, and no account-management concurrency/session-revocation recipe. The earlier
content pass did not establish these requirements and is superseded. The DTO extra-attribute
fix remains valid and must be preserved. The updated acceptance rubric explicitly requires
cross-artifact consistency and critical workflow coverage. Review status was changed to fail while corrections and independent re-review were pending.

Corrections within the existing simulated approval:

- DATA-02/P3a now specify the NUMERIC(18,2) ceiling, MAX_CENTS, 64-bit PHP
  precondition, whole-quantity bounds, exact parsing, guarded multiplication/addition,
  wire/storage types and boundary vectors. These are technical ceilings, not commercial policy.
- P3b specifies tenant-keyed counter storage, atomic provisioning, grants/RLS, FOR UPDATE,
  BIGINT exhaustion, uniqueness and rollback; tests contend on different invoices.
- SEC-02/P7 specifies account creation/management, usable-owner quorum, ordered tenant/account
  locking, fresh authorization, optimistic record versions and session auth versions, with
  revocation/rollback/concurrency cases. P1/P4 and affected skills use the same protocol.
- The DTO allow_extra_attributes=false fix remains. No tooling, dependencies, CI, service
  definitions or application code were changed for these corrections.

Affected verification rerun on the exact target:

| Command                                                                                                                                                    | Result                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`                                                                                                                                            | Exit 0; formatting, lint, secret scan, structure/workflow checks, eight negative tests (none skipped), audit: zero vulnerabilities. Product NOT RUN. |
| `npm run check:product`                                                                                                                                    | Exit 1, PRODUCT BLOCKED: absent frontend/backend/contracts entries, application dependencies and PHP tooling lock/vendor. No dummy inputs added.     |
| `python3 <engineering-foundation>/scripts/check_foundation.py <repo>` | Exit 2, STRUCTURE PASS; recorded partial. Git ignore rules unverified because target is not a usable Git worktree.                                   |

These checks do not execute the new arithmetic, row-lock, owner-preservation or session
revocation recipes. Those remain future product tests requiring real PHP/PostgreSQL and
separate committed connections. No clean dependency install or unrelated research was repeated.
Local hash comparison against the pre-correction inventory confines changes to the seven
engineering documents/index plus four affected local skills; existing tooling is unchanged.

Independent content re-review by `/root/correction_review`: **PASS for the three
corrections** after reopening the actual rules, recipes, five local skills, routing,
enforcement, research and updated acceptance rubric. Reviewer confirmed the bounds, counter
mechanism, account workflow and preserved DTO rejection. Two wording ambiguities were
corrected and rechecked: SEC-02 now explicitly names both versions to rotate; P7's extra-field
test no longer incorrectly treats the legitimate role field as forbidden. This is a scoped
independent content review, not a fresh full foundation trial or runtime verification.
The manifest review finding is cleared; overall status remains **partial** for the existing
PHP/Composer and Docker verification blockers. Earlier review failures remain recorded above.
