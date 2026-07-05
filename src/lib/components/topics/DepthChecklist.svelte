<script lang="ts">
	import { DEPTH_FIELDS, DEPTH_LABELS, DEPTH_HELP, type DepthField } from '$lib/types/dsa';
	import { ensureProblemState, emptyProblemState, logToday } from '$lib/utils/problems';
	import { appState } from '$lib/stores/state.svelte';
	import { todayStr } from '$lib/utils/dates';

	let { pid }: { pid: string } = $props();

	const raw = $derived(appState.problemState[pid] ?? emptyProblemState());

	function toggle(field: DepthField, checked: boolean) {
		const st = ensureProblemState(pid);
		st[field] = checked;
		const count = DEPTH_FIELDS.filter((f) => st[f]).length;
		if (count === 7 && !st.solvedDate) st.solvedDate = todayStr();
		logToday();
	}
</script>

<div class="mb-sm grid grid-cols-1 gap-xs sm:grid-cols-2 lg:grid-cols-4">
	{#each DEPTH_FIELDS as field (field)}
		<label
			class="flex cursor-pointer items-center gap-xs rounded border border-outline-variant/40 bg-surface-container-low px-sm py-xs font-mono text-label-caps text-on-surface-variant normal-case"
			title={DEPTH_HELP[field]}
		>
			<input
				type="checkbox"
				checked={raw[field]}
				onchange={(e) => toggle(field, e.currentTarget.checked)}
				class="rounded border-outline-variant text-primary focus:ring-primary"
			/>
			{DEPTH_LABELS[field]}
		</label>
	{/each}
</div>
