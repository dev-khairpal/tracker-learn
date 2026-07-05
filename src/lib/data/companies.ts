import type { Company } from '$lib/types/dsa';

export const COMPANIES: Company[] = [
	{
		id: 'google',
		name: 'Google',
		rounds:
			'Resume screen → Online Assessment → Technical phone screen → Onsite loop (2–3 coding rounds + system design + behavioral). Coding is done on a whiteboard/shared doc — no autocomplete or run button.',
		patterns: [
			'Graphs',
			'Trees',
			'Dynamic Programming',
			'String Manipulation',
			'Sorting',
			'Binary Search'
		],
		note: '2026 update: Google is piloting a "code comprehension" round for some junior/mid US roles — reading, debugging and optimizing an existing codebase with Gemini as an assistant, replacing one traditional coding round. Communication and reasoning clarity are graded as heavily as correctness.',
		checklist: [
			'Practice coding on paper / plain doc without an IDE',
			'Practice narrating your thought process out loud',
			'Drill graph + DP patterns until timing is under 25 min/medium',
			'Do 2 mock interviews focused on communication'
		]
	},
	{
		id: 'amazon',
		name: 'Amazon',
		rounds:
			'Online Assessment (single proctored 2–3.5 hr session: 2 DSA problems + Leadership Principles work-style survey, sometimes + debugging/logical reasoning) → Loop of 60-min rounds (3–4, includes a Bar Raiser) → HR.',
		patterns: [
			'Arrays / Two Pointers',
			'Sliding Window',
			'Hashing',
			'Trees (BFS/DFS)',
			'Graphs (shortest path, topo sort, DSU)',
			'Dynamic Programming',
			'Heaps',
			'Binary Search on Answer'
		],
		note: 'Leadership Principles carry equal weight to coding — weak LP answers can sink an otherwise perfect technical round. The Bar Raiser (from a different org, cross-team veto power) asks the hardest DSA + most pointed LP questions. Recent 2026 loops lean heavily on DP and Graph Theory.',
		checklist: [
			'Prepare 2 STAR stories per Leadership Principle',
			'Practice DSU / graph problems at medium-hard level',
			'Time-box OA practice to 90 min for 2 problems',
			'Practice explaining trade-offs out loud for the Bar Raiser'
		]
	},
	{
		id: 'microsoft',
		name: 'Microsoft',
		rounds:
			'Online Assessment → 2–4 technical rounds (DSA + OOD) → System Design (for SDE2+) → As-Appropriate/HR round.',
		patterns: [
			'Trees',
			'Linked Lists',
			'Arrays/Strings',
			'OOD basics',
			'Easy–Medium LeetCode depth over breadth'
		],
		note: 'Microsoft interviews tend to be slightly friendlier on raw difficulty than Google/Amazon but weigh clean, bug-free code and clear edge-case handling heavily; senior roles add a dedicated system/LLD round.',
		checklist: [
			'Practice writing bug-free code on the first attempt',
			'Review basic OOD principles (SOLID, encapsulation)',
			'Focus depth over breadth on trees and linked lists'
		]
	},
	{
		id: 'adobe',
		name: 'Adobe',
		rounds:
			'Typically 3 DSA-focused rounds (2–3 questions per round) plus a system design/LLD round for experienced hires.',
		patterns: [
			'Trees',
			'Arrays',
			'Sorting',
			'Dynamic Programming',
			'Two Pointers',
			'Graphs (senior roles)'
		],
		note: "Adobe's coding problems mainly revolve around DP, core DSA fundamentals and two-pointers; graph and advanced data structure questions show up more for senior/experienced candidates. Active India hiring loops reported in Bengaluru through mid-2026.",
		checklist: [
			'Drill tree traversal variants until automatic',
			'Practice two-pointer problems for speed',
			'Revise DP fundamentals (1D/2D tabulation)',
			'Senior candidates: prep graphs + one LLD case study'
		]
	},
	{
		id: 'atlassian',
		name: 'Atlassian',
		rounds:
			'"Coding & Design" stage = 2 rounds: one DSA (easy–medium) + one Low-Level Design, plus a basic system design conversation for senior roles.',
		patterns: ['Easy–Medium LeetCode', 'Low-Level Design (OOD)', 'Code Quality & Extensibility'],
		note: 'Atlassian grades on code quality, extensibility and how well your design scales up — not on solving the hardest possible problem. A clean, well-tested easy/medium solution beats a messy hard one.',
		checklist: [
			'Practice classic LLD problems (Parking Lot, Splitwise, Elevator)',
			'Focus on clean OOP code and naming',
			'Practice easy-medium problems under a strict timer'
		]
	},
	{
		id: 'flipkart',
		name: 'Flipkart',
		rounds:
			'Online Assessment (90 min, 3 DSA medium–hard problems on HackerRank/HackerEarth) → Machine Coding round (build a working console app in ~90 min) → 2 technical rounds → System Design (SDE2+) → HR.',
		patterns: ['Arrays', 'Strings', 'Dynamic Programming', 'Graphs', 'Trees', 'Greedy'],
		note: "The Machine Coding round is Flipkart's signature differentiator — you design and implement a working mini-application (e.g. a booking system) from scratch under time pressure, not just solve an algorithm.",
		checklist: [
			'Practice a timed 90-minute machine coding exercise end-to-end',
			'Drill medium-hard OA-style problems under time pressure',
			'SDE2+: review e-commerce/marketplace system design case studies'
		]
	},
	{
		id: 'walmart',
		name: 'Walmart Global Tech',
		rounds:
			'MCQ + coding Online Assessment → 2 technical rounds (DSA + System/Low-Level Design) → Hiring Manager round.',
		patterns: [
			'Arrays & Strings',
			'Hashing',
			'Trees',
			'Graphs',
			'Dynamic Programming',
			'Java Concurrency (backend roles)'
		],
		note: "Arrays, DP, hashing and trees make up roughly 70% of reported DSA questions. DSA Round 1 is a 60-minute round with two medium LeetCode problems — you're expected to explain your approach before coding and justify time/space complexity. SDE2+ LLD favorites: Parking Lot, Inventory Management, Notification System (Observer/Factory patterns).",
		checklist: [
			'Practice explaining your approach out loud before writing code',
			'Review Java multithreading/concurrency basics if applying backend',
			'Practice the common LLD case studies (Parking Lot, Notification System)'
		]
	},
	{
		id: 'uber',
		name: 'Uber',
		rounds:
			'Online Assessment (3 DSA problems: easy-medium, easy-medium, hard) → ~1 hour live coding round → additional hard-level technical rounds.',
		patterns: ['Graphs', 'Dynamic Programming', 'Hard-level Arrays/Strings problems'],
		note: "Uber's bar rises sharply after the OA — expect a genuinely hard problem in the live round, not just medium difficulty.",
		checklist: [
			'Practice hard-level graph and DP problems specifically',
			'Simulate a 60-minute live-coding mock with a strict clock'
		]
	},
	{
		id: 'razorpay',
		name: 'Razorpay',
		rounds:
			'DSA round(s) + Low-Level/System Design round(s), loop structure and bar often shared with fintech peers (Paytm, FanCode) for SDE2/SSE hiring.',
		patterns: [
			'Dynamic Programming',
			'Graphs',
			'Low-Level Design',
			'Concurrency & Consistency (money-movement systems)'
		],
		note: 'Because Razorpay builds payment infrastructure, interviewers probe correctness under concurrency and failure — idempotency, consistency, and data-integrity reasoning matter as much as raw DSA speed.',
		checklist: [
			'Practice designing idempotent APIs / ledger-style systems',
			'Solve medium-hard DP and graph problems',
			'Review database transaction and concurrency basics'
		]
	}
];

export const AVATAR_TINTS: [string, string][] = [
	['#e2e8f0', '#334155'],
	['#dbeafe', '#1e40af'],
	['#dcfce7', '#166534'],
	['#fef3c7', '#92400e'],
	['#ede9fe', '#5b21b6'],
	['#ffe4e6', '#9f1239'],
	['#cffafe', '#155e75'],
	['#f4f4f5', '#3f3f46'],
	['#ccfbf1', '#115e59']
];
