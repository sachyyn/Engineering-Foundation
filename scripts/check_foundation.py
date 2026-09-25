"""Read-only structural acceptance check. Does not certify engineering quality."""

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROLES = ("entry", "research", "skill_evaluation", "rules", "patterns", "enforcement", "verification")
AREAS = (
    "product-risk", "runtime-deployment", "responsibilities", "repository-structure",
    "language-conventions", "api-contracts", "data-persistence", "identity-security",
    "frontend-interaction", "background-concurrency", "local-development",
    "verification-strategy", "performance-reliability", "ci-review", "build-supply-chain",
    "release-distribution", "cd-infrastructure", "operations-recovery", "agent-guidance",
    "maintenance-handoff",
)
CORE_AREAS = {
    "responsibilities", "repository-structure", "language-conventions", "api-contracts",
    "data-persistence", "identity-security", "verification-strategy", "agent-guidance",
}
EXCLUDED = {
    ".git", "node_modules", "vendor", ".venv", "__pycache__", "target", "dist",
    "build", "obj", "Pods", ".tox", ".next", ".nuxt", ".gradle", ".cache",
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def local_file(root, value):
    require(text(value), "artifact path must be a nonempty string")
    require(not Path(value).is_absolute(), f"path must be repository-relative: {value}")
    path = (root / value).resolve()
    require(path.is_relative_to(root), f"path escapes the repository: {value}")
    require(not EXCLUDED.intersection(path.relative_to(root).parts), f"not repository-owned: {value}")
    require(path.is_file(), f"missing artifact: {value}")
    require(bool(path.read_text(encoding="utf-8").strip()), f"empty artifact: {value}")
    if shutil.which("git"):
        result = subprocess.run(
            ["git", "check-ignore", "--quiet", "--no-index", "--", str(path)],
            cwd=root, capture_output=True, check=False,
        )
        require(result.returncode != 0, f"artifact is ignored by Git: {value}")
        require(result.returncode in (1, 128), f"cannot check Git inclusion: {value}")
    return path


def links(root, path):
    content = re.sub(r"```.*?```", "", path.read_text(encoding="utf-8"), flags=re.S)
    targets = set()
    for value in re.findall(r"\[[^\]]*\]\(([^\s)]+)\)", content):
        parsed = urlsplit(value)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        target = (path.parent / unquote(parsed.path)).resolve()
        require(target.is_relative_to(root), f"external local reference in {path}: {value}")
        require(target.exists(), f"broken local reference in {path}: {value}")
        targets.add(target)
    return targets


MACHINE_PATH = re.compile(r"(/home/[^/\s]+/|/Users/[^/\s]+/|[A-Za-z]:\\Users\\|~/\.(codex|claude|cursor|agents)/)")


def portable(root, path):
    match = MACHINE_PATH.search(path.read_text(encoding="utf-8"))
    require(not match, f"machine-specific path in {path.relative_to(root)}: {match and match.group(0)}")


def validate_skills(root, skills, routes):
    require(isinstance(skills, list) and skills, "no persistent skills recorded")
    seen = set()
    for skill in skills:
        require(isinstance(skill, dict), "skill entry must be an object")
        for field in ("name", "path", "source", "revision", "license"):
            require(text(skill.get(field)), f"skill missing {field}")
        require(skill["name"] not in seen, f"duplicate skill: {skill['name']}")
        seen.add(skill["name"])
        require(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", skill["name"]), "invalid skill name")
        require(len(skill["name"]) <= 64, "skill name too long")
        tasks = skill.get("tasks")
        require(isinstance(tasks, list) and tasks and all(text(t) for t in tasks), "skill has no task routing")
        path = local_file(root, skill["path"])
        require(path.name == "SKILL.md" and path.parent.name == skill["name"], "skill path/name mismatch")
        require(path in routes, f"skill index does not link to {skill['path']}")
        content = path.read_text(encoding="utf-8")
        require(content.startswith("---\n"), f"missing skill frontmatter: {path}")
        parts = content.split("---", 2)
        require(len(parts) == 3 and parts[2].strip(), f"empty skill instructions: {path}")
        name = re.search(r"^name:\s*['\"]?([a-z0-9-]+)['\"]?\s*$", parts[1], re.M)
        require(name and name.group(1) == skill["name"], f"skill metadata name mismatch: {path}")
        description = re.search(r"^description:[ \t]*(\S.*)$", parts[1], re.M)
        require(description, f"missing skill description: {path}")
        value = description.group(1)
        # ponytail: stdlib heuristic for the common YAML break; a real parser catches more.
        require(value[0] in "'\"|>" or ": " not in value and " #" not in value,
                f"skill description needs quotes (contains ': ' or ' #'): {path}")
        for reference in path.parent.rglob("*.md"):
            local_file(root, str(reference.relative_to(root)))
            links(root, reference)
            portable(root, reference)


def validate(root):
    root = root.resolve()
    index = local_file(root, "docs/engineering/foundation.json")
    data = json.loads(index.read_text(encoding="utf-8"))
    require(isinstance(data, dict), "artifact index must be an object")
    require(type(data.get("schema_version")) is int and data["schema_version"] == 1, "unsupported artifact index schema")
    status = data.get("status")
    require(status in {"ready", "partial", "blocked"}, "invalid foundation status")
    artifacts = data.get("artifacts")
    require(isinstance(artifacts, dict), "missing artifact map")
    files = {role: local_file(root, artifacts.get(role)) for role in ROLES}
    routed = {role: links(root, path) for role, path in files.items()}
    for role in ("rules", "patterns", "skill_evaluation"):
        require(files[role] in routed["entry"], f"agent entry does not link to {role}")
    for path in files.values():
        portable(root, path)
    claude = root / "CLAUDE.md"
    if claude.exists() and files["entry"] == root / "AGENTS.md":
        adapter = claude.resolve() == files["entry"] or re.search(
            r"^@AGENTS\.md\s*$", claude.read_text(encoding="utf-8"), re.M)
        require(adapter, "CLAUDE.md must import @AGENTS.md or link to it")
    validate_skills(root, data.get("skills"), routed["skill_evaluation"])
    areas = data.get("areas")
    require(isinstance(areas, dict), "missing decision coverage")
    for area in AREAS:
        decision = areas.get(area)
        require(isinstance(decision, dict), f"missing coverage area: {area}")
        require(decision.get("status") in {"resolved", "blocked", "deferred", "not-applicable"}, f"invalid disposition: {area}")
        require(text(decision.get("detail")), f"missing rationale: {area}")
    for field in ("blockers", "exceptions"):
        require(isinstance(data.get(field), list) and all(text(x) for x in data[field]), f"invalid {field}")
    review = data.get("substantive_review")
    require(isinstance(review, dict), "missing substantive review")
    require(review.get("status") in {"pending", "pass", "fail"}, "invalid review status")
    require(review.get("mode") in {"self", "independent"}, "review must disclose self or independent mode")
    require(text(review.get("reviewer")), "missing reviewer identity")
    local_file(root, review.get("evidence"))
    if status == "ready":
        require(review["status"] == "pass", "ready claimed without passing substantive review")
        require(review["mode"] == "independent", "ready requires an independent substantive review")
        require(not data["blockers"], "ready claimed with blockers")
        require(not data["exceptions"], "scope reductions must be reported as partial")
        require(not any(areas[area]["status"] == "blocked" for area in AREAS), "ready claimed with a blocked area")
        require(not any(areas[area]["status"] == "deferred" for area in CORE_AREAS), "ready claimed with deferred core decisions")
    return status


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repository", type=Path)
    args = parser.parse_args()
    try:
        status = validate(args.repository)
    except (ValueError, OSError, TypeError, KeyError) as error:
        print(f"STRUCTURE FAIL: {error}", file=sys.stderr)
        return 1
    print(f"STRUCTURE PASS; recorded outcome: {status}.")
    print("Content claims and review status are not independently certified by this check.")
    if not shutil.which("git"):
        print("Not verified: Git ignore rules, because Git is unavailable.")
    else:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"], cwd=args.repository,
            capture_output=True, check=False,
        )
        if result.returncode:
            print("Not verified: Git ignore rules; target is not a usable Git worktree.")
    return 0 if status == "ready" else 2


if __name__ == "__main__":
    raise SystemExit(main())
