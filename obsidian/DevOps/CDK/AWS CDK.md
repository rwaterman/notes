---
tags: [devops, cdk, aws, iac]
---

# AWS CDK

Define AWS infrastructure in a real programming language (TypeScript, Python, Java, Go, C#). The CDK **synthesizes** your code into a [[CloudFormation]] template, then deploys it — so you get loops, functions, types, and IDE support over raw YAML.

## Mental Model

```
App ─┬─ Stack ─┬─ Construct ─┬─ Resource (L1)
     │         │             └─ Resource (L1)
     └─ Stack  └─ Construct
```

- **App** — the root; contains one or more stacks.
- **Stack** — a CloudFormation deployment unit.
- **Construct** — reusable component; the building block you compose.

## Construct Levels

- **L1 (Cfn\*)** — 1:1 with CloudFormation resources; verbose, full control.
- **L2** — curated AWS constructs with sane defaults, helper methods, and IAM wiring (`s3.Bucket`, `lambda.Function`). The common case.
- **L3 (patterns)** — opinionated multi-resource solutions (`aws-apigateway.LambdaRestApi`, ECS patterns).

## CLI

```bash
cdk init app --language typescript
cdk bootstrap        # one-time per account/region (deploys the CDK toolkit stack)
cdk synth            # emit the CloudFormation template
cdk diff             # show changes vs deployed stack
cdk deploy           # provision
cdk destroy
```

## Example

```typescript
const bucket = new s3.Bucket(this, 'Assets', {
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: RemovalPolicy.RETAIN,
});
const fn = new lambda.Function(this, 'Fn', { /* ... */ });
bucket.grantRead(fn); // generates least-privilege IAM automatically
```

## Notes

- **`grant*` methods** generate scoped [[IAM]] policies for you — a major reason to choose CDK.
- **Context & environment** — pin `account`/`region`; commit `cdk.context.json` for reproducible synth.
- **Aspects** — apply cross-cutting changes/validation across the tree (e.g. enforce tags).
- **CDK for Terraform (cdktf)** exists if you want CDK ergonomics on a [[Terraform]] backend.
