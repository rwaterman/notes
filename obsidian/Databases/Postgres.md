---
tags: [database, postgres, sql, snippet]
---

# Postgres

Working reference for operating and querying PostgreSQL — reading query plans, moving data between databases, and the diagnostic queries worth keeping close.

## EXPLAIN ANALYZE / Query Plans

`EXPLAIN` shows the planner's chosen plan and cost estimates; `EXPLAIN ANALYZE` actually runs the query and reports real timing and row counts. The gap between estimated and actual rows is where most bad plans hide.

**How to read a plan**

1. Run on a **realistic data set** — plans flip on cardinality; a plan tuned on 100 rows lies about 10M.
2. Use the parameters — `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)` to see cache vs disk reads.
3. **Start at the innermost/bottom node** and work outward — that's execution order.
4. Find the **most expensive** nodes (actual time × loops), and watch for `Seq Scan` on big tables, bad row estimates, and nested loops over large inputs.
5. Only then optimize — add an index, rewrite the join, or bump `work_mem`.

**Visualizers**

- https://explain.depesz.com
- https://explain.dalibo.com
- https://pgmustard.com

## Foreign Data Wrapper (copy a table between databases)

`postgres_fdw` lets one database query tables in another. Handy for one-off copies without `pg_dump`.

```sql
-- 👇 Replace SOURCE_DB everywhere for reuse
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER source_server
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (dbname 'SOURCE_DB', host 'localhost');

CREATE USER MAPPING FOR CURRENT_USER
  SERVER source_server
  OPTIONS (user 'root');

CREATE SCHEMA source_schema;

IMPORT FOREIGN SCHEMA public
  LIMIT TO ("TableName1")
  FROM SERVER source_server
  INTO source_schema;

-- Materialize the foreign table into a local copy
DROP TABLE IF EXISTS "TableName1";
CREATE TABLE "TableName1" AS
SELECT * FROM source_schema."TableName1";
```

## Diagnostics

**Running queries** (filter to a user's active statements):

```sql
SELECT pid, usename, state, backend_start, query_start, query
FROM pg_stat_activity
WHERE usename = 'username'
  AND state = 'active'
ORDER BY query_start;
```

**Open transactions** (find long-running / idle-in-transaction sessions that hold locks):

```sql
SELECT pid, usename, datname, state,
       xact_start, now() - xact_start AS xact_duration, query
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY xact_start;
```

**Kill a stuck backend:** `SELECT pg_cancel_backend(pid);` (cancel query) or `pg_terminate_backend(pid)` (drop the connection).

## CDC Prerequisites (logical replication)

Change Data Capture via logical decoding needs these set:

```sql
SHOW wal_level;              -- must be 'logical'
SHOW max_replication_slots; -- one slot per consumer
SHOW max_wal_senders;       -- one sender per connection
SHOW wal_sender_timeout;
```

## Cheat Sheet

**Table disk usage (largest first):**

```sql
SELECT tablename AS table_name,
       pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC;
```

**Installed extensions / roles:**

```sql
SELECT * FROM pg_extension;
SELECT * FROM pg_roles;
```

**Group by day with per-day percentages** (window function over a `DATE_TRUNC` partition):

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

**Count every row in every table** (diagnostic; scans all tables):

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
        RAISE NOTICE 'Table: %.%, Count: %', rec.schemaname, rec.tablename, table_count;
    END LOOP;
    RAISE NOTICE 'Total records in the database: %', total_count;
END $$;
```

> [!tip] Related
> On AWS, Postgres runs on [[RDS]] or [[Aurora]] (Postgres-compatible). For connection pooling in front of [[Lambda]], use **RDS Proxy**.
