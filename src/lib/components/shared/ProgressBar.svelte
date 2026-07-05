<script lang="ts">
	let { attemptPct = 0, masterPct = 0 }: { attemptPct?: number; masterPct?: number } = $props();
</script>

<div class="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-container-lowest">
	<div
		class="absolute top-0 left-0 h-full rounded-full bg-outline-variant"
		style="width: {attemptPct}%"
	></div>
	<div
		class="glow-primary absolute top-0 left-0 h-full rounded-full bg-primary"
		style="width: {masterPct}%"
	></div>
</div>
