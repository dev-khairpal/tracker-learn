<script lang="ts">
	import type { Company } from '$lib/types/dsa';
	import { appState } from '$lib/stores/state.svelte';
	import { logToday } from '$lib/utils/problems';
	import Icon from '../layout/Icon.svelte';

	let { company, avatarBg, avatarFg }: { company: Company; avatarBg: string; avatarFg: string } =
		$props();

	function toggle(id: string, checked: boolean) {
		appState.companyDone[id] = checked;
		if (checked) logToday();
	}

	const total = company.checklist.length;
	let completed = $derived(
		company.checklist.filter((_, i) => appState.companyDone[company.id + '-c' + i]).length
	);
	let isDone = $derived(total > 0 && completed === total);
</script>

<div
	class="group relative flex flex-col rounded-3xl surface-glass p-lg transition-all duration-500 hover:ring-1 hover:ring-outline-variant/50 overflow-hidden {isDone
		? 'ring-1 ring-primary/30 glow-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]'
		: ''}"
>
	<div class="mb-md flex items-center justify-between z-10">
		<h3 class="flex items-center gap-sm text-headline-sm font-bold text-on-surface">
			<span
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-label-caps font-bold shadow-sm"
				style="background:{avatarBg};color:{avatarFg}"
			>
				{company.name[0]}
			</span>
			{company.name}
		</h3>
		<span class="font-mono text-label-caps text-on-surface-variant {isDone ? 'text-primary' : ''}">
			{completed} / {total}
		</span>
	</div>

	<div class="mb-md flex items-center gap-sm text-body-md text-on-surface-variant z-10">
		<Icon name="briefcase" class="h-4 w-4" />
		<b class="text-on-surface font-semibold">Rounds:</b>
		{company.rounds}
	</div>

	<div class="mb-md flex flex-wrap gap-xs z-10">
		{#each company.patterns as p (p)}
			<span
				class="rounded-full border border-outline-variant px-sm py-[2px] font-mono text-label-caps text-on-surface-variant normal-case bg-surface-container-highest/20"
			>
				{p}
			</span>
		{/each}
	</div>

	<div
		class="mb-lg rounded-xl bg-surface-container-highest/50 p-sm text-body-md text-on-surface-variant border border-outline-variant/30 z-10 leading-snug"
	>
		<Icon name="info" class="inline h-4 w-4 mr-xs text-primary/80" />
		{company.note}
	</div>

	<div class="mt-auto space-y-md border-t border-outline-variant/20 pt-md z-10">
		{#each company.checklist as item, ci (ci)}
			{@const id = company.id + '-c' + ci}
			{@const checked = !!appState.companyDone[id]}
			<label
				class="group/check flex cursor-pointer items-start gap-sm text-body-md transition-colors hover:text-on-surface"
			>
				<div class="relative flex items-center justify-center mt-1 shrink-0">
					<input
						type="checkbox"
						{checked}
						onchange={(e) => toggle(id, e.currentTarget.checked)}
						class="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-outline-variant/50 bg-transparent transition-all checked:border-primary checked:bg-primary hover:border-primary"
					/>
					<Icon
						name="check"
						class="pointer-events-none absolute h-3.5 w-3.5 text-on-primary opacity-0 transition-opacity peer-checked:opacity-100"
					/>
				</div>
				<span
					class="flex-1 {checked
						? 'text-on-surface-variant line-through'
						: 'text-on-surface'} transition-colors"
				>
					{item}
				</span>
			</label>
		{/each}
	</div>

	<!-- Progress Bar at bottom -->
	<div class="absolute bottom-0 left-0 right-0 h-1.5 opacity-60 z-0">
		<div
			class="h-full bg-primary transition-all duration-1000 ease-out {isDone ? 'glow-primary' : ''}"
			style="width: {total ? (completed / total) * 100 : 0}%"
		></div>
	</div>
</div>
