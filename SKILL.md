---
name: engineering-foundation
description: Research and establish a project-specific engineering foundation with persistent repository skills, detailed rules and patterns, enforceable checks, and delivery configuration. Invoke explicitly for setup or reassessment.
disable-model-invocation: true
metadata:
  version: "0.3.0"
---

# Engineering foundation

You are establishing how future developers and coding agents will build this project. Deliver an engineering foundation, not a framework scaffold plus linters. Do the investigation yourself, and discuss every consequential decision with the tech lead before it becomes a project rule.

## Authority

Run only on explicit setup or reassessment requests. Ordinary development follows the generated project rules without rerunning this skill. Invocation metadata varies by tool; the explicit-request boundary applies even when metadata is unsupported.

The tech lead decides. Respect fixed technologies, offer a second opinion without replacing them, explain critical consequences once, and accept scoped exceptions. Git, GitHub, and Docker are candidates to confirm, not unconditional requirements. Do not inherit your personal stack preferences.

Your own global or user-level instructions, research-tool preferences, MCP servers, model settings, and machine paths belong to your session, not the project. Keep them out of every generated artifact. Project guidance names only tools and services the lead approves for the whole team.

Inspect before changing files. After agreement and permission to implement, write repository-local guidance, skills, conventions, tooling, dependency/lock changes, check scripts, CI/CD definitions, and suitable development configuration. Product features and framework application scaffolding need separate explicit authorization. Documentation snippets and repository-owned skills are foundation work, not product implementation.

Keep writes inside the exact approved repository. Never create or place the target project inside this skill package's own directory. Preserve unrelated work and existing instructions. No cloud provisioning, live data, deployment, remote-settings changes, global agent/Git changes, or unrequested branches, commits, tags, pushes, or PRs. Inspect symlinks before writes. Read public sources and retrieve approved dependencies, but do not upload private code, read credential values, or execute unreviewed installers. Prepare remote activation instructions instead.

## Non-negotiable deliverables

These are required outcomes, not optional examples of files. Existing paths can fulfill them; duplicate documents are unnecessary. Read [the output contract](references/output.md) before the proposal and follow it exactly after approval.

1. **Research dossier:** project-specific questions, actual sources read, relevant versions, viable alternatives, conclusions, tradeoffs, and unresolved evidence. A link to a framework homepage is not an architectural investigation.
2. **Skill evaluation and installation:** search external candidates for each relevant discipline, inspect their actual contents, record decisions, and install the selected skills persistently inside the repository. Adopt official vendor skills and well-maintained community skills where they fit; author project-specific skills for the project's own decisions and for real gaps. No silently empty skill set.
3. **Operational rules:** precise instructions for every development area present, including file placement, responsibilities, allowed dependencies, failure handling, security boundaries, testing, and delivery. Name enforcement or a specific review criterion for each mandatory rule.
4. **Pattern playbook:** concrete file-level recipes and short illustrative examples for representative changes. A future agent must know how to add the next feature without inventing the architecture.
5. **Agent routing:** the repository entry directs each task to the applicable rules and installed skills. Verify discovery in the available tool and provide a direct-file fallback. Session-installed or globally installed skills do not fulfill persistence.
6. **Executable foundation:** agreed configurations and useful checks, a common local/CI interface, safe delivery definitions where the target is known, and a concrete external-activation handoff.
7. **Acceptance evidence:** run the structural validator and the substantive review, test actual checks with deliberate violations, and account for unfinished work. Produce `docs/engineering/foundation.json` as the artifact index described in the output contract.

An explicit tech-lead exception may narrow scope, but you must name the omitted deliverable, its consequence, and approval. Report a narrowed or partial foundation, not fulfillment of the full contract. A generic "keep it simple" or approval of the stack is not permission to omit research, skills, rules, or patterns.

## 1. Inspect

Read [discovery](references/discovery.md). Determine new project, existing project, or explicit reassessment. Read applicable instructions, manifests, locks, representative source/test flows, build scripts, and Git status. Inspect commands before executing them; keep secrets and live systems out of checks.

Gate: the target and the approval authority are known. Stay read-only until step 5 grants permission to implement.

## 2. Gather the product requirements

Before any technical recommendation, find out what is being built. Read [discovery](references/discovery.md) for the requirement areas. Ask about the ones the brief and repository do not already answer: users and roles, sign-in and account recovery, the first modules or workflows, data sensitivity and client obligations, integrations, where it runs, scale, and the coding tools the team uses. Ask in small batches and wait for answers.

A thin brief ("an ERP for our clients") means more questions, not more assumptions. Never fill a requirement gap with your own guess and design around it. If the lead does not know an answer yet, record it as open and say which decisions it blocks.

Gate: the requirements that shape the architecture are answered or explicitly open. Write a short requirements summary back to the lead and have them confirm or correct it.

## 3. Research architecture and skills

Read [research](references/research.md). Investigate the open decisions across the whole stack and its boundaries, for the confirmed requirements. Respect fixed technologies while researching how to use them correctly. Use official, version-relevant documentation and examine credible implementation experience and contrary evidence where it could change the choice.

Research skills as a distinct required activity. Search the relevant ecosystem and registry/upstream sources, read the actual skill files you intend to propose (not just catalogs), evaluate safety/license/version fit, and map selected or project-authored skills to the tasks they will govern. Check the vendor's own skills first for each framework in the stack. Minor style differences are handled with a recorded project override, not a rejection. Do not substitute a generic development skill for specialized security, framework, contract, or testing guidance that the project requires.

Keep the research in the conversation until implementation is approved. Do not claim research from memory or list unvisited URLs as evidence. If internet or source access is unavailable, say so and leave the affected research incomplete.

Gate: every decision you will bring to the lead has a researched recommendation and real alternatives. A scaffold command and a release-version lookup cannot satisfy this gate.

## 4. Discuss every decision with the tech lead

The tech lead decides; you recommend. Walk through the decisions area by area, in rounds of about three to six, using the areas in [decision coverage](references/decisions.md). Give each decision your recommendation, the realistic alternatives, and what it changes, then wait for the lead's answer before moving on.

Open the first round with the **Defaults** table: every company default from decision coverage (at minimum Git, GitHub and GitHub Actions, Docker, and skill sources) with your recommendation of **apply**, **change** (to what), or **don't use**, and a one-line reason. These are proposals for the lead to accept or change, not settled facts.

Include the skill set as a decision: each proposed skill with its source, license, and why, and each serious candidate you rejected with the reason.

The lead can say "use your recommendations for the rest" at any point. Then list the remaining decisions in the final plan so they are still visible. Nothing may become a project rule, dependency, or skill unless the lead has seen it in the discussion or the final plan. Security-sensitive choices (sign-in, sessions, CSRF, tenancy, permissions, secrets) are always shown individually, never folded into a group.

Gate: every consequential decision has been shown and answered, or explicitly handed to your recommendation by the lead.

## 5. Get explicit approval for the final plan

Read [enforcement](references/enforcement.md) and [output contract](references/output.md). Present the final plan: the confirmed requirements, every decision with its answer, the skills to install with their locations, exact artifact groups, dependencies and workflow triggers, automated versus reviewed rules, open items, and what is excluded. Name any unfinished research or excluded deliverable and its consequence.

Then ask plainly: "Approve implementing this plan?" and stop.

Only an explicit instruction to implement ("approve", "go ahead", "implement it") is approval. Answers to your questions, "okay" to a single recommendation, or silence are not. If the reply is ambiguous, ask once more.

After approval, anything that differs from the approved plan needs a short follow-up before you act: a different skill or skill source, a new dependency, a changed rule, or a newly found risk. Do not substitute silently.

Gate: the lead explicitly approved this exact plan. Record the real approval source. A simulated lead in a trial must be labeled simulated.

## 6. Install guidance and establish patterns, then configure tooling

Write the research/decision evidence and project rules. Install the reviewed skills with their required references and notices, or author the approved project-specific skills from the research. Record sources and revisions; route future tasks to their local files. Make the guidance available in a clean checkout without the authoring agent's session or home directory.

Write the pattern playbook before treating tooling as the deliverable. Resolve file placement, data flow, ownership, validation, errors, and required tests for representative additions. Cover error and permission-denied paths, not only happy paths. Short documentation examples are expected; they do not authorize implementing product features.

Create or amend the actual tooling and CI/CD files. Reuse mature tools and working project conventions. Select language-appropriate checks, contract/boundary validation, and relevant security checks; formatting and test-file existence alone do not establish engineering quality. Explain any check that cannot yet run.

For existing repositories, preserve unrelated edits, source, architecture, dependencies, instructions, and hooks unless the approved change specifically addresses them. Baseline failures remain visible; do not fix product code or disable checks outside scope.

For new repositories, write instructions for future structure without populating speculative application layers. If configuration needs app entry points, ask for minimal scaffolding authority or mark those checks blocked. Still finish the research, skill installation, rules, and documentation recipes that do not depend on product code.

For explicit reassessment, preserve valid decisions and local edits; update only affected guidance and checks after approval. Never install a scheduled foundation caretaker.

Gate: all approved core deliverables are physically present, task-routed, and internally consistent. Missing skills, empty patterns, vague rules, and undocumented research are setup failures, not opportunities to say "done with caveats."

## 7. Verify structure and substance separately

Read [verification](references/verification.md) and [acceptance rubric](references/acceptance.md).

Run the bundled read-only validator against the target, using the path to this skill package:

```sh
python3 /path/to/engineering-foundation/scripts/check_foundation.py /path/to/target-repository
```

Read its output. It detects missing core artifacts, missing local skills, broken routing/references, unaccounted coverage, and incomplete status. It does not judge engineering quality, validate source claims, or prove agent obedience. If Python is unavailable, perform the documented structural checks manually and report the machine check unverified rather than adding Python to the product without agreement.

Then review the substance against the acceptance rubric. Reopen the actual artifacts, not just your plan or summary. Trace worked examples against their rules, check that named bounds and synchronization mechanisms are defined, and cover every distinct security/integrity-critical workflow. Revise shallow, underspecified, or contradictory outputs before handoff.

The substantive review must be independent: a fresh session or subagent that did not write the files, given the repository, the confirmed requirements and decisions, and [the acceptance rubric](references/acceptance.md), and told to report defects with file and line evidence. Most coding tools can start one (for example a subagent or a new non-interactive session). Fix what it finds and have it re-check. If the tool genuinely cannot start one, do a labeled self-review; the outcome is then **partial** with "independent review not done" as a blocker, never ready.

Run safe target checks and deliberately violate representative rules in a disposable copy. Confirm the intended failure and restoration. Check that installed skills and referenced rules survive a clean copy without global/session dependencies. If a fresh coding-agent session is available, test its discovery and use of the generated guidance. Do not pretend a file-existence check proves this.

Gate: structural checks pass, substantive review passes, and exact-target verification is either evidenced or specifically blocked. A structural pass cannot rescue a failed substantive review.

## 8. Report the actual outcome

Use the acceptance rubric's status: **ready**, **partial**, or **blocked**. Ready means the agreed foundation contract passed, not that the product exists or production is configured. Core omissions, unresolved architecture blockers, or a failed substantive review prevent ready. Disclose approved scope reductions plainly.

Give the lead artifact paths, installed skills, consequential decisions, automated/reviewed rules, and remaining actions. Separate Verified, Proxy verified, Not verified, and Pre-existing failures where applicable. Name exact commands and targets.

State remote enforcement limits once. Repo-only work cannot force arbitrary agents to read files or activate GitHub merge protection. These limits do not excuse missing repository-local guidance or checks.

Return control to the lead. Setup and reassessment run only when explicitly requested.

## Sources

[Evidence sources](references/sources.md) records the primary documentation behind format and enforcement limits. Verify current tool-specific behavior before installing adapters or configuring a service.
