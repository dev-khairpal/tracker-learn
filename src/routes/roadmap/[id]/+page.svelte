<script lang="ts">
	import { marked } from 'marked';
	import Icon from '$lib/components/layout/Icon.svelte';

	let { data } = $props();
	let item = $derived(data.item);
	let categoryName = $derived(data.categoryName);

	const htmlContent = $derived(item?.detailedMarkdown ? marked.parse(item.detailedMarkdown) : '');
</script>

<div class="mx-auto max-w-4xl py-md pr-sm md:pr-0">
	<!-- Navigation Header -->
	<div class="mb-lg flex items-center gap-sm text-body-lg text-on-surface-variant">
		<a href="/roadmap" class="hover:text-primary transition-colors flex items-center gap-1">
			<Icon name="chevron-left" class="h-5 w-5" />
			Back to Roadmap
		</a>
		<span class="text-outline-variant">/</span>
		<span>{categoryName}</span>
	</div>

	<!-- Content Container -->
	<div class="rounded-3xl surface-glass p-lg sm:p-2xl min-h-[70vh]">
		<div class="mb-xl border-b border-outline-variant/20 pb-md">
			<h1 class="text-display-sm font-bold text-on-surface mb-xs">{item.label}</h1>
		</div>

		{#if item.detailedMarkdown}
			<div class="prose prose-invert prose-emerald max-w-none text-body-lg text-on-surface-variant marker:text-primary prose-a:text-primary prose-headings:text-on-surface prose-pre:bg-surface-container-highest prose-pre:border prose-pre:border-outline-variant/30">
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
	</div>
</div>
