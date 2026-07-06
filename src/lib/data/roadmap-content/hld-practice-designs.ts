import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - URL Shortener
  // - Instagram
  // - WhatsApp
  // - Uber
  // - YouTube
  // - Netflix
  // - Twitter/X
  // - Dropbox
  // - Google Drive
  // - Chat Application
  // - Notification Service
 */
export const HldPracticeDesignsContent: RoadmapDetailMap = {
	'URL Shortener': {
		definition:
			'A service that converts long URLs into short, unique aliases and redirects visitors from the short alias back to the original URL.',
		useCase:
			'The classic warm-up system design question, used to test estimation skills, data modeling, and how a candidate thinks about a read-heavy, high-availability service.',
		detailedMarkdown: `
# Design a URL Shortener

## 1. Clarify Requirements

**Functional requirements**
- Given a long URL, generate a short, unique alias (e.g. \`short.ly/aZ9kLp\`).
- Given a short alias, redirect the client to the original long URL.
- Allow (optionally) a user-supplied custom alias.
- Allow (optionally) a link expiration date.
- Track basic click analytics (optional, and must never slow down the redirect itself).

**Non-functional requirements**
- Very high availability — a dead redirect service breaks every link that was ever shared.
- Low redirect latency (this is on the critical path of someone's click, target well under 100ms).
- Extremely read-heavy: far more redirects happen than new links are created.
- Short codes should not be sequentially guessable if used for anything remotely sensitive.
- Uniqueness of every short code must be guaranteed — two long URLs can never collide on the same code.

## 2. Back-of-the-Envelope Estimation

Assume a moderately popular service:
- **New links created:** 500M new short URLs per month → 500,000,000 / 30 ≈ **17M/day** ≈ **~200 writes/sec** average.
- **Read:write ratio:** a typical assumption for link shorteners is around **100:1** (each link gets clicked many times, often right after being shared). That gives **1.7B redirects/day** ≈ **~20,000 reads/sec** average (peak traffic could be several times that).
- **Storage:** assume links are retained for 5 years. Each record is small — short code (7 bytes) + long URL (up to ~2KB, average closer to 100-500 bytes) + metadata (timestamps, owner, click count) ≈ **~500 bytes/record**.
  - Total records over 5 years: 17M/day × 365 × 5 ≈ **31B records**.
  - Total storage: 31B × 500 bytes ≈ **~15TB** — easily fits on commodity disks, but the *index* and cache footprint matter more than raw size.
- **Short code length:** using Base62 (a-z, A-Z, 0-9 = 62 characters), a 7-character code gives 62^7 ≈ **3.5 trillion** possible codes — comfortably more than 31B, with huge headroom for growth.

## 3. High-Level Design

\`\`\`text
                     ┌────────────────┐
Client  ── write ──▶ │  Load Balancer │
Client  ◀─ redirect ─│                │
                     └───────┬────────┘
                              │
                     ┌────────▼────────┐
                     │  App Servers    │   (stateless, horizontally scaled)
                     └───┬────────┬────┘
                         │        │
             ┌───────────▼──┐  ┌──▼────────────────┐
             │ Cache (Redis)│  │ ID / Key Generator │
             │ code -> URL  │  │ (pre-allocated ID  │
             └───────┬──────┘  │  ranges)           │
                     │         └──────────┬─────────┘
             ┌───────▼─────────────────────▼───────┐
             │      Key-Value Store (DB)            │
             │  short_code -> long_url, metadata     │
             └───────────────────────────────────────┘
\`\`\`

**Write path:** client submits a long URL → app server asks the Key Generator for the next unique ID → encodes it to a short code → writes \`{short_code, long_url}\` to the database → returns the short URL.

**Read path (redirect):** client hits \`short.ly/aZ9kLp\` → app server checks the cache first → on a cache hit, issues an HTTP redirect immediately → on a miss, reads from the database, populates the cache, then redirects.

## 4. Data Model

| Field | Type | Notes |
|---|---|---|
| short_code | string (PK) | 7-char Base62 code |
| long_url | string | original URL, indexed only if you need reverse lookups |
| created_at | timestamp | for TTL/expiry policies |
| expires_at | timestamp, nullable | optional expiration |
| owner_id | string, nullable | for authenticated users managing their own links |
| click_count | integer | updated asynchronously, not on the hot redirect path |

A key-value store (DynamoDB, Cassandra) fits naturally since access is always by exact key (the short code) — there is rarely a need for complex relational queries.

## 5. Deep Dive: Generating the Short Code

This is the one genuinely interesting problem in this system: **how do you turn a URL into a unique, compact code without a slow collision-check on every write?**

**Approach A — Hash-based.** Take MD5 or SHA-256 of the long URL, Base62-encode the digest, and take the first 7 characters. The problem: two different URLs can produce the same truncated hash prefix, so every write still needs a database read to check whether that code is already taken by a *different* URL, and if so, retry with a salt. That extra read-before-write round trip on every single write is the cost you pay for a "stateless" scheme.

**Approach B — Counter-based (the standard answer).** Maintain a globally unique, monotonically increasing integer ID (via a database auto-increment, or better, a distributed counter service that hands out ID *ranges* to each app server in batches of, say, 1,000 at a time, so servers rarely need to contend for the counter). Encode that integer to Base62. Because the integer is guaranteed unique by construction, **there is never a collision to check** — the write is a single, cheap insert.

**Worked example of the encoding:** encode integer ID = 125 into Base62.
- 125 ÷ 62 = 2, remainder 1 → digits (most significant first): [2, 1]
- Using the alphabet \`0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\` (index 0-9 = digits, 10-35 = lowercase, 36-61 = uppercase): index 2 → \`"2"\`, index 1 → \`"1"\`.
- So ID 125 encodes to \`"21"\`. Verify: 2×62 + 1 = 125. ✓

The same process scales up to 7 characters, comfortably covering 3.5 trillion IDs. This counter-based approach is why almost every production URL shortener uses a pre-allocated ID range rather than hashing — it trades a tiny bit of design complexity (the range-allocation service) for a zero-collision, single-write hot path.

## 6. Bottlenecks & Trade-offs

- **Hot links:** a small number of short codes get a disproportionate share of clicks (a link shared on the front page of a big site). A Redis cache in front of the database absorbs almost all of that traffic — see the dedicated **Cache** topic for cache-aside patterns and TTL strategy.
- **Counter service contention:** if every app server calls a single counter on every write, that counter becomes a bottleneck. Handing out ID ranges in batches (each server locally increments through its own batch before requesting another) turns a network round-trip per write into one round-trip per thousand writes.
- **301 vs 302 redirects:** a permanent (301) redirect lets browsers cache the redirect locally, cutting server load dramatically — but it also means the server never sees the click again, losing analytics accuracy. A 302 keeps every click hitting your servers, trading load for visibility. Most link shorteners use 302 specifically to preserve analytics.
- **Scaling storage:** once a single database node cannot hold the index, shard by a hash of the short code — see the **Sharding** topic for the general technique.

## Common Interview Follow-ups

- **How would you support custom aliases?** Treat them as a separate, first-class write path: check the requested alias for availability before insert, and store it in the same table — the counter-based path simply isn't used for that request.
- **How do you stop the service from shortening malicious/phishing URLs?** Check the destination against a blocklist or a service like Google Safe Browsing before creating the mapping, and re-check periodically since a URL can turn malicious after the link was already created.
- **How would you add click analytics without slowing down redirects?** Never write the analytics event synchronously on the redirect path. Fire an event onto a message queue and let a separate consumer aggregate click counts asynchronously.
		`
	},

	Instagram: {
		definition:
			'A photo and video sharing platform where users follow other accounts and see a personalized feed of their posts.',
		useCase:
			'Tests the candidate ability to reason about extreme read/write skew and design a timeline/feed system that scales to accounts with vastly different follower counts.',
		detailedMarkdown: `
# Design Instagram

## 1. Clarify Requirements

**Functional requirements**
- Upload a photo/video with a caption.
- Follow / unfollow other accounts.
- View a home feed showing posts from accounts you follow, generally newest-first.
- Like and comment on posts.
- View a user profile and their grid of posts.

**Non-functional requirements**
- High availability for both posting and feed viewing.
- Low-latency feed loads (target well under 200ms).
- Extremely read-heavy: feed views vastly outnumber posts created.
- Eventual consistency is acceptable for like/comment counters and feed propagation delay of a few seconds.
- Must gracefully handle "celebrity" accounts with tens of millions of followers.

## 2. Back-of-the-Envelope Estimation

- **Users:** 500M daily active users (DAU), each opening their feed ~5 times/day, each load fetching ~20 posts → 500M × 5 = **2.5B feed requests/day** ≈ **~29,000 QPS** average (peaks run several times higher).
- **Posts:** if ~5% of DAU post per day, that is 25M new posts/day ≈ **~290 writes/sec** average — note the roughly **100:1 read-to-write ratio**, the defining characteristic of this system.
- **Media storage:** assume 80% photos (~200KB after compression) and 20% video (~20MB average): 25M × 0.8 × 200KB ≈ 4TB, plus 25M × 0.2 × 20MB ≈ 100TB → **~104TB of new media per day**, held in object storage and served through a CDN.
- **Social graph:** 500M users × ~200 average follows each ≈ **100B edges** to store and query.

## 3. High-Level Design

\`\`\`text
Client ──upload──▶ Post Service ──▶ Object Storage (media) + Post metadata DB
                         │
                         └──publish "new post" event──▶ Message Queue
                                                             │
                                                   ┌─────────▼─────────┐
                                                   │  Fan-out Workers   │
                                                   └─────────┬─────────┘
                                                             │ push post_id
                                                   ┌─────────▼─────────┐
Client ──read feed──▶ Feed Service ◀───────────────│  Feed Cache (Redis)│
                                                   └────────────────────┘
\`\`\`

**Write path:** a new post is written to object storage + a metadata row, then a "new post" event is published. Fan-out workers consume that event and push the post ID into every follower precomputed feed list.

**Read path:** the Feed Service reads the requesting user precomputed list of post IDs straight out of the cache and hydrates each with post metadata — no expensive query-time joins across the follow graph for most users.

## 4. Data Model

| Entity | Key fields |
|---|---|
| Users | user_id, username, ... |
| Posts | post_id, user_id, media_url, caption, created_at, like_count |
| Follows | follower_id, followee_id, created_at |
| Feed cache | key = feed:{user_id} → sorted list of (post_id, timestamp), capped to ~last 1,000 entries |

## 5. Deep Dive: Fan-out on Write vs. Fan-out on Read

**Fan-out on write (push).** When a user posts, immediately push the post ID into every follower cached feed list. Reads become a trivial O(1) cache lookup. The failure mode: a celebrity with 80M followers triggers 80M writes for a single post. Even at a generous 50,000 writes/sec across the fan-out worker fleet, propagating one post would take 80,000,000 / 50,000 ≈ **1,600 seconds (~27 minutes)** — unacceptable, and it also wastes enormous write capacity fanning out to followers who may never even open the app that day.

**Fan-out on read (pull).** Store nothing precomputed. When a user requests their feed, query the latest posts from everyone they follow and merge by recency at request time. This avoids the celebrity write storm entirely, but shifts the cost onto the read path — which, remember, is hit roughly 100x more often than the write path — so every one of those 2.5B daily feed loads would need to query and merge across potentially hundreds of followed accounts.

**Hybrid (what Instagram and Twitter actually run).** Fan-out on write for the vast majority of accounts (most people have well under a few thousand followers, so pushing is cheap). For accounts above a follower-count threshold (say, 1M+), skip the push entirely — the Feed Service instead fetches that celebrity latest few posts directly at read time and merges them into the precomputed list on the fly. This turns a catastrophic write storm into a handful of extra cache reads per feed load, which is a far cheaper trade.

## 6. Bottlenecks & Trade-offs

- **Feed cache memory:** capping each user cached feed list to a bounded size (e.g. last 1,000 post IDs) keeps Redis memory usage predictable at hundreds of millions of users.
- **Sharding the cache:** feed lists are naturally partitioned by user_id using consistent hashing across Redis nodes — see the **Sharding** topic.
- **Media delivery:** photos/video are served from a CDN, never from origin app servers, keeping origin load essentially flat regardless of view volume.
- **Decoupled fan-out:** the fan-out step runs asynchronously off a message queue so posting stays fast even when the fan-out workers are temporarily behind — see **Message Queue** and **Event Driven Architecture**.

## Common Interview Follow-ups

- **How would you rank the feed instead of showing it strictly reverse-chronological?** Separate "candidate generation" (the fan-out list, which is cheap and broad) from "ranking" (a downstream scoring service, often ML-based, that reorders the candidates by predicted engagement before returning them).
- **How would you handle Stories that expire after 24 hours?** Reuse the same push fan-out mechanism, but write into a store with an automatic short TTL instead of the permanent feed store.
- **How do you avoid a thundering herd when millions of users merge the same celebrity latest post at read time?** Cache that celebrity latest N posts in a shared, heavily-read cache so every follower merge hits cache rather than a database.
		`
	},

	WhatsApp: {
		definition:
			'An end-to-end encrypted messaging service supporting 1:1 and group chats, delivery/read receipts, and offline message delivery at global scale.',
		useCase:
			'Tests the ability to design a real-time, connection-heavy system with strong delivery guarantees, and to reason about encryption and offline-user handling at massive scale.',
		detailedMarkdown: `
# Design WhatsApp

## 1. Clarify Requirements

**Functional requirements**
- Send and receive 1:1 and group text/media messages.
- Track delivery status: sent, delivered, and read receipts.
- Show online/last-seen presence.
- Deliver messages to a recipient once they reconnect, even if they were offline when sent.
- End-to-end encrypt message content so the server can never read it.

**Non-functional requirements**
- Extremely high availability — this is core communication infrastructure for billions of people.
- Low delivery latency, typically under a second for online recipients.
- Millions of concurrent, long-lived connections held simultaneously.
- Per-conversation message ordering.
- Durability: an unread message must never be silently lost.

## 2. Back-of-the-Envelope Estimation

- **Scale:** ~2B users, ~100B messages sent per day → 100,000,000,000 / 86,400 ≈ **~1.16M messages/sec** average, with peaks 3-5x that during regional peak hours.
- **Concurrent connections:** even if only ~30% of users are online at any given moment, that is **~600M concurrent persistent connections** globally. If a single event-loop-based connection server (historically Erlang/BEAM at WhatsApp) can hold roughly 1-2M idle sockets, that implies on the order of **300-600 connection servers** just to hold sockets, before any message processing.
- **Text storage:** average message ~100 bytes → 100B × 100 bytes = **~10TB/day** of text alone. Media is stored separately in object storage, with only a reference in the message record.
- **Offline buffer:** assume ~10% of messages are for a currently-offline recipient and must sit in an inbox for up to 30 days: 100B × 10% × 100 bytes × 30 ≈ **~30TB** held in a fast key-value offline store, not the primary message log.

## 3. High-Level Design

\`\`\`text
Client A ─(socket)─ Gateway A ──▶ Message Service ──▶ Session Directory (who holds B's socket?)
                                        │                        │
                                        │ online? ───────────────┘
                                        ▼
                              Gateway B ──(socket)──▶ Client B
                                        │
                                        └─ offline? ▶ Offline Inbox + Push Notification (APNs/FCM)
\`\`\`

**Flow:** A sends a message. Gateway A forwards it to the Message Service, which looks up where B currently is (which Gateway server, if any, holds B live socket). If B is online, the message is routed directly through that Gateway and an ack ("delivered") flows back to A. If B is offline, the message is durably enqueued in B's offline inbox and a push notification is triggered; on reconnect, B drains the inbox in order.

## 4. Data Model

| Entity | Key fields |
|---|---|
| Messages | message_id, chat_id, sender_id, content_ref, sent_at, status (sent/delivered/read), sequence_no |
| Chats | chat_id, participant_ids[] |
| Presence | user_id, status, last_seen_at, connected_server_id |

## 5. Deep Dive

**Delivery guarantees & receipts.** Each message carries a client-generated ID plus a per-chat monotonic sequence number, letting the client detect gaps or duplicate retries — this gives at-least-once delivery with idempotent client-side handling, which looks like exactly-once from the user perspective. Three states are tracked — **sent** (server accepted it), **delivered** (recipient device acknowledged receipt over its socket), and **read** (recipient opened the chat) — and each transition is itself just a small message routed back to the sender, not a separate mechanism.

**End-to-end encryption, at a high level.** WhatsApp uses the Signal Protocol. Devices establish a shared secret via a key-agreement handshake (X3DH) the first time they contact each other, without ever transmitting that secret. Every subsequent message is encrypted with a per-message key derived through the Double Ratchet algorithm, which rotates keys after every message — so compromising one message key never exposes past or future messages (forward secrecy). Critically, the server only ever routes and stores opaque ciphertext plus routing metadata (sender, recipient, chat_id); it never sees plaintext content, which is exactly why the routing design above only cares about *where* to deliver a blob, never what is inside it.

## 6. Bottlenecks & Trade-offs

- **Group fan-out:** a message to a group of N members fans out to N inboxes, similar to Instagram fan-out-on-write — but WhatsApp caps group size, so this never approaches the "celebrity follower" scale problem.
- **Presence is cheap and lossy on purpose:** online/typing updates are extremely high-frequency and low-value if a single update is dropped, so they are typically broadcast best-effort without durable storage — unlike actual messages, which must never be silently dropped.
- **Connection servers are the real bottleneck:** solved historically by using a lightweight-process runtime (Erlang/BEAM) that can hold millions of idle sockets cheaply per box — see **Message Queue** / **Pub/Sub** for how the underlying routing backbone generalizes.

## Common Interview Follow-ups

- **How do you handle a user logged in on two devices?** Fan the message out to every active session/socket for that account, and sync read state across devices using the same per-conversation sequence numbers.
- **How would you scale group chats to thousands of members?** Beyond a certain size, switch from per-member fan-out to a pull/channel model closer to a Pub/Sub broadcast rather than direct per-socket delivery.
- **How do you avoid losing a message if a Gateway server crashes mid-delivery?** Never acknowledge to the sender until the message is durably persisted in the message log/offline store — a crashed Gateway then just means the recipient reconnects elsewhere and drains the same durable inbox.
		`
	},

	Uber: {
		definition:
			'A ride-hailing platform that matches riders with nearby available drivers in real time and tracks trips from request through completion.',
		useCase:
			'Tests geospatial indexing and real-time matching under tight latency constraints — a favorite for probing how candidates handle location data at scale.',
		detailedMarkdown: `
# Design Uber

## 1. Clarify Requirements

**Functional requirements**
- Rider requests a trip from a pickup to a drop-off location.
- System matches the rider with the nearest available, willing driver.
- Real-time GPS tracking of the driver en route to pickup and during the trip.
- Dynamic (surge) pricing based on local supply and demand.
- Trip lifecycle management: requested → matched → in-progress → completed.

**Non-functional requirements**
- Matching latency of a few seconds at most.
- High availability — a failed match request means a stranded rider.
- Ingest and index a continuous, high-volume stream of location updates.
- Naturally geographically partitioned: a match only ever needs nearby drivers, never a global scan.

## 2. Back-of-the-Envelope Estimation

- **Fleet:** assume ~1M drivers online concurrently at global peak, each app sending a GPS ping every 4 seconds → 1,000,000 / 4 = **~250,000 location updates/sec** ingested.
- **Location data volume:** each ping (driver_id, lat, lng, timestamp, heading) is roughly 100 bytes → 250,000 × 100 bytes ≈ **25MB/sec ≈ ~2.1TB/day** of raw location data.
- **Trip requests:** assume 5M trips/day → 5,000,000 / 86,400 ≈ **~58 match requests/sec** average, but map-browsing/ETA-preview queries (checking nearby cars before requesting) happen far more often — assume 10x that, **~580 queries/sec**.

## 3. High-Level Design

\`\`\`text
Driver App ──ping every 4s──▶ Location Ingestion (Kafka) ──▶ Geospatial Index (in-memory, cell-based)
                                                                        ▲
Rider App ──request trip──▶ Matching Service ─────k-ring lookup────────┘
                                   │
                                   ▼
                            Trip Service (state machine) ──▶ Pricing Service (surge)
\`\`\`

**Flow:** drivers continuously update their position in a fast, near-real-time geospatial index (not the durable trip database — that write volume is too high and too low-value per write). A rider requests a trip; the Matching Service converts the pickup point to the same cell system, looks up nearby available drivers, ranks by real ETA, and dispatches to the best candidate, falling back to the next-best on timeout or decline.

## 4. Data Model

| Entity | Key fields |
|---|---|
| Drivers | driver_id, status (online/offline/on_trip), current_cell_id, last_ping_at |
| Trips | trip_id, rider_id, driver_id, pickup_loc, dropoff_loc, status, requested_at, fare |
| Geo index (in-memory) | cell_id → set of driver_ids, kept out of the durable DB entirely |

## 5. Deep Dive: Geospatial Indexing for Nearest-Driver Search

A naive "scan every driver and compute distance" is O(N) per request — impossible at this scale. The real technique divides the map into cells and restricts every search to the rider's cell plus its immediate neighbors:

- **Geohashing** encodes (lat, lng) into a base32 string where each extra character narrows the region (e.g. \`"9q8yy"\` covers roughly a few hundred meters). Nearby points tend to share a prefix, letting you query "drivers whose geohash starts with 9q8y" as a cheap prefix scan. The weakness: cells are rectangular and distort near boundaries and the poles — two physically adjacent points can land on completely different prefixes right at a cell edge, so real systems must also check the ~8 neighboring cells, not just an exact prefix match.
- **Quadtrees** recursively subdivide the map into four quadrants only where driver density requires it — dense cities get many small cells while empty regions stay as one large cell, adapting index resolution to actual demand instead of wasting cells over the ocean.
- **Google's S2 / Uber's own H3** project the map onto hexagonal cells, which have the nice property that every neighboring cell is equidistant — a square grid distorts distance along diagonals versus edges. Uber open-sourced H3 specifically because hexagonal cells give materially more accurate "nearby" queries for ride matching than naive rectangular geohash cells.

**Worked example:** a rider's point maps to hex cell C. The Matching Service queries drivers in C plus its ring of ~6 neighboring hexagons (a "k-ring" search). If fewer than, say, 3 available drivers are found, it expands outward to the next ring. Only for that small resulting candidate set does it call a real routing service to compute actual road ETA — never straight-line distance, and never the whole city.

## 6. Bottlenecks & Trade-offs

- **Write-heavy, low-value-per-write pings:** 250,000 updates/sec at low individual importance is exactly the case for an in-memory index rather than a durable, transactional write — only trip state transitions need that stronger guarantee.
- **Regional sharding:** the geospatial index shards naturally along the same cell hierarchy used for lookups — a driver in Tokyo never needs comparing against a rider in Mexico City — see **Sharding**.
- **Surge pricing** needs near-real-time aggregation of supply/demand per cell, which is a natural fit for a streaming pipeline rather than querying the trip database directly — see **Event Driven Architecture** / **Message Queue**.

## Common Interview Follow-ups

- **What happens if the assigned driver does not respond in time?** The Matching Service times out (e.g. 10-15s), marks that driver skipped for this request, and re-dispatches to the next candidate from the same candidate set.
- **How do you avoid two riders being matched to the same driver at once?** An atomic "claim" operation (a conditional write or distributed lock keyed by driver_id) ensures only one in-flight match can hold a given driver at a time.
- **How would you show a live-updating driver icon on the rider map?** The rider app subscribes to that specific trip's location channel (WebSocket/long-poll) so the driver's periodic pings are pushed straight through, rather than the rider polling the geospatial index directly.
		`
	},

	YouTube: {
		definition:
			'A video platform that ingests user-uploaded video, transcodes it into multiple streamable formats, and serves playback globally via adaptive bitrate streaming.',
		useCase:
			'Tests understanding of large-scale media pipelines: chunked upload, parallel transcoding, and adaptive streaming under variable network conditions.',
		detailedMarkdown: `
# Design YouTube

## 1. Clarify Requirements

**Functional requirements**
- Upload a video, which gets transcoded into multiple resolutions/bitrates.
- Stream video to viewers, adapting quality to their network conditions.
- Browse/search videos and view basic metadata (title, view count, comments).

**Non-functional requirements**
- Massive storage and egress bandwidth requirements.
- Playback availability matters more than upload succeeding instantly — viewers must never be blocked by upload-time processing.
- Low startup latency and smooth playback despite variable network quality.
- Globally distributed viewership.

## 2. Back-of-the-Envelope Estimation

- **Upload volume:** a widely cited figure is roughly 500 hours of video uploaded per minute → 500 × 60 × 24 = **720,000 hours/day**.
- **Raw storage:** at an average upload bitrate of ~5Mbps (0.625MB/s), 720,000 hours × 3,600s × 0.625MB/s ≈ **~1.62PB/day** of raw uploaded video before transcoding. After generating ~5 renditions per video (240p through 1080p, with lower renditions much smaller than the original), total stored bytes land around **3-4PB/day**.
- **Viewing traffic:** assume 5B views/day; adaptive streaming pulls video as a series of small segment requests rather than one big file, so aggregate egress bandwidth is dominated by CDN edge traffic, not the origin.

## 3. High-Level Design

\`\`\`text
Uploader ──resumable upload──▶ Object Storage (raw video)
                                       │
                              ┌────────▼────────┐
                              │ Transcode Queue  │──▶ Worker Fleet (parallel per-chunk transcode)
                              └────────┬────────┘
                                       ▼
                         Renditions + Manifest (HLS/DASH) ──▶ CDN Edge Nodes
                                       │
Viewer ──fetch manifest──▶ Player ──fetch segments, switch rendition──▶ Nearest CDN Edge
\`\`\`

## 4. Data Model

| Entity | Key fields |
|---|---|
| Videos | video_id, owner_id, title, status (uploading/processing/ready/failed), duration |
| Renditions | video_id, resolution, bitrate, codec, cdn_url |
| Analytics | kept in a separate high-throughput event store, never the metadata DB |

## 5. Deep Dive

**The transcoding pipeline.** A Transcoding Coordinator splits the uploaded file into independent chunks (aligned to keyframe/GOP boundaries) that many workers can transcode in parallel, then reassembles them — this is what turns a multi-hour transcode into minutes rather than hours. Each worker produces the same content at several resolutions/bitrates (e.g. 1080p@8Mbps down to 240p@0.5Mbps) and codecs (H.264 for broad compatibility, VP9/AV1 for better compression on supporting devices). A video is marked "ready" and made visible as soon as its *lowest* rendition finishes, so uploaders and early viewers do not wait for every resolution to complete.

**Adaptive bitrate streaming (ABR).** Video is chopped into short segments (typically 2-10 seconds) at every rendition, described by a manifest (HLS \`.m3u8\` or MPEG-DASH \`.mpd\`) listing every available rendition and its segment URLs. The player continuously measures its own download throughput and buffer health, and independently chooses which rendition to request for the *next* segment — dropping to 360p when the network degrades, stepping back up to 1080p when it recovers — without ever interrupting playback, because each segment is self-contained and independently decodable. This is why playback rarely stalls outright on a flaky connection: quality is silently traded for continuity instead.

## 6. Bottlenecks & Trade-offs

- **Origin bandwidth:** would be crushed if every view hit it directly. Nearly all viewing traffic is served from CDN edge caches near the viewer, with the origin only supplying cache misses on unpopular or brand-new content — see **Cache** / **Object Storage**.
- **Bursty transcoding load:** uploads spike around evenings/weekends, so the worker fleet autoscales and jobs queue rather than process synchronously on upload.
- **Long-tail storage:** rarely-watched videos are moved to cheaper, colder storage tiers, while popular/trending videos are aggressively edge-replicated.

## Common Interview Follow-ups

- **How would you support live streaming rather than uploaded video?** The same ABR/segment model, but segments are produced in near-real-time (a few seconds each) as the stream arrives, with a short "live edge" delay instead of the whole file existing upfront.
- **How do you avoid re-transcoding the same video uploaded twice?** Hash the raw upload's content and check for an existing matching video before re-transcoding — the same content-addressable idea used for deduplication elsewhere (see the Dropbox entry).
- **How do you update view counts without hammering the DB on every view?** Buffer view events onto a queue and batch-increment counters asynchronously rather than a synchronous write per view.
		`
	},

	Netflix: {
		definition:
			'A subscription video streaming service that serves a pre-transcoded catalog to a global audience, personalized per profile via recommendation ranking.',
		useCase:
			'Tests reasoning about resilient microservice architecture and offline personalization pipelines, plus the CDN/egress trade-offs of massive video streaming.',
		detailedMarkdown: `
# Design Netflix

## 1. Clarify Requirements

**Functional requirements**
- Browse a catalog with personalized, ranked home-page rows.
- Stream video with adaptive quality.
- Resume playback across devices (phone, TV, laptop).
- Search the catalog.

**Non-functional requirements**
- Extremely high availability — Netflix popularized designing for the assumption that something is always failing.
- Low-latency, globally distributed streaming.
- Personalization at scale, computed for hundreds of millions of profiles.
- Graceful degradation: a failing subsystem (say, ratings) must never take down playback.

## 2. Back-of-the-Envelope Estimation

- **Subscribers:** ~300M subscribers; assume 200M daily active viewers.
- **Egress bandwidth:** average watch session ~1 hour at ~4Mbps (mixed SD/HD/4K): 200M × 3,600s × 0.5MB/s (4Mbps ≈ 0.5MB/s) ≈ **~360PB/day** of video egress. This single number explains why Netflix built and largely runs its own CDN (Open Connect) with appliances placed directly inside ISP networks, rather than paying third-party CDN egress at that volume.
- **Catalog size:** tens of thousands of titles — small and mostly fixed compared to a user-generated platform, which is exactly why Netflix can afford to exhaustively pre-transcode its whole catalog into every rendition ahead of time, unlike YouTube.

## 3. High-Level Design

\`\`\`text
Client ──▶ API Gateway ──▶ Home Page Assembly ──▶ (parallel calls) Recommendation, Metadata, Member services
                                                              │
                                                    each service owns its own datastore
                                                              │
Client ◀──── actual video bytes ──── Open Connect CDN (inside ISPs, not the microservices)
\`\`\`

Netflix decomposes the product into hundreds of independently deployable microservices (Playback, Recommendation, Member/Profile, Search, ...), each owning its own datastore. The video bytes themselves never pass through these services at all — they are served directly by CDN appliances embedded inside ISP networks.

## 4. Data Model

| Entity | Key fields |
|---|---|
| Titles | title_id, metadata, available_renditions |
| Members | member_id, plan, profiles[] |
| ViewingHistory | member_id, title_id, position, device, watched_at |
| PersonalizationRows | profile_id, row_type, ranked_title_ids — precomputed, periodically refreshed |

## 5. Deep Dive

**Microservices & resilience.** Decomposing the product into independently deployable services means a failure or slow deploy in one (say, the ratings service) never has to take down playback. To make that safe in practice, Netflix helped popularize two now-industry-standard patterns: a **circuit breaker** (historically Hystrix) that stops calling a failing downstream service and returns a fast, generic fallback instead of hanging the whole request; and **Chaos Engineering** (Chaos Monkey) — deliberately killing production instances at random to force every team to prove their service degrades gracefully rather than assume failures are rare. The underlying design principle: a page composed of 30 parallel service calls should never fail entirely because one of the 30 timed out — playback must keep working even if personalization or search is degraded.

**Personalization off the hot path.** Ranking "what should this profile see" is compute-heavy — ML models running over huge viewing-history datasets — so it is never computed synchronously on page load. An offline/batch plus streaming pipeline continuously recomputes each profile's row rankings and writes the result into a fast precomputed store; the live Home Page Assembly service only ever does cheap reads of already-ranked lists. This is the same "precompute the expensive part off the hot path" idea as Instagram's fan-out-on-write feed cache.

## 6. Bottlenecks & Trade-offs

- **Egress dominates cost:** placing CDN cache appliances physically inside ISPs' networks turns a long, congested public-internet hop into a short local one, which is the entire reason Open Connect exists.
- **Personalization staleness is an accepted trade-off:** a home page can be hours out of date rather than perfectly real-time, because recomputing rankings synchronously for 300M users on every load is infeasible.
- Cross-reference **Microservices** and **Circuit Breaker** for how these resilience patterns generalize well beyond Netflix specifically.

## Common Interview Follow-ups

- **How would you handle a title suddenly becoming massively popular (a new season drop)?** Pre-warm CDN caches ahead of the release window, since the spike is predictable rather than reactive.
- **How do you keep "resume playback position" in sync across devices?** Write the position asynchronously and frequently to a fast per-member store keyed by title, and have each device pull the latest position on app open, tolerating brief staleness.
- **Why can Netflix pre-transcode its entire catalog while YouTube cannot?** Netflix's catalog is small and mostly fixed, so exhaustive upfront transcoding is cheap relative to view volume; YouTube's catalog grows by hundreds of hours a minute, making that uneconomical for the rarely-watched long tail.
		`
	},

	'Twitter/X': {
		definition:
			'A microblogging platform where users post short public messages and see a timeline aggregated from the accounts they follow.',
		useCase:
			'Tests the same feed fan-out problem as Instagram, plus the added twist of retweets and an extremely skewed, power-law follower graph.',
		detailedMarkdown: `
# Design Twitter/X

## 1. Clarify Requirements

**Functional requirements**
- Post a tweet (short text plus optional media).
- Follow/unfollow accounts.
- View a home timeline aggregated from followed accounts.
- Retweet/quote-tweet, like, and reply.
- Search and trending topics (secondary, often treated as a separate subsystem).

**Non-functional requirements**
- Extremely read-heavy with very low-latency timeline loads.
- Must tolerate an extreme power-law skew in follower counts (some accounts have 100M+ followers).
- Third-party API/firehose consumers need independent rate limiting so they cannot degrade the product for everyone else.

## 2. Back-of-the-Envelope Estimation

- **Tweet volume:** roughly 500M tweets/day → 500,000,000 / 86,400 ≈ **~5,800 tweets/sec** average, with historical spikes into the tens of thousands/sec during major live events.
- **Timeline reads:** assume 250M DAU checking their timeline ~10x/day, each pulling ~20 tweets → 2.5B timeline requests/day ≈ **~29,000 QPS** average — a read:write ratio in the hundreds-to-one range once deeper scrolling is counted.
- **Raw text volume is tiny:** ~300 bytes/tweet × 500M/day ≈ **~150GB/day** of text — the real cost driver is attached media plus the fan-out index structures, not the tweets themselves.
- **Follower graph is heavily skewed:** median account has a couple hundred followers; the largest have 100M+ — this power-law shape is exactly what drives the fan-out design below.

## 3. High-Level Design

This mirrors Instagram's feed architecture, since it is the same underlying problem:

\`\`\`text
Client ──post──▶ Tweet Service ──publish event──▶ Fan-out Service ──push tweet_id──▶ Follower Timeline Caches
                                                                              │
Client ◀──read timeline── Timeline Service ◀── merge in "too big to fan out" authors at read time
\`\`\`

## 4. Data Model

| Entity | Key fields |
|---|---|
| Tweets | tweet_id, author_id, text, media_refs, created_at, retweet_of_id (nullable) |
| Follows | follower_id, followee_id |
| Timeline cache | per-user list of tweet_ids, capped to roughly the last 800 entries |

## 5. Deep Dive: Fan-out at This Scale, Plus What Retweets Add

The core problem is identical to Instagram's feed: **push** (fan-out on write) gives O(1) reads but becomes a write storm for huge accounts; **pull** (fan-out on read) avoids the storm but makes every timeline read expensive; the real system runs a **hybrid**, split by a follower-count threshold — see the Instagram entry for the full push/pull mechanics.

Twitter's added wrinkle is retweets. A retweet is not new content — it is a pointer to an existing tweet_id plus a new "retweeted_by" edge — but it must still fan out to the retweeter's own followers exactly like an original tweet. The fan-out worker therefore propagates a lightweight *reference* object, not a content copy, so a retweet's storage cost stays near zero even though its fan-out cost matches a fresh tweet. The worst case for the naive push model is a huge account retweeting another huge account — handled by the same "skip the push, merge at read time" rule applied per-author, regardless of whether the content is original or a retweet.

## 6. Bottlenecks & Trade-offs

- **The fix for a fan-out bottleneck is usually to avoid the fan-out, not to speed it up.** A viral tweet from a massive account is handled by *not writing at all* on the push side, letting the pull-side merge absorb it instead — this is the single biggest lesson from this system.
- **Search/trending needs its own pipeline:** a near-real-time indexing job consumes the same tweet event stream via a message queue, since a timeline-shaped store is not built for full-text search or trend aggregation.
- **Firehose/API rate limiting is a separate concern from user timelines:** third-party consumers are managed with per-client token-bucket rate limiting so one heavy integration cannot degrade service for everyone else — see **Rate Limiter**.

## Common Interview Follow-ups

- **How would you implement trending topics?** A separate streaming aggregation job counts hashtag/term frequency over a sliding time window, fully decoupled from the timeline-serving path.
- **How do you keep a blocked account's tweets out of a timeline?** Filter at read time against a small, cacheable block-list rather than retroactively scrubbing every historical fan-out write.
- **How would you rate-limit the public firehose per developer app?** Token-bucket counters per API key in a shared fast store (Redis), rejecting or queueing requests once the bucket empties, replenished at a fixed rate.
		`
	},

	Dropbox: {
		definition:
			'A file storage and sync service that keeps files consistent across a user devices, using chunking and content-addressable storage to sync efficiently.',
		useCase:
			'Tests understanding of efficient delta sync, content-addressable deduplication, and how to resolve conflicting concurrent edits without silently losing data.',
		detailedMarkdown: `
# Design Dropbox

## 1. Clarify Requirements

**Functional requirements**
- Upload/sync files and folders across multiple devices.
- Share files/folders with other users.
- Keep version history.
- Work offline, syncing automatically once reconnected.
- Handle large files efficiently — do not re-upload the whole file for a one-line change.

**Non-functional requirements**
- Strong consistency for a single user's own files — no silently losing or overwriting edits.
- Bandwidth efficiency: sync only what actually changed.
- Durability above all else — this is a storage product; losing user data is the worst possible failure.
- Scale to billions of files across hundreds of millions of accounts.

## 2. Back-of-the-Envelope Estimation

- **Storage:** assume 700M registered users, averaging ~5GB of actively-used data each → 700M × 5GB ≈ **~3.5PB** just from average active usage (real-world numbers span into the exabyte range once every tier and inactive account is counted, but this is the right order-of-magnitude reasoning).
- **Sync events:** assume 100M active users make ~20 sync-worthy changes/day → **2B change events/day** ≈ **~23,000/sec** average.
- **Why delta sync matters:** the average changed file might be several MB, but the average *edit* touches only a few KB. Uploading the entire file on every save instead of just the changed bytes would multiply required bandwidth by 100-1000x — this gap is the entire reason the system is designed the way it is below.

## 3. High-Level Design

\`\`\`text
Local filesystem change
        │
        ▼
Sync Client ──chunk into ~4MB blocks──▶ Metadata Service (which blocks make up this file version?)
        │                                       │
        └──upload only new blocks──▶ Block Storage (content-addressable, keyed by hash)
                                                │
Other devices ◀── lightweight "something changed" notification ── Notification Service
        │
        └──ask metadata what changed──▶ pull only the missing blocks
\`\`\`

## 4. Data Model

| Entity | Key fields |
|---|---|
| Files | file_id, owner_id, path, current_version_id |
| FileVersions | version_id, file_id, created_at, ordered list of block_hashes |
| Blocks | block_hash (PK), size, storage_ref, ref_count |
| Shares | file_id, shared_with_user_id, permission |

## 5. Deep Dive

**Chunking & content-addressable deduplication.** Instead of storing a file as one blob, Dropbox splits every file into fixed-size chunks (roughly 4MB) and stores each chunk keyed by the SHA-256 hash of its content. Two large wins fall out of this: (1) **cross-user deduplication** — if a million accounts have the exact same PDF or installer, every one of those chunks hashes identically and is physically stored exactly once, tracked with a reference count; (2) **delta sync** — editing one paragraph in a large document only changes the hash of the chunk(s) covering that byte range, so the sync client re-uploads just those changed chunks, and the new version's block list simply mixes old, already-stored chunk references with the handful of newly uploaded ones. A 500MB file with a tiny edit can sync in kilobytes, not megabytes.

**Sync conflict resolution.** Two devices can edit the same file offline and reconnect later with conflicting changes. Dropbox detects this by comparing the parent version each device thought it was building on — if device A and device B both branched off version 5 and independently produced two different version 6's, that is a genuine conflict, not a simple sequential update. Rather than silently picking a winner and destroying data, the system keeps *both*: the conflicting version is written as a separate file (the familiar "filename (conflicted copy from device X).ext"), and the user manually reconciles. Correctness and no-data-loss win over guessing intent, because bytes alone cannot reveal intent.

## 6. Bottlenecks & Trade-offs

- **The Notification Service is deliberately thin:** millions of idle long-lived connections carrying no payload — just "go check metadata" — pushes the actual data-transfer cost onto a pull path that can be parallelized, retried, and resumed per block.
- **Block storage has no cache-invalidation problem:** because content-addressable data is immutable once hashed, it can be freely replicated and cached without ever going stale — unlike almost every other cache in this app.
- **Metadata Service is the one place needing strong consistency:** two devices must never both believe they hold the "current" version pointer — see **Consistency** / **Leader-Follower** for how a single source of truth is typically enforced per file.

## Common Interview Follow-ups

- **How do you avoid re-scanning an entire large file on every save to find changed chunks?** Use a rolling hash (the same idea behind rsync) so chunk boundaries can be found incrementally without re-reading the file from the start.
- **How do you handle a user offline for weeks who returns with many changes?** Queue changes locally and sync incrementally against the latest known server version rather than requiring a full resync.
- **How would you support a team folder shared by thousands of people?** Shard metadata by folder/team rather than by individual file, and rate-limit the notification fan-out similarly to the group-chat fan-out problem.
		`
	},

	'Google Drive': {
		definition:
			'A cloud file storage service that additionally supports real-time collaborative editing of native documents by multiple simultaneous users.',
		useCase:
			'Builds on the Dropbox-style sync problem but tests a distinct skill: reasoning about concurrent, low-latency multi-user edits without losing keystrokes.',
		detailedMarkdown: `
# Design Google Drive

## 1. Clarify Requirements

**Functional requirements**
- Store and sync files/folders, with sharing and viewer/commenter/editor permissions.
- Real-time collaborative editing of native documents (Docs/Sheets/Slides) by multiple simultaneous users.
- Version history and comments.

**Non-functional requirements**
- Strong consistency for concurrent edits — no lost keystrokes, ever.
- Sub-second propagation of edits to every other open collaborator.
- The same durability/availability bar as any storage product.

## 2. Back-of-the-Envelope Estimation

- **Users:** assume 500M weekly active editors; a busy shared document might have 10-50 concurrent editors during a live session.
- **Edit rate:** each keystroke is a small edit operation, not a whole-document save. A fast typist produces an edit roughly every 100-300ms; with 50 concurrent editors in one document, that document's edit stream can hit **150-500 operations/sec**, which must be merged and broadcast to every other open client in well under a second to feel "live."
- **Storage shape:** plain file sync (PDFs, images, videos) follows the same order-of-magnitude estimation as Dropbox — chunked, deduplicated block storage dominates total bytes. Collaborative documents are tiny in bytes but demanding in latency and correctness — the opposite trade-off.

## 3. High-Level Design

For plain file storage/sync, this is the same architecture as Dropbox — chunking, content-addressable blocks, a metadata service, and a lightweight notification channel — see that entry rather than repeating it here. The differentiator is the collaborative-editing path:

\`\`\`text
Client ──keystroke as small op──▶ Collaboration Service (authoritative in-memory session for this doc)
                                            │
                             transform/merge against concurrent ops
                                            │
                                broadcast merged op to every other
                                     connected client
                                            │
                             periodic checkpoint ──▶ durable file storage
\`\`\`

## 4. Data Model

| Entity | Key fields |
|---|---|
| Documents | doc_id, owner_id, current_content_ref |
| DocumentSessions | doc_id, active_user_ids[], server_id holding the session |
| Operations log | doc_id, op_id, author_id, op_type (insert/delete/format), position, content, applied_at |

Full document snapshots are only taken occasionally as checkpoints; the operation log is what actually gets merged and broadcast.

## 5. Deep Dive: Real-Time Collaborative Editing (OT / CRDTs)

The core problem: two people can edit the same position at nearly the same instant, and every client must converge on an identical final document without a central lock forcing people to take turns (which would defeat the point of "real-time").

**Operational Transformation (OT)** — conceptually what Google Docs uses. Every edit is expressed as an operation, e.g. "insert 'x' at position 5". When an operation arrives that was generated concurrently with one already applied, the server transforms the incoming operation's position against the one already applied, so applying it afterward still yields the correct combined result. **Worked example:** the document is "AC". User 1 inserts "B" at position 1, intending "ABC". Concurrently, User 2 — still looking at "AC" — deletes the character at position 0, intending to remove "A". If User 2's delete is applied to the *already-updated* "ABC" without transformation, it must be shifted to account for User 1's insert (an insert before a position shifts later positions right; a delete before a position shifts them left), or the wrong character gets removed. OT's transform functions exist precisely to make operations generated against an older document state still land correctly against the current state, in either arrival order. This requires a central, order-establishing authority — which is why OT systems are naturally server-centric, fitting a client-server product like Docs well.

**CRDTs (Conflict-free Replicated Data Types)** — a more decentralized alternative. Instead of transforming operations against each other, each edit carries enough metadata (e.g. a unique, ordered identifier per character) that operations can be applied in *any* order, on *any* replica, without a central sequencer, and are mathematically guaranteed to converge. This trades extra per-element metadata overhead for the ability to merge independently in peer-to-peer or offline-first scenarios without one always-available server deciding order — the approach used by tools like Figma's multiplayer engine.

**Interview-level takeaway:** OT needs a server to establish canonical operation order (simpler to reason about, fits a centralized product); CRDTs push convergence logic into the data structure itself so replicas merge independently (fits decentralized or offline-tolerant products).

## 6. Bottlenecks & Trade-offs

- **The Collaboration Service is stateful, not a typical stateless REST server:** it holds authoritative in-memory session state for every actively-edited document, so it is naturally sharded by doc_id — closer to the Chat Application's connection-gateway problem than to a normal CRUD service.
- **Periodic checkpoints bound the blast radius of a crash:** losing the Collaboration Service loses at most the operations since the last checkpoint, not the whole document.
- Cross-reference **Chat Application** for the same "stateful session lives on one server, needs a directory lookup" pattern, and **Dropbox** for the file storage/sync/versioning mechanics this entry deliberately does not repeat.

## Common Interview Follow-ups

- **What happens if two users edit offline and later reconnect?** The client replays its local operation log against the server's current state; the same OT/CRDT merge logic handles reconciliation, just delayed.
- **How would you show other users' live cursors/selections?** A separate, low-durability, best-effort broadcast channel piggybacking on the same session connection — distinct from the durable operation log.
- **How do you keep version history without storing a full copy per keystroke?** Checkpoint full snapshots infrequently and reconstruct any intermediate state by replaying the operation log from the nearest earlier checkpoint.
		`
	},

	'Chat Application': {
		definition:
			'The generic real-time messaging backbone behind products like WhatsApp and Slack: connection management, ordering, presence, and group fan-out as reusable building blocks.',
		useCase:
			'Tests the fundamentals of stateful, connection-heavy systems independent of any one product, which is exactly what interviewers probe when the question is phrased generically.',
		detailedMarkdown: `
# Design a Chat Application

## 1. Clarify Requirements

**Functional requirements**
- Send/receive messages in 1:1 and group conversations.
- Maintain online/offline presence.
- Deliver read receipts.
- Preserve message order within a conversation.
- Support group chat with N members.

**Non-functional requirements**
- Low end-to-end latency.
- Millions of concurrent, mostly-idle persistent connections held simultaneously.
- Ordering guarantees are per-conversation, not global.
- Horizontal scalability of the connection-holding tier.

## 2. Back-of-the-Envelope Estimation

- **Concurrent connections:** assume 20M concurrent connected users, each idle connection consuming roughly 10-50KB of server memory (socket buffers plus minimal session state) → 20M × 30KB ≈ **~600GB of RAM** just to hold idle connections across the fleet — this number, not CPU, is what drives how many connection-gateway servers you need.
- **Fleet sizing:** if one event-loop-based gateway server (Node.js/Netty/Erlang-style) can hold ~500k-1M idle sockets, 20M connections needs on the order of **20-40 gateway servers** just for holding sockets, before any message-processing load is added.
- **Message volume:** assume 50M messages/hour at peak ≈ **~14,000 messages/sec** — each requiring a directory lookup (which server holds the recipient's socket?) and a routed forward, not a broadcast, for 1:1 chat.

## 3. High-Level Design

\`\`\`text
Client ──(persistent socket)── Gateway Server ──register "user -> this gateway"──▶ Session Directory (Redis)
                                     │
Message Router ──lookup recipient's gateway──▶ Session Directory
     │
     └──forward──▶ recipient's Gateway ──(socket)──▶ Recipient
     │
     └──persist first──▶ Message Store (durable, before considered "sent")
\`\`\`

## 4. Data Model

| Entity | Key fields |
|---|---|
| Conversations | conversation_id, type (1:1/group), member_ids[] |
| Messages | message_id, conversation_id, sender_id, content, sent_at, sequence_no |
| SessionDirectory | user_id → gateway_server_id, connected_at (ephemeral, in a fast KV store) |

## 5. Deep Dive

**Connection management at scale.** The fundamental shift from a normal stateless REST service is that a gateway server is *stateful* — it physically owns a live TCP/WebSocket connection, so "which server is user X connected to right now" is real information that must live somewhere shared (the Session Directory) and be consulted on every inbound message for that user. Losing a gateway server means every client it held must reconnect (typically with automatic client-side reconnect and exponential backoff) and re-register in the directory — which is exactly why gateways are kept as close to stateless as possible beyond the socket itself: no important data should live only in a gateway's process memory.

**Ordering and delivery guarantees.** Within a single conversation, order matters — a reply should never render before the message it replies to; across different conversations, no ordering guarantee is needed. This is solved with a per-conversation monotonic sequence number assigned when the Message Store durably persists the message, not when the client sends it, since network delays mean two messages can arrive at the server in a different order than they were typed. Clients render messages sorted by sequence_no and can detect a gap (they have sequence 5 and 7 but not 6) to know they need to re-sync rather than silently rendering out of order. Delivered/read receipts are modeled as just another small, ordered event in the same per-conversation stream — not a separate mechanism (see the WhatsApp entry).

## 6. Bottlenecks & Trade-offs

- **Group fan-out must be bounded:** a message fans out to every member's gateway, so an unbounded group size turns one message into unbounded deliveries — nearly every real system caps group size specifically to keep this fan-out bounded, avoiding the same write-storm problem Instagram/Twitter solve differently for their much larger "follower" fan-out.
- **Presence is high-frequency and low-stakes:** online/typing updates are typically delivered best-effort without durable storage, in contrast to messages, which must never be silently dropped.
- **The Session Directory is a hot, frequently-read/written store** and a natural single point of contention if not sharded — see **Sharding** and **Pub/Sub** for how the routing backbone typically scales.

## Common Interview Follow-ups

- **How would you support a user connected from multiple devices at once?** The Session Directory maps a user to a *set* of gateway connections, not just one, and the router delivers to all of them, syncing read state via the same sequence numbers.
- **How do you avoid a thundering herd of reconnects when a gateway restarts?** Stagger client reconnect attempts with jittered exponential backoff, spreading reconnecting clients across the remaining fleet rather than hammering one replacement instance.
- **How would you add typing indicators without adding load to the durable message path?** Route them through the same gateway/router path but mark them ephemeral/non-persisted, exactly like presence updates.
		`
	},

	'Notification Service': {
		definition:
			'A generic, queue-based service that fans a triggering event out to one or more delivery channels (push, SMS, email, in-app) on behalf of any internal system.',
		useCase:
			'Tests understanding of decoupling and asynchronous fan-out — the reusable building block sitting behind almost every other product in this list.',
		detailedMarkdown: `
# Design a Notification Service

## 1. Clarify Requirements

**Functional requirements**
- Accept a notification request from any internal service (order shipped, new follower, new message).
- Deliver via the right channel(s): push, SMS, email, in-app.
- Respect per-user channel preferences and opt-outs.
- Avoid duplicate or spammy delivery.

**Non-functional requirements**
- High-throughput fan-out — a single event can target millions of users.
- Decoupled from triggering services: a notification failure must never fail the business operation that triggered it.
- At-least-once delivery with deduplication — occasional retries are acceptable, silent drops are not.
- Respect third-party provider rate limits (APNs/FCM/SMS gateways).

## 2. Back-of-the-Envelope Estimation

- **Volume:** assume a platform with 200M users and 500M individual notification-send events/day → 500,000,000 / 86,400 ≈ **~5,800/sec** average, with bursts to hundreds of thousands/sec during a mass campaign or broadcast.
- **Channel throughput mismatch:** push (APNs/FCM) can sustain very high throughput; SMS gateways are comparatively rate-limited (often just hundreds to low thousands/sec per provider account); email is similarly throttled for reputation reasons. This mismatch is exactly why a queue sits between "event happened" and "provider API call" — so ingestion is never limited by the slowest channel's ceiling.

## 3. High-Level Design

\`\`\`text
Any Service ──publish event──▶ Message Queue ──▶ Notification Orchestrator
                                                          │
                                              lookup UserPreferences
                                                          │
                              ┌───────────────┬───────────┴────────┐
                              ▼               ▼                    ▼
                        Push Queue       SMS Queue            Email Queue
                              │               │                    │
                       Push Workers      SMS Workers          Email Workers
                        (APNs/FCM)     (rate-limited)       (rate-limited)
\`\`\`

**Flow:** a triggering service publishes one small event and returns immediately — it never waits on delivery. The Orchestrator looks up the user's preferences, expands the single logical notification into one job per enabled channel, and each channel-specific worker fleet (sized to match its own provider's real throughput ceiling) calls the relevant third-party gateway.

## 4. Data Model

| Entity | Key fields |
|---|---|
| NotificationRequests | request_id, source_service, user_id/audience_query, template_id, payload, dedup_key |
| UserPreferences | user_id, channel, opted_in, quiet_hours |
| DeliveryLog | request_id, channel, status, provider_message_id, attempt_count |

## 5. Deep Dive

**Queue-based fan-out decoupling.** The single most important property here is that the service raising the event is fully decoupled from delivery — it writes one small message to a queue and returns, regardless of whether the eventual push/SMS/email succeeds, retries, or takes 30 seconds because a third-party provider is slow. Without this, a degraded email provider could back up and eventually break unrelated operations (imagine checkout blocking because the order-confirmation email call is synchronous). The queue also naturally absorbs bursty fan-out: a mass campaign targeting millions of users becomes millions of queue messages consumed at whatever steady rate the downstream channel workers can sustain, rather than a synchronous spike that would overwhelm provider APIs instantly.

**Retries, deduplication, and idempotency.** Because the queue guarantees at-least-once delivery (a consumer can crash after calling the provider but before acknowledging the message, causing redelivery), every send must be idempotent or deduplicated, or users get double-notified. The standard fix is a dedup_key (a hash of user_id + template_id + a coarse time bucket, or an explicit idempotency key from the caller) checked against a short-TTL store before actually calling the provider — a repeat is silently dropped rather than re-sent. Transient provider failures (a momentary 5xx from APNs) are retried with exponential backoff up to a max attempt count, after which the notification is marked failed rather than retried forever; permanent failures (an invalid device token) are recorded and used to proactively clean up stale tokens instead of retrying something that will never succeed.

## 6. Bottlenecks & Trade-offs

- **Channel workers must be independently rate-limited:** over-driving a rate-limited SMS/email provider risks getting your sending reputation or IP throttled or blacklisted, so each worker pool enforces a token-bucket-style cap matching its provider's contracted limits — see **Rate Limiter**.
- **Preference lookups sit on the hot fan-out path for every notification,** so they are served from a cache in front of the Preference Service rather than hitting its primary store per send.
- **Audience expansion is the queue's job, not the caller's:** a broadcast targeting millions of recipients is expanded into individual per-user jobs asynchronously by the orchestrator, rather than the triggering service enumerating every recipient itself.

## Common Interview Follow-ups

- **How would you avoid pushing to a user who is actively looking at the app?** Check a live-presence signal (the same concept as the Chat Application entry) before dispatching the push channel specifically, while still recording the in-app notification.
- **How do you prevent spam when many events fire for the same user in a short window (e.g. 50 likes in a minute)?** Batch/debounce at the orchestrator, coalescing multiple triggering events into a single digest notification within a short window.
- **How would you support granular preferences (push for messages, email only for a weekly digest)?** Model preferences per (user, notification_type, channel) rather than a single global on/off, and have the orchestrator consult that specific combination when fanning out.
		`
	}
};
