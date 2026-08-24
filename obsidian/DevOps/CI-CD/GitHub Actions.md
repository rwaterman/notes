---
tags: [devops, ci-cd, github-actions]
---

# GitHub Actions

Workflows (YAML in `.github/workflows/`) run on repo **events** — push, PR, schedule, manual — on GitHub-hosted or self-hosted **runners**.

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
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm test
```

- **Workflow** → **jobs** (parallel by default; chain with `needs:`) → ordered **steps** (`run:` shell or `uses:` action).

## Useful Mechanics

- **Matrix** — `strategy: { matrix: { node: [22, 24] } }`, then `node-version: ${{ matrix.node }}`.
- **Caching** — built-in `cache:` on setup actions, or `actions/cache@v6`.
- **Artifacts** — `actions/upload-artifact@v7` / `download-artifact` between jobs.
- **Secrets & variables** — `${{ secrets.X }}`; environment protection rules gate prod.
- **Reusable workflows** (`workflow_call`) and **composite actions** for DRY pipelines.
- **Concurrency** — cancel superseded runs: `concurrency: { group: ${{ github.ref }}, cancel-in-progress: true }`.

## Deploying to AWS — OIDC, not keys

```yaml
permissions: { id-token: write, contents: read }
steps:
  - uses: aws-actions/configure-aws-credentials@v6
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gha-deploy
      aws-region: us-west-2
  - run: aws s3 sync ./dist s3://my-bucket --delete
```

Top-level `permissions:` at the minimum (`contents: read`), elevate per job. Reference actions by major tag (`@v7`). See [[IAM]] and the [[Production Readiness Checklist]].
