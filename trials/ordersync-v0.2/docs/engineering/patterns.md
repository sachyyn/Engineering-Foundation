# Worked changes

These are future implementation recipes, not implemented features. Read
[rules](rules.md) and the routed [skill](skills.md) before applying a recipe.
All recipes finish with `bash scripts/check.sh`. Extend the import contracts when
adding the named modules. Do not copy current missing HTTP error handling.

## CSV or monetary change

Extend `parse.py` and `tests/test_parse.py`; put new pure arithmetic in
`src/ordersync/money/` with corresponding tests. Keep `Order` compatible, preserve
original bytes for hashing/archive, validate every row before returning any result.
Read a completed immutable snapshot once (with the 10 MiB cap) and use those same
bytes for SHA-256, CSV decoding/parsing and archival; do not reopen a mutable path
between those steps. Require the source producer's completed-file handoff.
On malformed headers/rows, invalid encoding, nonfinite amount, duplicate ID, or
size/row-limit breach: fail finance delivery; archive the failed run as described
below when its original bytes are available within the size cap.
Report row number and safe error code, not customer/row content. File-not-found and
permission errors become safe CLI failures when error translation is implemented.

This requires a future interface extraction in `parse.py`; the existing public
`read_orders(path: Path) -> list[Order]` cannot be used unchanged by snapshot-based
orchestration. Preserve its signature and import location as a compatibility
wrapper. Add `read_snapshot(path: Path) -> bytes`, which opens once in binary mode,
reads at most the 10 MiB cap plus one sentinel byte and rejects overflow, and
`read_orders_bytes(snapshot: bytes) -> list[Order]`, which decodes UTF-8 and uses
`csv.DictReader(io.StringIO(text, newline=""))` with DATA-01 validation. The bytes
parser must perform no filesystem reads and preserve the existing `Order` shape.

Illustrative future call seams (documentation only):

```python
# parse.py: preserve existing public path callers.
def read_orders(path: Path) -> list[Order]:
    return read_orders_bytes(read_snapshot(path))

# run.py: acquire once; do not also call read_orders(path).
snapshot = read_snapshot(path)
file_hash = hashlib.sha256(snapshot).hexdigest()
orders = read_orders_bytes(snapshot)
# archive.py later receives snapshot itself, not path or reconstructed CSV.
```

The existing `cli.py` call `read_orders(Path(sys.argv[1]))` and
`tests/test_parse.py::test_reads_decimal_totals` keep working unchanged via the
wrapper. When the multi-destination feature is authorized, update CLI composition
to call `run.py`; it owns snapshot reuse. Retain the original path-based test and
add bytes/path parity, UTF-8/CRLF, cap-boundary and decode-failure tests. Add a
run-level test that changes the source file after snapshot acquisition and proves
the parsed values, hash and archived bytes still match the original snapshot,
with only one file open. These source/caller/test changes are future product work;
this correction changes guidance only.

Illustrative arithmetic (standard-library Decimal, no conversion through float):

```python
from decimal import Decimal, Inexact, Rounded, localcontext

with localcontext() as context:
    context.prec = 28
    context.traps[Inexact] = True
    context.traps[Rounded] = True
    total = sum((order.total for order in orders), Decimal("0"))
payload = {"count": len(orders), "total": str(total)}
```

Before this snippet, reject nonfinite inputs using `amount.is_finite()`. Translate
precision trap failures into a rejected export; never retry with wider precision
or round silently. Test empty input produces Decimal zero, signed values survive,
`0.1 + 0.2` is exact, and extreme precision/nonfinite/malformed cases never invoke
finance. Currency aggregation remains an upstream contract;
multi-currency work needs finance agreement first.

## Add safe finance retries

Extend `push.py`, introduce `run.py`/`state.py` only with product authorization, and
add `tests/test_push.py`, `test_run.py`, `test_state.py`. Keep CLI composition in
`cli.py`. `push.py` receives client, immutable payload/key, and retry timing inputs;
it returns a typed result or safe boundary error from future `contracts.py`, never
prints or accesses CSV. Put shared enums/dataclasses/errors in that pure module,
not in `run.py`, so adapters never import their coordinator.

1. Acquire RUN-03 lock. Resolve source/date to persisted run ID. Read and hash the
   input. Reject changed bytes for an existing identity. Missing history for an
   already processed date goes to reconciliation, never fresh-key generation.
   For a new allocation set `run_id = str(uuid.uuid4())` and
   `finance_key = run_id`; persist both together. On resume load both and reject
   unequal values as corrupt state. Never regenerate either value.
2. Parse/validate all data. Save payload, key and run metadata durably before send.
   Before first request write `first_attempt_at` and `in_flight`; reuse these after
   restart. On startup treat abandoned `in_flight` as `unknown`.
3. Check age under 6d23h and run deadline. Send with key, fixed payload, explicit
   timeouts, no redirect, no nested retry. Retry only HTTP-01 cases, at most three
   attempts within 60s; cap sleeps and each remaining phase to time left.
4. Persist confirmed 2xx or safe failed/unknown outcome. A read timeout could mean
   finance accepted it: reuse the same key, never mark it definitively unsent.
5. If age expired or timestamps inconsistent, stop and ask ops to reconcile with
   finance. Corrected data requires an explicitly approved finance correction
   operation, not automatic new-key retry.

The local ledger is a single versioned JSON document containing source high-water
dates and per-source/date run records. Update run allocation and high-water date
atomically in the same durable replacement; never use two separately updated
files. Ops bootstraps from reconciled finance history. A missing ledger or a date
at/before the high-water mark without a retained record stops delivery. Expiring
old run details after 13 months leaves the minimal high-water date intact.

Enforce the adapter's absolute 60-second deadline using the main-thread signal
timer in RUN-04, within the five-minute run deadline. Fake the timer/clock in unit
tests; separately test that continuous response activity cannot defeat the elapsed
deadline. Convert boundary failures to ERROR-01 codes and exits. After a timer
interrupts a possible send, persist unknown if storage works; otherwise the
previous durable in_flight remains unknown on restart.

Illustrative request, inside the above journal/retry envelope:

```python
response = client.post(
    endpoint,
    content=payload_bytes,
    headers={"Content-Type": "application/json", "Idempotency-Key": finance_key},
    timeout=httpx.Timeout(5.0),
    follow_redirects=False,
)
response.raise_for_status()
```

Persist `payload_bytes` once using deterministic serialization; do not rebuild it
with a fresh timestamp on retry. Never log `response.text` or `str(exception)`.
Here `finance_key` is the persisted value equal to `run_id`, not a new local UUID.
Test that initial send, retries and restart all send the persisted run ID as the
header; a persisted key/ID mismatch must produce no request.
Tests with MockTransport assert body/key equality across 500→200 and timeout→200,
no retries for 401/403, attempt/deadline ceilings, Retry-After handling, and no
request at the replay cutoff. Fake clocks and sleepers avoid real delays. Crash
tests cover before request, remote acceptance before local confirmation, and
corrupt/missing journal; prove confirmed finance is never resent unnecessarily.

## Add S3 as a required second destination

Add `archive.py`, extend `run.py` and journal schema, add `test_archive.py` and
partial-delivery cases in `test_run.py`. Use an injected SDK client; selecting and
pinning boto3 is product work, not part of this foundation's dependencies.

Flow: lock → identity/hash → validation → local journal → archive original CSV →
create S3 run record → finance send → update run record → write status. Archive
failure before finance stops finance. After confirmed finance, failed record/status
persistence causes operational failure and reconciliation, never finance replay.
Local journal is authoritative for in-progress work; S3 is retained evidence and
recovery input, not a distributed transaction coordinator.

Failed runs also need archive evidence. If bounded original bytes are readable but
validation fails, skip finance, conditionally archive those exact bytes, and write
failed run/status records with `input_invalid`; counts/totals are null when not
validly computable. Do not partially sum valid rows. If the file is missing,
unreadable, or exceeds the cap, write a failed record/status where possible,
explicitly state the original was not archived, and alert ops to reconcile the
incomplete archive. Never fabricate a file/hash or report full success. If S3 is
unavailable, preserve the failed state locally for ops recovery using the same run
identity. Add tests for malformed-but-archivable CSV, missing original, over-limit
input, and archive permission denial during failed-run recording. A late failure
must not erase an earlier finance outcome.

Use the S3-01 key layout. First upload supplies `IfNoneMatch="*"` and the base64
SHA-256 checksum of original bytes. On 412, read metadata/checksum with authorized
access; accept only verified identical content. Missing read permission is failure,
not evidence that the object matches. On 409/concurrent writes or ambiguous timeout,
reconcile before another conditional attempt; all attempts remain within budget.
Initial `run.json` uses conditional create, updates use the last observed ETag:

```python
# Illustrative API shape, verify against the pinned SDK during feature work.
client.put_object(
    Bucket=bucket, Key=run_record_key, Body=record_bytes,
    ContentType="application/json", IfMatch=previous_etag,
)
```

Run-record schema v1 includes `schema_version`, `run_id`, `source_id`,
`business_date`, `file_sha256` (nullable if original unavailable), `count` (nullable
if validation failed), `total` (decimal string or null for invalid input), `created_at`,
`updated_at`, `first_attempt_at` (nullable), `finance_key`, and
`destinations.finance`/`destinations.archive` objects with state, attempt count,
and safe error code. `finance_key` must equal `run_id` in this record too; validate
that invariant on recovery. Unknown future schema versions fail closed on recovery.
Readers may ignore added optional fields; required-field changes need migration
and old-record compatibility tests. S3 record confirms archive CSV outcome; the
successful write response confirms record persistence outside its own JSON.

Status stays adjacent but ops-only. Activation review must test finance can read
`export.csv` and `run.json` but is denied `status.json`, outsiders are denied all,
and runtime cannot delete/administer the bucket. Unit tests exercise 403, checksum
mismatch, 412 matching/mismatching content, 409, timeout, failed final record write,
and rerun after confirmed finance. AWS policy behavior requires a separately
authorized integration trial; mock tests do not prove IAM enforcement.

## Add status projection

Add `status.py`, `test_status.py`; call it from `run.py` after durable state changes.
It receives a validated run record and produces a versioned JSON object; `archive.py`
owns its S3 write, so status has no SDK dependency. Use conditional writes to avoid
stale overwrite: `If-None-Match: *` for first create, last ETag `If-Match` for update.
Include run ID, created/updated UTC times, per-destination states,
overall state (`running`, `succeeded`, `failed`, `needs_reconciliation`), safe code.
Omit totals/customer data because ops only needs delivery state here. A failed
status write produces a nonzero operational result and safe local error; recovery
reads the journal/run record. Never derive a resend decision from status alone.

Test failed and mixed outcomes, unknown state after crash, stale version conflict,
redaction of synthetic secret/customer sentinels, 403, and serialization failure.
The report is an object/file, not a public endpoint; no auth framework/UI is added.

## Operations, packaging and rollback

Use [enforcement/runbook](enforcement.md) for authorized offline packaging and ops
activation. Future state writer uses a same-directory temporary file, mode 0600,
file fsync, atomic replace, directory fsync while holding the run lock. Test with
an injected failing writer at each phase: previous state must remain recoverable,
or the run must stop as unknown; never silently initialize a replacement journal.
All manual replay follows RUN-01/02. Restoring old code leaves journals intact and
must not restore an older journal over newer finance outcomes. When history is
unavailable, finance reconciliation is required regardless of the input filename.
