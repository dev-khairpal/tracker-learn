<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import { globalSearch } from '$lib/stores/search.svelte';

	let {
		onMenuClick,
		onSyncNow
	}: {
		onMenuClick: () => void;
		onSyncNow: () => void;
	} = $props();

	function handleSearchInput() {
		if (page.url.pathname !== '/topics') goto('/topics');
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			document.getElementById('global-search')?.focus();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header
	class="surface-glass !rounded-none !border-x-0 !border-t-0 fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b px-gutter md:left-64"
>
	<div class="flex items-center gap-sm">
		<button
			class="text-on-surface-variant hover:text-primary md:hidden"
			onclick={onMenuClick}
			aria-label="Open menu"
		>
			<Icon name="menu" class="h-6 w-6" />
		</button>
		<div
			class="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-highest ring-1 ring-outline-variant/30 hidden sm:flex shadow-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-secondary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg
			>
		</div>
		<h1 class="text-headline-md font-bold text-on-surface hidden tracking-tighter sm:block">
			All Interview Topic Tracker
		</h1>
	</div>
	<div class="flex items-center gap-md">
		<div
			class="border-outline-variant/30 bg-surface-container-high hidden items-center rounded-full border px-sm py-xs lg:flex"
		>
			<Icon name="search" class="text-on-surface-variant ml-xs h-4 w-4" />
			<input
				id="global-search"
				type="text"
				placeholder="Search patterns... (Ctrl+K)"
				class="text-on-surface placeholder:text-on-surface-variant/50 w-48 border-none bg-transparent font-mono text-data-sm focus:ring-0"
				bind:value={globalSearch.query}
				oninput={handleSearchInput}
			/>
		</div>
		<button
			class="text-on-surface-variant hover:text-primary transition-colors duration-200"
			title="Sync now"
			onclick={onSyncNow}
		>
			<Icon name="sync" class="h-5 w-5" />
		</button>
	</div>
</header>
