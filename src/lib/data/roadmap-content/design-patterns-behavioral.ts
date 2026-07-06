import type { RoadmapDetailMap } from './types';

export const DesignPatternsBehavioralContent: RoadmapDetailMap = {
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

## Strategy vs. State — the classic interview mix-up
Structurally these two patterns look nearly identical (a context holding a reference to an interchangeable object), which is exactly why interviewers ask about the difference so often:
- **Strategy:** the *client* chooses the algorithm from the outside, typically once per use, and it doesn't change on its own — you pick \`PayPalPayment\` for this checkout, and that choice stays fixed for the transaction. Strategy objects don't know about each other and never trigger a switch to a different strategy.
- **State:** the state objects drive their *own* transitions internally, as a side effect of their own methods — a \`PendingState.ship()\` call moves the context into \`ShippedState\` automatically, with no external caller deciding to swap it. State objects typically do reference other states in order to transition to them.
- **Shortcut:** if the object doing the swapping is external and one-off, it's Strategy. If the swapping happens automatically, from the inside, in reaction to something that just occurred, it's State.

## Downside
Strategy trades a conditional for a class per algorithm variant. Three payment strategies is fine; twenty slightly-different pricing rules means twenty classes, each of which needs to be found, read, and reasoned about separately — for a small number of variants, an enum with a switch statement can honestly be easier to navigate than jumping across a dozen tiny files.

## When to use it?
- When you have a lot of similar classes that only differ in the way they execute some behavior.
- To isolate the business logic of a class from the implementation details of algorithms.
- To replace massive conditionals (\`if/else\`) with polymorphic method calls.
		`
	},
	Observer: {
		definition:
			'A behavioral design pattern that defines a one-to-many dependency between objects so that when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically.',
		useCase:
			'Powering a news app where a single `NewsPublisher` pushes breaking-news updates to every subscribed `Subscriber` (email, push notification, in-app banner) without knowing anything about them individually.',
		detailedMarkdown: `
# Observer Pattern

The **Observer** pattern establishes a one-to-many relationship between objects: when a single "subject" changes, every object that has registered interest in it — the "observers" — gets notified automatically. Neither side needs to know the concrete details of the other; they only need to agree on a small interface.

## The Problem
Say you're building a news platform. Users can subscribe to a publisher and expect to be notified the instant a new article drops. A naive approach hardcodes the notification logic directly into the publisher: "when a new article is added, loop through this list of email addresses and this list of push tokens and this list of SMS numbers..." Every time you add a new notification channel, you have to modify the publisher's core code. The publisher becomes tightly coupled to every consumer of its data, which violates the Open/Closed Principle and makes the class harder to test and extend.

## The Solution
The Observer pattern extracts the "notify" behavior into its own abstraction. The subject keeps a list of observers that all implement a common interface (typically a single \`update()\` method). When the subject's state changes, it simply iterates over that list and calls \`update()\` on each one — it doesn't care whether an observer sends an email, logs to a file, or updates a UI widget. Observers can subscribe and unsubscribe at runtime, and new observer types can be added without ever touching the subject's code.

## Code Example (TypeScript)
\`\`\`typescript
// 1. The Observer interface — anything that wants updates must implement this
interface Subscriber {
    notify(headline: string): void;
}

// 2. The Subject — maintains the list of observers and notifies them
class NewsPublisher {
    private subscribers: Subscriber[] = [];

    subscribe(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    }

    publish(headline: string): void {
        console.log(\`\\n[Publisher] Breaking news: \${headline}\`);
        for (const subscriber of this.subscribers) {
            subscriber.notify(headline);
        }
    }
}

// 3. Concrete Observers
class EmailSubscriber implements Subscriber {
    constructor(private email: string) {}
    notify(headline: string): void {
        console.log(\`Emailing \${this.email}: "\${headline}"\`);
    }
}

class PushNotificationSubscriber implements Subscriber {
    notify(headline: string): void {
        console.log(\`Sending push notification: "\${headline}"\`);
    }
}

// --- Usage ---
const publisher = new NewsPublisher();
const alice = new EmailSubscriber('alice@example.com');
const pushService = new PushNotificationSubscriber();

publisher.subscribe(alice);
publisher.subscribe(pushService);

publisher.publish('DSA Mastery Tracker hits 1.0!');
// Emailing alice@example.com: "DSA Mastery Tracker hits 1.0!"
// Sending push notification: "DSA Mastery Tracker hits 1.0!"

publisher.unsubscribe(alice);
publisher.publish('Second release shipped');
// Only the push notification fires now.
\`\`\`

## Real-World Ties
This pattern is everywhere once you know to look for it. The DOM's \`addEventListener\` is a textbook Observer implementation — the button (subject) doesn't know or care what your click handler (observer) does. Pub/sub message brokers like Redis Pub/Sub or Kafka topics apply the same idea at a distributed-systems scale. Even React's state model is a variant: components that "subscribe" to a piece of state (via \`useState\`, a context, or a store like Redux/Zustand) automatically re-render when that state changes, without the state owner needing to know which components are listening.

## Downsides
- **Memory leaks:** if an observer subscribes but the subject outlives it and the observer never calls \`unsubscribe()\`, the subject holds a reference to it forever — the observer (and everything it references) can never be garbage collected. This is one of the most common real-world memory leaks in long-lived UIs (a component unmounts but forgets to remove its event listener/subscription).
- **Unpredictable notification order:** observers are usually notified in registration order, which is easy to accidentally depend on. If \`ObserverB\` assumes \`ObserverA\` already ran, that's a hidden ordering dependency invisible anywhere in the code.
- **Cascading update storms:** if an observer's \`update()\` triggers another change on the same subject (or a different subject it also observes), you can trigger a chain of notifications that's hard to trace and can even loop.

## When to use it?
- When a change to one object requires changing an open-ended number of other objects, and you don't want to hardcode that list.
- When objects need to observe others without being tightly coupled to their concrete classes.
- When you need to broadcast events to multiple, independently-changing consumers — logging, UI updates, analytics, and notifications are all classic candidates.
	`
	},
	State: {
		definition:
			'A behavioral design pattern that lets an object alter its behavior when its internal state changes, by delegating state-specific behavior to separate state objects instead of branching on a status field everywhere.',
		useCase:
			'Modeling an `Order` in an e-commerce system that behaves differently when it is `Pending`, `Shipped`, or `Delivered` — each state governs which transitions are legal and what actions are allowed.',
		detailedMarkdown: `
# State Pattern

The **State** pattern allows an object to change its behavior at runtime depending on its internal state, by representing each state as its own class that implements a shared interface. Instead of the object asking "what state am I in?" via a chain of \`if\`/\`switch\` statements, it simply delegates the current action to whichever state object it's holding.

## The Problem
Consider an \`Order\` class that tracks a \`status\` field: \`'pending' | 'shipped' | 'delivered' | 'cancelled'\`. Every method on \`Order\` — \`ship()\`, \`deliver()\`, \`cancel()\` — ends up needing a big \`switch (this.status)\` to decide what's actually allowed: you can't ship an order that's already delivered, you can't cancel one that's already shipped, and so on. As you add more states and more actions, these switch statements multiply across every method, becoming duplicated, hard to follow, and easy to get subtly wrong (a missing \`case\` silently does nothing, or worse, does the wrong thing).

## The Solution
The State pattern says: don't store the state as a plain string, store it as an *object* that implements a common \`OrderState\` interface. Each concrete state (\`PendingState\`, \`ShippedState\`, \`DeliveredState\`) implements the transition methods according to its own rules, and the \`Order\` simply forwards calls to its current state object. Transitioning to a new state is as simple as swapping out that object reference. The conditional logic doesn't disappear — it gets *distributed* to the place where it naturally belongs, one class per state.

## Code Example (TypeScript)
\`\`\`typescript
// 1. The State interface
interface OrderState {
    ship(order: Order): void;
    deliver(order: Order): void;
    cancel(order: Order): void;
    name: string;
}

// 2. Concrete states — each knows only its own legal transitions
class PendingState implements OrderState {
    name = 'Pending';
    ship(order: Order): void {
        console.log('Order shipped.');
        order.setState(new ShippedState());
    }
    deliver(): void {
        console.log('Cannot deliver — order has not shipped yet.');
    }
    cancel(order: Order): void {
        console.log('Order cancelled.');
        order.setState(new CancelledState());
    }
}

class ShippedState implements OrderState {
    name = 'Shipped';
    ship(): void {
        console.log('Already shipped.');
    }
    deliver(order: Order): void {
        console.log('Order delivered.');
        order.setState(new DeliveredState());
    }
    cancel(): void {
        console.log('Cannot cancel — order already shipped.');
    }
}

class DeliveredState implements OrderState {
    name = 'Delivered';
    ship(): void { console.log('Already delivered.'); }
    deliver(): void { console.log('Already delivered.'); }
    cancel(): void { console.log('Cannot cancel a delivered order.'); }
}

class CancelledState implements OrderState {
    name = 'Cancelled';
    ship(): void { console.log('Cannot ship a cancelled order.'); }
    deliver(): void { console.log('Cannot deliver a cancelled order.'); }
    cancel(): void { console.log('Already cancelled.'); }
}

// 3. The Context
class Order {
    private state: OrderState = new PendingState();

    setState(state: OrderState): void {
        this.state = state;
    }

    ship(): void { this.state.ship(this); }
    deliver(): void { this.state.deliver(this); }
    cancel(): void { this.state.cancel(this); }
}

// --- Usage ---
const order = new Order();
order.deliver(); // Cannot deliver — order has not shipped yet.
order.ship();    // Order shipped.
order.deliver(); // Order delivered.
order.cancel();  // Cannot cancel a delivered order.
\`\`\`

## State vs Strategy — the classic interview mix-up
Structurally, State and Strategy are nearly identical: both are a context class holding a reference to an interchangeable object, and both replace conditional logic with polymorphism. Interviewers ask "what's the difference?" constantly because the code shapes look the same. The difference is in **intent and control**:
- **Strategy:** the *client* chooses the algorithm object once (or occasionally), from the outside, and it usually doesn't change on its own — e.g., you pick \`CreditCardPayment\` at checkout and that's the strategy for that one transaction. Strategy objects typically don't know about each other.
- **State:** the state objects themselves drive the transitions — \`PendingState.ship()\` decides to move the context into \`ShippedState\`. The context's behavior changes *automatically and internally* as a side effect of the state's own methods, not because a caller swapped it out. State objects usually *do* know about (and reference) other states to transition to them, which Strategy objects deliberately don't.
- A useful shortcut: if swapping the object is an internal, automatic reaction to what just happened, it's State. If swapping the object is an external, one-off choice made by the client, it's Strategy.

## Downsides
- **Class-count explosion:** a state machine with N states and M transition methods can require N classes, each implementing all M methods (even if most just print "invalid transition"). For state machines with many states, this gets verbose fast — a plain \`switch\`-based state machine or a state-transition table can sometimes be simpler for small, stable state counts.
- **Transition logic gets scattered across state classes:** each state decides what it transitions to next, so the *overall* state graph isn't visible in any single place — you have to read every state class to reconstruct the full picture of legal transitions, unlike a single table-driven state machine where the whole graph is in one spot.

## When to use it?
- When an object's behavior depends heavily on its state, and that behavior must change at runtime.
- When you have a class polluted with massive conditionals that branch on a status/mode field.
- When many methods share overlapping "which transitions are valid" logic — the State pattern collects each state's rules in one place instead of scattering them across every method.
	`
	},
	Command: {
		definition:
			'A behavioral design pattern that turns a request into a stand-alone object containing all the information needed to perform an action, enabling deferred execution, queuing, logging, and undo/redo.',
		useCase:
			'Implementing undo/redo in a text editor, where every keystroke or deletion is captured as a `Command` object that can be replayed or reversed.',
		detailedMarkdown: `
# Command Pattern

The **Command** pattern encapsulates a request — an action plus its parameters — as an object. Instead of calling a method directly, you create a command object that knows how to perform (and often how to undo) that single action. That object can then be stored, passed around, queued, logged, or executed later, completely decoupling *who requests an action* from *who performs it*.

## The Problem
Imagine a text editor. A naive design has the UI directly call \`document.insertText(...)\` or \`document.deleteText(...)\` whenever a button is clicked or a key is pressed. This works fine until you need undo/redo, a macro recorder, or a way to queue up edits and apply them later. With direct method calls, there's no record of *what happened* — once \`insertText\` returns, the information needed to reverse it is gone unless you build a completely separate, parallel tracking system.

## The Solution
The Command pattern wraps each action in an object that implements \`execute()\` (and, if undo support is needed, \`undo()\`). The invoker (the editor) doesn't call \`document.insertText()\` directly — it creates a \`TypeCommand\` and calls \`command.execute()\`. Because that command object holds everything needed to redo *and* undo the action, the editor can maintain a simple history stack: pop the last command and call \`undo()\` to reverse it, or replay a whole list of commands to reconstruct a session.

## Code Example (TypeScript)
\`\`\`typescript
// 1. The Command interface
interface Command {
    execute(): void;
    undo(): void;
}

// 2. The Receiver — the object commands act upon
class TextDocument {
    private content = '';

    insert(text: string, position: number): void {
        this.content = this.content.slice(0, position) + text + this.content.slice(position);
    }

    delete(position: number, length: number): void {
        this.content = this.content.slice(0, position) + this.content.slice(position + length);
    }

    getText(): string {
        return this.content;
    }
}

// 3. Concrete Commands
class TypeCommand implements Command {
    constructor(
        private doc: TextDocument,
        private text: string,
        private position: number
    ) {}

    execute(): void {
        this.doc.insert(this.text, this.position);
    }

    undo(): void {
        this.doc.delete(this.position, this.text.length);
    }
}

class DeleteCommand implements Command {
    private deletedText = '';

    constructor(
        private doc: TextDocument,
        private position: number,
        private length: number
    ) {}

    execute(): void {
        this.deletedText = this.doc.getText().slice(this.position, this.position + this.length);
        this.doc.delete(this.position, this.length);
    }

    undo(): void {
        this.doc.insert(this.deletedText, this.position);
    }
}

// 4. The Invoker — maintains history for undo/redo
class EditorHistory {
    private history: Command[] = [];

    run(command: Command): void {
        command.execute();
        this.history.push(command);
    }

    undoLast(): void {
        const command = this.history.pop();
        command?.undo();
    }
}

// --- Usage ---
const doc = new TextDocument();
const history = new EditorHistory();

history.run(new TypeCommand(doc, 'Hello', 0));
console.log(doc.getText()); // "Hello"

history.run(new TypeCommand(doc, ' World', 5));
console.log(doc.getText()); // "Hello World"

history.undoLast();
console.log(doc.getText()); // "Hello"
\`\`\`

## Real-World Ties
Every "Undo" button you've ever clicked relies on some flavor of this pattern. GUI toolkits bind buttons and menu items to command objects rather than raw callbacks, so the same command can be triggered from a click, a keyboard shortcut, or a script. Job queues (think background workers processing tasks from Redis or SQS) are also commands: a "send email" job is a serialized object describing an action to run later, independent of whoever enqueued it.

## Downsides
- **Class proliferation:** every distinct action needs its own command class (\`TypeCommand\`, \`DeleteCommand\`, \`FormatCommand\`, ...). In a rich editor with dozens of operations, that's dozens of small classes — more moving parts than a simpler design would need if undo/redo weren't a requirement.
- **Memory cost of undo history:** to support undo, each command often has to retain enough state to reverse itself (as \`DeleteCommand\` does with \`deletedText\` above). For commands that touch large amounts of data, keeping a long history stack of these snapshots can get memory-expensive — real editors cap history length or periodically compact it for exactly this reason.

## When to use it?
- When you need undo/redo functionality.
- When you want to queue, schedule, or log operations for later execution.
- When you want to decouple the object that invokes an operation from the object that knows how to perform it (e.g., generic UI buttons bound to arbitrary actions).
	`
	},
	'Template Method': {
		definition:
			'A behavioral design pattern that defines the skeleton of an algorithm in a base class, deferring some of its steps to subclasses without letting them change the overall structure of the algorithm.',
		useCase:
			'Building a `DataParser` base class that always follows the same read-validate-transform-save pipeline, while letting subclasses like `CsvParser` and `JsonParser` customize only the `readData()` and `validate()` steps.',
		detailedMarkdown: `
# Template Method Pattern

The **Template Method** pattern defines the overall skeleton of an algorithm in a base class as a series of steps, and lets subclasses override individual steps without changing the algorithm's structure. The base class controls the "when" and "in what order"; subclasses only control the "how" for specific steps.

## The Problem
Suppose you're writing code to parse different file formats — CSV, JSON, XML — and every parser follows essentially the same pipeline: read the raw data, validate it, transform it into your internal model, and save the result. If you write each parser (\`CsvParser\`, \`JsonParser\`, \`XmlParser\`) completely independently, you end up duplicating the overall pipeline logic in every class, and if that pipeline ever needs a new step (say, a caching layer), you have to remember to add it everywhere. Worse, nothing stops one implementation's pipeline from silently deviating from the others (e.g., forgetting to validate).

## The Solution
The Template Method pattern pulls the invariant sequence of steps into a single, non-overridable method on an abstract base class — the "template method" — and marks the steps that vary as abstract or protected methods that subclasses must (or may) override. The template method itself is typically marked \`final\` (or, in TypeScript, simply left non-overridden by convention) so subclasses can't rearrange the pipeline, only fill in specific blanks.

## Code Example (TypeScript)
\`\`\`typescript
// The abstract base class defines the template method
abstract class DataParser {
    // The template method — the fixed skeleton of the algorithm.
    // Note it is not meant to be overridden.
    parse(rawInput: string): void {
        const data = this.readData(rawInput);
        if (!this.validate(data)) {
            console.log('Validation failed — aborting parse.');
            return;
        }
        const transformed = this.transform(data);
        this.save(transformed);
    }

    // Steps subclasses MUST implement
    protected abstract readData(rawInput: string): unknown;
    protected abstract validate(data: unknown): boolean;

    // Steps with a sensible default, subclasses MAY override ("hooks")
    protected transform(data: unknown): unknown {
        return data;
    }

    protected save(data: unknown): void {
        console.log('Saved:', JSON.stringify(data));
    }
}

// Concrete subclass for CSV
class CsvParser extends DataParser {
    protected readData(rawInput: string): unknown {
        return rawInput.split(',').map((s) => s.trim());
    }

    protected validate(data: unknown): boolean {
        return Array.isArray(data) && data.length > 0;
    }
}

// Concrete subclass for JSON
class JsonParser extends DataParser {
    protected readData(rawInput: string): unknown {
        return JSON.parse(rawInput);
    }

    protected validate(data: unknown): boolean {
        return typeof data === 'object' && data !== null;
    }

    protected transform(data: unknown): unknown {
        // JSON gets an extra normalization step other formats don't need
        return { ...(data as object), normalizedAt: new Date().toISOString() };
    }
}

// --- Usage ---
const csv = new CsvParser();
csv.parse('id, name, price'); // Saved: ["id","name","price"]

const json = new JsonParser();
json.parse('{"id": 1}'); // Saved: {"id":1,"normalizedAt":"..."}
\`\`\`

## When to use it?
- When multiple classes implement algorithms that are structurally identical but differ in specific steps — extract the common skeleton once, avoid duplication.
- When you want to give subclasses limited extension points ("hooks") without letting them override the overall control flow.
- When you're refactoring several similar classes and notice their methods only differ in a small handful of steps — that's a strong signal for Template Method.

## A Note on Contrast with Strategy
Template Method and Strategy solve a similar problem — varying part of an algorithm — but differently. Template Method uses **inheritance**: subclasses override steps of a fixed algorithm. Strategy uses **composition**: you inject a whole interchangeable algorithm object at runtime. Prefer Strategy when you need to swap the algorithm dynamically or avoid a rigid class hierarchy; prefer Template Method when the steps are naturally tied to a fixed sequence and inheritance is a good fit.
	`
	},
	'Chain of Responsibility': {
		definition:
			'A behavioral design pattern that lets you pass requests along a chain of handlers, where each handler decides either to process the request or to pass it to the next handler in the chain.',
		useCase:
			'Building an HTTP server middleware pipeline (authentication, logging, validation, then the route handler) where each middleware can act on a request or forward it to the next one — or a support desk that escalates tickets from Tier 1 to Tier 2 to a manager.',
		detailedMarkdown: `
# Chain of Responsibility Pattern

The **Chain of Responsibility** pattern lets you pass a request through a sequence of independent handlers. Each handler in the chain gets a chance to process the request; if it can't (or chooses not to), it forwards the request to the next handler. Neither the sender nor any given handler needs to know the full chain or who ultimately handles the request.

## The Problem
Imagine a customer support system: a ticket should first be checked by a Tier-1 agent for common issues, escalated to Tier-2 if it's more technical, and finally sent to a manager if it's a billing dispute. A naive implementation puts all of this logic into one big function with nested \`if\`s checking ticket type, agent availability, and escalation rules — every time you add a new tier or escalation rule, you have to modify that central function, and it quickly turns into an unmaintainable decision tree.

## The Solution
Chain of Responsibility breaks each decision-maker into its own handler object with a consistent interface: "can I handle this? If not, pass it along." Each handler holds a reference to the *next* handler in the chain. The client only ever talks to the first handler; the request travels down the chain automatically until someone handles it (or it falls through unhandled). Adding a new handler, removing one, or reordering the chain requires zero changes to the handlers that already exist.

## Code Example (TypeScript)
\`\`\`typescript
interface Ticket {
    issue: string;
    severity: 'low' | 'medium' | 'high';
}

// The abstract handler holds the reference to "next" and defines the chaining logic
abstract class SupportHandler {
    private next: SupportHandler | null = null;

    setNext(handler: SupportHandler): SupportHandler {
        this.next = handler;
        return handler; // allows fluent chaining: a.setNext(b).setNext(c)
    }

    handle(ticket: Ticket): void {
        if (this.canHandle(ticket)) {
            this.resolve(ticket);
        } else if (this.next) {
            this.next.handle(ticket);
        } else {
            console.log('No handler available for this ticket.');
        }
    }

    protected abstract canHandle(ticket: Ticket): boolean;
    protected abstract resolve(ticket: Ticket): void;
}

// Concrete handlers
class Tier1Support extends SupportHandler {
    protected canHandle(ticket: Ticket): boolean {
        return ticket.severity === 'low';
    }
    protected resolve(ticket: Ticket): void {
        console.log(\`[Tier 1] Resolved: \${ticket.issue}\`);
    }
}

class Tier2Support extends SupportHandler {
    protected canHandle(ticket: Ticket): boolean {
        return ticket.severity === 'medium';
    }
    protected resolve(ticket: Ticket): void {
        console.log(\`[Tier 2] Resolved: \${ticket.issue}\`);
    }
}

class ManagerEscalation extends SupportHandler {
    protected canHandle(ticket: Ticket): boolean {
        return ticket.severity === 'high';
    }
    protected resolve(ticket: Ticket): void {
        console.log(\`[Manager] Personally resolved: \${ticket.issue}\`);
    }
}

// --- Usage: build the chain ---
const tier1 = new Tier1Support();
const tier2 = new Tier2Support();
const manager = new ManagerEscalation();

tier1.setNext(tier2).setNext(manager);

tier1.handle({ issue: 'Forgot password', severity: 'low' });    // [Tier 1] Resolved
tier1.handle({ issue: 'API returns 500s', severity: 'medium' }); // [Tier 2] Resolved
tier1.handle({ issue: 'Double-charged invoice', severity: 'high' }); // [Manager] Resolved
\`\`\`

## Real-World Ties
This is precisely how middleware works in frameworks like Express, Koa, or Django. Each middleware function receives the request and either handles it (sends a response) or calls \`next()\` to pass control to the next middleware in the pipeline — authentication, then logging, then body parsing, then your route handler. Exception handling in many languages (a \`try\`/\`catch\` bubbling up through nested calls until something catches it) is conceptually the same chain-based idea.

## Downsides
- **No guarantee a request gets handled:** if every handler in the chain declines, the request silently falls off the end (the code above just logs "No handler available"). Unlike a \`switch\` with a \`default\` case, there's no compile-time signal that you've covered every possibility — you must remember to add a catch-all handler at the end of the chain yourself.
- **Harder to debug and trace:** because the request can be picked up by any handler at any position, stepping through "why did this request get resolved this way" means walking the whole chain at runtime — there's no single place that shows the decision, unlike a centralized \`if/else\` block you could read top to bottom.

## When to use it?
- When more than one object may handle a request, and the handler shouldn't be hardcoded — it should be determined at runtime.
- When you want to issue a request without knowing in advance which object (or how many) will end up processing it.
- When you want to add or reorder processing steps (auth, logging, validation, rate limiting) without touching existing steps — exactly the shape of an HTTP middleware pipeline.
	`
	},
	Mediator: {
		definition:
			'A behavioral design pattern that reduces chaotic many-to-many dependencies between objects by forcing them to communicate only through a central mediator object, rather than directly with each other.',
		useCase:
			'Coordinating a chat room where users never message each other directly — every message goes through a `ChatRoom` mediator that handles routing, so users only need to know about the mediator, not about every other participant.',
		detailedMarkdown: `
# Mediator Pattern

The **Mediator** pattern centralizes communication between a set of objects into a single mediator object, so those objects never need to reference each other directly. Instead of a tangled web of objects all pointing at one another, every object talks only to the mediator, and the mediator decides how to route information between them.

## The Problem
Picture an air traffic control scenario, but in code: a chat room application where every \`User\` object needs to send messages to every other \`User\` currently in the room. A naive design has each \`User\` hold direct references to all other users and call methods on them directly. Now every user class is coupled to every other user class. Adding a moderation feature (e.g., blocking a user, muting notifications) means threading that logic through every single point-to-point connection. The number of relationships grows roughly as the square of the number of participants — this doesn't scale.

## The Solution
The Mediator pattern introduces a single object — the mediator — that all participants talk to instead of talking to each other. Each participant registers with the mediator and sends messages *through* it; the mediator is responsible for figuring out who else needs to know and forwarding accordingly. Participants become simple and decoupled: they know about the mediator's interface and nothing else. All the complex coordination logic lives in one place, which also makes it far easier to test and modify.

## Code Example (TypeScript)
\`\`\`typescript
// The Mediator interface
interface ChatMediator {
    register(user: User): void;
    send(message: string, from: User): void;
}

// Concrete Mediator — owns all the coordination logic
class ChatRoom implements ChatMediator {
    private users: User[] = [];

    register(user: User): void {
        this.users.push(user);
    }

    send(message: string, from: User): void {
        for (const user of this.users) {
            // Don't echo the message back to the sender
            if (user !== from) {
                user.receive(message, from.name);
            }
        }
    }
}

// Participants only know about the mediator, never about each other
class User {
    constructor(
        public name: string,
        private mediator: ChatMediator
    ) {
        mediator.register(this);
    }

    send(message: string): void {
        console.log(\`\${this.name} sends: \${message}\`);
        this.mediator.send(message, this);
    }

    receive(message: string, from: string): void {
        console.log(\`  \${this.name} received from \${from}: \${message}\`);
    }
}

// --- Usage ---
const room = new ChatRoom();
const alice = new User('Alice', room);
const bob = new User('Bob', room);
const carol = new User('Carol', room);

alice.send('Hey everyone!');
// Alice sends: Hey everyone!
//   Bob received from Alice: Hey everyone!
//   Carol received from Alice: Hey everyone!
\`\`\`

## Real-World Ties
Air traffic control towers are the canonical real-world analogy: planes don't communicate directly with every other plane in the sky, they radio the tower, and the tower coordinates who does what. In UI frameworks, a form's controller often mediates between many input widgets (a date picker, a dropdown, a validation banner) so those widgets don't need direct references to each other. Event buses and message brokers (like an in-app \`EventEmitter\` shared across components) are also mediator-flavored, though they lean more towards Observer when the "mediator" does no real coordination beyond fan-out.

## Downsides
- **The mediator can become a God Object:** because all the coordination logic that used to be spread across participants now lives in one place, the mediator itself tends to grow without bound as features are added — it ends up knowing about every participant and every rule for how they interact, becoming a large, monolithic class that's hard to test and modify in isolation. This is the single most common criticism of Mediator: it doesn't eliminate complexity, it just relocates it.
- **A single point of failure/bottleneck:** every interaction routes through the mediator, so a bug there can break communication for every participant at once, and it can become a performance chokepoint under high message volume.

## When to use it?
- When a set of objects communicate in complex, tangled ways, making them hard to reuse independently.
- When you want to reuse a component but it's too tightly bound to a dozen others — extracting a mediator loosens that coupling.
- When you notice you're writing a lot of glue code that only exists to let two unrelated objects talk to each other.
	`
	},
	Iterator: {
		definition:
			'A behavioral design pattern that provides a way to access the elements of a collection sequentially without exposing its underlying representation (array, linked list, tree, etc).',
		useCase:
			'Writing a custom `Range` object that can be used directly in a `for...of` loop, letting consumers iterate over a sequence of numbers without knowing (or caring) how the range computes its values internally.',
		detailedMarkdown: `
# Iterator Pattern

The **Iterator** pattern gives you a uniform way to walk through the elements of a collection one at a time, without exposing whether that collection is backed by an array, a linked list, a tree, or something computed on the fly. The consumer only ever asks "give me the next element," never "what's your internal data structure."

## The Problem
Suppose you build several different collection types in an app — a simple array-backed list, a tree structure, and a custom range generator. If consumers need to know the internal layout of each one to loop over it (indexing into an array vs. walking tree nodes vs. computing a formula), then every piece of client code that iterates becomes coupled to the internal implementation of whatever collection it's given. Swapping the internal representation later (say, changing a list from an array to a linked list for performance) breaks every caller that iterated "the old way."

## The Solution
The Iterator pattern extracts the traversal logic into a separate iterator object (or, in modern JavaScript/TypeScript, a generator function) that exposes a minimal, standard interface: essentially "do you have a next value, and what is it?" The collection is responsible for producing an iterator; the iterator is responsible for knowing how to walk that specific collection. Client code only needs to know the iteration interface, so it works identically whether it's looping over an array, a tree, or a computed sequence.

## Code Example (TypeScript)
\`\`\`typescript
// A custom collection that implements the built-in Iterable protocol
class Range implements Iterable<number> {
    constructor(
        private start: number,
        private end: number,
        private step: number = 1
    ) {}

    // Implementing Symbol.iterator makes this object usable in for...of,
    // spread syntax, Array.from(), destructuring, etc.
    [Symbol.iterator](): Iterator<number> {
        let current = this.start;
        const end = this.end;
        const step = this.step;

        return {
            next(): IteratorResult<number> {
                if (current < end) {
                    const value = current;
                    current += step;
                    return { value, done: false };
                }
                return { value: undefined, done: true };
            }
        };
    }
}

// --- Usage ---
const range = new Range(0, 10, 2);

// The consumer has no idea how Range computes its values internally
for (const num of range) {
    console.log(num); // 0, 2, 4, 6, 8
}

// Because it follows the standard iterable protocol, it "just works" with:
console.log([...range]);        // [0, 2, 4, 6, 8]
console.log(Array.from(range)); // [0, 2, 4, 6, 8]
\`\`\`

## How This Relates to \`for...of\`
This is exactly how \`for...of\` works under the hood in JavaScript/TypeScript. Any object that implements \`[Symbol.iterator]()\` — returning an object with a \`next()\` method that yields \`{ value, done }\` — is automatically usable everywhere the language expects an iterable: \`for...of\` loops, the spread operator, destructuring, and \`Array.from\`. Built-ins like \`Array\`, \`Map\`, \`Set\`, and \`String\` all implement this protocol themselves, which is why you can loop over any of them with identical syntax despite having completely different internal representations. Generator functions (\`function* () { yield ...; }\`) are simply syntactic sugar for writing an iterator without manually constructing the \`{ next() }\` object.

## When to use it?
- When a collection has a complex internal structure and you want to hide that complexity from client code.
- When you want to support multiple, simultaneous traversals over the same collection (each iterator tracks its own position independently).
- When you want your custom data structure to interoperate seamlessly with language features like \`for...of\`, spread syntax, and destructuring — implementing the iterator protocol gets you all of that for free.
	`
	},
	Visitor: {
		definition:
			'A behavioral design pattern that lets you separate an algorithm from the object structure it operates on, so you can add new operations to a class hierarchy without modifying the classes themselves.',
		useCase:
			'Adding new operations — like computing total area or exporting to SVG — over a fixed hierarchy of `Shape` subclasses (`Circle`, `Rectangle`, `Triangle`) without touching any of the shape classes each time a new operation is needed.',
		detailedMarkdown: `
# Visitor Pattern

The **Visitor** pattern lets you define a new operation on a group of related classes without modifying those classes. Instead of adding a method to every class in a hierarchy each time you need a new operation, you write a separate "visitor" object that knows how to handle each concrete type, and you let the objects "accept" the visitor.

## The Problem
Suppose you have a \`Shape\` hierarchy — \`Circle\`, \`Rectangle\`, \`Triangle\` — used throughout a graphics app. Now you need to add an operation that computes total area across a list of mixed shapes. Later, you need an operation that exports each shape to SVG. Later still, an operation that computes a bounding box. If you add a method to the \`Shape\` base class for each new operation, every concrete subclass has to implement it, and the \`Shape\` hierarchy keeps growing every time someone needs an unrelated new feature — area calculation and SVG export have nothing to do with each other, yet they're forced to live inside the same classes.

## The Solution
The Visitor pattern flips the direction of the dependency. Each \`Shape\` gets a single, stable method: \`accept(visitor)\`, which simply calls back into the visitor with itself: \`visitor.visitCircle(this)\`. All the operation-specific logic lives in visitor classes (\`AreaVisitor\`, \`ExportVisitor\`) that implement one method per concrete shape type. Adding a brand-new operation means writing one new visitor class — zero changes to any \`Shape\` subclass. The mechanism that makes this dispatch to the *correct* \`visitXxx\` method (rather than a generic one) is called **double dispatch**: the call is resolved first by which shape it is (via \`accept\`), then by which visitor it is (via the specific \`visitCircle\`/\`visitRectangle\` method).

## Code Example (TypeScript)
\`\`\`typescript
// The Visitor interface — one method per concrete element type
interface ShapeVisitor {
    visitCircle(circle: Circle): void;
    visitRectangle(rectangle: Rectangle): void;
}

// The element interface — every shape must accept a visitor
interface Shape {
    accept(visitor: ShapeVisitor): void;
}

class Circle implements Shape {
    constructor(public radius: number) {}
    accept(visitor: ShapeVisitor): void {
        visitor.visitCircle(this);
    }
}

class Rectangle implements Shape {
    constructor(
        public width: number,
        public height: number
    ) {}
    accept(visitor: ShapeVisitor): void {
        visitor.visitRectangle(this);
    }
}

// Concrete Visitor #1: computes total area
class AreaVisitor implements ShapeVisitor {
    totalArea = 0;

    visitCircle(circle: Circle): void {
        this.totalArea += Math.PI * circle.radius ** 2;
    }

    visitRectangle(rectangle: Rectangle): void {
        this.totalArea += rectangle.width * rectangle.height;
    }
}

// Concrete Visitor #2: exports shapes to a simple SVG string
class ExportVisitor implements ShapeVisitor {
    svg = '';

    visitCircle(circle: Circle): void {
        this.svg += \`<circle r="\${circle.radius}" />\\n\`;
    }

    visitRectangle(rectangle: Rectangle): void {
        this.svg += \`<rect width="\${rectangle.width}" height="\${rectangle.height}" />\\n\`;
    }
}

// --- Usage ---
const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6)];

const areaVisitor = new AreaVisitor();
shapes.forEach((shape) => shape.accept(areaVisitor));
console.log('Total area:', areaVisitor.totalArea.toFixed(2)); // ~102.55

const exportVisitor = new ExportVisitor();
shapes.forEach((shape) => shape.accept(exportVisitor));
console.log(exportVisitor.svg);
// <circle r="5" />
// <rect width="4" height="6" />
\`\`\`

## When It's Actually Worth the Complexity
Visitor has a reputation as one of the more heavyweight, less-used GoF patterns, and that reputation is fairly earned. It adds real ceremony: an \`accept\` method on every element, a visitor interface with one method per type, and every existing element class must be modified to support it in the first place. It also breaks down quickly if the element hierarchy changes often, since every visitor then needs a matching new method. It genuinely pays off when the *opposite* is true: the object structure (the \`Shape\` hierarchy) is stable and rarely changes, but you frequently need to add unrelated new operations over that structure — exactly the AST-processing use case in compilers (type-checking, code generation, and optimization passes are each a separate visitor over a stable set of AST node types). If your class hierarchy changes more often than your operations do, Visitor is the wrong tool — you're better off just adding a method to each class.

## When to use it?
- When you need to perform several distinct, unrelated operations across a stable object structure and don't want to bloat those classes with methods for each.
- When the operations are more likely to change or grow than the object structure itself.
- Classic use cases: compiler/AST tooling, rendering the same document structure to multiple output formats, and reporting/analytics passes over a fixed domain model.
	`
	}
};
