<script lang="ts">
	import { goto } from '$app/navigation';
	import { nextTargetProblem } from '$lib/utils/problems';

	const target = $derived(nextTargetProblem());

	function go() {
		if (!target) return;
		goto(`/topics?topic=${target.topic.id}&open=${encodeURIComponent(target.problem.id)}`);
	}
</script>

{#if target}
	<button
		onclick={go}
		title="Next target: {target.topic.name}: {target.problem.name}"
		class="glow-primary fixed right-md bottom-md z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform hover:scale-105 sm:right-lg sm:bottom-lg sm:h-auto sm:w-auto sm:gap-md sm:rounded-full sm:p-md"
	>
		<span class="text-xl">🚀</span>
		<div class="hidden pr-sm text-left sm:block">
			<p class="font-mono text-label-caps leading-none font-bold opacity-90">NEXT TARGET</p>
			<p class="text-[12px] font-medium">
				{target.topic.icon}
				{target.topic.name}: {target.problem.name}
			</p>
		</div>
	</button>
{/if}
