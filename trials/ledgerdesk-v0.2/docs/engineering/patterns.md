# File-level implementation playbook

These are documentation examples only. No application classes, routes, tables or tests
exist yet. Create them only for an authorized product task. Read [rules](rules.md) and
the relevant [skills](skills.md) first. Paths below are intended future files, not links
to implementations. Run `npm run check:product` after implementing the applicable slice.

## P1: Add a protected customer operation and consume it in Vue

Load backend, security-data, frontend and testing skills. Add/extend:

| Path                                                           | Responsibility                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `contracts/openapi.yaml`                                       | PATCH customer request/response and problem schemas, session security and CSRF header      |
| `backend/src/Dto/Customer/UpdateCustomerInput.php`             | Immutable validated fields and version, no tenant/role/owner fields                        |
| `backend/src/Controller/Customer/UpdateCustomerController.php` | Parse request and ID, call service, map response DTO                                       |
| `backend/src/Service/Customer/UpdateCustomer.php`              | Authorize current actor, open tenant transaction, load and version-check, update/flush     |
| `backend/src/Repository/CustomerRepository.php`                | `getForTenant(TenantId, CustomerId)`, explicit scope on every query                        |
| `backend/src/Security/CustomerPolicy.php`                      | Owner/staff permitted only within authenticated tenant                                     |
| `backend/src/EventSubscriber/ApiProblemSubscriber.php`         | Central safe exception-to-problem translation                                              |
| `frontend/src/api/client.ts`                                   | Same-origin fetch with credentials, CSRF header, bounded timeout and typed problem parsing |
| `frontend/src/api/schema.d.ts`                                 | Generated from contract, never hand-written                                                |
| `frontend/src/features/customers/useCustomer.ts`               | Read cancellation, mutation state and invalidation                                         |
| `frontend/src/features/customers/CustomerEdit.vue`             | Accessible form, local draft, conflict and field errors                                    |

The request enters the session firewall/CSRF guard before the controller. It is mapped
to the DTO with extra fields rejected. Service authorization does not rely on a hidden
button. The tenant unit of work sets transaction-local context, obtains P7's shared tenant
authority guard and reloads the actor/session before the repository query. A nonexistent or foreign-tenant customer is 404 without describing the other tenant.
Version mismatch is 409; validation is 422 and has no writes. Unexpected DB failure rolls
back and becomes a generic 500 with requestId. Do not reuse a closed EntityManager.

Illustrative signatures (not an implementation of these classes):

```php
#[Route('/api/v1/customers/{id}', methods: ['PATCH'], format: 'json')]
public function __invoke(
    string $id,
    #[MapRequestPayload(
        acceptFormat: 'json',
        serializationContext: ['allow_extra_attributes' => false],
    )] UpdateCustomerInput $input,
    UpdateCustomer $update,
): JsonResponse {
    return $this->json($update->execute($id, $input));
}

// Service: trusted ActorContext is injected, not taken from the request DTO.
$this->policy->assertCanEditCustomers($this->actor);
// run() begins READ COMMITTED, sets tenant context and takes the shared tenant guard.
return $this->tenantWork->run($this->actor->tenantId(), function () use ($id, $input) {
    $this->actor->refreshAndAssertSessionCurrent();
    $this->policy->assertCanEditCustomers($this->actor);
    $customer = $this->customers->getForTenant($this->actor->tenantId(), $id);
    $customer->changeDetails($input->name, $input->version);
    $this->entityManager->flush();
    return CustomerView::fromEntity($customer);
});
```

The contract author explicitly adds schemas before generating types:

```yaml
UpdateCustomerInput:
  type: object
  additionalProperties: false
  required: [name, version]
  properties:
    name: { type: string, minLength: 1, maxLength: 200 }
    version: { type: integer, minimum: 1 }
```

That schema does not replace Symfony constraints. Functional tests validate real response
bodies against the operation schema and check route inventory against documented operations.
Schema generator output is compared byte-for-byte by the product check. For runtime
response assertions select `opis/json-schema` 2.x (JSON Schema 2020-12 support) in the
future backend dev dependencies. `backend/tests/Support/AssertApiResponse.php` loads the
local YAML contract, finds operation/status/content-type schema, and rejects undocumented
responses. Restrict schema refs to local `#/components/schemas/` for v1. Construct an object
schema with `$schema: https://json-schema.org/draft/2020-12/schema`, the contract's
`components`, and `$defs.response` containing the selected response schema, then root
`$ref: #/$defs/response`. Decode JSON as objects, not associative arrays. Call
`(new Opis\JsonSchema\Validator())->validate($body, $schema)->isValid()` and assert true;
include malformed and extra-field response fixtures to prove the assertion can fail.
Resolve all schemas locally; do not fetch URLs from contract content. Check status,
content-type and required response headers separately; a JSON Schema validator is not
a complete HTTP/OpenAPI validator. A route inventory test compares `/api/v1` methods/paths
against operationIds so an undocumented new route fails.

```vue
<label for="customer-name">Customer name</label>
<input
  id="customer-name"
  v-model="draft.name"
  :aria-invalid="Boolean(errors.name)"
  :aria-describedby="errors.name ? 'name-error' : undefined"
/>
<p v-if="errors.name" id="name-error">{{ errors.name }}</p>
<button type="submit" :disabled="saving">Save customer</button>
<p role="status">{{ statusMessage }}</p>
```

`useCustomer` catches typed problems: 422 maps fields, 409 retains the draft and offers
reload/reconcile, 401 clears all account data and routes to login, 403/404 display safe
denial/missing states. Cancel stale reads on ID change/unmount. A fetch abort during save
does not mean the write failed; refetch before offering a duplicate action. Do not retry
mutations blindly. On success invalidate/refetch the customer and its list.

Required future tests: `backend/tests/Functional/Customer/UpdateCustomerTest.php` covers
success, 400/401/403/404/409/415/422 and no write on denial; repository tests use actual
application DB role with tenants A/B. `frontend/src/features/customers/CustomerEdit.test.ts`
covers loading/error/conflict/focus; `tests/e2e/customer.spec.ts` drives keyboard submission
and checks axe in validation state. Auth tests must exercise real login, not only fixtures.

## P2: Add a tenant-bound table or query

Load security-data, backend, testing and delivery. Add the Doctrine entity/repository and
`backend/migrations/Version<timestamp>.php` together. Document prior-schema transition and
lock impact. Explicit migration SQL must include composite relationship integrity and RLS:

```sql
ALTER TABLE customer ADD CONSTRAINT customer_tenant_id_unique UNIQUE (tenant_id, id);
ALTER TABLE invoice ADD CONSTRAINT invoice_customer_same_tenant
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customer (tenant_id, id);
ALTER TABLE invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice FORCE ROW LEVEL SECURITY;
CREATE POLICY invoice_tenant ON invoice TO ledgerdesk_app
  USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
```

The policy is illustrative: define the equivalent policy for every tenant-bound parent
and child table and grants for each operation. Default-deny missing tenant context is
intentional. Runtime must use a distinct non-owner role; `FORCE` does not constrain a
superuser or BYPASSRLS role. Grant only necessary table/sequence permissions.

Tenant work wraps ORM reads/writes in the same connection transaction; after beginning,
execute parameterized `SELECT set_config('app.tenant_id', :tenant, true)`. Never build SQL
by interpolating a tenant. Commit/rollback discards context. Clear ORM state at the boundary
before serving another tenant. Deny nesting with a different tenant. Streaming work must
not outlive its transaction/context; page queries instead.

Required future `backend/tests/Integration/TenantIsolationTest.php`: read/list/count/update/
delete/insert and cross-tenant FK rejection, missing-context behavior, rollback, tenant A
then B on a reused connection and worker. Verify actual role attributes and table owner.
Test the layers separately: a query-shape assertion verifies the explicit predicate, while
an unscoped query under the runtime role verifies RLS denial. Intact RLS can mask a missing
application predicate, so black-box isolation alone cannot prove both layers. Constraint exceptions
are normalized; do not expose that a foreign tenant's identifier exists. Review raw DBAL,
bulk queries and migrations because ORM filters do not cover every route to SQL.

## P3: Draft invoice edit and owner-only issuance

Load backend, security-data, testing, frontend. Extend contract and the feature paths
following P1; add `Service/Invoice/EditDraft.php`, `IssueInvoice.php`,
`Security/InvoicePolicy.php`, `Value/Money.php`, and `Repository/InvoiceRepository.php`.
Issued invoice snapshot fields must not track later changes to Customer.

### P3a: Exact money and quantity limits

Assumption: PHP 8.4 runs with 64-bit signed integers in web, worker, CLI and tests;
assert `PHP_INT_SIZE === 8` at bootstrap, fail otherwise. PHP's integer maximum is
9223372036854775807, but the smaller database monetary ceiling is authoritative:
`MAX_CENTS = 999999999999999999`, or USD `9999999999999999.99`. Apply it separately
to unit price, each line amount and total. These are technical representational limits;
no smaller commercial maximum/minimum has been agreed. Zero prices are representable,
not a promise that zero-value invoices may legally be issued. Whole quantities are approved
for the trial, stored in PostgreSQL INTEGER with `1..2147483647` inclusive. No fractions,
negative/zero quantities, tax, discounts or FX arithmetic is introduced by this recipe.

Future `Value/Money.php` owns parsing/formatting and checked addition/multiplication;
`Value/Quantity.php` enforces integer bounds. Input DTO and OpenAPI describe these bounds
and examples; service recomputes totals regardless of frontend values. Money is a JSON
string, quantity a JSON integer. Validate exact full-string ASCII money syntax before
removing the dot and casting to int (DATA-02's PHP `\A...\z` pattern); reject extra
precision rather than letting PostgreSQL round it. JSON numbers/NaN/infinity, signs,
whitespace, exponent syntax and noncanonical leading zeros are invalid money input.
Browser forms send strings; they must not turn large prices/totals into JS Number.

Illustrative arithmetic after parsing (documentation only):

```php
// Preconditions: 64-bit PHP; 0 <= $unitCents <= MAX_CENTS;
// 1 <= $quantity <= 2147483647; 0 <= $totalCents <= MAX_CENTS.
$maxCents = 999999999999999999;
if ($unitCents > intdiv($maxCents, $quantity)) {
    throw new MoneyOutOfRange(); // 422, before multiplication
}
$lineCents = $unitCents * $quantity;
if ($totalCents > $maxCents - $lineCents) {
    throw new MoneyOutOfRange(); // 422, before addition
}
$totalCents += $lineCents;
$wire = intdiv($totalCents, 100).'.'.str_pad((string) ($totalCents % 100), 2, '0', STR_PAD_LEFT);
```

Future migration constraints for each persisted monetary column use this shape:

```sql
-- Apply to unit_price, line_amount and invoice total; column names vary by table.
amount NUMERIC(18,2) NOT NULL
  CHECK (amount >= 0 AND amount <= 9999999999999999.99),
currency CHAR(3) NOT NULL CHECK (currency = 'USD'),
quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 2147483647)
```

The numeric upper-bound check also excludes PostgreSQL numeric NaN (which sorts above
finite numbers). A scale-constrained column can round input: the DB is NOT the request
scale validator. Repository writes must originate from the validated Money value object.
Use checked integer string formatting; no `round`, float division, or float-based formatter.

Required `backend/tests/Unit/Value/MoneyTest.php` and functional invoice-input cases:
`0.00`, `0.01`, exact maximum, maximum+one cent rejected as a string before cast;
`1.001` rejected, not rounded; quantity 1 and 2147483647 accepted, 0/2147483648/fraction/
string/bool rejected. Multiplication at q=2 accepts 499999999999999999 cents and rejects
500000000000000000 cents; addition of MAX_CENTS-1 and 1 succeeds, then another cent fails.
A zero-price line at maximum quantity succeeds. Assert failed requests leave drafts/counters
unchanged, DB round-trip returns the exact maximum as a string, and Vue preserves
`90071992547409.93` exactly (its cents exceed JS safe integer precision). Property tests
may use arbitrary-precision reference arithmetic, never another copy of the same formula.

### P3b: Counter storage and lock protocol

Future files: `Repository/InvoiceNumberCounterRepository.php`,
`Entity/InvoiceNumberCounter.php`, and the corresponding Doctrine migration. No tables
are created by this documentation. Counter state is NOT in a cache or process variable:

```sql
CREATE TABLE invoice_number_counter (
    tenant_id UUID PRIMARY KEY REFERENCES tenant(id) ON DELETE RESTRICT,
    last_issued BIGINT NOT NULL DEFAULT 0 CHECK (last_issued >= 0)
);
-- Invoice has an equivalent tenant FK and the tenant-scoped uniqueness constraint:
ALTER TABLE invoice ADD CONSTRAINT invoice_tenant_number_unique
    UNIQUE (tenant_id, invoice_number);
-- invoice_number BIGINT is NULL only for drafts; issued/cancelled rows retain a number.
ALTER TABLE invoice ADD CONSTRAINT invoice_number_state CHECK (
    (status = 'draft' AND invoice_number IS NULL) OR
    (status IN ('issued', 'cancelled') AND invoice_number IS NOT NULL AND invoice_number > 0)
);
```

Enable/FORCE RLS on the counter with P2's tenant USING/WITH CHECK policy. Ordinary runtime
gets SELECT/UPDATE, not INSERT/DELETE on counter; authorized tenant provisioning creates
`(tenant_id, 0)` together with tenant and first active owner. PK makes duplicate provisioning
fail atomically. Do not lazy-create on issuance: a missing row is 500
`invoice_counter_unavailable`, with a safe operational alert and full rollback. For existing
tenants a reviewed backfill must reconcile prior numbers under exclusive maintenance access;
never initialize a live tenant to zero. This is a new-project technical sequence starting at
1, monotonically per tenant with no yearly reset, not an approved legal numbering scheme.

At READ COMMITTED, using the SAME Doctrine/DBAL connection and transaction as the invoice:

```sql
SELECT last_issued FROM invoice_number_counter
 WHERE tenant_id = :tenant FOR UPDATE;
-- Application first checks last_issued < 9223372036854775807.
UPDATE invoice_number_counter
 SET last_issued = last_issued + 1
 WHERE tenant_id = :tenant AND last_issued < 9223372036854775807
 RETURNING last_issued;
```

Require one selected and one updated row. At the maximum, return 409
`invoice_number_exhausted`, without attempting PHP or SQL addition. Missing/otherwise
unexpected row count is an invariant failure, not a successful issuance. Keep the row lock
through commit and use returned number on invoice. Treat BIGINT identifiers as strings
at API/browser boundaries; even a DBAL-returned string must be range-checked before any cast.
Rollback undoes both allocation and issuance. Cancellation retains number and counter.
Unique constraint is a final backstop: a collision means counter corruption, rollback and
alert; do not spin until a free number. No gaplessness or legal validity guarantee is made.

```text
issue(actor, invoiceId, expectedVersion, idempotencyKey):
  begin READ COMMITTED tenant transaction; set transaction-local tenant context
  take tenant row FOR SHARE (P7); reload/check actor active + auth_version + owner
  reserve unique key scoped to tenant + actor + operation and request digest
  on reservation conflict wait; replay committed result or retry after rollback
  SELECT invoice for tenant FOR UPDATE; then require version and draft state
  SELECT tenant counter FOR UPDATE; reject missing/exhausted counter
  guarded UPDATE counter RETURNING number
  freeze validated customer/line/USD totals; record actor and timestamp
  save issuance audit + replay result + state transition in this transaction
  commit; return immutable issued view with number as string
```

Order is tenant guard, key reservation, invoice row, counter. Never acquire tenant guard
last or upgrade its lock mode. All draft edits also lock invoice before state/version check,
so an edit cannot slip through issuance. Recheck owner/session before replay too. A reused
key with a different digest is 409; different keys for the same invoice serialize on its
row and loser sees issued state without allocating. Lock timeout/deadlock rolls back all
changes and returns 409 `concurrent_change`; no automatic HTTP mutation retry. If retried
by caller, reuse the same idempotency key. This keeps lost responses safe.

`backend/tests/Integration/Invoice/IssueInvoiceConcurrencyTest.php` uses independent committed
connections, controlled barriers and bounded waits (not sleeps as evidence):

- Initialize counter=0 in tenant-provisioning transaction; assert exactly one row, duplicate
  tenant counter rejected and failed provisioning leaves neither counter nor half-created tenant.
- Two different draft invoices, same tenant, distinct keys: pause A after locking counter;
  B must wait there (use pg_locks/pg_blocking_pids evidence). Commit A then B: numbers 1 and 2,
  two immutable snapshots, counter=2. Do not test only two requests for the SAME invoice.
- Repeat with A rolling back after counter increment: B obtains 1, counter=1; A has no
  issued state/audit/replay result. B in another tenant can allocate independently while A waits.
- Same invoice/different keys: one transition and one number; same key replay: identical result
  and no increment; changed digest: 409. Concurrent draft edit must serialize on invoice lock.
- Missing counter fails without writes; maximum counter produces 409 with no increment;
  unique invoice-number violation rolls back counter and audit. Cancelled numbers stay occupied.
- RLS denies foreign-tenant counter read/update; staff issuance denies before reservation/allocation.

Frontend follows P1's 409 reconciliation. Staff controls are hidden only as a convenience;
server remains authoritative. Cancellation is owner-only and preserves originals, but its
business/legal correction semantics still need approval before implementation/production use.
Keep production issuance disabled until the legal launch gate is closed.

## P4: Email/password login and reset

Load security-data, backend, frontend, testing and delivery. Future paths:
`Security/ActorContext.php`, `Repository/IdentityRepository.php`,
`EventSubscriber/UnsafeRequestCsrfSubscriber.php`, `Controller/Auth/`,
`Service/Auth/RequestReset.php`, `Service/Auth/ConsumeReset.php`,
`Message/SendReset.php`, `MessageHandler/SendResetHandler.php`,
`frontend/src/features/auth/`, and functional/browser auth tests.

Use one session firewall, a persisted account provider and real authenticator. Configure
security access rules with public exceptions before protected `/api/`; read rules SEC-01–03.
CSRF bootstrap returns a session token with no-store. Ensure unsafe-request CSRF runs before
JSON login authentication, not only inside a controller that authentication may bypass.
Implement consistent problem responses in auth success/failure/entrypoint handlers too.

```text
request reset(email):
  normalize + syntactically validate; throttle IP and normalized email
  enqueue minimal reset request regardless of account existence
  return identical accepted response
worker:
  look up account; ignore unknown/inactive accounts safely
  begin short transaction; take P7 shared tenant guard, then lock/reload account
  recheck active/email state; create random token; store hash/expiry; commit
  deliver trusted-origin reset URL outside transaction
  on retry invalidate prior attempt and create a new pending token
consume reset(token, new password):
  locate token/account/tenant without locks, solely to choose guard; never authorize from this lookup
  take P7 tenant guard FOR UPDATE before account/token locks
  reload/lock account, then token; revalidate active state, hash, expiry and unused state
  update password hash + password_initialized=true; rotate auth_version and record_version
  consume/invalidate reset tokens; version change invalidates existing sessions
  commit; queue notification; return normal-login destination
```

Review queue access/retention because reset identifiers are PII even without passwords.
Do not log mail bodies/tokens. SMTP uncertainty can cause duplicate emails; retries may
supersede earlier links, and the UI must direct users to request/use the latest link.
Cap retries and expose queue failures to operations. Invalid/expired/reused token returns
a safe identical error. No account lockout merely because someone requests a reset.

Test the real credential POST, session fixation prevention, CSRF missing/bad/cross-origin,
logout/reset revocation, unknown email timing, throttle, expired/reused token and concurrent
consumption. Test worker context reset and delivery failure with mail transport doubles;
use mail catcher for browser tests, never a real SMTP account.

## P5: Migration and release change

Load delivery, backend, security-data, testing. A future migration PR includes SQL/lock
analysis, old/new application compatibility, backfill method, and forward-fix or rollback
plan. Review `backend/migrations/` and corresponding contract/UI compatibility together.
Use `backend/tests/Integration/MigrationTest.php` for empty and prior schema paths; keep
prior-schema fixtures synthetic and local. Never claim a successful dry run proves production
lock time. Release runbook orders backup readiness, expand migration, artifact activation,
worker restart, smoke checks and later contract migration. No deployment YAML is active.

## P6: Change enforcement or a skill

Load delivery and any affected layer skill. Update the rule-to-check mapping, actual check,
recipe and skill routes together. Add a negative guard test for a detectable violation in
`scripts/checks.test.mjs`; use a disposable directory inside `.verification/`. Test new files
as well as edits, verify restoration, and report the rule that caused failure. The structural
validator does not prove research depth or security. Do not change `foundation.json` to ready
without rereading the artifacts and applying the supplied acceptance criteria.

## P7: Owner account management and session revocation

Load security-data, backend and testing; frontend for the management consumer, delivery for
provisioning/migrations. This recipe covers account creation, role/email changes, deactivation
and reactivation. No physical deletion or tenant-transfer operation is exposed: reject those
fields/operations; future retention/deletion workflows need a reviewed extension. No application
implementation is authorized by these examples. Assumptions: READ COMMITTED transactions,
immutable account tenant membership in v1, and a tenant row exists for every usable account.

| Future file                                                       | Responsibility                                                                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Controller/Account/ManageAccountController.php`, `Dto/Account/`  | Authenticated CSRF-protected owner endpoints; strict field allowlist; expected account version           |
| `Service/Account/ManageAccount.php`, `Security/AccountPolicy.php` | Tenant guard, fresh actor authorization, last-owner invariant, transaction and audit                     |
| `Repository/TenantGuardRepository.php`                            | Parameterized tenant guard lock on the active DB connection                                              |
| `Repository/AccountRepository.php`                                | Tenant-scoped account reads/writes, ordered row locks and usable-owner count                             |
| `Entity/Account.php` and reviewed migration                       | Email uniqueness, role/active/password-initialized flags and UUID version fields                         |
| `Security/SessionAccountChecker.php`                              | Every authenticated request checks current active/login-ready account, tenant and auth_version           |
| `frontend/src/features/accounts/`                                 | P1 accessible form/errors; owner-only controls; version conflict reconciliation                          |
| `contracts/openapi.yaml`                                          | Account input/output DTOs and 401/403/404/409/422 problems; no hashes/version secrets in public response |

Paths above are relative to `backend/src/` except explicit frontend/contracts paths.
Account storage: `id UUID PRIMARY KEY`, `tenant_id UUID NOT NULL REFERENCES tenant(id)`
(no transfer), normalized email globally UNIQUE NOT NULL, `role` constrained to owner/staff,
`active BOOLEAN NOT NULL`, `password_initialized BOOLEAN NOT NULL`, password hash,
`auth_version UUID NOT NULL`, and `record_version UUID NOT NULL`. Versions are cryptographically
random UUIDs, replaced on actual changes (no arithmetic counter overflow). Auth version stays
server-side; record version is an opaque string in owner-management DTOs for lost-update checks.
Only AccountRepository scopes management queries; pre-auth IdentityRepository remains narrowly
limited to credential lookup. Ownership and version fields are not mass assignable.

**Creation assumption:** owner-created accounts start active but with password_initialized=false,
an unusable hash made from a discarded cryptographically random password, and fresh versions.
They cannot log in until they set a password via the existing email reset flow P4; no invitation
subsystem or emailed password is added. An active owner counts toward the last-owner invariant
only when password_initialized=true (able to authenticate). Creating a pending owner cannot be
used to bypass that invariant. Initial tenant provisioning must establish its first login-ready
owner and zero counter atomically before making the tenant usable; it is a narrowly authorized
bootstrap operation, not a public bypass of owner authorization. Ordinary owner edits cannot
set password_initialized or password hash. Password setup/reset can set that flag using P4.

### Guard and authorization protocol

Every path changing role, active state, membership, email or credentials, including scripts
and reset consumption, participates in this lock protocol. For account management:

```text
manage(actorSession, targetId?, strictInput, expectedRecordVersion?):
  require authenticated session and valid CSRF; do not trust serialized role
  begin READ COMMITTED; set local tenant from authenticated account identity
  SELECT id FROM tenant WHERE id=:tenant FOR UPDATE
  reload actor and target with tenant predicates, FOR UPDATE in ascending account ID order
  require actor active + password_initialized + session.auth_version == current auth_version
  require actor's freshly loaded role == owner (including self-demotion)
  require target in this tenant (404 otherwise); require matching record_version on updates
  for create: derive tenant server-side; validate email/role; prepare pending-password account
  compute proposed change; count active, password-initialized owners after the change
  reject result < 1 with 409 last_active_owner; do not mutate anything
  write changes; rotate target auth_version and record_version on actual change
  invalidate outstanding reset tokens when email or active state changes
  append restricted audit event in same transaction; flush and commit
  return safe DTO; if actor changed itself, clear its browser session after successful response
```

The last-owner count is a tenant-scoped query after locks and before writes, adjusted for
the proposed target state (or recomputed after update before commit). The guard serializes
all membership writers, so it prevents write skew even when two requests target different
owners. A disabled or pending-password owner does not count. Self-demotion/deactivation is
permitted only if another usable owner remains. A no-op with a current expected version
returns existing state without rotating versions; stale version is always 409. Do not
allow client tenant_id/auth_version/record_version/password_initialized assignments.
Email uniqueness violation is generic 409 account_conflict, without identifying another
tenant. Staff (even acting on self) cannot manage roles/active state or create accounts.

**Global lock order:** tenant guard first, then account rows ascending ID, then token rows
if needed; business transactions use tenant guard, optional account locks, idempotency
reservation, invoice row, counter. Management never locks invoice/counter rows. Never take
a lock then wait for the tenant guard, nor upgrade FOR SHARE to FOR UPDATE mid-transaction.
READ COMMITTED ensures a request waiting for the guard reloads the winner's committed state.
All authorized business mutations (P1/P3, jobs acting for an account) take the tenant row
FOR SHARE before reloading actor authority and hold it through commit. Multiple business
mutations can run together, while a FOR UPDATE account change waits. If account change wins,
a queued mutation sees its new role/version and is denied; if mutation wins, it commits
before revocation commits. This prevents a previously admitted mutation committing with
revoked privileges after management commit. Read-only requests already admitted before
revocation may finish; this design cannot retract bytes already sent. No lock is held over
SMTP, user interaction or other external network calls. Bounded lock timeout/deadlock aborts
the whole transaction with 409 concurrent_change; never continue with a stale principal.

### Session invalidation and failure behavior

At login store account ID, immutable tenant ID and current auth_version in the server-side
session; role data in the session is never authoritative. On EVERY authenticated request
reload account and compare active/password_initialized/tenant/auth_version before constructing
ActorContext. Missing/inactive/not-login-ready/version-mismatched accounts invalidate session
and return 401. Current active staff receives 403 for owner-only action; foreign/absent target
is 404 after actor authorization. Reject unknown fields/roles/invalid normalized email with
422 (normalize Serializer extra-attribute exceptions in ApiProblemSubscriber); stale record version, last-owner conflict and email collision are 409. No hashes or auth
versions in errors/audit. Record audit as actor/tenant/target/action/time and safe changed-field
names only, not raw credentials. Failure of update or audit rolls back state AND versions.

Rotate auth_version inside the SAME database transaction as each actual role/active/email/
password change; reactivation always uses a new version. Physical deletion of session blobs
can be later cleanup, never the security mechanism (a racing session writer could recreate
one). Every node reads the database without a stale account/role cache. A stale concurrent
login may create a session with an old version, but its next request fails; revalidate after
password check before returning login success. Self-change response may complete, but all
later authenticated requests using the old version fail. Reset consumption in P4 takes the
exclusive tenant guard, then account then token lock, rotates both versions, and ensures the
usable-owner invariant if relevant. Password-reset workers acquire shared guard then account
lock and recheck active/email state before recording new tokens; do not send while holding it.
An email already handed to SMTP cannot be recalled; consume always revalidates current state.

### Required tests (not yet implemented)

`backend/tests/Functional/Account/ManageAccountTest.php`: anonymous 401; staff 403 for each
operation and self-promotion; owner same-tenant success; foreign target 404; extra tenant/auth_version
fields rejected with no write; email collision generic 409; stale record-version 409; invalid
role 422. Last usable owner cannot be demoted/deactivated; inactive/pending-password owners do
not satisfy quorum. Test self-change with a remaining owner, new pending account login denial
and first password setup through P4. Assert no unauthorized audit/token/session state changes.

`backend/tests/Integration/Account/ManageAccountConcurrencyTest.php`: use two connections,
actual commits, barriers and pg_blocking_pids evidence, not a shared rollback fixture:

1. Owners A and B each demote/deactivate THEMSELVES concurrently. A holds tenant FOR UPDATE;
   B waits. After A commits B reloads, sees itself last usable owner and gets 409. Exactly
   one owner remains. Repeat with A rolling back: B can proceed and A remains owner.
2. A demotes B while B queues a management action. B must reauthorize after waiting and get
   401 for stale session (or 403 after a new staff login), without changing its target.
3. Concurrent edits of the same account using one record version: one success, one 409.
   Concurrent same-normalized-email creates across tenants: unique constraint permits one;
   loser leaves no account/audit/token. Cross-tenant guards do not serialize unrelated tenants.
4. Inject failure after version rotation but before audit/commit: all state/versions unchanged;
   previous sessions remain valid. Successful change invalidates multiple old sessions across
   simulated nodes on next request; new login uses current permissions. Reactivation never
   revives old sessions, even if an old in-flight session write occurs after revocation.
5. Race staff draft edit/owner issuance against deactivation/demotion in BOTH guard orders:
   mutation holding shared guard commits before revocation; management winning first causes
   stale actor rejection with no invoice/counter mutation. Exercise password reset against
   management to verify the same tenant -> account -> token order and no stale reactivation.

Frontend tests use P1's field-error/conflict/focus behavior and clear session/user state after
self-change or 401. Run `npm run check:product` once authorized product inputs exist. Static
foundation checks cannot prove database locks, session revocation or owner preservation.
