import type { RoadmapDetailMap } from './types';

export const DsaAdvancedContent: RoadmapDetailMap = {
	'Segment Tree': {
		definition:
			'A segment tree is a binary tree over an array that supports range queries (sum/min/max over any [l, r]) and point/range updates in O(log n), instead of the O(n) a naive re-scan requires per query.',
		useCase:
			'Lower-priority / advanced topic: mostly comes up at companies with a strong competitive-programming bar (some quant firms, infra-heavy FAANG interviews) — asked when a problem needs many interleaved range queries AND updates on a mutable array, e.g. "range sum query, array is mutable."',
		detailedMarkdown: `
# Segment Tree

**Advanced / lower priority.** Most interviews never require you to build one of these from scratch — it shows up when a problem explicitly mixes **repeated range queries with in-between updates** on a mutable array, which a naive approach can't handle efficiently. If you only need a static array's range sum, a simple **prefix sum array** is O(1) per query and much simpler — reach for a segment tree only once updates enter the picture.

## The Problem It Solves
Given an array, answer queries like "what's the sum/min/max of \\\`arr[l..r]\\\`?" while also supporting "update \\\`arr[i]\\\` to a new value" — and you need to do many of both, interleaved.
- Naive re-scan per query: O(n) per query.
- Prefix sums: O(1) per query, but O(n) to update (the whole suffix of prefix sums shifts).
- **Segment tree: O(log n) per query AND O(log n) per update.**

## Structure
A segment tree is a binary tree built over the array where each node represents a range \\\`[lo, hi]\\\` and stores the aggregate (sum/min/max) of that range. The root covers the whole array; each node splits its range in half between its two children; leaves cover single elements.

## Build / Query / Update Sketch
\\\`\\\`\\\`text
tree: array of size 4*n (safe upper bound for a complete binary tree)

build(node, lo, hi):
    if lo == hi:
        tree[node] = arr[lo]
        return
    mid = (lo + hi) / 2
    build(2*node,   lo,     mid)
    build(2*node+1, mid+1,  hi)
    tree[node] = tree[2*node] + tree[2*node+1]   // combine step (sum here)

query(node, lo, hi, l, r):        // range [l, r] we actually want
    if r < lo or hi < l: return 0              // no overlap
    if l <= lo and hi <= r: return tree[node]  // total overlap
    mid = (lo + hi) / 2
    return query(2*node,   lo,    mid, l, r)
         + query(2*node+1, mid+1, hi,  l, r)   // partial overlap — recurse both sides

update(node, lo, hi, idx, val):
    if lo == hi:
        tree[node] = val
        return
    mid = (lo + hi) / 2
    if idx <= mid: update(2*node,   lo,    mid, idx, val)
    else:          update(2*node+1, mid+1, hi,  idx, val)
    tree[node] = tree[2*node] + tree[2*node+1]  // re-combine on the way back up
\\\`\\\`\\\`

## Complexity
- **Build:** O(n) — visits each node once.
- **Query / point update:** O(log n) — the recursion depth is the tree height.
- **Space:** O(n) (the \\\`4*n\\\` array bound).

The "combine" operation can be any associative function — sum, min, max, gcd — which is why segment trees generalize to a wide range of range-query problems, not just sums.

## Practical Takeaway
Recognize the trigger: "range query + point/range update, interleaved, on a mutable array" is the segment tree signal. If updates never happen, use a prefix sum array instead — it's simpler and just as fast for queries.
	`
	},

	'Fenwick Tree (Binary Indexed Tree)': {
		definition:
			'A Fenwick tree (BIT) is a compact array-based structure that answers prefix-sum queries and supports point updates in O(log n), using the "lowbit" (i & -i) trick to jump between related indices.',
		useCase:
			'Lower-priority / advanced topic: shows up mainly in competitive-programming-flavored interviews (quant firms, some infra teams) when a problem needs prefix sums over a frequently-updated array — e.g. "count of elements ≤ x seen so far," inversion counting.',
		detailedMarkdown: `
# Fenwick Tree (Binary Indexed Tree)

**Advanced / lower priority.** Like the segment tree, this is mostly a competitive-programming staple rather than a "core" interview topic — expect it only when a problem needs fast, repeated **prefix-sum** queries with point updates (e.g. counting inversions, "how many elements smaller than x have I seen so far").

## The Core Trick: lowbit
A Fenwick tree stores partial sums at indices chosen by each index's **lowest set bit**, computed as \\\`i & -i\\\` (in two's complement, \\\`-i\\\` flips all bits and adds 1, so \\\`i & -i\\\` isolates the lowest 1 bit). That single trick drives both operations:
- To **update** index \\\`i\\\`, repeatedly jump to \\\`i += i & -i\\\` (propagate the change upward through all ranges that include \\\`i\\\`).
- To **query** the prefix sum up to \\\`i\\\`, repeatedly jump to \\\`i -= i & -i\\\` (accumulate the partial sums that together cover \\\`[1, i]\\\`).

## Code Sketch (1-indexed)
\\\`\\\`\\\`text
tree: array of size n+1, initialized to 0

update(i, delta):
    while i <= n:
        tree[i] += delta
        i += i & -i        // lowbit(i) — move to the next range that includes i

prefixSum(i):
    sum = 0
    while i > 0:
        sum += tree[i]
        i -= i & -i         // lowbit(i) — strip off the lowest set bit
    return sum

rangeSum(l, r):
    return prefixSum(r) - prefixSum(l - 1)
\\\`\\\`\\\`

## Complexity
- **Update / prefix-sum query:** O(log n) each.
- **Space:** O(n) — notably smaller constant factor than a segment tree's \\\`4n\\\`.

## Fenwick Tree vs Segment Tree
| | Fenwick Tree (BIT) | Segment Tree |
|---|---|---|
| Code size | ~10 lines, no recursion needed | More code, usually recursive |
| Supports | Prefix sums (and by extension range sums) | Any associative combine — sum, min, max, gcd |
| Range min/max query | Not naturally supported | Yes |
| Constant factor | Smaller, faster in practice | Slightly heavier |

**Rule of thumb:** if the problem is specifically about prefix/range **sums** with point updates, reach for a Fenwick tree — it's simpler and faster to implement under interview time pressure. If you need range **min/max** or another non-invertible aggregate, you need a segment tree instead.

## Practical Takeaway
Fenwick trees are the "cheat code" for prefix-sum-with-updates problems — small enough to write from memory in a couple of minutes once you've internalized the lowbit trick, which is exactly what makes them worth knowing for the rare interview that expects them.
	`
	},

	'Line Sweep': {
		definition:
			'Line sweep is a technique that sorts events by position (usually time or an x-coordinate) and processes them in order while maintaining running state, converting many 2D geometry/interval problems into a single 1D pass.',
		useCase:
			'Lower-priority / advanced topic relative to basic interval merging, but genuinely useful: counting the maximum number of overlapping meetings at any instant, or computing a building skyline from a list of (left, right, height) rectangles.',
		detailedMarkdown: `
# Line Sweep

**Somewhat advanced, but more broadly applicable than the tree-based topics above** — many "interval" problems that look 2D collapse into an easy 1D sweep once you see the trick. Worth knowing even outside pure competitive-programming contexts, though it's still less universally asked than basic interval merging.

## The Idea
Instead of reasoning about intervals or shapes all at once, convert each interval/event into two **point events** (a start and an end), sort all events by position, and sweep through them left to right, updating a running counter or state as you go. This turns an O(n²) all-pairs comparison into an O(n log n) sort-then-scan.

## Classic Problem: Max Overlapping Intervals
"Given a list of meeting intervals, find the maximum number of meetings happening simultaneously."

\\\`\\\`\\\`text
events = []
for (start, end) in intervals:
    events.push((start, +1))   // a meeting begins: increment
    events.push((end,   -1))   // a meeting ends: decrement

sort events by position
  (tie-break: process -1 before +1 at the same instant, if a meeting
   ending at t shouldn't count as overlapping one starting at t)

running = 0, best = 0
for (pos, delta) in events:
    running += delta
    best = max(best, running)

return best
\\\`\\\`\\\`

## Classic Problem: The Skyline Problem
Given rectangles as \\\`(left, right, height)\\\`, output the skyline (the outline formed by all buildings).
- Convert each building into two events: \\\`(left, height, "start")\\\` and \\\`(right, height, "end")\\\`.
- Sweep left to right, maintaining a **max-heap (or ordered multiset) of currently "active" heights**.
- Whenever the current maximum active height changes as you cross an event, record a new skyline point.

## Complexity
- **Sorting the events:** O(n log n).
- **The sweep itself:** O(n) events, each processed in O(1) (simple counter) up to O(log n) (if maintaining a heap/ordered set of active heights, as in the skyline problem).
- Overall: O(n log n).

## Practical Takeaway
Whenever a problem talks about "overlapping" ranges, "maximum concurrent X," or building an outline/silhouette from ranges, try converting it into sorted start/end events and sweeping — it's one of the more transferable advanced techniques and often turns an intimidating geometry problem into a straightforward sort-and-scan.
	`
	},

	'Ordered Set / Balanced BST': {
		definition:
			'An ordered set is a sorted collection backed by a self-balancing BST (or a language\'s built-in equivalent — Java\'s TreeSet/TreeMap, Python\'s sortedcontainers) supporting O(log n) insert, delete, and find-nearest (floor/ceiling) operations.',
		useCase:
			'Lower-priority / advanced topic in the sense that it\'s more "know the tool exists" than "implement from scratch" — comes up when a problem needs a sorted, mutable collection with fast neighbor lookups, replacing a naive "sort after every insert" approach.',
		detailedMarkdown: `
# Ordered Set / Balanced BST

**Advanced mainly in the "requires knowing your language's library" sense** — you're rarely asked to implement AVL/red-black tree rotations by hand in an interview, but recognizing *when* you need this data structure (and knowing the API) is a real, occasionally-tested skill.

## The Problem It Solves
You need a collection that stays sorted while supporting **insert, delete, and "find nearest" (floor/ceiling/successor/predecessor)** queries, all efficiently, as the collection changes over time.
- Naive: keep an array, sort after every insert — O(n log n) per insert.
- **Self-balancing BST / ordered set: O(log n) per insert, delete, or neighbor query.**

## What's Under the Hood
A self-balancing BST (red-black tree, AVL tree) keeps its height at O(log n) by rebalancing after every insert/delete, guaranteeing no operation ever degrades to O(n) (which a plain unbalanced BST can, on sorted input). You essentially never implement the rotations yourself in an interview — you reach for the language's built-in ordered structure:

\\\`\\\`\\\`java
import java.util.TreeSet;

TreeSet<Integer> set = new TreeSet<>();
set.add(10);
set.add(5);
set.add(20);

set.floor(12);     // 10 -- largest value <= 12
set.ceiling(12);   // 20 -- smallest value >= 12
set.higher(10);    // 20 -- strictly greater than 10
set.lower(10);     // 5  -- strictly less than 10
set.first();       // 5  -- smallest element
set.pollFirst();   // removes and returns the smallest element
\\\`\\\`\\\`

Python doesn't have a built-in ordered set, but the third-party \\\`sortedcontainers.SortedList\\\` gives the same guarantees in practice (O(log n) insert/delete via an internally bucketed structure).

## Example Use Case
"Find the closest value to x in a stream of numbers, where numbers can also be removed" — maintain a \\\`TreeSet\\\`, and for each query use \\\`floor(x)\\\`/\\\`ceiling(x)\\\` and compare which is closer, in O(log n) instead of re-sorting.

## Complexity
- **Insert / delete / floor / ceiling / successor / predecessor:** O(log n) each.
- **In-order traversal (get everything sorted):** O(n).

## Practical Takeaway
The signal to reach for this: a problem needs a collection that is both **mutable** (things get added/removed over time) and **sorted with fast neighbor queries** — anything simpler (a plain sorted array, a hash set) either can't update efficiently or can't answer "what's the closest value" quickly. Know your language's ordered-set/map type going in; re-deriving a balanced tree from scratch under interview pressure is not the expectation.
	`
	},

	'Rolling Hash': {
		definition:
			'A rolling hash computes a hash of a sliding window over a string in O(1) per shift by incrementally updating the previous hash, instead of recomputing the full O(k) hash of every new window.',
		useCase:
			'Lower-priority / advanced topic — mostly comes up in string-heavy interview questions (duplicate substring detection, plagiarism-style comparison) at companies that lean into competitive-programming-style prompts.',
		detailedMarkdown: `
# Rolling Hash

**Advanced / lower priority**, but it underpins two other topics below (Rabin-Karp, and duplicate-substring problems), so it's worth understanding the mechanism even if you never implement it standalone.

## The Problem It Solves
You want to compare many fixed-length substrings (windows) of a string for equality — e.g. "does any length-k substring repeat?" Hashing each window from scratch costs O(k) per window, O(nk) total. A **rolling hash** updates the previous window's hash in O(1) as the window slides by one character, giving O(n) total.

## Polynomial Rolling Hash
Treat the string as digits of a number in some base \\\`p\\\` (a prime larger than the alphabet size), reduced modulo a large prime \\\`m\\\` to keep the hash bounded:

\\\`\\\`\\\`text
hash(s[0..k-1]) = s[0]*p^(k-1) + s[1]*p^(k-2) + ... + s[k-1]*p^0   (mod m)
\\\`\\\`\\\`

## The Slide Step
To move the window one character to the right (drop \\\`s[i]\\\`, add \\\`s[i+k]\\\`):

\\\`\\\`\\\`text
newHash = ( (oldHash - s[i] * p^(k-1)) * p + s[i+k] )  (mod m)
\\\`\\\`\\\`
Intuition: subtract off the contribution of the outgoing leftmost character, shift everything else up by one power of \\\`p\\\` (multiply by \\\`p\\\`), then add in the incoming rightmost character. \\\`p^(k-1) mod m\\\` is precomputed once so each slide is genuine O(1).

\\\`\\\`\\\`python
def rolling_hashes(s, k, p=31, m=10**9 + 7):
    n = len(s)
    if n < k:
        return []
    p_pow_k_minus_1 = pow(p, k - 1, m)
    h = 0
    for i in range(k):
        h = (h * p + ord(s[i])) % m
    hashes = [h]
    for i in range(1, n - k + 1):
        h = (h - ord(s[i - 1]) * p_pow_k_minus_1) % m
        h = (h * p + ord(s[i + k - 1])) % m
        hashes.append(h % m)
    return hashes
\\\`\\\`\\\`

## Handling Collisions
Two different substrings can hash to the same value (a **collision**) — using a large prime modulus makes this rare but not impossible. Robust implementations either use two independent hashes (different \\\`p\\\`/\\\`m\\\` pairs) and require both to match, or fall back to a direct character comparison when hashes match (this is exactly what Rabin-Karp does).

## Complexity
- **Initial window hash:** O(k).
- **Each subsequent slide:** O(1).
- **Total over all windows:** O(n).

## Practical Takeaway
Rolling hash is the enabling trick behind "find duplicate substrings," "longest repeated substring," and Rabin-Karp string matching — the core idea to remember is "update, don't recompute," which is the same theme as a running sum in a sliding-window problem, just applied to hashes instead of sums.
	`
	},

	KMP: {
		definition:
			'KMP (Knuth-Morris-Pratt) is a string-matching algorithm that finds all occurrences of a pattern in a text in O(n + m) time by precomputing a "failure function" that says how far to fall back on a mismatch without re-scanning already-matched text.',
		useCase:
			'Lower-priority / advanced topic — direct KMP implementation is asked mainly at companies that lean hard into algorithmic/competitive-style interviews; most other interviews are satisfied with knowing the naive approach\'s complexity and that better options exist.',
		detailedMarkdown: `
# KMP (Knuth-Morris-Pratt)

**Advanced / lower priority** — implementing KMP correctly under interview time pressure is genuinely fiddly, so it's mostly reserved for interviews that specifically want to test string-algorithm depth. Know the idea; don't panic if you can't reproduce the exact index arithmetic from memory.

## The Problem It Solves
Find all occurrences of a pattern of length \\\`m\\\` in a text of length \\\`n\\\`.
- Naive approach: try every starting position, compare up to \\\`m\\\` characters each time — O(n*m) worst case (e.g. searching "aaaab" in "aaaaaaaaaa...").
- **KMP: O(n + m)**, by never re-examining a text character it has already matched.

## The Key Idea: The Failure Function (Prefix Function)
Precompute, for the pattern itself, an array \\\`lps\\\` ("longest proper prefix that is also a suffix") where \\\`lps[i]\\\` = the length of the longest proper prefix of \\\`pattern[0..i]\\\` that is also a suffix of \\\`pattern[0..i]\\\`.

When a mismatch happens while matching the text against the pattern at some position \\\`j\\\` in the pattern, you already know the last several text characters matched \\\`pattern[0..j-1]\\\` — so instead of restarting the pattern from index 0, you jump the pattern pointer back to \\\`lps[j-1]\\\`, because that much of the pattern's prefix is guaranteed to already match (it equals the matched suffix). The text pointer never moves backward.

## Building the LPS Array
\\\`\\\`\\\`text
lps[0] = 0
len = 0        // length of the previous longest prefix-suffix
i = 1
while i < m:
    if pattern[i] == pattern[len]:
        len += 1
        lps[i] = len
        i += 1
    elif len != 0:
        len = lps[len - 1]      // fall back, don't advance i
    else:
        lps[i] = 0
        i += 1
\\\`\\\`\\\`

## The Search Itself
\\\`\\\`\\\`text
i = 0   // index into text
j = 0   // index into pattern
while i < n:
    if text[i] == pattern[j]:
        i += 1
        j += 1
        if j == m:
            report match at i - j
            j = lps[j - 1]        // look for the next match
    elif j != 0:
        j = lps[j - 1]            // fall back using the failure function
    else:
        i += 1
\\\`\\\`\\\`
The crucial property: \\\`i\\\` (the text pointer) never decreases — every text character is examined a bounded number of times, which is what gives the O(n + m) bound.

## Complexity
- **Building the LPS array:** O(m).
- **Searching the text:** O(n).
- **Total: O(n + m)**, versus naive O(n*m).

## Practical Takeaway
The one idea worth retaining even if you never code KMP live: **"on a mismatch, use what you already know about the pattern's own structure to avoid re-comparing text you've already seen."** That's the general lesson interviewers are checking for — the exact index bookkeeping is secondary.
	`
	},

	'Rabin-Karp': {
		definition:
			'Rabin-Karp is a string-matching algorithm that uses a rolling hash to compare a candidate substring\'s hash against the pattern\'s hash in O(1) per position, falling back to a full character comparison only when hashes match, to guard against hash collisions.',
		useCase:
			'Lower-priority / advanced topic, but a natural follow-up once you know Rolling Hash — comes up when an interviewer wants to see string matching built on hashing rather than KMP\'s failure-function approach, or for multi-pattern variants.',
		detailedMarkdown: `
# Rabin-Karp

**Advanced / lower priority**, and directly builds on the **Rolling Hash** topic above — read that first if you haven't. Rabin-Karp is usually easier to explain and code correctly on the spot than KMP, which is why it's a reasonable fallback if you're asked for O(n + m)-ish string matching but blank on KMP's failure function.

## The Idea
Instead of comparing the pattern against every window of the text character-by-character (naive O(n*m)), compute the pattern's hash once, then slide a rolling hash across the text and only do a full character-by-character comparison when the window's hash matches the pattern's hash.

\\\`\\\`\\\`python
def rabin_karp(text, pattern, p=31, m=10**9 + 7):
    n, k = len(text), len(pattern)
    if k > n:
        return []

    pattern_hash = 0
    window_hash = 0
    p_pow_k_minus_1 = pow(p, k - 1, m)

    for i in range(k):
        pattern_hash = (pattern_hash * p + ord(pattern[i])) % m
        window_hash = (window_hash * p + ord(text[i])) % m

    matches = []
    for i in range(n - k + 1):
        if window_hash == pattern_hash:
            if text[i:i + k] == pattern:   // verify to rule out a hash collision
                matches.append(i)
        if i < n - k:
            window_hash = (window_hash - ord(text[i]) * p_pow_k_minus_1) % m
            window_hash = (window_hash * p + ord(text[i + k])) % m
            window_hash %= m

    return matches
\\\`\\\`\\\`

## Why the Verification Step Matters
A hash match doesn't *prove* equality — two different strings can collide. Rabin-Karp's correctness depends on always doing the O(k) character comparison as a final check whenever hashes match; skip it and you risk false positives. In the (rare, well-chosen-modulus) worst case where many spurious collisions occur, this verification step can degrade Rabin-Karp back to O(n*m) — in practice, with a large prime modulus, this essentially never happens.

## Complexity
- **Average case:** O(n + k) — hash comparisons are O(1), and true matches (which need O(k) verification) are rare.
- **Worst case (many collisions):** O(n*k), same as the naive approach.
- KMP guarantees O(n + m) even in the worst case, which is its main advantage over Rabin-Karp.

## Rabin-Karp vs KMP
| | Rabin-Karp | KMP |
|---|---|---|
| Core idea | Compare hashes, verify on match | Failure function avoids re-comparison |
| Worst case | O(n*k) (rare, collision-dependent) | O(n + m), guaranteed |
| Ease of implementation | Generally easier to get right live | Fiddlier index bookkeeping |
| Extends to multi-pattern | Yes — hash all patterns, check each window against the set | Not directly (see Aho-Corasick) |

## Practical Takeaway
Rabin-Karp is the "I understand rolling hashes, here's the natural next step" answer — good for when an interviewer wants string matching but you'd rather reason about hashing than re-derive KMP's failure function under pressure. Always mention the collision-verification step; omitting it is the most common way to get this topic partially wrong.
	`
	},

	'Aho-Corasick': {
		definition:
			'Aho-Corasick is a multi-pattern string-matching algorithm that builds a trie of all patterns plus "failure links" (a generalization of KMP\'s failure function across multiple patterns), letting you search for all patterns simultaneously in a single O(n + total pattern length) pass over the text.',
		useCase:
			'Lower-priority / advanced topic — essentially only comes up when a problem explicitly needs to search for many patterns at once in one pass (e.g. content filtering against a dictionary of banned words), which is rare outside specialized interviews.',
		detailedMarkdown: `
# Aho-Corasick

**Advanced / lower priority**, and arguably the most specialized topic in this list — it's the right tool only when a problem explicitly asks for **matching many patterns simultaneously** against one text. Interviewers who ask this are almost always testing whether you've seen it before, since deriving it from scratch live is a stretch.

## The Problem It Solves
Given a **set** of patterns (not just one) and a text, find all occurrences of *any* pattern in the text. Running KMP or Rabin-Karp once per pattern costs O(k * (n + m)) for k patterns — Aho-Corasick does it all in one pass: **O(n + total length of all patterns)**.

## The Idea
1. **Build a trie** of all the patterns — shared prefixes across patterns share trie nodes.
2. **Add failure links** — for each trie node, a failure link points to the longest proper suffix of the current path that is also a prefix of *some* pattern in the trie. This is the direct multi-pattern generalization of KMP's single-pattern failure function.
3. **Walk the text once**, following trie edges when possible; on a "no such edge" mismatch, follow the failure link (instead of restarting from the trie root) and try again — exactly as KMP falls back using its \\\`lps\\\` array, but now falling back across a whole set of patterns at once.
4. Some trie nodes are marked as "pattern ends" (or link further via **output links** to other patterns that end at the same point, e.g. if "he" and "she" both end at the same trie position) — whenever the walk passes through one, report a match.

## High-Level Structure
\\\`\\\`\\\`text
build trie of all patterns
for each node in BFS order from the root:
    compute node.fail = the trie node reached by taking the longest
        proper suffix of this node's path that also exists as a prefix
        in the trie (found via the parent's failure link, similar to KMP)
    node.output |= node.fail.output   // inherit matches ending via the fail link

search(text):
    node = root
    for i, ch in enumerate(text):
        while node has no edge for ch and node != root:
            node = node.fail
        if node has an edge for ch:
            node = node.child[ch]
        for pattern in node.output:
            report match of pattern ending at i
\\\`\\\`\\\`

## Complexity
- **Build (trie + failure links):** O(total length of all patterns).
- **Search:** O(n + number of matches reported).
- Compare to running KMP/Rabin-Karp once per pattern: O(k * (n + m)) for k patterns — Aho-Corasick removes the factor of k.

## Practical Takeaway
The signal for this topic is unambiguous: "search for many patterns at once" (spam-word filtering, intrusion-detection signature matching, DNA motif search against a library of motifs). If a problem only involves one pattern, KMP or Rabin-Karp is the right (simpler) tool — Aho-Corasick's extra machinery (trie + failure links + output links) only pays off once there are multiple patterns to match in a single pass.
	`
	},

	"Tarjan's Algorithm": {
		definition:
			'Tarjan\'s algorithm finds all strongly connected components (SCCs) of a directed graph in a single DFS pass, using discovery-time and low-link values to detect when a subtree of the DFS tree forms a complete SCC.',
		useCase:
			'Lower-priority / advanced topic — SCC-finding shows up mainly in graph-heavy interviews (some infra/systems teams, competitive-programming-style rounds) for problems like detecting cyclic dependency clusters or condensing a graph before further processing.',
		detailedMarkdown: `
# Tarjan's Algorithm

**Advanced / lower priority** relative to basic graph traversal (BFS/DFS, topological sort) — most interviews stop at "detect a cycle" or "topological sort," and reserve full SCC-finding for graph-specialized rounds.

## The Problem It Solves
A **strongly connected component (SCC)** is a maximal set of vertices where every vertex can reach every other vertex via directed edges. Tarjan's algorithm finds *all* SCCs of a directed graph in **one DFS pass** — O(V + E).

## Key Values Per Node
- **disc[v]** — the DFS discovery time (order in which \\\`v\\\` was first visited).
- **low[v]** — the smallest discovery time reachable from \\\`v\\\`'s DFS subtree, including via at most one back-edge to an ancestor still on the current DFS stack.

A node \\\`v\\\` is the **root of an SCC** exactly when \\\`low[v] == disc[v]\\\` — meaning nothing in its subtree can reach back further than \\\`v\\\` itself, so \\\`v\\\` and everything above it on the stack (down to \\\`v\\\`) form one complete SCC.

## Algorithm Sketch
\\\`\\\`\\\`text
disc, low = arrays initialized to -1
stack = []       // tracks nodes on the current DFS path
onStack = set()
time = 0

dfs(u):
    disc[u] = low[u] = time++
    stack.push(u); onStack.add(u)

    for each neighbor v of u:
        if disc[v] == -1:              // v not yet visited
            dfs(v)
            low[u] = min(low[u], low[v])
        elif v in onStack:              // back-edge to an ancestor still on the stack
            low[u] = min(low[u], disc[v])

    if low[u] == disc[u]:               // u is an SCC root
        pop nodes off stack down to and including u -> that's one SCC
        remove them from onStack
\\\`\\\`\\\`

## Complexity
O(V + E) — a single DFS pass with O(1) extra bookkeeping per node/edge.

## Related: Articulation Points and Bridges
The same discovery-time/low-link machinery, applied to an **undirected** graph, finds:
- **Articulation points** (cut vertices) — a vertex whose removal disconnects the graph.
- **Bridges** (cut edges) — an edge whose removal disconnects the graph.

Both use the same core check — whether a subtree can reach back past its parent — just applied to undirected connectivity instead of directed strong connectivity.

## Practical Takeaway
Tarjan's is a one-pass, single-DFS algorithm — its main interview cost is correctly tracking \\\`disc\\\`/\\\`low\\\`/the explicit stack. If that bookkeeping feels error-prone under pressure, **Kosaraju's algorithm** (below) trades a single intricate pass for two simple ones — know both exist so you can pick whichever you can implement more reliably live.
	`
	},

	"Kosaraju's Algorithm": {
		definition:
			'Kosaraju\'s algorithm finds strongly connected components by running DFS once to record a finishing-order stack, reversing every edge in the graph, then running DFS again in that finishing order on the reversed graph — each resulting DFS tree is exactly one SCC.',
		useCase:
			'Lower-priority / advanced topic, same tier as Tarjan\'s — reach for this when SCC-finding comes up but you\'d rather implement two simple DFS passes than track discovery-time/low-link values in one intricate pass.',
		detailedMarkdown: `
# Kosaraju's Algorithm

**Advanced / lower priority**, and it solves the exact same problem as Tarjan's Algorithm above: finding strongly connected components (SCCs) in a directed graph. It's worth knowing as an alternative because its two passes are each individually simpler to reason about than Tarjan's single low-link pass.

## The Idea, in Three Steps
1. **First DFS pass** on the original graph: whenever a DFS call finishes (post-order), push that vertex onto a stack. After visiting every vertex, the stack holds vertices in order of **decreasing finish time**.
2. **Reverse every edge** in the graph (build the "transpose" graph, \\\`G^T\\\`).
3. **Second DFS pass**, popping vertices off the stack (i.e. processing in decreasing finish-time order) and running DFS on \\\`G^T\\\` from each unvisited popped vertex. **Each DFS tree produced in this second pass is exactly one SCC.**

## Why It Works (Intuition)
Processing vertices in decreasing finish-time order guarantees you always start the next DFS from a vertex that belongs to an SCC with no incoming edges from any not-yet-processed SCC (in the condensed "SCC DAG"). Reversing the graph then means that DFS can only spread within that one SCC — it can't accidentally leak into a different SCC, because doing so would require an edge that, before reversal, pointed the wrong way in finish-time order.

## Algorithm Sketch
\\\`\\\`\\\`text
# Pass 1: record finish order on the original graph
visited = set()
finishStack = []

dfs1(u):
    visited.add(u)
    for v in graph[u]:
        if v not in visited: dfs1(v)
    finishStack.push(u)         // post-order: push AFTER exploring all neighbors

for each vertex u:
    if u not in visited: dfs1(u)

# Build the reversed graph
reversedGraph = reverse all edges in graph

# Pass 2: DFS on the reversed graph, in decreasing finish-time order
visited.clear()
sccs = []

while finishStack not empty:
    u = finishStack.pop()
    if u not in visited:
        component = []
        dfs2(u, reversedGraph, visited, component)   // collects everything reachable
        sccs.append(component)
\\\`\\\`\\\`

## Complexity
O(V + E) — two DFS passes plus building the reversed graph, all linear.

## Kosaraju's vs Tarjan's
| | Kosaraju's | Tarjan's |
|---|---|---|
| Number of passes | Two full DFS passes (+ building the transpose graph) | One DFS pass |
| Per-node bookkeeping | Simple (just visited flags, a stack) | Trickier (disc, low, an explicit "on stack" set) |
| Extra graph structure needed | Yes — the reversed graph | No |
| Conceptually | Easier to explain and prove correct | More elegant, but more state to track correctly |

## Practical Takeaway
Both algorithms find the same SCCs in the same O(V + E) time — the choice is about which mental model (and code) you find easier to produce reliably in an interview: Kosaraju's "two clean passes" versus Tarjan's "one pass, more bookkeeping."
	`
	},

	'Heavy-Light Decomposition': {
		definition:
			'Heavy-light decomposition splits a tree into a small number of vertical chains (each edge classified "heavy" or "light" by subtree size) so that any path between two nodes crosses at most O(log n) chains, letting path queries be answered in O(log² n) by combining with a segment tree over each chain.',
		useCase:
			'Advanced / low priority — this is a genuinely advanced, competitive-programming-tier technique, expected mainly at quant firms or infra teams doing algorithm-heavy interviews for tree path-query problems (e.g. "sum of values on the path between node u and node v," with updates).',
		detailedMarkdown: `
# Heavy-Light Decomposition

**Genuinely advanced — keep this conceptual.** It is rarely, if ever, expected to be implemented from scratch live in an interview; the value is in recognizing the problem shape and being able to describe the technique at a high level.

## The Problem It Solves
On a tree, you want to answer queries like "what's the sum/max of node values along the path from \\\`u\\\` to \\\`v\\\`?" — possibly with updates to individual node values — repeatedly. A naive walk up the tree per query is O(n) in the worst case (a long, skinny tree). Heavy-Light Decomposition (HLD) gets this down to **O(log² n)** per query.

## The Core Idea
1. For every node, classify its edge to its **largest child** (by subtree size) as a **heavy edge**; all other child edges are **light edges**.
2. Heavy edges chain together into **heavy paths (chains)** — a node has at most one heavy child, so following heavy edges traces out long vertical chains through the tree.
3. Any path from the root to any node crosses **at most O(log n) light edges** (because every time you take a light edge, the subtree size at least halves) — so it also touches at most O(log n) distinct chains.
4. Build a **segment tree over each chain** (flattening each chain into a contiguous array range). A path query between \\\`u\\\` and \\\`v\\\` is answered by walking up from \\\`u\\\` and from \\\`v\\\` toward their LCA, one chain at a time, doing an O(log n) segment-tree range query on each chain crossed — since there are O(log n) chains and each query is O(log n), the total is **O(log² n)**.

## Why It's Rarely Coded Live
A working HLD implementation needs: subtree-size computation, heavy-child selection, chain-head assignment, an array flattening step (mapping each node to a segment-tree index), and the segment tree itself — realistically 50-100+ lines. Interviews that touch this topic are almost always checking whether you can **describe the idea and its complexity**, not reproduce the full implementation on a whiteboard.

## Practical Takeaway
The signal for HLD: **"tree path queries with updates, needing better than O(n) per query."** If you recognize that shape and can explain "decompose into chains, segment-tree each chain, a path crosses O(log n) chains" you've demonstrated the useful part of this knowledge for almost any interview that brings it up at all.
	`
	},

	'Euler Tour': {
		definition:
			'An Euler tour flattens a tree into a flat array by recording each node\'s entry and exit time during a DFS, converting subtree queries into contiguous range queries and enabling O(1) LCA lookups via a sparse table in some formulations.',
		useCase:
			'Advanced / low priority — a technique that mostly shows up combined with Segment Tree or Fenwick Tree topics above, for problems needing subtree-aggregate queries with updates, or O(1) LCA after preprocessing.',
		detailedMarkdown: `
# Euler Tour

**Advanced — keep this conceptual, with a light code sketch.** The core trick (turn a tree problem into an array/range problem) is genuinely elegant and worth recognizing, even if a full "Euler tour + segment tree" solution is rare to build end-to-end live.

## The Idea
Run a DFS over the tree and record two timestamps per node:
- **tin[v]** — the time (an incrementing counter) when the DFS first enters \\\`v\\\`.
- **tout[v]** — the time when the DFS finishes exploring \\\`v\\\` (leaves it for the last time).

\\\`\\\`\\\`text
timer = 0
eulerOrder = []          // records node ids as we enter/leave

dfs(u, parent):
    tin[u] = timer++
    eulerOrder.append(u)
    for v in children[u]:
        if v != parent:
            dfs(v, u)
            eulerOrder.append(u)   // (only needed for the LCA-via-sparse-table variant)
    tout[u] = timer++
\\\`\\\`\\\`

## Why This Helps: Subtree Queries Become Range Queries
A key fact falls out immediately: **node \\\`v\\\` is in the subtree of node \\\`u\\\` if and only if \\\`tin[u] <= tin[v] < tout[u]\\\`.** That means "the subtree rooted at \\\`u\\\`" corresponds exactly to the contiguous range \\\`[tin[u], tout[u])\\\` once nodes are laid out by \\\`tin\\\` order in an array. So:
- "Sum/max of all values in the subtree of \\\`u\\\`" becomes a **range query** \\\`[tin[u], tout[u])\\\` — answerable with a **Segment Tree** or **Fenwick Tree** in O(log n), even with point updates to individual node values.

## Euler Tour + Sparse Table for O(1) LCA
A different (longer) Euler tour formulation — recording a node every time the DFS visits *or returns to* it (so a node with \\\`k\\\` children appears \\\`k+1\\\` times) — lets you reduce **LCA(u, v)** to a **range-minimum-query** on node depths between \\\`u\\\`'s and \\\`v\\\`'s first occurrences in that tour. Precomputing that RMQ with a **sparse table** answers any LCA query in O(1) after O(n log n) preprocessing — the fastest known LCA scheme, at the cost of a more involved setup.

## Complexity
- **Computing tin/tout (or the full Euler order):** O(n), one DFS.
- **Subtree query after that (via segment tree over the tin-ordered array):** O(log n).
- **LCA via sparse table (after O(n log n) preprocessing):** O(1) per query.

## Practical Takeaway
The one idea to keep: **DFS entry/exit times let you answer "is this whole subtree affected?" with plain array range logic** — which is exactly why Euler Tour so often appears paired with a Segment Tree or Fenwick Tree in problems about aggregating values over subtrees with updates.
	`
	},

	'Centroid Decomposition': {
		definition:
			'Centroid decomposition recursively finds the centroid of a tree (a node whose removal splits it into pieces each of size at most n/2) and recurses on each resulting piece, producing a decomposition of depth O(log n) used for efficient path-counting and path-query problems on trees.',
		useCase:
			'Advanced / low priority — a genuinely competitive-programming-tier technique, mostly seen at quant firms or algorithm-heavy specialized rounds for problems like "count pairs of nodes whose path length equals k" on a tree.',
		detailedMarkdown: `
# Centroid Decomposition

**Genuinely advanced — keep this conceptual, with a short code sketch of centroid-finding.** This is squarely a competitive-programming technique; treat recognizing the problem shape as the realistic goal rather than a full working implementation under interview time pressure.

## The Problem It Solves
Many tree problems ask you to count or aggregate something over **all pairs of paths** in a tree — e.g. "how many pairs of nodes have a path of exactly length k?" A naive approach checks all O(n²) pairs (or does an O(n) DFS from every node, also O(n²) total). Centroid decomposition brings this down to roughly **O(n log n)**.

## What a Centroid Is
A **centroid** of a tree with \\\`n\\\` nodes is a node whose removal splits the tree into disconnected pieces, **each of size at most n/2**. Every tree has at least one centroid (sometimes two, if the tree splits perfectly in half), and one can always be found in O(n).

## Finding the Centroid
\\\`\\\`\\\`text
computeSubtreeSizes(u, parent):
    size[u] = 1
    for v in children[u]:
        if v != parent:
            size[u] += computeSubtreeSizes(v, u)
    return size[u]

findCentroid(u, parent, treeSize):
    for v in children[u]:
        if v != parent and size[v] > treeSize / 2:
            return findCentroid(v, u, treeSize)   // the heavy side must contain the centroid
    return u                                       // no child subtree exceeds n/2 -> u is it
\\\`\\\`\\\`

## The Decomposition
1. Find the centroid \\\`c\\\` of the current tree/piece.
2. Process all paths that pass **through \\\`c\\\`** (this is where the problem-specific logic lives — e.g. for "count pairs at distance k," gather distances from \\\`c\\\` to every other node in its current piece and combine them).
3. Remove \\\`c\\\`, splitting the tree into several smaller pieces (each guaranteed ≤ n/2 the size of the current piece).
4. **Recurse** on each piece independently, finding a new centroid for each.

Because each recursive piece is at most half the size of its parent piece, the recursion depth is **O(log n)** — this bounded depth is the entire reason the technique is efficient: work done "per level" is typically O(n), and there are O(log n) levels, giving O(n log n) total.

## Complexity
- **Finding one centroid:** O(size of current piece).
- **Total across the whole decomposition:** O(n log n), since sizes halve each level and there are O(log n) levels.

## Practical Takeaway
The signal for this topic: **"count/aggregate something over all pairs of paths in a tree,"** especially phrased around path length or a path-sum condition. The one idea worth retaining: recursively peel off a centroid (guaranteed to halve the remaining problem size), handle everything passing through it, and recurse on the leftover pieces — a divide-and-conquer strategy applied to trees instead of arrays.
	`
	}
};
