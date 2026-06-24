---
title: Home
description: Engineering knowledge base — cloud architecture, AWS, distributed systems, and the tooling behind them.
---

# Engineering Knowledge Base

Working reference for building and operating cloud systems: AWS services, distributed-systems design, DevOps tooling, databases, and the command line. Notes are written to be re-read under pressure — terse, example-first, and biased toward what actually matters in production.

> [!tip] Finding things
> Use **search** (top-left, or press `/`) for the fastest path. Otherwise browse by section in the explorer, or follow the maps below.

## Start here

- **[[Large Scale Systems]]** — quality attributes, constraints, and the trade-offs behind every architecture decision.
- **[[System Design Interview]]** — a repeatable framework for open-ended design problems.
- **[[Lambda]]** · **[[DynamoDB]]** · **[[Step Functions]]** — the serverless core.

## Sections

### ☁️ AWS
Service references and operational snippets, serverless-first.

- Compute & orchestration — [[Lambda]], [[Step Functions]], [[ECS & Fargate]], [[EC2 User Data]]
- Data — [[S3]], [[DynamoDB]], [[RDS]], [[Aurora]], [[Kinesis]]
- Integration — [[API Gateway]], [[SQS]], [[SNS]], [[EventBridge]]
- Foundations — [[VPC]], [[IAM]], [[CloudFormation]], [[AWS CloudWatch]]
- Delivery — [[Canary Deployments]]

### 🏛️ Software Architecture
- [[Large Scale Systems]], [[Design Patterns]], [[DDIA Notes]]
- [[Scalability]], [[Caching]], [[CAP Theorem & Consistency]], [[Messaging & Event-Driven Architecture]]
- [[Data Engineering]], [[System Design Interview]]

### 🔧 DevOps
- IaC — [[Terraform]], [[AWS CDK]]
- Containers — [[Docker]], [[Kubernetes]]
- CI/CD — [[GitHub Actions]]
- Observability — [[OpenTelemetry]], [[Prometheus]]

### 🗄️ Databases
- [[Postgres]], [[SQL Server]], [[Sequelize]]

### 💻 Programming
- [[Python 3 Deep Dive]], [[Computer Science Algorithms]], [[GraphQL]]
- TypeScript — [[Create a TypeScript Project]], [[LRU Cache]], [[TypeScript Promise Helper]]

### ⌨️ CLI
- Shells — [[Zsh]], [[Bash]]
- Utilities — [[Git]], [[NodeJS]], [[Networking]], [[GPG]], [[FFmpeg]]
- [[SSH - Mac OS]], [[SSH - Snippets]]

### 🤖 AI
- [[Prompt]], [[Latent Space Prompt]]

## How this is organized

Each page is a standalone reference: a short orientation, then the specifics, then snippets you can copy. Pages link to related topics with `[[wikilinks]]` — follow the **graph** (top-right) or **backlinks** to explore laterally. Anything tagged `#snippet` is copy-paste-ready.
