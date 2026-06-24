---
tags: [software-architecture, course]
---

# Large Scale Systems

> The software architecture of a system is a high-level description of its structure, its components, and how they communicate to fulfill the system's requirements and constraints.

Architecture decides performance and scale, the ease of adding features, and how the system responds to failure or attack. **Defer implementation choices** (languages, frameworks) to the end — they are implementation, not architecture.

## Quality Attributes

Systems are usually redesigned not because of *functional* gaps, but because they aren't **fast** enough, don't **scale**, are slow to **develop**, hard to **maintain**, or not **secure** enough.

A quality attribute is a measurable property of *how well* the system performs on a dimension — and it correlates directly with the architecture.

**Must be measurable and testable.**
- ❌ "The purchase confirmation must display *quickly*." — what is "quickly"?
- ✅ "Confirmation renders in < 1 s at p95."

Common attributes: **performance, scalability, availability, reliability, security, deployability, maintainability, testability, interoperability, usability.**

> [!warning] No single architecture wins every attribute
> Many combinations conflict (e.g. strong security vs. low latency). The architect's job is the right **trade-off for the business requirements**.

## Three Considerations Behind Every Decision

1. **Testability & measurability** — if you can't measure it, you can't hold the system to it.
2. **Trade-offs** — e.g. login page: performance (< 1 s) vs. security (TLS, hashing, MFA).
3. **Feasibility** — can the system actually deliver what's asked? Beware: unrealistically low latency, 100% availability, full protection against attackers, HD video on limited bandwidth.

## Constraints

A constraint is a decision already (fully or partially) made for you, restricting your degrees of freedom.

- **Technical** — locked to a vendor/cloud, language, database, or platforms/OS to support. (e.g. moving Lambda workloads to on-prem is hard.)
- **Business** — third-party services with their own APIs (payments, docs), fraud-detection vendors, budgets, deadlines.
- **Regulatory / legal** — HIPAA (patient data), GDPR (collection/storage/sharing limits), data residency.

> [!caution] Accept constraints carefully
> External rules rarely have negotiating room; **internal** constraints often do. Before locking to hardware, a cloud vendor, or a technology, explore alternatives — backing out later is expensive.

## Loosely Coupled Architecture

If you depend on a database or third-party service, don't tightly couple to its APIs. Decouple components so they can be **replaced or upgraded independently** with minimal change — this is the structural insurance policy against constraint and vendor risk.

## Related

- [[Scalability]] · [[Caching]] · [[CAP Theorem & Consistency]] · [[Messaging & Event-Driven Architecture]]
- [[Design Patterns]] · [[DDIA Notes]] · [[System Design Interview]]
