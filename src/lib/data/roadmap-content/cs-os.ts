import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Process Scheduling
  // - Context Switching
  // - Synchronization
  // - Mutex & Semaphore
  // - Memory Management
  // - Virtual Memory
  // - Paging & Segmentation
  // - CPU Scheduling
  // - File Systems
  // - System Calls
 */
export const CsOsContent: RoadmapDetailMap = {
	'Process Scheduling': {
		definition:
			'The strategy an operating system uses to decide which process in the ready queue gets to run on the CPU next.',
		useCase:
			'Matters any time more processes are runnable than there are CPU cores, e.g. a laptop juggling a browser, a compiler, and a music player at once.',
		detailedMarkdown: `
# Process Scheduling

**Process scheduling** is the OS's answer to a simple but constant problem: there are far more processes that *want* to run than there are CPU cores to run them on. The scheduler is the piece of the kernel that picks, from the pool of ready processes, which one gets the CPU next and for how long.

## What the Scheduler Is Optimizing For
There's no single "best" schedule — different goals pull in different directions:
- **Throughput:** the number of processes completed per unit of time. Higher is better.
- **Turnaround time:** the total time from a process's submission to its completion (wait time + run time + I/O time).
- **Waiting time:** how long a process sits in the ready queue before it actually gets CPU time.
- **Response time:** how quickly a system starts responding, which matters most for interactive systems (you don't want a laggy UI).
- **Fairness:** every process gets a reasonable share of the CPU — nobody starves forever.

These goals conflict. Maximizing throughput might mean running short jobs first, which can starve long jobs. Minimizing response time (great for interactive use) can hurt throughput. A scheduling algorithm is really a policy choice about which trade-off you want.

## Preemptive vs Non-Preemptive
- **Non-preemptive:** once a process gets the CPU, it keeps it until it finishes or voluntarily blocks (e.g. on I/O). Simple, but a single long-running process can hold up everyone else.
- **Preemptive:** the OS can forcibly pause a running process (usually via a timer interrupt) and hand the CPU to someone else. This is what every modern general-purpose OS (Linux, Windows, macOS) uses, because it guarantees the system stays responsive.

## The Classic Algorithms
| Algorithm | Idea | Strength | Weakness |
|---|---|---|---|
| **FCFS** (First-Come, First-Served) | Run processes in arrival order, like a single-file line | Dead simple, fair in order of arrival | A long job at the front causes the **convoy effect** — everyone behind it waits |
| **SJF** (Shortest Job First) | Always run whichever ready process has the shortest remaining burst time | Provably minimizes average waiting time | Requires knowing burst times in advance (often estimated); long jobs can starve |
| **Priority Scheduling** | Each process gets a priority number; highest priority runs first | Lets important work jump the queue | Low-priority processes can starve unless you use **aging** (gradually boosting the priority of processes that have waited a long time) |
| **Round Robin** | Every process gets a fixed **time slice (quantum)**, then goes to the back of the queue | Fair, bounded response time, great for time-sharing/interactive systems | Performance is very sensitive to quantum size — too small wastes time on context switches, too large degrades to FCFS |

A quick worked example for Round Robin with a quantum of 4ms and processes P1 (burst 5), P2 (burst 3), P3 (burst 7): the CPU runs P1 for 4ms, then P2 for its remaining 3ms (finishes), then P3 for 4ms, then P1 for its remaining 1ms (finishes), then P3 for its remaining 3ms (finishes). Notice how the quantum forces regular hand-offs instead of one process monopolizing the CPU.

## Practical Takeaway
Most real operating systems don't use any single algorithm in its pure textbook form. Linux's **CFS (Completely Fair Scheduler)**, for instance, blends priority-like weighting with a Round-Robin-like fairness guarantee, tracking how much "virtual runtime" each process has accumulated and always picking the process that has run the least so far. When you're asked about scheduling in an interview, the strongest answer names the goals first (throughput vs latency vs fairness), then picks the algorithm that best serves *those* goals — not the other way around.
	`
	},

	'Context Switching': {
		definition:
			'The mechanism by which the CPU saves the complete state of one process (or thread) and loads the state of another, so execution can switch between them.',
		useCase:
			'Happens dozens to thousands of times per second on any multitasking system, every time the OS pauses your web browser to let your IDE respond to a keystroke.',
		detailedMarkdown: `
# Context Switching

A **context switch** is what actually makes multitasking possible on a machine with fewer CPU cores than runnable processes. When the OS decides process A should pause and process B should run, it can't just jump to B's code — it first has to carefully preserve *everything* about A's execution state so A can resume later exactly where it left off, byte for byte.

## What Gets Saved and Restored
All of this lives in (or is pointed to by) the **Process Control Block (PCB)**, a kernel data structure the OS maintains for every process:
- **Program counter** — the address of the next instruction to execute.
- **CPU registers** — general-purpose registers, stack pointer, condition/status flags.
- **Process state** — running, ready, waiting, etc.
- **Memory management info** — page table pointers, segment info, base/limit registers.
- **Scheduling info** — priority, pointers to scheduling queues.
- **I/O status** — open file descriptors, pending I/O requests.

To switch from process A to process B, the kernel:
1. Saves A's CPU register state into A's PCB.
2. Updates A's state (e.g. to "ready" or "waiting").
3. Selects B via the scheduler.
4. Loads B's saved register state from B's PCB back into the CPU.
5. Updates memory-management registers (e.g. switches the page table base register) so the MMU translates addresses correctly for B.
6. Jumps to B's saved program counter.

## Why It's Expensive
A context switch does **zero useful work** for the application — it's pure overhead. Two kinds of cost stack up:
- **Direct/software cost:** the CPU cycles spent saving/restoring registers and running scheduler logic. This is small but non-zero — typically low microseconds.
- **Indirect/hardware cost:** far larger in practice. Switching processes usually means flushing or invalidating the **TLB (Translation Lookaside Buffer)** and losing the warmth of the **CPU cache** (L1/L2/L3). The new process starts with cold caches, so its first several memory accesses are slow cache misses. This indirect cost often dwarfs the direct cost.

This is exactly why **thread context switches are cheaper than process context switches**: threads within the same process share the same address space, so the page table and TLB entries stay valid — there's no need to flush them. Only the register set and stack need to change.

## Practical Takeaway
Context switching is a real performance concern, not just a theoretical one — it's why servers under heavy load with thousands of competing threads slow down disproportionately, and why techniques like **thread pools** (reuse threads instead of constantly creating/destroying them) and **coroutines/async I/O** (switch in user space, avoiding kernel-level context switches entirely) exist. If you're ever asked "why is my highly-threaded server slower than expected," excessive context switching is one of the first things to suspect and measure (e.g. with \`vmstat\` or \`perf\` on Linux, which report context-switch counts directly).
	`
	},

	Synchronization: {
		definition:
			'The set of techniques used to control how concurrently running threads access shared data, so that operations on that data behave predictably instead of racing each other.',
		useCase:
			'Needed anywhere two threads touch the same variable, e.g. two threads incrementing a shared bank account balance at the same time.',
		detailedMarkdown: `
# Synchronization

**Synchronization** exists to solve one core problem: when multiple threads read and write the same shared memory without coordination, the outcome depends on the exact, unpredictable interleaving of their instructions. This is called a **race condition**, and it is one of the most common sources of "impossible to reproduce" bugs in software.

## Why Race Conditions Happen
Consider two threads both running \`balance = balance + 100\`. That single line of code is actually at least three CPU instructions:
1. Load \`balance\` from memory into a register.
2. Add 100 to the register.
3. Store the register back into \`balance\`.

If both threads run this sequence, they can interleave like:
\`\`\`text
Thread A: load balance (100)
Thread B: load balance (100)
Thread A: add 100 -> 200
Thread B: add 100 -> 200
Thread A: store 200
Thread B: store 200          // Should have been 300, not 200!
\`\`\`
One of the two updates is silently lost. This block of code — \`load, add, store\` — is called a **critical section**: a region where shared state is read and modified, and where uncontrolled concurrent access produces wrong results.

## The Synchronization Toolbox
Different tools solve this at different levels of abstraction:
- **Locks (mutexes):** the most basic tool — only one thread may hold the lock at a time, so only one thread executes the critical section at a time. See "Mutex & Semaphore" for the deep dive.
- **Semaphores:** a generalization of locks that allow a fixed number of threads (not just one) into a section at once, useful for limiting access to a pool of N resources.
- **Monitors:** a higher-level construct (built into languages like Java via \`synchronized\`) that bundles a lock together with the data it protects, so you can't accidentally forget to lock before touching the data.
- **Condition variables:** let a thread sleep until some condition becomes true (e.g. "the queue is no longer empty"), instead of wasting CPU cycles busy-checking (**spin-waiting**) in a loop.

## A Minimal Fix
\`\`\`java
class Account {
    private int balance = 0;
    private final Object lock = new Object();

    void deposit(int amount) {
        synchronized (lock) {       // only one thread at a time past this point
            balance = balance + amount;
        }
    }
}
\`\`\`
Wrapping the critical section in a lock forces the three-step load/add/store sequence to run **atomically** with respect to other threads — no other thread can observe or interleave with a half-finished update.

## Practical Takeaway
The rule of thumb is: **any time two or more threads can touch the same mutable state, you need synchronization** — there is no interleaving-based bug that "probably won't happen in practice"; given enough load and enough time, it will. The real engineering skill is picking the *lightest* synchronization tool that's correct: prefer immutable/thread-local data where possible, reach for a simple lock next, and only bring in semaphores, monitors, or condition variables when you specifically need their extra semantics (bounded concurrency, or waiting on a state change).
	`
	},

	'Mutex & Semaphore': {
		definition:
			'A mutex is a lock that only one thread can hold at a time; a semaphore is a counter-based signal that allows up to N threads (or 1, for a binary semaphore) to proceed concurrently.',
		useCase:
			'A mutex protects a single shared counter from concurrent updates; a counting semaphore caps how many threads can simultaneously use a fixed-size connection pool.',
		detailedMarkdown: `
# Mutex & Semaphore

Mutexes and semaphores are the two most fundamental building blocks for solving synchronization problems, and interviewers love asking "what's the difference?" because the answer reveals whether you actually understand *ownership* and *counting*, not just "they both do locking."

## Mutex (Mutual Exclusion Lock)
A **mutex** allows exactly one thread to enter a critical section at a time. Its defining property is **ownership**: whichever thread locks the mutex is the only thread allowed to unlock it. Most mutex implementations will throw an error (or simply misbehave) if a different thread tries to release a lock it doesn't own.
\`\`\`java
Lock mutex = new ReentrantLock();
mutex.lock();
try {
    // critical section - only one thread here at a time
} finally {
    mutex.unlock();
}
\`\`\`

## Semaphore
A **semaphore** is a counter, initialized to some value N, with two atomic operations:
- \`acquire()\` (a.k.a. \`wait()\`/\`P()\`) — decrements the counter; if it would go below 0, the calling thread blocks.
- \`release()\` (a.k.a. \`signal()\`/\`V()\`) — increments the counter, potentially waking a blocked thread.

There are two flavors:
- **Binary semaphore:** counter capped at 1, looks superficially like a mutex.
- **Counting semaphore:** counter can be any N, allowing up to N threads through simultaneously — perfect for capping access to a pool of N identical resources (e.g. N database connections).

Crucially, a semaphore has **no ownership concept** — any thread can call \`release()\`, even one that never called \`acquire()\`. This makes semaphores more flexible (e.g. one thread can produce a "permit" that a completely different thread consumes) but also more dangerous, since there's no built-in protection against a thread releasing a permit it never held.

## Mutex vs Binary Semaphore — the Real Difference
| | Mutex | Binary Semaphore |
|---|---|---|
| Max holders | 1 | 1 |
| Ownership | Yes — only the locking thread can unlock | No — any thread can release |
| Typical use | Protecting a critical section | Signaling between threads (e.g. "task is ready") |
| Misuse detection | Often built-in (error if wrong thread unlocks) | None — silent bugs possible |

The practical rule: **use a mutex when you're protecting shared data that one thread at a time should touch. Use a semaphore when you're signaling or limiting concurrency across a pool of resources.**

## Classic Application: Producer-Consumer
The producer-consumer problem (one or more producer threads adding items to a bounded buffer, one or more consumer threads removing them) is the textbook semaphore use case:
- A semaphore \`emptySlots\` (initialized to buffer size) tracks available space — producers \`acquire()\` before adding, consumers \`release()\` after removing.
- A semaphore \`fullSlots\` (initialized to 0) tracks items ready to consume — consumers \`acquire()\` before removing, producers \`release()\` after adding.
- A mutex protects the actual buffer index/array manipulation from being corrupted by concurrent producer/consumer access.

This combination — semaphores for counting availability, a mutex for protecting the shared structure itself — shows up constantly in real systems, from thread pools to bounded work queues.

## Practical Takeaway
If your interviewer asks "can you implement a mutex using a semaphore?" — yes, a binary semaphore behaves like a mutex for the locking behavior, but you lose ownership checks. If they ask "can you implement a semaphore using a mutex?" — you'd need a mutex plus a counter plus a condition variable to replicate blocking behavior; it's not a one-line swap. Knowing that asymmetry is usually the signal they're looking for.
	`
	},

	'Memory Management': {
		definition:
			"The part of the OS responsible for allocating, tracking, and reclaiming a process's memory, while keeping processes isolated from each other.",
		useCase:
			'Kicks in every time a program calls \`malloc()\` or exits and the OS needs to decide where that memory lives physically and how to reclaim it afterward.',
		detailedMarkdown: `
# Memory Management

**Memory management** is the OS subsystem that decides where in physical RAM each process's data lives, keeps processes from stomping on each other's memory, and reclaims space when a process no longer needs it. It sits underneath everything — every variable, object, and stack frame your program uses ultimately maps to a decision the memory manager made.

## Contiguous Allocation
The earliest and conceptually simplest approach: give each process one unbroken block of physical memory. The OS tracks free regions ("holes") and, when a new process arrives, picks a hole using a strategy like:
- **First Fit:** use the first hole big enough.
- **Best Fit:** use the smallest hole that's still big enough (minimizes wasted space per allocation, but leaves lots of tiny unusable slivers over time).
- **Worst Fit:** use the largest available hole (leaves bigger leftover chunks that might be useful later).

## Fragmentation: The Core Problem
Contiguous allocation inevitably leads to **fragmentation**, and distinguishing the two types is a favorite interview question:
- **External fragmentation:** free memory exists, but it's scattered in small, non-contiguous chunks — no single hole is big enough for a new request, even though the *total* free memory would be enough. This is the direct consequence of pure contiguous allocation.
- **Internal fragmentation:** memory is allocated in fixed-size blocks/pages, and a process doesn't use its whole block — the leftover space inside the block is wasted. This shows up once you move to paging (see below), where memory is handed out in fixed-size chunks.

## The Modern Fix: Paging and Segmentation
Contiguous allocation's fragmentation problem is exactly why modern systems don't use it directly. Instead:
- **Paging** splits memory into fixed-size chunks (pages/frames), eliminating external fragmentation entirely (any free frame can hold any page) at the cost of some internal fragmentation.
- **Segmentation** splits a program into logically meaningful, variable-sized chunks (code, data, stack), which maps naturally to how programs are structured but re-introduces external fragmentation.

Both get a dedicated deep dive in "Paging & Segmentation" — the short version for this topic is: **paging solved memory management's biggest historical pain point (external fragmentation) and is why virtually every general-purpose OS today uses page-based memory management, usually combined with virtual memory.**

## Allocation and Reclamation in Practice
Within a process's own address space, memory management also covers:
- **The heap:** dynamically allocated memory (\`malloc\`/\`new\`), managed by an allocator that tracks free/used chunks — this is where fragmentation can happen *within* a single process's heap too.
- **The stack:** automatically grows/shrinks as functions are called and return; management here is essentially free (just move a pointer).
- **Garbage collection:** in managed languages (Java, Go, Python, JavaScript), the runtime — not the programmer — reclaims heap memory that's no longer reachable, trading manual control for safety from certain classes of bugs (use-after-free, double-free).

## Practical Takeaway
Whenever an interviewer asks "why doesn't the OS just give every process a contiguous chunk of RAM," the answer is fragmentation — and the fix (paging) is why every modern OS translates addresses through page tables rather than using raw physical addresses directly. This one idea is the bridge into virtual memory, which is really just "paging plus the illusion that every process has the whole address space to itself."
	`
	},

	'Virtual Memory': {
		definition:
			'An abstraction that gives each process its own private, contiguous address space, decoupled from where (or whether) data physically lives in RAM.',
		useCase:
			'Lets a program allocate and use more memory than physically exists on the machine, and lets two processes both believe their code starts at the same address without conflicting.',
		detailedMarkdown: `
# Virtual Memory

**Virtual memory** is one of the most important ideas in operating systems: instead of letting programs address physical RAM directly, the OS gives every process its own private **virtual address space** and transparently translates virtual addresses to physical ones behind the scenes.

## Why It Exists
Without virtual memory, you'd have serious problems:
- **No isolation:** any process could read or corrupt any other process's memory (or the kernel's), since everyone shares one flat physical address space.
- **No overcommit:** a process could never use more memory than physically exists in RAM, even temporarily.
- **Painful relocation:** every program would need to be compiled to run at whatever physical address happens to be free, since address 0 can't belong to two processes at once.

Virtual memory fixes all three: each process gets an isolated address space (typically starting at address 0 from its own point of view), the OS can back virtual pages with disk as well as RAM, and every process can be compiled/linked as if it owns the entire address space.

## Address Translation
Every memory access a process makes uses a **virtual address**. The **MMU (Memory Management Unit)**, a piece of CPU hardware, translates it to a **physical address** using a **page table** maintained by the OS for that process. This happens on essentially every single memory access, which is why hardware support (and the **TLB** cache for recent translations) is essential — doing this translation in software for every access would be far too slow.

## Page Faults and Demand Paging
Not every virtual page needs to be backed by physical RAM at all times. **Demand paging** means pages are only loaded into physical memory when they're actually accessed:
1. A process accesses a virtual address whose page isn't currently in RAM.
2. The MMU raises a **page fault** — a hardware trap into the kernel.
3. The OS finds the page's data (usually on disk, in the executable file or the **swap/page file**), loads it into a free physical frame, updates the page table, and resumes the process at the faulting instruction.

This is why the very first access to a large array can be slightly slower than later accesses — you're paying for page faults as data gets pulled in on demand, rather than loading everything upfront.

## Thrashing
If a system is running so many processes (or a process is accessing so much memory) that the OS spends more time paging data in and out than actually executing instructions, you get **thrashing** — throughput collapses even though the CPU looks "busy." It's caused by insufficient physical RAM for the collective **working set** (the pages a process actively needs) of all running processes. The fix is usually reducing memory pressure: running fewer processes concurrently, adding RAM, or improving an application's memory footprint — not tuning the scheduler.

## Practical Takeaway
Virtual memory is the reason a 32-bit process can address up to 4GB even on a machine with less physical RAM, the reason two unrelated programs can both have a pointer to "address 0x00400000" without conflict, and the reason a crashing program can be killed and cleaned up without taking the rest of the system down with it. When debugging performance issues, high **page fault rates** or a swapping/thrashing system are strong signals that memory pressure, not CPU scheduling, is the bottleneck — tools like \`vmstat\` (Linux) surface this directly.
	`
	},

	'Paging & Segmentation': {
		definition:
			"Two complementary schemes for dividing a process's address space into manageable pieces — paging uses fixed-size pages, segmentation uses variable-sized logical units.",
		useCase:
			"Paging is how virtually every modern OS maps a process's virtual address space onto physical RAM; segmentation shows up in how the address space is logically divided into code/data/stack regions.",
		detailedMarkdown: `
# Paging & Segmentation

Both **paging** and **segmentation** solve the same underlying problem — how do you divide up and map a process's memory — but they make opposite trade-offs, and understanding both (and why paging won out) is a staple OS interview topic.

## Paging
Paging divides virtual and physical memory into fixed-size blocks:
- **Pages** — fixed-size chunks of a process's virtual address space (commonly 4KB).
- **Frames** — fixed-size chunks of physical RAM, the same size as pages.

The OS maintains a **page table** per process, mapping virtual page numbers to physical frame numbers. Because every page and frame is the same size, any free frame can hold any page — there's no external fragmentation. The cost is **internal fragmentation**: if a process's last page is only half-used, that other half is wasted (bounded by at most one page's worth of waste per allocation, so it's a much smaller problem than external fragmentation).

### The TLB
Looking up the page table in memory on every single memory access would double your memory latency for every access. The **TLB (Translation Lookaside Buffer)** is a small, fast, hardware cache inside the CPU that stores recent virtual-to-physical translations. A **TLB hit** means near-zero translation overhead; a **TLB miss** means walking the actual page table in memory, which is much slower. This is why context switches (which typically flush the TLB) are expensive — see "Context Switching."

### Multi-Level Page Tables
A single flat page table for a large address space would itself take up huge amounts of memory (most of it mapping unused regions). Real systems use **multi-level (hierarchical) page tables** — a tree structure where higher levels only need entries for regions of the address space that are actually in use, saving substantial memory for sparse address spaces.

## Segmentation
Segmentation divides a program into **variable-sized, logically meaningful segments** — typically code, data, heap, and stack — each with its own base address and length. This maps naturally onto how programmers and compilers think about a program's structure (as opposed to paging's arbitrary fixed-size slices).

The cost: because segments are variable-sized, segmentation re-introduces **external fragmentation** — as segments are allocated and freed, physical memory gets chopped into gaps too small for new segments, exactly like the contiguous-allocation problem discussed in "Memory Management."

## Head-to-Head Comparison
| | Paging | Segmentation |
|---|---|---|
| Unit size | Fixed | Variable |
| Fragmentation type | Internal | External |
| Maps to program structure? | No — arbitrary slices | Yes — code/data/stack are natural units |
| Hardware support | Page table + TLB | Segment table (base + limit registers) |
| Modern usage | Universal (Linux, Windows, macOS) | Largely historical; some CPUs (x86) retain segment registers but modern OSes mostly don't use them for memory management |

## Segmentation with Paging
Many real architectures historically combined both: divide the address space into logical segments, then page each segment. This gets the logical organization of segmentation with paging's freedom from external fragmentation. x86 hardware supports this hybrid model, though modern 64-bit operating systems largely rely on pure paging and leave segmentation mostly unused.

## Practical Takeaway
If asked "why did paging win over segmentation," the honest answer is: **fixed-size fragmentation (internal) is far easier to bound and tolerate than variable-size fragmentation (external).** Wasting at most one page per allocation is a predictable, small cost; hunting for a free hole big enough for a variable-sized segment is an unbounded, worsening problem as the system runs longer. That's the whole story in one sentence.
	`
	},

	'CPU Scheduling': {
		definition:
			'The specific algorithms and queue structures the OS kernel uses to implement process scheduling decisions in a running system.',
		useCase:
			'Determines, in real time, whether your background compile job or your foreground video call gets the CPU next when both are ready to run.',
		detailedMarkdown: `
# CPU Scheduling

While "Process Scheduling" covers the *goals and classic algorithms* (FCFS, SJF, Priority, Round Robin), **CPU scheduling** in practice is usually implemented with richer queue structures and hybrid strategies, because real workloads are a mix of interactive, batch, and background jobs that no single simple algorithm handles well.

## Multilevel Queue Scheduling
Instead of one ready queue, the system maintains **several queues**, each for a different class of process — e.g. a queue for interactive/foreground processes and a separate queue for batch/background processes. Each queue can have its own scheduling algorithm (Round Robin for interactive, FCFS for batch), and queues themselves are scheduled relative to each other (e.g. always service the interactive queue first, or give it a larger share of CPU time).

The weakness: assignment to a queue is typically fixed at process creation and doesn't adapt if a process's behavior changes.

## Multilevel Feedback Queue (MLFQ)
**MLFQ** fixes that rigidity by letting processes **move between queues** based on observed behavior:
- New processes start in a high-priority queue with a short time quantum.
- If a process uses its *entire* quantum without blocking (a sign it's CPU-bound, not interactive), it gets demoted to a lower-priority queue with a longer quantum.
- If a process blocks quickly for I/O (a sign it's interactive), it stays at high priority.
- Lower-priority queues get serviced less often, but with longer time slices when they do run.

This elegantly self-tunes: interactive processes (editors, shells) naturally stay fast and responsive because they rarely use a full quantum, while CPU-bound batch jobs sink to background queues without needing to be explicitly labeled as such. MLFQ is one of the most commonly cited "real" scheduling designs in OS courses precisely because it adapts without any information given in advance.

## Real-World Example: Linux CFS
Linux's default scheduler, the **Completely Fair Scheduler (CFS)**, takes yet another angle. Instead of discrete time slices per queue level, CFS tracks each task's **vruntime** (virtual runtime — accumulated CPU time, weighted by priority/"niceness") and always picks the task with the smallest vruntime to run next, using a **red-black tree** to keep this lookup efficient. The effect is that CPU time converges toward being shared fairly in proportion to priority weight, without hard-coded time quantum tiers like MLFQ. Higher-priority ("nicer" in the negative sense — lower nice value) tasks accumulate vruntime more slowly, so they get scheduled more often.

## Comparing the Approaches
| Approach | Adapts to behavior? | Real-world example |
|---|---|---|
| Single queue (FCFS/RR/SJF) | No | Simple embedded/educational OSes |
| Multilevel Queue | No (fixed class per process) | Older batch systems |
| MLFQ | Yes (based on quantum usage) | Classic Unix schedulers, Windows (a variant) |
| CFS (vruntime-based) | Yes (continuous fairness, not tiers) | Linux (default since kernel 2.6.23) |

## Practical Takeaway
When asked about CPU scheduling in an interview, naming FCFS/SJF/RR shows textbook knowledge, but mentioning MLFQ's self-adapting queues or Linux CFS's vruntime approach shows you understand how scheduling actually behaves on hardware you use every day. The unifying theme across all of them: reward processes that behave interactively (frequent blocking) with better responsiveness, without permanently starving CPU-bound background work.
	`
	},

	'File Systems': {
		definition:
			'The OS component that organizes how data is stored, named, and retrieved on persistent storage devices like disks and SSDs.',
		useCase:
			"Responsible for translating a path like \`/home/user/notes.txt\` into the actual disk blocks that hold your file's bytes.",
		detailedMarkdown: `
# File Systems

A **file system** is the layer that turns a raw block device (a disk or SSD that only understands "read/write block N") into the familiar abstraction of files, directories, and paths. Every time you open, save, or delete a file, the file system is doing significant work behind that simple API.

## Files as Metadata + Data
A file system needs to track two separate things for every file:
1. **Data** — the actual bytes of content, stored across one or more disk blocks.
2. **Metadata** — size, permissions, timestamps, ownership, and, critically, *where the data blocks are located on disk*.

## inodes (Unix-style File Systems)
Unix/Linux file systems (like ext4) use an **inode** (index node) to hold a file's metadata plus pointers to its data blocks. Key properties:
- Every file has exactly one inode, identified by a unique inode number.
- A **directory** is really just a special file that maps human-readable names to inode numbers — this is why hard links work (multiple names can point to the same inode) and why renaming a file is cheap (you're just changing a name-to-inode mapping, not moving any data).
- Inodes typically store direct pointers to the first several data blocks, plus indirect pointers (blocks that themselves contain more pointers) to support large files without making every inode huge.

## FAT (File Allocation Table Systems)
Older/simpler file systems like **FAT32** take a different approach: there's a single table (the FAT) with one entry per cluster on disk, and each entry either marks the cluster as free, marks it as the end of a file, or points to the *next* cluster in the same file — forming a linked list of clusters per file. It's simple and has minimal metadata overhead, which is why FAT32/exFAT are still common on USB drives and SD cards, but it's less robust and less feature-rich (no permissions model, weaker crash recovery) than inode-based systems.

## Directory Structures
- **Single-level:** one flat list of files — impractical beyond toy systems.
- **Two-level / Tree-structured:** the hierarchical directory structure you actually use (\`/home/user/docs/file.txt\`), where each directory can contain files and subdirectories.
- **Acyclic-graph:** allows a file to appear in multiple directories at once (via links) without duplicating data, at the cost of needing care to avoid actual cycles.

## Journaling
A crash or power loss mid-write can leave a file system in an inconsistent state (e.g. data written but metadata not updated, or vice versa). **Journaling file systems** (ext4, NTFS) guard against this by writing a log ("journal") of the changes they're *about* to make before actually making them. After a crash, the OS replays or rolls back incomplete journal entries on the next mount, restoring consistency quickly — without journaling, a crash could require a full, slow filesystem-wide consistency scan (like the old \`fsck\` on non-journaled ext2).

## Practical Takeaway
The inode vs FAT distinction is really a proxy for a bigger idea: **file systems trade off metadata richness/robustness against simplicity and overhead.** Inode-based systems support permissions, hard links, and fast journaled recovery at the cost of more complex metadata structures; FAT-style systems are simple and portable but limited. When asked "what happens when you delete a file," the inode-based answer is usually: the directory entry (name-to-inode mapping) is removed, the inode's link count is decremented, and only when that count hits zero are the data blocks actually freed — which is exactly why hard-linked files survive one of their names being deleted.
	`
	},

	'System Calls': {
		definition:
			'The controlled interface through which a user-mode program requests services (file I/O, process creation, networking, etc.) from the OS kernel.',
		useCase:
			'Every time a program reads a file, allocates memory from the OS, or spawns a new process, it does so through a system call, e.g. \`read()\`, \`mmap()\`, or \`fork()\` on Linux.',
		detailedMarkdown: `
# System Calls

A **system call** is the only sanctioned way for a regular program to ask the kernel to do something on its behalf. This restriction isn't bureaucracy for its own sake — it's the foundation of OS security and stability: if any program could directly manipulate hardware or other processes' memory, isolation between programs would be meaningless.

## User Mode vs Kernel Mode
Modern CPUs support at least two privilege levels:
- **User mode:** where regular application code runs. It can't directly execute privileged instructions (like manipulating page tables, talking to disk controllers, or halting the CPU) or access arbitrary memory.
- **Kernel mode:** where the OS kernel runs, with full hardware access and no restrictions.

This split is enforced by hardware, not convention — a user-mode program *physically cannot* execute privileged instructions; the CPU will fault if it tries.

## How a System Call Actually Works
A system call is the controlled bridge between these two modes:
1. A user program calls a wrapper function (e.g. \`read()\` from the C standard library).
2. That wrapper sets up the syscall number and arguments (often in specific registers), then executes a special **trap instruction** (e.g. \`syscall\` on x86-64, historically \`int 0x80\`).
3. The trap instruction causes a controlled switch into kernel mode, jumping to a fixed, kernel-defined entry point — the program cannot specify an arbitrary address to jump to, which is the key security property.
4. The kernel looks up the requested syscall number in a **system call table**, executes the corresponding kernel function with full privileges, and prepares a return value.
5. The CPU switches back to user mode and resumes the calling program right after the trap instruction, with the result available (e.g. in a return register).

This is conceptually similar to a hardware interrupt or a page fault (see "Virtual Memory") — all three are ways for control to transfer from user code into the kernel in a controlled, predictable way.

## Common Linux System Calls
| Syscall | Purpose |
|---|---|
| \`open()\` | Open a file, returning a file descriptor |
| \`read()\` / \`write()\` | Read from / write to a file descriptor |
| \`close()\` | Release a file descriptor |
| \`fork()\` | Create a new process as a near-copy of the calling process |
| \`exec()\` family | Replace the calling process's image with a new program |
| \`wait()\` | Block until a child process terminates |
| \`mmap()\` | Map a file or device into the process's virtual address space |
| \`exit()\` | Terminate the calling process |

A classic pattern worth knowing cold: a Unix shell launching a command typically calls \`fork()\` to create a child process, then \`exec()\` in that child to replace its memory image with the target program, while the parent calls \`wait()\` to block until the child finishes.

## Why the Overhead Matters
Every system call involves a mode switch, which — like a context switch — has real cost (saving/restoring state, potential cache/TLB effects). This is why performance-sensitive code tries to **batch** work into fewer syscalls (e.g. buffered I/O that accumulates writes in a user-space buffer and issues one large \`write()\` instead of many tiny ones) rather than issuing a syscall per byte or per tiny operation.

## Practical Takeaway
If asked to explain what happens when you call \`printf\`, the accurate chain is: \`printf\` formats a string in user space, buffers it, and only when the buffer is flushed does it eventually call the \`write()\` system call, which traps into the kernel, which writes to the actual file descriptor (e.g. stdout) through the file system or device driver. The kernel boundary is the one place in the whole stack where "the rules change" — from ordinary function calls to a hardware-enforced, tightly controlled transition.
	`
	}
};
