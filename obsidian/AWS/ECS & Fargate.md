---
tags: [aws, ecs, fargate, containers, compute]
---

# ECS & Fargate

**ECS** (Elastic Container Service) is AWS's container orchestrator. **Fargate** is the serverless capacity mode that runs containers without you managing EC2.

## Concepts

- **Task definition** — the blueprint: container image(s), CPU/memory, ports, env, log config, and IAM **task role**.
- **Task** — a running instantiation of a task definition.
- **Service** — keeps N tasks running, integrates with a load balancer, and handles rollouts + autoscaling.
- **Cluster** — logical grouping of tasks/services and (for EC2 mode) the container instances.

## Launch Types

| | Fargate | EC2 |
|---|---|---|
| You manage | Nothing (serverless) | The EC2 instances |
| Pricing | Per task vCPU/mem per second | Per EC2 instance |
| Best for | Spiky/variable, low-ops | Steady high utilization, GPUs, custom AMIs |

Default to **Fargate** unless you need instance-level control or cheaper steady-state density.

## Networking & Roles

- **`awsvpc` mode** (required for Fargate) gives each task its own ENI + security group.
- **Task role** = permissions for your app code. **Execution role** = permissions for the agent to pull images and write logs.
- Integrates with **ALB/NLB**; **Service Connect** / Cloud Map for service-to-service discovery.

## Choosing Among Compute

- **[[Lambda]]** — event-driven, sub-15-min, no container ops, scales to zero.
- **ECS/Fargate** — long-running services, full container control, no Kubernetes overhead.
- **EKS** ([[Kubernetes]]) — when you need the Kubernetes ecosystem/portability.

## Snippets

```bash
# Force a new deployment (pick up :latest image)
aws ecs update-service --cluster my-cluster \
  --service my-svc --force-new-deployment

# Run a one-off task on Fargate
aws ecs run-task --cluster my-cluster --launch-type FARGATE \
  --task-definition my-job \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-abc],securityGroups=[sg-123],assignPublicIp=DISABLED}'
```
