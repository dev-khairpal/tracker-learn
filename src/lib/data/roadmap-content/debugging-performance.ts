import type { RoadmapDetailMap } from './types';

export const DebuggingPerformanceContent: RoadmapDetailMap = {
	'Debugging Strategy': {
		definition:
			'A systematic method for finding the cause of a bug, rather than guessing and randomly changing code.',
		useCase:
			'Isolating which of 40 recent commits introduced a regression, using binary search instead of reading every diff.',
		detailedMarkdown: `
# Debugging Strategy

The single biggest difference between an efficient debugger and a frustrated one: a **systematic method** instead of guessing.

## The Method
1. **Reproduce** — get a *reliable*, minimal set of steps that triggers the bug every time. An intermittent, unreproducible bug is far harder to fix; spend real effort narrowing the trigger conditions before touching any code.
2. **Isolate the problem space** — narrow down *where* the bug lives before guessing *why*. Binary-search the space: if a regression appeared somewhere in the last 40 commits, don't read all 40 — use \`git bisect\` to test the midpoint commit, then repeat, honing in on the exact commit in ~log₂(40) ≈ 6 steps.
3. **Form a hypothesis** — state, explicitly, what you think is wrong ("I think the cache is returning a stale value because invalidation isn't firing on update").
4. **Test the hypothesis** — add a log statement, a breakpoint, or a small experiment that would prove or disprove it. Don't change production logic yet — just gather evidence.
5. **Fix** — once you know the actual cause, make the minimal correct change.
6. **Verify** — confirm the original repro no longer fails, *and* run the broader test suite to confirm the fix didn't break something else.

## git bisect in Practice
\`\`\`bash
git bisect start
git bisect bad HEAD          # current commit has the bug
git bisect good v1.2.0       # this old tag was known-good
# git checks out the midpoint commit — you test it, then:
git bisect good   # or: git bisect bad
# repeat until git identifies the exact culprit commit
git bisect reset
\`\`\`

## The Trap to Avoid
Randomly changing code ("let me just try removing this line") without a hypothesis can *accidentally* make a symptom disappear while leaving the actual bug in place, or introduce a second bug that masks the first. Rubber-duck debugging — explaining the problem out loud, line by line, to a person (or literally a rubber duck) — surfaces incorrect assumptions surprisingly often, precisely because it forces you to state your hypothesis explicitly.
		`
	},
	'Root Cause Analysis': {
		definition:
			"The practice of digging past a bug's immediate symptom to find and fix the underlying condition that caused it.",
		useCase:
			'Discovering that a "slow query" report was actually caused by a missing index that let a table grow unchecked.',
		detailedMarkdown: `
# Root Cause Analysis

## Symptom vs Root Cause
A **symptom** is what you observe (the app crashed, a page is slow). The **root cause** is the underlying condition that produced it. Fixing only the symptom — restarting the crashed service, adding a timeout to the slow call — makes the immediate pain go away while leaving the actual defect in place, free to resurface (often worse, or in a different guise).

## The "5 Whys" Technique
Keep asking "why" until you hit something structurally fixable:
1. *Why did the checkout page 500?* → An unhandled null-pointer exception.
2. *Why was the value null?* → The \`getUserDiscount()\` call returned null for new users.
3. *Why does it return null for new users?* → New users have no discount record in the database yet.
4. *Why does the code assume every user has one?* → The original implementation was written before the "new user" case existed, and never updated.
5. *Why wasn't this caught before shipping?* → No test covers a user with zero discount records.

Notice each layer is a genuinely different, valid target for a fix — patching only step 1 (add a null check) prevents *this* crash but leaves the same missing-test-coverage and implicit-assumption problems free to cause the next one.

## Blameless Postmortems
Writing up an incident should focus on **what** happened and **why the system allowed it**, not **who** made the mistake. Blaming an individual encourages people to hide mistakes and discourages honest reporting — which is exactly the information you need to actually prevent a repeat. A good postmortem ends with concrete action items (add a test, add an alert, add a safeguard), not just a narrative.

## Why This Matters for Interviews
"Tell me about a bug you found and root-caused" is a very common question — see *Failure Stories* and *Explain Challenges* in this app's coaching sections for how to structure that answer.
		`
	},
	Profiling: {
		definition:
			'Using specialized tools to measure exactly where a program spends its CPU time or memory, instead of guessing.',
		useCase:
			"Finding that 80% of a page load's time is spent in one unexpectedly slow function, using a flame graph.",
		detailedMarkdown: `
# Profiling

## CPU Profiling vs Memory Profiling
- **CPU profiling** answers "where is time being spent?" — which functions, how often, how long each call takes.
- **Memory profiling** answers "where is memory being allocated / retained?" — useful for both raw usage and finding *Memory Leaks*.

## Sampling vs Instrumentation
- **Sampling profilers** periodically interrupt the program (e.g. every 1ms) and record the current call stack — low overhead, statistical, good for production-safe profiling.
- **Instrumentation profilers** insert timing code around every function call — much more precise, but the overhead itself can distort the very timings you're measuring.

## Reading a Flame Graph
\`\`\`text
|--------------------- handleRequest() ---------------------|
|---- parseInput() ----|------------ processData() ---------|
                        |-- validate() --|---- computeX() ---|
\`\`\`
- The **x-axis** is time (or sample count) — wider bars mean more time spent.
- The **y-axis** is call depth — a function stacked on top of another means it was called *by* that function.
- A wide bar with **no children stacked on top** ("wide at the top") is where time is actually being spent doing real work, as opposed to just calling into other functions — that's usually your optimization target.

## Real Tools
- **Chrome DevTools → Performance tab** — CPU + rendering profiling for web apps, produces flame graphs directly.
- **\`perf\`** (Linux) — low-level, system-wide CPU profiling.
- Most languages have a dedicated profiler (Python's \`cProfile\`, Java's async-profiler/JFR, Node's \`--prof\` flag).

## When to Reach for a Profiler
Intuition about "what's slow" is wrong surprisingly often — a profiler turns a guess into a measurement. Reach for one whenever you're about to optimize something and don't have a number backing up *where* the actual time is going; logs/timers around a couple of suspect functions are often enough for a quick check, a full profiler is worth it once the cause isn't obvious.
		`
	},
	'Memory Leaks': {
		definition:
			"A bug where memory that's no longer needed is never released, because something unintentionally keeps a reference to it alive.",
		useCase:
			'A single-page app that gets slower and slower the longer it stays open, because event listeners are never cleaned up.',
		detailedMarkdown: `
# Memory Leaks

In a garbage-collected language, a "leak" doesn't mean memory that was never freed by design (like in C) — it means memory that **should** be eligible for collection, but isn't, because something still holds a reference to it.

## Common Causes
1. **Forgotten event listeners** — attaching a listener to a long-lived object (like \`window\`) from a short-lived component, and never removing it, keeps that component (and everything it closed over) alive forever.
2. **Growing caches with no eviction** — a \`Map\` used as a cache that only ever grows, never expiring or bounding its size.
3. **Closures capturing more than needed** — a callback that closes over an entire large object when it only needed one field from it.

## Before/After Example
\`\`\`javascript
// LEAKS: every call adds a new listener, and 'largeDataset' is captured
// by the closure and can never be garbage collected while the listener lives
function attachHandler(largeDataset) {
  window.addEventListener('resize', () => {
    console.log(largeDataset.length);
  });
}

// FIXED: keep a reference to the handler so it can be removed,
// and only capture what's actually needed
function attachHandler(datasetLength) {
  const handler = () => console.log(datasetLength);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler); // cleanup function
}
\`\`\`

## Detecting a Leak
1. Open DevTools → **Memory** tab, take a heap snapshot.
2. Perform the suspected leaking action several times (e.g. open/close a modal 10 times).
3. Take another snapshot and compare — if memory keeps climbing and never comes back down after the action completes and garbage collection runs, you likely have a leak. The snapshot's "retainers" view shows *what* is still holding a reference to the leaked object, which is usually the fastest way to find the exact culprit line.

## Why It Matters
A slow leak might be invisible in a quick manual test but crashes a long-running process (a server, a single-page app left open all day) hours or days later — exactly the kind of bug that's easy to miss in development and painful in production.
		`
	},
	'Performance Optimization': {
		definition:
			'The disciplined process of measuring where time/resources are actually spent, then fixing the biggest real bottleneck — not guessing.',
		useCase:
			'Choosing to fix an N+1 database query (measured: 400ms) instead of micro-optimizing a loop that runs 10 times (measured: 0.01ms).',
		detailedMarkdown: `
# Performance Optimization

## The Golden Rule: Measure, Don't Guess
"Premature optimization" isn't about optimization being bad — it's about optimizing *before you know where the actual cost is*. Use *Profiling* first, always.

## Optimize the Bottleneck, Not Whatever's Easiest to Optimize
This connects directly to **Amdahl's Law** (see *Multi-Core Processing*): the maximum possible speedup from optimizing any one part of a system is capped by how much of the *total* time that part actually accounts for.

**Worked prioritization example:** A profiler shows a request spends 400ms in an N+1 database query loop, and 0.01ms in a tight in-memory loop elsewhere. Even a "10x improvement" on the in-memory loop saves 0.009ms — utterly invisible. Fixing the N+1 query (a single \`JOIN\` instead of 50 sequential queries) could plausibly cut 400ms down to 20ms — a genuinely user-visible win. Always fix the part that's actually the bottleneck, confirmed by measurement, not the part that *feels* inefficient.

## A Practical Checklist
1. Profile / measure to find the actual bottleneck.
2. Fix that one thing.
3. Measure again — confirm the improvement, and find the *new* bottleneck (it's rarely the same one twice).
4. Stop once further optimization no longer matters for the user-facing goal (e.g. p95 latency is well under your target) — perfectly optimizing an already-fast path is wasted effort better spent elsewhere.

## Common High-Leverage Fixes
- Add a missing index (see *Indexes*).
- Fix an N+1 query pattern with a batch fetch or \`JOIN\`.
- Add a cache in front of an expensive, frequently-repeated computation.
- Reduce payload size (pagination, only fetching needed fields).

> The single most common realistic answer to "how would you improve this system's performance?" in an interview is some combination of the above — grounded in "I'd measure first," not a list of exotic tricks.
		`
	},
	'Caching Strategies': {
		definition:
			'Reasoning about what data is safe to cache, for how long, and how to avoid serving stale or incorrect cached data.',
		useCase:
			'Debugging a "why is this user seeing yesterday\'s data" incident traced back to a cache that was never invalidated on update.',
		detailedMarkdown: `
# Caching Strategies (Production/Debugging Angle)

The *System Design* section covers cache **architectures** (cache-aside, write-through, eviction policies). This entry focuses on the practical, day-to-day question: *how do you reason about and debug caching in a live system?*

## The Core Trade-off: Staleness vs Performance
Every cache with a TTL (time-to-live) is a deliberate bet: "I'll accept data being up to N seconds/minutes stale, in exchange for not hitting the expensive source on every request." The right TTL depends entirely on how bad stale data actually is for that specific piece of data — a product's list price tolerates a 5-minute-stale cache far better than a live stock-trading price would.

## Invalidation Strategies
1. **TTL-based** — simplest; the entry just expires after N seconds regardless of whether the underlying data changed. Easy to reason about, but staleness is guaranteed for up to the TTL window.
2. **Event-based invalidation** — explicitly clear or update the cache entry the moment the underlying data changes (e.g. on every \`UPDATE\`, delete the corresponding cache key). More accurate, more code, and easy to have a bug where one code path forgets to invalidate.
3. **Versioned cache keys** — instead of invalidating, change the *key* itself when data changes (\`user:42:v3\`) so old cached entries simply become unreachable and naturally age out, rather than needing an explicit delete.

## Worked Example: Cache-Aside With Event-Based Invalidation
This is the pattern behind the "why is this user seeing yesterday's data" incident in the useCase above — a product price cached on read, but never cleared on write:

\`\`\`javascript
// --- The bug: cache is populated on read, but never touched on write ---
async function getProductPrice(productId) {
    const cached = await redis.get(\`product:\${productId}:price\`);
    if (cached) return JSON.parse(cached);

    const product = await db.query('SELECT price FROM products WHERE id = ?', [productId]);
    await redis.set(\`product:\${productId}:price\`, JSON.stringify(product.price), 'EX', 300); // 5 min TTL
    return product.price;
}

async function updateProductPrice(productId, newPrice) {
    await db.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, productId]);
    // BUG: nothing invalidates redis here — up to 5 minutes of stale reads for every user
}
\`\`\`

**Concrete timeline of the incident:**
- \`10:00:00\` — A user requests the product page. Cache miss, price ($50) is read from the DB and cached with a 5-minute TTL (expires \`10:05:00\`).
- \`10:02:00\` — An admin updates the price to $40 via \`updateProductPrice\`. The database now says $40. The cache still says $50.
- \`10:02:01\` through \`10:04:59\` — Every user hitting the cache sees the stale $50, even though the database is already correct. This is the "why is this user seeing yesterday's data" ticket.
- \`10:05:00\` — TTL expires, next request is a cache miss, and the cache finally catches up to $40.

**The fix — invalidate the key the moment the write happens:**
\`\`\`javascript
async function updateProductPrice(productId, newPrice) {
    await db.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, productId]);
    await redis.del(\`product:\${productId}:price\`); // next read is a forced cache miss, re-populates immediately
}
\`\`\`
With this fix, the window of staleness shrinks from "up to 5 minutes" to "the time between the \`UPDATE\` committing and the \`DEL\` running" — effectively zero for a single-process app, though in a distributed system with multiple app instances you'd need to make sure *every* code path that can write this data also calls the invalidation, which is exactly the kind of bug described in the debugging checklist below.

## Debugging "Why Is This Stale?"
A classic on-call scenario: a user reports seeing old data after an update. The debugging checklist:
1. Confirm the underlying data source *actually* has the new value (rule out the simpler bug — maybe the write itself failed).
2. Check whether the cache entry's TTL has expired yet — if not, this may be expected staleness, and the real question is whether the TTL is set correctly for this data's requirements.
3. If using event-based invalidation, check whether the invalidation code path actually ran for this specific write path (a common bug: two different code paths update the same data, and only one of them remembers to invalidate the cache).

> **This is quoted so often it's a cliché for a reason:** "There are only two hard problems in computer science: cache invalidation, naming things, and off-by-one errors." Caching bugs are subtle precisely because the *code* looks correct — the bug is in the timing/completeness of invalidation, which doesn't show up in a normal code review.
		`
	},
	Monitoring: {
		definition:
			'The practice of continuously collecting metrics, logs, and traces from a running system to detect problems and understand its health.',
		useCase:
			'Getting paged the moment error rates spike, instead of finding out from an angry customer email an hour later.',
		detailedMarkdown: `
# Monitoring

## The Three Pillars of Observability
| Pillar | Answers | Example tool |
|---|---|---|
| **Metrics** | "How much / how many / how fast, over time?" (numeric time series) | Prometheus + Grafana |
| **Logs** | "What exactly happened, in detail, for this specific event?" | Structured JSON logs, see *Logging* |
| **Traces** | "As this one request flowed through multiple services, where did the time go?" | OpenTelemetry, Jaeger |

Each answers a different kind of question — metrics tell you *something* is wrong (error rate jumped), logs and traces help you find out *what* and *where*.

## Monitoring vs Observability
- **Monitoring** — watching dashboards and alerting on **known** failure modes you thought to instrument in advance ("alert if error rate > 1%").
- **Observability** — having enough rich, queryable data (especially traces + structured logs) to answer **new** questions about failure modes you *didn't* anticipate ("why did requests from this specific customer, on this specific endpoint, start failing at 2:14pm?") without shipping new code to add the instrumentation.

## SLIs, SLOs, and Alerting
- **SLI** (Service Level Indicator) — a specific measured metric, e.g. "p99 latency" or "% of requests returning 2xx."
- **SLO** (Service Level Objective) — the target for that SLI, e.g. "99.9% of requests succeed."
- **Alerting** should fire on **symptoms that affect users** (SLO burn rate, elevated error rate) rather than every internal fluctuation — over-alerting on noise trains engineers to ignore alerts entirely, which defeats the purpose (alert fatigue).

## Real Tools
- **Prometheus + Grafana** — the most common open-source metrics + dashboarding stack.
- **Datadog / New Relic** — commercial, all-in-one observability platforms (metrics + logs + traces).
- **OpenTelemetry** — the emerging vendor-neutral standard for instrumenting traces/metrics/logs consistently across languages and services.

## The Interview Angle
"How would you know if this system was broken?" is a common system-design/operational follow-up — a strong answer names specific SLIs you'd track and what you'd alert on, not just "we'd have logging."
		`
	}
};
