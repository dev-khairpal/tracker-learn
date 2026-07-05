<script lang="ts">
	import Icon from '../layout/Icon.svelte';
	import { overallStats, dueList } from '$lib/utils/problems';
	import { computeStreak } from '$lib/utils/streak';

	const stats = $derived(overallStats());
	const masterPct = $derived(stats.total ? Math.round((stats.mastered / stats.total) * 100) : 0);
	const due = $derived(dueList().length);
	const streak = $derived(computeStreak().current);
</script>

<div class="grid h-full grid-cols-2 grid-rows-2 gap-sm">
	<!-- Streak -->
	<div
		class="relative flex flex-col items-center justify-center rounded-3xl surface-glass p-md group enter-fade-up"
		style="transition-delay: 250ms;"
	>
		<Icon
			name="flame"
			class="mb-xs h-8 w-8 text-tertiary transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(78,222,163,0.8)]"
		/>
		<span class="text-headline-sm font-bold text-on-surface">{streak}</span>
		<span class="font-mono text-label-caps text-on-surface-variant">Day Streak</span>
	</div>

	<!-- Mastered -->
	<div
		class="relative flex flex-col items-center justify-center rounded-3xl surface-glass p-md group enter-fade-up"
		style="transition-delay: 300ms;"
	>
		<Icon
			name="check"
			class="mb-xs h-8 w-8 text-primary transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(192,193,255,0.8)]"
		/>
		<span class="text-headline-sm font-bold text-on-surface">{stats.mastered}</span>
		<span class="font-mono text-label-caps text-on-surface-variant">Mastered</span>
	</div>

	<!-- Total Attempted -->
	<div
		class="relative flex flex-col items-center justify-center rounded-3xl surface-glass p-md group enter-fade-up"
		style="transition-delay: 350ms;"
	>
		<Icon
			name="topics"
			class="mb-xs h-8 w-8 text-on-surface-variant transition-transform group-hover:scale-110 group-hover:text-on-surface"
		/>
		<span class="text-headline-sm font-bold text-on-surface">{stats.attempted}</span>
		<span class="font-mono text-label-caps text-on-surface-variant">Attempted</span>
	</div>

	<!-- Due Today -->
	<a
		href="/topics"
		class="relative flex flex-col items-center justify-center rounded-3xl surface-glass {due > 0
			? 'bg-error/10 border-error/30'
			: ''} p-md group enter-fade-up"
		style="transition-delay: 400ms;"
	>
		<Icon
			name="bell"
			class="mb-xs h-8 w-8 {due > 0
				? 'text-error group-hover:drop-shadow-[0_0_8px_rgba(255,180,171,0.8)]'
				: 'text-on-surface-variant group-hover:text-on-surface'} transition-transform group-hover:scale-110"
		/>
		<span class="text-headline-sm font-bold {due > 0 ? 'text-error' : 'text-on-surface'}"
			>{due}</span
		>
		<span class="font-mono text-label-caps {due > 0 ? 'text-error/80' : 'text-on-surface-variant'}"
			>Due Today</span
		>
	</a>
</div>
