# ordersync

Nightly job: reads the order export CSV and posts a summary to the finance webhook.
Runs from cron on the ops box: `ordersync /data/exports/orders.csv`.
- TODO(dana): retry the webhook on 5xx
