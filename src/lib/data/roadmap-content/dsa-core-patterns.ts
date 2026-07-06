import type { RoadmapDetailMap } from './types';

export const DsaCorePatternsContent: RoadmapDetailMap = {
	'Arrays & Hashing': {
		definition:
			"The foundational pattern of using a hash map/set alongside a single array pass to trade O(n) extra space for turning an O(n²) nested-loop lookup into O(n) — the building block most other patterns specialize.",
		useCase:
			'Solving "Two Sum" in O(n) by storing each number\'s index in a hash map while scanning once, instead of checking every pair with a nested loop.',
		detailedMarkdown: `
# Arrays & Hashing

## The Problem It Solves
A huge fraction of interview problems reduce to: "for each element, do I need to know something about OTHER elements I've seen (or will see)?" The brute-force answer is a nested loop — for each element, scan the rest of the array to check some condition — which costs O(n²). Arrays & Hashing is the pattern of trading that nested loop for a single pass plus a hash map/set that remembers what's already been seen, turning O(n²) into O(n) at the cost of O(n) extra space.

## The Pattern
As you iterate through the array once:
1. Check the hash map/set for whatever fact you need about previously-seen elements (e.g., "have I seen the complement of this number?", "how many times has this value appeared?").
2. Update the hash map/set with the current element before moving on.

This works because a hash map gives O(1) average-case lookup and insert — so instead of re-scanning the array to answer "has X appeared?", you ask the hash map, which already "remembers" in constant time.

## Code Example (TypeScript) — Two Sum
\`\`\`typescript
function twoSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>(); // value -> index

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement)!, i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

// twoSum([2, 7, 11, 15], 9) -> [0, 1]  (2 + 7 = 9)
\`\`\`
Notice the complement check happens BEFORE inserting the current element — this correctly avoids using the same element twice while still handling duplicate values correctly (e.g. target = 6, nums = [3, 3]).

## Complexity
- **Time:** O(n) — a single pass, with O(1) average-case map operations.
- **Space:** O(n) for the hash map in the worst case (every element distinct).

## Signals This Pattern Applies
- You find yourself wanting to write a nested loop to check "does some other element satisfy X?"
- The problem involves counting frequencies, checking for duplicates, or finding complements/pairs.
- You need O(1) lookups by value rather than by index, which a plain array can't give you.

## Common Pitfalls
- Checking membership AFTER inserting the current element, which can incorrectly match an element against itself.
- Using a hash map when the requirement is order-sensitive (e.g., "first pair in left-to-right order") — a hash map doesn't preserve numeric/positional order, so indices must be tracked explicitly, as in the Two Sum example above.
- Reaching for a nested loop out of habit when a single pass with a map would do — this is the single most common "missed O(n) solution" in easy/medium interview problems.

## Interview Angle
This is usually the first thing to consider when a brute force is O(n²): "can I remember what I've seen so far in a hash map, and turn the inner loop into an O(1) lookup?" It's also the pattern most others build on: Sliding Window's frequency maps, Prefix Sum's running-sum maps, and Graph traversal's visited sets are all specialized hash-based bookkeeping over this same core idea.
		`
	},
	'Sliding Window': {
		definition:
			'A technique for turning nested-loop problems over a contiguous subarray/substring into a single pass by expanding and shrinking a moving window, avoiding recomputation of overlapping work.',
		useCase:
			'Finding the length of the longest substring without repeating characters, or the smallest subarray with a sum >= target, in O(n) instead of the naive O(n²) brute force.',
		detailedMarkdown: `
# Sliding Window

## The Problem It Solves
Many problems ask for something about every contiguous subarray/substring of an array or string — "longest substring with no repeats," "smallest subarray with sum ≥ target," "max sum of any k-length window." The brute-force approach checks every possible window with two nested loops (O(n²) or worse), recomputing the sum/count for a window that mostly overlaps with the one before it.

## The Pattern
Instead of recomputing from scratch, maintain a window defined by two pointers, \`left\` and \`right\`. Expand \`right\` one step at a time, incrementally updating your running state (sum, count, frequency map). When the window becomes invalid (or you're looking for the minimum), shrink from \`left\` until it's valid again. Every element enters and leaves the window at most once, so the total work is O(n) even though it "looks like" a nested loop.

Two flavors:
- **Fixed-size window** (e.g. "max sum of any window of size k"): \`right\` and \`left\` move together, keeping the window size constant.
- **Variable-size window** (e.g. "smallest subarray with sum ≥ target"): \`right\` always expands; \`left\` only shrinks when a condition is met, so the window size changes dynamically.

## Code Example (TypeScript) — Longest Substring Without Repeating Characters
\`\`\`typescript
function lengthOfLongestSubstring(s: string): number {
    const lastSeen = new Map<string, number>(); // char -> most recent index
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        const c = s[right];
        if (lastSeen.has(c) && lastSeen.get(c)! >= left) {
            left = lastSeen.get(c)! + 1;
        }
        lastSeen.set(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}

// "abcabcbb" -> 3 ("abc")
// "bbbbb"    -> 1 ("b")
\`\`\`

## Complexity
- **Time:** O(n) — each character is visited by \`right\` once, and \`left\` only ever moves forward, never backward, so it also advances at most n times total.
- **Space:** O(min(n, alphabet size)) for the \`lastSeen\` map.

## Signals This Pattern Applies
- The problem mentions a **contiguous** subarray or substring (not "any subset").
- You're asked for the longest/shortest/max/min window satisfying some condition.
- A brute force would recompute overlapping work for every window — that's the tell that there's an O(n) sliding-window solution hiding underneath.

## Common Pitfalls
- **Off-by-one on window size:** for fixed-size windows, the size is \`right - left + 1\` — a frequent source of bugs is forgetting the \`+ 1\`.
- **Shrinking in an \`if\` instead of a \`while\`:** for "smallest window satisfying X," you must shrink \`left\` in a loop as long as the condition still holds, or you'll miss shrinking multiple times when possible.
- **Confusing Sliding Window with Two Pointers:** related, but Two Pointers often means pointers moving from *opposite ends* toward each other on a sorted array, while Sliding Window pointers move in the *same direction*.

## Interview Angle
A strong answer names the invariant being maintained in the window (e.g., "at most one repeated character") before writing any code — that's usually the actual hard part, not the pointer mechanics.
		`
	},

	'Two Pointers': {
		definition:
			'A technique using two indices that move through a data structure — typically from opposite ends toward each other, or at different speeds — to avoid nested loops when the data has exploitable structure (usually sortedness).',
		useCase:
			'Finding a pair in a sorted array that sums to a target, or finding the container that holds the most water, in O(n) instead of O(n²).',
		detailedMarkdown: `
# Two Pointers

## The Problem It Solves
Given a sorted array (or one you can sort), problems that ask "does some pair/triplet satisfy a condition" naively invite an O(n²) or O(n³) all-pairs check. Sortedness gives you information about which direction to move to increase or decrease a computed value — Two Pointers exploits that information to eliminate whole ranges of candidates per step instead of checking them one at a time.

## The Pattern
Place one pointer at each end of the array, \`left = 0\` and \`right = n - 1\`. Compute something from both elements (a sum, an area). If the result is too small, moving \`right\` inward can only ever make it smaller or equal in the "sum" case — so you move \`left\` forward instead (the pointer whose movement can plausibly help). If it's too large, move \`right\` inward. Each comparison eliminates one pointer's current position from consideration entirely, giving O(n) total work instead of O(n²).

This is fundamentally different from Sliding Window: **Two Pointers pointers typically move toward each other from opposite ends** of already-sorted (or structurally ordered) data, deciding which single pointer to move based on a comparison. **Sliding Window pointers move in the same direction**, both sweeping left-to-right, maintaining a contiguous range rather than converging. If you find yourself maintaining a window's contents (a running sum, a frequency map of "what's currently inside"), that's Sliding Window; if you're narrowing in from both ends based on a sorted-order comparison, that's Two Pointers.

## Code Example (TypeScript) — Two Sum on a Sorted Array
\`\`\`typescript
function twoSumSorted(nums: number[], target: number): [number, number] | null {
    let left = 0;
    let right = nums.length - 1;

    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;   // sum too small -> only increasing the smaller side can help
        } else {
            right--;  // sum too large -> only decreasing the larger side can help
        }
    }
    return null;
}

// [2, 7, 11, 15], target = 9 -> [0, 1]  (2 + 7)
\`\`\`

## Code Example (TypeScript) — Container With Most Water
\`\`\`typescript
function maxArea(height: number[]): number {
    let left = 0;
    let right = height.length - 1;
    let best = 0;

    while (left < right) {
        const width = right - left;
        const boundedHeight = Math.min(height[left], height[right]);
        best = Math.max(best, width * boundedHeight);

        // The shorter wall is the bottleneck; moving it is the only move
        // that could possibly increase the area, since width only shrinks.
        if (height[left] < height[right]) left++;
        else right--;
    }
    return best;
}
\`\`\`

## Complexity
- **Time:** O(n) for both examples — each pointer moves at most n times total, and they never move backward.
- **Space:** O(1) — no extra data structures needed.

## Signals This Pattern Applies
- The array is **sorted**, or sortedness would make the problem easy (and sorting first is affordable, O(n log n)).
- You're looking for a pair/triplet satisfying a sum, product, or comparison condition.
- The brute force is checking all \`(i, j)\` pairs, and there's a monotonic relationship you can exploit (increasing one index increases the computed value, decreasing the other decreases it).

## Common Pitfalls
- **Applying it to unsorted data without sorting first** — the "which pointer to move" logic only works because of the ordering guarantee.
- **Using \`<=\` vs \`<\` in the loop condition** — for pair problems you generally want \`left < right\` so you never reuse the same element as both parts of the pair.
- **Skipping duplicates incorrectly** in problems like 3Sum, leading to duplicate result sets — after finding a match, advance past all equal values before continuing.

## Interview Angle
When asked to optimize an O(n²) pair-search, immediately check "is this sorted, or can I sort it for free relative to the rest of the complexity budget?" — that question is what unlocks Two Pointers, and saying it out loud shows the interviewer you're pattern-matching, not guessing.
		`
	},

	'Prefix Sum': {
		definition:
			'A preprocessing technique that builds a running-total array so that the sum of any range [i, j] can be answered in O(1) after O(n) setup, instead of re-summing the range each time.',
		useCase:
			'Answering many "sum of elements from index i to j" queries efficiently, or finding the number of subarrays whose sum equals K using a running-sum-to-count hashmap.',
		detailedMarkdown: `
# Prefix Sum

## The Problem It Solves
If you need to answer many range-sum queries ("what's the sum from index i to j?") on a static array, recomputing each sum by iterating the range is O(n) per query — O(n·q) for q queries. Prefix Sum trades a single O(n) preprocessing pass for O(1) answers to any range-sum query afterward.

## The Pattern
Build an array \`prefix\` where \`prefix[i]\` holds the sum of all elements from index 0 up to i-1 (a common convention uses length n+1 with \`prefix[0] = 0\` as a sentinel, so \`prefix[i]\` = sum of the first i elements). The sum of the range \`[i, j]\` (inclusive) is then just \`prefix[j+1] - prefix[i]\` — subtracting away everything before the range leaves exactly the range's total.

The same running-sum idea extends beyond arrays of numbers you literally sum: when a problem asks about subarrays satisfying a sum condition, you can track the running prefix sum as you scan once, and store *how many times each prefix-sum value has been seen* in a hashmap. This turns "count subarrays with sum = K" into an O(n) single pass instead of checking every subarray.

## Code Example (TypeScript) — Range Sum Query
\`\`\`typescript
class RangeSumQuery {
    private prefix: number[];

    constructor(nums: number[]) {
        this.prefix = new Array(nums.length + 1).fill(0);
        for (let i = 0; i < nums.length; i++) {
            this.prefix[i + 1] = this.prefix[i] + nums[i];
        }
    }

    // Inclusive range [left, right]
    sumRange(left: number, right: number): number {
        return this.prefix[right + 1] - this.prefix[left];
    }
}

// nums = [-2, 0, 3, -5, 2, -1]
// sumRange(0, 2) -> -2 + 0 + 3 = 1
\`\`\`

## Code Example (TypeScript) — Subarray Sum Equals K
\`\`\`typescript
function subarraySum(nums: number[], k: number): number {
    // Maps a prefix-sum value seen so far -> how many times it's occurred.
    const seenCount = new Map<number, number>([[0, 1]]); // empty prefix counts once
    let runningSum = 0;
    let count = 0;

    for (const n of nums) {
        runningSum += n;
        // If (runningSum - k) has been seen before, the subarray between
        // that earlier point and here sums to exactly k.
        count += seenCount.get(runningSum - k) ?? 0;
        seenCount.set(runningSum, (seenCount.get(runningSum) ?? 0) + 1);
    }
    return count;
}

// [1, 1, 1], k = 2 -> 2  (subarrays [1,1] at indices [0,1] and [1,2])
\`\`\`

## Complexity
- **Range Sum Query:** O(n) preprocessing, O(1) per query, O(n) space.
- **Subarray Sum Equals K:** O(n) time (single pass), O(n) space for the hashmap.

## Signals This Pattern Applies
- The problem involves **repeated range-sum queries** on data that doesn't change between queries.
- The problem asks to **count or find subarrays** matching a sum condition — the "prefix sum + hashmap" combo is the single most common way this shows up.
- Keywords like "cumulative," "running total," or "range between indices."

## Common Pitfalls
- **Off-by-one on the sentinel index:** using a 0-indexed \`prefix[i]\` = sum through index i (inclusive) vs. the n+1-length convention above changes every formula — pick one convention and be consistent.
- **Forgetting to seed the hashmap with \`{0: 1}\`** in the subarray-count variant — without it, subarrays that start at index 0 and happen to sum to exactly k are silently missed.
- **Mutating the underlying array between queries** without rebuilding the prefix array — prefix sums are only valid for static data (or require a Fenwick tree / segment tree if updates are needed).

## Interview Angle
If the interviewer says "you'll be asked this many times" or "for every subarray," that's usually the cue to precompute a running total once rather than re-scanning ranges — naming "prefix sum" explicitly and explaining the \`prefix[j+1] - prefix[i]\` trick shows you recognize the reusable-computation shape of the problem.
		`
	},

	'Difference Array': {
		definition:
			'A technique that represents an array via its consecutive differences so that a range-increment update becomes a fixed O(1) operation at the two range endpoints, with actual values recovered later via a single prefix-sum pass.',
		useCase:
			'Applying many "add value v to every element in range [i, j]" operations efficiently, then recovering the final array with one prefix sum, instead of looping over each range on every update.',
		detailedMarkdown: `
# Difference Array

## The Problem It Solves
Suppose you have an array and need to apply many range-update operations like "add 5 to every element from index 2 to 6," "add -3 from index 0 to 3," and so on — then report the final array after all updates. Naively applying each update by looping over its range costs O(range length) per update, which is O(n) worst case per update and O(n·q) total for q updates. If updates vastly outnumber the final read, that's wasteful.

## The Pattern
A Difference Array is the "inverse" of Prefix Sum: instead of storing running totals, you store the *difference* between consecutive elements, \`diff[i] = arr[i] - arr[i-1]\`. The reason this is useful: incrementing every element in range \`[i, j]\` by \`v\` only changes **two** entries of the difference array — \`diff[i] += v\` (the increase starts here) and \`diff[j+1] -= v\` (the increase stops here, so it must be cancelled for everything after). That turns an O(range) update into O(1).

Once every update has been applied this way, a single prefix-sum pass over the difference array reconstructs the final array: \`arr[i] = diff[0] + diff[1] + ... + diff[i]\`. This is why the two patterns are conceptually paired — Prefix Sum answers "what's the total over a range," Difference Array answers "how do I apply a change to a whole range cheaply," and running a prefix sum over a difference array is exactly how you materialize the final values.

## Code Example (TypeScript) — Range Increment Updates
\`\`\`typescript
function applyRangeUpdates(
    n: number,
    updates: [start: number, end: number, value: number][]
): number[] {
    const diff = new Array(n + 1).fill(0);

    // Each update is O(1): mark where the increase starts and where it stops.
    for (const [start, end, value] of updates) {
        diff[start] += value;
        diff[end + 1] -= value; // end is inclusive, so cancel right after it
    }

    // Reconstruct final values with a single prefix-sum pass.
    const result = new Array(n).fill(0);
    let running = 0;
    for (let i = 0; i < n; i++) {
        running += diff[i];
        result[i] = running;
    }
    return result;
}

// n = 5, updates = [[1, 3, 2], [2, 4, 3]]
// diff after updates: index 1 +=2, index 4 -=2, index 2 +=3, index 5 -=3
// result -> [0, 2, 5, 5, 3]
\`\`\`

## Complexity
- **Time:** O(n + q) total — O(1) per update (q updates), plus one O(n) reconstruction pass at the end. Compare to O(n·q) for naive range updates.
- **Space:** O(n) for the difference array.

## Signals This Pattern Applies
- The problem describes **many range-update operations** ("add v to every element from i to j") applied before a single final read of the array.
- Keywords like "bookings," "flight seat allocation over date ranges," "range increment," or "apply k operations, then report the result."
- You only need the final state after *all* updates — not the intermediate state after each one (if you need intermediate states too, you likely need a Fenwick/segment tree instead).

## Common Pitfalls
- **Forgetting the cancellation at \`end + 1\`** — without it, the increase never stops and bleeds into all subsequent indices.
- **Off-by-one when the range is exclusive vs. inclusive** — clarify whether \`end\` is inclusive before deciding whether to cancel at \`end + 1\` or \`end\`.
- **Array bounds when \`end + 1 === n\`** — the difference array is sized \`n + 1\` specifically so this cancellation index always has a valid slot.
- **Trying to query a partial range mid-updates** — a difference array only gives you the correct picture *after all updates are applied and the prefix sum is taken*; it doesn't support interleaved "update, then query, then update" efficiently.

## Interview Angle
The giveaway phrase is "you're given a list of range updates to apply" — if you catch yourself about to write a loop *inside* a loop over updates, stop and ask whether you actually need every intermediate state or just the final array; if it's just the final array, Difference Array turns an O(n·q) solution into O(n + q) with a two-line change per update.
		`
	},

	'Binary Search': {
		definition:
			'A divide-and-conquer search over a sorted (monotonic) sequence that halves the remaining search space each step by comparing the middle element against the target, achieving O(log n) instead of O(n) linear scanning.',
		useCase:
			'Finding whether a target exists in a sorted array, or finding the first/last index at which a value occurs, in O(log n).',
		detailedMarkdown: `
# Binary Search

## The Problem It Solves
Searching a sorted array linearly is O(n). Because the array is sorted, though, a single comparison at the midpoint tells you which half the target could possibly be in — the other half can be discarded entirely without looking at it. Repeating that halving gives O(log n).

## The Mental Model: Invariant Shrinking
Think of Binary Search as maintaining an invariant over a search range \`[lo, hi]\`: "if the answer exists, it's somewhere in this range." Every iteration:
1. Compute \`mid\` (careful — see pitfalls below).
2. Compare \`arr[mid]\` to the target.
3. Decide which pointer to move so the invariant still holds, and the range strictly shrinks.

For exact-match search:
- \`arr[mid] === target\` → found, return \`mid\`.
- \`arr[mid] < target\` → the target (if present) must be to the right, so \`lo = mid + 1\`.
- \`arr[mid] > target\` → the target (if present) must be to the left, so \`hi = mid - 1\`.
- Loop while \`lo <= hi\`; if it exits without finding the target, it doesn't exist.

For "first occurrence" / "last occurrence" variants, you don't stop at the first match — you keep searching in the direction that could yield an *earlier* (or *later*) match, recording the best candidate seen so far.

## Code Example (TypeScript) — Exact Match + First Occurrence
\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
    let lo = 0;
    let hi = arr.length - 1;

    while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2); // avoids overflow, same as (lo+hi)/2 in JS
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; // not found
}

function firstOccurrence(arr: number[], target: number): number {
    let lo = 0;
    let hi = arr.length - 1;
    let result = -1;

    while (lo <= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (arr[mid] === target) {
            result = mid;   // record it, but keep searching left for an earlier one
            hi = mid - 1;
        } else if (arr[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return result;
}

// [1, 2, 2, 2, 3, 4], target = 2 -> firstOccurrence returns index 1
\`\`\`

## Complexity
- **Time:** O(log n) — the search range halves every iteration.
- **Space:** O(1) iterative (O(log n) if written recursively, due to call stack).

## Signals This Pattern Applies
- The data is **sorted**, or has a monotonic property (see "Binary Search on Answer" for when the data itself isn't sorted but a decision function is monotonic).
- You need better than O(n) and a linear scan is the naive approach.
- Keywords like "sorted array," "find first/last position," "find insertion point."

## Common Pitfalls (the classic infinite-loop bugs)
- **\`mid = (lo + hi) / 2\` overflow** — not usually an issue in JS numbers, but the habit of writing \`lo + (hi - lo) / 2\` is worth keeping since it transfers directly to languages with fixed-width integers.
- **Using \`hi = mid\` instead of \`hi = mid - 1\`** (or the symmetric \`lo = mid\` instead of \`lo = mid + 1\`) when \`arr[mid]\` has already been ruled out — leaving \`mid\` itself back in range when it shouldn't be causes the loop to spin forever on a 2-element range.
- **Loop condition \`lo < hi\` vs \`lo <= hi\`** — mixing conventions from different templates is the single most common source of off-by-one bugs; pick one template (exact-match uses \`<=\`; many "find boundary" templates use \`<\` with \`hi = arr.length\`) and be rigorous about which invariant it maintains.
- **Not handling duplicates** when the problem wants a specific occurrence (first/last), not just "any" occurrence.

## Interview Angle
Interviewers often specifically probe the boundary-update lines (\`lo = mid + 1\` vs \`hi = mid\`) because that's where candidates who memorized the shape without understanding the invariant get stuck. Being able to state, in one sentence, "everything in \`[lo, hi]\` might still contain the answer, and each branch shrinks that range while preserving that guarantee" is what separates understanding from pattern-matching.
		`
	},

	'Binary Search on Answer': {
		definition:
			'A meta-pattern that applies binary search not to a sorted array, but to the space of possible *answers* to a problem, when you can cheaply check ("predicate") whether a candidate answer is feasible and that feasibility is monotonic across the answer range.',
		useCase:
			'Finding the minimum ship capacity that lets you deliver all packages within D days — you binary search over possible capacity values (not over the array), using a feasibility check as the comparison.',
		detailedMarkdown: `
# Binary Search on Answer

## How This Differs From Plain Binary Search
Plain Binary Search searches over *data that already exists and is sorted* — you're looking for where a value lives in an array. Binary Search on Answer is a different move entirely: you're not searching a data structure at all. You're searching the **range of numbers that could be the final answer** (e.g., "minimum capacity" could be anywhere from 1 to sum-of-all-weights), and at each candidate you run a **feasibility predicate** — a function that answers "is this candidate good enough?" — instead of comparing array elements.

This only works if the predicate is **monotonic** across the answer range: once a candidate capacity is "good enough" (feasible), every larger capacity is also feasible; once a candidate is "not enough," every smaller one is also infeasible. That monotonic true/false/true/false...→false/false/true/true shape is exactly what lets binary search discard half the remaining candidates per step, even though there's no array being indexed into.

## The Recognition Signal (the highest-value part of this topic)
Ask yourself two questions when a problem feels like it wants some kind of search:
1. **"Am I searching for a value in a sorted collection, or am I searching for the best number satisfying some condition?"** If it's the latter — minimum/maximum X such that Y holds — that's the tell.
2. **"If I fix a candidate answer, can I write a fast yes/no check for whether it works, and is that check monotonic as the candidate grows?"** If yes, you don't need to reason about the actual optimal value directly — you can binary search the space of candidates and let the predicate do the comparing.

Typical phrasing that signals this pattern: "minimum days to...", "maximum value such that...", "smallest X such that condition holds for all Y" — especially combined with constraints large enough that brute-force checking every candidate would be too slow, but a single feasibility check is fast (often O(n)).

## Code Example (TypeScript) — Minimum Ship Capacity Within D Days
\`\`\`typescript
function shipWithinDays(weights: number[], days: number): number {
    // The answer must be at least the heaviest single package (can't split a package),
    // and at most the sum of all weights (ship everything in one day).
    let lo = Math.max(...weights);
    let hi = weights.reduce((a, b) => a + b, 0);

    // Feasibility predicate: can we ship everything within "days" using this capacity?
    // This is monotonic: if capacity C works, any capacity > C also works.
    function canShipWithCapacity(capacity: number): boolean {
        let daysNeeded = 1;
        let currentLoad = 0;
        for (const w of weights) {
            if (currentLoad + w > capacity) {
                daysNeeded++;
                currentLoad = 0;
            }
            currentLoad += w;
        }
        return daysNeeded <= days;
    }

    while (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (canShipWithCapacity(mid)) {
            hi = mid;       // mid works -> try to do even better (smaller capacity)
        } else {
            lo = mid + 1;   // mid doesn't work -> need more capacity
        }
    }
    return lo; // lo === hi, the smallest feasible capacity
}

// weights = [1,2,3,4,5,6,7,8,9,10], days = 5 -> 15
\`\`\`

## Complexity
- **Time:** O(f(n) · log(range)) where \`f(n)\` is the cost of one predicate evaluation (here O(n)) and \`range\` is \`hi - lo\` in the answer space. Vastly better than checking every candidate capacity individually.
- **Space:** O(1) beyond the input, assuming the predicate doesn't need extra structures.

## Signals This Pattern Applies
- The question asks for a **minimum/maximum value such that some condition holds** — not "find this value in this array."
- You can write a **fast yes/no feasibility check** for a fixed candidate answer.
- That feasibility check is **monotonic**: true for all values on one side of some threshold, false on the other.
- Brute-forcing every candidate answer would be too slow, but binary searching the range and running the predicate O(log range) times is fast enough.

## Common Pitfalls
- **Forgetting to prove (at least to yourself) that the predicate is monotonic** before reaching for this pattern — if it isn't, binary search silently gives a wrong answer instead of erroring.
- **Choosing the wrong \`lo\`/\`hi\` initial bounds** — they must bracket every possible valid answer (too tight excludes the true answer; too loose just costs a few extra iterations, which is safe but worth being deliberate about).
- **Using \`lo <= hi\` with \`hi = mid\` instead of \`hi = mid - 1\`** — this template (finding a boundary, not an exact match) typically uses \`lo < hi\` with \`hi = mid\` / \`lo = mid + 1\`, which is a different convention than exact-match Binary Search; mixing the two templates causes infinite loops.
- **Off-by-one on whether the found value itself is verified feasible** — since \`hi = mid\` (not \`mid - 1\`) keeps \`mid\` in range when feasible, \`lo\` at loop end is guaranteed checked-feasible, but it's worth a final assertion in interview code.

## Interview Angle
This is one of the patterns most likely to be missed by candidates who only think of Binary Search as "search a sorted array," because there's often no array being searched at all — just a numeric range and a predicate. Explicitly saying "I can binary search the answer space because feasibility is monotonic in the capacity" is a strong signal to the interviewer that you're not pattern-matching syntax, you're recognizing structure.
		`
	},

	'Sorting Algorithms': {
		definition:
			'Arranging elements into order — often used not as the end goal but as a preprocessing step that unlocks a simpler algorithm (Two Pointers, greedy interval sweeps, deduplication) on the sorted result.',
		useCase:
			'Sorting intervals by start time before sweeping to merge overlaps, or sorting an array before applying Two Pointers — trading an O(n log n) sort for a much simpler downstream algorithm.',
		detailedMarkdown: `
# Sorting Algorithms

## The Problem It Solves
Sorting itself is a well-known problem, but in interviews it's just as often the **key enabling step** for a different pattern: many problems that look hard on unordered data become simple (often linear) once the data is sorted. Recognizing "if I sort first, this becomes a Two Pointers / greedy / interval-sweep problem" is frequently the whole trick.

## When Sorting First Simplifies a Problem
- **Merge intervals / meeting rooms:** sorting intervals by start time turns an unordered mess into a single left-to-right sweep (see the Intervals topic).
- **Two Pointers problems** (pair sums, 3Sum, container problems): the pointer-movement logic ("move the smaller side") only makes sense once order is guaranteed.
- **Deduplication / grouping equal elements:** sorted duplicates sit next to each other, so a single pass with an \`if (arr[i] === arr[i-1])\` check replaces a hashset in some cases.
- **Greedy problems** ("pick the earliest-finishing meeting," "assign the smallest sufficient resource"): greedy correctness proofs frequently depend on considering elements in sorted order.

The rule of thumb: if the problem's difficulty seems to come entirely from not knowing what order to process elements in, ask whether sorting (paying O(n log n) once) removes that difficulty.

## Comparison Sorts vs. O(n) Sorts
**Comparison-based sorts** (merge sort, quicksort, heap sort, insertion sort) work on any orderable type and have a proven lower bound of O(n log n) — you cannot do better using only pairwise comparisons, because there are n! possible orderings and each comparison yields at most 1 bit of information (log₂(n!) = O(n log n)).

**Non-comparison sorts** (counting sort, radix sort, bucket sort) sidestep that lower bound by exploiting structure in the *values themselves* rather than comparing them:
- **Counting sort:** works when values are integers in a small known range \`[0, k]\` — count occurrences of each value, then reconstruct. O(n + k).
- **Radix sort:** sorts integers (or fixed-length strings) digit by digit using a stable counting sort per digit. O(d · (n + k)) for d digits.
- **Bucket sort:** distributes elements into buckets by value range, sorts each bucket (often with insertion sort), then concatenates. O(n + k) average case when input is uniformly distributed.

These win only when the value domain is restricted enough to exploit — sorting arbitrary comparable objects (strings by custom comparator, floats, general objects) still needs a comparison sort.

## Complexity of Common Sorting Algorithms
| Algorithm | Best | Average | Worst | Space | Stable? |
|---|---|---|---|---|---|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Counting Sort | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes |
| Radix Sort | O(d(n+k)) | O(d(n+k)) | O(d(n+k)) | O(n + k) | Yes |

Quicksort's worst case (O(n²), e.g. an already-sorted array with a naive pivot choice) is why production sort implementations often use randomized pivots or switch to a different algorithm (introsort) to guarantee worst-case bounds; Merge Sort trades guaranteed O(n log n) for O(n) extra space; Heap Sort gets O(n log n) with O(1) space but isn't stable and has worse constant factors in practice.

## Code Example (TypeScript) — Sort Then Two Pointers
\`\`\`typescript
function hasPairWithSum(nums: number[], target: number): boolean {
    const sorted = [...nums].sort((a, b) => a - b); // O(n log n) — JS sort is NOT numeric by default!
    let left = 0;
    let right = sorted.length - 1;

    while (left < right) {
        const sum = sorted[left] + sorted[right];
        if (sum === target) return true;
        if (sum < target) left++;
        else right--;
    }
    return false;
}
\`\`\`

## Signals This Pattern Applies
- The problem is about pairs, intervals, or "process elements in some order" — and no order is given.
- A brute force is checking all orderings or all pairs, and sorting would expose a clear left-to-right rule.
- The value domain is small/bounded integers and O(n log n) isn't fast enough — that's the signal to reach for counting/radix/bucket sort instead of a comparison sort.

## Common Pitfalls
- **JavaScript's default \`.sort()\` is lexicographic**, not numeric — \`[10, 2, 1].sort()\` gives \`[1, 10, 2]\` unless you pass a comparator like \`(a, b) => a - b\`. This is a very common silent bug.
- **Assuming a sort is stable when it isn't** (or vice versa) — this matters when sorting by a secondary key relies on the primary sort's relative order being preserved (e.g., stable-sorting by end time, then again by start time, to get a fully valid start-then-end ordering).
- **Re-sorting unnecessarily inside a loop** — sort once outside the loop; sorting inside a loop silently turns an O(n log n) algorithm into O(n² log n).
- **Reaching for quicksort's O(n log n) average case when the worst case matters** (e.g., adversarial or already-sorted input in a system you don't control) — merge sort or heap sort guarantee the worst case.

## Interview Angle
When you propose sorting as a first step, say explicitly what property the sort gives you ("once sorted by start time, any two intervals either overlap or the sweep has fully passed the first one") — that one sentence proves you're using sorting as a deliberate transformation, not a reflexive habit.
		`
	},

	Intervals: {
		definition:
			'A family of problems over ranges [start, end] where the standard technique is to sort by start time and then sweep left to right, tracking overlap state as you go, instead of comparing every pair of intervals.',
		useCase:
			'Merging all overlapping intervals into their union, inserting a new interval into an already-sorted non-overlapping set, or determining the minimum number of meeting rooms needed to host all given meetings.',
		detailedMarkdown: `
# Intervals

## The Problem It Solves
Problems that give you a set of ranges (\`[start, end]\` pairs) — meetings, bookings, events — and ask you to merge, insert, or count overlaps have an obvious brute force: compare every interval against every other interval, O(n²). But once intervals are sorted by start time, whether two intervals overlap only ever depends on the current one and the most recently processed one(s) — never on intervals further back. That's what unlocks a single O(n log n) (dominated by the sort) sweep.

## The Core Technique: Sort by Start, Then Sweep
1. **Sort intervals by start time.** This is the step that makes everything else simple: once sorted, if interval \`i\` doesn't overlap the current merged range, no interval after \`i\` can either "go back" and overlap it — overlap only needs to be checked against what's immediately in progress.
2. **Sweep left to right**, maintaining either a "current merged interval" (for merge problems) or a data structure tracking "what's currently active" (for counting concurrent overlaps, like meeting rooms).
3. **Two intervals \`[s1, e1]\` and \`[s2, e2]\` (with \`s1 <= s2\` after sorting) overlap exactly when \`s2 <= e1\`** — the second one starts before or exactly when the first ends. This single inequality is the crux of nearly every interval problem.

## Code Example (TypeScript) — Merge Overlapping Intervals
\`\`\`typescript
function mergeIntervals(intervals: number[][]): number[][] {
    if (intervals.length === 0) return [];

    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    const merged: number[][] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const [start, end] = sorted[i];
        const last = merged[merged.length - 1];

        if (start <= last[1]) {
            // Overlaps (or touches) the last merged interval -> extend it.
            last[1] = Math.max(last[1], end);
        } else {
            // No overlap -> starts a new merged group.
            merged.push([start, end]);
        }
    }
    return merged;
}

// [[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]]
\`\`\`

## Code Example (TypeScript) — Minimum Meeting Rooms Required
\`\`\`typescript
function minMeetingRooms(intervals: number[][]): number {
    const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);
    const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);

    let rooms = 0;
    let maxRooms = 0;
    let s = 0;
    let e = 0;

    // Sweep starts and ends together: a start needs a new room unless
    // a meeting has already ended by that time.
    while (s < starts.length) {
        if (starts[s] < ends[e]) {
            rooms++;
            s++;
        } else {
            rooms--;
            e++;
        }
        maxRooms = Math.max(maxRooms, rooms);
    }
    return maxRooms;
}

// [[0,30],[5,10],[15,20]] -> 2
\`\`\`

## Complexity
- **Time:** O(n log n) — dominated by the initial sort; the sweep itself is O(n).
- **Space:** O(n) for the sorted copy / output (O(1) extra if merging in place is allowed).

## Signals This Pattern Applies
- The input is a list of **ranges/intervals** (\`[start, end]\` pairs) — meetings, bookings, time windows.
- The task is to **merge**, **insert**, **count overlaps**, or determine **maximum concurrent overlap**.
- A brute force would compare every interval against every other interval — sorting by start collapses that to a single sweep.

## Common Pitfalls
- **Forgetting to sort first** — the "current merged interval only needs to check the most recent one" trick is only valid because of the sort.
- **Getting the overlap condition backwards or off-by-one** — is touching (\`start === last.end\`) a merge or not? This is genuinely ambiguous across problems (closed vs. half-open intervals) and must be clarified with the interviewer.
- **Sorting by start only, when the problem needs both start and end info independently** (as in the meeting-rooms sweep above, which sorts starts and ends *separately* rather than sorting interval objects).
- **Mutating input intervals in place** when the interviewer expects the original array untouched — copy before sorting if unsure.

## Interview Angle
State the overlap condition explicitly before coding (\`s2 <= e1\` after sorting by start) — this is the one-line invariant the entire family of interval problems reduces to, and naming it up front signals you've generalized past any single problem's phrasing.
		`
	},

	'Monotonic Stack': {
		definition:
			'A stack kept in strictly increasing or decreasing order by popping elements that violate that order before pushing a new one, letting you find the "next greater/smaller element" for every position in O(n) total instead of O(n²).',
		useCase:
			'Finding, for every element, the next element to its right that is greater (Next Greater Element) or how many days until a warmer temperature (Daily Temperatures), in O(n).',
		detailedMarkdown: `
# Monotonic Stack

## The Problem It Solves
"For every element, find the next element to the right that is greater/smaller" sounds like it needs, for each position, a scan forward until you find a qualifying element — O(n²) worst case (imagine a strictly decreasing array; every element scans almost to the end). A Monotonic Stack answers all of these in a single O(n) pass by being smart about what work is reused between positions.

## What "Monotonic" Means Here
A monotonic stack is a stack whose elements are always kept in sorted order (either strictly increasing from bottom to top, or strictly decreasing — pick whichever the problem needs). You enforce this order on every push: before pushing a new element, pop off anything already on the stack that would violate the ordering. The key insight is that **the elements you pop are exactly the elements for which the current element is the answer** — e.g., for "Next Greater Element," maintaining a *decreasing* stack means: when you're about to push a bigger value, everything smaller currently on the stack has just found its "next greater element" — it's the value you're about to push. Pop it, record the answer, and continue.

## Why This Is O(n) Total (Amortized), Not O(n²)
It looks like there's a nested loop (outer loop over elements, inner \`while\` popping the stack), but each element is pushed onto the stack exactly once and popped at most once across the *entire* run of the algorithm. Total pushes: n. Total pops: at most n. So total work across all iterations of the inner while loop, summed over the whole outer loop, is bounded by O(n) — this is the same "amortized" argument used for Sliding Window's pointers.

## Code Example (TypeScript) — Next Greater Element
\`\`\`typescript
function nextGreaterElement(nums: number[]): number[] {
    const result = new Array(nums.length).fill(-1);
    const stack: number[] = []; // stores INDICES, kept so nums[stack] is decreasing top-to-bottom...
                                  // actually maintained bottom-to-top decreasing as we scan left to right

    for (let i = 0; i < nums.length; i++) {
        // Current element is bigger than the top of the stack -> it's the
        // "next greater element" for everything smaller still waiting on the stack.
        while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
            const idx = stack.pop()!;
            result[idx] = nums[i];
        }
        stack.push(i);
    }
    // Anything still on the stack at the end has no next greater element -> stays -1.
    return result;
}

// [2, 1, 2, 4, 3] -> [4, 2, 4, -1, -1]
\`\`\`

## Code Example (TypeScript) — Daily Temperatures
\`\`\`typescript
function dailyTemperatures(temperatures: number[]): number[] {
    const result = new Array(temperatures.length).fill(0);
    const stack: number[] = []; // indices of days waiting for a warmer day

    for (let i = 0; i < temperatures.length; i++) {
        while (stack.length > 0 && temperatures[stack[stack.length - 1]] < temperatures[i]) {
            const idx = stack.pop()!;
            result[idx] = i - idx; // number of days to wait
        }
        stack.push(i);
    }
    return result;
}

// [73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0]
\`\`\`

## Complexity
- **Time:** O(n) amortized — each index is pushed once and popped at most once.
- **Space:** O(n) for the stack in the worst case (e.g., a strictly increasing input for Next Greater Element never pops early, so the stack grows to size n).

## Signals This Pattern Applies
- "Next/previous greater/smaller element" phrasing, for every element, in a single array.
- Problems about spans, visibility, or "how far until a bigger/smaller value appears."
- A brute force would rescan forward/backward per element — that repeated rescanning of a similar range is the tell.
- Histogram-area-style problems (largest rectangle in histogram) also reduce to this pattern by tracking indices where height decreases.

## Common Pitfalls
- **Storing values instead of indices** — most variants (Daily Temperatures, histogram problems) need the *distance* or *position*, not just the value, so the stack should generally hold indices.
- **Getting the direction of monotonicity backwards** — "next greater" needs a decreasing stack (pop when the new element is bigger); "next smaller" needs an increasing stack (pop when the new element is smaller). Mixing these up silently produces the wrong relation.
- **Forgetting elements left on the stack at the end have no answer** — they should keep their sentinel value (\`-1\` or \`0\`), not be treated as an error.
- **Using an \`if\` instead of a \`while\` when popping** — a single new element may resolve *multiple* stale stack entries at once; only a \`while\` loop drains all of them.

## Interview Angle
Explaining *why* it's O(n) despite the nested-loop appearance — "each index is pushed once and popped at most once, so total pop operations across the whole run are bounded by n" — is the detail that distinguishes a candidate who understands amortized analysis from one who's just recalled the code shape.
		`
	},

	'Monotonic Queue (Deque)': {
		definition:
			'A double-ended queue kept in monotonic (decreasing, typically) order of value that supports O(1) "what is the max/min of the current window" queries, enabling sliding-window maximum/minimum in O(n) instead of O(n·k).',
		useCase:
			'Finding the maximum value in every sliding window of size k across an array in O(n) total, instead of O(n·k) from recomputing the max for each window.',
		detailedMarkdown: `
# Monotonic Queue (Deque)

## The Problem It Solves
Sliding Window Maximum asks: for every window of size k as it slides across an array, what's the max value in that window? Naively recomputing the max for each window (e.g., scanning all k elements, or using a heap that still needs cleanup for elements that fell out of the window) costs O(n·k) or O(n log k). A Monotonic Deque answers each window's max in O(1) amortized, for O(n) total.

## Why a Plain Queue Doesn't Work
A plain FIFO queue only lets you push to the back and pop from the front — that matches "elements enter and leave the window in order," but it gives you no fast way to know the *max* of what's currently inside without scanning. You could track a running max, but when the max value slides out of the window (out the front), you'd have no way to know the new max without rescanning — you already discarded the information about the second-largest element.

## Why a Monotonic Deque Works
A **deque** (double-ended queue) lets you push/pop from *both* ends. The trick: maintain it in **strictly decreasing order of value, front to back**, and store *indices*, not values, so you can tell when an index has fallen out of the window. On each new element:
1. **Pop from the back** while the back's value is ≤ the new element — those values can never be the max of any future window (the new, later, bigger-or-equal element will always be preferred), so they're permanently useless and safe to discard.
2. **Push the new index to the back.**
3. **Pop from the front** if it has fallen outside the window (its index is too old).
4. **The front of the deque is always the max of the current window** — O(1) to read.

Because every index is pushed once and popped at most once (from either end) across the whole run, the total work is O(n) amortized, exactly like Monotonic Stack.

## Code Example (TypeScript) — Sliding Window Maximum
\`\`\`typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
    const deque: number[] = []; // stores indices; nums[deque[i]] is strictly decreasing
    const result: number[] = [];

    for (let i = 0; i < nums.length; i++) {
        // Remove indices whose values can never win against the current, larger value.
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop();
        }
        deque.push(i);

        // Remove the front if it has slid out of the current window.
        if (deque[0] <= i - k) {
            deque.shift();
        }

        // Once the first full window is formed, record its max.
        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    return result;
}

// nums = [1,3,-1,-3,5,3,6,7], k = 3 -> [3,3,5,5,6,7]
\`\`\`
Note: \`Array.prototype.shift()\` is O(n) in the worst case in JS; a production-grade implementation would use a proper deque backed by a doubly linked list or an index-tracked ring buffer to keep front-removal O(1). For interview purposes, \`shift()\` on a deque holding at most k elements is usually accepted, but it's worth naming the caveat.

## Complexity
- **Time:** O(n) amortized — each index is pushed once and popped at most once total (across both the "dominated values" cleanup and the "expired index" cleanup).
- **Space:** O(k) — the deque holds at most one index per distinct "currently relevant" value, bounded by the window size.

## Signals This Pattern Applies
- "Maximum/minimum in every sliding window of size k" — the phrase "sliding window" combined with "max/min" (not sum, which is a simpler running-sum Sliding Window problem) is the strongest tell.
- A brute force would be O(n·k): for every window, scanning all k elements (or maintaining a heap that needs lazy deletion for expired elements).
- You need the running max/min of a window where elements both enter (right side) and expire (left side) over time.

## Common Pitfalls
- **Storing values instead of indices** — without indices you can't tell when the current front has expired out of the window.
- **Using \`<\` instead of \`<=\` when popping dominated values from the back** — if you keep equal values, you can end up with stale duplicates that don't affect correctness but do waste space; using \`<=\` (strict decreasing, no duplicates of the max) is the tighter and more common convention.
- **Checking window-expiry with the wrong bound** — the condition is typically \`deque[0] <= i - k\` (index too old for a window ending at i), easy to get off by one.
- **Reaching for a heap instead** — a heap works but needs "lazy deletion" (checking if the popped max index is still in-window, discarding if not) and costs O(n log k); the deque achieves the same result in O(n) with a simpler invariant.

## Interview Angle
If asked "why not just use a max-heap," the strong answer is: a heap doesn't support efficient removal of an arbitrary element (the one sliding out of the window's left edge) — you'd need lazy deletion and it still costs O(log k) per operation, whereas the monotonic deque discards useless elements permanently and gives O(1) reads, achieving true O(n) instead of O(n log k).
		`
	},

	'Heap / Priority Queue': {
		definition:
			'Applying a heap (a tree-based structure that gives O(1) access and O(log n) insert/remove for the min or max element) as the core algorithmic tool for "keep track of the k best/worst so far" or "repeatedly pull the current extreme" problems — distinct from the heap data structure itself.',
		useCase:
			'Finding the Kth largest element in a stream, merging K sorted lists efficiently, or finding the top K most frequent elements, all by using a heap to avoid repeatedly re-scanning or re-sorting.',
		detailedMarkdown: `
# Heap / Priority Queue (as an Interview Pattern)

This topic covers *recognizing when to reach for a heap* to solve a problem — contrast with "Heap / Priority Queue Basics," which covers how the data structure itself works internally (array representation, sift-up/sift-down, build-heap in O(n)). Here, the heap is assumed as a tool; the focus is which problems it unlocks and why.

## The Problem It Solves
A recurring interview shape is: "repeatedly need the current min or max from a changing collection," or "find the K best/worst elements without fully sorting everything." Full sorting is O(n log n) and gives you *all* elements in order when you only needed K of them; repeatedly scanning for the min/max is O(n) per operation. A heap gives O(log n) insert and O(log n) extract-min/max, and — crucially — you can bound the heap's size to K, so operations cost O(log K) instead of O(log n).

## Min-Heap vs. Max-Heap: How to Choose
The choice is driven by **which extreme you need to discard, not which extreme you need to keep**:
- **Kth largest element:** maintain a **min-heap of size K**. Push every new element; if the heap exceeds size K, pop the minimum. After processing everything, the heap's minimum (its root) is the Kth largest overall — because the K largest elements are exactly what survived being "the smallest of the current top K" at each step. This feels backwards at first (why a *min*-heap for the *largest*?) — the reasoning is that you always want fast access to the *smallest of your current candidates*, so you can decide whether a new element deserves to bump it out.
- **Top K frequent elements:** same idea — min-heap of size K ordered by frequency, popping the least-frequent whenever the heap exceeds K.
- **Merge K sorted lists:** here you need the **overall minimum** among K candidates (the current head of each list) at every step, so a straightforward **min-heap of size K** (one entry per list) is used directly — pop the min, push that list's next element, repeat.

General rule: if you're looking for the **largest** K things, you typically use a **min-heap** capped at size K (so the root is the weakest of your survivors, ready to be evicted). If you're looking for the **smallest** K things, use a **max-heap** capped at size K, symmetric logic. If you just need the running overall min/max across multiple live sequences (like merging), use whichever heap type matches that extreme directly, uncapped.

## Code Example (TypeScript) — Kth Largest Element (Min-Heap of Size K)
\`\`\`typescript
class MinHeap {
    private heap: number[] = [];

    get size() { return this.heap.length; }
    peek() { return this.heap[0]; }

    push(val: number) {
        this.heap.push(val);
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent] <= this.heap[i]) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    pop(): number {
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let i = 0;
            while (true) {
                const l = 2 * i + 1, r = 2 * i + 2;
                let smallest = i;
                if (l < this.heap.length && this.heap[l] < this.heap[smallest]) smallest = l;
                if (r < this.heap.length && this.heap[r] < this.heap[smallest]) smallest = r;
                if (smallest === i) break;
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
        }
        return top;
    }
}

function findKthLargest(nums: number[], k: number): number {
    const minHeap = new MinHeap();
    for (const n of nums) {
        minHeap.push(n);
        if (minHeap.size > k) {
            minHeap.pop(); // evict the current smallest of our top-k candidates
        }
    }
    return minHeap.peek(); // root = Kth largest overall
}

// [3,2,1,5,6,4], k = 2 -> 5
\`\`\`

## Code Example (TypeScript) — Merge K Sorted Lists (Conceptual, via a Min-Heap of Heads)
\`\`\`typescript
interface HeapNode { value: number; listIndex: number; elemIndex: number; }

function mergeKSortedArrays(lists: number[][]): number[] {
    // Use a library/production heap keyed by .value in real code;
    // shown conceptually here.
    const heap: HeapNode[] = [];
    const push = (node: HeapNode) => {
        heap.push(node);
        heap.sort((a, b) => a.value - b.value); // stand-in for a real O(log k) heap push
    };

    lists.forEach((list, i) => {
        if (list.length > 0) push({ value: list[0], listIndex: i, elemIndex: 0 });
    });

    const result: number[] = [];
    while (heap.length > 0) {
        const { value, listIndex, elemIndex } = heap.shift()!;
        result.push(value);
        const nextIdx = elemIndex + 1;
        if (nextIdx < lists[listIndex].length) {
            push({ value: lists[listIndex][nextIdx], listIndex, elemIndex: nextIdx });
        }
    }
    return result;
}
\`\`\`

## Complexity
- **Kth Largest (streaming):** O(n log k) time (n pushes/pops on a heap capped at size k), O(k) space — far better than O(n log n) full sort when k is small.
- **Merge K Sorted Lists** (with a real O(log k) heap, N total elements across K lists): O(N log K) time, O(K) space for the heap.
- **Top K Frequent Elements:** O(n log k) using a size-capped heap after an O(n) frequency count (better than O(n log n) sorting all distinct elements by frequency when k is small).

## Signals This Pattern Applies
- The phrase **"Kth largest/smallest"** or **"top K"** — almost always a heap capped at size K.
- **Merging multiple already-sorted sequences** — a heap tracking one "current candidate" per sequence.
- You need the **running min or max** of a collection that's actively growing/shrinking over time (not a one-time static min/max, which wouldn't need a heap at all).
- A brute force would involve **fully sorting** when you only need a partial answer (top K out of N, K ≪ N).

## Common Pitfalls
- **Picking the wrong heap type** — reflexively using a max-heap for "Kth largest" (tempting, since you want the largest) instead of the correct min-heap-of-size-K; walk through the eviction logic rather than trusting the label to avoid this.
- **Not capping the heap size** — pushing everything into an uncapped heap and popping K times still works but throws away the log(k) vs log(n) benefit that's the whole point of the size cap.
- **Using a plain array + \`.sort()\` inside a loop** as a stand-in for a heap in production code — fine for quick interview pseudocode (as shown in the merge example above) but it's O(k log k) per operation instead of O(log k), and should be called out as a simplification if you do it live.
- **Forgetting ties need a secondary comparator** — e.g., "top K frequent" with frequency ties may need a defined tie-break rule; clarify with the interviewer rather than assuming.

## Interview Angle
When you say "I'll use a min-heap of size K," immediately follow it with *why* the eviction target is the minimum, not the maximum — that one sentence ("we're always keeping the K largest survivors, so the weakest of our current top-K, the min, is what a stronger newcomer should replace") is what shows you derived the heap-type choice instead of memorizing "Kth largest = min-heap" as a flashcard fact.
		`
	}
};
