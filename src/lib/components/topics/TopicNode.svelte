<script lang="ts">
	import type { Topic } from '$lib/types/dsa';
	import Icon from '../layout/Icon.svelte';
	import { topicStats } from '$lib/utils/problems';
	import TopicDetailPane from './TopicDetailPane.svelte';

	let {
		topic,
		index,
		isLast = false,
		expanded = false,
		onToggleExpand,
		query,
		diffFilter,
		openIds,
		onToggleRow,
		focusAdd
	}: {
		topic: Topic;
		index: number;
		isLast?: boolean;
		expanded?: boolean;
		onToggleExpand: () => void;
		query: string;
		diffFilter: string;
		openIds: Set<string>;
		onToggleRow: (id: string) => void;
		focusAdd: boolean;
	} = $props();

	const stats = $derived(topicStats(topic));
	const isDone = $derived(stats.total > 0 && stats.mastered === stats.total);
</script>

<div class="group relative flex">
	<!-- Vertical Line -->
	{#if !isLast}
		<div class="absolute top-10 left-6 bottom-[-2.5rem] w-px bg-outline-variant/30"></div>
	{/if}

	<!-- Node Marker -->
	<div
		class="relative z-10 mr-md flex h-12 w-12 shrink-0 items-center justify-center rounded-full surface-glass ring-2 {isDone
			? 'ring-primary text-primary glow-primary'
			: 'ring-outline-variant text-on-surface-variant'} transition-all duration-500"
	>
		<span class="text-xl">{topic.icon}</span>
	</div>

	<!-- Card Content -->
	<div class="mb-xl flex-1 max-w-full">
		<button
			class="w-full text-left rounded-3xl surface-glass p-lg transition-all duration-500 hover:ring-1 hover:ring-outline-variant/50 {expanded
				? 'ring-1 ring-outline-variant/50'
				: ''}"
			onclick={onToggleExpand}
		>
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-headline-sm font-semibold text-on-surface">{topic.name}</h3>
					<p class="mt-xs font-mono text-label-caps text-on-surface-variant uppercase">
						{stats.mastered} / {stats.total} Mastered
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
					style="width: {stats.total ? (stats.mastered / stats.total) * 100 : 0}%"
				></div>
			</div>

			{#if expanded}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="mt-lg border-t border-outline-variant/20 pt-md text-left cursor-default animate-fade-in"
					onclick={(e) => e.stopPropagation()}
				>
					<!-- Show Concepts directly since we hide the header -->
					{#if topic.concepts?.length}
						<div class="mb-sm flex flex-wrap gap-xs">
							{#each topic.concepts as c (c)}
								<span
									class="rounded-full border border-outline-variant px-sm py-[2px] font-mono text-label-caps normal-case text-on-surface-variant"
								>
									{c}
								</span>
							{/each}
						</div>
					{/if}

					<TopicDetailPane
						{topic}
						{query}
						{diffFilter}
						{openIds}
						{onToggleRow}
						{focusAdd}
						hideHeader={true}
					/>
				</div>
			{/if}
		</button>
	</div>
</div>
