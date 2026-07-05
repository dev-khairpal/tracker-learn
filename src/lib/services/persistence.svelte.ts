import { browser } from '$app/environment';
import { appState, STORE_KEY } from '$lib/stores/state.svelte';
import { authState, pushRemoteState } from '$lib/stores/auth.svelte';

let syncTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleRemoteSync() {
	if (!authState.userId) return;
	clearTimeout(syncTimer);
	syncTimer = setTimeout(pushRemoteState, 800);
}

/**
 * Call once from the root layout's instance script. Serializing the whole
 * appState tree inside $effect means this re-fires on ANY nested mutation
 * anywhere in the app (every property read during JSON.stringify is tracked),
 * so no call site needs to remember to "save" explicitly.
 */
export function setupLocalPersistence() {
	$effect(() => {
		const snapshot = JSON.stringify(appState);
		if (browser) {
			localStorage.setItem(STORE_KEY, snapshot);
			scheduleRemoteSync();
		}
	});
}

/** Bypasses the debounce — used by the "sync now" button in the top bar. */
export function forceSyncNow() {
	clearTimeout(syncTimer);
	void pushRemoteState();
}
