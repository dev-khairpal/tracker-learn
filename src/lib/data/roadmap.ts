import type { RoadmapCategory, RoadmapItem, RoadmapSubsection } from '$lib/types/roadmap';
import { ROADMAP_DETAILS } from './roadmap-details';

function items(catId: string, labels: string[]): RoadmapItem[] {
	return labels.map((label, i) => ({
		id: `${catId}-${i}`,
		label,
		definition: ROADMAP_DETAILS[label]?.definition,
		useCase: ROADMAP_DETAILS[label]?.useCase,
		detailedMarkdown: ROADMAP_DETAILS[label]?.detailedMarkdown
	}));
}
function subsection(
	catId: string,
	subIdx: number,
	name: string,
	labels: string[]
): RoadmapSubsection {
	return {
		id: `${catId}-s${subIdx}`,
		name,
		items: labels.map((label, i) => ({
			id: `${catId}-s${subIdx}-${i}`,
			label,
			definition: ROADMAP_DETAILS[label]?.definition,
			useCase: ROADMAP_DETAILS[label]?.useCase,
			detailedMarkdown: ROADMAP_DETAILS[label]?.detailedMarkdown
		}))
	};
}

export const ROADMAP_CATEGORIES: RoadmapCategory[] = [
	{
		id: 'dsa-patterns',
		name: 'DSA Interview Patterns',
		icon: '🧮',
		subsections: [
			subsection('dsa-patterns', 0, 'Foundations', [
				'Time & Space Complexity (Big O)',
				'Arrays & Strings',
				'HashMap / HashSet',
				'Stack',
				'Queue',
				'Linked List',
				'Recursion',
				'Binary Search Basics',
				'Trees Basics',
				'Graph Basics',
				'Heap / Priority Queue Basics',
				'Bit Manipulation Basics'
			]),
			subsection('dsa-patterns', 1, 'Core Patterns', [
				'Arrays & Hashing',
				'Two Pointers',
				'Sliding Window',
				'Prefix Sum',
				'Difference Array',
				'Binary Search',
				'Binary Search on Answer',
				'Sorting Algorithms',
				'Intervals',
				'Monotonic Stack',
				'Monotonic Queue (Deque)',
				'Heap / Priority Queue'
			]),
			subsection('dsa-patterns', 2, 'Linked List Patterns', [
				'Fast & Slow Pointers',
				'Linked List Reversal',
				'Merge Linked Lists'
			]),
			subsection('dsa-patterns', 3, 'Tree Patterns', [
				'DFS on Trees',
				'BFS / Level Order Traversal',
				'Binary Search Tree (BST)',
				'Lowest Common Ancestor (LCA)',
				'Tree Construction',
				'Tree Serialization'
			]),
			subsection('dsa-patterns', 4, 'Graph Patterns', [
				'DFS',
				'BFS',
				'Topological Sort',
				'Union-Find (Disjoint Set Union)',
				'Shortest Path (BFS / Dijkstra)',
				'Minimum Spanning Tree (Kruskal / Prim)'
			]),
			subsection('dsa-patterns', 5, 'Backtracking', [
				'Backtracking',
				'Combinations',
				'Permutations',
				'Subsets'
			]),
			subsection('dsa-patterns', 6, 'Dynamic Programming', [
				'1D DP',
				'2D DP',
				'Knapsack Pattern',
				'Longest Increasing Subsequence (LIS)',
				'Interval DP'
			]),
			subsection('dsa-patterns', 7, 'Greedy', ['Greedy Algorithms']),
			subsection('dsa-patterns', 8, 'Trie', ['Trie']),
			subsection('dsa-patterns', 9, 'Bit Manipulation', ['Bit Manipulation Patterns']),
			subsection('dsa-patterns', 10, 'Advanced (Optional)', [
				'Segment Tree',
				'Fenwick Tree (Binary Indexed Tree)',
				'Line Sweep',
				'Ordered Set / Balanced BST',
				'Rolling Hash',
				'KMP',
				'Rabin-Karp',
				'Aho-Corasick',
				"Tarjan's Algorithm",
				"Kosaraju's Algorithm",
				'Heavy-Light Decomposition',
				'Euler Tour',
				'Centroid Decomposition'
			])
		]
	},
	{
		id: 'cs-fundamentals',
		name: 'Computer Science Fundamentals',
		icon: '🖥️',
		subsections: [
			subsection('cs-fundamentals', 0, 'Operating Systems (OS)', [
				'Processes vs Threads',
				'Process Scheduling',
				'Context Switching',
				'Synchronization',
				'Mutex & Semaphore',
				'Deadlocks',
				'Memory Management',
				'Virtual Memory',
				'Paging & Segmentation',
				'CPU Scheduling',
				'File Systems',
				'System Calls'
			]),
			subsection('cs-fundamentals', 1, 'Computer Networks (CN)', [
				'OSI Model',
				'TCP/IP Model',
				'HTTP/HTTPS',
				'HTTP Methods',
				'HTTP Status Codes',
				'TCP vs UDP',
				'DNS',
				'CDN',
				'Reverse Proxy',
				'Load Balancer',
				'SSL/TLS',
				'WebSockets',
				'REST APIs',
				'GraphQL Basics',
				'gRPC Basics',
				'Cookies vs Sessions',
				'CORS'
			]),
			subsection('cs-fundamentals', 2, 'Computer Architecture', [
				'CPU',
				'Registers',
				'Cache Memory',
				'RAM',
				'Instruction Cycle',
				'Multi-Core Processing',
				'NUMA Basics'
			])
		]
	},
	{
		id: 'databases',
		name: 'Databases',
		icon: '🗄️',
		subsections: [
			subsection('databases', 0, 'SQL', [
				'CRUD',
				'Constraints',
				'Primary & Foreign Keys',
				'Indexes',
				'Clustered vs Non-Clustered Index',
				'Composite Index',
				'Covering Index',
				'Execution Plan',
				'Query Optimization',
				'Transactions',
				'ACID',
				'Isolation Levels',
				'Locks',
				'Deadlocks',
				'Joins',
				'GROUP BY',
				'HAVING',
				'ORDER BY',
				'Aggregate Functions',
				'Window Functions',
				'CTE',
				'Recursive CTE',
				'Subqueries',
				'Views',
				'Stored Procedures',
				'Triggers',
				'Normalization',
				'Denormalization'
			]),
			subsection('databases', 1, 'NoSQL', [
				'MongoDB',
				'Document Database',
				'Key-Value Store',
				'Column Database',
				'Graph Database',
				'CAP Theorem',
				'BASE',
				'Replication',
				'Sharding',
				'Partitioning'
			]),
			subsection('databases', 2, 'Database Design', [
				'ER Diagram',
				'One-to-One',
				'One-to-Many',
				'Many-to-Many',
				'Constraints',
				'Schema Design',
				'Data Modeling'
			])
		]
	},
	{
		id: 'oop',
		name: 'Object Oriented Programming',
		icon: '🧩',
		items: items('oop', [
			'SOLID Principles',
			'Encapsulation',
			'Abstraction',
			'Inheritance',
			'Polymorphism',
			'Composition vs Inheritance',
			'Interface',
			'Abstract Class',
			'Dependency Injection',
			'IoC',
			'UML Basics'
		])
	},
	{
		id: 'design-patterns',
		name: 'Design Patterns',
		icon: '🧱',
		subsections: [
			subsection('design-patterns', 0, 'Creational', [
				'Singleton',
				'Factory',
				'Abstract Factory',
				'Builder',
				'Prototype'
			]),
			subsection('design-patterns', 1, 'Structural', [
				'Adapter',
				'Decorator',
				'Facade',
				'Proxy',
				'Composite',
				'Bridge'
			]),
			subsection('design-patterns', 2, 'Behavioral', [
				'Strategy',
				'Observer',
				'State',
				'Command',
				'Template Method',
				'Chain of Responsibility',
				'Mediator',
				'Iterator',
				'Visitor'
			])
		]
	},
	{
		id: 'lld',
		name: 'Low Level Design (LLD)',
		icon: '📐',
		items: items('lld', [
			'Object Modeling',
			'Class Design',
			'UML',
			'Design Principles',
			'Design Patterns'
		]),
		subsections: [
			subsection('lld', 0, 'Practice Problems', [
				'Parking Lot',
				'Library System',
				'Movie Booking',
				'Splitwise',
				'Elevator',
				'ATM',
				'Snake & Ladder',
				'Chess',
				'Cricbuzz',
				'Hotel Booking'
			])
		]
	},
	{
		id: 'hld',
		name: 'High Level Design / System Design',
		icon: '🏗️',
		subsections: [
			subsection('hld', 0, 'Fundamentals', [
				'Scalability',
				'Availability',
				'Reliability',
				'Fault Tolerance',
				'Latency',
				'Throughput',
				'Consistency',
				'CAP Theorem',
				'PACELC'
			]),
			subsection('hld', 1, 'Core Components', [
				'API Gateway',
				'Load Balancer',
				'Reverse Proxy',
				'Cache',
				'CDN',
				'Message Queue',
				'Pub/Sub',
				'Event Driven Architecture',
				'Object Storage',
				'Search Engine',
				'Service Discovery',
				'Circuit Breaker',
				'Retry',
				'Rate Limiter'
			]),
			subsection('hld', 2, 'Database Concepts', [
				'Replication (System Design)',
				'Sharding (System Design)',
				'Partitioning (System Design)',
				'Read Replicas',
				'Leader-Follower',
				'Multi-Leader',
				'Eventual Consistency'
			]),
			subsection('hld', 3, 'Architecture', [
				'Monolith',
				'Microservices',
				'Serverless',
				'Event Driven',
				'CQRS',
				'Saga Pattern'
			]),
			subsection('hld', 4, 'Practice Designs', [
				'URL Shortener',
				'Instagram',
				'WhatsApp',
				'Uber',
				'YouTube',
				'Netflix',
				'Twitter/X',
				'Dropbox',
				'Google Drive',
				'Chat Application',
				'Notification Service'
			])
		]
	},
	{
		id: 'concurrency',
		name: 'Concurrency',
		icon: '🔀',
		items: items('concurrency', [
			'Threads',
			'Locks',
			'Mutex',
			'Semaphore',
			'Atomic Operations',
			'Race Conditions',
			'Deadlocks',
			'Producer Consumer',
			'Reader Writer',
			'Thread Pool',
			'Futures',
			'Async Programming'
		])
	},
	{
		id: 'language-mastery',
		name: 'Language Mastery',
		icon: '📚',
		brandIcon: 'openjdk',
		items: items('language-mastery', [
			'Collections',
			'Memory Model',
			'Exception Handling',
			'Generics',
			'Streams / Iterators',
			'Reflection',
			'Multithreading APIs',
			'Garbage Collection'
		])
	},
	{
		id: 'backend',
		name: 'Backend Engineering',
		icon: '⚙️',
		items: items('backend', [
			'REST APIs',
			'GraphQL',
			'gRPC',
			'Authentication',
			'Authorization',
			'JWT',
			'OAuth',
			'RBAC',
			'Sessions',
			'Cookies',
			'Validation',
			'Pagination',
			'Filtering',
			'Sorting',
			'File Upload',
			'Logging',
			'Exception Handling',
			'API Versioning',
			'Rate Limiting'
		])
	},
	{
		id: 'git',
		name: 'Git',
		icon: '🌿',
		brandIcon: 'git',
		items: items('git', [
			'Branches',
			'Merge',
			'Rebase',
			'Cherry Pick',
			'Reset',
			'Revert',
			'Stash',
			'Tags',
			'Pull Requests',
			'Conflict Resolution'
		])
	},
	{
		id: 'testing',
		name: 'Testing',
		icon: '🧪',
		items: items('testing', [
			'Unit Testing',
			'Integration Testing',
			'End-to-End Testing',
			'Mocking',
			'API Testing',
			'Test Coverage'
		])
	},
	{
		id: 'cloud',
		name: 'Cloud',
		icon: '☁️',
		items: items('cloud', ['AWS Basics', 'Azure Basics', 'GCP Basics']),
		subsections: [
			subsection('cloud', 0, 'AWS Services', [
				'EC2',
				'S3',
				'IAM',
				'RDS',
				'Lambda',
				'CloudFront',
				'VPC',
				'Route53',
				'SQS',
				'SNS',
				'DynamoDB'
			])
		]
	},
	{
		id: 'devops',
		name: 'DevOps',
		icon: '🐳',
		brandIcon: 'docker',
		items: items('devops', [
			'Docker',
			'Docker Compose',
			'Kubernetes Basics',
			'CI/CD',
			'GitHub Actions',
			'Jenkins',
			'Nginx'
		])
	},
	{
		id: 'security',
		name: 'Security',
		icon: '🔐',
		items: items('security', [
			'Authentication',
			'Authorization',
			'SQL Injection',
			'XSS',
			'CSRF',
			'SSRF',
			'CORS',
			'HTTPS',
			'JWT Security',
			'Password Hashing',
			'OAuth Security',
			'OWASP Top 10'
		])
	},
	{
		id: 'linux',
		name: 'Linux',
		icon: '🐧',
		brandIcon: 'linux',
		items: items('linux', [
			'Shell Commands',
			'Permissions',
			'Users',
			'Processes',
			'Networking',
			'grep',
			'awk',
			'sed',
			'ssh',
			'systemd',
			'cron',
			'Logs'
		])
	},
	{
		id: 'web-fundamentals',
		name: 'Web Fundamentals',
		icon: '🌐',
		items: items('web-fundamentals', [
			'Browser Rendering',
			'Rendering Pipeline',
			'Event Loop',
			'Call Stack',
			'Microtasks',
			'Macrotasks',
			'DOM',
			'BOM',
			'Cookies',
			'Local Storage',
			'Session Storage',
			'Service Workers',
			'Browser Cache',
			'HTTP Lifecycle'
		])
	},
	{
		id: 'project-preparation',
		name: 'Project Preparation',
		icon: '📋',
		items: items('project-preparation', [
			'Explain Architecture',
			'Explain Database Design',
			'Explain APIs',
			'Explain Authentication',
			'Explain Tradeoffs',
			'Explain Performance Optimizations',
			'Explain Scaling Strategy',
			'Explain Challenges',
			'Explain Future Improvements'
		])
	},
	{
		id: 'behavioral',
		name: 'Behavioral Interview',
		icon: '🗣️',
		items: items('behavioral', [
			'STAR Method',
			'Leadership',
			'Ownership',
			'Conflict Resolution',
			'Teamwork',
			'Communication',
			'Failure Stories',
			'Success Stories',
			'Project Walkthrough',
			'Resume Walkthrough'
		])
	},
	{
		id: 'debugging-performance',
		name: 'Debugging & Performance',
		icon: '🐞',
		items: items('debugging-performance', [
			'Debugging Strategy',
			'Root Cause Analysis',
			'Logging',
			'Profiling',
			'Memory Leaks',
			'Performance Optimization',
			'Caching Strategies',
			'Monitoring'
		])
	},
	{
		id: 'resume-mocks',
		name: 'Resume & Mock Interviews',
		icon: '📄',
		items: items('resume-mocks', [
			'ATS Resume',
			'LinkedIn',
			'GitHub',
			'Portfolio',
			'Mock Coding Interviews',
			'Mock System Design',
			'Mock Behavioral',
			'Resume Review'
		])
	}
];
