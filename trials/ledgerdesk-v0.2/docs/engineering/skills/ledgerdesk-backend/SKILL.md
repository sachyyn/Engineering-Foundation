---
name: ledgerdesk-backend
description: Build or review Symfony 7.4 PHP operations, DTOs, API contracts, errors and transaction boundaries.
---

# ledgerdesk-backend

Source/revision: project-authored. Approved in the simulated trial, 2026-09-25.
Project licensing undecided; no external text or helpers vendored.

## Required context

Read [rules](../../rules.md), [patterns](../../patterns.md),
[research evidence](../../research.md), and [enforcement](../../enforcement.md).
For combined tasks load the other skills named in the [index](../../skills.md).
These links are repository-relative; no home directory or session context is required.

## Workflow

1. Read rules ARCH-01, LANG-01, API-01–03 and the security/data rules for the operation. Choose recipe P1, P2, P3, P4 or P7 in patterns.md. Identify the actor, tenant, allowed roles, request fields, success result and failure statuses before coding.
2. Extend the authoritative OpenAPI operation before changing DTOs or client types. Generate frontend types; never edit the generated file. Reject unknown request attributes and map entities to explicit response DTOs.
3. Keep HTTP translation in Controller/<Feature>, business transaction/permission checks in Service/<Feature>, queries in Repository, and immutable validation inputs in Dto/<Feature>. Do not inject EntityManager/repositories into controllers or serialize entities publicly.
4. Enter tenant transaction context before any business query. Take P7’s shared tenant guard for business mutations or exclusive guard for account/credential changes before other locks; reload account/session and recheck permission under that guard even when the HTTP firewall already authenticated. Use scoped lookups and normalize cross-tenant absence to 404. Roll back on error and discard a closed EntityManager.
5. Route failures through the common problem translator, including auth handlers. No SQL/stack details in responses. Bound list sizes and stable ordering. Document mutation replay/concurrency semantics rather than adding blanket retries.
6. Add functional tests for real request validation, contract shape, authentication/denial and failure side effects; add unit tests for invariants and integration tests for queries. Run npm run check:product and report missing runtime inputs instead of substituting a stub.
7. Review the changed dependency edges against tooling/deptrac.yaml. Raw DBAL, bulk updates and new error mappings need explicit reviewer attention even if static checks pass.

## Completion evidence

Name changed files and rule/recipe used, exact commands and results, denial/error coverage,
and any unresolved prerequisite. Do not weaken gates, invent approval, or implement a
feature outside the user's scope. Documentation snippets are not an executable product.
