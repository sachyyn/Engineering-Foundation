---
name: takewise-data
description: "Use for schema, postgresql queries, invoice lifecycle and inventory transactions."
---

# takewise-data

Read [rules](../../../docs/engineering/rules.md) (DATA-1..5) and [patterns](../../../docs/engineering/patterns.md) (section: Issue, void and replace invoice). These files are authoritative. [Research](../../../docs/engineering/research.md) records rationale and sources.

1. Load PostgreSQL skill as database guidance only; no Supabase services or auth.uid assumptions.
2. Specify transaction boundaries, fixed lock order, unique/composite constraints and exact money bounds.
3. Add real-PG concurrent issue/void/adjustment tests using independent connections and barriers.
4. Test empty and upgrade migrations as restricted runtime role; review query plans and recovery before destructive changes.

Do not weaken a rule to resolve a tool failure. Explain the conflicting requirement to the tech lead. All tests mentioned here require actual executed assertions; file existence is not evidence.
