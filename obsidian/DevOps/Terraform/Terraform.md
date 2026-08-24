---
tags: [devops, terraform, iac]
---

# Terraform

Declarative, multi-cloud IaC (HashiCorp). Describe desired state in **HCL**; Terraform diffs it against real infrastructure and converges.

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

- The **state file** is the source of truth for the diff. Never hand-edit; use `terraform state mv/rm` and `terraform import`.
- State holds **secrets in plaintext** — encrypt the backend, restrict access.
- Teams: remote backend on S3 with native locking (`use_lockfile`, Terraform ≥ 1.10). The DynamoDB lock table is legacy.

```hcl
terraform {
  backend "s3" {
    bucket       = "my-tf-state"
    key          = "prod/app.tfstate"
    region       = "us-west-2"
    use_lockfile = true
    encrypt      = true
  }
}
```

## Building Blocks

- **Providers** — plugins for a platform (AWS, GitHub, …).
- **Resources** (`resource "aws_s3_bucket" "this" {}`), **data sources** (read existing values).
- **Variables / outputs / locals**; **modules** — the unit of reuse.
- **`for_each` / `count`** — prefer `for_each` (stable keys) over `count`.
- **`lifecycle`** — `prevent_destroy`, `create_before_destroy`, `ignore_changes`.
- **Workspaces** isolate state for one config; most teams prefer separate state per environment (directory or backend key).

## Debugging

```bash
TF_LOG=TRACE TF_LOG_PATH=tf-trace.log terraform plan -no-color
```

> [!tip] Terraform vs CDK vs CloudFormation
> Terraform: multi-cloud, explicit state, vast provider ecosystem. [[AWS CDK]]: real code + abstractions, AWS-first. [[CloudFormation]]: AWS-native, no state to host.
