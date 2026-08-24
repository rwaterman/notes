---
tags: [database, postgres, sql, snippet]
---

# Postgres

Operating and querying PostgreSQL: reading plans, moving data between databases, and the diagnostic queries worth keeping close. On AWS: [[RDS]] / [[Aurora]]; **RDS Proxy** in front of [[Lambda]].

## Query Plans

`EXPLAIN` = the planner's estimate; `EXPLAIN ANALYZE` runs the query and reports real timing and rows. Bad plans hide in the gap between estimated and actual rows.

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ...;
```

1. Run against realistic data — plans flip on cardinality.
2. Read innermost node outward (execution order).
3. Find the expensive nodes (actual time × loops); watch for `Seq Scan` on big tables, bad row estimates, nested loops over large inputs.
4. Then fix: index, rewrite the join, raise `work_mem`.

Visualizers: [explain.depesz.com](https://explain.depesz.com) · [explain.dalibo.com](https://explain.dalibo.com) · [pgmustard.com](https://pgmustard.com)

## Copy a Table Between Databases (postgres_fdw)

```sql
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER source_server
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'localhost', port '5432', dbname 'SOURCE_DB');

CREATE USER MAPPING FOR CURRENT_USER
  SERVER source_server
  OPTIONS (user 'SOURCE_USER', password 'SOURCE_PASSWORD');

CREATE SCHEMA source_schema;

IMPORT FOREIGN SCHEMA public
  LIMIT TO ("TableName1")
  FROM SERVER source_server
  INTO source_schema;

-- Materialize a local copy
DROP TABLE IF EXISTS "TableName1";
CREATE TABLE "TableName1" AS
SELECT * FROM source_schema."TableName1";
```

## Activity & Locks

```sql
-- Active statements for one user
SELECT pid, usename, state, backend_start, query_start, query
FROM pg_stat_activity
WHERE usename = 'username' AND state = 'active'
ORDER BY query_start;

-- Open transactions (long-running or idle-in-transaction sessions hold locks)
SELECT pid, usename, datname, state,
       xact_start, now() - xact_start AS xact_duration, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start;

-- Idle in transaction only
SELECT pid, now() - xact_start AS idle_for, query
FROM pg_stat_activity
WHERE state = 'idle in transaction'
ORDER BY xact_start;

SELECT pg_cancel_backend(pid);      -- cancel the query
SELECT pg_terminate_backend(pid);   -- drop the connection
```

## CDC Prerequisites (logical replication)

```sql
SHOW wal_level;              -- must be 'logical'
SHOW max_replication_slots;  -- one slot per consumer
SHOW max_wal_senders;        -- one sender per connection
SHOW wal_sender_timeout;
```

## Sizes, Extensions, Roles

```sql
-- Tables by total size (heap + indexes + TOAST), largest first
SELECT schemaname || '.' || tablename AS table_name,
       pg_size_pretty(pg_total_relation_size(format('%I.%I', schemaname, tablename))) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(format('%I.%I', schemaname, tablename)) DESC;

SELECT extname, extversion FROM pg_extension;
SELECT rolname FROM pg_roles WHERE rolcanlogin;
```

## Per-Day Counts With Percentages

```sql
SELECT DATE_TRUNC('day', "createdAt") AS day,
       status,
       COUNT(*) AS count,
       ROUND(COUNT(*) * 100.0 /
             SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('day', "createdAt"))) AS percentage
FROM "RateTypeBatch"
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '10 days'
GROUP BY day, status
ORDER BY day DESC;
```

## Count Every Row in Every Table

Scans everything — diagnostic only.

```sql
DO $$
DECLARE
    rec RECORD;
    table_count BIGINT;
    total_count BIGINT := 0;
BEGIN
    FOR rec IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I.%I', rec.schemaname, rec.tablename)
        INTO table_count;
        total_count := total_count + table_count;
        RAISE NOTICE '%.%: %', rec.schemaname, rec.tablename, table_count;
    END LOOP;
    RAISE NOTICE 'total: %', total_count;
END $$;
```
