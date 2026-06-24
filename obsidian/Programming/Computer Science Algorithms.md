## Sources
- Javascript Algorithms and Data Structures Masterclass (Udemy)

## Resources
- My github repo with the algorithms

## Introduction

### **Problem Solving/Coding Interviews**

1. **Understand the problem**
2. **Explore Concrete Examples**
3. **Break It Down**
4. **Solve/Simplify**
5. **Look Back and Refactor**

## Stacks
Stacks are LIFO (Last In First Out). Think stack of plates.

### Where Stacks Are Used
- Used to manage function invocations
- Undo / Redo
- Routing (the history object in a web browser) is treated like a stack

The JS push and pop implementation is not quite O(1) because it’s doing array copies and not SLL.

?: Just use top and bottom as references?

## Queues
Queues are FIFO (First In First Out). Think of lines in a store.
?: Use front and back and references?

### Where Queues Are Used
- Background tasks
- Uploading resources
- Printing / task processing


## Trees

### Tree Terminology
- Root
	- Top node in a tree
- Child
	- A node directly connected to another node when moving away from the root
- Parent
	- The converse notion of a child
- Leaf
	- A node with no children
- Edge
	- The connection between one node and another

### Uses of Trees
- HTML DOM
- Network Routing
- AI
- File system
- JSON

### AST
Describes a programming language syntax

### Basics
- Lists are linear but trees are nonlinear
- In a tree, all nodes point down/away from root

### Binary Search Tree (BST)
- Every parent node has at most two children
- Every node to the left of a parent node is always less than the parent
- Every node to the right of a parent node is always greater than the parent
- Big O
	- Insert: O(log(n))
	- Search: O(log(n))
		- Not guaranteed!

### Visiting Every Node (BFS, DFS)
- BFS (primary direction is horizontal)
	- row by row searching (think nodes in a trees lined up in horizontal rows)
- DFS (primary direction is vertical) /see algorithms-js repo
	- InOrder
		- ^
	- PreOrder
		- ^
	- PostOrder
	- ^

## Heaps

### What is a binary heap?

- Very similar to BST
- In a MaxBinaryHeap
	- parent nodes are always larger than child nodes
- In a MinBinaryHeap
	- parent nodes are always smaller than child nodes
- There is no order to left versus right!
- A binary heap is as compact as possible. All the children of each node are as full as they can be and left children are filled in first

### Storing Heaps
- To find the child:
	- For any index of an array n,
	- The left index is a 2n +1 and the right child’s index is at 2n + 2
- To find the parent:
	- Floor((n - 1)/2)