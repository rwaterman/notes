---
tags: [programming, algorithms, data-structures, computer-science]
---

# Computer Science Algorithms

Working notes on data structures and the problem-solving loop — the mental models worth keeping for interviews and for reasoning about performance.

> [!note] Source
> *JavaScript Algorithms and Data Structures Masterclass* (Udemy), plus a personal implementation repo.

## Problem-Solving Loop

A repeatable approach for coding problems (George Pólya, adapted):

1. **Understand the problem** — restate it; know the inputs, outputs, and constraints before writing anything.
2. **Explore concrete examples** — simple cases, then edge cases (empty, huge, invalid). They become test cases.
3. **Break it down** — write the steps in plain comments first.
4. **Solve or simplify** — solve the easy version, then generalize; a working brute force beats a broken clever solution.
5. **Look back and refactor** — improve time/space, readability, and reuse once it works.

## Stacks

**LIFO** (Last In, First Out) — think a stack of plates.

Used for: function call management (the call stack), undo/redo, browser history (the `history` object), and expression/bracket matching.

- Array `push`/`pop` in JS isn't strictly O(1) (occasional resize/copy), but it's amortized O(1) and fine in practice. A singly-linked list gives guaranteed O(1) push/pop from the head.

## Queues

**FIFO** (First In, First Out) — think a line at a store.

Used for: background job processing, resource upload/print queues, and **BFS** traversal.

- A naive array `shift()` is O(n) (it re-indexes every element). For O(1) dequeue, track `front`/`back` pointers or use a linked list.

## Trees

Hierarchical, non-linear structures; all nodes point away from a single **root**.

**Terminology**

- **Root** — the top node.
- **Child** — a node connected below another (away from the root).
- **Parent** — the converse of a child.
- **Leaf** — a node with no children.
- **Edge** — a connection between two nodes.

**Where trees show up:** the HTML DOM, file systems, JSON, network routing, decision trees in AI, and **ASTs** (a tree describing a program's syntax).

### Binary Search Tree (BST)

- Each node has at most two children.
- Everything in the **left** subtree is less than the node; everything in the **right** subtree is greater.
- **Balanced** BST: insert and search are O(log n).
- **Not guaranteed** — a BST built from sorted input degrades to a linked list (O(n)). Self-balancing variants (AVL, red-black) restore O(log n).

### Traversal

**BFS (Breadth-First)** — level by level, left to right. Uses a **queue**. Good when the answer is near the root or you need the shortest path in an unweighted tree.

**DFS (Depth-First)** — go deep before wide. Uses recursion (or an explicit **stack**). Three orders, differing only in *when the node itself is visited*:

- **PreOrder** — node, then left, then right. (Copy/serialize a tree.)
- **InOrder** — left, then node, then right. (On a BST this yields **sorted** order.)
- **PostOrder** — left, then right, then node. (Delete/free a tree bottom-up.)

## Heaps (Binary Heap)

A complete binary tree kept compact (filled left to right) that maintains a heap invariant:

- **Max-heap** — every parent ≥ its children (root is the max).
- **Min-heap** — every parent ≤ its children (root is the min).
- No ordering between left and right siblings — only the parent/child relationship matters.

**Array storage** (no pointers needed — the shape is implicit):

- Left child of index `n` → `2n + 1`
- Right child of index `n` → `2n + 2`
- Parent of index `n` → `Math.floor((n - 1) / 2)`

Insert and extract-max/min are O(log n) (bubble up / sift down). This is the backbone of **priority queues** and heapsort.

## Big-O Quick Reference

| Structure | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| Stack / Queue | O(n) | O(n) | O(1) | O(1) |
| Balanced BST | — | O(log n) | O(log n) | O(log n) |
| Binary Heap | O(1) peek | O(n) | O(log n) | O(log n) |
| Hash Table | — | O(1) avg | O(1) avg | O(1) avg |
