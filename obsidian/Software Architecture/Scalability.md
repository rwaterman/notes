---
tags: [software-architecture, scalability, distributed-systems]
---

# Scalability

The ability to handle growing load by adding resources. Measure load with explicit **load parameters** (req/s, read:write ratio, payload size, fan-out) and success with **percentiles** (p95/p99), never averages — tail latency is what users feel.

## Vertical vs Horizontal

- **Vertical (scale up)** — bigger machine. Simple, but a ceiling and a single point of failure.
- **Horizontal (scale out)** — more machines. Near-unlimited, but forces you to handle statelessness, coordination, and consistency.

> [!tip] Make services stateless
> Push session/state to a shared store (Redis, DynamoDB) so any node can serve any request. Statelessness is the precondition for horizontal scaling and easy autoscaling.

## Scaling Reads

- **[[Caching]]** — first and cheapest lever (CDN, app cache, DB query cache).
- **Read replicas** — offload reads from the primary (mind replication lag).
- **CDN / edge** — serve static and cacheable content close to users.

## Scaling Writes

- **Partitioning / sharding** — split data by key (hash or range). Watch for **hot keys / skew**.
- **Async & queues** — absorb spikes; do expensive work out-of-band via [[Messaging & Event-Driven Architecture]].
- **Write-optimized stores** — LSM-tree engines, append-only logs.

## Patterns & Tactics

- **Load balancing** — distribute across nodes (L4/L7); health checks + autoscaling.
- **Back-pressure & rate limiting** — protect the system from itself.
- **Bulkheads & circuit breakers** — isolate failures so one slow dependency doesn't sink everything.
- **Idempotency** — retries are inevitable in distributed systems; make operations safe to repeat.

## Watch For

- **Amdahl's / Universal Scalability Law** — coordination and contention cap real-world speedup; throughput can *decrease* past a point.
- The **N+1** and chatty-call problems across service boundaries.
- Stateful bottlenecks hiding behind "stateless" services (the shared DB).

## See Also
[[Large Scale Systems]] · [[CAP Theorem & Consistency]] · [[Caching]] · [[DDIA Notes]]
