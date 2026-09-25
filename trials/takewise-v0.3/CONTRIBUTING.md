# Contribution workflow

Use short-lived branches and PRs into main. The tech lead reviews; a second developer reviews lead-authored work. Describe behavior, affected boundaries, test evidence and migration/recovery impact. No direct pushes, force pushes or administrator bypass after protection is activated.

Run `pnpm install --frozen-lockfile --ignore-scripts` and `pnpm check`. Formatting fixes are explicit: `pnpm format`. No hook is auto-installed. CI is the shared check; local hooks may call the same command but can be bypassed.

Do not add runtime packages casually. Explain purpose, version compatibility, license, maintenance and alternatives; commit lockfiles. Review dependency install scripts before enabling any. Tooling changes need the same review as product changes. Do not suppress tests, auditing, errors or architecture checks to unblock a PR. Time-limited exceptions require lead approval and a removal condition.

The [rules](docs/engineering/rules.md) and [patterns](docs/engineering/patterns.md) define implementation expectations. Until applications exist, product checks are inactive, not verified. Creating either application input activates its required checks immediately.
