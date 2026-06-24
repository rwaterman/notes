---
tags: [programming, typescript, setup]
---

# Create a TypeScript Project

## From Scratch

```sh
mkdir myproj && cd myproj
npm init -y
npm i -D typescript @types/node tsx
npx tsc --init        # generates tsconfig.json
```

Sensible `tsconfig.json` starting points:

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  }
}
```

Run without a build step during dev:

```sh
npx tsx src/index.ts        # execute TS directly
node --watch dist/index.js  # after tsc build
```

## AWS CDK Project

```sh
npx aws-cdk init --language typescript
```

**Recommended alias** (skip a global install):

```sh
alias cdk="npx aws-cdk"
```

See [[AWS CDK]] for the construct model and deploy workflow.
