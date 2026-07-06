<script lang="ts">
	import type { RoadmapCategory } from '$lib/types/roadmap';
	import { roadmapCategoryStats } from '$lib/utils/roadmap';
	import RoadmapItemRow from './RoadmapItemRow.svelte';
	import Icon from '../layout/Icon.svelte';
	import BrandIcon from '../layout/BrandIcon.svelte';

	let { category, index, isLast }: { category: RoadmapCategory; index: number; isLast: boolean } =
		$props();

	const stats = $derived(roadmapCategoryStats(category));
	const isDone = $derived(stats.total > 0 && stats.done === stats.total);
	const inProgress = $derived(stats.done > 0 && !isDone);
	let expanded = $state(false);
</script>

<div
	class="relative flex gap-md sm:gap-lg enter-fade-up group"
	style="transition-delay: {index * 100}ms;"
>
	<!-- Timeline line -->
	{#if !isLast}
		<div
			class="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-outline-variant/30 group-hover:bg-primary/50 transition-colors duration-500"
		></div>
	{/if}

	<!-- Timeline dot -->
	<div
		class="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2
		{isDone
			? 'border-primary bg-primary/20 text-primary glow-primary shadow-[0_0_15px_rgba(192,193,255,0.4)]'
			: inProgress
				? 'border-secondary bg-secondary/20 text-secondary shadow-[0_0_10px_rgba(76,215,246,0.3)]'
				: 'border-outline-variant bg-surface-container-high text-on-surface-variant'} transition-all duration-300"
	>
		{#if isDone}
			<Icon name="check" class="h-5 w-5" />
		{:else if category.brandIcon}
			<BrandIcon name={category.brandIcon} class="h-5 w-5" />
		{:else}
			<span class="text-lg">{category.icon}</span>
		{/if}
	</div>

	<!-- Content Card -->
	<div class="flex-1 pb-8">
		<button
			class="w-full surface-glass rounded-3xl p-md sm:p-lg text-left transition-all duration-300 hover:scale-[1.02] {expanded
				? 'ring-2 ring-primary/40 shadow-[0_0_20px_rgba(192,193,255,0.15)] bg-surface-container-low/40'
				: ''}"
			onclick={() => (expanded = !expanded)}
		>
			<div class="flex items-center justify-between gap-sm">
				<div class="min-w-0">
					<h3
						class="truncate text-title-lg sm:text-headline-sm font-bold {isDone
							? 'text-primary'
							: inProgress
								? 'text-secondary'
								: 'text-on-surface'} transition-colors"
					>
						{category.name}
					</h3>
					<p
						class="font-mono text-label-caps mt-1 {isDone
							? 'text-primary/70'
							: inProgress
								? 'text-secondary/80'
								: 'text-on-surface-variant'} transition-colors"
					>
						{stats.done} / {stats.total} Completed
					</p>
				</div>
				<Icon
					name="expand"
					class="h-6 w-6 text-on-surface-variant transition-transform duration-500 {expanded
						? 'rotate-180'
						: ''}"
				/>
			</div>

			<!-- Progress Bar -->
			<div
				class="mt-sm h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest ring-1 ring-inset ring-outline-variant/30"
			>
				<div
					class="h-full rounded-full transition-all duration-1000 ease-out {isDone
						? 'bg-primary glow-primary'
						: 'bg-secondary glow-secondary'}"
					style="width: {stats.total ? (stats.done / stats.total) * 100 : 0}%"
				></div>
			</div>

			{#if expanded}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="mt-lg space-y-md border-t border-outline-variant/20 pt-md text-left cursor-default animate-fade-in"
					onclick={(e) => e.stopPropagation()}
				>
					{#if category.items?.length}
						<div class="space-y-xs">
							{#each category.items as item (item.id)}
								<RoadmapItemRow {item} />
							{/each}
						</div>
					{/if}

					{#if category.subsections?.length}
						{#each category.subsections as sub (sub.id)}
							<div>
								<h4 class="mb-sm font-mono text-label-caps text-on-surface-variant uppercase">
									{sub.name}
								</h4>
								<div class="space-y-xs">
									{#each sub.items as item (item.id)}
										<RoadmapItemRow {item} />
									{/each}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</button>
	</div>
</div>
