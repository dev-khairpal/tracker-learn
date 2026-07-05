export interface KnowledgeTopic {
	id: string;
	name: string;
}

export interface KnowledgeSubCategory {
	subCategory: string;
	topics: KnowledgeTopic[];
}

export interface KnowledgeCategory {
	id: string;
	name: string;
	items: KnowledgeSubCategory[];
}
