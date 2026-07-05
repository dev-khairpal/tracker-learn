<script lang="ts">
	import Icon from '../layout/Icon.svelte';
	import { dueList } from '$lib/utils/problems';

	let due = $derived(dueList());

	// Mocking a structured journey based on typical DSA progression
	const journeySteps = [
		{ id: 'arrays', title: 'Arrays & Hashing', completed: true },
		{ id: 'pointers', title: 'Two Pointers', completed: true },
		{ id: 'sliding_window', title: 'Sliding Window', completed: false, active: true, due: 2 },
		{ id: 'stack', title: 'Stack', completed: false },
		{ id: 'binary_search', title: 'Binary Search', completed: false }
	];
</script>

<div
	class="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl surface-glass p-lg shadow-2xl group enter-fade-up"
>
	<div class="mb-xs flex items-center justify-between">
		<div class="flex items-center gap-sm">
			<span
				class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary"
			>
				<Icon name="roadmap" class="h-4 w-4" />
			</span>
			<span class="font-mono text-label-caps tracking-widest text-on-surface-variant uppercase"
				>Your Journey</span
			>
		</div>
		<span class="text-data-sm text-secondary font-mono tracking-widest uppercase">Step 3 of 15</span
		>
	</div>

	<h2 class="mt-md text-headline-sm tracking-tighter text-on-surface">Next: Sliding Window</h2>
	<p class="mt-1 text-body-md text-on-surface-variant">
		Master finding subarrays that satisfy certain conditions.
	</p>

	<div class="mt-lg flex flex-col gap-sm relative">
		<!-- Journey line -->
		<div class="absolute left-4 top-2 bottom-4 w-[2px] bg-outline-variant/30 z-0"></div>

		{#each journeySteps as step, i}
			<div class="flex items-center gap-md relative z-10">
				<div
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
					{step.completed
						? 'bg-primary text-on-primary'
						: step.active
							? 'bg-secondary text-on-secondary glow-secondary ring-4 ring-secondary/20'
							: 'bg-surface-container text-on-surface-variant border border-outline-variant'} transition-all duration-300"
				>
					{#if step.completed}
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="3"
							><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
						>
					{:else if step.active}
						<span class="w-2.5 h-2.5 rounded-full bg-on-secondary"></span>
					{:else}
						<span class="text-xs font-mono">{i + 1}</span>
					{/if}
				</div>
				<div
					class="flex-1 flex justify-between items-center bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2 transition-all hover:bg-surface-container group-hover/item"
				>
					<span
						class="font-medium text-sm {step.completed
							? 'text-on-surface-variant line-through'
							: step.active
								? 'text-secondary'
								: 'text-on-surface'}"
					>
						{step.title}
					</span>
					{#if step.active && step.due}
						<span class="text-xs font-mono bg-error/20 text-error px-2 py-0.5 rounded-md">
							{step.due} due
						</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-lg">
		<a
			href="/roadmap"
			class="block w-full text-center text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors py-2 border border-outline-variant/30 rounded-xl hover:bg-surface-container-low"
		>
			View Full Roadmap
		</a>
	</div>
</div>
