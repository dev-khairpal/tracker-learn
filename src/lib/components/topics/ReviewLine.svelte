<script lang="ts">
	import { appState } from '$lib/stores/state.svelte';
	import { DEPTH_FIELDS } from '$lib/types/dsa';
	import { reviewDueDate, isDue, markRevised } from '$lib/utils/problems';
	import { todayStr } from '$lib/utils/dates';

	let { pid }: { pid: string } = $props();

	const st = $derived(appState.problemState[pid]);
	const count = $derived(st ? DEPTH_FIELDS.filter((f) => st[f]).length : 0);
</script>

{#if count < 7}
	<p class="text-body-md text-on-surface-variant">
		Complete all 7 steps above to unlock spaced revision.
	</p>
{:else if st.reviewIndex >= 3}
	<p class="text-body-md font-semibold text-secondary">
		🏆 Mastered — solved {st.solvedDate} and reviewed 3x (day 1, day 7, day 30).
	</p>
{:else}
	{@const due = reviewDueDate(st)}
	{@const dueStr = due ? todayStr(due) : ''}
	{@const dueNow = isDue(st)}
	<div class="flex flex-wrap items-center gap-sm text-body-md text-on-surface-variant">
		<span>
			{dueNow
				? `🔔 Due now for revision #${st.reviewIndex + 1}/3.`
				: `Revision #${st.reviewIndex + 1}/3 unlocks on ${dueStr}.`}
		</span>
		<button
			class="rounded border border-outline-variant px-sm py-[2px] font-mono text-label-caps normal-case hover:bg-surface-container-highest disabled:opacity-40"
			disabled={!dueNow}
			onclick={() => markRevised(pid)}
		>
			Mark Revised
		</button>
	</div>
{/if}
