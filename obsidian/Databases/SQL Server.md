---
tags: [database, sql-server, cdc, snippet]
---

# SQL Server

Reference for Microsoft SQL Server work — mostly **Change Data Capture (CDC)** setup for streaming changes into pipelines (AWS DMS, Debezium), plus a few schema-audit queries.

## Change Data Capture

CDC records inserts/updates/deletes into system change tables so downstream consumers can replicate changes instead of polling. Enable it per-database, then per-table.

**Which databases have CDC on:**

```sql
SELECT name, is_cdc_enabled FROM sys.databases;
```

**Enable on a database** (RDS uses the `msdb.dbo.rds_cdc_enable_db` wrapper; self-managed uses `sys.sp_cdc_enable_db`):

```sql
-- Amazon RDS
EXEC msdb.dbo.rds_cdc_enable_db 'DBName';

-- Self-managed
EXEC sys.sp_cdc_enable_db;
```

**Enable on a table:**

```sql
EXEC sys.sp_cdc_enable_table
    @source_schema = N'dbo',
    @source_name   = N'table_name',
    @role_name     = NULL,          -- NULL = no gating role
    @supports_net_changes = 0;      -- 1 needs a primary key
```

**Inspect what's captured / diagnose:**

```sql
EXEC sys.sp_cdc_help_change_data_capture;      -- configured capture instances
SELECT * FROM sys.dm_cdc_log_scan_sessions;    -- capture-job scan activity
SELECT * FROM sys.dm_cdc_errors ORDER BY error_time DESC;
EXEC sp_get_distributor;                        -- is the distributor active?
```

## AWS DMS

DMS needs CDC extra-connection attributes to set up the tables it reads from:

```hcl
resource "aws_dms_endpoint" "sqlserver_source" {
  # ...
  extra_connection_attributes = "setUpMsCdcForTables=true;"
}
```

## Debezium

Debezium's SQL Server connector reads the same CDC tables. Ownership sometimes needs fixing first:

```sql
EXEC sp_changedbowner 'root';
EXEC sys.sp_cdc_enable_db;
EXEC sys.sp_cdc_enable_table
     @source_schema = N'dbo',
     @source_name   = N'another_table',
     @role_name     = NULL,
     @supports_net_changes = 0;
GO
EXEC sys.sp_cdc_help_change_data_capture;
GO
```

## Schema Audits

**Find tables without a primary key** (these block `@supports_net_changes` and confuse replication):

```sql
SELECT t.name AS TableName
FROM sys.tables t
LEFT JOIN sys.indexes i
  ON t.object_id = i.object_id AND i.is_primary_key = 1
WHERE i.object_id IS NULL;
```

> [!note] Related
> CDC feeds the same [[Messaging & Event-Driven Architecture|event-driven pipelines]] as [[Kinesis]] / Debezium to Kafka. SQL Server runs on [[RDS]] (managed) or EC2 (self-managed, full `sysadmin` control).
