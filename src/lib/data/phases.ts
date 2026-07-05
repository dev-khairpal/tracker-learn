import type { Phase } from '$lib/types/dsa';

export const PHASES: Phase[] = [
	{ name: 'Foundations', ids: ['java-collections', 'complexity'] },
	{
		name: 'Months 1–2',
		ids: ['arrays', 'strings', 'sliding-window', 'hashing', 'binary-search', 'linked-list']
	},
	{ name: 'Months 3–4', ids: ['stack-queue', 'trees', 'heap', 'recursion-backtracking', 'graphs'] },
	{ name: 'Months 5–6', ids: ['dp', 'greedy', 'mixed-revision', 'mock-interviews'] }
];

export const INTERVIEW_CHECKLIST: string[] = [
	'Understand the problem before coding — restate it in your own words',
	'Discuss brute force first, out loud',
	'Explain the optimization before you start typing',
	"Think aloud throughout, don't go silent",
	'Write clean, well-named, bug-free code',
	'Handle edge cases explicitly (empty input, duplicates, overflow)',
	'Analyze time and space complexity at the end'
];

/** Reference-only priority list from the DSA pattern roadmap — surfaced as a
 *  small Dashboard callout, not a new UI section (overlaps with TOPICS/PHASES
 *  which already have real problems mapped). */
export const PRIORITY_PATTERNS: string[] = [
	'Arrays & Hashing',
	'Two Pointers',
	'Sliding Window',
	'Prefix Sum',
	'Binary Search',
	'Intervals',
	'Monotonic Stack',
	'Heap / Priority Queue',
	'Linked List',
	'Trees (DFS, BFS, BST)',
	'Graphs (DFS, BFS)',
	'Topological Sort',
	'Union-Find (DSU)',
	'Backtracking',
	'Dynamic Programming (1D & 2D)',
	'Greedy'
];
