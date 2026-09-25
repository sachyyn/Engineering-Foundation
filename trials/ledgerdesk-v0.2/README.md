# Ledgerdesk

Foundation for a hosted, online-only, multi-tenant ERP for small service firms.
The application has not been implemented. Vue 3/TypeScript, Symfony 7.4/PHP 8.4,
and PostgreSQL 18 are the approved stack. Node 22 is build/check tooling.

Start with [AGENTS.md](AGENTS.md), the [decisions and evidence](docs/engineering/research.md),
and the [implementation recipes](docs/engineering/patterns.md).

## Local checks

Use Node 22.23.1 and npm 10.9.8 (the checked toolchain requires this patch or newer within 22.x).
No global installation is required by this repository.

```sh
npm ci --ignore-scripts
npm run tools:setup
npm run check
npm run check:product
```

`check` validates the foundation and invokes product checks if product inputs exist.
`check:product` deliberately fails while application inputs are absent. It does not
turn an empty suite into a successful product test. `npm run format` is the explicit
formatting command. `npm run check:negative` tests selected guards in a local disposable
copy; it is not a product test.

The proposed future layout is `frontend/`, `backend/`, and `contracts/`. Only
configuration and documentation may exist there until product work is authorized.
Local PostgreSQL and mail catcher definitions are in [compose.yaml](compose.yaml).
See [operations and setup](docs/engineering/operations.md) before running services.

`tools:setup` downloads the official checksum-pinned actionlint binary into `tooling/bin`
on Linux x64 (or WSL). It does not install globally. Other platforms need a reviewed
matching artifact; that portability is not verified in this trial.

The current [verification report](docs/engineering/verification.md) distinguishes
local checks, proxy trials, and unavailable runtime/hosted checks. Do not infer
production readiness from foundation validation.
