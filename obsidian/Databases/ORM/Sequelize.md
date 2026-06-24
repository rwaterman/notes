---
tags: [orm, database, javascript, snippet]
---

# Sequelize

Promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQL Server, and SQLite.

## Migrations

- Seed and migration files are named with a `YYYYMMDDHHmmss` timestamp prefix (**14 digits**) so they apply in order.

```sh
# Generate the timestamp prefix for a file name
echo "$(date +'%Y%m%d%H%M%S')-test.js"
```

```sh
npx sequelize-cli migration:generate --name add-orders-table
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo          # roll back the last
npx sequelize-cli db:seed:all
```

## Notes
- A migration must define both **`up`** (apply) and **`down`** (revert) — an irreversible `down` is a deploy hazard.
- Migrations run in filename (timestamp) order; never edit a migration that's already run in shared environments — add a new one.
- Watch the **N+1 problem**: use `include` (eager loading) deliberately; log generated SQL in dev (`logging: console.log`).
