---
name: ledgerdesk-frontend
description: Build or review Vue 3 TypeScript API consumers, forms, async state and desktop keyboard accessibility.
---

# ledgerdesk-frontend

Source/revision: project-authored. Approved in the simulated trial, 2026-09-25.
Project licensing undecided; no external text or helpers vendored.

## Required context

Read [rules](../../rules.md), [patterns](../../patterns.md),
[research evidence](../../research.md), and [enforcement](../../enforcement.md).
For combined tasks load the other skills named in the [index](../../skills.md).
These links are repository-relative; no home directory or session context is required.

## Workflow

1. Read UI-01–02, API-01–03 and role rules SEC-02; follow recipe P1 and the relevant invoice/auth/account recipe (P3, P4, P7). Locate feature pages/components/composables, shared controls and the single api transport before adding files.
2. Use script setup with TypeScript, typed props/emits, refs/computed and narrow composables. Avoid new global state/cache libraries without an actual shared-state requirement and approved change. Never access another feature internals by path.
3. Consume generated OpenAPI types; transport owns session credentials, CSRF, timeout, cancellation and problem parsing. Components do not call fetch. Keep money and invoice numbers as decimal strings; use BigInt only for exact local money calculations and P3a bounds, never Number for cents. Quantities are whole integers 1..2147483647. Account edits carry P7’s expected record_version; handle revoked sessions and stale edits through the transport. Do not store tokens/customer data in persistent browser storage or use raw user HTML.
4. Design loading, empty, saving, success and failure states. Abort/discard stale GET results. Preserve draft on 409, map 422 fields, clear account data on 401, show safe denial on 403/404. A cancelled POST may already have committed: reconcile before retry. Never auto-retry mutations.
5. Use semantic controls/labels, visible focus, error descriptions, live submission status, route focus and dialog trap/restore. Check keyboard order and zoom manually. Hidden owner-only buttons are a convenience, not authorization.
6. Add Vitest component/composable tests and Playwright keyboard/axe checks for interactive states. Run npm run check:product; compiler/lint alone do not test accessibility. Record browser proxy coverage and missing actual-browser/manual evidence.
7. Before final review verify source types against generated contract, no stale user state after logout, and UI wording does not promise legal invoice compliance.

## Completion evidence

Name changed files and rule/recipe used, exact commands and results, denial/error coverage,
and any unresolved prerequisite. Do not weaken gates, invent approval, or implement a
feature outside the user's scope. Documentation snippets are not an executable product.
