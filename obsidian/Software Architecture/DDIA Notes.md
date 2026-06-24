---
tags: [software-architecture, book]
---

# DDIA Notes

Notes on *Designing Data-Intensive Applications* (Martin Kleppmann) — the reference for reasoning about data systems.

## Ch. 1 — Reliable, Scalable, Maintainable

The three goals of a data system:

- **Reliability** — works correctly even when things go wrong (hardware/software faults, human error). *Fault ≠ failure*: build fault-tolerance so faults don't become failures.
- **Scalability** — copes with growth in load. Define **load parameters** (req/s, read:write ratio, fan-out), then measure with **percentiles** (p95/p99), not averages — tail latency is what users feel.
- **Maintainability** — operability, simplicity (manage complexity, fight accidental complexity), evolvability.

**Data application building blocks:** databases, caches, search indexes, stream processing, batch processing.

## Ch. 2 — Data Models & Query Languages

- **Relational** vs **document** vs **graph**. Document fits tree-shaped/one-to-many, weak on many-to-many. Relational handles joins; graph fits highly-connected data.
- **Impedance mismatch** between objects and relations.
- Declarative (SQL) vs imperative query languages.

## Ch. 3 — Storage & Retrieval

- **LSM-trees** (log-structured, e.g. SSTables — Cassandra, RocksDB) — fast writes, compaction.
- **B-trees** (in-place, most RDBMSs) — fast reads, well-understood.
- **OLTP** (row-oriented, transactional) vs **OLAP** (column-oriented, analytics, compression).

## Ch. 5 — Replication

- **Single-leader** (writes to leader, reads from followers), **multi-leader**, **leaderless** (Dynamo-style quorums).
- Async replication → **replication lag**; read-your-writes, monotonic-reads consistency issues.

## Ch. 6 — Partitioning (Sharding)

- By **key range** vs by **hash of key**. Watch for **hot spots / skew**.
- Secondary indexes: local (by document) vs global (by term). **Rebalancing** strategies.

## Ch. 7 — Transactions

- **ACID** (note: "consistency" is the application's job). Isolation levels: read committed → snapshot isolation (MVCC) → serializable.
- Anomalies: dirty reads/writes, read skew, lost updates, write skew, phantoms.

## Ch. 8–9 — Distributed Trouble & Consistency

- Unreliable networks, clocks, and partial failures; the dangers of relying on wall-clock time.
- **Linearizability** (single up-to-date copy) vs eventual consistency. **CAP** is narrow — see [[CAP Theorem & Consistency]].
- Consensus: total order broadcast, **Paxos/Raft**, ZooKeeper for coordination.

## See Also

[[Large Scale Systems]] · [[Scalability]] · [[Data Engineering]]
