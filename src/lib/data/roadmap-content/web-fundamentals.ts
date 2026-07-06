import type { RoadmapDetailMap } from './types';

export const WebFundamentalsContent: RoadmapDetailMap = {
	'Browser Rendering': {
		definition:
			'The high-level process by which a browser turns raw HTML, CSS, and JavaScript into pixels on screen.',
		useCase:
			'Understanding why a render-blocking script in the <head> delays how quickly a page becomes visible.',
		detailedMarkdown: `
# Browser Rendering

At a high level, loading a page runs through a predictable pipeline:

1. **Parse HTML → DOM.** The browser reads HTML top to bottom and builds the **DOM** (Document Object Model) tree.
2. **Parse CSS → CSSOM.** Stylesheets are parsed into the **CSSOM**, a tree of style rules.
3. **JavaScript may block parsing.** A \`<script>\` tag (without \`async\`/\`defer\`) halts HTML parsing entirely until it downloads and executes — because that script might use \`document.write()\` to change the page.
4. **Combine into the Render Tree**, then run the full *Rendering Pipeline* (Style → Layout → Paint → Composite) to produce pixels.

## The Critical Rendering Path
This is the sequence of steps the browser *must* complete before the first pixels appear — DOM + CSSOM construction block rendering by default, which is why render-blocking CSS/JS in the \`<head>\` directly delays "First Contentful Paint."

## Practical Takeaways
- Put CSS in the \`<head>\` (needed before first paint) but scripts at the end of \`<body>\`, or use \`defer\`/\`async\`, so they don't block HTML parsing.
- \`defer\` downloads in parallel and runs after parsing completes, in document order; \`async\` downloads in parallel and runs **as soon as ready**, potentially out of order — pick \`defer\` when script order/DOM-readiness matters.

## Code Example: Blocking Script vs. \`defer\` vs. \`async\`
\`\`\`html
<!-- BLOCKING: parser hits this tag, stops dead, downloads app.js, executes it,
     and only THEN continues parsing the rest of the HTML below it. -->
<head>
  <script src="app.js"></script>
</head>
<body>
  <h1>This heading isn't parsed or shown until app.js finishes running.</h1>
</body>

<!-- defer: browser downloads app.js in the background WHILE continuing to parse
     the HTML below. Execution is held until parsing is fully done, and runs
     in the order the <script> tags appear. Safe default for most app scripts. -->
<head>
  <script src="app.js" defer></script>
</head>
<body>
  <h1>Parsing continues immediately — this shows up right away.</h1>
</body>

<!-- async: browser downloads app.js in the background too, but executes it
     the INSTANT it finishes downloading — which can be before OR after parsing
     completes, and out of order relative to other scripts. Fine for independent
     scripts (analytics) that don't touch the DOM or depend on load order. -->
<head>
  <script src="analytics.js" async></script>
</head>
\`\`\`

**Timeline comparison for the same 200ms download:**

| | Blocking | \`defer\` | \`async\` |
|---|---|---|---|
| HTML parsing during download | **Paused** | Continues | Continues |
| Script executes | Immediately, mid-parse | After parsing finishes | As soon as download completes (may interrupt parsing) |
| Order guaranteed vs. other scripts | Yes (runs where it sits) | Yes (document order) | **No** — whichever finishes downloading first, runs first |
		`
	},
	'Rendering Pipeline': {
		definition:
			'The four-stage process (Style, Layout, Paint, Composite) a browser runs to turn the DOM and CSSOM into pixels on screen.',
		useCase: 'Explaining why animating "left" is janky but animating "transform" is smooth.',
		detailedMarkdown: `
# Rendering Pipeline

## The Four Stages
1. **Style** — compute the final CSS properties for every DOM node (resolving cascade, inheritance, specificity).
2. **Layout (Reflow)** — calculate the exact size and position of every element on the page. This is the expensive one: changing one element's size can cascade into recalculating the position of everything around it.
3. **Paint** — fill in pixels for each element (text, colors, borders, shadows) onto layers.
4. **Composite** — combine the painted layers together in the correct order (respecting z-index, transforms) into the final image shown on screen.

## Layout Thrashing (Reflow) vs Repaint
- A change to **layout-affecting** properties (\`width\`, \`top\`, \`margin\`) forces the browser back to step 2 — recompute layout, then repaint, then recomposite. Expensive.
- A change to **paint-only** properties (\`background-color\`, \`box-shadow\`) skips layout but still requires a repaint.
- A change to **\`transform\`** and **\`opacity\`** can often be handled entirely on the **Composite** step — the GPU just moves/fades an already-painted layer, skipping Style, Layout, *and* Paint entirely.

## Why This Matters for Animation
\`\`\`css
/* Janky: triggers layout on every frame */
.box { animation: move-left 1s; }
@keyframes move-left { to { left: 200px; } }

/* Smooth: composite-only, GPU-accelerated */
.box { animation: move-right 1s; }
@keyframes move-right { to { transform: translateX(200px); } }
\`\`\`
Animating \`transform\`/\`opacity\` is the standard performance advice for smooth 60fps animations precisely because it can skip the two most expensive pipeline stages.

## Layout Thrashing in JavaScript
Reading a layout property (\`el.offsetHeight\`) right after writing one (\`el.style.width = ...\`) in a loop forces the browser to synchronously recompute layout on every iteration — a classic, easily-introduced performance bug.
		`
	},
	'Event Loop': {
		definition:
			'The mechanism that lets single-threaded JavaScript handle asynchronous operations, by coordinating a call stack with task queues.',
		useCase:
			'Predicting the exact console.log output order of code mixing setTimeout, Promises, and synchronous code — a classic interview question.',
		detailedMarkdown: `
# Event Loop

JavaScript runs on a **single thread** — but it doesn't block on slow operations, thanks to the Event Loop coordinating three pieces:

\`\`\`text
┌────────────────┐
│   Call Stack   │  ← synchronous code runs here, always, to completion
└────────────────┘
         ▲
         │ (empties, then loop checks queues)
┌────────────────────┐      ┌────────────────────┐
│  Microtask Queue    │ ──▶ │   Macrotask Queue   │
│ (Promise.then, etc) │     │ (setTimeout, I/O)    │
└────────────────────┘      └────────────────────┘
\`\`\`

## The Exact Order
1. Run all synchronous code on the **Call Stack** until it's empty.
2. Drain the **entire Microtask Queue** — every \`Promise.then\`/\`queueMicrotask\` callback, including any *new* ones they schedule, ALL run before moving on.
3. Run exactly **one** task from the **Macrotask Queue** (e.g. one \`setTimeout\` callback).
4. Go back to step 2.

## The Classic Interview Question
\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2
\`\`\`
Why: \`1\` and \`4\` run synchronously first. Then, even though \`setTimeout(..., 0)\` was scheduled *before* the \`Promise.then\`, **all microtasks drain before any macrotask runs** — so \`3\` (a microtask) always beats \`2\` (a macrotask), regardless of the 0ms delay.

## Why This Model Exists
It lets JavaScript stay responsive (never permanently blocked waiting on I/O) while still guaranteeing synchronous code always runs to completion without being interrupted mid-execution by another callback — a property that makes reasoning about shared state much simpler than true multithreading.
		`
	},
	'Call Stack': {
		definition:
			'The data structure JavaScript uses to keep track of function calls, following Last-In-First-Out order.',
		useCase:
			'Explaining why uncontrolled recursion crashes with a "Maximum call stack size exceeded" error.',
		detailedMarkdown: `
# Call Stack

The **Call Stack** tracks "where the program currently is" — every function call pushes a new frame onto the stack; returning from it pops that frame off.

\`\`\`javascript
function third() { console.log('in third'); }
function second() { third(); }
function first() { second(); }
first();
// Stack grows: [first] → [first, second] → [first, second, third]
// Then unwinds as each function returns
\`\`\`

## Stack Overflow
If functions call each other without ever returning (typically uncontrolled recursion with no base case), the stack grows until it hits an engine-imposed limit:
\`\`\`javascript
function recurse() { return recurse(); } // no base case
recurse(); // RangeError: Maximum call stack size exceeded
\`\`\`

## Relationship to the Event Loop
Synchronous code always runs entirely on the Call Stack, and the *Event Loop* only checks the microtask/macrotask queues once the **Call Stack is completely empty**. This is why a long-running synchronous loop blocks everything else — including UI updates and pending Promise callbacks — until it finishes and the stack clears.

## LIFO, Not FIFO
The stack's Last-In-First-Out order is why a deeply nested call chain ("A calls B calls C calls D") resolves innermost-first: \`D\` finishes and returns before \`C\` can continue, and so on back up to \`A\`.
		`
	},
	Microtasks: {
		definition:
			'Short callbacks (like Promise continuations) that the event loop fully drains before running the next macrotask.',
		useCase:
			'Explaining why a Promise.then callback always runs before the next setTimeout, even a 0ms one.',
		detailedMarkdown: `
# Microtasks

**Microtasks** are the highest-priority queue in the *Event Loop* — Promise callbacks (\`.then\`, \`.catch\`, \`.finally\`) and \`queueMicrotask()\` calls land here.

\`\`\`javascript
Promise.resolve().then(() => console.log('microtask 1'));
queueMicrotask(() => console.log('microtask 2'));
\`\`\`

## The Draining Rule
Once the Call Stack empties, the event loop runs **every** microtask currently queued — including new ones scheduled *by* those very callbacks — before it's allowed to touch the macrotask queue at all.

\`\`\`javascript
Promise.resolve().then(() => {
  console.log('first');
  Promise.resolve().then(() => console.log('nested — still runs before any setTimeout!'));
});
setTimeout(() => console.log('setTimeout — runs last'), 0);
\`\`\`

## Why This Design
Microtasks exist to let Promise-based code resolve as promptly as possible — as soon as the current synchronous work finishes, not after waiting behind whatever timers/I/O happen to be queued. This is also why an infinite chain of \`.then()\`s recursively resolving immediately can **starve** the macrotask queue entirely (a real, if rare, footgun: \`setTimeout\` callbacks and rendering can be indefinitely postponed).
		`
	},
	Macrotasks: {
		definition:
			'Larger units of asynchronous work (like setTimeout callbacks, I/O, and UI events) that the event loop runs one at a time, between draining microtasks.',
		useCase:
			"Explaining why two back-to-back setTimeout(fn, 0) calls don't run in the same event loop iteration.",
		detailedMarkdown: `
# Macrotasks

**Macrotasks** (also called just "tasks") include \`setTimeout\`/\`setInterval\` callbacks, I/O completion callbacks, and UI events (clicks, etc).

## One Per Iteration
The *Event Loop* runs exactly **one** macrotask per iteration, and fully drains the *Microtasks* queue both before starting the loop and after every single macrotask finishes.

\`\`\`javascript
setTimeout(() => console.log('A'), 0);
setTimeout(() => console.log('B'), 0);
// Output: A, then B — never both "in the same tick"
// Between A and B, the loop re-checks (and would drain) the microtask queue
\`\`\`

## Why the Browser Interleaves Rendering Here
Crucially, the browser gets a chance to **repaint the screen** between macrotasks (not between every microtask) — this is why a long chain of synchronous \`.then()\` microtasks can visibly freeze the UI, while breaking work into separate \`setTimeout\`-scheduled macrotasks lets the browser breathe and render in between.

## Common Macrotask Sources
- \`setTimeout\` / \`setInterval\`
- Network responses (\`fetch\`'s underlying I/O, though the \`.then()\` continuation itself is a microtask)
- User input events (click, keypress, scroll)
- \`requestAnimationFrame\` callbacks run in a related but distinct phase, timed to the browser's repaint cycle.
		`
	},
	DOM: {
		definition:
			"The Document Object Model — a tree structure representing the page's HTML content that JavaScript can read and manipulate.",
		useCase: 'Using document.querySelector to find and update an element after a button click.',
		detailedMarkdown: `
# DOM (Document Object Model)

The **DOM** is the browser's live, in-memory tree representation of your page's HTML — every tag becomes a **node** you can inspect and mutate with JavaScript.

\`\`\`javascript
const heading = document.querySelector('h1');
heading.textContent = 'Updated!';
heading.classList.add('highlight');

const list = document.createElement('ul');
list.innerHTML = '<li>Item 1</li>';
document.body.appendChild(list);
\`\`\`

## Node Types (Briefly)
- **Element nodes** — actual tags (\`<div>\`, \`<p>\`).
- **Text nodes** — the raw text content inside an element.
- **Comment nodes**, **Document node** (the root), and a few others.

## Why "Live"
The DOM isn't a static snapshot of the original HTML — it's mutable and *reflects the current state* of the page. Opening DevTools and inspecting an element after JavaScript has modified it shows the current DOM, which may look nothing like the original HTML source (this is why "View Source" and "Inspect Element" can show different things).

## Performance Note
Every DOM mutation can potentially trigger the *Rendering Pipeline* (layout/paint). Frameworks like React/Svelte exist partly to batch and minimize direct DOM writes, since manually touching the DOM in a tight loop is a common performance trap.
		`
	},
	BOM: {
		definition:
			'The Browser Object Model — the set of browser-provided objects (window, navigator, location, history) that let JavaScript interact with the browser itself, as opposed to the page content.',
		useCase:
			'Using window.location to redirect the user, or navigator.userAgent to detect the browser.',
		detailedMarkdown: `
# BOM (Browser Object Model)

While the **DOM** represents the *page's content*, the **BOM** represents the *browser surrounding it* — the tab, the address bar, the window itself.

## Key Objects
\`\`\`javascript
window.innerWidth;               // viewport dimensions
window.location.href;            // current URL; assigning to it navigates
window.location.reload();
navigator.userAgent;             // browser/OS info
navigator.geolocation;           // (with permission) device location
history.back();                  // navigate the session history
history.pushState({}, '', '/new-path'); // used by SPA routers, no reload
\`\`\`

## DOM vs BOM
| | DOM | BOM |
|---|---|---|
| Represents | The page's HTML content | The browser environment around the page |
| Root object | \`document\` | \`window\` |
| Standardized? | Yes, by the W3C/WHATWG | Loosely — no single official spec, though behavior has converged across browsers |

In practice, \`document\` is actually a property *of* \`window\` (\`window.document\`) — the DOM is reachable through the BOM's top-level object, which is why \`window\` feels like the global "everything" object in browser JavaScript.
		`
	},
	'Local Storage': {
		definition:
			'A browser API for storing key-value string data on the client that persists indefinitely, until explicitly cleared.',
		useCase:
			"Remembering a user's theme preference (dark mode) across browser sessions without needing a server round-trip.",
		detailedMarkdown: `
# Local Storage

\`\`\`javascript
localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');   // 'dark'
localStorage.removeItem('theme');
localStorage.clear();
\`\`\`

## Key Characteristics
- **Persists indefinitely** — survives closing the browser, restarting the computer; only cleared by explicit code, the user clearing browser data, or the browser's own storage-eviction policy under storage pressure.
- **~5–10MB limit** per origin (varies by browser).
- **Synchronous API** — reading/writing blocks the main thread; large values or frequent access can cause jank.
- **Not sent to the server automatically** — unlike cookies, \`localStorage\` data stays purely client-side unless your code explicitly reads and sends it.
- **Strings only** — objects must be serialized: \`localStorage.setItem('user', JSON.stringify(user))\`.

## Security Note
Anything in \`localStorage\` is readable by any JavaScript running on that page — including injected scripts from an *XSS* vulnerability. This is why storing sensitive tokens (like a JWT) in \`localStorage\` is a real, commonly-cited security trade-off versus an \`HttpOnly\` cookie, which JavaScript can't read at all.

## When to Use It
Non-sensitive, small, client-only preferences and cached data (theme, UI state, a lightweight cache of recently viewed items) — not auth tokens, not anything sensitive.
		`
	},
	'Session Storage': {
		definition:
			'A browser API with the same key-value interface as Local Storage, but scoped to a single tab and cleared when that tab closes.',
		useCase:
			"Keeping a multi-step checkout form's in-progress data alive across page refreshes within one tab, without persisting it forever.",
		detailedMarkdown: `
# Session Storage

Same API as *Local Storage*, different lifetime and scope:

\`\`\`javascript
sessionStorage.setItem('checkoutStep', '2');
sessionStorage.getItem('checkoutStep');
\`\`\`

## Comparison

| | Local Storage | Session Storage | Cookies |
|---|---|---|---|
| Lifetime | Until explicitly cleared | Until the tab closes | Configurable expiry |
| Scope | Shared across all tabs of the same origin | **Per tab** — even two tabs of the same site have separate storage | Shared across tabs, sent with every matching request |
| Sent to server? | No | No | Yes, automatically |
| Size limit | ~5–10MB | ~5–10MB | ~4KB |

## The Key Distinguishing Feature
Opening the *same site* in two separate tabs gives each tab its **own independent** \`sessionStorage\` — even though they're the same origin. This makes it a good fit for data that should genuinely be scoped to one browsing session/tab, like an in-progress multi-step form, without leaking across a user's other open tabs of your site.

## When It's Cleared
Closing the tab (or the browser) clears \`sessionStorage\` for that tab — but note that simply *refreshing* the page does **not** clear it, which is exactly what makes it useful for surviving accidental refreshes mid-flow.
		`
	},
	'Service Workers': {
		definition:
			'A script that runs in the background, separate from the page, enabling offline support, caching, and push notifications — the foundation of Progressive Web Apps.',
		useCase:
			"Letting a web app show cached content and still function when the user's network connection drops.",
		detailedMarkdown: `
# Service Workers

A **Service Worker** is a JavaScript file that runs on a separate thread from your page, acting as a programmable network proxy sitting between your app and the network.

## Lifecycle
1. **Register** — the page tells the browser about the service worker file.
2. **Install** — the service worker runs setup logic, typically pre-caching key assets.
3. **Activate** — it takes control, ready to intercept network requests from that point on.

\`\`\`javascript
// In your page's JS:
navigator.serviceWorker.register('/sw.js');

// Inside sw.js:
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => cache.addAll(['/', '/styles.css', '/app.js']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
\`\`\`
This "cache-first" strategy serves assets instantly from cache when available, only hitting the network for anything not yet cached.

## What It Enables
- **Offline support** — the app can still render (from cache) with zero network connectivity.
- **Push notifications** — service workers can receive push events even when the page/tab isn't open.
- **Background sync** — deferring an action (like sending a queued message) until connectivity returns.

## The Foundation of PWAs
"Progressive Web Apps" are essentially: a web app + a service worker (for offline/caching) + a manifest file (for "install to home screen" behavior) — no separate native app codebase required.
		`
	},
	'Browser Cache': {
		definition:
			"The browser's local storage of previously-downloaded resources, controlled by HTTP caching headers, that avoids re-downloading unchanged assets.",
		useCase:
			"Making a returning visitor's page load instantly because the CSS/JS bundle is already cached from their last visit.",
		detailedMarkdown: `
# Browser Cache

## The Key Headers
\`\`\`
Cache-Control: max-age=31536000, immutable
ETag: "abc123"
Last-Modified: Wed, 04 Jun 2025 10:00:00 GMT
\`\`\`

- **\`Cache-Control: max-age=N\`** — the browser can reuse this response for N seconds without contacting the server *at all*.
- **\`ETag\`** — a fingerprint of the resource's content. After the cache expires, the browser can send \`If-None-Match: "abc123"\` to ask "has this changed?" without re-downloading it.
- **\`Last-Modified\`** — a timestamp-based alternative to \`ETag\` for the same revalidation purpose.

## Fresh Hit vs Revalidation (304)
| Scenario | What happens |
|---|---|
| Cache is still fresh (\`max-age\` not expired) | **No network request at all** — instant load straight from disk/memory cache. |
| Cache is stale, resource unchanged | Browser sends a conditional request; server replies \`304 Not Modified\` with no body — fast, but still a round-trip. |
| Cache is stale, resource changed | Server replies \`200\` with the full new content. |

## Cache-Busting for Deployed Assets
Since you want *aggressive* long-lived caching for performance, but also need users to get new code after a deploy, the standard trick is **content-hashed filenames**:
\`\`\`
app.a1b2c3d4.js   Cache-Control: max-age=31536000, immutable
\`\`\`
The filename itself changes whenever the content changes, so you can cache it "forever" — a new deploy just references a new filename, which is guaranteed to be a fresh, uncached request.
		`
	},
	'HTTP Lifecycle': {
		definition:
			'The complete end-to-end journey of a web request, from typing a URL to seeing a rendered page.',
		useCase:
			'Answering the classic interview question: "what happens when you type a URL into the browser and press Enter?"',
		detailedMarkdown: `
# HTTP Lifecycle

This ties together nearly every other topic in this section (and the *Networks* section) into one end-to-end story — a very common opening interview question.

## The Full Journey
1. **URL Parsing** — the browser figures out the protocol, host, path.
2. **DNS Lookup** — the hostname is resolved to an IP address (browser cache → OS cache → recursive resolver → ultimately an authoritative nameserver). See *DNS*.
3. **TCP Connection** — a three-way handshake establishes a connection to that IP on the target port (usually 443).
4. **TLS Handshake** — for HTTPS, negotiates encryption before any HTTP data is sent. See *SSL/TLS*.
5. **HTTP Request Sent** — the browser sends the actual request (method, headers, body).
6. **Server Processing** — the server (through however many layers: load balancer, app server, database) computes a response.
7. **HTTP Response Received** — status code, headers, body come back.
8. **Browser Rendering** — HTML is parsed into the DOM, CSS into the CSSOM, and the full *Rendering Pipeline* runs to produce pixels — potentially triggering more requests along the way (images, scripts, fonts) each repeating steps 2-7.
9. **JavaScript Execution & Interactivity** — scripts run, event listeners attach, and the page becomes interactive.

## A Worked Example: \`GET https://api.example.com/users/42\`
Putting real artifacts on each step makes the journey concrete instead of abstract:

1. **DNS Lookup** (~20-120ms on a cold cache, ~0ms if cached): \`api.example.com\` → \`93.184.216.34\`
2. **TCP Handshake** (1 round trip, ~30-100ms depending on distance): \`SYN\` → \`SYN-ACK\` → \`ACK\`
3. **TLS Handshake** (1-2 more round trips): client and server agree on a cipher suite and exchange keys before any HTTP bytes are sent.
4. **HTTP Request actually sent over that connection:**
   \`\`\`http
   GET /users/42 HTTP/1.1
   Host: api.example.com
   Accept: application/json
   Authorization: Bearer eyJhbGciOi...
   Cookie: session_id=abc123
   \`\`\`
5. **Server Processing** (however many milliseconds the app/DB take): the request hits a load balancer, then an app server, which queries a database for user 42.
6. **HTTP Response comes back:**
   \`\`\`http
   HTTP/1.1 200 OK
   Content-Type: application/json
   Cache-Control: private, max-age=60
   Content-Length: 87

   {"id": 42, "name": "Ada Lovelace", "email": "ada@example.com"}
   \`\`\`
7. **Browser Rendering** parses the response body and updates the page (or, for a full page navigation, parses HTML/CSS/JS as described above).

Total time for a fresh connection is roughly: DNS + TCP + TLS + (request + server time + response) — which is exactly why keeping a connection alive (HTTP/1.1 keep-alive, or HTTP/2's multiplexing) matters: it lets subsequent requests skip straight to step 4, avoiding the DNS/TCP/TLS setup cost every time.

## Where Caching Cuts This Short
A returning visit might skip steps 2-7 entirely for already-cached assets (see *Browser Cache*) — going straight from "URL parsed" to "render from cache," which is why cache headers are such high-leverage performance levers. Note the \`Cache-Control: private, max-age=60\` header above: it's the server explicitly telling the browser "you may reuse this exact response for 60 seconds without asking me again."

## Why This Question Is Asked
It's a single question that lets an interviewer probe how many *different* layers of the stack you understand — DNS, TCP/TLS, HTTP semantics, and browser rendering — all in one connected narrative, rather than testing each in isolation.
		`
	}
};
