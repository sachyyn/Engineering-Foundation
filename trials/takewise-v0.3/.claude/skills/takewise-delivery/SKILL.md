---
name: takewise-delivery
description: "Use for ci, dependency updates, email queues, release and recovery."
---

# takewise-delivery

Read [rules](../../../docs/engineering/rules.md) (JOB-1, QA-1 and DEL-1) and [patterns](../../../docs/engineering/patterns.md) (section: Encrypted account-email worker and recovery). These files are authoritative. [Research](../../../docs/engineering/research.md) records rationale and sources.

1. Read delivery and enforcement guides; distinguish local checks from remote activation.
2. Keep foundation checks green and automatic app detection intact; never replace missing tests with success.
3. Review dependencies, locks, licenses, pinned action revisions and untrusted PR boundaries.
4. For queues verify rollback, ciphertext lifecycle and bounded retries; for release require named destination, identities and restore evidence before activation.

Do not weaken a rule to resolve a tool failure. Explain the conflicting requirement to the tech lead. All tests mentioned here require actual executed assertions; file existence is not evidence.
