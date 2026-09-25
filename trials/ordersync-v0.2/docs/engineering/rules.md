# Ordersync engineering rules

Approved by the simulated tech lead on 2026-09-25. These govern future changes;
they do not assert that unmodified product code already implements them.
Enforcement labels below distinguish executable checks from required review.

## Responsibilities and compatibility

**ARCH-01** `parse.py` owns CSV-to-`Order` conversion and may use the standard
library, never CLI or destination adapters. `Order` remains in `parse.py`.
Pure amount calculations added later belong in `money/`; they may depend on
Decimal and `Order`, never HTTP, environment variables, S3, or orchestration.
Check: import-linter for current modules; boundary review must extend contracts
whenever a new module is added, including `money/` and any new external package.

**ARCH-02** `cli.py` owns arguments, configuration, process exit, and composition.
`push.py` owns finance HTTP. When multiple destinations arrive, `run.py` owns
sequencing and durable outcomes, `archive.py` owns S3, `state.py` owns local
journal persistence, and `status.py` projects sanitized status. Adapters must not
import CLI or each other. `run.py` may call adapters; adapters receive explicit
inputs/clients and return outcomes. Shared outcome dataclasses/enums and safe
exceptions (including `DeadlineExceeded`) belong in future `contracts.py`, which
may depend only on the standard library and `Order`; it must not import adapters.
Keep synchronous calls and ordinary functions;
no framework, plugin registry, async engine, or database is required. Check:
current import-linter contracts plus new-module dependency review.

**CONTRACT-01** Existing finance JSON is `{"count": integer, "total": decimal_string}`.
Do not rename fields, change amount representation, or add an outbound field
without finance contract review. The new `Idempotency-Key` header is approved by
the lead, but not yet implemented. Keep the entry point `ordersync <csv-path>`
compatible; new configuration/arguments must be documented with failure behavior.
Check: contract tests for changed boundaries and reviewer comparison to this shape.

## Data integrity

**MONEY-01** Money is always `Decimal`, never float, including empty aggregation:
`sum((order.total for order in orders), Decimal("0"))`. Construct amounts from CSV
text, serialize as strings, and reject nonfinite values in new validation work.
No silent rounding, dropped rows, deduplication, or currency conversion. The export
has no currency column: preserve upstream amounts; introducing mixed currencies
requires a new contract before aggregation. Use an explicit local Decimal context
with traps for `Inexact` and `Rounded` for new calculations; precision overflow is
an input failure, not silent loss. Check: `check_money.py` rejects direct float
syntax in `parse.py` and future `money/**/*.py`; type checks and amount-path review
cover other files, aliases, empty input, and context behavior.

**DATA-01** Changes to input handling validate required headers `order_id`,
`customer`, `total`, missing/extra row fields, blank IDs, duplicate IDs within an
export, and finite decimal totals before any finance send. Private archival of a
bounded rejected original is allowed so failed runs also leave evidence. Accept signed
amounts; do not invent a two-decimal restriction. Extra named columns may be
ignored only when every row remains structurally consistent. Use UTF-8 CSV with
`newline=""`; decode failure is a failed run. Preserve original bytes for archive
and hash them with SHA-256 before parsing. Future guards: 10 MiB input and 100,000
rows; exceeding either prevents finance delivery. These are conservative engineering
limits, revisited with ops measurements before larger exports are enabled.
Check: review plus boundary tests; current parser lacks these checks.

The future snapshot interface is additive: keep public `read_orders(path: Path)`
as a compatibility wrapper, extract `read_orders_bytes(snapshot: bytes)` in
`parse.py`, and share a bounded `read_snapshot(path: Path) -> bytes` reader. Future
orchestration passes that one snapshot to hashing, the bytes parser and archive;
it must not then call the path wrapper and reread the file. Existing path callers
and the current parser test remain supported. See the CSV migration recipe.

## Run identity, time, and recovery

**RUN-01** A logical run is one source export for one explicit business date.
Future configuration supplies a stable source identifier and business date; never
infer the date from mtime or invocation time during recovery. A persisted UUID run
ID is allocated once as `str(uuid.uuid4())` under the single-host lock.
**`finance_key == run_id`**: use the exact same canonical lowercase hyphenated UUID
string for both persisted fields and the `Idempotency-Key` header. Do not mint a
separate key or derive one from the payload, date, or invocation. Persist both
fields together in the allocation write; on load, a mismatch is corrupt state
requiring reconciliation, never automatic repair or a replacement key. One local
`ledger.json` maps `(source_id, business_date)` to that run, file hash, payload and
outcomes; allocation and source high-water date are in the same atomic write.
There is no separately updated index. Same identity
and hash resumes the original run; different hash stops for finance/ops correction
approval. Hash alone is not run identity: identical exports on different dates
may be legitimate. Missing/corrupt history requires reconciliation, not a new key.
New identities must be later than that source's high-water date; older dates with
no retained record require reconciliation. Ops explicitly initializes the ledger
once with the last reconciled finance date for each source. Never auto-initialize
a missing ledger on startup. After 13-month record expiry retain only the source
high-water date to prevent old exports becoming fresh operations.
Check: identity, duplicate-invocation, mismatch, crash, and corrupted-state tests
when implementing; reviewer traces allocation before first external side effect.

**RUN-02** Before any finance request, durably record key, payload, hash, UTC
`first_attempt_at`, and `in_flight`. Reuse byte-identical payload and key on every
retry. A crash after sending but before receipt persistence is `unknown`, never
`not_attempted`. Finance confirms deduplication for 7 days. Automatic retries and
resumes stop at age 6 days 23 hours measured from the earliest persisted attempt;
the one-hour margin is conservative. A future or inconsistent clock timestamp
also stops replay. Never reset that timestamp or mint a new key to bypass expiry.
Beyond the window, ops reconciles with finance; code rollback does not authorize
resending. Check: review and fake-clock tests at/beyond cutoff and after crashes.

**RUN-03** All cron and manual invocations must share a nonblocking exclusive
`flock` on one persistent lock file in an ops-owned local filesystem directory.
Hold it for identity lookup, journal writes, all sends, and status persistence.
Do not unlink the lock file or run on NFS. A second host requires a new coordination
design. Future local journals: directory mode 0700, files 0600; write temporary
file in the same directory, flush and fsync it, `os.replace`, then fsync directory.
Check: operations review and concurrent-process/crash tests. The wrapper recipe
is inert documentation until activated by ops. Once in-process locking is added,
`state.py` uses `fcntl.flock(LOCK_EX | LOCK_NB)` around the entire run, called by
`run.py`; remove the outer flock wrapper to avoid acquiring the same lock twice.

**RUN-04** Persist separate outcomes for finance and archive: `not_attempted`,
`in_flight`, `confirmed`, `failed`, `unknown`; include safe error code and attempt
count. Overall success requires both required destinations confirmed and terminal
run record persisted. Record/status persistence failure is an operational failure,
not permission to resend confirmed finance. Total run deadline: five minutes;
request/retry sub-budgets must fit within it. Use monotonic elapsed time for budgets;
UTC wall time is for durable replay age. On this synchronous Ubuntu main-thread job,
enforce the nearest absolute deadline with `signal.setitimer(ITIMER_REAL)` and a
handler raising `DeadlineExceeded`; restore the enclosing deadline after each
adapter, never its original full duration. Per-phase HTTP timeouts alone are not
an elapsed deadline. Interruption after a possible remote effect leaves `unknown`.
Signals cannot preempt every native-code operation immediately; the ops wrapper
also uses a process-level five-minute timeout with a ten-second forced-kill grace.
On hard termination, recovery uses the last durable ledger state.
Check: state-transition review and
partial-success tests. Current one-destination CLI does not implement this model.

## Integration and security

**HTTP-01** Finance endpoint comes only from trusted ops configuration, never CSV.
Require HTTPS, certificate validation, no redirects, and explicit HTTPX connect,
read, write, pool timeouts of 5 seconds for new work. Check response status: only
2xx confirms delivery. Retry connection/timeout errors, 429, and 5xx only under
RUN-02; other 4xx fail without retry. At most three total attempts and 60 seconds
elapsed per invocation for finance, with exponential full jitter ceilings 1s, 2s.
Honor a valid `Retry-After` only within the remaining deadline; otherwise stop and
record deferred/failed reason. Invalid headers use bounded jitter. Disable nested
transport retries so the attempt count is real. Inject clock, sleep, random source,
and client for testing. Check: HTTP request/response and elapsed-budget tests.

**S3-01** Future archive layout is
`runs/<source_id>/<business-date>/<run_id>/{export.csv,run.json,status.json}`.
Validate source IDs against `[a-z0-9_-]+`; never derive keys from customer text.
Upload original bytes with a SHA-256 checksum using conditional create
`If-None-Match: *`. On existing object, verify the expected checksum before treating
it as confirmed; mismatch is an integrity failure. An ETag is not a SHA-256 hash.
Create `run.json` conditionally, then update using `If-Match` of the last ETag;
conflict stops the write and requires reconciliation instead of overwriting another writer. S3's SDK
retry count must fit an explicit three-total-attempt, 60-second adapter budget.
Check: mocked conditional-write, checksum, 403, timeout, and conflict tests; real
S3 policy/conditional-write verification is an external activation requirement.

**SEC-01** Only finance and ops may read original export and run record. Only ops
may read `status.json`, despite its adjacent key. Policy review must deny finance
status reads and avoid broad prefix grants overriding that separation. Runtime
identity gets only necessary access to its configured prefix, no public ACLs and
no delete or bucket administration. Block public access; use TLS and encryption at
rest. Credentials come from ops-managed runtime identity/configuration, never code
or CSV. Do not put webhook URL, response body, credentials, customer names, or
CSV rows in errors/logs/status. Catch boundary exceptions and expose stable safe
codes, never raw HTTPX exception text (which may contain the URL).
Check: threat/access review, denied-read tests, redaction tests with synthetic
sentinels. Ruff's exec/eval checks are supplementary, not proof of security.

**ERROR-01** Boundary codes are `input_invalid`, `config_invalid`,
`finance_rejected`, `finance_unknown`, `archive_denied`, `archive_conflict`,
`archive_unknown`, `state_io`, `status_io`, `replay_expired`, `deadline_exceeded`,
and `overlap`. Unexpected exceptions map to `internal_error` without raw text.
CLI failures exit nonzero; reserve 75 for overlap, 2 for input/configuration,
1 for other failures. Exhausted transport/5xx attempts are unknown unless a
receiver contract proves rejection; permanent 4xx are failed. Certificate and
configuration failures are not retryable. Review and tests assert safe codes,
exit behavior and persisted state, not unstable exception message text.

**RET-01** Keep archive and run/status records for 13 calendar months from run
creation (same day in target month, clamped to its last day). Ops must implement
and verify expiration for all three objects, noncurrent versions, backups and
local retained records; do not silently substitute 390 days. S3 lifecycle uses
day/date-based asynchronous expiration, so exact-calendar eligibility and actual
purge timing require ops verification. Retention does not extend finance replay
rights. Do not retain extra raw local exports after verified archival unless part
of the approved source retention policy. Check: retention/access activation review;
no deletion automation is installed by foundation setup.

**STATUS-01** `status.json` is an ops-only projection of durable run state, never
the authority for whether to resend. Include schema version, run ID, timestamps,
overall state, per-destination outcomes and safe error codes. No customer text or
secret values. Write one object beside `run.json`; stale/missing status must be
reported as unknown, never presumed success.
An unfinished run whose last update is over six minutes old is stale (five-minute
budget plus one-minute margin); a future timestamp is unknown. Terminal records
do not become failed merely with age. Monitoring of a missing new nightly run
uses the ops-configured expected completion time, not a guessed schedule.
Check: projection, interrupted-write,
staleness and denied-access tests. No web server/UI is part of this design.

## Verification, delivery, maintenance

**TEST-01** Preserve existing tests; new behavior tests belong in `tests/test_<module>.py`.
Use tmp_path, monkeypatch, capsys, HTTPX MockTransport, and injected fake adapters,
clocks/sleep. No real webhook, S3, production CSV, credentials, or wall-clock sleeps
in checks. Cover invalid input, duplicate/corrected exports, timeout after remote
acceptance, 7-day expiry, 403, partial delivery, and persistence failure when those
behaviors are added. Check: pytest collection/run plus reviewer inspection of
fixtures and assertions. Current passing parser test proves only its assertion.

**CHECK-01** Run `bash scripts/check.sh` using OS Python 3.12 and uv 0.12.8.
Commit dependency/lock changes together. Do not alter existing runtime requirements
just to set up tooling. Ruff checks the chosen correctness/security rules across
source/tests/scripts; mypy checks annotated code and untyped bodies; full strict
typing is not claimed. New public functions should be annotated (review).
Formatting is review-enforced with Ruff output as reference; no initial automated
formatter gate is adopted because product reformatting is outside scope.
Run formatting fixes explicitly only on authorized files. Check script failures,
missing tests, tools, or stale locks must remain nonzero. No suppressed baseline
errors. Policy/check changes require maintainer review.

**RELEASE-01** Check-only GitHub Actions has no production secrets, uses hosted
Ubuntu runners, read-only contents, immutable action pins and no privileged PR
trigger. An authorized maintainer reviews dependencies/action releases, licenses,
vulnerability advisories, artifact identity, and policy changes before merge.
Build a wheel from the reviewed revision and locked build constraints; ops installs
into a new release directory and switches cron only after offline verification.
Never use the real CLI as a smoke test. Keep the previous release and state for
rollback; protect the journal from code rollback. See the activation runbook.
Check: shared gate, build evidence, and release review; no automated deployment.

**MAINT-01** Ops on-call owns failed runs and reconciliation; repository maintainers
own dependencies and these rules. Reassess explicitly when changing destination,
currency/schema, runtime, host count, privacy, scale, replay window, or retention.
Review security updates with dependency changes and on reported advisories.
No scheduled foundation caretaker or global agent configuration is installed.
