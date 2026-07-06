import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Validation
  // - Pagination
  // - Filtering
  // - Sorting
  // - File Upload
  // - Logging
  // - API Versioning
  // - Rate Limiting
 */
export const BackendApiDesignContent: RoadmapDetailMap = {
	Validation: {
		definition:
			'The process of checking that incoming request data matches expected types, formats, and business rules before it is allowed to reach business logic or the database.',
		useCase:
			'Rejecting a "create account" request with a 422 and field-level error messages when the email is malformed or the password is too short, before a single query touches the database.',
		detailedMarkdown: `
# Validation

**Validation** is the gate that sits between "data the client sent" and "data your business logic is allowed to trust." A well-designed API validates every request body, query param, and path param at the edge, so that everything downstream — services, repositories, the database — can assume the shape of the data is already correct.

## Where Validation Happens in the Request Pipeline
\`\`\`
Client Request
      │
      ▼
┌─────────────────┐
│  Middleware /    │   ← parses JSON, checks auth
│  Router          │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Schema/DTO      │   ← VALIDATION HAPPENS HERE
│  Validation      │      (reject bad shape with 422 before anything else runs)
└─────────────────┘
      │  (only valid data passes through)
      ▼
┌─────────────────┐
│  Controller /    │
│  Service Logic   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Database        │
└─────────────────┘
\`\`\`

The key idea: validation is a **fail-fast boundary**. If the request is malformed, you want to know in microseconds, before spinning up a database connection or calling a third-party API.

## Schema-Based Validation (Zod-style)
Modern APIs rarely hand-write a pile of \`if\` statements. Instead, they declare a **schema** once and let a library enforce it:

\`\`\`ts
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  age: z.number().int().positive().optional()
});

app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(422).json({
      error: 'ValidationError',
      details: result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message
      }))
    });
  }

  // result.data is now fully typed and trustworthy
  createUser(result.data);
});
\`\`\`

The schema doubles as **documentation** (this endpoint accepts exactly these fields) and as a **type source** in TypeScript-based stacks — the validated \`result.data\` is inferred to have the correct shape, so the compiler catches mistakes if you later try to access a field that was never in the schema.

## Client-Side vs. Server-Side Validation
| | Client-Side | Server-Side |
|---|---|---|
| **Purpose** | Fast feedback, better UX (red border before submit) | The actual security/data-integrity boundary |
| **Can be bypassed?** | Yes — trivially, via \`curl\`, Postman, or browser dev tools | No — it's the last line of defense |
| **Trust level** | None. Assume it was never run. | Absolute. This is the only validation that counts. |

The rule every backend engineer internalizes: **never trust the client.** Client-side validation is a UX nicety; it prevents round-trips for obviously bad input. It is never a substitute for server-side validation, because any client-side check can be skipped entirely by someone hitting the endpoint directly.

## The 422 Error Shape
A well-designed API returns a consistent, machine-parseable error body so frontend code can map errors straight to form fields:

\`\`\`json
{
  "error": "ValidationError",
  "details": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
\`\`\`

\`422 Unprocessable Entity\` is the semantically correct status: the request was well-formed JSON (not a \`400\`), but its *contents* fail business rules. Some APIs use \`400\` for both cases — either is defensible as long as it's consistent across the whole API.

## Validation vs. Sanitization
These are related but distinct:
- **Validation** rejects input that doesn't meet the rules (return an error).
- **Sanitization** *transforms* input to make it safe or normalized (e.g., trimming whitespace, stripping HTML tags, lowercasing an email) without necessarily rejecting the request.

## Gotchas
- **Whitelist, don't blacklist fields.** Only accept the exact fields your schema defines; silently ignoring or explicitly rejecting unexpected fields (like an \`isAdmin: true\` slipped into a signup payload) prevents **mass assignment vulnerabilities**.
- **Validate at every trust boundary**, not just the outermost API layer — an internal service called by other internal services should still validate its own inputs.
- Validation is also your first defense against injection-style attacks (a field that should be a UUID and isn't should never reach a query) — see the Security section on parameterized queries for the second layer of defense.
	`
	},

	Pagination: {
		definition:
			'A technique for splitting a large result set into smaller, sequential chunks that a client can request one page at a time, most commonly implemented as offset-based or cursor-based pagination.',
		useCase:
			'Returning a social media feed 20 posts at a time instead of shipping ten thousand rows in a single response.',
		detailedMarkdown: `
# Pagination

Any endpoint that can return an unbounded number of rows — a product catalog, a list of orders, a social feed — needs **pagination**, or a single client request could try to pull millions of rows and take down your database and your response payload size at the same time.

## Offset-Based Pagination
The intuitive approach: tell the database to skip \`N\` rows and return the next \`limit\`.

\`\`\`
GET /products?page=3&limit=20
\`\`\`

\`\`\`sql
SELECT * FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;   -- page 3, 20 per page: skip the first 40 rows
\`\`\`

Response:
\`\`\`json
{
  "data": [ { "id": 41, "name": "..." }, ... ],
  "page": 3,
  "limit": 20,
  "totalItems": 542,
  "totalPages": 28
}
\`\`\`

This is simple to implement and lets a UI jump straight to "page 10" or show a total page count — but it has two real problems at scale:

1. **Performance degrades with large offsets.** \`OFFSET 1000000\` still forces the database to scan and discard the first million rows before it can return anything; the further into the result set you paginate, the slower every page gets.
2. **Consistency issues with concurrent writes.** If a row is inserted or deleted between page 1 and page 2 requests, the "window" shifts — a user can see the same row twice, or skip a row entirely, because \`OFFSET\` is purely positional, not tied to any stable value.

## Cursor-Based Pagination
Instead of "skip N rows," a cursor says "give me everything *after* this specific row," using a stable, unique, ordered column (commonly the primary key or \`created_at\` + \`id\` as a tiebreaker) as the bookmark:

\`\`\`
GET /products?limit=20&cursor=eyJpZCI6NDF9
\`\`\`

\`\`\`sql
SELECT * FROM products
WHERE id > 41   -- decoded from the cursor
ORDER BY id ASC
LIMIT 20;
\`\`\`

Response:
\`\`\`json
{
  "data": [ { "id": 42, "name": "..." }, ... ],
  "nextCursor": "eyJpZCI6NjEsImNyZWF0ZWRBdCI6IjIwMjYtMDctMDEifQ==",
  "hasMore": true
}
\`\`\`

The cursor is typically an opaque, base64-encoded token (e.g., encoding \`{"id": 61}\`) so clients treat it as a black box instead of constructing it themselves. Because the query is always \`WHERE id > lastSeenId\`, it can use an **index** on that column efficiently no matter how deep into the dataset you are, and rows inserted elsewhere in the table don't shift the window you're paging through.

## Side-by-Side Comparison
| | Offset-Based | Cursor-Based |
|---|---|---|
| **Query pattern** | \`LIMIT/OFFSET\` | \`WHERE id > lastId LIMIT n\` |
| **Performance on deep pages** | Degrades — must scan/discard skipped rows | Stays fast — uses an index seek |
| **Consistency under concurrent writes** | Can skip or duplicate rows if data changes mid-pagination | Stable — new/deleted rows elsewhere don't shift your position |
| **"Jump to page N"** | Easy | Not supported — cursors are inherently sequential |
| **Total count / total pages** | Easy to compute (\`COUNT(*)\`) | Awkward — usually omitted or estimated separately |
| **Implementation complexity** | Low | Higher — needs a stable sort key and opaque token encoding |
| **Best for** | Admin dashboards, small-to-medium tables, "jump to page" UX | Infinite-scroll feeds, large/high-write tables, public APIs |

## Choosing Between Them
Reach for **offset pagination** on internal admin tools or smaller tables where "page 7 of 40" navigation matters more than perfect consistency. Reach for **cursor pagination** for public APIs and any large, frequently-written table — most large-scale APIs (Stripe, GitHub, Slack) default to cursor-based pagination for exactly this reason.

## Interview Tip
If asked "why not just always use offset pagination?", the sharp answer references both failure modes together: **large offsets are slow because the database still has to walk past every skipped row, and results become inconsistent the moment the underlying data changes between requests** — cursor pagination fixes both by anchoring to a real, indexed value instead of a positional count.
	`
	},

	Filtering: {
		definition:
			'The mechanism by which clients narrow down a collection endpoint to only the resources matching certain criteria, typically expressed as query parameters that translate into a database WHERE clause.',
		useCase:
			'Letting a client request `GET /orders?status=shipped&minTotal=50` to fetch only shipped orders worth at least $50, instead of downloading every order and filtering client-side.',
		detailedMarkdown: `
# Filtering

**Filtering** lets a client ask for a *subset* of a collection resource by describing criteria in the request, rather than fetching everything and filtering in application code (which wastes bandwidth, memory, and database work).

## Basic Query Param Conventions
The most common convention maps each filterable field directly to a query parameter:

\`\`\`
GET /products?status=active&minPrice=10&maxPrice=50&category=electronics
\`\`\`

On the server, each recognized param becomes a condition appended to the query:

\`\`\`sql
SELECT * FROM products
WHERE status = 'active'
  AND price >= 10
  AND price <= 50
  AND category = 'electronics';
\`\`\`

In code, this is usually built up dynamically based on which params were actually present in the request:

\`\`\`ts
function buildProductQuery(filters: ProductFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    conditions.push('status = $' + (params.length + 1));
    params.push(filters.status);
  }
  if (filters.minPrice !== undefined) {
    conditions.push('price >= $' + (params.length + 1));
    params.push(filters.minPrice);
  }
  // ...

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  return { sql: \`SELECT * FROM products \\\${where}\`, params };
}
\`\`\`

## Guarding Against SQL Injection
Notice the example above builds the SQL *structure* dynamically (which columns to filter on) but never interpolates the *values* directly into the query string. The values are always passed as **parameterized placeholders** (\`$1\`, \`$2\`, ...) that the database driver binds safely, no matter what a malicious client sends as \`category\`:

\`\`\`ts
// DANGEROUS — never do this:
const sql = \`SELECT * FROM products WHERE category = '\\\${req.query.category}'\`;
// A client sending category=x' OR '1'='1 turns this into a full table dump.

// SAFE — parameterized query:
db.query('SELECT * FROM products WHERE category = $1', [req.query.category]);
\`\`\`

This is the same defense covered in depth in the Security section on SQL injection: **the query shape can be built dynamically, but user-supplied values must always travel through parameter binding, never string concatenation.**

## Validating Filter Values
Filtering and validation go hand-in-hand — a \`status\` filter should be checked against an enum of legal values, and \`minPrice\`/\`maxPrice\` should be validated as numbers, *before* they're used to build a query. Silently accepting garbage input (or accepting arbitrary column names from the client) is how filtering endpoints become injection vectors or crash with database errors.

## Richer Filter DSLs
Simple key-value query params work well until clients need operators beyond equality — "greater than," "not equal," "in this list." A common pattern borrowed from JSON:API and similar specs nests the operator into the param name:

\`\`\`
GET /orders?filter[status][eq]=shipped&filter[total][gte]=50&filter[total][lte]=200
\`\`\`

This parses into a structured filter object server-side:

\`\`\`json
{
  "status": { "eq": "shipped" },
  "total": { "gte": 50, "lte": 200 }
}
\`\`\`

...which a small mapping layer translates into SQL operators (\`=\`, \`>=\`, \`<=\`, \`IN\`, etc.), still through parameterized values. Some APIs go further and accept a raw query language (GraphQL's \`where\` input types, MongoDB-style operators like \`?price[gt]=10\`), but the underlying principle never changes: **whitelist which fields and operators are filterable, and always bind values as parameters — never string-interpolate them into the query.**

## Practical Gotchas
- **Don't expose raw column names as the filter contract** — map public filter names to internal columns explicitly, so a database refactor (renaming a column) doesn't break your public API.
- **Cap the number of filters / combinations** a single request can apply, to avoid pathological queries that force a full table scan.
- **Index the columns you allow filtering on** — an unindexed \`WHERE\` clause on a large table is a silent performance cliff (see the Indexes topic in the Databases section).
	`
	},

	Sorting: {
		definition:
			'A mechanism for letting clients control the order in which a collection of results is returned, typically via a query parameter naming one or more fields and their direction.',
		useCase:
			'Letting a client request `GET /products?sort=-price,name` to see the most expensive products first, with ties broken alphabetically by name.',
		detailedMarkdown: `
# Sorting

**Sorting** lets the client decide the order of a result set, instead of the API always returning rows in whatever order the database happens to store them (which is undefined unless you explicitly sort).

## The \`?sort=\` Convention
A widely-used convention borrowed from JSON:API represents each sort field as a comma-separated list, with a leading \`-\` meaning descending order:

\`\`\`
GET /products?sort=-createdAt,name
\`\`\`

This reads as: "sort by \`createdAt\` descending (newest first), and for any rows that tie on \`createdAt\`, break the tie by \`name\` ascending." It maps directly onto a SQL \`ORDER BY\`:

\`\`\`sql
SELECT * FROM products
ORDER BY created_at DESC, name ASC;
\`\`\`

Server-side, you parse the string into structured sort instructions and — critically — **whitelist the sortable fields** so a client can't sort by an arbitrary or unindexed column:

\`\`\`ts
const SORTABLE_FIELDS = new Set(['createdAt', 'name', 'price']);

function parseSort(sortParam: string) {
  return sortParam.split(',').map((field) => {
    const desc = field.startsWith('-');
    const key = desc ? field.slice(1) : field;

    if (!SORTABLE_FIELDS.has(key)) {
      throw new ValidationError(\`Cannot sort by '\\\${key}'\`);
    }
    return { field: key, direction: desc ? 'DESC' : 'ASC' };
  });
}
\`\`\`

## Multi-Field Sorting and Tiebreakers
A single sort field rarely produces a fully deterministic order — two products can have the same \`price\`. Chaining a second field as a tiebreaker (\`sort=-price,name\`) guarantees a stable, reproducible order across requests, which matters a lot once sorting is combined with pagination: an unstable sort order can cause rows to be skipped or duplicated across pages, the same class of bug discussed under cursor pagination.

## Sorting and Indexing
This is the part interviewers probe hardest: **an \`ORDER BY\` on an unindexed column forces the database to load and sort the entire matching result set in memory (or on disk) before returning anything** — a filesort. On a table with a few hundred rows, nobody notices. On a table with tens of millions of rows, it's a multi-second query that hammers CPU and I/O.

The fix is the same one used for filtering: put a **B-tree index** on the columns you allow sorting by (see the Indexes topic in the Databases section). A composite index on \`(status, created_at)\` doesn't just speed up \`WHERE status = 'active'\` — the database can often walk that same index in pre-sorted order to satisfy \`ORDER BY created_at\` for free, avoiding a separate sort step entirely.

\`\`\`sql
-- This composite index serves both the filter AND the sort in one index scan:
CREATE INDEX idx_products_status_created ON products (status, created_at DESC);

SELECT * FROM products
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;
\`\`\`

## Practical Gotchas
- **Never let clients sort by unindexed or unexpected columns** — always validate against a whitelist, exactly like filtering.
- **Combine sort direction with pagination cursors carefully** — a cursor encodes "position in this specific sort order," so changing the sort mid-pagination invalidates any cursor issued under the old order.
- **Document the default sort** when no \`?sort=\` param is given — clients rely on it being stable, even if it's just "insertion order" or "primary key ascending."
	`
	},

	'File Upload': {
		definition:
			'The process of accepting binary file data from a client, either by streaming it through the API server (multipart/form-data) or by having the client upload directly to object storage via a temporary presigned URL.',
		useCase:
			'Letting users upload a profile photo or a multi-gigabyte video without routing that entire payload through your application servers.',
		detailedMarkdown: `
# File Upload

Uploading files is deceptively tricky: naive implementations route every byte of every file through your API server, which works fine for small avatars and falls over completely for large video or dataset uploads.

## Option 1: \`multipart/form-data\` Through the API Server
The traditional HTML-form-friendly approach: the client sends the file as part of a multipart request body, and your server reads it directly.

\`\`\`
POST /avatar
Content-Type: multipart/form-data; boundary=----abc123

------abc123
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

<binary bytes>
------abc123--
\`\`\`

\`\`\`ts
app.post('/avatar', upload.single('file'), (req, res) => {
  // req.file.buffer (or a temp path) now holds the uploaded bytes
  saveToStorage(req.file.buffer);
  res.status(201).json({ url: '...' });
});
\`\`\`

This is simple and works well for small files (profile pictures, documents under a few MB), but every byte the client sends passes through — and consumes memory/CPU on — your application server. For a 2 GB video, that's 2 GB of load your API process now has to absorb per upload, multiplied by however many uploads happen concurrently.

## Option 2: Direct-to-Storage via Presigned URLs
For anything beyond small files, the standard production pattern is to have the client upload **directly** to an object store (Amazon S3, Google Cloud Storage, Cloudflare R2) using a short-lived **presigned URL** that your API generates but never touches the file bytes for.

**Flow:**
1. Client asks your API: "I want to upload \`video.mp4\`."
2. Your API generates a **presigned URL** — a temporary, cryptographically-signed URL scoped to exactly that object key, with a short expiry (e.g., 5 minutes) — and returns it, *without* the file ever reaching your server.
3. The client uploads the file **directly to S3** using that URL (a plain HTTP \`PUT\`).
4. The client notifies your API that the upload finished (or S3 fires an event/webhook your API listens for).
5. Your API records the file's metadata in the database.

\`\`\`
Client                     Your API                    S3 / Object Storage
  │                            │                              │
  │──POST /uploads/request────▶│                              │
  │                            │──generate presigned PUT URL──▶│ (no file bytes yet)
  │◀───{ uploadUrl, key }──────│                              │
  │                                                            │
  │──────────────PUT <file bytes> directly to uploadUrl───────▶│
  │◀─────────────────────200 OK────────────────────────────────│
  │                            │                              │
  │──POST /uploads/complete───▶│                              │
  │      { key }               │──save metadata to DB          │
\`\`\`

\`\`\`ts
// Your API never sees the file bytes — just issues the signed URL:
app.post('/uploads/request', async (req, res) => {
  const key = \`uploads/\\\${userId}/\\\${crypto.randomUUID()}-\\\${req.body.filename}\`;
  const uploadUrl = await s3.getSignedUrl('putObject', {
    Bucket: 'my-app-uploads',
    Key: key,
    Expires: 300, // 5 minutes
    ContentType: req.body.contentType
  });
  res.json({ uploadUrl, key });
});
\`\`\`

This scales dramatically better: your API servers stay lightweight (they just issue a signed URL), and the object store — designed to absorb massive parallel upload traffic — does the heavy lifting.

## Comparison
| | Through App Server (\`multipart/form-data\`) | Direct-to-Storage (Presigned URL) |
|---|---|---|
| **Server load** | High — every byte passes through your process | Minimal — server only issues a signed URL |
| **Scalability** | Limited by app server memory/bandwidth | Scales with the object store, not your app |
| **Best for** | Small files (avatars, documents) | Large files (video, datasets, bulk exports) |
| **Complexity** | Simple | Slightly more moving parts (signed URLs, completion callback) |

## Guardrails You Still Need
- **Size limits**, enforced both client-side (fast feedback) and server-side/at the storage layer (the real limit — e.g., \`Content-Length\` checks or a max-size policy on the presigned URL).
- **Content-type validation** — check both the declared MIME type *and*, ideally, the actual file signature/magic bytes, since a client can lie about \`Content-Type\`.
- **Virus/malware scanning** — for user-uploaded files that other users might later download, run an async scan (e.g., ClamAV, or a cloud provider's malware-scanning service) after upload and before marking the file as available, rather than trusting it blindly.
- **Never trust a client-supplied file path or filename directly** — generate your own storage key (as in the example above) to avoid path traversal and collisions.
	`
	},

	Logging: {
		definition:
			'The practice of emitting structured, timestamped records of what an API did while handling a request — which endpoint, which user, how long it took, and what (if anything) went wrong.',
		useCase:
			'Attaching a request ID to every log line for a single API call so an engineer can grep one identifier across three microservices to reconstruct exactly what happened during a failed checkout.',
		detailedMarkdown: `
# Logging (API Implementation)

Every production API needs logging, but *how* you log determines whether those logs are a debugging superpower or an unsearchable pile of text. This section covers the practical choices you make while building the API itself; the deeper observability stack (metrics, distributed tracing, alerting) is covered in the Debugging & Performance section.

## Structured (JSON) Logs vs. Plain Text
\`\`\`
# Plain text — readable by a human staring at one terminal, painful at scale:
2026-07-06 10:32:01 INFO User 4821 created order 9931 in 142ms

# Structured JSON — the same event, but machine-parseable:
{"timestamp":"2026-07-06T10:32:01Z","level":"info","event":"order_created","userId":4821,"orderId":9931,"durationMs":142,"requestId":"req_8f3a2c"}
\`\`\`

Plain text logs are fine on a single developer's laptop. In production, logs from dozens of server instances get shipped into a centralized system (Datadog, Elasticsearch, CloudWatch Logs Insights, Loki), and **structured JSON logs let you filter, aggregate, and alert on fields** — "show me every log where \`event = order_created\` and \`durationMs > 1000\`" — instead of writing fragile regexes against free-form text.

## Log Levels
Most logging libraries expose a small set of severities, and picking the right one matters for signal-to-noise:

| Level | When to use it | Example |
|---|---|---|
| **debug** | Fine-grained detail useful only while actively debugging; usually off in production | "Cache miss for key user:4821, fetching from DB" |
| **info** | Normal, expected events worth recording for audit/analytics | "Order 9931 created for user 4821" |
| **warn** | Something unexpected but recoverable happened | "Payment provider retried 2 times before succeeding" |
| **error** | An operation failed and needs attention | "Failed to charge card: gateway timeout after 30s" |

A common mistake is logging everything at \`info\` or everything at \`error\` — this destroys the ability to filter by severity later, e.g. paging an on-call engineer only on \`error\`-level spikes.

## Correlation / Request IDs
In a system with even two services, a single user action can trigger a chain of internal calls. Without a shared identifier, tracing "what happened during this one request" across services means manually correlating timestamps and guessing.

The fix: generate a **request ID** (or reuse a distributed **trace ID**) at the edge, and thread it through every downstream call and every log line:

\`\`\`ts
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] ?? crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
});

// Every log call in this request's lifecycle includes it:
logger.info('order_created', { requestId: req.requestId, userId, orderId });

// And it's forwarded on any downstream call:
fetch('https://payments.internal/charge', {
  headers: { 'x-request-id': req.requestId }
});
\`\`\`

Now an engineer debugging a failed checkout can grep one \`requestId\` across the API gateway, the order service, and the payment service logs and see the entire story in order — this is the foundation that distributed tracing tools (Jaeger, OpenTelemetry) build on top of.

## What NOT to Log
Logs frequently end up in third-party tools, get exported to spreadsheets, or sit around for months — treat them as a **leak surface**:
- **Never log passwords, API keys, tokens, or full credit card numbers** — even "just for debugging," even temporarily.
- **Be careful with PII** (email addresses, phone numbers, physical addresses) — many compliance regimes (GDPR, CCPA) treat logs as data that must be protected and eventually purged, same as your primary database.
- **Redact or mask sensitive fields** before they hit a log line, e.g. logging \`cardLast4\` instead of the full card number, or hashing an email if you only need it for correlation.

\`\`\`ts
// Bad:
logger.info('login_attempt', { email: user.email, password: req.body.password });

// Better:
logger.info('login_attempt', { userId: user.id, success: true });
\`\`\`

## Where This Connects
Structured logs are one leg of the observability stool — the other two, **metrics** (aggregate numeric trends) and **distributed tracing** (the full causal chain of a request across services), are covered in depth in the Debugging & Performance section. Logging at the API layer is about making sure the raw signal — one line per meaningful event, tagged with the right IDs and severity — actually exists to feed those tools.
	`
	},

	'API Versioning': {
		definition:
			'A strategy for evolving an API over time without breaking existing clients, by explicitly marking which version of a contract a given request targets.',
		useCase:
			'Shipping a breaking change to the `/users` response shape as `/v2/users` while `/v1/users` keeps working unchanged for clients that have not migrated yet.',
		detailedMarkdown: `
# API Versioning

APIs change. Fields get renamed, response shapes get restructured, endpoints get removed. **Versioning** is how you make those changes without instantly breaking every client that depends on the old contract.

## Why Breaking Changes Need a New Version At All
Any change that could break an existing, well-behaved client is a **breaking change**: removing a field, renaming a field, changing a field's type, changing validation rules to be stricter, or altering the meaning of a status code. Adding a new optional field is usually *not* breaking, since clients that ignore unknown fields are unaffected.

Once a breaking change is unavoidable, you have two options: break every client immediately (rarely acceptable for a public or even internal-but-widely-used API), or **introduce a new version** so old and new contracts can coexist while clients migrate on their own schedule.

## Versioning Strategies Compared
| Strategy | Example | Pros | Cons |
|---|---|---|---|
| **URI versioning** | \`GET /v1/users\` vs \`GET /v2/users\` | Extremely visible and cacheable; trivial to route (different path = different handler); easy to grep in logs | "Pollutes" the URI with what's arguably metadata about the request, not the resource itself |
| **Header versioning** | \`GET /users\` with header \`Accept: application/vnd.myapi.v2+json\` (or a custom \`X-API-Version: 2\` header) | Keeps URIs clean/stable; aligns with HTTP content negotiation | Less discoverable — you can't tell the version from the URL alone; harder to test by pasting a URL into a browser |
| **Query param versioning** | \`GET /users?version=2\` | Simple to add; explicit | Easy to forget/omit (silently falls back to a default); mixes versioning with actual query semantics |

**URI versioning is the most common choice** for public APIs (Stripe, GitHub, Twitter/X all expose versions in the path or a clearly documented header) because it's the most explicit and operationally simple: routing, caching, and log analysis all key naturally off the path.

## What a Version Boundary Actually Looks Like
\`\`\`ts
// v1 handler — old shape, kept alive for existing clients
app.get('/v1/users/:id', (req, res) => {
  res.json({ id: user.id, name: user.fullName });
});

// v2 handler — new shape, e.g. split name into parts
app.get('/v2/users/:id', (req, res) => {
  res.json({ id: user.id, firstName: user.firstName, lastName: user.lastName });
});
\`\`\`

In practice, most of the business logic is shared — only the request/response **mapping layer** typically differs between versions, so you avoid duplicating the actual service/database logic per version.

## Deprecating an Old Version
Introducing \`v2\` doesn't mean you can delete \`v1\` the next day. A responsible deprecation process looks like:

1. **Announce** the new version and publish a **changelog** describing exactly what changed and why.
2. **Communicate a sunset date** well in advance (weeks to months, depending on how many clients depend on you).
3. **Signal deprecation in the response itself**, so automated tooling — not just documentation — can pick it up:

\`\`\`
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Oct 2026 00:00:00 GMT
Link: <https://api.example.com/docs/migrate-v1-to-v2>; rel="deprecation"
\`\`\`

The \`Sunset\` HTTP header (RFC 8594) tells clients and their tooling exactly when the endpoint will stop working, so well-behaved API clients can even alert their own maintainers automatically.

4. **Monitor actual traffic** to the deprecated version before removing it — "we announced it" isn't the same as "nobody is using it anymore."
5. **Remove the old version** only after traffic has dropped to (near) zero or the sunset date has passed.

## Interview Tip
If asked "how would you evolve this API without breaking clients," a strong answer distinguishes **additive changes** (new optional fields, new endpoints — ship freely, no version bump needed) from **breaking changes** (require a new version, a deprecation window, and a documented migration path for the old one).
	`
	},

	'Rate Limiting': {
		definition:
			'A control that caps how many requests a client can make to an API within a given time window, implemented at the API-serving layer to protect the backend from overload and abuse.',
		useCase:
			'Capping a public API key to 100 requests per minute so one misbehaving integration cannot degrade the service for every other tenant sharing the same backend.',
		detailedMarkdown: `
# Rate Limiting (API Implementation)

This topic covers rate limiting from the **API-builder's perspective**: where you actually plug it into a real backend, and what a client sees when they hit the limit. The System Design section's "Rate Limiter" topic covers the algorithms underneath — token bucket, sliding window, leaky bucket — in depth; this section assumes you'll reach for one of those algorithms and focuses on the surrounding implementation.

## Where Rate Limiting Actually Lives
You rarely hand-roll rate limiting logic inside every route handler. It's almost always implemented at one of these layers, from closest to the client to closest to your code:

| Layer | Example | Notes |
|---|---|---|
| **API Gateway / CDN edge** | AWS API Gateway, Cloudflare, Kong | Stops abusive traffic before it even reaches your infrastructure; scales independently of your app |
| **Reverse proxy** | Nginx (\`limit_req\`), Envoy | Centralized for every service behind it, no per-service code changes needed |
| **Application middleware** | \`express-rate-limit\`, a custom Redis-backed limiter | Most flexible — can key limits on user ID, plan tier, or endpoint-specific rules that a gateway can't easily express |

A typical production setup layers these: a coarse gateway-level limit as a blunt DDoS/abuse backstop, plus a finer application-level limit that understands your actual business rules (e.g., "free tier: 100 req/hour, paid tier: 10,000 req/hour").

## A Minimal Middleware Example
\`\`\`ts
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100,             // 100 requests per window per key
  keyGenerator: (req) => req.apiKey ?? req.ip,
  standardHeaders: true, // adds RateLimit-* response headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'RateLimitExceeded',
      message: 'Too many requests. Please slow down.'
    });
  }
});

app.use('/api/', apiLimiter);
\`\`\`

At scale, the limiter's counters live in a shared store like **Redis** rather than in-process memory — otherwise every server instance behind a load balancer tracks its own separate count, and a client can effectively multiply their real limit by the number of instances.

## The Client-Facing Contract
When a client exceeds their limit, the API should respond with a clear, standardized signal rather than a generic error:

\`\`\`
HTTP/1.1 429 Too Many Requests
Retry-After: 37
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1751800800

{
  "error": "RateLimitExceeded",
  "message": "Too many requests. Retry after 37 seconds."
}
\`\`\`

- \`429 Too Many Requests\` is the correct HTTP status specifically for this case.
- \`Retry-After\` tells a well-behaved client exactly how many seconds to wait before trying again, so clients can back off automatically instead of hammering the endpoint in a tight retry loop.
- \`RateLimit-Limit\` / \`RateLimit-Remaining\` / \`RateLimit-Reset\` let clients self-throttle *before* they even hit the wall, by watching how much of their quota remains.

## Per-User, Per-IP, and Per-API-Key Limits
The right "key" to rate-limit on depends on who you're protecting the system from:

| Key | Protects against | Weakness |
|---|---|---|
| **Per-IP** | Anonymous abuse, scraping, unauthenticated endpoints (login, signup) | Many real users can share one IP (corporate NAT, mobile carrier NAT) — one bad actor can collaterally throttle innocent users behind the same IP |
| **Per-user (authenticated ID)** | A single logged-in account hammering the API | Doesn't help before authentication — useless for a login endpoint itself, which is exactly where brute-force attacks happen |
| **Per-API-key** | Third-party integrations/tenants on a public API | Requires the client to have a key in the first place — doesn't cover public, unauthenticated traffic |

Most real APIs combine these: a strict per-IP limit on unauthenticated endpoints like \`/login\` (to blunt credential-stuffing attacks), and a per-user or per-API-key limit on everything behind authentication (so one tenant's traffic spike doesn't degrade service for every other tenant).

## Interview Tip
If asked to contrast this with the System Design "Rate Limiter" question, the clean distinction is: **this topic is "where do I plug a rate limiter into a real Express/Django app, and what does the client see" — the System Design topic is "how do you build the limiter itself," covering token bucket vs. sliding window log vs. sliding window counter, and how to make the counters correct and fast across a distributed fleet of servers.**
	`
	}
};
