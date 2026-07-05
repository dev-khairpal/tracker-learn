<script lang="ts">
	import type { Topic } from '$lib/types/dsa';
	import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
	import DiffBadge from '$lib/components/shared/DiffBadge.svelte';
	import Icon from '$lib/components/layout/Icon.svelte';
	import DepthChecklist from './DepthChecklist.svelte';
	import ReviewLine from './ReviewLine.svelte';
	import {
		type ProblemRef,
		problemStatus,
		leetSearchUrl,
		deleteCustomProblem,
		ensureProblemState
	} from '$lib/utils/problems';
	import { appState } from '$lib/stores/state.svelte';

	let {
		problem,
		topic,
		open,
		onToggle
	}: { problem: ProblemRef; topic: Topic; open: boolean; onToggle: () => void } = $props();

	const status = $derived(problemStatus(problem.id));
	const notes = $derived(appState.problemState[problem.id]?.notes ?? '');

	function handleNotesChange(value: string) {
		const st = ensureProblemState(problem.id);
		st.notes = value;
	}

	function handleRowClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('[data-stop]')) return;
		onToggle();
	}
	function handleRowKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onToggle();
		}
	}
</script>

<div
	id="problem-{problem.id}"
	class="overflow-hidden rounded-md border border-outline-variant/60 bg-surface-container-lowest"
>
	<div
		role="button"
		tabindex="0"
		aria-expanded={open}
		class="grid cursor-pointer grid-cols-[92px_1fr_66px_60px] items-start gap-sm px-sm py-sm transition-colors hover:bg-surface-container-low sm:grid-cols-[110px_1fr_92px_76px] sm:items-center sm:px-md"
		onclick={handleRowClick}
		onkeydown={handleRowKeydown}
	>
		<div><StatusBadge cls={status.cls} label={status.label} /></div>
		<div class="text-body-md font-medium text-on-surface sm:truncate">
			{problem.name}
			{#if problem.custom}
				<span class="ml-xs text-[10px] text-on-surface-variant">custom</span>
			{/if}
		</div>
		<div class="flex justify-center"><DiffBadge diff={problem.diff} /></div>
		<div class="flex items-center justify-end gap-sm">
			<a
				href={leetSearchUrl(problem.name)}
				target="_blank"
				rel="noopener"
				title="Search on LeetCode"
				data-stop
				class="text-on-surface-variant hover:text-primary"
			>
				<Icon name="link" class="h-4 w-4" />
			</a>
			{#if problem.custom}
				<button
					data-stop
					title="Remove this custom problem"
					class="text-on-surface-variant hover:text-error"
					onclick={() => deleteCustomProblem(topic.id, problem.id)}
				>
					<Icon name="close" class="h-4 w-4" />
				</button>
			{/if}
			<Icon name="expand" class="h-4 w-4 transition-transform {open ? 'rotate-180' : ''}" />
		</div>
	</div>
	{#if open}
		<div class="border-t border-outline-variant/40 px-sm pt-sm pb-md sm:px-md">
			<DepthChecklist pid={problem.id} />
			<textarea
				placeholder="Notes / gotchas / follow-ups you would mention to an interviewer..."
				rows="2"
				value={notes}
				onchange={(e) => handleNotesChange(e.currentTarget.value)}
				class="mb-sm w-full rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface"
			></textarea>
			<ReviewLine pid={problem.id} />
		</div>
	{/if}
</div>
