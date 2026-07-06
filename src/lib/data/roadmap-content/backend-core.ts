import type { RoadmapDetailMap } from './types';

export const BackendCoreContent: RoadmapDetailMap = {
	GraphQL: {
		definition:
			'GraphQL is a query language and runtime for APIs that lets clients request exactly the fields they need through a single, strongly-typed endpoint.',
		useCase:
			'Building a mobile app backend where the home screen needs a shallow slice of user data but the profile screen needs deeply nested friend and post data, without maintaining two REST endpoints.',
		detailedMarkdown: `
# GraphQL

GraphQL flips the usual REST relationship: instead of the **server** deciding what shape each endpoint returns, the **client** decides, by sending a query that mirrors the exact shape of the response it wants. There is typically one endpoint (\`POST /graphql\`), and every request carries a query (or mutation) describing the data.

## Defining a schema (SDL)
Every GraphQL API is built around a strongly-typed schema written in the **Schema Definition Language**:

\`\`\`graphql
type Author {
  id: ID!
  name: String!
  books: [Book!]!
}

type Book {
  id: ID!
  title: String!
  author: Author!
}

type Query {
  book(id: ID!): Book
  books: [Book!]!
}

type Mutation {
  addBook(title: String!, authorId: ID!): Book!
}
\`\`\`

\`!\` means non-nullable. \`Query\` and \`Mutation\` are just special object types that define the API's entry points — \`Query\` for reads, \`Mutation\` for writes (GraphQL also has \`Subscription\` for real-time updates over WebSockets).

A client can now ask for exactly what it needs:

\`\`\`graphql
query {
  books {
    title
    author {
      name
    }
  }
}
\`\`\`

No unused fields, no separate \`/books\` and \`/books/:id/author\` round trips.

## Resolvers
Every field in the schema is backed by a **resolver** function — the actual code that fetches the data for that field. A resolver map for the schema above looks roughly like:

\`\`\`js
const resolvers = {
  Query: {
    books: () => db.books.findAll(),
    book: (_, { id }) => db.books.findById(id)
  },
  Book: {
    author: (book) => db.authors.findById(book.authorId)
  }
};
\`\`\`

The key insight: GraphQL executes resolvers **field by field, recursively**. The \`books\` resolver runs once to get the list, and then the \`author\` resolver runs *once per book* to resolve the nested field.

## The N+1 problem
That recursive execution is exactly where GraphQL APIs get into trouble. Querying 20 books and their authors triggers:
- 1 query to fetch the books
- 20 separate queries, one per book, to fetch each author

This is the classic **N+1 query problem** — it looks fine in dev with 3 rows of seed data and falls over in production with real traffic.

## Fixing it: batching with DataLoader
The standard fix is **DataLoader** (or an equivalent batching layer). Instead of each \`author\` resolver hitting the database immediately, DataLoader:
1. Collects all the \`authorId\`s requested during a single tick of the event loop.
2. Fires **one** batched query (\`SELECT * FROM authors WHERE id IN (...)\`) instead of N.
3. Caches the result per request, so if the same author is referenced twice, only one lookup happens.

\`\`\`js
const authorLoader = new DataLoader(async (ids) => {
  const authors = await db.authors.findByIds(ids);
  return ids.map((id) => authors.find((a) => a.id === id));
});

// resolver becomes:
Book: {
  author: (book) => authorLoader.load(book.authorId)
}
\`\`\`

20 books with the same author now costs 2 queries total instead of 21.

## GraphQL vs REST, in practice
| | REST | GraphQL |
|---|---|---|
| Endpoints | Many, resource-shaped | One |
| Over/under-fetching | Common | Solved by design |
| Caching | Easy (HTTP caching, CDNs) | Harder (usually needs a client cache like Apollo/Relay) |
| Versioning | \`/v1\`, \`/v2\` | Additive fields, deprecation directives |

GraphQL earns its complexity when a product has many clients (web, iOS, Android) with very different data needs consuming the same backend. For a simple CRUD service with one consumer, plain REST is usually the pragmatic choice.
	`
	},

	gRPC: {
		definition:
			'gRPC is a high-performance RPC framework that uses Protocol Buffers for serialization and HTTP/2 for transport, designed for fast service-to-service communication.',
		useCase:
			'An order service calling an internal inventory service to check and decrement stock, where both are owned by the same company and latency matters more than browser compatibility.',
		detailedMarkdown: `
# gRPC

gRPC lets you call a method on a remote service as if it were a local function. You define the service **contract** once in a \`.proto\` file, and gRPC's code generator produces client and server stubs in whatever languages you need — Go server, Python client, Java client, all from the same contract.

## Defining a service (.proto)
\`\`\`protobuf
syntax = "proto3";

package inventory;

service InventoryService {
  rpc GetItem (ItemRequest) returns (ItemResponse);
  rpc ListItems (ListItemsRequest) returns (stream ItemResponse);
  rpc UpdateStock (stream StockUpdate) returns (StockSummary);
  rpc WatchPrices (stream PriceQuery) returns (stream PriceUpdate);
}

message ItemRequest {
  string item_id = 1;
}

message ItemResponse {
  string item_id = 1;
  string name = 2;
  int32 quantity = 3;
}
\`\`\`

Each field gets a number (\`= 1\`, \`= 2\`) instead of a name on the wire — that number, not the field name, is what Protocol Buffers actually serializes, which is why Protobuf messages are so much smaller than the equivalent JSON.

## The four RPC types
The \`.proto\` above intentionally shows all four shapes gRPC supports:

| Type | Signature | Example use |
|---|---|---|
| **Unary** | \`rpc GetItem(Req) returns (Res)\` | Classic request/response, like a REST call |
| **Server streaming** | \`rpc ListItems(Req) returns (stream Res)\` | Server pushes a large result set back as a stream instead of one giant payload |
| **Client streaming** | \`rpc UpdateStock(stream Req) returns (Res)\` | Client uploads a stream of events (e.g. sensor readings) and gets one summary back |
| **Bidirectional streaming** | \`rpc WatchPrices(stream Req) returns (stream Res)\` | Both sides keep a connection open and push messages independently, like a live chat |

Unary is what most CRUD-style endpoints use; the streaming variants are what make gRPC attractive for anything continuous — telemetry ingestion, live price feeds, chunked file uploads.

## Why it's the default for internal microservices
- **Performance**: Protobuf is binary and compact; HTTP/2 multiplexes many calls over one TCP connection, so there's no head-of-line blocking the way there can be with HTTP/1.1.
- **Strong contracts**: the \`.proto\` file *is* the API documentation and the source of truth for generated types — no client/server drift the way loosely-typed JSON REST APIs can drift.
- **Codegen for free**: teams in different languages (a Go payments service, a Python ML service) get type-safe stubs without hand-writing an SDK.
- **Streaming built in**: REST/JSON has no native equivalent to bidirectional streaming without bolting on WebSockets separately.

## Where it falls short
- Browsers can't speak raw gRPC natively (needs gRPC-Web plus a proxy layer), so it's rarely used for public-facing browser APIs — that's still REST or GraphQL's territory.
- Binary payloads aren't human-readable on the wire, which makes ad-hoc debugging with curl harder than with JSON.
- Because of this, a very common architecture is: **gRPC between internal microservices**, with an API gateway translating the public-facing REST/GraphQL API into gRPC calls behind the scenes.
	`
	},

	Authentication: {
		definition:
			'Authentication is the process of verifying that a user or service is who they claim to be.',
		useCase:
			'A login endpoint on a SaaS product must confirm the person submitting an email and password is actually the account owner before issuing any session or token.',
		detailedMarkdown: `
# Authentication

Authentication (often shortened to "auth" or "authn") answers one question: **who are you?** It's the gate a request has to pass through before authorization ("what are you allowed to do") is even relevant — you can't check permissions for an identity you haven't verified yet.

## Common implementation approaches

### 1. Password + hashing
The oldest and still most common pattern: user submits email/password, server looks up the stored hash, and compares.

\`\`\`js
// signup
const hash = await bcrypt.hash(plainPassword, 12);
await db.users.create({ email, passwordHash: hash });

// login
const user = await db.users.findByEmail(email);
const valid = await bcrypt.compare(plainPassword, user.passwordHash);
\`\`\`

Never store plaintext passwords, and never roll your own hashing — use **bcrypt**, **scrypt**, or **argon2**, all of which are deliberately slow and salted to resist brute-force and rainbow-table attacks.

### 2. OAuth-based social login
"Sign in with Google/GitHub" delegates the identity check entirely to a trusted provider. Your app never sees the user's password — it receives a signed token or profile payload from the provider after the user authenticates there. This removes password-storage liability from your app but ties your login flow to a third party's uptime.

### 3. Magic links
The server emails a single-use, short-lived, signed link. Clicking it authenticates the user with no password at all — good for low-friction consumer products, but it depends on email deliverability and the security of the user's inbox.

### 4. API keys (service-to-service)
For machine clients rather than humans (a backend calling another backend, a CI job calling an API), a long-lived opaque key sent in a header is the norm:

\`\`\`
Authorization: Bearer sk_live_51Hn8f...
\`\`\`

Keys are simpler than full OAuth for this case but should still be scoped, rotatable, and revocable — treat a leaked API key exactly like a leaked password.

## Where auth logic actually lives
In almost every backend framework, authentication is implemented as **middleware** that runs before the route handler:

\`\`\`js
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = verifyToken(token); // throws if invalid/expired
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/dashboard', authenticate, dashboardHandler);
\`\`\`

Centralizing this in middleware means every route handler downstream can simply trust \`req.user\` — the identity check has already happened once, in one place, instead of being duplicated (and inevitably forgotten) in every handler.

## The output of authentication
A successful authentication step produces an **identity** — a user ID, a set of claims, a session — that gets attached to the request. What that identity is then *permitted to do* is a separate concern, handled by authorization.
	`
	},

	Authorization: {
		definition:
			'Authorization is the process of determining what an already-authenticated identity is allowed to do or access.',
		useCase:
			'Blocking a logged-in regular user from hitting an admin-only DELETE /users/:id endpoint, even though their identity was successfully authenticated.',
		detailedMarkdown: `
# Authorization

If authentication answers "who are you?", authorization answers **"what are you allowed to do?"** — a clean way to remember the difference: **a logged-in user who tries to delete someone else's account has passed authentication but should fail authorization.**

## Implementation approaches

### 1. Role checks in middleware
The simplest and most common pattern — attach a role to the authenticated user, then gate routes by role:

\`\`\`js
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/users/:id', authenticate, requireRole('admin'), deleteUserHandler);
\`\`\`

Note the status code: **401 Unauthorized** means "I don't know who you are" (authentication failure). **403 Forbidden** means "I know who you are, and you're not allowed" (authorization failure). Mixing these up is a common interview red flag.

### 2. Policy-based / attribute-based checks
Role checks get clunky once rules depend on more than a single label — e.g. "editors can publish posts, but only during business hours, and only for their own team." Policy-based authorization externalizes the *logic* into reusable policy functions rather than scattering conditionals through route handlers:

\`\`\`js
const canPublishPost = (user, post) =>
  user.role === 'editor' &&
  user.teamId === post.teamId &&
  isBusinessHours();

if (!canPublishPost(req.user, post)) {
  return res.status(403).json({ error: 'Forbidden' });
}
\`\`\`

This is the attribute-based (ABAC) style — decisions are computed from attributes of the user, the resource, and the environment, not just a static role.

### 3. Resource ownership checks
A huge share of real-world authorization bugs are ownership bugs: a user is technically allowed to hit \`PATCH /posts/:id\` (they're an authenticated "member"), but the endpoint forgets to verify *this* post belongs to *this* user:

\`\`\`js
const post = await db.posts.findById(req.params.id);
if (post.authorId !== req.user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}
\`\`\`

This check has to happen on the **server**, on every mutating request — hiding the "Edit" button in the UI is not authorization, it's just cosmetics that a curl request bypasses trivially.

## Where it lives
Like authentication, authorization is usually implemented as middleware or a guard layered right after the auth middleware — \`authenticate\` establishes \`req.user\`, and \`authorize\`/\`requireRole\`/ownership checks decide whether that specific \`req.user\` can perform this specific action on this specific resource. Keeping the two as distinct, composable layers (rather than one tangled check) is what makes both testable in isolation.
	`
	},

	JWT: {
		definition:
			'A JSON Web Token (JWT) is a compact, URL-safe, digitally signed token format for transmitting claims about an identity between two parties.',
		useCase:
			'A mobile client authenticates once and then attaches a JWT to every subsequent API call, letting any of several stateless backend servers verify the request without a shared session store.',
		detailedMarkdown: `
# JWT (JSON Web Token)

A JWT is three base64url-encoded segments joined by dots: **\`header.payload.signature\`**. Anyone can decode and read the header and payload (it is *not* encrypted, only signed) — the signature just proves it wasn't tampered with and that it came from a party holding the secret/private key.

## Structure, decoded
Take this real, well-known example token:

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
\`\`\`

Decoding each segment:

**Header** (algorithm + token type):
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

**Payload** (the claims):
\`\`\`json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
\`\`\`

**Signature**: \`HMACSHA256(base64url(header) + "." + base64url(payload), secret)\`

A production payload will usually add more of the registered claims from the JWT spec:
- \`sub\` — subject, typically the user ID
- \`iat\` — issued-at, a Unix timestamp
- \`exp\` — expiration, a Unix timestamp after which the token must be rejected
- \`iss\` / \`aud\` — issuer and intended audience, useful when multiple services trust the same auth provider

## Signing: HS256 vs RS256
| | HS256 (HMAC) | RS256 (RSA) |
|---|---|---|
| Keys | One shared secret | Private key signs, public key verifies |
| Who can verify | Anyone with the secret — meaning anyone who can verify can also *forge* | Any service with the public key can verify, but only the holder of the private key can sign |
| Typical use | Single backend issuing and verifying its own tokens | Multiple independent services (or third parties) need to verify tokens without being trusted to issue them |

If more than one service needs to check tokens but only one should be able to mint them, RS256 (or another asymmetric algorithm) is the right call.

## Where to store it client-side
| Storage | XSS risk | CSRF risk | Notes |
|---|---|---|---|
| \`localStorage\` | High — any injected JS can read it | None (not auto-sent) | Convenient, but a single XSS bug leaks the token wholesale |
| \`httpOnly\` cookie | Low — JS can't read it | Present, needs \`SameSite\`/CSRF token mitigation | Safer against XSS, but reintroduces CSRF concerns and cookie size limits |

There's no universally "correct" answer — it's a trade-off between which attack class you're more worried about, and \`httpOnly\` cookies combined with \`SameSite=Strict\`/\`Lax\` and a CSRF token is generally considered the safer default for browser-based apps.

## The big benefit: statelessness
Because a JWT carries its own claims and signature, any server that has the verification key can validate it **without a database lookup or a shared session store**. That's exactly why JWTs fit horizontally-scaled, stateless API fleets — no server needs to "remember" anything about the session.

## The big drawback: revocation
That same statelessness is the problem the moment you need to invalidate a token early (user logs out, account compromised, permissions changed) — there's no central place to "delete" a JWT before it naturally expires, because no one is tracking it. The standard mitigations:
- Keep the **access token's** \`exp\` short (minutes, not days).
- Issue a separate, longer-lived **refresh token** (stored server-side or in an httpOnly cookie) used only to mint new access tokens.
- To revoke immediately, invalidate the refresh token in the database — the stale access token, at worst, is usable for a few more minutes before it expires on its own.
	`
	},

	OAuth: {
		definition:
			"OAuth 2.0 is an authorization framework that lets a third-party application get limited, delegated access to a resource on a user's behalf, without ever seeing the user's password.",
		useCase:
			"A calendar scheduling app requests read access to a user's Google Calendar, so the user grants that specific permission through Google rather than handing the app their Google password.",
		detailedMarkdown: `
# OAuth 2.0

It's easy to conflate OAuth with "login," but its actual purpose is narrower and more powerful: **delegated authorization**. OAuth exists so app A can act on a user's behalf against service B's API, with the user's explicit, scoped consent, without app A ever holding the user's service B credentials. "Sign in with Google" is really just OAuth used *as* a login mechanism — a side effect of "prove you can access this Google account," not OAuth's original purpose.

## The four roles
| Role | Who it is |
|---|---|
| **Resource Owner** | The user who owns the data (e.g. the Google account holder) |
| **Client** | The third-party app requesting access (e.g. the calendar app) |
| **Authorization Server** | Issues tokens after the user consents (e.g. Google's OAuth server) |
| **Resource Server** | Hosts the protected data and accepts the access token (e.g. the Google Calendar API) |

## The Authorization Code flow, step by step
This is the flow used by essentially every server-side web app doing "Login with X":

1. **Client redirects to the provider.** The app sends the user's browser to the authorization server with its \`client_id\`, requested \`scope\` (e.g. \`calendar.readonly\`), and a \`redirect_uri\`.
2. **User authenticates and consents.** The user logs into the provider (if not already) and sees a consent screen: *"Calendar App wants to view your calendar — Allow / Deny."*
3. **Provider redirects back with an authorization code.** On approval, the provider redirects the browser back to the client's \`redirect_uri\` with a short-lived, single-use \`code\` in the query string.
4. **Client exchanges the code for tokens — server-to-server.** The client's backend (not the browser) sends the \`code\`, along with its \`client_id\` and \`client_secret\`, directly to the authorization server's token endpoint.
5. **Provider returns an access token** (and often a refresh token). The client now calls the resource server's API with \`Authorization: Bearer <access_token>\`.

\`\`\`
Browser                     Client backend                 Authorization Server
   |  1. redirect to /authorize?client_id=...&scope=...       |
   |----------------------------------------------------------->|
   |                     2. login + consent screen              |
   |<-----------------------------------------------------------|
   |  3. redirect to redirect_uri?code=abc123                   |
   |----------------> (client backend receives code)            |
                       4. POST /token { code, client_secret }
                       ----------------------------------------->|
                       5. { access_token, refresh_token }
                       <-----------------------------------------|
\`\`\`

The whole point of step 4 happening server-to-server is that the \`client_secret\` never touches the browser — only a backend that can keep a secret secret is trusted to complete the exchange.

## Why the code, and not just the token, comes back through the browser
The authorization *code* is short-lived and useless on its own — it has to be exchanged for a token using the \`client_secret\`, which only the legitimate backend possesses. If the provider returned the access token directly to the browser redirect (the older, now-discouraged **Implicit flow**), it would be exposed in browser history, referrer headers, and logs.

## OAuth vs "just log in with a password"
| | Password login | OAuth |
|---|---|---|
| What's shared | Your actual credentials, with the app itself | Nothing — the app gets a scoped token, never the password |
| Scope | All-or-nothing access to your account | Fine-grained (\`read-only calendar\`, not full account access) |
| Revocation | Change your password everywhere | Revoke just that app's token from the provider's security settings |
| Best for | The app *is* the account (e.g. your own product's login) | One service needs bounded, revocable access to another |

Use plain password/session auth when you own both the client and the "resource"; reach for OAuth when a third party needs limited access to a resource you don't control, or when you want to outsource identity verification to a provider users already trust.
	`
	},

	RBAC: {
		definition:
			'Role-Based Access Control (RBAC) is an authorization model where permissions are assigned to roles, and users are assigned to those roles, rather than permissions being granted to individuals directly.',
		useCase:
			'An internal CMS dashboard where "Viewer," "Editor," and "Admin" roles each unlock a different, predefined set of actions, and promoting someone just means changing their role.',
		detailedMarkdown: `
# RBAC (Role-Based Access Control)

The core idea of RBAC is a layer of indirection: instead of asking "can Alice delete this post?" you ask "does Alice's role include the \`post:delete\` permission?" That indirection is what makes RBAC manageable at scale — you manage a handful of roles instead of permissions-per-user, and adding a new employee is just "assign them a role," not "recreate their exact permission set from scratch."

## The relationships
\`\`\`
users  <---->  roles  <---->  permissions
        (many-to-many)  (many-to-many)
\`\`\`

A user can have multiple roles (e.g. "Editor" and "Billing Manager"), and a role bundles multiple permissions (e.g. "Editor" = \`post:create\`, \`post:edit\`, \`post:publish\`).

## Example schema
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL       -- 'admin', 'editor', 'viewer'
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL       -- 'post:delete', 'post:edit', 'user:invite'
);

CREATE TABLE user_roles (
  user_id INT REFERENCES users(id),
  role_id INT REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id),
  permission_id INT REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
\`\`\`

A permission check becomes a join: does any role assigned to this user grant the permission this action requires?

\`\`\`sql
SELECT 1
FROM user_roles ur
JOIN role_permissions rp ON rp.role_id = ur.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE ur.user_id = $1 AND p.name = 'post:delete';
\`\`\`

In practice, most apps cache this lookup (in the JWT's claims, in a session, or in an in-memory cache) rather than joining four tables on every request.

## Middleware usage
\`\`\`js
function requirePermission(permission) {
  return async (req, res, next) => {
    const has = await userHasPermission(req.user.id, permission);
    if (!has) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

app.delete('/posts/:id', authenticate, requirePermission('post:delete'), deletePostHandler);
\`\`\`

## RBAC vs ABAC
RBAC's weakness shows up when rules need context RBAC's static role-to-permission mapping can't express — "editors can edit posts, but only ones on their own team, and only before the post is published." That's where **Attribute-Based Access Control (ABAC)** takes over: decisions are computed from attributes of the user, the resource, and the environment (time, IP, department) at request time, rather than looked up from a fixed role table.

| | RBAC | ABAC |
|---|---|---|
| Granularity | Coarse — role-level | Fine — per-attribute, per-resource |
| Mental model | "Which role does this user have?" | "Given these attributes, is this specific action allowed?" |
| Simplicity | Easy to reason about and audit | More flexible, but harder to visualize/debug |
| Good fit | Most internal tools, admin panels | Multi-tenant SaaS, complex compliance rules |

A common real-world compromise is RBAC for the broad strokes (admin/editor/viewer) layered with a handful of ABAC-style ownership checks (\`resource.ownerId === user.id\`) for the cases plain roles can't express.
	`
	},

	Sessions: {
		definition:
			'A session is server-side state tied to a logged-in user, referenced by an opaque session ID that the client stores and re-sends with every request.',
		useCase:
			'A traditional server-rendered web app (e.g. Django or Rails admin) needs to remember that a user is logged in as they navigate between pages, without re-sending credentials on every request.',
		detailedMarkdown: `
# Sessions

Where a JWT carries its own state (self-contained, verified by signature), a session works the opposite way: the client holds only a **reference** — a random, unguessable session ID — and all the actual state ("who is this, what's in their cart, when did they log in") lives on the server.

## The basic flow
1. User logs in successfully.
2. Server creates a session record: \`{ sessionId: "sess_abc123", userId: 42, createdAt, expiresAt }\`.
3. Server sends the client a cookie containing only \`sessionId=sess_abc123\`.
4. On every subsequent request, the browser automatically sends that cookie back.
5. Server looks up \`sess_abc123\` in its session store to find out who's making the request.

\`\`\`js
app.post('/login', async (req, res) => {
  const user = await verifyCredentials(req.body);
  const session = await sessionStore.create({ userId: user.id });
  res.cookie('sessionId', session.id, { httpOnly: true, secure: true, sameSite: 'lax' });
  res.json({ ok: true });
});

app.use(async (req, res, next) => {
  const session = await sessionStore.get(req.cookies.sessionId);
  if (session) req.user = await db.users.findById(session.userId);
  next();
});
\`\`\`

## Where sessions actually live: storage strategy
| Store | Pros | Cons |
|---|---|---|
| **In-memory** (a plain object/Map in the process) | Zero setup, fastest possible lookup | Dies on restart; doesn't work at all once you have more than one server instance |
| **Redis-backed** | Shared across every server instance, survives individual server restarts, supports TTL-based expiry natively | An extra piece of infrastructure to run and keep available |
| **Database-backed** | Durable, easy to query/audit | Slower than Redis for a lookup that happens on every single request |

In-memory sessions are fine for a single-process toy app and fall apart the moment you run two servers behind a load balancer — a request that lands on server B has no idea about a session created on server A. Redis (or another shared, fast key-value store) is the standard fix, since every server instance can hit the same shared store.

## Expiry and rotation
- **Expiry**: sessions should have a TTL — Redis's native \`EXPIRE\` makes this close to free. An idle session past its TTL should force re-login.
- **Rotation**: generate a *new* session ID on privilege changes (e.g. right after login, or after a password change) and invalidate the old one. This defends against **session fixation**, where an attacker tricks a victim into using a session ID the attacker already knows.

## Why sessions don't scale as "trivially" as JWTs
This is the classic sessions-vs-JWT interview question, and the honest answer is about **where state lives**:
- A JWT is self-verifying — any stateless server with the signing key can validate it with zero I/O, so scaling horizontally requires nothing extra.
- A session is a *pointer* — every request requires a lookup against wherever that state actually lives. Scaling horizontally means every server instance needs access to the *same* session store, which is exactly the extra infrastructure (Redis, sticky sessions, etc.) JWTs let you skip.

The trade-off cuts both ways, though: JWTs push the hard problem to *revocation* (see the JWT topic), while sessions get instant, trivial revocation (just delete the row) at the cost of that shared-store dependency.
	`
	},

	Cookies: {
		definition:
			'A cookie is a small piece of data set by the server that the browser stores and automatically re-sends with every subsequent request to that origin.',
		useCase:
			'Setting a secure session cookie right after login so the browser automatically proves the user is authenticated on every following request, without the frontend having to manage that manually.',
		detailedMarkdown: `
# Cookies (backend engineering angle)

Cookies are the delivery mechanism most session-based (and some token-based) auth relies on: the server sets one with a \`Set-Cookie\` header, and the browser attaches it automatically to every future request to that origin — no client-side JavaScript required to "remember" anything.

\`\`\`
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/
\`\`\`

Getting the flags right is most of what "cookie security" actually means in practice.

## The flags that matter

### \`HttpOnly\`
Prevents any JavaScript (\`document.cookie\`) from reading the cookie. This is the single biggest mitigation against **XSS**: even if an attacker gets malicious script running on your page, they can't exfiltrate the session cookie through it. There's essentially never a good reason to *not* set this on an auth cookie.

### \`Secure\`
The cookie is only ever sent over HTTPS, never plain HTTP. Without it, the cookie could leak over an unencrypted connection to anyone on the network path (a classic coffee-shop-WiFi attack). Always pair this with an app that's HTTPS-only end to end.

### \`SameSite\`
Controls whether the cookie is sent on cross-site requests, and is the main lever against **CSRF**:

| Value | Behavior |
|---|---|
| \`Strict\` | Never sent on cross-site requests, even when a user clicks a link from another site into yours. Safest, but can break flows like "click an email link and land already logged in." |
| \`Lax\` (the modern default in most browsers) | Sent on top-level navigation (clicking a link) but not on cross-site \`POST\`s, image loads, or iframe requests. Good balance for most session cookies. |
| \`None\` | Sent on every cross-site request. Requires \`Secure\` to be set. Needed for legitimate cross-site use cases (e.g. an embedded widget), but offers no CSRF protection on its own — pair it with a CSRF token. |

### \`Domain\` and \`Path\`
Scope which hosts/paths the cookie is sent to. Narrowing these reduces the blast radius if something goes wrong elsewhere on the same parent domain.

## Size limits
Browsers cap cookies at roughly **4KB per cookie**, and most also cap the *total* number of cookies per domain (commonly around 50, though this varies by browser). This is exactly why cookies are used to carry a small **session ID** or a signed JWT, not arbitrary application state — if you find yourself needing to stuff a large object into a cookie, that data belongs in a session store instead, referenced by an ID.

## First-party vs third-party context
A cookie is **first-party** when it's set by the domain the user is actually visiting, and **third-party** when it's set by a different domain embedded on that page (an ad network's tracking pixel, an embedded widget). Modern browsers increasingly restrict or block third-party cookies by default for privacy reasons — which matters operationally any time your product embeds content cross-domain (widgets, iframed checkouts) and expects a cookie-based session to survive that context. Auth cookies for your own app should always be first-party; relying on a third-party cookie for anything security-sensitive is fragile and increasingly unsupported.
	`
	}
};
