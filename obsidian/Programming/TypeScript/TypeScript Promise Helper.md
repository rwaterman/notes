---
tags: [typescript, snippet]
---

# TypeScript Promise Helper

```typescript
// Use this function to flatten try/catch blocks, i.e. const [err, res] = await to(somePromise());
export const to = async <T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> => {
  try {
    return [null, await promise];
  } catch (err) {
    return [err as Error, null];
  }
};
```
