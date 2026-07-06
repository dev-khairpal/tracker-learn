import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Collections
  // - Memory Model
  // - Exception Handling
  // - Generics
  // - Streams / Iterators
  // - Reflection
  // - Multithreading APIs
  // - Garbage Collection
 */
export const LanguageMasteryContent: RoadmapDetailMap = {
	Collections: {
		definition:
			'A framework of interfaces (List, Set, Map, Queue) and ready-made implementations for storing and manipulating groups of objects, each with different ordering, uniqueness, and performance trade-offs.',
		useCase:
			'Picking a HashMap for O(1) average-case username-to-session lookups versus a TreeMap when you need those same users returned in sorted order for a report.',
		detailedMarkdown: `
# Collections

The **Collections Framework** (\`java.util\`) is the standard toolkit for grouping objects. Almost every interview question about "which data structure would you use here?" is really asking you to pick the right collection.

## The Hierarchy

\`\`\`text
Iterable
 └── Collection
      ├── List   (ordered, allows duplicates)
      ├── Set    (no duplicates)
      └── Queue  (FIFO / priority processing)

Map (NOT a Collection — key/value pairs)
\`\`\`

**Map** is deliberately separate from **Collection** — it stores pairs, not single elements, so it has its own contract (\`put\`, \`get\`, \`entrySet\`) rather than \`add\`/\`iterator\`.

## Key Implementations

| Interface | Implementation | Backing structure | Ordering | Notes |
|---|---|---|---|---|
| List | \`ArrayList\` | Resizable array | Insertion order | Fast random access, slow middle inserts |
| List | \`LinkedList\` | Doubly linked list | Insertion order | Fast head/tail ops, also implements \`Deque\` |
| Set | \`HashSet\` | Backed by a \`HashMap\` | No guarantee | Fastest lookup |
| Set | \`LinkedHashSet\` | Hash table + linked list | Insertion order | Predictable iteration, slight overhead |
| Set | \`TreeSet\` | Red-black tree | Sorted (natural/comparator) | Supports range queries (\`NavigableSet\`) |
| Map | \`HashMap\` | Hash table | No guarantee | Default choice for key lookups |
| Map | \`LinkedHashMap\` | Hash table + linked list | Insertion (or access) order | Great base for an LRU cache |
| Map | \`TreeMap\` | Red-black tree | Sorted by key | \`firstKey()\`, \`ceilingKey()\`, range views |

## Big-O Cheat Sheet

| Operation | ArrayList | LinkedList | HashMap/HashSet | TreeMap/TreeSet |
|---|---|---|---|---|
| get by index | O(1) | O(n) | — | — |
| get by key | — | — | O(1) avg | O(log n) |
| insert at end | O(1) amortized | O(1) | O(1) avg | O(log n) |
| insert at front/middle | O(n) | O(1) at ends, O(n) to find middle | — | — |
| contains | O(n) | O(n) | O(1) avg | O(log n) |

## Choosing the Right One

- **Need index-based access or a simple stack of items?** \`ArrayList\`.
- **Need to push/pop from both ends constantly (queue/deque)?** \`ArrayDeque\` — it's faster than \`LinkedList\` for this and should be preferred over the legacy \`Stack\`/\`Vector\` classes, which are synchronized and slow.
- **Need fast "have I seen this before?" checks?** \`HashSet\`.
- **Need uniqueness *and* sorted iteration (e.g., a leaderboard)?** \`TreeSet\`.
- **Need a cache that evicts the least-recently-used entry?** \`LinkedHashMap\` with \`accessOrder = true\`, overriding \`removeEldestEntry\`.
- **Need thread-safe concurrent access?** Don't wrap with \`Collections.synchronizedMap\` if you can avoid it — reach for \`ConcurrentHashMap\` instead (see Multithreading APIs).

## A Quick Example

\`\`\`java
Map<String, Integer> wordCounts = new HashMap<>();
for (String word : text.split(" ")) {
    wordCounts.merge(word, 1, Integer::sum);
}

// Sorted view without changing the underlying map's storage:
Map<String, Integer> sorted = new TreeMap<>(wordCounts);
\`\`\`

## Cross-Language Notes

- **Python**: \`list\`, \`dict\`, and \`set\` are built into the language. Since Python 3.7, plain \`dict\` preserves insertion order (like \`LinkedHashMap\`), so there's less need for a separate ordered-map type.
- **JavaScript**: \`Array\`, \`Map\`, and \`Set\` play the same roles; a plain \`Object\` can act like a map for string keys but \`Map\` handles any key type and preserves insertion order.
- **Go**: has built-in \`slice\` and \`map\` types but no built-in \`Set\` (typically simulated with \`map[T]struct{}\`) and no built-in tree-based ordered map in the standard library.

The underlying concepts — array vs. linked structure, hashing vs. balanced tree — are universal even when the syntax differs.
	`
	},

	'Memory Model': {
		definition:
			"The rules governing where a program's data lives (stack vs. heap) and how threads observe changes to shared memory.",
		useCase:
			'Diagnosing whether a crash is a StackOverflowError from runaway recursion or an OutOfMemoryError from a heap leak — the fix is completely different depending on which region is exhausted.',
		detailedMarkdown: `
# Memory Model

Every running program divides its memory into a few regions with very different lifetimes and rules. Understanding this is what lets you reason about performance, bugs like memory leaks, and thread-safety.

## Stack vs. Heap

| | Stack | Heap |
|---|---|---|
| Stores | Method call frames, local variables, primitive values, object *references* | Objects, arrays, instance fields |
| Lifetime | Popped automatically when the method returns | Lives until no reference points to it (then eligible for GC) |
| Scope | Per-thread — each thread has its own stack | Shared across all threads |
| Speed | Very fast (simple pointer bump) | Slower (allocation bookkeeping, GC involvement) |
| Failure mode | \`StackOverflowError\` (usually from deep/infinite recursion) | \`OutOfMemoryError\` (usually a leak or genuinely too much live data) |

## Primitives vs. References

A local variable of a primitive type (\`int\`, \`double\`, \`boolean\`) holds its actual value directly on the stack. A variable of an object type holds a **reference** — essentially a pointer — to an object living on the heap.

\`\`\`java
int x = 5;                 // 5 lives on the stack
User u = new User("Amy");  // the User object lives on the heap;
                            // 'u' on the stack just points to it

User u2 = u;   // copies the *reference*, not the object
u2.setName("Bea");
System.out.println(u.getName()); // "Bea" — u and u2 point to the same object
\`\`\`

This is why Java is often described as "pass-by-value, where the value is the reference" — you can mutate the object a reference points to, but reassigning the parameter itself inside a method never affects the caller's variable.

## The String Pool

String literals are a special case: the JVM interns them in a shared **String Pool** inside the heap so that identical literals reuse the same object, saving memory. \`new String("x")\` deliberately opts out of this and creates a fresh heap object.

## The Java Memory Model (JMM) and Concurrency

Stack/heap explains a *single* thread's view of memory. The **Java Memory Model** (formalized in JSR-133) additionally defines what one thread is *guaranteed* to see of another thread's writes — because CPU caches and compiler reordering mean a write on Thread A isn't automatically visible to Thread B.

- **Visibility**: without synchronization, Thread B might never see a value Thread A wrote — it could be reading a stale, cached copy indefinitely.
- **volatile**: forces reads/writes of a field to go through main memory rather than a thread-local cache, and prevents certain compiler reorderings. It gives visibility but *not* atomicity for compound operations like \`count++\`.
- **happens-before**: the JMM's core concept — if action A *happens-before* action B, every effect of A is visible to B. Acquiring a lock, writing then reading a \`volatile\` field, and thread start/join all establish happens-before edges.

This ties directly into the **Concurrency** section: \`synchronized\`, \`volatile\`, and the \`java.util.concurrent.atomic\` classes all exist to give you explicit, well-defined happens-before guarantees instead of relying on luck.

## Cross-Language Notes

- **C/C++**: the same stack/heap split exists, but the heap is managed manually (\`malloc\`/\`free\`, \`new\`/\`delete\`). Forget to free and you leak; free twice or use-after-free and you get undefined behavior — problems garbage-collected languages eliminate.
- **Python / JavaScript**: developers rarely think about stack vs. heap explicitly since there's no manual allocation, but the call stack still exists (and can still overflow on deep recursion), and objects still live on a garbage-collected heap under the hood.
	`
	},

	'Exception Handling': {
		definition:
			'A structured mechanism for detecting runtime errors and transferring control to a handler, instead of letting the program crash or fail silently.',
		useCase:
			'Catching a specific FileNotFoundException while loading an optional config file and falling back to defaults, rather than letting the whole service crash on startup.',
		detailedMarkdown: `
# Exception Handling

Exceptions separate the "happy path" of your code from error-handling logic, and they force errors to be dealt with somewhere up the call stack instead of being ignored.

## The Hierarchy

\`\`\`text
Throwable
 ├── Error                  (JVM-level, unrecoverable — e.g. OutOfMemoryError; don't catch)
 └── Exception
      ├── RuntimeException  (unchecked — NullPointerException, IllegalArgumentException, IndexOutOfBoundsException)
      └── (everything else) (checked — IOException, SQLException)
\`\`\`

## Checked vs. Unchecked

- **Checked exceptions** must be either caught or declared with \`throws\` — the compiler enforces it. They represent conditions a well-written program *should* anticipate and recover from (a file might not exist, a network call might fail).
- **Unchecked exceptions** (\`RuntimeException\` and its subclasses) don't require declaration. They usually represent programmer bugs (null dereference, bad argument, invalid array index) rather than expected external failures.

A common interview follow-up: "Should I make my custom exception checked or unchecked?" — if the caller can reasonably be expected to recover (e.g., retry, use a default), lean checked or a documented unchecked exception; if it signals a bug, use unchecked.

## try / catch / finally

\`\`\`java
try {
    process(file);
} catch (FileNotFoundException e) {
    log.warn("Config missing, using defaults", e);
} catch (IOException e) {
    throw new RuntimeException("Unrecoverable I/O failure", e);
} finally {
    cleanupTempState(); // always runs — success, exception, or even a return above
}
\`\`\`

\`finally\` runs no matter what (barring \`System.exit\` or a JVM crash), which makes it the classic place for cleanup — but resource cleanup is better handled with **try-with-resources**.

## try-with-resources

Any class implementing \`AutoCloseable\` can be declared in the \`try(...)\` parentheses; its \`close()\` is called automatically, even if an exception is thrown, in reverse order of declaration.

\`\`\`java
try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
    return reader.readLine();
} // reader.close() is guaranteed here — no explicit finally block needed
\`\`\`

This eliminates the classic bug of forgetting to close a stream/connection on the exception path.

## Custom Exceptions

\`\`\`java
public class InsufficientFundsException extends RuntimeException {
    private final BigDecimal shortfall;

    public InsufficientFundsException(BigDecimal shortfall) {
        super("Short by " + shortfall);
        this.shortfall = shortfall;
    }

    public BigDecimal getShortfall() { return shortfall; }
}
\`\`\`

Custom exceptions should carry enough context (fields, not just a message string) for the catcher to actually do something useful.

## Best Practices

- **Catch specific types, not \`Exception\` or \`Throwable\`** — a blanket catch hides bugs you didn't intend to swallow.
- **Never swallow silently** — an empty \`catch {}\` block is one of the most dangerous patterns in production code; at minimum, log it.
- **Fail fast** — validate inputs early and throw immediately rather than letting bad state propagate and surface as a confusing error three layers later.
- **Preserve the cause** when wrapping: \`throw new ServiceException("...", e)\` — losing the original stack trace makes debugging production incidents much harder.
- **Don't use exceptions for normal control flow** (e.g., throwing to break out of a loop) — they're comparatively expensive and hurt readability.

## Cross-Language Notes

- **Python**: no checked/unchecked distinction — all exceptions are effectively unchecked. \`with\` statements (context managers) are Python's equivalent of try-with-resources.
- **Go**: has no exceptions at all for ordinary error handling — functions return an explicit \`error\` value that callers must check; \`panic\`/\`recover\` exists but is reserved for truly exceptional, unrecoverable situations.
- **JavaScript**: like Python, all exceptions are unchecked; \`try/catch/finally\` works the same way, and Promises have their own parallel error channel (\`.catch()\` / rejected promises).
	`
	},

	Generics: {
		definition:
			'A language feature that lets classes, interfaces, and methods be parameterized by type, giving compile-time type safety and eliminating manual casting.',
		useCase:
			'Writing a single Repository<T> class that works safely for User, Order, and Product entities without duplicating code or casting Object everywhere.',
		detailedMarkdown: `
# Generics

Before generics, Java collections stored plain \`Object\`, meaning you had to cast on every read and the compiler couldn't stop you putting the wrong type in. Generics fix that at compile time.

## A Generic Class

\`\`\`java
public class Box<T> {
    private T content;

    public void set(T content) { this.content = content; }
    public T get() { return content; }
}

Box<String> box = new Box<>();
box.set("hello");
String s = box.get(); // no cast needed — the compiler already knows it's a String

// box.set(42); // compile-time error — caught before it ever ships
\`\`\`

\`T\` is a **type parameter** — a placeholder filled in with a concrete type (\`String\`, \`Integer\`, \`User\`, ...) when the class is used. The same idea applies to generic methods and interfaces (\`List<T>\`, \`Map<K, V>\`).

## Bounded Type Parameters

Sometimes you need the type to support specific behavior, not just "any type." **Bounds** restrict \`T\` to types that extend a class or implement an interface:

\`\`\`java
public static <T extends Comparable<T>> T max(List<T> items) {
    T best = items.get(0);
    for (T item : items) {
        if (item.compareTo(best) > 0) {
            best = item;
        }
    }
    return best;
}
\`\`\`

Here \`T extends Comparable<T>\` guarantees you can call \`compareTo\` on it — without the bound, the compiler wouldn't let you call any method beyond what \`Object\` provides.

## Wildcards (PECS)

\`? extends T\` (upper bound, read-only "producer") and \`? super T\` (lower bound, write-only "consumer") let generic method signatures be more flexible about what they accept. The mnemonic is **PECS — Producer Extends, Consumer Super**:

\`\`\`java
void copy(List<? extends Number> source, List<? super Number> destination) {
    for (Number n : source) {   // safe to read as Number
        destination.add(n);     // safe to write a Number
    }
}
\`\`\`

## Type Erasure

This is the interview curveball: **Java generics are a compile-time-only feature.** The compiler checks your types, then **erases** them — \`Box<String>\` and \`Box<Integer>\` both compile down to the same \`Box\` bytecode using \`Object\` (or the bound type) internally, with casts inserted automatically where needed.

Consequences of erasure worth knowing:
- You **can't** do \`new T[10]\` (generic array creation) because the JVM doesn't know what \`T\` is at runtime.
- You **can't** overload two methods that only differ by generic type, e.g. \`void foo(List<String>)\` and \`void foo(List<Integer>)\` — they erase to the same signature.
- \`list instanceof List<String>\` doesn't compile — at runtime it's just a \`List\`.

Erasure exists for **backward compatibility**: pre-generics (Java 1.4 and earlier) bytecode and libraries had to keep working after generics were introduced in Java 5.

## Cross-Language Notes

- **C++ templates** are a true generics mechanism via **monomorphization** — the compiler generates a separate concrete version of the code for each type used, so there's no erasure and no runtime casting, at the cost of larger binaries.
- **Go** added generics in version 1.18, closer in spirit to Java's (type parameters checked at compile time, implemented via a mix of dictionaries/stenciling — no manual casting needed either way).
- **Python / JavaScript**: dynamically typed, so there's no compile-time need for generics. Python's \`typing\` module (\`Generic\`, \`TypeVar\`) adds *optional, unenforced* type hints checked only by external tools like mypy — nothing happens at runtime if you violate them.
	`
	},

	'Streams / Iterators': {
		definition:
			'The Iterator pattern exposes sequential access to elements without revealing the underlying collection; the Streams API builds on top of it to express data-processing pipelines (filter, transform, aggregate) declaratively and lazily.',
		useCase:
			'Filtering ten thousand orders down to the "shipped" ones and summing their totals in one readable pipeline instead of a nested loop with manual accumulator variables.',
		detailedMarkdown: `
# Streams / Iterators

## The Iterator Pattern

An **Iterator** decouples "how do I walk through this collection" from "what is the collection actually made of" — a \`LinkedList\`, an \`ArrayList\`, and a \`TreeSet\` can all be traversed the same way.

\`\`\`java
public interface Iterator<E> {
    boolean hasNext();
    E next();
    default void remove() { throw new UnsupportedOperationException(); }
}
\`\`\`

Any class implementing \`Iterable<E>\` (which requires \`iterator()\`) can be used in a for-each loop:

\`\`\`java
for (String name : names) { ... }
// desugars to:
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
}
\`\`\`

Java's built-in iterators are **fail-fast**: if you structurally modify a collection (add/remove) while iterating over it directly, you get a \`ConcurrentModificationException\` rather than silently corrupted results. Use \`Iterator.remove()\` or a \`ListIterator\` if you need to mutate while traversing.

## The Streams API

Introduced in Java 8, **Streams** turn "loop and accumulate" code into a declarative pipeline of three parts:

1. **Source** — a collection, array, or generator (\`list.stream()\`).
2. **Intermediate operations** — \`filter\`, \`map\`, \`sorted\`, \`distinct\` — each returns a new stream, so they chain.
3. **Terminal operation** — \`collect\`, \`reduce\`, \`forEach\`, \`count\` — triggers actual execution and produces a result (or side effect).

\`\`\`java
double shippedRevenue = orders.stream()
    .filter(o -> o.getStatus() == Status.SHIPPED)
    .map(Order::getTotal)
    .reduce(0.0, Double::sum);

List<String> topCustomerNames = orders.stream()
    .filter(o -> o.getTotal() > 1000)
    .map(Order::getCustomerName)
    .distinct()
    .sorted()
    .collect(Collectors.toList());
\`\`\`

## Laziness

Intermediate operations are **lazy** — nothing runs until a terminal operation is invoked. Building a pipeline of \`filter().map().sorted()\` does no work by itself; it just describes the computation. This lets the stream fuse operations and, for something like \`findFirst()\`, stop early after processing only as many elements as necessary instead of transforming the entire source upfront.

\`\`\`java
Optional<String> firstMatch = names.stream()
    .peek(n -> System.out.println("checking " + n)) // for demonstration only
    .filter(n -> n.startsWith("A"))
    .findFirst();
// "checking" only prints for elements up to and including the first match —
// the rest of the list is never touched.
\`\`\`

## Streams Are Not Iterators

A stream can only be consumed **once** — calling a terminal operation twice on the same stream throws \`IllegalStateException\`. It also doesn't store data itself; it's a view over a source with a pipeline of operations attached. \`parallelStream()\` can split that pipeline across multiple threads for CPU-bound work on large datasets, but adds coordination overhead that only pays off above a certain data size.

## Cross-Language Notes

- **Python**: generators (\`yield\`) and the \`iter\`/\`next\` protocol are the direct equivalent of Java's Iterator; list/generator comprehensions and \`itertools\`/\`functools.reduce\` cover much of what Streams do, with generator expressions being naturally lazy.
- **JavaScript**: iterables implement \`Symbol.iterator\`; generator functions (\`function*\`) mirror Java's lazy iterator style, while \`Array.prototype.map/filter/reduce\` provide the eager, chainable-pipeline feel of Streams (though arrays are eagerly evaluated at each step, unlike Java's fused lazy pipeline).
- **C# LINQ** is the closest sibling to Java Streams — same filter/map/reduce vocabulary (\`Where\`, \`Select\`, \`Aggregate\`), also lazily evaluated via deferred execution.
	`
	},

	Reflection: {
		definition:
			"A runtime API that lets a program inspect and modify its own classes, methods, fields, and annotations, even ones it didn't know about at compile time.",
		useCase:
			'A framework like Spring scanning your classes for @Autowired fields and @Component annotations to wire up dependencies automatically, without you writing manual factory code.',
		detailedMarkdown: `
# Reflection

**Reflection** turns the type information the compiler normally uses and discards into something your program can query and act on *while it's running*. It's how frameworks can work with classes they've never seen before you wrote them.

## Basic Reflection API

\`\`\`java
Class<?> clazz = Class.forName("com.example.User");
// or: User.class, or: someInstance.getClass()

for (Method method : clazz.getDeclaredMethods()) {
    System.out.println(method.getName());
}

Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true); // bypass 'private'
Object value = nameField.get(userInstance);

Constructor<?> ctor = clazz.getConstructor(String.class);
Object newUser = ctor.newInstance("Amy");

Method setName = clazz.getMethod("setName", String.class);
setName.invoke(userInstance, "Bea"); // calls user.setName("Bea") dynamically
\`\`\`

## Reading Annotations at Runtime

Annotations are metadata that reflection can retrieve and act on:

\`\`\`java
if (method.isAnnotationPresent(Deprecated.class)) {
    log.warn("Calling deprecated method: " + method.getName());
}

// Framework-style: find every field annotated @Autowired and inject a bean
for (Field field : clazz.getDeclaredFields()) {
    if (field.isAnnotationPresent(Autowired.class)) {
        field.setAccessible(true);
        field.set(target, resolveBean(field.getType()));
    }
}
\`\`\`

This is essentially what Spring's dependency injection, Jackson's JSON (de)serialization, and JUnit's test discovery all do under the hood: scan classes, read annotations/field names, and wire things together dynamically.

## Real-World Uses

- **Dependency injection frameworks** (Spring, Guice) — instantiate and wire beans without you writing \`new\` anywhere.
- **JSON/XML serializers** (Jackson, Gson) — read/write object fields generically instead of needing hand-written mapping code per class.
- **Testing frameworks** (JUnit) — discover \`@Test\`-annotated methods and invoke them.
- **ORMs** (Hibernate) — map database columns to entity fields.

## Caveats

- **Performance**: reflective calls bypass a lot of the JIT's usual optimization and inlining, and involve extra security/type checks — noticeably slower than direct calls in a hot loop. Frameworks mitigate this by caching \`Method\`/\`Field\` lookups rather than re-resolving them on every call.
- **Breaks encapsulation**: \`setAccessible(true)\` can reach into \`private\` fields, defeating the whole point of access modifiers — powerful, but easy to misuse.
- **No compile-time safety**: typos in a string field/method name, or a mismatched argument type, blow up at runtime instead of being caught by the compiler.
- **Tooling friction**: IDEs, refactoring tools, and static analyzers can't "see" reflective calls, so renaming a field reflection depends on (by string) silently breaks it.
- **Module system restrictions**: since Java 9's module system, the JDK's own internals are strongly encapsulated, so reflecting into \`java.*\` internals now requires explicit \`--add-opens\` flags — a deliberate trade-off against reflection's power.

## Cross-Language Notes

- **Python and JavaScript** are reflective *by default* — \`getattr\`/\`setattr\`/\`dir()\` in Python, or simply indexing into an object's properties in JS, are ordinary, cheap operations because both languages are already dynamically typed. Reflection in Java/C# feels heavier and more special-cased precisely because it's bolted onto an otherwise statically-typed, compiled system.
	`
	},

	'Multithreading APIs': {
		definition:
			'The layered set of language and library constructs — from raw Threads up to high-level executors and futures — for creating and coordinating concurrent work.',
		useCase:
			'Deciding whether to spin up a raw Thread, submit tasks to an ExecutorService pool, or chain CompletableFutures when building a service that must call three downstream APIs in parallel and combine their results.',
		detailedMarkdown: `
# Multithreading APIs

This topic is the map, not the territory: it's a decision guide for *which API to reach for*. For the deep mechanics of mutexes, semaphores, producer-consumer, and thread pool internals, see the dedicated **Concurrency** section — those building blocks are what the APIs below are built on top of.

## The Layers

\`\`\`text
Low-level     Thread, Runnable, Callable            — raw threads, manual lifecycle
Coordination  synchronized, wait/notify, volatile   — intrinsic locks & visibility
Mid-level     java.util.concurrent (JSR-166, Java 5) — ExecutorService, Future, locks
Collections   ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue
High-level    CompletableFuture                     — composable async pipelines
\`\`\`

## 1. Thread / Runnable — the raw layer

\`\`\`java
Thread t = new Thread(() -> System.out.println("running"));
t.start(); // NOT t.run() — that would just call it on the current thread
t.join();  // wait for it to finish
\`\`\`

Creating threads directly is expensive (each OS thread costs real memory and context-switch overhead) and leaves you managing lifecycle, pooling, and error handling by hand. **Avoid this in production application code** — it's mostly useful for learning the primitives or truly one-off, low-level needs.

## 2. synchronized / volatile — coordination primitives

\`synchronized\` gives you a mutual-exclusion lock plus visibility guarantees; \`volatile\` gives visibility alone, for a single field, without locking. These are the raw tools; see Concurrency for \`wait\`/\`notify\`, race conditions, and reader-writer patterns built from them.

## 3. ExecutorService — the workhorse

Instead of managing threads yourself, submit tasks to a pool and let it handle thread reuse, queuing, and scheduling:

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(4);
Future<Integer> future = pool.submit(() -> computeExpensiveResult());
Integer result = future.get(); // blocks until done
pool.shutdown();
\`\`\`

This is the default choice for "I have a bunch of independent tasks and want them run concurrently, bounded by a sensible number of threads." See Concurrency for Thread Pool internals (core/max size, queueing policy) and Futures (blocking \`get()\` vs. callbacks).

## 4. Concurrent Collections

Plain \`HashMap\`/\`ArrayList\` are not thread-safe; wrapping them with \`Collections.synchronizedMap(...)\` works but serializes every access behind one lock. Prefer purpose-built concurrent structures:

- \`ConcurrentHashMap\` — lock-striped map, safe for concurrent reads/writes without blocking the whole map.
- \`CopyOnWriteArrayList\` — safe for read-heavy, write-rare lists (e.g., a list of event listeners).
- \`BlockingQueue\` (\`ArrayBlockingQueue\`, \`LinkedBlockingQueue\`) — the natural fit for producer-consumer pipelines (see Concurrency).

## 5. CompletableFuture — composable async

When you need to combine multiple async results (your parallel-downstream-calls scenario), raw \`Future.get()\` is too blocking and rigid. \`CompletableFuture\` lets you chain and combine without blocking each step:

\`\`\`java
CompletableFuture<User> userF = CompletableFuture.supplyAsync(() -> fetchUser(id));
CompletableFuture<List<Order>> ordersF = CompletableFuture.supplyAsync(() -> fetchOrders(id));

CompletableFuture<Profile> profileF = userF.thenCombine(ordersF, Profile::new);
profileF.thenAccept(profile -> render(profile));
\`\`\`

## Decision Guide

| I need to... | Reach for |
|---|---|
| Run one background task, fire-and-forget | \`ExecutorService.submit\` |
| Run many bounded tasks, control pool size | \`ExecutorService\` (fixed/cached pool) |
| Get a single result back, block until ready | \`Future.get()\` |
| Combine/chain multiple async results without blocking | \`CompletableFuture\` |
| Share a mutable map/list across threads | \`ConcurrentHashMap\` / \`CopyOnWriteArrayList\` |
| Hand off work between producer and consumer threads | \`BlockingQueue\` |
| Protect a small critical section | \`synchronized\` block or \`ReentrantLock\` |
| Limit concurrent access to N permits (e.g., a connection pool) | \`Semaphore\` (see Concurrency) |

## Cross-Language Notes

- **Python**: the Global Interpreter Lock (GIL) means OS threads don't give true parallelism for CPU-bound work — use \`multiprocessing\` for CPU-bound parallelism or \`asyncio\` for I/O-bound concurrency instead of expecting \`threading\` to speed up computation.
- **Go**: goroutines and channels are first-class, lightweight (not OS threads directly), making the "spin up thousands of workers" pattern far cheaper than in Java.
- **JavaScript**: single-threaded event loop with \`async\`/\`await\` and Promises for concurrency (not parallelism) in the browser/Node's main thread; actual parallel CPU work needs Web Workers or Node's \`worker_threads\`.
	`
	},

	'Garbage Collection': {
		definition:
			'The automatic process by which a language runtime reclaims memory occupied by objects that are no longer reachable, so developers do not manually allocate and free memory.',
		useCase:
			"Explaining why a long-running Java service occasionally pauses for a few milliseconds under load — that's a GC cycle reclaiming dead objects, and the choice of collector (G1 vs. ZGC) determines how noticeable those pauses are.",
		detailedMarkdown: `
# Garbage Collection

**Garbage Collection (GC)** frees the developer from manually tracking every allocation — the runtime periodically finds objects nothing references anymore and reclaims their memory.

## Reachability

An object is **reachable** if it can be reached by following references starting from a set of **GC roots** — local variables on any thread's stack, active static fields, and JNI references. Anything unreachable from every root is garbage, regardless of how many objects reference *each other* in an isolated island — mutual references alone don't keep something alive.

## The Generational Hypothesis

Empirically, **most objects die young** — short-lived temporaries, loop variables, request-scoped objects. The JVM heap exploits this by splitting into generations:

\`\`\`text
Young Generation                    Old Generation (Tenured)
┌─────────┬────────┬────────┐       ┌───────────────────────┐
│  Eden   │  S0    │  S1    │  -->  │   long-lived objects   │
└─────────┴────────┴────────┘       └───────────────────────┘
   new objects   survivor spaces         promoted after
   allocated here (ping-pong copy)       surviving N minor GCs
\`\`\`

- **Minor GC**: cleans the young generation. Frequent, fast, because most objects there are already dead.
- Objects that survive several minor GCs get **promoted** to the old generation.
- **Major/Full GC**: cleans the old generation. Rarer but much more expensive, since it usually scans a much larger portion of the heap.

## Core Algorithms

- **Mark-and-sweep**: starting from GC roots, *mark* every reachable object; then *sweep* — reclaim memory for everything unmarked. Simple, but can leave the heap fragmented (free memory scattered in small gaps).
- **Mark-compact**: like mark-and-sweep, but after marking, surviving objects are *compacted* — moved together to eliminate fragmentation, leaving one contiguous free block. Costs more CPU time per cycle in exchange for better memory layout and faster subsequent allocation.

## Stop-the-World Pauses

Many GC phases (especially the "mark" phase, historically) require every application thread to pause so the collector can walk the object graph without it changing underneath it — a **stop-the-world (STW)** pause. For a latency-sensitive service, GC pause time is often a bigger concern than total throughput, which is exactly what modern collectors optimize for.

## Modern Low-Pause Collectors

- **G1 (Garbage-First)**: the default collector since Java 9. Divides the heap into many small, equally-sized regions instead of one contiguous young/old block, and prioritizes collecting the regions with the most garbage first. It lets you set a target max pause time and does incremental work to stay close to it, rather than guaranteeing a fixed pause length.
- **ZGC**: a concurrent, region-based collector designed for very large heaps (multi-GB to multi-TB) with sub-millisecond pause targets, doing almost all of its marking and compaction work concurrently with the running application rather than stopping it.
- **Shenandoah**: a similar concurrent, low-pause collector (from Red Hat) with the same goal of decoupling pause time from heap size.

The general industry trend across all of these: shrink stop-the-world pauses by doing more work concurrently with the running application, at the cost of some extra CPU overhead.

## Contrast With Other Memory Strategies

| Strategy | Used by | Trade-off |
|---|---|---|
| Manual allocation | C, C++ (\`malloc\`/\`free\`, \`new\`/\`delete\`) | Full control, zero GC pauses — but leaks, dangling pointers, and double-frees are entirely the developer's responsibility |
| Reference counting | Python (\`CPython\`), Swift | Objects freed the instant their refcount hits zero — deterministic and immediate, but can't collect reference *cycles* on its own (CPython layers a periodic cyclic GC on top just for that) and pays a small overhead on every reference assignment |
| Tracing GC (generational) | Java, C#/.NET, Go, JS engines (V8) | No manual bookkeeping and cycles are handled automatically, at the cost of unpredictable pause timing (mitigated, not eliminated, by modern collectors) |

## Cross-Language Notes

- **C#/.NET** uses a generational tracing collector conceptually very similar to the JVM's (Gen 0/1/2 instead of young/old).
- **JavaScript engines** like V8 also use generational mark-and-sweep/mark-compact strategies under the hood, even though JS developers rarely think about GC directly.
- **Python**'s combination of reference counting plus a periodic generational cycle-detector is a genuinely different model from Java's — worth mentioning explicitly if asked to compare, since "does the language use refcounting or tracing GC" is a real conceptual fork, not just an implementation detail.
	`
	}
};
