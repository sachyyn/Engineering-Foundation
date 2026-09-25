# Discovery and agreement

## How to talk to the tech lead

The lead decides; you do the reading and bring recommendations. Ask for business facts and decisions, not information you can find in the repository. Every question carries your recommendation and what the answer changes.

- Useful: "Must users edit while offline? That changes storage and conflict handling. I recommend online-only for the first release."
- Useful: "Sign-in: email and password with reset, or the client's Microsoft/Google accounts? It changes the account tables and the login flow."
- Unnecessary: "Tabs or spaces?" when the repository already has a formatter.

Ask in rounds of about three to six questions and wait for answers. More rounds are fine; a guess presented as a decision is not. The lead can say "use your recommendations for the rest" to speed up, and you then list those remaining decisions in the final plan.

## Requirement areas

Before technical decisions, cover whatever the brief and repository leave open:

| Area | Examples of what to ask |
| --- | --- |
| Users and roles | Who uses it? Which roles exist and what can each do? Can one person belong to several clients or organizations? |
| Sign-in and accounts | Email and password, company SSO, social login? Password reset, invitations, account deactivation, MFA? |
| First release | Which modules or workflows come first? What must work on day one? |
| Data | What data is stored? How sensitive? Retention, deletion, audit trail, export needs? Client contractual or legal constraints? |
| Integrations | Email, payments, accounting systems, files, other APIs? |
| Running it | Where will it be hosted, or is that open? Expected users and data volume? Offline needs? Browsers and devices? |
| Team | Which coding tools and editors does the team use? Who reviews and merges? |

Record answers in a short requirements summary and have the lead confirm it before you design. Anything unknown stays listed as open, with the decisions it blocks.

## Establish the exact target

- Resolve the requested directory, Git root if present, active branch, and dirty/untracked files. Do not mistake a parent repository for the project.
- Read instruction files that actually apply, including more-specific instructions in areas to be touched.
- Check for existing engineering decisions, approved skills, security policies, and delivery guidance.
- Identify the project units, languages, versions, lockfiles, supported OS/architecture, and build/deployment targets.
- Read scripts before running them. Tests, Make targets, package installation hooks, and infrastructure "plan" commands can access networks, credentials, or live services.
- Keep outputs bounded. Do not enumerate private home folders, print environment values, or read secret-bearing files merely to build an inventory.
- Record exact relevant paths. A manifest alone does not prove the deployed architecture.

## New projects

Find out what must exist first:

- What product or deliverable is needed and what is the first release boundary?
- Which technologies and hosting constraints are fixed?
- Which workflows, data, user permissions, external integrations, and distribution targets matter?
- What evidence would make the lead accept the foundation?

Derive structure from responsibilities, framework requirements, and build boundaries. Do not start with a prescribed `apps/`, `packages/`, or domain-driven directory tree. Distinguish an empty repository from a generated skeleton with existing configuration worth keeping.

Application code is not necessary to establish architecture, persistent skills, concrete rules, or file-level implementation recipes. Finish those now, with illustrative documentation examples. Some tooling cannot run without application inputs; mark those checks blocked rather than creating a fake passing application or reporting zero discovered tests as coverage. Keep this runtime limitation separate from the obligation to decide how future code must be written.

## Existing projects

Trace one representative flow through entry point, domain logic, external data/service boundary, error handling, and test where applicable. Inspect callers before proposing a shared-boundary change.

Classify findings:

| Kind | Treatment |
| --- | --- |
| Consistent and sound convention | Preserve and document its intent. |
| Mixed convention with working implementations | Propose one for new/changed work; discuss migration separately. |
| Concrete correctness or security risk | Explain consequence and propose targeted policy/checks; application repair is separate work. |
| Historical debt | Record baseline and a bounded adoption plan. |
| Mere aesthetic preference | Keep the existing choice unless the lead asks to change it. |

Run existing safe checks to establish the baseline when possible. Capture failures without editing product code to fix them. Check which files each tool actually covers, not just whether the command exists.

A baseline exception must identify exact rules or paths and its revisit condition. Avoid broad exclusions that let new problems enter old files. When incremental enforcement cannot distinguish new violations reliably, say so and offer full gating or explicit migration work.

## Sufficient agreement

The plan is ready for approval when the requirements summary is confirmed, every consequential decision has been shown and answered (or explicitly handed to your recommendation), researched skills are selected, and each required deliverable has a concrete plan.

Answering your questions is not approval to implement. Ask plainly for approval of the final plan and wait for an explicit yes. A useful approval request is:

> Here is the full plan: requirements, every decision with your answer, the skills and where they go, the files I will add, and what is excluded. Nothing here writes application code or changes remote settings. Approve implementing this plan?

After approval, save a short decision record with the source of approval, the decisions, exceptions, and limits. If something must differ from the approved plan (a different skill source, a new dependency, a changed rule), ask before doing it.

## Contradictions

When approved choices conflict, explain the exact incompatibility and offer the smallest workable alternative. Pause the dependent decision, not unrelated setup.

Examples include a static-only host paired with a requirement for server execution, a required test command that needs unavailable proprietary services, or a signing requirement without an available signing environment.

An authenticated frontend with a separate backend does not by itself establish client-only rendering. Determine rendering, session handling, data access, and deployment roles separately.
