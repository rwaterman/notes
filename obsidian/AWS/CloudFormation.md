---
tags: [aws, cloudformation, iac]
---

# CloudFormation

AWS-native Infrastructure as Code. Declare resources in a **template** (YAML/JSON); CloudFormation provisions and tracks them as a **stack**, handling create/update/delete ordering and rollback.

## Template Anatomy

```yaml
Parameters:     # inputs
Mappings:       # static lookup tables
Conditions:     # conditional resource creation
Resources:      # the only required section
Outputs:        # exported values / cross-stack refs
```

## Intrinsic Functions

- `!Ref` — a parameter value or a resource's primary id.
- `!GetAtt` — a resource attribute (e.g. `MyBucket.Arn`).
- `!Sub` — string interpolation (`"${AWS::Region}-bucket"`).
- `!Join`, `!Select`, `!FindInMap`, `!ImportValue` (cross-stack).

## Managing Change Safely

- **Change sets** — preview what an update will add/modify/**replace** before applying.
- **Drift detection** — find resources changed outside CloudFormation.
- **DeletionPolicy / UpdateReplacePolicy** — `Retain` or `Snapshot` to protect stateful resources (databases, buckets) from accidental deletion.
- Failed updates **roll back** automatically by default.

## Scaling Across Stacks/Accounts

- **Nested stacks** — compose reusable child templates.
- **Cross-stack references** — `Export` outputs, `!ImportValue` elsewhere.
- **StackSets** — deploy a template across many accounts/regions.

## Related Tooling

- **SAM** — CloudFormation macro for serverless (terser Lambda/API/DynamoDB syntax) + local testing.
- **[[AWS CDK]]** — author in TypeScript/Python; synthesizes to CloudFormation.

> [!tip] CloudFormation vs Terraform vs CDK
> CloudFormation: native, no state file to host, AWS-only. [[Terraform]]: multi-cloud, explicit state, huge provider ecosystem. CDK: real code + abstractions, compiles to CloudFormation. Pick by team familiarity and cloud breadth.
