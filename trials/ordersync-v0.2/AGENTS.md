# ordersync

- Money is always `Decimal`, never float.
- Run `uv run pytest` before finishing.

Before changing this repository, read the applicable [rules](docs/engineering/rules.md),
[worked patterns](docs/engineering/patterns.md), and [skill routing](docs/engineering/skills.md).
These apply to humans, Codex, and Claude Code. Follow direct file links when native
skill discovery is unavailable. Do not rely on a previous session's memory.

- CSV, money, or schema work: read the local `ordersync-data` skill.
- HTTP, retries, S3, status, or recovery: read `ordersync-delivery`; also read
  `ordersync-data` for payload changes.
- Tooling, dependencies, checks, releases, or guidance: read `ordersync-maintenance`.
- Tests follow the skill for the behavior they exercise.

Run `bash scripts/check.sh` before handing off changes. It sets repository-local uv
paths and includes the required pytest command. For a standalone test run use
`UV_CACHE_DIR="$PWD/.cache/uv" UV_PYTHON_DOWNLOADS=never uv run pytest`.
Never run the production CLI as a smoke test: it posts to finance.

Preserve unrelated edits. Do not weaken checks to pass a change. Record existing
failures separately; policy exceptions require explicit lead approval with exact
scope, consequence, and revisit condition. Ordinary product tasks do not rerun
foundation setup. See [enforcement and activation](docs/engineering/enforcement.md).
