---
tags: [programming, typescript, setup, snippet]
---

# Create a TypeScript Project

## From Scratch

```sh
mkdir myproj && cd myproj
npm init -y
npm pkg set type=module
npm i -D typescript @types/node tsx
mkdir src
```

`tsconfig.json` (ESM, Node 24, TypeScript 7):

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`"types": ["node"]` is required — `tsc` 7 no longer picks up `@types/node` implicitly, and `node:` imports fail with `TS2591` without it. Import local files with the `.js` extension (`./lru.js`) under `NodeNext`.

```sh
npx tsx src/index.ts          # run TS directly (dev)
npx tsc && node dist/index.js # build, then run
```

## AWS CDK Project

```sh
npx aws-cdk init app --language typescript
alias cdk="npx aws-cdk"        # skip the global install
```

See [[AWS CDK]] for the construct model and deploy workflow.
