---
tags: [programming, graphql, api]
---

# GraphQL

A query language and runtime for APIs. Clients request exactly the fields they need from a typed **schema** in a single round trip — solving REST's over-/under-fetching. That flexibility shifts responsibility onto the server.

## Core Concepts

- **Schema + types** — the contract (SDL). Strongly typed, introspectable.
- **Query** (read), **Mutation** (write), **Subscription** (real-time over WebSockets).
- **Resolvers** — functions that fetch each field's data.
- One endpoint (`POST /graphql`); the query shape determines the response shape.

```graphql
query {
  user(id: "42") {
    name
    orders(last: 5) { id total }
  }
}
```

## REST vs GraphQL

| | REST | GraphQL |
|---|---|---|
| Fetching | Multiple endpoints | One endpoint, client-shaped |
| Over/under-fetch | Common | Avoided |
| Caching | HTTP caching (easy) | Needs app-level / persisted queries |
| Versioning | `/v2` | Evolve schema + deprecate fields |

## Performance & Safeguards

> GraphQL is *just a query language* — it does **not** magically optimize how data is fetched or how the database handles joins.

Deeply nested or wide queries can generate complex, slow, or timing-out backend work. Both sides own performance:

- **N+1 resolvers** — batch with **DataLoader** (per-request caching/batching).
- **Query complexity / depth limiting** — reject overly expensive queries before they run.
- **Pagination** — prefer cursor-based connections; cap page size.
- **Persisted queries / allow-lists** — only run vetted operations in production.
- **Separate list vs detail resolvers** — sometimes it's cleaner to keep heavy list queries distinct from detail fetches than to let one tree do everything.
- **Timeouts & cost analysis** — defend the server from pathological queries.

> [!important] Communicate the trade-off
> Frontend teams often assume GraphQL handles performance for them. It gives clients flexibility; the backend must add the guardrails. Agree on acceptable query complexity together.

## On AWS
**AWS AppSync** is managed GraphQL with resolvers to [[DynamoDB]]/[[Lambda]]/RDS, subscriptions, and auth ([[IAM]], Cognito, API keys).
