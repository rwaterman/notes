---
tags: [aws, lambda, serverless, compute]
---

# Lambda

Run code without managing servers. You upload a function; AWS runs it in response to events, scales it horizontally, and bills per millisecond of execution.

- Event-driven; one concurrent execution per in-flight event.
- Stateless — persist anything durable in S3/DynamoDB/RDS.
- Pay for **requests + GB-seconds** (memory × duration). Idle = free.

## Limits (defaults)

| Resource | Limit |
|---|---|
| Timeout | 15 min max |
| Memory | 128 MB – 10,240 MB (CPU scales with it; ~6 vCPU at max) |
| `/tmp` ephemeral storage | 512 MB – 10,240 MB |
| Deployment package | 50 MB zipped / 250 MB unzipped; **10 GB** as container image |
| Payload | 6 MB sync, 256 KB async |
| Env vars | 4 KB total |
| Account concurrency | 1,000 (soft, raise via quota) |

## Invocation Models

- **Synchronous** — API Gateway, ALB, SDK `Invoke`. Caller waits; errors return to caller.
- **Asynchronous** — S3, SNS, EventBridge. Lambda queues + retries (2x), then **DLQ** / **on-failure destination**.
- **Event source mapping (poll-based)** — SQS, Kinesis, DynamoDB Streams. Lambda polls and batches.

## Concurrency

- **Reserved concurrency** — caps (and guarantees) a function's slice of the account pool.
- **Provisioned concurrency** — pre-warmed environments to eliminate cold starts (costs even when idle).
- **Cold start** = new execution environment init (download, runtime, init code). Mitigate with provisioned concurrency, smaller packages, **SnapStart** (Java/Python/.NET), and lazy-loading SDK clients.

## Building Blocks

- **Execution role** (IAM) — what the function may do. **Resource policy** — who may invoke it.
- **Layers** — shared dependencies/runtime mounted at `/opt` (up to 5).
- **Versions** (immutable) + **aliases** (mutable pointers) → enable [[Canary Deployments]].
- **Environment variables** — config; encrypt secrets with KMS or pull from Secrets Manager / Parameter Store.

## Snippets

```bash
# Tail logs live
aws logs tail /aws/lambda/my-fn --follow --since 5m

# Invoke synchronously and capture the response
aws lambda invoke --function-name my-fn \
  --payload '{"key":"value"}' --cli-binary-format raw-in-base64-out \
  /dev/stdout

# Set reserved concurrency
aws lambda put-function-concurrency \
  --function-name my-fn --reserved-concurrent-executions 50
```

> [!tip] In front of a database?
> Lambda scales faster than a relational DB can accept connections. Use **[[RDS]] Proxy** (or [[DynamoDB]]) to avoid connection-pool exhaustion.
