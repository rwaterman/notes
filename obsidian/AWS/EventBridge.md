---
tags: [aws, eventbridge, messaging, event-driven, serverless]
---

# EventBridge

Serverless **event bus**. Sources publish events; **rules** match them by pattern and route to targets. The backbone of event-driven architecture on AWS, and the modern replacement for CloudWatch Events.

## Event Buses

- **Default bus** — receives AWS service events (S3, EC2 state changes, etc.).
- **Custom bus** — your application's domain events.
- **Partner bus** — SaaS sources (Datadog, Shopify, Stripe, …).

## Rules

- Match on an **event pattern** (JSON filter over the event envelope/detail).
- Up to 5 **targets** per rule: Lambda, Step Functions, SQS, SNS, Kinesis, API destinations (any HTTP API), and more.
- **Input transformer** reshapes the event before delivery.

```json
{
  "source": ["myapp.orders"],
  "detail-type": ["OrderPlaced"],
  "detail": { "amount": [{ "numeric": [">", 100] }] }
}
```

## Beyond Routing

- **EventBridge Scheduler** — cron/rate schedules at scale (the modern way to trigger things on a timer; replaces scheduled CloudWatch Events rules).
- **Pipes** — point-to-point source → *filter* → *enrich* → target (e.g. DynamoDB Stream → enrich via Lambda → Step Functions) with no glue code.
- **Schema registry** — discover and codegen typed bindings from event schemas.
- **Archive & replay** — retain matching events and replay them (recovery, backfills, testing).

> [!tip] Choosing an integration service
> **EventBridge** — rich routing/filtering, SaaS, many-to-many. **[[SNS]]** — high-throughput fan-out. **[[SQS]]** — durable work queue. **[[Step Functions]]** — orchestrated workflows.
