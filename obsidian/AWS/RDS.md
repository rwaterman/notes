---
tags: [aws, rds, database]
---

# RDS

Managed relational databases — AWS runs the OS, patching, backups, and failover so you manage schema and queries, not servers.

- **Engines:** PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, and **Amazon Aurora** (see [[Aurora]]).
- Provisioned on EC2 under the hood; you pick instance class + storage (gp3/io1/io2).
- Not serverless (except Aurora Serverless) — you choose and pay for the instance.

## High Availability vs Read Scaling

These solve different problems — don't confuse them.

| | Multi-AZ | Read Replicas |
|---|---|---|
| Purpose | High availability / failover | Scale reads |
| Replication | Synchronous | Asynchronous |
| Readable? | No (standby is passive) | Yes |
| Failover | Automatic (~60–120s, DNS swap) | Manual promote |
| Span | 2 or 3 AZs | Same region or cross-region |

- **Read replicas**: up to 5 per source (15 for Aurora). Promote a replica to a standalone DB for DR or migration.
- **Multi-AZ DB cluster** (newer) gives 2 readable standbys with faster failover.

## Backups & Recovery

- **Automated backups** — daily snapshot + transaction logs, **retention up to 35 days**, enables **point-in-time recovery (PITR)**.
- **Manual snapshots** — kept until you delete them; can be shared/copied across accounts and regions.
- Restoring always creates a **new instance**.

## Storage, Security, Performance

- **Storage autoscaling** raises allocated storage automatically under pressure.
- **Encryption at rest** via KMS (set at creation); **TLS in transit**.
- **RDS Proxy** — managed connection pooling; essential in front of Lambda to avoid connection exhaustion.
- **Parameter groups** (engine config) and **option groups** (engine features).
- **Performance Insights** — visualize DB load and top SQL.

## Snippets

```bash
# Force a Multi-AZ / cluster failover to a reader
aws rds failover-db-cluster \
  --db-cluster-identifier db-cluster-name \
  --target-db-instance-identifier db-instance-reader-name

# Create a manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier my-db \
  --db-snapshot-identifier my-db-$(date +%Y%m%d)

# List instances and their endpoints
aws rds describe-db-instances \
  --query 'DBInstances[].{id:DBInstanceIdentifier,ep:Endpoint.Address,az:AvailabilityZone}' \
  --output table
```

> [!tip] When to leave RDS
> For serverless/variable workloads or >64 TiB and global reads, reach for [[Aurora]] (Serverless v2, Global Database). For key-value access patterns at scale, [[DynamoDB]].
