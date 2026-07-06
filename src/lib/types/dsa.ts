import type { BrandIconName } from '$lib/utils/brand-icon';

export type Difficulty = 'E' | 'M' | 'H';

export interface Topic {
	id: string;
	name: string;
	icon: string;
	brandIcon?: BrandIconName;
	phase: number;
	concepts: string[];
	problems: [string, Difficulty][];
}

export interface CustomProblem {
	id: string;
	name: string;
	diff: Difficulty;
}

export interface ProblemState {
	intuition: boolean;
	brute: boolean;
	optimized: boolean;
	complexity: boolean;
	edgeCases: boolean;
	mistakes: boolean;
	variations: boolean;
	notes: string;
	solvedDate: string | null;
	reviewIndex: 0 | 1 | 2 | 3;
}

export const DEPTH_FIELDS = [
	'intuition',
	'brute',
	'optimized',
	'complexity',
	'edgeCases',
	'mistakes',
	'variations'
] as const;

export type DepthField = (typeof DEPTH_FIELDS)[number];

export const DEPTH_LABELS: Record<DepthField, string> = {
	intuition: 'Intuition',
	brute: 'Brute Force',
	optimized: 'Optimized',
	complexity: 'Complexity',
	edgeCases: 'Edge Cases',
	mistakes: 'Mistakes',
	variations: 'Variations'
};

export const DEPTH_HELP: Record<DepthField, string> = {
	intuition: 'I can explain the core idea out loud in under 60 seconds, without notes.',
	brute: 'I thought through (or coded) the naive brute-force approach and its complexity first.',
	optimized: 'I implemented the optimized solution myself, without copying the editorial.',
	complexity: 'I can state and justify time and space complexity.',
	edgeCases: 'I listed and handled edge cases (empty input, single element, duplicates, overflow).',
	mistakes: 'I noted a mistake I made or a common trap for this problem.',
	variations: 'I know at least one realistic interviewer follow-up / variation.'
};

export const REVIEW_INTERVALS = [1, 7, 30] as const;
export const MIXED_TARGET = 20;
export const MOCK_TARGET = 8;

export interface Company {
	id: string;
	name: string;
	rounds: string;
	patterns: string[];
	note: string;
	checklist: string[];
}

export interface Phase {
	name: string;
	ids: string[];
}

export interface MixedSession {
	date: string;
	ids: string[];
}

export interface MockInterview {
	id: string;
	date: string;
	company: string;
	round: string;
	problems: string;
	rating: string;
	weak: string;
}
