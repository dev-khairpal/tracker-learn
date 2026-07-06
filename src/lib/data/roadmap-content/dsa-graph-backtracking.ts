import type { RoadmapDetailMap } from './types';

export const DsaGraphBacktrackingContent: RoadmapDetailMap = {
	DFS: {
		definition:
			"Depth-first search on a graph recursively (or via an explicit stack) explores as far as possible down each branch before backtracking, using a visited set to avoid revisiting nodes — the visited set is essential here because graphs can have cycles, unlike tree DFS where there's no edge back to an already-visited node.",
		useCase:
			'Counting the number of islands in a 2D grid of land/water cells by treating every land cell as a graph node and flood-filling all connected land reachable from it with DFS.',
		detailedMarkdown: `
# DFS (Depth-First Search) on Graphs

**Graph DFS** explores as deep as possible along one path before backtracking to try the next option, using either recursion (the call stack does the bookkeeping) or an explicit stack. The critical difference from **tree DFS** is the **visited set**: a tree has no cycles, so you never need to ask "have I been here before?" — you simply can't get back to an ancestor. A graph can have cycles (and undirected edges create a trivial 2-node cycle between any pair of connected nodes), so without tracking visited nodes, DFS on a graph can loop forever.

## Adjacency List Representation
Most graph problems start by building an adjacency list — a map from each node to the list of nodes it connects to:

\`\`\`typescript
type Graph = Map<number, number[]>;

function buildGraph(edges: Array<[number, number]>, directed = false): Graph {
    const graph: Graph = new Map();
    for (const [u, v] of edges) {
        if (!graph.has(u)) graph.set(u, []);
        if (!graph.has(v)) graph.set(v, []);
        graph.get(u)!.push(v);
        if (!directed) graph.get(v)!.push(u);
    }
    return graph;
}
\`\`\`

## Recursive DFS
\`\`\`typescript
function dfs(graph: Graph, start: number): number[] {
    const visited = new Set<number>();
    const order: number[] = [];

    function visit(node: number): void {
        if (visited.has(node)) return;
        visited.add(node);
        order.push(node);
        for (const neighbor of graph.get(node) ?? []) {
            visit(neighbor);
        }
    }

    visit(start);
    return order;
}
\`\`\`

## Iterative DFS (Explicit Stack)
Recursion depth is bounded by the call stack, which can overflow on very deep or very large graphs. An explicit stack avoids that:

\`\`\`typescript
function dfsIterative(graph: Graph, start: number): number[] {
    const visited = new Set<number>([start]);
    const stack: number[] = [start];
    const order: number[] = [];

    while (stack.length > 0) {
        const node = stack.pop()!;
        order.push(node);
        for (const neighbor of graph.get(node) ?? []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                stack.push(neighbor);
            }
        }
    }
    return order;
}
\`\`\`

## Classic Problem: Number of Islands
Each land cell is a node; DFS flood-fills every land cell reachable from it, marking a whole island visited in one pass:

\`\`\`typescript
function numIslands(grid: string[][]): number {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set<string>();
    let islands = 0;

    function dfs(r: number, c: number): void {
        const key = \`\${r},\${c}\`;
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        if (grid[r][c] === '0' || visited.has(key)) return;
        visited.add(key);
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1' && !visited.has(\`\${r},\${c}\`)) {
                islands++;
                dfs(r, c);
            }
        }
    }
    return islands;
}
\`\`\`

## Classic Problem: Cycle Detection in a Directed Graph (3-Color Marking)
For a **directed** graph, a plain visited/unvisited boolean isn't enough — you need to distinguish "fully finished" from "currently on the path I'm exploring right now." That's the classic 3-color scheme:
- **White (0)** — never visited.
- **Gray (1)** — currently in the recursion stack (an ancestor of the node we're on).
- **Black (2)** — fully explored, safe.

A cycle exists exactly when DFS reaches a **Gray** node — that means we've looped back to one of our own ancestors:

\`\`\`typescript
function hasCycle(graph: Graph, nodeCount: number): boolean {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Array<number>(nodeCount).fill(WHITE);

    function dfs(node: number): boolean {
        color[node] = GRAY; // mark: currently in the recursion stack
        for (const neighbor of graph.get(node) ?? []) {
            if (color[neighbor] === GRAY) return true; // back edge to an ancestor -> cycle
            if (color[neighbor] === WHITE && dfs(neighbor)) return true;
        }
        color[node] = BLACK; // fully explored, safe forever
        return false;
    }

    for (let n = 0; n < nodeCount; n++) {
        if (color[n] === WHITE && dfs(n)) return true;
    }
    return false;
}
\`\`\`

## Complexity
- **Time:** O(V + E) — every vertex and edge is visited once.
- **Space:** O(V) for the visited set/color array, plus O(V) worst case for the recursion stack (or explicit stack) on a skewed graph.

## Signals This Pattern Applies
- The problem is about exploring "all the way down one path before trying another" — connectivity, reachability, or flood-fill over a grid/graph.
- "Number of islands," "connected components," "all paths from A to B," or "does a cycle exist" style phrasing.
- You need to fully explore one branch/region before moving to a sibling — as opposed to processing everything "layer by layer" (that's BFS instead).
- A directed graph plus the phrase "detect a cycle" or "can these tasks ever deadlock" — signals the 3-color variant specifically.

## Common Pitfalls
- Forgetting the visited set entirely — DFS on a graph with a cycle will recurse forever.
- For directed-graph cycle detection, using a single visited boolean instead of 3 states — a node that's Black (fully done) is safe to revisit from a different ancestor, but a plain "visited" set would wrongly treat it the same as a Gray (in-progress) node and either miss real cycles or report false ones.
- Recursion depth: on graphs with thousands of nodes in a single chain, recursive DFS can stack-overflow — the iterative stack-based version is the fix.
- For undirected graphs, naively treating "the neighbor I just came from" as a cycle — you must track the parent explicitly and only flag a cycle when you see a visited node that ISN'T your immediate parent.

## Interview Angle
A common follow-up: *"What if the graph is too large for recursion?"* — swap to the iterative stack version, same logic. Another: *"How is this different for an undirected graph's cycle detection?"* — undirected cycle detection typically uses Union-Find (see that topic) instead of 3-coloring, since a trivial back edge to your own parent isn't a real cycle and needs special-casing in DFS but not in Union-Find.
	`
	},

	BFS: {
		definition:
			'Breadth-first search explores a graph in layers using a FIFO queue and a visited set, visiting every node at distance k from the source before any node at distance k+1 — which is exactly why it finds the shortest path in an unweighted graph.',
		useCase:
			"Finding the minimum number of moves to escape a maze/grid, where every move costs the same 'one step,' by expanding outward from the start cell one full layer at a time.",
		detailedMarkdown: `
# BFS (Breadth-First Search) on Graphs

**BFS** explores a graph outward in concentric layers: it visits the start node, then every neighbor one edge away, then every node two edges away, and so on — using a FIFO **queue** to enforce that ordering and a **visited set** to make sure no node is enqueued twice. Because every edge is treated as costing exactly 1, the first time BFS reaches any node is guaranteed to be via the shortest possible number of edges — that's the whole reason BFS is the go-to for shortest path **in an unweighted graph**.

## Why BFS (Not DFS) Gives You Shortest Path
DFS commits to one path and only backtracks when it hits a dead end — it might find *a* path to the target, but there's no guarantee it's the shortest one. BFS explores every node at distance 1 before any node at distance 2, so the very first time it reaches the target, it must be by the minimum number of steps. This layer-by-layer guarantee is the core insight interviewers are checking for.

## Generic BFS
\`\`\`typescript
type Graph = Map<number, number[]>;

function bfs(graph: Graph, start: number): Map<number, number> {
    const distance = new Map<number, number>([[start, 0]]);
    const queue: number[] = [start];
    let head = 0;

    while (head < queue.length) {
        const node = queue[head++];
        for (const neighbor of graph.get(node) ?? []) {
            if (!distance.has(neighbor)) {
                distance.set(neighbor, distance.get(node)! + 1);
                queue.push(neighbor);
            }
        }
    }
    return distance;
}
\`\`\`
Note \`distance\` is set (marking "visited") at **enqueue** time, not dequeue time — marking it late lets the same node get pushed onto the queue multiple times before it's ever processed.

## Classic Problem: Shortest Path in a Grid/Maze
\`\`\`typescript
function shortestPathInGrid(
    grid: number[][],
    start: [number, number],
    end: [number, number]
): number {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set<string>([\`\${start[0]},\${start[1]}\`]);
    const queue: Array<[number, number, number]> = [[start[0], start[1], 0]];
    let head = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    while (head < queue.length) {
        const [r, c, dist] = queue[head++];
        if (r === end[0] && c === end[1]) return dist;

        for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            const key = \`\${nr},\${nc}\`;
            if (
                nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                grid[nr][nc] === 0 && !visited.has(key)
            ) {
                visited.add(key);
                queue.push([nr, nc, dist + 1]);
            }
        }
    }
    return -1; // target unreachable
}
\`\`\`

## Classic Problem: Rotting Oranges (Multi-Source BFS)
When a problem has **several starting points that all begin at distance 0 simultaneously**, seed the queue with all of them before the first pop — this is multi-source BFS:

\`\`\`typescript
function orangesRotting(grid: number[][]): number {
    const rows = grid.length;
    const cols = grid[0].length;
    const queue: Array<[number, number]> = [];
    let fresh = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) queue.push([r, c]);   // every rotten orange starts at minute 0
            else if (grid[r][c] === 1) fresh++;
        }
    }

    let minutes = 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let head = 0;

    while (head < queue.length && fresh > 0) {
        const levelSize = queue.length - head;
        for (let i = 0; i < levelSize; i++) {
            const [r, c] = queue[head++];
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.push([nr, nc]);
                }
            }
        }
        minutes++;
    }

    return fresh === 0 ? minutes : -1;
}
\`\`\`

## Classic Problem: Word Ladder
Same skeleton, just with an implicit graph: two words are "neighbors" if they differ by exactly one letter. BFS from the start word, generating neighbors on the fly (trying every letter substitution at every position) instead of reading them from an adjacency list, and the first time you dequeue the target word, the current BFS depth is the shortest transformation sequence length.

## Complexity
- **Time:** O(V + E) for a general graph; O(rows × cols) for a grid, since each cell is visited once.
- **Space:** O(V) for the queue and visited set.

## Signals This Pattern Applies
- "Shortest path," "minimum number of steps/moves," or "fewest operations" — and every step/edge has the same cost.
- The problem structure is a grid, maze, or implicit graph (like word transformations) with uniform-cost moves.
- Multiple valid starting points that should all be treated as distance 0 (rotting oranges, multiple sources spreading simultaneously).
- "Level by level" framing — e.g., "how many minutes until every cell is reached."

## Common Pitfalls
- Marking a node visited when it's **dequeued** instead of when it's **enqueued** — lets duplicates pile up in the queue and can blow up runtime.
- Reaching for DFS out of habit for a "shortest path" question — DFS can find *a* path but not reliably the *shortest* one in an unweighted graph.
- Forgetting the visited set is shared across all sources in multi-source BFS — running BFS separately from each source (rather than one BFS seeded with all sources) gives the wrong distances when regions overlap.
- Not tracking distance/level explicitly (either per-node or via processing "one full queue snapshot" per iteration) when the answer requires more than just "is it reachable."

## Interview Angle
A frequent follow-up: *"What if the edges have different weights?"* — that breaks BFS's core guarantee (visiting layer-by-layer no longer implies shortest cumulative weight), and you need Dijkstra's algorithm instead (see the Shortest Path topic). Another common ask: *"Return the actual path, not just the distance"* — solved by storing a parent pointer for each node the first time it's discovered, then walking parents backward from the target once found.
	`
	},

	'Topological Sort': {
		definition:
			"Topological sort produces a linear ordering of a Directed Acyclic Graph's (DAG) vertices such that for every directed edge u→v, u comes before v — it only exists for DAGs, since any cycle makes a consistent linear ordering impossible.",
		useCase:
			'Determining a valid order in which to take a set of courses, given a list of prerequisite pairs where course B requires course A to already be completed.',
		detailedMarkdown: `
# Topological Sort

A **topological sort** orders the vertices of a **Directed Acyclic Graph (DAG)** so that every directed edge \`u -> v\` has \`u\` appear before \`v\` in the final ordering. This concept is meaningless on a graph with a cycle: if A must come before B, and B must come before A, no linear order can satisfy both. That's also why "can you produce a topological order at all?" doubles as a cycle-detection tool.

## Approach 1: Kahn's Algorithm (BFS-Based, In-Degree Counting)
The idea: repeatedly peel off nodes that currently have **zero remaining prerequisites** (in-degree 0). Removing a node "satisfies" one prerequisite for each of its neighbors, so decrement their in-degree; any that drop to 0 become newly available.

\`\`\`typescript
function topoSortKahn(numCourses: number, prerequisites: number[][]): number[] {
    const graph = new Map<number, number[]>();
    const inDegree = new Array<number>(numCourses).fill(0);

    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [course, prereq] of prerequisites) {
        graph.get(prereq)!.push(course);
        inDegree[course]++;
    }

    const queue: number[] = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }

    const order: number[] = [];
    let head = 0;
    while (head < queue.length) {
        const node = queue[head++];
        order.push(node);
        for (const next of graph.get(node) ?? []) {
            inDegree[next]--;
            if (inDegree[next] === 0) queue.push(next);
        }
    }

    // If we couldn't include every node, some remaining nodes only point at each
    // other in a cycle and their in-degree never reached 0.
    return order.length === numCourses ? order : [];
}
\`\`\`

## Approach 2: DFS-Based (Post-Order Reversal)
The idea: run DFS, and every time a node finishes exploring **all** of its descendants, push it onto a list. A node's descendants always finish before the node itself, so the reverse of that finishing order is a valid topological order.

\`\`\`typescript
function topoSortDFS(numCourses: number, prerequisites: number[][]): number[] {
    const graph = new Map<number, number[]>();
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [course, prereq] of prerequisites) graph.get(prereq)!.push(course);

    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Array<number>(numCourses).fill(WHITE);
    const postOrder: number[] = [];
    let hasCycle = false;

    function dfs(node: number): void {
        color[node] = GRAY;
        for (const next of graph.get(node) ?? []) {
            if (color[next] === GRAY) { hasCycle = true; return; }
            if (color[next] === WHITE) dfs(next);
        }
        color[node] = BLACK;
        postOrder.push(node); // pushed only after every descendant has finished
    }

    for (let i = 0; i < numCourses; i++) {
        if (color[i] === WHITE) dfs(i);
    }

    if (hasCycle) return [];
    return postOrder.reverse(); // reverse post-order = topological order
}
\`\`\`

## Cycle Detection via Topological Sort
Both approaches double as cycle detectors: **Kahn's** — if the final \`order\` has fewer nodes than the graph, whatever's left over is stuck in a cycle (their in-degree never reaches 0). **DFS-based** — reaching a Gray node (one still on the current recursion path) means a back edge exists, i.e. a cycle.

## Complexity
- **Time:** O(V + E) for both approaches — every vertex and edge is processed a constant number of times.
- **Space:** O(V + E) for the graph plus O(V) for in-degrees/colors/queue.

## Signals This Pattern Applies
- "Prerequisites," "must happen before," "dependency graph," or "build order."
- The problem explicitly says (or implies) a DAG — no cycles — and asks for *a* valid ordering, or asks *whether* a valid ordering is even possible.
- "Task scheduling" where tasks have dependency constraints on other tasks.
- Any variant of "is it possible to finish/complete all X given these ordering constraints."

## Common Pitfalls
- Running either algorithm on a graph that might have a cycle and assuming the output is automatically correct — you must explicitly check (\`order.length === numCourses\` for Kahn's, or the \`hasCycle\` flag for DFS) rather than blindly trusting the result.
- Forgetting to reverse the DFS post-order — the raw finishing order is the reverse of a valid topological order, not the order itself.
- Not initializing in-degree/adjacency entries for isolated nodes (nodes with no prerequisites and no dependents still need to appear in the final order).
- Assuming there's only one valid topological order — in general there can be many; only a graph shaped like a single chain has a unique one.

## Interview Angle
A common follow-up: *"Return the lexicographically smallest valid ordering."* Swap Kahn's plain queue for a **min-heap** — at each step, pick the smallest available (in-degree 0) node instead of just any one. Another: *"What's the minimum number of semesters to finish all courses?"* — that's Kahn's algorithm again, but counting the number of BFS "layers" (each layer is everything with in-degree 0 processed together) instead of building a flat list.
	`
	},

	'Union-Find (Disjoint Set Union)': {
		definition:
			'Union-Find (Disjoint Set Union) tracks a partition of elements into disjoint sets, supporting find(x) ("which set is x in?") and union(x, y) ("merge these two sets") in near-constant amortized time once path compression and union by rank/size are both applied.',
		useCase:
			"Incrementally processing a stream of 'these two accounts belong to the same person' edges and answering 'are these two accounts linked?' queries efficiently, without re-running a full graph traversal after every new edge.",
		detailedMarkdown: `
# Union-Find (Disjoint Set Union)

**Union-Find** (a.k.a. **Disjoint Set Union**, DSU) maintains a collection of disjoint sets and supports two operations extremely efficiently:
- \`find(x)\` — which set does \`x\` currently belong to (returns a representative "root" for that set)?
- \`union(x, y)\` — merge the sets containing \`x\` and \`y\` into one.

Each set is represented as a tree, where every node points to a parent, and the root points to itself. \`find\` walks up parent pointers until it hits a root.

## The Naive Version Is Slow
Without any optimization, \`union\` can attach trees arbitrarily, so a long chain of unions can produce a tree that's just a straight line — \`find\` then costs O(n) in the worst case, no better than a linked list.

## Optimization 1: Path Compression
Every time \`find(x)\` walks up to the root, it rewires every node along that path to point **directly** at the root. Future \`find\` calls on those nodes become instant.

## Optimization 2: Union by Rank (or Size)
When merging two trees, always attach the **shorter** (lower rank) tree under the **taller** one's root, instead of picking arbitrarily. This keeps trees from growing tall in the first place.

Combined, these two optimizations bring the amortized cost of both operations down to **O(α(n))**, where α is the **inverse Ackermann function** — it grows so slowly that α(n) is less than 5 for any n you could ever construct in practice, which is why Union-Find is described as "near O(1)."

## Code Example
\`\`\`typescript
class UnionFind {
    private parent: number[];
    private rank: number[];
    private components: number;

    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array<number>(n).fill(0);
        this.components = n;
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // path compression
        }
        return this.parent[x];
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY) return false; // already connected -- this edge would form a cycle

        // union by rank: attach the shorter tree under the taller one
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        this.components--;
        return true;
    }

    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }

    count(): number {
        return this.components;
    }
}
\`\`\`

## Classic Problem: Number of Connected Components
\`\`\`typescript
function countComponents(n: number, edges: number[][]): number {
    const uf = new UnionFind(n);
    for (const [a, b] of edges) uf.union(a, b);
    return uf.count();
}
\`\`\`

## Classic Problem: Detect Cycle in an Undirected Graph
\`union()\` returning \`false\` means the two endpoints were already connected before this edge — so this edge closes a cycle:

\`\`\`typescript
function hasCycleUndirected(n: number, edges: number[][]): boolean {
    const uf = new UnionFind(n);
    for (const [a, b] of edges) {
        if (!uf.union(a, b)) return true;
    }
    return false;
}
\`\`\`

## Looking Ahead: Kruskal's MST
Kruskal's Minimum Spanning Tree algorithm is almost entirely "sort edges by weight, then run this exact \`hasCycleUndirected\` check while greedily adding edges" — see the Minimum Spanning Tree topic, which builds directly on this class.

## Complexity
- **Time:** O(α(n)) amortized per \`find\`/\`union\` call — effectively constant in practice.
- **Space:** O(n) for the parent and rank arrays.

## Signals This Pattern Applies
- "Are these two nodes/accounts/items connected (directly or indirectly)?" queries, especially **interleaved** with new connections being added over time (dynamic/online connectivity).
- "Number of connected components," "number of provinces," "friend circles," or "accounts merge" style problems.
- Detecting a cycle while incrementally building an **undirected** graph — especially inside Kruskal's MST algorithm.
- The problem never actually needs the full path/structure of connections — only "same group or not."

## Common Pitfalls
- Skipping path compression — \`find\` degrades toward O(n) on a skewed tree, defeating the whole point of the structure.
- Comparing ranks of \`x\` and \`y\` directly instead of their **roots** (\`find(x)\`/\`find(y)\`) before deciding which tree to attach under which.
- Forgetting to decrement the components counter only on a **successful** union (i.e., only when the roots were different) — decrementing unconditionally overcounts.
- Reaching for Union-Find to detect a cycle in a **directed** graph — it only reasons about undirected connectivity and will give wrong answers there; directed cycle detection needs DFS 3-coloring (see the DFS topic) instead.

## Interview Angle
A common follow-up: *"Can Union-Find detect cycles in a directed graph?"* No — Union-Find has no notion of edge direction, so it can't distinguish "A depends on B" from "B depends on A." That's exactly the DFS-with-3-colors technique from the DFS topic. Another frequent ask: *"Why union by rank AND path compression, isn't one enough?"* — either alone gives an amortized O(log n); it's specifically the **combination** of both that proves out to the much tighter O(α(n)) bound.
	`
	},

	'Shortest Path (BFS / Dijkstra)': {
		definition:
			"Shortest path in an unweighted graph is just BFS (every edge costs 1); Dijkstra's algorithm generalizes this to weighted graphs with non-negative edge weights by greedily expanding the closest not-yet-finalized node using a priority queue, relaxing its neighbors' distances as it goes.",
		useCase:
			'Computing the minimum time for a signal sent from one node to reach every other node in a network, where each connection has its own weighted transmission delay.',
		detailedMarkdown: `
# Shortest Path: BFS vs Dijkstra

**BFS** finds shortest paths in an **unweighted** graph "for free," because visiting nodes layer by layer guarantees the first time you reach any node is via the fewest possible edges (see the BFS topic). The moment edges have **different weights**, that guarantee breaks: a path with more edges can still have a smaller total weight than a path with fewer edges. **Dijkstra's algorithm** is the generalization that handles this correctly — as long as all edge weights are **non-negative**.

## Why BFS Breaks Down With Weights
BFS processes nodes strictly in the order they're discovered. With weighted edges, a node discovered "later" via a cheap long edge might actually have a smaller total distance than a node discovered "earlier" via an expensive short edge. BFS's queue order no longer matches distance order once weights vary.

## Dijkstra's Algorithm
Dijkstra fixes this by always expanding the **not-yet-finalized node with the smallest known distance so far**, using a **min-priority queue** keyed on distance. Every time a node is popped, its distance is final (this only holds because weights are non-negative — a negative edge could still improve a "finalized" distance later, which is exactly why Dijkstra fails there). Popping a node then **relaxes** its neighbors — updating their distance if going through this node is cheaper than what's currently known.

\`\`\`typescript
type Edge = [node: number, weight: number];

class MinHeap<T> {
    private heap: Array<[number, T]> = [];

    get size(): number {
        return this.heap.length;
    }

    push(priority: number, value: T): void {
        this.heap.push([priority, value]);
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[i][0]) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    pop(): [number, T] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let i = 0;
            while (true) {
                const left = 2 * i + 1, right = 2 * i + 2;
                let smallest = i;
                if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
                if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
                if (smallest === i) break;
                [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
                i = smallest;
            }
        }
        return top;
    }
}

function dijkstra(n: number, edges: Array<[number, number, number]>, source: number): number[] {
    const graph = new Map<number, Edge[]>();
    for (let i = 1; i <= n; i++) graph.set(i, []);
    for (const [u, v, w] of edges) graph.get(u)!.push([v, w]);

    const dist = new Array<number>(n + 1).fill(Infinity);
    dist[source] = 0;
    const pq = new MinHeap<number>();
    pq.push(0, source);

    while (pq.size > 0) {
        const [d, node] = pq.pop()!;
        if (d > dist[node]) continue; // stale entry -- a shorter path was already found

        for (const [neighbor, weight] of graph.get(node) ?? []) {
            const candidate = d + weight;
            if (candidate < dist[neighbor]) {
                dist[neighbor] = candidate;
                pq.push(candidate, neighbor);
            }
        }
    }

    return dist;
}
\`\`\`

## Classic Problem: Network Delay Time
\`\`\`typescript
function networkDelayTime(times: number[][], n: number, k: number): number {
    const dist = dijkstra(n, times.map(([u, v, w]) => [u, v, w]), k);
    const maxDist = Math.max(...dist.slice(1));
    return maxDist === Infinity ? -1 : maxDist;
}
\`\`\`

## Why Dijkstra Fails With Negative Edge Weights
Dijkstra's correctness relies on "once popped, a node's distance can never improve." A negative edge could later offer a cheaper route to an already-finalized node, silently invalidating that assumption — Dijkstra has no mechanism to revisit a finalized node, so it can return a wrong (too-large) answer. **Bellman-Ford** exists specifically to handle negative weights (and detect negative cycles) by relaxing every edge repeatedly, but it's a distinct, slower (O(V·E)) algorithm — out of scope for this topic beyond knowing it's the tool to reach for when weights can go negative.

## Classic Problem: Cheapest Flights Within K Stops
This problem adds a constraint plain Dijkstra doesn't understand: **at most K stops**. Dijkstra finalizes a node purely by cheapest total cost, completely ignoring how many edges were used to get there — so it can lock in a "cheapest overall" path that uses too many stops, while missing a slightly more expensive path that respects the K-stop limit. The fix is a **Bellman-Ford-style bounded relaxation**: run only K+1 rounds of "relax every edge once," which caps every path considered at K+1 edges by construction.

## Complexity
- **BFS shortest path:** O(V + E).
- **Dijkstra (binary heap):** O((V + E) log V).

## Signals This Pattern Applies
- "Shortest path" or "minimum cost to reach" phrasing **plus** explicit, varying edge weights (times, costs, distances) — reach for Dijkstra, not BFS.
- Weights are guaranteed non-negative (real-world costs, times, distances naturally are) — that guarantee is what makes Dijkstra valid at all.
- "Network delay," "cheapest cost," or "minimum cost with a stop/edge-count constraint" over a weighted graph.
- If the problem explicitly mentions **negative weights**, that's a signal Dijkstra is the *wrong* tool — think Bellman-Ford instead.

## Common Pitfalls
- Running Dijkstra on a graph with negative edges and trusting the result — it can silently be wrong rather than obviously crashing.
- Marking a node "done" the moment it's pushed onto the heap instead of when it's popped — this can finalize a suboptimal distance before a cheaper route is discovered.
- Forgetting the "stale entry" check (\`if (d > dist[node]) continue;\`) — without it, the algorithm still terminates with a correct answer but does redundant work processing outdated queue entries.
- Applying plain Dijkstra directly to "cheapest flights within K stops" and getting a too-low-cost answer that actually needs more stops than allowed.

## Interview Angle
A common follow-up: *"How do you reconstruct the actual shortest path, not just its length?"* — store a \`parent\` array, updated every time \`dist[neighbor]\` improves, then walk parents backward from the target. Another: *"Why not just use BFS by 'unrolling' each weighted edge into a chain of unit-weight edges?"* — technically possible for small integer weights, but it wastes memory/time proportional to the weight values; Dijkstra handles arbitrary (including large or non-integer) non-negative weights directly.
	`
	},

	'Minimum Spanning Tree (Kruskal / Prim)': {
		definition:
			"A Minimum Spanning Tree (MST) connects every vertex of a weighted, undirected, connected graph using the minimum possible total edge weight and no cycles; Kruskal's algorithm builds it by greedily adding the globally cheapest edge that doesn't create a cycle, while Prim's algorithm grows a single tree outward, always adding the cheapest edge that reaches a new vertex.",
		useCase:
			'Designing the cheapest possible network of cables to connect a set of offices, given the cost of running a direct cable between every pair of offices.',
		detailedMarkdown: `
# Minimum Spanning Tree: Kruskal vs Prim

A **spanning tree** of a connected, undirected graph touches every vertex using exactly V-1 edges and no cycles. A **Minimum Spanning Tree (MST)** is the spanning tree whose edges sum to the smallest possible total weight. Two greedy algorithms both provably produce an MST, working from opposite ends of the problem.

## Kruskal's Algorithm: Sort Edges, Union-Find to Avoid Cycles
Sort **all edges** by weight ascending, then walk the list greedily: add an edge if and only if its two endpoints aren't already connected (i.e., adding it wouldn't create a cycle). "Are these two endpoints already connected?" is exactly the Union-Find \`connected\`/\`union\` check from the Union-Find topic.

\`\`\`typescript
class DSU {
    private parent: number[];
    private rank: number[];

    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array<number>(n).fill(0);
    }

    find(x: number): number {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x), rootY = this.find(y);
        if (rootX === rootY) return false;
        if (this.rank[rootX] < this.rank[rootY]) this.parent[rootX] = rootY;
        else if (this.rank[rootX] > this.rank[rootY]) this.parent[rootY] = rootX;
        else { this.parent[rootY] = rootX; this.rank[rootX]++; }
        return true;
    }
}

function kruskalMST(n: number, edges: Array<[number, number, number]>): number {
    // edges: [u, v, weight]
    const sorted = [...edges].sort((a, b) => a[2] - b[2]);
    const dsu = new DSU(n);
    let totalWeight = 0;
    let edgesUsed = 0;

    for (const [u, v, weight] of sorted) {
        if (dsu.union(u, v)) { // only "counts" if it doesn't close a cycle
            totalWeight += weight;
            edgesUsed++;
            if (edgesUsed === n - 1) break; // a tree on n nodes has exactly n-1 edges
        }
    }

    return edgesUsed === n - 1 ? totalWeight : -1; // -1 means the graph wasn't connected
}
\`\`\`

## Prim's Algorithm: Grow a Tree From a Start Node
Prim's starts from any single node and repeatedly adds the **cheapest edge that connects the current tree to a vertex not yet in it** — a priority queue tracks the frontier of candidate edges:

\`\`\`typescript
class MinHeap<T> {
    private heap: Array<[number, T]> = [];
    get size(): number { return this.heap.length; }

    push(priority: number, value: T): void {
        this.heap.push([priority, value]);
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[i][0]) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }

    pop(): [number, T] | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let i = 0;
            while (true) {
                const left = 2 * i + 1, right = 2 * i + 2;
                let smallest = i;
                if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
                if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
                if (smallest === i) break;
                [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
                i = smallest;
            }
        }
        return top;
    }
}

function primMST(n: number, adj: Map<number, Array<[number, number]>>): number {
    const inTree = new Array<boolean>(n).fill(false);
    const pq = new MinHeap<number>();
    pq.push(0, 0); // start growing the tree from node 0
    let totalWeight = 0;
    let nodesAdded = 0;

    while (pq.size > 0 && nodesAdded < n) {
        const [weight, node] = pq.pop()!;
        if (inTree[node]) continue; // stale entry -- already added via a cheaper edge

        inTree[node] = true;
        totalWeight += weight;
        nodesAdded++;

        for (const [neighbor, edgeWeight] of adj.get(node) ?? []) {
            if (!inTree[neighbor]) pq.push(edgeWeight, neighbor);
        }
    }

    return nodesAdded === n ? totalWeight : -1;
}
\`\`\`

## When to Reach for Each
- **Kruskal** — natural when edges are already given as a flat list, or the graph is **sparse** (E close to V). Sorting E edges dominates the cost: O(E log E).
- **Prim** — natural when the graph is given as an **adjacency matrix** or is **dense** (E close to V²), since Prim only ever needs to look at edges touching the current tree, not a global sort of every edge.

## Why the Greedy Choice Is Optimal: The Cut Property
Both algorithms rely on the **cut property**: for any way of partitioning the vertices into two non-empty groups (a "cut"), the minimum-weight edge crossing that cut must belong to *some* MST. Kruskal repeatedly picks the globally cheapest edge that crosses the cut between "already-merged components" and "everything else." Prim repeatedly picks the cheapest edge crossing the cut between "in the tree" and "not in the tree yet." Because the cut property guarantees the cheapest crossing edge is always safe to add, neither algorithm ever needs to backtrack on a greedy choice.

## Complexity
- **Kruskal:** O(E log E) — dominated by sorting the edges; Union-Find operations are near O(1) amortized.
- **Prim (binary heap):** O(E log V) — similar shape to Dijkstra, since it's structurally the same "priority queue over the frontier" idea.

## Signals This Pattern Applies
- "Connect all nodes/cities/offices with the minimum total cost," "minimum cost to connect all points."
- A weighted, undirected, connected graph where you need a **spanning subgraph** (touches every vertex, exactly V-1 edges, no cycles) — not a shortest path between two specific nodes.
- "Network design," "minimum cost wiring," or laying cable/pipe/road between locations at minimum total cost.

## Common Pitfalls
- Confusing MST with shortest-path — MST minimizes the **total weight across the whole tree**; it does **not** guarantee the path between any two particular nodes within that tree is the shortest path between them in the original graph.
- Forgetting the graph might not be connected — no spanning tree exists then; Kruskal's \`edgesUsed\` will never reach \`n - 1\`, which must be checked explicitly.
- Implementing "Kruskal" without actually using Union-Find to check for cycles — just sorting and greedily adding edges without a cycle check can produce an invalid result with cycles.
- In Prim's, forgetting to skip a popped node that's already \`inTree\` — stale heap entries (pushed before a cheaper edge to the same node was found) must be discarded.

## Interview Angle
A common follow-up: *"Is the MST unique?"* Only if all edge weights are distinct — ties can produce multiple different spanning trees that all share the same (minimum) total weight. Another: *"How is this different from Dijkstra, since both use a priority queue over a frontier?"* — Dijkstra minimizes **distance from one fixed source to every node**; Prim minimizes **total weight of the tree as a whole**, with no notion of a "distance from source" at all — they can produce entirely different trees on the same graph.
	`
	},

	Backtracking: {
		definition:
			'Backtracking is a recursive search technique that builds a solution one choice at a time and explicitly undoes ("backtracks out of") a choice once it\'s clear that path can\'t lead anywhere valid — that undo step is the defining feature that separates it from plain DFS/recursion.',
		useCase:
			'Solving N-Queens by placing queens column by column, immediately abandoning any placement that attacks a previously placed queen instead of building out an entire board before checking validity.',
		detailedMarkdown: `
# Backtracking

**Backtracking** is DFS over a **decision tree**, where each level of the tree represents one choice in building up a solution. The pattern is always: **choose** a candidate, **explore** deeper assuming that choice, then **un-choose** it (undo the choice) before trying the next candidate at that level. That un-choose step is what makes it "backtracking" rather than plain recursion — without it, state from one branch would leak into sibling branches.

## The Decision Tree Mental Model
Picture the full search space as a tree: the root is "no choices made yet," and each edge represents committing to one option. A leaf is either a complete valid solution or a dead end. Backtracking is a DFS over this tree that builds the tree's nodes on the fly instead of having them precomputed — and it never actually visits every leaf, thanks to pruning.

## Pruning: Cutting Off Branches Early
The efficiency of backtracking comes almost entirely from **pruning** — checking, before recursing further, whether the current partial solution can *possibly* lead to something valid, and skipping the recursive call entirely if not. Without pruning, backtracking degenerates into brute-force enumeration of every possibility.

## Code Example: N-Queens
Place one queen per row, column by column within that row, immediately skipping any column that's attacked by a queen already placed (pruning), rather than placing all N queens and checking validity at the end:

\`\`\`typescript
function solveNQueens(n: number): string[][] {
    const results: string[][] = [];
    const cols = new Set<number>();
    const diag1 = new Set<number>(); // row - col is constant along a "\\" diagonal
    const diag2 = new Set<number>(); // row + col is constant along a "/" diagonal
    const placement: number[] = []; // placement[row] = col

    function backtrack(row: number): void {
        if (row === n) {
            results.push(buildBoard(placement, n));
            return;
        }

        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue; // pruning: this column is attacked, don't even recurse
            }

            // choose
            cols.add(col);
            diag1.add(row - col);
            diag2.add(row + col);
            placement.push(col);

            // explore
            backtrack(row + 1);

            // un-choose -- the step that makes this backtracking, not plain DFS
            cols.delete(col);
            diag1.delete(row - col);
            diag2.delete(row + col);
            placement.pop();
        }
    }

    backtrack(0);
    return results;
}

function buildBoard(placement: number[], n: number): string[] {
    return placement.map((col) => '.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1));
}
\`\`\`

## Complexity
- **Time:** Worst case O(n!) branches explored for N-Queens-style problems (bounded further in practice by pruning); each complete solution costs O(n) to materialize.
- **Space:** O(n) for the recursion depth and the tracking sets, plus O(solutions × n) to store all results.

## Signals This Pattern Applies
- "Find all ways to...," "generate all valid...," or "how many distinct solutions exist."
- The problem is naturally a sequence of decisions where each decision is constrained by ones already made (placing queens, filling Sudoku cells, assigning colors to regions).
- Constraints can be checked **incrementally** on a partial solution, enabling early pruning rather than only validating a fully-built candidate.
- The search space is a decision tree generated on the fly — there's no fixed graph or adjacency list to traverse, you generate the next choices yourself at each step.

## Common Pitfalls
- Forgetting the "un-choose" step — leftover state from one branch silently corrupts sibling branches, producing wrong or duplicate results.
- Deep-copying the entire partial solution at every recursive call instead of mutating in place and undoing afterward — correct, but often far slower and more memory-hungry than necessary.
- Pruning too late (or not at all) — technically correct but no faster than brute force; the whole value of backtracking comes from cutting off invalid branches as early as possible.
- Getting the base case boundary wrong (e.g., \`row === n\` vs \`row === n - 1\`), which either misses valid solutions or produces incomplete ones.

## Interview Angle
A frequent follow-up: *"How would you count the number of solutions instead of returning them all?"* — drop the results array entirely and just increment a counter at the base case; the choose/explore/un-choose logic and pruning are unchanged. Another: *"How would you make N-Queens faster for larger n?"* — replace the \`Set\`-based column/diagonal tracking with bitmasks, turning membership checks and updates into O(1) integer bit operations instead of hash-set operations.
	`
	},

	Combinations: {
		definition:
			"Combinations generate every way to choose k elements out of n without regard to order and without repeating an element within a single combination — implemented by recursing with a 'start index' so each call only considers elements after the last one chosen, which prevents both revisiting earlier elements and producing the same combination twice in different orders.",
		useCase:
			'Generating every possible 3-person subcommittee from a group of 10 people, where {Alice, Bob, Carol} and {Bob, Alice, Carol} count as the exact same committee.',
		detailedMarkdown: `
# Combinations

**Combinations** answers: "what are all the ways to pick a group of k items from n, where order doesn't matter and no item repeats within a single group?" The technique that makes this work cleanly is the **start index**: each recursive call is only allowed to pick from elements *after* the index of the last element it chose, which simultaneously guarantees no element is reused and no combination is generated more than once (in a different order).

## The Start-Index Technique
If a recursive call at depth d chose element at index i, the next recursive call starts searching from index i + 1, never i or earlier. This is exactly what stops \`{1, 2}\` and \`{2, 1}\` from both being generated — the moment 2 is chosen before 1 in a call, 1 is simply never reachable afterward from that branch, because 1's index is behind the start index.

## Code Example
\`\`\`typescript
function combine(n: number, k: number): number[][] {
    const results: number[][] = [];
    const current: number[] = [];

    function backtrack(start: number): void {
        if (current.length === k) {
            results.push([...current]);
            return;
        }

        // Pruning: stop early if there aren't enough remaining numbers to reach length k.
        const remainingNeeded = k - current.length;
        for (let num = start; num <= n - remainingNeeded + 1; num++) {
            current.push(num);
            backtrack(num + 1); // start strictly AFTER num -- never revisit earlier elements
            current.pop();
        }
    }

    backtrack(1);
    return results;
}
\`\`\`

## Why Order Doesn't Matter Here
Because the start index only ever moves forward, every combination is discovered in exactly one canonical (ascending) order — there's no separate code path that could also generate it in a different element order, unlike Permutations where every distinct order genuinely produces a distinct valid answer.

## Complexity
- **Time:** O(C(n, k) × k) — C(n, k) total combinations, each costing O(k) to copy into the results array.
- **Space:** O(k) for the recursion depth / current path, plus O(C(n, k) × k) to store all results.

## Signals This Pattern Applies
- "Choose k out of n," "select a group/team/subcommittee of size k," or "combinations of."
- The problem explicitly states order doesn't matter — picking A-then-B is the same result as picking B-then-A.
- Phrasing implies avoiding duplicate combinations that are just reorderings of the same elements.

## Common Pitfalls
- Passing \`start\` (instead of \`num + 1\`) into the recursive call — this allows re-picking the same element or re-including earlier elements, producing duplicate combinations.
- Reaching for a "used" boolean array (the Permutations technique) instead of a start index — it technically can be made to work with extra guards, but it's needlessly more complex and slower than the natural start-index approach for an unordered selection.
- Forgetting to copy \`current\` (\`[...current]\`) before pushing to results — every stored result ends up as a reference to the same array, which then gets mutated by later backtracking steps.

## Interview Angle
A common follow-up: *"What if the input has duplicate values and you need unique combinations (Combination Sum II)?"* — sort the input first, then within the same recursion depth, skip an index if it holds the same value as the previous index that was already tried and un-chosen at that depth (\`if (i > start && nums[i] === nums[i - 1]) continue;\`), which prevents generating the identical combination twice.
	`
	},

	Permutations: {
		definition:
			"Permutations generate every possible ordering of a full set of elements — unlike Combinations, every element must appear in every result, and different orderings of the same elements count as distinct answers — implemented by tracking which elements are already 'used' in the current path, via a boolean array or in-place swapping.",
		useCase:
			'Generating every possible order to run a fixed set of 4 build jobs on a single machine, where running job A before job B is a genuinely different schedule than running B before A.',
		detailedMarkdown: `
# Permutations

**Permutations** answers: "what are all the possible orderings of this full set of elements?" Every element must be used in every result (unlike Combinations, which only picks a subset), and — critically — two results containing the exact same elements in a different order are considered **different, valid answers**. The technique is tracking a "used" set (or swapping elements in place) so each recursive call only picks from what hasn't been placed yet in the current path.

## How This Differs From Combinations
Combinations use a **start index** that only moves forward, which deliberately prevents revisiting earlier index positions — that's exactly right when order doesn't matter, but wrong for permutations, where you explicitly *need* to revisit earlier positions in a different sequence (e.g., placing element 1 after element 2 is a distinct permutation from placing it before). Permutations instead track "has this specific element been placed **anywhere** in the current path yet" — regardless of index — which allows any not-yet-used element to be tried next, in any order.

## Code Example: 'Used' Boolean Array
\`\`\`typescript
function permute(nums: number[]): number[][] {
    const results: number[][] = [];
    const current: number[] = [];
    const used = new Array<boolean>(nums.length).fill(false);

    function backtrack(): void {
        if (current.length === nums.length) {
            results.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue; // already placed somewhere in this path

            used[i] = true;
            current.push(nums[i]);

            backtrack();

            current.pop();
            used[i] = false;
        }
    }

    backtrack();
    return results;
}
\`\`\`

## Swap-Based Alternative (In Place, No Extra Array)
Instead of a separate \`used\` array, swap the chosen element into the current position, recurse, then swap back:

\`\`\`typescript
function permuteInPlace(nums: number[]): number[][] {
    const results: number[][] = [];

    function backtrack(start: number): void {
        if (start === nums.length) {
            results.push([...nums]);
            return;
        }

        for (let i = start; i < nums.length; i++) {
            [nums[start], nums[i]] = [nums[i], nums[start]]; // choose: swap into place
            backtrack(start + 1);
            [nums[start], nums[i]] = [nums[i], nums[start]]; // un-choose: swap back
        }
    }

    backtrack(0);
    return results;
}
\`\`\`

## Complexity
- **Time:** O(n! × n) — n! total permutations, each costing O(n) to copy into the results array.
- **Space:** O(n) for the recursion depth plus the \`used\` array, plus O(n! × n) to store all results.

## Signals This Pattern Applies
- "All possible orderings/arrangements," "every way to arrange," or "every possible sequence/schedule of all n items."
- Every element from the input MUST appear in every output, and swapping two elements' relative positions produces a genuinely different valid answer.
- Real-world framing that's inherently about sequence or order — job scheduling order, route order, seating arrangement.

## Common Pitfalls
- Mistakenly reusing the Combinations "start index" trick — this only ever picks elements moving forward through the array, producing sorted-order-only selections and missing almost every valid permutation.
- Forgetting to reset \`used[i] = false\` after the recursive call returns — elements get permanently locked out of every subsequent branch.
- With the swap-based approach, forgetting to swap back after recursing — this corrupts \`nums\` for every sibling branch at that level.
- Duplicate values in the input producing duplicate permutations in the output — needs a sort plus a "skip if the identical value was already tried at this depth" guard.

## Interview Angle
A common follow-up: *"How do you generate only unique permutations if the input has duplicate values?"* — sort \`nums\` first, and in the used-array loop, skip index \`i\` when \`nums[i] === nums[i - 1] && !used[i - 1]\` (meaning the identical earlier value currently isn't part of the path, so using this one now would just re-derive a permutation already produced by using that earlier one).
	`
	},

	Subsets: {
		definition:
			"Subsets (the power set) generates every possible selection of elements from a set, including the empty set and the full set itself — modeled as a binary include/exclude decision for each element, giving exactly 2^n subsets total, generated either via include/exclude recursion or by iterating every integer bitmask from 0 to 2^n - 1.",
		useCase:
			'Generating every possible combination of toppings a customer could choose for a pizza — including no toppings and every topping — to price out every possible order.',
		detailedMarkdown: `
# Subsets (Power Set)

**Subsets** (the **power set**) answers: "what are all the possible groupings of elements from this set, of *any* size, including the empty set and the full set?" Unlike Combinations, there's no fixed target size k — every subset from size 0 to size n is wanted. The natural model is a binary decision per element: for every element, either **include** it or **exclude** it, giving 2^n total combinations of choices, hence 2^n subsets.

## The Include/Exclude Recursion Tree
At each index, branch into two recursive calls: one where the current element is left out, one where it's included. After deciding for every index, whatever is currently in \`current\` is one complete subset.

\`\`\`typescript
function subsets(nums: number[]): number[][] {
    const results: number[][] = [];
    const current: number[] = [];

    function backtrack(index: number): void {
        if (index === nums.length) {
            results.push([...current]);
            return;
        }

        // Exclude nums[index]
        backtrack(index + 1);

        // Include nums[index]
        current.push(nums[index]);
        backtrack(index + 1);
        current.pop();
    }

    backtrack(0);
    return results;
}
\`\`\`

## The Bitmask Alternative
Every subset corresponds to exactly one integer bitmask between 0 and 2^n - 1, where bit i being set means "include nums[i]." This turns the recursive tree into a flat iterative loop:

\`\`\`typescript
function subsetsBitmask(nums: number[]): number[][] {
    const n = nums.length;
    const results: number[][] = [];

    for (let mask = 0; mask < (1 << n); mask++) {
        const subset: number[] = [];
        for (let bit = 0; bit < n; bit++) {
            if (mask & (1 << bit)) subset.push(nums[bit]);
        }
        results.push(subset);
    }

    return results;
}
\`\`\`
Mask \`0\` (no bits set) is the empty set; mask \`(1 << n) - 1\` (every bit set) is the full set — both fall out naturally without any special-casing.

## Complexity
- **Time:** O(2^n × n) — 2^n subsets, each up to size n to build and copy.
- **Space:** O(2^n × n) to store all results; O(n) recursion depth for the recursive version.

## Signals This Pattern Applies
- "Power set," "all possible subsets," or "every combination of items of any size, including none and all."
- No fixed target size like Combinations' k — subsets of **every** size from 0 to n are wanted simultaneously.
- The problem framing is naturally "each item can independently be included or not" — toppings, feature flags, a yes/no choice per item.
- Small n (roughly n ≤ 20) is hinted at, which is what makes an explicit 2^n enumeration ("try every bitmask") computationally realistic.

## Common Pitfalls
- Confusing Subsets with Combinations — Subsets wants every size from 0 to n, not a single fixed k; reusing the Combinations "choose exactly k" recursion misses most of the intended answer.
- Forgetting the base case still pushes an empty \`current\` — accidentally omitting the empty set from the results.
- In the bitmask version, using \`(1 << n) - 1\` as the loop's exclusive upper bound instead of \`1 << n\` (off-by-one, drops the last mask), or letting n grow large enough that \`1 << n\` overflows — JavaScript's bitwise operators work on 32-bit integers, so this trick silently breaks down well before n reaches 32.
- Duplicate values in the input producing duplicate subsets — needs sorting plus a "skip an index equal to the previous index at the same recursion depth" guard, the same fix idea used for Combinations/Permutations with duplicates.

## Interview Angle
A common follow-up: *"The input has duplicates and you want unique subsets only (Subsets II)?"* — sort first, switch the recursion to a start-index loop (like Combinations), and skip \`i > start && nums[i] === nums[i - 1]\` at the same recursion depth to avoid generating the identical subset twice. Another: *"Generate only subsets of a specific size k"* — that's no longer Subsets at all, it's exactly the Combinations problem, since a fixed-size unordered selection is precisely what Combinations already targets.
	`
	}
};
