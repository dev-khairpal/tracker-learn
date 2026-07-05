<script lang="ts">
	import type { Snippet } from 'svelte';
	import RingStat from './RingStat.svelte';

	let {
		pct,
		value,
		label,
		icon,
		danger = false,
		href
	}: {
		pct: number;
		value: string | number;
		label: string;
		icon?: Snippet;
		danger?: boolean;
		href?: string;
	} = $props();

	const cardClass = $derived(
		`flex items-center gap-md rounded-lg border p-md bg-surface-container transition-colors ${
			danger ? 'border-error' : 'border-outline-variant'
		} ${href ? 'cursor-pointer hover:bg-surface-container-high' : ''}`
	);
</script>

{#snippet content()}
	<RingStat {pct}>
		{#if icon}
			{@render icon()}
		{:else}
			{pct}%
		{/if}
	</RingStat>
	<div>
		<div class="text-headline-sm text-on-surface">{value}</div>
		<div class="font-mono text-label-caps text-on-surface-variant normal-case">{label}</div>
	</div>
{/snippet}

{#if href}
	<a {href} class={cardClass}>{@render content()}</a>
{:else}
	<div class={cardClass}>{@render content()}</div>
{/if}
