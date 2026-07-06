import type { RoadmapDetailMap } from './types';

export const DesignPatternsCreationalContent: RoadmapDetailMap = {
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
	Factory: {
		definition:
			'A creational design pattern that defines a method for creating objects without specifying their exact class, letting subclasses (or a factory function) decide which concrete class to instantiate.',
		useCase:
			'A notification system that needs to send Email, SMS, or Push notifications depending on user preference, without the calling code knowing which concrete class it is dealing with.',
		detailedMarkdown: `
# Factory Pattern

The **Factory Method** pattern is a creational design pattern that provides an interface for creating objects, but lets the logic that decides *which* concrete class to instantiate live in one place instead of being scattered across the codebase.

## The Problem

Imagine you are building a notification system. It starts simple — you only send emails:

\`\`\`typescript
const notification = new EmailNotification();
notification.send('Welcome aboard!');
\`\`\`

Then product asks for SMS. Then push notifications. Soon, every place in your codebase that creates a notification looks like this:

\`\`\`typescript
let notification;
if (type === 'email') notification = new EmailNotification();
else if (type === 'sms') notification = new SmsNotification();
else if (type === 'push') notification = new PushNotification();
\`\`\`

This \`if/else\` block gets copy-pasted into every controller, cron job, and test that needs to create a notification. When a fourth channel (say, Slack) is added, you have to hunt down and edit every one of those copies — a clear violation of the **Open/Closed Principle**. The client code is also tightly **coupled** to concrete classes (\`EmailNotification\`, \`SmsNotification\`, ...), which makes it hard to swap implementations or mock them in tests.

## The Solution

The Factory pattern moves the "which class do I create?" decision into a single, dedicated place — a **factory** — and returns objects through a common interface. The client code only ever talks to the interface; it never sees the concrete class.

## Code Example (TypeScript)

\`\`\`typescript
// 1. Common interface all products implement
interface Notification {
    send(message: string): void;
}

// 2. Concrete products
class EmailNotification implements Notification {
    send(message: string): void {
        console.log(\`Sending EMAIL: \\\${message}\`);
    }
}

class SmsNotification implements Notification {
    send(message: string): void {
        console.log(\`Sending SMS: \\\${message}\`);
    }
}

class PushNotification implements Notification {
    send(message: string): void {
        console.log(\`Sending PUSH: \\\${message}\`);
    }
}

// 3. The Factory - the only place that knows about concrete classes
class NotificationFactory {
    static create(type: 'email' | 'sms' | 'push'): Notification {
        switch (type) {
            case 'email':
                return new EmailNotification();
            case 'sms':
                return new SmsNotification();
            case 'push':
                return new PushNotification();
            default:
                throw new Error(\`Unknown notification type: \\\${type}\`);
        }
    }
}

// 4. Client code - depends only on the Notification interface
function alertUser(type: 'email' | 'sms' | 'push', message: string) {
    const notification = NotificationFactory.create(type);
    notification.send(message);
}

alertUser('sms', 'Your order has shipped!');
\`\`\`

Adding Slack support now means writing one new \`SlackNotification\` class and adding one case to the factory's switch statement — nothing else in the codebase changes.

## Real-world Analogy

Think of a **pizza restaurant's kitchen**. You (the customer) just order "a pizza" — you don't tell the chef exactly how to knead the dough or which oven to use. The kitchen (the factory) decides how to produce the concrete pizza based on your order (Margherita, Pepperoni, etc.), and you receive a "pizza" (the common interface) either way.

## When to Use It

- When a class can't anticipate which subclass of objects it needs to create ahead of time.
- When you want to centralize object-creation logic so it's easy to extend with new types later.
- When you want to decouple client code from concrete implementations, making unit testing easier (you can inject a fake factory or mock the interface).

## The Downside

For a small, fixed number of types that will never grow, a Factory can feel like unnecessary ceremony — a simple constructor call is often good enough. The pattern earns its keep once you have several related classes and expect that set to grow over time.
	`
	},
	'Abstract Factory': {
		definition:
			'A creational design pattern that provides an interface for creating families of related objects without specifying their concrete classes — essentially a "factory of factories".',
		useCase:
			'A cross-platform UI library that must produce a matching Button and Checkbox for Windows or macOS, ensuring the two widgets are always visually and behaviorally consistent with each other.',
		detailedMarkdown: `
# Abstract Factory Pattern

The **Abstract Factory** pattern lets you produce **families of related objects** without specifying their concrete classes. Where a plain Factory Method creates *one* type of product, an Abstract Factory creates a whole *set* of products that are designed to work together.

## The Problem

Suppose you're building a cross-platform desktop UI toolkit. Every screen needs a \`Button\` and a \`Checkbox\`, and they must render consistently with the operating system's look and feel — a Windows-style button should never appear next to a Mac-style checkbox.

If you use a single Factory Method for buttons and a separate one for checkboxes, nothing stops a bug from creating a \`WindowsButton\` alongside a \`MacCheckbox\`. You need a way to guarantee that a **matching family** of widgets is created together.

## The Solution

Define an abstract interface (\`UIFactory\`) that declares a creation method for each product in the family (\`createButton()\`, \`createCheckbox()\`). Then implement one concrete factory per family (\`WindowsFactory\`, \`MacFactory\`), each of which returns products that belong together. The client only ever talks to the \`UIFactory\` interface, so it's impossible to accidentally mix families.

## Code Example (TypeScript)

\`\`\`typescript
// --- Abstract Products ---
interface Button {
    render(): string;
}
interface Checkbox {
    render(): string;
}

// --- Windows family ---
class WindowsButton implements Button {
    render() { return 'Rendering a rectangular Windows-style button'; }
}
class WindowsCheckbox implements Checkbox {
    render() { return 'Rendering a square Windows-style checkbox'; }
}

// --- Mac family ---
class MacButton implements Button {
    render() { return 'Rendering a rounded macOS-style button'; }
}
class MacCheckbox implements Checkbox {
    render() { return 'Rendering a circular macOS-style checkbox'; }
}

// --- Abstract Factory ---
interface UIFactory {
    createButton(): Button;
    createCheckbox(): Checkbox;
}

// --- Concrete Factories, one per family ---
class WindowsFactory implements UIFactory {
    createButton(): Button { return new WindowsButton(); }
    createCheckbox(): Checkbox { return new WindowsCheckbox(); }
}
class MacFactory implements UIFactory {
    createButton(): Button { return new MacButton(); }
    createCheckbox(): Checkbox { return new MacCheckbox(); }
}

// --- Client code, decoupled from concrete classes ---
function renderScreen(factory: UIFactory) {
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();
    console.log(button.render());
    console.log(checkbox.render());
}

const os = process.platform === 'win32' ? new WindowsFactory() : new MacFactory();
renderScreen(os);
\`\`\`

Because \`renderScreen\` only depends on the \`UIFactory\` interface, swapping the entire visual theme is a one-line change — pass in a different concrete factory — and it is *impossible* to end up with a mismatched \`WindowsButton\` + \`MacCheckbox\` pair.

## Real-world Analogy

Think of **furniture manufacturers**. A single "IKEA modern" factory produces a chair, a sofa, and a coffee table that are all designed in the same style. You wouldn't want to order the chair from the "modern" line and the sofa from the "Victorian" line — the Abstract Factory guarantees the whole set matches.

## Factory Method vs. Abstract Factory

| | **Factory Method** | **Abstract Factory** |
|---|---|---|
| What it creates | A single product | A family of related products |
| Structure | One creator method, often using inheritance/overriding | An interface with several creator methods, implemented per family |
| Typical use | "I need a \`Notification\`, I don't care which channel" | "I need a UI *kit* — button, checkbox, dialog — all consistent" |
| Relationship | Abstract Factory is often *implemented using* several Factory Methods internally | Composes multiple Factory Methods into one cohesive interface |

In short: **Factory Method** answers "which class?", while **Abstract Factory** answers "which *entire family* of classes?"

## When to Use It

- Your system needs to work with multiple families of related products, and you want to enforce that products from one family are always used together.
- You want to hide the concrete classes of a product family behind a single injectable dependency (great for theming, cross-platform code, or swapping database drivers as a matched set of DAO classes).

## The Downside

Introducing an Abstract Factory adds a noticeable amount of upfront structure — several interfaces and classes — for what might, in a small app, be a couple of \`if\` statements. It pays off once the number of families and products grows, or when consistency across a family is a correctness requirement rather than a nice-to-have.
	`
	},
	Builder: {
		definition:
			'A creational design pattern that separates the construction of a complex object from its representation, allowing the same construction process to produce different configurations step by step.',
		useCase:
			'Constructing a complex HttpRequest object that has dozens of optional fields (headers, query params, body, timeout, retries) without forcing every caller through a constructor with fifteen positional arguments.',
		detailedMarkdown: `
# Builder Pattern

The **Builder** pattern lets you construct complex objects step by step. Unlike a Factory, which typically hands back a fully-formed object in one call, a Builder exposes a sequence of small, chainable steps that gradually assemble the final object — and it lets you skip steps whose defaults are fine.

## The Problem: The Telescoping Constructor

Consider an \`HttpRequest\` class. It needs a URL, but everything else — method, headers, query params, body, timeout, retry count — is optional. A naive approach adds a constructor overload for every combination of parameters you might need:

\`\`\`typescript
new HttpRequest('https://api.example.com');
new HttpRequest('https://api.example.com', 'POST');
new HttpRequest('https://api.example.com', 'POST', headers);
new HttpRequest('https://api.example.com', 'POST', headers, body);
new HttpRequest('https://api.example.com', 'POST', headers, body, 5000, 3);
// ...and so on
\`\`\`

This is the **telescoping constructor anti-pattern**: each new optional field doubles the number of overloads you might need, most call sites are a wall of positional arguments where it's impossible to tell which value means what, and passing \`undefined\` as a placeholder for skipped parameters is error-prone.

## The Solution

A **Builder** exposes one method per configurable piece of the object, each of which returns \`this\` so calls can be **chained** (a "fluent" interface). The object is only actually constructed at the end, when \`.build()\` is called — until then, the builder just accumulates configuration.

## Code Example (TypeScript)

\`\`\`typescript
class HttpRequest {
    constructor(
        public readonly url: string,
        public readonly method: string,
        public readonly headers: Record<string, string>,
        public readonly body: unknown,
        public readonly timeoutMs: number,
        public readonly retries: number
    ) {}
}

class HttpRequestBuilder {
    private method = 'GET';
    private headers: Record<string, string> = {};
    private body: unknown = null;
    private timeoutMs = 3000;
    private retries = 0;

    constructor(private readonly url: string) {}

    setMethod(method: string): this {
        this.method = method;
        return this;
    }

    addHeader(key: string, value: string): this {
        this.headers[key] = value;
        return this;
    }

    setBody(body: unknown): this {
        this.body = body;
        return this;
    }

    setTimeout(ms: number): this {
        this.timeoutMs = ms;
        return this;
    }

    setRetries(count: number): this {
        this.retries = count;
        return this;
    }

    build(): HttpRequest {
        return new HttpRequest(
            this.url,
            this.method,
            this.headers,
            this.body,
            this.timeoutMs,
            this.retries
        );
    }
}

// Client code - readable, self-documenting, and only sets what it needs
const request = new HttpRequestBuilder('https://api.example.com/orders')
    .setMethod('POST')
    .addHeader('Authorization', 'Bearer token123')
    .setBody({ item: 'widget', qty: 2 })
    .setTimeout(5000)
    .setRetries(3)
    .build();
\`\`\`

Every call site reads like a sentence, unused options simply keep their sane defaults, and the final \`HttpRequest\` object is still immutable once built.

## The Director (optional)

For builders with many steps, you can add a **Director** class that encapsulates common "recipes" — predefined sequences of builder calls for frequently-needed configurations. For example, a \`RequestDirector.buildJsonPostRequest(builder, url, payload)\` method might chain \`setMethod('POST')\`, \`addHeader('Content-Type', 'application/json')\`, and \`setBody(payload)\` in one call, so client code doesn't have to remember that recipe every time. The Director is optional — plenty of real-world builders (including the one above) are used directly by client code without one.

## Real-world Analogy

Ordering a **custom sandwich** at a deli. You don't get handed a fixed menu item — you pick the bread, then the protein, then toppings, then sauce, one decision at a time, and only the choices you make matter. The "build" step is when the sandwich is actually assembled and handed to you.

## When to Use It

- The object has many optional parameters, especially combinations of them (classic telescoping constructor smell).
- You want the construction of a complex object to be readable and self-documenting at the call site.
- You need to produce several different *representations* of an object using essentially the same construction process (e.g., building both a "compact" and "detailed" version of a report from the same builder steps).

## The Downside

Builders introduce an extra class (or several) purely for construction, which is overkill for objects with only one or two fields — a plain constructor or an object literal is simpler. The pattern also does nothing for you if the object's fields are all required; it shines specifically when *optionality* is the source of complexity.
	`
	},
	Prototype: {
		definition:
			'A creational design pattern that lets you copy existing objects without making your code dependent on their concrete classes, by delegating the copying logic to the objects themselves.',
		useCase:
			'Cloning a fully-configured game character (with nested stats, inventory, and equipment) to spawn dozens of similar enemies quickly, instead of re-running expensive setup logic for each one.',
		detailedMarkdown: `
# Prototype Pattern

The **Prototype** pattern lets you create new objects by **copying an existing object** — a "prototype" — instead of constructing one from scratch through a constructor. The object itself knows how to clone itself, so client code never needs to know its concrete class.

## The Problem

Imagine a game where enemy characters are expensive to set up: each one has base stats, a randomly generated inventory, equipped items with their own nested stat modifiers, and an AI behavior profile loaded from disk. If you want to spawn twenty nearly-identical goblins for a level, re-running that entire setup pipeline twenty times is wasteful — and if any of that setup involves I/O (loading a config file, hitting a database), it can be genuinely slow.

You also might not always have access to the class's constructor parameters. Perhaps the object was built up through a long chain of runtime mutations, and there's no single constructor call that could reproduce its current state anyway.

## The Solution

Give the object a \`clone()\` method that knows how to produce a copy of itself, including its internal state. Client code calls \`.clone()\` on an existing instance rather than \`new SomeClass(...)\`, and never needs to know the concrete class at all — it just needs an object that satisfies a \`Cloneable\` interface.

## Shallow Copy vs. Deep Copy

This is the crux of implementing Prototype correctly:

- A **shallow copy** duplicates the top-level object, but any properties that are references (arrays, nested objects) still point to the *same* underlying data as the original. Mutating a nested object on the clone will also affect the original.
- A **deep copy** recursively clones every nested object and array too, so the clone is fully independent of the original — mutating the clone never affects the source object.

Getting this wrong is a classic bug source: code that assumes a deep copy but actually got a shallow one will see "impossible" mutations bleeding between objects that are supposed to be independent.

## Code Example (TypeScript)

\`\`\`typescript
interface Cloneable<T> {
    clone(): T;
}

class Equipment {
    constructor(public name: string, public damageBonus: number) {}

    clone(): Equipment {
        return new Equipment(this.name, this.damageBonus);
    }
}

class GameCharacter implements Cloneable<GameCharacter> {
    constructor(
        public name: string,
        public health: number,
        public inventory: string[],
        public equipment: Equipment
    ) {}

    // Deep copy: inventory array and equipment object are cloned too,
    // not just referenced.
    clone(): GameCharacter {
        return new GameCharacter(
            this.name,
            this.health,
            [...this.inventory],       // new array, not the same reference
            this.equipment.clone()     // new Equipment instance
        );
    }
}

// Build one fully-configured "template" goblin (the expensive part)
const goblinTemplate = new GameCharacter(
    'Goblin',
    30,
    ['dagger', 'gold coin'],
    new Equipment('Rusty Sword', 2)
);

// Spawn a level's worth of goblins cheaply, then customize each one
const enemies: GameCharacter[] = [];
for (let i = 0; i < 20; i++) {
    const goblin = goblinTemplate.clone();
    goblin.name = \`Goblin #\\\${i + 1}\`;
    enemies.push(goblin);
}

// Mutating one clone's inventory does NOT affect the template or other clones
enemies[0].inventory.push('stolen shield');
console.log(goblinTemplate.inventory); // ['dagger', 'gold coin'] - untouched
\`\`\`

If \`clone()\` had simply returned \`{ ...this }\` (a shallow copy) instead of rebuilding \`inventory\` and \`equipment\`, then \`enemies[0].inventory.push(...)\` would have silently mutated \`goblinTemplate.inventory\` as well, since both would point to the same array.

## Real-world Analogy

**Cell division** in biology. A cell doesn't get built from a blueprint every time — it copies itself, including its internal state, to produce a new, independent cell. Amoeba reproduction is literally "cloning" in the biological sense.

## When to Use It

- Object creation is expensive (I/O, heavy computation, complex setup) and you already have a suitably-configured instance sitting around.
- You need to produce objects without coupling your code to their concrete classes (a \`clone()\` call works polymorphically across any \`Cloneable\`, whereas \`new SomeConcreteClass()\` requires knowing the exact class).
- You need many objects that are variations on a common "template" or "default" configuration.

## The Downside

Cloning objects with circular references or deeply nested structures can be tricky to get right, and it's easy to introduce subtle shallow-copy bugs if you're not disciplined about which fields need a deep clone. In languages/runtimes with built-in serialization, a common shortcut is \`structuredClone()\` (JavaScript) or a serialize/deserialize round-trip — but these can be slower than a hand-written \`clone()\` and don't work for objects holding non-serializable resources like open file handles or database connections.
	`
	}
};
