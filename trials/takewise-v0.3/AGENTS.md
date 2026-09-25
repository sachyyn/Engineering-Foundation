# Takewise engineering entry

Read [decisions and research](docs/engineering/research.md), [rules](docs/engineering/rules.md), and the relevant [recipe](docs/engineering/patterns.md) before editing. Load the task's local skills from the [skill index](docs/engineering/skills.md); project rules override upstream examples.

This repository currently contains the engineering foundation, not the ERP implementation. Do not interpret a named future path as permission to build a feature. Preserve local changes. Do not change policy to make a failing check pass; raise conflicts with the tech lead.

Run `pnpm check` from the root. Use [enforcement](docs/engineering/enforcement.md) to distinguish always-active foundation checks from automatically activated product checks. Report commands actually run, failures, and unverified behavior. Changes affecting tenants, money, permissions, stock, tokens, migrations or delivery require the corresponding recipe and evidence in review.

Do not deploy, provision, push, publish, contact customers or read production data without authorization. Reassess this foundation only when requested; no scheduled caretaker. The tech lead approves architecture exceptions and records rationale and scope in the decision record.
