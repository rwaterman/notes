---
tags: [software-architecture, operations, checklist]
---

# Production Readiness Checklist

What a service needs before it carries real traffic — and what an auditor (or a 3 a.m. page) will expose if it's missing.

## Observability
- [ ] Structured logging with correlation/trace IDs
- [ ] Metrics for the **four golden signals**: latency, traffic, errors, saturation
- [ ] Distributed tracing in place ([[OpenTelemetry]])
- [ ] Dashboards per service + actionable **alerts** (alert on symptoms, not causes)
- [ ] SLOs defined with error budgets

## Delivery
- [ ] **CI/CD** pipeline — automated build, test, deploy ([[GitHub Actions]])
- [ ] Progressive delivery — [[Canary Deployments]] / blue-green
- [ ] **Automatic rollback** on alarm (errors, latency, data checks)
- [ ] Infrastructure as Code ([[Terraform]] / [[AWS CDK]] / [[CloudFormation]]) — no console drift
- [ ] Tidy git branches; trunk-based or short-lived branches (not an explosion of them)

## Reliability & Data
- [ ] Health checks + autoscaling
- [ ] Backups **and** a tested restore (PITR for [[RDS]]/[[DynamoDB]])
- [ ] Idempotent, retry-safe operations; DLQs on async paths
- [ ] Defined failure modes, timeouts, and circuit breakers
- [ ] Capacity / quota headroom reviewed

## Security
- [ ] Least-privilege [[IAM]]; no long-lived keys in code
- [ ] Secrets in Secrets Manager / Parameter Store (not env files in git)
- [ ] Encryption at rest + in transit
- [ ] Dependency and image scanning in CI

## Process
- [ ] Runbook for on-call (common alerts → actions)
- [ ] Jira/issue tracking — fields filled and actually used
- [ ] Ownership clear (who's paged, who decides)
- [ ] Post-incident reviews are blameless and produce owned action items

> [!tip] The cheap signal
> If you can't answer *"how would I know this is broken, and how would I roll it back?"* the service isn't ready — regardless of how good the code is.
