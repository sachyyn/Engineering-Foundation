import sys
from pathlib import Path

from .parse import read_orders
from .push import push_summary


def main() -> None:
    orders = read_orders(Path(sys.argv[1]))
    push_summary(orders)
    print(f"sent {len(orders)} orders")
