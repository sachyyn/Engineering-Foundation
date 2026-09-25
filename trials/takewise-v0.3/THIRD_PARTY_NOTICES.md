# Third-party notices

Project-authored files are proprietary. Vendored skills retain MIT licenses stored beside each SKILL.md. Exact repositories/revisions, local modifications and routing are in [skill evaluation](docs/engineering/skills.md) and `tooling/skill-provenance.json`.

Root npm dependencies retain upstream licenses in installed packages; `pnpm licenses list --json` produces the inventory. actionlint is MIT, distributed by rhysd/actionlint; its archive license is retained in the ignored tools directory. Applications must generate their own Composer and npm inventories upon activation; Playwright/TypeScript use Apache-2.0 and axe-core uses MPL-2.0. Do not redistribute without reviewing notices and the actual resolved tree.
