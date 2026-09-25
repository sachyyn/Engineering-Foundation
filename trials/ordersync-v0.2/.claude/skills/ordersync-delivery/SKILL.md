---
name: ordersync-delivery
description: Change ordersync webhook retries, S3 archive, run state, status, security, or recovery tests. Use before delivery work; never authorizes contacting live services.
---

# Delivery workflow

Read [rules](../../../docs/engineering/rules.md) RUN-01 through STATUS-01 and
TEST-01, and the relevant retry/archive/status recipe in
[patterns](../../../docs/engineering/patterns.md). Read `ordersync-data` as well
when modifying the payload. Evidence is in [research](../../../docs/engineering/research.md).

1. Trace logical source/date identity, file hash, persisted key/payload and earliest
   attempt time before choosing retry behavior. Finance deduplication lasts 7 days;
   automatic replay stops at 6d23h. Changed payload/history gaps require reconciliation.
   Allocate one canonical UUID4 string: `finance_key == run_id`, persisted together
   and sent unchanged as `Idempotency-Key`. A stored mismatch blocks delivery; do
   not repair it or mint a new key on retry/recovery.
2. Keep HTTP in `push.py`, S3 in `archive.py`, local journal in `state.py`, sequencing
   in `run.py`, projection in `status.py`. Add modules only for authorized features.
3. Enumerate crash points before and after each external effect and journal write.
   Hold the single-host lock throughout. Never convert unknown into unsent or resend
   confirmed finance merely because another destination failed.
4. Define bounded request/retry budgets, explicit status checks, safe error codes,
   and conditional S3 writes. Preserve original bytes; ETag is not content hash.
   Use one `read_snapshot(path)` result for hash, `read_orders_bytes(snapshot)` and
   archive; do not call the compatibility `read_orders(path)` wrapper afterwards.
5. Test with MockTransport/fake SDK, injected clocks/sleep and tmp_path journals:
   ambiguous acceptance, expiry, 4xx/5xx, interrupted writes, partial delivery,
   collision, checksum mismatch, and denied access as applicable.
6. Check finance/ops archive versus ops-only status access, 13-month retention and
   redaction. Mocks do not prove IAM; record external activation tests.
7. Run `bash scripts/check.sh` and give reviewers the state-transition/test evidence.
   Never read credentials, use production CSV, or run the posting CLI to verify.

Original project-authored internal guidance, revision 2; no public license grant.
