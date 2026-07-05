<script lang="ts">
	import type { Difficulty } from '$lib/types/dsa';

	let { diff }: { diff: Difficulty } = $props();

	const styles: Record<Difficulty, string> = {
		E: 'bg-secondary/10 text-secondary border border-secondary/30',
		M: 'bg-tertiary/10 text-tertiary border border-tertiary/30',
		H: 'bg-error/10 text-error border border-error/30'
	};
	const labels: Record<Difficulty, string> = { E: 'Easy', M: 'Medium', H: 'Hard' };
</script>

<span
	class="rounded px-sm py-[2px] font-mono text-[10px] font-bold whitespace-nowrap {styles[diff]}"
>
	{labels[diff]}
</span>
