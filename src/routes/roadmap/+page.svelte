<script lang="ts">
	import { ROADMAP_CATEGORIES } from '$lib/data/roadmap';
	import { overallRoadmapStats } from '$lib/utils/roadmap';
	import RoadmapNode from '$lib/components/roadmap/RoadmapNode.svelte';

	const overall = $derived(overallRoadmapStats(ROADMAP_CATEGORIES));
</script>

<div class="mx-auto max-w-[768px] py-md pr-sm md:pr-0">
	<div class="mb-xl flex w-full flex-col items-center text-center enter-fade-up">
		<div
			class="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 mb-md border border-primary/20 glow-primary"
		>
			<span class="font-mono text-label-caps text-primary tracking-widest uppercase"
				>The Journey</span
			>
		</div>
		<h1 class="text-display-sm tracking-tighter text-on-surface mb-sm w-full">Interview Roadmap</h1>
		<p class="text-body-lg text-on-surface-variant w-full max-w-[576px]">
			A step-by-step path to master all concepts required for your upcoming interviews. Follow the
			glowing path to ensure you have no knowledge gaps.
		</p>

		<div
			class="mt-lg flex w-full max-w-[576px] justify-center gap-xl rounded-3xl surface-glass p-md px-xl"
		>
			<div class="flex flex-col items-center">
				<span class="text-headline-md font-bold text-primary"
					>{Math.round(overall.total > 0 ? (overall.done / overall.total) * 100 : 0)}%</span
				>
				<span class="font-mono text-label-caps text-on-surface-variant">Overall Progress</span>
			</div>
			<div class="w-px bg-outline-variant/30 h-14"></div>
			<div class="flex flex-col items-center">
				<span class="text-headline-md font-bold text-secondary"
					>{overall.done} / {overall.total}</span
				>
				<span class="font-mono text-label-caps text-on-surface-variant">Topics Mastered</span>
			</div>
		</div>
	</div>

	<div class="relative pl-xs md:pl-lg">
		{#each ROADMAP_CATEGORIES as category, index (category.id)}
			<RoadmapNode {category} {index} isLast={index === ROADMAP_CATEGORIES.length - 1} />
		{/each}
	</div>
</div>
