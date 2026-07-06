<script lang="ts">
	import { marked } from 'marked';
	import Icon from '$lib/components/layout/Icon.svelte';
	import BrandIcon from '$lib/components/layout/BrandIcon.svelte';
	import { appState } from '$lib/stores/state.svelte';

	let { data } = $props();
	let item = $derived(data.item);
	let categoryName = $derived(data.categoryName);
	let categoryIcon = $derived(data.categoryIcon);
	let categoryBrandIcon = $derived(data.categoryBrandIcon);
	let groupName = $derived(data.groupName);
	let prev = $derived(data.prev);
	let next = $derived(data.next);
	let position = $derived(data.position);
	let total = $derived(data.total);

	const htmlContent = $derived(item?.detailedMarkdown ? marked.parse(item.detailedMarkdown) : '');
	const wordCount = $derived(
		item?.detailedMarkdown ? item.detailedMarkdown.trim().split(/\s+/).length : 0
	);
	const readMins = $derived(Math.max(1, Math.round(wordCount / 200)));
	const done = $derived(!!appState.roadmapDone[item?.id]);
</script>

<div class="mx-auto max-w-[820px] py-md pr-sm md:pr-0">
	<!-- Navigation Header -->
	<div class="mb-md flex flex-wrap items-center gap-sm text-body-md text-on-surface-variant">
		<a
			href="/roadmap"
			class="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
		>
			<Icon name="chevron-left" class="h-4 w-4" />
			Roadmap
		</a>
		<span class="text-outline-variant">/</span>
		<span class="flex items-center gap-1 shrink-0">
			{#if categoryBrandIcon}
				<BrandIcon name={categoryBrandIcon} class="h-4 w-4" />
			{:else}
				<span>{categoryIcon}</span>
			{/if}{categoryName}
		</span>
		{#if groupName}
			<span class="text-outline-variant">/</span>
			<span class="shrink-0">{groupName}</span>
		{/if}
		{#if position && total}
			<span class="ml-auto shrink-0 font-mono text-label-caps text-outline-variant"
				>{position} / {total}</span
			>
		{/if}
	</div>

	<!-- Content Container -->
	<article class="rounded-3xl surface-glass p-lg sm:p-2xl min-h-[70vh]">
		<header class="mb-xl border-b border-outline-variant/20 pb-lg">
			<div class="flex flex-wrap items-start justify-between gap-md">
				<h1 class="text-display-sm font-bold text-on-surface tracking-tight">{item.label}</h1>
				<button
					onclick={() => (appState.roadmapDone[item.id] = !done)}
					class="flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-label-caps font-mono uppercase tracking-wider transition-colors {done
						? 'border-primary/30 bg-primary/10 text-primary'
						: 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'}"
				>
					<Icon name="check" class="h-3.5 w-3.5" />
					{done ? 'Studied' : 'Mark as studied'}
				</button>
			</div>
			{#if item.detailedMarkdown}
				<p
					class="mt-sm flex items-center gap-1.5 font-mono text-label-caps text-on-surface-variant"
				>
					<Icon name="clock" class="h-3.5 w-3.5" />
					{readMins} min read
				</p>
			{/if}
		</header>

		{#if item.detailedMarkdown}
			{#if item.definition}
				<div class="mb-xl rounded-2xl border border-primary/20 bg-primary/5 p-lg not-prose">
					<h3
						class="mb-xs flex items-center gap-2 text-label-caps font-mono uppercase text-primary"
					>
						<Icon name="info" class="h-4 w-4" /> TL;DR
					</h3>
					<p class="text-body-lg leading-relaxed text-on-surface">{item.definition}</p>
					{#if item.useCase}
						<p class="mt-sm text-body-md leading-relaxed text-on-surface-variant">
							<span class="font-semibold text-secondary">In practice: </span>{item.useCase}
						</p>
					{/if}
				</div>
			{/if}
			<div
				class="prose prose-invert max-w-none text-body-lg leading-[1.75] text-on-surface-variant marker:text-primary prose-headings:text-on-surface prose-headings:tracking-tight prose-h1:hidden prose-h2:mt-2xl prose-h2:text-headline-sm prose-h3:text-title-lg prose-strong:text-on-surface prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary/40 prose-blockquote:not-italic prose-blockquote:text-on-surface-variant prose-code:rounded prose-code:bg-surface-container-highest prose-code:px-1.5 prose-code:py-0.5 prose-code:text-secondary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:bg-surface-container-lowest prose-pre:border prose-pre:border-outline-variant/30 prose-table:text-body-md prose-th:text-on-surface prose-hr:border-outline-variant/20"
			>
				{@html htmlContent}
			</div>
		{:else if item.definition}
			<div class="space-y-xl">
				<div class="rounded-2xl border border-primary/20 bg-primary/5 p-lg">
					<h3 class="mb-sm flex items-center gap-2 text-title-lg font-bold text-primary">
						<Icon name="info" class="h-6 w-6" /> Definition
					</h3>
					<p class="text-body-lg leading-relaxed text-on-surface-variant">{item.definition}</p>
				</div>
				{#if item.useCase}
					<div class="rounded-2xl border border-secondary/20 bg-secondary/5 p-lg">
						<h3 class="mb-sm flex items-center gap-2 text-title-lg font-bold text-secondary">
							<Icon name="briefcase" class="h-6 w-6" /> Use Case
						</h3>
						<p class="text-body-lg leading-relaxed text-on-surface-variant">{item.useCase}</p>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex h-64 flex-col items-center justify-center text-center">
				<Icon name="info" class="mb-md h-12 w-12 text-outline-variant" />
				<p class="text-title-lg text-on-surface-variant">Detailed explanation coming soon.</p>
			</div>
		{/if}
	</article>

	<!-- Prev / Next -->
	<div class="mt-lg grid grid-cols-1 gap-sm sm:grid-cols-2">
		{#if prev}
			<a
				href={`/roadmap/${prev.id}`}
				class="group flex items-center gap-sm rounded-2xl border border-outline-variant bg-surface-container p-md transition-colors hover:border-outline"
			>
				<Icon
					name="chevron-left"
					class="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:-translate-x-0.5"
				/>
				<div class="min-w-0">
					<p class="font-mono text-label-caps text-on-surface-variant">Previous</p>
					<p class="truncate text-body-md text-on-surface">{prev.label}</p>
				</div>
			</a>
		{:else}
			<div></div>
		{/if}
		{#if next}
			<a
				href={`/roadmap/${next.id}`}
				class="group flex items-center justify-end gap-sm rounded-2xl border border-outline-variant bg-surface-container p-md text-right transition-colors hover:border-outline"
			>
				<div class="min-w-0">
					<p class="font-mono text-label-caps text-on-surface-variant">Next</p>
					<p class="truncate text-body-md text-on-surface">{next.label}</p>
				</div>
				<Icon
					name="chevron-right"
					class="h-5 w-5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5"
				/>
			</a>
		{/if}
	</div>
</div>
