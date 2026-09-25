---
name: takewise-backend
description: "Use for symfony endpoints, dtos, application services and backend tests."
---

# takewise-backend

Read [rules](../../../docs/engineering/rules.md) (ARCH-1, LANG-1, API-1..3 and QA-1) and [patterns](../../../docs/engineering/patterns.md) (section: Protected customer operation and Vue consumer). These files are authoritative. [Research](../../../docs/engineering/research.md) records rationale and sources.

1. Identify module and action; define request/response/error schemas before controller code.
2. Keep transaction and permission decisions in Application, invariants in Domain and SQL in Infrastructure.
3. Add real response conformance and denial tests, then regenerate OpenAPI/client types.
4. Run PHPUnit unit/integration, PHPStan, Deptrac and full root check; report unavailable prerequisites.

Do not weaken a rule to resolve a tool failure. Explain the conflicting requirement to the tech lead. All tests mentioned here require actual executed assertions; file existence is not evidence.
