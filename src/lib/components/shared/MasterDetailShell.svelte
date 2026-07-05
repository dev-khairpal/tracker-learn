<script lang="ts">
	import type { Snippet } from 'svelte';

	let { list, detail }: { list: Snippet; detail: Snippet } = $props();
</script>

<div class="flex flex-col gap-lg lg:h-[calc(100vh-190px)] lg:flex-row">
	<div class="flex flex-col gap-sm lg:w-[380px] lg:overflow-hidden">
		{@render list()}
	</div>
	<div class="surface-glass flex flex-1 flex-col overflow-hidden rounded-2xl p-lg">
		{@render detail()}
	</div>
</div>
