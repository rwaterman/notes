---
tags: [devops, terraform, iac]
---

# Terraform

Declarative, multi-cloud Infrastructure as Code (HashiCorp). You describe desired state in **HCL**; Terraform diffs it against real infrastructure and makes the minimal changes to converge.

## Core Workflow

```bash
terraform init      # download providers + configure backend
terraform fmt       # canonical formatting
terraform validate  # static checks
terraform plan      # preview adds/changes/destroys
terraform apply     # converge to desired state
terraform destroy   # tear everything down
```

## State

- Terraform records what it manages in a **state file** — the source of truth for the diff.
- Use a **remote backend** for teams: **S3 for state + DynamoDB for locking** (prevents concurrent applies).
- Never edit state by hand; use `terraform state mv/rm` and `terraform import`.
- State can hold **secrets in plaintext** — encrypt the backend, restrict access.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state"
    key            = "prod/app.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks"
    encrypt        = true
  }
}
```

## Building Blocks

- **Providers** — plugins for a platform (AWS, GitHub, etc.).
- **Resources** — things to create (`resource "aws_s3_bucket" "this" {}`).
- **Data sources** — read existing/external values.
- **Variables / outputs / locals** — inputs, exported values, computed helpers.
- **Modules** — reusable, composable units; the unit of DRY and sharing.
- **`for_each` / `count`** — create N resources; prefer `for_each` (stable keys) over `count`.
- **`lifecycle`** — `prevent_destroy`, `create_before_destroy`, `ignore_changes`.

## Workspaces & Environments
- **Workspaces** isolate state for the same config (use sparingly). Many teams prefer **separate state per environment** (dir or backend key) for clarity.

## Debugging

```bash
TF_LOG=TRACE TF_LOG_PATH=tf-trace.log terraform plan -no-color
```

> [!tip] Terraform vs CDK vs CloudFormation
> Terraform: multi-cloud, explicit state, vast provider ecosystem. [[AWS CDK]]: real code + abstractions, AWS-first. [[CloudFormation]]: AWS-native, no state to host. Match the team and cloud breadth.
