---
name: ordersync-data
description: Change ordersync CSV parsing, Decimal calculations, data contracts, or their Python tests. Use before editing these paths; excludes live data and delivery operations.
---

# Data workflow

Read [rules](../../../docs/engineering/rules.md) ARCH-01/02, CONTRACT-01,
MONEY-01, DATA-01 and TEST-01, then the CSV recipe in
[patterns](../../../docs/engineering/patterns.md). See
[research](../../../docs/engineering/research.md) for precision/contract evidence.

1. Inspect callers and existing tests before changing `Order` or serialization.
   Classify the work as compatible parsing, new validation, or contract change.
2. Keep parsing in `parse.py`, new pure arithmetic in `money/`; preserve the
   synchronous flow and existing runtime dependencies. Add import contracts for
   new modules. Never put HTTP/configuration in monetary code.
3. Trace original bytes → validated rows → Decimal values → string total. Reject
   nonfinite values and precision loss. Never silently skip bad rows or round.
   Follow the additive interface recipe: retain `read_orders(path)` as a wrapper
   over `read_snapshot(path)` and `read_orders_bytes(snapshot)`. Future run code
   reads once and shares that snapshot for hash, parsing and archive; preserve the
   existing CLI path caller and parser test until their authorized feature migration.
4. Add focused tests with synthetic tmp_path CSV for relevant valid/invalid cases,
   including empty sums and negative amounts. Prove invalid input cannot trigger
   finance, and check the failed-run archive recipe when editing orchestration.
5. Run `bash scripts/check.sh`. Review amount paths outside the syntax guard and
   inspect the diff for preserved unrelated edits. Record existing debt separately;
   do not turn foundation/policy work into a product repair.

Original project-authored internal guidance, revision 2; no public license grant.
