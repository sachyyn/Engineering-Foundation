# Verification evidence

Date: 2026-09-25. Scope: approved repository foundation, under simulated tech-lead
approval. Source/tests and the existing README change are preserved. No product
features, remote changes, commits, production access or global installs occurred.

## Verified on the repository

- OS Python 3.12.3 and uv 0.12.8; locked Ruff 0.16.9, mypy 2.3.1,
  import-linter 2.15, pytest 9.1.1, Hatchling 1.32.4.
- Ruff passes. Mypy passes across eight source/test/script files. Both import
  contracts pass. Money guard passes. `uv run pytest` collects one test and passes.
- Wheel build succeeds. Wheel inspection lists four ordersync module files plus
  METADATA/WHEEL/entry_points/RECORD; caches, trial files, docs and skills are absent.
  uv warns its cache is inside the source tree; actual wheel contents were checked.
- `bash -n scripts/check.sh` passes. Workflow manually reviewed for YAML structure,
  exact action pins/inputs, permissions, master/PR/merge-group triggers, stable job
  name, no path filters, no production credentials and no deployment commands.
- Supplied validator is copied unchanged; root AGENTS routes, skill links and
  CLAUDE import were reopened and inspected. The current Codex session directly
  read the local entry and all three skills during the acceptance review.
- Initial full gate passed all tool/test/build stages, then returned 2 because
  the artifact index honestly still recorded pending review/partial status.
  Final ready-state commands are recorded below.

## Proxy verified: deliberate violations and clean copy

`UV_CACHE_DIR="$PWD/.cache/uv" UV_PYTHON_DOWNLOADS=never uv run python
scripts/verify_foundation.py` creates a fresh disposable copy inside the repository,
with its own environment/cache and no symlink or session-skill dependencies. It
copies only explicit source/config/guidance paths, not credentials, data or Git.
It removes the copy afterward. Detailed commands, outputs and exits are saved in
[trial-results.json](trial-results.json).

| Mutation | Intended check | Observed failure |
| --- | --- | --- |
| float construction appended to parser | money AST guard | exit 1, MONEY-01 |
| float literal in newly added money module | money AST guard | exit 1, MONEY-01 |
| parser imports CLI | import-linter | exit 1, ARCH-01 BROKEN |
| new module assigns text to int | mypy | exit 1, incompatible types |
| new module calls eval | Ruff | exit 1, S307 |
| new failing test | pytest | exit 1, assertion failure |
| remove only test from collection by renaming function | pytest | exit 5, no tests ran |
| requirement changed without lock update | uv sync --locked | exit 1, stale lock |
| remove local data skill | structural validator | exit 1, broken local reference |

Every mutation was restored before the next. Initial and restored full-copy gates
passed all executable stages; their initial exit 2 reflected the then-partial
index. The final run with the reviewed ready index returned exit 0 for both the
clean and restored gates. The
copy intentionally has no Git repository: Git ignore inclusion there is unverified,
while the exact repository validator checks inclusion on the real target.

## Separate substantive self-review

Initial reviewer: Codex foundation author, separate self-review; no independent-review or
fresh-client behavior claim. Reopened actual rules, patterns, skills, research,
enforcement, index, entry and scripts against the supplied acceptance rubric.

- Architecture: recipes preserve existing modules and identify future ownership,
  dependency direction and shared contract types without creating product layers.
- Critical workflows: CSV/Decimal, replay, archive, status, crash recovery, release
  and access denial each have file placement, failure behavior and test criteria.
- Review found and corrected an underspecified identity/index write: one atomic
  ledger now includes allocation, high-water and outcomes. Missing history cannot
  silently mint a fresh key; retention preserves minimal replay protection.
- Review clarified wrapper versus in-process lock acquisition to avoid double
  locking, and elapsed deadlines versus HTTP phase timeouts. Native-code signal
  limitations are disclosed and the ops timeout provides a forced-kill fallback.
- Review made safe error codes/exit semantics explicit and corrected the S3
  conflict wording. Unknown 5xx/transport outcomes cannot become known-unsent.
- Final requirement trace clarified archival of failed runs: invalid bounded CSV
  may be privately archived while finance is skipped; missing/oversized originals
  produce explicit incomplete-archive evidence and ops recovery, never fake success.
- Privacy: original bytes/run record finance+ops, adjacent status ops-only, with
  denied-read activation tests and no broad grant assumption. Thirteen calendar
  months and noncurrent/local/backup expiry are explicit; retention is not replay.
- Evidence: decisions distinguish lead facts, inspected sources, engineering
  defaults and external prerequisites. No generic upstream skill was silently
  treated as project-specific; three original persistent skills cover the disciplines.
- Enforcement: automated syntax/type/import/test gates are distinguished from
  review rules and future feature tests. Existing product debt is visible without
  disabled checks, source fixes or placeholder tests.

Substantive review: **pass** for the approved foundation contract. No scope
exceptions or unresolved core architecture decisions remain.

## Initial acceptance

Outcome: **ready** for the approved repository foundation, not production delivery.

| Command/check | Target | Result |
| --- | --- | --- |
| `bash scripts/check.sh` | Repository, OS Python 3.12.3 | exit 0; lint/type/import/money checks pass, 1 pytest test passes, wheel builds, STRUCTURE PASS ready |
| Supplied `check_foundation.py` invoked directly | Exact repository | exit 0, STRUCTURE PASS ready |
| `uv run python scripts/verify_foundation.py` with local uv paths | Disposable repository-local copy | exit 0; 9 negative cases rejected, initial/restored shared gates exit 0; copy removed |
| `git diff --exit-code -- src tests` | Exact repository | exit 0; product source and tests unchanged |
| `git diff --check` | Exact repository | exit 0 |
| Byte comparisons | Exact repository | Original AGENTS prefix preserved; README equals original plus existing retry TODO; copied validator equals supplied source |

Final documentation refinements for failed-run archival were separately reread and
structurally checked after the clean-copy trial; executable checks were unchanged.
The lockfile SHA-256 is
`f98bea099762470c69d73cf9d36e08046725504b06de6a3e5a7b535e9bcd7319`.
The remaining external verification below is outside the approved repository work,
not a claim that remote enforcement or future features already exist.

## Not verified / external handoff

- Hosted Actions, merge protection and failing-PR/merge-queue trials. See
  [activation instructions](enforcement.md); required check is `ordersync-quality`.
- Actual finance deduplication, S3 IAM/encryption/conditional writes/retention,
  ops deployment/monitoring and product recovery behavior. No live systems touched.
- Native skill loading in fresh Codex/Claude processes. Executables are present,
  but no authenticated fresh client session was launched. Direct-file routing was
  inspected here and in the copy; this does not prove native discovery or obedience.
  Codex native `.agents/skills` discovery is intentionally unavailable at the
  approved `.claude/skills` location. Use the documented direct-file route.
- No actionlint/YAML-schema tool was installed; CI received manual configuration
  review and local execution of its shared command, not hosted execution.
- Full foundation rerun idempotence, bit-identical builds, vulnerability scan,
  minimum dependency versions and production load are not claimed.

## Pre-existing failures/debt

The first read-only pytest attempt could not acquire uv's user-cache lock and
collected no tests. Repository-local uv paths resolved that environment failure.
No baseline test failure remains. Product gaps remain: unchecked HTTP status,
integer zero for empty aggregation, incomplete input validation and only one
positive parser test. These are recorded in [research](research.md), not repaired.

## Independent review and correction follow-up

Source: independent read-only findings relayed by the simulated tech lead in the
follow-up request on 2026-09-25. Reviewer identity and a complete independent
report were not supplied. The earlier ready claim was based on author self-review;
this record does not retrospectively call it an independent pass.

| Finding | Correction | Closure criterion |
| --- | --- | --- |
| RUN-01 did not relate run ID to finance key | Rules, retry/archive recipes and delivery skill now require `finance_key == run_id`, one canonical UUID4 string allocated once and persisted together; mismatch blocks delivery. | Re-read all affected guidance and trace initial send, restart, persisted JSON and mismatch behavior for consistency. Future feature tests assert header equality and no send on mismatch. |
| Snapshot recipe omitted the existing parser interface migration | Keep `read_orders(path)` as a public compatibility wrapper over new `read_snapshot(path)` and `read_orders_bytes(snapshot)`; future run.py reuses one snapshot. Recipe names unchanged CLI/path test, future caller migration and additional parity/single-read tests. | Compare recipe to current parse.py, cli.py and test_parse.py; preserve their source and test bytes during this correction. |

Author correction review: both findings addressed in documentation; independent
post-fix re-review is **not verified**. `substantive_review.mode` remains `self`
for the author closure, with independent findings recorded separately in the index.
No new product tests were written: the specified regression tests belong to future
implementation, and a passing existing test cannot prove unimplemented interfaces.

Skill reassessment is recorded in [skills](skills.md). Recommend the reviewed
community testing skill with project overrides; installation is only proposed and
no upstream payload, dependency, workflow or routing change was installed.

Affected-check reruns on this repository:

- `bash scripts/check.sh`: exit 0; Ruff, mypy (8 files), both import contracts,
  money guard, `uv run pytest` (1 passed), wheel build and local structural check
  pass. This does not validate future product implementations described in prose.
- Updated supplied `check_foundation.py`, invoked directly against this repository:
  exit 0, `STRUCTURE PASS; recorded outcome: ready`.
- `git diff --exit-code -- src tests` and `git diff --check`: exit 0. Existing
  source/tests remain untouched; the original README change is preserved.
- Reopened the actual key/snapshot clauses and local skill references after edits;
  both findings' closure criteria above pass author review. Data and delivery
  skill revisions advanced to 2; maintenance remains revision 1.

The supplied validator changed since initial setup. Inspected its diff: it now
rejects certain unquoted YAML descriptions and checks portability across all
artifact roles. The local vendored validator still matches the original setup
snapshot, not the updated package. No check was weakened or copied over silently.
Prior negative trials remain historical evidence; repository executable check
logic is unchanged, so these documentation corrections did not repeat all mutation
trials. The new supplied validator was exercised directly, without claiming its
new rejection paths were mutation-tested here.

Current outcome: **ready for the approved foundation scope**, with the two reported
findings addressed and checks passing. External skill adoption is a separate
pending proposal, not an installed deliverable or an independent reviewer approval.
Independent post-fix re-review and the previously listed external activation checks
remain not verified.
