<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import TopicNode from '$lib/components/topics/TopicNode.svelte';
	import Icon from '$lib/components/layout/Icon.svelte';
	import { TOPICS, BONUS_TOPICS, ALL_TOPICS } from '$lib/data/topics';
	import { topicVisible, overallStats } from '$lib/utils/problems';
	import { globalSearch } from '$lib/stores/search.svelte';

	const initialOpenId = page.url.searchParams.get('open');
	const focusAdd = $derived(page.url.searchParams.get('focusAdd') === '1');

	let diffFilter = $state('');
	let expandedTopicId = $state<string | null>(page.url.searchParams.get('topic') || null);
	const openIds = new SvelteSet<string>(initialOpenId ? [initialOpenId] : []);

	onMount(() => {
		if (initialOpenId) {
			document.getElementById('problem-' + initialOpenId)?.scrollIntoView({ block: 'center' });
		}
	});

	const visibleTopics = $derived(
		TOPICS.filter((t) => topicVisible(t, globalSearch.query, diffFilter))
	);
	const visibleBonus = $derived(
		BONUS_TOPICS.filter((t) => topicVisible(t, globalSearch.query, diffFilter))
	);

	function toggleRow(id: string) {
		if (openIds.has(id)) openIds.delete(id);
		else openIds.add(id);
	}

	function toggleExpand(id: string) {
		if (expandedTopicId === id) {
			expandedTopicId = null;
		} else {
			expandedTopicId = id;
		}
	}

	const overall = $derived(overallStats());
</script>

<svelte:head>
	<title>DSA Topics - Command Center</title>
</svelte:head>

<div class="mx-auto max-w-[768px] py-md pr-sm md:pr-0">
	<div class="mb-xl flex w-full flex-col items-center text-center enter-fade-up">
		<div
			class="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 mb-md border border-primary/20 glow-primary"
		>
			<span class="font-mono text-label-caps text-primary tracking-widest uppercase"
				>The Foundation</span
			>
		</div>
		<h1 class="text-display-sm tracking-tighter text-on-surface mb-sm w-full">DSA Topics</h1>
		<p class="text-body-lg text-on-surface-variant w-full max-w-[576px]">
			Master the core data structures and algorithms required to ace technical interviews.
		</p>

		<div
			class="mt-lg flex w-full max-w-[576px] justify-center gap-xl rounded-3xl surface-glass p-md px-xl"
		>
			<div class="flex flex-col items-center">
				<span class="text-headline-md font-bold text-primary"
					>{Math.round(overall.total > 0 ? (overall.mastered / overall.total) * 100 : 0)}%</span
				>
				<span class="font-mono text-label-caps text-on-surface-variant">Overall Progress</span>
			</div>
			<div class="w-px bg-outline-variant/30 h-14"></div>
			<div class="flex flex-col items-center">
				<span class="text-headline-md font-bold text-secondary"
					>{overall.mastered} / {overall.total}</span
				>
				<span class="font-mono text-label-caps text-on-surface-variant">Problems Mastered</span>
			</div>
		</div>

		<!-- Search and Filter Bar -->
		<div class="mt-xl flex w-full max-w-[576px] items-center gap-sm">
			<div class="relative flex-1">
				<Icon
					name="search"
					class="absolute top-1/2 left-sm h-4 w-4 -translate-y-1/2 text-on-surface-variant"
				/>
				<input
					type="text"
					placeholder="Search a problem or topic..."
					bind:value={globalSearch.query}
					class="w-full rounded-full border border-outline-variant bg-surface-container-lowest py-sm pr-md pl-xl text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>
			<select
				bind:value={diffFilter}
				class="rounded-full border border-outline-variant bg-surface-container-highest px-md py-sm font-mono text-label-caps normal-case focus:outline-none focus:ring-1 focus:ring-primary"
			>
				<option value="">All diffs</option>
				<option value="E">Easy</option>
				<option value="M">Medium</option>
				<option value="H">Hard</option>
			</select>
		</div>
	</div>

	<div class="relative pl-xs md:pl-lg">
		{#if !visibleTopics.length && !visibleBonus.length}
			<p class="p-md text-center text-body-md text-on-surface-variant">
				No topics or problems match your search.
			</p>
		{/if}

		{#each visibleTopics as topic, index (topic.id)}
			<TopicNode
				{topic}
				{index}
				isLast={index === visibleTopics.length - 1 && visibleBonus.length === 0}
				expanded={expandedTopicId === topic.id}
				onToggleExpand={() => toggleExpand(topic.id)}
				query={globalSearch.query}
				{diffFilter}
				{openIds}
				onToggleRow={toggleRow}
				{focusAdd}
			/>
		{/each}

		{#if visibleBonus.length > 0}
			<div class="my-xl flex items-center justify-center gap-md">
				<div class="h-px w-16 bg-outline-variant/30"></div>
				<span class="font-mono text-label-caps tracking-widest text-on-surface-variant uppercase"
					>Bonus Patterns</span
				>
				<div class="h-px w-16 bg-outline-variant/30"></div>
			</div>

			{#each visibleBonus as topic, index (topic.id)}
				<TopicNode
					{topic}
					{index}
					isLast={index === visibleBonus.length - 1}
					expanded={expandedTopicId === topic.id}
					onToggleExpand={() => toggleExpand(topic.id)}
					query={globalSearch.query}
					{diffFilter}
					{openIds}
					onToggleRow={toggleRow}
					{focusAdd}
				/>
			{/each}
		{/if}
	</div>
</div>
