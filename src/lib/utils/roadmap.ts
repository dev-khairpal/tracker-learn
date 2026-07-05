import type { RoadmapCategory } from '$lib/types/roadmap';
import { appState } from '$lib/stores/state.svelte';

export interface FlatRoadmapItem {
	id: string;
	label: string;
	group?: string;
}

export function allItemsOf(category: RoadmapCategory): FlatRoadmapItem[] {
	const flat = (category.items ?? []).map((i) => ({ id: i.id, label: i.label }));
	const grouped = (category.subsections ?? []).flatMap((s) =>
		s.items.map((i) => ({ id: i.id, label: i.label, group: s.name }))
	);
	return flat.concat(grouped);
}

export function roadmapCategoryStats(category: RoadmapCategory): {
	total: number;
	done: number;
	pct: number;
} {
	const all = allItemsOf(category);
	const done = all.filter((i) => appState.roadmapDone[i.id]).length;
	const total = all.length;
	return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function overallRoadmapStats(categories: RoadmapCategory[]): {
	total: number;
	done: number;
} {
	let total = 0;
	let done = 0;
	categories.forEach((c) => {
		const s = roadmapCategoryStats(c);
		total += s.total;
		done += s.done;
	});
	return { total, done };
}
