import type { RoadmapDetailMap } from './roadmap-content/types';
import { DsaFoundationsContent } from './roadmap-content/dsa-foundations';
import { DsaCorePatternsContent } from './roadmap-content/dsa-core-patterns';
import { DsaLinkedListTreeContent } from './roadmap-content/dsa-linked-list-tree';
import { DsaGraphBacktrackingContent } from './roadmap-content/dsa-graph-backtracking';
import { DsaDpGreedyMiscContent } from './roadmap-content/dsa-dp-greedy-misc';
import { DsaAdvancedContent } from './roadmap-content/dsa-advanced';
import { CsOsContent } from './roadmap-content/cs-os';
import { CsNetworksContent } from './roadmap-content/cs-networks';
import { CsArchitectureContent } from './roadmap-content/cs-architecture';
import { DatabasesSqlContent } from './roadmap-content/databases-sql';
import { DatabasesNosqlDesignContent } from './roadmap-content/databases-nosql-design';
import { OopContent } from './roadmap-content/oop';
import { DesignPatternsCreationalContent } from './roadmap-content/design-patterns-creational';
import { DesignPatternsStructuralContent } from './roadmap-content/design-patterns-structural';
import { DesignPatternsBehavioralContent } from './roadmap-content/design-patterns-behavioral';
import { LldContent } from './roadmap-content/lld';
import { HldFundamentalsComponentsContent } from './roadmap-content/hld-fundamentals-components';
import { HldDataArchitectureContent } from './roadmap-content/hld-data-architecture';
import { HldPracticeDesignsContent } from './roadmap-content/hld-practice-designs';
import { ConcurrencyContent } from './roadmap-content/concurrency';
import { LanguageMasteryContent } from './roadmap-content/language-mastery';
import { BackendCoreContent } from './roadmap-content/backend-core';
import { BackendApiDesignContent } from './roadmap-content/backend-api-design';
import { GitContent } from './roadmap-content/git';
import { TestingContent } from './roadmap-content/testing';
import { CloudContent } from './roadmap-content/cloud';
import { DevopsContent } from './roadmap-content/devops';
import { SecurityContent } from './roadmap-content/security';
import { LinuxContent } from './roadmap-content/linux';
import { WebFundamentalsContent } from './roadmap-content/web-fundamentals';
import { ProjectPreparationContent } from './roadmap-content/project-preparation';
import { BehavioralContent } from './roadmap-content/behavioral';
import { DebuggingPerformanceContent } from './roadmap-content/debugging-performance';
import { ResumeMocksContent } from './roadmap-content/resume-mocks';

/** The original hand-written entries. Everything else lives in ./roadmap-content
 *  as one file per roadmap section, so many topics can be authored in parallel
 *  without touching the same file. */
const BASE_DETAILS: RoadmapDetailMap = {
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

## Clustered vs. Non-Clustered Index (the classic follow-up)
This is almost always the next question after "what is an index?" — the distinction is about **where the actual row data lives**, not just how it's looked up.

- **Clustered Index:** The table's rows are **physically stored on disk in the order of this index**. There can only be **one** clustered index per table, because a table's rows can only be physically sorted one way. In most engines (e.g., MySQL InnoDB), the Primary Key *is* the clustered index by default — the leaf nodes of its B-Tree contain the actual row data, not just a pointer to it.
- **Non-Clustered Index:** A **separate** structure from the table, sorted by the indexed column(s), where each leaf node stores a pointer (or the primary key value) back to the actual row rather than the row itself. A table can have **many** non-clustered indexes. Looking up via a non-clustered index that isn't "covering" means an extra hop: find the pointer in the index, then go fetch the actual row — this second hop is called a "bookmark lookup" or "key lookup," and it's exactly what a **covering index** avoids.

| | Clustered | Non-Clustered |
|---|---|---|
| **Rows physically stored in this order?** | Yes | No — a separate structure |
| **Count per table** | Exactly 1 | Many |
| **Lookup cost** | Direct — the leaf IS the row | Index leaf → pointer → row (unless covering) |

## B-Tree vs. Hash Index
Not every index is a B-Tree — some engines also offer **Hash indexes**, and knowing when each wins is a common depth-check.

| | B-Tree | Hash Index |
|---|---|---|
| **Equality lookups (\`WHERE x = 5\`)** | O(log N) | O(1) — faster |
| **Range queries (\`WHERE x > 5\`, \`ORDER BY x\`)** | Supported — the tree is sorted | **Not supported** — a hash has no concept of ordering |
| **Typical use** | Default choice for almost everything | Niche: pure equality lookups where range queries are never needed (e.g., some in-memory engines) |

Because most real-world queries eventually need range scans, sorting, or partial-match lookups, **B-Trees are the default** in virtually every relational database — Hash indexes are a narrow optimization, not a general-purpose replacement.
		`
	},
	'SOLID Principles': {
		definition:
			'A set of five design principles intended to make object-oriented designs more understandable, flexible, and maintainable.',
		useCase:
			'Refactoring a monolithic god-class into smaller, single-purpose classes to improve testability and reduce merge conflicts.',
		detailedMarkdown: `
# SOLID Principles

**SOLID** is an acronym for five design principles intended to make software designs more understandable, flexible, and maintainable. They were introduced by Robert C. Martin (Uncle Bob).

## 1. Single Responsibility Principle (SRP)
*A class should have one, and only one, reason to change.*
- **Meaning:** A class should only have one job or responsibility.
- **Example:** A \`User\` class should handle user properties (name, email), but should NOT handle saving the user to the database. That should be done by a \`UserRepository\`.

\`\`\`typescript
// Violation: User is responsible for both its own data AND persistence AND email formatting.
class User {
    constructor(public name: string, public email: string) {}
    save(): void { /* talks to the database */ }
    sendWelcomeEmail(): void { /* formats and sends an email */ }
}

// Fixed: each class has exactly one reason to change.
class User {
    constructor(public name: string, public email: string) {}
}
class UserRepository {
    save(user: User): void { /* talks to the database */ }
}
class WelcomeEmailer {
    send(user: User): void { /* formats and sends an email */ }
}
\`\`\`

## 2. Open/Closed Principle (OCP)
*Software entities should be open for extension, but closed for modification.*
- **Meaning:** You should be able to add new functionality without changing existing code.
- **Example:** Instead of having an \`if/else\` block checking the user's role to calculate a discount, you use an interface \`DiscountStrategy\` and create new classes for each role that implement it.

\`\`\`typescript
// Violation: adding a new customer type means editing this function again.
function getDiscount(customerType: string, total: number): number {
    if (customerType === 'regular') return total * 0.95;
    if (customerType === 'vip') return total * 0.8;
    // every new tier requires modifying this function
    return total;
}

// Fixed: new discount types are added by writing a new class, not editing existing ones.
interface DiscountStrategy {
    apply(total: number): number;
}
class RegularDiscount implements DiscountStrategy {
    apply(total: number): number { return total * 0.95; }
}
class VipDiscount implements DiscountStrategy {
    apply(total: number): number { return total * 0.8; }
}
\`\`\`

## 3. Liskov Substitution Principle (LSP)
*Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.*
- **Meaning:** If Class B is a child of Class A, you should be able to use Class B anywhere Class A is expected, without things breaking.
- **Classic Violation:** A \`Square\` inheriting from a \`Rectangle\`. If a program expects a \`Rectangle\` and sets the width to 5 and height to 10, a \`Square\` would break this expectation because its width and height must always be equal.

\`\`\`typescript
class Rectangle {
    constructor(protected width: number, protected height: number) {}
    setWidth(w: number) { this.width = w; }
    setHeight(h: number) { this.height = h; }
    area(): number { return this.width * this.height; }
}

// Violation: Square silently changes both dimensions, breaking caller assumptions.
class Square extends Rectangle {
    setWidth(w: number) { this.width = w; this.height = w; }
    setHeight(h: number) { this.width = h; this.height = h; }
}

function test(rect: Rectangle) {
    rect.setWidth(5);
    rect.setHeight(10);
    console.log(rect.area()); // expected 50 — a Square silently returns 100 instead
}
\`\`\`

## 4. Interface Segregation Principle (ISP)
*Many client-specific interfaces are better than one general-purpose interface.*
- **Meaning:** Don't force a class to implement methods it doesn't need.
- **Example:** Instead of a massive \`Worker\` interface with \`code()\`, \`test()\`, and \`manage()\`, split it into \`Coder\`, \`Tester\`, and \`Manager\` interfaces.

\`\`\`typescript
// Violation: an Intern has to implement manage(), which makes no sense for it.
interface Worker {
    code(): void;
    test(): void;
    manage(): void;
}

// Fixed: implement only the interfaces that are actually relevant.
interface Coder { code(): void; }
interface Tester { test(): void; }
interface Manager { manage(): void; }

class Intern implements Coder, Tester {
    code(): void { /* ... */ }
    test(): void { /* ... */ }
}
\`\`\`

## 5. Dependency Inversion Principle (DIP)
*Depend upon abstractions, not concretions.*
- **Meaning:** High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).
- **Example:** A \`PaymentProcessor\` should not instantiate a \`StripeAPI\` directly. Instead, it should accept an \`PaymentGateway\` interface in its constructor.

\`\`\`typescript
// Violation: PaymentProcessor is hard-wired to Stripe — swapping providers means editing this class.
class PaymentProcessor {
    private gateway = new StripeAPI();
    charge(amount: number) { this.gateway.charge(amount); }
}

// Fixed: PaymentProcessor depends on an abstraction, injected from outside.
interface PaymentGateway {
    charge(amount: number): void;
}
class PaymentProcessor {
    constructor(private gateway: PaymentGateway) {}
    charge(amount: number) { this.gateway.charge(amount); }
}
// Swapping Stripe for PayPal now requires zero changes to PaymentProcessor.
const processor = new PaymentProcessor(new StripeAPI());
\`\`\`

## When SOLID Is Over-Applied
SOLID is a set of heuristics, not laws — interviewers increasingly ask about the *downside* of applying them too aggressively:
- **DIP/ISP taken too far:** wrapping every single class in its own interface "just in case," even when there's only ever one implementation, adds a layer of indirection with no real payoff — more files to open, more jumps to trace a call, for a flexibility that's never used.
- **SRP taken too far:** splitting a class into so many tiny single-method classes that the actual business logic gets scattered across a dozen files, making the overall flow harder to follow than a single, moderately-sized class would have been.
- **The rule of thumb:** apply SOLID where change is actually likely (multiple payment providers, multiple discount rules) — not preemptively everywhere. A senior-level answer to "is this code SOLID?" often includes "...and here's where I'd stop applying it."
		`
	},
	Encapsulation: {
		definition:
			"The bundling of data and the methods that operate on that data into a single unit, restricting direct access to some of the object's components.",
		useCase:
			'Hiding the internal state of a BankAccount object so the balance cannot be modified directly without going through a deposit() or withdraw() method.',
		detailedMarkdown: `
# Encapsulation

**Encapsulation** is one of the four fundamental OOP concepts (along with Inheritance, Polymorphism, and Abstraction). It refers to the bundling of data (attributes) and the methods that operate on that data into a single unit (a class).

More importantly, encapsulation is used to **hide the internal state** of an object from the outside world and restrict direct access to it.

## Why is it important?
1. **Data Hiding:** By making variables private, you prevent outside classes from altering the state in unexpected ways.
2. **Validation:** You can force all state changes to go through a public method (a setter) where you can add validation logic.
3. **Flexibility:** You can change the internal implementation of the class without affecting the code that uses it.

## Code Example (Java)

Here is a classic example of a Bank Account that uses encapsulation to prevent the balance from becoming negative.

\`\`\`java
public class BankAccount {
    // Private data: Cannot be accessed directly from outside
    private double balance;
    private String accountNumber;

    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    // Public getter: Read-only access
    public double getBalance() {
        return this.balance;
    }

    // Public method with validation
    public void deposit(double amount) {
        if (amount > 0) {
            this.balance += amount;
        }
    }

    // Public method with validation and business logic
    public boolean withdraw(double amount) {
        if (amount > 0 && this.balance >= amount) {
            this.balance -= amount;
            return true;
        }
        return false;
    }
}
\`\`\`

If \`balance\` was \`public\`, any part of the program could do \`account.balance = -99999;\`, which would break the business logic of the banking application.

## Encapsulation vs. Abstraction (the near-universal follow-up)
These two are constantly confused because both "hide" something — but they hide different things, at different levels:
- **Abstraction** hides **complexity** by exposing only the essential *behavior*, at the design level. It's about *what* a thing does. Example: a \`PaymentGateway\` interface exposes \`charge(amount)\` — the caller doesn't know or care whether it's Stripe, PayPal, or a bank API underneath.
- **Encapsulation** hides **internal state** by controlling access to *data*, at the implementation level. It's about *how* a thing protects itself. Example: \`BankAccount\` makes \`balance\` private and only lets you change it through \`deposit()\`/\`withdraw()\`.

A useful way to hold both at once: **abstraction is a design choice** (decide what to expose through an interface), while **encapsulation is the implementation mechanism** that enforces it (\`private\` fields, getters/setters with validation). You can have one without the other — a class can encapsulate its fields (private + getters) while still exposing an overly detailed, non-abstract interface; and an interface can be a clean abstraction even if the concrete class behind it doesn't encapsulate much internally. In practice, well-designed OOP code uses both together: abstraction decides the public shape, encapsulation locks down everything else.
		`
	},
	Polymorphism: {
		definition:
			'The ability of different objects to respond to the same method call in their own unique way.',
		useCase:
			'Looping over a list of generic "Shape" objects and calling draw() on each, without knowing if they are circles, squares, or triangles.',
		detailedMarkdown: `
# Polymorphism

**Polymorphism** (from Greek, meaning "many forms") is an OOP concept that allows objects of different classes to be treated as objects of a common superclass. 

It allows you to write code that can work with different types of objects, as long as they share a common interface or superclass.

## Types of Polymorphism

### 1. Compile-time (Static) Polymorphism
Achieved through **Method Overloading**. Multiple methods in the same class have the same name but different parameters.

\`\`\`java
class MathHelper {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}
\`\`\`

### 2. Run-time (Dynamic) Polymorphism
Achieved through **Method Overriding**. A subclass provides a specific implementation of a method that is already provided by its parent class.

\`\`\`javascript
// JavaScript Example using Classes
class Animal {
    makeSound() {
        console.log("Some generic sound");
    }
}

class Dog extends Animal {
    makeSound() {
        console.log("Woof!");
    }
}

class Cat extends Animal {
    makeSound() {
        console.log("Meow!");
    }
}

// Polymorphism in action
const animals = [new Dog(), new Cat(), new Animal()];

// The correct makeSound() is called based on the actual object type at runtime
animals.forEach(animal => animal.makeSound());
// Output: Woof! Meow! Some generic sound
\`\`\`

## Why is it useful?
Polymorphism drastically reduces coupling and eliminates the need for massive \`switch\` or \`if/else\` statements checking an object's type before calling a function. It allows systems to be easily extensible.
		`
	},
	Mutex: {
		definition:
			'A synchronization primitive used to prevent multiple threads from concurrently accessing a shared resource.',
		useCase:
			'Ensuring that only one thread can update the "available seats" counter in a ticketing system at any given time.',
		detailedMarkdown: `
# Mutex (Mutual Exclusion)

A **Mutex** (short for Mutual Exclusion) is a synchronization primitive used in concurrent programming to prevent multiple threads from accessing a shared resource simultaneously. 

It acts as a lock. Before a thread can access a critical section of code (where shared variables are modified), it must acquire the mutex. Once it is done, it releases the mutex so other threads can enter.

## The Problem: Race Conditions
Without a mutex, if Thread A and Thread B both read the variable \`tickets = 5\`, decrement it to \`4\`, and save it, the final count will be \`4\`. However, since two tickets were sold, the count *should* be \`3\`. This is a race condition.

## How a Mutex Solves It

1. **Thread A** arrives and locks the mutex.
2. **Thread B** arrives, sees the mutex is locked, and goes to sleep (blocks) waiting for it to unlock.
3. **Thread A** reads \`tickets = 5\`, changes it to \`4\`, saves it, and then unlocks the mutex.
4. **Thread B** wakes up, locks the mutex, reads \`tickets = 4\`, changes it to \`3\`, saves it, and unlocks.

## Code Example (Java)

In Java, the \`synchronized\` keyword acts as an implicit mutex (monitor lock) on the object. You can also use the explicit \`ReentrantLock\` class.

\`\`\`java
import java.util.concurrent.locks.ReentrantLock;

public class TicketCounter {
    private int tickets = 100;
    private final ReentrantLock lock = new ReentrantLock();

    public void buyTicket() {
        // Acquire the mutex lock
        lock.lock();
        try {
            // Critical Section
            if (tickets > 0) {
                tickets--;
                System.out.println("Ticket bought! Remaining: " + tickets);
            }
        } finally {
            // ALWAYS release the lock in a finally block so it unlocks even if an exception occurs
            lock.unlock();
        }
    }
}
\`\`\`

## Mutex vs Semaphore
- A **Mutex** allows exactly **ONE** thread to access a resource. It is an ownership lock (only the thread that locked it can unlock it).
- A **Semaphore** allows **N** threads to access a resource (e.g., limiting database connections to 5 concurrent queries).
		`
	},
	Deadlocks: {
		definition:
			'A situation in concurrent programming where two or more threads are blocked forever, each waiting for the other to release a lock.',
		useCase:
			'Occurs accidentally when Thread A locks Resource 1 and waits for Resource 2, while Thread B locks Resource 2 and waits for Resource 1.',
		detailedMarkdown: `
# Deadlocks

A **Deadlock** is a catastrophic situation in concurrent programming where two or more threads are blocked forever because they are each waiting for the other to release a lock. The program freezes completely and must usually be killed by the operating system.

## The Classic Example
Imagine two people at a dinner table. There is one fork and one knife.
- **Person A** grabs the fork and waits for the knife.
- **Person B** grabs the knife and waits for the fork.

Neither person will let go of what they have until they get the other utensil. They will both sit there forever.

## The Four Coffman Conditions
A deadlock can ONLY occur if all four of these conditions are met simultaneously:
1. **Mutual Exclusion:** At least one resource must be held in a non-sharable mode (only one thread can use it).
2. **Hold and Wait:** A thread holds a resource while waiting to acquire additional resources held by other threads.
3. **No Preemption:** Resources cannot be forcibly taken away from a thread; they must be released voluntarily.
4. **Circular Wait:** A closed chain of threads exists, where each thread is waiting for a resource held by the next thread in the chain.

## How to Prevent Deadlocks

The most common and practical way to prevent deadlocks is to eliminate the **Circular Wait** condition.

**The Golden Rule of Lock Ordering:**
*Always acquire locks in the exact same order across all threads.*

If Thread A always locks Resource 1 then Resource 2, and Thread B *also* locks Resource 1 then Resource 2, a deadlock is mathematically impossible.

## Code Example (Java) - A Deadlock Scenario

\`\`\`java
public class DeadlockExample {
    private final Object lock1 = new Object();
    private final Object lock2 = new Object();

    public void methodA() {
        synchronized (lock1) {
            System.out.println("Thread 1: Holding lock 1...");
            
            // Simulating some work
            try { Thread.sleep(100); } catch (Exception e) {}
            
            System.out.println("Thread 1: Waiting for lock 2...");
            synchronized (lock2) {
                System.out.println("Thread 1: Acquired lock 1 and 2!");
            }
        }
    }

    public void methodB() {
        // BAD! Locking in the opposite order
        synchronized (lock2) {
            System.out.println("Thread 2: Holding lock 2...");
            
            try { Thread.sleep(100); } catch (Exception e) {}
            
            System.out.println("Thread 2: Waiting for lock 1...");
            synchronized (lock1) {
                System.out.println("Thread 2: Acquired lock 2 and 1!");
            }
        }
    }
}
\`\`\`
If \`methodA\` and \`methodB\` are called by two different threads at the same time, the program will freeze permanently.

## Detection and Recovery (when prevention isn't enough)
Lock ordering *prevents* deadlocks, but in a large system with many code paths, you can't always guarantee every thread acquires locks in the same order — so production systems also need ways to deal with a deadlock that has already happened:
- **Detection — Wait-For Graphs:** the OS or database builds a graph where each thread/transaction is a node, and a directed edge means "this thread is waiting on a resource held by that thread." A deadlock exists if, and only if, this graph contains a **cycle**. Databases run this check periodically (or on every lock acquisition) precisely so they can catch cycles before they freeze the whole system.
- **Detection — Timeouts:** a simpler, cruder approach: if a thread has been waiting for a lock longer than some threshold, assume it's deadlocked (even without proving a cycle exists) and abort it. This is what most databases' \`lock_timeout\` settings do — cheaper to check than a full wait-for graph, at the cost of occasionally aborting a transaction that was just slow, not actually deadlocked.
- **Recovery:** once a deadlock is detected, the only way out is to break the cycle — pick a "victim" thread/transaction (often the one that's done the least work, or the one that started most recently) and forcibly abort/roll it back, releasing its locks so the others can proceed. This is exactly what you saw earlier in the *Locks* topic: the database aborts one transaction with an error, and the application must be ready to catch that and retry.

## Deadlock vs. Livelock
Both are ways concurrent execution can fail to make progress, but they look very different if you attach a debugger:
- **Deadlock:** threads are **blocked and idle** — CPU usage drops, nothing is executing, everyone is simply waiting.
- **Livelock:** threads are **actively running** but still never make progress — e.g., two threads that each detect a potential conflict and both "politely" back off and retry at the same time, over and over, forever (like two people in a hallway repeatedly stepping the same direction to let the other pass). CPU usage stays high, but no useful work gets done. Livelock is often introduced by *naive* deadlock-avoidance logic — e.g., "if I can't get both locks, release what I have and retry immediately" without any randomized backoff, which can cause every thread to retry in lockstep forever.
		`
	}
};

export const ROADMAP_DETAILS: RoadmapDetailMap = {
	...BASE_DETAILS,
	...DsaFoundationsContent,
	...DsaCorePatternsContent,
	...DsaLinkedListTreeContent,
	...DsaGraphBacktrackingContent,
	...DsaDpGreedyMiscContent,
	...DsaAdvancedContent,
	...CsOsContent,
	...CsNetworksContent,
	...CsArchitectureContent,
	...DatabasesSqlContent,
	...DatabasesNosqlDesignContent,
	...OopContent,
	...DesignPatternsCreationalContent,
	...DesignPatternsStructuralContent,
	...DesignPatternsBehavioralContent,
	...LldContent,
	...HldFundamentalsComponentsContent,
	...HldDataArchitectureContent,
	...HldPracticeDesignsContent,
	...ConcurrencyContent,
	...LanguageMasteryContent,
	...BackendCoreContent,
	...BackendApiDesignContent,
	...GitContent,
	...TestingContent,
	...CloudContent,
	...DevopsContent,
	...SecurityContent,
	...LinuxContent,
	...WebFundamentalsContent,
	...ProjectPreparationContent,
	...BehavioralContent,
	...DebuggingPerformanceContent,
	...ResumeMocksContent
};
