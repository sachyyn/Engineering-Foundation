# Engineering rules

These are implementation contracts for future authorized work. They do not authorize
creating product code during foundation setup. Each MUST below belongs to the named
rule ID; its automated check or specific review criterion is defined here and in
[enforcement](enforcement.md). Tests described here are required future product tests,
not tests already present.

## Structure and language

**ARCH-01.** Future backend paths: `backend/src/Controller/<Feature>/`, `Dto/<Feature>/`,
`Service/<Feature>/`, `Repository/`, `Entity/`, `Value/`, `Security/`, `Message/`,
`MessageHandler/`, and `EventSubscriber/`. Controllers depend on DTOs/services/security,
not repositories or EntityManager. Services may depend on repositories/entities/value
objects/security and injected integration interfaces. Repositories may depend on
entities/value objects and Doctrine, not controllers/services. Entities/value objects
MUST NOT depend on HTTP, security token storage, mailer, services, or repositories.
Security policies may inspect accounts/entities/value objects, not invoke controllers.
Services MUST enforce permissions as well as HTTP access controls, so CLI/jobs cannot
bypass policy. Dependencies are constructor-injected. Avoid a generic service locator.
Deptrac checks named layers; review checks integration dependencies and policy order.

**LANG-01.** PHP uses `declare(strict_types=1)`, explicit public signatures, immutable
DTOs/value objects, DateTimeImmutable, and PHPStan level 8 initially, without a blanket
baseline. TypeScript uses strict mode, noUncheckedIndexedAccess, and
exactOptionalPropertyTypes. Explicit `any` and non-null assertions require replacing
the uncertainty with narrowing, not lint suppression. Use one formatter per language.
vue-tsc, ESLint, PHPStan, PHP-CS-Fixer enforce the mechanical parts; reviewers check
public boundaries and justified local suppressions. Never use float for money.

## HTTP and contracts

**API-01.** `contracts/openapi.yaml` is the future schema authority (OpenAPI 3.1.1).
Version application routes under `/api/v1`. Each operation documents request, success,
validation, authorization and conflict responses. Generated types live at
`frontend/src/api/schema.d.ts`; never edit them manually. Backend DTOs explicitly map
fields; entities MUST NOT be serialized as public responses. Symfony validates DTOs
and rejects extra fields before side effects. IDs and decimal values are strings;
instants are RFC3339 UTC, invoice dates are calendar dates. Contract lint, generated
type freshness and real HTTP schema assertions enforce agreement; types alone do not.

**API-02.** One exception subscriber translates expected failures to
`application/problem+json`: `type`, `title`, `status`, stable `code`, `requestId`, and
optional `errors` as `{field, code, message}[]`. No SQL, stack, password/token, or internal
exception text in responses. Malformed JSON is 400, bad media type 415, semantic input
422, anonymous 401, same-tenant denied operation 403, inaccessible/absent object 404,
stale edit/state conflict 409, throttling 429 with Retry-After, unexpected error 500.
Failure responses use the same shape on auth entrypoints and controllers. Review the
subscriber/auth handlers and test each applicable failure through the real HTTP layer.

**API-03.** List defaults are 25 rows, maximum 100; stable `(createdAt,id)` ordering,
opaque cursor validated and bound to query filters. Allowlist filters and sorting.
Mutations are not retried by the client. Issuance requires a tenant+actor+operation-scoped
idempotency key with request digest: replay same request returns prior result; changed
request with same key is 409. Recheck current authorization before replay. GET cancellation
is safe; cancelling a POST in the browser does not prove rollback. Test duplicate/concurrent
requests and review pagination bounds. No promise of a public API compatibility SLA yet;
additive v1 changes must preserve existing fields, meaning and errors.

## Identity and isolation

**SEC-01.** One session firewall covers protected API paths, with an explicit public
allowlist for CSRF bootstrap, login and reset entrypoints. Password hashers use Symfony
`auto`. Use a server-side PostgreSQL session store; cookies are HttpOnly, Secure in HTTPS,
SameSite=Lax, path `/`, no Domain. Rotate session ID on login; invalidate on logout,
password reset, account deactivation, and tenant/role changes. No remember-me for v1.
Check stateful CSRF token on unsafe methods including login, logout, and reset submission;
do not assume `json_login` has form-login CSRF behavior. A pre-auth request listener must
validate login CSRF before the authenticator handles credentials. Reject untrusted Origins;
configure exact trusted hosts/proxies and a fixed public base URL. No wildcard credentialed
CORS. Apply login/reset throttling by IP and normalized account identifier with shared
server-side state; tune thresholds from abuse evidence. Review configuration and test
the real login/reset flow, not only `loginUser()` helpers.

**SEC-02.** Normalize email by trimming and lowercasing, validate length/syntax, do not
strip dots or plus tags; unique DB constraint on normalized email across all accounts.
Each account has one non-null tenant and an owner or staff role. Deny unknown roles.
Owners manage accounts and may issue/cancel invoices; staff may manage customers and
draft invoices only. Neither role may edit an issued invoice snapshot. No support/admin
cross-tenant bypass in ordinary application code. Tenant context comes only from the
loaded authenticated account. Ignore/reject payload tenant IDs; never use a header as
proof of membership. Auth account lookup is the narrow exception before tenant context:
only `Repository/IdentityRepository` can find credentials by normalized email; it must
not expose a general account-list endpoint. Test role matrix and disabled-account paths.
Define a usable active owner as role=owner, active=true and password_initialized=true;
preserve at least one using the tenant-row guard in P7, not an unlocked
count of owners. At PostgreSQL READ COMMITTED, account/role/credential mutations acquire
`SELECT id FROM tenant WHERE id = :tenant FOR UPDATE` before account/token locks, reload
actor authority, then lock affected accounts in ascending ID order. Normal business
mutations take `FOR SHARE` on that same tenant row first and revalidate actor/session
before proceeding; hold the guard until commit. Never upgrade a shared guard mid-transaction.
Store a random UUID `account.auth_version`; copy it into the session at login and compare
against freshly loaded account active/password_initialized/tenant/version on every
authenticated request. P7 defines pending-password creation using the existing reset flow,
and opaque UUID record_version for management lost-update checks.
Rotate both auth_version and record_version in the same transaction as each actual role,
active-state, email or password change; reactivation also rotates both so old sessions
cannot revive. Do not rely on deleting opaque
session blobs or stale serialized roles. P7 defines owner-management creation/update,
last-owner conflicts, revocation semantics, lock order and required concurrency tests.
Tenant transfer and physical deletion are not ordinary management operations: reject them;
any future operation affecting membership must obey the same guard and last-owner invariant.

**SEC-03.** Reset requests return the same accepted body/status independent of account
existence; defer account lookup/delivery to the worker, throttle before queueing, and
measure timing for enumeration risk. Token: cryptographic random 32 bytes, hash at rest,
30-minute lifetime, single use atomically consumed with password update. Existing reset
tokens become invalid after a successful reset; simultaneous consumption has one winner.
Use configured HTTPS base URL, never request Host. No token or email body in logs/traces.
Reset page has no third-party resources and sends Referrer-Policy: no-referrer. Do not
auto-login. Test expiry, reuse, concurrent use, unknown account, throttling and session
revocation. Production mail transport configuration is a launch prerequisite.

**DATA-01.** All customer/invoice child tables carry tenant_id. Repositories require
TenantContext explicitly and predicate by it, including list/count/export and joins.
Use composite FK `(tenant_id, customer_id)` referencing `(tenant_id,id)` and corresponding
unique keys; constraints, not application checks alone, prevent cross-tenant associations.
Enable AND FORCE RLS on business tables with USING and WITH CHECK policies. Runtime DB
role is neither table owner, superuser, nor BYPASSRLS and cannot DDL/TRUNCATE. Migration
role is separate and never given to request handlers. Tenant operations, including reads,
run in an explicit transaction with `set_config('app.tenant_id', :tenant, true)` before
the first business query. Missing context fails closed. Never session-wide SET across a
pool. Clear EntityManager and tenant context between jobs/requests; one tenant per unit
of work. Auth/session/queue control tables use explicit restricted privileges and are
not blanket tenant-filtered. RLS is not protection against arbitrary SQL with stolen
application credentials. Real-role DB tests must exercise read/write, missing context,
relationship violations and tenant A/B reuse of the same connection.

**DATA-02.** USD only, no tax or FX. Unit price, line amount and invoice total are
canonical non-negative two-place decimal strings in `0.00` through
`9999999999999999.99`, inclusive. `MAX_CENTS = 999999999999999999` is the
`numeric(18,2)` storage ceiling, not a commercial transaction limit. All PHP processes
performing this arithmetic MUST have `PHP_INT_SIZE === 8`; 32-bit startup fails.
Quantities are whole integers `1..2147483647` (PostgreSQL INTEGER storage ceiling),
explicitly accepted for this trial; this ceiling is not an approved commercial order size.
Parse validated ASCII strings without float: full-string pattern
`\A(?:0|[1-9][0-9]{0,15})\.[0-9]{2}\z`, remove the dot, then cast the at-most-18-digit
value to a 64-bit int. Reject whitespace, signs, exponent syntax, leading zeros except
`0.xx`, and excess scale with 422; never silently round. Validate quantity's integer type
and bound before using it (reject strings/booleans/fractions). Before multiplication require
`unitCents <= intdiv(MAX_CENTS, quantity)`; before addition require
`runningCents <= MAX_CENTS - lineCents`. Only then calculate. Bound failures are 422
`money_out_of_range` with no writes. PHP overflowing to float must never be the detector.
Persist numeric(18,2) with non-null/range checks and currency=USD; P3 supplies constraints.
Render cents via integer division/modulo to strings. Browser money remains strings (or
BigInt for exact display calculations), never Number; totals remain server-authoritative.
Draft writes lock invoice before checking state/version, stale version is 409.

Issuance takes the shared tenant authority guard (SEC-02/P7), revalidates active owner
and session, reserves the tenant+actor+operation idempotency key, locks invoice row before
checking state/version, then locks its tenant's `invoice_number_counter` row with
`SELECT ... FOR UPDATE`. Storage is one row per tenant (`tenant_id` PK/FK,
`last_issued BIGINT NOT NULL DEFAULT 0 CHECK (last_issued >= 0)`), created with the tenant
and initial owner in one provisioning transaction. Missing counter is an invariant failure
(500), never lazy reset. Values `1..9223372036854775807` are technical invoice identifiers,
serialized as strings. At the upper bound return 409 `invoice_number_exhausted` before
adding. Advance counter and persist frozen invoice/audit/idempotency result in the SAME
transaction; rollback restores counter. Enforce UNIQUE `(tenant_id, invoice_number)`
with draft numbers null and issued/cancelled numbers positive/non-null. Cancelled numbers
remain reserved; no reuse, deletion or periodic reset of counters in application code.
All writers use this order. Concurrent same-key reservations wait and replay committed
results (or retry reservation after rollback); changed digest is 409. Different keys still
serialize on invoice and cannot issue it twice. Never `MAX(number)+1`, PostgreSQL sequences
or an in-memory lock for this counter. P3 specifies initialization, SQL and concurrency proof.
These numbering rules are technical assumptions, not a legal series/gaplessness policy.
Legal issue/cancel semantics and retention remain launch gates. Required tests include
exact arithmetic boundaries, counter initialization/exhaustion/rollback and committed
concurrent issuances plus staff denial; see P3 and enforcement.md.

**DATA-03.** Doctrine migrations are reviewed SQL changes. Use expand/backfill/contract
for incompatible changes; no destructive migration alongside code still reading old fields.
Include tenant constraints/RLS in the same creation migration; index tenant-prefixed common
filters. Assess locks and backfill batches. Test migration from empty and prior schema with
real PostgreSQL; test rollback/forward-fix plan rather than trusting generated `down()`.
No production auto-migration at web startup. Never use schema:update in production.

## Frontend, jobs and tests

**UI-01.** Feature pages/components/composables live in `frontend/src/features/<feature>/`;
shared presentational controls in `components/`, router in `router/`, transport in `api/`.
Components may use composables/transport types but MUST NOT call fetch directly; a single
transport handles CSRF, credentials, cancellation, timeouts, and problem parsing. Feature
modules do not import another feature's internals (ESLint restrictions). No v-html with
user content. No auth tokens or customer/invoice state in localStorage/service-worker caches.
Use refs/computed for local state; approve a state/cache library only when justified.
On logout/401 clear user data; on 403 show denial, on 409 preserve draft for reconciliation,
on 422 associate fields, on 5xx show retry affordance without exposing internals. Cancel
stale GETs and discard out-of-order results. Never automatically resubmit mutations.

**UI-02.** Target current and previous stable desktop Chrome/Edge, Firefox and Safari;
Playwright Chromium/Firefox/WebKit are proxies, not proof on every real browser. Use
semantic HTML, accessible names, visible focus, skip link, route heading focus, dialog
focus trap/restore, live status for submissions, and label/error associations. Do not
use color alone. Support zoom and reduced motion. WCAG 2.2 AA is an engineering target,
not a legal certification. Test keyboard-only login/customer/draft flows, role-based
locators, and axe scans of interactive states. Manual reviewer checks focus order,
screen-reader announcement, contrast and zoom; automated scans do not replace that review.

**JOB-01.** Messenger Doctrine queue is reserved initially for reset/notification mail.
Messages carry scalar IDs and minimal necessary data, no serialized Doctrine entities.
Workers reload current account and tenant, set/reset context and EntityManager each job.
At-least-once delivery means duplicate mail is possible after crash; never claim exactly-once
SMTP. Use stable job IDs, expired-token suppression, bounded retries (3, exponential delay
with jitter), failed transport and an operator runbook. Do not persist plaintext reset
tokens in a queue: worker generates token immediately before delivery and stores only its
hash; on retry a new attempt invalidates the previous pending token. Queue email identifiers
are sensitive, access-limited and purged with processed/failed jobs under the retention policy.
Do not hold a tenant transaction open during network delivery. Test retry, stale/deleted
account, role/context reset and crash boundaries. Network connect/total timeout is bounded;
initial mail budget 10 seconds, tune from evidence. No unrelated background subsystem.

**TEST-01.** PHPUnit unit tests cover money/invariants/policies; KernelTestCase with real
PostgreSQL covers queries/RLS/migrations; WebTestCase covers real auth, DTO/error/contract
wiring. Vitest/Vue Test Utils cover composables and interaction states. Playwright covers
login/reset/customer/draft and owner-vs-staff invoice actions, plus keyboard/axe. Use two
tenants with deliberately overlapping labels. Test no side effects on denial or invalid input.
Isolation tests run as production-like application role, not DB owner. Concurrency tests
use separate committed connections; test-wide rollback wrappers are unsuitable there.
Freeze time for token expiry and reset between tests. Missing suite/test discovery fails;
no dummy passing tests, blanket snapshots, arbitrary coverage target or `passWithNoTests`.

## Delivery and governance

**DEV-01.** Node 22.23.1/npm 10.9.8, PHP 8.4, PostgreSQL 18; lock approved dependencies.
Use `npm ci --ignore-scripts`; review any required install scripts before selectively enabling
them. Dependency caches stay repository-local in this trial. Docker services bind localhost,
use disposable synthetic data, and never production credentials. Native Node checks do not
require Docker. See operations.md for roles/setup and explicit unavailable verification.

**CHECK-01.** `npm run check` is local/CI authority. Non-mutating checks propagate failure.
Missing tools, contract, generated types, test inputs or suites MUST NOT count as success.
Foundation-only success is explicitly labeled. Any product inputs trigger the product gate.
Every new source path must be covered; review exclusions and configuration changes as code.
Secretlint scans repository text (not history); audit metadata goes only to package registries.
Do not print secrets or make broad ignore patterns to silence findings.

**CI-01.** PR and main-push quality workflow uses immutable reviewed actions, contents:read,
GitHub-hosted ephemeral runners, timeouts, no production credentials and no privileged
pull_request_target. No path filter on the required quality gate. Review scripts, actions,
lockfile and guidance changes; do not add continue-on-error or hide missing inputs.
Hosted merge blocking requires administrator activation and a deliberate failing-PR trial.

**OPS-01.** Release only after relevant tests and authorized production activation. Promote
the same immutable artifact; identify revision, locks and build environment; retain rollback
artifact. Migrate once, serialize deployments, restart workers, verify health and a tenant-safe
smoke flow. Schema rollback is not automatically safe. Emit request/job IDs, operation/status/
duration, redacted error codes; no credentials, reset URLs, bodies or financial/customer PII.
Record actor/tenant/action/target/time for authorization and invoice transitions in restricted
audit storage. Set backup retention, RPO/RTO, residency and alert ownership before launch;
prove restoration using isolated data and record elapsed time/data loss. operations.md is
the review checklist and handoff; provider-specific CD is deferred, not configured.

**AGENT-01.** Follow the entry routes and relevant persistent skills before edits; record
exceptions and evidence, preserve unrelated work, and report actual limitations. Skills are
instructions, not enforcement. Reassess explicitly on tenant model, runtime, contract,
permission, currency, hosting or legal-policy changes. Lead reviews policy changes.
