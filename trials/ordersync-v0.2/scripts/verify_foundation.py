"""Run foundation acceptance mutations in a disposable repository-local copy.

No product feature tests are added. This verifies the gates themselves. Invoke
explicitly with `uv run python scripts/verify_foundation.py`; not on every PR.
"""

import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    trial_parent = root / ".foundation-trials"
    trial_parent.mkdir(exist_ok=True)
    records: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix="acceptance-", dir=trial_parent) as tmp:
        trial = Path(tmp)
        for name in (
            "src", "tests", "scripts", "docs", ".claude", ".github",
            "AGENTS.md", "CLAUDE.md", "README.md", "pyproject.toml",
            "uv.lock", ".python-version", ".gitignore",
        ):
            source = root / name
            if source.is_symlink():
                raise RuntimeError(f"Refuse symlink: {name}")
            if source.is_dir():
                if any(p.is_symlink() for p in source.rglob("*")):
                    raise RuntimeError(f"Refuse nested symlink: {name}")
                shutil.copytree(source, trial / name, ignore=shutil.ignore_patterns("__pycache__"))
            else:
                shutil.copy2(source, trial / name)
        env = os.environ.copy()
        env.update(
            UV_CACHE_DIR=str(trial / ".cache/uv"),
            UV_PROJECT_ENVIRONMENT=str(trial / ".venv"),
            UV_PYTHON="python3.12",
            UV_PYTHON_DOWNLOADS="never",
            PYTHONDONTWRITEBYTECODE="1",
            # A copy is not a Git checkout; don't inherit ancestor ignore rules.
            GIT_CEILING_DIRECTORIES=str(root),
        )

        def run(label: str, command: list[str], expected: int, marker: str = "") -> None:
            result = subprocess.run(command, cwd=trial, env=env, capture_output=True, text=True)
            output = (result.stdout + result.stderr).replace(str(trial), "<trial>")
            output = output.replace(str(root), "<repository>")
            records.append({"trial": label, "command": command, "exit": result.returncode,
                            "expected_exit": expected, "output": output})
            if result.returncode != expected or marker not in output:
                raise RuntimeError(f"{label}: unexpected result {result.returncode}\n{output}")
            print(f"PASS {label}: exit {result.returncode}", flush=True)

        def mutate(label: str, relative: str, content: str, command: list[str],
                   expected: int, marker: str) -> None:
            path = trial / relative
            original = path.read_bytes() if path.exists() else None
            path.parent.mkdir(parents=True, exist_ok=True)
            try:
                path.write_text(content)
                run(label, command, expected, marker)
            finally:
                if original is None:
                    path.unlink()
                else:
                    path.write_bytes(original)

        status = json.loads((trial / "docs/engineering/foundation.json").read_text())["status"]
        baseline_exit = 0 if status == "ready" else 2
        run("clean-copy shared gate", ["bash", "scripts/check.sh"], baseline_exit, "STRUCTURE PASS")
        parse = (trial / "src/ordersync/parse.py").read_text()
        mutate("existing-file money violation", "src/ordersync/parse.py",
               parse + '\nprobe = float("1.25")\n',
               ["uv", "run", "python", "scripts/check_money.py"], 1, "MONEY-01")
        mutate("new-file money violation", "src/ordersync/money/probe.py", "probe = 0.1\n",
               ["uv", "run", "python", "scripts/check_money.py"], 1, "MONEY-01")
        mutate("forbidden import", "src/ordersync/parse.py", parse + "\nfrom . import cli\n",
               ["uv", "run", "lint-imports", "--no-cache"], 1, "BROKEN")
        mutate("new-file type violation", "src/ordersync/type_probe.py", 'amount: int = "bad"\n',
               ["uv", "run", "mypy"], 1, "Incompatible types")
        mutate("new-file unsafe eval", "src/ordersync/security_probe.py", 'eval("1 + 1")\n',
               ["uv", "run", "ruff", "check", "src", "tests", "scripts"], 1, "S307")
        mutate("failing test", "tests/test_gate_probe.py", "def test_gate_probe():\n    assert False\n",
               ["uv", "run", "pytest", "-q"], 1, "failed")
        test = (trial / "tests/test_parse.py").read_text()
        mutate("zero tests", "tests/test_parse.py", test.replace("def test_", "def check_"),
               ["uv", "run", "pytest", "-q", "tests"], 5, "no tests ran")
        manifest = (trial / "pyproject.toml").read_text()
        mutate("stale lock", "pyproject.toml", manifest.replace("httpx>=0.27", "httpx>=0.28"),
               ["uv", "sync", "--locked", "--all-groups"], 1, "lockfile")
        skill = trial / ".claude/skills/ordersync-data/SKILL.md"
        original_skill = skill.read_bytes()
        try:
            skill.unlink()
            run("missing skill", ["uv", "run", "python", "scripts/check_foundation.py", "."],
                1, "broken local reference")
        finally:
            skill.write_bytes(original_skill)
        run("restored shared gate", ["bash", "scripts/check.sh"], baseline_exit, "STRUCTURE PASS")
    (root / "docs/engineering/trial-results.json").write_text(json.dumps(records, indent=2) + "\n")
    print("Acceptance copy removed; evidence: docs/engineering/trial-results.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
