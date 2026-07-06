import type { RoadmapDetailMap } from './types';

export const DsaDpGreedyMiscContent: RoadmapDetailMap = {
	'1D DP': {
		definition:
			'A dynamic programming pattern where the state is indexed by a single variable (typically a position in an array or string), and each state\'s answer is built from a small, fixed number of previous states.',
		useCase:
			'Computing the number of distinct ways to climb a staircase when you can take 1 or 2 steps at a time — the answer at step n only depends on the answers at step n-1 and n-2.',
		detailedMarkdown: `
# 1D DP

**1D DP** is the entry point into dynamic programming: the problem's state can be fully described by a single index, and the recurrence at that index only reaches back to a handful of *earlier* indices. If you can write \`dp[i] = someFunctionOf(dp[i-1], dp[i-2], ...)\`, you're in 1D DP territory.

## The Pattern

1. Identify what "state \`i\`" means (e.g. "the number of ways to reach step \`i\`", or "the max profit considering only the first \`i\` houses").
2. Find the recurrence: how does \`dp[i]\` relate to earlier states?
3. Identify base case(s) — the smallest \`i\` you can answer directly without recursing further.
4. Decide: top-down (memoized recursion) or bottom-up (iterative table)?

## Problem It Solves: Climbing Stairs

"You are climbing a staircase with \`n\` steps. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?"

To reach step \`i\`, your last move was either a 1-step from \`i-1\` or a 2-step from \`i-2\`. Every way to reach \`i-1\` combined with a final 1-step, plus every way to reach \`i-2\` combined with a final 2-step, gives every way to reach \`i\`:

\`\`\`text
dp[i] = dp[i-1] + dp[i-2]
dp[0] = 1  (one way to "climb" 0 steps: do nothing)
dp[1] = 1  (one way: a single 1-step)
\`\`\`

## Code Example: Top-Down (Memoized Recursion)

\`\`\`typescript
function climbStairsTopDown(n: number): number {
	const memo = new Map<number, number>();

	function solve(i: number): number {
		if (i <= 1) return 1;
		if (memo.has(i)) return memo.get(i)!;

		const result = solve(i - 1) + solve(i - 2);
		memo.set(i, result);
		return result;
	}

	return solve(n);
}
\`\`\`

Without memoization this recursion branches into two calls at every step, giving an exponential \`O(2^n)\` blowup (the same sub-calls, like \`solve(3)\`, get recomputed over and over). The memo map turns every subproblem into a one-time computation.

## Code Example: Bottom-Up (Tabulation)

\`\`\`typescript
function climbStairsBottomUp(n: number): number {
	if (n <= 1) return 1;

	const dp = new Array<number>(n + 1);
	dp[0] = 1;
	dp[1] = 1;

	for (let i = 2; i <= n; i++) {
		dp[i] = dp[i - 1] + dp[i - 2];
	}

	return dp[n];
}
\`\`\`

Bottom-up builds the table from the base cases upward instead of recursing downward from \`n\`. Same recurrence, no call-stack overhead, and it naturally avoids recursion-depth limits for large \`n\`.

## Space Optimization: Rolling Variables

Notice \`dp[i]\` only ever needs \`dp[i-1]\` and \`dp[i-2]\` — never anything further back. That means the entire \`dp\` array is wasteful; you only need to remember the *last two* values:

\`\`\`typescript
function climbStairsOptimized(n: number): number {
	if (n <= 1) return 1;

	let prev2 = 1; // dp[i-2]
	let prev1 = 1; // dp[i-1]

	for (let i = 2; i <= n; i++) {
		const curr = prev1 + prev2;
		prev2 = prev1;
		prev1 = curr;
	}

	return prev1;
}
\`\`\`

This is a **very common follow-up** in interviews: "Can you do this in O(1) space?" Whenever the recurrence only looks back a fixed, small window (1, 2, or 3 previous states), you can collapse the array into that many scalar variables. It does NOT work if the recurrence needs an arbitrary earlier state (e.g. \`dp[i - k]\` for a variable \`k\`, or a running structure like a monotonic deque) — in those cases you need the full array or a different structure.

## Complexity

- **Time:** O(n) for both top-down and bottom-up — each state is computed exactly once.
- **Space:** O(n) for the memo map / dp array; O(1) with the rolling-variable optimization. Top-down also pays O(n) call-stack depth, which bottom-up avoids entirely.

## Signals This Pattern Applies

- The problem asks for a count, minimum, or maximum "up to position \`i\`" (ways to reach a step, max profit up to day \`i\`, min cost to reach index \`i\`).
- The state can be described with a single running index into an array or string.
- Choices at each position are limited and clearly enumerable (e.g. "take 1 or 2 steps," "rob this house or don't").
- The problem exhibits overlapping subproblems: naive recursion visibly recomputes the same smaller inputs.

## Common Pitfalls

- Off-by-one errors in base cases (forgetting \`dp[0]\` or mishandling \`n = 0\`/\`n = 1\` as special cases).
- Applying the space optimization before verifying the recurrence really only depends on a fixed, small window of previous states.
- Confusing "state index" with "loop index" in problems where the DP variable isn't literally the array position (e.g. house robber's \`dp[i]\` is about *decisions up to house i*, not the house's value itself).

## Interview Angle

Expect "start with recursion, add memoization, then convert to bottom-up, then optimize space" as the expected four-stage answer — interviewers use 1D DP specifically to see if you can walk through all four stages fluently, not just produce a final answer. A natural follow-up after Climbing Stairs is House Robber (\`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`), which uses the exact same "look back two states" shape but swaps the combination rule from a sum to a max — good practice for recognizing that the *pattern* transfers even when the recurrence's operator changes.
	`
	},

	'2D DP': {
		definition:
			'A dynamic programming pattern where the state depends on two independent indices — commonly two positions in two different strings, or a row and column in a grid — so the DP table is naturally two-dimensional.',
		useCase:
			'Finding the longest common subsequence between two strings (e.g. for a "diff" tool or DNA sequence comparison), where the answer at position (i, j) depends on comparing characters from both strings simultaneously.',
		detailedMarkdown: `
# 2D DP

**2D DP** shows up whenever a single index isn't enough to describe "where you are" in the problem — you need a *pair* of indices, most often because you're comparing two sequences character-by-character, or moving through a 2D grid. The DP table becomes a matrix, \`dp[i][j]\`, and the recurrence usually reaches back to \`dp[i-1][j]\`, \`dp[i][j-1]\`, and/or \`dp[i-1][j-1]\`.

## Problem It Solves: Longest Common Subsequence (LCS)

Given two strings \`text1\` and \`text2\`, find the length of their longest subsequence common to both (a subsequence need not be contiguous, but must preserve relative order).

## Reading the Recurrence Off the Problem

Define \`dp[i][j]\` = length of the LCS of \`text1[0..i)\` and \`text2[0..j)\` (i.e. the first \`i\` characters of \`text1\` and the first \`j\` characters of \`text2\`).

- If \`text1[i-1] === text2[j-1]\` (the characters just before position i/j match): this character can extend whatever the best subsequence was *without* it, so \`dp[i][j] = dp[i-1][j-1] + 1\`.
- Otherwise: the LCS either drops the last character of \`text1\` or the last character of \`text2\` — take whichever gives the longer result: \`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`.

## Code Example

\`\`\`typescript
function longestCommonSubsequence(text1: string, text2: string): number {
	const m = text1.length;
	const n = text2.length;

	// dp[i][j] = LCS length of text1[0..i) and text2[0..j)
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (text1[i - 1] === text2[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1] + 1;
			} else {
				dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}
	}

	return dp[m][n];
}
\`\`\`

## Getting the Base Row/Column Right

The single most common off-by-one bug in 2D DP is a wrong base row/column. Here, \`dp\` is sized \`(m+1) x (n+1)\`, not \`m x n\` — row 0 and column 0 represent "zero characters consumed from that string," and they must be explicitly \`0\` (an empty string's LCS with anything is length 0). Because the array is filled with \`0\` by default here, that base case is satisfied for free — but it's worth stating explicitly:

\`\`\`text
dp[0][j] = 0 for all j   (empty text1 -> LCS length 0)
dp[i][0] = 0 for all i   (empty text2 -> LCS length 0)
\`\`\`

If you instead sized the table \`m x n\` and tried to index \`text1[i-1]\`/\`text2[j-1]\` directly against \`dp[i][j]\` without the extra offset row/column, you'd have nowhere to store the "compare against nothing" base case, and every access to \`dp[i-1][...]\` at \`i = 0\` would go out of bounds or silently wrap to the wrong cell. The \`+1\` padding trick (size the table one larger than the string in each dimension, and let index \`i\` in \`dp\` mean "first \`i\` characters") is the standard fix and generalizes to almost every 2D string DP problem (edit distance, LCS, string interleaving).

## Complexity

- **Time:** O(m · n) — every cell computed once, in O(1) work per cell.
- **Space:** O(m · n) for the full table; can be optimized to O(min(m, n)) because row \`i\` only ever depends on row \`i-1\` (and the current row) — keep just two rolling rows instead of the whole matrix.

## Signals This Pattern Applies

- The problem compares or aligns **two sequences** (two strings, two arrays) — LCS, edit distance, string interleaving.
- The problem involves moving through a **2D grid** with constrained moves (unique paths, minimum path sum) — state is naturally (row, column).
- The phrase "subsequence" (not "substring"/"subarray") between two inputs is a strong LCS-family signal, since subsequences require tracking progress through both inputs independently.

## Common Pitfalls

- Off-by-one errors from mixing up "index into the string" with "index into the padded DP table" (this is exactly the base-row/column trap above).
- Forgetting that "subsequence" allows skipping characters (non-contiguous) while "substring"/"subarray" requires contiguity — using the LCS recurrence on a substring problem gives wrong answers.
- Not initializing the first row/column correctly for grid problems (e.g. "unique paths" needs the first row and first column set to 1, since there's only one way to reach any cell along the top edge or left edge).

## Interview Angle

A frequent follow-up after LCS is Edit Distance (Levenshtein distance): same 2D table shape, but the recurrence adds two more transition options (insert, delete) alongside "substitute" — \`dp[i][j] = dp[i-1][j-1]\` if characters match, else \`1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])\` for substitute/delete/insert respectively. Interviewers use this to check whether you actually understand *why* the recurrence looks the way it does, rather than having memorized one specific table.
	`
	},

	'Knapsack Pattern': {
		definition:
			'A dynamic programming pattern for choosing a subset of items under a capacity constraint to maximize (or check feasibility of) some value, where the classic 0/1 variant restricts each item to being used at most once.',
		useCase:
			'Determining whether a set of numbers can be split into two subsets with equal sums (partition equal subset sum) — a direct reduction to 0/1 knapsack where the "capacity" is half the total sum.',
		detailedMarkdown: `
# Knapsack Pattern

The **knapsack pattern** covers problems where you're selecting items under some capacity/budget constraint, and each item has a "weight" (cost) and a "value" (benefit). The two core variants differ in exactly one rule: can each item be used more than once?

## 0/1 Knapsack: Each Item Used At Most Once

Given \`n\` items, each with a weight and a value, and a knapsack of capacity \`W\`, maximize total value without exceeding \`W\`, using each item **zero or one** times.

**2D formulation:** \`dp[i][w]\` = max value achievable using the first \`i\` items with capacity \`w\`.

\`\`\`text
dp[i][w] = dp[i-1][w]                                    (skip item i)
         = dp[i-1][w - weight[i]] + value[i]              (take item i, if it fits)
dp[i][w] = max of the two options above
\`\`\`

## Code Example: 0/1 Knapsack, Collapsed to 1D

\`\`\`typescript
function knapsack01(weights: number[], values: number[], capacity: number): number {
	const dp = new Array<number>(capacity + 1).fill(0);

	for (let i = 0; i < weights.length; i++) {
		// Iterate capacity in REVERSE — this is the detail that matters
		for (let w = capacity; w >= weights[i]; w--) {
			dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
		}
	}

	return dp[capacity];
}
\`\`\`

## Why the Reverse Iteration Direction Matters

This is one of the most commonly-misunderstood details in all of DP. The 2D table has a clean separation: row \`i\` only ever reads from row \`i-1\`, so each item is naturally considered "not yet applied" when computing the rest of that same row. When you collapse the 2D table down to a single 1D array reused across items, that separation disappears — \`dp[w]\` and \`dp[w - weight[i]]\` now live in the *same* array.

- **Iterating \`w\` from high to low (reverse):** when you compute \`dp[w]\`, the value at \`dp[w - weights[i]]\` hasn't been updated yet *this iteration of the outer loop* — it still holds last item's (row \`i-1\`'s) value. This correctly reproduces "using item \`i\` at most once."
- **Iterating \`w\` from low to high (forward):** by the time you reach \`dp[w]\`, \`dp[w - weights[i]]\` may have *already been updated earlier in this same pass* to include item \`i\`. Reading it again would let item \`i\` be counted twice — silently turning 0/1 knapsack into unbounded knapsack.

## Contrast: Unbounded Knapsack (Items Can Be Reused)

If each item can be used unlimited times, the fix is exactly the opposite: iterate capacity **forward**, so that a just-updated \`dp[w - weights[i]]\` (which may already include item \`i\`) is allowed to be reused:

\`\`\`typescript
function knapsackUnbounded(weights: number[], values: number[], capacity: number): number {
	const dp = new Array<number>(capacity + 1).fill(0);

	for (let i = 0; i < weights.length; i++) {
		for (let w = weights[i]; w <= capacity; w++) {
			dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
		}
	}

	return dp[capacity];
}
\`\`\`

The loop bodies are line-for-line identical — the only difference is the direction of the inner loop. That single detail is the entire distinction between "each item once" and "each item unlimited times," which is exactly why interviewers probe it.

## Classic Problems in This Family

- **0/1 Knapsack** itself — as above.
- **Partition Equal Subset Sum:** can \`nums\` be split into two subsets with equal sum? Equivalent to: does some subset sum to exactly \`total / 2\`? This is 0/1 knapsack where "value" and "weight" are both the number itself, and you're checking reachability of a target capacity rather than maximizing value — \`dp[w]\` becomes a boolean "is sum \`w\` reachable" instead of a max.
- **Target Sum:** assign \`+\`/\`-\` to each number to reach a target sum \`S\`. This reduces algebraically to a subset-sum/0-1-knapsack problem: if \`P\` is the subset assigned \`+\` and \`N\` the subset assigned \`-\`, then \`P - N = S\` and \`P + N = total\`, so \`P = (S + total) / 2\` — count subsets summing to that \`P\`.

## Complexity

- **Time:** O(n · W) for both variants, where \`n\` is item count and \`W\` is capacity.
- **Space:** O(W) with the 1D collapse (down from O(n · W) for the full 2D table).

## Signals This Pattern Applies

- "Choose a subset of items" language, combined with a capacity/budget/target-sum constraint.
- Each item contributes a fixed weight/cost and a value, and you want to maximize value or just check feasibility.
- "Each item can be used at most once" (0/1) vs. "unlimited supply of each item" (unbounded, e.g. coin change with unlimited coins) — read this constraint carefully, it decides your loop direction.

## Common Pitfalls

- Iterating the capacity loop in the wrong direction for the variant you need (the single most common bug in this pattern).
- Forgetting to initialize \`dp[0] = true\`/\`0\` correctly for subset-sum-style boolean variants (capacity 0 is always trivially reachable using no items).
- Mixing up "weight" and "value" arrays, or using the wrong array's index as the loop bound.

## Interview Angle

If an interviewer asks "why does the loop go backwards here?", the correct answer is about *what row of the conceptual 2D table you might read stale vs. fresh data from* — not just "because that's how it's done." Being able to derive the direction from first principles (rather than reciting it) is what separates memorization from actual understanding of this pattern.
	`
	},

	'Longest Increasing Subsequence (LIS)': {
		definition:
			'The problem of finding the length of the longest subsequence of an array that is strictly increasing, solvable with an O(n^2) DP approach or an O(n log n) approach based on binary search over a "tails" array.',
		useCase:
			'Finding the longest run of increasing stock prices you could have bought into (not necessarily on consecutive days) to identify the best possible non-contiguous upward trend in a price history.',
		detailedMarkdown: `
# Longest Increasing Subsequence (LIS)

Given an array of numbers, find the length of the longest strictly increasing subsequence (elements need not be contiguous, but must appear in increasing order of both index and value).

## Approach 1: O(n^2) DP

Define \`dp[i]\` = length of the longest increasing subsequence that **ends exactly at index \`i\`**. For each \`i\`, check every earlier index \`j\`: if \`nums[j] < nums[i]\`, then \`i\` could extend whatever subsequence ends at \`j\`.

\`\`\`text
dp[i] = 1 + max(dp[j] for all j < i where nums[j] < nums[i])
dp[i] = 1  if no such j exists (the element starts its own subsequence)
\`\`\`

The answer is \`max(dp)\` over all \`i\` (the best subsequence doesn't have to end at the last index).

\`\`\`typescript
function lengthOfLISQuadratic(nums: number[]): number {
	const n = nums.length;
	if (n === 0) return 0;

	const dp = new Array<number>(n).fill(1);
	let best = 1;

	for (let i = 1; i < n; i++) {
		for (let j = 0; j < i; j++) {
			if (nums[j] < nums[i]) {
				dp[i] = Math.max(dp[i], dp[j] + 1);
			}
		}
		best = Math.max(best, dp[i]);
	}

	return best;
}
\`\`\`

## Approach 2: O(n log n) with a "Tails" Array

Maintain an array \`tails\` where, after processing some prefix of \`nums\`, \`tails[k]\` holds **the smallest possible tail value of any increasing subsequence of length \`k + 1\`** seen so far. For each new number \`x\`:

- Binary search \`tails\` for the leftmost position where \`tails[pos] >= x\`.
- If no such position exists (\`x\` is larger than every value in \`tails\`), append \`x\` — it extends the longest subsequence found so far by one.
- Otherwise, overwrite \`tails[pos] = x\` — a smaller tail value for a subsequence of that same length is strictly more useful for extending further later.

\`\`\`typescript
function lengthOfLISOptimal(nums: number[]): number {
	const tails: number[] = [];

	for (const x of nums) {
		let lo = 0;
		let hi = tails.length;

		// Find the leftmost index where tails[idx] >= x
		while (lo < hi) {
			const mid = (lo + hi) >>> 1;
			if (tails[mid] < x) {
				lo = mid + 1;
			} else {
				hi = mid;
			}
		}

		if (lo === tails.length) {
			tails.push(x); // x extends the longest subsequence found so far
		} else {
			tails[lo] = x; // replace with a smaller/equal tail for this length
		}
	}

	return tails.length;
}
\`\`\`

## Why the Tails Trick Works (and the Common Point of Confusion)

This is worth calling out explicitly because it trips people up constantly: **\`tails\` does NOT necessarily hold an actual valid increasing subsequence from the array.** It only guarantees that \`tails.length\` equals the correct LIS length, and that \`tails[k]\` is the smallest tail value achievable among subsequences of length \`k + 1\` — a value used purely as a *comparison bound* for future decisions, not a reconstructed answer.

For example, on \`[3, 1, 4, 1, 5]\`: after processing \`3\`, \`tails = [3]\`. After \`1\`, \`tails = [1]\` (1 replaces 3 as a smaller tail for length-1 subsequences — but "1" alone was never combined with anything before it). After \`4\`, \`tails = [1, 4]\`. After the second \`1\`, \`tails = [1, 4]\` unchanged (1 isn't smaller than the existing \`tails[0] = 1\`... more precisely it replaces it with an equal value). After \`5\`, \`tails = [1, 4, 5]\` — length 3, which is correct (e.g. \`[3, 4, 5]\` or \`[1, 4, 5]\`), but \`tails\` itself, \`[1, 4, 5]\`, happens to coincide with a real subsequence here only by coincidence of this example; in general the array is a bookkeeping structure, not a reconstruction. Recovering the *actual* subsequence (not just its length) requires extra bookkeeping — parent pointers recorded alongside each replacement — which is a common, deliberately tricky follow-up.

## Complexity

- **O(n^2) approach:** O(n^2) time, O(n) space. Simple to derive and explain.
- **O(n log n) approach:** O(n log n) time (n insertions, each a binary search), O(n) space for the tails array.

## Signals This Pattern Applies

- "Longest subsequence" (not substring/subarray) combined with an ordering constraint ("increasing," "non-decreasing," "strictly decreasing").
- Problems about finding the longest chain of compatible items sorted by one dimension while optimizing over another (e.g. "Russian Doll Envelopes," longest chain of pairs) — these often reduce to LIS after a sort.
- If the array size suggests O(n^2) is too slow (n up to 10^5 or more) and the problem is otherwise LIS-shaped, that's a strong hint the O(n log n) tails approach is expected.

## Common Pitfalls

- Assuming \`tails\` is a real subsequence and trying to read the answer directly off its contents instead of just its length.
- Getting confused about strict vs. non-strict increase — for "non-decreasing" subsequences, the binary search condition flips from "leftmost \`tails[idx] >= x\`" to "leftmost \`tails[idx] > x\`" (using \`bisect_right\`-style search instead of \`bisect_left\`-style).
- Forgetting the base case: an empty array or single-element array has LIS length 0 or 1 respectively.

## Interview Angle

Expect to be asked to start with the O(n^2) approach (to prove you understand the recurrence), and then asked "can you do better?" — the O(n log n) trick is a favorite because it tests whether you can reason about *what invariant* a clever data structure maintains, not just recite the algorithm. Being able to explain precisely why \`tails\` gives the right length without being an actual subsequence is usually the deciding signal of real understanding versus memorization.
	`
	},

	'Interval DP': {
		definition:
			'A dynamic programming pattern where the state is defined over a contiguous range [i, j] rather than a single index, and the recurrence combines the answers for two sub-ranges split at every possible point k inside that range.',
		useCase:
			'Determining the minimum number of scalar multiplications needed to multiply a chain of matrices together, where the answer for the whole chain depends on trying every possible place to split it into two smaller chains and combining their costs.',
		detailedMarkdown: `
# Interval DP

**Interval DP** generalizes 1D DP from "state = one index" to "state = a whole range \`[i, j]\`." It applies when a problem asks something about a contiguous segment, and the natural way to solve that segment is to pick a split point \`k\` inside it, solve both halves independently, and combine their results — trying every possible split point to find the best one.

## Problem It Solves: Matrix Chain Multiplication

Given a chain of matrices \`A1, A2, ..., An\` (only their dimensions matter, not their contents) find the minimum number of scalar multiplications needed to compute their product, where you're free to choose the parenthesization (multiplication order) but not reorder the matrices themselves.

Matrix multiplication is associative but not commutative, and the cost of multiplying an \`(a x b)\` matrix by a \`(b x c)\` matrix is \`a * b * c\` scalar multiplications — so where you place the parentheses changes the total cost dramatically, even though the mathematical result is identical.

## The Recurrence

Let \`dp[i][j]\` = minimum cost to multiply the chain of matrices from index \`i\` to index \`j\` (inclusive). To compute the product of matrices \`i..j\`, some multiplication happens *last* — splitting the chain at some \`k\` into \`(i..k)\` and \`(k+1..j)\`, computing each sub-chain's product first, then multiplying those two results together:

\`\`\`text
dp[i][j] = min over all k in [i, j-1] of:
    dp[i][k] + dp[k+1][j] + cost of multiplying the two resulting matrices
dp[i][i] = 0   (a single matrix needs no multiplication)
\`\`\`

Because you don't know in advance which split point \`k\` is optimal, you must try **every** \`k\` in the range and take the best.

## Code Example

\`\`\`typescript
function matrixChainOrder(dims: number[]): number {
	// dims has length n+1: matrix i has dimensions dims[i-1] x dims[i]
	const n = dims.length - 1; // number of matrices

	// dp[i][j] = min cost to multiply matrices i..j (1-indexed matrix positions)
	const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));

	// len = size of the chain being solved, from small ranges up to the full chain
	for (let len = 2; len <= n; len++) {
		for (let i = 1; i <= n - len + 1; i++) {
			const j = i + len - 1;
			dp[i][j] = Infinity;

			// Try every split point k inside the range [i, j]
			for (let k = i; k < j; k++) {
				const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
				dp[i][j] = Math.min(dp[i][j], cost);
			}
		}
	}

	return dp[1][n];
}

// Example: matrices of dims 10x30, 30x5, 5x60 -> dims = [10, 30, 5, 60]
console.log(matrixChainOrder([10, 30, 5, 60])); // 4500
\`\`\`

## The O(n^3) Loop Structure

Notice the triple-nested loop: an outer loop over **interval length**, a middle loop over the **starting point** of the interval (which determines the interval \`[i, j]\`), and an inner loop over every possible **split point \`k\`** inside that interval. This "length, start, split" shape is the signature structure of interval DP — it's what gives the pattern its characteristic O(n^3) time complexity (O(n^2) distinct intervals, each requiring an O(n) scan over split points).

Critically, the outer loop must go by **increasing interval length** — computing \`dp[i][j]\` requires \`dp[i][k]\` and \`dp[k+1][j]\`, both of which are *shorter* intervals than \`[i, j]\`. If you iterate in the wrong order (e.g. by increasing \`i\` for a fixed \`j\` instead of by increasing length) you can read a \`dp\` entry that hasn't been computed yet.

## Complexity

- **Time:** O(n^3) — O(n^2) intervals \`[i, j]\`, each taking O(n) to try every split point \`k\`.
- **Space:** O(n^2) for the DP table.

## Signals This Pattern Applies

- The problem talks about merging, combining, or removing items from a **contiguous range**, where the cost of combining depends on which items are at the boundary of the range.
- You can imagine the optimal solution being built by picking "the last operation" and noticing it splits the range into two independent sub-ranges — if you can articulate that split, it's interval DP.
- Classic phrasing cues: "minimum cost to merge/multiply/combine a sequence of X," "burst all the balloons and maximize coins," "find the optimal way to fully parenthesize an expression."
- Other problems in this family: Burst Balloons (burst balloon \`k\` *last* within a range, rather than first — the key insight that makes the sub-ranges independent), and Minimum Cost to Merge Stones.

## Common Pitfalls

- Iterating the outer loop over the wrong dimension (e.g. plain nested \`i\`, \`j\` loops without ordering by interval length), which causes reads of not-yet-computed table entries.
- Forgetting the base case \`dp[i][i] = 0\` (a single element needs no combining) or mis-indexing between 0-indexed arrays and 1-indexed matrix/chain positions.
- In Burst Balloons specifically, trying to reason about which balloon to burst *first* (which entangles the two sides) instead of *last* (which cleanly separates the range into two independent, order-independent sub-problems) — this reframing is the entire trick of that problem.

## Interview Angle

Interval DP problems are a strong signal of DP maturity because the recurrence isn't obviously about "the last index" the way 1D/2D DP often is — you have to notice that the natural sub-structure is "some middle split point," which is a less mechanical insight than most DP patterns. A common follow-up is "can this be optimized below O(n^3)?" — for some interval DP problems (like optimal BST or certain merge-cost variants) the "Knuth-Yao" speedup can shrink this to O(n^2) by proving the optimal split point moves monotonically, though this is a fairly advanced follow-up not expected at most interview levels.
	`
	},

	'Greedy Algorithms': {
		definition:
			'An algorithmic strategy that builds a solution by always making the locally optimal choice at each step, without reconsidering earlier choices, which only produces a globally optimal result when the problem has the greedy-choice property and optimal substructure.',
		useCase:
			'Scheduling the maximum number of non-overlapping meetings in a single room by always picking the next available meeting with the earliest end time, rather than exploring every possible combination of meetings.',
		detailedMarkdown: `
# Greedy Algorithms

A **greedy algorithm** builds up a solution one step at a time, at each step making whichever choice looks best *right now*, and never revisiting that choice later. This is dramatically simpler and faster than DP or backtracking — but it's only *correct* when the problem structure guarantees that local optimality leads to global optimality.

## When Greedy Is Actually Safe

Two properties must both hold for a greedy strategy to be provably correct:

- **Greedy-choice property:** a globally optimal solution can always be reached by making the locally optimal choice first, without ever needing to reconsider it later.
- **Optimal substructure:** an optimal solution to the whole problem contains optimal solutions to its subproblems.

Optimal substructure is shared with DP — the real dividing line between the two is the greedy-choice property. **DP is needed precisely when greedy-choice does NOT hold** — i.e. when the locally best-looking choice can foreclose a better global solution, forcing you to keep track of (and compare) multiple possibilities rather than committing to one. Greedy commits and never looks back; DP keeps every viable option alive until enough information is available to know which was actually best.

## Classic Problem 1: Activity Selection / Interval Scheduling

Given a set of intervals (start, end), select the maximum number of non-overlapping intervals. The greedy rule: **always pick the next available interval with the earliest end time.**

\`\`\`typescript
function maxNonOverlappingIntervals(intervals: [number, number][]): number {
	const sorted = [...intervals].sort((a, b) => a[1] - b[1]); // sort by end time

	let count = 0;
	let lastEnd = -Infinity;

	for (const [start, end] of sorted) {
		if (start >= lastEnd) {
			count++;
			lastEnd = end;
		}
	}

	return count;
}
\`\`\`

Why earliest end time is safe: picking the interval that finishes soonest leaves the most possible room for everything that comes after it — any other valid first choice can only end at the same time or later, so it can never leave *more* room. This is the greedy-choice property made concrete.

## Classic Problem 2: Jump Game (Reachability)

Given an array where \`nums[i]\` is the max jump length from index \`i\`, determine if you can reach the last index. Greedy approach: track the farthest index reachable so far; if you ever reach a position beyond that frontier before advancing it, you're stuck.

\`\`\`typescript
function canJump(nums: number[]): boolean {
	let farthestReachable = 0;

	for (let i = 0; i < nums.length; i++) {
		if (i > farthestReachable) return false; // stuck before reaching i
		farthestReachable = Math.max(farthestReachable, i + nums[i]);
	}

	return true;
}
\`\`\`

No backtracking needed — you never need to reconsider "should I have jumped differently earlier," because tracking the single best (farthest) reachable frontier at every step already captures everything relevant from all prior choices.

## Classic Problem 3: Gas Station

Given circular gas stations with \`gas[i]\` fuel available and \`cost[i]\` fuel needed to reach the next station, find the starting station from which a full circular trip is possible (guaranteed unique if \`sum(gas) >= sum(cost)\`). Greedy insight: if starting at station \`s\` and running out of gas at station \`i\`, then no station between \`s\` and \`i\` (inclusive) could have been a valid start either — so you can jump your candidate start straight to \`i + 1\` instead of trying every station individually.

\`\`\`typescript
function canCompleteCircuit(gas: number[], cost: number[]): number {
	let totalTank = 0;
	let currentTank = 0;
	let start = 0;

	for (let i = 0; i < gas.length; i++) {
		const diff = gas[i] - cost[i];
		totalTank += diff;
		currentTank += diff;

		if (currentTank < 0) {
			start = i + 1;   // no station up to and including i can be a valid start
			currentTank = 0; // reset the running tank for the new candidate start
		}
	}

	return totalTank >= 0 ? start : -1;
}
\`\`\`

## Where Greedy Fails (Even Though It Looks Tempting)

The canonical trap: **coin change with non-canonical denominations.** With US coins (1, 5, 10, 25), always taking the largest coin that fits happens to give the optimal (fewest-coin) answer. But with denominations \`[1, 3, 4]\` and a target of \`6\`, greedy picks \`4\`, then is forced into two \`1\`s (\`4 + 1 + 1\` = 3 coins), while the actual optimal answer is \`3 + 3\` = 2 coins. Greedy's "always take the biggest coin" choice permanently forecloses the better global answer — this is exactly a failure of the greedy-choice property, and it's precisely why general coin change is solved with DP (trying every coin at every remaining amount) rather than a greedy rule.

## Complexity

- Greedy algorithms are typically the *fastest* correct approach available for a given problem, usually O(n log n) (dominated by an initial sort) or O(n) if no sorting is needed — dramatically better than the DP or brute-force alternative required when greedy-choice doesn't hold.

## Signals This Pattern Applies

- The problem can be solved by sorting by some key (end time, ratio, deadline) and then scanning once, making an irreversible choice at each step.
- You can articulate, in one sentence, *why* the locally best choice can never hurt the global answer (if you can't articulate this, be suspicious that greedy might actually be wrong — see below).
- Problems about scheduling, intervals, or "minimum number of X to cover/reach Y" often admit a greedy solution, but always sanity-check with a small counterexample before committing.

## Common Pitfalls

- Assuming greedy works just because a locally-obvious rule exists, without verifying the greedy-choice property — the coin-change trap above is the textbook warning.
- Picking the wrong sort key (e.g. sorting activities by start time or duration instead of end time) — a subtly wrong greedy rule can look plausible and pass some test cases while failing on adversarial ones.
- Forgetting to prove optimal substructure holds too — even a correct-looking local rule can fail if solving a subproblem optimally doesn't compose into an optimal whole solution.

## Interview Angle

The strongest signal you can give in a greedy interview question isn't just implementing the loop — it's proactively explaining *why* the greedy choice is safe (usually via a short exchange argument: "if the optimal solution didn't make this choice, I can swap it in without making things worse, therefore it's safe to always make it"), and contrasting it against a nearby problem where greedy is *not* safe and DP is required instead. That contrast is what interviewers are actually listening for.
	`
	},

	Trie: {
		definition:
			'A prefix tree data structure where each node holds a map of child nodes keyed by character plus a flag marking whether a complete word ends there, enabling prefix-based lookups in time proportional only to the length of the query, not the number of stored words.',
		useCase:
			'Powering autocomplete/typeahead search, where typing a few characters needs to instantly retrieve every stored word sharing that prefix, out of potentially millions of stored words.',
		detailedMarkdown: `
# Trie

A **trie** (prefix tree) stores a set of strings by sharing common prefixes across a tree structure: each edge represents one character, and each node represents "everything typed so far along the path from the root." Any two words sharing a prefix share the same path through the tree for that prefix, only diverging where the words differ.

## Structure

Each node holds:
- A map (or fixed-size array, for a known alphabet) from character to child node.
- A boolean flag, \`isEndOfWord\`, marking whether a complete inserted word ends at this exact node (not just a prefix of one).

## Code Example: Insert, Search, StartsWith

\`\`\`typescript
class TrieNode {
	children: Map<string, TrieNode> = new Map();
	isEndOfWord: boolean = false;
}

class Trie {
	private root: TrieNode = new TrieNode();

	insert(word: string): void {
		let node = this.root;
		for (const char of word) {
			if (!node.children.has(char)) {
				node.children.set(char, new TrieNode());
			}
			node = node.children.get(char)!;
		}
		node.isEndOfWord = true;
	}

	search(word: string): boolean {
		const node = this.traverseTo(word);
		return node !== null && node.isEndOfWord;
	}

	startsWith(prefix: string): boolean {
		return this.traverseTo(prefix) !== null;
	}

	// Walks the trie following the given string; returns null if the path breaks
	private traverseTo(str: string): TrieNode | null {
		let node = this.root;
		for (const char of str) {
			const next = node.children.get(char);
			if (!next) return null;
			node = next;
		}
		return node;
	}
}

// --- Usage ---
const trie = new Trie();
trie.insert('cat');
trie.insert('car');
trie.insert('card');

console.log(trie.search('car'));       // true  (exact word inserted)
console.log(trie.search('ca'));        // false (only a prefix, not a full word)
console.log(trie.startsWith('ca'));    // true  (some word starts with "ca")
console.log(trie.startsWith('dog'));   // false
\`\`\`

Note the subtlety between \`search\` and \`startsWith\`: \`search("ca")\` is \`false\` because \`"ca"\` was never inserted as a complete word (\`isEndOfWord\` is false at that node), even though the path exists in the tree — it's a real prefix of \`"cat"\` and \`"car"\`, just not a stored word itself.

## Complexity

- **Insert / Search / StartsWith:** O(L), where \`L\` is the length of the word/prefix being processed — **independent of how many words are already stored in the trie.**
- **Space:** O(total characters across all inserted words) in the worst case (no shared prefixes), but typically much less when words share common prefixes, since shared prefixes are stored only once.

This is the trie's key advantage over storing words in a plain array or hash set for prefix queries: checking "does any stored word start with this prefix" against a hash set of \`n\` words would require scanning up to all \`n\` words (each comparison up to O(L)), i.e. O(n · L) in the worst case. A trie answers the same query in O(L) total, regardless of whether there are 10 or 10 million stored words — the entire point of the structure is making prefix queries independent of collection size.

## Classic Problems

- **Implement Trie (Prefix Tree):** exactly the structure above — the foundational exercise.
- **Word Search II:** given a grid of letters and a list of words, find all words present in the grid (each word's letters must be sequentially adjacent). Insert all target words into a trie first, then do a single DFS/backtracking pass over the grid, using the trie to prune: at each grid cell, only recurse into a neighbor if the trie has a child for that next character — this collapses what would otherwise be a separate grid search per word into one shared search that abandons dead-end paths immediately.
- **Autocomplete / typeahead:** insert a dictionary (or search history) into a trie; given a typed prefix, walk to that prefix's node and then explore all words within that subtree (often ranked by frequency).

## Signals This Pattern Applies

- The problem involves a fixed **dictionary of words** and repeated **prefix queries** against it (does any word start with X, autocomplete suggestions, longest common prefix).
- A grid/board search problem provides a *list of target words* to find, rather than one word at a time — the shared-prefix pruning benefit of a trie is wasted searching for a single word, but pays off heavily across many.
- The phrase "prefix" appears explicitly in the problem statement, or the same set of strings needs to be queried against many times (build once, query many — trie amortizes the O(L) insert cost across repeated fast lookups).

## Common Pitfalls

- Confusing "the path exists" (a valid prefix) with "a full word was inserted here" — always check the \`isEndOfWord\` flag for exact-word queries, not just whether traversal succeeded.
- Forgetting to handle deletion carefully if the trie needs to support it — you can't blindly delete a node, since it might still be part of another word's path; you must only prune nodes that have no children and aren't the end of another word.
- Using a fixed-size array (e.g. size 26 for lowercase English) when the alphabet is actually larger (Unicode, mixed case, digits) — a \`Map\` is safer and more general at a small constant overhead.

## Interview Angle

A common follow-up after implementing basic insert/search is: "how would you support autocomplete, returning the top-k most frequent completions of a prefix?" — this usually means augmenting each node with extra bookkeeping (e.g. caching the most frequent words in its subtree) so you don't have to re-walk the whole subtree on every query, trading some insert-time cost and memory for much faster reads — a classic space/time trade-off discussion.
	`
	},

	'Bit Manipulation Patterns': {
		definition:
			'A collection of recurring interview techniques built on top of raw bitwise operators — using XOR to cancel duplicates, Brian Kernighan\'s trick to isolate/clear set bits, and bitmasks to represent subsets or visited-state in DP — rather than the operators themselves.',
		useCase:
			'Finding the single number that appears once in an array where every other number appears exactly twice, in O(n) time and O(1) extra space, by XOR-ing every element together.',
		detailedMarkdown: `
# Bit Manipulation Patterns

This topic assumes you're already comfortable with the raw operators (\`&\`, \`|\`, \`^\`, \`~\`, \`<<\`, \`>>\`) — that introductory material lives in "Bit Manipulation Basics." Here, the focus is on the recurring higher-level **patterns** built on top of those operators that show up repeatedly across interview problems.

## Pattern 1: XOR to Find a Single Non-Duplicate

XOR has two properties that make it uniquely useful for cancellation: \`x ^ x = 0\` (a value XORed with itself vanishes), and XOR is commutative/associative, so the order of operations doesn't matter. If every number in an array appears exactly twice except one, XOR-ing the entire array together cancels out every pair, leaving only the lone number.

\`\`\`typescript
function singleNumber(nums: number[]): number {
	let result = 0;
	for (const num of nums) {
		result ^= num;
	}
	return result;
}

console.log(singleNumber([4, 1, 2, 1, 2])); // 4
\`\`\`

Trace: \`4 ^ 1 ^ 2 ^ 1 ^ 2\`. Reordering by XOR's commutativity: \`4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = 4\`.

## Pattern 2: Counting Set Bits — Brian Kernighan's Trick

\`n & (n - 1)\` clears the **lowest set bit** of \`n\`. Why: subtracting 1 from \`n\` flips all the trailing zero bits to 1 and flips the lowest set bit to 0; ANDing with the original \`n\` keeps only the bits that were already 1 in both, which is every bit of \`n\` except that lowest set one.

\`\`\`typescript
function countSetBits(n: number): number {
	let count = 0;
	while (n !== 0) {
		n = n & (n - 1); // clears the lowest set bit each iteration
		count++;
	}
	return count;
}

console.log(countSetBits(0b10110)); // 3 (three 1-bits)
\`\`\`

This runs in O(number of set bits) rather than O(number of total bits) — a meaningful speedup for sparse numbers (few 1-bits) compared to checking every bit position one by one.

## Pattern 3: Checking If a Number Is a Power of Two

A power of two has exactly one set bit (\`1\`, \`10\`, \`100\`, \`1000\`, ...). Applying Brian Kernighan's trick once should therefore clear that single bit and leave zero:

\`\`\`typescript
function isPowerOfTwo(n: number): boolean {
	return n > 0 && (n & (n - 1)) === 0;
}

console.log(isPowerOfTwo(16)); // true  (0b10000 & 0b01111 === 0)
console.log(isPowerOfTwo(18)); // false (0b10010 & 0b10001 !== 0)
\`\`\`

The \`n > 0\` guard matters: without it, \`n = 0\` would incorrectly pass, since \`0 & -1 === 0\` in two's-complement arithmetic, but 0 is not a power of two.

## Pattern 4: Bitmasks for Subsets / Visited-State in DP

An integer's bits can represent **membership in a set** — bit \`i\` set means "element \`i\` is included/visited." This lets you encode an entire subset as a single number, which is exactly what's needed as a DP state dimension when a problem needs to track "which subset of elements have been used so far."

The canonical example is the **Traveling Salesman Problem (TSP)** via DP over bitmasks: \`dp[mask][i]\` = minimum cost to have visited exactly the set of cities represented by \`mask\`, ending at city \`i\`.

\`\`\`typescript
// Sketch: dp[mask][i] = min cost visiting exactly cities in "mask", ending at i
function tspBitmask(dist: number[][]): number {
	const n = dist.length;
	const FULL_MASK = (1 << n) - 1;
	const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
	dp[1][0] = 0; // start at city 0, having visited only city 0

	for (let mask = 1; mask <= FULL_MASK; mask++) {
		for (let u = 0; u < n; u++) {
			if (!(mask & (1 << u)) || dp[mask][u] === Infinity) continue;

			for (let v = 0; v < n; v++) {
				if (mask & (1 << v)) continue; // v already visited in this mask
				const nextMask = mask | (1 << v);
				dp[nextMask][v] = Math.min(dp[nextMask][v], dp[mask][u] + dist[u][v]);
			}
		}
	}

	let best = Infinity;
	for (let u = 1; u < n; u++) {
		if (dp[FULL_MASK][u] !== Infinity) {
			best = Math.min(best, dp[FULL_MASK][u] + dist[u][0]); // return to start
		}
	}
	return best;
}
\`\`\`

This ties bit manipulation directly back to DP: the bitmask isn't just a bitwise trick here, it *is* one dimension of the DP state, letting an exponential number of subsets be represented, compared, and transitioned between using O(1) bitwise operations instead of, say, a much slower \`Set\` object.

## Complexity

- **XOR single number:** O(n) time, O(1) space.
- **Brian Kernighan's set-bit count:** O(k) where \`k\` is the number of set bits, versus O(number of bits) for a naive bit-by-bit scan.
- **Power of two check:** O(1).
- **Bitmask DP (e.g. TSP):** O(2^n · n^2) time, O(2^n · n) space — exponential in \`n\`, but far better than trying every permutation (O(n!)), which is why bitmask DP is the standard approach for these problems up to roughly n ≈ 20.

## Signals This Pattern Applies

- "Every element appears twice except one" (or similar exactly-once/exactly-twice phrasing) — strong XOR-cancellation signal.
- The problem asks to count or check properties of set bits, or explicitly mentions powers of two.
- The problem needs to track "which subset of items has been used/visited so far" as part of a DP state, and \`n\` (the number of items) is small (roughly ≤ 20) — a strong bitmask-DP signal, since \`2^n\` states must be enumerable.
- Constraints in the problem statement capping \`n\` at a suspiciously small number (like 15–20) rather than 10^5 is itself a hint that an exponential-but-bitmask-compressed approach is intended.

## Common Pitfalls

- Forgetting the \`n > 0\` guard on the power-of-two check, or on any Brian Kernighan usage where negative numbers could reach the function.
- Off-by-one errors in bitmask indexing — mixing up whether bit \`i\` represents element \`i\` or element \`i + 1\`, and forgetting that a mask ranges over \`0\` to \`2^n - 1\` inclusive (so loops must use \`<=\` against \`(1 << n) - 1\`, or \`<\` against \`1 << n\`).
- Reaching for bitmask DP when \`n\` is too large — it's only viable while \`2^n\` states remain tractable; past roughly \`n = 20\`, the state space explodes and a different approach is needed entirely.

## Interview Angle

A strong signal in bit-manipulation interviews is connecting these tricks to *why* they work in terms of two's-complement binary representation (e.g. explaining exactly why \`n - 1\` flips the trailing zeros and the lowest set bit) rather than just reciting the formula. For the bitmask-DP pattern specifically, expect a follow-up asking about the state space size and why this approach stops being viable past a certain \`n\` — showing you know the technique's limits is as important as knowing the technique itself.
	`
	}
};
