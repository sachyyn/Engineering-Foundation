#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export UV_CACHE_DIR="$PWD/.cache/uv"
export UV_PYTHON_DOWNLOADS=never
export UV_PYTHON=python3.12
export UV_PROJECT_ENVIRONMENT="$PWD/.venv"
export PYTHONDONTWRITEBYTECODE=1
uv sync --locked --all-groups
export UV_LOCKED=1
uv run ruff check src tests scripts
uv run mypy
uv run lint-imports
uv run python scripts/check_money.py
uv run pytest
uv build --wheel --no-build-isolation
uv run python scripts/check_foundation.py .
