import type { RoadmapDetailMap } from './types';

export const CsNetworksContent: RoadmapDetailMap = {
	'OSI Model': {
		definition:
			'A 7-layer conceptual framework that standardizes how different hardware and software systems communicate across a network, from raw electrical signals up to the applications users interact with.',
		useCase:
			'Diagnosing "the internet is down": is it a bad cable (Layer 1), a switch misconfiguration (Layer 2), a routing issue (Layer 3), or a broken DNS lookup (Layer 7)?',
		detailedMarkdown: `
# The OSI Model

The **OSI (Open Systems Interconnection) Model** is a 7-layer reference model published by the ISO that describes how data moves from one device, across a network, to another. No single real protocol maps perfectly onto it — it's a mental model interviewers use to check that you understand *where* a given protocol or problem lives in the stack.

Each layer only talks to the layers directly above and below it, and each layer wraps the data from the layer above it with its own header (a process called **encapsulation**).

## The 7 Layers (top to bottom)

| # | Layer | Responsibility | Example Protocol/Tech |
|---|-------------|--------------------------------------------------|------------------------------|
| 7 | Application | Interfaces directly with end-user software | HTTP, FTP, SMTP, DNS |
| 6 | Presentation | Translates, encrypts, and compresses data | TLS/SSL, JPEG, ASCII/Unicode |
| 5 | Session | Opens, manages, and closes a conversation | NetBIOS, PPTP, session tokens |
| 4 | Transport | End-to-end delivery, reliability, flow control | TCP, UDP |
| 3 | Network | Logical addressing and routing between networks | IP, ICMP, routers |
| 2 | Data Link | Framing, MAC addressing, error detection on a single link | Ethernet, Wi-Fi (802.11), switches |
| 1 | Physical | Raw bits over a physical medium | Cables, radio waves, hubs, voltage |

A common mnemonic (top to bottom) is **"All People Seem To Need Data Processing"**.

## Encapsulation, briefly
As data descends the stack on the sending side, each layer adds its own header (and sometimes a trailer): the Transport layer turns data into **segments**, the Network layer wraps those into **packets**, and the Data Link layer wraps those into **frames** before they go out as bits. The receiving device reverses this process, stripping headers layer by layer (**decapsulation**) until the raw application data is delivered.

## Why interviewers ask this
It's rarely about reciting all 7 layers — it's about using the model as a **troubleshooting vocabulary**. If a user says "the website won't load":
- No lights on the network card → **Layer 1** (physical)
- Device has no IP address → **Layer 3**
- \`ping\` works but \`curl\` fails → likely **Layer 4** (port blocked) or **Layer 7** (app/DNS issue)
- SSL certificate error → **Layer 6**

## OSI vs. TCP/IP
The internet you actually use isn't built on OSI — it's built on the simpler **TCP/IP model**, which collapses OSI's top three layers into one "Application" layer and merges the bottom two into a "Link" layer. OSI is the theoretical teaching model; TCP/IP is the practical one that ships in every operating system's network stack. See the "TCP/IP Model" topic for the direct mapping.

> **Interview tip:** When asked "what layer does X live at," anchor on the *job* the layer does (addressing vs. routing vs. reliable delivery vs. human-readable protocol) rather than memorizing a list. That reasoning transfers to any protocol you haven't seen before.
	`
	},

	'TCP/IP Model': {
		definition:
			'The practical 4-layer networking model — Application, Transport, Internet, and Link — that the real-world internet and every major OS network stack are actually built on.',
		useCase:
			'Explaining, in a system design interview, exactly which header gets added at which stage as an HTTP request leaves your laptop and travels to a server.',
		detailedMarkdown: `
# The TCP/IP Model

While the OSI model is the *theoretical* 7-layer teaching tool, the **TCP/IP model** (also called the Internet Protocol Suite) is the 4-layer model that actual operating systems, routers, and applications implement. It predates OSI and is simpler and more practical.

## The 4 Layers

| Layer | Role | Example Protocols | Roughly = OSI Layers |
|------------------|--------------------------------------------------|--------------------|-----------------------|
| Application | User-facing protocols and data formatting | HTTP, DNS, SMTP, FTP | 5, 6, 7 |
| Transport | End-to-end communication, reliability, ports | TCP, UDP | 4 |
| Internet | Logical addressing and routing across networks | IP, ICMP, ARP | 3 |
| Link (Network Access) | Physical transmission and framing on the local network | Ethernet, Wi-Fi | 1, 2 |

## Encapsulation and PDU names
Every layer wraps the layer above it's data in its own header, and each wrapped unit has a specific name (its **Protocol Data Unit**):

1. **Application layer**: raw application **Data** (e.g., an HTTP request)
2. **Transport layer**: adds a TCP/UDP header → becomes a **Segment** (TCP) or **Datagram** (UDP), tagging it with source/destination **ports**
3. **Internet layer**: adds an IP header → becomes a **Packet**, tagging it with source/destination **IP addresses**
4. **Link layer**: adds a frame header/trailer with MAC addresses → becomes a **Frame**, ready to go out as **bits** on the wire

On the receiving end, the exact reverse happens: each layer strips its own header and hands the payload up to the layer above, until the original HTTP request is reconstructed.

## A concrete walkthrough
When your browser sends \`GET /index.html\` to a server:
- **Application**: the browser builds an HTTP request.
- **Transport**: TCP breaks it into segments, assigns source port (random, e.g. 54321) and destination port (443 for HTTPS), and manages the 3-way handshake for reliability.
- **Internet**: IP wraps each segment in a packet with your machine's IP as the source and the server's IP as the destination, then routers use this info to forward the packet hop by hop.
- **Link**: on each hop, the Link layer wraps the packet in a frame with the *local* MAC addresses of the current device and next hop (these change at every hop, unlike IP addresses which stay constant end-to-end).

## Why this model won
TCP/IP is what shipped in Unix (and later everywhere else) in the 1980s and became the de facto internet standard because it was simple, resilient (routes around failures), and vendor-neutral — while OSI, designed by committee, arrived too late and too complex to displace it. Today "TCP/IP" is effectively a synonym for "how the internet works."

> **Interview tip:** If asked to compare the models, the key insight is: OSI has *more, thinner* layers for teaching; TCP/IP has *fewer, fatter* layers because that's what was actually practical to implement in real network stacks.
	`
	},

	'HTTP/HTTPS': {
		definition:
			'HTTP is the application-layer protocol used to transfer data (mostly web pages and APIs) between clients and servers via a request/response cycle; HTTPS is HTTP sent over an encrypted TLS connection.',
		useCase:
			"A login form must POST credentials over HTTPS (port 443) rather than plain HTTP (port 80) so the password can't be read by anyone sniffing the network in between.",
		detailedMarkdown: `
# HTTP and HTTPS

**HTTP (HyperText Transfer Protocol)** is a stateless, text-based, request/response protocol that powers the web. A client (usually a browser or an API consumer) sends a **request**, and a server sends back a **response**.

## Anatomy of an HTTP request
\`\`\`http
GET /users/42 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Accept: application/json
\`\`\`
- **Request line**: method (\`GET\`), path (\`/users/42\`), and HTTP version.
- **Headers**: key-value metadata (host, auth token, content negotiation, etc.).
- **Body** (optional): present on methods like \`POST\`/\`PUT\`, typically JSON.

## Anatomy of an HTTP response
\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 58

{"id": 42, "name": "Ada Lovelace"}
\`\`\`
- **Status line**: version, status code, and a human-readable reason phrase.
- **Headers**: metadata about the response (content type, caching rules, cookies).
- **Body**: the actual payload.

HTTP is **stateless** — the server treats every request as independent unless the application layers on something extra (cookies, tokens, sessions) to simulate state across requests.

## HTTPS = HTTP + TLS
**HTTPS** is exactly the same protocol, but the entire request/response exchange travels inside a **TLS (Transport Layer Security)** encrypted tunnel. This buys you three things:
1. **Confidentiality** — no one on the network path (Wi-Fi snoopers, ISPs, proxies) can read the contents.
2. **Integrity** — data can't be silently tampered with in transit without detection.
3. **Authentication** — a certificate proves you're actually talking to the domain you think you are (see the "SSL/TLS" topic).

## Ports
- **HTTP** defaults to port **80**.
- **HTTPS** defaults to port **443**.

These are just conventions enforced by clients (browsers assume port 80/443 unless told otherwise in the URL, e.g. \`http://host:8080\`) — a server could technically serve HTTP on any port.

## Why it matters in practice
Modern browsers actively punish plain HTTP: they show a "Not Secure" warning in the address bar, block powerful APIs (geolocation, service workers, clipboard) on non-HTTPS origins, and search engines rank HTTPS sites higher. Since free certificate authorities like **Let's Encrypt** exist, there's essentially no excuse for a production site to serve traffic over plain HTTP today — it should exist only to redirect (301) to the HTTPS version.

> **Interview tip:** Be ready to explain that HTTPS doesn't change *what* is sent, only that a symmetric-encryption tunnel (negotiated via asymmetric crypto during the TLS handshake) wraps around the HTTP conversation so intermediaries only see encrypted bytes, not the actual request/response.
	`
	},

	'HTTP Methods': {
		definition:
			'The HTTP "verbs" — GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS — that tell a server what kind of action the client wants to perform on a resource.',
		useCase:
			'Designing a REST API for a blog: GET /posts/5 to read a post, PUT /posts/5 to fully replace it, PATCH /posts/5 to just update the title, DELETE /posts/5 to remove it.',
		detailedMarkdown: `
# HTTP Methods

HTTP methods (verbs) tell the server the *intent* of a request against a resource identified by a URL. Two properties matter a lot for interviews and for API design: **safety** and **idempotency**.

- **Safe**: the request doesn't change server state (read-only). Safe methods can be cached and prefetched freely.
- **Idempotent**: making the same request N times has the same effect as making it once. Idempotency matters for retry logic — if a network call times out, is it *safe* to just resend it?

## The methods

| Method | Purpose | Has Body | Safe | Idempotent |
|---------|--------------------------------------------|----------|------|------------|
| GET | Retrieve a resource | No | Yes | Yes |
| HEAD | Like GET, but headers only (no body) | No | Yes | Yes |
| OPTIONS | Discover allowed methods/CORS capabilities | No | Yes | Yes |
| POST | Create a resource, or trigger a non-idempotent action | Yes | No | No |
| PUT | Replace a resource entirely (or create at a known URL) | Yes | No | Yes |
| PATCH | Partially update a resource | Yes | No | No* |
| DELETE | Remove a resource | Optional | No | Yes |

\\\\* PATCH is *usually* not idempotent (e.g. "increment view count by 1" applied twice gives a different result than once), but a PATCH that sets specific fields to specific values (e.g. \`{"title": "New Title"}\`) can be idempotent in practice. The spec doesn't guarantee it either way — it depends on the semantics you implement.

## Why PUT is idempotent but POST isn't
- \`PUT /users/42\` with body \`{"name": "Ada"}\` sent 5 times in a row always leaves user 42 with name "Ada" — same end state. **Idempotent.**
- \`POST /users\` with the same body sent 5 times creates **5 different users** (each gets a new ID). **Not idempotent.**

This is exactly why PUT is the right verb for "create or replace at a known ID" and POST is right for "create and let the server assign an ID," and why clients can safely auto-retry a failed PUT/GET/DELETE but should be cautious auto-retrying a POST (it might double-charge a credit card, for example).

## HEAD and OPTIONS in practice
- **HEAD** is used to check if a resource exists or get its metadata (size, last-modified) without downloading the body — useful for validating a cached copy or checking a download's size before fetching it.
- **OPTIONS** is used to ask "what can I do here?" It returns an \`Allow\` header listing supported methods, and it's the exact request browsers send automatically as a **CORS preflight** check before a "risky" cross-origin request (see the "CORS" topic).

> **Interview tip:** If asked "is PATCH idempotent," the strongest answer acknowledges it depends on implementation — that nuance (rather than a flat yes/no) is what separates a memorized answer from an understood one.
	`
	},

	'HTTP Status Codes': {
		definition:
			'Three-digit numbers returned in every HTTP response that classify the outcome of a request into five categories: informational (1xx), success (2xx), redirection (3xx), client error (4xx), and server error (5xx).',
		useCase:
			'An API returns 401 when a JWT is missing/expired but 403 when the JWT is valid but the user lacks permission — a distinction interviewers frequently probe.',
		detailedMarkdown: `
# HTTP Status Codes

Status codes let a client understand the outcome of a request without parsing the body. The first digit defines the category.

## The five categories
| Range | Category | Meaning |
|-------|----------------|--------------------------------------------|
| 1xx | Informational | Request received, still processing |
| 2xx | Success | Request was successfully received and processed |
| 3xx | Redirection | Client must take further action (usually follow a new URL) |
| 4xx | Client Error | The request has a problem (bad syntax, auth, etc.) |
| 5xx | Server Error | The server failed to fulfill a valid request |

## The ones you'll actually be asked about

| Code | Name | When it's used |
|------|---------------------------|-----------------------------------------------------------------------|
| 200 | OK | Standard success for GET/PUT/PATCH — here's your data/confirmation |
| 201 | Created | Success after a POST that created a new resource (often with a \`Location\` header pointing to it) |
| 204 | No Content | Success, but there's nothing to return (e.g. a successful DELETE) |
| 301 | Moved Permanently | Resource has a new URL forever; clients/search engines should update bookmarks and re-request the new URL |
| 302 | Found | Resource is *temporarily* at a different URL; keep using the original URL next time |
| 304 | Not Modified | Client's cached copy (via \`ETag\`/\`If-Modified-Since\`) is still valid — no body sent, saving bandwidth |
| 400 | Bad Request | Malformed request — bad JSON, missing required field, invalid syntax |
| 401 | Unauthorized | You are not authenticated — missing or invalid credentials/token |
| 403 | Forbidden | You ARE authenticated, but you don't have permission for this resource |
| 404 | Not Found | The resource doesn't exist (or the server won't reveal that it does) |
| 409 | Conflict | Request conflicts with current server state (e.g. username already taken, edit conflict) |
| 422 | Unprocessable Entity | Syntactically valid request, but semantically invalid data (fails validation rules) |
| 429 | Too Many Requests | Client has been rate-limited; often paired with a \`Retry-After\` header |
| 500 | Internal Server Error | Generic "something broke" on the server, unhandled exception |
| 502 | Bad Gateway | A reverse proxy/load balancer got an invalid response from an upstream server |
| 503 | Service Unavailable | Server is temporarily overloaded or down for maintenance |

## The 401 vs 403 distinction (a classic gotcha)
- **401 Unauthorized** really means "un**authenticated**" — *who are you?* No valid credentials were provided.
- **403 Forbidden** means "I know who you are, but you're not allowed to do this" — *authenticated, but not authorized.*

## The 400 vs 422 distinction
- **400** — the request itself is broken (invalid JSON, wrong content type).
- **422** — the request is well-formed JSON, but the *values* fail business/validation rules (e.g. \`email\` field isn't a valid email format, or a required field is empty).

## 502 vs 503 (useful in an infra/SRE-flavored interview)
- **502 Bad Gateway**: the proxy/load balancer reached an upstream server, but that server returned garbage or crashed mid-response.
- **503 Service Unavailable**: the server (or the whole fleet behind a load balancer) is deliberately or overload-fully not answering right now — often transient, sometimes with a \`Retry-After\` hint.

> **Interview tip:** Knowing *which* code to return for a given scenario (not just what the code means) is what interviewers are really probing — e.g., "user tries to register with a taken email" should be **409 Conflict**, not 400.
	`
	},

	'TCP vs UDP': {
		definition:
			'TCP and UDP are the two core Transport-layer protocols: TCP is connection-oriented and guarantees reliable, ordered delivery, while UDP is connectionless and sends packets with no delivery guarantees but much lower overhead.',
		useCase:
			"A video call uses UDP because a dropped frame that arrives late is worse than a dropped frame that's simply skipped; a file download uses TCP because every single byte must arrive intact.",
		detailedMarkdown: `
# TCP vs UDP

Both **TCP (Transmission Control Protocol)** and **UDP (User Datagram Protocol)** operate at the Transport layer and both use **ports** to route data to the right application — but they make opposite trade-offs between reliability and speed.

## Head-to-head comparison

| Property | TCP | UDP |
|----------------------|--------------------------------------|-----------------------------------|
| Connection | Connection-oriented (handshake first) | Connectionless (just send) |
| Reliability | Guaranteed delivery, retransmits lost packets | No guarantee — packets can be lost |
| Ordering | Guaranteed in-order delivery | No ordering guarantee |
| Speed/Overhead | Slower, larger header (20+ bytes), more control | Faster, minimal header (8 bytes) |
| Flow/Congestion Control | Yes | No |
| Use cases | Web (HTTP), email (SMTP), file transfer (FTP), SSH | DNS, video/audio streaming, VoIP, online gaming, live broadcasts |

## The TCP 3-way handshake
Before any data flows, TCP establishes a connection:
1. **SYN** — client sends a synchronize packet with an initial sequence number, saying "let's talk."
2. **SYN-ACK** — server acknowledges and sends its own sequence number back.
3. **ACK** — client acknowledges the server's sequence number.

Only after this handshake completes does actual data transfer begin, and TCP continues to use sequence numbers + acknowledgments throughout the connection to detect and retransmit lost segments, plus **flow control** (don't overwhelm a slow receiver) and **congestion control** (don't overwhelm the network).

## Why UDP has no handshake
UDP just fires packets ("datagrams") at the destination with no setup, no acknowledgment, and no retransmission. If a packet is dropped, lost, or arrives out of order, UDP does nothing about it — that's left entirely to the application (or simply accepted as tolerable loss).

## Why real-time apps prefer UDP
For a live video call, a packet representing a video frame that's 200ms late is *useless* — the moment has passed, and the receiving app would rather skip it and show the next frame than wait for TCP to retransmit an old one, stalling everything behind it ("head-of-line blocking"). This is why VoIP, live game state updates, and video streaming protocols (like WebRTC) build their own lightweight reliability *on top of* UDP only where they actually need it, rather than paying for TCP's full guarantees everywhere.

## Why DNS mostly uses UDP
A DNS query is a single small request/response — the overhead of a full TCP handshake would often cost more time than the query itself. UDP fires the request, and if no answer comes back, the resolver just retries. (DNS does fall back to TCP for large responses, like zone transfers or DNSSEC-signed replies that exceed a single UDP packet.)

> **Interview tip:** Frame the choice as "how expensive is a retransmit vs. how expensive is guaranteeing delivery." If lost data can be cheaply tolerated or re-requested at the application layer, UDP wins on speed; if every byte matters, TCP's guarantees are worth the overhead.
	`
	},

	DNS: {
		definition:
			'The Domain Name System is a globally distributed, hierarchical directory service that translates human-readable domain names (like example.com) into the IP addresses computers actually use to route traffic.',
		useCase:
			'Typing "google.com" into a browser triggers a DNS lookup that resolves it to an IP address like 142.250.premises.x before any HTTP request can even be sent.',
		detailedMarkdown: `
# DNS (Domain Name System)

Computers route traffic using IP addresses, but humans remember names, not numbers. DNS is the "phone book of the internet" that bridges the two, and it's built as a distributed, cacheable, hierarchical system rather than one giant database.

## The resolution steps
When you type \`www.example.com\` into a browser:

1. **Browser/OS cache check** — has this been resolved recently? If yes, skip everything below.
2. **Recursive resolver** — the request goes to a resolver (usually your ISP's, or a public one like Google's \`8.8.8.8\` or Cloudflare's \`1.1.1.1\`). This resolver does the legwork on your behalf.
3. **Root name server** — the resolver asks a root server "who handles \`.com\`?" and gets back the address of the **TLD (Top-Level Domain)** server for \`.com\`.
4. **TLD name server** — the resolver asks the \`.com\` server "who handles \`example.com\`?" and gets back the **authoritative** name server for that domain.
5. **Authoritative name server** — this server actually holds the DNS records for \`example.com\` and returns the final answer (e.g. an A record with an IP address).
6. The resolver returns the IP to your browser **and caches it** for future lookups, according to the record's TTL.

This is a **recursive** lookup from the client's perspective (it makes one request and gets a final answer) built out of several **iterative** lookups the resolver performs on its behalf.

## Common record types
| Record | Purpose |
|--------|--------------------------------------------|
| A | Maps a hostname to an **IPv4** address |
| AAAA | Maps a hostname to an **IPv6** address |
| CNAME | Aliases one hostname to another hostname (e.g. \`www\` → \`example.com\`) |
| MX | Specifies the mail servers responsible for a domain |
| TXT | Arbitrary text — often used for domain verification and SPF/DKIM (email anti-spoofing) |
| NS | Delegates a domain/subdomain to a specific set of authoritative name servers |

## Caching and TTL
Every DNS record has a **TTL (Time To Live)**, in seconds, telling resolvers how long they're allowed to cache the answer before asking again. This is a deliberate trade-off:
- **Long TTL** (e.g. a day) → fewer lookups, faster resolution, but slow to propagate changes (e.g. moving to a new server IP).
- **Short TTL** (e.g. 60s) → changes propagate quickly, but every resolver has to re-query more often, adding load and latency.

A common pattern before a planned migration is to *lower* the TTL well in advance, make the change, confirm it's propagated, then raise the TTL back up.

## Why this matters in system design
DNS resolution adds latency to *every* new connection (until cached), which is one reason CDNs and browsers aggressively cache DNS answers, and why techniques like DNS prefetching (\`<link rel="dns-prefetch">\`) exist to hide this cost. DNS is also a common point of failure and attack (DNS spoofing, cache poisoning), which is why **DNSSEC** (cryptographically signed records) exists.

> **Interview tip:** Be ready to walk through the recursive-resolver-to-authoritative-server chain from memory — it's one of the most commonly asked "explain what happens when..." networking questions.
	`
	},

	CDN: {
		definition:
			'A Content Delivery Network is a geographically distributed set of proxy/cache servers ("edge servers") that store copies of content close to end users to reduce latency and offload traffic from the origin server.',
		useCase:
			'A video streaming service serves the actual video files from edge servers near each viewer instead of a single origin data center, so a user in Tokyo and a user in Berlin both get low-latency playback.',
		detailedMarkdown: `
# CDN (Content Delivery Network)

Physics is the enemy of latency: the farther data has to travel, the longer it takes. A **CDN** solves this by pushing copies of your content out to dozens or hundreds of **edge servers (Points of Presence, or PoPs)** scattered around the world, so users are served from a nearby node instead of a single distant origin server.

## How it works: cache hit vs. cache miss
1. A user in India requests \`https://cdn.example.com/logo.png\`.
2. DNS (using geo-routing) directs them to the nearest edge server — say, Mumbai — instead of the origin server, which might be in Virginia.
3. **Cache hit**: if the Mumbai edge server already has \`logo.png\` cached, it serves it directly. Fast, and the origin server never even sees the request.
4. **Cache miss**: if the edge server doesn't have it (or its cached copy expired), it fetches the file from the **origin server**, serves it to the user, *and* caches it locally for the next request from that region.

This is exactly the same hit/miss idea as any other cache — the CDN is just a globally distributed cache sitting in front of your origin.

## What gets cached
CDNs are ideal for **static, cacheable** content:
- Images, CSS, JavaScript bundles
- Video/audio files (streaming platforms rely heavily on this)
- Static HTML pages
- Software downloads/installers

Dynamic, per-user content (a personalized dashboard, a checkout confirmation) is generally *not* cached the same way, though modern CDNs increasingly support edge computing/logic to handle some dynamic cases too.

## Cache invalidation and TTL
Just like DNS, cached content on a CDN carries a **TTL** (often via \`Cache-Control\` headers from the origin). When you deploy a new version of \`app.js\`, you either wait for the old cached copy to expire, or explicitly **purge/invalidate** the CDN cache. A very common pattern is to include a content hash in the filename (e.g. \`app.3f8a1c.js\`) so a new deploy is automatically a *new* URL — no invalidation needed, and the old file can be cached forever.

## Why this matters
Beyond raw speed, CDNs provide:
- **Reduced origin load** — most requests never reach your actual servers.
- **DDoS resilience** — attack traffic gets absorbed across many edge nodes instead of hammering one origin.
- **Reliability** — if one edge node or region goes down, traffic reroutes to another.

Popular CDN providers include Cloudflare, Akamai, Fastly, and AWS CloudFront.

> **Interview tip:** In a system design interview, "put static assets behind a CDN" is a near-default answer for any user-facing app — be ready to explain *why* (latency via geographic proximity + reduced origin load) rather than just naming it as a buzzword.
	`
	},

	'Reverse Proxy': {
		definition:
			"A server that sits in front of one or more backend servers, receiving client requests and forwarding them to the appropriate backend, then returning the backend's response to the client as if it came from the proxy itself.",
		useCase:
			"Nginx sits in front of three application server instances, terminating SSL, compressing responses, and distributing incoming requests among them — clients only ever see Nginx's address.",
		detailedMarkdown: `
# Reverse Proxy

A **reverse proxy** is a server-side intermediary. Clients send requests to the proxy believing it *is* the server; the proxy then decides which actual backend server should handle it, forwards the request, and relays the response back — the client never talks to the real backend directly.

## Forward proxy vs. reverse proxy
These two are constantly confused, and the distinction is a favorite interview trick question:

| | Forward Proxy | Reverse Proxy |
|-------------------|----------------------------------------|----------------------------------------|
| Sits in front of | The **client** | The **server(s)** |
| Hides | The client's identity from the server | The server's identity/topology from the client |
| Client is aware of it? | Yes — client is configured to use it | No — client thinks it's talking directly to the server |
| Typical example | Corporate proxy, VPN, personal privacy proxy | Nginx/HAProxy in front of an app server fleet |

A simple way to remember it: a **forward** proxy works *on behalf of clients* (e.g. a company routing all employee traffic through one exit point); a **reverse** proxy works *on behalf of servers* (e.g. a company routing all incoming traffic to one entry point).

## What reverse proxies are used for
1. **Load balancing** — distribute requests across multiple backend instances (see the "Load Balancer" topic — a load balancer is essentially a specialized reverse proxy).
2. **SSL/TLS termination** — decrypt HTTPS at the proxy so backend servers only deal with plain HTTP internally, centralizing certificate management.
3. **Caching** — serve frequently requested responses without hitting the backend at all.
4. **Compression** — gzip/brotli-compress responses before sending them to the client.
5. **Security & hiding topology** — clients never learn backend IPs, internal architecture, or server software/versions, reducing the attack surface.
6. **Routing/API gateway behavior** — route \`/api/*\` to one service and \`/static/*\` to another based on the URL path.

## A minimal Nginx example
\`\`\`nginx
server {
    listen 443 ssl;
    server_name example.com;

    location / {
        proxy_pass http://backend_pool;
    }
}
\`\`\`
Here, Nginx accepts the HTTPS connection, and \`proxy_pass\` forwards the actual request to an internal pool of backend servers the client never sees directly.

## Why this matters in system design
Almost every production web architecture puts a reverse proxy in front of application servers — it's the natural place to centralize cross-cutting concerns (TLS, caching, rate limiting, routing) instead of duplicating that logic into every backend instance.

> **Interview tip:** If asked to differentiate forward vs. reverse proxy, lead with *whose side it's on* — that one framing answers almost every follow-up question about hiding identity, client awareness, and typical use cases.
	`
	},

	'Load Balancer': {
		definition:
			'A component (hardware or software) that distributes incoming network traffic across multiple backend servers to maximize throughput, minimize response time, and avoid overloading any single server.',
		useCase:
			'An e-commerce site during a flash sale routes incoming checkout requests across 20 identical application servers instead of letting one server buckle under all the traffic.',
		detailedMarkdown: `
# Load Balancer

A **load balancer** sits between clients and a pool of backend servers, deciding, for each incoming request, which server should handle it. It's a specialized form of reverse proxy focused specifically on distributing load and ensuring availability.

## Load balancing algorithms
| Algorithm | How it decides | Good for |
|--------------------|--------------------------------------------------|---------------------------------------|
| Round Robin | Cycles through servers in order, one at a time | Servers with roughly equal capacity |
| Weighted Round Robin | Like round robin, but stronger servers get proportionally more requests | Mixed-capacity server fleets |
| Least Connections | Sends the next request to whichever server currently has the fewest active connections | Long-lived or uneven-duration requests |
| IP Hash | Hashes the client's IP to consistently map them to the same server | Session affinity (sticky sessions) without a shared session store |

## Layer 4 vs. Layer 7 load balancing
This is one of the most common conceptual questions on the topic:

- **L4 (Transport layer)**: makes routing decisions based only on IP address and port — it doesn't inspect the actual HTTP content. It's very fast (just forwarding packets/TCP connections) but "dumb" — it can't route based on URL path, cookies, or headers.
- **L7 (Application layer)**: understands the actual HTTP request — method, path, headers, cookies — and can make smart routing decisions (e.g. \`/api/*\` → API servers, \`/images/*\` → static file servers; or route based on a session cookie for sticky sessions). It's more flexible but adds overhead since it has to parse the request.

Most modern web load balancers (Nginx, HAProxy in HTTP mode, AWS ALB) operate at L7; raw TCP/UDP load balancers (AWS NLB) operate at L4 for maximum throughput/minimum latency.

## Health checks
A load balancer continuously pings each backend server (e.g. hitting a \`/health\` endpoint every few seconds). If a server fails several checks in a row, it's automatically pulled out of the rotation — the load balancer stops sending it traffic until it recovers, which is what lets a fleet tolerate individual server crashes without any downtime visible to users.

## Sticky sessions
Some applications store session state in server memory rather than a shared store (Redis, DB). In that case, the load balancer needs **session affinity** — routing the same client to the same backend every time, usually via IP hash or a cookie the load balancer itself sets. This works, but it's generally considered a workaround; the more scalable fix is to make backend servers stateless and store session data externally (see "Cookies vs. Sessions").

## Why this matters
Load balancers are foundational to horizontal scaling: without one, you can't add more servers to handle more traffic, because there's nothing to spread requests across them. They're also a single point of failure if not made redundant themselves (hence "load balancer" pairs, DNS-based failover, or cloud-managed load balancers with built-in HA).

> **Interview tip:** Be ready to justify *which* algorithm fits a given scenario — e.g. "long-lived WebSocket connections of unpredictable duration" points to Least Connections, not Round Robin.
	`
	},

	'SSL/TLS': {
		definition:
			'SSL (now deprecated) and its successor TLS (Transport Layer Security) are cryptographic protocols that establish an encrypted, authenticated channel between a client and a server over an otherwise insecure network.',
		useCase:
			"A browser verifies a bank's TLS certificate before submitting login credentials, ensuring both that the connection is encrypted and that it's actually talking to the real bank rather than an impostor.",
		detailedMarkdown: `
# SSL/TLS

**SSL (Secure Sockets Layer)** is the older protocol; **TLS (Transport Layer Security)** is its modern, more secure successor. In practice "SSL" is still used colloquially (SSL certificates, SSL termination) even though actual SSL versions are considered broken and disabled everywhere — what's really running today is **TLS 1.2 or 1.3**.

## What TLS provides
1. **Encryption** — data in transit can't be read by eavesdroppers.
2. **Integrity** — data can't be tampered with in transit without detection (via MACs).
3. **Authentication** — the client can verify the server is who it claims to be, via a **certificate**.

## The two kinds of encryption it combines
- **Asymmetric encryption** (public/private key pairs) is computationally expensive but solves the "how do two strangers agree on a secret with no prior shared key" problem. TLS uses this *only* during the handshake to securely agree on a shared secret.
- **Symmetric encryption** (same key for both sides) is fast and is used for the actual bulk data transfer once a shared secret key has been established.

This hybrid approach gets the security benefits of asymmetric crypto and the speed of symmetric crypto.

## The handshake (simplified, TLS 1.2 style)
1. **ClientHello** — client says "here are the TLS versions and cipher suites I support," plus a random value.
2. **ServerHello + Certificate** — server picks a cipher suite, sends back its own random value, and sends its **digital certificate** (containing its public key, signed by a trusted **Certificate Authority**).
3. **Certificate verification** — the client checks the certificate against its list of trusted CAs, confirms the domain name matches, and checks it hasn't expired or been revoked.
4. **Key exchange** — client and server use asymmetric crypto (or a Diffie-Hellman exchange) to agree on a shared **session key** without ever sending that key in the clear.
5. **Finished** — both sides switch to symmetric encryption using the session key; all further data (the actual HTTP request/response) is encrypted with it.

**TLS 1.3** streamlines this into effectively **one round trip** instead of TLS 1.2's two, reducing handshake latency — a meaningful win for how "snappy" HTTPS feels, especially on high-latency mobile connections.

## Certificates and the chain of trust
A **Certificate Authority (CA)** — like Let's Encrypt, DigiCert, or Sectigo — cryptographically signs a server's certificate, vouching "we verified this public key belongs to example.com." Your browser ships with a built-in list of trusted root CAs; if a certificate chains up to one of those roots, the browser trusts it. This is why a self-signed certificate triggers a warning: no trusted CA vouched for it.

## Where TLS sits
TLS operates conceptually between the Transport and Application layers (roughly OSI's Presentation layer) — it wraps around whatever application protocol is running (HTTP → HTTPS, SMTP → SMTPS, etc.), which is why the same TLS machinery secures far more than just web traffic.

> **Interview tip:** The line that shows real understanding: "asymmetric crypto is used only to *safely exchange* a symmetric key; the actual data transfer uses symmetric encryption because it's dramatically faster." That single sentence answers most follow-up questions about "why not just use asymmetric encryption for everything."
	`
	},

	WebSockets: {
		definition:
			'A protocol that establishes a persistent, full-duplex communication channel over a single TCP connection, allowing the client and server to send messages to each other at any time without repeated request/response overhead.',
		useCase:
			'A live chat application uses a WebSocket so new messages from other users are pushed to your screen instantly, instead of your browser having to repeatedly ask "any new messages yet?"',
		detailedMarkdown: `
# WebSockets

Regular HTTP is a strict **request/response** protocol: the client always initiates, the server always replies, and the connection is typically closed (or reused briefly) afterward. That model is awkward for anything that needs real-time, server-initiated updates. **WebSockets** fix this by upgrading a single TCP connection into a **full-duplex** channel — both sides can send messages independently, at any time, for as long as the connection stays open.

## The handshake: starting as HTTP, then upgrading
A WebSocket connection is cleverly bootstrapped *through* an ordinary HTTP request so it can reuse existing infrastructure (ports, proxies, firewalls):

\`\`\`http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
\`\`\`

If the server supports it, it responds:
\`\`\`http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
\`\`\`

The **101 Switching Protocols** response is the key moment: from here on, the same underlying TCP connection stops speaking HTTP entirely and starts speaking the lightweight WebSocket framing protocol (\`ws://\` or, encrypted, \`wss://\`).

## HTTP request/response vs. WebSockets

| | HTTP | WebSocket |
|-------------------|--------------------------------|------------------------------------|
| Direction | Client always initiates | Either side can send anytime |
| Connection | Typically short-lived per request | Long-lived, persistent |
| Overhead per message | Full headers every request | Minimal framing after handshake |
| Best for | Traditional request-driven APIs | Real-time, bidirectional updates |

## Why not just poll with HTTP?
Before WebSockets, "real-time-ish" apps used **polling** (repeatedly asking "anything new?" every few seconds) or **long polling** (server holds the request open until it has something to say). Both work but waste bandwidth and add latency compared to a connection that's simply *already open* and ready to push data the instant it exists.

## Common use cases
- **Chat applications** — messages pushed instantly to all participants.
- **Live collaborative editing** — Google Docs-style simultaneous edits.
- **Live dashboards / stock tickers / sports scores** — server pushes updates as they happen.
- **Multiplayer games** — low-latency bidirectional state sync.
- **Notifications** — push alerts without the client needing to ask.

## Trade-offs to mention in an interview
WebSockets keep a connection open per client, which is more stateful and resource-intensive on the server than stateless HTTP request handling — this affects load balancing (you often need sticky routing or a shared pub/sub layer like Redis so any server instance can reach any connected client) and scaling strategy. For simpler "server occasionally has new data" cases, **Server-Sent Events (SSE)** — a one-way, server-to-client push over plain HTTP — is often a lighter-weight alternative when you don't need the client to push data back.

> **Interview tip:** Emphasize the **101 Switching Protocols** handshake detail — it shows you understand WebSockets aren't a totally separate protocol bolted onto the web, but a deliberate, backward-compatible upgrade path built on top of HTTP's own semantics.
	`
	},

	'REST APIs': {
		definition:
			'REST (Representational State Transfer) is an architectural style for designing networked APIs around stateless, resource-based interactions using standard HTTP methods and URLs.',
		useCase:
			'Designing a bookstore API where books are resources at predictable URLs like /books/123, manipulated with GET/POST/PUT/DELETE instead of custom action-named endpoints.',
		detailedMarkdown: `
# REST APIs

**REST** isn't a protocol or a standard — it's an **architectural style** described by Roy Fielding in his 2000 dissertation, built around a set of constraints that, when followed, make APIs predictable, scalable, and cacheable. An API that follows these constraints is called "RESTful."

## The core constraints
1. **Client-server separation** — the client and server evolve independently; the client doesn't need to know how the server stores data, and the server doesn't need to know how the client renders it.
2. **Statelessness** — every request must contain all the information needed to process it (auth token, parameters, etc.). The server holds no session state about "where the client is" between requests.
3. **Cacheability** — responses must explicitly (via headers) say whether they can be cached, enabling clients/proxies/CDNs to reuse responses and reduce load.
4. **Uniform interface** — a consistent way of interacting with resources: identify them via URLs, manipulate them via standard HTTP methods, and represent them in a standard format (usually JSON).
5. **Layered system** — clients can't tell (and shouldn't need to) whether they're talking directly to the origin server or through intermediaries like proxies, load balancers, or gateways.
6. **Code on demand** (optional) — servers can occasionally send executable code to the client (e.g. JavaScript), rarely relevant in typical API discussions.

## Resource-based URLs
REST models everything as a **resource**, identified by a URL (a "noun," not a "verb"), and uses HTTP methods to express the action:

| Good (RESTful) | Not RESTful |
|-----------------------------|--------------------------------|
| \`GET /users/42\` | \`GET /getUser?id=42\` |
| \`POST /users\` | \`GET /createUser?name=Ada\` |
| \`PUT /users/42\` | \`POST /updateUser\` |
| \`DELETE /users/42\` | \`POST /deleteUser?id=42\` |
| \`GET /users/42/orders\` | \`GET /getOrdersForUser?id=42\` |

Nesting resources under their parent (\`/users/42/orders\`) expresses relationships naturally within the URL structure.

## Statelessness in practice
Because the server keeps no memory of previous requests, every request from an authenticated client typically includes an auth token (e.g. a Bearer JWT in the \`Authorization\` header) rather than relying on server-side session state tied to that one connection. This is what makes REST APIs trivially horizontally scalable — any server instance behind a load balancer can handle any request, since no server needs to "remember" the client.

## Why REST won
It maps naturally onto HTTP's existing verbs, status codes, and caching semantics rather than inventing new machinery, it's human-readable (JSON over URLs), and it scales well precisely because of the statelessness and cacheability constraints — which is why it became the dominant style for public web APIs, even though newer alternatives like GraphQL and gRPC exist for specific trade-offs (see those topics).

> **Interview tip:** If asked "what makes an API RESTful," don't just say "it uses GET/POST/PUT/DELETE" — that's necessary but not sufficient. Statelessness and resource-orientation are the constraints interviewers actually want to hear you articulate.
	`
	},

	'GraphQL Basics': {
		definition:
			'A query language and runtime for APIs, developed by Facebook, that lets clients request exactly the fields they need — no more, no less — from a single endpoint, instead of being locked into a server-defined response shape per endpoint.',
		useCase:
			"A mobile app screen needs a user's name and their last 3 order totals; instead of hitting 3 separate REST endpoints and combining the results, one GraphQL query fetches exactly that shape in a single round trip.",
		detailedMarkdown: `
# GraphQL Basics

**GraphQL** flips the usual API model: instead of the *server* deciding what shape each endpoint returns, the *client* specifies exactly what data it wants, and the server returns precisely that — nothing more, nothing less. There's typically just **one endpoint** (e.g. \`/graphql\`), and the "routing" happens inside the query itself.

## The three operation types
- **Query** — read data (the GraphQL equivalent of a REST GET).
  \`\`\`graphql
  query {
    user(id: 42) {
      name
      orders(last: 3) {
        total
      }
    }
  }
  \`\`\`
  The response mirrors the shape of the query exactly — \`{"user": {"name": "Ada", "orders": [{"total": 29.99}, ...]}}\`.
- **Mutation** — write data (create/update/delete), the equivalent of REST's POST/PUT/PATCH/DELETE.
  \`\`\`graphql
  mutation {
    updateUser(id: 42, name: "Ada Lovelace") {
      id
      name
    }
  }
  \`\`\`
- **Schema** — a strongly-typed contract, written in GraphQL's **Schema Definition Language (SDL)**, that declares every type, field, and operation the API supports. Clients can introspect this schema to know exactly what's queryable, which is what powers tools like GraphiQL and strong client-side typing.

## The problem it solves: over-fetching and under-fetching
- **Over-fetching**: a REST endpoint like \`GET /users/42\` might return 30 fields when the client only needed 2 (name and avatar), wasting bandwidth — especially painful on mobile.
- **Under-fetching (the N+1 problem)**: if you need a user *and* their orders *and* each order's line items, REST often forces multiple round trips (\`/users/42\`, then \`/users/42/orders\`, then per-order \`/orders/x/items\`) since no single endpoint returns that whole nested shape.

GraphQL solves both by letting the client describe the exact nested shape it needs in one request, resolved server-side in one round trip.

## REST vs. GraphQL

| | REST | GraphQL |
|--------------------|---------------------------------------|-------------------------------------------|
| Endpoints | Many (one per resource/action) | One |
| Response shape | Fixed per endpoint | Defined by the client's query |
| Over/under-fetching | Common | Largely eliminated |
| Caching | Simple (HTTP caching by URL) | Harder (single endpoint, POST-based, needs custom caching strategy) |
| Learning curve | Low, uses plain HTTP semantics | Higher, requires schema design and a query language |
| Versioning | Often via URL/header versions (\`/v2/users\`) | Typically evolves the schema instead (add fields, deprecate old ones) |

## Trade-offs to raise in an interview
GraphQL's flexibility comes at a cost: since everything goes through one endpoint (usually via POST), you lose free HTTP-level caching by URL, and a poorly-designed nested query can trigger a lot of expensive backend resolution (a classic "N+1 query" problem at the *database* level unless you use batching tools like **DataLoader**). It's also easy for a client to accidentally request an enormous, expensive query, which is why production GraphQL APIs typically add query complexity limits and depth limits.

> **Interview tip:** The strongest one-line summary: "REST optimizes for simple, cacheable, uniform resources; GraphQL optimizes for flexible, client-driven data shapes at the cost of caching simplicity and added backend complexity." Naming that trade-off explicitly is what interviewers want.
	`
	},

	'gRPC Basics': {
		definition:
			'A high-performance, open-source RPC (Remote Procedure Call) framework from Google that uses Protocol Buffers for compact binary serialization and HTTP/2 for transport, commonly used for fast service-to-service communication.',
		useCase:
			'Two internal microservices — an order service and an inventory service — communicate via gRPC because both are written in-house, performance matters, and a strict, code-generated contract between them is more valuable than human readability.',
		detailedMarkdown: `
# gRPC Basics

**gRPC** ("gRPC Remote Procedure Calls") lets you define a service's methods as if you were calling a local function, while the framework handles serializing the call, sending it over the network, and deserializing the response on the other side. It's built on two key technologies: **Protocol Buffers** and **HTTP/2**.

## Protocol Buffers (protobuf)
Instead of JSON, gRPC uses **Protocol Buffers** — a binary serialization format defined by a strict schema in a \`.proto\` file:

\`\`\`proto
syntax = "proto3";

service OrderService {
  rpc GetOrder (OrderRequest) returns (OrderResponse);
}

message OrderRequest {
  int32 order_id = 1;
}

message OrderResponse {
  int32 order_id = 1;
  string status = 2;
  double total = 3;
}
\`\`\`

From this one \`.proto\` file, gRPC tooling **generates client and server code** in many languages (Go, Java, Python, etc.), giving both sides a strongly-typed, compiler-checked contract. The binary encoding is dramatically smaller and faster to parse than JSON's text-based encoding — no field names are sent over the wire, just numbered, typed values.

## HTTP/2 as the transport
gRPC runs on **HTTP/2**, which brings:
- **Multiplexing** — many independent request/response streams over a single TCP connection, no head-of-line blocking between them.
- **Header compression** — reduces per-request overhead.
- **Native bidirectional streaming** — not just single request/response, but four call patterns:
  1. **Unary** — one request, one response (like a normal function call).
  2. **Server streaming** — one request, a stream of responses (e.g. subscribing to price updates).
  3. **Client streaming** — a stream of requests, one final response (e.g. uploading chunks of a file).
  4. **Bidirectional streaming** — both sides stream independently (e.g. a live chat or collaborative session).

## gRPC vs. REST vs. GraphQL

| | REST | GraphQL | gRPC |
|-----------------|------------------------|---------------------------|--------------------------------|
| Format | JSON (text) | JSON (text) | Protobuf (binary) |
| Transport | HTTP/1.1 typically | HTTP typically | HTTP/2 |
| Contract | Loose (OpenAPI optional) | Strong (schema) | Strong (generated code) |
| Human-readable | Yes | Yes | No (binary) |
| Streaming | Limited | Limited (subscriptions) | Native, 4 modes |
| Best for | Public-facing APIs | Client-driven flexible queries | Internal service-to-service calls |
| Browser support | Native | Native | Limited (needs gRPC-Web proxy) |

## Why microservices favor gRPC internally
Between your own backend services, you control both ends of the contract, performance and low latency genuinely matter at scale, and human-readability is far less important than it is for a public API a third-party developer might inspect in their browser's network tab. gRPC's strict, generated contracts also catch mismatches (wrong field type, missing field) at compile time rather than at runtime — a real advantage across a large team maintaining many services.

## Where it falls short
Because it's binary and depends on HTTP/2 (and code generation), gRPC is awkward to call directly from a browser (requires a translation layer like **gRPC-Web**) and hard to debug by eye compared to a JSON REST call you can just read in curl output — which is exactly why public-facing APIs still overwhelmingly choose REST or GraphQL.

> **Interview tip:** A clean way to summarize all three: REST = simple and universal, GraphQL = flexible client-driven queries, gRPC = fast, strongly-typed, streaming-capable internal communication. Knowing *when* to reach for each shows more maturity than declaring one "better."
	`
	},

	'Cookies vs Sessions': {
		definition:
			'Cookies are small pieces of data stored on the client by the browser and sent back with every request to the originating domain; sessions store user state on the server, typically referenced by a session ID stored in a cookie.',
		useCase:
			'After you log in, the server creates a session record (in memory or Redis) and sends your browser a cookie containing only the session ID — every subsequent request includes that cookie so the server knows who you are.',
		detailedMarkdown: `
# Cookies vs. Sessions

HTTP is stateless (see "HTTP/HTTPS"), yet almost every website needs to remember who you are across requests — that "you're logged in" feeling. Cookies and sessions are the classic mechanism for faking state on top of a stateless protocol.

## Cookies: state lives on the client
A **cookie** is a small key-value pair the server tells the browser to store (via a \`Set-Cookie\` response header), which the browser then automatically re-attaches to every future request to that domain (via a \`Cookie\` request header).

\`\`\`http
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
\`\`\`
Key attributes:
- **HttpOnly** — JavaScript can't read this cookie (mitigates XSS token theft).
- **Secure** — only sent over HTTPS.
- **SameSite** — restricts whether the cookie is sent on cross-site requests (helps prevent CSRF).
- **Max-Age/Expires** — how long the cookie persists.

Cookies can hold actual data directly (rare, and risky if unencrypted/unsigned) or, far more commonly, just an opaque **identifier**.

## Sessions: state lives on the server
A **session** is the actual user state — cart contents, login status, preferences — stored **server-side** in memory, a database, or a shared store like **Redis**. The client only ever holds a **session ID** (usually inside a cookie), which the server looks up on every request to retrieve the associated state.

\`\`\`text
Browser cookie:  session_id=abc123
Server-side store:
  abc123 → { userId: 42, cartItems: [...], loggedInAt: ... }
\`\`\`

## Putting it together
| | Cookie | Session |
|---------------------|----------------------------------|-------------------------------------------|
| Where state lives | Client (browser) | Server (memory/DB/Redis) |
| What client holds | The actual data, or an ID | Just an ID (referencing server-side data) |
| Size limits | ~4KB per cookie | Effectively unlimited (server storage) |
| Security if compromised | Directly exposes whatever's stored | Only exposes the ID — attacker still needs a valid, unexpired session to do damage, though session hijacking is still a real risk |
| Scaling concern | None — client stores it | Server(s) need a shared session store to work across multiple backend instances |

## Why the shared-store detail matters
If your app runs behind a load balancer with multiple backend servers, and sessions are stored in each server's local memory, a client whose requests get routed to a *different* server than the one that created their session will appear logged out. Fixes are either **sticky sessions** at the load balancer (see "Load Balancer") or, more scalably, storing sessions in a shared store like Redis that every backend instance can read.

## The stateless alternative: JWTs
A **JWT (JSON Web Token)** takes a different approach entirely: instead of an opaque ID pointing to server-side state, the token itself is **self-contained** — it holds the actual claims (user ID, roles, expiry) and is cryptographically signed so the server can trust it without looking anything up. This eliminates the need for a shared session store (great for stateless, horizontally-scaled APIs), but trades away easy **revocation** — you can't simply "delete a session" server-side for a JWT that's already been issued and hasn't expired yet, without extra machinery like a blocklist.

> **Interview tip:** If asked "cookies vs. sessions vs. JWT," the crisp framing is: cookies are the *transport* (how data physically gets to the browser and back), sessions are *server-side stateful* storage referenced by that transport, and JWTs are a *stateless* alternative that skips server-side storage entirely by making the token self-verifying.
	`
	},

	CORS: {
		definition:
			'Cross-Origin Resource Sharing is a browser security mechanism, built on top of the same-origin policy, that lets a server explicitly grant permission for web pages on other origins to make requests to it.',
		useCase:
			"A frontend running on https://app.example.com calls an API at https://api.example.com — the browser blocks the response unless api.example.com's server sends back an Access-Control-Allow-Origin header permitting that origin.",
		detailedMarkdown: `
# CORS (Cross-Origin Resource Sharing)

Browsers enforce the **same-origin policy**: by default, JavaScript running on one origin cannot read the response of a request made to a *different* origin. **CORS** is the standardized mechanism that lets a server deliberately relax that restriction for specific origins.

## What counts as "same origin"
An origin is the combination of **scheme + host + port**. Any difference makes it a different origin:

| URL A | URL B | Same origin? |
|------------------------------|------------------------------|---------------|
| \`https://example.com\` | \`http://example.com\` | No (scheme differs) |
| \`https://example.com\` | \`https://api.example.com\` | No (host differs) |
| \`https://example.com\` | \`https://example.com:8443\` | No (port differs) |
| \`https://example.com/a\` | \`https://example.com/b\` | Yes (path doesn't matter) |

This is exactly why a React app on \`localhost:3000\` calling an API on \`localhost:8000\` is a **cross-origin** request, even though both are "localhost."

## Simple requests vs. preflighted requests
Not every cross-origin request triggers extra checking. A request qualifies as **"simple"** (no preflight) only if it uses \`GET\`/\`POST\`/\`HEAD\`, only "safe" headers, and (for POST) a content type of \`application/x-www-form-urlencoded\`, \`multipart/form-data\`, or \`text/plain\`.

Anything else — a \`PUT\`/\`DELETE\`/\`PATCH\`, a custom header like \`Authorization\` or \`Content-Type: application/json\`, etc. — triggers a **preflight**: the browser automatically sends an \`OPTIONS\` request *before* the real one, asking the server for permission.

\`\`\`http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization
\`\`\`

If the server responds with the right permissive headers, the browser then sends the actual request:
\`\`\`http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
\`\`\`

## Key response headers
| Header | Purpose |
|---------------------------------|-----------------------------------------------------|
| \`Access-Control-Allow-Origin\` | Which origin(s) may access the response (a specific origin, or \`*\` for any) |
| \`Access-Control-Allow-Methods\` | Which HTTP methods are permitted |
| \`Access-Control-Allow-Headers\` | Which request headers are permitted |
| \`Access-Control-Allow-Credentials\` | Whether cookies/auth headers can be included (requires a specific origin, never \`*\`) |
| \`Access-Control-Max-Age\` | How long the browser can cache this preflight result |

## Common errors developers hit
- **"No 'Access-Control-Allow-Origin' header is present"** — the backend simply never sent CORS headers at all; it's the single most common CORS error.
- **Preflight succeeds but the real request fails** — usually means the actual response is missing headers that match what was promised in the preflight (e.g. allowed methods don't match).
- **Credentials (cookies) not being sent** — requires *both* the client (\`fetch(url, { credentials: 'include' })\`) *and* the server (\`Access-Control-Allow-Credentials: true\` with a specific, non-wildcard origin) to opt in.

## An important clarification
CORS is a **browser-enforced** mechanism, not a server-side security boundary — a server's API is not "protected" by CORS; a non-browser client (curl, another server, Postman) simply ignores it entirely. CORS only governs whether *browser JavaScript* running on someone else's page is allowed to read your API's response.

> **Interview tip:** The single most valuable clarification to volunteer: CORS is enforced by the *browser*, not the server, and it's about protecting *users* from malicious pages silently reading data from sites they're logged into — not about protecting your API from unauthorized programmatic access.
	`
	}
};
