<script lang="ts">
	import type { RoadmapCategory } from '$lib/types/roadmap';
	import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
	import { roadmapCategoryStats } from '$lib/utils/roadmap';

	let {
		category,
		active,
		onSelect
	}: { category: RoadmapCategory; active: boolean; onSelect: () => void } = $props();
	const stats = $derived(roadmapCategoryStats(category));
</script>

<button
	onclick={onSelect}
	class="w-full rounded-lg border p-md text-left transition-colors {active
		? 'glow-primary border-primary bg-primary/10'
		: 'border-outline-variant bg-surface-container hover:border-outline'}"
>
	<div class="mb-xs flex items-center justify-between gap-sm">
		<div class="flex min-w-0 items-center gap-sm">
			<span class="text-lg">{category.icon}</span>
			<h4 class="truncate text-body-lg font-semibold {active ? 'text-primary' : 'text-on-surface'}">
				{category.name}
			</h4>
		</div>
		<span class="shrink-0 font-mono text-data-sm text-on-surface-variant"
			>{stats.done}/{stats.total}</span
		>
	</div>
	<ProgressBar attemptPct={0} masterPct={stats.pct} />
</button>
