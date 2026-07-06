import type { RoadmapDetailMap } from './types';

export const ProjectPreparationContent: RoadmapDetailMap = {
	'Explain Architecture': {
		definition:
			'Being able to describe, in plain language, how the major pieces of your project fit together and why you arranged them that way.',
		useCase:
			'Comes up in the first few minutes of a project walkthrough, usually right after "tell me about a project you built."',
		detailedMarkdown: `
# Explain Architecture

## Why interviewers ask this
This is almost always the opening question of a project deep-dive, and interviewers use it to filter fast. They are checking whether you actually understood the system you built or whether you just wired together whatever a tutorial told you to. A candidate who can draw the system from memory and explain *why* each piece exists signals ownership. A candidate who can only say "we used React and Node" signals that someone else made the real decisions.

## Framework for your answer
1. **Start from the request path, not the tech list.** Say it as a flow: client → API layer → business logic/services → database (and any external services). This forces you to think in terms of responsibility, not buzzwords.
2. **Name the stack briefly, attached to a role.** Don't just list technologies — say what each one is *for* ("Postgres for relational order data, Redis for session cache").
3. **Pick ONE deliberate architectural decision and defend it.** Interviewers remember specificity. Generic answers ("we used microservices for scalability") are a red flag; a decision tied to an actual constraint is not.
4. **Be ready to zoom in.** After the overview, expect "walk me through what happens when a user does X" — have one concrete request flow memorized end-to-end.

## Worked example
"Our food delivery app had three logical services behind an API gateway: an order service, a restaurant/menu service, and a delivery-tracking service, each with its own Postgres schema. The client talked to the gateway over REST, which routed to the right service and the delivery-tracking service also pushed live location updates over WebSockets. We split delivery-tracking out from order management specifically because it had a completely different load pattern — high-frequency small writes for GPS pings versus low-frequency transactional writes for orders — and coupling them was already causing lock contention on a single Postgres instance during a spike test."

## Common mistakes
- **Reciting the tech stack with no reasoning.** "We used Node, Express, React, MongoDB" tells the interviewer nothing about your thinking.
- **Describing the ideal architecture instead of the real one.** If you didn't build microservices, don't imply you did. Interviewers can tell when the story doesn't match probing questions.
- **Not knowing what a specific box in your own diagram actually does.** If you draw a "cache layer" you must be able to say what's cached, for how long, and why.
- **No answer for "why not the obvious alternative."** If you chose REST, know why not GraphQL; if you chose a monolith, know why not services (or vice versa).
- **Treating this as a one-way lecture.** Pause after the overview and let the interviewer steer — they're building toward a specific follow-up, and talking over it wastes your own time.
		`
	},

	'Explain Database Design': {
		definition:
			'Being able to name your core entities, their relationships, and justify at least one concrete schema or indexing decision.',
		useCase:
			'Comes up right after the architecture overview, especially for data-heavy projects like e-commerce, booking, or social apps.',
		detailedMarkdown: `
# Explain Database Design

## Why interviewers ask this
Database design questions test whether you actually modeled the problem or just let an ORM auto-generate tables for you. Interviewers want to see that you thought about relationships, access patterns, and the cost of getting the schema wrong — because in real jobs, schema mistakes are expensive to fix later. They're also probing whether you understand *why* a table looks the way it does, not just what columns it has.

## Framework for your answer
1. **Name the core entities and how they relate.** Two to four nouns, with cardinality: "a User has many Orders, an Order has many OrderItems, an OrderItem references a Product."
2. **Pick ONE schema decision and explain the reasoning.** Common strong choices: a specific normalization tradeoff, a composite index you added after seeing a slow query, a denormalized field you kept for read performance, or a decision between one-big-table vs. separate tables.
3. **Know your access patterns.** Be ready to say which queries run most often and how the schema supports them (e.g., "we query orders by user_id constantly, so that's indexed; we rarely query by shipping address, so that's not").
4. **Be honest about what you'd change.** If the schema has a known wart, say so — it reads as maturity, not weakness.

## Worked example
"For the e-commerce orders schema, we had \`Users\`, \`Orders\`, \`OrderItems\`, and \`Products\` as the core tables, with \`OrderItems\` as a join table carrying quantity and price-at-time-of-purchase — we deliberately snapshotted the price onto the order item instead of just referencing the live \`Products\` price, because a product's price can change after an order is placed and we needed the order history to stay accurate. We also added a composite index on \`(user_id, created_at)\` on the \`Orders\` table once we noticed the 'order history' page was doing a full table scan under load, which took that query from roughly 400ms down to under 20ms."

## Common mistakes
- **Listing tables with no relationships.** Naming five tables without saying how they connect doesn't demonstrate modeling — it demonstrates that you have an ORM.
- **Not knowing your own indexes.** If you say "we added indexes for performance" but can't name which column or which query it served, that's a tell.
- **Over-normalizing as a reflex.** Third normal form everywhere sounds academically correct but if you can't explain a case where you intentionally denormalized for read speed, it suggests you haven't dealt with real query performance.
- **No opinion on consistency.** Not knowing whether a relationship is enforced by a foreign key, an application-level check, or nothing at all is a common gap that gets exposed quickly.
- **Confusing "database design" with "ORM models."** The interviewer wants the relational model, not a list of class definitions.
		`
	},

	'Explain APIs': {
		definition:
			'Being able to describe your API style and walk through the concrete design of one endpoint, including its request/response shape.',
		useCase:
			'Comes up when the interviewer wants to see how the frontend and backend actually talk to each other, often followed by a whiteboard request.',
		detailedMarkdown: `
# Explain APIs

## Why interviewers ask this
This checks whether you thought about your API as a contract that other people (or your own future self) have to use, not just an internal implementation detail. It's also one of the easiest places to expose whether you copy-pasted boilerplate versus deliberately made choices about auth, versioning, error shapes, and pagination — things that only come up once an API has real users and real scale.

## Framework for your answer
1. **State the style and why.** REST vs. GraphQL vs. RPC — pick the one you used and give one real reason (team familiarity, caching behavior, client needs, etc.).
2. **Pick ONE endpoint and go deep on it.** Don't try to describe every route — walk through one representative endpoint's design choices: pagination strategy, auth requirement, versioning, idempotency.
3. **Be ready to whiteboard the request and response shape from memory.** If you say "GET /bookings", you should be able to sketch the JSON body, status codes, and error format without hesitation.
4. **Mention one thing you'd improve.** Real APIs always have a rough edge — knowing yours shows depth.

## Worked example
"We built a REST API, mainly because the client team already had strong REST tooling and our data was naturally resource-shaped. The booking-creation endpoint, \`POST /v1/bookings\`, took a slot ID and user ID, required a bearer JWT, and returned a 201 with the created booking or a 409 if the slot had just been taken by someone else — we made it idempotent by accepting an optional client-generated \`idempotency_key\` header, because mobile clients on flaky connections were retrying requests and creating duplicate bookings before we added that. For listing bookings we used cursor-based pagination instead of offset-based, since the table was written to constantly and offset pagination was skipping or duplicating rows as new bookings came in."

## Common mistakes
- **Vague answers like "we followed REST best practices."** Interviewers will ask you to name one, so have specifics ready: status codes used correctly, resource naming, idempotency, versioning strategy.
- **Not knowing your own error format.** If you can't say what a 400 response body looks like in your own API, that's an immediate red flag.
- **Ignoring auth in the endpoint description.** Every endpoint has an auth story — public, authenticated, role-gated — know it for the one you pick.
- **No pagination strategy for list endpoints**, or not knowing which one you used and why.
- **Confusing REST with "just returns JSON."** Be ready to explain what actually makes your API RESTful (or admit it's REST-ish and say why that was fine for your use case).
		`
	},

	'Explain Authentication': {
		definition:
			'Being able to explain which authentication mechanism you used, why you chose it, and how you handled one specific edge case.',
		useCase:
			'Comes up when discussing security, user accounts, or session handling — often as a probe into whether you understand what you copied from a tutorial.',
		detailedMarkdown: `
# Explain Authentication

## Why interviewers ask this
Authentication is one of the most commonly copy-pasted parts of a side project, so interviewers use it to separate people who understand the mechanism from people who followed a guide. They want to know that you can reason about tradeoffs like stateless vs. stateful sessions, and that you've thought about at least one real edge case — because auth bugs are exactly the kind of thing that quietly breaks in production.

## Framework for your answer
1. **Name the mechanism and the one real reason you chose it.** JWT vs. server-side sessions vs. OAuth/third-party — tie it to an actual constraint (e.g., "we needed stateless auth because we had multiple API instances behind a load balancer with no shared session store").
2. **Know the mechanics, not just the buzzword.** Where is the token stored? How is it validated? What's in the payload?
3. **Describe ONE edge case you specifically handled.** Token expiry and refresh, logout with stateless tokens, concurrent sessions, or password reset flows are all strong choices.
4. **Acknowledge a limitation.** Every auth setup has a known weak point (e.g., no token revocation list) — naming it shows maturity.

## Worked example
"Our SaaS app used JWTs for authentication because we were running multiple stateless API instances behind a load balancer and didn't want a shared session store just for login state. Access tokens were short-lived, 15 minutes, stored in memory on the client, with a longer-lived refresh token in an HTTP-only cookie so it wasn't accessible to JavaScript. The edge case we specifically had to handle was logout — because JWTs are stateless, calling 'logout' can't actually invalidate a token that's already been issued, so we kept a small Redis-backed denylist of revoked refresh tokens with a TTL matching the token's expiry, which meant logout was effectively immediate without needing a full session store."

## Common mistakes
- **Saying "we used JWT for security"** without being able to explain that JWTs are about statelessness, not inherent security — a JWT that isn't properly validated or is stored insecurely is no safer than a session cookie.
- **Not knowing how logout works with stateless tokens.** This is the single most common gap; if you used JWTs, you must have an answer for revocation.
- **No story for token expiry.** What happens when an access token expires mid-session? If your answer is "the user gets logged out and has to log in again," know whether that was intentional or just a fallback.
- **Confusing authentication with authorization.** Be ready to distinguish "who is this user" from "what is this user allowed to do."
- **Treating third-party OAuth as if you built the security yourself.** If you used "Sign in with Google," be clear about what you built (the callback handling, session creation) versus what the provider handled.
		`
	},

	'Explain Tradeoffs': {
		definition:
			'Being able to say "we chose X over Y because Z, and accepted downside W" for at least two or three real decisions in your project.',
		useCase:
			'The single most common follow-up question in any project deep-dive — comes up whenever you mention a design decision at all.',
		detailedMarkdown: `
# Explain Tradeoffs

## Why interviewers ask this
This is arguably the most important signal in the entire project walkthrough. Interviewers are checking whether you understand that **every engineering decision has a cost**, and whether you can articulate what you gave up, not just what you gained. A candidate who describes their project as a series of purely upside decisions ("we used X, it's great") reads as inexperienced. A candidate who can say "we chose X, which cost us Y, and here's why that was the right call for our constraints" reads as someone who has actually shipped things and lived with the consequences.

## Framework for your answer
1. **Have 2-3 tradeoffs memorized before the interview.** Don't try to invent one on the spot — walk in with your best examples pre-loaded, ideally from different layers (data, API, infra).
2. **Use the exact structure: "We chose X over Y because Z, and we accepted the downside of W."** This sentence shape forces you to name the alternative and the cost, not just the winner.
3. **Tie the tradeoff to a concrete constraint**, not an abstract principle. "Because it's more scalable" is weak; "because we needed writes to survive a single node going down" is strong.
4. **Mention if/when the tradeoff would flip.** Showing you know the decision isn't universally correct — just correct for that context — is a strong senior signal.

## Worked example
"For a notification feature — 'let the sender know their message was delivered' — we chose eventual consistency over strong consistency: the delivery-status update was written to a queue and processed asynchronously rather than updated synchronously in the same transaction as the message write. That meant a small window, usually under a second, where the sender's UI could show 'sending' after the message had actually arrived, and we accepted that because notification status has near-zero business cost if it's briefly stale, but forcing it into the same synchronous transaction as message delivery would have added latency to the one action — sending a message — that users are most sensitive to. If this had been a payment status instead of a delivery receipt, we would have made the opposite choice."

## Common mistakes
- **Describing a decision with no alternative mentioned.** If you don't name what you didn't choose, it's not a tradeoff, it's just a fact.
- **Claiming a decision was free.** If your answer has no downside, the interviewer will assume you either don't understand the decision or are hiding something.
- **Being too abstract.** "Scalability vs. simplicity" as a category is fine as a heading, but you must land it on your specific project.
- **Only having one tradeoff ready.** Interviewers will often ask for a second one immediately — have backups.
- **Picking a tradeoff you don't actually understand deeply.** If you can't answer two levels of follow-up on it, choose a different one to lead with.
		`
	},

	'Explain Performance Optimizations': {
		definition:
			'Being able to describe a real bottleneck you measured, the specific fix you applied, and the measured improvement in numbers.',
		useCase:
			'Comes up when the interviewer asks "did you run into any performance issues?" or wants evidence of hands-on debugging skill.',
		detailedMarkdown: `
# Explain Performance Optimizations

## Why interviewers ask this
This question filters out people who talk about performance in the abstract from people who have actually sat down with a profiler or slow query log and fixed something real. The single biggest tell is whether your story includes **numbers**. "We optimized the database" is a claim; "p95 query time went from 800ms to 120ms" is evidence. Interviewers are also checking your process: did you measure first, or did you guess and get lucky?

## Framework for your answer
1. **State how you found the bottleneck.** Profiling tool, slow query log, APM dashboard, a user complaint you investigated — measurement, not a hunch.
2. **Name the specific root cause.** N+1 query, missing index, unbounded payload, synchronous call that should have been async, no caching on a hot read path.
3. **Describe the fix precisely.** "We added a cache" is weak; "we added a Redis cache with a 5-minute TTL keyed by product ID, invalidated on write" is strong.
4. **Give the before/after number.** Even an approximate number ("roughly 5x") is far more convincing than "much faster."

## Worked example
"On the restaurant listing page we noticed p95 latency creeping up as the restaurant count grew, so we ran the query through the Postgres slow query log and found an N+1 pattern — for every restaurant we were issuing a separate query to fetch its average rating from a reviews table. We fixed it by rolling the rating into a single joined query with a pre-aggregated \`avg_rating\` column that we updated via a trigger on new reviews instead of computing it live, which took the endpoint from about 25 queries per request down to 1, and dropped p95 latency from roughly 900ms to 80ms under the same load test."

## Common mistakes
- **No numbers.** "It got a lot faster" without a before/after metric is the single most common weakness in this answer.
- **Guessing instead of measuring.** If your story is "we assumed the database was slow so we added caching everywhere," that's optimizing blind, and interviewers will probe for how you knew where the bottleneck actually was.
- **Fixing the symptom, not the cause.** Throwing more hardware or a blanket cache at a problem without understanding why it was slow is a weaker story than a targeted fix.
- **Only having a frontend or only a backend example ready.** Have at least one backend performance story since that's what's usually asked for, but a frontend one (bundle size, re-render count) is a good backup.
- **Overclaiming impact.** Don't inflate the numbers — a specific, modest, credible number is more convincing than a suspiciously huge one.
		`
	},

	'Explain Scaling Strategy': {
		definition:
			'Being able to name specifically what would break first as load grows, and what concrete change you would make to address it.',
		useCase:
			'Comes up as a forward-looking question — "how would this handle 100x the traffic?" — testing whether you think beyond the current state.',
		detailedMarkdown: `
# Explain Scaling Strategy

## Why interviewers ask this
Most side projects never actually hit scale, so this question tests your ability to reason about a system's limits even without having lived through them. Interviewers want a specific bottleneck, not a buzzword salad of "microservices, Kubernetes, and Kafka." The strongest answers name the exact component that would break first and describe the smallest reasonable next step — not a hypothetical full rewrite.

## Framework for your answer
1. **Say what breaks first, specifically.** Database connection limits, a single-threaded process, disk I/O on one node, a synchronous call chain, a hot key in cache — name the real constraint, not "the whole system."
2. **Propose the next concrete step, not the end state.** "We'd add a read replica and cache the hot reads" is more credible than "we'd move to microservices with Kafka."
3. **Order your fixes by leverage.** Cheapest/lowest-risk fixes first (add an index, add caching), then structural ones (horizontal scaling, queueing), then heavier ones (sharding, service decomposition).
4. **Cross-reference concepts you know**, like horizontal scaling, caching, message queues, or sharding — showing you know the vocabulary is fine as long as you attach it to the specific bottleneck.

## Worked example
"At 100 requests a day, our URL shortener's biggest constraint was basically none — a single Postgres instance handled it fine. Going to 1M requests a day, the first thing to break would be write contention on the counter we used to generate short codes, since it was a single row being incremented under a lock. The first fix would be to switch to a pre-generated pool of short codes handed out from a distributed generator, or a base62-encoded snowflake-style ID, removing the shared counter entirely. After that, reads — which dominate a URL shortener's traffic by a large margin — would move behind a Redis cache keyed by short code with a long TTL, since redirect targets rarely change, and the database would mostly stop seeing read traffic at all. If write volume kept growing past that, sharding the mapping table by short code prefix would be the next step, but that's well beyond where we actually needed to go."

## Common mistakes
- **Jumping straight to "microservices and Kubernetes"** without identifying an actual bottleneck first — this reads as buzzwords, not analysis.
- **Vague answers like "we'd just scale horizontally."** Scale *what*, specifically? Stateless API servers can usually scale horizontally easily; a single-writer database cannot without more work.
- **Ignoring the cheap fixes.** Jumping to sharding or a full rewrite when adding an index or a cache would solve the actual problem signals you haven't scaled anything for real.
- **Not connecting the answer to the numbers given.** If asked about 100x growth, your answer should clearly explain what specifically changes at that order of magnitude, not just growth in general.
- **No mention of read vs. write scaling separately.** Most systems scale reads and writes very differently — conflating them is a common gap.
		`
	},

	'Explain Challenges': {
		definition:
			'Being able to describe one real, specific technical problem you hit, how you investigated it, and how you resolved it.',
		useCase:
			'Comes up as "what was the hardest bug or problem you ran into on this project?" — a direct test of hands-on depth.',
		detailedMarkdown: `
# Explain Challenges

## Why interviewers ask this
This is where interviewers separate people who genuinely built and debugged something from people who describe a project at a surface level. A weak answer here ("time management was hard" or "coordinating with teammates") signals you either didn't hit a real technical wall or aren't willing to talk about one. A strong answer — a specific bug, a specific investigation process, a specific fix — is one of the highest-signal moments in the entire interview, because debugging process is very hard to fake.

## Framework for your answer
1. **Pick a real technical problem, not a soft-skills problem.** Interviewers want engineering depth: a bug, a design flaw that surfaced under load, a subtle data corruption issue, a race condition, a third-party integration failure.
2. **Describe the symptom first**, exactly as you observed it — what was actually going wrong, and how you noticed it.
3. **Walk through your investigation process.** What did you check first? What did you rule out? What tool or log finally pointed at the cause? This is the part interviewers care about most.
4. **State the fix and the verification.** What did you change, and how did you confirm it actually fixed it (not just "it seemed better")?

## Worked example
"The hardest bug we hit was a race condition in production where occasionally two delivery drivers would both get assigned the same order. It only happened under load, so it was hard to reproduce locally at first. We started by adding structured logging around the assignment path and noticed the two conflicting assignments always landed within milliseconds of each other, which pointed at a concurrency issue rather than a logic bug. Digging in, we found the assignment logic read the order's status, checked it was 'unassigned,' and then wrote the assignment — a classic check-then-act race with no locking in between, so two requests could both pass the check before either wrote. We fixed it with a conditional update at the database level — an atomic \`UPDATE ... WHERE status = 'unassigned'\` that only succeeds for exactly one of the concurrent requests — and verified it by writing a load test that fired concurrent assignment requests at the same order and confirming exactly one ever succeeded."

## Common mistakes
- **Picking a non-technical challenge.** "Managing scope" or "learning a new framework" doesn't demonstrate engineering depth the way a real bug does.
- **Skipping the investigation process.** Jumping straight from "there was a bug" to "we fixed it" skips the part interviewers actually want to hear — how you narrowed it down.
- **Not being able to answer follow-ups.** If you pick a challenge, expect to be asked to go one or two levels deeper — don't pick one you can't defend under questioning.
- **No verification step.** "We fixed it" without any mention of how you confirmed the fix worked is a weaker story than one that closes the loop.
- **Choosing a challenge that wasn't actually yours.** If a teammate solved it and you're describing it secondhand, expect that to surface under detailed questioning — pick one you personally debugged.
		`
	},

	'Explain Future Improvements': {
		definition:
			'Being able to honestly name the current limitations of your project and describe 1-2 concrete next steps you would take.',
		useCase:
			'Comes up as a closing question — "what would you do differently, or add next?" — testing self-awareness and technical maturity.',
		detailedMarkdown: `
# Explain Future Improvements

## Why interviewers ask this
This question tests self-awareness: can you look at your own work honestly and identify real weaknesses, or do you present the project as if it were finished and perfect? It also tests technical maturity — vague answers like "add more tests" or "clean up the code" suggest you haven't thought concretely about what the system actually needs next. A strong answer names a specific limitation and a specific, scoped next step, which signals that you understand your project as a living system rather than a finished assignment.

## Framework for your answer
1. **Name a real current limitation honestly.** Something you knew about and consciously deferred, not something you're inventing on the spot.
2. **Propose 1-2 concrete next steps, not a vague wishlist.** "Extract the notifications module into its own service" or "add distributed tracing across the two services we have" — specific and scoped.
3. **Explain why it's next, not first.** Show prioritization: why didn't you do this already, and why does it matter now?
4. **Keep it to a believable amount.** Two solid, well-reasoned improvements beat five shallow ones.

## Worked example
"Right now, the recommendation logic lives inside the main order-service monolith, which made sense early on because it was simple and we didn't have the traffic to justify splitting it out. But it's started causing two problems: it's on the same deploy cycle as core ordering logic, so a bug in an experimental recommendation change risks the checkout path, and it's CPU-heavy in a way that doesn't match the rest of the service's load profile. The next concrete step would be pulling it into its own service behind a queue, so recommendation computation can scale and deploy independently without touching order processing. Alongside that, we currently have almost no observability beyond basic logs — no distributed tracing across services — so the second improvement I'd prioritize is adding request-level tracing, since debugging the cross-service race condition we hit earlier took far longer than it should have without it."

## Common mistakes
- **Vague, generic answers.** "Add more tests," "improve documentation," or "refactor the code" without specifics reads as filler, not reflection.
- **Pretending the project is finished.** Acting like there's nothing left to improve is a bigger red flag than admitting real gaps.
- **Picking improvements unrelated to anything discussed earlier.** The strongest version of this answer connects back to a challenge or tradeoff you already mentioned — it shows the story is coherent, not improvised.
- **Listing too many things shallowly.** A long list of surface-level ideas is weaker than one or two well-reasoned ones you can defend under follow-up.
- **No prioritization reasoning.** Not explaining *why* something is next rather than already done suggests you haven't actually thought about sequencing work, which is a core part of real engineering judgment.
		`
	}
};
