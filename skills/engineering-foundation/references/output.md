# Required output contract

## Required roles, flexible paths

Every role below must exist after approved setup. Reuse appropriate existing files and combine roles when the contents remain clear. These are deliverables, not suggested optional files. Record their paths in `docs/engineering/foundation.json`.

| Manifest role | Required substance | Typical path |
| --- | --- | --- |
| `entry` | Mandatory task-start instructions; task routing to rules, patterns, and skill evaluation/index; verification and exception process. | `AGENTS.md` |
| `research` | Questions investigated, sources actually read, version applicability, alternatives, recommendations, tradeoffs, and uncertainties. | `docs/engineering/research.md` |
| `skill_evaluation` | Disciplines searched, queries/sources, candidates actually inspected, selection/rejection reasons, local skill paths, provenance, licenses, task routing. | `docs/engineering/skills.md` |
| `rules` | Precise component-specific MUST/MUST NOT rules and concrete enforcement or review requirements. | `docs/engineering/rules.md` |
| `patterns` | File-level recipes and illustrative examples for representative changes, including failure/security paths and test expectations. | `docs/engineering/patterns.md` |
| `enforcement` | Rule-to-check/review mapping, real commands/configuration, gaps, bypasses, and remote activation instructions. | `docs/engineering/enforcement.md` |
| `verification` | Commands, outputs/exit status, negative tests, content review findings, installed-skill portability, outstanding blockers. | `docs/engineering/verification.md` |

The decision record can be integrated with research/rules or remain a separate `foundation.md`. Additional CI, tooling, and delivery files depend on the approved stack. This table does not replace those files with documentation.

## Research and decisions

Start the research record with the confirmed requirements summary. For consequential decisions, preserve the question, fixed constraints, alternatives considered, chosen answer, who decided (the lead, or the lead's explicit delegation to your recommendation), reasons, source evidence, affected artifacts, and revisit condition. Record sources actually inspected and distinguish documented facts from your recommendation.

Every applicable area in the decision-coverage reference must be resolved to actionable instructions or explicitly blocked/deferred with consequences. Choosing a framework does not resolve architecture, and creating an empty application does not supply patterns.

Do not defer contracts, auth boundaries, tenant isolation, validation, errors, or test conventions merely because implementation has not started. Those are the foundation's job. A missing vendor decision may block its provider-specific configuration while vendor-independent release and recovery rules are still established.

## Rule precision

Each mandatory rule needs scope, concrete behavior, rationale where non-obvious, and an exact check or review criterion. Use stable rule IDs when they help diagnostics and review. Separate requirements from recommendations and record approved exceptions.

Cover every component and their interactions. For a web/API system, resolve controller/service/data responsibilities, DTO/schema authority, validation and error translation, authentication/session handling, authorization/tenancy, frontend state and fetching, caching/retry policy, forms/accessibility, migrations, test boundaries, and delivery responsibilities as applicable.

"Use best practices," "backend owns auth," and "write tests" are insufficient alone. A rule must tell the next agent what to do and what would violate it.

Keep the entry short; put detail behind explicit task pointers. Short entry files are not permission to omit the detail.

## Pattern playbook

For each representative development workflow, specify:

- Files/modules to add or extend, with naming and dependency direction.
- Request/data/control flow, including trust boundaries and failure paths.
- A concrete approved recipe with a short illustrative code or configuration snippet where ambiguity would remain.
- What to reuse and what must not be introduced.
- Required tests, prohibited shortcuts, and the check command.

Choose workflows that exercise the project's important boundaries. A full-stack tenant application should include a protected tenant-scoped API operation and its frontend consumer, plus the corresponding denial/error tests. A CLI might need command parsing, filesystem access, error/exit behavior, and tests. A Rust library needs public API, error/ownership, feature, and compatibility patterns instead.

Reference real existing implementations only after checking what is safe to copy. In a new repository, document concrete future paths and examples without writing unauthorized product code. Illustrative application snippets belong in fenced blocks inside documentation or SKILL.md, not standalone files under application source directories. Executable product examples need separate approval. Naming paths in a recipe does not require creating empty folders.

## Persistent skills and routing

Install the approved skill set as actual repository-owned files. Default neutral location: `.agents/skills/<name>/SKILL.md`, with all required references/scripts/notices. Use an existing appropriate convention or a verified tool-native location instead where warranted. Never depend on absolute home-directory paths, global installs, transient sessions, or external symlinks.

Every relevant discipline needs an installed suitable skill or a project-authored, researched skill covering its rules and workflow. Consolidate related tasks where sensible; do not install irrelevant packages to increase the count. A complete foundation contains usable local skills. Omitting the skill deliverable requires a specifically approved scope reduction and a partial/narrowed outcome.

Record each skill's source, revision, license, modifications, why it fits, and which tasks load it. For project-authored skills, use `project-authored` as source/revision, record the project's licensing decision rather than inventing one, and cite the research used. Do not copy third-party text without appropriate reuse rights/notices.

The entry must link to the rules, patterns, and skill evaluation/index. That index must link to every installed SKILL.md and map concrete task types to the files to read. Native discovery is an additional convenience: a direct-file route must still work.

## Tool adapters

Ask which coding tools the team uses, then add the smallest adapter that makes each tool load the one authoritative entry. Never copy the rules into a second file. Verify current tool documentation before writing an adapter and preserve existing files.

| Tool | Loads | Adapter |
| --- | --- | --- |
| Codex, Cursor, and other AGENTS.md tools | `AGENTS.md` | None beyond the entry. Verify the specific tool. |
| Claude Code | `CLAUDE.md`, not `AGENTS.md` | `CLAUDE.md` containing `@AGENTS.md`, plus only Claude-specific notes. |
| Other tools | Tool-specific | Research the current documented mechanism; otherwise give the lead a direct-file prompt and mark native loading unverified. |

Native skill folders also differ (for example `.agents/skills` and `.claude/skills`). Keep one canonical copy. The entry's direct links make skills usable in any tool that loads the entry; add a native mirror only when the lead wants native invocation and the mirror is verified. Test each adapter in the actual tool when available.

## Artifact index

Write `docs/engineering/foundation.json` as a small machine-readable index, not a substitute for the actual guidance. Required fields:

- `schema_version`: `1`.
- `status`: `ready`, `partial`, or `blocked`. Follow the acceptance rubric.
- `artifacts`: all seven roles above mapped to repository-relative file paths.
- `areas`: all IDs below mapped to objects containing `status` and `detail`. Area status is `resolved`, `blocked`, `deferred`, or `not-applicable`; detail explains the decision/reference or gap. These are technical dispositions, not invented approval.
- `skills`: nonempty array of objects with `name`, `path`, `source`, `revision`, `license`, and nonempty `tasks` array. `path` points to SKILL.md; `name` matches its directory/frontmatter.
- `blockers`: array of concrete unfinished core work or unavailable required verification. Empty only when none remains.
- `exceptions`: array describing specifically approved scope reductions, their effects, and approval source. Empty when none.
- `substantive_review`: object with `status` (`pending`, `pass`, or `fail`), `mode` (`self` or `independent`), `reviewer`, and `evidence` pointing to the local report file. A mode label records who reviewed; it does not prove the review is valid. `ready` requires `independent`.

Use these area IDs, matching the decision coverage rows in order:

```text
product-risk
runtime-deployment
responsibilities
repository-structure
language-conventions
api-contracts
data-persistence
identity-security
frontend-interaction
background-concurrency
local-development
verification-strategy
performance-reliability
ci-review
build-supply-chain
release-distribution
cd-infrastructure
operations-recovery
agent-guidance
maintenance-handoff
```

For example, an area entry can be:

```json
"api-contracts": {
  "status": "resolved",
  "detail": "OpenAPI is generated from the backend schema; rules API-01..04 and the protected-operation recipe define ownership and compatibility."
}
```

Use JSON strings/arrays, not placeholder markers. A blocked item needs a real reason, not a fake completed artifact. Do not set review to `pass` until the actual content review has run.

The core areas `responsibilities`, `repository-structure`, `language-conventions`, `api-contracts`, `data-persistence`, `identity-security`, `verification-strategy`, and `agent-guidance` cannot be deferred in a ready foundation. Resolve applicable conventions now, or report partial. Use not-applicable only with a genuine project-specific reason, never to hide unfinished work. Non-core deferrals still require a substantive judgment that they do not prevent compliant development.

Use inline Markdown links for the required entry and skill-index routes so the structural checker can verify them. It checks inline links, not every possible Markdown link syntax. Review other reference forms explicitly.

The validator checks structure and local routing, not the truth or depth of the content. A malicious or careless author can write false claims; review and behavioral trials remain required. Keep the index updated during explicit reassessment. Where practical, wire structural consistency into the target's agreed quality command using its native tools or a reviewed copy of the bundled Python check. Do not introduce Python into a non-Python product without agreement.

## Reassessment

Read the existing artifacts and local edits. Propose only decisions affected by the new requirement, preserve valid choices and unrelated content, obtain targeted approval, and recheck affected artifacts. A no-change invocation should normally produce no diff. Ordinary CI may run automatically; this setup workflow must not become a scheduled caretaker.
