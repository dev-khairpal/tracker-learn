<script lang="ts">
	import type { Topic } from '$lib/types/dsa';
	import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
	import { topicStats } from '$lib/utils/problems';

	let { topic, active, onSelect }: { topic: Topic; active: boolean; onSelect: () => void } =
		$props();
	const stats = $derived(topicStats(topic));
</script>

<button
	onclick={onSelect}
	class="w-full rounded-lg border p-md text-left transition-colors {active
		? 'glow-primary border-primary bg-primary/10'
		: 'border-outline-variant bg-surface-container hover:border-outline'}"
>
	<div class="mb-xs flex items-center justify-between gap-sm">
		<div class="flex min-w-0 items-center gap-sm">
			<span class="text-lg">{topic.icon}</span>
			<h4 class="truncate text-body-lg font-semibold {active ? 'text-primary' : 'text-on-surface'}">
				{topic.name}
			</h4>
		</div>
		<span class="shrink-0 font-mono text-data-sm text-on-surface-variant">
			{stats.mastered}/{stats.total}
		</span>
	</div>
	<ProgressBar attemptPct={stats.attemptPct} masterPct={stats.masterPct} />
</button>
