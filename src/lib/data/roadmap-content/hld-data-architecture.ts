import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Replication
  // - Sharding
  // - Partitioning
  // - Read Replicas
  // - Leader-Follower
  // - Multi-Leader
  // - Eventual Consistency
  // - Monolith
  // - Microservices
  // - Serverless
  // - Event Driven
  // - CQRS
  // - Saga Pattern
 */
export const HldDataArchitectureContent: RoadmapDetailMap = {
	'Replication (System Design)': {
		definition:
			'Keeping multiple copies of the same data on different nodes so the system survives node failure and can serve more read traffic.',
		useCase:
			'Running a Postgres primary in us-east with two standby copies in different availability zones so the database survives a full rack failure without losing data.',
		detailedMarkdown: `
# Replication (System Design Lens)

**Replication** means storing identical copies of the same dataset on multiple machines. In system design interviews, replication is almost never about the database internals of *how* the copy is made — it's about the trade-off you're accepting: **durability and availability** versus **consistency and write latency**.

Every distributed data store you'll ever design or discuss (Postgres, MySQL, MongoDB, Kafka, DynamoDB) replicates data for one or more of these reasons:

1. **Durability** — if a disk dies, the data isn't gone.
2. **Availability** — if a node goes down, another copy can still serve requests.
3. **Read scalability** — spread read traffic across copies (see **Read Replicas**).
4. **Geographic locality** — put a copy close to users in Europe, Asia, and the US so latency stays low.

## Synchronous vs Asynchronous Replication

This is the trade-off interviewers actually want you to articulate:

| | Synchronous | Asynchronous |
|---|---|---|
| **Write acknowledged when** | All (or a quorum of) replicas confirm the write | Only the leader confirms; replicas catch up later |
| **Data loss risk on leader crash** | None (data is already on other nodes) | Yes — unreplicated writes can be lost |
| **Write latency** | Higher (bounded by the slowest replica) | Lower (doesn't wait on the network round trip) |
| **Used by** | Financial ledgers, systems needing zero data loss | Most read-scaling replicas, cross-region copies |

A common middle ground is **semi-synchronous replication**: the leader waits for acknowledgment from just *one* replica (not all of them) before confirming the write, then propagates to the rest asynchronously. MySQL and Postgres both support this mode — it caps the worst-case data loss to "at most the writes not yet seen by the fastest replica" without paying the full latency tax of waiting on every copy.

## Why interviewers bring this up

Replication is the first knob you reach for whenever a design needs to survive machine failure. If you're asked "what happens if this database server dies?", the answer starts with "we replicate it." The follow-up question is almost always: *sync or async, and what do you lose if you pick async?* Being able to say "we accept a small window of potential data loss on failover in exchange for lower write latency, because our use case (e.g., social media likes) can tolerate it — but we would NOT accept that for a payments ledger" is the signal they're looking for.

## Replication vs Sharding

Don't confuse the two: **replication** copies the *same* data to multiple nodes (scales reads, adds durability). **Sharding** splits *different* data across multiple nodes (scales writes and storage). Most large-scale systems do both — e.g., a users table might be sharded by \`user_id\` across 64 shards, and each shard is itself replicated 3x for durability.
	`
	},

	'Sharding (System Design)': {
		definition:
			'Horizontally splitting a dataset across multiple independent database nodes, so each node holds only a slice of the total data and total write throughput scales with the number of nodes.',
		useCase:
			"Instagram splitting its Postgres 'users' table across thousands of logical shards, keyed by user ID, so no single machine has to hold or serve the entire user base.",
		detailedMarkdown: `
# Sharding (System Design Lens)

**Sharding** (aka horizontal partitioning across machines) is how you scale a database past the limits of a single box. A single Postgres instance can only take so many writes per second and hold so much data on disk — sharding solves both by splitting the dataset into independent chunks called **shards**, each living on its own node with its own CPU, RAM, and disk.

This is the go-to answer whenever an interview design hits "one database can't keep up."

## Choosing a Shard Key

The single most important — and most consequential — decision in sharding is the **shard key** (the column used to decide which shard a row lives on). Get it wrong and you get:

- **Hot shards:** if you shard a "tweets" table by \`created_date\`, every write for "today" lands on one shard while yesterday's shards sit idle. All the traffic piles onto a single node.
- **Cross-shard queries:** if related data ends up on different shards, a single logical query (e.g., "all orders for this user") now has to fan out to every shard and merge results in the application layer.
- **Painful resharding:** if the key is chosen poorly, migrating billions of rows to a new sharding scheme later is one of the most expensive operations a growing company can undertake (Instagram, Pinterest, and Notion have all written publicly about doing exactly this).

## A Concrete Example

Take a \`users\` table with 500 million rows that needs to be spread across 16 database nodes.

**Option A — Hash-based (\`user_id % 16\`):** Fast to route, spreads load very evenly, but adding a 17th node later means re-hashing almost every row (consistent hashing mitigates this pain — see the caching topic for the full mechanism).

**Option B — Geography-based (shard by region):** Great for data locality and regulatory requirements (e.g., EU user data must live in the EU for GDPR), but load is uneven — the shard serving North America will always be hotter than the one serving a smaller region.

**Option C — Range-based (\`user_id\` ranges: 0-31M, 31M-62M, ...):** Simple and makes range scans efficient, but if user IDs are assigned sequentially, all *new* signups hit the newest, emptiest shard — a hot shard again.

Instagram's real solution (widely documented) was a hybrid: generate 64-bit IDs that encode a **logical shard ID** directly into the ID itself at creation time, using thousands of *logical* shards mapped onto a much smaller number of *physical* Postgres servers. This decouples "how many logical partitions we have" (fixed, and large, from day one) from "how many machines we own" (grows over time) — so rebalancing means moving logical shards between physical machines, not re-computing a hash function across the whole dataset.

## Why interviewers bring this up

Sharding is the pattern that turns "our database can't handle this" into "which of these three shard-key trade-offs do we accept." Expect the follow-up: *"What happens when one shard becomes a celebrity user's shard and gets 100x the traffic of every other shard?"* — that's the hot-shard problem, and a good answer discusses either finer-grained logical shards, a dedicated hot-key cache in front of that shard, or splitting outlier keys onto their own shard.
	`
	},

	'Partitioning (System Design)': {
		definition:
			'The general strategy of splitting a large dataset into smaller, independent pieces to spread load and storage — sharding (splitting across separate machines) is one specific form of partitioning.',
		useCase:
			'A Kafka topic split into 12 partitions so 12 consumers can process messages in parallel, each owning a dedicated slice of the stream.',
		detailedMarkdown: `
# Partitioning (System Design Lens)

**Partitioning** is the umbrella term: take one large dataset or stream and cut it into smaller pieces (**partitions**) so that no single unit of work — one disk, one CPU, one process — has to handle all of it. **Sharding** is the specific case of partitioning where each piece lives on a *separate physical machine*. You can also partition *within* a single distributed system that already spans many machines, which is the case worth knowing cold for interviews: **Kafka partitions**.

## Partitioning in Kafka (the classic interview example)

A Kafka **topic** isn't one thing — it's split into some number of **partitions**, and each partition is an ordered, append-only log. This gives you two properties at once:

1. **Parallelism:** each partition can be read and written independently, and can live on a different broker. A topic with 12 partitions can be processed by up to 12 consumers in a consumer group simultaneously — each consumer owns a subset of partitions.
2. **Ordering, but only within a partition:** Kafka guarantees message order *within* a single partition, not across the whole topic. This is why the **partition key** matters enormously — if you need all events for a given \`order_id\` processed in order, you partition by \`order_id\` so every event for that order always lands on the same partition.

This is structurally identical to the shard-key problem: choose the partition key well (evenly distributed, natural affinity for related events) and you get parallelism without breaking ordering guarantees; choose it poorly and one partition becomes a bottleneck.

## Partitioning vs Sharding — the distinction interviewers probe

| | Partitioning (general) | Sharding (specific) |
|---|---|---|
| **Scope** | Can happen within a single node (e.g., partitioned tables in Postgres) or across nodes | Always across separate machines |
| **Goal** | Manageability, parallelism, sometimes just organizing data by range (e.g., partition a logs table by month) | Horizontal scale-out of storage and write throughput |
| **Example** | Kafka partitions, a Postgres table partitioned by date range | A \`users\` table split across 16 database servers |

In casual conversation, engineers often use "partitioning" and "sharding" interchangeably — that's fine in practice, but in an interview it's worth showing you know sharding is the cross-machine special case, because it signals you understand *why* it introduces distributed-systems problems (cross-shard joins, resharding, hot shards) that a same-machine partition doesn't have.

## Why interviewers bring this up

Whenever a design involves a queue, stream, or log (Kafka, Kinesis, SQS FIFO groups), the follow-up question is "how do you get parallelism without losing ordering where you need it?" The answer is always: choose a partition key that groups things that must stay ordered, and accept that unrelated things spread across different partitions have no ordering guarantee relative to each other. That's the whole game.
	`
	},

	'Read Replicas': {
		definition:
			'Read-only copies of a primary database, kept in sync via replication, that offload read traffic so the primary is free to focus on writes.',
		useCase:
			'An e-commerce site routing all product-catalog page views to 5 read replicas while every checkout write still goes to the single primary database.',
		detailedMarkdown: `
# Read Replicas

**Read replicas** are the most common first scaling move for a database-bound system, because in almost every real application, **reads vastly outnumber writes** (often 10:1 or more — think of how many times a product page is *viewed* versus *purchased*). A **read replica** is a full copy of the primary database that continuously receives updates via replication, and the application routes \`SELECT\` queries to it instead of hammering the primary.

## The Architecture

\`\`\`
        writes                    async replication
Client ────────► [ Primary DB ] ─────────────────────► [ Read Replica 1 ]
                                  ─────────────────────► [ Read Replica 2 ]
                                  ─────────────────────► [ Read Replica 3 ]
Client ◄──────────────────────────────────────── reads
\`\`\`

An application-level (or proxy-level, e.g. PgBouncer/ProxySQL) router sends all writes and any read that *must* be up-to-date to the primary, and sends everything else — the bulk of traffic — to whichever replica is least loaded.

## The Catch: Replication Lag

Because replicas are updated asynchronously, there's always a small delay — **replication lag** — between a write hitting the primary and that write becoming visible on a replica. This creates a very real bug pattern that interviewers love to probe:

> A user updates their profile picture, the write succeeds on the primary, the page redirects and re-fetches the profile — but that read gets routed to a replica that hasn't caught up yet, so the user sees their *old* picture for a second.

This is a **stale read**, and it's the direct cost of choosing read replicas for scale. Two common mitigations:
- **Read-your-writes consistency:** route a specific user's reads to the primary (or a replica you know has caught up) for a short window right after that same user writes.
- **Read from primary for anything write-adjacent:** e.g., after placing an order, read the order confirmation from the primary, not a replica.

## What Must Always Go to the Primary

Writes, full stop — replicas are read-only by definition. Also, any read where staleness is unacceptable (e.g., checking current inventory count right before finalizing a purchase) should either hit the primary or be re-verified there.

## Why interviewers bring this up

"How would you scale reads on this database?" is one of the most common HLD prompts, and read replicas are the textbook first answer — but a strong candidate immediately volunteers the trade-off ("this introduces replication lag, so we need to be careful about read-after-write scenarios") instead of waiting to be asked. That's the difference between reciting a term and actually understanding the system.
	`
	},

	'Leader-Follower': {
		definition:
			'A replication topology where exactly one node (the leader/primary) accepts writes, and one or more follower/replica nodes receive a copy of every write and serve reads.',
		useCase:
			"MySQL's classic primary-replica setup, where all application writes go to one primary and a pool of replicas serve read traffic and can be promoted if the primary fails.",
		detailedMarkdown: `
# Leader-Follower (Primary-Replica) Replication

**Leader-Follower** — also called **primary-replica**, **master-slave** (older terminology, less used now), or **single-leader replication** — is the most widely used replication topology. Exactly **one** node, the leader, accepts all writes. Every write is streamed to one or more **followers**, which apply it and can serve read traffic. This is the default mode for MySQL, PostgreSQL, MongoDB (via replica sets), and Redis.

## Why single-leader is the default choice

Having only one node accept writes eliminates an entire category of problem: **write conflicts**. Since there's only one place a write can happen, there's no ambiguity about which write "won" when two clients try to change the same row at nearly the same time — the leader just processes them in some order, and every follower eventually replays that same order. This is why leader-follower is far simpler to reason about than **Multi-Leader** replication.

## Failover: What Happens When the Leader Dies

This is the part of the topic interviewers actually dig into:

1. **Detect the failure** — usually via a heartbeat/health-check mechanism (a monitoring node or the followers themselves stop hearing from the leader).
2. **Elect a new leader** — pick the follower that is most caught-up (has replayed the most writes) and promote it. Systems like etcd/ZooKeeper or a Raft-based consensus mechanism are commonly used to run this election reliably.
3. **Reconfigure clients** — every client and every remaining follower needs to be told "the leader is now node B, not node A." This is often handled by a proxy layer or DNS-style redirection so the application doesn't need to know the topology directly.
4. **Rejoin the old leader carefully** — if the old leader comes back online, it must NOT think it's still the leader (it might have unreplicated writes that never made it to followers before it crashed). It has to recognize the new leader and either discard its own divergent writes or reconcile them.

## The Split-Brain Risk

If failover isn't coordinated correctly, you can end up with **split-brain**: the old leader thinks it's still in charge (network partition made it look "dead" to others, but it's actually alive and still accepting writes) *at the same time* a new leader has been elected and is also accepting writes. Now two nodes are diverging independently, and reconciling them afterward can mean silently losing data. This is precisely why leader election is normally delegated to a proven consensus protocol (Raft, Paxos) rather than a hand-rolled "ping and promote" script — getting failover correct under network partitions is genuinely hard.

## Why interviewers bring this up

"What happens if the primary database dies?" is a standard follow-up in almost any HLD interview. A strong answer walks through detection → election → client reconfiguration and explicitly calls out the split-brain risk — that last part is usually what separates a pass from a "they've heard the term but not thought it through."
	`
	},

	'Multi-Leader': {
		definition:
			'A replication topology where more than one node can accept writes independently, with changes propagated between leaders and conflicts resolved after the fact.',
		useCase:
			'A global collaborative document editor accepting writes in both a US datacenter and an EU datacenter simultaneously, so users on either continent get low write latency without crossing an ocean on every keystroke.',
		detailedMarkdown: `
# Multi-Leader Replication

In **Multi-Leader** (also called **master-master**) replication, more than one node can accept writes, and each leader propagates its writes to the other leaders. This solves a real problem that single-leader replication can't: if your leader is in Virginia and you have users in Singapore, every single write from a Singapore user has to cross an ocean-spanning network hop before it's acknowledged. With multi-leader, Singapore gets its own local leader.

## Why you'd accept the added complexity

The single reason to reach for multi-leader is **write availability and low write-latency across multiple locations**:
- **Multi-datacenter deployments:** each datacenter has its own leader; local writes are fast, and datacenters sync with each other in the background.
- **Offline-capable clients:** a mobile app or a local-first tool (think a calendar app or Figma-style collaborative editor) can accept writes while disconnected, then reconcile once it's back online — each disconnected client is effectively acting as its own temporary "leader."

## The Cost: Write Conflicts

The moment you have two nodes independently accepting writes, you've given up the guarantee that writes have one true order. If a user in the US datacenter and a user in the EU datacenter both update the *same* record before either leader hears about the other's change, you now have a genuine conflict that has to be resolved somehow. Common strategies:

- **Last-Write-Wins (LWW):** attach a timestamp to every write, and when a conflict is detected, keep whichever write has the later timestamp. Simple to implement, but it silently discards data — the "loser" write just vanishes, which is unacceptable for some use cases (e.g., silently dropping one of two concurrent inventory decrements).
- **Vector clocks / version vectors:** rather than a single timestamp, each write is tagged with a vector recording "what version of the data did each node see when this write happened." This lets the system detect *genuine* concurrent conflicts (as opposed to one write simply happening-after another) and either merge them automatically or flag them for the application/user to resolve. Amazon's Dynamo (and DynamoDB's ancestor system, described in the original Dynamo paper) popularized this approach.
- **Application-level merge (CRDTs):** for specific data types (counters, sets, collaboratively-edited text), you can design the data structure itself so concurrent updates always merge deterministically without losing information — this is the idea behind **Conflict-Free Replicated Data Types**, used by things like Google Docs-style collaborative editors and Redis's CRDT-based modules.

## Multi-Leader vs Leader-Follower

| | Leader-Follower | Multi-Leader |
|---|---|---|
| **Writes accepted at** | One node only | Multiple nodes |
| **Write conflicts** | Impossible by construction | Must be detected and resolved |
| **Write latency for distant clients** | High (must reach the single leader) | Low (write to the nearest leader) |
| **Complexity** | Lower | Significantly higher |

## Why interviewers bring this up

Multi-leader comes up whenever a design needs to serve users across multiple regions with low write latency (not just low *read* latency, which read replicas already solve). The moment you propose "let's have a leader in each region," the interviewer's very next question will be "what happens when two regions get conflicting writes for the same record?" — and that's your cue to talk about LWW vs vector clocks vs just avoiding the conflict entirely by partitioning which records "belong" to which region.
	`
	},

	'Eventual Consistency': {
		definition:
			'A consistency model where, after a write, all replicas are not guaranteed to reflect it immediately, but will converge to the same value if no new writes occur.',
		useCase:
			"Amazon S3's object store historically returning a stale version of an object for a brief window right after an overwrite, before all regions/replicas caught up.",
		detailedMarkdown: `
# Eventual Consistency

**Eventual consistency** is a guarantee that sounds weaker than it is: *"if you stop writing to a piece of data, every replica will eventually converge to the same value."* It says nothing about *when* that happens — could be milliseconds, could be seconds — only that it will happen, given enough time and no further writes.

This is the consistency model you get "for free" whenever you use **asynchronous replication** (see **Replication**), because there's always a window where some replicas have seen a write and others haven't yet.

## Eventual Consistency vs Strong Consistency

| | Strong Consistency | Eventual Consistency |
|---|---|---|
| **Guarantee** | Every read after a write sees that write, everywhere, immediately | Reads may return stale data for a while, but will converge |
| **Latency cost** | Higher — often requires waiting on quorum/consensus across nodes | Lower — a node can answer immediately from its local copy |
| **Availability under partition** | Lower — per the CAP theorem, you may have to refuse reads/writes to stay consistent | Higher — nodes keep serving even if isolated from each other |
| **Typical use case** | Bank balances, inventory counts before checkout | Social media like-counts, DNS records, most caches, product view counts |

## A Real, Concrete Example

**DNS propagation** is the eventual-consistency example everyone already has intuition for: when you update a DNS record, it doesn't take effect everywhere instantly. Different resolvers around the world have cached the old value with different TTLs, so for anywhere from minutes to 48 hours, some users see the old IP and some see the new one. Eventually — once every cache's TTL expires — everyone converges on the new value. Nobody is surprised by this; it's an accepted, well-understood trade-off for how DNS scales globally.

**Amazon S3** is a more instructive example precisely because it *changed*: for its first ~14 years, S3 only offered eventual consistency for overwrite-PUTs and deletes — you could write a new version of an object and, for a brief window, still read back the old version from a different replica/region. In December 2020, AWS re-engineered S3 to provide **strong read-after-write consistency** for all operations, at no extra cost and no performance penalty — a widely-cited example of a system successfully moving from eventual to strong consistency as engineering matured, without asking customers to change how they use it.

## Why interviewers bring this up

Eventual consistency is what you're implicitly choosing whenever you say "let's use a read replica" or "let's cache this" or "let's replicate across regions asynchronously" — and a good candidate says so explicitly rather than glossing over it. The strongest answers name *which* parts of the system can tolerate eventual consistency (view counts, recommendation feeds, "likes") and which cannot (payment status, inventory available at checkout, a bank balance) — that's the real skill being tested, not reciting the definition.
	`
	},

	Monolith: {
		definition:
			'An architecture style where the entire application — UI, business logic, and data access — is built and deployed as a single, unified codebase and unit.',
		useCase:
			'A small startup building its entire product as one Rails or Django application so the whole team can move fast without coordinating deployments across services.',
		detailedMarkdown: `
# Monolithic Architecture

A **monolith** is a single deployable application that contains all the functionality of a system: the API, the business logic, and often the data access layer, all compiled/packaged and deployed together as one unit. This isn't a legacy anti-pattern — it's a perfectly valid, often *correct*, architectural choice, and interviewers explicitly want to hear you weigh it fairly rather than dismiss it.

## Why Monoliths Are Often the Right Call

1. **Simplicity:** one codebase, one build pipeline, one deployment. No network calls between your own components — a function call instead of an HTTP request.
2. **Easier transactions:** if "place an order" needs to update the orders table, decrement inventory, and charge a payment record, a monolith can wrap all three in a single ACID database transaction. In a distributed system, the equivalent requires patterns like the **Saga Pattern** specifically *because* you no longer get that for free.
3. **Simpler debugging and local development:** a single stack trace crosses your whole request; you don't need to stitch together distributed traces across five services to find a bug.
4. **Faster to build initially:** no time spent on service boundaries, service discovery, or inter-service contracts before you even know if the product will succeed.

Shopify, GitHub, and Basecamp are well-known examples of large, successful companies that ran (and in large part still run) substantial parts of their business on monolithic Rails applications for years, precisely because the simplicity kept engineering velocity high while the team was still small relative to the codebase's importance.

## Where Monoliths Start to Hurt

1. **Deployment coupling:** a one-line change to the "notifications" feature requires redeploying and re-testing the *entire* application, including totally unrelated code paths.
2. **Scaling coupling:** if the "image processing" part of your app is CPU-heavy and the "user profile" part is not, you can't scale them independently — you scale the whole monolith, wasting resources.
3. **Team coordination overhead:** as headcount grows, more engineers committing to the same codebase means more merge conflicts, more risk that one team's bug takes down an unrelated feature, and slower CI as the test suite grows.
4. **Technology lock-in:** the entire application is stuck on one language/runtime version.

## Why interviewers bring this up

"Would you start this system as a monolith or microservices?" is a values question as much as a technical one. The strong answer is almost always: **start as a monolith** unless you already know (from real, current scale requirements) that you need independent scaling or deployment — because the cost of *prematurely* going distributed (network calls, eventual consistency, operational overhead) is usually far higher than the cost of splitting a well-organized monolith later, once you actually know where the real boundaries are.
	`
	},

	Microservices: {
		definition:
			'An architecture style where an application is built as a collection of small, independently deployable services, each owning its own data and communicating over the network.',
		useCase:
			'Netflix decomposing its monolithic DVD-era application into hundreds of independently deployable microservices so different teams could ship and scale the streaming, recommendations, and billing systems on their own schedules.',
		detailedMarkdown: `
# Microservices Architecture

**Microservices** split an application into a set of small, independently deployable services, each responsible for one business capability (e.g., "payments," "inventory," "notifications") and each usually owning its own database. Services talk to each other over the network — typically REST/gRPC for synchronous calls, or message queues/event streams for asynchronous communication.

**Netflix** is the textbook real-world case study here: after outages caused by their monolithic architecture in the mid-2000s, they spent years decomposing into hundreds of microservices, each independently deployable and independently scalable, which let separate teams ship at their own pace and scale hot paths (like the streaming API) independently from cold ones (like account settings).

## The Real Benefits

1. **Independent deployment:** the payments team ships a fix without waiting for, or risking, the notifications team's release.
2. **Independent scaling:** if "search" gets 100x the traffic of "user settings," you scale only the search service, on hardware suited to its workload.
3. **Technology diversity:** the recommendation team can use Python/PyTorch, the checkout team can use Java, and the real-time chat team can use Go — each picks the best tool for their specific problem.
4. **Fault isolation (when done well):** a bug that crashes the "recommendations" service shouldn't take down checkout — if it's properly decoupled.

## The Real Costs

1. **Network complexity:** every internal function call becomes a network call, which can fail, time out, or arrive out of order. You need retries, circuit breakers, timeouts — all the resilience patterns that simply don't exist inside a monolith.
2. **Distributed transactions:** "place an order" now touches three separate databases owned by three separate services. There is no cross-service ACID transaction — you need patterns like the **Saga Pattern** to keep data consistent, and that consistency is now *eventual*, not immediate.
3. **Operational overhead:** you now need service discovery, distributed tracing, centralized logging, per-service monitoring, and a deployment pipeline for dozens (or hundreds) of services instead of one.
4. **Harder local development and debugging:** reproducing a bug locally might require spinning up 10 dependent services; a single user-facing error might require correlating logs across 6 of them.

## When NOT to Use Microservices

This is the part candidates most often skip, and it's exactly what separates a senior answer from a junior one: **microservices are usually the wrong choice for an early-stage startup or a small team.** You pay all the network/operational complexity cost immediately, while the benefit (independent scaling for teams and traffic patterns you don't have yet) doesn't materialize until you're actually at scale with multiple teams. Splitting into services along the *wrong* boundaries before you understand your domain is expensive to undo — you're now doing a distributed refactor instead of an in-process one.

## Why interviewers bring this up

Almost every HLD interview eventually asks "monolith or microservices, and why?" There's no universally correct answer — the signal is whether you can articulate the actual trade-off (deployment/scaling independence vs network and consistency complexity) and connect it to the *specific* constraints of the system being designed (team size, traffic patterns, consistency requirements) instead of reflexively picking microservices because it sounds more sophisticated.
	`
	},

	Serverless: {
		definition:
			'A cloud execution model (commonly Function-as-a-Service) where you deploy individual functions and the provider automatically handles provisioning, scaling, and server management — you pay only for actual execution time.',
		useCase:
			'A photo-sharing app using an AWS Lambda function triggered on every S3 upload to automatically generate a thumbnail, without running a single always-on server.',
		detailedMarkdown: `
# Serverless (Function-as-a-Service)

**Serverless** doesn't mean there are no servers — it means *you* never provision, patch, or scale them. You write a function (e.g., an AWS Lambda, Google Cloud Function, or Azure Function), define what triggers it (an HTTP request, a file upload, a queue message, a scheduled cron), and the cloud provider handles everything about running it: spinning up capacity on demand, scaling to zero when there's no traffic, and scaling out automatically under load.

## The Pros

1. **No server management:** no OS patching, no capacity planning, no load balancer configuration for that piece of compute.
2. **True pay-per-use billing:** you're billed in sub-second increments for actual execution time. A function that runs for 200ms, 10 times a day, costs almost nothing — compare that to an always-on EC2 instance idling 99% of the time.
3. **Automatic, near-instant scaling:** a sudden 100x traffic spike (a viral post, a flash sale) is handled by the platform spinning up more concurrent function instances — you don't pre-provision for a spike you can't predict.
4. **Fast to glue systems together:** serverless functions are excellent as the "connective tissue" in **event-driven** systems — e.g., "when a file lands in this S3 bucket, resize it," or "when this SQS message arrives, write a row to DynamoDB."

## The Cons

1. **Cold starts:** if a function hasn't run recently, the platform needs to provision a fresh execution environment before your code even starts running — this can add anywhere from tens of milliseconds to a few seconds of latency, which is a real problem for latency-sensitive, user-facing request paths.
2. **Vendor lock-in:** your function's triggers, permissions model, and runtime constraints are deeply tied to one provider's ecosystem (AWS Lambda's event format is not the same as Google Cloud Functions'), making a later migration nontrivial.
3. **Harder local debugging and testing:** simulating the exact production trigger environment (IAM permissions, event payload shapes, concurrency behavior) locally is harder than just running a server on your laptop.
4. **Execution limits:** most FaaS platforms cap execution time (historically 15 minutes on Lambda) and resource limits per invocation, so serverless is a poor fit for long-running batch jobs or workloads needing sustained high CPU.
5. **Cost at sustained high volume:** per-invocation pricing that's cheap at low/spiky volume can become *more* expensive than a fixed set of always-on servers once you're handling constant, heavy, predictable traffic.

## When It Shines

Serverless is at its best for **event-driven glue code** and **spiky, unpredictable workloads**: image/video processing triggered by uploads, webhook handlers, scheduled cleanup jobs, and lightweight API endpoints that see bursty traffic. It's a poor fit for latency-critical hot paths (cold starts) or steady, high-volume, predictable workloads (a fixed server fleet is simply cheaper at that point).

## Why interviewers bring this up

Serverless comes up when a design has a workload that's either bursty/unpredictable or genuinely infrequent — "generate a thumbnail after upload," "process a nightly batch export." A strong answer proposes it specifically for that piece of the system (not the whole architecture) and flags the cold-start risk immediately if that piece happens to sit on a latency-sensitive user path.
	`
	},

	'Event Driven': {
		definition:
			'An architecture style where services communicate by producing and consuming events through a broker, rather than calling each other directly, decoupling producers from consumers in both time and knowledge of each other.',
		useCase:
			"A ride-sharing app publishing a 'RideCompleted' event that is independently consumed by billing, driver-rating, and analytics services, without the ride service knowing any of them exist.",
		detailedMarkdown: `
# Event-Driven Architecture (System-Level)

In an **event-driven architecture**, services don't call each other directly to say "do this now." Instead, a service **publishes an event** — a fact that something happened, like \`OrderPlaced\` or \`PaymentFailed\` — to a broker (Kafka, SQS/SNS, RabbitMQ), and any number of other services **subscribe** to that event and react independently, whenever they're ready.

This is a system-*design* choice about how services relate to each other, distinct from any single component (a message queue or pub/sub system is the mechanism; event-driven is the architectural philosophy of building the whole system around that mechanism).

## Request-Response vs Event-Driven

| | Request-Response (synchronous) | Event-Driven (asynchronous) |
|---|---|---|
| **Coupling** | Caller must know the callee's address and API, and both must be up at the same time | Producer knows nothing about consumers; they don't even need to exist yet |
| **Failure mode** | If the callee is down, the call fails immediately | The event sits in the broker until a consumer is available; no immediate failure |
| **Adding a new consumer** | Requires changing the caller to add a new call | Zero changes to the producer — just subscribe a new consumer to the existing event |
| **Consistency model** | Can be immediately consistent (if the callee updates synchronously) | Inherently **eventually consistent** — consumers process the event at their own pace |
| **Example** | A checkout service calling a payment service's API directly and waiting for a response | A checkout service emitting \`OrderPlaced\`, consumed independently by billing, inventory, and email services |

## Why This Matters at Scale

The core win is **decoupling**: the ride-sharing example above (\`RideCompleted\` consumed by billing, driver-rating, and analytics) means you can add a brand-new consumer — say, a fraud-detection service — *without touching the ride service at all*. In a request-response world, the ride service would need a new outgoing call added to its code for every new downstream consumer, coupling it to every consumer's uptime and latency.

The cost is that the system's state is now **eventually consistent** across services almost by definition — the billing service might process an order 200ms (or 2 minutes, under load) after it was placed. Designs that need strict ordering or immediate cross-service consistency have to work around this explicitly.

## Patterns That Usually Travel Together With Event-Driven Design

- **CQRS** often sits on top of an event-driven backbone: write-side commands produce events, and a separate read model is built by consuming those events.
- **Saga Pattern** is how you get multi-step business transactions (like "place an order") to complete correctly across several event-driven services, using compensating events/actions instead of a database transaction.

## Why interviewers bring this up

Whenever a design has multiple downstream systems that all care about "something happened" (a new user signed up, an order shipped, a payment failed), event-driven architecture is the answer that scales cleanly as you add more downstream consumers over time. The interviewer's follow-up is almost always about consistency: "what if the email gets sent before the payment actually clears?" — and that's your cue to talk about ordering guarantees, idempotent consumers, and eventual consistency trade-offs.
	`
	},

	CQRS: {
		definition:
			'Command Query Responsibility Segregation — an architectural pattern that separates the model used to write data (commands) from the model used to read data (queries), letting each be optimized and scaled independently.',
		useCase:
			'A social media feed where posting a photo writes to a normalized relational store, while a separate, heavily denormalized read model (built for fast feed rendering) is updated asynchronously and served to viewers.',
		detailedMarkdown: `
# CQRS (Command Query Responsibility Segregation)

**CQRS** splits the traditional single data model into two: a **command model** that handles writes (create/update/delete — anything that changes state) and a **query model** that handles reads. In a traditional CRUD app, one schema serves both jobs. CQRS says: reads and writes have fundamentally different needs, so stop forcing one model to serve both.

## Why Separate Them?

Reads and writes are pulled in opposite directions by design:

- **Writes** want a model that enforces business rules and invariants cleanly — usually **normalized**, so there's one source of truth and no risk of inconsistent duplicated data.
- **Reads** want a model that's fast to query, often meaning **denormalized** — pre-joined, pre-aggregated, shaped exactly like the UI that will render it, so a read is a single cheap lookup instead of a five-table join.

Trying to serve both from one schema means every read pays the cost of the write model's normalization (extra joins), and every write risks the fragility of a schema shaped around read convenience.

## A Concrete Example

Take a social feed:

1. A user posts a photo. The **command** side writes this to a normalized store: a \`posts\` table, a separate \`likes\` table, a separate \`comments\` table.
2. That write emits an event (\`PostCreated\`) — CQRS is very commonly paired with **event-driven architecture** for exactly this propagation step.
3. A separate consumer listens for that event and updates the **query** side: a denormalized \`feed_view\` document per user, already containing the post content, the author's display name, and a like count — everything the feed UI needs in one read, with zero joins.
4. When a user opens the app, the read simply pulls their pre-built \`feed_view\` — fast, regardless of how normalized or complex the underlying write-side schema is.

The read and write models can even live in **different types of databases** — write to Postgres for strong transactional guarantees, read from Redis or Elasticsearch for speed — which is impossible if you insist on one shared schema.

## The Real Cost

CQRS is not free, and interviewers want to hear you acknowledge this rather than presenting it as a strictly-better upgrade:

1. **Eventual consistency between the two models:** the read model is updated *after* the write, via an event or a background sync job. There's a window — often milliseconds, but nonzero — where a user might not immediately see their own new post in the feed. Designs often add read-your-own-writes tricks (e.g., optimistically render the new post client-side) to paper over this.
2. **More moving parts:** you now maintain two schemas, a propagation mechanism between them (events, CDC, batch jobs), and monitoring for whether the read model has fallen behind.
3. **Overkill for simple CRUD:** if a resource's read and write patterns are basically the same shape, splitting them adds complexity with no real payoff. CQRS earns its keep specifically when read and write *loads* or *shapes* diverge significantly.

## Why interviewers bring this up

CQRS is the right answer whenever a system has read traffic that vastly outnumbers writes and needs a read shape very different from the natural write shape — social feeds, dashboards, search results, order history pages. Naming CQRS and immediately following with "the read model will lag slightly behind the write model, and here's how I'd bound that lag" shows you understand it's a consistency trade-off, not a free performance upgrade.
	`
	},

	'Saga Pattern': {
		definition:
			'A pattern for managing a business transaction that spans multiple microservices by breaking it into a sequence of local transactions, each with a compensating action that undoes it if a later step fails.',
		useCase:
			'An e-commerce checkout where the order, payment, and inventory services each live in their own database, and a failed payment triggers a compensating step that releases the inventory that was tentatively reserved.',
		detailedMarkdown: `
# Saga Pattern

In a monolith, "place an order" can be one ACID database transaction: reserve inventory, charge the card, create the order row — all or nothing, enforced by the database. Split those three steps across three microservices, each with its **own** database, and that guarantee disappears. There is no cross-service, cross-database "commit" in the microservices world (two-phase commit exists in theory, but it requires all participating services to be online and holding locks simultaneously, which kills availability and doesn't work well with the kind of loosely-coupled, independently-deployed services microservices are meant to be).

The **Saga Pattern** is the practical answer: break the business transaction into a sequence of **local transactions**, each of which is a normal, single-database ACID transaction inside one service. If a later step fails, you don't roll back — you run **compensating transactions** that semantically undo the earlier steps.

## Worked Example: Order → Payment → Inventory

1. **Order Service:** creates an order in "PENDING" state. *(local transaction, commits immediately)*
2. **Inventory Service:** reserves the stock for that order. *(local transaction, commits immediately)*
3. **Payment Service:** attempts to charge the customer's card — **and it fails** (card declined).
4. Because step 3 failed, the saga now runs **compensating transactions** in reverse:
   - **Inventory Service:** releases the reserved stock back into available inventory.
   - **Order Service:** marks the order as "CANCELLED" (not deleted — the failed attempt is still a real, auditable fact).

Notice there's no global rollback — each compensating step is its own local transaction, explicitly written by the developer, that reverses the *effect* of the corresponding forward step. This is why sagas require more upfront design than a database transaction: **every step that can be reversed needs its compensating step written by hand.**

## Orchestration vs Choreography

There are two ways to coordinate the steps of a saga:

### Orchestration
A central **orchestrator** service explicitly tells each participant what to do next and listens for success/failure, deciding when to trigger compensations.

\`\`\`
Orchestrator ──► Order Service:      create order
Orchestrator ──► Inventory Service:  reserve stock
Orchestrator ──► Payment Service:    charge card    ✗ fails
Orchestrator ──► Inventory Service:  release stock  (compensating action)
Orchestrator ──► Order Service:      cancel order   (compensating action)
\`\`\`

- **Pros:** the entire workflow's logic lives in one place — easy to understand, test, and monitor as a single state machine.
- **Cons:** the orchestrator becomes a central point of coupling (every participant needs to know how to talk to it) and, if not designed carefully, a single point of failure for the whole workflow.

### Choreography
There's no central coordinator. Each service reacts to events from the others and decides on its own what to do next.

\`\`\`
Order Service    ──publishes──► OrderCreated
Inventory Service (listens for OrderCreated) ──reserves stock──publishes──► StockReserved
Payment Service  (listens for StockReserved) ──charges card, fails──publishes──► PaymentFailed
Inventory Service (listens for PaymentFailed) ──releases stock (compensating action)
Order Service    (listens for PaymentFailed) ──cancels order (compensating action)
\`\`\`

- **Pros:** fully decoupled — no service needs to know about any other service, only about events. Fits naturally into an already **event-driven** system.
- **Cons:** the overall business logic is now smeared across every participating service's event handlers — much harder to look at the system and answer "what's the current state of this order, and what happens next?" Debugging a stuck saga means tracing events across every service's logs.

## Why interviewers bring this up

Any HLD prompt involving a multi-step business transaction across services — checkout, booking a flight + hotel, a multi-party payment — is testing whether you know that **you can't just use a database transaction anymore**, and that the fix requires explicitly designing compensating steps rather than assuming automatic rollback. Naming orchestration vs choreography, and picking one with a reason ("orchestration, because I want one place to see the whole checkout flow's state for debugging") is exactly the signal that separates "has heard of sagas" from "has actually thought about building one."
	`
	}
};
