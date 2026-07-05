import { PUBLIC_PIN_EMAIL } from '$env/static/public';
import { getSupabaseClient, supabaseReady, TRACKER_TABLE } from '$lib/services/supabase';
import { appState, replaceState } from './state.svelte';

export type AuthStatus = 'loading' | 'locked' | 'unlocked';

export const authState: {
	status: AuthStatus;
	error: string | null;
	syncStatus: string;
	userId: string | null;
} = $state({
	status: 'loading',
	error: null,
	syncStatus: 'Synced to your account. Use Export regularly to back up your progress.',
	userId: null
});

async function loadRemoteState() {
	const client = getSupabaseClient();
	if (!client || !authState.userId) return;
	const { data, error } = await client
		.from(TRACKER_TABLE)
		.select('state')
		.eq('user_id', authState.userId)
		.maybeSingle();
	if (error) throw error;
	if (data) {
		replaceState(data.state || {});
	} else {
		// first login ever: seed the remote row with whatever's in this browser already.
		await client.from(TRACKER_TABLE).insert({ user_id: authState.userId, state: appState });
	}
}

export async function pushRemoteState() {
	const client = getSupabaseClient();
	if (!client || !authState.userId) return;
	const { error } = await client.from(TRACKER_TABLE).upsert({
		user_id: authState.userId,
		state: appState,
		updated_at: new Date().toISOString()
	});
	authState.syncStatus = error
		? 'Could not sync to your account — saved locally only. (' + error.message + ')'
		: 'Synced to your account. Use Export regularly to back up your progress.';
}

export async function tryRestoreSession() {
	const client = getSupabaseClient();
	if (!client) {
		authState.status = 'locked';
		return;
	}
	const { data } = await client.auth.getSession();
	if (data?.session?.user) {
		authState.userId = data.session.user.id;
		try {
			await loadRemoteState();
			authState.status = 'unlocked';
		} catch (err) {
			console.error('Session restore failed:', err);
			authState.status = 'locked';
		}
	} else {
		authState.status = 'locked';
	}
}

export async function signInWithPin(pin: string): Promise<void> {
	if (!supabaseReady) {
		throw new Error(
			"Supabase isn't configured yet — see PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env.local."
		);
	}
	const client = getSupabaseClient();
	if (!client) throw new Error('Supabase client unavailable.');
	const { data, error } = await client.auth.signInWithPassword({
		email: PUBLIC_PIN_EMAIL,
		password: pin
	});
	if (error) throw error;
	authState.userId = data.user.id;
	await loadRemoteState();
	authState.status = 'unlocked';
}
