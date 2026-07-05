<script lang="ts">
	import Icon from '../layout/Icon.svelte';
	import { dueList } from '$lib/utils/problems';

	let due = $derived(dueList());
</script>

<div
	class="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl surface-glass p-lg shadow-2xl group enter-fade-up"
	style="transition-delay: 100ms;"
>
	<!-- Dynamic gradient glow effect -->
	<div
		class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px] group-hover:bg-primary/40 group-hover:scale-125 transition-all duration-700 ease-out"
	></div>
	<div
		class="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-secondary/15 blur-[60px] group-hover:bg-secondary/30 group-hover:scale-110 transition-all duration-700 ease-out"
	></div>

	<div class="relative z-10">
		<div class="mb-xs flex items-center gap-sm">
			<span
				class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary ring-1 ring-primary/30"
			>
				<Icon name="radar" class="h-4 w-4" />
			</span>
			<span class="font-mono text-label-caps tracking-widest text-on-surface-variant uppercase"
				>Command Center</span
			>
		</div>

		<h2 class="mt-md text-headline-lg tracking-tighter text-on-surface">Ready to level up?</h2>

		{#if due.length > 0}
			<p class="mt-sm max-w-[448px] text-body-lg text-on-surface-variant font-medium">
				You have <span
					class="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-primary/20 text-primary ring-1 ring-primary/40 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)] mx-1"
					>{due.length}</span
				> DSA problems due for revision.
			</p>
		{:else}
			<p class="mt-sm max-w-[448px] text-body-lg text-on-surface-variant">
				Your revision queue is empty. Keep pushing forward on your journey!
			</p>
		{/if}
	</div>

	<div class="relative z-10 mt-xl flex flex-wrap gap-sm">
		{#if due.length > 0}
			<a
				href="/topics"
				class="glow-primary flex items-center gap-2 rounded-xl bg-primary px-lg py-md font-semibold text-on-primary transition-all duration-300 hover:scale-105 hover:bg-primary-container hover:text-on-primary-container"
			>
				Start Revision <Icon name="flame" class="h-5 w-5" />
			</a>
		{:else}
			<a
				href="/knowledge"
				class="glow-primary flex items-center gap-2 rounded-xl bg-primary px-lg py-md font-semibold text-on-primary transition-all duration-300 hover:scale-105 hover:bg-primary-container hover:text-on-primary-container"
			>
				Explore Roadmap <Icon name="roadmap" class="h-5 w-5" />
			</a>
		{/if}
		<a
			href="/topics"
			class="flex items-center gap-2 rounded-xl surface-glass px-lg py-md font-semibold text-on-surface hover:text-primary transition-all duration-300 hover:scale-105"
		>
			Browse Topics
		</a>
	</div>
</div>
