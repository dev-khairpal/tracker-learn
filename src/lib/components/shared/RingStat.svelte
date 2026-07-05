<script lang="ts">
	import type { Snippet } from 'svelte';

	let { pct, size = 52, children }: { pct: number; size?: number; children?: Snippet } = $props();
</script>

<div
	class="relative shrink-0 rounded-full"
	style="width:{size}px;height:{size}px;background:conic-gradient(var(--color-primary) calc({pct}*1%), var(--color-outline-variant) 0)"
>
	<div
		class="absolute inset-[6px] flex items-center justify-center rounded-full bg-surface-container font-mono text-[0.7rem] font-bold text-on-surface"
	>
		{@render children?.()}
	</div>
</div>
