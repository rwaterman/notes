---
tags: [aws, sqs, messaging, integration, serverless]
---

# SQS

Fully managed message queue for decoupling producers from consumers. Producers send; consumers poll, process, and delete. Buffers load spikes and isolates failures.

## Standard vs FIFO

| | Standard | FIFO |
|---|---|---|
| Throughput | Nearly unlimited | 300 msg/s (3,000 batched; higher with high-throughput mode) |
| Ordering | Best-effort | Strict, per **message group ID** |
| Delivery | At-least-once (possible dups) | Exactly-once (dedup ID) |

Name FIFO queues with a `.fifo` suffix.

## Core Mechanics

- **Visibility timeout** — after receive, the message is hidden so others don't process it (default 30 s, max 12 h). Not deleted until the consumer explicitly deletes it — extend for long jobs.
- **Message retention** — 4 days default (60 s – 14 days).
- **Max message size** — 256 KB (use the **Extended Client** + S3 for larger payloads).
- **Long polling** — wait up to 20 s for messages; cuts empty receives and cost vs short polling.
- **Delay queues** — postpone delivery of new messages up to 15 min.

## Dead-Letter Queues

- Attach a **DLQ** with `maxReceiveCount`; messages that fail processing N times move there for inspection/replay.
- Essential for not silently losing poison messages.

## With Lambda

- An **event source mapping** polls the queue and invokes Lambda in batches.
- A batch failure normally re-delivers the whole batch — enable **partial batch responses** (`ReportBatchItemFailures`) to retry only the failed messages.

> [!tip] SQS vs SNS vs Kinesis
> **SQS** = one consumer group, work queue, pull. **[[SNS]]** = pub/sub fan-out, push. **[[Kinesis]]** = ordered stream, replay, multiple consumers. Classic pattern: **SNS → multiple SQS** (fan-out).
