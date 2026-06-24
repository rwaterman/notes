---
tags: [aws, aurora, rds, database]
---

# Aurora

AWS-built, MySQL- and PostgreSQL-compatible relational engine. Same wire protocol and tools as [[RDS]], but with a re-architected storage layer for higher throughput, durability, and elastic scaling.

## What's Different from RDS

- **Distributed storage** auto-grows to **128 TiB**; data is kept as **6 copies across 3 AZs**, self-healing.
- Storage is decoupled from compute — replicas share one storage volume, so adding readers is cheap.
- Up to **15 read replicas** with a **reader endpoint** that load-balances reads.
- Failover typically **< 30 s** (promote an existing replica).

## Deployment Options

- **Provisioned** — pick instance classes (like RDS).
- **Serverless v2** — fine-grained autoscaling in **ACUs**; scales with load, good for variable/spiky workloads.
- **Global Database** — one primary region + up to 5 read-only secondary regions, **< 1 s** cross-region replication; cross-region DR with fast promotion.

## Handy Features

- **Backtrack** (MySQL) — rewind the cluster to a point in time without a restore.
- **Fast cloning** — copy-on-write clones for test/analytics without duplicating storage.
- **Endpoints** — *cluster* (writer), *reader* (load-balanced reads), and custom endpoints for subsets.

## When to Choose

- You want relational + joins + transactions, but RDS read scaling, failover speed, or storage ceiling is limiting.
- Variable load → **Serverless v2**. Multi-region reads/DR → **Global Database**.
- Pure key-value at extreme scale → [[DynamoDB]] instead.
