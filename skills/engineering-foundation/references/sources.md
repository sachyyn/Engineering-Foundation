# Evidence sources

Reviewed on 2026-09-25. These sources support this workflow's format and enforcement limits; they are not research for every future project's stack. Verify version-sensitive behavior when applying the skill.

| Source | What it supports | Limit |
| --- | --- | --- |
| [Agent Skills specification](https://agentskills.io/specification) | `SKILL.md`, required metadata, directory naming, optional references, progressive disclosure. | Native installation and invocation behavior vary by client. `disable-model-invocation` is not a core specified field. |
| [AGENTS.md](https://agents.md/) | A portable repository guidance convention and scoped instructions. | Adoption does not prove discovery or obedience in every tool. Tool documentation determines actual precedence. |
| [Claude Code skills](https://code.claude.com/docs/en/skills) | One implementation of the skill format, including invocation-control extensions. | Tool-specific behavior. On 2026-09-25 this package loaded in Claude Code through `/engineering-foundation` from `.claude/skills`, and Codex listed it from `.agents/skills`. |
| [Claude Code memory](https://code.claude.com/docs/en/memory) | Claude Code reads `CLAUDE.md`, not `AGENTS.md`; the documented adapter is a `CLAUDE.md` importing `@AGENTS.md`. Instructions are context, not enforcement. | Reviewed 2026-09-25; recheck before relying on it. |
| [Git hooks](https://git-scm.com/docs/githooks) | Hook locations, executable requirements, and pre-commit bypass via `--no-verify`. | Client-side hooks are editable and do not establish remote protection. |
| [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) | Required checks/reviews, unique check names, bypass behavior, skipped/neutral checks. | Must be configured remotely; availability and exact rules depend on the repository/account. |
| [GitHub secure use](https://docs.github.com/en/actions/reference/security/secure-use) | Least privilege, verified action SHA pins, untrusted PR risks, injection, runner trust boundaries. | Secure configuration still needs review and actual execution evidence. |
| [GitHub workflow triggers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) | Event configuration and required-check problems caused by path/branch filtering. | Local inspection does not prove hosted event behavior. |

## Trial action references

Read-only `git ls-remote` against the official repositories resolved these tagged releases during authoring:

- `actions/checkout` tag `v4.2.2`: `11bd71901bbe5b1630ceea73d27597364c9af683`.
- `actions/setup-python` tag `v5.6.0`: `a26af69be951a213d495a4c3e4e4022e16d87065`.

These are pinned trial dependencies, not a claim that they are the latest releases or a default for new projects. The trial workflow has not been executed on GitHub. SHA resolution verifies provenance of the reference, not a full audit of the action's implementation.
