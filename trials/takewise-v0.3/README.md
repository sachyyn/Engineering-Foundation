# Takewise

Private client ERP foundation: Vue frontend, Symfony backend, PostgreSQL persistence. Product implementation has not started.

Start with [engineering decisions](docs/engineering/research.md), [contribution workflow](CONTRIBUTING.md), and [agent entry](AGENTS.md). Foundation status and exact verification are in [verification](docs/engineering/verification.md).

Use Node 24.21.0 and pnpm 10.32.1. Run `pnpm install --frozen-lockfile --ignore-scripts`, then `pnpm setup:tools` and `pnpm check`. Foundation checks work without PHP, Docker or product code. Application activation is described in [tooling](tooling/README.md).

For future application development, install PHP 8.5 with Composer 2 and Docker Compose v2. Copy `.env.example` to `.env` and choose a local database password; never commit `.env`. Run `docker compose up -d`, then follow the application activation recipe. Mac and Linux use the same commands; no global hooks or tools are installed by this repository.

No remote repository, branch protection, hosting or production delivery has been configured. [Delivery handoff](docs/engineering/delivery.md) lists activation work.
