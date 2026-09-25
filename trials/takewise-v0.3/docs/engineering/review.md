# Independent substantive review

Reviewer: fresh `foundation_review` subagent, which did not author the repository. Date: 2026-09-25. Scope: actual repository, confirmed requirements and the engineering-foundation acceptance rubric. Final verdict: **pass**, after corrections and file re-reads. This records an actual independent review, not author self-certification.

## Findings and resolutions

- README setup instructions omitted actionlint bootstrap. Added `pnpm setup:tools` before check.
- `tooling/foundation.mjs` rejected ignored local `.env` files, contradicting onboarding. Directory traversal now excludes local env files while a separate Git-index check rejects tracked/staged secret env paths. Disposable trial proved both outcomes; regression test covers ignored local env files.
- Workflow guard tested privileged triggers by value, permitting YAML null. It now checks key presence; conditional required gate is also rejected even when `if: false` is a YAML Boolean. Unit/disposable fixtures prove intended failure.
- Inventory adjustment recipe omitted idempotency-before-version ordering and explicit version increment. `patterns.md` now requires stored-result replay before stale-version check, hash conflict409 and atomic balance/version/ledger/result update.
- Token consumption rejected consumed tokens before considering legitimate replay. Recipe now checks expiry and non-disabled membership first, permits safe matching replay (including newly active invitee), rejects mismatched hashes, and applies unconsumed/pending state only to new consumption. Password request digests use a separate keyed hash; no raw password stored.
- Company provisioning counter writes conflicted with control-plane business-table denial. Shared coordination schema and narrowly granted prefix/provision/increment functions now define the privilege topology and tests.
- Invitation acceptance/worker initially required pending company, excluding ordinary invitations into active companies. Both now permit pending invitee in pending or active company; only first-admin onboarding activates company.

All findings were rechecked against current files; no unresolved substantive findings remained. The reviewer ran the three then-existing gate tests; the author subsequently added and passed a fourth env-handling regression.

## Fresh-agent discovery trial

Reviewer followed AGENTS → research/rules/patterns → skills index → takewise-backend/data/security → Symfony voters and PostgreSQL references. For a protected inventory adjustment, it identified Http DTO/controller/voter, Application use case, Domain movement/repository port, Infrastructure adapter; scope/company/actor/balance locks; CSRF/current auth version; whole delta/reason/version/operation key; append-only ledger; denial/race/RLS/reconciliation tests. It rejected trusting caller company ID or running RLS tests as owner. Upstream unsafe examples were correctly subordinated to project rules.

This verifies direct-file discovery and read-only planning. It does not prove implemented product behavior, native Cursor/Claude discovery, remote enforcement or production readiness.
