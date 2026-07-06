import type { RoadmapDetailMap } from './types';

export const DsaFoundationsContent: RoadmapDetailMap = {
	'Time & Space Complexity (Big O)': {
		definition:
			"Big-O notation describes how an algorithm's running time or memory use grows as the input size grows, as an upper bound that ignores constant factors and lower-order terms.",
		useCase:
			'Deciding that a hash-map lookup (O(1)) rather than a linear scan (O(n)) is the right way to check membership in a dataset of 10 million records, because the gap between those two curves is the gap between milliseconds and seconds.',
		detailedMarkdown: `
# Time & Space Complexity (Big O)

**Big-O** answers one question: *as the input size \`n\` grows without bound, how does the amount of work (or memory) grow with it?* It deliberately throws away hardware speed, constant factors, and small-\`n\` behavior, because those don't tell you what happens when \`n\` goes from 1,000 to 1,000,000 — and that's almost always the question that actually matters in production and in interviews.

## Big-O, Big-Omega, Big-Theta
People say "Big O" for all three of these colloquially, but they mean different things:

- **O (Big-O)** — an **upper bound**. "This algorithm does *no worse than* this rate of growth." When someone says an algorithm "is O(n²)", they mean it never grows faster than quadratically.
- **Ω (Big-Omega)** — a **lower bound**. "This algorithm does *no better than* this rate of growth," i.e. the best case.
- **Θ (Big-Theta)** — a **tight bound** — the upper and lower bounds match. "This algorithm's growth rate is *exactly* this, both worst and best case (or on average)."

In interviews, when you say "this is O(n)", you almost always actually mean Θ(n) — the tight, typical-case bound — and virtually everyone (including interviewers) uses O loosely to mean that. Knowing the distinction, and being able to state it precisely if pushed, is what separates a memorized answer from real understanding.

## Common Complexity Classes

| Complexity | Name | Example Algorithm |
|---|---|---|
| O(1) | Constant | Looking up a value by key in a hash map; accessing \`arr[i]\` by index |
| O(log n) | Logarithmic | Binary search on a sorted array; finding a node's depth in a balanced BST |
| O(n) | Linear | Scanning an array once to find the max; computing a string's length by iterating it |
| O(n log n) | Linearithmic | Merge sort, heap sort, quicksort (average case); sorting n items via a heap |
| O(n²) | Quadratic | Nested loops comparing all pairs (bubble sort, naive duplicate detection) |
| O(2^n) | Exponential | Naive recursive Fibonacci; generating every subset of a set of n items |

As \`n\` grows, these classes separate dramatically. At \`n = 20\`: \`log n ≈ 4.3\`, \`n = 20\`, \`n log n ≈ 86\`, \`n² = 400\`, \`2^n ≈ 1,000,000\`. That last jump is why "exponential" is treated as a red flag in an interview — it's fine for tiny inputs and catastrophic the moment n crosses roughly 30-40.

## Reading Complexity Out of Code
\`\`\`ts
function hasPair(nums: number[], target: number): boolean {
  const seen = new Set<number>();      // O(1) lookups
  for (const n of nums) {              // one pass: O(n)
    if (seen.has(target - n)) return true;  // O(1) average per check
    seen.add(n);                       // O(1) average per insert
  }
  return false;
}
// Overall: O(n) time, O(n) space (the Set can hold up to n elements)
\`\`\`
The rule of thumb: multiply complexities for nested/sequential loops that both depend on \`n\`, but a loop combined with O(1) work inside it stays linear. The naive O(n²) version of this same problem (a nested loop checking every pair) trades that O(n) space for a two-pass-of-pairs O(n²) time — this trade-off between time and space is one of the most common threads running through every data structure in this section.

## Space Complexity
Space complexity counts **extra** memory an algorithm uses beyond the input itself: auxiliary arrays/maps you allocate, and — easy to forget — the **call stack** used by recursion. A recursive function that recurses \`n\` levels deep uses O(n) space for the call stack even if it allocates no other data structure at all. An iterative version of the same algorithm using a simple loop and a couple of variables is O(1) space — this space difference is a very common recursion-vs-iteration interview follow-up.

## Amortized Complexity: Why "Dynamic Array Push is O(1)"
This is the single most common trip-up when people first learn Big-O. A dynamic array (JS \`Array\`, Java \`ArrayList\`, Python \`list\`) is backed by a fixed-size buffer under the hood. Pushing an element is usually O(1) — just write into the next free slot — but when the buffer is full, it must **resize**: allocate a new buffer (commonly double the size) and copy every existing element into it, an O(n) operation.

\`\`\`ts
class GrowableArray<T> {
  private buffer: (T | undefined)[] = new Array(1);
  private length = 0;

  push(value: T): void {
    if (this.length === this.buffer.length) {
      const bigger = new Array<T | undefined>(this.buffer.length * 2); // double
      for (let i = 0; i < this.length; i++) bigger[i] = this.buffer[i]; // O(n) copy
      this.buffer = bigger;
    }
    this.buffer[this.length] = value; // O(1)
    this.length++;
  }
}
\`\`\`
So is \`push\` O(1) or O(n)? **Both, depending on how you ask.** A single unlucky call that happens to trigger a resize costs O(n). But summed over a whole sequence of \`n\` pushes starting from an empty array, the resizes happen at sizes 1, 2, 4, 8, ..., n — a geometric series that sums to roughly \`2n\` total copy operations across the whole run. Spread that O(n) total cost evenly across the \`n\` pushes that caused it, and each push costs O(1) **on average, over any long sequence of operations** — that's what **amortized O(1)** means. It's not "usually fast, occasionally we ignore the slow ones" — it's a precise mathematical statement about the total cost of a sequence divided by the number of operations in it.

## Common Pitfalls
- **Confusing amortized with worst-case-per-call.** "Amortized O(1)" does not mean every single push is O(1) — it means the *average over a sequence* is O(1). A latency-sensitive system that can't tolerate an occasional O(n) spike (e.g. a hard real-time system) may still care about the worst single call, not just the amortized average.
- **Trusting built-ins blindly.** \`array.includes()\`, \`indexOf()\`, and \`splice()\` in the middle of an array are all O(n) — calling them inside a loop silently turns an O(n) algorithm into O(n²).
- **String concatenation in a loop.** In languages where strings are immutable (JS, Java, Python), \`result += chunk\` inside a loop of \`n\` iterations can be O(n²) overall, because each \`+=\` may copy the entire string built so far. Prefer an array of chunks joined once at the end.
- **Dropping constants when they matter.** Big-O says O(n) beats O(n²) *asymptotically*, but for small, bounded n (say, always fewer than 10 elements) a "worse" O(n²) algorithm with tiny constants can outperform a "better" O(n log n) one with heavy overhead. Big-O tells you about scaling, not about which one is faster at your actual input size.
- **Forgetting space complexity entirely.** Interviewers frequently expect both time *and* space analysis; a solution that's O(n) time but also uses an O(n) hash map isn't "free" — say so explicitly, and mention if an O(1)-space alternative exists (even if slower).

## Practical Takeaway
Big-O is a language for describing **growth**, not raw speed — always state both time and space complexity, know whether you're describing the worst, best, or average case, and be ready to explain amortized costs the moment a dynamic/resizing structure comes up (arrays, hash maps, and heaps all rely on this idea).
	`
	},

	'Arrays & Strings': {
		definition:
			'An array is a fixed-layout, contiguous block of memory holding elements of the same size, letting any element be reached directly by computing its address from an index; a string is typically an array of characters with some additional immutability or encoding rules layered on top.',
		useCase:
			'Storing a fixed-size lookup table of the last 24 hours of hourly temperature readings, where any hour needs to be read or overwritten instantly by its index without scanning anything else.',
		detailedMarkdown: `
# Arrays & Strings

An **array** stores elements in one contiguous block of memory. Because every element has the same size, the address of \`arr[i]\` can be computed directly as \`base_address + i * element_size\` — no searching required. This is why array indexing is O(1): it's arithmetic, not a lookup. A **string** is, in most languages, conceptually an array of characters (or bytes/code points), with the added wrinkle that strings are frequently **immutable** — every "modification" actually allocates a brand-new string.

## Why Contiguity Matters
Because array elements sit next to each other in memory, iterating an array sequentially is extremely cache-friendly — the CPU pulls a whole cache line (many adjacent elements) into fast cache memory in one trip. A linked list, by contrast, scatters nodes across memory, so every step is a potential cache miss. This is a real, measurable performance difference even when both structures are "O(n) to traverse" on paper.

## Core Operations & Complexity

| Operation | Complexity | Why |
|---|---|---|
| Access by index (\`arr[i]\`) | O(1) | Direct address computation |
| Search (unsorted) | O(n) | Must check elements one by one |
| Search (sorted, binary search) | O(log n) | Can halve the search space each step |
| Insert/delete at the **end** | O(1) amortized | See amortized resizing above; occasional O(n) resize |
| Insert/delete at the **front or middle** | O(n) | Every element after the gap must shift over by one |
| Append/concat two arrays | O(n + m) | Must copy every element of both |

## Two-Pointer and Sliding Window
The two most common array/string interview techniques both exploit contiguity to avoid nested loops:

\`\`\`ts
// Two-pointer: check if a string is a palindrome, O(n) time, O(1) extra space
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}

// Sliding window: longest substring without repeating characters, O(n) time
function longestUniqueSubstring(s: string): number {
  const lastSeenAt = new Map<string, number>();
  let windowStart = 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (lastSeenAt.has(ch) && lastSeenAt.get(ch)! >= windowStart) {
      windowStart = lastSeenAt.get(ch)! + 1; // shrink window from the left
    }
    lastSeenAt.set(ch, i);
    best = Math.max(best, i - windowStart + 1);
  }
  return best;
}
\`\`\`
Both patterns turn what looks like an O(n²) "check every pair/substring" problem into a single O(n) pass, because each pointer only ever moves forward — the total movement across the whole run is bounded by \`n\`, not \`n²\`.

## Common Interview Problems
- Two Sum / Three Sum (often solved with sorting + two pointers, or a hash map).
- Maximum subarray sum (Kadane's algorithm — O(n)).
- Longest substring without repeating characters (sliding window, above).
- Rotate an array in place by k steps (reverse-based trick, O(n) time, O(1) space).
- Merge intervals / merge two sorted arrays.

## Common Pitfalls
- **Off-by-one errors.** \`for (let i = 0; i <= arr.length; i++)\` reads one past the end; a classic source of \`undefined\`-related bugs. Always double check whether a bound should be \`<\` or \`<=\`.
- **Mutating an array while iterating it.** Calling \`splice()\` inside a \`for...of\` or \`forEach\` shifts indices out from under the loop, silently skipping elements. Iterate backwards, or build a new array, when removing items during iteration.
- **Treating string concatenation as free.** Since strings are immutable, \`str += ch\` in a loop can be O(n²) overall — building an array of pieces and joining once at the end is O(n).
- **Assuming insert/delete is O(1) everywhere.** Only the *end* of an array is cheap; inserting at the front of a JS array (\`unshift\`) or removing from the front (\`shift\`) is O(n) because every remaining element must shift.
- **Confusing shallow copy with deep copy.** \`[...arr]\` or \`arr.slice()\` copies the array's references, not nested objects inside it — mutating a nested object still affects the "copy."

## Practical Takeaway
Arrays win when you need fast random access and don't need to insert/remove anywhere but the end; strings inherit all of that plus the extra cost of immutability. Two-pointer and sliding-window techniques are the standard way to turn naive O(n²) array/string scans into O(n) — recognizing when a problem has that shape is one of the highest-leverage interview skills in this whole list.
	`
	},

	'HashMap / HashSet': {
		definition:
			'A HashMap stores key-value pairs by running each key through a hash function to compute a bucket index, giving average O(1) insert/lookup/delete; a HashSet is the same structure storing only keys, used to track membership.',
		useCase:
			'Counting the frequency of every word in a large document in a single pass, using the word as a key and incrementing a counter, instead of re-scanning the whole document for every word to count occurrences.',
		detailedMarkdown: `
# HashMap / HashSet

A **HashMap** (JS/TS: \`Map\`, or a plain object) stores key-value pairs. Internally, it keeps an array of **buckets**. To insert or look up a key, it runs the key through a **hash function** that produces an integer, then reduces that integer modulo the number of buckets to get a bucket index — that's where the entry lives (or is searched for). A **HashSet** (\`Set\`) is the exact same machinery with no attached value — it only tracks "is this key present."

## How Hashing Actually Works
1. \`hash(key)\` converts the key into an integer (for strings: something like combining character codes with multiplication; for numbers: often the number itself or a bit-mixing function).
2. \`index = hash(key) % numberOfBuckets\` picks which bucket to use.
3. The entry is stored in that bucket.

Because step 2 is arithmetic and step 1 is a fixed amount of work (proportional to the key's size, not the map's size), insert/lookup/delete are O(1) **on average** — you jump straight to the right bucket instead of scanning every entry.

## Collisions: Two Different Keys, Same Bucket
No hash function is perfect — eventually two different keys hash to the same bucket index. There are two standard ways to handle this:
- **Separate chaining** — each bucket holds a small list (or tree, in some real implementations like Java's \`HashMap\` once a bucket gets large) of all entries that landed there; a collision just appends to that list.
- **Open addressing** — on a collision, the implementation probes for the next open slot in the array itself (linear probing, quadratic probing, or double hashing), instead of growing a list per bucket.

This is why HashMap lookup is described as **O(1) average, O(n) worst case**: if the hash function is bad (or an attacker deliberately crafts keys that all collide), every key could land in the same bucket, degrading lookups to a linear scan through that one bucket's chain.

## Load Factor and Resizing
The **load factor** is \`numberOfEntries / numberOfBuckets\`. As it climbs past a threshold (commonly ~0.75), collisions become more frequent and performance degrades, so the map **resizes**: it allocates a larger bucket array and re-hashes every existing entry into it — an O(n) operation that happens rarely enough to keep insertion **amortized O(1)**, the exact same idea covered under dynamic arrays above.

## Core Operations & Complexity

| Operation | Average | Worst Case |
|---|---|---|
| Insert (\`set\`/\`add\`) | O(1) | O(n) (all keys collide) |
| Lookup (\`get\`/\`has\`) | O(1) | O(n) |
| Delete | O(1) | O(n) |
| Iterate all entries | O(n) | O(n) |

## Code: Map and Set in TypeScript
\`\`\`ts
function wordFrequency(words: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1); // O(1) average per word
  }
  return counts;
}

function hasDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) return true; // O(1) average membership check
    seen.add(n);
  }
  return false;
}
\`\`\`
A JavaScript \`Map\` (unlike a plain \`{}\` object) also guarantees iteration in **insertion order** and allows any value — not just strings — as a key, including objects (compared by reference, not deep equality).

## Common Interview Problems
- Two Sum — store \`value -> index\` in a map while scanning once, checking for the complement, O(n) instead of the naive O(n²) pair check.
- Group anagrams — key each word by its sorted letters (or a character-count signature) and bucket words sharing that key.
- First non-repeating character in a string — one pass to count, one pass to find the first count-of-1.
- Detecting duplicates / longest consecutive sequence.
- LRU cache (combines a \`Map\` with a doubly linked list for O(1) get/put with eviction order).

## Common Pitfalls
- **Assuming a hash map worst case can't happen.** It's O(1) *average*; a pathological input (or an adversary who knows your hash function) can force O(n) per operation. This matters in security-sensitive contexts (hash-flooding denial-of-service attacks).
- **Using mutable or reference-type keys carelessly.** Two different object instances with identical fields are different keys in a \`Map\` (compared by reference) — you need a normalized key (like \`JSON.stringify\` or a composite string) if you want value equality.
- **Relying on order in languages/structures that don't guarantee it.** Plain JS objects mostly preserve insertion order for string keys today, but this wasn't always specced behavior, and many other languages' hash map equivalents make **no** ordering guarantee at all — never depend on it unless the structure explicitly promises it (like JS's \`Map\`).
- **Forgetting the O(n) resize cost exists.** Rare in interviews, but real in production: bulk-inserting into a map that resizes repeatedly can be slower than pre-sizing it if the API allows a capacity hint.
- **Using \`==\` semantics you don't expect.** \`NaN\` is considered equal to itself as a \`Map\`/\`Set\` key (unlike \`===\`), and \`+0\`/\`-0\` are treated as the same key — small surprises worth knowing.

## Practical Takeaway
Reach for a HashMap/HashSet the instant a problem needs "have I seen this before?" or "what's associated with this key?" answered faster than a linear scan — it's the single highest-leverage structure in interview problem-solving, because it so often converts an O(n²) brute force into O(n).
	`
	},

	Stack: {
		definition:
			'A stack is a linear data structure that only allows adding and removing elements from one end (the "top"), giving Last-In-First-Out (LIFO) ordering.',
		useCase:
			"Matching opening and closing brackets in an expression like `{[()]}` by pushing each opener and popping it when its matching closer is seen, confirming validity only if the stack ends empty.",
		detailedMarkdown: `
# Stack

A **stack** exposes exactly two core operations: **push** (add to the top) and **pop** (remove from the top) — giving **LIFO** (Last-In-First-Out) behavior: the most recently added element is always the first one removed. Think of a stack of plates — you can only take one off the top, and you can only put a new one on the top.

## How It's Implemented
A stack is an *interface*, not a specific memory layout — it's commonly backed by either:
- A **dynamic array**, tracking a "top" index — pushing/popping at the end of an array is O(1) amortized (see the array section above).
- A **singly linked list**, pushing/popping at the **head** — O(1) with no amortization concerns at all, at the cost of per-node memory overhead and worse cache locality.

Every real programming language's own **call stack** — the thing that makes recursion possible — is a literal stack: calling a function pushes a new stack frame; returning pops it. That's precisely why runaway recursion causes a "stack overflow": the call stack, a real stack, runs out of space.

## Core Operations & Complexity

| Operation | Complexity |
|---|---|
| Push (add to top) | O(1) |
| Pop (remove from top) | O(1) |
| Peek (read top without removing) | O(1) |
| Search for an arbitrary element | O(n) |

## Code: Stack in TypeScript
JS arrays already support O(1) push/pop from the end, so they work directly as a stack — but wrapping it clarifies intent and prevents accidental misuse (like reading \`arr[0]\` instead of the top):

\`\`\`ts
class Stack<T> {
  private items: T[] = [];

  push(value: T): void {
    this.items.push(value);
  }

  pop(): T | undefined {
    return this.items.pop(); // removes and returns the top, or undefined if empty
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }
}

function isValidParentheses(s: string): boolean {
  const stack = new Stack<string>();
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch);
    } else if (ch in pairs) {
      if (stack.isEmpty || stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.isEmpty; // every opener must have been matched and popped
}
\`\`\`

## Common Interview Problems
- Valid parentheses / balanced brackets (above).
- Evaluate Reverse Polish Notation (postfix expressions).
- Next Greater Element — a **monotonic stack** keeps elements in increasing (or decreasing) order, popping whenever the invariant would break, to find the next larger value for every element in O(n) total instead of O(n²).
- Implementing \`undo\` functionality, or browser back-button history.
- Simulating recursion iteratively (converting a recursive DFS into an explicit stack-based loop, avoiding call-stack depth limits).

## Common Pitfalls
- **Popping or peeking an empty stack** without checking first — this either throws, or (in JS) silently returns \`undefined\`, which can mask a bug if not checked explicitly.
- **Confusing a stack with a queue** conceptually under time pressure — LIFO vs FIFO look similar in pseudocode but produce completely different processing order.
- **Using the wrong end of an array.** Pushing/popping from the *front* of a JS array (\`unshift\`/\`shift\`) is O(n), not O(1) — a "stack" implemented that way silently loses its performance guarantee.
- **Forgetting a monotonic stack still needs the final unmatched elements handled** — after the main loop, whatever remains on the stack typically needs a default answer (e.g. "no next greater element" -> -1).

## Practical Takeaway
Reach for a stack whenever a problem has a **nesting or "most recent thing matters first"** structure — matching pairs, undo history, or simulating recursion explicitly. The monotonic stack pattern in particular is worth memorizing: any "find the next/previous greater/smaller element" problem collapses from O(n²) to O(n) with it.
	`
	},

	Queue: {
		definition:
			'A queue is a linear data structure that only allows adding elements at one end (the "back") and removing them from the other end (the "front"), giving First-In-First-Out (FIFO) ordering.',
		useCase:
			'Processing print jobs in the order they were submitted — the first job sent to the printer is the first one printed, regardless of how many jobs get queued up behind it.',
		detailedMarkdown: `
# Queue

A **queue** exposes **enqueue** (add to the back) and **dequeue** (remove from the front), giving **FIFO** (First-In-First-Out) ordering: whichever element has been waiting longest is the next one out. Think of a checkout line — people join at the back and are served from the front.

## Why a Plain Array Is the Wrong Backing Structure
It's tempting to implement a queue with a JS array using \`push\` (enqueue) and \`shift\` (dequeue), but \`shift()\` removes from the *front* of an array, which means every remaining element has to shift left by one — an O(n) operation. Do that on every dequeue and an algorithm that should be O(n) overall becomes O(n²).

The two efficient backings are:
- A **doubly linked list**, tracking both head and tail pointers — enqueue at the tail and dequeue at the head are both O(1), no shifting involved.
- A **circular buffer** — a fixed-size array with \`head\` and \`tail\` indices that wrap around using modulo arithmetic, avoiding both shifting *and* the linked list's per-node memory overhead. This is what most production queue implementations actually use.

## Core Operations & Complexity

| Operation | Array w/ \`shift()\` | Linked List / Circular Buffer |
|---|---|---|
| Enqueue (add to back) | O(1) amortized | O(1) |
| Dequeue (remove from front) | O(n) — must shift everything | O(1) |
| Peek front | O(1) | O(1) |

## Code: Queue via Linked List in TypeScript
\`\`\`ts
class QueueNode<T> {
  value: T;
  next: QueueNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private size = 0;

  enqueue(value: T): void {
    const node = new QueueNode(value);
    if (this.tail) {
      this.tail.next = node;
    } else {
      this.head = node; // first element in an empty queue
    }
    this.tail = node;
    this.size++;
  }

  dequeue(): T | undefined {
    if (!this.head) return undefined;
    const value = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null; // queue just became empty
    this.size--;
    return value;
  }

  get length(): number {
    return this.size;
  }
}
\`\`\`
Both \`enqueue\` and \`dequeue\` touch only the head/tail pointers directly — no traversal, no shifting, true O(1).

## Common Interview Problems
- **Breadth-first search (BFS)** on a tree or graph — a queue is what makes BFS explore level-by-level instead of depth-first.
- Task scheduling / rate limiting (process requests in arrival order, e.g. a print spooler or job queue).
- Sliding window maximum — a **deque** (double-ended queue, allowing O(1) push/pop at *both* ends) maintains a monotonic sequence of candidates, solving the problem in O(n) instead of O(n·k).
- Implementing a queue using two stacks (a classic "build X out of Y" interview question, testing whether you understand both structures' guarantees).

## Common Pitfalls
- **Using \`Array.shift()\` in a hot loop** — the single most common queue-related performance bug; it silently turns O(n) algorithms into O(n²).
- **Forgetting to reset the tail pointer when the queue becomes empty** — after removing the last element, an implementation that leaves a stale \`tail\` reference will corrupt the next \`enqueue\`.
- **Confusing a queue with a stack under time pressure** — FIFO vs LIFO look similar in pseudocode, but produce entirely different traversal orders (this is *the* difference between BFS and DFS on the same graph).
- **Not recognizing when a deque, not a plain queue, is needed** — problems that require removing from *both* ends (sliding window problems especially) need a deque, not a single-ended queue.

## Practical Takeaway
Reach for a queue whenever ordering must be preserved "first come, first served," and especially whenever you need to explore something **level by level** — that's the signature of BFS, and BFS-with-a-queue is one of the most frequently reused patterns across tree, graph, and matrix interview problems.
	`
	},

	'Linked List': {
		definition:
			'A linked list is a linear data structure made of nodes, each storing a value and a pointer/reference to the next node (and, in a doubly linked list, the previous node too), rather than storing elements contiguously in memory.',
		useCase:
			'Implementing an undo history or a music playlist where songs are frequently inserted, removed, or reordered in the middle of the sequence without wanting to shift every other element over.',
		detailedMarkdown: `
# Linked List

Where an array stores elements contiguously and computes an address from an index, a **linked list** stores each element in its own **node**, and each node holds a pointer/reference to the **next** node in the sequence. There is no single contiguous block of memory — nodes can live anywhere, connected only by these pointers. A **doubly linked list** adds a **prev** pointer to each node too, allowing traversal in both directions and O(1) removal of a node you already have a reference to.

## Node Structure
\`\`\`ts
class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}
\`\`\`
A singly linked list is just a chain of these, starting from a \`head\` reference; the last node's \`next\` is \`null\`.

## Core Operations & Complexity

| Operation | Singly Linked List | Array |
|---|---|---|
| Access by index | O(n) — must walk from head | O(1) |
| Search by value | O(n) | O(n) |
| Insert/delete at **head** | O(1) | O(n) (must shift) |
| Insert/delete at **tail** (no tail pointer) | O(n) — must walk to find it | O(1) amortized |
| Insert/delete at tail (with tail pointer kept) | O(1) | O(1) amortized |
| Insert/delete given a node reference (middle) | O(1) to splice, but O(n) to find that reference in a singly linked list | O(n) (must shift) |

The headline trade-off: linked lists make head insertion/removal O(1) and avoid ever needing to shift elements, at the cost of losing O(1) random access and paying per-node memory overhead (each node stores a pointer alongside its value) plus worse cache locality than an array.

## Code: Reverse a Singly Linked List
This is one of the most common linked-list interview questions, and it tests exactly the pointer discipline that trips people up:
\`\`\`ts
function reverseList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next; // save it BEFORE overwriting current.next
    current.next = prev;       // reverse the pointer
    prev = current;             // advance prev
    current = next;             // advance current using the saved reference
  }

  return prev; // prev is the new head once current runs off the end
}
\`\`\`
The \`const next = current.next\` line is the crux: overwrite \`current.next\` before saving the original value, and you've permanently lost the rest of the list.

## Fast & Slow Pointers (Floyd's Algorithm)
Two pointers moving at different speeds solve a whole family of linked-list problems without extra memory:
\`\`\`ts
function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // fast lapped slow inside a cycle
  }
  return false; // fast reached the end -> no cycle
}
\`\`\`
If there's a cycle, the fast pointer (moving 2 nodes at a time) is guaranteed to eventually land on the same node as the slow pointer (moving 1 node at a time) — it can't "jump over" it because it closes the gap by exactly one node per step. The same technique finds the middle of a list (stop when \`fast\` reaches the end; \`slow\` is at the midpoint).

## Common Interview Problems
- Reverse a linked list (iteratively and recursively).
- Detect a cycle, and find where it begins (Floyd's Tortoise and Hare).
- Merge two sorted linked lists into one sorted list.
- Find the middle node in one pass.
- Remove the nth node from the end (two pointers, one offset by n).
- Flatten / reorder a linked list (e.g. L0→Ln→L1→Ln-1→...).

## Common Pitfalls
- **Losing the rest of the list by overwriting \`next\` too early** — always save \`node.next\` in a local variable before reassigning it, as in the reversal example above.
- **Off-by-one errors around a dummy/sentinel head.** Many linked-list problems are cleaner with a dummy node before the real head (to avoid special-casing "is this the first node?") — forgetting to return \`dummy.next\` instead of \`dummy\` itself is a common bug.
- **Forgetting to update the tail pointer** in a structure that tracks one, after removing the last node.
- **Null-pointer errors from not checking \`.next\` before dereferencing it** — especially in fast/slow pointer code, where \`fast.next.next\` needs both \`fast\` and \`fast.next\` to be non-null first.
- **Assuming O(1) access anywhere but the head/tail** — reaching for \`list[5]\`-style thinking on a linked list silently reintroduces an O(n) walk.

## Practical Takeaway
Linked lists trade away random access for cheap insertion/removal at known positions (especially the head) and no need to ever shift elements. Interviewers use them heavily to test pointer discipline — the fast/slow pointer and dummy-head-node tricks resolve the majority of "gotcha" cases that make these problems harder than they first look.
	`
	},

	Recursion: {
		definition:
			'Recursion is a technique where a function solves a problem by calling itself on a smaller version of the same problem, relying on the language call stack to track each in-progress call, until a base case stops the chain.',
		useCase:
			"Computing a directory's total size by having each folder ask each of its subfolders for their size and summing the results — a naturally self-similar, tree-shaped problem that mirrors the recursive definition exactly.",
		detailedMarkdown: `
# Recursion

**Recursion** is a function calling itself to solve a smaller instance of the same problem, until it reaches a **base case** simple enough to answer directly without recursing further. Every recursive call pushes a new **stack frame** onto the call stack — holding that call's local variables and where to resume once it returns — and each frame is popped when its call returns, unwinding back toward the original caller.

## The Two Required Parts
Every correct recursive function needs both:
1. **Base case** — the simplest possible input, answered directly, with no further recursive call. Without this, the function recurses forever (or until it crashes).
2. **Recursive case** — reduces the problem to one or more smaller subproblems and combines their results.

\`\`\`ts
function factorial(n: number): number {
  if (n <= 1) return 1;              // base case
  return n * factorial(n - 1);       // recursive case: smaller subproblem
}
\`\`\`
\`factorial(5)\` calls \`factorial(4)\`, which calls \`factorial(3)\`, ... down to \`factorial(1)\`, which finally returns without recursing — then each pending multiplication resolves as the stack unwinds back up: \`1 -> 1*2 -> 2*3 -> 6*4 -> 24*5 -> 120\`.

## What the Call Stack Actually Looks Like
\`\`\`text
factorial(5)
  factorial(4)
    factorial(3)
      factorial(2)
        factorial(1)  <- base case hit here, starts returning
      returns 2  (2 * 1)
    returns 6    (3 * 2)
  returns 24     (4 * 6)
returns 120      (5 * 24)
\`\`\`
Each nested call is a real stack frame sitting in memory, waiting for its recursive call to return before it can finish its own multiplication — that's O(n) **space**, not just O(n) time, purely from the call stack.

## The Classic Cautionary Tale: Naive Fibonacci
\`\`\`ts
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2); // two recursive calls per call!
}
\`\`\`
This looks innocent but is O(2^n) time — \`fib(n-1)\` and \`fib(n-2)\` each independently recompute huge overlapping subtrees of the same smaller Fibonacci values, over and over. **Memoization** fixes this by caching results already computed:
\`\`\`ts
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (cache.has(n)) return cache.get(n)!; // already solved this subproblem
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
  cache.set(n, result);
  return result;
}
\`\`\`
This turns the exponential explosion into O(n) time (O(n) space for the cache plus the call stack) — the same "avoid recomputing overlapping subproblems" idea that underlies all of dynamic programming.

## Recursion vs Iteration
| | Recursion | Iteration |
|---|---|---|
| Space | O(depth) call stack, even with no other data structures | O(1) extra space typical (just loop variables) |
| Readability | Often much closer to the problem's natural (especially tree/graph) definition | Can require an explicit stack/queue to replicate the same traversal |
| Risk | Stack overflow on deep inputs; JS engines rarely optimize tail calls | None inherent — bounded only by how the loop is written |

Any recursive algorithm *can* be rewritten iteratively using an explicit stack you manage yourself — this is exactly the technique used to avoid call-stack limits when traversing very deep trees or graphs.

## Common Interview Problems
- Tree traversals (inorder/preorder/postorder) — the recursive structure mirrors the tree's own definition almost exactly.
- Backtracking: generating permutations, combinations, subsets, solving N-Queens or Sudoku.
- Divide-and-conquer algorithms: merge sort, quicksort, binary search.
- Any "smaller version of the same problem" question: computing nested folder sizes, flattening nested arrays, evaluating nested expressions.

## Common Pitfalls
- **Forgetting the base case (or getting it wrong)** — the single most common recursion bug; it causes infinite recursion, which manifests as a **stack overflow** crash rather than an infinite loop hang.
- **Not shrinking the problem on every recursive call.** If a recursive call doesn't strictly move closer to the base case (e.g. calling with the same or a larger input under some code path), it never terminates.
- **Ignoring the hidden exponential blowup from overlapping subproblems** (naive Fibonacci, naive recursive combination counting) — always ask "am I solving the same subproblem more than once?" and reach for memoization if so.
- **Recursing too deep for the language's stack size.** JavaScript typically allows only a few thousand to ~10-15k stack frames before throwing "Maximum call stack size exceeded" — a recursive solution that's correct but processes, say, 100,000 linked list nodes one recursive call per node can crash in production even though the equivalent loop would run fine.
- **Assuming tail-call optimization saves you.** Some languages eliminate stack growth for tail-recursive calls; most JavaScript engines do **not** implement this despite it being in the spec, so "just make it tail-recursive" is not a reliable fix in JS/TS.

## Practical Takeaway
Recursion is the natural tool whenever a problem is defined in terms of smaller versions of itself — trees, graphs, divide-and-conquer, and backtracking all fit this shape directly. Always state the base case explicitly, check for overlapping subproblems before you write the recursive case, and know that every level of recursion is a real stack frame with a real, finite limit.
	`
	},

	'Binary Search Basics': {
		definition:
			'Binary search finds a target value in a sorted collection by repeatedly comparing it to the middle element and discarding the half of the search space that cannot contain it, running in O(log n) time.',
		useCase:
			'Looking up a word in a sorted dictionary by opening to the middle, deciding whether the target word comes before or after it alphabetically, and repeating on the correct half — never having to scan every page.',
		detailedMarkdown: `
# Binary Search Basics

**Binary search** exploits one precondition — the data is **sorted** — to eliminate half of the remaining candidates with every single comparison. Instead of scanning left to right (O(n)), it jumps to the middle, compares, and recurses into only the half that could still contain the target. Halving the search space every step is precisely what produces O(log n) time.

## The Core Algorithm
\`\`\`ts
function binarySearch(sortedArr: number[], target: number): number {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2); // avoids overflow in other languages
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) {
      low = mid + 1;   // target must be in the right half
    } else {
      high = mid - 1;  // target must be in the left half
    }
  }
  return -1; // not found
}
\`\`\`
Note \`low + Math.floor((high - low) / 2)\` rather than \`Math.floor((low + high) / 2)\` — in languages with fixed-width integers (Java, C++), \`low + high\` can overflow for very large arrays; the first form never adds two large numbers together. JavaScript numbers don't overflow the same way, but writing it the safe way is a habit worth having, and interviewers notice it.

## Why It's O(log n)
Each comparison discards exactly half of the remaining elements. Starting from \`n\` elements, after one comparison there are \`n/2\` left, then \`n/4\`, then \`n/8\`, ... The number of halvings needed to get down to 1 element is \`log₂(n)\` — for a billion elements, that's only about 30 comparisons.

## Core Operations & Complexity

| Operation | Complexity | Precondition |
|---|---|---|
| Binary search | O(log n) | Data must already be sorted |
| Building the sorted structure first (if unsorted) | O(n log n) | Sorting cost, paid once |
| Linear search (for comparison) | O(n) | Works on unsorted data too |

If you're only searching once, sorting first (O(n log n)) to then binary search (O(log n)) is *worse* than a single O(n) linear scan — binary search only pays off when you'll search the same sorted data **many** times, or the data was already sorted for other reasons.

## Beyond "Find the Exact Value": Search on the Answer Space
Binary search's real interview power shows up once you realize it doesn't require an actual array — it works on **any monotonic (sorted-like) condition** over a range of possible answers:
\`\`\`ts
// Find the smallest x in [low, high] for which isFeasible(x) becomes true,
// given that isFeasible is false for small x and true for large x (monotonic).
function findBoundary(low: number, high: number, isFeasible: (x: number) => boolean): number {
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (isFeasible(mid)) {
      high = mid;       // mid works; a smaller value might too
    } else {
      low = mid + 1;    // mid doesn't work; try bigger
    }
  }
  return low; // low === high: the smallest feasible value
}
\`\`\`
This pattern ("binary search on the answer") shows up in problems like "minimum number of days to ship all packages" or "smallest divisor given a threshold," where the *answer itself* — not an array index — is the thing being binary searched over a monotonic feasibility condition.

## Common Interview Problems
- Classic exact-match search, and its variants: search insert position, find first/last occurrence of a target in a sorted array with duplicates.
- Search in a rotated sorted array (a modified binary search that first figures out which half is properly sorted).
- Find peak element in an array (binary search on a condition rather than equality).
- "Binary search on the answer" optimization problems (minimize/maximize a value subject to a monotonic feasibility check).

## Common Pitfalls
- **Off-by-one errors in the loop bounds.** Using \`low < high\` vs \`low <= high\`, and \`mid\` vs \`mid + 1\`/\`mid - 1\`, must be chosen consistently — mixing conventions is the single most common source of infinite loops or missed elements in binary search.
- **Infinite loops from not shrinking the range.** Writing \`high = mid\` when it should be \`high = mid - 1\` (or vice versa) can leave \`low\`/\`high\` unchanged forever if \`mid\` doesn't move the boundary.
- **Forgetting the precondition.** Binary search silently gives wrong answers (not an error) on unsorted data — always confirm sortedness (or an equivalent monotonic condition) before applying it.
- **Integer overflow in \`(low + high) / 2\`** in fixed-width-integer languages — use \`low + (high - low) / 2\` instead as a defensive habit.
- **Not recognizing "binary search on the answer" opportunities** — many optimization problems that don't look like a search at all (minimizing a maximum, finding a threshold) can be solved in O(n log(range)) this way instead of a slower brute-force scan.

## Practical Takeaway
Binary search is the go-to whenever data is sorted (or a condition over a range is monotonic) and you need better than O(n) — but its correctness is unusually sensitive to boundary details, so pick one consistent convention for \`low\`/\`high\`/\`mid\` updates and stick to it every time rather than re-deriving it from scratch under pressure.
	`
	},

	'Trees Basics': {
		definition:
			'A tree is a hierarchical data structure of nodes connected by edges, with one root node and no cycles, where a binary tree restricts every node to at most two children, and a binary search tree additionally keeps left descendants smaller and right descendants larger than each node.',
		useCase:
			"Representing a company's org chart, where each employee (node) has exactly one manager (parent, except the CEO/root) and any number of direct reports (children), naturally modeling the hierarchy.",
		detailedMarkdown: `
# Trees Basics

A **tree** is a connected, hierarchical structure with no cycles: one designated **root** node, and every other node reachable from the root by exactly one path, connected via **parent -> child** edges. A **binary tree** restricts every node to **at most two children**, conventionally called \`left\` and \`right\`. A **binary search tree (BST)** adds an ordering invariant: for *every* node, all values in its left subtree are smaller, and all values in its right subtree are larger.

## Vocabulary You're Expected to Know
- **Root** — the single top node with no parent.
- **Leaf** — a node with no children.
- **Depth** of a node — number of edges from the root down to that node.
- **Height** of a tree — the number of edges on the longest path from root to a leaf.
- **Balanced tree** — height stays O(log n) relative to the number of nodes (no path is dramatically longer than others).

## Node Structure
\`\`\`ts
class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(value: number) {
    this.value = value;
  }
}
\`\`\`

## The Four Standard Traversals
\`\`\`ts
function inorder(node: TreeNode | null, out: number[] = []): number[] {
  if (!node) return out;
  inorder(node.left, out);
  out.push(node.value);   // visit between left and right
  inorder(node.right, out);
  return out;
}
// Preorder: visit node, then left, then right — useful for copying/serializing a tree.
// Postorder: visit left, then right, then node — useful for deleting a tree bottom-up.
// Level-order (BFS): visit level by level, using a queue instead of recursion.
\`\`\`
**Inorder traversal of a BST always visits values in sorted order** — this single fact is the most reused property of BSTs in interviews (it's how you validate a BST, or how you can turn a BST back into a sorted array in O(n)).

## BST Search, Insert, Delete
\`\`\`ts
function bstInsert(node: TreeNode | null, value: number): TreeNode {
  if (!node) return new TreeNode(value);
  if (value < node.value) {
    node.left = bstInsert(node.left, value);
  } else if (value > node.value) {
    node.right = bstInsert(node.right, value);
  }
  return node; // duplicate values: no-op, depending on the chosen convention
}

function bstSearch(node: TreeNode | null, target: number): boolean {
  if (!node) return false;
  if (node.value === target) return true;
  return target < node.value ? bstSearch(node.left, target) : bstSearch(node.right, target);
}
\`\`\`
Each step discards an entire subtree — exactly like binary search on a sorted array — which is why a BST's search/insert/delete are O(log n) **when the tree is balanced**.

## Core Operations & Complexity

| Operation | Balanced BST | Unbalanced (Worst Case) |
|---|---|---|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Traversal (any kind, whole tree) | O(n) | O(n) |

The worst case happens when nodes are inserted in already-sorted order, degenerating the "tree" into what is structurally a linked list — every node has only one child, and every search becomes a linear walk. This is exactly why **self-balancing trees** (AVL, Red-Black) exist: they perform extra rebalancing work on insert/delete specifically to guarantee O(log n) height no matter the insertion order.

## Common Interview Problems
- Validate whether a binary tree is a valid BST (a common trap: it's not enough to check each node against its immediate children — the whole left subtree must be less than the node, and the whole right subtree greater).
- Lowest Common Ancestor (LCA) of two nodes.
- Level-order traversal / zigzag traversal (BFS with a queue).
- Diameter of a binary tree (longest path between any two nodes, not necessarily through the root).
- Serialize and deserialize a binary tree.
- Balanced tree check (height difference between subtrees never exceeds 1 at any node).

## Common Pitfalls
- **Validating a BST by only comparing a node to its direct children.** A node can be greater than its left child and less than its right child locally, while still violating the BST property against an *ancestor* further up — correct validation must pass down a valid \`(min, max)\` range to each recursive call.
- **Forgetting trees can be deeply unbalanced.** A tree built from already-sorted input degrades every "O(log n)" operation to O(n) — always clarify (or assume, and state the assumption) whether the tree is balanced.
- **Stack overflow on deep recursion.** A recursive traversal on a very deep, unbalanced tree can hit the same call-stack limits discussed under Recursion — an iterative traversal with an explicit stack avoids this.
- **Off-by-one in height/depth definitions.** Some conventions count a single-node tree as height 0, others as height 1 — state your convention explicitly since it changes edge-case answers.
- **Deleting a BST node with two children incorrectly.** The standard fix is to replace the deleted node's value with its **inorder successor** (smallest value in the right subtree) or **inorder predecessor**, then delete that successor/predecessor node instead — getting this wrong silently breaks the BST invariant.

## Practical Takeaway
Trees model anything hierarchical, and BSTs turn that hierarchy into a searchable structure with the same halving logic as binary search — but only as long as the tree stays reasonably balanced. Inorder traversal producing sorted output is the fact to keep front-of-mind; a large fraction of BST interview problems reduce to "do something inorder" or "pass a valid range down the recursion."
	`
	},

	'Graph Basics': {
		definition:
			'A graph is a set of vertices (nodes) connected by edges, which may be directed or undirected and weighted or unweighted, used to model any pairwise relationship — trees are actually a special case of graphs with no cycles and exactly one path between any two nodes.',
		useCase:
			'Modeling a social network where each person is a vertex and each friendship is an edge, so that "how many people are within 2 connections of me" becomes a graph traversal question rather than a manual lookup.',
		detailedMarkdown: `
# Graph Basics

A **graph** generalizes a tree: it's a set of **vertices** (nodes) connected by **edges**, but without a tree's restrictions — a graph can have cycles, disconnected components, and multiple paths between the same two nodes. Edges can be **directed** (a one-way relationship, like "follows on social media") or **undirected** (a symmetric relationship, like "is friends with"), and can carry a **weight** (like a distance or cost) or be unweighted.

## Representing a Graph
There are two standard representations, with a real space/time trade-off between them:

**Adjacency list** — each vertex maps to a list of its neighbors:
\`\`\`ts
type Graph = Map<number, number[]>;

function addEdge(graph: Graph, u: number, v: number, directed = false): void {
  if (!graph.has(u)) graph.set(u, []);
  graph.get(u)!.push(v);
  if (!directed) {
    if (!graph.has(v)) graph.set(v, []);
    graph.get(v)!.push(u); // undirected: add the reverse edge too
  }
}
\`\`\`

**Adjacency matrix** — an \`n x n\` grid where \`matrix[i][j]\` is 1 (or a weight) if an edge exists between \`i\` and \`j\`, else 0:
\`\`\`ts
const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
matrix[u][v] = 1;
if (!directed) matrix[v][u] = 1;
\`\`\`

| | Adjacency List | Adjacency Matrix |
|---|---|---|
| Space | O(V + E) | O(V²) |
| Check if edge (u, v) exists | O(degree of u) | O(1) |
| Iterate all neighbors of a vertex | O(degree of u) | O(V), even if most aren't neighbors |
| Best for | Sparse graphs (E much less than V²) — the common real-world case | Dense graphs, or when O(1) edge lookups matter most |

Most real-world graphs (social networks, road networks, dependency graphs) are **sparse** — E is much closer to V than to V² — which is why adjacency lists are the default choice in practice.

## BFS vs DFS
Both explore every reachable vertex, but in a different order, using a different structure:

\`\`\`ts
function bfs(graph: Graph, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!; // conceptually O(1); see the Queue pitfall above re: real perf
    order.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

function dfs(graph: Graph, start: number, visited = new Set<number>(), order: number[] = []): number[] {
  visited.add(start);
  order.push(start);
  for (const neighbor of graph.get(start) ?? []) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited, order);
  }
  return order;
}
\`\`\`
**BFS** (queue-based) explores level by level outward from the start — the natural fit for **shortest path in an unweighted graph**, because the first time you reach a node is guaranteed to be via the fewest possible edges. **DFS** (stack-based, or recursive using the call stack) plunges as deep as possible down one path before backtracking — the natural fit for exploring **all paths**, detecting cycles, or topological sorting.

## Core Operations & Complexity

| Operation | Complexity (adjacency list) |
|---|---|
| BFS / DFS full traversal | O(V + E) |
| Check if an edge exists | O(degree of the vertex) |
| Add a vertex | O(1) |
| Add an edge | O(1) |

## Common Interview Problems
- Number of islands / connected components (DFS or BFS flood-fill over a grid).
- Shortest path in an unweighted graph (BFS); shortest path with weights (Dijkstra's algorithm, which layers a priority queue on top of this same traversal idea).
- Cycle detection (different techniques for directed vs undirected graphs).
- Topological sort (ordering tasks so every dependency comes before what depends on it — only possible on a **directed acyclic graph**, a DAG).
- Clone a graph; course schedule / prerequisite problems (topological sort in disguise).

## Common Pitfalls
- **Forgetting the visited set, causing infinite loops.** Unlike a tree, a graph can have cycles — traversing without tracking visited nodes will loop forever the moment a cycle exists.
- **Not handling disconnected components.** A single BFS/DFS call from one starting vertex only reaches vertices connected to it — a full traversal of the whole graph requires looping over every vertex and starting a fresh traversal from any unvisited one.
- **Mixing up directed and undirected edge insertion.** Adding an edge only one way when the graph should be undirected (or vice versa) silently produces wrong reachability/shortest-path answers.
- **Using DFS/recursion on a graph with a very long path**, hitting the same call-stack depth limits as trees — an explicit stack-based iterative DFS sidesteps this.
- **Reaching for BFS on a weighted graph** expecting shortest paths — plain BFS only guarantees shortest paths when every edge has the same weight (or no weight); weighted shortest paths need Dijkstra's algorithm (or Bellman-Ford if negative weights are possible).

## Practical Takeaway
Graphs are the most general structure in this list — trees, linked lists, and even arrays-as-adjacency can all be seen as special cases. The two decisions that matter most in an interview are: **which representation fits the graph's density**, and **BFS vs DFS based on whether you need shortest-unweighted-path/level-order behavior or exhaustive path/cycle exploration**.
	`
	},

	'Heap / Priority Queue Basics': {
		definition:
			'A heap is a complete binary tree stored in a flat array, maintaining the invariant that every parent is smaller (min-heap) or larger (max-heap) than its children, giving O(1) access to the smallest/largest element and O(log n) insert/remove — this is what backs a priority queue.',
		useCase:
			"Always processing the highest-priority support ticket next out of a constantly-changing pool of incoming tickets, without re-sorting the entire pool every time a new ticket arrives or one gets resolved.",
		detailedMarkdown: `
# Heap / Priority Queue Basics

A **heap** is a **complete binary tree** (every level is fully filled except possibly the last, which fills left to right) that maintains one invariant: in a **min-heap**, every parent is less than or equal to both its children (so the smallest element overall is always at the root); a **max-heap** flips that. A **priority queue** is the abstract concept — "always give me the highest-priority item next" — and a heap is the standard, efficient way to implement one.

## The Trick: Storing a Tree in a Flat Array
Because a heap is always a *complete* binary tree, it can be stored in a plain array with no pointers at all, using arithmetic to find parent/child relationships:
- Parent of index \`i\` is at \`Math.floor((i - 1) / 2)\`
- Left child of index \`i\` is at \`2 * i + 1\`
- Right child of index \`i\` is at \`2 * i + 2\`

This is far more memory-efficient than a node-based tree, and is exactly how virtually every real priority queue implementation works under the hood.

## Sift-Up and Sift-Down
These two operations are how a heap restores its invariant after a change:
- **Sift-up (bubble-up)** — used after **inserting** a new element at the end of the array: repeatedly swap it with its parent while it's smaller (min-heap) than that parent, until the invariant holds.
- **Sift-down (bubble-down/heapify)** — used after **removing the root**: move the last element into the root's spot, then repeatedly swap it with its smaller child until the invariant holds again.

## Code: Min-Heap in TypeScript
\`\`\`ts
class MinHeap {
  private data: number[] = [];

  peek(): number | undefined {
    return this.data[0]; // O(1): the minimum is always the root
  }

  insert(value: number): void {
    this.data.push(value);           // add at the end
    this.siftUp(this.data.length - 1);
  }

  extractMin(): number | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;           // move last element to root
      this.siftDown(0);
    }
    return min;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent] <= this.data[i]) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.data[left] < this.data[smallest]) smallest = left;
      if (right < n && this.data[right] < this.data[smallest]) smallest = right;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}
\`\`\`
Note that unlike a BST, a heap makes **no promise about ordering between siblings or across the whole tree** — only that every parent beats its own children. That's precisely what makes insert/extract cheaper than a BST rebalance: you only ever fix one path from root to leaf (or leaf to root), never the whole structure.

## Core Operations & Complexity

| Operation | Complexity | Why |
|---|---|---|
| Peek min/max | O(1) | Always sitting at the root (index 0) |
| Insert | O(log n) | Sift-up travels at most the tree's height |
| Extract min/max | O(log n) | Sift-down travels at most the tree's height |
| Build a heap from n elements | O(n) | Sifting down from the bottom half up is cheaper than n individual inserts — a classic surprising result |
| Search for an arbitrary value | O(n) | No structural help; heaps aren't designed for search |

## Common Interview Problems
- Kth largest/smallest element in a stream or array (maintain a heap of size k).
- Merge k sorted lists (a min-heap holding the current head of each list).
- Top K frequent elements (heap on frequency counts).
- Dijkstra's shortest path algorithm (a min-heap of "distance so far" drives which node to process next).
- Median of a data stream (two heaps: a max-heap for the lower half, a min-heap for the upper half).

## Common Pitfalls
- **Confusing a heap with a BST.** A heap only guarantees parent-vs-children ordering, not full sorted order — you cannot do a BST-style search or expect inorder traversal to produce sorted output from a heap.
- **Forgetting JavaScript has no built-in heap/priority queue.** Unlike some languages, JS/TS has no native \`PriorityQueue\` — you either implement one (as above) or reach for a library; using a plain sorted array instead silently reintroduces O(n) or O(n log n) costs per insert.
- **Getting the child/parent index formulas wrong**, especially off-by-one errors between 0-indexed and 1-indexed heap array conventions — pick one and be consistent.
- **Assuming \`extractMin\`/\`peek\` on an empty heap is safe** without checking length first.
- **Using a max-heap where a min-heap was needed (or vice versa)** — a very easy mental slip; always double-check which extreme the problem actually needs before writing the comparison direction.

## Practical Takeaway
Reach for a heap the moment a problem needs repeated access to "the current smallest/largest of a changing set" — "kth something," "top k," "merge k sorted things," and shortest-path algorithms are the classic tells. The O(log n) insert/extract cost is the price paid for O(1) access to the extreme value at any point, without ever needing a full sort.
	`
	},

	'Bit Manipulation Basics': {
		definition:
			'Bit manipulation operates directly on the individual binary digits of a number using bitwise operators (AND, OR, XOR, NOT, shifts), letting certain operations run in O(1) time and O(1) space instead of relying on arrays, loops, or arithmetic division/modulo.',
		useCase:
			'Storing which of 30 optional feature flags are enabled for a user as a single 32-bit integer bitmask instead of an array of 30 booleans, checking or toggling any flag in O(1) with a single bitwise operation.',
		detailedMarkdown: `
# Bit Manipulation Basics

Every integer is stored as a sequence of **bits** (0s and 1s) in memory. **Bit manipulation** works directly on those bits using dedicated operators, which map almost directly to hardware instructions — making them extremely fast, and useful for compact storage (a single 32-bit integer can represent 32 independent true/false flags) and for a family of classic interview tricks.

## The Core Operators

| Operator | Symbol | Behavior |
|---|---|---|
| AND | \`&\` | 1 only if both bits are 1 |
| OR | \`\\|\` | 1 if either bit is 1 |
| XOR | \`^\` | 1 if the bits differ |
| NOT | \`~\` | Flips every bit |
| Left shift | \`<<\` | Shifts bits left, filling with 0 (multiplies by 2 per shift) |
| Right shift (sign-preserving) | \`>>\` | Shifts bits right, preserving the sign bit (divides by 2 per shift, rounding toward negative infinity) |
| Unsigned right shift | \`>>>\` | Shifts bits right, filling with 0 regardless of sign |

Important gotcha for JavaScript specifically: bitwise operators convert their operands to **32-bit signed integers** before operating, and produce a 32-bit signed integer result — this matters for numbers outside that range, and for why \`>>\` and \`>>>\` behave differently on negative numbers.

## Common Bit Tricks
\`\`\`ts
function isEven(n: number): boolean {
  return (n & 1) === 0; // last bit 0 means even
}

function getBit(n: number, i: number): number {
  return (n >> i) & 1; // shift the target bit to position 0, then isolate it
}

function setBit(n: number, i: number): number {
  return n | (1 << i); // OR-ing a 1 into position i always turns that bit on
}

function clearBit(n: number, i: number): number {
  return n & ~(1 << i); // AND with everything-except-a-1-at-i turns that bit off
}

function toggleBit(n: number, i: number): number {
  return n ^ (1 << i); // XOR with a 1 flips that one bit, leaves the rest untouched
}

function countSetBits(n: number): number {
  let count = 0;
  while (n !== 0) {
    n &= n - 1; // clears the lowest set bit each iteration (Brian Kernighan's trick)
    count++;
  }
  return count; // runs once per 1-bit, not once per bit overall
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0; // a power of two has exactly one set bit
}
\`\`\`
\`n & (n - 1)\` is worth memorizing on its own: subtracting 1 flips the lowest set bit to 0 and every bit below it to 1, so ANDing with the original clears exactly that lowest set bit — which is why it both counts set bits efficiently and detects powers of two in O(1).

## XOR's Special Property: Self-Cancellation
\`a ^ a = 0\` and \`a ^ 0 = a\` for any \`a\`, and XOR is both commutative and associative. That means XOR-ing a list of numbers where every value appears twice **except one** leaves only that unpaired value:
\`\`\`ts
function findSingleNumber(nums: number[]): number {
  return nums.reduce((acc, n) => acc ^ n, 0); // O(n) time, O(1) space
}
\`\`\`
All the paired values cancel each other out (\`x ^ x = 0\`), leaving only the number with no partner — solving a problem that looks like it needs a hash set (O(n) space) in O(1) space instead.

## Bitmasks for Sets and Subsets
Since each bit can represent "is element i in the set," an integer can represent an entire subset of up to 32 (or 64) elements, and generating all \`2^n\` subsets of a small set becomes a loop over integers:
\`\`\`ts
function allSubsets<T>(items: T[]): T[][] {
  const subsets: T[][] = [];
  const n = items.length;
  for (let mask = 0; mask < (1 << n); mask++) { // mask ranges over all 2^n bit patterns
    const subset: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(items[i]); // bit i set -> include items[i]
    }
    subsets.push(subset);
  }
  return subsets;
}
\`\`\`

## Core Operations & Complexity

| Operation | Complexity |
|---|---|
| Any single bitwise operator (\`&\`, \`\\|\`, \`^\`, \`~\`, shifts) | O(1) |
| Count set bits (Brian Kernighan's trick) | O(number of set bits), never worse than O(32) |
| Enumerate all subsets via bitmask | O(2^n · n) — exponential, but with a very small, fast constant per subset |

## Common Interview Problems
- Single Number (find the one non-duplicated element via XOR, above).
- Counting Bits (count set bits for every number from 0 to n, often with dynamic programming built on the "clear lowest set bit" trick).
- Power of Two / Power of Four checks.
- Subset generation / subset-sum style problems using bitmasking, especially in dynamic programming over small n (bitmask DP).
- Swapping two variables without a temporary variable via XOR (a classic trick question, rarely used in real code).

## Common Pitfalls
- **Sign bit surprises with negative numbers.** \`>>\` on a negative number fills with 1s (preserving sign), while \`>>>\` always fills with 0s — using the wrong one silently produces a huge positive number instead of the expected negative result, or vice versa.
- **Forgetting JS bitwise ops truncate to 32-bit signed integers.** Numbers larger than 2³¹-1 will wrap around unexpectedly when run through a bitwise operator, which is easy to miss when JS numbers are otherwise 64-bit floats everywhere else.
- **Off-by-one in shift amounts**, e.g. using \`1 << n\` when \`1 << (n - 1)\` was meant — always double check whether you want "the i-th bit" or "the count of the first i bits."
- **Reaching for bit tricks where they hurt readability** without a real performance need — bitmask code is dense and easy to get subtly wrong; it's worth it for genuine O(1)-space wins or small-n subset enumeration, less so as a reflexive "clever" replacement for a clearer boolean array.
- **Assuming \`~n\` is \`-n\`.** Bitwise NOT gives the two's-complement bitwise inverse, which equals \`-n - 1\`, not \`-n\` — a common source of off-by-one bugs when using \`~\` for arithmetic rather than pure bit-flipping.

## Practical Takeaway
Bit manipulation trades readability for very real O(1)-space, O(1)-time wins on a specific family of problems — flags/masks, single-unpaired-element problems, and small-n subset enumeration are the classic tells that a bitwise trick applies. Brian Kernighan's \`n & (n - 1)\` and XOR's self-cancellation (\`a ^ a = 0\`) are the two tricks worth having fully memorized going into an interview.
	`
	}
};
