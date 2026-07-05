<script lang="ts">
	import Icon from '../layout/Icon.svelte';
</script>

<div class="flex h-full flex-col gap-sm">
	<a
		href="/companies"
		class="group flex flex-1 flex-col justify-center rounded-3xl surface-glass p-md enter-fade-up"
		style="transition-delay: 450ms;"
	>
		<div class="mb-xs flex items-center justify-between">
			<Icon
				name="companies"
				class="h-6 w-6 text-on-surface-variant group-hover:text-primary group-hover:drop-shadow-[0_0_8px_rgba(192,193,255,0.8)] transition-all"
			/>
			<Icon
				name="link"
				class="h-4 w-4 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100"
			/>
		</div>
		<h4 class="text-body-lg font-bold text-on-surface">Company Patterns</h4>
		<p class="mt-1 text-label-caps font-mono text-on-surface-variant">FAANG specific prep</p>
	</a>

	<a
		href="/resources"
		class="group flex flex-1 flex-col justify-center rounded-3xl surface-glass p-md enter-fade-up"
		style="transition-delay: 500ms;"
	>
		<div class="mb-xs flex items-center justify-between">
			<Icon
				name="resources"
				class="h-6 w-6 text-on-surface-variant group-hover:text-secondary group-hover:drop-shadow-[0_0_8px_rgba(76,215,246,0.8)] transition-all"
			/>
			<Icon
				name="link"
				class="h-4 w-4 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100"
			/>
		</div>
		<h4 class="text-body-lg font-bold text-on-surface">Resources</h4>
		<p class="mt-1 text-label-caps font-mono text-on-surface-variant">Cheatsheets & Docs</p>
	</a>
</div>
