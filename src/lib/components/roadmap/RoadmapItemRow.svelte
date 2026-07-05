<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import type { RoadmapItem } from '$lib/types/roadmap';
	import Icon from '../layout/Icon.svelte';

	let { item }: { item: RoadmapItem } = $props();
	const checked = $derived(!!appState.roadmapDone[item.id]);
</script>

<div
	class="flex flex-col rounded-md border border-outline-variant/60 bg-surface-container-lowest transition-colors overflow-hidden group"
>
	<div
		class="flex items-center justify-between px-md py-sm hover:bg-surface-variant/20 transition-colors"
	>
		<label class="flex cursor-pointer items-center gap-sm flex-1 text-body-md">
			<input
				type="checkbox"
				{checked}
				onchange={(e) => (appState.roadmapDone[item.id] = e.currentTarget.checked)}
				class="rounded border-outline-variant text-primary focus:ring-primary"
			/>
			<span class={checked ? 'text-on-surface-variant line-through' : 'text-on-surface'}
				>{item.label}</span
			>
		</label>
		{#if item.definition || item.useCase || item.detailedMarkdown}
			<a
				href={`/roadmap/${item.id}`}
				class="rounded-full bg-primary/10 px-3 py-1 text-label-caps font-mono font-bold text-primary opacity-0 transition-all duration-300 hover:bg-primary/20 group-hover:opacity-100 flex items-center gap-1 uppercase tracking-wider"
				title="Study in depth"
			>
				Study <Icon name="chevron-right" class="h-4 w-4" />
			</a>
		{/if}
	</div>
</div>
