import { appState, replaceState, STORE_KEY } from '$lib/stores/state.svelte';
import { todayStr } from '$lib/utils/dates';

export function resetAllProgress() {
	if (
		!confirm(
			'This will erase ALL tracked progress (including your synced account data). This cannot be undone. Continue?'
		)
	)
		return;
	localStorage.removeItem(STORE_KEY);
	replaceState({});
}
