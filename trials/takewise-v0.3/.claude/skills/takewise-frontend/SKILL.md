---
name: takewise-frontend
description: "Use for vue screens, forms, server state and accessibility."
---

# takewise-frontend

Read [rules](../../../docs/engineering/rules.md) (ARCH-2, UI-1..2 and API-1..2) and [patterns](../../../docs/engineering/patterns.md) (section: Protected customer operation and Vue consumer). These files are authoritative. [Research](../../../docs/engineering/research.md) records rationale and sources.

1. Load vue and vue-testing-best-practices after the project rules.
2. Use the generated client and company/account query keys; model loading, empty, error and forbidden states.
3. Keep form values local, mutation retry disabled, server errors field-linked and focus managed.
4. Test expired-session cleanup, keyboard behavior and real browser paths; run types, lint, build, Vitest and Playwright.

Do not weaken a rule to resolve a tool failure. Explain the conflicting requirement to the tech lead. All tests mentioned here require actual executed assertions; file existence is not evidence.
