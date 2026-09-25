# Checks, delivery and external activation

## Local interface

Prerequisites: Ubuntu-compatible environment with OS Python 3.12, Git, uv 0.12.8.
No service, Docker, production configuration or secrets are required. Obtain tools
through your team's normal installation process; this repository does not globally
install them. From a clean checkout run:

```sh
bash scripts/check.sh
```

The script selects Python 3.12 and repository-local `.venv`/`.cache/uv`, disables
Python downloads, syncs all locked dependency groups, then runs Ruff, mypy,
import-linter, money syntax guard, `uv run pytest`, wheel build without isolated
dependency resolution, and the repository structural validator. Any failure stops
the gate with nonzero exit. Network access during dependency acquisition is to
package sources; tests must remain synthetic and offline. No code/data is uploaded.

`scripts/check_foundation.py` is the reviewed structural validator copied from the
supplied engineering-foundation 0.2.0 package at initial setup, unchanged since
that copy. The supplied package has subsequently added checks; the correction
follow-up runs its newer validator directly without silently updating this local
tool. Both pass; see verification.md. Its source remains the
supplied package, no third-party public license grant is inferred. It validates
local artifacts/routing and the recorded status; it does not certify their truth.
Skill-package updates are explicit reviewed updates, never fetched in CI.

## Rule-to-check mapping

| Rules | Automated checks | Required review / limit |
| --- | --- | --- |
| ARCH-01/02 | import-linter: parser cannot reach HTTP/CLI/push; push cannot reach CLI | Extend contracts when adding adapters/money/run/state. Static import graph cannot enforce dynamic imports or complete responsibility assignment. |
| MONEY-01 | AST rejects direct float literals/calls in parse.py and money/**/*.py; mypy checks declared types | Review all amount paths, aliases, empty sum, JSON strings, nonfinite and precision traps. No complete money dataflow claim. |
| CHECK-01 | Ruff E4/E7/E9/F/S102/S307, mypy configured file set, locked sync, pytest, wheel build, structural validation | Ruff formatting and new-function annotations reviewed; no automated formatter/strict-typing migration. No blanket ignores or continue-on-error. |
| CONTRACT-01/DATA-01 | Existing Decimal parser assertion; new tests required with feature changes | Review schema compatibility, validation before finance, and failed-run archive evidence. Current product gaps listed in research. |
| RUN-01..04/HTTP-01/S3-01 | Future implementation's identity, crash, retry-budget and adapter contract tests | Reviewer must trace each effect and persisted outcome. Not claimed enforced before features exist. |
| ERROR-01 | Future safe-code and CLI exit tests | Review exception translation and distinguish rejected from possibly accepted operations. |
| SEC-01/RET-01/STATUS-01 | Ruff blocks exec/eval syntax; future redaction/projection tests | Access, log fields, dependency advisories/licenses, retention and denial paths require security/ops review; no secret scanner or dependency advisory gate is claimed. |
| RELEASE-01/MAINT-01 | Shared GitHub job and source-controlled pins/configuration | Maintainer reviews workflow/check/guidance/dependency changes; ops approves and verifies release. Remote protection not activated here. |

Native client guidance is context, not enforcement. The check command and CI are
editable too. Only activated remote protections can constrain merges; arbitrary
agents cannot be forced to read these files by repository Markdown.

## GitHub administrator handoff (not executed)

1. Enable Actions with GitHub-hosted Ubuntu 24.04 runners and permit the pinned
   checkout/setup-uv actions. No production secrets are needed. PRs including forks
   use `pull_request`, never `pull_request_target`. All PRs and master pushes run;
   `merge_group` supports a queue if later enabled. No path filters.
2. On `master`, require the Actions check named **ordersync-quality**, successful
   current checks and at least one maintainer review. Require updated review after
   material changes. Restrict direct/force pushes and deletion; keep bypass limited
   to named emergency administrators with an incident record. Do not invent team
   handles: administrator supplies real reviewers. No CODEOWNERS file is installed
   with fictional identities.
3. Protect `.github/`, scripts, pyproject/lock, AGENTS/CLAUDE, local skills, and
   engineering docs through review ownership/rules. A check can be weakened in
   the same PR unless its configuration changes receive trusted review.
4. Test a deliberately failing PR against master and, if enabled, the merge queue.
   Verify rejection for failed/missing checks and applicable bypass controls. Then
   restore and demonstrate successful merge eligibility. This trial is external;
   no PR, push, remote query or setting mutation was performed here.

## Release preparation and ops activation (inert instructions)

The shared check creates `dist/ordersync-0.3.1-py3-none-any.whl`. A release maintainer
must bump version only as part of an authorized release, build from reviewed clean
source, record revision, Python/uv versions, lock hash and wheel SHA-256, and retain
the matching source/lock. Repeated builds are not claimed bit-identical unless
tested with controlled timestamps. No package publishing or artifact upload is
configured. Dependency license/advisory review is mandatory per release; the local
gate is not a vulnerability audit.

For a release, prepare runtime dependency wheels from the reviewed lock on the
target OS/Python in a separately approved packaging environment; do not resolve
floating dependencies on the ops host. Export with `uv export --locked --no-dev
--no-emit-project` and verify build-only group is excluded. Install exact hashed
runtime wheels and the built ordersync wheel into a new release-specific venv.
An ops-approved artifact-transfer channel and hashes are prerequisites, not
configured destinations. Verify package metadata/imports and run synthetic tests
without finance credentials. Do not execute `ordersync` against an export as a
smoke test because it posts to finance.

Ops must supply deployment root, state/lock directory on local disk, stable source
ID/business-date handoff, service account, timezone/schedule and monitoring route.
Future wrapper shape, with ops-chosen paths replacing example tokens:

```sh
# Documentation only; all invocations must use the same persistent lock path.
flock -n -E 75 <ops-lock-file> timeout --signal=TERM --kill-after=10s 300s <release-venv>/bin/ordersync <completed-export>
```

Do not install this literal template. Configure restrictive state/config/log
permissions, immutable completed input, and a hard five-minute run deadline when
implementing the wrapper. Lock conflict 75 is a visible skipped/overlapping run,
not success. This outer lock is an interim wrapper for the current CLI; remove it
when state.py acquires the same lock in-process. Never nest both lock acquisitions.
Initialize the future ledger explicitly from reconciled finance history; retain
minimal source high-water dates when expiring run details. Ops on-call responds to nonzero exit, missing nightly completion,
unknown finance outcome, and stale status. Ops must set the actual expected
completion time from the cron schedule; no invented alert schedule is installed.
Current CLI exit zero is insufficient evidence of confirmed finance delivery.

Before future S3 activation, ops provisions private prefix, runtime identity,
finance/ops readers, ops-only status denial, TLS/encryption and retention. Verify
finance cannot read status even if another grant permits broad archive access;
use explicit resource separation/denial policy as needed. Test outsider and runtime
delete/admin denial too. Verify conditional create/CAS and checksum behavior with
synthetic data. Thirteen-month calendar eligibility must cover current/noncurrent
versions, status, local records and backup copies; measure actual asynchronous purge
and obtain lead agreement if an exact deletion deadline is required. No bucket,
IAM, lifecycle or deletion command is generated or executed.

For rollout: ops pauses cron, confirms no active run under the shared lock, installs
and verifies the new release, preserves state, switches the release pointer, then
reenables cron. Rollback switches code to the previous compatible release after
stopping work; never rolls journal history backwards. Before any replay consult
the durable key/payload/earliest attempt. If older than 6d23h, corrupt, missing or
inconsistent, reconcile with finance instead of sending. Restore archives only
through authorized readers; restore is not authorization to post. For a future
journal-schema migration, keep backward readability or document forward-only
recovery before rollout.

## Acceptance evidence

See [verification](verification.md) for exact commands, negative trials, limitations
and review outcome. Repository checks do not establish hosted enforcement, native
agent discovery, provider permissions, retention expiry or production correctness.
