# Implementation recipes

These are future file paths and illustrative snippets, not implemented features. Read the relevant local skill first. Run `pnpm check` after implementation; every recipe requires real PostgreSQL integration tests where it touches transactions. No application sources are created by the foundation.

## Shared request/transaction boundary

Implement `backend/src/Identity/Http/SessionContextSubscriber.php`, `Identity/Application/AuthenticateSession.php`, `Shared/Infrastructure/CompanyTransaction.php`, `Shared/Http/ProblemSubscriber.php`. Keep the control-plane connection separate from business privileges. Session context checks active user, current auth_version and idle/absolute deadlines using the control plane. Never derive company from request body. A company transaction sets local scope before any business query. Mutations serialize against revocation by the lock ordering below. Authorization is rechecked under locks, not only at HTTP entry.

```sql
BEGIN;
-- A trusted company UUID comes from the current membership.
SELECT set_config('app.company_id', :company_id, true);
SELECT id FROM companies WHERE id = :company_id FOR UPDATE;
-- Revalidate current actor/version under a shared account lock via the
-- same database transaction with narrowly granted identity functions.
-- Then load invoice, counter and sorted balances as required.
COMMIT;
```

Use a narrow SECURITY DEFINER identity function owned by a non-login identity owner, fixed search_path, no dynamic SQL, revoked PUBLIC execute, returning only active membership/version authorization data and taking the account row lock. Grant the business runtime only execute on this function; never identity table write access. Identity mutations use their own connection and lock company then account in that order. Companies coordination rows live in a shared coordination schema with only required row access; policies limit company runtime to its own row. Provisioning uses the control-plane role. Review migration grants and ensure no function permits arbitrary company selection; bind the function's account to validated session identity. All business mutations use company serialization initially: simpler correctness at expected scale, measured contention may justify finer locking later. Ordinary reads use a transaction-local company setting and active-session check, without company write lock.

The company transaction wrapper owns commit/rollback; services must not nest independent transactions. After failure Doctrine's EntityManager may be closed; retry only with a new manager. Retry at most3 attempts for SQLSTATE40001/40P01, delays randomized 25–100ms then50–200ms. Never rerun external mail/HTTP inside a retry.

## Protected customer operation and Vue consumer

Files: `Customers/Http/CreateCustomerController.php`, `Customers/Http/CreateCustomerRequest.php`, `Customers/Application/CreateCustomer.php`, `Customers/Domain/Customer.php`, `Customers/Domain/CustomerRepository.php`, `Customers/Infrastructure/DoctrineCustomerRepository.php`, `Customers/Http/CustomerResponse.php`, `Customers/Http/CustomerVoter.php`. Repositories implement Domain ports; Application returns a result, Http builds response.

1. Route POST `/api/v1/customers`, JSON-only, validate CSRF and session. Reject unknown fields through Serializer context, not merely a documentation claim. Bound name to 200 Unicode characters, address to2000, optional email to254; these are delegated engineering bounds and must be in schema. Company is not an accepted field.
2. Request constructor requires name; Symfony NotBlank/Length and Email constraints; no entity input binding. Configure `#[MapRequestPayload(acceptFormat: 'json', serializationContext: ['allow_extra_attributes' => false])]` and route format `json`. Subscriber normalizes extra/missing fields, invalid types and constraint violations; explicitly test framework behavior rather than assuming all become422.
3. Application opens scoped transaction, rechecks actor and authorizes CREATE. Save through scoped repository; audit safe identifiers. Return201 with DTO and Location. Invalid input422; stale session401; unavailable DB503 without stack trace.
4. For GET/PATCH `/customers/{id}`, query `company_id + id` before voter; absent/foreign404. Staff and admin permitted. PATCH requires expectedVersion; stale409. Archive instead of deleting references.
5. Nelmio describes request, success DTO and Problem responses; regenerate both contract files. Add conformance tests using league/openapi-psr7-validator with PSR7 response conversion; schema validates actual Symfony responses, not separately constructed examples.
6. `frontend/src/features/customers/{CustomerForm.vue,queries.ts,CustomerForm.spec.ts}` uses typed `src/api/client.ts` wrapper, session CSRF and VueQuery. Use query keys `['company', companyId, 'customers', filters]`. Show progress/error summary, connect422 field messages, focus first invalid field; retry:false. Invalidate company list on success. Clear/abort on401 and route to sign-in.

Tests: staff/admin success, platform403, unauth401, missing/wrong CSRF403, malformed400, wrongmedia415, unknown/type/missing/length422, other tenant404, stale409, safe503, schema conformance, rendered loading/error/empty/form errors, logout clearing. Review response contains no internal membership or password data.

## Issue, void and replace invoice

Files: `Invoices/Application/{IssueInvoice,VoidInvoice}.php`, `Invoices/Domain/{Invoice,Money,InvoiceNumber}.php`, repositories/DTO/controllers/voters in matching layers; `Inventory/Application/StockLedger.php` port; `Invoices/Infrastructure/InvoiceCounterRepository.php`. UI `features/invoices/InvoiceDetail.vue` and mutations.

Draft creation/edit validates nonempty lines, customer and active products in same company, quantity integer1..2147483647 and exact nonnegative prices. Max1000 lines/request is a delegated resource bound. Decimal regex `^(0|[1-9][0-9]{0,15})(\.[0-9]{1,2})?$`; parse brick/math BigDecimal and explicitly check total against numeric18,2; never cast float. Consolidate duplicate products for stock quantities while retaining intended lines in immutable snapshot.

Issue transaction: scope → company row → actor current version → idempotency key lookup → invoice FOR UPDATE → counter FOR UPDATE → balance rows ORDER BY product_id FOR UPDATE. Require draft and expected version. Verify scoped references, sufficient aggregated stock and total bounds. Increment counter using locked row, assign `<prefix>-<number>` and freeze prefix; store snapshots, issue state/time/version, negative movements and reduced balances, audit, idempotency request hash/result. Commit all or none. Number unique `(company_id,number)`; counter creation during company provisioning eliminates missing-row races. Failed issue consumes neither number nor stock.

Void uses same locks and requires client admin. Check idempotency then issued state, lock affected balances sorted; add exact opposite movements linked to original movement IDs with unique reversal_of constraint. Check balance overflow before addition; conflict409 leaves invoice issued and stock unchanged for administrator resolution. Mark void reason, timestamp, actor and increment version. Repeat same key returns previous result; a different key on already void409. No delete or quantity/price edits on issued/void invoice. Replacement is a new draft optionally linked to original, then separately issued; void is not automatically reversible by deleting records.

Tests: issue twice concurrently one issue, two invoices competing for insufficient stock, same/different idempotency hashes, sequential unique numbers under concurrency, transaction rollback no partial movement/counter, void double return prevention, staff void403, tenant references404, totals/quantity overflow422, return overflow409, snapshots after master edit/archive, stale version409. Vue tests no optimistic decrement, no mutation retry, explicit conflict refresh. Use independent DB connections and synchronization barriers, not timing sleeps, for races.

## Opening stock and adjustments

Files: `Inventory/Application/AdjustStock.php`, `Inventory/Domain/StockMovement.php`, `Inventory/Http/AdjustmentRequest.php` and adapter. Staff/admin allowed. Require product, signed nonzero integer delta, reason1..500 chars, expected balance version and UUID operation key. Scope/company/actor locks, then look up the idempotency key/hash and return an existing same-hash result before checking the supplied version. A different hash for the key is409. Lock balance rows in sorted order; compare expected version and return409 if stale. On success increment balance version and persist the operation hash/result alongside the movement in the same transaction. Opening stock is the first movement with a unique opening marker per product; later adjustments use correction type. Compute result in wide integer arithmetic; result0..2147483647 or409. Append movement with actor/company/time/reason and update cached balance atomically. Never edit movements; correction is another entry. Invoice operations call the same ledger port within existing transaction. Tests cover negatives, overflow, stale version, duplicate request and reconciliation sum(movements)=balance.

## Company provisioning and first administrator

Files: `Companies/Application/ProvisionCompany.php`, `Companies/Http/ProvisionCompanyRequest.php`, `Identity/Application/CreateInvitation.php`, `Notifications/Application/EnqueueAccountMail.php`.

Platform actor only; validate unique normalized company prefix `[A-Z0-9]{2,12}` and normalized email. Platform identity accounts cannot also be client users. Global normalized email uniqueness enforces one person/one company; email reuse/transfer requires lead-approved future workflow, not silently moving membership. Company prefix and invoice counter live in the shared coordination schema, not the business schema. The control-plane role may insert the initial counter/prefix and update the prefix only while issued_count=0 through a narrowly granted function; business runtime may increment its scoped counter but cannot change prefix. Revoke direct prefix/counter updates from both roles and expose separate fixed-search_path SECURITY DEFINER functions with RLS-aware explicit company checks. Test forbidden prefix changes and platform denial of business tables. One control-plane transaction inserts company coordination row, prefix/counter initialized1, pending admin membership, hashed invitation and encrypted outbox intent plus audit/idempotency result. DB unique constraints settle duplicate prefix/email races; return409 without exposing unrelated account data to client actors. A company starts pending; first invitation acceptance activates it. A pending company may have zero active admins; an active company may not. Provisioning retry must not make a second company/invite. Bootstrap first Takewise admin through a reviewed one-time operator command with secrets from stdin, never fixtures/default passwords; require separate activation authorization.

## Invitations and password reset

Client invite: same company lock then actor check; client admin only. Never accept role platform from client DTO. Normalize email consistently; require uniqueness, role client_admin or client_staff. Store hash/expiry/state, encrypted mail enqueue in same transaction; repeated invitation revokes previous pending token, no two live tokens for same purpose/member. Invitation48h/reset30min; random32byte token with hash lookup; public responses avoid account enumeration.

GET links render frontend form without consuming token. POST acceptance/reset requires anonymous-session CSRF, operation UUID, token and password. Token is submitted in body, never log it; links use fragment so it is not sent in HTTP referrer/server URL, page clears fragment immediately into memory. Referrer-Policy:no-referrer. Determine company from hashed token lookup, then lock company → account → token; recheck purpose, token expiry and that membership is not disabled under lock, then check the operation key and canonical request hash: an existing matching result returns its safe prior response before rejecting a consumed token; for a completed invitation replay the now-active membership is permitted, and a different hash returns409. For a new key, require an unconsumed token and purpose-specific state (pending invitation membership in a pending or active company, or active reset membership). Store no password in the request hash input persisted for replay: use a keyed digest of the canonical request with a separate server key, so low-entropy passwords cannot be guessed from a database hash. Retain this identity idempotency result until token expiry; after expiry return generic422 even for replay. New invitation consumption accepts only pending membership; new reset consumption only active. Hash password, consume token, activate membership if invitation and activate company only for first-admin onboarding, increment auth_version/revoke sessions and audit in one transaction. No automatic login; user signs in afterward. Expired/used/invalid all generic422, throttled429; no token in response. Same operation key after consumption returns safe prior result; new key fails. Reset invalidates other active reset tokens. Tests: simultaneous consumption only one success, same-key replay after consumption before expiry returns prior result including newly active invitation membership, different-key consumed token422, same-key different password409, replay after expiry422, expired token, wrong purpose, disabled account, generic responses, CSRF, password bounds, queue rollback and session invalidation.

Login flow: anonymous session endpoint no-store → CSRF header on login → rate limits → constant-work account/password verification → active status → rotate session ID and token, retain created_at for8h absolute expiry. Use generic401. Tests assert old session ID no longer usable, login CSRF failure, expired idle/absolute session and secure production cookie flags.

## Role changes, disable and last-admin preservation

`Identity/Application/ChangeMembership.php` handles roles and status. Platform admin manages company accounts; client admin manages own company, staff denied. No client route can create platform actor. Resolve target scoped, transaction locks company coordination row first, then acting and target accounts in UUID order (shared policy for all identity operations); when actor==target lock once. Check actor still active/version correct. Count active client administrators while holding company lock. If operation would leave active company with zero admins,409; pending onboarding is the documented exception. Update role/status, increment target auth_version, delete/revoke sessions in same transaction, audit old/new safe role fields. When platform actor manages an account, authorize platform action separately; no business RLS bypass.

Business mutations serialize on company then account; therefore a mutation already holding locks can finish before revocation, but none authorized after revocation commits may use old version. This is the explicit guarantee; in-flight read responses cannot be recalled. Race tests: two administrators demoting each other, concurrent disable+issue, stale session after role change, platform business access denied, cross-company target404, last admin409 including self-disable. Avoid locking target before company or nested connections holding each other.

## Schema and RLS migration

`backend/migrations/Version*.php` uses migration owner, never runtime role. Create schema/table grants, indexes and composite keys before exposing endpoint. Example policy (company column UUID):

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
CREATE POLICY invoices_company ON invoices
USING (company_id = NULLIF(current_setting('app.company_id', true), '')::uuid)
WITH CHECK (company_id = NULLIF(current_setting('app.company_id', true), '')::uuid);
ALTER TABLE invoices ADD CONSTRAINT invoice_customer_company_fk
FOREIGN KEY (company_id, customer_id) REFERENCES customers(company_id, id);
```

Role provisioning is deployment-specific; migration asserts runtime role NOT superuser/owner/BYPASSRLS. Control-plane session tables have explicit grants, not this business policy. Verify missing scope returns no rows and denies insert; owncompany reads/writes; othercompany no rows/denied; pooled connection after commit/rollback has no residual scope; cross-company FK rejected. Run as actual runtime role, not migration owner. Test previous→next upgrade and application compatibility. Large index uses concurrent creation outside transaction with explicit failed-index recovery; do not pretend all migrations are transactional. No production down by default.

## Encrypted account-email worker and recovery

Files: `Notifications/Application/{EnqueueAccountMail,SendAccountMail}.php`, `Notifications/Infrastructure/EncryptedMailSerializer.php`, Messenger config and cleanup command. Outbox stores safe message ID/type, encrypted payload, nonce, key ID, expiry; never plaintext link. Doctrine transport must share exact transaction connection with identity write (test rollback); do not dispatch plaintext token through normal serialized command. Secretbox key32 random bytes, nonce24 new each encryption; compare decryption false before processing. Keep key out of DB and logs; rotate with decrypt-old/encrypt-new overlap and key ID mapping, remove old key only when queued/failed rows expired or rewritten.

Worker loads token metadata and account active status before decrypt/send; pending invitation is allowed for a pending member in a pending or active company, reset requires active account. Consumed/expired/revoked discards ciphertext. Delivery crash may produce duplicate mail; message uses same invitation/reset token so duplicate never extends authority. Configure max_retries3, delays1s/4s/16s plus jitter, failure transport. After success remove ciphertext; after token expiry cleanup both queue/failure ciphertext even if never retried. Operator inspects redacted failure IDs, corrects cause, retries only unexpired messages after validation. Do not bulk replay old reset links. Tests prove no plaintext token in transport/logs/failure row, rollback has no message, expiry at handling, badkey retry/failure, delivery acknowledgement cleanup and failed-message expiry cleanup.
