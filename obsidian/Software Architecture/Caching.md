---
tags: [software-architecture, caching, performance]
---

# Caching

Store the result of expensive work close to where it's needed. The highest-leverage performance and cost lever — and a top source of subtle bugs (staleness, stampedes).

## Where Caches Live

- **Client / browser** — HTTP caching (`Cache-Control`, `ETag`).
- **CDN / edge** — static assets and cacheable responses near users.
- **Application** — in-process (LRU, see [[LRU Cache]]) or distributed (**Redis**, **Memcached**, AWS ElastiCache / [[DynamoDB]] DAX).
- **Database** — query/result and buffer caches.

## Read Patterns

- **Cache-aside (lazy loading)** — app checks cache; on miss, loads from DB and populates. Most common. Risk: stale data, and a cold cache means a DB stampede.
- **Read-through** — the cache loads from the DB itself on miss (library/provider does it).

## Write Patterns

- **Write-through** — write to cache and DB together. Consistent, slower writes.
- **Write-behind (write-back)** — write to cache, flush to DB async. Fast, risk of loss on crash.
- **Write-around** — write straight to DB, populate cache on next read. Good for write-heavy, read-rare data.

## Invalidation

> "There are only two hard things in computer science: cache invalidation and naming things."

- **TTL / expiry** — simplest; accept bounded staleness.
- **Explicit invalidation / event-driven** — bust on write (via [[Messaging & Event-Driven Architecture]]).
- **Versioned keys** — change the key on update; old entries age out.

## Failure Modes

- **Stampede / thundering herd** — many misses hit the DB at once on expiry. Mitigate with request coalescing, jittered TTLs, or pre-warming.
- **Hot keys** — one key dominates traffic; shard or replicate it.
- **Stale reads** — pick a staleness budget per dataset; don't cache what must be strongly consistent.

## Eviction Policies
LRU (default mental model), LFU, FIFO, TTL-based. Size the cache to your working set, not your dataset.
