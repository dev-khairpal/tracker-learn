<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import PinGate from '$lib/components/layout/PinGate.svelte';
	import { setupLocalPersistence, forceSyncNow } from '$lib/services/persistence.svelte';
	import { authState, tryRestoreSession } from '$lib/stores/auth.svelte';

	let { children } = $props();

	setupLocalPersistence();
	onMount(() => {
		tryRestoreSession();
	});

	let mobileNavOpen = $state(false);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if authState.status === 'unlocked'}
	<Sidebar syncStatus={authState.syncStatus} />
	<MobileNav bind:open={mobileNavOpen} />
	<TopBar onMenuClick={() => (mobileNavOpen = true)} onSyncNow={forceSyncNow} />

	<main class="min-h-screen px-margin-mobile pt-24 pb-24 md:ml-64 md:px-margin-desktop md:pb-xl">
		{@render children()}
	</main>
{:else if authState.status === 'locked'}
	<PinGate />
{:else}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<p class="font-mono text-label-caps text-on-surface-variant uppercase">Loading…</p>
	</div>
{/if}
