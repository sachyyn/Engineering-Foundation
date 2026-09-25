---
name: takewise-security
description: "Use for authentication, tenant authorization, invitation/reset, role or session changes."
---

# takewise-security

Read [rules](../../../docs/engineering/rules.md) (SEC-1..4 and DATA-1) and [patterns](../../../docs/engineering/patterns.md) (section: Role changes, disable and last-admin preservation). These files are authoritative. [Research](../../../docs/engineering/research.md) records rationale and sources.

1. Enumerate actor/company/action/state and denial cases before implementation.
2. Load symfony-voters but reject its superadmin bypass and unscoped subject examples.
3. Follow session/login CSRF, token and revocation recipes, including row locks and last-admin concurrency.
4. Test runtime-role RLS, cross-company404, same-company403, revocation races and redacted logs; request lead review.

Do not weaken a rule to resolve a tool failure. Explain the conflicting requirement to the tech lead. All tests mentioned here require actual executed assertions; file existence is not evidence.
