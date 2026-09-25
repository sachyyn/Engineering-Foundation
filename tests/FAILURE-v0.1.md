# Reported 0.1 failure

The user independently invoked engineering-foundation 0.1 with another coding agent and reported inadequate output in `repos/takewise`. The repository was inspected read-only during correction. The invoking agent's conversation was not available, so its browsing history and approval exchanges were not independently verified.

## Observed output

- No project-owned SKILL.md files outside dependencies.
- No recorded skill search/candidate evaluation or installation provenance.
- AGENTS.md establishes broad Symfony/Vue ownership and points to one foundation record.
- The foundation record contains two external research links, Symfony releases and Vue quick start. It does not establish a detailed investigation of the project's development patterns.
- API contracts are deferred because there are no product endpoints, although deciding the contract strategy is foundation work.
- Concrete recipes for implementing protected tenant operations, frontend consumers, errors, and tests are absent.
- Formatting, linting, type checks, and a test-file-presence check exist. Important domain/security boundaries remain broad review statements.

The output is not empty and does contain useful configuration. It is nevertheless insufficient for the requested researched, persistent, project-specific engineering foundation.

## Authoring defects

The 0.1 skill described required outputs as suggested roles, allowed a reference to substitute for local skills, lacked an explicit substantive acceptance gate, and allowed blocked/deferred items to be merely accounted for at completion. The hand-authored Python fixture tested a local checker rather than this agent workflow. Those tests could not catch this failure.

## Correction evidence

The 0.2 structural validator rejects this exact output:

```text
STRUCTURE FAIL: missing artifact: docs/engineering/foundation.json
```

This proves the old artifact set fails the new structural contract. It does not by itself prove the new workflow produces good output. The structural regression suite separately rejects empty skill sets and missing core documents; the acceptance rubric and fresh-agent trial assess the actual content and behavior.

The Takewise repository is not a golden example, is not used to seed the corrected agent's answers, and has not been repaired as part of this correction. Fresh trials use synthetic requirements in separate disposable repositories.
