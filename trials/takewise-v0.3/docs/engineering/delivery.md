# Delivery and operations handoff

No deployment workflow is active. Hosting, region, mail provider, production identities, secret/key custody, budget, retention obligations, RPO/RTO and availability target require tech-lead decisions before production. Approximate user counts are not a concurrency SLO. Confirm Docker Desktop organizational licensing on macOS; Linux Docker Engine is an alternative.

## Remote repository activation

An administrator creates the private repository in the organization's GitHub account, adds the reviewed files and enables Actions on hosted disposable runners. Do not add fictional CODEOWNERS. Assign real team/lead handles when known. Require `Takewise / quality` on main from GitHub Actions, PR approval by tech lead and a second reviewer for lead-authored changes, stale approval dismissal and resolved conversations. Protect workflows, tooling, lockfiles, agent guidance and policy through actual owner approval. Disallow direct/force pushes, deletion and casual bypass. No merge queue configured; if enabled, retain merge_group event and verify its checks. Fork PRs receive readonly permissions and no production secrets.

Not verified: merge enforcement requires remote activation and a failing-PR trial. Verify a deliberate failing foundation check blocks merge and cannot be bypassed by skipped jobs; restore the change. Repo guidance cannot force arbitrary agents to obey.

## Build and release once application exists

`pnpm check` is the local/CI quality interface. Build frontend static assets and backend production Composer dependencies from reviewed lockfiles; include commit, schema version, dependency/license inventory and checksums. Never rebuild a different artifact for production. Staging uses separate data, mail sink and keys; no copied live personal data. Scan artifacts before promotion. Select registry/runtime and add delivery configuration only after explicit hosting approval; templates or manual triggers are not production authorization.

Release owner (assigned by tech lead) verifies backup freshness and restore evidence, executes approved expand migration once using migration identity, promotes tested backend/frontend versions in compatibility order, then smoke checks readiness, sign-in, tenant denial and safe read queries. Use deployment serialization to prevent concurrent schema changes. Do not send real invoices/email as smoke tests. Readiness checks DB/schema/worker availability without exposing secrets; liveness must not restart healthy processes for transient dependency failures.

Rollback application only while schema remains compatible. Prefer forward fix for data migrations; no destructive automatic down. Contract migrations remove old columns only after all old versions are gone. Record exact rollback artifact and triggers before release. Migrations/backfills need row counts, runtime bounds, stop/resume and reconciliation plan measured on representative nonproduction data.

## Recovery and operations

Recommend managed PostgreSQL with PITR plus independent backups; lead chooses retention, RPO/RTO, encryption and region. Before launch, restore to an isolated environment and record observed recovery time and data-loss window against targets. Reconcile stock ledger/balances, issued counters, memberships and queues after restore. Never replay expired account links. An invoice number already communicated externally cannot silently be reused following PITR; incident owner reconciles externally issued numbers and advances counter safely before writes resume.

Name primary/secondary incident owners, alert routing and access approvals before launch. Monitor error rate, latency, DB connections/locks, backup age, failed queues, authentication failures and capacity; establish thresholds from SLO and load tests. Maintain structured redacted logs and audit access. Incident flow: contain (disable writes if integrity uncertain), preserve safe evidence, restore/forward fix, verify invariants, reopen gradually, document impact and follow-up. Export/deletion and audit retention policies need business/legal input; no destructive cleanup of financial data until decided.
