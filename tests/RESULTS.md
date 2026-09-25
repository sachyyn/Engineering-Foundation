# Trial results

Date: 2026-09-25. Package: engineering-foundation 0.3.0 (trials 1-3 ran on 0.2.0; 0.3.0 changed only the discussion and approval steps, tested in trial 4).

All trials used fresh Codex CLI sessions that had never seen this conversation, the failed Takewise output, or earlier results. I played the tech lead; every approval was **simulated** and labeled as such in the generated files. Raw transcripts are kept locally in `tests/evidence/`, which is gitignored and not published.

## Trial 1: new project (Ledgerdesk)

Brief: hosted multi-tenant ERP. Vue 3 + TypeScript and Symfony 7.4 fixed, PostgreSQL, email/password login and reset, tenant-scoped customers and invoices, no product code yet. Output copy: [trials/ledgerdesk-v0.2](../trials/ledgerdesk-v0.2/AGENTS.md).

| Check | Result |
| --- | --- |
| Changed nothing before approval | Verified: target was empty after the proposal stage. |
| Research | Read Symfony, PostgreSQL, OWASP, OpenAPI, Doctrine, Vue, Playwright and GitHub security docs; decision ledger with alternatives and a source register. |
| Skill search | Searched skills.sh and upstream repos; read 7 candidates and recorded why each was rejected. Authored 5 project skills. |
| Rules and recipes | Component rules with IDs; recipes P1-P7 covering a protected API operation plus Vue consumer, tenant tables with row-level security, invoice issuance, login/reset, migrations, policy changes and account management. |
| Honest outcome | Reported **partial**: PHP/Composer and Docker are not installed, so the PHP tooling and Compose files are unverified. No product code or scaffolding added. |
| Local checks | `npm run check` passed with 8 deliberate-violation tests; clean-copy install passed; audit found no known vulnerabilities; product gate correctly reports blocked. |
| Independent review | A separate Claude session found 4 content gaps (DTO extra-field example, undefined money bound, undefined invoice-counter lock, no account-management recipe). The agent fixed all four; a second independent review confirmed them closed and found consistent lock ordering. |

## Trial 2: existing project (ordersync)

Brief: existing Python cron job with its own `AGENTS.md` rules, one test, and an uncommitted README edit. Codex and Claude Code used by the team. Output copy: [trials/ordersync-v0.2](../trials/ordersync-v0.2/AGENTS.md).

| Check | Result |
| --- | --- |
| Preservation | Verified by hash: all product source and tests unchanged. Original AGENTS.md rules kept. The uncommitted README edit kept; no other README change. No commits. |
| Fit to size | Kept the small module layout; no framework, database or unneeded dependencies. Independent reviewer called it not over-built. |
| Research and skills | HTTPX, AWS retry safety, S3 conditional writes, uv docs; candidate skills inspected and rejected; 3 project skills authored. |
| Tool adapter | `CLAUDE.md` imports `@AGENTS.md`, as Claude Code's docs require. |
| Checks | I reran `scripts/check.sh` myself: exit 0 (Ruff, mypy, import contracts, money-syntax guard, pytest, wheel build, structural check). 9 deliberate violations rejected in a disposable copy. |
| Outcome | Reported **ready** with self-review; hosted CI and merge protection listed as not verified. An independent review then found no rule/example contradictions and two small gaps in *my* validator, fixed below. |

Follow-up: I sent the two small gaps from the independent review back to the same session. It made run ID and finance key one persisted value, and documented keeping `read_orders(path)` as a wrapper so existing callers and the test still work. Product code and tests still match the baseline hashes; `scripts/check.sh` passes again. Under the relaxed skill guidance below, it now recommends adopting a community Python testing skill (MIT, pinned) and is waiting for approval rather than installing it.

## Trial 3: proposal only, after relaxing skill selection

Brief: new Next.js App Router + FastAPI + PostgreSQL dispatcher app, Entra ID login, containers, team uses Claude Code and Cursor. Stopped at the proposal to check two fixes. No files were written (verified: the repository is still empty).

| Check | Result |
| --- | --- |
| Defaults table | The proposal opens with every default (Git, GitHub Actions, Docker, structure, locks, checks, skill sources, and so on) marked applied, with reasons. |
| Outside skills | Adopts 5: the official FastAPI skill, Vercel's React best practices and web interface guidelines, Microsoft's PostgreSQL skill, and Microsoft's Playwright skill, each pinned with license and recorded overrides. Adds 4 project skills for security, contracts, scheduling and delivery. |
| Rejections | Community FastAPI and security skills were rejected for factual errors checked against official docs, which is a valid reason. |
| Framework fit | Did not assume client-only rendering because the app needs login; chose server components for authenticated views, with sessions owned by FastAPI. |

## Trial 4: your Takewise brief, after the discussion fix (0.3.0)

Your second Takewise run (Cursor, 0.2.0) asked 4 questions, decided the rest itself, treated your answers as approval, and swapped a skill source after agreement. It is kept unchanged in `repos/takewise` for comparison.

I replayed your exact first message in a fresh Codex session, in a disposable copy of the package, and answered in your style ("ok", "yes", short lists). Transcript kept locally in `tests/evidence/` (not published).

| Round | What the agent did |
| --- | --- |
| 1-4 | Requirements only: tenancy, roles, first modules, sign-in, admin access, permissions, invoicing rules, stock behavior, data obligations, hosting, scale, team tools. Then a requirements table for confirmation. |
| 5 | Defaults table as recommendations (apply / reason), plus Git hosting, Docker scope, skill location, licensing. Asked who owns the GitHub repo. |
| 6 | Architecture: structure, rendering, backend version, database, API contract, invoice/stock locking, each with an alternative. |
| 7 | Security decisions one by one: sign-in and recovery limits, sessions, CSRF **including login**, company isolation with row-level security, admin boundaries, secrets. |
| 8 | Data decisions it needed from you: invoice numbering, quantities and money, stock adjustments, history. |
| 9 | After "use your recommendations for the rest": the full plan with every remaining decision listed, the skills with sources and licenses, rejected candidates with reasons, files to create, and limits. Ended with "Approve implementing this plan?" |

No files were written in any round, including after the "ok" and "yes" answers (verified: `repos/` stayed empty). It flagged that `repos/` sits inside the skill package and used it only because you asked for it.

Then I approved the plan explicitly. Output copy: [trials/takewise-v0.3](../trials/takewise-v0.3/AGENTS.md).

| Check | Result |
| --- | --- |
| Agreed decisions carried through | Spot-checked in the rules: login CSRF, 48-hour invites, 30-minute resets, 30-minute idle and 8-hour session limits, Argon2id, row-level security, platform admins outside client companies, last client admin protected, company-prefixed invoice numbers, void restores stock, whole units, no negative stock. |
| Skills | 4 adopted (antfu Vue, vuejs-ai Vue testing, a Symfony voters skill, Supabase's Postgres skill), each pinned with license and notices, plus 5 project skills that name the upstream advice they override. |
| Independent review | A fresh subagent that did not write the files reviewed it; findings and fixes are in `docs/engineering/review.md`. |
| CI | `pnpm check:foundation` must pass now; product checks switch on when app files appear. |
| Validator | Structure pass, recorded outcome ready. |
| One inconsistency | It claims ready while Docker startup is unverified. Trial 1 treated the same gap as partial. Minor; the gap is disclosed. |

## Follow-on coding sessions

A fresh session in each generated repository got an ordinary request that also contained a rule-breaking shortcut. Read-only plan only, no code.

| Repository and tool | Result |
| --- | --- |
| Ledgerdesk, Codex | Read AGENTS.md, rules, recipes and all relevant skills. Planned customer archiving along the recipes. Refused "show the Issue button to staff" and described the exact lead decision needed. |
| Ledgerdesk, Claude Code with `CLAUDE.md` adapter | Same outcome; cited the specific rules and recipes. |
| Ledgerdesk, Claude Code without adapter | Found and followed AGENTS.md by exploring, but did not load it at startup. The adapter is what makes loading reliable. |
| ordersync, Codex | Planned retries with the persisted idempotency key and limits from the rules. Refused "exit 0 on any error" because it hides failed finance deliveries. |
| ordersync, Claude Code | Same refusal, proposed noise reduction that keeps failure exits, and spotted a pre-existing money bug without silently fixing it. |

## Workflow fixes made from these trials

- Personal leak: trial 1 copied the setup agent's own `~/.codex/AGENTS.md` research-tool preferences into the project. The skill now forbids carrying session/global instructions into project files, and the checker rejects home-directory and agent-config paths in every core artifact.
- Tool adapters: the output contract now requires a small adapter per coding tool the team uses (for example `CLAUDE.md` with `@AGENTS.md`), and the checker rejects a `CLAUDE.md` that doesn't import the entry.
- Acceptance rubric: added cross-artifact consistency (examples must follow their rules; named bounds and locks must be defined) and critical-workflow coverage.
- Checker: blocked ready claims with deferred core decisions, disclosed missing Git worktree, required review mode, broader generated-directory exclusions.
- Skill selection was too strict: trials 1 and 2 adopted no outside skills. The workflow now prefers official vendor skills, then well-maintained community skills, and handles small style differences with a recorded project override instead of rejecting the skill.
- Defaults were not shown to the lead as a list. Every proposal now opens with a Defaults table.
- The skill now refuses to place the target project inside its own package folder.
- Discussion: requirements interview first, every decision discussed in rounds, explicit approval of the final plan (0.3).
- Review: the substantive review must come from a fresh session or subagent; self-review can only report partial, and the checker enforces it.
- CI: foundation checks pass from day one; product checks switch on when app files appear, so CI is never permanently red.

- Frontmatter: the skill's own description had an unquoted `: `, which is invalid YAML for strict loaders. Fixed; the checker now flags the same mistake in generated skills.

## Installing this skill natively

- Claude Code: copied to `.claude/skills/engineering-foundation/`; `/engineering-foundation` loaded the skill body.
- Codex: copied to `.agents/skills/engineering-foundation/`; a fresh session listed it with that path.

These show the package loads. The two full trials used the direct-file prompt instead.

## Package tests

`PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v`: 15 tests pass. They cover the structural checker only.

## Not verified

- Native skill discovery. Codex's sandbox kept `.agents/` read-only, so skills went to `docs/engineering/skills` (trial 1) and `.claude/skills` (trial 2), routed through the entry file. In a normal repo the default is `.agents/skills`.
- Hosted GitHub Actions runs and merge blocking. No remote repositories were used.
- PHP, Composer and Docker behavior (not installed here).
- A real tech lead's experience of the questions and approval. That is your trial.
- Stacks other than PHP/TypeScript and Python. The workflow has no stack-specific steps, but Go, Rust and others were not exercised because those toolchains aren't installed here.
- An explicit reassessment run on an existing foundation.
