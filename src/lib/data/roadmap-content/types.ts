export interface RoadmapDetailEntry {
	definition?: string;
	useCase?: string;
	detailedMarkdown?: string;
}

export type RoadmapDetailMap = Record<string, RoadmapDetailEntry>;
