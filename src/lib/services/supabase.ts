import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

export const TRACKER_TABLE = 'dsa_tracker_state';
export const PIN_LENGTH = 6;

export const supabaseReady = PUBLIC_SUPABASE_URL?.startsWith('http') ?? false;

let client: SupabaseClient | null = null;

/** Lazily constructed, browser-only — the root layout is prerendered, so this
 *  must never run at module-import time (it would execute in Node at build). */
export function getSupabaseClient(): SupabaseClient | null {
	if (!browser || !supabaseReady) return null;
	if (!client) {
		client = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: { persistSession: true, storage: window.sessionStorage }
		});
	}
	return client;
}
