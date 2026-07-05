<script lang="ts">
	import Icon from '../layout/Icon.svelte';
	import { ROADMAP_CATEGORIES } from '$lib/data/roadmap';
	import { appState } from '$lib/stores/state.svelte';

	let totalTopics = $derived.by(() => {
		let total = 0;
		for (const cat of ROADMAP_CATEGORIES) {
			if (cat.items) total += cat.items.length;
			if (cat.subsections) {
				for (const sub of cat.subsections) {
					total += sub.items.length;
				}
			}
		}
		return total;
	});

	let doneTopics = $derived.by(() => {
		let done = 0;
		for (const cat of ROADMAP_CATEGORIES) {
			if (cat.items) {
				for (const item of cat.items) {
					if (appState.roadmapDone[item.id]) done++;
				}
			}
			if (cat.subsections) {
				for (const sub of cat.subsections) {
					for (const item of sub.items) {
						if (appState.roadmapDone[item.id]) done++;
					}
				}
			}
		}
		return done;
	});

	let percent = $derived(totalTopics > 0 ? Math.round((doneTopics / totalTopics) * 100) : 0);
</script>

<div
	class="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl surface-glass p-lg group enter-fade-up"
	style="transition-delay: 200ms;"
>
	<!-- Background glow effect -->
	<div
		class="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/15 blur-[80px] group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-700 ease-out"
	></div>

	<div class="relative z-10 flex items-center justify-between mb-md">
		<div class="flex items-center gap-sm">
			<span
				class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary ring-1 ring-secondary/30"
			>
				<Icon name="roadmap" class="h-4 w-4" />
			</span>
			<span class="font-mono text-label-caps tracking-widest text-on-surface-variant uppercase"
				>Interview Roadmap</span
			>
		</div>
		<span class="text-headline-sm font-semibold text-secondary">{percent.toFixed(0)}%</span>
	</div>

	<div class="relative z-10 mt-auto">
		<div class="mb-sm flex items-center justify-between text-body-md">
			<span class="text-on-surface-variant">Progress</span>
			<span class="font-mono text-on-surface">{doneTopics} / {totalTopics} topics</span>
		</div>
		<div
			class="h-3 w-full overflow-hidden rounded-full bg-surface-container-high ring-1 ring-inset ring-outline-variant/30"
		>
			<div
				class="h-full rounded-full bg-secondary transition-all duration-1000 ease-out glow-secondary"
				style="width: {percent}%"
			></div>
		</div>
	</div>
</div>
