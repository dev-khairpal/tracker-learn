import type { RoadmapDetailMap } from './types';

export const DatabasesSqlContent: RoadmapDetailMap = {
	Constraints: {
		definition:
			'Rules enforced on table columns that restrict the kind of data that can be stored, protecting data integrity at the database level.',
		useCase: 'Preventing an order row from ever being saved without a valid customer_id.',
		detailedMarkdown: `
# Constraints

**Constraints** are rules attached to columns (or whole tables) that the database engine enforces on every insert or update. They are your last line of defense against bad data — even if application code has a bug, the database will refuse to save something that violates a constraint.

## The Main Types

\`\`\`sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    age INT CHECK (age >= 0),
    country VARCHAR(2) DEFAULT 'US',
    referrer_id INT REFERENCES users(id)
);
\`\`\`

- **NOT NULL** — the column must always have a value.
- **UNIQUE** — no two rows can share the same value (e.g. \`email\`).
- **CHECK** — a custom boolean condition every row must satisfy (\`age >= 0\`).
- **DEFAULT** — the value used when none is supplied.
- **PRIMARY KEY** — uniquely identifies a row; implicitly \`NOT NULL\` + \`UNIQUE\`.
- **FOREIGN KEY** — a value must exist in another table's referenced column (referential integrity).

## Why This Matters
> **Golden Rule:** Never rely on application code alone to guarantee data integrity — race conditions between two concurrent requests can slip invalid data past your app logic, but they cannot slip past a database constraint.

For example, two simultaneous "sign up" requests with the same email could both pass an application-level "is this email taken?" check before either has committed. A \`UNIQUE\` constraint makes the *database* reject the second insert, guaranteeing correctness regardless of timing.
		`
	},
	'Primary & Foreign Keys': {
		definition:
			'A Primary Key uniquely identifies each row in a table; a Foreign Key links a row to a row in another table, enforcing referential integrity.',
		useCase: 'Linking every row in an orders table back to a valid row in the users table.',
		detailedMarkdown: `
# Primary & Foreign Keys

## Primary Key
A **Primary Key** uniquely identifies every row in a table. It is automatically \`NOT NULL\` and \`UNIQUE\`, and most engines build a **clustered index** on it by default (see *Clustered vs Non-Clustered Index*).

\`\`\`sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);
\`\`\`

A **composite primary key** spans multiple columns when no single column is unique on its own (e.g. a \`(student_id, course_id)\` pair in an enrollment table).

## Foreign Key
A **Foreign Key** is a column (or set of columns) in one table that must match a value that exists in another table's primary key. This is how relational databases enforce **referential integrity** — you cannot insert an order for a customer that doesn't exist.

\`\`\`sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

## ON DELETE Behavior
| Option | Behavior when the referenced row is deleted |
|---|---|
| \`CASCADE\` | Automatically deletes the dependent rows too. |
| \`SET NULL\` | Sets the foreign key column to \`NULL\`. |
| \`RESTRICT\` / \`NO ACTION\` | Blocks the delete if dependent rows exist. |

Choosing the wrong \`ON DELETE\` behavior is a classic real-world bug — \`CASCADE\` on a users table can silently wipe out years of order history if someone deletes a test account.
		`
	},
	'Clustered vs Non-Clustered Index': {
		definition:
			'A clustered index determines the physical storage order of table rows; a non-clustered index is a separate structure that points back to the rows.',
		useCase:
			'Choosing the clustered index on id (physical order) while adding a non-clustered index on email (lookup speed).',
		detailedMarkdown: `
# Clustered vs Non-Clustered Index

Both are B-Tree structures (see *Indexes*), but they differ in what they actually store.

## Clustered Index
The table's rows are physically **sorted on disk** according to the clustered index's key. Because the data itself is organized this way, a table can have **at most one** clustered index — usually built automatically on the Primary Key.

## Non-Clustered Index
A separate structure, sorted by the indexed column, where each leaf node stores the indexed value plus a **pointer** back to the actual row (in Postgres/MySQL InnoDB, that pointer is typically the primary key value). A table can have **many** non-clustered indexes.

| | Clustered | Non-Clustered |
|---|---|---|
| Count per table | 1 | Many |
| Storage | IS the table's row order | Separate structure + pointer |
| Lookup speed | Fastest (data is right there) | One extra hop to fetch the row |
| Typical use | Primary key | Any frequently filtered/sorted column |

## Worked Example
\`\`\`sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,        -- clustered: rows physically stored by id
    customer_email VARCHAR(255)
);
CREATE INDEX idx_orders_email ON orders(customer_email); -- non-clustered
\`\`\`
Searching \`WHERE id = 42\` reads the row directly from its sorted position. Searching \`WHERE customer_email = 'a@b.com'\` first finds the match in the non-clustered index, then follows the pointer to fetch the full row — an extra step, but still vastly faster than a full table scan.
		`
	},
	'Composite Index': {
		definition:
			'An index built on two or more columns together, useful for queries that filter or sort on that same combination of columns.',
		useCase: 'Speeding up a query that always filters by last_name and then first_name.',
		detailedMarkdown: `
# Composite Index

A **Composite Index** (a.k.a. multi-column index) indexes several columns as one combined key.

\`\`\`sql
CREATE INDEX idx_users_name ON users(last_name, first_name);
\`\`\`

## The Leftmost Prefix Rule
This is the single most important, most-asked-in-interviews fact about composite indexes: the index is only useful for queries that filter starting from the **leftmost** column(s).

| Query | Can use \`idx_users_name\`? |
|---|---|
| \`WHERE last_name = 'Khan'\` | ✅ Yes |
| \`WHERE last_name = 'Khan' AND first_name = 'Ali'\` | ✅ Yes |
| \`WHERE first_name = 'Ali'\` | ❌ No — skips the leftmost column |

Think of it like a phone book sorted by (last name, first name): you can quickly jump to "Khan", and within "Khan" jump to "Ali". But you cannot efficiently find everyone named "Ali" without scanning the whole book, because first names aren't sorted independently.

> **Golden Rule:** Put the column with the most common exact-match filter (or the one used in the most queries) first in the composite index.

## When to Use One
Composite indexes shine when your app *consistently* filters or sorts by the same set of columns together — they're more storage-efficient than creating several single-column indexes for that purpose.
		`
	},
	'Covering Index': {
		definition:
			'An index that contains every column a query needs, letting the database answer entirely from the index without reading the actual table row.',
		useCase: 'Making a SELECT email, name WHERE email = ? query resolve entirely from the index.',
		detailedMarkdown: `
# Covering Index

A **Covering Index** "covers" a query — meaning every column the query needs (both in \`WHERE\` and \`SELECT\`) is present in the index itself, so the database never has to do the extra hop back to the actual table row.

## Example
\`\`\`sql
CREATE INDEX idx_users_email_covering ON users(email) INCLUDE (name, signup_date);
-- or, in MySQL, simply a composite index:
CREATE INDEX idx_users_email_covering ON users(email, name, signup_date);

SELECT name, signup_date FROM users WHERE email = 'a@b.com';
\`\`\`

Because \`email\`, \`name\`, and \`signup_date\` are all inside the index, the engine performs an **index-only scan** — it never touches the underlying table's data pages.

## Why It's Faster
A regular non-clustered index lookup is: *search the index → follow a pointer → read the table row from disk*. That last step is the expensive one (an extra disk/page read). A covering index eliminates it entirely.

## The Trade-off
Covering indexes are wider (they store more columns), which means more disk space and slightly slower writes — the same fundamental cost/benefit as any index (see *Indexes*), just amplified by storing extra columns "just in case a query needs them." Use them surgically for your hottest, most performance-critical queries, not everywhere.
		`
	},
	'Execution Plan': {
		definition:
			'A breakdown of the exact steps a database engine will take to run a query, used to diagnose why a query is slow.',
		useCase:
			'Running EXPLAIN ANALYZE to discover a query is doing a full table scan instead of using an index.',
		detailedMarkdown: `
# Execution Plan

An **Execution Plan** (or query plan) is what you get when you ask the database "how do you intend to run this query?" instead of actually running it. It's the single most useful debugging tool for slow SQL.

## Reading a Plan
\`\`\`sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_email = 'a@b.com';
\`\`\`

Key things to look for in the output:
- **Seq Scan (Sequential/Full Table Scan)** — the engine read every row. Fine for a tiny table, a red flag on a large one.
- **Index Scan / Index Only Scan** — the engine used an index. This is usually what you want.
- **Estimated rows vs. Actual rows** — a huge mismatch means the query planner's statistics are stale (running \`ANALYZE\` refreshes them).
- **Cost** — a unitless number representing estimated work; useful for comparing two versions of the same query.

## EXPLAIN vs EXPLAIN ANALYZE
| | What it does |
|---|---|
| \`EXPLAIN\` | Shows the *planned* strategy without running the query. |
| \`EXPLAIN ANALYZE\` | Actually **runs** the query and shows real timing + real row counts. |

> **Caution:** \`EXPLAIN ANALYZE\` on an \`UPDATE\`/\`DELETE\` will really perform the write — wrap it in a transaction and \`ROLLBACK\` if you're just investigating.

## The Interview Angle
"How would you debug a slow query?" is a near-universal backend interview question. The expected answer is almost always: *run \`EXPLAIN ANALYZE\`, look for sequential scans on large tables, and add an index on the filtered/joined column if one is missing.*
		`
	},
	'Query Optimization': {
		definition:
			'The practice of rewriting queries and schema access patterns so the database does less work to return the same result.',
		useCase:
			'Turning a query that scans 10 million rows into one that uses an index and touches only 50.',
		detailedMarkdown: `
# Query Optimization

Query optimization is less about clever tricks and more about a disciplined checklist. In rough order of impact:

## 1. Add the Right Index
By far the highest-leverage fix. Use *Execution Plan* (\`EXPLAIN ANALYZE\`) to confirm the query is doing a sequential scan, then index the filtered/joined/sorted column.

## 2. Avoid \`SELECT *\`
\`\`\`sql
-- Bad: pulls every column, defeats covering indexes, wastes bandwidth
SELECT * FROM users WHERE id = 1;
-- Good: only what you actually need
SELECT id, name, email FROM users WHERE id = 1;
\`\`\`

## 3. Avoid N+1 Queries
Fetching a list, then looping and querying once per item, turns 1 query into N+1. Fix with a single \`JOIN\` or a batched \`WHERE id IN (...)\` query.

## 4. Filter Before You Join, Join Before You Sort
Let the database narrow down rows as early as possible in a query's logical execution.

## 5. Batch Writes
Ten single-row \`INSERT\`s round-trip to the database ten times; one multi-row \`INSERT\` round-trips once.

## 6. Watch Out for Functions on Indexed Columns
\`\`\`sql
-- Bad: LOWER() on every row disables the index on email
WHERE LOWER(email) = 'a@b.com'
-- Good: normalize at write time, or use a functional index
WHERE email = 'a@b.com'
\`\`\`

> **Golden Rule:** Always measure with \`EXPLAIN ANALYZE\` before *and* after a change — intuition about what's "obviously" faster is wrong surprisingly often.
		`
	},
	Transactions: {
		definition:
			'A group of one or more SQL statements executed as a single all-or-nothing unit of work.',
		useCase:
			'Transferring money between two bank accounts — both the debit and the credit must succeed together, or neither should happen.',
		detailedMarkdown: `
# Transactions

A **Transaction** wraps multiple statements so they either *all* succeed and are permanently saved (**commit**), or if anything goes wrong, *none* of them take effect (**rollback**) — the database is left exactly as if the transaction never started.

## Worked Example: A Bank Transfer
\`\`\`sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- debit
UPDATE accounts SET balance = balance + 100 WHERE id = 2; -- credit

COMMIT; -- both succeed together
-- or: ROLLBACK; if something went wrong (e.g. account 1 had insufficient funds)
\`\`\`

If the process crashed between the two \`UPDATE\`s without a transaction, $100 would simply vanish from the system — debited from account 1 but never credited to account 2. The transaction guarantees that can't happen.

## Why This Matters
This is the foundation for **ACID** — Transactions are the mechanism; ACID describes the *guarantees* transactions provide. Any time an operation touches more than one row, table, or external effect, and those changes must succeed or fail together, you need a transaction.
		`
	},
	ACID: {
		definition:
			'Atomicity, Consistency, Isolation, and Durability — the four guarantees a database transaction provides.',
		useCase:
			'Guaranteeing that a bank transfer transaction cannot be half-applied, seen partially by another user, or lost after a crash.',
		detailedMarkdown: `
# ACID

**ACID** describes the four properties that make database transactions safe to build a business on. Using the same bank-transfer example as *Transactions*, here's what each letter guarantees:

## Atomicity
*All statements in the transaction succeed, or none do.* If the credit to account 2 fails, the earlier debit from account 1 is automatically undone too — you never end up with money debited from one account and not credited to the other.

## Consistency
*The database moves from one valid state to another valid state.* If there's a \`CHECK (balance >= 0)\` constraint, a transaction that would leave an account negative is rejected outright — the database never ends up in a state that violates its own rules.

## Isolation
*Concurrent transactions don't see each other's uncommitted changes.* If another user is checking account 1's balance at the exact moment the transfer transaction is running, they see either the balance *before* the transfer or *after* it — never a confusing in-between state. (The exact strength of this guarantee is tunable — see *Isolation Levels*.)

## Durability
*Once committed, the change survives a crash.* The instant the database says "COMMIT successful," that transfer is written to durable storage — even if the server loses power one millisecond later, the transfer is not lost.

## Why Interviewers Ask This
ACID is the vocabulary for explaining *why* relational databases are trusted for money, inventory, and anything else where "probably correct" isn't good enough — contrast this with **BASE**, the eventual-consistency alternative many NoSQL systems favor.
		`
	},
	'Isolation Levels': {
		definition:
			"Configurable settings that control how much one transaction is allowed to see of another transaction's in-progress changes.",
		useCase:
			'Choosing Read Committed as a sensible default, or Serializable when correctness matters more than throughput.',
		detailedMarkdown: `
# Isolation Levels

The **Isolation** in ACID isn't all-or-nothing — SQL defines four standard levels, each trading correctness for performance.

## The Three Phenomena They Prevent
- **Dirty Read** — reading another transaction's *uncommitted* changes (which might get rolled back).
- **Non-Repeatable Read** — reading the same row twice in one transaction and getting different values because another transaction committed a change in between.
- **Phantom Read** — re-running the same range query twice in one transaction and getting a *different set of rows* because another transaction inserted/deleted matching rows in between.

## The Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | ❌ Possible | ❌ Possible | ❌ Possible |
| Read Committed | ✅ Prevented | ❌ Possible | ❌ Possible |
| Repeatable Read | ✅ Prevented | ✅ Prevented | ❌ Possible* |
| Serializable | ✅ Prevented | ✅ Prevented | ✅ Prevented |

*(Postgres's Repeatable Read actually also prevents phantom reads via MVCC snapshotting — the SQL standard only *requires* it at Serializable, but implementations vary.)*

## Practical Guidance
- **Read Committed** is the default in Postgres and Oracle, and a sensible default for most applications — cheap, and prevents the most obviously dangerous phenomenon.
- **Serializable** gives the strongest guarantee (transactions behave as if run one at a time) but costs the most throughput and can force transactions to retry on conflict.

> Isolation levels are enforced using **Locks** under the hood (or MVCC snapshotting) — the stricter the level, the more locking/retrying is needed.
		`
	},
	Locks: {
		definition:
			'A mechanism databases use to prevent two transactions from conflicting when they access the same data at the same time.',
		useCase:
			'An UPDATE statement taking a row-level lock so a concurrent UPDATE on the same row has to wait.',
		detailedMarkdown: `
# Locks

**Locks** are how a database physically enforces isolation between concurrent transactions.

## Shared vs Exclusive
- **Shared Lock (Read Lock)** — multiple transactions can hold a shared lock on the same row at once (many readers, no writers).
- **Exclusive Lock (Write Lock)** — only one transaction can hold it, and no one else can hold *any* lock on that row while it's held (one writer, blocks everyone).

## Granularity
| Lock Level | Impact |
|---|---|
| Row-level | Only the touched rows are locked — high concurrency. |
| Table-level | The entire table is locked — simpler, but blocks unrelated rows too. |

Modern engines (Postgres, MySQL InnoDB) default to row-level locking for good concurrency.

## Worked Example
\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1; -- takes an exclusive lock on row id=1
-- a concurrent UPDATE on the SAME row now blocks until this transaction COMMITs or ROLLBACKs
COMMIT;
\`\`\`

## Locks and Deadlocks
If Transaction A locks row 1 then tries to lock row 2, while Transaction B locks row 2 then tries to lock row 1, neither can proceed — a classic **Deadlock**. Most databases detect this automatically and abort one of the transactions with an error, which your application code must be ready to retry.

## Pessimistic vs. Optimistic Concurrency Control
Everything above — shared/exclusive row locks — is **pessimistic locking**: it assumes conflicts are likely, so it blocks other transactions upfront, before any conflict has actually happened. There's an entirely different strategy that's a near-universal follow-up question once you've explained locks: **optimistic concurrency control**.

Instead of taking a lock, you add a \`version\` (or \`updated_at\`) column and let every transaction proceed without blocking anyone. When you go to save, you check whether the row still has the version you originally read:

\`\`\`sql
-- 1. Read the row along with its current version
SELECT id, balance, version FROM accounts WHERE id = 1; -- version = 5

-- 2. Do your business logic in application code (no lock held while thinking!)

-- 3. Write back, but only if nobody else changed it in the meantime
UPDATE accounts
SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;
-- If another transaction already updated this row, version is no longer 5,
-- this UPDATE affects 0 rows, and your application code detects that and retries.
\`\`\`

| | Pessimistic Locking | Optimistic Concurrency Control |
|---|---|---|
| **Assumption** | Conflicts are likely | Conflicts are rare |
| **Behavior** | Blocks other transactions immediately | Never blocks; detects conflict only at write time |
| **Cost when conflicts are rare** | Wasted blocking/waiting for no reason | Near-zero — just an extra \`WHERE version = ?\` check |
| **Cost when conflicts are common** | Works well — avoids repeated wasted work | Expensive — transactions repeatedly fail and must retry |
| **Failure mode** | Threads/transactions block, or deadlock | \`UPDATE\` silently affects 0 rows; app must detect and retry |

**When to use which:** pessimistic locking fits high-contention resources (e.g., the last few seats on a flight, where conflicts are the norm). Optimistic concurrency fits low-contention resources with many concurrent readers and few actual conflicting writes (e.g., editing a user profile) — you avoid paying any locking cost for the common case where nobody else touches the same row at the same time.
		`
	},
	Joins: {
		definition:
			'SQL operations that combine rows from two or more tables based on a related column between them.',
		useCase:
			'Combining an orders table with a customers table to show the customer name on every order.',
		detailedMarkdown: `
# Joins

Assume two tables: \`users(id, name)\` and \`orders(id, user_id, total)\`. Not every user has placed an order yet.

## INNER JOIN
Returns only rows that match in **both** tables.
\`\`\`sql
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
\`\`\`
Users with zero orders don't appear at all.

## LEFT JOIN
Returns **every row from the left table**, plus matching rows from the right (or \`NULL\` if there's no match).
\`\`\`sql
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
\`\`\`
A user with no orders still shows up, with \`o.total\` as \`NULL\` — the classic way to answer "which users have never ordered?" (\`WHERE o.id IS NULL\`).

## RIGHT JOIN
The mirror image of \`LEFT JOIN\` — every row from the right table. Rarely used in practice since you can just swap table order and use \`LEFT JOIN\`.

## FULL OUTER JOIN
Every row from **both** tables, matched where possible, \`NULL\`-padded where not. (Not supported directly in MySQL — emulated with \`UNION\` of a \`LEFT\` and \`RIGHT\` join.)

## CROSS JOIN
Every row of the left table combined with every row of the right — a Cartesian product. Rare in application code; useful for generating combinations (e.g. all size × color variants of a product).

## SELF JOIN
A table joined to itself, used for hierarchical data:
\`\`\`sql
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`
		`
	},
	'GROUP BY': {
		definition:
			'Collapses rows sharing the same value in specified columns into a single summary row, typically paired with aggregate functions.',
		useCase: 'Counting how many orders each customer has placed.',
		detailedMarkdown: `
# GROUP BY

\`GROUP BY\` buckets rows into groups based on one or more columns, so an aggregate function (see *Aggregate Functions*) can summarize each group.

\`\`\`sql
SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM orders
GROUP BY user_id;
\`\`\`

This produces one row **per unique \`user_id\`**, with \`order_count\` and \`total_spent\` computed across all rows that shared that \`user_id\`.

## The #1 Gotcha
Every column in \`SELECT\` must either be in the \`GROUP BY\` clause, or wrapped in an aggregate function. This fails:
\`\`\`sql
-- ERROR: "product_name" is not in GROUP BY and not aggregated —
-- which product_name would even be shown for a group with 5 different rows?
SELECT user_id, product_name, COUNT(*)
FROM orders
GROUP BY user_id;
\`\`\`
The database can't know which single \`product_name\` to display for a group that might contain many different ones — you must either add it to \`GROUP BY\` (creating more, smaller groups) or aggregate it (e.g. \`STRING_AGG(product_name, ', ')\`).

## Multiple Columns
\`GROUP BY user_id, DATE(created_at)\` groups by the *combination* of user and day — useful for "orders per user per day" reports.
		`
	},
	HAVING: {
		definition:
			'Filters grouped results after aggregation, the way WHERE filters individual rows before aggregation.',
		useCase: 'Finding only the customers who have placed more than 10 orders.',
		detailedMarkdown: `
# HAVING

\`WHERE\` and \`HAVING\` both filter rows, but at different stages of query execution:

\`\`\`sql
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE status = 'completed'      -- filters individual rows, BEFORE grouping
GROUP BY user_id
HAVING COUNT(*) > 10;           -- filters groups, AFTER aggregation
\`\`\`

## Why You Can't Use WHERE for This
\`\`\`sql
-- ERROR: COUNT(*) doesn't exist yet at the point WHERE is evaluated
SELECT user_id, COUNT(*) FROM orders WHERE COUNT(*) > 10 GROUP BY user_id;
\`\`\`
\`WHERE\` runs before rows are grouped, so it has no concept of a group's aggregate value yet. \`HAVING\` runs *after* \`GROUP BY\` has produced summary rows, so it can filter on \`COUNT(*)\`, \`SUM(...)\`, etc.

## Logical Order of Execution
It helps to remember SQL's actual execution order (which is *not* the order you type the clauses): \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`SELECT\` → \`ORDER BY\` → \`LIMIT\`.
		`
	},
	'ORDER BY': {
		definition:
			'Sorts the final result set by one or more columns or expressions, ascending or descending.',
		useCase: 'Showing the most recent orders first on a dashboard.',
		detailedMarkdown: `
# ORDER BY

\`\`\`sql
SELECT * FROM orders ORDER BY created_at DESC;         -- newest first
SELECT * FROM orders ORDER BY status ASC, created_at DESC; -- multi-column
\`\`\`

- \`ASC\` (ascending) is the default if omitted.
- \`DESC\` sorts largest/latest first.
- Multiple columns: ties on the first column are broken by the second, and so on.

## Sorting by an Expression
\`\`\`sql
SELECT * FROM products ORDER BY price * (1 - discount_pct) ASC;
\`\`\`
You can sort by any computed expression, not just raw columns — here, sorting by effective post-discount price.

## Performance
Sorting a small result set is essentially free. Sorting a **large** table with no supporting index forces an expensive in-memory or on-disk sort. If you frequently \`ORDER BY created_at DESC LIMIT 20\` (a very common "recent items" pattern), an index on \`created_at\` lets the database walk the index in already-sorted order and stop after 20 rows — instead of sorting the entire table first.

## NULLs
By default, most databases sort \`NULL\` last in \`ASC\` order and first in \`DESC\` (Postgres lets you override this explicitly with \`NULLS FIRST\`/\`NULLS LAST\`).
		`
	},
	'Aggregate Functions': {
		definition:
			'Functions that compute a single summary value (count, sum, average, min, max) across a set of rows.',
		useCase: 'Calculating the total revenue and average order value for a sales dashboard.',
		detailedMarkdown: `
# Aggregate Functions

\`\`\`sql
SELECT
    COUNT(*)        AS total_orders,
    SUM(total)      AS revenue,
    AVG(total)      AS avg_order_value,
    MIN(total)      AS smallest_order,
    MAX(total)      AS largest_order
FROM orders;
\`\`\`

- **COUNT(*)** counts rows (including ones with \`NULL\` columns); **COUNT(column)** counts only non-\`NULL\` values in that column — these can give *different* answers, which trips people up.
- **SUM / AVG / MIN / MAX** all **ignore \`NULL\`** values automatically.

## The NULL Gotcha
\`\`\`sql
-- If 'discount' is NULL for some rows, AVG only averages the non-NULL ones —
-- it does NOT treat NULL as 0.
SELECT AVG(discount) FROM orders;
\`\`\`
If you actually want \`NULL\` treated as zero, you must be explicit: \`AVG(COALESCE(discount, 0))\`.

## Without GROUP BY
An aggregate function used without \`GROUP BY\` treats the **entire table** as one big group, returning a single row — this is why \`SELECT COUNT(*) FROM orders;\` returns one number, not one row per order.

## With GROUP BY
Pairing aggregates with *GROUP BY* is where they become truly powerful — a summary row per group instead of one summary for the whole table.
		`
	},
	'Window Functions': {
		definition:
			'Functions that perform a calculation across a set of related rows without collapsing them into a single output row, unlike GROUP BY.',
		useCase:
			'Ranking employees by salary within each department while still showing every individual employee row.',
		detailedMarkdown: `
# Window Functions

The key difference from *Aggregate Functions* + *GROUP BY*: a window function still returns **one output row per input row** — it just adds a computed column that "looks across" a defined window of related rows.

## Syntax
\`\`\`sql
SELECT
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;
\`\`\`
\`PARTITION BY\` splits rows into groups (like \`GROUP BY\`, but without collapsing them); \`ORDER BY\` inside \`OVER(...)\` defines the order within each partition.

## The Most-Used Functions
| Function | What it does |
|---|---|
| \`ROW_NUMBER()\` | 1, 2, 3, ... with no ties (arbitrary tiebreak) |
| \`RANK()\` | Ties share a rank; next rank skips (1, 2, 2, 4) |
| \`DENSE_RANK()\` | Ties share a rank; next rank doesn't skip (1, 2, 2, 3) |
| \`LAG(col)\` | Value from the *previous* row in the window |
| \`LEAD(col)\` | Value from the *next* row in the window |

## Worked Example: "Top 3 Per Group"
\`\`\`sql
SELECT * FROM (
    SELECT name, department, salary,
           ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
    FROM employees
) ranked
WHERE rn <= 3;
\`\`\`
This is a very common real interview question — "get the top N rows per group" — and window functions are the clean, idiomatic answer (versus painful correlated subqueries).
		`
	},
	CTE: {
		definition:
			'A named, temporary result set defined with a WITH clause that can be referenced elsewhere in the same query.',
		useCase:
			'Breaking a complex report query into readable, named steps instead of deeply nested subqueries.',
		detailedMarkdown: `
# CTE (Common Table Expression)

A **CTE** lets you name a subquery upfront with \`WITH\`, then reference that name later in the query as if it were a regular table.

## Without a CTE (nested subquery — harder to read)
\`\`\`sql
SELECT * FROM (
    SELECT user_id, SUM(total) AS spent
    FROM orders
    GROUP BY user_id
) AS totals
WHERE spent > 1000;
\`\`\`

## With a CTE (same result, much clearer)
\`\`\`sql
WITH totals AS (
    SELECT user_id, SUM(total) AS spent
    FROM orders
    GROUP BY user_id
)
SELECT * FROM totals WHERE spent > 1000;
\`\`\`

## Multiple CTEs
You can chain several, each able to reference the ones before it:
\`\`\`sql
WITH totals AS (
    SELECT user_id, SUM(total) AS spent FROM orders GROUP BY user_id
), high_spenders AS (
    SELECT user_id FROM totals WHERE spent > 1000
)
SELECT u.name FROM users u JOIN high_spenders h ON u.id = h.user_id;
\`\`\`

## Readability, Not Just Performance
CTEs mainly exist for **readability** — turning a query into named, sequential steps instead of a deeply nested tree of subqueries. (In Postgres 12+, CTEs are inlined/optimized like subqueries by default rather than always materialized — check your specific engine's behavior if performance matters.)
		`
	},
	'Recursive CTE': {
		definition:
			'A CTE that references itself, used to walk hierarchical or graph-like data an unknown number of levels deep.',
		useCase:
			'Fetching an entire employee-to-CEO management chain, or all descendants in an org chart.',
		detailedMarkdown: `
# Recursive CTE

A **Recursive CTE** repeatedly re-applies itself, accumulating results, until no new rows are produced — the standard SQL tool for walking a hierarchy of unknown depth.

## Classic Example: Employee → Manager Chain
Table: \`employees(id, name, manager_id)\`.

\`\`\`sql
WITH RECURSIVE org_chart AS (
    -- Base case: start with one employee
    SELECT id, name, manager_id, 1 AS depth
    FROM employees
    WHERE id = 42

    UNION ALL

    -- Recursive case: join the previous result back to employees
    SELECT e.id, e.name, e.manager_id, oc.depth + 1
    FROM employees e
    JOIN org_chart oc ON e.id = oc.manager_id
)
SELECT * FROM org_chart;
\`\`\`

## How It Works
1. The **base case** (before \`UNION ALL\`) seeds the result with a starting row.
2. The **recursive case** (after \`UNION ALL\`) joins the CTE **to itself**, pulling in the next level up (or down) the hierarchy.
3. This repeats automatically until the recursive case returns zero new rows.

## Common Uses
- Org charts / management chains (as above).
- Category trees (find every subcategory under "Electronics").
- Graph traversal (find every node reachable from a starting node, e.g. "friends of friends").

> **Watch out:** a recursive CTE with a cycle (A reports to B, B reports to A) will loop forever unless you add a depth limit or cycle-detection guard — most engines let you cap it with \`WHERE depth < 20\` inside the recursive branch.
		`
	},
	Subqueries: {
		definition:
			'A query nested inside another query, used as a value, a filter condition, or a virtual table.',
		useCase:
			'Finding all users who have never placed an order, using a subquery inside a WHERE NOT IN clause.',
		detailedMarkdown: `
# Subqueries

A **Subquery** is a \`SELECT\` nested inside another SQL statement.

## Scalar Subquery
Returns a single value, usable anywhere a literal value would go:
\`\`\`sql
SELECT name, (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) AS order_count
FROM users;
\`\`\`

## IN / NOT IN
\`\`\`sql
SELECT * FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM orders);
\`\`\`

## Correlated Subquery
A subquery that references a column from the **outer** query — it re-runs conceptually once per outer row, which can be slow on large tables:
\`\`\`sql
SELECT name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total > 1000);
\`\`\`

## EXISTS vs IN
\`EXISTS\` stops as soon as it finds one matching row (often faster for large subqueries, and handles \`NULL\`s more predictably than \`IN\`/\`NOT IN\`).

## Subqueries vs Joins
Many subqueries can be rewritten as a \`JOIN\` — and for large tables, a \`JOIN\` is often faster because the query planner has more freedom to optimize it, while a correlated subquery can force row-by-row re-evaluation. When in doubt, check the *Execution Plan*.
		`
	},
	Views: {
		definition:
			'A saved, named SELECT query that can be queried like a regular table, without duplicating the underlying data.',
		useCase:
			'Exposing a simplified "active_customers" view so analysts never have to repeat a complex filter.',
		detailedMarkdown: `
# Views

A **View** is a stored query given a name. It doesn't copy data — every time you query the view, the underlying \`SELECT\` runs fresh.

\`\`\`sql
CREATE VIEW active_customers AS
SELECT id, name, email
FROM users
WHERE last_login > NOW() - INTERVAL '30 days';

SELECT * FROM active_customers WHERE name LIKE 'A%';
\`\`\`

## Why Use Views
1. **Simplify complexity** — hide a gnarly multi-join query behind a simple name.
2. **Security by column restriction** — grant an analyst access to a view exposing only \`name, email\` from a \`users\` table that also has a \`password_hash\` column, without ever granting access to the underlying table itself.
3. **Consistency** — one canonical definition of "active customer" used everywhere, instead of the filter logic drifting across a dozen copy-pasted queries.

## Materialized Views
A **Materialized View** *does* store its results physically on disk, like a cached snapshot, and must be explicitly refreshed:
\`\`\`sql
CREATE MATERIALIZED VIEW daily_sales AS
SELECT DATE(created_at) AS day, SUM(total) AS revenue
FROM orders GROUP BY DATE(created_at);

REFRESH MATERIALIZED VIEW daily_sales;
\`\`\`
Use a materialized view when the underlying query is expensive and the data doesn't need to be perfectly real-time — a common pattern for dashboards and reports.
		`
	},
	'Stored Procedures': {
		definition:
			'A named, precompiled block of SQL logic stored in the database itself and invoked by name.',
		useCase:
			'Encapsulating a multi-step order-processing routine so every application calls the same tested logic.',
		detailedMarkdown: `
# Stored Procedures

A **Stored Procedure** lives inside the database and bundles multiple SQL statements (often with conditionals and loops) behind a single callable name.

\`\`\`sql
CREATE PROCEDURE transfer_funds(sender_id INT, receiver_id INT, amount DECIMAL)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE accounts SET balance = balance - amount WHERE id = sender_id;
    UPDATE accounts SET balance = balance + amount WHERE id = receiver_id;
END;
$$;

CALL transfer_funds(1, 2, 100);
\`\`\`

## Pros
- **Performance** — logic runs inside the database, avoiding multiple network round-trips between application and database.
- **Reuse & consistency** — every caller (even from different applications/languages) executes the exact same tested logic.
- **Reduced surface area** — you can grant \`EXECUTE\` permission on a procedure without granting direct table access.

## Cons
- **Harder to version control and test** — SQL logic often lives outside your application's normal code-review/CI pipeline.
- **Vendor lock-in** — stored procedure syntax (PL/pgSQL, T-SQL, PL/SQL) is not portable between database engines.
- **Business logic sprawl** — if some logic lives in the database and some in the application, it becomes harder to reason about the system as a whole.

## Modern Take
Many teams today deliberately keep business logic in the application layer (easier to test, version, and deploy) and reserve stored procedures for very specific, performance-critical, or security-sensitive operations.
		`
	},
	Triggers: {
		definition:
			'A stored procedure that the database runs automatically in response to an INSERT, UPDATE, or DELETE on a table.',
		useCase:
			'Automatically writing a row to an audit_log table every time a sensitive record is updated.',
		detailedMarkdown: `
# Triggers

A **Trigger** fires automatically — you never call it directly — in response to a table event.

## Timing and Event
Triggers are defined by *when* (\`BEFORE\` or \`AFTER\`) and *what* (\`INSERT\`, \`UPDATE\`, \`DELETE\`).

## Worked Example: Audit Log
\`\`\`sql
CREATE FUNCTION log_salary_change() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (employee_id, old_salary, new_salary, changed_at)
    VALUES (OLD.id, OLD.salary, NEW.salary, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_salary_audit
AFTER UPDATE ON employees
FOR EACH ROW
WHEN (OLD.salary IS DISTINCT FROM NEW.salary)
EXECUTE FUNCTION log_salary_change();
\`\`\`
Every time an employee's salary changes, this fires automatically and records the before/after values — no application code has to remember to do it.

## BEFORE vs AFTER
- **BEFORE** triggers can modify \`NEW\` before it's saved (e.g. force-lowercase an email) or even cancel the operation.
- **AFTER** triggers react to a change that has already happened (e.g. logging, sending a notification event).

## The Caution
> **Danger:** Triggers are "hidden" logic — they don't appear anywhere in application code, which makes debugging unexpected behavior much harder ("why did this row change when my code never touched it?"). Use them sparingly, and document them well, for cross-cutting concerns like auditing — not core business logic.
		`
	},
	Normalization: {
		definition:
			'The process of structuring tables to reduce data duplication and improve data integrity, typically by splitting one table into several related ones.',
		useCase:
			"Splitting a spreadsheet-style orders table (with the customer's name and address repeated on every row) into separate customers and orders tables.",
		detailedMarkdown: `
# Normalization

**Normalization** progressively restructures tables to eliminate duplicated data. Walk through it with one messy starting table:

\`\`\`
orders(order_id, customer_name, customer_email, product_name, product_price, quantity)
\`\`\`

## 1NF (First Normal Form)
Every column holds a single, atomic value — no comma-separated lists crammed into one cell. If a row had \`product_names = "Shirt, Hat"\`, that violates 1NF; split it into one row per product.

## 2NF (Second Normal Form)
Builds on 1NF, plus: every non-key column must depend on the **whole** primary key, not just part of it (this specifically matters for composite-key tables). If \`(order_id, product_id)\` is the key but \`customer_email\` only depends on \`order_id\` alone, that's a 2NF violation — split \`customer_email\` into its own table keyed by \`order_id\` (or, better, by customer).

## 3NF (Third Normal Form)
Builds on 2NF, plus: no column should depend on another **non-key** column. \`product_price\` depending on \`product_name\` (rather than directly on the order) is a transitive dependency — pull products into their own table.

## The Result After Normalizing
\`\`\`
customers(customer_id, name, email)
products(product_id, name, price)
orders(order_id, customer_id, product_id, quantity)
\`\`\`
Now a customer's email lives in exactly **one place**. Update it once, and it's correct everywhere — no risk of updating it on 3 orders but forgetting a 4th.

## Why It Matters
Normalization trades some query complexity (more \`JOIN\`s) for data integrity (impossible to have inconsistent duplicate data). See *Denormalization* for when you deliberately reverse this trade-off.
		`
	},
	Denormalization: {
		definition:
			"Deliberately introducing redundant data or pre-computed values into a schema to improve read performance, at the cost of normalization's data-integrity guarantees.",
		useCase:
			'Storing a pre-computed order_total column on the orders table instead of summing line items on every read.',
		detailedMarkdown: `
# Denormalization

Where *Normalization* eliminates redundancy for data integrity, **Denormalization** deliberately reintroduces some redundancy to make reads faster — a conscious trade-off, not a mistake.

## Worked Example
Fully normalized: an order's total is always computed on the fly.
\`\`\`sql
SELECT SUM(quantity * unit_price) FROM order_items WHERE order_id = 42;
\`\`\`
This is correct, but if this dashboard query runs thousands of times a second, recomputing the sum every time is wasteful.

Denormalized: store the total directly on the \`orders\` row.
\`\`\`sql
ALTER TABLE orders ADD COLUMN total DECIMAL;
-- kept in sync via application code or a trigger whenever order_items changes
\`\`\`
Now reading an order's total is a single indexed lookup, no aggregation needed.

## The Cost
The moment you duplicate data, you take on the responsibility of keeping every copy in sync. If an \`order_items\` row changes and the trigger/application code that updates \`orders.total\` has a bug, the two numbers silently drift apart — the exact class of bug normalization was designed to prevent.

## When It's the Right Call
- Read-heavy workloads where the same expensive computation runs constantly.
- Reporting/analytics tables, often rebuilt on a schedule rather than kept live.
- High-scale systems where extra \`JOIN\`s measurably hurt latency (also see *CQRS* in the System Design section, which formalizes "separate, denormalized read model" as an architectural pattern).

> **Golden Rule:** Normalize by default; denormalize deliberately, with a measured performance reason — and a plan for keeping the duplicated data consistent.
		`
	}
};
