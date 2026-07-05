import type { CustomProblem, Difficulty, ProblemState, Topic } from '$lib/types/dsa';
import { DEPTH_FIELDS, REVIEW_INTERVALS } from '$lib/types/dsa';
import { ALL_TOPICS, TOPICS } from '$lib/data/topics';
import { appState } from '$lib/stores/state.svelte';
import { todayStr } from './dates';

export interface ProblemRef {
	id: string;
	name: string;
	diff: Difficulty;
	custom: boolean;
}

export function allProblemsOf(topic: Topic): ProblemRef[] {
	const base: ProblemRef[] = topic.problems.map((p, i) => ({
		id: topic.id + '-' + i,
		name: p[0],
		diff: p[1],
		custom: false
	}));
	// NB: the original vanilla app never set `custom: true` on user-added
	// problems, so the "custom" tag and delete button never actually rendered
	// for them — fixed here.
	const custom: ProblemRef[] = (appState.customProblems[topic.id] || []).map((c) => ({
		...c,
		custom: true
	}));
	return base.concat(custom);
}

export function emptyProblemState(): ProblemState {
	return {
		intuition: false,
		brute: false,
		optimized: false,
		complexity: false,
		edgeCases: false,
		mistakes: false,
		variations: false,
		notes: '',
		solvedDate: null,
		reviewIndex: 0
	};
}

export function ensureProblemState(pid: string): ProblemState {
	if (!appState.problemState[pid]) appState.problemState[pid] = emptyProblemState();
	return appState.problemState[pid];
}

export type ProblemStatusClass = 'notstarted' | 'learning' | 'solved' | 'mastered';

export interface ProblemStatus {
	count: number;
	label: string;
	cls: ProblemStatusClass;
}

export function problemStatus(pid: string): ProblemStatus {
	const p = appState.problemState[pid];
	if (!p) return { count: 0, label: 'Not Started', cls: 'notstarted' };
	const count = DEPTH_FIELDS.filter((f) => p[f]).length;
	if (count === 0) return { count, label: 'Not Started', cls: 'notstarted' };
	if (count < 7) return { count, label: 'Learning', cls: 'learning' };
	if (p.reviewIndex >= 3) return { count, label: 'Mastered', cls: 'mastered' };
	return { count, label: 'Reviewed ' + p.reviewIndex + '/3', cls: 'solved' };
}

export interface TopicStats {
	total: number;
	mastered: number;
	attempted: number;
	masterPct: number;
	attemptPct: number;
}

export function topicStats(topic: Topic): TopicStats {
	const all = allProblemsOf(topic);
	let mastered = 0;
	let attempted = 0;
	all.forEach((p) => {
		const st = problemStatus(p.id);
		if (st.cls === 'mastered') mastered++;
		if (st.count > 0) attempted++;
	});
	const total = all.length;
	return {
		total,
		mastered,
		attempted,
		masterPct: total ? Math.round((mastered / total) * 100) : 0,
		attemptPct: total ? Math.round((attempted / total) * 100) : 0
	};
}

export function overallStats(): { mastered: number; attempted: number; total: number } {
	let mastered = 0;
	let attempted = 0;
	let total = 0;
	TOPICS.forEach((t) => {
		const s = topicStats(t);
		mastered += s.mastered;
		attempted += s.attempted;
		total += s.total;
	});
	return { mastered, attempted, total };
}

export function leetSearchUrl(name: string): string {
	return (
		'https://leetcode.com/problemset/?search=' + encodeURIComponent(name.replace(/<[^>]*>/g, ''))
	);
}

export function reviewDueDate(p: ProblemState): Date | null {
	if (!p.solvedDate) return null;
	if (p.reviewIndex === 3) return null;
	const days = REVIEW_INTERVALS[p.reviewIndex];
	const d = new Date(p.solvedDate + 'T00:00:00');
	d.setDate(d.getDate() + days);
	return d;
}

export function isDue(p: ProblemState): boolean {
	const due = reviewDueDate(p);
	if (!due) return false;
	return due.getTime() <= Date.now();
}

export interface TrackedProblem extends ProblemRef {
	topic: Topic;
}

export function allTrackedProblems(): TrackedProblem[] {
	const list: TrackedProblem[] = [];
	ALL_TOPICS.forEach((t) => allProblemsOf(t).forEach((p) => list.push({ ...p, topic: t })));
	return list;
}

export function dueList(): TrackedProblem[] {
	return allTrackedProblems().filter((p) => {
		const st = appState.problemState[p.id];
		return st && problemStatus(p.id).count === 7 && isDue(st);
	});
}

export function markRevised(pid: string) {
	const st = ensureProblemState(pid);
	if (st.reviewIndex < 3) st.reviewIndex++;
	logToday();
	appState.dailyLog = appState.dailyLog;
}

export function logToday() {
	const t = todayStr();
	if (!appState.dailyLog.includes(t)) appState.dailyLog.push(t);
}

export function nextTargetProblem(): { problem: ProblemRef; topic: Topic } | null {
	for (const t of TOPICS) {
		for (const p of allProblemsOf(t)) {
			if (problemStatus(p.id).cls !== 'mastered') return { problem: p, topic: t };
		}
	}
	return null;
}

export function resetTopicProgress(topic: Topic) {
	if (!confirm('Reset all progress for "' + topic.name + '"? This cannot be undone.')) return;
	allProblemsOf(topic).forEach((p) => {
		delete appState.problemState[p.id];
	});
}

export function addCustomProblem(topicId: string, name: string, diff: Difficulty) {
	appState.customProblems[topicId] = appState.customProblems[topicId] || [];
	const cid = topicId + '-custom-' + Date.now();
	const entry: CustomProblem = { id: cid, name, diff };
	appState.customProblems[topicId].push(entry);
}

export function deleteCustomProblem(topicId: string, pid: string) {
	appState.customProblems[topicId] = (appState.customProblems[topicId] || []).filter(
		(p) => p.id !== pid
	);
	delete appState.problemState[pid];
}

/** Whether a topic should appear in the master list for a given search query
 *  + difficulty filter — a topic is hidden only when the query is non-empty
 *  AND no problem matches (by name/topic-name/difficulty) AND the topic's
 *  own name doesn't match either. Difficulty alone never hides a topic. */
export function topicVisible(topic: Topic, query: string, diffFilter: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	const filtered = allProblemsOf(topic).filter((p) => {
		const matchQ = p.name.toLowerCase().includes(q) || topic.name.toLowerCase().includes(q);
		const matchD = !diffFilter || p.diff === diffFilter;
		return matchQ && matchD;
	});
	return filtered.length > 0 || topic.name.toLowerCase().includes(q);
}
