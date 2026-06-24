---
tags: [aws, cloudwatch, observability, snippet]
---

# CloudWatch

AWS-native observability: **metrics**, **logs**, **alarms**, **dashboards**, and synthetic checks. The default destination for everything AWS emits.

## Metrics

- Organized by **namespace** (e.g. `AWS/Lambda`) with **dimensions** (e.g. `FunctionName`).
- Standard resolution = 1 min; **high-resolution** custom metrics down to 1 s.
- Publish custom metrics via `PutMetricData` or, cheaper at scale, **Embedded Metric Format (EMF)** in logs.
- Retention is rolled up over time (1-min data kept 15 days, then aggregated).

## Logs

- **Log groups** → **log streams**; set **retention** per group (default: never expire — always set one).
- **Metric filters** turn log patterns into metrics (then alarm on them).
- **Subscription filters** stream logs to Lambda / Firehose / Kinesis in near-real-time.
- **Logs Insights** — purpose-built query language over log groups.

## Alarms

- States: `OK`, `ALARM`, `INSUFFICIENT_DATA`.
- Actions → SNS notification, Auto Scaling, or EC2 action.
- **Composite alarms** combine multiple alarms with AND/OR to cut noise.
- Anomaly-detection alarms learn a band instead of a static threshold.

## Dashboards & More

- **Dashboards** — cross-region, cross-account metric/log widgets.
- **Synthetics canaries** — scripted checks of endpoints/flows.
- **Lambda / Container Insights** — curated per-service performance views.
- **ServiceLens** ties metrics, logs, and **X-Ray** traces together.

## Logs Insights — Copypasta

Find 5xx HTTP status codes behind an API Gateway path:

```
fields @timestamp, @message, @logStream, @log
| filter @message like /resourcePath: \/webhooks\/example/
| parse @message "status: *," as status
| filter status like /^5\d\d$/
| sort @timestamp desc
| limit 10000
```

## Metrics — CLI

```bash
aws cloudwatch get-metric-statistics \
  --namespace "AWS/Lambda" \
  --metric-name "ConcurrentExecutions" \
  --dimensions Name=FunctionName,Value=some-lambda-name \
  --statistics Sum \
  --start-time $(date -u --date='2 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time   $(date -u --date='1 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --period 3600 \
  --region us-east-1
```

> [!warning] macOS note
> `date --date=` above is GNU coreutils. On stock macOS use BSD `date`: `date -u -v-2H +%Y-%m-%dT%H:%M:%SZ`.

```bash
# Tail a log group live (great for debugging Lambda)
aws logs tail /aws/lambda/my-fn --follow --since 10m
```
