<script lang="ts">
	export type IconName =
		| 'dashboard'
		| 'topics'
		| 'companies'
		| 'planner'
		| 'resources'
		| 'search'
		| 'export'
		| 'import'
		| 'sync'
		| 'settings'
		| 'help'
		| 'link'
		| 'expand'
		| 'close'
		| 'refresh'
		| 'clock'
		| 'bell'
		| 'flame'
		| 'radar'
		| 'menu'
		| 'roadmap'
		| 'check'
		| 'briefcase'
		| 'info'
		| 'chevron-left'
		| 'chevron-right';

	let { name, class: className = 'w-[1em] h-[1em]' }: { name: IconName; class?: string } = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if name === 'dashboard'}
		<path d="M4 20V10m8 10V4m8 16v-7" />
	{:else if name === 'topics'}
		<rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
		<rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
		<rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
		<rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
	{:else if name === 'companies'}
		<rect x="4" y="3" width="10" height="18" rx="1" />
		<path d="M8 7h2m-2 4h2m-2 4h2M14 21v-7h6v7" />
	{:else if name === 'planner'}
		<rect x="3.5" y="4.5" width="17" height="16" rx="1.5" />
		<path d="M3.5 9.5h17M8 3v3m8-3v3" />
	{:else if name === 'resources'}
		<path d="M4 5.5c2-1 5-1 8 0 3-1 6-1 8 0v13c-2-1-5-1-8 0-3-1-6-1-8 0Z" />
		<path d="M12 5.5v13" />
	{:else if name === 'search'}
		<circle cx="11" cy="11" r="7" />
		<path d="m21 21-4.3-4.3" />
	{:else if name === 'export'}
		<path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
	{:else if name === 'import'}
		<path d="M12 21V9m0 0-4 4m4-4 4 4M5 3h14" />
	{:else if name === 'sync'}
		<path d="M4 12a8 8 0 0 1 14.93-4M20 12a8 8 0 0 1-14.93 4" />
		<path d="M18 3v5h-5M6 21v-5h5" />
	{:else if name === 'settings'}
		<circle cx="12" cy="12" r="3" />
		<path
			d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
		/>
	{:else if name === 'help'}
		<circle cx="12" cy="12" r="9" />
		<path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2-2.4 3.7" />
		<path d="M12 17.5v.01" />
	{:else if name === 'link'}
		<path d="M9 15 15 9M10 7l1-1a4 4 0 0 1 6 6l-1 1M14 17l-1 1a4 4 0 0 1-6-6l1-1" />
	{:else if name === 'expand'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'close'}
		<path d="M6 6l12 12M18 6 6 18" />
	{:else if name === 'refresh'}
		<path d="M4.5 12a7.5 7.5 0 0 1 13.4-4.6M19.5 12a7.5 7.5 0 0 1-13.4 4.6" />
		<path d="M17.5 3.5v4.4h-4.4M6.5 20.5v-4.4h4.4" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5l3.5 2" />
	{:else if name === 'bell'}
		<path d="M6 8a6 6 0 1 1 12 0c0 5.5 2 7.5 2 7.5H4S6 13.5 6 8Z" />
		<path d="M10 20a2 2 0 0 0 4 0" />
	{:else if name === 'flame'}
		<path
			d="M12 22a7 7 0 0 0 7-7c0-4-3-5-4-9 0 3-2 4-2 6a2 2 0 0 1-4 0c0-1 .5-2 1-3-3 2-5 4-5 6a7 7 0 0 0 7 7Z"
		/>
	{:else if name === 'radar'}
		<circle cx="12" cy="12" r="9" />
		<circle cx="12" cy="12" r="5" />
		<circle cx="12" cy="12" r="1" fill="currentColor" />
		<path d="M12 3v3M21 12h-3" />
	{:else if name === 'menu'}
		<path d="M4 7h16M4 12h16M4 17h16" />
	{:else if name === 'roadmap'}
		<path d="M12 21V9m-6 3V3h12v9H6" />
	{:else if name === 'check'}
		<path d="M5 13l4 4L19 7" />
	{:else if name === 'briefcase'}
		<rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
		<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="10" />
		<path d="M12 16v-4" />
		<path d="M12 8h.01" />
	{:else if name === 'chevron-left'}
		<path d="m15 18-6-6 6-6" />
	{:else if name === 'chevron-right'}
		<path d="m9 18 6-6-6-6" />
	{/if}
</svg>
