<script lang="ts">
	import Icon from './Icon.svelte';
	import { authState, signInWithPin } from '$lib/stores/auth.svelte';
	import { supabaseReady, PIN_LENGTH } from '$lib/services/supabase';

	let pin = $state('');
	let submitting = $state(false);
	let shake = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		authState.error = null;

		if (!supabaseReady) {
			authState.error =
				"Supabase isn't configured yet — see PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env.local.";
			return;
		}
		if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)) {
			authState.error = `Enter your ${PIN_LENGTH}-digit PIN.`;
			return;
		}

		submitting = true;
		try {
			await signInWithPin(pin);
		} catch (err) {
			console.error('Login/sync error:', err);
			authState.error =
				'Incorrect PIN. (' + (err instanceof Error ? err.message : String(err)) + ')';
			pin = '';
			shake = false;
			requestAnimationFrame(() => (shake = true));
		} finally {
			submitting = false;
		}
	}
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center bg-background p-md">
	<div class="surface-glass w-full max-w-[340px] rounded-2xl p-xl">
		<div class="mb-xs flex items-center justify-center gap-sm">
			<div
				class="border-primary/30 glow-primary flex h-12 w-12 items-center justify-center rounded-full border bg-primary/10 text-primary"
			>
				<Icon name="radar" class="h-7 w-7" />
			</div>
		</div>
		<h1 class="text-headline-sm text-on-surface mt-sm text-center tracking-tighter">
			DSA Mastery Tracker
		</h1>
		<p class="mt-xs text-center text-body-md text-on-surface-variant">
			Enter your PIN to unlock your progress.
		</p>
		<form onsubmit={handleSubmit} class="mt-md">
			<input
				type="password"
				inputmode="numeric"
				pattern="[0-9]*"
				maxlength={PIN_LENGTH}
				autocomplete="off"
				placeholder={'•'.repeat(PIN_LENGTH)}
				bind:value={pin}
				class:shake
				onanimationend={() => (shake = false)}
				class="border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary w-full rounded-md border py-sm text-center text-xl tracking-[0.4em] outline-none focus:ring-0"
			/>
			<button
				type="submit"
				disabled={submitting}
				class="glow-primary mt-md w-full rounded-lg bg-primary py-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
			>
				{submitting ? 'Unlocking…' : 'Unlock'}
			</button>
		</form>
		{#if authState.error}
			<p class="text-error mt-md text-center text-body-md">{authState.error}</p>
		{/if}
	</div>
</div>

<style>
	.shake {
		animation: shake 0.3s;
	}
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-6px);
		}
		75% {
			transform: translateX(6px);
		}
	}
</style>
