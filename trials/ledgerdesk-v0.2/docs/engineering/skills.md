# Persistent skill evaluation and routing

Read each task's actual SKILL.md, not only this index. All five files are original
project-authored instructions, source/revision `project-authored`, approved by the
simulated tech lead on 2026-09-25. Project licensing remains undecided; no public reuse
license is asserted. No third-party skill text/scripts have been copied.

| Task                                                                                   | Local skill                                                          |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| PHP/Symfony operation, DTO, contract, errors, transaction                              | [ledgerdesk-backend](skills/ledgerdesk-backend/SKILL.md)             |
| Login/reset, account management (P7), roles, tenant isolation, money, schema/migration | [ledgerdesk-security-data](skills/ledgerdesk-security-data/SKILL.md) |
| Vue/TypeScript, API consumer, forms, keyboard interaction                              | [ledgerdesk-frontend](skills/ledgerdesk-frontend/SKILL.md)           |
| Behavior/denial/contract/DB/concurrency/browser tests                                  | [ledgerdesk-testing](skills/ledgerdesk-testing/SKILL.md)             |
| Tooling, CI, dependency changes, release/recovery, policy                              | [ledgerdesk-delivery](skills/ledgerdesk-delivery/SKILL.md)           |

## Searches and inspected candidates

Exa searches on 2026-09-25: `agent skills SKILL.md Vue Symfony PostgreSQL security testing
github actions skills.sh`; `site:skills.sh Symfony api design PostgreSQL security
accessibility testing skills`; and `site:skills.sh PostgreSQL row level security
accessibility agent skill`. Searches covered framework/language, architecture/contracts,
security/data, accessibility, testing and delivery disciplines. Registry pages identified
upstreams; actual skill contents, not popularity, drove rejection. No existing local skills
were present. Primary framework sources are in [research](research.md).

| Candidate                                                                                                                        | Actual inspected material and fit                                                                                                             | Decision / limitations                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 [antfu Vue](https://github.com/antfu/skills/blob/main/skills/vue/SKILL.md)                                                    | Full entry and `references/core-new-apis.md` excerpt via raw upstream; Vue 3.5 Composition API/TS and reactivity guidance, metadata 2026.1.31 | Useful but includes personal preferences (e.g. props destructuring), lacks ERP fetching/accessibility contracts. Author focused Vue workflow; no vendoring. Upstream license/revision not fully audited because rejected. |
| C2 [Symfony security](https://github.com/yoanbernabeu/symfony-yoandev-skills/blob/main/skills/symfony-yoandev-security/SKILL.md) | Registry excerpt then first 9,000 characters of raw entry: firewall/provider/authenticator wiring, roles/voters, cross-version guidance       | Strong wiring cautions; object auto-resolution and broader token/newer-version directions need tenant-first specialization. Not fully inspected/adopted; license/immutable revision not established.                      |
| C3 [Symfony testing](https://github.com/yoanbernabeu/symfony-yoandev-skills/blob/main/skills/symfony-yoandev-testing/SKILL.md)   | Registry then first 9,000 characters of entry: PHPUnit levels, DAMA isolation, mandatory red-first/mutation workflow, cross-skill references  | Isolation caveat informs ours; blanket test-wide transaction unsuitable for our RLS/context/concurrency proofs. Referenced database-tests file not inspected, so not installation-ready. Project testing skill instead.   |
| C4 [Oakoss database-security](https://github.com/oakoss/agent-skills/blob/main/skills/database-security/SKILL.md)                | First 6,500 characters then focused reread of 5,000; declares MIT, audit workflow/RLS, Supabase/Convex assumptions                            | Provider-specific auth functions and broad compliance assertions unsuitable. No adoption; license declaration observed, not a complete dependency/license audit. Data skill uses PostgreSQL primary docs.                 |
| C5 [SkillCodex accessibility](https://github.com/bh611627/skillcodex/blob/main/skills/accessibility-audit/SKILL.md)              | Full entry: React/Next/TSX scope, keyboard/ARIA checklist, links to safety/design references                                                  | Framework mismatch; referenced files not needed to reject explicit scope. No code execution instructions adopted. License not established. Vue/WCAG workflow authored from Vue and Playwright docs.                       |
| C6 [SkillCodex API](https://github.com/bh611627/skillcodex/blob/main/skills/api-handbook/SKILL.md)                               | Full entry: Next Route Handlers, Zod, Server Actions, errors/idempotency                                                                      | Explicitly excludes PHP; cannot supply Symfony contract guidance. No adoption/license claim. Backend skill covers boundary.                                                                                               |
| C7 [Claude Flow CI](https://github.com/ruvnet/claude-flow/blob/main/.agents/skills/agent-ops-cicd-github/SKILL.md)               | Full raw entry: special hooks/tool names/agent roles, Node 18 example, action tags, weak YAML check                                           | Reject tool-specific assumptions and obsolete runtime example; no commands executed. Delivery skill uses GitHub primary docs. License/revision not established.                                                           |

Other search results (e.g. API Platform skills and PostgreSQL RLS pattern summaries)
were discovery leads only, not fully reviewed candidates. The attempted Alexanderop
harden-github-actions raw path returned CRAWL_NOT_FOUND; no adoption or evidence claim.
All external text was treated as untrusted; no installer, hook, network-upload command,
or global configuration from a candidate was executed. Partial inspections are stated
because rejected candidates do not merit a false complete license/security review.

## Portability and discovery

The approved alternate location is `docs/engineering/skills/`: `.agents` and `.codex`
are read-only in this trial. Root AGENTS.md links here and this index links every skill;
skills use only relative links into this repository. There are no symlink/global/session
dependencies. Check routes with `npm run check:foundation` and the supplied validator.
Clean-copy trials verify files and links only. Native Codex discovery at this alternate
path and other coding tools' automatic instruction loading are not verified. An ordinary
tool can open AGENTS.md and these exact files directly. Do not promise universal compliance.

## Maintenance

Keep skills narrow, actionable, and synchronized with rules/recipes. Explicitly reassess
when approved architecture changes; do not install a scheduled caretaker. Reusing upstream
text later requires complete content/reference review, immutable revision, license/notices,
tool safety and conflict review before copying. Current project-authored skills need no
external executable helpers and take their checks from the repository's common command.
