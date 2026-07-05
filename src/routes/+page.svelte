<script lang="ts">
	import BentoHero from '$lib/components/dashboard/BentoHero.svelte';
	import BentoRoadmap from '$lib/components/dashboard/BentoRoadmap.svelte';
	import BentoDSAStats from '$lib/components/dashboard/BentoDSAStats.svelte';
	import BentoQuickLinks from '$lib/components/dashboard/BentoQuickLinks.svelte';
	import StepTracker from '$lib/components/dashboard/StepTracker.svelte';
</script>

<svelte:head>
	<title>Command Center</title>
</svelte:head>

<div class="mx-auto max-w-[1280px]">
	<!-- Bento Grid Layout -->
	<div
		class="grid grid-cols-1 gap-md md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-[auto_auto] lg:h-[700px]"
	>
		<!-- Top Left: Hero spanning 2x1 -->
		<div class="md:col-span-2 lg:col-span-2 lg:row-span-1">
			<BentoHero />
		</div>

		<!-- Right side spanning full height for the Step Tracker (1 col wide on lg) -->
		<div class="md:col-span-1 lg:col-span-1 lg:row-span-2">
			<StepTracker />
		</div>

		<!-- Top Right on md, or bottom right on lg: Knowledge Overview (1x1) -->
		<div class="md:col-span-3 lg:col-span-1 lg:row-span-1">
			<BentoRoadmap />
		</div>

		<!-- Bottom Left: DSA Stats grid (2x1) -->
		<div class="md:col-span-2 lg:col-span-2 lg:row-span-1">
			<BentoDSAStats />
		</div>

		<!-- Bottom Right: Quick Links stack (1x1) -->
		<div class="md:col-span-1 lg:col-span-1 lg:row-span-1">
			<BentoQuickLinks />
		</div>
	</div>
</div>
