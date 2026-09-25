# Engineering foundation

A manually invoked workflow that researches and sets up how developers and coding agents must work in a particular repository. For new and existing projects, across stacks.

Version: **0.3.0**. 0.2 replaced the permissive 0.1 workflow; 0.3 makes the tech lead decide every consequential choice instead of the agent. See [verification results](tests/RESULTS.md) for exact evidence and remaining limits.

## Install

One command, for Claude Code, Codex, Cursor and [60+ other agents](https://github.com/vercel-labs/skills#supported-agents):

```sh
npx skills add sachyyn/Engineering-Foundation -g
```

`-g` installs it for you across all projects, which is what a tech lead wants: it is a setup tool, not something every project repository should carry. The CLI asks which agents to install for. The full GitHub URL works too: `npx skills add https://github.com/sachyyn/Engineering-Foundation -g`.

To update later: `npx skills update engineering-foundation -g`. To remove: `npx skills remove engineering-foundation -g`.

## Use it

Open your agent in the project folder (an empty folder for a new project) and invoke it with your brief:

| Tool | How to start it | Checked |
| --- | --- | --- |
| Claude Code | `/engineering-foundation` followed by your brief | Installed with `npx skills add`, loaded by slash command, 2026-09-25 |
| Codex | "Use the engineering-foundation skill for this project" followed by your brief | Installed with `npx skills add`, listed in the session's skills, 2026-09-25 |
| Cursor and others | Same as Codex: name the skill in your first message | Not checked |
| No skill support | "Read `<path>/skills/engineering-foundation/SKILL.md` and follow it for this project" | Works with any agent that can read files |

In the brief, say what you are building, which technologies are fixed, where it runs, and which coding tools the team uses. For example:

> /engineering-foundation New project called takewise. Web ERP used by our clients. Vue.js frontend and PHP Symfony backend are fixed. I am the tech lead. Discuss everything with me before building anything.

What to expect. It takes several rounds of conversation; that is by design.

1. It reads the folder you started it in. No files change until step 5.
2. **Requirements.** It asks what you're building: users and roles, sign-in, first modules, data, integrations, hosting, team tools. It writes back a short summary for you to confirm.
3. It researches the stack and looks for existing skills.
4. **Decisions.** It walks through the decisions a few at a time, starting with the company defaults (Git, GitHub, Docker, skill sources). Each comes with a recommendation and alternatives; you answer. Say "use your recommendations for the rest" whenever you want to speed up; it will still list them.
5. **Approval.** It shows the full plan and asks "Approve implementing this plan?" Nothing is built until you say yes. Answering its questions is not approval.
6. It builds the foundation, runs the checks, gets the content reviewed, and reports **ready**, **partial**, or **blocked**. If it needs to change anything from the plan (for example a different skill source), it asks first.

Partial is a normal, honest result when a tool it needs (for example PHP or Docker) is missing on your machine. It lists exactly what is left.

Codex ignores `disable-model-invocation`, so it could pick the skill up on its own; the skill's first section tells it to stop unless setup was explicitly requested.

`disable-model-invocation: true` requests manual invocation where supported. The skill body also requires it. When it runs, it changes nothing outside the project folder: no background caretaker, automatic policy refresh, global configuration, or Git hosting setup.

## What a full setup must deliver

1. A research dossier with actual source evidence, alternatives, decisions, and tradeoffs.
2. Documented skill searches and candidate evaluation, followed by permanent repository-local installation of the selected skills. Author researched project-specific skills for genuine gaps.
3. Detailed rules for the applicable components and their interactions.
4. Concrete implementation recipes, file placement, and examples for representative additions, including failure and security paths.
5. A repository entry that routes future agents to the relevant rules and local skills.
6. Appropriate development/check configuration, CI, and delivery definitions or a concrete blocked-target handoff.
7. Structural acceptance, substantive content review, and evidence from real checks.

These are required roles, not seven mandatory separate documents. Existing authoritative files may fulfill them. A small entry file is useful; a small entry file without the detailed guidance behind it is not enough.

The artifact index is `docs/engineering/foundation.json`. It records the actual local paths, installed skills, decision coverage, blockers, exceptions, and review evidence. The [output contract](skills/engineering-foundation/references/output.md) defines it.

## What changed after the failed trial

The 0.1 result in `repos/takewise` had basic instructions and tools but no installed skills and insufficient research/pattern depth. It is not an accepted example. The correction makes those omissions setup failures rather than discretionary simplifications.

- Research and skill discovery are mandatory activities with persisted evidence.
- Project-local skill content must survive a clean checkout; a catalog of URLs or a global install is insufficient.
- Unbuilt features still require decisions and implementation patterns. "No endpoints yet" is not a reason to postpone contract/auth/error conventions.
- A structural validator rejects absent core artifacts, missing skills, broken routing/references, and inconsistent completion claims.
- A separate substantive rubric rejects superficial artifacts even if the structural validator passes.
- Ready, partial, and blocked have explicit meanings. Missing required work cannot be buried under a "completed" heading.
- Changes to this workflow require genuine fresh-agent behavioral evaluation, not hand-authored fixtures.
- The setup agent's own global instructions and tool preferences must stay out of project files.
- Each coding tool the team uses gets a small adapter to the one entry file, for example a `CLAUDE.md` that imports `@AGENTS.md`.

## Example output

- [trials/takewise-v0.3](trials/takewise-v0.3/AGENTS.md): **made with 0.3.** Your Takewise brief, replayed word for word, after 9 discussion rounds and an explicit approval. Vue/Symfony/PostgreSQL shared-database ERP for Takewise's clients. **Ready**, with an independent subagent review.

Older examples from fresh agents with simulated tech-lead answers. Read them to see the expected depth. They are examples, not templates to copy. Both were made with **0.2**, before the requirements interview and decision rounds existed, so their conversations were shorter than 0.3's. Under 0.3's rules the ordersync example would report partial, because its final review was a self-review. Dependencies, caches and downloaded binaries were removed from the copies.

- [trials/ledgerdesk-v0.2](trials/ledgerdesk-v0.2/AGENTS.md): new Vue/Symfony/PostgreSQL multi-tenant ERP. Honestly **partial** because PHP and Docker were unavailable. The setup agent had copied its own personal research-tool preferences into `AGENTS.md`; those lines were removed from this copy, and the new no-personal-settings rule prevents it.
- [trials/ordersync-v0.2](trials/ordersync-v0.2/AGENTS.md): existing small Python cron job. **Ready**; existing rules, code and an uncommitted edit preserved.

What was tested and what wasn't: [tests/RESULTS.md](tests/RESULTS.md).

## Scope and defaults

Git, GitHub, and Docker are proposed defaults, subject to the lead's confirmation and project suitability. Existing sound conventions and fixed choices take priority. Company/client ownership is asked about only when it affects permissions, delivery, licensing, or requirements.

After approval, the workflow may write project-local instructions, skills, configuration, dependencies/locks, tooling scripts, CI/CD definitions, and infrastructure definitions. Product implementation and framework application scaffolding need separate authorization. Documentation recipes are foundation work.

No cloud provisioning, live database access, deployment, remote repository settings, global configuration changes, or unrequested Git publication actions. Prepare the required remote activation handoff instead.

## Enforcement and its limits

Every mandatory rule needs a real automated check or a specific review criterion. Checks must detect relevant violations, not just count files or solicit acknowledgments. CI must use the intended commands without hiding failures. Changes that weaken policy need explicit lead approval; ordinary conforming work does not.

Repository files cannot force arbitrary agents to read them or activate GitHub merge protection. Local hooks can be bypassed. The workflow must still build the strongest agreed local/CI controls and report exactly what needs remote activation. Those limits do not excuse missing local skills, rules, or patterns.

## Validate a generated foundation

Requires Python 3.9+; Git is used for ignore checks when available. No Python packages are required.

```sh
python3 skills/engineering-foundation/scripts/check_foundation.py /path/to/target-repository
```

Exit codes:

- `0`: required structure exists and the recorded outcome is ready.
- `1`: structural failure or inconsistent ready claim.
- `2`: required structure exists, but the recorded outcome is partial/blocked.

**This is not a quality certificate.** It cannot prove sources were read, rules are sound, review claims are truthful, or an agent obeyed the guidance. Apply [the acceptance rubric](skills/engineering-foundation/references/acceptance.md) and inspect the actual evidence. In particular, passing this command alone does not prove setup is complete.

Do not add Python to a non-Python product merely for this tool. Run it from the setup environment, perform the disclosed manual equivalent if unavailable, or integrate a suitable agreed native check.

## Test this package

The regression suite requires Python 3.12+ and Git:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v
```

Structural tests cover the reported omissions, broken persistence/routing, machine-specific paths, and the Claude Code adapter. They do not invoke a coding agent. Fresh-agent inputs, observations, and limitations belong in the [results](tests/RESULTS.md); [behavior scenarios](tests/scenarios.md) provide additional trial cases.

## Reference map

- [Discovery](skills/engineering-foundation/references/discovery.md): efficient questions, new/existing project paths, and approval.
- [Decision coverage](skills/engineering-foundation/references/decisions.md): defaults and 20 development-through-delivery areas.
- [Research](skills/engineering-foundation/references/research.md): architecture investigation and persistent skill selection.
- [Output contract](skills/engineering-foundation/references/output.md): required artifacts, rules, patterns, routing, and index schema.
- [Enforcement](skills/engineering-foundation/references/enforcement.md): useful checks, CI, bypasses, and delivery safety.
- [Acceptance](skills/engineering-foundation/references/acceptance.md): substantive review and ready/partial/blocked outcomes.
- [Verification](skills/engineering-foundation/references/verification.md): exact-target tests and evidence reporting.
- [Sources](skills/engineering-foundation/references/sources.md): primary documentation behind format and enforcement limits.

## Distribution

The user will arrange GitHub hosting. Do not automatically propagate future versions into established projects; explicit reassessment preserves project decisions and manual edits.

A public distribution license has not been selected. Choose one before inviting reuse. Third-party installed skills retain their own licenses and notices. `tests/evidence/` holds raw local transcripts and is gitignored, so it will not be published. `repos/` is also ignored.
