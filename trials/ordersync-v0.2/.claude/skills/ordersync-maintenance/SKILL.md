---
name: ordersync-maintenance
description: Maintain ordersync dependencies, checks, GitHub CI, engineering guidance, release preparation, or ops runbooks. Does not authorize deployment, Git mutations, or production access.
---

# Maintenance workflow

Read [rules](../../../docs/engineering/rules.md) CHECK-01, RELEASE-01, MAINT-01,
[enforcement](../../../docs/engineering/enforcement.md), and
[research](../../../docs/engineering/research.md). Use the delivery skill for
replay/recovery changes and the [patterns](../../../docs/engineering/patterns.md).

1. Inspect local instructions, working-tree edits, tool configuration, triggers,
   lockfile and callers of any changed check. Keep the OS Python 3.12/uv workflow.
2. Evaluate dependency support, license, advisories and actual need; update exact
   tool pins and lock together. Do not add an SDK for an unimplemented destination.
3. Preserve one fail-closed local/CI command and all source/test discovery. Policy
   changes require maintainer review; never mask a baseline with broad exclusions.
4. For CI, use read-only permissions, immutable verified action revisions, hosted
   runners, no production credentials or privileged PR context. Update activation
   instructions if the required job name or triggers change.
5. Verify `bash scripts/check.sh`, offline wheel packaging if affected, and deliberate
   representative violations in a disposable copy inside the repository. Recheck
   new-file coverage and broken guidance links after policy changes.
6. Report exact versus proxy evidence. Remote merge blocking, native agent loading,
   S3 permissions and production deployment need their own evidence. Do not run
   foundation setup automatically or create a caretaker schedule.

Original project-authored internal guidance, revision 1; no public license grant.
