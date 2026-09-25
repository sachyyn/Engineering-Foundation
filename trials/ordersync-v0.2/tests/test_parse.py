from decimal import Decimal

from ordersync.parse import read_orders


def test_reads_decimal_totals(tmp_path):
    export = tmp_path / "orders.csv"
    export.write_text("order_id,customer,total\nA1,Acme,10.50\n")
    assert read_orders(export)[0].total == Decimal("10.50")
