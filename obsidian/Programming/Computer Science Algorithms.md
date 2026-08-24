---
tags: [programming, algorithms, data-structures, computer-science, snippet]
---

# Computer Science Algorithms

Data-structure essentials for interviews and for reasoning about performance. Source: *JavaScript Algorithms and Data Structures Masterclass* (Udemy).

## Problem-Solving Loop

1. **Understand** — restate inputs, outputs, constraints.
2. **Examples** — simple, then edge cases (empty, huge, invalid). They become the tests.
3. **Break down** — steps as comments first.
4. **Solve or simplify** — working brute force beats broken clever.
5. **Refactor** — time/space, readability, reuse.

## Big-O Quick Reference

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| Stack / Queue | O(n) | O(n) | O(1) | O(1) |
| Balanced BST | — | O(log n) | O(log n) | O(log n) |
| Binary Heap | O(1) peek | O(n) | O(log n) | O(log n) |
| Hash Table | — | O(1) avg | O(1) avg | O(1) avg |

## Stacks & Queues

- **Stack** (LIFO): call stack, undo/redo, bracket matching, DFS. Array `push`/`pop` is amortized O(1).
- **Queue** (FIFO): job processing, BFS. Array `shift()` is O(n) — use a head index or linked list for O(1) dequeue.

## Trees

- **BST**: left subtree < node < right subtree. Balanced → O(log n) search/insert; sorted input degrades to a linked list (O(n)) — AVL / red-black fix that.
- **BFS** — level by level, uses a queue. Shortest path in unweighted trees.
- **DFS** — recursion or explicit stack. Orders differ only in *when the node is visited*: **pre** (node, L, R — copy/serialize), **in** (L, node, R — sorted order on a BST), **post** (L, R, node — free bottom-up).

## Binary Heap

Complete binary tree, filled left to right, stored in an array — no pointers:

- children of `i` → `2i + 1`, `2i + 2`; parent of `i` → `(i - 1) >> 1`
- **Min-heap:** parent ≤ children; **max-heap:** parent ≥ children. Siblings unordered.
- Insert: append, bubble up. Extract: swap root with last, sift down. Both O(log n). Backbone of priority queues and heapsort.

## Snippets

```typescript
class MinHeap {
  private a: number[] = [];
  get size(): number { return this.a.length; }

  push(v: number): void {
    this.a.push(v);
    for (let i = this.a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (this.a[p] <= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }

  pop(): number | undefined {
    if (this.a.length === 0) return undefined;
    const top = this.a[0];
    const last = this.a.pop()!;
    if (this.a.length === 0) return top;
    this.a[0] = last;
    for (let i = 0; ; ) {
      const l = 2 * i + 1, r = l + 1;
      let m = i;
      if (l < this.a.length && this.a[l] < this.a[m]) m = l;
      if (r < this.a.length && this.a[r] < this.a[m]) m = r;
      if (m === i) return top;
      [this.a[m], this.a[i]] = [this.a[i], this.a[m]];
      i = m;
    }
  }
}
```

```typescript
type TreeNode<T> = { value: T; left?: TreeNode<T>; right?: TreeNode<T> };

function bfs<T>(root: TreeNode<T>): T[] {
  const out: T[] = [];
  const queue = [root];
  for (let head = 0; head < queue.length; head++) { // head index, not shift()
    const n = queue[head];
    out.push(n.value);
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return out;
}

function dfs<T>(n: TreeNode<T> | undefined, order: 'pre' | 'in' | 'post', out: T[] = []): T[] {
  if (!n) return out;
  if (order === 'pre') out.push(n.value);
  dfs(n.left, order, out);
  if (order === 'in') out.push(n.value);
  dfs(n.right, order, out);
  if (order === 'post') out.push(n.value);
  return out;
}
```

Check:

```typescript
import assert from 'node:assert/strict';

const h = new MinHeap();
[5, 3, 8, 1, 9, 2, 7].forEach((v) => h.push(v));
const drained: number[] = [];
for (let v = h.pop(); v !== undefined; v = h.pop()) drained.push(v);
assert.deepEqual(drained, [1, 2, 3, 5, 7, 8, 9]);

const bst: TreeNode<number> = {
  value: 4,
  left: { value: 2, left: { value: 1 }, right: { value: 3 } },
  right: { value: 6, left: { value: 5 }, right: { value: 7 } },
};
assert.deepEqual(bfs(bst), [4, 2, 6, 1, 3, 5, 7]);
assert.deepEqual(dfs(bst, 'pre'), [4, 2, 1, 3, 6, 5, 7]);
assert.deepEqual(dfs(bst, 'in'), [1, 2, 3, 4, 5, 6, 7]);
assert.deepEqual(dfs(bst, 'post'), [1, 3, 2, 5, 7, 6, 4]);
```
