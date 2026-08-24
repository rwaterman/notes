---
tags: [programming, graphql, api]
---

# GraphQL

Query language + runtime for APIs. Clients request exactly the fields they need from a typed **schema** in one round trip — fixes REST over-/under-fetching, and shifts performance responsibility onto the server.

## Core Concepts

- **Schema (SDL)** — the typed, introspectable contract.
- **Query** (read), **Mutation** (write), **Subscription** (real-time over WebSockets).
- **Resolvers** — one function per field. One endpoint (`POST /graphql`); query shape = response shape.

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
| Caching | HTTP caching (easy) | App-level / persisted queries |
| Versioning | `/v2` | Evolve schema, `@deprecated` fields |

## Guardrails (the server owns performance)

- **N+1 resolvers** — batch with **DataLoader** (per-request cache + batching).
- **Depth / complexity limits** — reject expensive queries before they run.
- **Cursor pagination**; cap page size.
- **Persisted queries / allow-lists** — only vetted operations in production.
- **Timeouts** — defend against pathological queries.

Frontend teams often assume GraphQL handles performance for them. It doesn't; agree on acceptable query complexity together.

## On AWS
**AppSync** — managed GraphQL with resolvers to [[DynamoDB]] / [[Lambda]] / RDS, subscriptions, and auth ([[IAM]], Cognito, API keys).
