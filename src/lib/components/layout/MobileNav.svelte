<script lang="ts">
	import Icon from './Icon.svelte';
	import { NAV_GROUPS } from '$lib/nav';
	import { page } from '$app/state';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex md:hidden">
		<button
			class="absolute inset-0 bg-black/70 backdrop-blur-sm"
			aria-label="Close menu"
			onclick={() => (open = false)}
		></button>
		<nav
			class="bg-surface-container-low border-outline-variant/20 relative flex w-64 flex-col gap-sm border-r p-md shadow-2xl"
		>
			<div class="mb-md flex items-center justify-between">
				<h2 class="text-headline-sm text-primary tracking-tighter">Command Center</h2>
				<button
					class="text-on-surface-variant hover:text-primary"
					onclick={() => (open = false)}
					aria-label="Close menu"
				>
					<Icon name="close" class="h-5 w-5" />
				</button>
			</div>
			{#each NAV_GROUPS as group}
				<div class="mb-sm mt-md">
					<h3
						class="px-sm font-mono text-label-caps text-on-surface-variant/50 uppercase tracking-widest"
					>
						{group.label}
					</h3>
					{#each group.items as item (item.href)}
						{@const active = page.url.pathname === item.href}
						<a
							href={item.href}
							onclick={() => (open = false)}
							class="mt-xs flex items-center gap-sm rounded-lg p-sm transition-all duration-300 {active
								? 'border-r-4 border-primary bg-primary/10 text-primary'
								: 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface'}"
						>
							<Icon name={item.icon} class="h-5 w-5" />
							<span class="font-mono text-label-caps uppercase">{item.label}</span>
						</a>
					{/each}
				</div>
			{/each}
		</nav>
	</div>
{/if}
