# Decisions and research dossier

## Authority and target

Target: the current project directory only. Initial inspection on 2026-09-25 found
no product files, instructions, manifests, locks, or usable Git worktree. `.git`,
`.agents`, and `.codex` were empty/read-only. No symlinks were found. Node 22.23.1,
npm 10.9.8, Python 3, and Codex CLI 0.156.1 were available; PHP and Docker were not.
No other projects or prior trial outputs were inspected.

Approval source: the user's **simulated tech-lead response in this disposable trial**,
after the actual proposal. It explicitly approved five original local skills,
rules, recipes, tooling/CI/local-service definitions and local check dependencies.
It corrected Node 24 to Node 22 and specified the role matrix and USD scope below.
It prohibited application implementation/scaffolding, remote changes, deployment,
secrets, global installs, commits, and pushes. No scope reduction of the core
foundation deliverables was approved. Native skill discovery is an environmental
limitation, not omission of persistent skills. Project licensing was not chosen;
no open-source license grant is asserted for original project material.

## Decision ledger

All entries are approved architectural recommendations unless explicitly deferred.
Sources were actually read on 2026-09-25 via Context7, Exa, or public registry HTTP.
Source statements are evidence; the choices and tradeoffs below are our judgment.

| Question / alternatives                                    | Decision and consequence                                                                                                                                                                                                                                                                    | Evidence              | Affected rules / revisit                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------- |
| SPA vs SSR vs progressively enhanced pages                 | Same-origin Vue SPA plus Symfony HTTP API. Interactive authenticated workflows justify client routing; no SEO requirement warrants a second server-rendering runtime.                                                                                                                       | S1                    | UI-01; revisit for public indexed pages or measured startup problems                  |
| Distributed services vs modular monolith                   | One backend, conventional Symfony classes grouped by feature beneath layer directories; one frontend. Services own transactions, repositories SQL, DTOs wire format. Avoid speculative interfaces/buses for every method.                                                                   | S2, S6                | ARCH-01; revisit when independently operated responsibilities emerge                  |
| Browser JWT vs cookie session                              | Server-side sessions; secure cookies and explicit stateful CSRF validation, including JSON login. JWT adds revocation/storage work without a partner/mobile API requirement.                                                                                                                | S3                    | SEC-01; revisit for a separately authorized external API                              |
| Tenant subdomains/multiple identities vs unique email      | Globally unique trimmed/lowercased email; one tenant per account. Tenant never supplied as an authorization claim by the browser. Owner/staff roles as approved.                                                                                                                            | Lead decision; S3, S4 | SEC-02; revisit for multi-tenant membership                                           |
| Shared database vs database/schema per tenant              | Shared schema plus explicit repository scoping, composite FKs, and RLS. Cheaper operations for a small team. More careful role and transaction management than filters alone; RLS is defense against missing predicates, not malicious SQL execution.                                       | S4                    | DATA-01; revisit for residency/isolation contracts                                    |
| Contract-first vs PHP-generated specification/API Platform | OpenAPI 3.1 is authoritative, independent of persistence. Generate TS types, validate runtime DTOs and test HTTP responses against the same schema. More drift tests than annotation generation, but explicit cross-language review. API Platform not introduced for two initial resources. | S2, S5                | API-01; revisit if resource breadth warrants it                                       |
| Decimal vs binary float; editable vs frozen issued invoice | USD only, 2 decimal places, no tax. Decimal strings over API; integer cents after checked parsing for fixed-scale amounts. Server computes totals. Freeze issued snapshot; owner-only issuance/cancellation capability, production issuance blocked pending legal policy.                   | Lead decision; S6     | DATA-02; revisit for fractional quantity, tax, multi-currency, legal correction rules |
| Global state/cache library vs feature composables          | Vue refs/computed and feature composables initially; single typed fetch boundary. No persistent customer/invoice browser cache. Abort stale reads, explicitly invalidate after mutation.                                                                                                    | S1                    | UI-01; revisit for measured shared-cache complexity                                   |
| Synchronous reset mail vs queue                            | Mailer plus Messenger Doctrine transport: generic reset request response before account-specific delivery work. Worker/retry operations are additional cost, but avoids SMTP latency and account-existence timing in request handling.                                                      | S7, S8                | JOB-01, SEC-03; revisit transport if queue load interferes with OLTP                  |
| Mock DB vs real integration                                | Real PostgreSQL 18, non-owner application role for isolation tests. Mocks cannot establish RLS or transaction correctness; dedicated concurrent-connection tests cannot hide behind a test-wide rollback transaction.                                                                       | S4, S6, candidate C3  | TEST-01                                                                               |
| Native dev vs all-in-Docker                                | Native Node checks, Docker definitions for PostgreSQL/mail capture and optional PHP tooling. No Docker dependency for document/JS checks. PHP/Docker execution unavailable in trial.                                                                                                        | Target inventory; S11 | DEV-01; revisit for team OS differences                                               |
| Single toolchain vs language-specific checks               | npm orchestration; mature TS/Vue and PHP tools. No bespoke universal code linter. Focused Node guard validates foundation routes and workflow safety, with explicitly limited coverage.                                                                                                     | S1, S12               | CHECK-01                                                                              |
| Hosted CI vs local-only rules                              | GitHub Actions definitions plus activation handoff; stable quality job, read-only token, pinned actions, no deployment. No remote enforcement claim.                                                                                                                                        | S9                    | CI-01                                                                                 |
| Provider-specific deployment now vs portable release rules | Provider deferred; tested artifact promotion, migration order, worker restart, smoke tests, recovery drill rules now. Host, email service, residency/retention and RPO/RTO are launch gates.                                                                                                | S10                   | OPS-01                                                                                |
| Broad upstream skill pack vs targeted local skills         | Five original skills based on these sources and concrete rules/recipes. Candidate conflicts and inspection limits are in skills.md. No global dependency or third-party copying.                                                                                                            | C1–C7                 | AGENT-01                                                                              |

## Source register

- **S1**: [Vue application models](https://vuejs.org/guide/extras/ways-of-using-vue.html),
  [TypeScript](https://vuejs.org/guide/typescript/overview.html), and
  [accessibility](https://vuejs.org/guide/best-practices/accessibility.html).
  Vue 3 context; SFC type checking needs vue-tsc, and navigation requires deliberate focus handling.
- **S2**: [Symfony 7.4 controllers](https://symfony.com/doc/7.4/controller.html)
  and [serializer](https://symfony.com/doc/7.4/serializer.html), queried through Context7.
  MapRequestPayload supports validated DTOs; default validation status is 422;
  JSON routes and rejecting extra attributes require explicit configuration.
- **S3**: [Symfony 7.4 security](https://symfony.com/doc/7.4/security.html) and
  [CSRF](https://symfony.com/doc/7.4/security/csrf.html). JSON login and form-login
  CSRF configuration are distinct. Session SameSite helps but is not the CSRF policy.
- **S4**: [PostgreSQL 18 row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html).
  Default deny only applies when enabled; owners/superusers/BYPASSRLS roles can bypass.
  Integrity constraints and whole-table operations are not all subject to RLS.
  These caveats rule out treating a Doctrine filter or owner-role test as sufficient evidence.
- **S5**: [OpenAPI 3.1.1](https://spec.openapis.org/oas/v3.1.1.html) and
  [openapi-typescript](https://openapi-ts.dev/introduction). 3.1 works with the selected
  type generator; it generates runtime-free types, not response validators.
- **S6**: [Doctrine ORM 3.5 transactions](https://www.doctrine-project.org/projects/doctrine-orm/en/3.5/reference/transactions-and-concurrency.html).
  Explicit transaction boundaries are required when combining DBAL work with ORM work;
  rollback can close the EntityManager. Do not reuse it after failure.
- **S7**: [OWASP forgot-password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
  Generic responses/timing, random single-use expiring tokens, trusted URL construction,
  normal login after reset, and session invalidation informed the reset recipe.
- **S8**: [Symfony Mailer](https://symfony.com/doc/7.4/mailer.html) and
  [Messenger](https://symfony.com/doc/7.4/messenger.html). SMTP abstraction and Doctrine
  transport are supported. Extracts inspected include transport/worker/retry structure;
  operational retry limits below are project defaults, not framework guarantees.
- **S9**: [GitHub secure workflow guidance](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
  and upstream action manifests. Least privileges and immutable actions reduce CI risk;
  review and branch rules still need external activation.
- **S10**: [PostgreSQL backup approaches](https://www.postgresql.org/docs/18/backup.html).
  SQL dumps and WAL/PITR address different recovery needs; a provider choice and objectives
  are required before selecting the production procedure.
- **S11**: [Symfony 7.4 support](https://symfony.com/releases/7.4),
  [PHP support](https://www.php.net/supported-versions.php), and
  [Node support](https://nodejs.org/en/about/previous-releases).
  Symfony 7.4 is LTS and supports PHP >=8.2; PHP 8.4 is approved. Node 22 is approved
  instead of the proposed 24. Registry metadata and exact resolved versions are recorded
  in [tooling evidence](evidence/npm-candidates.json) and package-lock.json.
- **S12**: [Vite engine metadata](https://github.com/vitejs/vite/blob/main/packages/vite/package.json),
  queried through Context7: modern Vite supports Node >=22.12 on the 22 branch;
  [Playwright accessibility](https://playwright.dev/docs/accessibility-testing) supports
  axe checks but explicitly requires manual assessment too.
- **S13**: [Codex skills](https://developers.openai.com/codex/skills).
  Repository discovery scans `.agents/skills`; our alternate approved location needs
  explicit file routing. No native discovery claim is made for this trial.

## Known uncertainty and limits

Retrieved live sources can move; source dates are retrieval dates, not claims about
the last upstream revision. Registry metadata is retained as observed evidence.
Do not infer PHP dependency resolution from documentation. Exact PHP compatibility,
Docker configuration execution, and product behavior await those runtimes and inputs.
No legal advice, tax compliance, SLA, production recovery promise, or licensing grant
has been invented. See the launch gates in operations.md and the actual outcome in
foundation.json. Ordinary dependency updates may trigger CI; foundation policy changes
require explicit reassessment, never a scheduled policy-writing agent.

## Implementation-stage evidence additions (2026-09-25)

- [Opis JSON Schema Validator](https://github.com/opis/json-schema/blob/master/src/Validator.php)
  and draft support were queried through Context7 (`/opis/json-schema`). Selected 2.x
  for future runtime response assertions because OpenAPI 3.1 uses 2020-12-compatible
  schemas; unlike generated TS types it validates actual JSON. P1 specifies local refs
  and separate HTTP checks. PHP execution remains unverified.
- [Deptrac configuration](https://deptrac.github.io/deptrac/configuration/),
  [PHPUnit 11.5 configuration](https://docs.phpunit.de/en/11.5/configuration.html), and
  [Mailpit Docker tags](https://mailpit.axllent.org/docs/install/docker/) were read for
  configuration shape/version applicability. This is not runtime validation.
- Immutable action revisions were resolved through GitHub's public tag API and recorded
  in [action evidence](evidence/actions.json). No remote Git operation occurred.
  [Actionlint release evidence](evidence/actionlint-release.json) supplies the official
  artifact SHA256; setup extracts only the executable and LICENSE.txt to tooling/bin.
- Initial npm 10.9.8 peer resolution failed with `edgesOut` while exploring a nested
  Vite/devtools graph. A narrower temporary Vite/Vitest pair installed but audit identified
  known advisories, recorded in [initial audit](evidence/npm-audit-initial.json). It was
  not accepted as the final dependency state. Final package.json/lock and verification
  report are authoritative; candidates/adjustments are investigation history, not pins.

Final tool selection uses ESLint 10 (the registry deprecated the selected ESLint 9),
TypeScript 5.9.3, Vite 7.3.6, Vitest 4.1.11 and Vue plugin 6.0.9. A `vite: $vite`
override deduplicates all compatible Vite ranges to the approved direct pin; it does
not bypass peer compatibility. This resolved npm's nested peer graph failure.
[Final audit](evidence/npm-audit-final.json) records the resulting advisory scan.

## Targeted external-review correction, 2026-09-25

The simulated lead confirmed missing money bounds, counter mechanics and account-management
concurrency recipes, and explicitly accepted whole-number quantities. This correction is
within foundation guidance scope; it does not authorize application implementation.

Primary sources actually read via Exa for this correction:

- [PHP integer semantics](https://www.php.net/manual/en/language.types.integer.php):
  integer size is platform dependent and overflow converts to float. Require 64-bit PHP
  and test multiplication/addition bounds before evaluating the operation.
- [PostgreSQL 18 numeric types](https://www.postgresql.org/docs/18/datatype-numeric.html):
  INTEGER/BIGINT limits and NUMERIC precision/scale motivate P3a's storage ceilings.
  NUMERIC can round excess scale, so strict request validation remains necessary.
- [PostgreSQL 18 explicit locking](https://www.postgresql.org/docs/18/explicit-locking.html):
  FOR SHARE conflicts with FOR UPDATE; row locks last to transaction end; consistent lock
  order avoids cyclic waits. P3b/P7 apply these primitives at READ COMMITTED.

Derived design choices, not regulatory or commercial limits: NUMERIC(18,2) yields
9999999999999999.99 USD and MAX_CENTS=999999999999999999; quantity uses positive
PostgreSQL INTEGER (1..2147483647). These fit checked 64-bit cents arithmetic without
floats. Arbitrary-precision money is an alternative if future technical requirements exceed
these bounds; a lower commercial cap requires a separate product decision. Revisit with
currency/quantity changes. No tax or legal issuance guarantee is introduced.

A transactional per-tenant BIGINT counter gives rollback with invoice issuance, unlike a
PostgreSQL sequence; it intentionally serializes issuance within one tenant. P3b defines
provisioning, missing-row and exhaustion behavior rather than silently reinitializing.
P7 uses an existing tenant row as the shared/exclusive authority guard instead of advisory
locks or serializable-transaction retries. This simplifies last-owner preservation and
orders business writes against revocation, at the cost of blocking account changes behind
short in-flight tenant writes. Keep transactions bounded; revisit on measured contention.

Named account-creation assumption: owners create pending-password accounts that use the
existing reset flow for first password setup. Only active password-initialized owners count
toward the usable-owner invariant. Initial tenant provisioning creates the first usable
owner and counter atomically. This adds no social login or invitation subsystem. P7 records
the storage, transaction, failure and concurrency consequences of this assumption.
