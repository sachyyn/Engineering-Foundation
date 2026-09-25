# Foundation acceptance rubric

Use this before reporting completion. Inspect the actual output, not the agent's summary. File existence is only the first check. Record findings and fixes in the verification report; unresolved findings prevent a full ready result.

## Substantive review

| Requirement | Pass evidence | Fail examples |
| --- | --- | --- |
| Project understanding | A confirmed requirements summary exists; decisions reflect it, real constraints and component interactions; fixed choices preserved; risks identified. | Framework defaults copied without understanding the product; roles, sign-in, or first workflows assumed instead of asked. |
| Lead decided | Every decision recorded in the rules appeared in the discussion or final plan, with the lead's answer or explicit delegation. Implementation started only after an explicit approval of the final plan. | Rules containing choices the lead never saw; answers to questions treated as approval; a skill source or dependency swapped after approval without asking. |
| Research depth | Consequential questions have actual source evidence, version context, alternatives, reasons, and contrary evidence where relevant. | Only release-page and quick-start links; unvisited sources; confident memory presented as research. |
| Skill discovery | Relevant disciplines searched, official vendor skills checked first; promising candidates inspected; adopted where they fit, with project overrides recorded; rejections give a valid reason. | "No skills needed" without investigation; registry titles treated as reviewed content; good official or widely used skills rejected over minor style differences. |
| Defaults visibility | The proposal's Defaults table shows each company default as applied, changed, or not used, with a reason. | A default dropped or changed without being shown to the lead. |
| Persistent skills | Usable selected/project-authored skills live inside the repository, with required dependencies/references, provenance, and task routing. | Global/session-only skills, broken symlinks, a links-only catalog, empty SKILL.md, irrelevant skill count padding. |
| Rules | Concrete component-specific requirements cover responsibilities, trust boundaries, failures, tests, and delivery; checks or review criteria named. | "Follow best practices"; ownership slogans; style tools presented as complete quality enforcement. |
| Patterns | Another agent can perform representative additions using named paths, flow, examples, and expected tests without inventing architecture. | Folder list with no recipes; "add tests"; missing error/authorization paths. |
| Cross-artifact consistency | Worked examples actually implement the rules they demonstrate, including required framework configuration. Named bounds, synchronization mechanisms, and failure behavior are specified or remain blockers. | Bare framework defaults contradict a promised validation rule; "use a safe bound" without a bound; "lock the counter" without a locking mechanism. |
| Critical workflow coverage | Every distinct security/integrity-critical workflow named in the rules has a usable recipe or an explicitly approved exclusion. Similar operations may share a recipe. | Role management demands last-owner preservation/session revocation but supplies no transaction or concurrency recipe. |
| Unbuilt features | Architecture and coding conventions exist ahead of implementation, without unrequested product code. | Deferring contract/auth/tenancy conventions because endpoints are not built. |
| Agent integration | Entry routes to rules, recipes, and local skills; clean-copy paths work; supported tool discovery tested or disclosed. | Reliance on the setup session's memory or personal home-directory skills. |
| Executable checks | Real relevant checks cover the intended files; representative forbidden changes fail for the intended reason. Foundation checks pass today; product checks switch on when app files appear. | Test-filename count alone proves tests ran; unrelated failure claimed as enforcement; skipped errors; CI red on every change until the app exists. |
| Decision honesty | Approval is real, assumptions/gaps visible, deferrals justified and consequential ones remain blockers. | Self-approved defaults, all unknowns labeled not applicable, deferred core work presented as complete. |
| Scope/preservation | Only agreed foundation work changed; existing work preserved; no remote mutations. | Unrequested application rewrite, global installs, silent policy replacement, cloud changes. |

There is no source-count, word-count, or skill-count shortcut to passing this rubric. Require enough depth to remove real ambiguity. At least one installed skill is a structural floor, not adequate coverage for every project.

## Challenge questions

Use the project's actual requirements, not generic trivia:

- Where would the next agent put a new operation, and what may that code depend on?
- Which installed skills must it read for that task, and can it load them from a clean checkout?
- What exactly happens on invalid input, denied access, backend failure, or interrupted work?
- How do two components agree on data/error shape and compatibility?
- Which rules prevent the most important product risks, and which can currently be checked?
- How does an ordinary change get tested, reviewed, built, and delivered without weakening the rules?
- Does each worked example uphold its governing rules, or silently rely on unspecified framework defaults?
- Are every named bound and critical synchronization mechanism concrete? Were consequential business limits actually agreed rather than invented?
- For session-cookie apps: is the login request itself CSRF-protected, and is the session rotated on login? Exempting login from CSRF is a known trap.

For irrelevant questions, substitute the equivalent boundary for this product type. If the artifacts cannot answer applicable questions, revise them before handoff.

## Outcome

**Ready:** required guidance/research/skills/patterns are complete; structural validation and substantive review pass; agreed local setup checks pass or product-dependent checks are explicitly distinguished from setup checks; no unresolved decision prevents compliant development. External activation may remain unverified if it is outside the agreed repo-only scope and the handoff is complete.

**Partial:** useful setup is present, but required artifacts, substantive findings, necessary research, local verification, or approved scope reductions remain. Name exactly what is unfinished. Do not prefix the handoff with "completed" and bury the omissions below.

**Blocked:** missing information, access, authority, or a fundamental conflict prevents the core setup from proceeding. Continue independent authorized work where possible.

Missing application implementation is not automatically a foundation failure. Missing instructions for how to implement it safely is. A build blocked by absent app code is distinct from an unavailable compiler needed to validate newly written tooling; record each accurately.

## Independent behavioral trial

For changes to this skill, structural/unit tests alone are insufficient. Launch a fresh coding-agent session with the skill and a realistic brief. Do not include the desired answer, a prewritten artifact set, or coaching that compensates for weak skill instructions.

1. Have it investigate and propose. Confirm it asks only consequential questions and does not implement before approval.
2. Act as the simulated tech lead, answer questions, approve an exact proposal, and label that approval simulated.
3. Let it produce the foundation. Preserve the transcript and output for inspection.
4. Review against this rubric and run the validator and meaningful checks. Reject shallow outputs even when the validator passes.
5. Start a fresh follow-on session for a small authorized coding task or read-only implementation plan. Check that it actually reads the local rules/skills and follows the patterns. A read-only plan tests discovery/planning, not implemented behavior.
6. Exercise a conflicting request without authorizing policy weakening. The agent should raise the conflict; independent executable checks should also reject detectable violations.

If the run fails, retain the failure evidence, correct the workflow, and rerun the affected stage or a fresh scenario. Clearly distinguish author self-review, independent content review, actual agent behavior, and hand-authored fixtures. A hand-authored fixture never substitutes for this trial.
