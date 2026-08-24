---
tags: [programming, typescript, data-structures, snippet]
---

# LRU Cache

Evicts the entry untouched for the longest once at capacity. JS `Map` preserves insertion order, so "most recently used" = delete + re-insert, and the eviction candidate is the first key from `keys()`. O(1) for `get` and `set`.

```typescript
export class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity must be >= 1');
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);        // re-insert = mark most-recently-used
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      this.cache.delete(this.cache.keys().next().value as K); // oldest
    }
    this.cache.set(key, value);
  }

  get size(): number {
    return this.cache.size;
  }
}
```

Check:

```typescript
import assert from 'node:assert/strict';

const c = new LRUCache<string, number>(2);
c.set('a', 1); c.set('b', 2);
assert.equal(c.get('a'), 1);      // touch a → b is now LRU
c.set('c', 3);                    // evicts b
assert.equal(c.get('b'), undefined);
assert.equal(c.get('a'), 1);
c.set('a', 10);                   // update, no eviction
assert.equal(c.size, 2);
assert.throws(() => new LRUCache(0), RangeError);
```

## Memoization

```typescript
const memo = new LRUCache<number, number>(1000);

function fib(n: number): number {
  if (n <= 1) return n;
  const hit = memo.get(n);
  if (hit !== undefined) return hit;
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}
```

In-process variant of **cache-aside** ([[Caching]]). Shared across processes or hosts → Redis / Memcached instead.
