
```typescript
class LRUCache {
private cache: Map<number, number> = new Map(); 
private capacitye: number;

constructor(capacity: number) { 
this.capacity = capacity; 
}

get(n: number): number | undefined { 
if (!this.cache.has(n)) return undefined; 
const val = this.cache.get(n)!; 
this.cache.delete(n); // Move to end (most recent) 
this.cache.set(n, val); 
return val; 
}

set(n: number, val: number): void { 
if (this.cache.has(n)) { 
this.cache.delete(n); // Move to end if exists 
} else if (this.cache.size >= this.capacity) { 
const lruKey = this.cache.keys().next().value; // Evict oldest 
this.cache.delete(lruKey); 
} 
this.cache.set(n, val); 
} 
}

const memo = new LRUCache(12_000_000); // ~96 MB max

function fib(n: number): number { 
if (n <= 1) return n;

let result = memo.get(n); 
if (result !== undefined) return result;

result = fib(n - 1) + fib(n - 2); 
memo.set(n, result); 
return result; 
}
