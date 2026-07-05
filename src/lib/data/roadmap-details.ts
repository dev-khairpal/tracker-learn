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

## 2. Open/Closed Principle (OCP)
*Software entities should be open for extension, but closed for modification.*
- **Meaning:** You should be able to add new functionality without changing existing code.
- **Example:** Instead of having an \`if/else\` block checking the user's role to calculate a discount, you use an interface \`DiscountStrategy\` and create new classes for each role that implement it.

## 3. Liskov Substitution Principle (LSP)
*Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.*
- **Meaning:** If Class B is a child of Class A, you should be able to use Class B anywhere Class A is expected, without things breaking.
- **Classic Violation:** A \`Square\` inheriting from a \`Rectangle\`. If a program expects a \`Rectangle\` and sets the width to 5 and height to 10, a \`Square\` would break this expectation because its width and height must always be equal.

## 4. Interface Segregation Principle (ISP)
*Many client-specific interfaces are better than one general-purpose interface.*
- **Meaning:** Don't force a class to implement methods it doesn't need. 
- **Example:** Instead of a massive \`Worker\` interface with \`code()\`, \`test()\`, and \`manage()\`, split it into \`Coder\`, \`Tester\`, and \`Manager\` interfaces.

## 5. Dependency Inversion Principle (DIP)
*Depend upon abstractions, not concretions.*
- **Meaning:** High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).
- **Example:** A \`PaymentProcessor\` should not instantiate a \`StripeAPI\` directly. Instead, it should accept an \`PaymentGateway\` interface in its constructor.
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
	Singleton: {
		definition:
			'A creational design pattern that ensures a class has only one instance, while providing a global point of access to this instance.',
		useCase:
			'Managing a single shared Database Connection Pool or a configuration manager for an entire application.',
		detailedMarkdown: `
# Singleton Pattern

The **Singleton** is a creational design pattern that solves two problems at once:
1. **Ensures that a class has just a single instance.**
2. **Provides a global access point to that instance.**

## Real-world Analogy
The government is an excellent example of the Singleton pattern. A country can have only one official government. Regardless of the personal identities of the individuals who form governments, the title "The Government of X" is a global point of access that identifies the group of people in charge.

## How to implement it
To create a Singleton, you generally need:
1. A private constructor to prevent direct instantiation with the \`new\` keyword.
2. A private static variable that holds the single instance of the class.
3. A public static method that returns the instance (creating it if it doesn't exist yet).

## Code Example (Java)

Here is a thread-safe implementation of a Singleton in Java using "Double-Checked Locking".

\`\`\`java
public class Database {
    // The volatile keyword ensures visibility of changes to variables across threads
    private static volatile Database instance;

    // Private constructor prevents instantiation from other classes
    private Database() {
        // Initialization code (e.g., connect to database server)
    }

    public static Database getInstance() {
        // First check (no locking) - extremely fast
        if (instance == null) {
            // Locking block - only executed once when the instance is created
            synchronized (Database.class) {
                // Second check (inside lock) - ensures thread safety
                if (instance == null) {
                    instance = new Database();
                }
            }
        }
        return instance;
    }
    
    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }
}
\`\`\`

## The Downside
Singletons are often considered an **anti-pattern** by modern developers because they introduce global state into an application, which makes code tightly coupled and extremely difficult to unit test. In modern applications, Dependency Injection (DI) frameworks are used instead to manage single instances of classes.
		`
	},
	Strategy: {
		definition:
			'A behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.',
		useCase:
			'Implementing different sorting algorithms (QuickSort, MergeSort) or different payment methods (Credit Card, PayPal, Crypto) without modifying the core checkout code.',
		detailedMarkdown: `
# Strategy Pattern

The **Strategy** pattern is a behavioral design pattern that allows you to define a family of algorithms, encapsulate each one as an object, and make them interchangeable at runtime. 

It allows the algorithm to vary independently from the clients that use it.

## The Problem
Imagine you are building an e-commerce application. Initially, you only support Credit Card payments. Later, you add PayPal. Then, you add Apple Pay. If you write all this logic in the \`Checkout\` class using massive \`if/else\` or \`switch\` statements, your \`Checkout\` class becomes a bloated, fragile "God Class" that violates the Open/Closed Principle.

## The Solution
The Strategy pattern suggests that you take a class that does something specific in a lot of different ways and extract all of these algorithms into separate classes called strategies.

## Code Example (TypeScript / JavaScript)

\`\`\`typescript
// 1. Define the Strategy Interface
interface PaymentStrategy {
    pay(amount: number): void;
}

// 2. Implement Concrete Strategies
class CreditCardPayment implements PaymentStrategy {
    pay(amount: number): void {
        console.log(\`Paid \${amount} using Credit Card.\`);
    }
}

class PayPalPayment implements PaymentStrategy {
    pay(amount: number): void {
        console.log(\`Paid \${amount} using PayPal.\`);
    }
}

// 3. The Context Class
class ShoppingCart {
    private paymentStrategy: PaymentStrategy;

    // The strategy is injected into the context
    constructor(strategy: PaymentStrategy) {
        this.paymentStrategy = strategy;
    }

    // You can also change the strategy at runtime
    setPaymentStrategy(strategy: PaymentStrategy) {
        this.paymentStrategy = strategy;
    }

    checkout(amount: number) {
        // The context delegates the work to the strategy object
        this.paymentStrategy.pay(amount);
    }
}

// --- Usage ---
const cart = new ShoppingCart(new CreditCardPayment());
cart.checkout(100); // Outputs: Paid 100 using Credit Card.

// Switch strategy at runtime!
cart.setPaymentStrategy(new PayPalPayment());
cart.checkout(50);  // Outputs: Paid 50 using PayPal.
\`\`\`

## When to use it?
- When you have a lot of similar classes that only differ in the way they execute some behavior.
- To isolate the business logic of a class from the implementation details of algorithms.
- To replace massive conditionals (\`if/else\`) with polymorphic method calls.
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
		`
	}
};
