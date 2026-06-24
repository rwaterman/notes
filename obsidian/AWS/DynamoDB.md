---
tags: [aws, dynamodb, database, nosql, serverless]
---

# DynamoDB

Fully managed key-value / document NoSQL with single-digit-millisecond latency at any scale. No servers, no connection management — just an HTTP API and IAM.

- Tables hold **items** (max **400 KB** each) made of attributes.
- Horizontal scaling is automatic via internal partitioning.
- The data model is **access-pattern-first** — design queries before schema.

## Keys

- **Partition key (PK)** — hashed to pick a partition. High-cardinality keys spread load.
- **Sort key (SK)** *(optional)* — orders items within a partition; enables range queries (`begins_with`, `between`).
- PK or PK+SK must be unique per item.

## Capacity Modes

- **On-Demand** — pay per request, instant scaling. Best for spiky/unknown traffic.
- **Provisioned** — set RCUs/WCUs (+ auto-scaling). Cheaper for steady, predictable load.
  - 1 WCU = 1 KB/s write; 1 RCU = 4 KB/s strongly-consistent read (8 KB/s eventually consistent).

## Reads

- **Eventually consistent** by default; **strongly consistent** option costs 2× RCU.
- **Query** — efficient: targets one PK (+ optional SK condition).
- **Scan** — reads the whole table; avoid in hot paths.

## Indexes

| | GSI | LSI |
|---|---|---|
| Key | Different PK (+SK) | Same PK, different SK |
| When created | Any time | **Table creation only** |
| Consistency | Eventually consistent | Strong option available |
| Capacity | Own RCU/WCU | Shares table capacity |
| Limit | 20 (soft) | 5, ≤10 GB per partition |

## Beyond CRUD

- **DynamoDB Streams** — ordered change log (24 h), triggers Lambda → event-driven pipelines, replication.
- **TTL** — auto-delete expired items (no write cost).
- **DAX** — in-memory cache, microsecond reads.
- **Global Tables** — multi-region, active-active replication.
- **Transactions** — ACID across up to 100 items (`TransactWriteItems`).
- **PITR** (35 days) + on-demand backups.

## Design Notes

- Prefer **single-table design** — model relationships with composite keys + GSIs instead of joins.
- Avoid hot partitions: pick high-cardinality PKs; add a random/sharded suffix for extreme write keys.

## Snippets

```bash
# Query a partition with a sort-key condition
aws dynamodb query --table-name Orders \
  --key-condition-expression "pk = :u AND begins_with(sk, :p)" \
  --expression-attribute-values '{":u":{"S":"USER#42"},":p":{"S":"ORDER#"}}'

# Conditional put (insert only if it doesn't exist)
aws dynamodb put-item --table-name Orders \
  --item '{"pk":{"S":"USER#42"},"sk":{"S":"ORDER#1001"}}' \
  --condition-expression "attribute_not_exists(pk)"
```

> [!tip] DynamoDB vs RDS
> Choose DynamoDB for known, key-based access patterns at scale with predictable latency. Choose [[RDS]]/[[Aurora]] for ad-hoc queries, joins, and strong relational integrity.
