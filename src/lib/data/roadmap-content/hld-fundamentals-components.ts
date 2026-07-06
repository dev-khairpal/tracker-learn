import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Scalability
  // - Availability
  // - Reliability
  // - Fault Tolerance
  // - Latency
  // - Throughput
  // - Consistency
  // - PACELC
  // - API Gateway
  // - Cache
  // - Message Queue
  // - Pub/Sub
  // - Event Driven Architecture
  // - Object Storage
  // - Search Engine
  // - Service Discovery
  // - Circuit Breaker
  // - Retry
  // - Rate Limiter
 */
export const HldFundamentalsComponentsContent: RoadmapDetailMap = {
	Scalability: {
		definition:
			'The ability of a system to handle increasing load — more users, more data, more requests — by adding resources, without a redesign.',
		useCase:
			'A photo-sharing app that works fine for 1,000 users needs a scaling strategy before it can survive a viral spike to 10 million.',
		detailedMarkdown: `
# Scalability

**Scalability** is a system's ability to absorb growth — in traffic, data volume, or both — by adding resources rather than by rewriting the architecture every time load doubles. It is arguably the single most common thread running through every system design interview: almost every question ("design Twitter," "design a URL shortener," "design a rate limiter") is secretly asking "how does this hold up at 100x the load?"

There are exactly two levers you can pull to scale a system.

## Vertical Scaling ("Scale Up")
Add more power to an existing machine — more CPU, more RAM, faster disks. It's the "buy a bigger server" strategy.

## Horizontal Scaling ("Scale Out")
Add more machines and spread the load across them (typically behind a **Load Balancer**). It's the "buy more servers" strategy.

| | Vertical Scaling | Horizontal Scaling |
|---|---|---|
| How | Bigger machine | More machines |
| Ceiling | Hard physical limit (max CPU/RAM a single box supports) | Practically unlimited — keep adding nodes |
| Downtime | Usually requires a reboot/resize | Can add nodes with zero downtime |
| Single point of failure | Yes — one box, one failure domain | No — if a node dies, others keep serving |
| Complexity | Low — no code changes needed | Higher — needs load balancing, statelessness, data partitioning |
| Cost curve | Gets disproportionately expensive near the top end | Scales roughly linearly with commodity hardware |
| Data consistency | Trivial (one machine, one copy of data) | Harder — data is now spread across nodes |

## Why the Industry Leans Horizontal
Every large-scale system you interview about — Google, Netflix, Amazon — scales horizontally, for a few concrete reasons:
- **There's a ceiling on vertical scaling.** No matter how much money you spend, a single machine tops out at some maximum number of cores and RAM slots. Horizontal scaling has no such hard ceiling.
- **Horizontal scaling gives you fault tolerance for free.** If one of 50 nodes crashes, the other 49 keep serving traffic. A single powerful vertically-scaled box has no fallback if it goes down.
- **Commodity hardware is cheaper per unit of throughput** than exotic high-end hardware once you're past a certain scale.

The cost is added complexity: your application needs to be **stateless** (so any request can be served by any node — session data belongs in a shared store like Redis, not in-process memory), and your data layer needs a partitioning story (sharding, replication) since a single database server eventually becomes the bottleneck even if your app tier is perfectly horizontal.

## Where This Shows Up in an Interview
When an interviewer says "assume 100 million daily active users," they are explicitly asking you to reason about scale. The expected move is:
1. Estimate load (requests/sec, storage/day) with back-of-envelope math.
2. Identify the bottleneck tier (app servers? database? cache?).
3. Propose horizontal scaling for stateless tiers (app servers, API gateways) behind a load balancer.
4. Propose a data-layer scaling strategy (read replicas, sharding, caching) for the stateful tier, since that's almost always where horizontal scaling gets hard.

## Practical Takeaway
Default to horizontal scaling for anything expected to grow past a single machine's ceiling, and reserve vertical scaling for the early, simple stage of a system (or for genuinely single-threaded bottlenecks, like a legacy database that can't be easily sharded). The strongest interview answers don't just say "scale horizontally" — they explain *what* has to become stateless or partitioned to make that possible.
	`
	},

	Availability: {
		definition:
			'The percentage of time a system is operational and able to respond to requests, usually expressed as a number of "nines."',
		useCase:
			'An e-commerce checkout service advertising "99.99% availability" is promising it will be reachable all but about 52 minutes of the entire year.',
		detailedMarkdown: `
# Availability

**Availability** measures uptime: the fraction of time a system is capable of servicing requests, over some period. It says nothing about whether the *answers* it gives are correct — that's the job of **Reliability** — only whether the system is *there* and responding at all.

## The "Nines"
Availability is almost always talked about in terms of nines, because the difference between 99% and 99.99% sounds small on paper but is enormous in practice:

| Availability | Nines | Downtime / year | Downtime / month | Downtime / day |
|---|---|---|---|---|
| 90% | 1 nine | ~36.5 days | ~73 hours | ~2.4 hours |
| 99% | 2 nines | ~3.65 days | ~7.3 hours | ~14.4 min |
| 99.9% | 3 nines | ~8.76 hours | ~43.8 min | ~1.44 min |
| 99.95% | 3.5 nines | ~4.38 hours | ~21.9 min | ~43 sec |
| 99.99% | 4 nines | ~52.6 min | ~4.4 min | ~8.6 sec |
| 99.999% | 5 nines | ~5.26 min | ~26 sec | ~0.86 sec |

Notice how each additional nine buys you roughly a **10x** reduction in allowed downtime — and correspondingly costs roughly 10x more engineering effort to achieve, because you have to eliminate an entire order of magnitude of failure modes you were previously willing to tolerate.

## How You Actually Get More Nines
Availability is fundamentally a math problem about **redundancy**. If a single component has 99% availability (1% chance of being down at any moment), and you run **two independent replicas** behind a load balancer, the probability that *both* are down simultaneously is roughly 1% × 1% = 0.01% — i.e. ~99.99% availability, for the pair.

This is the core idea behind almost every high-availability pattern:
- **Multiple server instances** behind a Load Balancer — if one dies, traffic routes to the others.
- **Multi-AZ / multi-region deployments** — an entire data center going offline doesn't take the whole system down.
- **Database replication** with automatic failover — a replica gets promoted if the primary dies.
- **Health checks** that actively detect and remove unhealthy nodes from rotation before they cause errors.

The math also reveals a trap: **availability multiplies across a request's dependency chain.** If a request has to pass through 5 services, each individually at 99.9% availability, the *combined* availability of that request path is roughly 0.999^5 ≈ 99.5% — worse than any single service. This is exactly why highly available systems minimize hard dependencies and build in fallbacks (serve cached/stale data rather than fail outright) rather than just chaining "five 99.9% services" together and hoping for the best.

## SLA, SLO, SLI — the Vocabulary Interviewers Expect
- **SLI (Service Level Indicator):** the actual measured metric, e.g. "% of requests that succeeded in the last 30 days."
- **SLO (Service Level Objective):** the internal target for that metric, e.g. "99.95% success rate."
- **SLA (Service Level Agreement):** the external, often contractual, promise to customers — usually a looser number than the internal SLO, so there's margin for error before you're in breach.

## Practical Takeaway
When an interviewer says "this needs to be highly available," translate that immediately into: **no single point of failure**. Every component — app servers, load balancer, database, cache — needs at least one redundant standby, and you should be able to articulate what happens, step by step, when each one fails. Naming a specific nines target (and its downtime budget) also signals you understand this isn't just a buzzword.
	`
	},

	Reliability: {
		definition:
			'The probability that a system performs its intended function correctly, without failure, over a given period of time.',
		useCase:
			'A payment system that is always reachable but occasionally double-charges a customer is highly available but not reliable.',
		detailedMarkdown: `
# Reliability

**Reliability** is about *correctness over time* — did the system do the right thing, consistently, for as long as it was expected to? This is a subtly different question from **Availability**, which only asks "was the system reachable?" A system can score perfectly on availability while being deeply unreliable, and that distinction is exactly what interviewers probe for when they ask you to explain the difference.

## Available but Not Reliable — A Concrete Example
Imagine an API that always returns an HTTP 200 within 50ms — 100% available by any uptime metric. Now imagine that, due to a bug, it silently returns **stale or wrong data** 1% of the time (say, a cached response served past its expiry, or a race condition that double-processes a payment). The service never goes down, never times out, never returns an error — it is *available* the entire time. But it is not *reliable*, because it isn't consistently doing its job correctly.

The reverse is also possible: a system that is down for scheduled maintenance every night at 2am (hurting its availability number) but which, whenever it *is* up, always produces correct results — that system is reliable but not continuously available.

| | Availability | Reliability |
|---|---|---|
| Question it answers | Is the system up and responding? | Is the system doing the right thing? |
| Failure mode it catches | Downtime, timeouts, unreachable service | Wrong results, data corruption, silent bugs |
| Measured by | Uptime %, nines | Error rate, MTBF, correctness under test |
| Example failure | Server crashed, DNS misconfigured | Race condition causes duplicate charges |

## MTBF and MTTR
Two metrics quantify reliability and recovery in hardware/ops contexts:
- **MTBF (Mean Time Between Failures):** the average time a system runs correctly before it fails. Higher is more reliable.
- **MTTR (Mean Time To Repair/Recovery):** the average time it takes to detect and fix a failure once it happens. Lower is better.

These two numbers together roughly determine availability: a system with a long MTBF but a very long MTTR can still end up with poor overall uptime, because when it *does* fail, it stays down a long time. This is why teams invest as much in **fast detection and recovery** (monitoring, alerting, automated rollback, runbooks) as they do in *preventing* failures outright — you can't drive failure probability to zero, but you can make failures short and cheap.

## How Systems Are Made More Reliable
- **Idempotent operations** — retrying a request (see "Retry") doesn't cause duplicate side effects, like a double charge.
- **Data validation and checksums** — catching corruption before it propagates.
- **Comprehensive testing** — unit, integration, and chaos testing (deliberately injecting failures to see how the system behaves) surface correctness bugs before production does.
- **Idempotency keys and exactly-once-ish delivery semantics** in message processing, so a redelivered message doesn't get double-processed.
- **Monitoring correctness, not just uptime** — alerting on error rates, data anomalies, and business-metric drops, not only on "is the server responding."

## Practical Takeaway
When asked to design a "reliable" system, resist the instinct to just say "add more servers" (that's an availability answer). A reliability answer talks about *correctness guarantees*: idempotency, data validation, retries that can't cause duplicate side effects, and monitoring that would actually catch silent wrong-answer bugs — not just outages. The strongest interview signal is explicitly naming that a system can be available and unreliable at the same time, and giving a concrete example of how.
	`
	},

	'Fault Tolerance': {
		definition:
			'The ability of a system to keep operating correctly even when one or more of its components fail.',
		useCase:
			"A ride-sharing backend where one database node crashing mid-request doesn't drop a single active trip, because a replica silently takes over.",
		detailedMarkdown: `
# Fault Tolerance

**Fault tolerance** is the design property that lets a system keep functioning — possibly at reduced capacity, but *correctly* — when a component fails, instead of the whole system going down with it. It's the mechanism; **Availability** is the outcome you get when fault tolerance is done well.

## Fault Tolerance vs High Availability
These two terms get used almost interchangeably in casual conversation, but they answer slightly different questions, and interviewers sometimes probe the distinction:
- **High Availability (HA)** is about *minimizing downtime* — the system should almost always be reachable, often via fast failover (a brief blip while a standby takes over).
- **Fault Tolerance** is about the system continuing to operate **through** a failure, often with **zero interruption** — the failure is masked entirely from the end user, typically because redundant components were already actively sharing the load, not just standing by.

In practice, fault tolerance is the stronger, more expensive guarantee: think of a spacecraft's triple-redundant flight computers voting on every decision (fault tolerant — a single computer failing changes nothing observable) versus a web server pool where a crashed node causes a few dropped requests before the load balancer notices and reroutes (highly available, but not perfectly fault tolerant at the instant of failure).

## The Core Techniques
- **Redundancy:** run multiple copies of every critical component (servers, database replicas, even entire data centers) so no single failure removes the only copy of something.
- **Replication:** keep multiple up-to-date copies of data (see Replication/Leader-Follower in the Data Architecture topics) so a node failing doesn't mean data loss.
- **Failover:** automatically detect a failed component (via health checks / heartbeats) and redirect traffic or promote a standby, ideally within seconds.
- **Graceful degradation:** when a non-critical dependency fails, the system keeps serving its *core* function with reduced features rather than failing entirely — e.g. an e-commerce site that can't load "recommended products" (a non-critical service is down) still lets you check out.
- **Isolation / bulkheading:** partition the system (by service, by shard, by thread pool) so a failure in one partition can't cascade and take down unrelated partitions — see **Circuit Breaker** for the pattern that actively enforces this at the network-call level.
- **No single point of failure (SPOF):** every component in the critical path — including "boring" pieces like DNS, the load balancer itself, and configuration stores — needs its own redundancy plan, since a fault-tolerant database behind a non-redundant load balancer is still one incident away from a full outage.

## A Worked Example
Say you're asked to design a fault-tolerant URL shortener's storage layer:
1. Data is replicated across 3 database nodes (1 leader, 2 followers).
2. If the leader crashes, a follower is automatically promoted (failover) within seconds via a consensus mechanism (e.g. Raft) or an orchestrator watching heartbeats.
3. Reads can continue from the surviving followers throughout, so read traffic barely notices.
4. Writes pause briefly during leader election, then resume against the new leader — a small availability blip, but zero data loss, because followers were already caught up.

## Practical Takeaway
Fault tolerance is what you're describing whenever you draw a second box next to every box in your architecture diagram and explain what happens when the first one dies. The interview-winning move is to be specific about the *mechanism*: not just "we add redundancy," but "a health check detects the failure within N seconds, and here specifically is what takes over, and here's what a client experiences during that window (nothing / a brief retry / a short delay)."
	`
	},

	Latency: {
		definition:
			'The time it takes for a single request to travel from sender to receiver and back — the delay experienced by one operation.',
		useCase:
			'A stock-trading platform that shaves 2ms off order latency can meaningfully change whether that firm wins or loses a trade.',
		detailedMarkdown: `
# Latency

**Latency** is the time a single operation takes, end to end — how long you wait for a response. It's often confused with **Throughput** (how much work gets done per unit time), but the two behave very differently: you can have low latency with low throughput (a single, fast, lonely request) or high throughput with high latency (a batch pipeline that processes millions of records but takes minutes to turn around any individual one).

## Why Averages Lie: Percentiles
If you report "average latency: 50ms," you can hide a terrible experience for a meaningful slice of users. Say 95 out of 100 requests take 20ms and 5 take 2 seconds — the average is a deceptively okay-looking ~119ms, but 5% of your users are having a miserable time. This is why latency is almost always reported as **percentiles**:
- **p50 (median):** half of all requests are faster than this. Represents the "typical" experience.
- **p95:** 95% of requests are faster than this — starts to expose the tail.
- **p99:** 99% of requests are faster than this — the "bad day" experience; at scale, 1% of a million requests/day is 10,000 unhappy users, every single day.
- **p99.9 / "four nines" latency:** used for the most latency-sensitive systems (ad bidding, trading, gaming) where even 1-in-1000 slow requests matters.

Interviewers routinely ask "what latency would you target?" — the strong answer names a **p99** target, not an average, because tail latency is what actually determines whether real users perceive the system as fast.

## Ballpark Numbers Worth Memorizing
Rough orders of magnitude (approximate, but the *relative* gaps matter far more than exact figures):

| Operation | Approx. latency |
|---|---|
| L1/L2 CPU cache reference | ~1–7 ns |
| Main memory (RAM) reference | ~100 ns |
| Mutex lock/unlock | ~25 ns |
| Send 1KB over a 1 Gbps network | ~10 µs |
| Random read from SSD | ~100–150 µs |
| Round trip within the same data center | ~0.5 ms |
| Read 1MB sequentially from SSD | ~1 ms |
| Disk seek (spinning HDD) | ~10 ms |
| Round trip across continents (e.g. US ↔ Europe) | ~100–150 ms |

The single biggest takeaway from this table: **memory is roughly 100x faster than SSD, and a network round trip across a continent dwarfs almost any in-process computation.** This is why caching (avoiding a network hop or disk read entirely) is one of the highest-leverage latency optimizations available, and why CDNs exist — moving data physically closer to the user cuts the single largest term in the latency budget.

## Where Latency Comes From, End to End
A single request's latency is a sum of many pieces: DNS lookup, TCP/TLS handshake, network transit time, load balancer hop, application processing time, database query time, serialization, and the return trip. In an interview, breaking down *where* time is likely being spent (and which of those pieces caching, a CDN, or an index could eliminate) is far more valuable than just saying "latency is important."

## Practical Takeaway
Always answer latency questions in **percentiles**, always with a concrete target (e.g. "p99 under 200ms"), and always be ready to point at *which specific hop* in the request path you'd attack first to improve it (usually: eliminate a network round trip via caching, or eliminate a slow disk read via an index or in-memory store).
	`
	},

	Throughput: {
		definition:
			'The amount of work a system can process per unit of time — e.g. requests per second, transactions per second, or bytes per second.',
		useCase:
			'A video encoding pipeline is judged on how many hours of footage it can process per hour across the whole fleet, not on how fast any single clip finishes.',
		detailedMarkdown: `
# Throughput

**Throughput** measures capacity: how much work a system gets done per unit of time, usually expressed as requests/second (RPS), queries/second (QPS), or transactions/second (TPS). Where **Latency** asks "how long does one thing take," throughput asks "how many things can happen at once, over time."

## The Latency vs Throughput Trade-off
These two metrics don't always move together — and pushing one often costs the other:
- **Batching** improves throughput but hurts latency: instead of processing 1 item the instant it arrives, you wait to collect 100 items and process them together. Total items/second goes up (fewer per-item overheads like network round trips or disk syncs), but any individual item now waits, on average, for the batch to fill.
- **Parallelism** can improve both simultaneously — more workers handling more requests concurrently — but only up to the point where you hit a shared bottleneck (a single database, a lock, a network link), after which adding more workers just increases contention without adding real throughput.
- **Adding latency-hiding techniques** (pipelining, async I/O) increases throughput without changing any single request's minimum latency — the idea is to keep the pipe *full* rather than making any individual request faster.

A concrete example: a database write-ahead log that flushes to disk after every single write has excellent latency awareness (each write is durable immediately) but poor throughput (every write pays a full disk sync). Batching writes and flushing every 10ms or every 100 writes dramatically increases throughput, at the cost of each individual write now waiting up to that batching window.

## Where Throughput Is the Bottleneck
Systems typically hit a throughput ceiling at one of a few chokepoints:
- **A single database instance** that can only handle so many queries/second before CPU, disk I/O, or connection limits saturate — the classic motivation for read replicas, caching, and sharding.
- **A single-threaded process** that can't use more than one CPU core no matter how many requests arrive — motivates worker pools or horizontal scaling.
- **Network bandwidth** — a fixed pipe size caps total bytes/second regardless of how efficient your application code is.
- **A downstream dependency's rate limit** — your service's throughput is capped by the slowest/most restrictive thing it depends on.

## Measuring and Improving It
- **Load testing** (tools like k6, JMeter, Locust) finds the actual RPS a system sustains before error rates spike or latency degrades — this is how you find the *real* ceiling, not a theoretical one.
- **Horizontal scaling** (see **Scalability**) is the primary lever: more stateless workers behind a load balancer means more total requests/second, as long as the shared backend (database, cache) can keep up.
- **Caching** removes repeat work from the critical path entirely, which raises throughput on the hot path dramatically.
- **Message Queues** absorb throughput spikes by letting producers keep accepting work even when consumers are momentarily slower, smoothing out bursts rather than dropping requests.

## Practical Takeaway
When an interviewer gives you a number like "500,000 requests per second," that's a throughput requirement, and the right response is to identify the tier that will bottleneck first (almost always the database) and propose the standard fixes: horizontal scaling of stateless tiers, caching to cut database load, and queueing to smooth bursts — while being explicit that some of these choices (batching, queueing) will add a small amount of latency in exchange for a large amount of throughput headroom.
	`
	},

	Consistency: {
		definition:
			'A guarantee about what value a read will see after a write — ranging from "always the latest write, everywhere" (strong) to "eventually catches up" (eventual).',
		useCase:
			'A bank balance must be strongly consistent (you can\'t see stale money), while a social media "like count" is fine being eventually consistent.',
		detailedMarkdown: `
# Consistency

**Consistency** answers a deceptively simple question: after data is written, what will a subsequent read see? In a single-machine, single-copy system the answer is trivially "the latest write, always." The moment you introduce **replication** (multiple copies of data, for availability and scale) that question becomes genuinely hard, because copies take time to sync — and different consistency models make different promises about that gap.

## Strong Consistency
Every read reflects the most recent completed write, no matter which replica serves it. Achieving this typically requires reads and writes to coordinate — e.g. always reading from (or getting acknowledgment from) a quorum of nodes, or routing all reads/writes through a single leader. The cost is higher latency (coordination takes time) and reduced availability during network partitions (see **CAP Theorem** — you cannot have strong consistency *and* availability if replicas can't talk to each other).

## Eventual Consistency
Writes propagate to replicas asynchronously. A read immediately after a write might see stale data on some replica, but if no new writes occur, **all replicas will eventually converge** to the same value. This trades a temporary correctness gap for lower latency and higher availability — replicas can keep serving reads even while partially out of sync or even while partitioned from each other.

| | Strong Consistency | Eventual Consistency |
|---|---|---|
| Guarantee | Always see the latest write | Will *eventually* see the latest write |
| Latency | Higher (coordination overhead) | Lower (no coordination needed) |
| Availability under partition | Lower (per CAP) | Higher (per CAP) |
| Typical use case | Bank balances, inventory counts, seat reservations | Like counts, view counts, DNS records, product descriptions |
| Example systems | Traditional RDBMS (single leader), Spanner, Zookeeper | DynamoDB (default mode), Cassandra (tunable), DNS |

## Weaker Forms Worth Knowing
Between the two extremes sit useful middle grounds:
- **Read-your-own-writes consistency:** a user always sees their own writes immediately, even if other users might briefly see stale data (common for social media — you see your own comment instantly, others may take a moment).
- **Causal consistency:** operations that are causally related (a reply to a comment) are seen in the correct order by everyone, even if unrelated operations can appear out of order.
- **Tunable consistency (Cassandra-style):** the client chooses, per-query, how many replicas must acknowledge a write/read (e.g. "quorum" — a majority), letting you dial consistency up or down based on that specific query's needs.

## Tying Back to CAP
Consistency here is literally the "C" in **CAP Theorem** — during a network partition, a system must choose between staying strongly Consistent (rejecting requests to some nodes until they can be sure they have the latest data) or staying Available (serving whatever data a node currently has, possibly stale). This is exactly why the choice of consistency model is a *business* decision as much as a technical one: it's about which is worse for this specific feature, a stale read or a rejected request.

## Practical Takeaway
The strongest interview answer never says "use strong consistency" or "use eventual consistency" as a blanket default — it identifies, feature by feature, which one the *data* demands. Money, inventory, and anything where a stale read causes real harm (double-selling the last item in stock) needs strong consistency. Counters, feeds, and anything where staleness is cosmetic and self-correcting can use eventual consistency to buy much better latency and availability.
	`
	},

	PACELC: {
		definition:
			'An extension of CAP Theorem stating that even without a network partition, distributed systems must trade off Latency against Consistency.',
		useCase:
			'Explains why a globally distributed database like DynamoDB defaults to fast, eventually-consistent reads even when every node is healthy and reachable.',
		detailedMarkdown: `
# PACELC

**CAP Theorem** only tells you what happens *during* a network partition — pick Consistency or Availability. But partitions are (hopefully) rare. **PACELC**, coined by Daniel Abadi, extends the idea to cover the far more common case: what trade-off do you face when the network is *perfectly healthy*? The answer: even then, you're trading **Latency** against **Consistency**.

The name is literally the theorem, spelled out: **if there is a Partition (P), how do you trade off Availability and Consistency (A vs C)? Else (E), how do you trade off Latency and Consistency (L vs C)?**

## Breaking Down Each Letter

**P — Partition.** Is the network currently partitioned (some nodes can't reach others)?

**A vs C (during a partition).** This is exactly CAP Theorem: if nodes can't communicate, do you stay **A**vailable (serve possibly-stale data from whichever node you can reach) or stay **C**onsistent (refuse to serve reads/writes that can't be guaranteed correct until the partition heals)?

**E — Else.** When there is *no* partition — the normal, everyday case — a different trade-off still exists.

**L vs C (in the normal case).** Even with a perfectly healthy network, replicating data across multiple nodes/regions takes *time*. You still have to choose:
- **Low Latency:** respond immediately from the nearest/local replica, even if it might not yet have the very latest write from a replica on the other side of the world.
- **Strong Consistency:** wait for confirmation from other replicas (or a quorum) before responding, guaranteeing correctness at the cost of extra round-trip time.

This second trade-off is the genuinely new insight PACELC adds over CAP: **consistency has a latency cost even when nothing is broken**, because keeping replicas in perfect sync requires communication, and communication takes time — especially across regions.

## Classifying Real Systems
Every distributed database can be labeled with its PACELC choice:

| System | Partition choice (PA/PC) | Normal-case choice (EL/EC) | In plain terms |
|---|---|---|---|
| **DynamoDB** (default) | PA | EL | Prioritizes availability & low latency everywhere; consistency is eventual by default |
| **Cassandra** (tunable) | PA (typically) | EL (typically, tunable to EC) | Same philosophy as Dynamo, but you can dial consistency up per query |
| **MongoDB** (default) | PC | EC | Favors consistency — reads go through a primary; can be tuned |
| **Google Spanner** | PC | EC | Uses synchronized clocks (TrueTime) and consensus to offer strong consistency globally, accepting the latency cost |
| **Traditional single-leader RDBMS** (e.g. Postgres with sync replication) | PC | EC | All writes/critical reads go through one leader — strong consistency, at a latency cost for replication acknowledgment |

## A Worked Example
Say you're designing a globally distributed shopping cart service:
- **If you pick EL (low latency):** a user in Tokyo adds an item, it's written to the nearest regional replica and the response returns instantly. A user checking their cart from Europe a moment later might briefly see a slightly stale cart. Usually fine — carts self-correct fast and the cost of staleness is low.
- **If you pick EC (consistency):** every cart write waits for global replica acknowledgment before confirming to the user. Correct everywhere, immediately, but every single cart update now pays a global round-trip cost — likely hundreds of milliseconds.

Most real shopping carts choose EL, because a rare, momentary stale read is a far smaller cost than a slow "add to cart" button on every single interaction.

## Practical Takeaway
When an interviewer asks "what does your database choice imply beyond CAP," naming PACELC — and specifically that you thought about the **normal-case (non-partition) latency/consistency trade-off**, not just the partition scenario — is a strong signal of depth. Always tie the choice back to the actual feature: does a stale read for a *few hundred milliseconds* meaningfully hurt this specific product, or not?
	`
	},

	'API Gateway': {
		definition:
			"A single entry point that sits in front of a system's backend services, handling routing, authentication, rate limiting, and other cross-cutting concerns for every incoming request.",
		useCase:
			'A mobile app calling "one" API that internally fans requests out to separate Users, Orders, and Inventory microservices, without the client ever knowing they\'re separate.',
		detailedMarkdown: `
# API Gateway

An **API Gateway** is the front door to a system built from multiple backend services (most commonly microservices). Instead of clients calling each service directly, every request goes through the gateway first, which handles the concerns that would otherwise have to be duplicated inside every single microservice.

## Why Not Let Clients Call Services Directly?
Without a gateway, a mobile client would need to know the network address of every microservice, implement auth logic against each one separately, and handle N different failure modes for N different services. That's fragile and duplicative. The API Gateway pattern centralizes those concerns into one place.

## Core Responsibilities
- **Routing:** map an incoming path (e.g. \`/api/orders/123\`) to the correct backend service, hiding the internal service topology from the client entirely — services can be split, merged, or moved without the client noticing.
- **Authentication & Authorization:** verify the caller's identity (validate a JWT, check an API key) once, at the edge, rather than re-implementing auth logic in every downstream service.
- **Rate Limiting:** enforce per-client or per-API-key request limits centrally (see **Rate Limiter**) so a single misbehaving client can't overwhelm a backend service.
- **Request aggregation / composition:** for a single client request that needs data from multiple services (e.g. a product page needing pricing, inventory, and reviews), the gateway can fan out to all three internally and combine the results into one response — sparing the client multiple round trips.
- **Protocol translation:** clients might speak REST/JSON while internal services speak gRPC — the gateway can translate.
- **Cross-cutting operational concerns:** logging, request tracing/correlation IDs, response caching, and SSL/TLS termination all live naturally at this single edge layer.

## A Simple Request Flow
\`\`\`text
Mobile App
   |
   v
[ API Gateway ]  --- auth check, rate limit check ---
   |         \\            \\
   v          v            v
Users Svc   Orders Svc   Inventory Svc
\`\`\`
The client only ever talks to the gateway. It has no idea "Orders" and "Inventory" are separate deployable services, running on separate machines, possibly written in different languages.

## API Gateway vs Load Balancer vs Reverse Proxy
These three terms get conflated, but they solve different (overlapping) problems:
- A **Load Balancer** distributes traffic across *identical* instances of the *same* service — it doesn't know or care about business logic.
- A **Reverse Proxy** forwards requests to backend server(s), often adding caching or SSL termination, but is typically simpler and less "aware" of application-level concerns.
- An **API Gateway** is application-aware: it routes to *different* services based on the request itself, and layers in auth, rate limiting, and aggregation — meaningfully more than a plain reverse proxy or load balancer does. In practice, a gateway often sits in front of (and uses) load balancers for each individual service.

## Trade-offs to Mention
- It becomes a **single point of failure** and a potential bottleneck if not itself scaled and made highly available — the fix is the same as for any critical service: run multiple gateway instances behind a load balancer.
- It adds one extra network hop to every request, which is a small latency cost worth explicitly acknowledging.
- Centralizing logic here means the gateway's configuration/deployment becomes a shared dependency across every team — a bug in gateway auth logic can take down every service at once.

## Practical Takeaway
Whenever a system design question involves more than one backend service (which is almost always, once you get past the "design a single simple app" stage), proposing an API Gateway up front is a strong opening move — it's the natural place to put auth, rate limiting, and routing, and naming these three responsibilities explicitly (not just "it's the entry point") is what separates a surface-level answer from a strong one. Real examples to cite: AWS API Gateway, Kong, Apigee, or a service mesh's ingress gateway (e.g. Istio).
	`
	},

	Cache: {
		definition:
			'A layer that stores frequently accessed data in fast storage (usually memory) so subsequent requests can be served without repeating expensive work.',
		useCase:
			"Storing a user's profile in Redis after the first database lookup so the next 10,000 page loads for that user skip the database entirely.",
		detailedMarkdown: `
# Cache

A **cache** trades storage space for speed: it keeps a copy of data that's expensive to (re)compute or (re)fetch in a place that's much faster to read from — usually RAM instead of disk, or a nearby service instead of a distant one. Caching is one of the highest-leverage tools in system design because of the raw latency gap between memory and everything slower than it (see the numbers in **Latency**): a cache hit can turn a 50ms database round trip into a sub-millisecond memory lookup.

## Caching Strategies (Read Path)
**Cache-Aside (Lazy Loading)** — the most common pattern:
1. Application checks the cache first.
2. **Cache hit:** return the cached value immediately.
3. **Cache miss:** read from the database, then *write* the result into the cache before returning it, so the next request is a hit.

\`\`\`text
GET user(123)
  cache.get(123) -> miss
  db.get(123)    -> {name: "Ana"}
  cache.set(123, {name: "Ana"}, ttl=300s)
  return {name: "Ana"}
\`\`\`
Simple and resilient (a dead cache just means every request falls through to the database), but the first request for any key always pays the full cost, and the cache can hold stale data until it expires.

## Caching Strategies (Write Path)
- **Write-Through:** every write goes to the cache *and* the database synchronously, before the write is acknowledged. Cache is always fresh, but every write now pays the latency of both stores.
- **Write-Back (Write-Behind):** writes go to the cache immediately and are acknowledged right away; the cache asynchronously flushes to the database later (often batched). Very fast writes, but risks data loss if the cache fails before flushing, and adds real complexity.
- **Write-Around:** writes go directly to the database, bypassing the cache entirely — used when written data isn't likely to be read again soon, avoiding cache pollution.

| Strategy | Write latency | Read-after-write freshness | Risk |
|---|---|---|---|
| Cache-Aside | N/A (only on read miss) | Stale until next miss/TTL | Stampede on popular-key expiry |
| Write-Through | Higher (writes 2 stores) | Always fresh | Slower writes |
| Write-Back | Lowest | Fresh in cache, lagging in DB | Data loss if cache dies before flush |

## The Hard Problem: Invalidation
Phil Karlton's famous line — "There are only two hard things in Computer Science: cache invalidation and naming things" — exists because caches inherently create **two sources of truth**, and deciding when the cached copy is no longer trustworthy is genuinely hard:
- **TTL (Time To Live):** simplest fix — every cached entry expires automatically after N seconds, bounding staleness without needing to explicitly track every place data could change.
- **Explicit invalidation:** when the underlying data changes, actively delete or update the cache entry (e.g. on a database write, also issue a \`cache.delete(key)\`). More precise, but easy to miss a code path and leave a stale entry behind.
- **Event-driven invalidation:** a data-change event (see **Event Driven Architecture**) triggers cache invalidation across every node that might be caching that key — necessary once you have more than one cache instance.

## Eviction Policies
Caches have finite size, so once full, something has to be thrown out to make room:
- **LRU (Least Recently Used):** evict the entry that hasn't been accessed in the longest time — the default choice for most general-purpose caches, since recently-used data tends to be used again soon.
- **LFU (Least Frequently Used):** evict the entry accessed the fewest total times — better when access frequency, not recency, predicts future use, but more bookkeeping overhead.

## Where This Shows Up in an Interview
Asked to "design a URL shortener" or "design Twitter's feed," caching is almost always the answer to "how do you handle a hot key" (a viral tweet, a celebrity's profile) — one extremely popular piece of data getting read millions of times, which a cache absorbs so the database only sees the *first* read. Naming a real system (Redis, Memcached) and the specific strategy (cache-aside with a TTL, for example) beats a vague "we'll add a cache."

## Practical Takeaway
Default to **cache-aside with a TTL** unless the problem specifically demands write-heavy freshness guarantees (write-through) or extreme write latency (write-back). Always mention what happens on a cache miss and how staleness is bounded — those two answers are what separates "I know caches exist" from "I know how to actually use one."
	`
	},

	'Message Queue': {
		definition:
			'A component that lets producers place messages onto a queue for consumers to process asynchronously and independently, decoupling the two sides in time and load.',
		useCase:
			'An e-commerce checkout that puts "process this order" onto a queue so the customer gets an instant confirmation while inventory, payment, and shipping services work through the backlog at their own pace.',
		detailedMarkdown: `
# Message Queue

A **Message Queue** decouples the producer of work from the consumer of work. Instead of Service A calling Service B directly and waiting for it to finish (a **synchronous**, tightly coupled call), Service A drops a message onto a queue and moves on immediately; Service B picks messages up whenever it's ready and processes them **asynchronously**.

## Why Decoupling Matters
Direct synchronous calls create two problems at scale:
- **Temporal coupling:** if B is slow or momentarily down, A is blocked (or fails) too.
- **Load coupling:** a burst of traffic to A becomes an instant, equal burst to B — B has to be provisioned for A's worst-case spike.

A queue breaks both: A can keep accepting work even if B is completely down (messages just pile up in the queue), and a traffic spike to A gets *absorbed* by the queue and drained by B at whatever steady pace B can actually handle. This is why queues are the standard answer whenever an interviewer describes a spiky, bursty workload sitting in front of a slower or less elastic downstream system.

## A Concrete Flow: Order Processing
\`\`\`text
Client -> Order Service -> [ enqueue OrderPlaced ] -> Message Queue
                                                             |
                                    +------------------------+------------------------+
                                    v                         v                        v
                            Inventory Worker         Payment Worker           Shipping Worker
\`\`\`
The Order Service returns "order received" to the client the instant the message is enqueued — it doesn't wait for inventory to be decremented, payment to clear, or a shipping label to be generated. Each downstream worker consumes from the queue on its own schedule and can be scaled independently based on its own load.

## Delivery Guarantees
This is the detail interviewers most often push on, because "just use a queue" is easy but the guarantee it provides is not automatic:
- **At-most-once:** a message is delivered zero or one times — it might be lost, but is never duplicated. Rare in practice; used when losing a message is more acceptable than double-processing it.
- **At-least-once:** a message is guaranteed to be delivered, but might be delivered **more than once** (e.g. a consumer processes a message, crashes before acknowledging it, and the queue redelivers it to another consumer). This is the most common real-world guarantee (SQS standard queues, most brokers by default).
- **Exactly-once:** each message is processed exactly one time, no drops, no duplicates. Genuinely hard to guarantee end-to-end across a network; usually achieved by combining at-least-once delivery with **idempotent** consumers (processing the same message twice has the same effect as processing it once — e.g. via a deduplication ID).

The practical takeaway: **design consumers to be idempotent, and treat "at-least-once + idempotent processing" as your real-world exactly-once.**

## Real Systems Worth Naming
- **Amazon SQS:** simple, managed, at-least-once queue; messages are removed once acknowledged.
- **RabbitMQ:** flexible, supports complex routing (exchanges, topics), traditional message-broker semantics.
- **Apache Kafka:** technically a distributed, replicated, append-only **log** rather than a classic queue — messages aren't removed on consumption, they're retained for a configurable period and consumers track their own read position (**offset**). This lets multiple independent consumer groups replay the same stream, and gives Kafka very high throughput — which is why it's the default choice for event streaming and **Event Driven Architecture**, not just simple task queues.

## Practical Takeaway
Reach for a message queue whenever you spot: (1) a slow or unreliable downstream step that shouldn't block the user-facing response, (2) a bursty producer in front of a consumer with limited/fixed capacity, or (3) a multi-step workflow where each step should be able to fail and retry independently. Always follow up "we'll add a queue" with the delivery guarantee you need and how the consumer stays idempotent under redelivery — that's the detail that shows real understanding.
	`
	},

	'Pub/Sub': {
		definition:
			'A messaging pattern where publishers broadcast messages to a topic, and every subscriber to that topic receives its own independent copy — fan-out, not point-to-point.',
		useCase:
			'A "user signed up" event that simultaneously triggers a welcome email, an analytics update, and a fraud check — three unrelated services, one event.',
		detailedMarkdown: `
# Pub/Sub

**Publish/Subscribe (Pub/Sub)** is a messaging pattern where a **publisher** sends a message to a named **topic**, without knowing or caring who (if anyone) is listening. Any number of **subscribers** can independently subscribe to that topic, and every one of them gets its own copy of every message. This is the key structural difference from a classic **Message Queue**.

## Pub/Sub vs Point-to-Point Queue
| | Message Queue (point-to-point) | Pub/Sub |
|---|---|---|
| Delivery | One message goes to **one** consumer (whichever one picks it up first) | One message goes to **every** subscriber |
| Consumers | A pool of workers competing for the same work | Independent services, each doing something different with the same event |
| Coupling | Producer knows there's "a queue" for this work | Producer doesn't know or care who's listening |
| Classic use | Distributing tasks across a worker pool (only one worker should do each task) | Broadcasting a fact/event that multiple, unrelated systems care about |

A queue is for **work distribution** ("someone needs to process this order, I don't care which worker"). Pub/Sub is for **event broadcasting** ("this thing happened, and everyone who cares should know").

## A Concrete Flow
\`\`\`text
Publisher -> Topic: "user.signed_up"
                 |
    +------------+------------+------------+
    v            v            v            v
 Email Svc   Analytics Svc  Fraud Svc   Recommendation Svc
\`\`\`
Each subscriber receives the **same** \`user.signed_up\` event and does something entirely different with it — sending a welcome email, incrementing a signup counter, running a fraud heuristic, seeding a recommendation profile. Critically, the publisher (the signup service) knows nothing about any of these four subscribers; new subscribers can be added later with **zero changes** to the publisher.

## Real Systems Worth Naming
- **Amazon SNS:** a managed pub/sub service, commonly paired with SQS — SNS fans a single message out to multiple SQS queues, giving each subscriber its own durable, independently-consumable queue.
- **Kafka topics:** each topic can have multiple independent **consumer groups**, and every consumer group receives a full copy of the topic's stream — this is Kafka's pub/sub behavior layered on top of its log-based storage.
- **Google Cloud Pub/Sub, Redis Pub/Sub:** similar broadcast semantics, with different durability/persistence trade-offs (Redis Pub/Sub, notably, does **not** persist messages for offline subscribers — if you're not listening when it's published, it's gone).

## Why This Matters for Scalability and Decoupling
Pub/Sub is the mechanism that makes **Event Driven Architecture** possible: services stop calling each other directly and instead just announce "this happened." Any team can add a brand-new subscriber to react to an existing event stream without ever touching the publisher's code or deployment — this is a huge win for large organizations with many independent teams, since it removes the need to coordinate a code change across services just to add a new reaction to an existing event.

## Where This Shows Up in an Interview
If an interviewer says "when a video finishes uploading, we need to trigger transcoding, thumbnail generation, and a notification to the uploader — and we expect to add more reactions later," that "add more reactions later, without touching the upload service" phrase is the signal for pub/sub over a plain queue: you want fan-out to multiple, independently-evolving consumers, not one worker picking up one task.

## Practical Takeaway
Ask yourself: "should exactly one consumer handle this, or should every interested party get their own copy?" One consumer → message queue. Every interested party → pub/sub. Many production systems combine both: publish to a Kafka/SNS topic (pub/sub) and have each subscriber be backed by its own SQS-style queue (point-to-point) for durable, retryable delivery to that subscriber's worker pool.
	`
	},

	'Event Driven Architecture': {
		definition:
			"An architectural style where services communicate by producing and reacting to events, rather than by calling each other's APIs directly.",
		useCase:
			'An order placement emits an "OrderPlaced" event; inventory, shipping, and notifications each react to it independently, with no service needing to know the others exist.',
		detailedMarkdown: `
# Event Driven Architecture

**Event Driven Architecture (EDA)** flips the usual request/response mental model. Instead of Service A directly calling Service B ("do this now, and tell me the result"), Service A simply announces that something happened — an **event** — and any number of other services react to it on their own schedule. The communication backbone underneath EDA is almost always a **Message Queue** or **Pub/Sub** system.

## Direct Calls vs Event-Driven
\`\`\`text
Direct (synchronous) coupling:
  Order Service --calls--> Inventory Service --calls--> Shipping Service --calls--> Notification Service
  (Order Service must know about, and wait on, all three downstream services)

Event-driven:
  Order Service --emits--> "OrderPlaced" event
                                 |
              +------------------+------------------+
              v                  v                   v
     Inventory Svc        Shipping Svc        Notification Svc
     (each reacts independently; Order Service knows about none of them)
\`\`\`

## Benefits
- **Loose coupling:** producers don't know or care who consumes their events, or how many consumers there are. New reactions to an existing event can be added without touching the producer at all.
- **Independent scalability:** each consumer scales based on *its own* load — a slow notification system doesn't block or slow down order placement.
- **Resilience:** if the Shipping service is down, orders can still be placed; the "OrderPlaced" event simply waits in the queue/log until Shipping recovers, rather than the whole checkout flow failing.
- **Natural audit trail:** a stream of past events is, by construction, a history of everything that happened in the system — useful for debugging, analytics, and rebuilding state (see Event Sourcing / CQRS elsewhere in the data-architecture material).

## Challenges (the part interviewers actually want to hear)
- **Eventual consistency:** since reactions to an event happen asynchronously, there's a window where the rest of the system hasn't "caught up" yet — e.g. a customer sees "order placed" before inventory has actually been decremented. Every consumer of an event-driven system has to be designed around this lag.
- **Debugging complexity:** a bug is no longer "trace one call stack" — it's "trace an event through N independent services, each possibly delayed, each possibly retried." Distributed tracing (correlation IDs threaded through every event) becomes essential, not optional.
- **Event ordering:** if event order matters (e.g. "ItemAdded" then "ItemRemoved" must be processed in that sequence) and events for the same entity can land on different consumers or partitions out of order, you can end up applying updates in the wrong sequence. Kafka addresses this by guaranteeing order *within a partition* (so events for the same entity, keyed consistently, land in the same partition and stay ordered) — but ordering *across* partitions/topics is not guaranteed.
- **Duplicate events / idempotency:** just like message queues, most event systems provide at-least-once delivery, so every consumer needs to handle the same event arriving twice without corrupting state (see **Retry** and **Message Queue** for the idempotency pattern).
- **Schema evolution:** as the system grows, the shape of an event ("what fields does OrderPlaced have?") needs to change without breaking consumers that haven't been updated yet — this pushes teams toward versioned event schemas and backward-compatible changes.

## Where This Shows Up in an Interview
Any time a design has a "trigger a bunch of side effects when X happens" flavor — a video finishes processing, a user signs up, a payment succeeds — naming EDA (with pub/sub as the transport) is the expected move, and following up with "here's how I'd handle a duplicate or out-of-order event" is what separates a surface-level answer from a strong one.

## Practical Takeaway
Event-driven architecture is a trade: you give up the simplicity of "call it and get an immediate answer" in exchange for loose coupling and independent scalability. It's the right trade whenever multiple, independently-evolving parts of a system need to react to the same fact, and the wrong trade when you genuinely need an immediate, synchronous answer (e.g. "is this payment approved, right now, before I show the confirmation page").
	`
	},

	'Object Storage': {
		definition:
			'A storage system that manages data as whole, immutable objects (each with a unique key and metadata) accessed over HTTP, rather than as a file hierarchy or raw disk blocks.',
		useCase:
			"Storing every profile photo, video, and PDF a web app handles in S3 instead of on the application server's own disk.",
		detailedMarkdown: `
# Object Storage

**Object storage** stores data as discrete, self-contained **objects** — each with a unique key/ID, the raw data (a "blob") itself, and a flat set of metadata — accessed via a simple HTTP-based API (\`PUT\`, \`GET\`, \`DELETE\` on a key), rather than through a file path hierarchy or raw block addresses. Amazon S3 is the system most people mean when they say "object storage," but the model itself (Google Cloud Storage, Azure Blob Storage, MinIO) is the same everywhere.

## Object vs Block vs File Storage
This three-way comparison is a very common interview question, because each is genuinely suited to a different job:

| | Block Storage | File Storage | Object Storage |
|---|---|---|---|
| Unit | Raw fixed-size blocks | Files in a directory tree | Whole objects with a flat key |
| Access | Low-level, by the OS/filesystem | Standard file I/O (open/read/write a path) | HTTP API (GET/PUT by key) |
| Typical use | Database storage, VM disks — anything needing fast, low-level random read/write | Shared drives, config files, anything needing a folder structure and file locking | Images, videos, backups, logs, static assets — large, mostly-immutable blobs |
| Metadata | None (just blocks) | Basic (permissions, timestamps) | Rich, customizable (arbitrary key-value tags per object) |
| Scalability | Limited to the attached volume | Limited by the filesystem/NAS | Practically unlimited (designed for exabyte scale) |
| Mutability | Byte-level read/write | Byte-level read/write | Typically whole-object replace, not partial in-place edits |
| Example | AWS EBS, a local SSD | AWS EFS, NFS | AWS S3, Google Cloud Storage |

## Why Not Just Use a File System for Everything?
A traditional file system's directory-tree model doesn't scale gracefully to billions of files across many machines — deep hierarchies, file locking semantics, and POSIX-style consistency guarantees all become a bottleneck at that scale. Object storage deliberately gives up some of that (no real folder structure — "folders" in S3 are just a UI convention over key prefixes like \`images/2024/photo.jpg\`; no partial in-place edits) in exchange for massive, close-to-linear horizontal scalability, high durability (S3 famously targets 99.999999999% — "11 nines" — durability via internal replication/erasure coding across facilities), and a dead-simple API that any HTTP client can use directly.

## Typical System Design Use
- **User-generated content:** profile photos, uploaded videos, PDFs — anything large and mostly-write-once, read-many.
- **Static asset hosting:** frequently paired with a **CDN** in front of it, so objects are cached at edge locations close to users instead of every request hitting the origin object store.
- **Backups and data lakes:** cheap, durable, effectively-infinite storage for cold data and large-scale analytics datasets.
- **Offloading large payloads from your primary database:** instead of storing a video file as a BLOB column in a relational database (which hurts backup size, replication speed, and query performance), store the file in object storage and keep only a reference URL/key in the database row.

## Practical Takeaway
Whenever a design involves storing large binary files (images, videos, documents), object storage — not the primary relational database — is the right home for them; the database should hold a lightweight pointer (the object's key/URL), not the bytes themselves. Mentioning that pattern explicitly, plus fronting the object store with a CDN for read-heavy public assets, is the expected shape of a strong answer.
	`
	},

	'Search Engine': {
		definition:
			'A system optimized for fast, flexible full-text and faceted search across large volumes of data, built around an inverted index rather than row-by-row scanning.',
		useCase:
			'Powering an e-commerce site\'s search bar so "red running shoes size 10" returns relevant results in milliseconds across millions of listings.',
		detailedMarkdown: `
# Search Engine

A dedicated **search engine** (Elasticsearch, Apache Solr, OpenSearch) exists to solve a problem relational databases are structurally bad at: fast, relevant, flexible **full-text search** across large volumes of unstructured or semi-structured text, at scale.

## Why Not Just \`LIKE '%query%'\` on Your Database?
A relational database's \`WHERE description LIKE '%running shoes%'\` has to scan every row and check the string, because a standard B-Tree index (see the **Indexes** topic) is built for exact-match or range lookups on a column's *value* — it has no concept of "does this blob of text contain these words, in some order, with some words weighted more than others." That query gets linearly slower as the table grows, has no concept of relevance ranking, and can't handle things like typo-tolerance, stemming ("running" matching "run"), or weighting a match in a title higher than a match buried in a long description.

## The Core Idea: Inverted Index
A search engine flips the usual document → words mapping into a **word → documents** mapping, called an **inverted index**:

\`\`\`text
Forward index (normal storage):
  Doc 1: "red running shoes"
  Doc 2: "blue running jacket"
  Doc 3: "red winter jacket"

Inverted index (what the search engine builds):
  "red"     -> [Doc 1, Doc 3]
  "running" -> [Doc 1, Doc 2]
  "shoes"   -> [Doc 1]
  "blue"    -> [Doc 2]
  "jacket"  -> [Doc 2, Doc 3]
  "winter"  -> [Doc 3]
\`\`\`
A query for "red running" is now a fast **set intersection** of the "red" list and the "running" list ([Doc 1, Doc 3] ∩ [Doc 1, Doc 2] = [Doc 1]) — no scanning every document's text at query time. This is the same fundamental leverage a database index gives you (turning a scan into a direct lookup), applied to *words inside documents* rather than column values.

## What Full-Text Search Adds Beyond a Basic Inverted Index
- **Relevance ranking (scoring):** results aren't just "matches / doesn't match" — they're ranked by relevance using algorithms like **TF-IDF** or **BM25**, which weigh how often a term appears in a document against how rare that term is across all documents (a match on a rare, specific word ranks higher than a match on "the").
- **Tokenization and analysis:** breaking text into searchable tokens, lowercasing, removing stop words ("the," "and"), and **stemming** (matching "running"/"runs"/"ran" to a common root) — all handled by a configurable "analyzer" pipeline before indexing.
- **Fuzzy matching / typo tolerance:** finding "shose" as a near-match for "shoes" via edit-distance algorithms.
- **Faceting and aggregations:** e.g. showing "Brand: Nike (120), Adidas (85)" counts alongside search results — genuinely hard to do efficiently with a relational \`LIKE\` query at scale.

## How It Fits Into a Larger System
A search engine is almost never the **source of truth** — it's a specialized read path. The typical pattern:
1. The primary database (Postgres, MySQL, DynamoDB) remains the system of record for writes.
2. On every create/update, the relevant data is also written (often asynchronously, via a **Message Queue** or **Event Driven Architecture** change-data-capture pipeline) into Elasticsearch/Solr, keeping the search index roughly in sync.
3. Search queries hit the search engine, not the primary database — keeping expensive full-text queries off your transactional data store entirely.

## Practical Takeaway
Whenever a design calls for search that's richer than "look up by exact ID" — free-text search, relevance ranking, typo tolerance, faceted filters — that's the cue to introduce a dedicated search engine like Elasticsearch, fed asynchronously from the primary database, rather than trying to force a relational database's indexes to do a job they weren't built for.
	`
	},

	'Service Discovery': {
		definition:
			'The mechanism by which services in a distributed system automatically find the current network location (IP/port) of other services, without hardcoding addresses.',
		useCase:
			'In a Kubernetes cluster where pods are constantly created and destroyed with new IPs, service discovery is how the "Orders" service always knows how to reach the current instances of the "Payments" service.',
		detailedMarkdown: `
# Service Discovery

In a static world, Service A could just hardcode Service B's IP address and be done with it. In any modern distributed system — where instances are constantly scaling up/down, being replaced after crashes, or moving between hosts (especially under an orchestrator like Kubernetes) — that IP address is a moving target. **Service discovery** is the infrastructure that lets services find each other's *current* location dynamically, instead of relying on a fixed address that will inevitably go stale.

## The Two Core Pieces
1. **Service Registry:** a database that tracks which service instances are currently alive and where they are (IP:port), typically kept up to date via **health checks/heartbeats** — instances that stop responding are automatically removed.
2. **Discovery mechanism:** how a caller actually looks up an address from that registry before making a request.

## Client-Side Discovery
The calling service itself queries the registry directly, gets back a list of healthy instances, and picks one (often using a load-balancing strategy like round robin) — the client does its own load balancing.

\`\`\`text
Order Service --query--> Service Registry --returns--> [10.0.1.5:8080, 10.0.1.9:8080]
Order Service picks one --calls--> 10.0.1.9:8080 (Payments instance)
\`\`\`
**Pros:** no extra network hop, full control over the load-balancing strategy client-side.
**Cons:** every client needs discovery logic built in (a library per language), coupling clients to the registry's API.

## Server-Side Discovery
The caller just makes a request to a well-known, stable address; a **load balancer or proxy** sitting behind that address queries the registry and routes the request — the caller has no idea discovery is even happening.

\`\`\`text
Order Service --calls--> payments.internal (stable DNS name)
                              |
                    [ Load Balancer / Proxy ] --queries registry, routes to--> 10.0.1.9:8080
\`\`\`
**Pros:** clients stay simple — they just call a name, no discovery logic needed in application code.
**Cons:** an extra network hop through the load balancer/proxy layer.

## Real Systems
- **Consul (HashiCorp):** a dedicated service registry + health-checking system, commonly paired with client-side discovery libraries or a sidecar proxy.
- **Netflix Eureka:** a classic client-side discovery registry, widely used in Spring Cloud microservice stacks.
- **Kubernetes (DNS-based):** the most common modern default — every Kubernetes **Service** gets a stable DNS name (e.g. \`payments-service.default.svc.cluster.local\`); under the hood, \`kube-proxy\` (or a service mesh sidecar) resolves that name to one of the currently-healthy pod IPs and routes the request. This is server-side discovery baked directly into the platform — application code just does a normal DNS lookup and HTTP call, with zero discovery-specific code.
- **Service meshes (Istio, Linkerd):** push discovery and routing into a sidecar proxy attached to every service instance, which handles registry lookups, load balancing, retries, and even circuit breaking transparently, outside the application code entirely.

## Practical Takeaway
The industry's center of gravity has moved toward **server-side, DNS-based discovery** (Kubernetes Services, service meshes) precisely because it keeps application code free of discovery logic entirely — a service just calls another service by a stable name and trusts the platform to route it correctly. When asked how two microservices find each other in a system design interview, "they call a stable service name, and the platform's DNS/proxy layer resolves it to a currently-healthy instance" is the modern, expected answer — with Consul/Eureka-style client-side registries as the "how it used to be done, and still is in some stacks" follow-up.
	`
	},

	'Circuit Breaker': {
		definition:
			'A pattern that stops a service from repeatedly calling a dependency that is known to be failing, giving it time to recover and preventing cascading failure.',
		useCase:
			'When a recommendations microservice starts timing out, a circuit breaker in the calling service stops hammering it with requests and instantly returns a fallback (e.g. "no recommendations") instead.',
		detailedMarkdown: `
# Circuit Breaker

The **Circuit Breaker** pattern is named after its electrical namesake for a reason: just as an electrical circuit breaker trips to stop current flow and prevent a fire when there's a fault downstream, a software circuit breaker trips to stop *calls* to a dependency that is failing, preventing that failure from cascading upstream and taking down callers too.

## The Problem It Solves: Cascading Failure
Without a circuit breaker, if Service B becomes slow or starts failing, every caller (Service A) keeps sending requests to it anyway — each one waiting out a full timeout before failing. Under load, Service A's own threads/connections pile up waiting on a dependency that isn't going to respond, and **Service A itself starts failing too**, even though the *original* problem was entirely in B. This is how one failing service takes down its entire upstream call chain.

## The Three States
\`\`\`text
        failures exceed threshold
   CLOSED  ------------------------->  OPEN
     ^                                   |
     | success in trial                  | timeout elapses
     |                                   v
   HALF-OPEN  <-------------------------
     |
     | (a failure during the trial call sends it right back to OPEN)
\`\`\`

- **Closed:** the normal state. Requests flow through to the dependency as usual. The breaker quietly counts failures (e.g. "5 failures in the last 10 seconds").
- **Open:** once failures cross a threshold, the breaker "trips" — it stops calling the dependency **entirely** and immediately returns an error or a fallback for every request, without even attempting the network call. This is what protects the caller: it fails fast (microseconds) instead of failing slow (waiting out a full timeout every time).
- **Half-Open:** after a cooldown period, the breaker lets a small number of **trial requests** through to see if the dependency has recovered. If they succeed, the breaker resets to Closed. If they fail, it immediately goes back to Open and waits another cooldown period.

## Pseudocode
\`\`\`python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, cooldown_seconds=30):
        self.state = "CLOSED"
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.opened_at = None

    def call(self, dependency_fn, fallback_fn):
        if self.state == "OPEN":
            if time.now() - self.opened_at > self.cooldown_seconds:
                self.state = "HALF_OPEN"
            else:
                return fallback_fn()  # fail fast, no network call

        try:
            result = dependency_fn()
            self.on_success()
            return result
        except Exception:
            self.on_failure()
            return fallback_fn()

    def on_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def on_failure(self):
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.opened_at = time.now()
\`\`\`

## Fallbacks — What Happens While Open
Tripping the breaker is only half the pattern; the other half is deciding what to return instead. Common choices: a cached/stale response, a default/empty value ("no recommendations available"), or a clear degraded-mode error the UI can handle gracefully. This directly implements **graceful degradation** (see **Fault Tolerance**) — the calling service stays up and responsive even while a dependency is unhealthy.

## Circuit Breaker vs Retry
These two patterns are often used together but solve opposite problems: **Retry** assumes a failure might be transient and tries again; a **Circuit Breaker** assumes repeated failure means the dependency is *actually down* and stops trying, to protect both the caller and the struggling dependency from more load. A well-built client typically retries a few times with backoff, and if failures keep happening, the circuit breaker trips to stop the retries from continuing indefinitely.

## Practical Takeaway
Circuit breakers belong on every network call to a dependency that could plausibly be slow or unavailable, especially in a microservices architecture where one service's outage should never be allowed to propagate upstream. Real implementations: Netflix's **Hystrix** (the pattern's most famous popularizer, now in maintenance mode), **resilience4j** (its modern Java successor), and circuit breaking built directly into service meshes like Istio and Linkerd.
	`
	},

	Retry: {
		definition:
			'Automatically re-attempting a failed operation, typically with a growing delay between attempts, on the assumption that the failure might be transient.',
		useCase:
			'A payment API call that times out due to a brief network blip succeeds on the second attempt a few hundred milliseconds later, with the user never noticing.',
		detailedMarkdown: `
# Retry

**Retrying** is the simplest resilience pattern there is: if a request fails, try it again. The nuance — and the entire reason this is a real system design topic instead of a one-line \`while\` loop — is in *how* you retry and *what* you're retrying, because naive retries can make things dramatically worse instead of better.

## Exponential Backoff
Retrying immediately after a failure is often the worst possible move: if the dependency failed because it's overloaded, an instant retry just adds to that same overload. **Exponential backoff** fixes this by waiting progressively longer between attempts:

\`\`\`text
Attempt 1: fails -> wait 100ms
Attempt 2: fails -> wait 200ms
Attempt 3: fails -> wait 400ms
Attempt 4: fails -> wait 800ms
...up to some max delay and max attempt count
\`\`\`
This gives a struggling dependency real breathing room to recover instead of being retried into the ground.

## Jitter
Plain exponential backoff has a subtle flaw: if a downstream outage causes **thousands of clients** to fail at the same moment, they'll all back off on the exact same schedule and then all retry again at the exact same moment — turning "many clients failed" into "many clients now hammer the recovering service in perfect unison," which can knock it back over. **Jitter** fixes this by adding a random amount to each backoff delay, spreading retries out over time instead of letting them synchronize:

\`\`\`python
import random

def backoff_with_jitter(attempt, base_ms=100, max_ms=10000):
    exp_delay = min(max_ms, base_ms * (2 ** attempt))
    return random.uniform(0, exp_delay)  # "full jitter"
\`\`\`
This "full jitter" approach (picking a random delay between 0 and the exponential cap, rather than a fixed exponential value) is the version AWS's own architecture guidance recommends, precisely because it spreads out retries the most effectively.

## Idempotency: The Non-Negotiable Requirement
Retrying is only safe if repeating the operation doesn't cause a different (or worse) outcome than doing it once. This is **idempotency**: an operation is idempotent if performing it multiple times has the same effect as performing it once.
- \`GET /orders/123\` — naturally idempotent; reading data twice changes nothing.
- \`PUT /orders/123 {status: "shipped"}\` — idempotent; setting the same value twice ends in the same state.
- \`POST /payments {amount: 50}\` — **not** naturally idempotent — if the first attempt actually succeeded but the client never got the response (so it retries), a naive retry double-charges the customer.

The standard fix for the last case is an **idempotency key**: the client generates a unique key once per logical operation and sends it with every retry attempt. The server remembers keys it has already processed and, if it sees a repeat, returns the original result instead of executing the operation again.
\`\`\`text
POST /payments  { amount: 50, idempotency_key: "abc-123" }
  -> server has not seen "abc-123" before -> charges card, stores result under "abc-123"
POST /payments  { amount: 50, idempotency_key: "abc-123" }  (retry after a timeout)
  -> server HAS seen "abc-123" -> returns the stored result, does NOT charge again
\`\`\`

## The Failure Mode: Retry Storms
If every client in a large fleet retries aggressively (no backoff, no jitter, no cap on attempts) against a dependency that's already struggling, the *retries themselves* become the dominant source of load — a **retry storm** — which can turn a brief blip into a prolonged outage, because the dependency never gets a quiet moment to recover under the flood of retry traffic. Guardrails against this include: capping the maximum number of attempts, exponential backoff with jitter, and pairing retries with a **Circuit Breaker** that stops retrying entirely once it's clear the dependency is truly down rather than just momentarily slow.

## Practical Takeaway
Never retry blindly. A production-quality retry needs: a bounded number of attempts, exponential backoff with jitter between them, and a guarantee that the operation being retried is idempotent (via an idempotency key if it isn't naturally so). Mentioning retry storms as the failure mode retries themselves can cause is a strong signal that you understand this isn't a free safety net.
	`
	},

	'Rate Limiter': {
		definition:
			'A mechanism that caps how many requests a client (or the system as a whole) can make in a given time window, protecting backend resources from being overwhelmed.',
		useCase:
			"Capping a public API to 100 requests per minute per API key so one abusive or buggy client can't degrade the experience for every other customer.",
		detailedMarkdown: `
# Rate Limiter

A **rate limiter** enforces a ceiling on how much traffic a client — or the system overall — is allowed to send in a given window of time, rejecting (or delaying) requests beyond that ceiling. It's the standard defense against abusive clients, buggy retry loops, denial-of-service attempts, and simply protecting a backend that can't scale as fast as demand spikes.

## Where It Lives
Most commonly enforced at the **API Gateway** or a dedicated middleware layer, right at the edge — before a request has a chance to consume any real backend resources (database connections, compute) — and applied per-user, per-API-key, or per-IP depending on what "one client" means for that system.

## Token Bucket
The most widely used algorithm, and the one most interviewers expect by name:
- A bucket holds up to **N tokens**, and starts full.
- Tokens are added back at a fixed **refill rate** (e.g. 10 tokens/second), up to the bucket's capacity.
- Every incoming request must remove one token to proceed; if the bucket is empty, the request is rejected (or queued).

\`\`\`python
class TokenBucket:
    def __init__(self, capacity, refill_rate_per_sec):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate_per_sec
        self.last_refill = time.now()

    def allow_request(self):
        now = time.now()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
\`\`\`
The key property interviewers like to hear named: token bucket naturally allows **short bursts** up to the bucket's full capacity, while still enforcing a steady long-run average rate — which matches how real traffic actually behaves (bursty, not perfectly smooth).

## Leaky Bucket
A close relative that forces a *smooth, constant* output rate: requests fill a bucket (queue) of fixed size, and the bucket "leaks" (processes) requests at a fixed rate regardless of how bursty the input was. If the bucket overflows, new requests are dropped. Where token bucket allows bursts through immediately, leaky bucket smooths bursts out into a steady trickle — useful when the downstream system genuinely cannot handle bursts at all (e.g. hardware with a hard fixed processing rate).

## Sliding Window
Fixed windows (e.g. "100 requests per calendar minute") have a well-known edge case: a client can send 100 requests in the last second of one minute and another 100 in the first second of the next — 200 requests in under 2 seconds, technically compliant with a "100/minute" rule. A **sliding window** algorithm fixes this by looking back over a continuously moving window (the last 60 seconds, ending *now*, not aligned to the clock) rather than a fixed bucket.

\`\`\`python
# Sliding window log (conceptually simplest version)
def allow_request(request_log, now, window_seconds=60, max_requests=100):
    cutoff = now - window_seconds
    request_log[:] = [t for t in request_log if t > cutoff]  # drop old entries
    if len(request_log) < max_requests:
        request_log.append(now)
        return True
    return False
\`\`\`
A pure sliding-window-log is precise but memory-heavy at scale (storing every timestamp); production systems often use **sliding window counters** — a hybrid that keeps counts for the current and previous fixed window and weights them proportionally — to get sliding-window accuracy at fixed-window memory cost.

## Comparing the Approaches
| Algorithm | Allows bursts? | Smooths output? | Memory cost |
|---|---|---|---|
| Fixed Window | Yes, at window edges (the boundary flaw) | No | Lowest |
| Sliding Window Log | No — precise | N/A (measures, doesn't shape) | Highest |
| Sliding Window Counter | Slightly, approximated | N/A | Low-moderate |
| Token Bucket | Yes, up to bucket size | No | Low |
| Leaky Bucket | No | Yes — constant output rate | Low |

## Where and How It's Applied
- **Per-IP:** protects against anonymous abuse but breaks down behind shared NATs/proxies where many real users share one IP.
- **Per-user / per-API-key:** the standard approach for authenticated APIs — fair, and doesn't punish innocent users sharing infrastructure.
- **Global limits:** protecting the system as a whole (e.g. "no more than 10,000 requests/sec system-wide") regardless of per-client attribution, as a last line of defense.
- **Response on rejection:** conventionally an HTTP **429 Too Many Requests**, often with a \`Retry-After\` header telling the client (which should respect it and back off — see **Retry**) when it's safe to try again.

## Practical Takeaway
When asked to design a rate limiter, name **token bucket** as the default (it's the industry-standard answer, used by Stripe's and AWS's own public APIs) because it elegantly balances allowing legitimate bursts with enforcing a real long-term cap — then mention sliding window as the fix for fixed-window's boundary-burst flaw if the interviewer pushes on precision. Always place it at the edge (API Gateway) so rejected requests never even reach — and waste capacity on — the backend.
	`
	}
};
