<script lang="ts">
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { NAV_GROUPS } from '$lib/nav';
	import { resetAllProgress } from '$lib/services/importExport';

	let { syncStatus = 'Synced' }: { syncStatus?: string } = $props();
</script>

<aside
	class="surface-glass !rounded-none !border-y-0 !border-l-0 fixed top-0 left-0 z-40 hidden h-full w-64 flex-col gap-md border-r px-md py-lg md:flex"
>
	<div class="mb-lg flex items-center gap-sm">
		<div
			class="border-primary/30 flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg shadow-primary/10"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="M2 17l10 5 10-5" /><path
					d="M2 12l10 5 10-5"
				/></svg
			>
		</div>
		<div>
			<h2
				class="bg-gradient-to-br from-on-surface to-on-surface-variant bg-clip-text text-headline-sm font-bold tracking-tighter text-transparent"
			>
				Command Center
			</h2>
		</div>
	</div>

	<nav class="flex flex-1 flex-col gap-sm overflow-y-auto pr-sm pb-4">
		{#each NAV_GROUPS as group}
			<div class="mb-sm mt-xs">
				<h3
					class="px-sm font-mono text-label-caps text-on-surface-variant/50 uppercase tracking-widest"
				>
					{group.label}
				</h3>
				{#each group.items as item (item.href)}
					{@const active = page.url.pathname === item.href}
					<a
						href={item.href}
						class="mt-xs flex items-center gap-sm rounded-lg p-sm transition-all duration-300 {active
							? 'shadow-[0_0_15px_rgba(192,193,255,0.15)] border-r-4 border-primary bg-primary/10 text-primary'
							: 'text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface hover:translate-x-1'}"
					>
						<Icon name={item.icon} class="h-5 w-5" />
						<span class="font-mono text-label-caps uppercase">{item.label}</span>
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<div class="border-outline-variant/20 mt-auto flex flex-col gap-sm border-t pt-md">
		<a
			href="/resources"
			class="text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface flex items-center gap-sm rounded-lg p-sm transition-all duration-300"
		>
			<Icon name="help" class="h-5 w-5" />
			<span class="font-mono text-label-caps uppercase">Support</span>
		</a>
		<button
			onclick={resetAllProgress}
			class="text-error/80 hover:bg-error/10 flex items-center gap-sm rounded-lg p-sm text-left transition-all duration-300 hover:text-error"
		>
			<Icon name="close" class="h-5 w-5" />
			<span class="font-mono text-label-caps uppercase">Reset all progress</span>
		</button>
	</div>
</aside>
