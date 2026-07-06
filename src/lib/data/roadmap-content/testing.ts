import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Unit Testing
  // - Integration Testing
  // - End-to-End Testing
  // - Mocking
  // - API Testing
  // - Test Coverage
 */
export const TestingContent: RoadmapDetailMap = {
	'Unit Testing': {
		definition:
			'A test that verifies the behavior of a single function, method, or class in complete isolation from the rest of the system.',
		useCase:
			'Verifying that a `calculateTotal` pricing function returns the correct total for an order, without touching a database, network, or UI.',
		detailedMarkdown: `
# Unit Testing

A **unit test** exercises the smallest testable piece of a codebase — usually a single function, method, or class — in isolation from everything around it (databases, the network, the filesystem, other modules). The goal is to answer one narrow question extremely reliably: *"Given this input, does this one piece of logic produce the correct output?"*

Because a unit test has no external dependencies, it runs in milliseconds and gives you a precise, unambiguous failure location — if \`calculateTotal\` fails, you know the bug is in \`calculateTotal\`, not somewhere three layers away in a database driver.

## Code Example (Vitest/Jest-style, TypeScript)
\`\`\`typescript
// pricing.ts
export function calculateTotal(price: number, quantity: number, taxRate = 0.08): number {
  if (price < 0 || quantity < 0) {
    throw new Error('price and quantity must be non-negative');
  }
  const subtotal = price * quantity;
  return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}

// pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './pricing';

describe('calculateTotal', () => {
  it('applies the default 8% tax rate to the subtotal', () => {
    expect(calculateTotal(10, 2)).toBe(21.6); // (10 * 2) * 1.08
  });

  it('supports a custom tax rate', () => {
    expect(calculateTotal(100, 1, 0.2)).toBe(120);
  });

  it('throws when quantity is negative', () => {
    expect(() => calculateTotal(10, -1)).toThrow('non-negative');
  });
});
\`\`\`

Notice there's no database call, no HTTP request, and no rendering — just a pure function fed inputs and checked against expected outputs. That's what makes it a *unit* test rather than an integration test.

## The FIRST Principles
Good unit tests are commonly described with the **FIRST** acronym:

- **Fast** — a full unit test suite should run in seconds, so developers run it constantly (on save, pre-commit) without friction.
- **Independent** — each test sets up its own state and doesn't depend on another test running first or leaving behind shared state.
- **Repeatable** — the same test produces the same result every time, in any environment, in any order (no reliance on system time, random values, or network availability).
- **Self-validating** — the test itself declares pass/fail via assertions (\`expect(...)\`); no human has to eyeball console output to decide.
- **Timely** — tests are written close to when the production code is written (ideally just before or alongside it), not bolted on months later.

## What Makes Something a "Unit"?
There's healthy debate here, but the practical rule most teams use: a unit test should **not** cross a process boundary. If your test opens a real database connection, makes a real HTTP call, or hits the filesystem, it has stopped being a unit test — it has become an integration test, even if it's only testing "one function."

## Why Unit Tests Matter
- **Fast feedback loop:** failures surface in seconds, right at the point of change, long before code reaches a slower CI pipeline.
- **Living documentation:** a well-named test (\`"throws when quantity is negative"\`) describes the expected behavior of the code better than a comment ever could.
- **Safety net for refactoring:** you can restructure the internals of \`calculateTotal\` freely, and as long as the tests still pass, callers are unaffected.
- **Pinpoint failure location:** because each test targets one unit, a red test tells you almost exactly where the bug is.

## The Base of the Testing Pyramid
Unit tests form the foundation of the classic **testing pyramid** (covered in full under End-to-End Testing): you should have *many* of them, because they're cheap, fast, and isolate failures precisely. They can't, by design, catch bugs that only appear when real modules talk to each other — that's the job of integration tests, one layer up.
	`
	},

	'Integration Testing': {
		definition:
			'A test that verifies multiple units or modules work correctly together, often including real infrastructure like a database, message queue, or filesystem.',
		useCase:
			'Testing a `UserRepository` class against a real (test) PostgreSQL database to confirm that SQL queries, schema, and object mapping all actually work together.',
		detailedMarkdown: `
# Integration Testing

While a unit test isolates a single function, an **integration test** deliberately lets two or more real components interact — typically your application code plus a real (or realistic) piece of infrastructure such as a database, cache, message queue, or another internal service. The question it answers is different from a unit test's: not *"is this function's logic correct?"* but *"do these pieces actually work correctly together?"*

This distinction matters because a lot of real bugs live exactly at the seams between components — a subtly wrong SQL query, a mismatched column type, a serialization format the other service doesn't expect. Unit tests, by mocking those seams away, are structurally incapable of catching this class of bug.

## Code Example (Vitest, TypeScript + a real test database)
\`\`\`typescript
// userRepository.ts
export class UserRepository {
  constructor(private db: Database) {}

  async createUser(email: string): Promise<User> {
    const result = await this.db.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING *',
      [email]
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  }
}

// userRepository.integration.test.ts
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { UserRepository } from './userRepository';
import { createTestDb, closeTestDb } from './testUtils';

describe('UserRepository (integration)', () => {
  const db = createTestDb(); // real connection to a disposable test database
  const repo = new UserRepository(db);

  beforeEach(async () => {
    await db.query('TRUNCATE users'); // reset real table state between tests
  });

  afterAll(async () => {
    await closeTestDb(db);
  });

  it('persists a user and can look it up by email', async () => {
    await repo.createUser('ada@example.com');

    const found = await repo.findByEmail('ada@example.com');

    expect(found?.email).toBe('ada@example.com');
  });

  it('returns null when no user matches the email', async () => {
    const found = await repo.findByEmail('nobody@example.com');
    expect(found).toBeNull();
  });
});
\`\`\`

This test hits a real database over a real connection — it would catch a typo in the SQL, a wrong column name, or a schema migration that broke the query, none of which a mocked-database unit test could ever detect.

## Unit vs. Integration Testing

| | Unit Test | Integration Test |
|---|---|---|
| **Scope** | One function/class in isolation | Multiple modules/components together |
| **Dependencies** | Mocked/faked | Real (or a realistic test instance, e.g. a Dockerized DB) |
| **Speed** | Milliseconds | Seconds (spinning up connections, I/O) |
| **What it catches** | Logic errors within a unit | Wiring/contract errors *between* units |
| **Flakiness risk** | Very low | Higher (network, timing, shared state) |
| **Typical count in a suite** | Hundreds to thousands | Dozens to a few hundred |

## Common Strategies for Setting Up Real Dependencies
- **Dockerized test databases:** spin up a disposable Postgres/MySQL container per test run so tests hit real SQL, not a mock.
- **In-memory equivalents:** e.g. SQLite in-memory mode, or an in-memory Redis — faster than a full container, though slightly less faithful to production.
- **Test containers libraries:** tools like Testcontainers automate spinning up and tearing down real infrastructure per test suite.
- **Isolated test schemas/transactions:** wrap each test in a database transaction that's rolled back afterward, so tests don't pollute each other's state.

## Why Integration Tests Matter
Unit tests can all pass while the system is still fundamentally broken, if the *assumptions* two mocked-out modules make about each other are wrong. Integration tests catch exactly that class of failure — mismatched API contracts, incorrect SQL, wrong serialization formats — at the cost of being slower and slightly more brittle than unit tests. That tradeoff is why they sit in the middle of the testing pyramid: valuable, but used more sparingly than unit tests.
	`
	},

	'End-to-End Testing': {
		definition:
			'A test that drives an application through a real (or near-real) browser or client, exercising a full user workflow across the entire stack exactly as a real user would.',
		useCase:
			'Automating a browser to log in, add an item to a cart, and complete checkout on a real staging environment, to confirm the entire flow works end to end.',
		detailedMarkdown: `
# End-to-End (E2E) Testing

An **end-to-end test** drives your application the way a real user would — clicking buttons, filling in forms, navigating pages — through a real (or near-real) browser, hitting the actual frontend, backend, and often a real database. It verifies that every layer of the stack, wired together exactly as in production, produces the correct outcome for a complete user journey.

Where a unit test asks "does this function work?" and an integration test asks "do these two modules work together?", an E2E test asks the broadest possible question: **"does the whole system deliver the feature the user actually needs?"**

## Code Example (Playwright, TypeScript)
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('user can log in and complete checkout', async ({ page }) => {
  // 1. Log in
  await page.goto('https://staging.example.com/login');
  await page.fill('[name="email"]', 'ada@example.com');
  await page.fill('[name="password"]', 'correct-password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);

  // 2. Add an item to the cart
  await page.goto('https://staging.example.com/products/wireless-mouse');
  await page.click('text=Add to Cart');
  await expect(page.locator('.cart-count')).toHaveText('1');

  // 3. Complete checkout
  await page.goto('https://staging.example.com/checkout');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.click('text=Place Order');

  await expect(page.locator('.order-confirmation')).toBeVisible();
  await expect(page.locator('.order-confirmation')).toContainText('Thank you');
});
\`\`\`

This single test touches the login page, session/auth handling, the product catalog, the cart, the payment flow, and the order confirmation — a real browser rendering real pages, backed by a real (or realistic) server.

## Tools of the Trade
- **Playwright** — modern, fast, supports multiple browser engines, increasingly the default choice for new projects.
- **Cypress** — developer-friendly, great debugging experience, historically limited to one tab/origin per test (relaxed in newer versions).
- **Selenium** — the oldest and most battle-tested tool, supports the widest range of browsers/languages, but with a more verbose API.

## The Tradeoff: Powerful but Expensive
E2E tests give you the highest confidence that a *feature*, not just a function, actually works — but that confidence is expensive:

- **Slow:** each test may take seconds to minutes (real page loads, real network calls, real rendering).
- **Flaky:** timing issues, animations, network hiccups, and third-party services can cause tests to fail intermittently for reasons unrelated to a real bug.
- **Expensive to maintain:** a UI redesign can break dozens of E2E tests even when the underlying logic is unchanged (a moved button, a renamed CSS class).
- **Hard to debug:** a failure could originate in the frontend, backend, database, or network — pinpointing the cause takes longer than a failing unit test would.

## The Testing Pyramid
This tradeoff is why teams organize their test suite as a **pyramid**: lots of cheap, fast unit tests at the base; a moderate number of integration tests in the middle; and a small number of E2E tests at the very top, reserved for the most critical user journeys (login, checkout, sign-up) rather than every possible code path.

\`\`\`
              /\\\\
             /  \\\\      E2E Tests
            / E2E \\\\    (few, slow, high confidence, expensive)
           /--------\\\\
          /          \\\\
         / Integration \\\\  Integration Tests
        /--------------\\\\ (some, moderate speed, catch wiring bugs)
       /                \\\\
      /   Unit Tests     \\\\  Unit Tests
     /----------------------\\\\ (many, fast, cheap, precise failures)
\`\`\`

| Layer | Count | Speed | Confidence per test | Cost of flakiness |
|---|---|---|---|---|
| **Unit** | Hundreds–thousands | Milliseconds | Low (one function) | Very low |
| **Integration** | Dozens–hundreds | Seconds | Medium (a few components) | Moderate |
| **E2E** | Handful–dozens | Seconds–minutes | High (whole user journey) | High |

## Interview Tip
A strong answer to "how would you structure your test suite?" invokes the pyramid directly: push as much verification as possible down into fast unit tests, use integration tests to validate the seams between real components, and reserve E2E tests for the handful of user journeys where nothing less than the real, fully-wired system will give you confidence.
	`
	},

	Mocking: {
		definition:
			'The technique of replacing a real dependency (a database, API, or other collaborator) with a controllable fake stand-in, so a test can isolate and verify behavior without relying on that real dependency.',
		useCase:
			"Mocking a third-party PaymentGateway API in a unit test so the test suite never makes a real network call, incurs a real charge, or depends on the provider's uptime.",
		detailedMarkdown: `
# Mocking

**Mocking** means substituting a real dependency — a database, an external API, the system clock, a file system — with a fake, controllable stand-in for the purposes of a test. It's the primary technique that makes true *unit* testing possible: by replacing everything a function depends on, you isolate the one piece of logic you actually want to verify.

## Mocks vs. Stubs vs. Spies
These terms get used loosely in casual conversation, but they mean slightly different things:

| Term | What it does | Typical use |
|---|---|---|
| **Stub** | Returns canned/hardcoded responses; has no assertions of its own | "When this is called, just return this fixed value." |
| **Mock** | A stub that *also* records how it was called, so the test can assert on interactions (was it called? with what args? how many times?) | "Verify \`chargeCard\` was called exactly once with amount \`49.99\`." |
| **Spy** | Wraps a *real* implementation, letting it run normally while also recording calls to it | "Let the real function execute, but let me verify it was invoked." |

In everyday practice, most JavaScript/TypeScript testing frameworks (Jest, Vitest) blur these into one flexible \`vi.fn()\` / \`jest.fn()\` API that can act as any of the three depending on how you configure it.

## Code Example (Vitest, TypeScript)
\`\`\`typescript
// orderService.ts
export interface PaymentGateway {
  charge(amount: number): Promise<{ success: boolean }>;
}

export class OrderService {
  constructor(private gateway: PaymentGateway) {}

  async checkout(amount: number): Promise<string> {
    const result = await this.gateway.charge(amount);
    return result.success ? 'order confirmed' : 'payment failed';
  }
}

// orderService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { OrderService, PaymentGateway } from './orderService';

describe('OrderService', () => {
  it('confirms the order when the gateway reports success', async () => {
    const mockGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue({ success: true })
    };
    const service = new OrderService(mockGateway);

    const result = await service.checkout(49.99);

    expect(result).toBe('order confirmed');
    expect(mockGateway.charge).toHaveBeenCalledWith(49.99); // verify the interaction
    expect(mockGateway.charge).toHaveBeenCalledTimes(1);
  });

  it('reports failure when the gateway declines the charge', async () => {
    const mockGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue({ success: false })
    };
    const service = new OrderService(mockGateway);

    const result = await service.checkout(49.99);

    expect(result).toBe('payment failed');
  });
});
\`\`\`

Not one real network request is made. The test never hits Stripe, never depends on network latency, and never risks an actual charge — it purely verifies \`OrderService\`'s own logic given a controlled response from its dependency.

## Why Mocking Requires Good Abstractions
Mocking \`gateway\` here is only possible because \`OrderService\` depends on the \`PaymentGateway\` **interface**, not a concrete \`StripeGateway\` class — this is exactly the **Dependency Injection** pattern paying off in your test suite. Code that hard-codes its dependencies is much harder to mock.

## The Risk: Over-Mocking
Mocking is powerful, but it's easy to overuse. If you mock too much, your tests stop verifying anything real — they can pass even while the actual, unmocked system is completely broken:

- Mocking the database in *every* test means you never actually verify your SQL queries are correct.
- Mocking an external API's response shape based on stale documentation means your tests keep passing even after the real API changes its contract.
- A test suite that's 100% green can hide a production outage, because every seam between real components was faked out.

This is precisely why **integration tests still matter** even when your unit tests are thorough: unit tests with mocks prove your logic is correct *given the assumptions baked into the mock*; integration tests prove those assumptions themselves are actually true against the real dependency.

## Rule of Thumb
Mock at the **boundary of your system** — external APIs, third-party services, things genuinely outside your control or too slow/costly to hit in every test run. Avoid mocking your *own* internal collaborators just to make a test "purer" — that often just moves the bug from "caught by a test" to "caught in production."
	`
	},

	'API Testing': {
		definition:
			"Testing an API's contract directly — status codes, response shape, headers, and error handling — by sending real requests to its endpoints, without going through any UI.",
		useCase:
			'Sending a request straight to a `POST /users` REST endpoint and asserting it returns a `201` status with the correct JSON body, independent of any frontend that might call it.',
		detailedMarkdown: `
# API Testing

**API testing** verifies an API's contract directly, at the HTTP (or RPC/GraphQL) layer, bypassing any user interface entirely. Instead of clicking through a browser, a test sends real requests to real endpoints and asserts on the response: status code, headers, body shape, and error behavior. It sits conceptually between a unit test and a full E2E test — you're exercising a real running server (or an in-process version of it), but skipping the browser and UI rendering altogether.

This makes API tests both faster and more stable than E2E tests, while still catching a class of bug unit tests can't: whether the actual wire-level contract (routes, status codes, JSON shape, auth headers) is correct — something that matters enormously if other teams, mobile clients, or third parties consume your API.

## Code Example (Supertest + Vitest, TypeScript)
\`\`\`typescript
// server.ts
import express from 'express';

export const app = express();
app.use(express.json());

app.post('/users', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'invalid email' });
  }
  return res.status(201).json({ id: 'usr_123', email });
});

// server.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './server';

describe('POST /users', () => {
  it('creates a user and returns 201 with the created resource', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'ada@example.com' })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ email: 'ada@example.com' });
    expect(response.body.id).toBeDefined();
  });

  it('returns 400 for an invalid email', async () => {
    const response = await request(app).post('/users').send({ email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('invalid email');
  });
});
\`\`\`

This test never renders a single pixel of UI — it asserts directly on the HTTP response, which is exactly the layer that matters to any consumer of the API (a web frontend, a mobile app, or another backend service).

## What Good API Tests Check
- **Status codes:** \`200\`/\`201\` on success, \`400\`/\`422\` for bad input, \`401\`/\`403\` for auth failures, \`404\` for missing resources, \`500\` handled gracefully (or, better, never triggered by a client error).
- **Response shape:** the JSON body matches the documented schema (field names, types, nesting) — critical if you publish an OpenAPI/Swagger spec that other teams rely on.
- **Headers:** correct \`Content-Type\`, caching headers, rate-limit headers, CORS headers where relevant.
- **Auth & authorization:** requests without a token are rejected; a token from user A cannot access user B's private resource.
- **Idempotency & side effects:** e.g. calling a \`PUT\` endpoint twice with the same payload produces the same end state, not duplicated records.
- **Error handling:** malformed input, missing required fields, and edge cases return sensible, well-structured error responses rather than a raw stack trace.

## Tools of the Trade
- **Postman/Newman** — GUI-driven request building and collections, popular for manual exploration and can be automated in CI via Newman.
- **Supertest** — a lightweight Node.js library that lets tests make requests directly against an Express/Node app in-process, without needing a real running server or open port.
- **REST-assured / Karate** — common choices in the Java ecosystem for expressive, readable API assertions.

## Where It Fits
API tests give you confidence in the layer that actually matters most to *integration partners* — the contract — without paying for a browser or a full UI render. Many teams treat a solid layer of API tests as their primary integration-testing strategy for backend services, reserving true E2E browser tests only for the handful of critical, UI-driven user journeys.
	`
	},

	'Test Coverage': {
		definition:
			'A metric describing the percentage of a codebase (lines, branches, or functions) that is executed at least once by a test suite.',
		useCase:
			'Running a coverage report to discover that an error-handling branch in a payment module has 0% coverage, revealing an entirely untested failure path before it ships.',
		detailedMarkdown: `
# Test Coverage

**Test coverage** (or "code coverage") is a metric that reports what percentage of your source code was executed while your test suite ran. Tools like Istanbul (via \`vitest --coverage\` or \`jest --coverage\`) instrument your code, run the tests, and produce a report broken down by several dimensions:

- **Line coverage** — percentage of executable lines run at least once.
- **Branch coverage** — percentage of conditional branches (both sides of an \`if\`, each \`case\` in a \`switch\`) that were exercised.
- **Function coverage** — percentage of defined functions that were called at least once.
- **Statement coverage** — similar to line coverage, but counts individual statements rather than physical lines.

## Reading a Coverage Report
\`\`\`
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
pricing.ts      |   90.0  |   50.0   |  100.0  |   90.0  | 14
paymentGateway.ts|  60.0  |   25.0   |   80.0  |   60.0  | 22-31, 40
\`\`\`

That \`paymentGateway.ts\` branch coverage of 25% is the interesting signal here — it means most of the *decision points* in that file (likely error-handling and edge cases) are never exercised by any test, even if the "happy path" lines run fine.

## Why 100% Coverage Does Not Mean Bug-Free
This is the single most important thing to understand about coverage, and a favorite interview question. Coverage only tells you a line of code **executed** during a test — it says absolutely nothing about whether the test **asserted anything meaningful** about the result.

\`\`\`typescript
function divide(a: number, b: number): number {
  return a / b;
}

// This test gives 100% line coverage for divide()...
it('calls divide', () => {
  divide(10, 0); // executes the line, but asserts nothing
});
\`\`\`

This test hits 100% coverage of \`divide\` while catching *zero* bugs — it never checks that dividing by zero produces \`Infinity\`, or that the function throws, or anything about correctness at all. A codebase can report 100% coverage and still ship with serious, easily-triggered bugs, simply because the tests exercised the code without ever verifying its behavior.

## Coverage as a Signal, Not a Target
The healthy way to use coverage is as a **diagnostic tool that points at untested territory**, not as a scoreboard to maximize:

- **Use it to find gaps:** a coverage report is excellent at surfacing an entire error-handling branch, an edge case, or a whole file nobody thought to test.
- **Don't chase a number:** mandating "100% coverage" as a policy incentivizes writing shallow tests (like the \`divide\` example above) purely to move the percentage, which actively harms test suite quality.
- **Weight it by risk:** aim for high coverage on business-critical logic (payments, auth, data integrity) and accept lower coverage on trivial glue code, generated code, or simple pass-through wrappers.
- **Pair it with mutation testing (advanced):** tools like Stryker intentionally introduce small bugs ("mutants") into your code and check whether your test suite catches them — this measures whether your assertions are actually meaningful, addressing exactly the blind spot plain line coverage has.

## Interview Tip
If asked "what coverage percentage should a team aim for?", the strong answer isn't a number — it's the observation that coverage is a lagging, partial signal. A team should use coverage reports to hunt down untested code paths (especially error handling and edge cases), while relying on code review, mutation testing, and production incident history to judge whether the tests that *do* exist are actually rigorous.
	`
	}
};
