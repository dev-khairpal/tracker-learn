import type { RoadmapDetailMap } from './types';

export const DsaLinkedListTreeContent: RoadmapDetailMap = {
	'Fast & Slow Pointers': {
		definition:
			"The Fast & Slow Pointers technique (Floyd's cycle detection) walks two pointers through a linked list at different speeds — one step at a time and two steps at a time — so the gap between them changes every iteration, letting you detect cycles, find the middle, or locate other structural midpoints in a single pass with O(1) extra memory.",
		useCase:
			'Detecting whether a linked list has become circular (e.g. a corrupted "next" reference chain) or finding the middle node of a list in one pass so you can split it in half for a merge-sort-style algorithm.',
		detailedMarkdown: `
# Fast & Slow Pointers (Floyd's Cycle Detection)

## Problem It Solves
Given only a reference to the head of a singly linked list (no length, no random access, no extra memory allowed), how do you: detect whether it loops back on itself, find its exact middle, or find the specific node where a cycle begins? Doing any of this by counting nodes first requires two passes; doing it by storing visited nodes in a set costs O(n) memory. Fast & Slow Pointers solves all three with **one pass and O(1) memory**.

## The Pattern
Use two pointers, both starting at \`head\`:
- \`slow\` advances **one node** per step.
- \`fast\` advances **two nodes** per step.

If the list is a straight line (no cycle), \`fast\` simply reaches \`null\` first and you're done. If the list *does* loop, \`fast\` eventually laps \`slow\` from behind and they land on the exact same node — this is the part interviewers want you to actually justify, not just recite.

### Why They're Guaranteed to Meet Inside a Cycle
Once \`slow\` enters the cycle, think of the distance between \`fast\` and \`slow\`, measured going forward around the cycle. Every step, \`fast\` gains exactly **one extra node** of ground on \`slow\` (fast moves 2, slow moves 1, net gap change = -1 node per step, modulo the cycle length). Since the cycle has some finite length \`C\`, the gap — which only ever shrinks by exactly 1 per step and wraps around modulo \`C\` — must hit 0 within at most \`C\` steps. It cannot "jump over" \`slow\` the way it might on an unbounded number line, because the gap shrinks by exactly one unit at a time on a finite loop. That's the whole proof: a strictly-decreasing-by-1, wrapping gap on a finite cycle must eventually equal zero.

### Finding Where the Cycle Starts (the classic follow-up)
This is the question every interviewer asks right after "detect a cycle": once \`slow\` and \`fast\` meet, how do you find the **first node of the cycle** (not just confirm one exists)?

The trick: leave one pointer at the meeting point, reset the other one to \`head\`, and now advance **both one step at a time**. They meet again exactly at the start of the cycle. This works because of the distance algebra: if the head-to-cycle-start distance is \`a\` and the meeting point is \`b\` steps into the cycle, it's provable (from how far each pointer traveled) that walking \`a\` steps from \`head\` lands on the same node as walking \`a\` steps from the meeting point around the remainder of the cycle — so both pointers, moving at the same speed from those two starting points, are guaranteed to converge at the cycle's entrance.

## Code Example (TypeScript)
\`\`\`typescript
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val: number, next: ListNode | null = null) {
        this.val = val;
        this.next = next;
    }
}

// 1. Detect a cycle
function hasCycle(head: ListNode | null): boolean {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow!.next;
        fast = fast.next.next;
        if (slow === fast) return true; // lapped — must be a cycle
    }
    return false; // fast reached the end — no cycle
}

// 2. Find the node where the cycle begins (returns null if no cycle)
function detectCycleStart(head: ListNode | null): ListNode | null {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow!.next;
        fast = fast.next.next;
        if (slow === fast) {
            // Meeting point found — now find the entrance
            let ptr = head;
            while (ptr !== slow) {
                ptr = ptr!.next;
                slow = slow!.next;
            }
            return ptr; // the cycle's first node
        }
    }
    return null;
}

// 3. Find the middle node in one pass
function middleNode(head: ListNode | null): ListNode | null {
    let slow = head;
    let fast = head;

    // When fast reaches the end, slow is at the middle
    // (for even-length lists, this lands on the SECOND middle node)
    while (fast !== null && fast.next !== null) {
        slow = slow!.next;
        fast = fast.next.next;
    }
    return slow;
}
\`\`\`

## Complexity
- **Time:** O(n) — fast pointer visits at most 2n nodes before either exiting or lapping slow.
- **Space:** O(1) — only two pointers, regardless of list length. This is the entire selling point over a hash-set-based "have I seen this node" approach, which is also O(n) time but O(n) space.

## Signals This Pattern Applies
- The problem involves a **singly linked list** and asks you to find a **cycle**, a **midpoint**, or "the Nth node from the end."
- You're told (or need) to solve it in **O(1) extra space** — that constraint alone rules out hash-set approaches and points straight at two pointers.
- The phrase "in one pass" appears in the problem statement.
- You need to check if a list is a **palindrome** (find the middle with slow/fast, then reverse the second half and compare).
- Any problem about detecting a "loop" or "repeated state" in a sequence generated by repeatedly applying a function (e.g. LeetCode's "Happy Number" — treat each number transformation as a "next pointer").

## Common Pitfalls
- **Null-checking the wrong thing:** the loop condition must check \`fast !== null && fast.next !== null\` — checking only \`fast !== null\` will crash on \`fast.next.next\` when \`fast.next\` is \`null\`.
- **Off-by-one on "middle of even-length list":** depending on whether the loop condition is \`fast && fast.next\` vs. \`fast.next && fast.next.next\`, you land on the first vs. second middle node for even-length lists — always clarify which one the problem wants.
- **Forgetting the reset-to-head step:** finding *that* a cycle exists and finding *where* it starts are two different sub-problems — many candidates stop at "yes there's a cycle" and don't know the second pointer-reset phase is needed.
- **Comparing values instead of node references:** \`slow === fast\` must compare node identity, not \`slow.val === fast.val\` — two different nodes can coincidentally hold the same value.

## Interview Angle
Expect the interviewer to push past "does a cycle exist" into "where does it start" and "what's the cycle's length" (once you have the start node, walk it until you return to itself, counting steps). Being able to derive the distance argument on a whiteboard — rather than just reciting "reset one pointer to head" as a memorized trick — is what separates a strong answer from a memorized one.
	`
	},

	'Linked List Reversal': {
		definition:
			'Linked List Reversal rewires the `next` pointers of a singly linked list so it points the opposite direction, using three tracked references (previous, current, next) to avoid losing the rest of the list mid-rewrite — extendable to reversing only a sublist or reversing fixed-size groups.',
		useCase:
			'Reversing a linked list representation of a large number for addition (LeetCode-style "Add Two Numbers" variants), or reversing every group of k nodes to implement a "reverse in batches" transformation used in some LRU/paging structures.',
		detailedMarkdown: `
# Linked List Reversal

## Problem It Solves
Arrays get reversal "for free" via index arithmetic (swap \`arr[i]\` and \`arr[n-1-i]\`), but a singly linked list only has forward pointers — once you overwrite a node's \`next\`, you lose your only way to reach the rest of the original list unless you've saved a reference to it first. This pattern is really about **careful pointer bookkeeping under a constraint**: you must save "what's next" *before* you destroy it.

## The Pattern (Iterative — Three-Pointer Dance)
Track three pointers at all times: \`prev\`, \`curr\`, and \`next\`.
1. Before rewiring, save \`curr.next\` into \`next\` — this is the one line that prevents "losing the rest of the list."
2. Point \`curr.next\` backward, at \`prev\`.
3. Slide the whole window forward: \`prev = curr\`, \`curr = next\`.
4. Repeat until \`curr\` is \`null\`. \`prev\` is now the new head.

\`\`\`text
Before:  null <- (prev)   (curr)->(next)-> ... -> null
Step 1:  save next
Step 2:  curr.next = prev        [null <- curr  next-> ...]
Step 3:  prev = curr, curr = next   (slide the window forward)
\`\`\`

## Code Example (TypeScript) — Iterative
\`\`\`typescript
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val: number, next: ListNode | null = null) {
        this.val = val;
        this.next = next;
    }
}

function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr: ListNode | null = head;

    while (curr !== null) {
        const next: ListNode | null = curr.next; // (1) save before overwriting
        curr.next = prev;                          // (2) reverse the link
        prev = curr;                                // (3) slide prev forward
        curr = next;                                 //     slide curr forward
    }
    return prev; // prev is the new head once curr runs off the end
}
\`\`\`

## Code Example (TypeScript) — Recursive
\`\`\`typescript
function reverseListRecursive(head: ListNode | null): ListNode | null {
    // Base case: empty list or single node is already "reversed"
    if (head === null || head.next === null) return head;

    const newHead = reverseListRecursive(head.next); // reverse everything after head
    head.next.next = head; // make the node right after head point back at head
    head.next = null;      // head is now the tail — must point to null
    return newHead;        // the new head never changes as we unwind
}
\`\`\`
The recursive version's trickiest line is \`head.next.next = head\` — it relies on \`head.next\` still being the *original* next node (not yet reversed at this level), which is exactly the node that should now point back at \`head\`.

## Reversing a Sublist Between Positions m and n
\`\`\`typescript
function reverseBetween(head: ListNode | null, m: number, n: number): ListNode | null {
    const dummy = new ListNode(0, head);
    let prev: ListNode = dummy;

    // 1. Walk prev to just before position m
    for (let i = 0; i < m - 1; i++) prev = prev.next!;

    // 2. Reverse exactly (n - m + 1) nodes starting at prev.next,
    //    re-inserting each node right after prev (the "head-insertion" trick)
    let curr = prev.next!;
    for (let i = 0; i < n - m; i++) {
        const moved = curr.next!;
        curr.next = moved.next;
        moved.next = prev.next;
        prev.next = moved;
    }
    return dummy.next;
}
\`\`\`

## Reversing in Groups of K
\`\`\`typescript
function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
    // Check there are at least k nodes left; if not, leave this segment as-is
    let node = head;
    for (let i = 0; i < k; i++) {
        if (node === null) return head;
        node = node.next;
    }

    // Reverse the first k nodes (same three-pointer dance, bounded to k steps)
    let prev: ListNode | null = null;
    let curr = head;
    for (let i = 0; i < k; i++) {
        const next: ListNode | null = curr!.next;
        curr!.next = prev;
        prev = curr;
        curr = next;
    }

    // head is now the tail of this reversed group — attach the recursively
    // reversed remainder to it. curr is the start of the next group.
    head!.next = reverseKGroup(curr, k);
    return prev; // new head of this group
}
\`\`\`

## Complexity
- **Whole-list reversal:** O(n) time, O(1) space iteratively (O(n) space recursively, due to the call stack).
- **Sublist reversal (m to n):** O(n) time (one pass to reach \`m\`, then O(n-m) to reverse), O(1) space.
- **Group-of-k reversal:** O(n) time overall (every node is touched a constant number of times), O(n/k) space for the recursive call stack (or O(1) if written iteratively with an explicit loop instead of recursion).

## Signals This Pattern Applies
- The problem explicitly says "reverse" a linked list, a sublist, or groups within a list.
- You need to reverse a portion of a list as a **subroutine** inside a bigger algorithm — e.g. checking if a linked list is a palindrome (find the middle, reverse the second half, compare) or reordering a list (L0→Ln→L1→Ln-1→...).
- The problem gives you position indices (like "reverse between position m and n") rather than values to search for.
- You need to process a list "in chunks of k" — a strong signal for the group-reversal variant.

## Common Pitfalls
- **Losing the rest of the list:** overwriting \`curr.next\` before saving it into a temporary variable is the single most common bug — always capture \`next\` first.
- **Forgetting the dummy head node:** when reversing a sublist that might start at the very head (\`m === 1\`), not using a dummy node forces annoying special-casing for "is the new head actually different now?"
- **Off-by-one in the loop bounds:** \`reverseBetween\`'s loop must run exactly \`n - m\` times, not \`n - m + 1\` — this is the classic source of an extra or missing reversed node.
- **Not checking there are k nodes left:** \`reverseKGroup\` must verify a full group of k exists before reversing it; LeetCode's version leaves a trailing partial group unreversed, and skipping the check corrupts the list.
- **Recursive version forgetting \`head.next = null\`:** without it, the original head (now the new tail) still points forward into the reversed portion, creating a cycle.

## Interview Angle
Interviewers frequently ask you to reverse the list **both ways** (iterative then recursive) back-to-back, specifically to see if you understand *why* the recursive version's \`head.next.next = head\` line works — it's a favorite "explain this line" follow-up. Expect a natural extension into "now reverse only nodes 2 through 4" or "now reverse every group of 3," testing whether you can generalize the three-pointer dance rather than having memorized only the single whole-list case.
	`
	},

	'Merge Linked Lists': {
		definition:
			'Merge Linked Lists combines two or more already-sorted linked lists into a single sorted list by repeatedly picking the smallest current head among the candidates and re-linking nodes in place — extending from a simple two-pointer comparison (two lists) to a min-heap over list heads (K lists).',
		useCase:
			"Merging sorted per-shard result lists from K database partitions into one globally sorted result stream, or as the merge step inside merge sort's linked-list variant.",
		detailedMarkdown: `
# Merge Linked Lists

## Problem It Solves
Given two (or K) linked lists that are each individually sorted, produce one sorted linked list containing all their nodes — ideally by **re-linking existing nodes** rather than allocating new ones, and without the awkward "which list do I initialize the result head from?" special-casing that comes up constantly with linked lists.

## The Pattern: Dummy Head + Pointer Comparison
The recurring trick across every variant of this pattern is the **dummy head node**: instead of writing special-case code for "what is the very first node of the merged list," you create a throwaway placeholder node, always attach new nodes after a \`tail\` pointer, and return \`dummy.next\` at the end. This eliminates an entire class of null-check bugs around the first node.

### Merge Two Sorted Lists
Walk both lists with two pointers; at each step, attach whichever current node is smaller to the result, and advance only that pointer.

\`\`\`typescript
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val: number, next: ListNode | null = null) {
        this.val = val;
        this.next = next;
    }
}

function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode(0);
    let tail = dummy;

    while (l1 !== null && l2 !== null) {
        if (l1.val <= l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }

    // Attach whichever list still has leftover nodes — already sorted, no more comparisons needed
    tail.next = l1 !== null ? l1 : l2;
    return dummy.next;
}
\`\`\`

### Merge K Sorted Lists (Min-Heap Over List Heads)
Naively merging K lists two at a time costs O(N*K) in the worst case (N = total nodes). Instead, keep a **min-heap** containing at most one candidate node from each list — the current head of each list. Repeatedly pop the smallest, attach it to the result, and push its successor from the same list back into the heap. This ties directly back to the **Heap / Priority Queue pattern**: "always give me the smallest of K candidates efficiently" is exactly what a heap is for, and here the K candidates are the K list heads.

\`\`\`typescript
class MinHeap {
    private data: ListNode[] = [];

    get size(): number { return this.data.length; }

    push(node: ListNode): void {
        this.data.push(node);
        this.bubbleUp(this.data.length - 1);
    }

    pop(): ListNode {
        const top = this.data[0];
        const last = this.data.pop()!;
        if (this.data.length > 0) {
            this.data[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.data[parent].val <= this.data[i].val) break;
            [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
            i = parent;
        }
    }

    private bubbleDown(i: number): void {
        const n = this.data.length;
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let smallest = i;
            if (left < n && this.data[left].val < this.data[smallest].val) smallest = left;
            if (right < n && this.data[right].val < this.data[smallest].val) smallest = right;
            if (smallest === i) break;
            [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
            i = smallest;
        }
    }
}

function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    const heap = new MinHeap();
    for (const node of lists) {
        if (node !== null) heap.push(node);
    }

    const dummy = new ListNode(0);
    let tail = dummy;

    while (heap.size > 0) {
        const smallest = heap.pop();
        tail.next = smallest;
        tail = tail.next;
        if (smallest.next !== null) heap.push(smallest.next);
    }

    return dummy.next;
}
\`\`\`

## Complexity
- **Merge two lists:** O(n + m) time, O(1) extra space (nodes are re-linked, not copied).
- **Merge K lists (heap approach):** O(N log K) time, where N is the total number of nodes across all lists and K is the number of lists — each of the N nodes is pushed and popped once, each heap operation costing O(log K). O(K) extra space for the heap itself.
- **Naive pairwise merge of K lists:** O(N * K) worst case — this is the baseline the heap approach improves on, and interviewers expect you to name that trade-off explicitly.

## Signals This Pattern Applies
- The input is explicitly described as "sorted" — one or more **already-sorted linked lists** (or arrays) that need to become one sorted result.
- The problem says "merge" and gives you **K** inputs, not just 2 — that jump from 2 to K is the signal to reach for a heap instead of a simple two-pointer walk.
- You recognize the merge step of merge sort being asked about explicitly in a linked-list context.
- You need the smallest/largest "next candidate" repeatedly from a fixed set of streams — a strong general tell for the Heap / Priority Queue pattern underlying K-way merges.

## Common Pitfalls
- **Forgetting the dummy head:** without it, you need extra logic to decide which of \`l1\`/\`l2\` becomes the initial head, and that logic is easy to get subtly wrong when one list is empty.
- **Leaving \`tail.next\` unset at the end:** after the main loop exits, one list may still have leftover nodes — forgetting \`tail.next = l1 ?? l2\` silently drops the remainder (or leaves stale pointers if you're reusing nodes).
- **Using \`<\` instead of \`<=\` (or vice versa) inconsistently:** this affects stability (whether equal-valued nodes from different lists preserve a consistent relative order) — usually harmless for pure values, but matters if list identity/order carries meaning.
- **Re-pairwise-merging K lists instead of using a heap:** works correctly but is asymptotically worse (O(N*K) vs O(N log K)) — a common "naive but correct" answer interviewers push you past.
- **Heap holding entire lists instead of just current heads:** the heap should only ever contain at most one node per list (the current frontier), not all nodes up front — pushing everything up front works but wastes the "streaming" benefit and can needlessly bloat heap size before it's needed.

## Interview Angle
Expect the interviewer to start you on "merge two sorted lists," get a clean dummy-head solution, and then immediately generalize to "now merge K lists" — this is a scripted escalation designed to see if you independently reach for a heap rather than looping pairwise merges. Being able to state the complexity improvement (O(N*K) to O(N log K)) unprompted is usually the signal they're listening for.
	`
	},

	'DFS on Trees': {
		definition:
			"Depth-First Search on trees explores as far down one branch as possible before backtracking, and comes in three flavors — preorder (root, left, right), inorder (left, root, right), and postorder (left, right, root) — each defined purely by when the current node's value is processed relative to its children.",
		useCase:
			'Computing a directory tree\'s total disk usage bottom-up (postorder, since a folder\'s size depends on its children being computed first), or serializing a tree structure top-down (preorder, since you need the root before you can describe its subtrees).',
		detailedMarkdown: `
# DFS on Trees

## Problem It Solves
Most tree problems boil down to "visit every node, and combine information from a node's children to answer something about the node (or the whole tree)." DFS gives you a systematic way to visit every node exactly once while maintaining access to each node's ancestor path (via the call stack), which is exactly what's needed for path-based questions (path sum, max depth) and subtree-aggregate questions (diameter, subtree size).

## The Three Orderings
The only difference between preorder, inorder, and postorder is **when** you process the current node relative to recursing into its children:

\`\`\`text
preorder(node):   process(node) -> recurse(left) -> recurse(right)   [root first]
inorder(node):     recurse(left) -> process(node) -> recurse(right)   [root in the middle]
postorder(node):  recurse(left) -> recurse(right) -> process(node)   [root last]
\`\`\`

- **Preorder** is useful when you need to process a node *before* its children — e.g. copying/serializing a tree (you need the root's value before you can describe its subtrees) or prefix-style expression tree output.
- **Inorder** is the special one for **binary search trees**: because a BST guarantees left-subtree-values < node < right-subtree-values, visiting left-root-right yields values in **sorted order** for free (see the BST topic).
- **Postorder** is useful when a node's answer *depends on* its children's answers being computed first — e.g. computing subtree size/height, deleting a tree bottom-up (you must free children before their parent), or evaluating an expression tree (evaluate operands before the operator).

## Code Example (TypeScript) — Recursive
\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function preorder(root: TreeNode | null, out: number[] = []): number[] {
    if (root === null) return out;
    out.push(root.val);       // process root first
    preorder(root.left, out);
    preorder(root.right, out);
    return out;
}

function inorder(root: TreeNode | null, out: number[] = []): number[] {
    if (root === null) return out;
    inorder(root.left, out);
    out.push(root.val);       // process root in the middle
    inorder(root.right, out);
    return out;
}

function postorder(root: TreeNode | null, out: number[] = []): number[] {
    if (root === null) return out;
    postorder(root.left, out);
    postorder(root.right, out);
    out.push(root.val);       // process root last
    return out;
}
\`\`\`

## Code Example (TypeScript) — Iterative With an Explicit Stack
Recursion uses the call stack implicitly; interviewers often ask you to make that stack explicit (useful for languages/environments where recursion depth is a real concern on very unbalanced trees).

\`\`\`typescript
// Preorder, iterative: push right before left so left is popped (visited) first
function preorderIterative(root: TreeNode | null): number[] {
    const out: number[] = [];
    if (root === null) return out;

    const stack: TreeNode[] = [root];
    while (stack.length > 0) {
        const node = stack.pop()!;
        out.push(node.val);
        if (node.right !== null) stack.push(node.right);
        if (node.left !== null) stack.push(node.left);
    }
    return out;
}

// Inorder, iterative: walk all the way left, pushing as you go, then process and go right
function inorderIterative(root: TreeNode | null): number[] {
    const out: number[] = [];
    const stack: TreeNode[] = [];
    let curr = root;

    while (curr !== null || stack.length > 0) {
        while (curr !== null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop()!;
        out.push(curr.val);
        curr = curr.right;
    }
    return out;
}

// Postorder, iterative: reverse of a "root, right, left" preorder gives "left, right, root"
function postorderIterative(root: TreeNode | null): number[] {
    const out: number[] = [];
    if (root === null) return out;

    const stack: TreeNode[] = [root];
    while (stack.length > 0) {
        const node = stack.pop()!;
        out.unshift(node.val); // prepend instead of append
        if (node.left !== null) stack.push(node.left);
        if (node.right !== null) stack.push(node.right);
    }
    return out;
}
\`\`\`

## Classic Problems
\`\`\`typescript
// Max depth — postorder-flavored: a node's depth needs both children's depths first
function maxDepth(root: TreeNode | null): number {
    if (root === null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// Path sum — does any root-to-leaf path add up to targetSum?
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
    if (root === null) return false;
    if (root.left === null && root.right === null) return root.val === targetSum;
    const remaining = targetSum - root.val;
    return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}

// Diameter of binary tree — longest path between any two nodes (may not pass through root)
function diameterOfBinaryTree(root: TreeNode | null): number {
    let diameter = 0;

    function depth(node: TreeNode | null): number {
        if (node === null) return 0;
        const left = depth(node.left);
        const right = depth(node.right);
        diameter = Math.max(diameter, left + right); // candidate path through this node
        return 1 + Math.max(left, right);
    }

    depth(root);
    return diameter;
}
\`\`\`

## Complexity
- **Time:** O(n) for all traversals and classic problems above — every node is visited a constant number of times.
- **Space:** O(h) where h is the tree's height, for the recursion/explicit stack — O(log n) for a balanced tree, degrading to O(n) for a completely skewed (linked-list-shaped) tree. This is a frequent complexity-analysis gotcha: candidates often say O(log n) unconditionally without qualifying "only if balanced."

## Signals This Pattern Applies
- The problem is about a **tree** (or graph explored tree-like) and asks about paths from root to leaf, subtree properties, or "deepest"/"longest" structural questions.
- You need to compute something that depends on combining results from a node's children — depth, sum, diameter, balance-checking — that's a postorder signal.
- The problem wants nodes visited **in sorted order** on a BST — that's the inorder signal.
- You need to serialize/clone/rebuild a tree top-down — that's the preorder signal.
- "Delete/free every node" or "evaluate an expression tree" — postorder, since children must be handled before the parent.

## Common Pitfalls
- **Confusing which order fits the problem:** using preorder when postorder is required (e.g. trying to compute subtree sums root-first before children are known) forces awkward two-pass workarounds.
- **Forgetting the null/base case:** every recursive DFS function needs \`if (root === null) return ...\` as the very first line — omitting it is an immediate null-pointer crash.
- **Iterative preorder pushing children in the wrong order:** you must push **right before left** so that **left** ends up on top of the stack and gets popped (visited) first.
- **Assuming O(log n) space unconditionally:** stating "O(log n) space" without the caveat "for a balanced tree" is a common, easily-caught mistake — a skewed tree gives O(n) recursion depth and can even stack-overflow.
- **Off-by-one in diameter:** diameter is measured in **edges** between the two farthest nodes, not depth — candidates often return \`left + right + 1\` (a node count) instead of \`left + right\` (an edge count), or vice versa depending on the exact problem definition, so always confirm which unit is expected.

## Interview Angle
A very common follow-up after any recursive DFS solution is "now do it without recursion" — that's testing whether you understand recursion as an explicit stack, not just as syntax. Another common escalation: after "max depth" or "path sum," the interviewer asks for "diameter," which requires the insight that the answer isn't necessarily rooted at the tree's root — accumulating a side answer (\`diameter\`) while still returning depth from the recursive call is the key technique to walk through out loud.
	`
	},

	'BFS / Level Order Traversal': {
		definition:
			"BFS / Level Order Traversal explores a tree breadth-first using a FIFO queue, visiting all nodes at depth d before any node at depth d+1 — the key implementation trick being to snapshot the queue's length at the start of each level so you know exactly how many nodes belong to the current level before any of their children get enqueued.",
		useCase:
			'Rendering an org chart or file-tree UI level-by-level (top rank of managers first, then their direct reports, etc.), or computing the shortest number of "hops" between nodes in an unweighted tree/graph.',
		detailedMarkdown: `
# BFS / Level Order Traversal

## Problem It Solves
DFS naturally answers "root-to-leaf" and "subtree aggregate" questions, but it does *not* naturally give you nodes grouped by depth, nor does it give you the shortest path in an unweighted structure without extra bookkeeping. BFS visits nodes in strict order of distance from the root, which makes level-grouping and shortest-path/minimum-depth questions fall out almost for free.

## The Pattern: Queue + "Process queue.length Items Per Level"
Use a FIFO queue seeded with the root. The core trick that turns plain BFS into **level order** traversal is: at the start of processing each level, record \`const levelSize = queue.length\` *before* enqueuing any children — that number is exactly how many nodes belong to the current level, since every node currently in the queue was enqueued by the previous level and nothing from the current level has been added yet.

\`\`\`text
queue: [root]
level 0: levelSize = 1 -> dequeue root, enqueue its children
queue: [A, B]
level 1: levelSize = 2 -> dequeue A, B, enqueue their children
... and so on
\`\`\`

## Code Example (TypeScript) — Level Order Traversal
\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function levelOrder(root: TreeNode | null): number[][] {
    const result: number[][] = [];
    if (root === null) return result;

    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
        const levelSize = queue.length; // snapshot BEFORE enqueuing this level's children
        const level: number[] = [];

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            level.push(node.val);
            if (node.left !== null) queue.push(node.left);
            if (node.right !== null) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}
\`\`\`

## Classic Problems

### Zigzag Level Order
Same level-boundary trick, alternating the direction each level's values are recorded.
\`\`\`typescript
function zigzagLevelOrder(root: TreeNode | null): number[][] {
    const result: number[][] = [];
    if (root === null) return result;

    const queue: TreeNode[] = [root];
    let leftToRight = true;

    while (queue.length > 0) {
        const levelSize = queue.length;
        const level: number[] = [];

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            if (leftToRight) level.push(node.val);
            else level.unshift(node.val); // reverse insertion for alternate levels
            if (node.left !== null) queue.push(node.left);
            if (node.right !== null) queue.push(node.right);
        }
        result.push(level);
        leftToRight = !leftToRight;
    }
    return result;
}
\`\`\`

### Right Side View
The last node processed in each level is exactly the one visible "from the right."
\`\`\`typescript
function rightSideView(root: TreeNode | null): number[] {
    const result: number[] = [];
    if (root === null) return result;

    const queue: TreeNode[] = [root];
    while (queue.length > 0) {
        const levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            if (i === levelSize - 1) result.push(node.val); // last node in this level
            if (node.left !== null) queue.push(node.left);
            if (node.right !== null) queue.push(node.right);
        }
    }
    return result;
}
\`\`\`

### Minimum Depth (Shortest Root-to-Leaf Path)
BFS is the right tool here specifically *because* it finds the first leaf encountered without having to explore the whole tree — a DFS solution must visit every path to be sure it found the true minimum, while BFS can return as soon as it hits the first leaf.
\`\`\`typescript
function minDepth(root: TreeNode | null): number {
    if (root === null) return 0;

    const queue: TreeNode[] = [root];
    let depth = 1;

    while (queue.length > 0) {
        const levelSize = queue.length;
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;
            if (node.left === null && node.right === null) return depth; // first leaf found — done
            if (node.left !== null) queue.push(node.left);
            if (node.right !== null) queue.push(node.right);
        }
        depth++;
    }
    return depth; // unreachable if root was non-null, but keeps TypeScript happy
}
\`\`\`

## Complexity
- **Time:** O(n) — every node is enqueued and dequeued exactly once.
- **Space:** O(w) where w is the tree's maximum width (the largest number of nodes at any single level) — for a complete binary tree, the widest level can hold up to n/2 nodes, so worst case this is O(n). Note this differs from DFS's O(h) space profile — BFS trades "depth" for "breadth" as its dominant cost.
- \`Array.shift()\` is O(n) in JavaScript arrays; production code should use a proper queue (e.g. a circular buffer or a doubly linked list) to keep dequeue O(1) — worth mentioning even if you use \`shift()\` for interview brevity.

## Signals This Pattern Applies
- The problem explicitly mentions **"level"** or **"level order"** — grouping nodes by depth is the single strongest tell.
- You need the **shortest path / minimum depth / fewest steps** in an unweighted tree or graph — BFS guarantees the first time you reach a target is via a shortest path, which DFS does not.
- The problem asks for something about a specific "view" of the tree from one side (right side view, left side view) — these are level-order problems in disguise.
- "Nearest," "closest," or "minimum number of steps/hops" language in a graph/tree context.
- You need to process nodes in strict order of distance from a starting point.

## Common Pitfalls
- **Snapshotting \`queue.length\` at the wrong time:** you must capture \`levelSize\` *before* the inner loop starts enqueuing children — capturing it inside the loop (or re-reading \`queue.length\` on every iteration) mixes nodes from two different levels together.
- **Using DFS to find minimum depth:** a recursive DFS \`min(leftDepth, rightDepth)\` looks tempting but is subtly wrong if one child is null — you must not treat a missing child as depth 0 (that would incorrectly shortcut through a node with only one child), and even when written correctly, DFS still has to potentially explore the whole tree while BFS can stop early.
- **Forgetting the empty-tree base case:** \`if (root === null) return []\` (or \`0\` for minDepth) before creating the queue avoids pushing \`null\` into it.
- **Using an array and \`.shift()\` at scale:** fine for interview-sized inputs, but worth flagging as an O(n)-per-dequeue inefficiency if asked about production performance.

## Interview Angle
A common escalation path is: plain level order -> zigzag level order -> right side view -> minimum depth, all reusing the exact same "queue + levelSize snapshot" skeleton with one line changed. Recognizing that all four are the same scaffold, rather than treating each as a brand new problem, is exactly the pattern-recognition skill this section is meant to build. Interviewers will also sometimes ask "why not DFS for minimum depth?" — the answer is that BFS's level-by-level guarantee means the first leaf you hit is provably the shallowest, while DFS has no such guarantee and must potentially explore every path to be sure.
	`
	},

	'Binary Search Tree (BST)': {
		definition:
			'A Binary Search Tree is a binary tree that maintains the invariant that every node\'s value is greater than all values in its left subtree and less than all values in its right subtree, which makes search, insert, and delete run in time proportional to the tree\'s height rather than its size — and makes in-order traversal produce values in sorted order for free.',
		useCase:
			'Maintaining a dynamically changing, always-queryable sorted set of values (e.g. a leaderboard or an in-memory index) where you need fast lookup, insertion, and "kth smallest" queries without re-sorting after every update.',
		detailedMarkdown: `
# Binary Search Tree (BST)

## The BST Invariant
For every node \`n\` in a BST:
- Every value in \`n.left\`'s subtree is **less than** \`n.val\`.
- Every value in \`n.right\`'s subtree is **greater than** \`n.val\`.

This must hold **recursively for the entire subtree**, not just for \`n\`'s immediate children — this distinction is the single most common source of bugs in a naive "validate BST" implementation (see Common Pitfalls).

## Why In-Order Traversal Yields Sorted Output
Inorder traversal visits **left subtree, then node, then right subtree**. Because the BST invariant guarantees everything in the left subtree is smaller and everything in the right subtree is larger, visiting left-root-right at every level recursively produces values in strictly increasing order — you're always fully exhausting "everything smaller" before emitting the current node, and only then moving to "everything larger." This is a direct, essentially free consequence of combining the BST invariant with the inorder traversal order from the DFS pattern.

## Search, Insert, Delete
Because of the invariant, at every node you can decide **which single subtree** could possibly contain your target (or where a new value must go) without looking at the other subtree at all — this is what gives a balanced BST O(log n) operations, the same asymptotic behavior as binary search on a sorted array.

\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function search(root: TreeNode | null, target: number): TreeNode | null {
    if (root === null || root.val === target) return root;
    return target < root.val ? search(root.left, target) : search(root.right, target);
}

function insert(root: TreeNode | null, val: number): TreeNode {
    if (root === null) return new TreeNode(val);
    if (val < root.val) root.left = insert(root.left, val);
    else if (val > root.val) root.right = insert(root.right, val);
    // equal values: no-op (assumes no duplicates) — adjust per problem spec
    return root;
}

function deleteNode(root: TreeNode | null, key: number): TreeNode | null {
    if (root === null) return null;

    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        // Found the node to delete — three cases:
        if (root.left === null) return root.right;   // 0 or 1 child (right)
        if (root.right === null) return root.left;   // 1 child (left)

        // 2 children: replace value with the in-order successor
        // (smallest value in the right subtree), then delete that successor
        let successor = root.right;
        while (successor.left !== null) successor = successor.left;
        root.val = successor.val;
        root.right = deleteNode(root.right, successor.val);
    }
    return root;
}
\`\`\`

## Classic Problems

### Validate BST
\`\`\`typescript
// Must track a valid (min, max) RANGE inherited from ancestors —
// checking only against immediate children is NOT sufficient.
function isValidBST(root: TreeNode | null, min: number = -Infinity, max: number = Infinity): boolean {
    if (root === null) return true;
    if (root.val <= min || root.val >= max) return false;
    return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}
\`\`\`

### Kth Smallest Element in a BST
\`\`\`typescript
// In-order traversal visits values in sorted order — stop at the kth one
function kthSmallest(root: TreeNode | null, k: number): number {
    const stack: TreeNode[] = [];
    let curr = root;

    while (curr !== null || stack.length > 0) {
        while (curr !== null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop()!;
        k--;
        if (k === 0) return curr.val;
        curr = curr.right;
    }
    throw new Error('k is out of range for this tree');
}
\`\`\`

### In-Order Successor / Predecessor
\`\`\`typescript
// Successor: smallest value strictly greater than target
function inorderSuccessor(root: TreeNode | null, target: number): TreeNode | null {
    let successor: TreeNode | null = null;
    let curr = root;
    while (curr !== null) {
        if (target < curr.val) {
            successor = curr;      // curr is a candidate; try to find something smaller (closer)
            curr = curr.left;
        } else {
            curr = curr.right;
        }
    }
    return successor;
}
\`\`\`

## Complexity
| Operation | Balanced BST | Unbalanced (worst case, e.g. sorted-insert order) |
|---|---|---|
| Search | O(log n) | O(n) — degenerates to a linked list |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Kth smallest (in-order) | O(h + k) | O(n) |

The O(log n) figure is an **average/balanced-case** number, not a guarantee — a plain BST has no self-balancing mechanism, so inserting already-sorted data produces a completely skewed tree equivalent to a linked list. Self-balancing variants (AVL trees, Red-Black trees) exist specifically to guarantee O(log n) worst case by rebalancing after every insert/delete.

## Signals This Pattern Applies
- The problem explicitly gives you a **binary search tree**, not just any binary tree — always check whether the problem statement guarantees the BST invariant, since it unlocks much faster algorithms than a generic tree allows.
- You need to answer "is x in this set," "find the kth smallest/largest," or "find the closest value" efficiently and the data is (or can be structured as) a BST.
- You need sorted output from a tree without doing a separate sort step — inorder traversal.
- The problem mentions "successor" or "predecessor" in a sorted structure.

## Common Pitfalls
- **Validating a BST by only checking immediate children:** \`root.left.val < root.val && root.right.val > root.val\` is NOT sufficient — a node deep in the left subtree could still violate the invariant against an ancestor two or more levels up. You must pass down a valid (min, max) range (or do an inorder traversal and check it's strictly increasing).
- **Forgetting duplicates policy:** some problems allow equal values (typically placed consistently to one side); silently assuming "no duplicates" when they're allowed (or vice versa) breaks insert/search logic.
- **Deleting the wrong node in the two-children case:** you must replace the node's *value* with its in-order successor's value and then delete the successor node (which has at most one child, making its own removal simple) — attempting to directly detach the original node in this case loses one of its subtrees.
- **Assuming O(log n) unconditionally:** always qualify BST complexity claims with "assuming the tree is reasonably balanced" — interviewers frequently ask "what if I insert already-sorted data?" specifically to check for this caveat.

## Interview Angle
"Validate BST" is a favorite precisely because the naive local-check solution looks correct but fails on a specific class of hidden inputs (a node satisfying its immediate parent but violating a grandparent) — being able to produce a failing example on the spot is a strong signal. Expect a natural follow-up chain: validate BST -> kth smallest -> "what if there are frequent insertions between kth-smallest queries?" (augmenting nodes with a subtree-size count to answer kth-smallest in O(log n) instead of O(h + k) is the advanced answer).
	`
	},

	'Lowest Common Ancestor (LCA)': {
		definition:
			"The Lowest Common Ancestor of two nodes in a tree is the deepest node that has both as descendants (a node can be its own ancestor); on a general binary tree it's found via a recursive search that reports back what each subtree found, while on a BST the ordering invariant lets you skip exploring one whole subtree at every step.",
		useCase:
			'Finding the closest common category/folder shared by two items in a hierarchical taxonomy (e.g. "what\'s the most specific category containing both these two products?"), or computing the closest common ancestor commit in a Git-like DAG-of-commits history.',
		detailedMarkdown: `
# Lowest Common Ancestor (LCA)

## Problem It Solves
Given two nodes in a tree, find the deepest single node that is an ancestor of both (a node counts as its own ancestor). This shows up constantly whenever a hierarchy needs a "closest shared context" answer — closest shared category, closest shared organizational manager, closest shared commit ancestor.

## The Pattern — General Binary Tree (No Ordering Assumed)
Without any ordering invariant to exploit, you have to actually search both subtrees. The key recursive idea: **ask each subtree "did you find p, q, or both?" and combine the answers at each level.**

- If a node's left subtree search and right subtree search **both** return non-null, this node is the LCA — one target lives in the left subtree, the other in the right, so this is exactly where their paths first join.
- If only one side returns non-null, propagate that result upward (the LCA must be higher up, or one of \`p\`/\`q\` might itself be an ancestor of the other).
- The base case: if the current node itself **is** \`p\` or \`q\`, return it immediately — a node is considered its own ancestor, which correctly handles the case where one target is an ancestor of the other.

\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function lowestCommonAncestor(
    root: TreeNode | null,
    p: TreeNode,
    q: TreeNode
): TreeNode | null {
    if (root === null || root === p || root === q) return root;

    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);

    if (left !== null && right !== null) return root; // p and q split across both sides — root is the LCA
    return left !== null ? left : right; // only one side found something — bubble it up
}
\`\`\`

## The Pattern — Binary Search Tree (Exploiting the Ordering Invariant)
On a BST, you don't need to search both subtrees at all — the ordering invariant tells you, at every step, exactly which single subtree could possibly contain the split point:

- If **both** \`p.val\` and \`q.val\` are less than the current node's value, the LCA must be in the **left** subtree (both targets are smaller than this node, so this node can't be the meeting point, and neither can anything in the right subtree).
- If **both** are greater, the LCA must be in the **right** subtree, symmetrically.
- Otherwise (one is less-or-equal and the other is greater-or-equal, or one equals the current node), the current node **is** the LCA — this is exactly the point where \`p\` and \`q\`'s paths from the root diverge (or one of them equals the current node).

\`\`\`typescript
function lowestCommonAncestorBST(
    root: TreeNode,
    p: TreeNode,
    q: TreeNode
): TreeNode {
    let curr = root;
    while (true) {
        if (p.val < curr.val && q.val < curr.val) {
            curr = curr.left!;        // both smaller — descend left only
        } else if (p.val > curr.val && q.val > curr.val) {
            curr = curr.right!;       // both larger — descend right only
        } else {
            return curr;              // paths diverge here (or curr IS p or q) — found it
        }
    }
}
\`\`\`

## Complexity
| | General binary tree | BST |
|---|---|---|
| Time | O(n) — may have to visit every node | O(h) — only ever descends one path, h = tree height |
| Space | O(h) — recursion stack | O(1) iteratively (or O(h) if written recursively) |

On a **balanced** BST, O(h) is O(log n) — a substantial improvement over the general-tree O(n) approach, entirely because the BST's ordering invariant lets you eliminate one whole subtree at every step instead of exploring both.

## Signals This Pattern Applies
- The problem asks for the "lowest/closest common ancestor," "closest common manager," or "most specific shared category" between two nodes in a hierarchy.
- You're given a **tree** and two specific nodes/values, and asked about their relationship in the hierarchy (who is above both, deepest such node).
- If the tree is explicitly a **BST**, that's a strong signal to reach for the O(h) ordering-based approach instead of the general O(n) dual-subtree-search approach — always check for the BST guarantee before defaulting to the general algorithm.
- Variants: "does one node have the other as an ancestor," "distance between two nodes in a tree" (compute via each node's depth plus depth from the LCA).

## Common Pitfalls
- **Using the general-tree algorithm on a BST unnecessarily:** it's still correct, but it's O(n) instead of O(h) — always check if the tree is a BST first, since interviewers will ask "can we do better?" if you miss the ordering.
- **Forgetting a node is its own ancestor:** the base case \`root === p || root === q\` must return immediately — otherwise a case where \`p\` is literally an ancestor of \`q\` won't resolve correctly.
- **Assuming both \`p\` and \`q\` are guaranteed to exist in the tree:** many real implementations need an explicit existence check first (or must state that assumption clearly) — silently assuming both exist can mask a bug if one is actually absent.
- **BST version: comparing by node reference instead of by value in the ordering check:** the divergence check must compare **values** against the ordering (\`p.val < curr.val\`), not node identity, since ordering only makes sense in terms of values.
- **Off-by-one on "this node is its own ancestor":** if \`p\` is an ancestor of \`q\`, the LCA is \`p\` itself, not \`p\`'s parent — both algorithms above handle this correctly, but it's easy to second-guess out loud and introduce a bug while explaining.

## Interview Angle
Interviewers commonly ask this exact question twice in the same interview — once for a general binary tree, once told "now assume it's a BST" — specifically to see whether you notice the ordering invariant unlocks a strictly better algorithm rather than reusing the general-tree solution unchanged. Be ready to also derive "distance between two nodes" as a follow-up: find the LCA, then the answer is \`depth(p) + depth(q) - 2 * depth(LCA)\`.
	`
	},

	'Tree Construction': {
		definition:
			'Tree Construction rebuilds a unique binary tree from two of its traversal orderings (most commonly preorder + inorder, or postorder + inorder) by recognizing that one traversal identifies the root at each recursive step while the other lets you split the remaining nodes into a left-subtree range and a right-subtree range.',
		useCase:
			"Reconstructing a binary expression tree or binary tree data structure that was serialized as separate traversal arrays for storage or transmission, then needs to be rebuilt into an actual navigable tree object.",
		detailedMarkdown: `
# Tree Construction (From Traversal Arrays)

## Problem It Solves
Given two different traversal orderings of the *same* binary tree (as plain arrays), reconstruct the original tree structure. A single traversal alone is ambiguous — many different trees can share the same preorder sequence, for instance — but **any two** of {preorder, inorder, postorder} together uniquely determine the tree (postorder + preorder alone, without inorder, is *not* always sufficient for non-full binary trees — this is a common trick question).

## The Pattern — Preorder + Inorder
The core recursive insight:
1. **Preorder's first element is always the root** of the (sub)tree it describes — preorder visits root before either child, so whatever comes first in the array segment you're currently looking at must be that segment's root.
2. **Find that root's value in the inorder array.** Because inorder visits left-subtree, root, right-subtree, everything to the left of the root's position in inorder belongs to the **left subtree**, and everything to the right belongs to the **right subtree**.
3. The **size** of that left-subtree inorder range tells you exactly how many of the *next* elements in preorder (after the root) also belong to the left subtree — preorder describes the entire left subtree contiguously before moving on to the right subtree.
4. Recurse on the two halves, using a hash map (value -> inorder index) so step 2 is O(1) instead of an O(n) linear scan each time.

\`\`\`text
preorder: [3, 9, 20, 15, 7]
inorder:  [9, 3, 15, 20, 7]

Root = preorder[0] = 3
Find 3 in inorder -> index 1 -> left inorder range = [9], right inorder range = [15, 20, 7]
Left subtree has 1 node -> next 1 element of preorder ([9]) describes the left subtree
Right subtree has 3 nodes -> remaining preorder ([20, 15, 7]) describes the right subtree
Recurse on each side the same way.
\`\`\`

## Code Example (TypeScript)
\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
    const inorderIndex = new Map<number, number>();
    inorder.forEach((val, idx) => inorderIndex.set(val, idx));

    let preIdx = 0; // tracks our position in preorder as we consume it left-to-right

    function build(inLeft: number, inRight: number): TreeNode | null {
        if (inLeft > inRight) return null; // empty range — no subtree here

        const rootVal = preorder[preIdx];
        preIdx++;
        const root = new TreeNode(rootVal);

        const mid = inorderIndex.get(rootVal)!;
        // IMPORTANT: build the left subtree BEFORE the right one — this matches
        // preorder's own left-before-right structure, keeping preIdx in sync.
        root.left = build(inLeft, mid - 1);
        root.right = build(mid + 1, inRight);

        return root;
    }

    return build(0, inorder.length - 1);
}
\`\`\`

## Variant — Postorder + Inorder
Same idea, mirrored: postorder's **last** element is the root (postorder visits root last), and you must build the **right** subtree before the left one, since you're consuming postorder from the *back*.

\`\`\`typescript
function buildTreePostIn(inorder: number[], postorder: number[]): TreeNode | null {
    const inorderIndex = new Map<number, number>();
    inorder.forEach((val, idx) => inorderIndex.set(val, idx));

    let postIdx = postorder.length - 1; // consume postorder from the END

    function build(inLeft: number, inRight: number): TreeNode | null {
        if (inLeft > inRight) return null;

        const rootVal = postorder[postIdx];
        postIdx--;
        const root = new TreeNode(rootVal);

        const mid = inorderIndex.get(rootVal)!;
        // Build RIGHT before LEFT — postorder's last-consumed elements
        // belong to the right subtree first when reading backwards.
        root.right = build(mid + 1, inRight);
        root.left = build(inLeft, mid - 1);

        return root;
    }

    return build(0, inorder.length - 1);
}
\`\`\`

## Complexity
- **Time:** O(n) — with the hash map lookup, each of the n nodes is created and located in O(1) amortized, versus O(n^2) if you linearly scan the inorder array to find the root each time (a common naive-but-correct first attempt worth mentioning and then improving on).
- **Space:** O(n) for the hash map, plus O(h) for the recursion stack (O(log n) balanced, O(n) worst case skewed).

## Signals This Pattern Applies
- You're given **two different traversal arrays** of the same tree (preorder+inorder, or postorder+inorder) and asked to reconstruct the tree.
- The problem mentions rebuilding/reconstructing/deserializing a tree from array-based traversal data specifically (as opposed to a marker-based serialization — see Tree Serialization for that variant).
- You need to verify whether a given pair of traversals could correspond to a valid, unique tree.

## Common Pitfalls
- **Assuming preorder + postorder alone is always sufficient:** without inorder, preorder + postorder can be ambiguous whenever a node has only one child (you can't always tell if that child is the left or right child) — this is a common trick question interviewers ask to check real understanding, not just pattern-matching "any two traversals work."
- **Building the subtrees in the wrong order relative to how the traversal is being consumed:** for preorder+inorder you must build **left before right** (since preorder emits left before right); for postorder+inorder, consuming from the back, you must build **right before left**. Swapping this desyncs the shared index pointer and produces a corrupted tree.
- **Linear-scanning inorder to find the root every recursive call:** correct but O(n^2) overall — always mention (and use) the hash map optimization.
- **Off-by-one in the index ranges:** \`mid - 1\` and \`mid + 1\` boundaries are easy to get backwards, especially under interview pressure — tracing through a small 3-node example on the whiteboard first is the safest way to avoid this.
- **Duplicate values in the tree:** the hash-map-by-value approach silently breaks if the tree has duplicate values, since a value no longer uniquely identifies a position in inorder — worth flagging as an assumption ("assuming all values are unique") if the problem doesn't state it.

## Interview Angle
Interviewers like this problem because it tests whether you can hold two arrays' relative structure in your head simultaneously — a common follow-up is "can you do this with postorder+inorder instead?" to see if you understand *why* the construction direction flips (root position moves from front to back), rather than having only memorized the preorder+inorder version. Another frequent follow-up: "what if only preorder and postorder are given?" — the right answer is explaining the ambiguity with single-child nodes, not attempting a broken reconstruction.
	`
	},

	'Tree Serialization': {
		definition:
			"Tree serialization converts a binary tree into a string (or other flat format) that can be stored or transmitted, and deserialization reconstructs the exact original tree from that string — the standard technique uses a preorder traversal with explicit null markers so structure (not just values) survives the round trip.",
		useCase:
			"Persisting a binary tree data structure to disk or sending it over a network (e.g. caching a parsed expression tree or a search index tree), then reconstructing an identical tree back in memory later.",
		detailedMarkdown: `
# Tree Serialization

## Problem It Solves
A plain traversal (preorder, inorder, etc.) alone loses structural information — the same sequence of values can correspond to multiple different tree shapes once children are missing in irregular patterns. Serialization must capture **which children exist and which don't**, not just the values, so that deserialization can reconstruct the exact original tree, not just *some* tree with the same node values.

## The Pattern — Preorder With Null Markers
The trick: do a normal preorder traversal, but explicitly emit a marker (commonly \`"#"\` or \`"null"\`) every time you'd recurse into a missing child, instead of just skipping it. This turns the traversal into a **self-describing** sequence — during deserialization, hitting a null marker tells you unambiguously "this branch ends here," so you always know exactly when to stop recursing without needing the inorder array as a second source of structural information (unlike Tree Construction, where two traversals are combined precisely because a single one is ambiguous).

\`\`\`text
        1
       / \\
      2   3
         / \\
        4   5

preorder with null markers: "1,2,#,#,3,4,#,#,5,#,#"
                              ^ ^ ^^ ^ ^ ^^ ^^ ^ ^^
                              1 2 (2's children: none, none)
                                  3 4 (4's children: none, none)
                                      5 (5's children: none, none)
\`\`\`

## Code Example (TypeScript)
\`\`\`typescript
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val: number, left: TreeNode | null = null, right: TreeNode | null = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function serialize(root: TreeNode | null): string {
    const parts: string[] = [];

    function preorder(node: TreeNode | null): void {
        if (node === null) {
            parts.push('#'); // explicit marker — this is what preserves shape
            return;
        }
        parts.push(String(node.val));
        preorder(node.left);
        preorder(node.right);
    }

    preorder(root);
    return parts.join(',');
}

function deserialize(data: string): TreeNode | null {
    const values = data.split(',');
    let idx = 0; // shared cursor consumed left-to-right, same order it was written

    function build(): TreeNode | null {
        const token = values[idx];
        idx++;

        if (token === '#') return null; // hit a marker — this branch is empty

        const node = new TreeNode(Number(token));
        node.left = build();   // consumes exactly the tokens belonging to the left subtree
        node.right = build();  // then exactly the tokens belonging to the right subtree
        return node;
    }

    return build();
}

// --- Round trip ---
// const serialized = serialize(root);
// const restored = deserialize(serialized);
\`\`\`
The recursive \`build()\` function works because serialization and deserialization walk the tokens in **exactly the same preorder sequence** — the writer and reader agree implicitly on "root token, then everything for the left subtree, then everything for the right subtree," so the shared cursor \`idx\` never needs to backtrack or look ahead.

## Alternative — Level-Order (BFS-Based) Serialization
Instead of preorder-with-markers, you can serialize level by level (this is what many real systems, including LeetCode's own examples, use for a more "visual" representation):

\`\`\`typescript
function serializeBFS(root: TreeNode | null): string {
    if (root === null) return '';
    const parts: string[] = [];
    const queue: Array<TreeNode | null> = [root];

    while (queue.length > 0) {
        const node = queue.shift()!;
        if (node === null) {
            parts.push('#');
            continue; // don't enqueue children of a null placeholder
        }
        parts.push(String(node.val));
        queue.push(node.left);
        queue.push(node.right);
    }
    return parts.join(',');
}
\`\`\`
This trades a slightly different mental model (queue-driven, mirrors the BFS pattern) for the same fundamental idea: emit explicit null markers so the reader knows exactly where each branch ends. Preorder-based serialization is usually preferred in interviews because the recursive reader/writer symmetry is simpler to reason about and code under time pressure; level-order serialization is common in real systems because it more directly mirrors a breadth-first, level-by-level storage layout.

## Complexity
- **Time:** O(n) for both serialize and deserialize — every node (and every null child slot) is visited exactly once.
- **Space:** O(n) for the output string/array itself, plus O(h) recursion stack for the preorder version (O(n) for the BFS version's queue, proportional to the tree's maximum width instead of its height).

## Signals This Pattern Applies
- The problem explicitly says "serialize and deserialize" a tree, or asks you to convert a tree to a string/array and back to an **identical** structure (not just "a tree with the same values").
- You need a representation of a tree that can be written to disk, sent over a network, or compared for structural equality via string equality.
- The problem emphasizes that missing children matter — i.e., two trees with the same values but different shapes must be told apart, which rules out a plain values-only traversal.

## Common Pitfalls
- **Omitting null markers:** without them, a traversal like \`"1,2,3"\` is ambiguous — it could be a tree where 2 is 1's only left child with 3 as 2's right child, or many other shapes; markers are what make the format lossless.
- **Using a delimiter that can collide with data:** joining with \`","\` breaks if node values can themselves contain commas (e.g. serializing strings) — pick a delimiter (or a length-prefixed format) that can't appear in the values themselves.
- **Deserializing with an index that doesn't stay in sync:** the shared cursor (\`idx\` above) must be advanced by exactly one token per call to \`build()\`, in the same order it was written — mixing preorder writing with, say, level-order reading corrupts the result silently.
- **Forgetting to enqueue children of null placeholders correctly in the BFS variant:** you must skip enqueuing a null node's (nonexistent) children, or the queue fills with meaningless entries and desyncs the output.
- **Not handling the fully-empty-tree case:** \`serialize(null)\` should produce something \`deserialize\` can round-trip back to \`null\` — an empty string or a single \`"#"\` both work, but the two functions must agree on which convention is used.

## Interview Angle
This is LeetCode's canonical "Serialize and Deserialize Binary Tree," and the strongest answers explicitly state *why* plain preorder isn't enough (ambiguity without null markers) before writing any code — that's the signal the interviewer is checking pattern recognition, not just memorized code. A common, good follow-up to raise unprompted: "this format assumes a binary tree; how would serialization change for a tree with arbitrary branching factor?" (answer: you'd need an explicit child-count or an end-of-children marker per node, since "two null markers" only makes sense for binary trees).
	`
	}
};
