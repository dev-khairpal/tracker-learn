import type { CustomProblem, MixedSession, MockInterview, ProblemState } from './dsa';

export interface AppState {
	knowledgeDone: Record<string, boolean>;
	knowledgeNotes: Record<string, string>;
	problemState: Record<string, ProblemState>;
	roadmapDone: Record<string, boolean>;
	companyDone: Record<string, boolean>;
	interviewDone: Record<string, boolean>;
	customProblems: Record<string, CustomProblem[]>;
	dailyLog: string[];
	mixedSessions: MixedSession[];
	mockInterviews: MockInterview[];
}
