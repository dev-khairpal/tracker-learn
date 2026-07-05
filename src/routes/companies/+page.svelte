<script lang="ts">
	import CompanyCard from '$lib/components/companies/CompanyCard.svelte';
	import { COMPANIES, AVATAR_TINTS } from '$lib/data/companies';
</script>

<svelte:head>
	<title>Companies - Command Center</title>
</svelte:head>

<div class="mx-auto max-w-[1024px] py-md pr-sm md:pr-0">
	<div class="mb-xl flex w-full flex-col items-center text-center enter-fade-up">
		<div
			class="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 mb-md border border-primary/20 glow-primary"
		>
			<span class="font-mono text-label-caps text-primary tracking-widest uppercase"
				>Target Companies</span
			>
		</div>
		<h1 class="text-display-sm tracking-tighter text-on-surface mb-sm w-full">Company Patterns</h1>
		<p class="text-body-lg text-on-surface-variant w-full max-w-[576px]">
			Focus your preparation on specific recurring patterns and interview loops for top tech
			companies.
		</p>
	</div>

	<div
		class="mb-xl rounded-3xl surface-glass p-lg border-l-4 border-l-primary enter-fade-up mx-auto max-w-[768px] flex gap-md items-start"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-primary mt-1 shrink-0"
			><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg
		>
		<div>
			<h3 class="mb-xs text-headline-sm text-on-surface font-semibold">
				Trending patterns (2025–2026 reports)
			</h3>
			<p class="text-body-md text-on-surface-variant leading-relaxed">
				Most frequently reported problems right now: <b class="text-on-surface">Two Sum</b>,
				<b class="text-on-surface">Subarray Sum Equals K</b>,
				<b class="text-on-surface">Longest Consecutive Sequence</b>,
				<b class="text-on-surface">Trapping Rain Water</b>,
				<b class="text-on-surface">Maximum Product Subarray</b>, and
				<b class="text-on-surface">Sliding Window Maximum</b>. If you can solve one problem from
				each of two pointers, sliding window, prefix sum, hashmap, Kadane's, and greedy/sorting
				without hints, you're in solid shape for any of the loops below.
			</p>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-2 enter-fade-up">
		{#each COMPANIES as company, i (company.id)}
			<CompanyCard
				{company}
				avatarBg={AVATAR_TINTS[i % AVATAR_TINTS.length][0]}
				avatarFg={AVATAR_TINTS[i % AVATAR_TINTS.length][1]}
			/>
		{/each}
	</div>
</div>
