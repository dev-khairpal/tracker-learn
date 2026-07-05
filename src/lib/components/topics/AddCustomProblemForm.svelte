<script lang="ts">
	import type { Difficulty } from '$lib/types/dsa';
	import { addCustomProblem } from '$lib/utils/problems';

	let { topicId, focus = false }: { topicId: string; focus?: boolean } = $props();

	let name = $state('');
	let diff = $state<Difficulty>('M');
	let inputEl: HTMLInputElement | undefined = $state();

	$effect(() => {
		if (focus) inputEl?.focus();
	});

	function submit() {
		const trimmed = name.trim();
		if (!trimmed) return;
		addCustomProblem(topicId, trimmed, diff);
		name = '';
	}
</script>

<div class="mt-sm grid grid-cols-1 gap-sm sm:grid-cols-[1fr_110px_80px]">
	<input
		type="text"
		placeholder="Add your own problem..."
		bind:value={name}
		bind:this={inputEl}
		onkeydown={(e) => e.key === 'Enter' && submit()}
		class="rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface"
	/>
	<select
		bind:value={diff}
		class="rounded-md border border-outline-variant bg-surface-container-lowest px-sm py-xs text-body-md text-on-surface"
	>
		<option value="E">Easy</option>
		<option value="M">Medium</option>
		<option value="H">Hard</option>
	</select>
	<button
		onclick={submit}
		class="rounded-md border border-outline-variant px-md py-xs font-mono text-label-caps normal-case hover:bg-surface-container-highest"
	>
		Add
	</button>
</div>
