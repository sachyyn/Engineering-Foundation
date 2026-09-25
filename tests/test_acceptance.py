"""Structural contract regression tests. Synthetic content is not a quality review."""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from scripts.check_foundation import AREAS, ROLES, validate

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/check_foundation.py"


class StructuralAcceptance(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="foundation-contract-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.artifacts = {role: f"docs/engineering/{role}.md" for role in ROLES}
        self.artifacts["entry"] = "AGENTS.md"
        for name in self.artifacts.values():
            self.put(name, "# Synthetic contract fixture\n\nNot substantive acceptance evidence.\n")
        self.put("AGENTS.md", "\n".join(
            f"[{role}]({self.artifacts[role]})" for role in ("rules", "patterns", "skill_evaluation")
        ))
        self.skill = ".agents/skills/example/SKILL.md"
        self.put(self.skill, "---\nname: example\ndescription: Example fixture skill.\n---\n\n# Example\n\nSynthetic instructions.\n")
        self.put(self.artifacts["skill_evaluation"], f"[Example](../../{self.skill})\n")
        self.data = {
            "schema_version": 1, "status": "ready", "artifacts": self.artifacts,
            "areas": {area: {"status": "resolved", "detail": "Synthetic fixture."} for area in AREAS},
            "skills": [{"name": "example", "path": self.skill, "source": "project-authored",
                        "revision": "project-authored", "license": "test fixture", "tasks": ["fixture"]}],
            "blockers": [], "exceptions": [],
            "substantive_review": {"status": "pass", "mode": "independent", "reviewer": "synthetic fixture, not a real review",
                                   "evidence": self.artifacts["verification"]},
        }
        self.save()

    def put(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)

    def save(self):
        self.put("docs/engineering/foundation.json", json.dumps(self.data))

    def test_shape_pass_is_not_a_content_quality_certificate(self):
        self.assertEqual(validate(self.root), "ready")

    def test_omitted_core_deliverables_fail(self):
        for role in ("research", "rules", "patterns", "skill_evaluation"):
            with self.subTest(role=role):
                path = self.root / self.artifacts[role]
                original = path.read_text()
                path.write_text("")
                with self.assertRaisesRegex(ValueError, "empty artifact"):
                    validate(self.root)
                path.write_text(original)
        self.data["skills"] = []
        self.save()
        with self.assertRaisesRegex(ValueError, "no persistent skills"):
            validate(self.root)

    def test_broken_task_routing_fails(self):
        self.put(self.artifacts["skill_evaluation"], "Skills exist somewhere.\n")
        with self.assertRaisesRegex(ValueError, "does not link"):
            validate(self.root)

    def test_skill_reference_and_external_symlink_fail(self):
        path = self.root / self.skill
        original = path.read_text()
        path.write_text(original + "\n[Missing](missing.md)\n")
        with self.assertRaisesRegex(ValueError, "broken local reference"):
            validate(self.root)
        path.unlink()
        path.symlink_to(SCRIPT)
        with self.assertRaisesRegex(ValueError, "external local reference"):
            validate(self.root)

    def test_ignored_skill_fails(self):
        subprocess.run(["git", "init", "--template=", "--quiet", str(self.root)], check=True)
        self.put(".gitignore", ".agents/\n")
        with self.assertRaisesRegex(ValueError, "ignored by Git"):
            validate(self.root)

    def test_unreviewed_ready_and_unaccounted_areas_fail(self):
        self.data["substantive_review"]["status"] = "pending"
        self.save()
        with self.assertRaisesRegex(ValueError, "without passing substantive review"):
            validate(self.root)
        self.data["substantive_review"]["status"] = "pass"
        del self.data["areas"]["api-contracts"]
        self.save()
        with self.assertRaisesRegex(ValueError, "missing coverage area"):
            validate(self.root)

    def test_blockers_prevent_ready_and_partial_has_distinct_exit(self):
        self.data["blockers"] = ["Required research unavailable"]
        self.save()
        with self.assertRaisesRegex(ValueError, "ready claimed with blockers"):
            validate(self.root)
        self.data["status"] = "partial"
        self.save()
        result = subprocess.run([sys.executable, str(SCRIPT), str(self.root)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assertIn("STRUCTURE PASS", result.stdout)

    def test_self_review_cannot_claim_ready(self):
        self.data["substantive_review"]["mode"] = "self"
        self.save()
        with self.assertRaisesRegex(ValueError, "independent substantive review"):
            validate(self.root)
        self.data["status"] = "partial"
        self.save()
        self.assertEqual(validate(self.root), "partial")

    def test_deferred_core_decisions_cannot_claim_ready(self):
        self.data["areas"]["api-contracts"]["status"] = "deferred"
        self.save()
        with self.assertRaisesRegex(ValueError, "deferred core decisions"):
            validate(self.root)

    def test_missing_git_worktree_is_disclosed(self):
        result = subprocess.run([sys.executable, str(SCRIPT), str(self.root)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("not a usable Git worktree", result.stdout)

    def test_machine_specific_paths_fail(self):
        for leak in ("/home/alex/.codex/AGENTS.md", "~/.claude/skills/x"):
            with self.subTest(leak=leak):
                self.put(self.skill, self.put_skill_text() + f"\nSee {leak}\n")
                with self.assertRaisesRegex(ValueError, "machine-specific path"):
                    validate(self.root)
        self.put(self.skill, self.put_skill_text())
        self.assertEqual(validate(self.root), "ready")
        self.put(self.artifacts["verification"], "Ran python3 /home/alex/engineering-foundation/scripts/check_foundation.py\n")
        with self.assertRaisesRegex(ValueError, "machine-specific path"):
            validate(self.root)

    def test_bad_skill_records_fail(self):
        cases = {
            "duplicate skill": lambda: self.data["skills"].append(dict(self.data["skills"][0])),
            "path/name mismatch": lambda: self.data["skills"][0].update(name="other"),
        }
        for message, mutate in cases.items():
            with self.subTest(message=message):
                original = json.dumps(self.data)
                mutate()
                self.save()
                with self.assertRaisesRegex(ValueError, message):
                    validate(self.root)
                self.data = json.loads(original)
                self.save()
        self.put(self.skill, "# No frontmatter\n")
        with self.assertRaisesRegex(ValueError, "missing skill frontmatter"):
            validate(self.root)

    def test_unquoted_colon_in_skill_description_fails(self):
        self.put(self.skill, "---\nname: example\ndescription: Does X: then Y.\n---\n\nBody\n")
        with self.assertRaisesRegex(ValueError, "needs quotes"):
            validate(self.root)
        self.put(self.skill, "---\nname: example\ndescription: \"Does X: then Y.\"\n---\n\nBody\n")
        self.assertEqual(validate(self.root), "ready")

    def test_claude_adapter_must_import_entry(self):
        self.put("CLAUDE.md", "# Separate copy of the rules\n")
        with self.assertRaisesRegex(ValueError, "CLAUDE.md must import"):
            validate(self.root)
        self.put("CLAUDE.md", "@AGENTS.md\n\n## Claude Code\n")
        self.assertEqual(validate(self.root), "ready")

    def put_skill_text(self):
        return "---\nname: example\ndescription: Example fixture skill.\n---\n\n# Example\n\nSynthetic instructions.\n"

    def test_legacy_empty_output_cannot_pass(self):
        (self.root / "docs/engineering/foundation.json").unlink()
        with self.assertRaisesRegex(ValueError, "missing artifact"):
            validate(self.root)


if __name__ == "__main__":
    unittest.main(verbosity=2)
