---
name: ledgerdesk-security-data
description: Implement or review Ledgerdesk account security, owner/staff permissions, tenant isolation, invoice integrity and PostgreSQL migrations.
---

# ledgerdesk-security-data

Source/revision: project-authored. Approved in the simulated trial, 2026-09-25.
Project licensing undecided; no external text or helpers vendored.

## Required context

Read [rules](../../rules.md), [patterns](../../patterns.md),
[research evidence](../../research.md), and [enforcement](../../enforcement.md).
For combined tasks load the other skills named in the [index](../../skills.md).
These links are repository-relative; no home directory or session context is required.

## Workflow

1. Read SEC-01–03, DATA-01–03, JOB-01 and OPS-01. Load recipes P2–P4 and P7, plus P1 for HTTP exposure. Write the allow/deny matrix before changing code: staff edit customers/drafts, owners manage users and issue/cancel; neither role crosses tenants or edits issued snapshots.
2. Derive tenant from authenticated account, never a payload/header. Use global normalized-email identity lookup only at the narrow authentication boundary. Follow P7 for user creation, role/email changes and deactivation/reactivation: exclusive tenant-row guard before ordered account locks, fresh owner/session authorization, usable-owner count and expected record_version. Rotate auth_version atomically with changes and compare it freshly on every authenticated request; session deletion alone is insufficient.
3. For every tenant table/query, inspect explicit predicates, RLS USING/WITH CHECK, non-owner/no-BYPASSRLS role, transaction-local context and composite FK integrity. Test missing context and reused connection/worker context. RLS cannot protect arbitrary SQL with compromised runtime credentials.
4. For authentication, check CSRF before JSON login handling, secure session cookie settings, shared rate limiting, and actual login/logout behavior. For reset, verify generic response/timing, random hashed single-use token, trusted URL, atomic consumption, expiry and session invalidation. Never log tokens or message bodies.
5. For invoices, follow P3a: canonical USD strings bounded by 9999999999999999.99, MAX_CENTS=999999999999999999, 64-bit PHP, integer quantities 1..2147483647, division/subtraction guards before arithmetic; reject client totals. These are technical limits, not commercial policy. Enforce draft version checks, owner policy, unique tenant numbering and atomic snapshot/audit/idempotency result. P3b requires a provisioned invoice_number_counter row keyed by tenant, SELECT FOR UPDATE after invoice locking, BIGINT exhaustion rejection and no reset/reuse. Prove contention using different drafts in one tenant, rollback and tenant independence. Production issuance/cancellation remains blocked until legal policy is approved.
6. Review migrations for both new and existing schema paths, lock scope, tenant indexes and expand/backfill/contract compatibility. Never use runtime admin credentials or auto schema:update.
7. Run real-role integration, concurrent connection, HTTP denial and reset tests through npm run check:product. State when unavailable; schema inspection alone does not establish isolation. Record any proposed exception with exact rule, consequence and lead approval.

## Completion evidence

Name changed files and rule/recipe used, exact commands and results, denial/error coverage,
and any unresolved prerequisite. Do not weaken gates, invent approval, or implement a
feature outside the user's scope. Documentation snippets are not an executable product.
