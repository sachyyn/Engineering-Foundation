# Foundation research and decision record

Research retrieved 2026-09-25. Foundation source: engineering-foundation skill
package version 0.2.0, supplied for this trial. No session tools, machine paths,
or personal agent preferences are team requirements.

## Authority and target evidence

Existing internal Python batch job, ordersync 0.3.1. The simulated tech lead
explicitly approved this foundation after the read-only proposal, including three
project-authored skills in `.claude/skills`, CLAUDE.md importing AGENTS.md, locked
tools, shared checks and check-only GitHub workflow. No product repair/features,
remote changes, commits, secrets, cloud changes or global installs are authorized.
Original AGENTS.md rules and the uncommitted README retry TODO must remain intact.

Inspected `pyproject.toml`, all three source modules and package initializer,
`tests/test_parse.py`, README, AGENTS.md, gitignore, Git status/root/branch and
symlinks. The branch is `master`. No lockfile, CI, local skills or delivery scripts
existed. `cli.py` parses a positional file, calls `read_orders`, calls `push_summary`,
prints count. Parser constructs Decimal from text. HTTPX posts count/string total
without status checking. Only one positive Decimal parser test existed. No source
or test changes are included in this foundation.

Lead facts: Ubuntu 24.04 LTS, OS Python 3.12, cron, ops on-call owns failed runs.
Finance accepts Idempotency-Key and deduplicates for seven days; duplicates are
unacceptable. Original CSV and JSON run record go to S3 for finance/ops readers;
adjacent JSON status is ops-only. Retention is 13 months. These are supplied
contract facts, not independently verified against production.

## Version and dependency context

Keep `requires-python >=3.12`, `httpx>=0.27`, `pytest>=8`, and Hatchling backend.
Supported operational/test baseline is Python 3.12; the manifest's wider range is
not a claim that newer interpreters have been tested. `.python-version` and the
check command select 3.12; Python downloads are disabled. Local interpreter used
for verification: 3.12.3. Team uv baseline: 0.12.8.

Resolved lock: HTTPX 0.28.1, pytest 9.1.1, Ruff 0.16.9, mypy 2.3.1,
import-linter 2.15, Hatchling 1.32.4. Tool and build-group pins are exact; uv.lock
also pins transitive packages and distribution hashes. Existing application
requirement ranges remain unchanged. The build group pins Hatchling and its
dependencies so wheel construction can use `--no-build-isolation` after locked
sync. This avoids fetching a floating backend in a second isolated build env.

These are resolved versions, not claims of audited vulnerability freedom or that
all current upstream defaults apply to older allowed dependencies. Re-resolve only
in an explicit reviewed dependency update; minimum-version compatibility is not
tested by the current locked gate.

Installed distribution metadata declares Ruff/mypy/Hatchling/pytest MIT,
import-linter BSD 2-Clause, and HTTPX BSD-3-Clause. These metadata were inspected;
transitive redistribution notices and current vulnerability advisories still
require release review. No advisory scan or license-compliance certification is
claimed. The locked build group was added within approved tooling scope.

## Decisions, evidence, alternatives and consequences

| Question | Evidence actually read | Decision, alternative and revisit |
| --- | --- | --- |
| Precision and CSV contract | [Python 3.12 Decimal](https://docs.python.org/3.12/library/decimal.html): decimal text construction, configurable precision, signals, nonfinite values | Preserve Decimal and string wire amounts; trap rounding/inexact in new calculations. Binary floats are unsuitable. Do not impose arbitrary currency rounding; currency/schema change needs finance review. MONEY-01, DATA-01, CSV recipe. |
| Retry implementation and isolated testing | [HTTPX transports](https://github.com/encode/httpx/blob/master/docs/advanced/transports.md), [timeouts](https://github.com/encode/httpx/blob/master/docs/advanced/timeouts.md), [quickstart](https://github.com/encode/httpx/blob/master/docs/quickstart.md), retrieved via library documentation tool | HTTPTransport retries only ConnectError/ConnectTimeout; explicit response checking and a bounded adapter policy are needed for 5xx. MockTransport avoids live network. Keep HTTPX; do not add Tenacity or async framework for this small policy. Revisit a retry library if policy grows; avoid multiplying SDK and outer retries. HTTP-01 and retry recipe. |
| Identity versus request hash | [AWS Builders' Library](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/): ambiguous outcomes and caller intent; identical payload can represent distinct operations | Persist caller run/key once per source/date, bind it to hash, stop mismatched corrections. Hash-only keys confuse identical exports from different dates. No exactly-once claim across destinations. Seven-day receiver limit bounds replay; long-retained archives are not replay permission. RUN-01/02. |
| Archive overwrite/concurrency | [S3 conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html): If-None-Match creates and If-Match updates with conflict behavior | Conditional immutable CSV, CAS updates for run/status; single-host local journal. Unconditional put could overwrite evidence. A database/outbox is unnecessary on one locked host; reassess on second host or concurrent producer. S3-01 and archive recipe. SDK selection waits for product implementation. |
| Security and retention | [S3 security](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html): private policy-based access; [expiration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html): asynchronous expiry and separate noncurrent versions | Prefix/object-specific finance versus ops access, least privilege, TLS/encryption; avoid public ACLs. Thirteen calendar months needs an explicit eligibility/purge policy rather than assuming 390 days or current-version expiry deletes all copies. Actual bucket/role/KMS choices and retention activation remain external prerequisites. SEC-01/RET-01. |
| Overlap and crashes | [flock manual](https://man7.org/linux/man-pages/man1/flock.1.html): nonblocking exclusive lock and lifetime bound to held file descriptor | One local lock for cron/manual paths, durable journal under lock. Cron timing alone does not prevent overlaps. No distributed lock/database yet; NFS or second host invalidates this assumption. RUN-03, state-write recipe and runbook. |
| Reproducible local/CI execution | [uv synchronization](https://github.com/astral-sh/uv/blob/main/docs/concepts/projects/sync.md): locked sync rejects absent/stale lock and exact sync removes extras | Keep uv; add lock and one script. OS Python plus repository-local environment/cache rather than Docker, because there are no local services. Build from a locked build group. Revisit runtime only with ops approval. CHECK-01. |
| Static verification adoption | [Ruff configuration](https://docs.astral.sh/ruff/configuration/), [mypy existing code](https://mypy.readthedocs.io/en/stable/existing_code.html), [import-linter forbidden contracts](https://github.com/seddonym/import-linter/blob/main/docs/contract_types/forbidden.md) and configuration/run docs | Ruff correctness/security subset, mypy including untyped bodies, explicit import boundaries. No blanket strict migration or product formatting churn. Format is reviewed, not an automated gate; adding strictness requires checking baseline first. Decimal syntax guard supplements types, does not claim dataflow proof. |
| CI trust and activation | [GitHub secure use](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions); official action tag APIs and action.yml files linked below | Hosted check-only runner, least privilege, no secrets, stable required name, no path filters or privileged PR context. Remote rulesets and failing-PR trial are outside repository work. No deployments on push/tag/manual triggers. RELEASE-01. |
| Portable agent instructions | [Codex skills](https://developers.openai.com/codex/skills/), [Claude memory](https://code.claude.com/docs/en/memory), [Claude skills](https://code.claude.com/docs/en/skills) | One canonical skill set under writable .claude, direct AGENTS routes for Codex, @AGENTS.md import for Claude. Native folders differ; do not claim native Codex discovery here. No global install or dependence on session-installed tools. See skills.md. |

Action pins verified through official read-only GitHub API responses:
[checkout v5.0.0](https://api.github.com/repos/actions/checkout/git/ref/tags/v5.0.0)
→ `08c6903cd8c0fde910a37f88322edcfb5dd907a8`;
[setup-uv v6.8.0](https://api.github.com/repos/astral-sh/setup-uv/git/ref/tags/v6.8.0)
→ `d0cc045d04ccac9d8b7881df0226f9e82c39688e`.
Read each action.yml at that commit: checkout uses Node 24; setup-uv uses Node 20,
supports version and cache controls. These are selected verified pins, not a claim
of latest releases or full JavaScript supply-chain audit. GitHub-hosted runner
compatibility/execution remains an activation test. Maintainers revisit pins on
security notices or runner deprecations.

## Baseline debt and adoption

During substantive review, read the Python 3.12
[signal](https://docs.python.org/3.12/library/signal.html) and
[fcntl](https://docs.python.org/3.12/library/fcntl.html) documentation. Signals run
on the main thread and can be delayed by native code; they are not a universal
hard-deadline guarantee. The single-thread synchronous design can use a deadline
timer, backed by an ops process timeout. Review also chose one atomic ledger
document for identity/high-water/outcomes to avoid a two-file crash inconsistency.
These are engineering implementation conventions within the approved scope, not
claims that the lead supplied these mechanisms or numeric safeguard defaults.

- `push.py`: no response status check; CLI can report success after rejected HTTP.
  Revisit before retry/status work. Do not treat existing success output as receipt.
- Empty `sum` uses integer zero, despite normal rows containing Decimal. MONEY-01
  gives the future correction; the syntax guard does not detect this semantic gap.
- Parser lacks explicit encoding/schema/finite/duplicate/size guards and monetary
  context traps. Revisit on validation/contract work, before archiving untrusted input.
- No durable key/journal/retries/second destination/status exists. Rules and recipes
  specify how to add them but foundation does not implement or claim those behaviors.
- Only the positive Decimal test exists. No live boundary is verified. Future tests
  attach to authorized feature changes, not fabricated passing placeholders.
- First read-only test attempt failed before collection on a read-only user cache.
  Approved local cache/environment resolves that environmental prerequisite.

These are named existing behavior gaps, not check suppressions or approval to
introduce them in new code. No core deliverable is excluded. Performance defaults
(10 MiB/100k rows, five-minute run, adapter budgets) are explicit engineering guard
choices pending real ops measurements; no production capacity claim is made.

## Uncertainties and external prerequisites

Receiver behavior is lead-confirmed, not exercised. Bucket/prefix, runtime identity,
reader identities, encryption key, source ID/date handoff, lock/state paths, cron
schedule/timezone, monitoring route, and exact purge mechanism need ops activation.
Provider-independent contracts are resolved now; no fictional values are configured.
The source producer must provide an atomic finished export or immutable snapshot;
hashing a file that can change during parse is not valid evidence. Native fresh
client loading, hosted CI, actual merge blocking, production packaging/install,
access/retention and finance replay are not proven by local checks.

## Independent-review correction, 2026-09-25

The simulated lead relayed an independent read-only review finding two omissions:
the relation between run ID and finance key, and the migration from a path parser
to snapshot-based orchestration. The reviewer identity/full report was not supplied;
do not attribute a new approval or post-fix signoff to that reviewer.

Resolved identity decision: use the same canonical UUID4 string for `run_id` and
`finance_key`, persisted together and validated equal on recovery. A separate
minted key would also work but introduces an unnecessary second identity and
recovery invariant. A persisted mismatch is corruption requiring reconciliation.
RUN-01, the retry/archive recipes and delivery skill now state the same contract.

Resolved interface decision: preserve public `read_orders(path)` as a wrapper;
extract `read_orders_bytes(snapshot)` and a bounded `read_snapshot(path)` in
parse.py when product work is authorized. Existing CLI/path test remain valid;
future run.py acquires one snapshot for hash/parse/archive and does not reread via
the wrapper. The recipe names caller migration and parity/single-read tests.
No function signatures, callers or tests changed during this documentation fix.

Re-read the updated engineering-foundation entry and research reference (still
version 0.2.0). Reassessed skill sourcing under its vendor/community preference;
the [updated evaluation](skills.md) now proposes python-testing-patterns with
recorded project overrides and an identified reference-link repair. That proposal
requires separate installation approval per the lead's explicit instruction.
The existing approved three-skill foundation remains installed and usable.
