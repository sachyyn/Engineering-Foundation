# Enforcement and delivery safety

## What can actually be enforced

| Mechanism | What it provides | Limit |
| --- | --- | --- |
| Agent instructions and task-specific skills | Context and expected behavior | An agent may not load or obey them. They cannot intercept arbitrary edits. |
| Editor/tool integration | Early feedback in supported tools | Tool/version-specific, configurable, and not universal. |
| Local quality command | Reproducible failure on detectable violations | Must be run; editable by contributors. |
| Git hooks | Earlier feedback during commits or pushes | Not automatically active in every clone; can be bypassed or disabled. |
| CI jobs | Checks on submitted changes | A failing job does not by itself prevent merging. |
| Required checks, review, protected branches/rulesets | Server-side restrictions on accepting changes | Need remote configuration, permissions, appropriate account features, and careful bypass policy. Outside this workflow's write scope. |

Be strict about detectable violations, not about ritual. Do not use "I read the rules" files, agent acknowledgments, prompt keywords, or completion checkboxes as proof of compliance.

A repo-only setup cannot guarantee that an arbitrary agent reads guidance before editing. State this once, then build the strongest agreed local and CI safeguards. Never mark remote enforcement active from the existence of YAML, CODEOWNERS, or a checklist.

## Rule-to-check mapping

Every mandatory project rule needs either a concrete automated check or a named review requirement. Record enforcement gaps rather than classifying a prose rule as automated.

Prefer compiler/type checks, formatters, linters, dependency-boundary tools, schema/contract validation, tests, and the ecosystem's existing capabilities. Use a small custom check only for a concrete rule standard tools cannot express. Explain its coverage and blind spots. Avoid building a universal linter or policy engine.

Examples:

| Rule | Suitable mechanism |
| --- | --- |
| Consistent formatting | Formatter in check mode. |
| Allowed module dependencies | Existing architecture/import rules or focused boundary checks. |
| API clients match the schema | Contract/schema validation and generated-file freshness checks. |
| Sensitive values stay out of commits | Secret scanning with reviewed scope; never claim it detects all secrets. |
| Changes preserve behavior | Focused tests plus integration checks for real external boundaries. |
| Policy changes are intentional | Diff review and, when activated remotely, code-owner approval. |

Make failure output actionable: rule, offending path, and correction command or reference. A check that is noisy, flaky, or impossible to satisfy is a foundation defect, not developer discipline.

## Local checks and hooks

- Reuse the existing command interface. Add one quality entry point only if needed.
- Run checks in non-mutating mode in CI. Formatting fixes should be explicit local commands.
- Propagate nonzero exit codes. A missing executable, configuration, required test suite, or prerequisite must not become success.
- Test that the command covers new and modified relevant files, not only a happy-path sample.
- Account for supported operating systems and working directories.
- Keep fast feedback separate from expensive suites without silently omitting mandatory checks.
- Offer hooks when useful. Inspect existing hooks and hook managers; preserve or integrate them. Explain clone activation and bypass limits. Do not change global Git configuration.

## CI gates

- Use stable, unique required job names. Document exactly which names an administrator must require.
- Test ordinary PRs, fork PRs when supported, branch pushes, and merge-queue events if the repository uses a merge queue.
- Avoid path filters on required workflows that leave checks pending. If conditional jobs are used, the final required gate must explicitly reject failed, cancelled, and unexpectedly skipped dependencies.
- Do not put the required gate behind a condition that reports "skipped" when validation should have run. GitHub can accept skipped/neutral required checks.
- Include meaningful test discovery. In a new repository without product tests, report that gap; do not add an always-passing test to make CI green.
- Split the gate so CI is useful from day one. **Foundation checks** (guidance routing, workflow safety, secrets, path hygiene, config validity) always run and must pass. **Product checks** (build, types, lint, tests, contract) switch on automatically when application inputs exist, detected from files such as `backend/composer.json` or `frontend/package.json`. Once on, a missing tool, missing config, or zero discovered tests fails. A correct foundation-only change must be green; a CI that is permanently red until the app exists trains the team to ignore it. Report which product checks are not yet active in the handoff.
- Keep baseline exceptions narrow and visible. Do not use blanket ignores, `continue-on-error`, `|| true`, or disabled checks to pass an agreed mandatory gate.
- Use least-privilege tokens, reviewed actions pinned to verified immutable revisions, and appropriate timeouts. Keep CI independent of production credentials.
- Treat PR contents as untrusted. Do not execute untrusted code with privileged `pull_request_target` or privileged follow-up contexts. Avoid shell interpolation of untrusted event fields.
- Consider runner isolation, caches, artifacts, and dependency install scripts as trust boundaries. Do not execute untrusted PRs on persistent privileged runners by default.

Changes to workflows, check scripts, lint configuration, instruction files, and exceptions can weaken the gate itself. Recommend review protection for these paths. CODEOWNERS is useful only with valid owners and the corresponding remote review settings; do not invent usernames.

## Remote activation handoff

Prepare concise instructions for the tech lead or administrator. Do not call remote mutation APIs. Record applicable targets and:

- Required checks and expected source, branch targets, and any merge-queue requirements.
- PR/review requirements and protection of enforcement-related files.
- Direct-push, force-push, and bypass policy.
- Runner, secret, environment, and permission prerequisites.
- A deliberate failing PR/check to demonstrate rejection after activation.

Remote settings are not verified unless the actual settings and behavior have been inspected with permission. If evidence is unavailable, state "Not verified: merge enforcement requires remote activation and a failing-PR trial." If the lead declines activation, record that accepted gap, not an enforced state.

## CD, infrastructure, and operational configuration

Write only what the agreed target supports. Cover packaging, promotion of tested artifacts, migrations, concurrency, post-deployment checks, rollback/forward-fix limits, and recovery instructions as applicable.

Before changing existing workflows, inspect triggers and downstream consequences. A future push could trigger deployment even though this agent never deploys. Prefer inert examples outside active workflow directories until destination, identities, and activation are agreed. Clearly distinguish templates from configured pipelines.

A manual trigger is not a substitute for production authorization or environment protection. New active delivery configuration requires explicit agreement on its triggers and prerequisites. Never execute it, provision infrastructure, read live data, or upload artifacts during foundation setup.

Use non-secret configuration examples. Infrastructure validation must remain offline unless a safe, authorized alternative is established; even a "plan" can contact live accounts. If validation requires cloud access or credential values, stop and record the exact verification gap.

No fictional deployment targets, secret names presented as configured, or placeholder commands reported as complete. When application build outputs do not exist yet, record what remains blocked and why.
