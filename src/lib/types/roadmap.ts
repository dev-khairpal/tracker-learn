export interface RoadmapItem {
	id: string;
	label: string;
	definition?: string;
	useCase?: string;
	detailedMarkdown?: string;
}

export interface RoadmapSubsection {
	id: string;
	name: string;
	items: RoadmapItem[];
}

export interface RoadmapCategory {
	id: string;
	name: string;
	icon: string;
	subsections?: RoadmapSubsection[];
	items?: RoadmapItem[];
}
