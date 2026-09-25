"""Send daily summaries to the finance webhook."""
import os

import httpx

from .parse import Order


def push_summary(orders: list[Order]) -> None:
    total = sum(o.total for o in orders)
    httpx.post(os.environ["FINANCE_WEBHOOK_URL"], json={"count": len(orders), "total": str(total)})
