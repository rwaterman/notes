---
tags: [typescript, snippet]
---

# TypeScript Promise Helper

Go-style `[err, result]` tuple instead of `try`/`catch` per call. Non-`Error` rejections (strings, plain objects) are wrapped so `err` is always an `Error`.

```typescript
export const to = async <T>(promise: Promise<T>): Promise<[null, T] | [Error, null]> => {
  try {
    return [null, await promise];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
};
```

```typescript
const [err, user] = await to(fetchUser(id));
if (err) return res.status(502).json({ message: err.message });
// user is narrowed to T here
```

Check:

```typescript
import assert from 'node:assert/strict';

assert.deepEqual(await to(Promise.resolve(42)), [null, 42]);
const [err] = await to(Promise.reject(new Error('boom')));
assert.equal(err?.message, 'boom');
const [err2] = await to(Promise.reject('string-reason'));
assert.equal(err2?.message, 'string-reason');
```
