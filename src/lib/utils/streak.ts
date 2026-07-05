import { appState } from '$lib/stores/state.svelte';
import { todayStr } from './dates';

export function computeStreak(): { current: number; longest: number } {
	const set = new Set(appState.dailyLog);
	let current = 0;
	const d = new Date();
	if (!set.has(todayStr(d))) d.setDate(d.getDate() - 1);
	while (set.has(todayStr(d))) {
		current++;
		d.setDate(d.getDate() - 1);
	}
	let longest = 0;
	let run = 0;
	const sorted = [...set].sort();
	let prev: string | null = null;
	sorted.forEach((ds) => {
		if (prev) {
			const diff = (new Date(ds).getTime() - new Date(prev).getTime()) / 86400000;
			run = diff === 1 ? run + 1 : 1;
		} else {
			run = 1;
		}
		longest = Math.max(longest, run);
		prev = ds;
	});
	return { current, longest };
}
