<script lang="ts">
	import type { Topic } from '$lib/types/dsa';
	import ProblemRow from './ProblemRow.svelte';
	import AddCustomProblemForm from './AddCustomProblemForm.svelte';
	import { allProblemsOf, topicStats, resetTopicProgress } from '$lib/utils/problems';

	let {
		topic,
		query,
		diffFilter,
		openIds,
		onToggleRow,
		focusAdd,
		hideHeader = false
	}: {
		topic: Topic;
		query: string;
		diffFilter: string;
		openIds: Set<string>;
		onToggleRow: (id: string) => void;
		focusAdd: boolean;
		hideHeader?: boolean;
	} = $props();

	const stats = $derived(topicStats(topic));
	const filtered = $derived(
		allProblemsOf(topic).filter((p) => {
			const q = query.toLowerCase();
			const matchQ = !q || p.name.toLowerCase().includes(q) || topic.name.toLowerCase().includes(q);
			const matchD = !diffFilter || p.diff === diffFilter;
			return matchQ && matchD;
		})
	);
</script>

{#if !hideHeader}
	<div class="mb-lg flex items-start justify-between gap-md">
		<div class="min-w-0">
			<div class="mb-xs flex items-center gap-sm">
				<span class="text-2xl">{topic.icon}</span>
				<h2 class="truncate text-headline-md text-on-surface">{topic.name}</h2>
			</div>
			<div class="flex flex-wrap gap-xs">
				{#each topic.concepts as c (c)}
					<span
						class="rounded-full border border-outline-variant px-sm py-[2px] font-mono text-label-caps
						normal-case text-on-surface-variant"
					>
						{c}
					</span>
				{/each}
			</div>
		</div>
		<span
			class="shrink-0 rounded-lg border border-outline-variant bg-surface-container-highest px-md py-xs
			font-mono text-label-caps whitespace-nowrap normal-case"
		>
			{stats.mastered}/{stats.total} Mastered
		</span>
	</div>
{/if}

<div class="flex-1 space-y-xs overflow-y-auto pr-xs">
	{#each filtered as problem (problem.id)}
		<ProblemRow
			{problem}
			{topic}
			open={openIds.has(problem.id)}
			onToggle={() => onToggleRow(problem.id)}
		/>
	{/each}
	<AddCustomProblemForm topicId={topic.id} focus={focusAdd} />
</div>

<div
	class="mt-md flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant/50 pt-md"
>
	<div class="flex gap-md font-mono text-label-caps normal-case text-on-surface-variant">
		<span class="flex items-center gap-xs"
			><span class="h-2 w-2 rounded-full bg-secondary"></span> Mastered</span
		>
		<span class="flex items-center gap-xs"
			><span class="h-2 w-2 rounded-full bg-tertiary"></span> Learning</span
		>
		<span class="flex items-center gap-xs">
			<span class="h-2 w-2 rounded-full border border-outline-variant bg-surface-container-highest"
			></span> Not Started
		</span>
	</div>
	<button
		class="font-mono text-label-caps normal-case text-error hover:underline"
		onclick={() => resetTopicProgress(topic)}
	>
		Reset progress for this topic ↻
	</button>
</div>
