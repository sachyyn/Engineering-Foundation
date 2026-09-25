# Verification

## Match claims to evidence

The actual target is the agreed repository, tool, environment, and state. A generated file proves only that the file exists. A locally run command proves local behavior. Neither proves hosted CI, remote rules, production deployment, or another coding tool's instruction discovery.

Use these labels when relevant:

- Verified: directly checked on the exact target.
- Proxy verified: checked in a disposable copy, example, or substitute environment.
- Not verified: unavailable access, missing application code, unsupported tool, external activation, or another concrete blocker.
- Pre-existing failures: baseline problems not introduced by foundation setup.

## Before executing

Read commands and configuration for side effects. Run only approved safe checks. Dependency installers, tests, Docker definitions, and infrastructure tools can run arbitrary code or contact live services. Keep credentials and production state out of trials.

Use a disposable directory for negative tests; never deliberately break the user's working tree. Copy only necessary non-secret files. Account for symlinks and avoid copying credential files, private datasets, caches, or irrelevant dependencies. Delete only directories created by the trial.

## Required structural and substantive checks

Run `scripts/check_foundation.py` from this skill package against the exact target. When recording commands in project files, write the package location as `<engineering-foundation>` and target paths relative to the repository; home-directory paths fail the structural check. It reads the artifact index, requires all core roles and local skills, checks paths and task routing, and rejects incomplete ready claims. Run it even when you expect a partial result; report the actual exit code. It is not a semantic quality judge.

Then apply the acceptance rubric linked from SKILL.md to the actual content. A structural pass cannot establish research depth, good architecture, or useful patterns. Resolve content failures, record the reviewer's identity and evidence, and use ready/partial/blocked honestly.

## Acceptance checks

| Item | Evidence required |
| --- | --- |
| Scope | Diff contains only approved foundation changes; existing application source and unrelated work are preserved. |
| Coverage | Each decision area has a disposition; relevant requirements are reflected in actual artifacts or named blockers. |
| Instructions | Entry and task references resolve; no contradictions; applicable tool discovery tested where available. |
| Skills | Documented searches and candidate review; persistent local files covering applicable disciplines; compatible content, provenance, license, and task routing from a clean checkout. |
| Research and patterns | Actual decision evidence and concrete recipes that answer the next developer's placement, boundary, error, permission, and testing questions. |
| Commands | Actual command succeeds in valid state; expected tools and tests are present; missing prerequisites do not report success. |
| Enforcement | A representative violation fails the intended rule for the intended reason; restoration passes. Check new-file coverage as well as existing-file changes. |
| CI | Configuration validated with suitable tooling where available; jobs run the intended commands; triggers, permissions, paths, and exit handling inspected. Hosted execution needs separate evidence. |
| Delivery | Artifacts/templates accurately labeled; no surprise active deployment; missing external settings listed. No live deployment as a setup test. |
| Clean setup | Approved setup/check commands work in a clean disposable copy or the inability is recorded. |
| Repeatability | An explicit rerun preserves manual edits and proposes no duplicate or unnecessary changes. A real rerun is required to claim this. |
| Handoff | All core deliverables pass structural and substantive review for a ready result. Unfinished required work produces partial/blocked, not a completed claim with buried caveats. |

For each negative test, capture the rule, mutation, command, exit code, and diagnostic. A failure caused by a missing interpreter does not validate an architecture check. Avoid claiming comprehensive enforcement from one mutation.

## Testing this skill itself

Static checks of Markdown and links catch packaging errors only. They do not prove that an agent follows the procedure.

Use a real invocation on disposable scenarios. Record the input, fixed choices, available tools, approvals or simulated approvals, files before/after, tool calls or transcript where available, and verification output. When the same authoring agent performs a walkthrough, label it as such. Independently initiated agent trials provide additional evidence; do not invent them.

Suggested scenarios:

- New project with a selected frontend and separate backend. Check that rendering is not inferred from authentication alone.
- Existing repository with working conventions and unrelated edits. Check preservation and bounded proposals.
- Non-JavaScript project. Check that structure and tools follow its ecosystem rather than a web-app template.
- Missing research access or required tool. Check that uncertainty and blockers are explicit.
- Conflicting requirements or an unsuitable skill. Check targeted clarification and rejection without scope creep.
- No application code. Check that zero tests or missing build inputs are not described as passing product verification.
- Explicit second run and changed requirements. Check preservation and targeted updates.
- Follow-on coding task. Check actual discovery, convention compliance, and refusal to disable gates just to pass.

A deterministic fixture regression test verifies the fixture's checks, not these conversational behaviors. Keep both kinds of evidence distinct.

## Handoff format

Lead with the outcome, then give only the evidence categories present. Name exact commands and paths. Call out the smallest action needed to close each gap.

If required remote protections are absent, say so plainly:

> Local checks reject the tested violations. CI configuration is prepared. Merge blocking is not verified because remote rules have not been activated and tested.

If product code does not exist yet, first verify that research, skills, rules, and concrete implementation recipes are complete. Then distinguish those results from unavailable runtime checks:

> The guidance and setup artifacts passed the stated acceptance checks. Application build and behavior checks remain blocked until the named entry points and tests exist. No product implementation was added.

If guidance itself is missing, report a partial foundation and list the missing deliverables instead.

Close the setup session after handoff. The foundation guides future development; this skill does not stay active as a caretaker.
