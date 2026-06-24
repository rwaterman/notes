---
tags: [database, sql-server, snippet]
---

# CDC

## Which Databases Are Enabled

```sql
select name, is_cdc_enabled from sys.databases;
```

## Enable Database

```sql
exec msdb.dbo.rds_cdc_enable_db 'DBName'
```

## Enable Table

```sql
EXEC sys.sp_cdc_enable_table
	@source_schema = N'schemaName',
	@source_name = N'table_name',
	@role_name = NULL,
	@supports_net_changes = 0
```

```hcl
ExtraConnectionAttributes: "SetUpMsCdcForTables=true;"
```

## Get Information

```sql
EXEC sys.sp_cdc_help_change_data_capture
```

```sql
SELECT * FROM sys.dm_cdc_log_scan_sessions
```

### DMS

```hcl
resource "aws_dms_endpoint" "ec2_source" {
...
"setUpMsCdcForTables=true;"
...
}
```

## Is Distributor Active?

```sql
sp_get_distributor
```

## Check for CDC Errors

```sql
SELECT *
FROM sys.dm_cdc_errors
ORDER BY error_time DESC;
```

## Example Scripts

```sql
exec msdb.dbo.rds_cdc_enable_db 'AnalyticsDB'

EXEC sys.sp_cdc_enable_table
	@source_schema = N'dbo',
	@source_name = N'some_table',
	@role_name = NULL,
	@supports_net_changes = 0
```

# Debezium

```sql
EXEC sp_changedbowner 'root'
EXEC sys.sp_cdc_enable_db
EXEC sys.sp_cdc_enable_table
     @source_schema = N'dbo',
     @source_name  = N'another_table',
     @role_name    = NULL,
     @supports_net_changes = 0
GO
EXEC sys.sp_cdc_help_change_data_capture
GO
```

## Find Tables Without Primary Keys

```sql
SELECT t.name AS TableName
FROM sys.tables t
LEFT JOIN sys.indexes i ON t.object_id = i.object_id AND i.is_primary_key = 1
WHERE i.object_id IS NULL;
```
