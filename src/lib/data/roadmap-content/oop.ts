import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Abstraction
  // - Inheritance
  // - Composition vs Inheritance
  // - Interface
  // - Abstract Class
  // - Dependency Injection
  // - IoC
  // - UML Basics
 */
export const OopContent: RoadmapDetailMap = {
	Abstraction: {
		definition:
			'Hiding complex implementation details behind a simple, well-defined interface so the consumer only needs to know *what* an object does, not *how* it does it.',
		useCase:
			'Driving a car using the steering wheel, pedals, and gearstick without needing to understand the internal combustion engine, fuel injection, or transmission mechanics underneath.',
		detailedMarkdown: `
# Abstraction

**Abstraction** is the practice of exposing only the essential features of an object while hiding the unnecessary implementation details from the outside world. It answers the question: "What does this thing do?" rather than "How does it do it?"

## Abstraction vs. Encapsulation
These two are frequently confused because they work together, but they solve different problems:

| | Abstraction | Encapsulation |
|---|---|---|
| **Focus** | Hides **complexity/implementation** | Hides **data/state** |
| **Goal** | Simplify what the user sees | Protect internal state from misuse |
| **Achieved via** | Interfaces, abstract classes | Access modifiers (\`private\`, \`protected\`) |
| **Question answered** | "What can this object do?" | "How is this object's data guarded?" |

In short: encapsulation is a *technique* (bundling + hiding fields), while abstraction is a *design goal* (presenting a simplified view). You often achieve abstraction *through* encapsulation.

## A Real-World Analogy
When you drive a car, you interact with a small, simple surface: steering wheel, accelerator, brake. You have no idea (and don't need to know) how the fuel-air mixture is ignited in the cylinders. The car manufacturer has abstracted away thousands of moving parts into three pedals and a wheel.

## Abstraction in Code
The classic example is the Java \`List\` interface. Client code depends on the abstraction, not the concrete implementation:

\`\`\`java
List<String> names = new ArrayList<>(); // could just as easily be a LinkedList
names.add("Alice");
names.add("Bob");

for (String name : names) {
    System.out.println(name);
}
\`\`\`

The calling code only knows about \`add()\` and iteration — it has no idea whether \`List\` is backed by a resizable array, a doubly linked list, or something more exotic. If the team later swaps \`ArrayList\` for \`LinkedList\` because insertions became the bottleneck, **not a single line of calling code needs to change.**

## Achieving Abstraction
1. **Abstract classes** — define a partial contract, leaving some methods unimplemented.
2. **Interfaces** — define a pure contract with zero implementation detail exposed.
3. **Access modifiers** — mark internal helper methods \`private\` so only the public API is visible.

\`\`\`java
public abstract class PaymentProcessor {
    // Public, abstracted entry point
    public final void process(double amount) {
        validate(amount);
        charge(amount);
        sendReceipt();
    }

    // Implementation details are hidden from the caller
    private void validate(double amount) { /* ... */ }
    protected abstract void charge(double amount);
    private void sendReceipt() { /* ... */ }
}
\`\`\`

A caller invoking \`process(49.99)\` never sees \`validate\`, \`charge\`, or \`sendReceipt\` individually — they get one simple abstracted operation.

## Why It Matters in Interviews
Interviewers love asking "What's the difference between abstraction and encapsulation?" because candidates often conflate them. The crisp answer: **encapsulation hides data, abstraction hides complexity.** A class can be encapsulated (private fields, public getters) without being well-abstracted (if the public API still leaks implementation concerns), and vice versa.

## Benefits
- **Reduced cognitive load:** Consumers of an API deal with a handful of methods instead of hundreds of internal details.
- **Decoupling:** Changing the internal implementation doesn't ripple out to every caller.
- **Maintainability:** Complexity is localized to one place instead of spread across the codebase.
	`
	},

	Inheritance: {
		definition:
			'A mechanism where a new class (subclass) acquires the fields and methods of an existing class (superclass), modeling an "is-a" relationship between them.',
		useCase:
			'Modeling a payroll system where `SalariedEmployee` and `HourlyEmployee` both extend a common `Employee` base class, reusing shared fields like `name` and `id` while overriding `calculatePay()`.',
		detailedMarkdown: `
# Inheritance

**Inheritance** lets one class (the *subclass* or *child*) derive from another (the *superclass* or *parent*), automatically gaining its fields and methods. It models an **"is-a"** relationship: a \`Dog\` **is a** kind of \`Animal\`; a \`SalariedEmployee\` **is an** \`Employee\`.

## Why Use It?
1. **Code Reuse:** Common behavior lives once, in the parent class.
2. **Polymorphism enabler:** A collection of \`Animal\` references can hold \`Dog\`, \`Cat\`, or \`Bird\` objects, and calling \`speak()\` invokes the correct overridden version at runtime.
3. **Logical hierarchy:** Real-world taxonomies (vehicles, shapes, employees) often naturally fit a tree structure.

## Code Example (Java)
\`\`\`java
public class Employee {
    protected String name;
    protected double baseSalary;

    public Employee(String name, double baseSalary) {
        this.name = name;
        this.baseSalary = baseSalary;
    }

    public double calculatePay() {
        return baseSalary;
    }
}

public class SalariedEmployee extends Employee {
    public SalariedEmployee(String name, double baseSalary) {
        super(name, baseSalary); // calls the parent constructor
    }

    @Override
    public double calculatePay() {
        return baseSalary; // straightforward monthly salary
    }
}

public class CommissionedEmployee extends Employee {
    private double commission;

    public CommissionedEmployee(String name, double baseSalary, double commission) {
        super(name, baseSalary);
        this.commission = commission;
    }

    @Override
    public double calculatePay() {
        return super.calculatePay() + commission; // base + extra
    }
}
\`\`\`

Both subclasses reuse the \`name\` and \`baseSalary\` fields and the constructor logic defined once in \`Employee\`. Each overrides \`calculatePay()\` to specialize its own behavior.

## Types of Inheritance
- **Single:** One subclass, one superclass (supported directly by Java, C#).
- **Multilevel:** \`C extends B\`, \`B extends A\` — a chain of inheritance.
- **Hierarchical:** Multiple subclasses share one superclass (as in the example above).
- **Multiple:** A class inherits from more than one class at once. Most modern OOP languages (Java, C#) **disallow multiple class inheritance** to avoid ambiguity, but they allow implementing multiple *interfaces* instead.

## The Downside: The Fragile Base Class Problem
Inheritance creates **tight coupling** between parent and child. If a change is made to the base class — even something that seems safe, like adding a new method or tweaking a method's internal logic — it can silently break every subclass that depends on the old behavior. This is known as the **fragile base class problem**.

Classic symptoms:
- A subclass overrides a method assuming certain invariants held by the base class, and a base class change violates those invariants.
- Deep inheritance chains (5+ levels) become nearly impossible to reason about — a bug fix three levels up can have unpredictable ripple effects.
- Subclasses are forced to inherit *everything* from the parent, even fields/methods they don't need, violating the Interface Segregation Principle.

This fragility is the core motivation behind the design guideline **"favor composition over inheritance"** (see the next topic), and behind the Liskov Substitution Principle from SOLID, which demands that subclasses remain behaviorally substitutable for their parent.

## Rule of Thumb
Use inheritance only when there is a genuine, stable **is-a** relationship and you expect the subclass to be usable anywhere the superclass is expected (Liskov Substitution). If you're inheriting purely to reuse a chunk of code, composition is usually the safer choice.
	`
	},

	'Composition vs Inheritance': {
		definition:
			'Composition builds complex objects by combining ("has-a") simpler objects, while inheritance builds them by extending ("is-a") a base class — composition is generally the more flexible and safer choice.',
		useCase:
			'Giving a `Car` object an `Engine` and `Wheels` object (composition), instead of inheriting behavior from an `Engine` class through a rigid class hierarchy.',
		detailedMarkdown: `
# Composition vs. Inheritance

Both **composition** and **inheritance** let you reuse code across classes, but they do it in fundamentally different ways:

- **Inheritance** models an **"is-a"** relationship: \`Duck extends Bird\`.
- **Composition** models a **"has-a"** relationship: \`Car\` has an \`Engine\`.

## The Classic Problem With Inheritance
Imagine modeling birds:

\`\`\`java
public class Bird {
    public void fly() {
        System.out.println("Flying...");
    }
}

public class Duck extends Bird { }   // fine, ducks fly
public class Penguin extends Bird { } // uh oh, penguins can't fly!
\`\`\`

\`Penguin\` is now forced to inherit \`fly()\` even though penguins can't fly. You'd have to override it to throw an exception or do nothing — a violation of the **Liskov Substitution Principle**, since a \`Penguin\` is no longer safely substitutable wherever a \`Bird\` is expected.

## Refactoring to Composition
Instead of inheriting flight behavior, **inject** it as a separate, swappable behavior object:

\`\`\`java
public interface FlightBehavior {
    void fly();
}

public class FlyingBehavior implements FlightBehavior {
    public void fly() { System.out.println("Flying high!"); }
}

public class NoFlightBehavior implements FlightBehavior {
    public void fly() { System.out.println("I can't fly, but I can swim!"); }
}

public class Bird {
    private final FlightBehavior flightBehavior; // Bird HAS-A FlightBehavior

    public Bird(FlightBehavior flightBehavior) {
        this.flightBehavior = flightBehavior;
    }

    public void performFlight() {
        flightBehavior.fly();
    }
}

Bird duck = new Bird(new FlyingBehavior());
Bird penguin = new Bird(new NoFlightBehavior());
\`\`\`

Now each \`Bird\` is *composed* with whatever flight behavior fits it, at construction time — no forced inheritance, no broken contracts, and behaviors can even be swapped at runtime.

## Comparison Table

| | Inheritance | Composition |
|---|---|---|
| **Relationship** | "is-a" | "has-a" |
| **Coupling** | Tight — subclass depends on parent internals | Loose — depends only on an interface/contract |
| **Flexibility** | Fixed at compile time (class hierarchy) | Can change behavior at runtime by swapping components |
| **Reuse granularity** | Reuses an entire class, warts and all | Reuses only the specific behavior you need |
| **Risk** | Fragile base class problem; deep hierarchies get brittle | Slightly more boilerplate (delegation code) |
| **Testability** | Harder — must instantiate/extend real base classes | Easier — inject mocks/fakes for the composed parts |

## "Favor Composition Over Inheritance"
This is one of the most-cited principles in OOP design (popularized by the *Gang of Four* Design Patterns book). It doesn't mean "never use inheritance" — it means:

1. Default to composition when you just want to **reuse** functionality.
2. Reserve inheritance for genuine **is-a** hierarchies where subclasses must remain substitutable for the parent (Liskov Substitution).
3. Prefer depending on small **interfaces** (what an object *does*) over concrete **base classes** (what an object *is*).

## Interview Tip
If asked "when would you use inheritance over composition?", a strong answer is: when the relationship is stable, truly hierarchical, and you need polymorphic substitution — e.g., \`Circle\`/\`Square\` both being a \`Shape\` with a shared \`area()\` contract. If the relationship is really about *combining capabilities* (a car has an engine, a game character has a weapon), composition wins almost every time.
	`
	},

	Interface: {
		definition:
			'A contract that declares a set of method signatures without (traditionally) providing an implementation, which any implementing class must fulfill.',
		useCase:
			'Defining a `Payable` interface with a `pay(double amount)` method so that unrelated classes — `Invoice`, `Employee`, `Vendor` — can all be paid through the same uniform API.',
		detailedMarkdown: `
# Interface

An **interface** defines a contract: a set of method signatures that any implementing class must provide, without dictating *how* those methods are implemented. It is pure abstraction — it describes **what** an object can do, never **how**.

## Basic Example (Java)
\`\`\`java
public interface Payable {
    void pay(double amount);
}

public class Invoice implements Payable {
    public void pay(double amount) {
        System.out.println("Invoice paid: $" + amount);
    }
}

public class Employee implements Payable {
    public void pay(double amount) {
        System.out.println("Salary deposited: $" + amount);
    }
}
\`\`\`

\`Invoice\` and \`Employee\` have nothing in common in a class hierarchy sense, but because both implement \`Payable\`, a payroll processor can treat them uniformly:

\`\`\`java
List<Payable> payables = List.of(new Invoice(), new Employee());
for (Payable p : payables) {
    p.pay(100.0); // each implementation does its own thing
}
\`\`\`

## Multiple Interface Implementation
Unlike class inheritance, a class **can implement multiple interfaces**, because interfaces carry no state and (traditionally) no implementation — so there's no ambiguity about which "version" of a field or method to inherit:

\`\`\`java
public interface Flyable {
    void fly();
}

public interface Swimmable {
    void swim();
}

public class Duck implements Flyable, Swimmable {
    public void fly() { System.out.println("Duck flying"); }
    public void swim() { System.out.println("Duck swimming"); }
}
\`\`\`

This is exactly how Java sidesteps the "diamond problem" that blocks multiple *class* inheritance.

## Default Methods (Modern Java 8+)
Modern interfaces can include **default methods** — a method with a body that implementing classes inherit automatically unless they choose to override it:

\`\`\`java
public interface Vehicle {
    void drive();

    default void honk() {
        System.out.println("Beep beep!"); // shared default implementation
    }
}
\`\`\`

This blurred the once-strict line between interfaces and abstract classes, but the core distinction still holds: interfaces describe capabilities and cannot hold instance state (no instance fields), whereas abstract classes can.

## Key Characteristics
- All methods are implicitly \`public\` (in Java, prior to default/static methods, all were implicitly abstract too).
- No instance fields (only \`public static final\` constants).
- A class can implement **any number** of interfaces.
- Interfaces can extend other interfaces.
- Cannot be instantiated directly (\`new Payable()\` is illegal).

## Why It Matters
Interfaces are the backbone of **loose coupling** and the **Dependency Inversion Principle** — code should depend on abstractions (interfaces), not concrete implementations. This is also what makes mocking possible in unit tests: you can substitute a real \`PaymentGateway\` implementation with a \`FakePaymentGateway\` in tests because both honor the same interface contract.
	`
	},

	'Abstract Class': {
		definition:
			'A class that cannot be instantiated on its own and may mix fully-implemented methods with abstract (unimplemented) methods that subclasses are forced to complete.',
		useCase:
			'A `Shape` abstract class that implements a shared `describe()` method but leaves `area()` abstract, so every concrete shape (`Circle`, `Rectangle`) must supply its own area formula.',
		detailedMarkdown: `
# Abstract Class

An **abstract class** sits between a concrete class and an interface. It can provide **real, shared implementation** for some methods, while leaving others **abstract** — declared but unimplemented — forcing every subclass to fill them in. Like interfaces, abstract classes cannot be instantiated directly.

## Code Example (Java)
\`\`\`java
public abstract class Shape {
    protected String color;

    public Shape(String color) {
        this.color = color;
    }

    // Concrete method — shared by every subclass
    public void describe() {
        System.out.println("This is a " + color + " shape with area " + area());
    }

    // Abstract method — every subclass MUST implement this
    public abstract double area();
}

public class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

public class Rectangle extends Shape {
    private double width, height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() {
        return width * height;
    }
}
\`\`\`

\`describe()\` is written **once** in \`Shape\` and reused by every subclass, while \`area()\` is customized per shape. \`new Shape("red")\` would be a compile error — only concrete subclasses can be instantiated.

## Interface vs. Abstract Class

| | Interface | Abstract Class |
|---|---|---|
| **Purpose** | Define a pure contract/capability | Provide a partial, shared implementation |
| **State (fields)** | No instance fields | Can have instance fields and constructors |
| **Method bodies** | Traditionally none (default methods possible in modern Java) | Mix of concrete and abstract methods |
| **Inheritance** | A class can implement **many** interfaces | A class can extend only **one** abstract class |
| **Relationship modeled** | "can-do" (capability) | "is-a" (identity, shared lineage) |
| **When to use** | Unrelated classes need a common capability (e.g., \`Comparable\`, \`Serializable\`) | Related classes share common code/state and a natural hierarchy (e.g., \`Shape\`, \`Employee\`) |

## When to Use Which
- Reach for an **interface** when you're describing *what something can do*, especially across unrelated classes (a \`Duck\` and an \`Airplane\` can both be \`Flyable\` despite having nothing else in common).
- Reach for an **abstract class** when you're describing *what something fundamentally is*, and subclasses share meaningful state or behavior worth writing once (a \`Circle\` and \`Rectangle\` are both fundamentally \`Shape\`s with color and a \`describe()\` routine).
- A common, robust pattern in real codebases: define the **capability** as an interface, then provide an **abstract class** that implements the boilerplate parts of that interface, letting concrete classes extend the abstract class and only fill in the specialized bits (this is the classic **Template Method** design pattern).

## Interview Tip
A strong answer to "why not just use interfaces for everything?" is: interfaces can't hold shared state or default constructor logic (pre-Java 8 style), so if ten subclasses need identical field initialization and helper logic, an abstract class avoids duplicating that code ten times.
	`
	},

	'Dependency Injection': {
		definition:
			"A design technique where an object's dependencies are supplied ('injected') from the outside — typically via its constructor — rather than the object creating them itself.",
		useCase:
			'Passing a `PaymentGateway` implementation into an `OrderService` constructor so that production code injects `StripeGateway` while unit tests inject a `FakeGateway`, with zero changes to `OrderService`.',
		detailedMarkdown: `
# Dependency Injection (DI)

**Dependency Injection** is a pattern where a class receives the objects it depends on from an external source, instead of constructing them internally. It is the most common practical technique for achieving the **Dependency Inversion Principle** (the "D" in SOLID).

## The Problem: Tight Coupling
\`\`\`java
public class OrderService {
    private StripeGateway gateway = new StripeGateway(); // hard-coded dependency

    public void checkout(double amount) {
        gateway.charge(amount);
    }
}
\`\`\`

This looks harmless, but it's rigid:
- \`OrderService\` is permanently glued to \`StripeGateway\`. Switching to PayPal means editing \`OrderService\`'s source code.
- You **cannot unit test** \`OrderService\` in isolation — every test hits the real Stripe API (slow, costs money, requires network access).

## The Fix: Constructor Injection
\`\`\`java
public interface PaymentGateway {
    void charge(double amount);
}

public class StripeGateway implements PaymentGateway {
    public void charge(double amount) { /* real Stripe API call */ }
}

public class OrderService {
    private final PaymentGateway gateway;

    // Dependency is INJECTED via the constructor
    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    public void checkout(double amount) {
        gateway.charge(amount);
    }
}

// Production code:
OrderService service = new OrderService(new StripeGateway());

// Test code:
OrderService testService = new OrderService(new FakeGateway());
\`\`\`

\`OrderService\` now depends only on the \`PaymentGateway\` **abstraction**, not any concrete implementation. It has no idea (and doesn't care) whether it's talking to Stripe, PayPal, or a test double.

## Types of Dependency Injection
1. **Constructor Injection** (preferred) — dependencies passed via the constructor; the object is always in a valid, fully-initialized state, and dependencies can be marked \`final\`/immutable.
2. **Setter Injection** — dependencies assigned via setter methods after construction; useful for optional dependencies, but leaves a window where the object is only partially configured.
3. **Interface/Method Injection** — dependencies passed directly into the method that needs them, rather than stored as fields.

## Why It Matters
- **Decoupling:** High-level code depends on interfaces, not concrete classes — this *is* the Dependency Inversion Principle in action.
- **Testability:** You can inject mocks/fakes/stubs to test business logic in complete isolation from databases, networks, or third-party APIs.
- **Flexibility:** Swapping an implementation (e.g., Stripe → PayPal, or a real repository → an in-memory one) requires zero changes to the class that consumes it.
- **Single Responsibility:** A class doesn't need to know *how* to construct its collaborators, only how to use them.

## Manual DI vs. DI Frameworks
You can do DI by hand, as shown above ("poor man's DI") — just pass dependencies through constructors yourself. At scale, teams use **DI containers/frameworks** (Spring, Google Guice, .NET's built-in DI container) that automatically construct and wire the entire object graph based on configuration or annotations:

\`\`\`java
@Service
public class OrderService {
    private final PaymentGateway gateway;

    @Autowired // Spring injects the registered PaymentGateway implementation automatically
    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }
}
\`\`\`

This is where DI connects directly to the next topic: **Inversion of Control** — the framework, not your code, is now responsible for constructing and wiring objects together.
	`
	},

	IoC: {
		definition:
			'Inversion of Control (IoC) is a broader design principle where the control of program flow — object creation, lifecycle, and method invocation — is handed to a framework or container instead of being driven by your own code.',
		useCase:
			'Registering a `@Component`-annotated class with the Spring container and letting the framework decide when to instantiate it, inject its dependencies, and call its lifecycle methods, instead of your `main()` method doing all of that manually.',
		detailedMarkdown: `
# Inversion of Control (IoC)

**Inversion of Control** is the overarching design principle that flips who is "in charge" of an application's flow. In traditional procedural code, *your code* calls into libraries to get work done. Under IoC, that relationship reverses: a **framework or container** calls *your code* at the appropriate times.

## Dependency Injection Is *An Implementation* of IoC
It's easy to conflate DI and IoC, but they're not the same thing:

- **IoC** is the *principle*: "don't let your class control its own dependencies/flow — hand that control to something external."
- **DI** is *one concrete technique* for achieving IoC, specifically focused on how dependencies are supplied to an object.

Other implementations of IoC include the **Template Method** pattern, **event-driven architectures**, **plugin systems**, and **DI containers** like Spring.

## Traditional Control Flow (No IoC)
\`\`\`java
public class App {
    public static void main(String[] args) {
        PaymentGateway gateway = new StripeGateway();
        OrderService service = new OrderService(gateway);
        service.checkout(49.99);
        // YOUR code decides when everything is created and called
    }
}
\`\`\`
Here, *your* \`main()\` method drives everything: it decides what to construct, in what order, and when to invoke it.

## Inverted Control Flow (With a Framework/Container)
\`\`\`java
@Component
public class OrderService {
    private final PaymentGateway gateway;

    @Autowired
    public OrderService(PaymentGateway gateway) {
        this.gateway = gateway;
    }

    @PostConstruct
    public void init() {
        System.out.println("OrderService is ready!");
    }
}
\`\`\`
You never call \`new OrderService(...)\` yourself. The **Spring IoC container**:
1. Scans for \`@Component\`-annotated classes.
2. Figures out the dependency graph (\`OrderService\` needs a \`PaymentGateway\`).
3. Constructs everything in the right order.
4. Injects dependencies (Dependency Injection).
5. Calls lifecycle hooks like \`@PostConstruct\` for you.

Your code has become a set of *plug-in pieces* that the framework calls into — control has been **inverted**.

## Another Angle: Callbacks and Event Listeners
IoC also shows up outside of DI containers. Consider a GUI button:

\`\`\`java
button.addActionListener(event -> System.out.println("Clicked!"));
\`\`\`

You don't write the loop that polls for mouse clicks — the **GUI framework's event loop** owns that control flow and calls *your* lambda whenever a click happens. This is IoC in a different costume: the "Hollywood Principle" — **"Don't call us, we'll call you."**

## Why It Matters
- **Decoupling:** Business logic classes stop knowing about object construction, wiring, and orchestration — that becomes the framework's job.
- **Extensibility:** Plugging in new behavior (a new listener, a new bean) doesn't require modifying the control flow, just registering with the container/framework.
- **Testability:** Because IoC usually goes hand-in-hand with DI, swapping real implementations for test doubles becomes trivial.

## Interview Tip
If asked "what's the difference between DI and IoC?", the tight one-liner is: **IoC is the principle (who controls object creation/flow), DI is the mechanism (how dependencies get supplied).** DI is IoC applied specifically to dependency wiring; IoC as a whole covers dependency wiring *and* broader flow control (lifecycle hooks, event dispatch, template methods).
	`
	},

	'UML Basics': {
		definition:
			'Unified Modeling Language (UML) is a standardized visual notation for describing the structure and relationships of an object-oriented system, most commonly via class diagrams.',
		useCase:
			'Sketching a class diagram before coding a library management system, to agree with teammates on the classes, their fields/methods, and how `Book`, `Member`, and `Library` relate to each other.',
		detailedMarkdown: `
# UML Basics

**UML (Unified Modeling Language)** is a standardized set of diagram notations for visualizing the design of a software system. In interviews and system-design discussions, the most relevant piece is the **class diagram**, which shows classes, their members, and the relationships between them.

## The Class Box
A class in UML is drawn as a rectangle split into three compartments:

\`\`\`
+-------------------------+
|         Employee        |   <- class name
+-------------------------+
| - name: String          |   <- fields (attributes)
| - salary: double        |
+-------------------------+
| + getName(): String     |   <- methods (operations)
| + calculatePay(): double|
+-------------------------+
\`\`\`

### Visibility Symbols
| Symbol | Meaning |
|---|---|
| \`+\` | \`public\` |
| \`-\` | \`private\` |
| \`#\` | \`protected\` |
| \`~\` | package/default visibility |

Attributes are formatted as \`visibility name: Type\`, and methods as \`visibility name(params): ReturnType\`. \`static\` members are underlined, and \`abstract\` class/method names are written in *italics*.

## Relationship Arrows
This is the part interviewers actually probe, because it maps directly onto the OOP concepts you've already learned:

| Relationship | Notation | Meaning | OOP Concept |
|---|---|---|---|
| **Inheritance** (generalization) | Solid line, hollow triangle arrowhead pointing to parent: \`Dog ──▷ Animal\` | "is-a" | Inheritance |
| **Realization** (interface implementation) | Dashed line, hollow triangle arrowhead: \`Duck ┄┄▷ Flyable\` | "implements the contract of" | Interface |
| **Association** | Plain solid line: \`Teacher ── Student\` | Generic structural relationship — one class uses/knows about another | Object references |
| **Aggregation** | Solid line, hollow diamond at the "whole" end: \`Library ◇── Book\` | "has-a", but parts can outlive the whole (weak ownership) | Composition (loose) |
| **Composition** | Solid line, filled diamond at the "whole" end: \`House ♦── Room\` | "has-a" with strong ownership — parts die with the whole | Composition (strong) |
| **Dependency** | Dashed line, open arrowhead: \`OrderService ┄┄> PaymentGateway\` | "uses temporarily" — one class depends on another without owning it | Dependency Injection |

### Aggregation vs. Composition — the Lifecycle Test
This distinction trips people up, so use the **lifecycle test**: if the "part" object can exist independently of the "whole" and be reused elsewhere, it's **aggregation**. If the "part" is created and destroyed along with the "whole" and has no independent existence, it's **composition**.

- A \`Library\` has \`Book\`s (**aggregation**) — if the library closes down, the books still exist and can move to another library.
- A \`House\` has \`Room\`s (**composition**) — if the house is demolished, the rooms cease to exist; they were never meaningfully separate objects.

## A Small Worked Example
\`\`\`
        Shape (abstract)
          △
          |  (inheritance)
   ┌──────┴───────┐
 Circle        Rectangle

   Flyable (interface)
          △
          |  (realization, dashed)
        Duck

  Library ◇──────── Book   (aggregation: books outlive the library)
  Car     ♦──────── Engine (composition: engine dies with the car)
  OrderService ┄┄──> PaymentGateway (dependency: used, not owned)
\`\`\`

## Why This Matters for Interviews
Low-Level Design (LLD) interviews (e.g., "design a parking lot", "design a library system") almost always expect you to sketch — or at least verbally describe — a class diagram: the classes involved, their key fields/methods, and whether relationships are inheritance, composition, or association. Being fluent in this notation lets you communicate a design precisely in minutes instead of paragraphs of prose.
	`
	}
};
