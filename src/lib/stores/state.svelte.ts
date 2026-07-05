import type { AppState } from '$lib/types/state';
import { todayStr } from '$lib/utils/dates';

/** Same key the original DSA_Tracker.html used — must not change, so real
 *  historical progress in the user's browser continues to load. */
export const STORE_KEY = 'dsaTrackerV1';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hydrateState(raw: any): AppState {
	const s = raw && typeof raw === 'object' ? raw : {};
	s.knowledgeDone = s.knowledgeDone || {};
	s.knowledgeNotes = s.knowledgeNotes || {};
	s.problemState = s.problemState || {};
	s.roadmapDone = s.roadmapDone || {};
	s.companyDone = s.companyDone || {};
	s.interviewDone = s.interviewDone || {};
	s.customProblems = s.customProblems || {};
	s.dailyLog = s.dailyLog || [];
	s.mixedSessions = s.mixedSessions || [];
	s.mockInterviews = s.mockInterviews || [];

	// migrate legacy single-checkbox format (pre-depth-checklist era)
	if (s.done) {
		Object.keys(s.done).forEach((pid) => {
			if (s.done[pid] && !s.problemState[pid]) {
				s.problemState[pid] = {
					intuition: true,
					brute: true,
					optimized: true,
					complexity: true,
					edgeCases: true,
					mistakes: true,
					variations: true,
					notes: '',
					solvedDate: todayStr(),
					reviewIndex: 0
				};
			}
		});
		delete s.done;
	}

	// dark-only now — drop the legacy light/dark theme key if an old export has it
	delete s.theme;

	return s as AppState;
}

function loadInitial(): AppState {
	if (typeof localStorage === 'undefined') return hydrateState({});
	try {
		return hydrateState(JSON.parse(localStorage.getItem(STORE_KEY) || '{}'));
	} catch {
		return hydrateState({});
	}
}

export const appState: AppState = $state(loadInitial());

/** Wholesale replace (import / reset) — overwrites every domain key, same as
 *  the original app's `state = hydrateState(...)` reassignment. */
export function replaceState(raw: unknown) {
	Object.assign(appState, hydrateState(raw));
}
