---
tags: [devops, ci-cd, github-actions]
---

# GitHub Actions

CI/CD native to GitHub. Workflows (YAML in `.github/workflows/`) run on repo **events** — push, PR, schedule, manual — on GitHub-hosted or self-hosted **runners**.

## Anatomy

```yaml
name: ci
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm test
```

- **Workflow** → one or more **jobs** → ordered **steps**.
- **Jobs** run in parallel by default; chain with `needs:`.
- **Steps** are either `run:` (shell) or `uses:` (a reusable **action**).

## Useful Mechanics

- **Matrix** — run a job across versions/OSes:
  ```yaml
  strategy: { matrix: { node: [20, 22, 24] } }
  ```
- **Caching** — `actions/cache` (or built-in `cache:` on setup actions) to speed installs.
- **Artifacts** — `upload-artifact` / `download-artifact` to pass build outputs between jobs.
- **Secrets & variables** — `${{ secrets.X }}`, environment protection rules for prod gates.
- **Reusable workflows** (`workflow_call`) and **composite actions** for DRY pipelines.
- **Concurrency** — cancel superseded runs: `concurrency: { group: ${{ github.ref }}, cancel-in-progress: true }`.

## Deploying to AWS — use OIDC, not keys

Assume an IAM role via short-lived OIDC tokens; no long-lived secrets in the repo.

```yaml
permissions: { id-token: write, contents: read }
steps:
  - uses: aws-actions/configure-aws-credentials@v6
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
      aws-region: us-east-1
  - run: aws s3 sync ./dist s3://my-bucket --delete
```

> [!tip] Least privilege
> Set top-level `permissions:` to the minimum (`contents: read`) and elevate per-job. Pin third-party actions to a commit SHA for supply-chain safety. See [[IAM]] and the [[Production Readiness Checklist]].
