---
tags: [programming, typescript, data-structures, snippet]
---

# LRU Cache

A **Least Recently Used** cache evicts the entry that hasn't been touched for the longest time once it hits capacity. `Map` makes this an O(1), few-line implementation in TypeScript: JS `Map` preserves insertion order, so "most recently used" = re-insert at the end, and "least recently used" = the first key `keys().next()` yields.

```typescript
class LRUCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key); // re-insert to mark most-recently-used
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key); // move to end
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value as K; // oldest = first inserted
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}
```

## Why `Map`, not a plain object

- Insertion order is guaranteed and iterable — `keys().next().value` is the eviction candidate in O(1).
- Keys keep their type (objects, numbers) instead of being coerced to strings.
- `delete` + `set` is the idiomatic "bump to most-recent" move.

## Memoization Example

```typescript
const memo = new LRUCache<number, number>(100_000);

function fib(n: number): number {
  if (n <= 1) return n;
  const hit = memo.get(n);
  if (hit !== undefined) return hit;
  const result = fib(n - 1) + fib(n - 2);
  memo.set(n, result);
  return result;
}
```

> [!tip] Where this sits
> This is the in-process variant of the **cache-aside** pattern in [[Caching]]. For anything shared across processes or hosts, reach for Redis / Memcached instead of an in-memory `Map`.
