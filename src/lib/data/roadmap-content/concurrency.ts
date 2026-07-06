import type { RoadmapDetailMap } from './types';

export const ConcurrencyContent: RoadmapDetailMap = {
	Threads: {
		definition:
			"A thread is the smallest unit of execution the OS scheduler manages — a single sequential flow of instructions that shares its process's memory with other threads in that process.",
		useCase:
			'A web server spins up a new thread (or pulls one from a pool) to handle each incoming client request while the main thread keeps listening for new connections.',
		detailedMarkdown: `
# Threads

A **thread** is a single sequential path of execution through code. Every process starts with one thread (the "main" thread), but a process can spawn additional threads that all run **concurrently within the same process**, sharing its memory, open files, and other resources.

## Threads vs Processes
This is the first thing interviewers check you actually understand:

| | Process | Thread |
|---|---|---|
| Memory | Own isolated address space | Shares address space with sibling threads |
| Creation cost | Expensive (OS allocates a new address space) | Cheap (just a new stack + registers) |
| Communication | Needs IPC (pipes, sockets, shared memory) | Direct — just read/write shared variables |
| Crash isolation | One process crashing doesn't kill others | One thread crashing can take down the whole process |
| Context switch cost | Higher (swaps address space / flushes TLB) | Lower (same address space stays mapped) |

Because threads share memory, communication between them is fast and simple — but that same sharing is exactly why **race conditions** become possible, and why synchronization primitives like mutexes and semaphores exist at all.

## What a Thread Actually Owns
Even though threads share the process's heap and global data, each thread still has its own:
- **Program counter** — which instruction it's currently executing.
- **Call stack** — its own local variables and function call history.
- **Register state** — saved/restored on every context switch.

Everything else — heap-allocated objects, static/global variables, open file handles — is shared across all threads in the process.

## Thread Lifecycle
A thread moves through a well-defined set of states as the OS scheduler manages it:

\`\`\`text
   NEW  --start()-->  RUNNABLE  <--scheduler-->  RUNNING
                          ^                          |
                          |                          v
                    (lock released,           BLOCKED / WAITING
                     I/O complete, etc.)     (waiting on lock, I/O,
                          ^                    sleep, or join())
                          |__________________________|
                                       |
                                       v
                                  TERMINATED
\`\`\`

- **New** — the thread object exists but \`start()\` hasn't been called yet; no OS thread exists.
- **Runnable** — eligible to run; waiting for the scheduler to give it CPU time.
- **Running** — actually executing on a CPU core right now.
- **Blocked / Waiting** — paused because it's waiting on a lock, a condition, I/O, or a \`sleep()\`/\`join()\` call.
- **Terminated** — finished running (either returned normally or threw an uncaught exception).

## Creating Threads (Java)
\`\`\`java
// Option 1: extend Thread
class Worker extends Thread {
    public void run() {
        System.out.println("Running on: " + Thread.currentThread().getName());
    }
}
new Worker().start();

// Option 2 (preferred): implement Runnable and pass it in
Runnable task = () -> System.out.println("Doing work concurrently");
Thread t = new Thread(task);
t.start();       // schedules the thread — do NOT call run() directly
t.join();         // blocks the caller until t finishes
\`\`\`
Calling \`run()\` directly just executes the code on the *current* thread — \`start()\` is what actually asks the OS to schedule a new thread. Preferring \`Runnable\` over extending \`Thread\` is idiomatic because a class can implement multiple interfaces but only extend one class, and it decouples "the work" from "the mechanism that runs it" — which is exactly what lets that same \`Runnable\` be handed to a **thread pool** instead.

## Practical Takeaway
Threads give you concurrency almost for free in terms of memory (no duplicated address space) and communication (shared variables), but that convenience is the source of every synchronization problem in this section. The moment two threads can touch the same mutable state, you need one of the tools covered elsewhere in this topic — a mutex, a semaphore, an atomic operation, or a higher-level pattern like producer-consumer — to keep the outcome deterministic.
	`
	},

	Semaphore: {
		definition:
			'A semaphore is a counter-based synchronization primitive with two atomic operations, acquire() and release(), that lets up to N threads proceed concurrently before any further thread must wait.',
		useCase:
			'Capping the number of concurrent connections a service opens to a database at 5, even if 200 request-handling threads are running at once.',
		detailedMarkdown: `
# Semaphore

A **semaphore** is a counter initialized to some value \`N\`, guarded by two atomic operations:
- \`acquire()\` (a.k.a. \`P()\` or \`wait()\`) — decrements the counter. If the counter would go below zero, the calling thread blocks until someone else releases a permit.
- \`release()\` (a.k.a. \`V()\` or \`signal()\`) — increments the counter and wakes one waiting thread, if any.

Think of it as a **pool of N permits**: whoever holds a permit may proceed, and there are never more than N permits in circulation.

## Classic Example: Limiting DB Connections
Suppose your application has hundreds of threads handling requests, but the database can only comfortably handle 5 concurrent connections.

\`\`\`java
import java.util.concurrent.Semaphore;

public class ConnectionPool {
    private final Semaphore permits = new Semaphore(5); // only 5 at a time

    public void query(String sql) throws InterruptedException {
        permits.acquire();          // blocks here if 5 are already in use
        try {
            // ... run the query using one of the 5 real connections ...
        } finally {
            permits.release();      // free the permit for the next waiting thread
        }
    }
}
\`\`\`
Even if 200 threads call \`query()\` simultaneously, only 5 will ever be inside the critical section at once — the other 195 block on \`acquire()\` until a permit frees up.

## Semaphore vs Mutex
This is the single most common concurrency interview question, and the answer hinges on **ownership** and **count**:

| | Mutex | Semaphore |
|---|---|---|
| Max holders | Exactly 1 | Up to N (set at creation) |
| Ownership | Yes — only the locking thread may unlock it | No — any thread can call \`release()\`, even one that never called \`acquire()\` |
| Purpose | Protect a critical section from concurrent access | Limit/signal concurrency across a pool of resources |
| Misuse detection | Often built-in (error on wrong-thread unlock) | None — a stray \`release()\` is a silent bug |

A **binary semaphore** (N = 1) looks similar to a mutex on the surface, but still lacks ownership — that missing check is exactly why a mutex, not a binary semaphore, is the right tool when the only thing you need is "one thread at a time in this block of code."

## Binary vs Counting Semaphore
- **Binary semaphore** — counter capped at 1; used for simple signaling ("has this task finished yet?").
- **Counting semaphore** — counter can be any N; used for bounding access to a *pool* of identical resources (connections, worker slots, license seats).

## Semaphores Power Producer-Consumer
The classic **producer-consumer** pattern is usually implemented with a pair of counting semaphores:
- \`emptySlots\` (starts at buffer capacity) — producers \`acquire()\` before inserting, consumers \`release()\` after removing.
- \`fullSlots\` (starts at 0) — consumers \`acquire()\` before removing, producers \`release()\` after inserting.

This is worth remembering because it shows semaphores doing double duty: counting *and* signaling at the same time, which a mutex alone cannot do.

## Practical Takeaway
Reach for a **mutex** when the question is "can more than one thread be in here at once?" (answer: never). Reach for a **semaphore** when the question is "how many threads can be in here at once?" (answer: some N greater than one), or when you need one thread to signal another about resource availability rather than simply excluding it.
	`
	},

	'Atomic Operations': {
		definition:
			'An atomic operation executes as a single, indivisible step from the perspective of every other thread — no thread can ever observe it half-completed.',
		useCase:
			'Incrementing a shared "requests served" counter across thousands of concurrent request threads without paying the overhead of acquiring a full lock for every increment.',
		detailedMarkdown: `
# Atomic Operations

An operation is **atomic** if it appears to happen instantaneously to every other thread — it either hasn't started, or it has fully completed. There is no "in-between" state that another thread could ever observe. This is a stronger, more specific guarantee than "protected by a lock" — atomics achieve it using dedicated CPU instructions rather than blocking.

## Why Plain Increments Aren't Atomic
\`count++\` looks like one step, but it typically compiles to three:
\`\`\`text
LOAD  count into register
ADD   1 to register
STORE register back into count
\`\`\`
If two threads interleave those three steps, one increment can be lost entirely — this is the textbook **race condition** covered in the next topic. Wrapping \`count++\` in a lock fixes it, but locking has overhead: a thread that fails to acquire the lock is descheduled and later woken up, which costs far more than the increment itself.

## The Hardware Trick: Compare-And-Swap (CAS)
Modern CPUs provide a single, hardware-guaranteed atomic instruction — commonly **Compare-And-Swap (CAS)** — that says: *"If the value at this memory address still equals the expected value, replace it with the new value, all in one uninterruptible step; tell me if it worked."*

\`\`\`text
CAS(address, expectedValue, newValue):
    if *address == expectedValue:
        *address = newValue
        return true
    else:
        return false   // someone else changed it first — retry
\`\`\`
Libraries build lock-free counters and data structures on top of CAS by looping: read the current value, compute the new value, CAS it in, and retry if another thread beat you to it.

## Java Example: AtomicInteger
\`\`\`java
import java.util.concurrent.atomic.AtomicInteger;

public class RequestCounter {
    private final AtomicInteger count = new AtomicInteger(0);

    public void recordRequest() {
        count.incrementAndGet();   // atomic — no lock needed
    }

    public int getCount() {
        return count.get();
    }
}
\`\`\`
Under the hood, \`incrementAndGet()\` runs a CAS loop: read the current value, add one, try to CAS it in, and retry if another thread updated the value first. No thread ever blocks — this is called a **lock-free** algorithm.

## Atomics vs Locks
| | Lock (e.g. Mutex) | Atomic (CAS-based) |
|---|---|---|
| Blocking | Yes — losing thread is descheduled | No — losing thread just retries the CAS |
| Overhead | Higher (OS involvement possible) | Lower for simple operations |
| Scope | Can protect an arbitrary block of code | Limited to a single variable/operation |
| Failure mode | Can deadlock | Cannot deadlock (but can theoretically starve under extreme contention) |

The trade-off: atomics are cheap and simple for **single-variable** updates (counters, flags, references), but they don't generalize to protecting multi-step operations across several variables — that's still a job for a mutex.

## Practical Takeaway
Default to a lock when you're protecting a **critical section** spanning multiple statements or multiple variables that must change together. Reach for an atomic when the entire operation is a single, simple update to one variable (a counter, a flag, a reference swap) — you get correctness without ever paying the cost of blocking a thread.
	`
	},

	'Race Conditions': {
		definition:
			'A race condition is a bug where the correctness of a program depends on the unpredictable timing or interleaving of multiple threads accessing shared state.',
		useCase:
			'Two threads both reading a shared "seats available" counter, both deciding a seat is free, and both booking it — resulting in one seat sold twice.',
		detailedMarkdown: `
# Race Conditions

A **race condition** occurs whenever two or more threads access shared, mutable state, and the final outcome depends on the exact order (the "race") in which their instructions happen to interleave. The defining, maddening property of race conditions is that they're **nondeterministic** — the same code can run correctly a thousand times in a row in testing and then fail in production under real load, because the bug only manifests under specific timing.

## A Concrete Example: The Lost Update
\`\`\`java
class TicketCounter {
    private int availableSeats = 1;

    public boolean bookSeat() {
        if (availableSeats > 0) {   // (1) check
            availableSeats--;       // (2) act
            return true;
        }
        return false;
    }
}
\`\`\`
This looks fine single-threaded. But with two threads calling \`bookSeat()\` at nearly the same time on the last seat:

\`\`\`text
Thread A: reads availableSeats -> 1, condition true
Thread B: reads availableSeats -> 1, condition true      // race window!
Thread A: decrements -> 0, returns true (booked)
Thread B: decrements -> -1, returns true (also booked!)
\`\`\`
Both threads believed they successfully booked the last seat. This exact shape — **check-then-act** on shared state without synchronization — is one of the most common real-world race condition patterns (it also underlies double-spending bugs, double-shipping bugs, and duplicate-charge bugs).

## The Fix: Make Check-and-Act Atomic
The problem is that "check" and "act" are two separate steps with a gap between them where another thread can sneak in. The fix is to make the whole sequence a single **critical section**, protected by a lock:

\`\`\`java
class TicketCounter {
    private int availableSeats = 1;
    private final Object lock = new Object();

    public boolean bookSeat() {
        synchronized (lock) {
            if (availableSeats > 0) {
                availableSeats--;
                return true;
            }
            return false;
        }
    }
}
\`\`\`
Now the "check" and "act" happen as one indivisible unit from every other thread's point of view — the second thread can't even begin its check until the first thread has finished decrementing.

## When a Simple Atomic Is Enough
If the shared state were *just* a counter with no branching logic, an \`AtomicInteger\`'s \`decrementAndGet()\` (or a \`compareAndSet\` loop) would fix it without a lock at all — see "Atomic Operations." Locks are the general-purpose fix; atomics are the lightweight fix when the critical section really is just one simple operation.

## Why Race Conditions Are Hard to Catch
- They often don't manifest at low load or on a single-core machine where true parallelism is rare.
- Standard unit tests run sequentially and won't expose timing-dependent bugs.
- The bug is in the *absence* of something (a lock) rather than in visibly wrong logic, so code review can miss it.

Tools like Java's **thread sanitizers** or stress-testing frameworks that deliberately interleave threads (e.g. running the same operation from hundreds of threads simultaneously in a loop) are the practical way to surface race conditions before they hit production.

## Practical Takeaway
The universal rule: **any time two or more threads can read and write the same mutable state, and the correct outcome depends on doing a multi-step "read, decide, write" sequence without interruption, you have a race condition unless you add synchronization.** The fix is always some form of making that sequence atomic — via a lock, an atomic variable, or a higher-level construct built on top of them.
	`
	},

	'Producer Consumer': {
		definition:
			'The producer-consumer pattern coordinates one or more producer threads that generate data into a shared bounded buffer with one or more consumer threads that remove and process it, blocking producers when the buffer is full and consumers when it is empty.',
		useCase:
			'A logging system where many application threads produce log entries into a queue while a single background thread consumes entries and writes them to disk, decoupling fast producers from slower I/O.',
		detailedMarkdown: `
# Producer-Consumer

The **producer-consumer** problem is one of the oldest and most practically useful patterns in concurrent programming: **producer** threads generate items and place them into a shared buffer, while **consumer** threads remove and process those items. The buffer decouples the two sides so producers don't need to wait for a consumer to be ready, and vice versa — up to the buffer's capacity.

## Why You Can't Just Use a Plain List
Two problems appear the moment you try this without synchronization:
1. **Corruption:** if two threads both write to a plain \`ArrayList\` at the same time, you can corrupt its internal structure — this is a plain **race condition**.
2. **Empty/full handling:** even with a lock protecting the list, what should a consumer do when the buffer is empty? Busy-loop checking (**spin-waiting**) wastes CPU. What should a producer do when the buffer is full? The same problem in reverse.

The producer-consumer pattern needs threads to **block and wait efficiently** — not spin — until the buffer state changes, and that's exactly what condition variables or a properly designed data structure give you.

## The Easy Way: BlockingQueue
Java's \`BlockingQueue\` implements all of this internally, so most real code never hand-rolls the classic semaphore-based solution:

\`\`\`java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class LogPipeline {
    private final BlockingQueue<String> queue = new ArrayBlockingQueue<>(100);

    // Producer
    public void log(String message) throws InterruptedException {
        queue.put(message);   // blocks if the queue is full (100 items)
    }

    // Consumer
    public void processLogs() throws InterruptedException {
        while (true) {
            String message = queue.take();  // blocks if the queue is empty
            writeToDisk(message);
        }
    }

    private void writeToDisk(String message) { /* ... */ }
}
\`\`\`
\`put()\` automatically blocks the producer thread when the queue is full, and \`take()\` automatically blocks the consumer thread when the queue is empty — no manual locking required, and no busy-waiting.

## What's Happening Under the Hood
A hand-rolled implementation is the classic way this is asked in interviews, and it's usually built from two counting **semaphores** plus a **mutex**:
- \`emptySlots\` — initialized to the buffer's capacity; a producer must \`acquire()\` a slot before inserting.
- \`fullSlots\` — initialized to 0; a consumer must \`acquire()\` an item before removing.
- A mutex — protects the shared buffer/index itself from concurrent corruption during the actual insert/remove.

\`\`\`text
Producer:                          Consumer:
  emptySlots.acquire()               fullSlots.acquire()
  mutex.lock()                       mutex.lock()
    buffer.add(item)                   item = buffer.remove()
  mutex.unlock()                     mutex.unlock()
  fullSlots.release()                 emptySlots.release()
\`\`\`
This combination — semaphores for *counting availability*, a mutex for *protecting the structure itself* — is one of the most reusable patterns in concurrent systems programming, and it reappears inside thread pools, message queues, and I/O buffers.

## Multiple Producers and Consumers
The pattern generalizes cleanly: any number of producer threads and any number of consumer threads can share the same bounded buffer, as long as the buffer's own internal operations (insert/remove) are themselves protected from concurrent corruption. This is exactly the model behind real message queues (Kafka, RabbitMQ) and Java's \`ExecutorService\` task queue.

## Practical Takeaway
Producer-consumer is the go-to pattern whenever you need to **decouple the rate of work generation from the rate of work processing** — bursty producers don't stall waiting on slow consumers (up to the buffer's capacity), and consumers never do wasted work checking an empty buffer. In real code, always prefer a library-provided \`BlockingQueue\` (or equivalent) over hand-rolling semaphores — but understanding the semaphore-based mechanics underneath is exactly what interviewers are testing for.
	`
	},

	'Reader Writer': {
		definition:
			'A reader-writer lock allows any number of reader threads to hold the lock concurrently for read-only access, but requires a writer thread to hold it exclusively, blocking all readers and other writers.',
		useCase:
			'A configuration object that hundreds of request-handling threads read constantly, but that an admin thread updates only rarely — readers should never have to wait on each other, only on the occasional writer.',
		detailedMarkdown: `
# Reader-Writer Lock

A plain **mutex** treats every access the same: only one thread in, everyone else waits — even if all ten waiting threads only want to *read* data that isn't changing. For read-heavy workloads, that's wasteful. A **reader-writer lock** fixes this by distinguishing two kinds of access:
- **Readers** — any number of reader threads may hold the lock simultaneously, as long as no writer holds it.
- **Writers** — a writer thread requires **exclusive** access; while it holds the lock, no readers and no other writers may proceed.

## Why a Plain Mutex Falls Short Here
Imagine a cache read 10,000 times per second and updated once per minute. With a plain mutex, every single read serializes behind every other read, even though reads never conflict with each other — only a write conflicts with anything. That's a huge amount of unnecessary contention for a resource that's almost always just being read.

## Java Example: ReadWriteLock
\`\`\`java
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.ReadWriteLock;

public class ConfigCache {
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private String config = "default";

    public String getConfig() {
        lock.readLock().lock();
        try {
            return config;              // many threads can be here at once
        } finally {
            lock.readLock().unlock();
        }
    }

    public void updateConfig(String newConfig) {
        lock.writeLock().lock();
        try {
            config = newConfig;         // exclusive — no readers or writers allowed in
        } finally {
            lock.writeLock().unlock();
        }
    }
}
\`\`\`
Many threads can call \`getConfig()\` concurrently with zero contention between them. The moment a thread calls \`updateConfig()\`, it waits for all current readers to finish, then blocks every new reader and writer until it's done.

## Mutex vs Reader-Writer Lock
| | Mutex | Reader-Writer Lock |
|---|---|---|
| Concurrent readers | No — 1 thread total | Yes — unlimited concurrent readers |
| Writer access | Exclusive | Exclusive |
| Best for | Roughly equal read/write mix, or simple critical sections | Read-heavy workloads (many reads, few writes) |
| Overhead | Lower (simpler bookkeeping) | Slightly higher (must track reader count + writer state) |

If reads and writes happen with similar frequency, a reader-writer lock's extra bookkeeping overhead can actually make it *slower* than a plain mutex — the benefit only shows up when reads dominate.

## The Writer Starvation Problem
A naive reader-writer lock implementation can let a continuous stream of incoming readers perpetually delay a waiting writer — as long as *some* reader holds the lock, the writer can never get exclusive access, so a writer could wait indefinitely under sustained read load. This is called **writer starvation**.

Production implementations (including Java's \`ReentrantReadWriteLock\`) offer a **fairness** option: once a writer is waiting, newly arriving readers queue up behind it instead of jumping ahead, guaranteeing the writer eventually gets its turn at some cost to raw read throughput.

## Practical Takeaway
Reach for a reader-writer lock specifically when a resource is **read far more often than it's written**, and reads genuinely don't conflict with each other (no read secretly mutates state). If writes are frequent, or reads are rare, the added bookkeeping isn't worth it — a plain mutex is simpler and often just as fast.
	`
	},

	'Thread Pool': {
		definition:
			'A thread pool is a fixed (or bounded) set of pre-created worker threads that pull tasks from a shared queue and execute them, avoiding the cost of creating and tearing down a new OS thread for every task.',
		useCase:
			'A web server handling thousands of HTTP requests per second by submitting each request as a task to a fixed pool of worker threads instead of spawning a brand-new thread per request.',
		detailedMarkdown: `
# Thread Pool

Creating an OS thread isn't free — it requires the OS to allocate a stack, register the thread with the scheduler, and later tear all of that down when the thread finishes. If your program spawns a new thread for every incoming task (e.g. one thread per HTTP request), that overhead can dominate under high load, and an unbounded number of threads can exhaust memory or overwhelm the CPU with context switching.

A **thread pool** solves this by creating a fixed number of worker threads **once**, up front, and reusing them for many tasks over their lifetime. Tasks are submitted to a shared queue; idle worker threads pull tasks off the queue and execute them, then go back to waiting for the next one — this is the **producer-consumer** pattern applied to units of work instead of data items.

## Java Example: ExecutorService
\`\`\`java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService pool = Executors.newFixedThreadPool(10); // 10 reusable workers

for (int i = 0; i < 1000; i++) {
    int taskId = i;
    pool.submit(() -> {
        System.out.println("Handling task " + taskId + " on " + Thread.currentThread().getName());
    });
}

pool.shutdown(); // stop accepting new tasks; let queued/running tasks finish
\`\`\`
All 1000 tasks get processed by just 10 threads, which are created once and reused for task after task — no per-task thread creation cost.

## Sizing a Thread Pool
Getting pool size right is a real engineering decision, not a guess:
- **CPU-bound work** (heavy computation, no waiting): size the pool around \`number of CPU cores (+1)\`. More threads than cores just adds context-switching overhead since the CPU is already saturated.
- **I/O-bound work** (network calls, disk reads, DB queries): threads spend most of their time *blocked waiting*, not using the CPU, so you can profitably run many more threads than cores — sizing guidance often looks like \`cores * (1 + wait time / compute time)\`.

## What Happens When the Queue Fills Up
A thread pool is typically backed by a bounded queue. If all workers are busy and the queue is full, a **rejection policy** decides what happens to the next submitted task:
- Reject and throw an exception (the caller must handle it).
- Block the submitting thread until space frees up.
- Discard the task silently (rarely a good idea).
- Run the task on the *caller's* thread instead (a backpressure valve, used by \`ThreadPoolExecutor.CallerRunsPolicy\`).

Choosing the wrong policy under load is a common source of production incidents — silently dropping tasks or letting an unbounded queue grow forever (masking the fact that the pool is undersized) are both real failure modes.

## Thread Pool vs Spawning Threads Per Task
| | New thread per task | Thread pool |
|---|---|---|
| Creation cost | Paid every single task | Paid once, upfront |
| Max concurrency | Unbounded — can exhaust memory/CPU | Bounded and controlled |
| Task queueing | None — task runs immediately or not at all | Built-in queue absorbs bursts |
| Failure mode under load | System-wide resource exhaustion | Predictable backpressure (queue fills, rejection policy kicks in) |

## Practical Takeaway
Thread pools trade a small amount of task-scheduling overhead for predictable, bounded resource usage — which is exactly what you want in any long-running server. The two decisions that matter in practice are **pool size** (driven by whether work is CPU-bound or I/O-bound) and **what happens when the queue is full** (the rejection policy) — both are common, concrete interview follow-ups after "what is a thread pool."
	`
	},

	Futures: {
		definition:
			'A Future is a handle to a value that will be produced by an asynchronous computation at some point later, letting a caller kick off work now and retrieve or react to its result afterward instead of blocking immediately.',
		useCase:
			"Submitting a call to a slow downstream payment API and continuing to do other work on the calling thread while the response is still in flight, only pausing to read the result once it's actually needed.",
		detailedMarkdown: `
# Futures

A **Future** represents a value that doesn't exist yet but will, once some asynchronous computation finishes. Instead of a function blocking the caller until it has a result, it immediately returns a Future — a placeholder — and the actual computation runs elsewhere (often on a thread pool). The caller decides when (and whether) to wait for the real value.

## Basic Future: Blocking on get()
\`\`\`java
import java.util.concurrent.*;

ExecutorService pool = Executors.newFixedThreadPool(4);

Future<Integer> future = pool.submit(() -> {
    Thread.sleep(2000);      // simulate slow work
    return 42;
});

System.out.println("Submitted, doing other work...");
int result = future.get();   // BLOCKS here until the computation finishes
System.out.println("Result: " + result);
\`\`\`
The key benefit over a plain synchronous call: the calling thread can do *other* work between submitting the task and calling \`get()\` — it only blocks at the point where it actually needs the answer, not the instant it starts the work.

## The Limitation of Plain Future
The plain \`Future\` interface has one big gap: there's no way to say "when this finishes, automatically run this next step" — you can only \`get()\` (block) or repeatedly poll \`isDone()\`. That's what \`CompletableFuture\` fixes.

## CompletableFuture: Callback-Based Composition
\`\`\`java
CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
    return fetchUserId();          // runs asynchronously on a pool thread
});

future
    .thenApply(userId -> fetchUserName(userId))   // runs when future completes
    .thenAccept(name -> System.out.println("Hello, " + name))
    .exceptionally(ex -> {
        System.out.println("Something failed: " + ex.getMessage());
        return null;
    });

System.out.println("Chain scheduled, main thread keeps going immediately");
\`\`\`
Nothing here blocks the calling thread. Instead, each \`.thenApply()\`/\`.thenAccept()\` registers a callback that runs automatically once the previous stage completes — this is the same idea as JavaScript promise chaining, expressed in Java.

## Blocking .get() vs Callback-Based .thenApply()
| | \`future.get()\` | \`future.thenApply(...)\` |
|---|---|---|
| Caller thread | Blocks until result is ready | Never blocks — registers a callback |
| Best for | Simple cases where you need the result right now anyway | Chaining multiple async steps, or when the caller has other work to do |
| Error handling | Throws \`ExecutionException\`, must try/catch | \`.exceptionally()\` / \`.handle()\` stay in the chain |

## Combining Multiple Futures
Real systems often need to wait on several independent async operations at once:
\`\`\`java
CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> fetchPrice());
CompletableFuture<Integer> stockFuture = CompletableFuture.supplyAsync(() -> fetchStock());

CompletableFuture<String> combined = priceFuture.thenCombine(stockFuture,
    (price, stock) -> "Price: " + price + ", Stock: " + stock);
\`\`\`
\`thenCombine\` runs both fetches concurrently and only proceeds once *both* have completed — far faster than fetching them one after another.

## Practical Takeaway
A Future is the fundamental building block for "fire off work, deal with the result later" — the plain version is fine for simple fire-and-forget-then-block cases, but any time you need to chain dependent async steps, handle failures inline, or combine multiple concurrent operations, \`CompletableFuture\`'s callback style avoids blocking any thread unnecessarily and composes cleanly.
	`
	},

	'Async Programming': {
		definition:
			'Async programming is a paradigm where operations that would otherwise block (I/O, timers, network calls) are scheduled to run in the background and signal completion via callbacks, promises, or async/await, letting a program stay responsive without necessarily using multiple OS threads.',
		useCase:
			"A Node.js server handling thousands of simultaneous client connections on a single thread by never blocking on network or disk I/O — each request's I/O is handed off and the thread moves on to serve other requests while it completes.",
		detailedMarkdown: `
# Async Programming

**Asynchronous programming** solves the same high-level problem as multithreading — doing multiple things "at once" — but with a fundamentally different mechanism. Instead of running separate operations on separate OS threads, a single thread runs an **event loop**: it starts an operation that would normally block (a network call, a file read, a timer), immediately moves on to other work, and gets notified — via a callback, promise, or resumed \`async\`/\`await\` function — once that operation completes.

## Async Programming vs Multithreading
This distinction trips people up constantly, so it's worth being precise:

| | Multithreading | Async / Event Loop |
|---|---|---|
| Mechanism | Multiple OS threads, scheduled by the OS | Typically one thread, cooperatively scheduling callbacks |
| True parallelism | Yes (on multi-core hardware) | No — one thing runs at a time on that thread |
| Good for | CPU-bound work (heavy computation) | I/O-bound work (waiting on network/disk) |
| Shared-state hazards | Race conditions, need locks | Far fewer — only one callback runs at a time, no interleaved memory access |
| Cost per unit of concurrency | One OS thread per unit (relatively expensive) | One small callback/closure per unit (very cheap) |

The crucial insight: async programming gives you **concurrency without parallelism** on a single thread. Node.js can hold 10,000 open sockets on one JavaScript thread precisely because none of those connections need the CPU while they're waiting on network I/O — the thread is busy running other callbacks, not idling. (Node still uses a background thread pool, via libuv, for a few things like file-system access, but your JavaScript callback code itself runs on one thread.)

## Why This Matters for Interviews
"Can you have concurrency without multiple threads?" is a favorite trick question — the answer is yes, and async I/O on an event loop is the canonical example. It's why a single-threaded Node.js process can outperform a naively-threaded server under I/O-heavy load: no thread creation cost, no context-switch cost, no lock contention — just callbacks queued and run one at a time as their I/O completes.

## From Callbacks to Promises to async/await
JavaScript's evolution mirrors the broader industry trend in async APIs:

\`\`\`javascript
// 1. Callback style — works, but nests badly ("callback hell")
fetchUser(id, (user) => {
    fetchOrders(user.id, (orders) => {
        console.log(orders);
    });
});

// 2. Promise style — chains instead of nesting
fetchUser(id)
    .then(user => fetchOrders(user.id))
    .then(orders => console.log(orders))
    .catch(err => console.error(err));

// 3. async/await — reads like synchronous code, but still non-blocking
async function loadOrders(id) {
    try {
        const user = await fetchUser(id);      // pauses THIS function, not the thread
        const orders = await fetchOrders(user.id);
        console.log(orders);
    } catch (err) {
        console.error(err);
    }
}
\`\`\`
\`await\` doesn't block the underlying thread — it suspends the current \`async\` function and lets the event loop run other code, resuming this function only once the awaited promise settles. That's the core trick that makes async/await both readable *and* non-blocking.

## Common Pitfalls
- **Forgetting to await:** calling an async function without \`await\` (or \`.then()\`) doesn't run it synchronously — it schedules it and immediately moves on, which is a frequent source of "why did this run out of order" bugs.
- **Blocking the event loop:** running CPU-heavy synchronous code inside an async callback still blocks everything else on that thread, since there's no parallelism to fall back on — a slow \`for\` loop in Node.js will stall every other pending request.
- **Unhandled rejections:** a rejected promise with no \`.catch()\`/\`try-catch\` can crash a process (in Node) or fail silently, unlike a thrown exception in synchronous code which is harder to accidentally swallow.

## Practical Takeaway
Use **multithreading** when the bottleneck is CPU work you want to spread across cores. Use **async programming** when the bottleneck is waiting on I/O and you want to serve many concurrent operations cheaply without paying for a thread per connection. The two aren't mutually exclusive — plenty of real systems combine both, running an async event loop per core, with a small thread pool behind it (exactly what Node.js's libuv does).
	`
	}
};
