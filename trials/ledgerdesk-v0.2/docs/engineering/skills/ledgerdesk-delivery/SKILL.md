---
name: ledgerdesk-delivery
description: Maintain Ledgerdesk local tooling, CI, dependencies, release definitions, operational recovery and engineering policy.
---

# ledgerdesk-delivery

Source/revision: project-authored. Approved in the simulated trial, 2026-09-25.
Project licensing undecided; no external text or helpers vendored.

## Required context

Read [rules](../../rules.md), [patterns](../../patterns.md),
[research evidence](../../research.md), and [enforcement](../../enforcement.md).
For combined tasks load the other skills named in the [index](../../skills.md).
These links are repository-relative; no home directory or session context is required.

## Workflow

1. Read DEV-01, CHECK-01, CI-01, OPS-01, AGENT-01 plus enforcement.md and operations.md. Confirm scope and read existing commands before executing them. Foundation setup does not authorize remote settings, deployment, secrets or Git writes.
2. Preserve Node 22/PHP 8.4/PostgreSQL 18 and lockfiles. Review dependency engines, peers, license and install scripts. Use local npm ci --ignore-scripts; never resolve peers with force/legacy flags or silently require a global tool. PHP lock resolution remains unavailable until PHP/Composer can run.
3. Keep npm run check common to local/CI, non-mutating and fail-closed. New application inputs activate the product gate. Test added files as well as modifications; never report no tests as a pass.
4. For GitHub changes use contents:read, pinned verified action revisions, ephemeral runners and timeouts. No pull_request_target for untrusted code, path-filtered required gate or continue-on-error. Protect the gate itself through administrator-activated review rules.
5. Keep provider-specific deployment inert until target/identity/triggers are approved. Document immutable artifact identity, migrations, worker restart, smoke tests, rollback limits and recovery drill. No provider choice means deployment is deferred, not that these rules disappear.
6. Keep logs and artifacts free of customer data, credentials and reset links. Gate launch on production mail, legal invoice/retention policy, residency, backup/RPO/RTO, owners and proven restore procedure. No regulatory or uptime guarantee without explicit evidence.
7. Update affected rule, recipe, skill route and manifest dispositions together. Validate structure and review substance separately. Run npm run check and npm run check:negative, then record exact evidence. Never mark ready with missing required tooling verification or unresolved substantive findings.
8. Handoff exact required job and remote activation/failing-PR steps; no claim that YAML activates protection. Reassess policy only on explicit request.

## Completion evidence

Name changed files and rule/recipe used, exact commands and results, denial/error coverage,
and any unresolved prerequisite. Do not weaken gates, invent approval, or implement a
feature outside the user's scope. Documentation snippets are not an executable product.
