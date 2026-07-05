import { error } from '@sveltejs/kit';
import { ROADMAP_CATEGORIES } from '$lib/data/roadmap';
import type { RoadmapItem } from '$lib/types/roadmap';

export function load({ params }) {
	const id = params.id;
	let foundItem: RoadmapItem | null = null;
	let categoryName: string | null = null;

	for (const cat of ROADMAP_CATEGORIES) {
		const items = cat.items || [];
		const subItems = (cat.subsections || []).flatMap((sub) => sub.items);
		const all = [...items, ...subItems];
		const match = all.find((item) => item.id === id);

		if (match) {
			foundItem = match;
			categoryName = cat.name;
			break;
		}
	}

	if (!foundItem) {
		throw error(404, 'Topic not found');
	}

	return {
		item: foundItem,
		categoryName
	};
}
