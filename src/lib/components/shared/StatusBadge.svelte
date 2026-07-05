<script lang="ts">
	import type { ProblemStatusClass } from '$lib/utils/problems';

	let { cls, label }: { cls: ProblemStatusClass; label: string } = $props();

	const styles: Record<ProblemStatusClass, string> = {
		notstarted: 'bg-surface-container-highest text-on-surface-variant',
		learning: 'bg-tertiary/10 text-tertiary',
		solved: 'bg-primary/10 text-primary',
		mastered: 'bg-secondary/10 text-secondary'
	};
</script>

<span
	class="inline-block rounded-full px-sm py-[3px] font-mono text-[10px] font-bold whitespace-nowrap uppercase {styles[
		cls
	]}"
>
	{label}
</span>
