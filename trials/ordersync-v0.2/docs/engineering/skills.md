# Skill evaluation and routing

Evaluation date: 2026-09-25. No repository skills existed at discovery. Searches
covered Python/testing, architecture/integrations, security, finance data/retries,
and GitHub delivery. UI skills are inapplicable to this CLI and JSON report.

Queries included `agent skills SKILL.md Python testing security github actions
skills.sh`, `site:skills.sh wshobson python-testing-patterns github-actions-templates
python architecture`, `site:github.com openai skills security-best-practices
SKILL.md`, and `site:skills.sh Python Decimal CSV financial data S3 idempotency retry
skill`. Search discovery used public registry results; decisions below use actual
upstream file contents, not popularity.

| Candidate inspected | Decision |
| --- | --- |
| [wshobson python-testing-patterns](https://github.com/wshobson/agents/blob/main/plugins/python-development/skills/python-testing-patterns/SKILL.md) | Initially rejected in favor of narrower project instructions. Reassessment below supersedes that decision: recommend adoption with project overrides, pending approval. No material copied or installed. |
| [wshobson architecture-patterns](https://github.com/wshobson/agents/blob/main/plugins/backend-development/skills/architecture-patterns/SKILL.md) | Entire entry inspected. Mandatory abstraction at every boundary and DDD layers exceed a three-module job; reject without importing its expanded reference tree. |
| [wshobson github-actions-templates](https://github.com/wshobson/agents/blob/main/plugins/cicd-automation/skills/github-actions-templates/SKILL.md) | Entire entry inspected. Examples use mutable action tags, cloud deployments and notifications; self-hosted-runner advice does not fit untrusted PRs. Reject, no scripts/assets executed or installed. |
| [OpenAI security-best-practices](https://github.com/openai/skills/blob/main/skills/.curated/security-best-practices/SKILL.md) and references directory listing | Entry inspected; Python references target Django/FastAPI/Flask, with no plain batch-job guide. No need to load irrelevant framework references. Reject for scope; license not evaluated for copying because none is copied. |
| [samber api-idempotency-retry](https://github.com/samber/developer-platform-skills/blob/main/skills/api-idempotency-retry/SKILL.md) | Entry inspected through key/TTL design; frontmatter expressly excludes webhook delivery and targets public API providers. MIT declared in metadata, not independently licensed for vendoring. Reject; do not adopt its unverified standards/history claims. |

These are evaluations of accessed mutable upstream snapshots, not claims of
immutable provenance for an installation. No upstream skill is installed. Original
project instructions use primary-source research in [research](research.md).

## Installed canonical skills

- [ordersync-data](../../.claude/skills/ordersync-data/SKILL.md): CSV, Decimal,
  Python module design, schemas, validation, data-focused tests.
- [ordersync-delivery](../../.claude/skills/ordersync-delivery/SKILL.md): HTTP/S3,
  idempotency, concurrency, state, status, privacy, retention and failure tests.
- [ordersync-maintenance](../../.claude/skills/ordersync-maintenance/SKILL.md):
  dependencies, local checks, CI, secure delivery, runbooks and policy review.

All are project-authored internal guidance: data and delivery revision 2,
maintenance revision 1. No public license grant is
declared; the repository had no license. No third-party skill text, scripts, dynamic
shell expansion, network upload, global configuration, or credential access is
embedded. The simulated lead approved these exact locations and scopes.

Claude's native project folder is used because `.agents` is read-only in this trial.
Codex receives direct-file routes from AGENTS.md; native Codex skill discovery is
not claimed. CLAUDE.md imports AGENTS.md to keep one policy. Every skill references
local rules/patterns, so its complete workflow survives a checkout. Native loading
in fresh clients must be separately evidenced; file checks alone do not prove it.

## Scoped reassessment after independent review

On 2026-09-25 re-read the supplied SKILL.md and references/research.md. The package
still labels itself 0.2.0 but now prefers official vendor skills, then maintained
community skills; minor style differences need recorded project overrides.
The prior rejection of python-testing-patterns was too broad: its pytest knowledge
complements the domain-specific skills rather than needing to encode all domain rules.

Proposal defaults (existing approved defaults stay in force):

| Default | Disposition | Reason |
| --- | --- | --- |
| Git | applied | Existing repository, no Git mutations proposed. |
| GitHub / Actions | applied | Existing approved check-only workflow is unchanged. |
| Docker | not used | No local services; existing OS Python workflow remains. |
| Skill sources | changed | Propose adding maintained community testing guidance alongside project-specific skills, after checking vendor sources first. |

Vendor-first search: `official pytest-dev astral-sh encode HTTPX agent skills
SKILL.md Python testing`. Results exposed community and testing-platform skills,
not a verified skill from pytest-dev, Astral, or Encode. The community skill named
`pytest-dev` belongs to BjornMelin, not the pytest organization; LambdaTest's skill
is not an official pytest-maintainer skill. This limited search does not prove no
vendor skill exists. No new framework is being selected in this reassessment.

**Recommend adoption, not installed:** `wshobson/agents`'s
[python-testing-patterns at reviewed revision](https://github.com/wshobson/agents/blob/be57c0b2e3c05c528ca6132b87410b385718775f/plugins/python-development/skills/python-testing-patterns/SKILL.md),
commit `be57c0b2e3c05c528ca6132b87410b385718775f`. The
[path-specific commit history](https://api.github.com/repos/wshobson/agents/commits?path=plugins/python-development/skills/python-testing-patterns&per_page=1)
records a 2026-05-22 maintenance/refactoring commit. Registry discovery plus this
activity supports consideration as maintained community guidance, not a guarantee
that every example is current. Fully read the pinned SKILL.md, both referenced
Markdown files (`details.md`, `advanced-patterns.md`), and root MIT LICENSE.

Proposed destination: `.claude/skills/python-testing-patterns/`, containing the
entry, both references and LICENSE retaining Seth Hobson's copyright. Keep content
unchanged except one recorded link repair: in `references/details.md`, change
`references/advanced-patterns.md` to sibling `advanced-patterns.md`. At the pinned
revision the existing relative link would otherwise point to a nonexistent nested
references directory. Do not install the upstream marketplace, adapters or scripts.

The inspected payload is instructional Markdown. Its example commands include pip
installs, pytest/coverage invocation and CI uploads; none was executed. Useful
content covers fixtures, parametrization, mocking, exception paths, tmp_path,
monkeypatch and retry exhaustion. Generic examples are illustrative, not validated
ordersync code; async/database sections do not apply to this synchronous job.

Record these project overrides if adoption is approved:

- MONEY-01/CONTRACT-01: use Decimal for money and the ordersync payload; generic
  float examples do not authorize float amounts or replacing HTTPX with requests.
- TEST-01: use synthetic fixtures, injected clocks/sleep and HTTPX MockTransport;
  no real sleeps, ambient production environment or new async/database dependencies.
- CHECK-01: keep flat `tests/test_<module>.py`, the shared uv command and locked
  dependencies. No automatic freezegun/Hypothesis/coverage plugin install and no
  arbitrary coverage percentage, placeholder tests or blanket skips.
- RELEASE-01: existing pinned, check-only CI overrides upstream CI snippets and
  external coverage uploads. No pip/global installs or new workflow from examples.

These preserve the core testing techniques; they do not rewrite most of the skill.
Future approved routing would have data/delivery skills point to the adopted skill
for testing technique while retaining this project's contracts. Add provenance to
foundation.json and validate all local links at installation time. The installed
skill array intentionally still lists only the three approved project skills.

The other earlier rejections remain substantial scope mismatches, not style
objections: architecture-patterns centers layered/DDD architecture; OpenAI security
references target web frameworks absent here; api-idempotency-retry targets API
providers and explicitly excludes webhook delivery. github-actions-templates is
predominantly unrelated deployment/platform templates; replacing them with this
job's check-only Python workflow would override most of that skill. No adoption
of those candidates is proposed. No external skill was installed in this correction.
