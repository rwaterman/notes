---
tags: [software-architecture, course]
---

# Large Scale Systems

> The software architecture of a system is a high-level description of its structure, its components, and how they communicate to fulfill the system's requirements and constraints.

Architecture decides performance, scale, speed of change, and how the system fails. Languages and frameworks are implementation — defer them.

## Quality Attributes

Systems get redesigned for non-functional reasons: not **fast** enough, doesn't **scale**, slow to **develop**, hard to **maintain**, not **secure**. Each is a quality attribute, and each must be **measurable and testable**:

- ❌ "The purchase confirmation must display *quickly*."
- ✅ "Confirmation renders in < 1 s at p95."

Common: performance, scalability, availability, reliability, security, deployability, maintainability, testability, interoperability, usability.

> [!warning] No architecture wins every attribute
> Attributes conflict (strong security vs. low latency). The job is the right **trade-off for the business requirements** — and a feasibility check: 100% availability, "unhackable", HD video over dial-up are not requirements, they're wishes.

## Constraints

Decisions already made for you:

- **Technical** — vendor/cloud lock-in, language, database, platforms to support.
- **Business** — third-party APIs (payments, documents), budgets, deadlines.
- **Regulatory** — HIPAA, GDPR, data residency.

External constraints rarely negotiate; **internal** ones often do. Explore alternatives before locking to hardware, a cloud, or a technology — backing out later is expensive.

## Loose Coupling

Don't couple to a database's or vendor's API surface. Components you can **replace or upgrade independently** are the insurance policy against constraint and vendor risk.

## Related

[[Scalability]] · [[Caching]] · [[CAP Theorem & Consistency]] · [[Messaging & Event-Driven Architecture]] · [[Design Patterns]] · [[DDIA Notes]] · [[System Design Interview]]
