"""Parse the nightly order export."""
import csv
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path


@dataclass(frozen=True)
class Order:
    order_id: str
    customer: str
    total: Decimal


def read_orders(path: Path) -> list[Order]:
    with path.open(newline="") as handle:
        return [
            Order(row["order_id"], row["customer"], Decimal(row["total"]))
            for row in csv.DictReader(handle)
        ]
