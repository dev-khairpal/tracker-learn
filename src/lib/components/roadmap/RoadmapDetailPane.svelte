<script lang="ts">
	import type { RoadmapCategory } from '$lib/types/roadmap';
	import RoadmapItemRow from './RoadmapItemRow.svelte';
	import { roadmapCategoryStats } from '$lib/utils/roadmap';

	let { category, query }: { category: RoadmapCategory; query: string } = $props();
	const stats = $derived(roadmapCategoryStats(category));

	function matchesQuery(label: string): boolean {
		const q = query.trim().toLowerCase();
		return !q || label.toLowerCase().includes(q);
	}

	const flatItems = $derived((category.items ?? []).filter((i) => matchesQuery(i.label)));
	const subsections = $derived(
		(category.subsections ?? [])
			.map((sub) => ({ ...sub, items: sub.items.filter((i) => matchesQuery(i.label)) }))
			.filter((sub) => sub.items.length)
	);
</script>

<div class="mb-lg flex items-start justify-between gap-md">
	<div class="flex min-w-0 items-center gap-sm">
		<span class="text-2xl">{category.icon}</span>
		<h2 class="truncate text-headline-md text-on-surface">{category.name}</h2>
	</div>
	<span
		class="shrink-0 rounded-lg border border-outline-variant bg-surface-container-highest px-md py-xs font-mono text-label-caps whitespace-nowrap normal-case"
	>
		{stats.done}/{stats.total} Done
	</span>
</div>

<div class="flex-1 space-y-md overflow-y-auto pr-xs">
	{#if flatItems.length}
		<div class="space-y-xs">
			{#each flatItems as item (item.id)}
				<RoadmapItemRow {item} />
			{/each}
		</div>
	{/if}
	{#each subsections as sub (sub.id)}
		<div>
			<h3 class="mb-sm font-mono text-label-caps text-on-surface-variant uppercase">{sub.name}</h3>
			<div class="space-y-xs">
				{#each sub.items as item (item.id)}
					<RoadmapItemRow {item} />
				{/each}
			</div>
		</div>
	{/each}
	{#if !flatItems.length && !subsections.length}
		<p class="text-body-md text-on-surface-variant">No items match your search in this category.</p>
	{/if}
</div>
