import { error } from '@sveltejs/kit';
import { ROADMAP_CATEGORIES } from '$lib/data/roadmap';
import { flattenAllRoadmapItems } from '$lib/utils/roadmap';
import type { RoadmapItem } from '$lib/types/roadmap';

export function load({ params }) {
	const id = params.id;
	let foundItem: RoadmapItem | null = null;
	let categoryName: string | null = null;
	let categoryIcon: string | null = null;

	for (const cat of ROADMAP_CATEGORIES) {
		const items = cat.items || [];
		const subItems = (cat.subsections || []).flatMap((sub) => sub.items);
		const all = [...items, ...subItems];
		const match = all.find((item) => item.id === id);

		if (match) {
			foundItem = match;
			categoryName = cat.name;
			categoryIcon = cat.icon;
			break;
		}
	}

	if (!foundItem) {
		throw error(404, 'Topic not found');
	}

	const flat = flattenAllRoadmapItems(ROADMAP_CATEGORIES);
	const index = flat.findIndex((i) => i.id === id);
	const prev = index > 0 ? flat[index - 1] : null;
	const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
	const groupName = index >= 0 ? (flat[index].groupName ?? null) : null;

	return {
		item: foundItem,
		categoryName,
		categoryIcon,
		groupName,
		prev,
		next,
		position: index >= 0 ? index + 1 : null,
		total: flat.length
	};
}
