---
name: ledgerdesk-testing
description: Plan and run meaningful unit, contract, tenant-isolation, concurrency, auth, Vue and browser verification for Ledgerdesk.
---

# ledgerdesk-testing

Source/revision: project-authored. Approved in the simulated trial, 2026-09-25.
Project licensing undecided; no external text or helpers vendored.

## Required context

Read [rules](../../rules.md), [patterns](../../patterns.md),
[research evidence](../../research.md), and [enforcement](../../enforcement.md).
For combined tasks load the other skills named in the [index](../../skills.md).
These links are repository-relative; no home directory or session context is required.

## Workflow

1. Read TEST-01, CHECK-01, relevant security/data rules and the recipe for the changed behavior. Identify the critical failure/denial path and the boundary it exercises, not just a test filename.
2. Use PHPUnit unit tests for invariants/money/policies, KernelTestCase with PostgreSQL for queries/RLS, WebTestCase for real authenticator/DTO/response behavior, Vitest for Vue state, Playwright for complete keyboard workflows. Do not mock away the boundary under test.
3. Seed two tenants with overlapping labels, owner/staff/disabled accounts and synthetic data. Use a non-owner application database role. Test list/count/write/relationship isolation and context reuse. Reset time and data deterministically.
4. For concurrent edits, issuance and token consumption, use independent committed database connections. Do not wrap these in a single rollback transaction that hides real behavior. Follow P3a’s exact boundary/overflow vectors; P3b’s different-invoice counter contention, initialization, exhaustion, rollback and tenant-independence cases; and P7’s simultaneous owner demotions, stale authorization, session-version rollback/revocation and business-mutation races. Use barriers and observed PostgreSQL blocking rather than sleeps. Verify one winner where required, no duplicated number/transition and rollback of partial side effects.
5. Match HTTP success/error bodies to the OpenAPI schema and confirm documented operation coverage. TS type generation is not runtime validation. Test actual login as well as test-only session helpers.
6. Require tests to execute and fail on empty suites, skipped mandatory prerequisites and missing tools. Run npm run check:product; foundation-only success is not product success.
7. For foundation guard changes run npm run check:negative. Deliberate violations belong in .verification disposable copies; record mutation, intended rule, exit and restoration. Do not damage the working tree or claim unrelated tool errors validate a rule.
8. Report Verified, Proxy verified, Not verified and Pre-existing failures separately. Manual keyboard/focus review and actual role/DB tests must not be replaced by file-existence checks.

## Completion evidence

Name changed files and rule/recipe used, exact commands and results, denial/error coverage,
and any unresolved prerequisite. Do not weaken gates, invent approval, or implement a
feature outside the user's scope. Documentation snippets are not an executable product.
