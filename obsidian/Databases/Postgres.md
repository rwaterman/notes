---
tags: [database, postgres, snippet]
---

# EXPLAIN ANALYZE / QUERY PLAN

## Guidelines

1. Run on a realistic data set
2. Make use of the EXPLAIN parameters
3. Start at the end
4. Work out what the most expensive parts are
5. Only then, think about how to speed it up

## Visualizing Tools

- https://explain.depesz.com
- https://explain.dalibo.com
- https://pgmustard.com

# FDW

## FDW - Same Server - Copy Table

```sql
-- 👇 Replace SOURCE_DB everywhere for reuse
-- 👇 Replace SOURCE_DB everywhere for reuse

CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER source_server
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (dbname 'SOURCE_DB', host 'localhost');

CREATE USER MAPPING FOR CURRENT_USER
  SERVER source_server
  OPTIONS (user 'root');

CREATE SCHEMA __SOURCE_DB__;

IMPORT FOREIGN SCHEMA public
  LIMIT TO ("TableName1")
  FROM SERVER source_server
  INTO SOURCE_DB;

-- Optional: Replace local copy if it exists
DROP TABLE IF EXISTS "RateType";

-- Materialize the foreign table
CREATE TABLE "RateType" AS
SELECT * FROM SOURCE_DB."TableName1";
```

# Get Running Processes

```sql
SELECT pid, usename, query, state, backend_start, query_start  
FROM pg_stat_activity  
WHERE usename = 'username'  
  AND (query ILIKE 'call %' OR query ILIKE '%select%from%' OR query ILIKE '%perform%');
```

# Get Open Transactions

```sql
SELECT  
    pid,  
    usename,  
    datname,  
    state,  
    backend_start,  
    xact_start,  
    query_start,  
    now() - xact_start AS xact_duration,  
    query  
FROM  
    pg_stat_activity  
WHERE  
    xact_start IS NOT NULL  
ORDER BY  
    xact_start;
```

# CDC

```sql
SHOW wal_level;  
SHOW max_replication_slots;  
SHOW max_wal_senders;  
SHOW wal_sender_timeout;
```

# Postgres Cheat Sheet

## List Table Disk Usage

```sql
SELECT  
  table_name,  
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size  
FROM (
  SELECT  
    tablename AS table_name  
  FROM  
    pg_catalog.pg_tables  
  WHERE  
    schemaname != 'pg_catalog'  
    AND schemaname != 'information_schema'  
) AS tables  
ORDER BY  
  pg_total_relation_size(quote_ident(table_name)) DESC;
```

## Get Installed Extensions

```sql
SELECT * FROM pg_extension;
```

## GetUser

```sql
SELECT * FROM pg_roles;
```

# Kung Fu

# Group by Dates and Add Percentages

```sql
SELECT  
    DATE_TRUNC('day', "createdAt") AS "day",  
    "status",  
    COUNT(*) AS "count",  
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('day', "createdAt"))) AS "percentage"  
FROM "RateTypeBatch"  
WHERE "createdAt" >= CURRENT_DATE - INTERVAL '10 days'  
GROUP BY "day", "status"  
ORDER BY "day" DESC
```

# Count All Table Rows

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
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(rec.schemaname) || '.' || quote_ident(rec.tablename)  
        INTO table_count;  
        total_count := total_count + table_count;  
        RAISE NOTICE 'Table: %, Count: %', rec.schemaname || '.' || rec.tablename, table_count;  
    END LOOP;  
  
    RAISE NOTICE 'Total count of records in the database: %', total_count;  
END $$;
```
