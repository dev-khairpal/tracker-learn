export const ROADMAP_DETAILS: Record<
	string,
	{ definition?: string; useCase?: string; detailedMarkdown?: string }
> = {
	'Processes vs Threads': {
		definition:
			'A process is an independent program in execution with its own memory space. A thread is a lightweight execution unit within a process that shares the same memory.',
		useCase:
			'Use processes for high isolation (e.g., Chrome tabs). Use threads for concurrent operations sharing the same data.',
		detailedMarkdown: `
# Processes vs. Threads

Understanding the difference between a process and a thread is one of the most fundamental concepts in computer science and operating systems.

## What is a Process?
A **Process** is an instance of a computer program that is being executed. 
- **Isolation:** Every process has its own isolated memory space (heap, stack, data segment, and code segment).
- **Overhead:** Creating and destroying processes is heavy. Context switching between processes takes more CPU cycles because the OS has to flush the CPU cache and swap out page tables.
- **Example:** Opening a new tab in Google Chrome spawns a completely new OS process. If that tab crashes, it doesn't crash the entire browser.

## What is a Thread?
A **Thread** is the smallest unit of execution within a process. A single process can spawn multiple threads.
- **Shared Memory:** Threads within the same process share the same heap and data segments, but each thread has its own execution stack and program counter.
- **Overhead:** Threads are "lightweight". Context switching between threads of the same process is very fast because they share the same memory layout.
- **Example:** A web server (like Apache or Tomcat) spawns a new thread for every incoming HTTP request. These threads share the server's memory, allowing them to access a shared database connection pool.

## Key Differences

| Feature | Process | Thread |
|---------|---------|--------|
| **Memory** | Isolated. Do not share memory. | Shared. Share heap and data. |
| **Creation** | Heavy and slow (requires OS system calls). | Lightweight and fast. |
| **Context Switch** | Slow (requires flushing caches/TLB). | Fast (no memory address space swap). |
| **Crashing** | If one process crashes, others survive. | If one thread crashes, the whole process crashes. |

## Code Example (Java)

\`\`\`java
public class ConcurrencyExample {
    public static void main(String[] args) {
        // Threading Example (Shared Memory)
        Thread thread = new Thread(() -> {
            System.out.println("Executing in a thread!");
        });
        thread.start();

        // Process Example (Isolated Memory)
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("echo", "Executing in an isolated process!");
            processBuilder.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
\`\`\`

## When to use which?
- **Use Processes (Multiprocessing):** When your tasks are CPU-bound (heavy mathematical calculations, video rendering) to bypass the Global Interpreter Lock (GIL) in languages like Python, or when you need strict crash-isolation.
- **Use Threads (Multithreading):** When your tasks are I/O-bound (waiting for network requests, reading files from disk) where the thread spends most of its time waiting, allowing other threads to run concurrently.
		`
	},
	CRUD: {
		definition: 'Create, Read, Update, Delete are the four basic operations of persistent storage.',
		useCase: 'Designing the standard endpoint routes and database queries for a new blog platform.',
		detailedMarkdown: `
# C.R.U.D.

**CRUD** stands for **Create, Read, Update, and Delete**. These are the four fundamental operations required for persistent storage systems and form the backbone of almost all web applications and APIs.

## The Four Operations

### 1. Create (INSERT)
The operation used to add new data to the system. 
- **SQL Equivalent:** \`INSERT INTO table_name (col1) VALUES (val1);\`
- **HTTP Method:** \`POST\`

### 2. Read (SELECT)
The operation used to retrieve existing data from the system without modifying it.
- **SQL Equivalent:** \`SELECT * FROM table_name;\`
- **HTTP Method:** \`GET\`

### 3. Update (UPDATE)
The operation used to modify existing data.
- **SQL Equivalent:** \`UPDATE table_name SET col1 = val1 WHERE id = 1;\`
- **HTTP Method:** \`PUT\` (Full replacement) or \`PATCH\` (Partial modification)

### 4. Delete (DELETE)
The operation used to remove data from the system.
- **SQL Equivalent:** \`DELETE FROM table_name WHERE id = 1;\`
- **HTTP Method:** \`DELETE\`

## Designing a CRUD REST API
When designing a REST API, you map HTTP verbs directly to CRUD operations. Here is a standard example for a \`/users\` endpoint:

| Action | HTTP Verb | Endpoint | Purpose |
|--------|-----------|----------|---------|
| **Create** | \`POST\` | \`/users\` | Creates a new user |
| **Read** | \`GET\` | \`/users\` | Fetches a list of all users |
| **Read** | \`GET\` | \`/users/:id\` | Fetches a specific user by ID |
| **Update** | \`PUT\` / \`PATCH\` | \`/users/:id\` | Updates a specific user |
| **Delete** | \`DELETE\` | \`/users/:id\` | Deletes a specific user |

## Hard Deletes vs Soft Deletes
In enterprise systems, **Delete** is rarely an actual database \`DELETE\` command (known as a "hard delete"). 
Instead, systems use **"Soft Deletes"**.
- A column named \`is_deleted\` (boolean) or \`deleted_at\` (timestamp) is added to the table.
- When a user "deletes" a record, the system issues an \`UPDATE\` statement: \`UPDATE users SET is_deleted = TRUE WHERE id = 1;\`.
- All \`Read\` queries must then be modified to include \`WHERE is_deleted = FALSE\`.

This ensures that critical historical data and analytical integrity are never lost.
		`
	},
	Indexes: {
		definition:
			'A data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space.',
		useCase: 'Adding an index to the username column to make user logins blazingly fast.',
		detailedMarkdown: `
# Database Indexes

An **Index** is a distinct data structure (usually a **B-Tree** or a Hash Table) created by the database engine to speed up the retrieval of rows from a table. 

Think of a database index exactly like the index at the back of a textbook. Without the index, if you want to find information about "Polymorphism", you have to read every single page of the book from start to finish (a full table scan). With an index, you look up the word, find the exact page number, and jump straight to it.

## How it works (B-Trees)
Relational databases (like PostgreSQL, MySQL) typically use **B-Trees** (Balanced Trees) for indexing.
- When you index a column (e.g., \`email\`), the database creates a B-Tree where the nodes are sorted alphabetically by email.
- Each node contains a pointer to the actual physical row on the disk.
- Finding a record in a B-Tree takes **O(log N)** time, which is exponentially faster than scanning an unsorted table taking **O(N)** time.

## Creating an Index
\`\`\`sql
-- Creating a simple index
CREATE INDEX idx_users_email ON users(email);

-- Creating a composite index (multiple columns)
CREATE INDEX idx_users_last_first ON users(last_name, first_name);
\`\`\`

## The Trade-offs of Indexing

While indexes dramatically speed up **READ** operations (\`SELECT\`), they come with significant costs:

1. **Slower Writes:** Every time you \`INSERT\`, \`UPDATE\`, or \`DELETE\` a row, the database must not only update the table but also update and rebalance the B-Tree index. 
2. **Storage Space:** Indexes are separate data structures that consume actual disk space and RAM.

> **Golden Rule:** Do not index every column. Only index columns that are frequently used in \`WHERE\`, \`JOIN\`, \`ORDER BY\`, and \`GROUP BY\` clauses.

## Types of Indexes
- **Primary Index:** Automatically created on the Primary Key column.
- **Unique Index:** Enforces that no two rows have the same value (e.g., email addresses).
- **Composite Index:** An index on multiple columns. The order of columns matters! (e.g., Indexing \`A, B\` helps queries filtering by \`A\` or \`A and B\`, but NOT queries filtering only by \`B\`).
- **Covering Index:** An index that contains all the columns needed for a query, allowing the database to return the result straight from the index without even reading the actual table row from disk.
		`
	}
};
// Note: More definitions would continue here.
