import type { Topic } from '$lib/types/dsa';

export const TOPICS: Topic[] = [
	{
		id: 'java-collections',
		name: 'Java Collections & Fundamentals',
		icon: '☕',
		phase: 0,
		concepts: ['Core Collections API', 'HashMap Internals', 'Comparator/Comparable', 'Iterators'],
		problems: [
			['ArrayList vs LinkedList internals & complexity', 'E'],
			['HashSet vs LinkedHashSet vs TreeSet', 'E'],
			['Deque / ArrayDeque as Stack and Queue', 'E'],
			['Comparable vs Comparator', 'E'],
			['Collections.sort / Arrays.sort with custom comparator', 'E'],
			['String immutability, String Pool & StringBuilder', 'E'],
			['Autoboxing pitfalls & == vs .equals()', 'E'],
			['HashMap internal working (hashing, buckets, treeification)', 'M'],
			['PriorityQueue (heap) usage & custom Comparator', 'M'],
			['Iterator & ConcurrentModificationException', 'M'],
			['Generics basics (bounded types, wildcards)', 'M'],
			['Fail-fast vs fail-safe iterators', 'M']
		]
	},
	{
		id: 'complexity',
		name: 'Complexity Analysis',
		icon: '⏱️',
		phase: 0,
		concepts: ['Big-O/Theta/Omega', 'Recurrence Relations', 'Amortized Analysis'],
		problems: [
			['Big-O, Big-Theta, Big-Omega basics', 'E'],
			['Time complexity of common array/string operations', 'E'],
			['Space complexity: auxiliary vs input space', 'E'],
			['Best / Average / Worst case analysis', 'E'],
			['Time complexity of ArrayList/LinkedList/HashMap/TreeMap ops', 'M'],
			['Analyzing recursive time complexity (recurrence relations)', 'M'],
			['Master Theorem basics', 'M'],
			['Amortized analysis (e.g. dynamic array resizing)', 'M']
		]
	},
	{
		id: 'arrays',
		name: 'Arrays & Two Pointers',
		icon: '🔢',
		phase: 1,
		concepts: ['Traversal', 'Prefix Sum', 'Two Pointers', "Kadane's Algorithm", 'Sorting Tricks'],
		problems: [
			['Two Sum', 'E'],
			['Best Time to Buy and Sell Stock', 'E'],
			['Contains Duplicate', 'E'],
			['Majority Element', 'E'],
			['Move Zeroes', 'E'],
			['Product of Array Except Self', 'M'],
			["Maximum Subarray (Kadane's)", 'M'],
			['Maximum Product Subarray', 'M'],
			['3Sum', 'M'],
			['Container With Most Water', 'M'],
			['Next Permutation', 'M'],
			['Merge Intervals', 'M'],
			['Insert Interval', 'M'],
			['Set Matrix Zeroes', 'M'],
			['Rotate Image', 'M'],
			['Spiral Matrix', 'M'],
			['Find Minimum in Rotated Sorted Array', 'M'],
			['Search in Rotated Sorted Array', 'M'],
			['Trapping Rain Water', 'H']
		]
	},
	{
		id: 'strings',
		name: 'Strings',
		icon: '🔤',
		phase: 1,
		concepts: ['Frequency Counting', 'Pattern Matching', 'Two Pointers', 'KMP / Rabin-Karp'],
		problems: [
			['Valid Anagram', 'E'],
			['Valid Palindrome', 'E'],
			['Longest Common Prefix', 'E'],
			['Longest Substring Without Repeating Characters', 'M'],
			['Group Anagrams', 'M'],
			['Longest Palindromic Substring', 'M'],
			['Palindromic Substrings', 'M'],
			['String to Integer (atoi)', 'M'],
			['Implement strStr() / KMP', 'M'],
			['Zigzag Conversion', 'M'],
			['Reverse Words in a String', 'M'],
			['Word Break', 'M'],
			['Rabin-Karp Pattern Matching', 'M'],
			['Count and Say', 'M'],
			['Minimum Window Substring', 'H']
		]
	},
	{
		id: 'sliding-window',
		name: 'Sliding Window',
		icon: '🪟',
		phase: 1,
		concepts: ['Fixed Window', 'Variable Window', 'Two Pointers'],
		problems: [
			['Max Consecutive Ones III', 'M'],
			['Longest Substring with At Most K Distinct Characters', 'M'],
			['Minimum Size Subarray Sum', 'M'],
			['Fruit Into Baskets', 'M'],
			['Permutation in String', 'M'],
			['Find All Anagrams in a String', 'M'],
			['Longest Repeating Character Replacement', 'M'],
			['Longest Subarray of 1s After Deleting One Element', 'M'],
			['Sliding Window Maximum', 'H']
		]
	},
	{
		id: 'hashing',
		name: 'Hashing',
		icon: '🗂️',
		phase: 1,
		concepts: ['HashMap/HashSet', 'Frequency Maps', 'Prefix Sum + Hashing'],
		problems: [
			['Isomorphic Strings', 'E'],
			['Ransom Note', 'E'],
			['Design HashMap', 'E'],
			['Longest Consecutive Sequence', 'M'],
			['Top K Frequent Elements', 'M'],
			['Subarray Sum Equals K', 'M'],
			['Continuous Subarray Sum', 'M'],
			['Four Sum II', 'M'],
			['Subarray Sums Divisible by K', 'M'],
			['First Missing Positive', 'H']
		]
	},
	{
		id: 'binary-search',
		name: 'Binary Search',
		icon: '🔍',
		phase: 1,
		concepts: ['Lower/Upper Bound', 'Rotated Arrays', 'Binary Search on Answer'],
		problems: [
			['Binary Search', 'E'],
			['Search Insert Position', 'E'],
			['Find First and Last Position in Sorted Array', 'M'],
			['Search in Rotated Sorted Array II', 'M'],
			['Koko Eating Bananas', 'M'],
			['Capacity To Ship Packages Within D Days', 'M'],
			['Aggressive Cows (Binary Search on Answer)', 'M'],
			['Allocate Minimum Number of Pages', 'M'],
			['Find Peak Element', 'M'],
			['Search a 2D Matrix', 'M'],
			['Median of Two Sorted Arrays', 'H'],
			['Split Array Largest Sum', 'H']
		]
	},
	{
		id: 'linked-list',
		name: 'Linked List',
		icon: '🔗',
		phase: 1,
		concepts: ['Reversal', 'Fast/Slow Pointer', 'Cycle Detection', 'Merge Technique'],
		problems: [
			['Reverse Linked List', 'E'],
			['Merge Two Sorted Lists', 'E'],
			['Linked List Cycle', 'E'],
			['Palindrome Linked List', 'E'],
			['Intersection of Two Linked Lists', 'E'],
			['Linked List Cycle II', 'M'],
			['Remove Nth Node From End of List', 'M'],
			['Reorder List', 'M'],
			['Copy List with Random Pointer', 'M'],
			['Add Two Numbers', 'M'],
			['LRU Cache', 'M'],
			['Flatten a Multilevel Doubly Linked List', 'M'],
			['Rotate List', 'M'],
			['Merge K Sorted Lists', 'H']
		]
	},
	{
		id: 'stack-queue',
		name: 'Stack & Queue',
		icon: '📚',
		phase: 2,
		concepts: ['Monotonic Stack', 'Parentheses Matching', 'Next Greater Element'],
		problems: [
			['Valid Parentheses', 'E'],
			['Implement Queue using Stacks', 'E'],
			['Min Stack', 'M'],
			['Evaluate Reverse Polish Notation', 'M'],
			['Generate Parentheses', 'M'],
			['Daily Temperatures', 'M'],
			['Next Greater Element I & II', 'M'],
			['Asteroid Collision', 'M'],
			['Largest Rectangle in Histogram', 'H'],
			['Maximal Rectangle', 'H']
		]
	},
	{
		id: 'trees',
		name: 'Trees & BST',
		icon: '🌳',
		phase: 2,
		concepts: ['DFS/BFS Traversals', 'BST Properties', 'LCA', 'Tree Construction'],
		problems: [
			['Maximum Depth of Binary Tree', 'E'],
			['Same Tree', 'E'],
			['Invert Binary Tree', 'E'],
			['Diameter of Binary Tree', 'E'],
			['Balanced Binary Tree', 'E'],
			['Binary Tree Level Order Traversal', 'M'],
			['Binary Tree Zigzag Level Order Traversal', 'M'],
			['Validate Binary Search Tree', 'M'],
			['Kth Smallest Element in a BST', 'M'],
			['Lowest Common Ancestor of a BST', 'M'],
			['Lowest Common Ancestor of a Binary Tree', 'M'],
			['Construct Binary Tree from Preorder and Inorder Traversal', 'M'],
			['Right Side View of Binary Tree', 'M'],
			['Flatten Binary Tree to Linked List', 'M'],
			['Count Good Nodes in Binary Tree', 'M'],
			['Binary Tree Maximum Path Sum', 'H'],
			['Serialize and Deserialize Binary Tree', 'H'],
			['Vertical Order Traversal', 'H']
		]
	},
	{
		id: 'heap',
		name: 'Heap / Priority Queue',
		icon: '⛰️',
		phase: 2,
		concepts: ['Min/Max Heap', 'Top-K Pattern', 'Two Heaps'],
		problems: [
			['Last Stone Weight', 'E'],
			['Kth Largest Element in an Array', 'M'],
			['Task Scheduler', 'M'],
			['K Closest Points to Origin', 'M'],
			['Reorganize String', 'M'],
			['Ugly Number II', 'M'],
			['Find Median from Data Stream', 'H'],
			['Sliding Window Median', 'H']
		]
	},
	{
		id: 'recursion-backtracking',
		name: 'Recursion & Backtracking',
		icon: '🌀',
		phase: 2,
		concepts: ['Recursion Tree', 'Pruning', 'State-space Search'],
		problems: [
			['Subsets', 'M'],
			['Subsets II', 'M'],
			['Permutations', 'M'],
			['Permutations II', 'M'],
			['Combination Sum', 'M'],
			['Combination Sum II', 'M'],
			['Word Search', 'M'],
			['Palindrome Partitioning', 'M'],
			['Letter Combinations of a Phone Number', 'M'],
			['Rat in a Maze', 'M'],
			['N-Queens', 'H'],
			['Sudoku Solver', 'H']
		]
	},
	{
		id: 'graphs',
		name: 'Graphs',
		icon: '🕸️',
		phase: 2,
		concepts: ['BFS/DFS', 'Topological Sort', 'Dijkstra', 'Union Find (DSU)', 'MST'],
		problems: [
			['Number of Islands', 'M'],
			['Clone Graph', 'M'],
			['Course Schedule', 'M'],
			['Course Schedule II (Topological Sort)', 'M'],
			['Pacific Atlantic Water Flow', 'M'],
			['Rotting Oranges', 'M'],
			['Network Delay Time (Dijkstra)', 'M'],
			['Cheapest Flights Within K Stops', 'M'],
			['Redundant Connection (Union Find)', 'M'],
			['Number of Provinces (DSU)', 'M'],
			['Graph Valid Tree', 'M'],
			['Bellman-Ford Shortest Path', 'M'],
			['Word Ladder', 'H'],
			['Alien Dictionary', 'H'],
			["Minimum Spanning Tree (Prim's/Kruskal's)", 'H'],
			['Bridges in Graph', 'H']
		]
	},
	{
		id: 'dp',
		name: 'Dynamic Programming',
		icon: '🧮',
		phase: 3,
		concepts: [
			'Recursion → Memoization → Tabulation → Space Optimization',
			'LIS/LCS',
			'Knapsack Family',
			'Interval DP'
		],
		problems: [
			['Climbing Stairs', 'E'],
			['House Robber', 'M'],
			['House Robber II', 'M'],
			['Longest Increasing Subsequence', 'M'],
			['Longest Common Subsequence', 'M'],
			['Coin Change', 'M'],
			['Coin Change II', 'M'],
			['0/1 Knapsack', 'M'],
			['Partition Equal Subset Sum', 'M'],
			['Decode Ways', 'M'],
			['Unique Paths', 'M'],
			['Minimum Path Sum', 'M'],
			['Maximal Square', 'M'],
			['Target Sum', 'M'],
			['Interleaving String', 'M'],
			['Longest Palindromic Subsequence', 'M'],
			['Edit Distance', 'H'],
			['Palindrome Partitioning II', 'H'],
			['Best Time to Buy/Sell Stock III & IV', 'H'],
			['Burst Balloons', 'H'],
			['Matrix Chain Multiplication', 'H']
		]
	},
	{
		id: 'greedy',
		name: 'Greedy',
		icon: '⚡',
		phase: 3,
		concepts: ['Interval Scheduling', 'Exchange Argument', 'Activity Selection'],
		problems: [
			['Jump Game', 'M'],
			['Jump Game II', 'M'],
			['Gas Station', 'M'],
			['Non-overlapping Intervals', 'M'],
			['Meeting Rooms II', 'M'],
			['Minimum Number of Arrows to Burst Balloons', 'M'],
			['Partition Labels', 'M'],
			['Job Sequencing Problem', 'M'],
			['Candy', 'H']
		]
	}
];

export const BONUS_TOPICS: Topic[] = [
	{
		id: 'trie',
		name: 'Trie',
		icon: '🌲',
		phase: 9,
		concepts: ['Prefix Tree', 'Word Search Optimization'],
		problems: [
			['Implement Trie (Prefix Tree)', 'M'],
			['Design Add and Search Words Data Structure', 'M'],
			['Longest Word in Dictionary', 'M'],
			['Replace Words', 'M'],
			['Word Search II', 'H']
		]
	},
	{
		id: 'bit-manipulation',
		name: 'Bit Manipulation',
		icon: '🧷',
		phase: 9,
		concepts: ['XOR Tricks', 'Bit Masking', 'Counting Bits'],
		problems: [
			['Single Number', 'E'],
			['Number of 1 Bits', 'E'],
			['Counting Bits', 'E'],
			['Reverse Bits', 'E'],
			['Missing Number', 'E'],
			['Power of Two', 'E'],
			['Sum of Two Integers', 'M'],
			['Bitwise AND of Numbers Range', 'M'],
			['Single Number II & III', 'M']
		]
	},
	{
		id: 'math',
		name: 'Math & Number Theory',
		icon: '➗',
		phase: 9,
		concepts: ['GCD/LCM', 'Sieve of Eratosthenes', 'Modular Arithmetic'],
		problems: [
			['Roman to Integer', 'E'],
			['Integer to Roman', 'M'],
			['Pow(x, n)', 'M'],
			['GCD / LCM Basics', 'E'],
			['Sieve of Eratosthenes', 'M'],
			['Count Primes', 'M'],
			['Prime Factorization', 'M'],
			['Modular Exponentiation', 'M']
		]
	}
];

export const ALL_TOPICS: Topic[] = TOPICS.concat(BONUS_TOPICS);
