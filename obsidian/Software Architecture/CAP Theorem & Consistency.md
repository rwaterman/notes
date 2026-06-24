---
tags: [software-architecture, distributed-systems, consistency]
---

# CAP Theorem & Consistency

## CAP

In a distributed system you can have at most **two** of:

- **Consistency** — every read sees the latest write (linearizable).
- **Availability** — every request gets a (non-error) response.
- **Partition tolerance** — the system keeps working despite dropped/delayed messages between nodes.

> [!important] You don't actually choose 2 of 3
> Network **partitions happen** — P is non-negotiable. The real choice during a partition is **CP** (refuse/err to stay consistent) vs **AP** (stay available, serve possibly-stale data). When there's *no* partition, you can have both C and A.

- **CP examples:** HBase, ZooKeeper, etcd, traditional RDBMS clusters.
- **AP examples:** Cassandra, DynamoDB (tunable), Riak.

## PACELC (the better model)

> If **P**artition: trade **A**vailability vs **C**onsistency. **E**lse (normal ops): trade **L**atency vs **C**onsistency.

This captures the everyday cost CAP ignores — stronger consistency costs latency even when the network is healthy.

## Consistency Spectrum

From strong to weak:

- **Linearizable / strong** — one up-to-date copy; reads after a write see it. Costly, often cross-region prohibitive.
- **Sequential / causal** — operations respect causality/order, not necessarily real time.
- **Read-your-writes / monotonic reads** — session guarantees that fix the worst UX surprises.
- **Eventual** — replicas converge *eventually*; reads may be stale. Default for highly available stores.

## Tunable Consistency (Quorums)

With **N** replicas, **W** write acks, **R** read responses: **W + R > N** gives read-your-writes consistency. Tune per operation:
- Strong-ish: `W=N, R=1` (slow writes) or `R=N, W=1` (slow reads).
- Fast & eventual: small `W` and `R`.

## Practical Guidance

- Pick a consistency model **per dataset**, not per system. A bank balance ≠ a "likes" counter.
- Design for **idempotency** and conflict resolution (last-write-wins, CRDTs, version vectors) under AP.
- See [[DDIA Notes]] (Ch. 5–9) and [[Scalability]].
