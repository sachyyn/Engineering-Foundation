"""Reject direct binary-float construction in money-owning modules.

This is a syntax guard, not dataflow analysis. Review covers aliases and values
received from dependencies. Durations in integration modules may use floats.
"""

import ast
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    paths = [root / "src/ordersync/parse.py"]
    # Future pure monetary code belongs here; recursive discovery covers additions.
    paths.extend((root / "src/ordersync/money").rglob("*.py"))
    errors = []
    for path in paths:
        for node in ast.walk(ast.parse(path.read_text(), filename=str(path))):
            literal = isinstance(node, ast.Constant) and isinstance(node.value, float)
            constructor = (
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Name)
                and node.func.id == "float"
            )
            if (literal or constructor) and isinstance(node, (ast.Constant, ast.Call)):
                errors.append(
                    f"MONEY-01 {path.relative_to(root)}:{node.lineno}: "
                    "use Decimal from text; see docs/engineering/rules.md"
                )
    for error in errors:
        print(error)
    return int(bool(errors))


if __name__ == "__main__":
    raise SystemExit(main())
