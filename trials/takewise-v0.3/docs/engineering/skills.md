# Installed skills and evaluation

Canonical skills live in `.claude/skills`; direct links work from any tool reading AGENTS.md. Claude imports AGENTS.md through CLAUDE.md. Cursor supports AGENTS.md and the local skill directory according to [Cursor skills](https://cursor.com/docs/skills.md); [Claude memory](https://code.claude.com/docs/en/memory) documents imports. Native editor execution is not yet tested here; direct-file portability is checked. No global skill installation or duplicate copies.

## Task routing and provenance

- [vue](../../.claude/skills/vue/SKILL.md): Vue components and reactivity. Source: https://github.com/antfu/skills; revision `e98e476e315f068f72d53bd3afb34fdd4d5851c3`; license MIT.

- [vue-testing-best-practices](../../.claude/skills/vue-testing-best-practices/SKILL.md): Vue component and browser tests. Source: https://github.com/vuejs-ai/skills; revision `c9d355ff23f654309dd02006be671859df0a134c`; license MIT.

- [symfony-voters](../../.claude/skills/symfony-voters/SKILL.md): Symfony authorization. Source: https://github.com/dev-toolings/superpowers-symfony; revision `ab84bcb7561060acd5b210d9ad5632289edcc0cc`; license MIT.

- [supabase-postgres-best-practices](../../.claude/skills/supabase-postgres-best-practices/SKILL.md): PostgreSQL queries, schema and locking. Source: https://github.com/supabase/agent-skills; revision `551274ed2fe97c8fea1325f7ceb05803a542f8df`; license MIT.

- [takewise-backend](../../.claude/skills/takewise-backend/SKILL.md): Symfony endpoints, DTOs, application services and backend tests. Source: project-authored; revision `project-authored`; license Proprietary.

- [takewise-frontend](../../.claude/skills/takewise-frontend/SKILL.md): Vue screens, forms, server state and accessibility. Source: project-authored; revision `project-authored`; license Proprietary.

- [takewise-security](../../.claude/skills/takewise-security/SKILL.md): Authentication, tenant authorization, invitation/reset, role or session changes. Source: project-authored; revision `project-authored`; license Proprietary.

- [takewise-data](../../.claude/skills/takewise-data/SKILL.md): Schema, PostgreSQL queries, invoice lifecycle and inventory transactions. Source: project-authored; revision `project-authored`; license Proprietary.

- [takewise-delivery](../../.claude/skills/takewise-delivery/SKILL.md): CI, dependency updates, email queues, release and recovery. Source: project-authored; revision `project-authored`; license Proprietary.

## Mandatory project overrides

Upstream files remain preserved with their licenses. These local rules take priority:

- Vue preferences are advisory where project rules specify otherwise. Do not add Pinia just because a test example uses it.
- Vue testing examples include older Vitest browser and MSW configuration; use the installed major's current docs. Vue `onErrorCaptured` suppresses propagation by returning **false**, not true. The upstream error-handling example is not authoritative. Test actual user behavior, deterministic waits and cleanup; no snapshot-only verification.
- Symfony voters: no ROLE_SUPER_ADMIN override, no automatic unscoped entity resolver; load subject through scoped repository before voter. Its optional tiers do not remove these boundaries.
- PostgreSQL skill does not select Supabase. Replace auth.uid examples with the documented server membership context; use transaction-local scope, never session SET. RLS owner bypass must be addressed. Performance multipliers require measurement. A single SQL UPDATE does not guarantee deadlock freedom; preserve fixed locking.
- Project-authored skills are proprietary and based on the primary sources in research; they provide the PHP testing, security, accessibility and delivery workflows missing from suitable upstream candidates.

## Search and candidate review record

Discovery used official vendor repositories first, then community repositories. Searches included Vue skills TypeScript testing, Symfony skills voters Doctrine transactions PHPUnit, PostgreSQL agent skills RLS, authentication/session skills, accessibility Vue, and GitHub Actions security/actionlint skills. Titles were followed by source-file inspection, not treated as adoption evidence.

| Candidate / inspected revision                                                             | Result and reason                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| antfu/skills vue e98e476e315f068f72d53bd3afb34fdd4d5851c3, MIT                             | Adopted SKILL, generation metadata and all references. Fits Vue3.5 script setup.                                                                                                                                                     |
| vuejs-ai/skills vue-testing-best-practices c9d355ff23f654309dd02006be671859df0a134c, MIT   | Adopted SKILL and eleven references, with explicit outdated-example overrides above.                                                                                                                                                 |
| dev-toolings/superpowers-symfony voters ab84bcb7561060acd5b210d9ad5632289edcc0cc, MIT      | Adopted SKILL/reference/complexity tiers; authorization fit with mandatory tenant overrides.                                                                                                                                         |
| supabase/agent-skills PostgreSQL 551274ed2fe97c8fea1325f7ceb05803a542f8df, MIT             | Adopted SKILL and complete reference set; useful official vendor database guidance independent of Supabase hosting.                                                                                                                  |
| symfony/symfony security-review 172e4ad1a5fb88cce1494b3dd4f73b22637f0ac0, MIT              | Inspected .agents skill; Symfony-core SA tooling and CVE conventions do not fit an ERP repository. Project security skill covers application workflow.                                                                               |
| Yoanbernabeu/symfony-yoandev-skills 41e405edf7857c5bc0ed338d3bce8dd5e96c1d45, MIT          | Architecture/http examples prescribe anemic entities and Symfony8.1 serialization/API Platform choices conflicting with approved7.4 explicit services/contracts.                                                                     |
| dev-toolings same revision, transactions/migrations/PHPUnit                                | Not installed: failed EntityManager reconnect/flush advice, removed clear(User::class) behavior, migrations bundle/library major confusion; PHPUnit examples target10/11 while new toolchain13. Use project recipe and current docs. |
| antfu vitest at same revision                                                              | Overlaps selected Vue testing skill; generated beta examples need current-version verification. Not rejected on a false major-version claim.                                                                                         |
| wshobson/agents 4236bb91f8395b0435f1d8b8baf9e8e4c69a8620, MIT                              | Auth examples emphasize Express JWT without our CSRF/rotation boundaries; accessibility references target React; Actions templates include mutable tags and unrelated cloud delivery. Project skills are more directly applicable.   |
| actions/actions-migrations-via-copilot actionlint 0aa0126ae7a8eea77f75ab0ecced1ce65ddffc24 | Repository license restricts adaptation; skill assumes global sudo Linux installer and unavailable tooling. Do not copy. Independent MIT actionlint executable remains appropriate.                                                  |

No credible complete PHP application-security/testing skill was silently substituted after approval. Reassess pins and upstream examples through an ordinary reviewed PR when framework versions change.
