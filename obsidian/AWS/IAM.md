---
tags: [aws, iam, security, identity]
---

# IAM

Identity and Access Management — *who* can do *what* to *which* resources *under what conditions*. The control plane for every AWS API call.

## Principals

- **Users** — long-lived identities for humans/legacy apps (avoid for workloads; prefer federation).
- **Groups** — collections of users for shared permissions.
- **Roles** — assumable identities with **temporary** credentials via STS. The right tool for services, cross-account, and federated access.
- **Instance profiles** — attach a role to EC2 so code uses short-lived creds, never hard-coded keys.

## Policies

JSON documents granting/denying permissions.

- **Identity-based** — attached to a user/group/role.
- **Resource-based** — attached to a resource (S3 bucket policy, SQS policy); includes a **Principal**.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": { "StringEquals": { "aws:PrincipalTag/team": "data" } }
  }]
}
```

## Evaluation Logic

1. **Explicit `Deny`** anywhere → denied.
2. Otherwise an **`Allow`** must exist → allowed.
3. Otherwise **implicit deny**.

Effective permissions are also bounded by **SCPs** (Organizations), **permission boundaries**, and **session policies** — a grant must pass *all* of them.

## Good Practice

- **Least privilege** — start minimal, widen from access logs; verify with **IAM Access Analyzer**.
- Prefer **roles + temporary credentials** over access keys; rotate any keys that must exist.
- Require **MFA** for humans; use **IAM Identity Center** (SSO) for workforce access.
- Use **managed policies** for reuse, **inline** only for tight 1:1 coupling.

> [!warning] The `*:*` trap
> `Action: "*", Resource: "*"` is convenient and almost always wrong. Scope actions and ARNs; add `Condition` keys (source VPC, MFA, tags) to harden.
