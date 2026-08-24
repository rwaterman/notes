---
tags: [aws, cloudwatch, observability, snippet]
---

# CloudWatch

AWS-native **metrics**, **logs**, **alarms**, and **dashboards**. Default sink for everything AWS emits.

## Metrics

- **Namespace** (`AWS/Lambda`) + **dimensions** (`FunctionName`). Standard resolution 1 min; high-resolution custom metrics down to 1 s.
- Custom metrics: `PutMetricData`, or **Embedded Metric Format (EMF)** in logs — cheaper at scale.
- Retention rolls up: 1-min data kept 15 days, then aggregated.

## Logs

- **Log group** → **log streams**. Default retention is *never expire* — always set one.
- **Metric filters** turn log patterns into metrics; alarm on those.
- **Subscription filters** stream to Lambda / Firehose / Kinesis.
- **Logs Insights** — query language over log groups.

## Alarms

- States: `OK`, `ALARM`, `INSUFFICIENT_DATA`. Actions: SNS, Auto Scaling, EC2.
- **Composite alarms** AND/OR several alarms to cut noise. **Anomaly detection** alarms learn a band instead of a static threshold.

## Snippets

```bash
# Tail a log group live
aws logs tail /aws/lambda/my-fn --follow --since 10m

# Log groups with no retention set
aws logs describe-log-groups \
  --query 'logGroups[?!retentionInDays].logGroupName' --output text

# ...then set one on each
aws logs describe-log-groups \
  --query 'logGroups[?!retentionInDays].logGroupName' --output text \
  | xargs -n1 -I{} aws logs put-retention-policy --log-group-name {} --retention-in-days 30
```

```bash
# Metric statistics for the previous full hour (BSD date — macOS; Linux: date -u -d '2 hours ago')
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda --metric-name ConcurrentExecutions \
  --dimensions Name=FunctionName,Value=my-fn \
  --statistics Sum --period 3600 \
  --start-time "$(date -u -v-2H +%Y-%m-%dT%H:%M:%SZ)" \
  --end-time   "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)"
```

Logs Insights — 5xx responses behind an API Gateway path:

```
fields @timestamp, @message, @logStream, @log
| filter @message like /resourcePath: \/webhooks\/example/
| parse @message "status: *," as status
| filter status like /^5\d\d$/
| sort @timestamp desc
| limit 10000
```
