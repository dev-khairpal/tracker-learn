import type { RoadmapDetailMap } from './types';

export const LldContent: RoadmapDetailMap = {
	'Object Modeling': {
		definition:
			'The process of identifying the real-world entities, their attributes, and their behaviors in a problem, and translating them into classes.',
		useCase:
			'Turning a vague prompt like "design a library system" into concrete classes: Book, Member, Loan.',
		detailedMarkdown: `
# Object Modeling

**Object Modeling** is the very first step of any LLD interview: translating a fuzzy real-world problem into concrete classes, before writing a single line of code.

## The Process
1. **Identify nouns** in the problem statement — they're candidate classes. "A member borrows a book from the library" → \`Member\`, \`Book\`, \`Library\`.
2. **Identify attributes** — what data does each noun hold? A \`Book\` has an \`isbn\`, \`title\`, \`author\`.
3. **Identify behaviors** — what actions does each noun perform? A \`Member\` can \`borrowBook()\`, \`returnBook()\`.
4. **Identify relationships** — does a \`Library\` *have* many \`Book\`s (composition), or does a \`Loan\` just *reference* a \`Member\` and a \`Book\` (association)?

## Worked Example
> "A library has books. Members can borrow up to 3 books at a time, for 14 days."

- \`Book\` — isbn, title, author, status (available/borrowed)
- \`Member\` — id, name, list of active loans
- \`Loan\` — book, member, dueDate — models the *relationship* itself as a first-class object, which is often the key insight interviewers are looking for (rather than cramming a "borrowedBy" field directly onto \`Book\`).

## Why This Step Matters
Skipping straight to code without object modeling is the #1 way LLD interviews go badly — candidates either miss an important entity (like \`Loan\` above) or design classes that don't map cleanly to the problem, causing awkward, over-complicated code later.
		`
	},
	'Class Design': {
		definition:
			'Deciding what fields and methods each class should have, aiming for high cohesion (a class does one thing well) and low coupling (classes depend on each other as little as possible).',
		useCase:
			'Refactoring a bloated Order class that also sends emails and calculates taxes into three focused classes.',
		detailedMarkdown: `
# Class Design

Good class design comes down to two properties, and interviewers are explicitly listening for whether you understand them:

## Cohesion
*Do all the fields and methods of a class actually belong together?* A **highly cohesive** class has one clear job.

\`\`\`typescript
// Low cohesion: Order is doing three unrelated jobs
class Order {
  calculateTotal() { /* ... */ }
  sendConfirmationEmail() { /* ... */ }
  calculateTax() { /* ... */ }
}

// High cohesion: each class has one job
class Order { calculateTotal() { /* ... */ } }
class TaxCalculator { calculate(order: Order) { /* ... */ } }
class NotificationService { sendOrderConfirmation(order: Order) { /* ... */ } }
\`\`\`

## Coupling
*How much does one class need to know about another's internals?* **Low coupling** means you can change one class without breaking others — achieved by depending on interfaces, not concrete classes (see *Dependency Injection*, *Interface*).

## Getters/Setters, Judiciously
Exposing a public setter for every private field defeats *Encapsulation* — it's just a public field with extra syntax. Prefer meaningful methods (\`deposit(amount)\`) over raw \`setBalance(amount)\` whenever the change should carry business rules.

## The Interview Signal
When an interviewer asks "why did you design it this way?", a strong answer names cohesion/coupling explicitly: *"I pulled tax calculation into its own class so Order stays focused on order state, and so we can swap tax logic per-region without touching Order at all."*
		`
	},
	UML: {
		definition:
			'A standardized diagramming notation for visualizing the classes, relationships, and interactions in an object-oriented design.',
		useCase:
			'Sketching a class diagram on a whiteboard before writing code, so the interviewer can follow your design as it forms.',
		detailedMarkdown: `
# UML (Unified Modeling Language)

You rarely need to draw a *formal* UML diagram in an interview, but knowing the notation lets you sketch fast, unambiguous whiteboard diagrams.

## Class Box Notation
\`\`\`text
+-------------------------+
|         Book            |
+-------------------------+
| - isbn: string          |
| - title: string         |
| - status: BookStatus    |
+-------------------------+
| + borrow(): void        |
| + returnBook(): void    |
+-------------------------+
\`\`\`
Three sections: class name, fields, methods. \`-\` means private, \`+\` means public, \`#\` means protected.

## Relationship Arrows
| Relationship | Arrow | Meaning |
|---|---|---|
| Inheritance | \`──▷\` (hollow triangle) | Circle **is a** Shape |
| Interface implementation | \`┄┄▷\` (dashed hollow triangle) | Duck **implements** Flyable |
| Association | \`──>\` | Order **references** a Customer |
| Aggregation | \`──◇\` (hollow diamond) | Library **has** Books, but a Book outlives the Library |
| Composition | \`──◆\` (filled diamond) | House **owns** Rooms — Rooms die with the House |
| Dependency | \`┄┄>\` (dashed arrow) | OrderService **uses** a Logger |

## Sequence Diagrams (Briefly)
For behavior over time (e.g. "walk me through what happens when a user checks out"), a **sequence diagram** shows objects as vertical lifelines and calls between them as horizontal arrows, top to bottom in time order — useful for explaining a multi-step flow like the *Movie Booking* seat-locking process.

## The Practical Takeaway
In a live interview, a rough box-and-arrow sketch using this vocabulary (even without perfect notation) demonstrates the same structured thinking a full UML diagram would — precision matters less than clearly showing entities and how they relate.
		`
	},
	'Design Principles': {
		definition:
			'A set of general guidelines — including SOLID, DRY, and KISS — that steer object-oriented designs toward being maintainable and adaptable to change.',
		useCase:
			'Justifying a design decision in an interview by naming the specific principle it satisfies.',
		detailedMarkdown: `
# Design Principles

Beyond the five *SOLID Principles* (covered in depth in the OOP section), two more principles come up constantly in LLD interviews:

## DRY — Don't Repeat Yourself
Every piece of knowledge should exist in exactly one place in your system.
\`\`\`typescript
// Violates DRY: the discount formula is duplicated
function getWebPrice(p: Product) { return p.price * 0.9; }
function getMobilePrice(p: Product) { return p.price * 0.9; }

// Follows DRY: one source of truth
function getDiscountedPrice(p: Product) { return p.price * 0.9; }
\`\`\`
Violating DRY means a future change (the discount becomes 15%) has to be found and fixed in multiple places — and it's easy to miss one.

## KISS — Keep It Simple, Stupid
Prefer the simplest design that solves the actual problem. Don't reach for a full Strategy-pattern class hierarchy to handle two conditions that a simple \`if/else\` would cover just as clearly.

## YAGNI — You Aren't Gonna Need It
Don't build configurability or abstraction for a requirement that doesn't exist yet. A common LLD interview trap is over-engineering a "Parking Lot" system with a plugin architecture for hypothetical future vehicle types nobody asked about — it burns time you needed for the actual requirements.

## Why Interviewers Care
These principles give you *vocabulary* to justify decisions in real time: "I kept this simple rather than adding a factory here, since YAGNI — we only have two payment types and no indication that will grow."
		`
	},
	'Design Patterns': {
		definition:
			'Proven, reusable solutions to commonly recurring problems in object-oriented software design.',
		useCase:
			'Recognizing that a "notify all subscribers when price drops" requirement is a textbook Observer pattern.',
		detailedMarkdown: `
# Design Patterns

A **Design Pattern** isn't a finished piece of code — it's a named, reusable *shape* of a solution to a recurring design problem. Knowing them gives you a shared vocabulary with interviewers ("I'd use a Strategy here") instead of re-deriving the same solution from scratch every time.

## The Three Families
Patterns are traditionally grouped by what they're concerned with:

| Family | Concerned with | Examples |
|---|---|---|
| **Creational** | How objects get created | Singleton, Factory, Builder |
| **Structural** | How objects are composed into larger structures | Adapter, Decorator, Composite |
| **Behavioral** | How objects communicate and distribute responsibility | Strategy, Observer, State |

Every individual pattern in this list has its own dedicated, in-depth entry elsewhere in this app (see the *Design Patterns* section) — this entry is just the map.

## Using Patterns Well in an Interview
The skill being tested is **pattern recognition**, not pattern memorization:
1. Notice the *shape* of the problem ("we need interchangeable payment algorithms" → Strategy).
2. Name the pattern and briefly justify why it fits.
3. Sketch just enough of it to show the structure — you rarely need a full, polished implementation.

> **Anti-pattern warning:** Forcing a pattern where a simple function would do is a real interview red flag (violates *KISS*/*YAGNI*). The best LLD candidates apply patterns because they fit, not to show off vocabulary.
		`
	},
	'Parking Lot': {
		definition:
			'A classic LLD interview problem: design a system that manages parking spots across floors, assigns spots to vehicles, and handles payment.',
		useCase:
			'One of the most commonly asked whiteboard LLD problems in software engineering interviews.',
		detailedMarkdown: `
# Design a Parking Lot System

## 1. Requirements Gathering
**Functional:**
- Multiple floors, each with a fixed number of spots.
- Multiple vehicle types (motorcycle, car, bus) that need differently-sized spots.
- A vehicle entering gets assigned a spot; a ticket is issued.
- On exit, calculate the fee based on duration and pay.
- Support querying how many spots are free, per floor and per type.

**Non-functional:**
- Thread-safe spot allocation (two entry gates could try to assign the same spot simultaneously).
- Easy to extend with new vehicle types or pricing schemes.

## 2. Core Entities / Class Design
\`\`\`typescript
enum VehicleType { MOTORCYCLE, CAR, BUS }
enum SpotSize { SMALL, MEDIUM, LARGE }

class Vehicle {
  constructor(public licensePlate: string, public type: VehicleType) {}
}

class ParkingSpot {
  isOccupied = false;
  constructor(public id: string, public size: SpotSize, public floor: number) {}
}

class Ticket {
  constructor(public vehicle: Vehicle, public spot: ParkingSpot, public entryTime: Date) {}
}

interface PricingStrategy {
  calculateFee(ticket: Ticket, exitTime: Date): number;
}

class ParkingLot {
  private spots: ParkingSpot[] = [];
  private activeTickets = new Map<string, Ticket>();

  parkVehicle(vehicle: Vehicle): Ticket | null {
    const spot = this.findAvailableSpot(vehicle.type);
    if (!spot) return null;
    spot.isOccupied = true;
    const ticket = new Ticket(vehicle, spot, new Date());
    this.activeTickets.set(vehicle.licensePlate, ticket);
    return ticket;
  }
}
\`\`\`

## 3. Key Design Decisions
- **Strategy pattern for pricing** — \`PricingStrategy\` lets you swap flat-rate, hourly, or weekday/weekend pricing without touching \`ParkingLot\`.
- **Factory-ish spot allocation** — encapsulate "find an available spot of the right size" behind one method, so the allocation algorithm (nearest-first, floor-balancing, etc.) can change independently.
- **Singleton-ish ParkingLot** — there's conceptually one parking lot instance coordinating all spots; whether you *literally* implement it as a Singleton class or just wire up a single instance via dependency injection, the key point is centralized coordination for consistency.

## 4. Handling the Tricky Part: Vehicle Sizes vs Spot Sizes
A common requirement: a \`MOTORCYCLE\` can park in *any* size spot; a \`BUS\` needs a \`LARGE\` spot specifically. Model this as a compatibility check rather than a rigid 1:1 mapping, so the rule can evolve (e.g. "2 motorcycles per large spot") without restructuring the whole class hierarchy.

## Common Interview Follow-ups
- *"How would you handle concurrent spot allocation from multiple entry gates?"* — wrap the find-and-reserve step in a lock (or use an atomic compare-and-swap on the spot's status) so two gates can't both claim the same spot.
- *"How would you support reservations made in advance?"* — add a \`ReservedSpot\` concept with a hold expiry, checked before general allocation.
- *"How would you find the nearest available spot to the entrance efficiently?"* — maintain a min-heap or sorted structure per floor by distance, rather than a linear scan every time.
		`
	},
	'Library System': {
		definition:
			'A classic LLD problem: design a system managing books, members, loans, due dates, and reservations for a library.',
		useCase:
			'Frequently asked to test how well a candidate models due dates, fines, and availability search.',
		detailedMarkdown: `
# Design a Library System

## 1. Requirements Gathering
**Functional:**
- Members can search for books by title/author/ISBN.
- Members can borrow available books (with a limit, e.g. 3 at a time) and return them.
- Loans have a due date; late returns accrue a fine.
- Members can reserve a book that's currently checked out.

**Non-functional:**
- Consistent state under concurrent borrow attempts for the same book.

## 2. Core Entities / Class Design
\`\`\`typescript
enum BookStatus { AVAILABLE, LOANED, RESERVED }

class Book {
  status: BookStatus = BookStatus.AVAILABLE;
  constructor(public isbn: string, public title: string, public author: string) {}
}

class Member {
  activeLoans: Loan[] = [];
  constructor(public id: string, public name: string, public maxLoans = 3) {}
}

class Loan {
  returnedAt: Date | null = null;
  constructor(public book: Book, public member: Member, public dueDate: Date) {}
}

class Library {
  private catalog: Book[] = [];
  private loans: Loan[] = [];

  borrowBook(member: Member, book: Book): Loan {
    if (member.activeLoans.length >= member.maxLoans) throw new Error('Loan limit reached');
    if (book.status !== BookStatus.AVAILABLE) throw new Error('Book unavailable');
    book.status = BookStatus.LOANED;
    const loan = new Loan(book, member, addDays(new Date(), 14));
    member.activeLoans.push(loan);
    return loan;
  }
}
\`\`\`

## 3. Key Design Decisions
- **Loan as a first-class object** (not just a flag on \`Book\`) — this is the same insight as *Object Modeling*'s worked example, and it's what lets you cleanly track due dates and history per checkout.
- **Fine calculation as its own function/strategy** — \`calculateFine(loan, returnDate)\` isolated so the fine policy (flat rate vs escalating) can change independently.
- **Search** — index the catalog by title/author/ISBN (in a real system, a search engine or at minimum a database index — see *Indexes* — rather than a linear scan).

## 4. Handling the Tricky Part: Reservations
When a book is checked out and a member reserves it, you need a **queue per book** — when it's returned, the system should notify the next person in line (a natural fit for the *Observer* pattern) rather than making it immediately available to anyone.

## Common Interview Follow-ups
- *"How do you prevent two members from borrowing the last copy at the same time?"* — the \`status\` check-and-set must be atomic (a lock, or a database-level conditional update) — same underlying issue as the *Movie Booking* seat-locking problem.
- *"How would you support multiple copies of the same book?"* — separate \`Book\` (the title/metadata) from \`BookCopy\` (a physical, individually-loanable instance) — a one-to-many relationship.
- *"How do fines get paid?"* — model a \`Fine\` entity tied to a member's account, settled independently of the loan lifecycle.
		`
	},
	'Movie Booking': {
		definition:
			'A classic LLD problem: design a movie ticket booking system handling theatres, shows, seat selection, and payment.',
		useCase:
			'Tests how well a candidate handles the concurrency problem of two users trying to book the same seat.',
		detailedMarkdown: `
# Design a Movie Ticket Booking System

## 1. Requirements Gathering
**Functional:**
- Browse movies, theatres, and showtimes.
- View a seat map for a specific show and select seats.
- Hold selected seats temporarily while the user completes payment.
- Confirm booking on successful payment; release the hold on failure or timeout.

**Non-functional:**
- No two users can ever be issued the same seat for the same show — this is the crux of the whole problem.

## 2. Core Entities / Class Design
\`\`\`typescript
enum SeatStatus { AVAILABLE, LOCKED, BOOKED }

class Seat {
  status: SeatStatus = SeatStatus.AVAILABLE;
  lockedUntil: Date | null = null;
  constructor(public id: string, public row: string, public type: 'REGULAR' | 'PREMIUM') {}
}

class Show {
  constructor(public id: string, public movie: string, public startTime: Date, public seats: Seat[]) {}
}

class Booking {
  constructor(public id: string, public show: Show, public seats: Seat[], public userId: string) {}
}

class BookingService {
  lockSeats(show: Show, seatIds: string[], holdSeconds = 300): boolean {
    const seats = show.seats.filter(s => seatIds.includes(s.id));
    if (seats.some(s => s.status !== SeatStatus.AVAILABLE)) return false;
    seats.forEach(s => { s.status = SeatStatus.LOCKED; s.lockedUntil = new Date(Date.now() + holdSeconds * 1000); });
    return true;
  }
}
\`\`\`

## 3. Key Design Decisions
- **A LOCKED intermediate state** between AVAILABLE and BOOKED — this is the single most important idea in this problem. It creates a payment window without permanently reserving a seat that a user might abandon.
- **Lock expiry** — a background job (or a check performed on every seat-map read) releases seats whose \`lockedUntil\` has passed back to AVAILABLE, so an abandoned checkout doesn't block a seat forever.
- **Idempotent payment confirmation** — if a payment webhook fires twice, confirming the same booking twice must be a no-op, not a double-charge or duplicate ticket.

## 4. Handling the Tricky Part: Concurrent Seat Locking
Two users click "book" on seat A7 within milliseconds of each other. The fix is an **atomic check-and-set** on the seat's status — either a database row-level lock (\`SELECT ... FOR UPDATE\`) or a distributed lock (e.g. Redis \`SETNX\`) around the "is it AVAILABLE? then mark LOCKED" step, so only one request can win the race.

## Common Interview Follow-ups
- *"What happens if the user never completes payment?"* — the lock's TTL naturally expires and the seat returns to AVAILABLE; confirm you'd use a scheduled sweep or lazy-check-on-read rather than trusting the client to "cancel" cleanly.
- *"How would you scale seat-map reads for a hugely popular show?"* — cache the seat map (see *Cache*) and only hit the source of truth on an actual lock/booking attempt.
- *"How do you handle a payment gateway timeout?"* — treat it as failed until you get an explicit success webhook; never optimistically confirm a booking before payment is verified.
		`
	},
	Splitwise: {
		definition:
			'A classic LLD problem: design an expense-splitting app where users create groups, log shared expenses, and settle debts with the minimum number of transactions.',
		useCase: 'Tests graph/algorithmic thinking layered on top of standard object modeling.',
		detailedMarkdown: `
# Design Splitwise (Expense Sharing)

## 1. Requirements Gathering
**Functional:**
- Users belong to one or more groups.
- Any user can log an expense paid by them and split among group members — equally, by exact amounts, or by percentage.
- The system tracks who owes whom, and can show a simplified settlement plan.

**Non-functional:**
- Settlement should minimize the number of actual payments needed to clear all debts.

## 2. Core Entities / Class Design
\`\`\`typescript
interface SplitStrategy {
  computeShares(amount: number, participants: User[], meta?: unknown): Map<User, number>;
}

class EqualSplit implements SplitStrategy {
  computeShares(amount: number, participants: User[]) {
    const share = amount / participants.length;
    return new Map(participants.map(u => [u, share]));
  }
}

class Expense {
  constructor(
    public paidBy: User,
    public amount: number,
    public participants: User[],
    public strategy: SplitStrategy
  ) {}
}

class Group {
  private balances = new Map<string, number>(); // key: "userA->userB"
  addExpense(expense: Expense) {
    const shares = expense.strategy.computeShares(expense.amount, expense.participants);
    for (const [user, share] of shares) {
      if (user !== expense.paidBy) this.recordDebt(user, expense.paidBy, share);
    }
  }
}
\`\`\`

## 3. Key Design Decisions
- **Strategy pattern for splitting** — \`EqualSplit\`, \`PercentageSplit\`, \`ExactAmountSplit\` all implement \`SplitStrategy\`, so \`Group.addExpense\` never needs to know *how* a split is computed.
- **Net balances, not a running list of every individual debt** — collapse "A owes B $10" and "B owes A $4" into a single net "A owes B $6" as expenses are added, rather than replaying history every time you want the current state.

## 4. Deep Dive: Debt Simplification
This is the signature hard part of Splitwise. After many expenses, you might have A owes B $10, B owes C $10, C owes A $5 — a real settlement only needs **2 payments**, not 3, once you net it out (A owes C net $5, and B is settled with A directly).

**The standard approach:** treat each user's *net balance* (total owed to them minus total they owe) as a single number. Users with a positive balance are "creditors," negative are "debtors." Repeatedly match the largest debtor with the largest creditor, settle the smaller of the two amounts, and repeat — a greedy algorithm that provably minimizes the number of transactions for net settlement (this is the same idea as the "optimal account balancing" problem).

\`\`\`typescript
function simplifyDebts(balances: Map<User, number>): Payment[] {
  const creditors = [...balances.entries()].filter(([, b]) => b > 0).sort((a, b) => b[1] - a[1]);
  const debtors = [...balances.entries()].filter(([, b]) => b < 0).sort((a, b) => a[1] - b[1]);
  // greedily match largest debtor with largest creditor, settle min(|debt|, credit), repeat
}
\`\`\`

## Common Interview Follow-ups
- *"What if someone disputes an expense?"* — model expenses as immutable + append-only, with corrections as new offsetting entries, so there's a full audit trail rather than mutating history.
- *"How would you support multiple currencies?"* — attach a currency to each \`Expense\` and convert to a common settlement currency at settlement time using a rate lookup, rather than mixing currencies in one balance.
- *"How do you handle a user leaving a group with an outstanding balance?"* — settlement must be forced (or the balance transferred/frozen) before removal; don't silently drop the debt.
		`
	},
	Elevator: {
		definition:
			'A classic LLD problem: design the control system for one or more elevators, handling floor requests and car dispatch efficiently.',
		useCase:
			'Tests state-machine modeling and dispatch-algorithm reasoning under real-time constraints.',
		detailedMarkdown: `
# Design an Elevator System

## 1. Requirements Gathering
**Functional:**
- Users request an elevator from a floor (specifying direction), or from inside a car (specifying destination floor).
- The system dispatches the "best" available car to serve each request.
- Cars open/close doors, and refuse to move with doors open.

**Non-functional:**
- Minimize average wait time; scale to multiple elevators in the same building serving requests together.

## 2. Core Entities / Class Design
\`\`\`typescript
enum Direction { UP, DOWN, IDLE }
enum DoorState { OPEN, CLOSED }

class ElevatorCar {
  currentFloor = 0;
  direction = Direction.IDLE;
  doorState = DoorState.CLOSED;
  requestQueue: number[] = [];

  addRequest(floor: number) {
    this.requestQueue.push(floor);
    this.requestQueue.sort((a, b) =>
      this.direction === Direction.UP ? a - b : b - a
    );
  }
}

class ExternalRequest {
  constructor(public floor: number, public direction: Direction) {}
}

class ElevatorController {
  constructor(private cars: ElevatorCar[]) {}

  dispatch(request: ExternalRequest): ElevatorCar {
    return this.cars.reduce((best, car) =>
      this.cost(car, request) < this.cost(best, request) ? car : best
    );
  }

  private cost(car: ElevatorCar, request: ExternalRequest): number {
    return Math.abs(car.currentFloor - request.floor); // simplified
  }
}
\`\`\`

## 3. Key Design Decisions
- **State machine per car** — IDLE / MOVING_UP / MOVING_DOWN / DOORS_OPEN, with strict transition rules (can't move with doors open) — model this explicitly (see *State* pattern) rather than a tangle of boolean flags.
- **Request queue kept sorted in the direction of travel** — this is what implements the real-world rule "an elevator moving up serves all up-requests along the way before reversing," rather than a naive first-in-first-out queue.

## 4. Deep Dive: The Dispatch Algorithm
The simplest dispatch policy — **nearest car** — picks whichever idle/compatible car has the shortest distance to the request floor. A better policy also factors in **direction**: a car already moving up, below the requested floor, heading up, can serve an "up" request efficiently along its existing path; a car moving away from the request is a poor candidate even if physically closer. Real systems (like SCAN/LOOK disk-scheduling algorithms, which this closely mirrors) balance this against fairness so no floor waits forever during high traffic.

## Common Interview Follow-ups
- *"How would you handle multiple elevators serving simultaneously?"* — the \`ElevatorController\` dispatch cost function is exactly the extension point — it's already comparing across all cars.
- *"How do you prevent starvation (a floor never getting served during rush hour)?"* — add a fairness factor or a max-wait escalation to the cost function so long-waiting requests get prioritized.
- *"How would you handle an emergency (fire alarm)?"* — an override mode that force-sends all cars to the ground floor and disables normal dispatch — a good chance to mention this as a separate, higher-priority state in the state machine.
		`
	},
	ATM: {
		definition:
			'A classic LLD problem: design the software controlling an ATM — card handling, PIN authentication, transactions, and cash dispensing.',
		useCase: 'Tests clean state-machine design and abstraction of hardware components.',
		detailedMarkdown: `
# Design an ATM System

## 1. Requirements Gathering
**Functional:**
- Insert card → enter PIN → select a transaction (withdraw, deposit, check balance, transfer) → dispense cash / print receipt.
- Reject invalid PINs (with a lockout after N attempts) and insufficient funds/cash.

**Non-functional:**
- Must never dispense cash without a confirmed, consistent balance debit (correctness over convenience).

## 2. Core Entities / Class Design
\`\`\`typescript
interface ATMState {
  insertCard(atm: ATMContext, card: Card): void;
  enterPin(atm: ATMContext, pin: string): void;
}

class IdleState implements ATMState {
  insertCard(atm: ATMContext, card: Card) {
    atm.currentCard = card;
    atm.setState(new HasCardState());
  }
  enterPin() { throw new Error('Insert a card first'); }
}

class HasCardState implements ATMState {
  insertCard() { throw new Error('Card already inserted'); }
  enterPin(atm: ATMContext, pin: string) {
    if (atm.bank.verifyPin(atm.currentCard!, pin)) atm.setState(new TransactionState());
    else atm.recordFailedAttempt();
  }
}

class ATMContext {
  currentCard: Card | null = null;
  private state: ATMState = new IdleState();
  constructor(public bank: BankInterface, public cashDispenser: CashDispenser) {}
  setState(s: ATMState) { this.state = s; }
  insertCard(card: Card) { this.state.insertCard(this, card); }
  enterPin(pin: string) { this.state.enterPin(this, pin); }
}
\`\`\`

## 3. Key Design Decisions
- **The State pattern is the design** — Idle → HasCard → PinVerified → Transaction → DispensingCash, each state permits only specific next actions, which directly prevents whole classes of bugs (like trying to withdraw before authenticating).
- **Hardware abstracted behind interfaces** — \`CardReader\`, \`CashDispenser\`, \`Printer\` are interfaces the core logic depends on, so the same state machine works whether it's talking to real hardware or a test double. This is *Dependency Injection* in action.
- **Every transaction type as a Strategy** — \`WithdrawTransaction\`, \`DepositTransaction\`, \`BalanceInquiry\` implement a common \`execute()\` so the state machine doesn't need a growing if/else per transaction type.

## 4. Deep Dive: Correctness Over Convenience
The hardest real requirement: **the bank balance must be debited if and only if cash is actually dispensed.** If the ATM debits the account then loses power before dispensing cash, the customer loses money with nothing to show for it. The standard fix mirrors a database *Transaction* — treat "debit account" + "dispense cash" as a single logical unit, reconciled via a pending-transaction log that's checked and resolved (refund if cash wasn't confirmed dispensed) on ATM restart.

## Common Interview Follow-ups
- *"How do you handle running out of physical cash denominations?"* — the dispenser needs a "can I make this amount with available bills?" check before ever committing to the transaction (a coin-change-style algorithm).
- *"How would you support multiple banks at one ATM?"* — \`BankInterface\` is already an abstraction point; route to the correct bank's implementation based on the card's issuer.
- *"What happens if the network to the bank is down mid-transaction?"* — fail safely: never dispense cash without a confirmed authorization response.
		`
	},
	'Snake & Ladder': {
		definition:
			'A classic LLD problem: design the game engine for Snake and Ladder — board setup, dice rolls, and turn-based movement including snake/ladder jumps.',
		useCase: 'A lighter-weight LLD problem often used to test clean turn-based game-loop design.',
		detailedMarkdown: `
# Design Snake & Ladder

## 1. Requirements Gathering
**Functional:**
- A board of N cells (typically 100), some cells are the head of a "snake" (jump down) or the foot of a "ladder" (jump up).
- Players take turns rolling a die and moving forward; landing exactly on a snake/ladder cell triggers the jump.
- First player to reach the final cell wins.

**Non-functional:**
- Easily support different board sizes/snake-ladder configurations without code changes.

## 2. Core Entities / Class Design
\`\`\`typescript
class Jump {
  constructor(public start: number, public end: number) {} // end < start = snake, end > start = ladder
}

class Board {
  private jumps = new Map<number, number>();
  constructor(size: number, jumps: Jump[]) {
    jumps.forEach(j => this.jumps.set(j.start, j.end));
  }
  getFinalPosition(cell: number): number {
    return this.jumps.get(cell) ?? cell;
  }
}

class Player {
  position = 0;
  constructor(public name: string) {}
}

class Dice {
  roll(): number { return Math.floor(Math.random() * 6) + 1; }
}

class Game {
  private currentPlayerIdx = 0;
  constructor(private board: Board, private players: Player[], private dice: Dice, private boardSize: number) {}

  playTurn(): Player | null {
    const player = this.players[this.currentPlayerIdx];
    const roll = this.dice.roll();
    let newPos = player.position + roll;
    if (newPos <= this.boardSize) {
      player.position = this.board.getFinalPosition(newPos);
    }
    if (player.position === this.boardSize) return player; // winner
    this.currentPlayerIdx = (this.currentPlayerIdx + 1) % this.players.length;
    return null;
  }
}
\`\`\`

## 3. Key Design Decisions
- **Snakes and ladders unified as one "Jump" concept** — a jump going down (snake) and a jump going up (ladder) are the exact same mechanic from the engine's point of view; modeling them as one \`Jump(start, end)\` avoids duplicated logic and awkward "if snake... else if ladder..." branching.
- **Board owns jump resolution, Game owns turn order** — clean separation lets you unit-test "does landing on cell 17 correctly move me to cell 4?" completely independently of whose turn it is.

## 4. Handling the Tricky Part: Overshoot Rule
A common rule: if a roll would take a player *past* the final cell, the move is invalid and the turn passes without moving (as implemented above via the \`newPos <= boardSize\` check). This is exactly the kind of small edge case interviewers watch for — missing it means the game can "win" by overshooting, which most real Snake & Ladder rules disallow.

## Common Interview Follow-ups
- *"How would you support more than 2 dice, or a rule like 'roll 6 to go again'?"* — make \`Dice\` pluggable (interface) and add the "extra turn" check as a rule object the \`Game\` loop consults, rather than hardcoding it.
- *"How would you detect an infinite loop of snake/ladder combos?"* — validate the board configuration upfront (no jump should point to another jump's start) rather than handling it at runtime.
- *"How would you make this multiplayer over a network?"* — separate the pure game-state logic (as above) from I/O entirely, so it can be driven by network events instead of a local loop — a good chance to mention this ties into the *Chat Application*/WebSocket concepts elsewhere in the app.
		`
	},
	Chess: {
		definition:
			'A classic LLD problem: design a chess engine — the board, pieces, legal move validation, and check/checkmate detection.',
		useCase:
			'One of the richest LLD problems, testing polymorphism and rule-engine design under real complexity.',
		detailedMarkdown: `
# Design a Chess Game

## 1. Requirements Gathering
**Functional:**
- An 8x8 board with 6 piece types, each with distinct movement rules.
- Validate that a proposed move is legal (piece-specific movement + not moving through/into an illegal state).
- Detect check, checkmate, and stalemate.

**Non-functional:**
- Extensible enough to add variants (e.g. different board sizes) without a rewrite. Most interviews explicitly scope out full chess-engine AI — focus on rules and state, not "best move" search.

## 2. Core Entities / Class Design
\`\`\`typescript
abstract class Piece {
  constructor(public color: 'WHITE' | 'BLACK', public position: Position) {}
  abstract isValidMove(board: Board, to: Position): boolean;
}

class Bishop extends Piece {
  isValidMove(board: Board, to: Position): boolean {
    const dx = Math.abs(to.col - this.position.col);
    const dy = Math.abs(to.row - this.position.row);
    return dx === dy && board.isPathClear(this.position, to);
  }
}

class Knight extends Piece {
  isValidMove(board: Board, to: Position): boolean {
    const dx = Math.abs(to.col - this.position.col);
    const dy = Math.abs(to.row - this.position.row);
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1); // knights jump, no path check
  }
}

class Board {
  private grid: (Piece | null)[][] = /* 8x8 */ [];
  isPathClear(from: Position, to: Position): boolean { /* walk the line between from/to */ return true; }
  movePiece(piece: Piece, to: Position) { /* update grid, capture, etc. */ }
}

class ChessGame {
  makeMove(piece: Piece, to: Position): boolean {
    if (!piece.isValidMove(this.board, to)) return false;
    this.board.movePiece(piece, to);
    return true;
  }
}
\`\`\`

## 3. Key Design Decisions
- **Strategy/polymorphism for movement rules** — every \`Piece\` subclass implements \`isValidMove\` independently. This is the single most important structural decision: it avoids one giant \`if (piece.type === 'BISHOP') ... else if ...\` function, and each piece's rule is unit-testable in isolation.
- **Board owns path-clearing, not pieces** — a \`Knight\` never needs to check for blocking pieces (it jumps), while a \`Bishop\`/\`Rook\`/\`Queen\` do — keeping \`isPathClear\` as a shared \`Board\` method avoids duplicating that logic across 3 piece classes.

## 4. Deep Dive: Check & Checkmate Detection
**Check**: after any move, scan whether the moving side's opponent's king is now attacked — i.e., does *any* opposing piece have a legal move landing on the king's square?

**Checkmate**: check is true, *and* the player has no legal move (across every piece they own) that results in their king no longer being in check. This means checkmate detection has to simulate each candidate move and re-check — computationally the most expensive part of a correct implementation, which is exactly why real engines optimize this path heavily. In an interview, describing this simulate-and-check approach clearly is usually sufficient; you're not expected to hand-optimize it live.

## Common Interview Follow-ups
- *"How would you implement castling or en passant?"* — these are special-cased moves; a clean way is a small \`SpecialMoveRule\` list checked alongside each piece's normal \`isValidMove\`, rather than hacking them into the base \`Piece\` class.
- *"How would you support undo?"* — the *Command* pattern fits naturally: each move is a \`Command\` object capturing enough state (captured piece, prior position) to reverse itself.
- *"How would you detect a draw by repetition?"* — hash the board state after each move and count occurrences; three identical states is a draw.
		`
	},
	Cricbuzz: {
		definition:
			'A classic LLD problem: design a live cricket score tracking system that ingests ball-by-ball events and pushes live updates to subscribers.',
		useCase:
			'Tests real-time event modeling and the fan-out/notification problem under high read concurrency.',
		detailedMarkdown: `
# Design a Live Cricket Scoring System (Cricbuzz-style)

## 1. Requirements Gathering
**Functional:**
- Ingest ball-by-ball events (runs, wicket, extras) for an ongoing match.
- Maintain live match state: score, overs, current batsmen/bowler, recent balls.
- Push live score updates to potentially millions of concurrently-watching users.

**Non-functional:**
- Extremely read-heavy (millions of viewers per few dozen event writers) — the read path must scale independently of the write path.
- Low-latency propagation of each ball event to subscribers.

## 2. Core Entities / Class Design
\`\`\`typescript
enum BallEventType { RUN, WICKET, WIDE, NO_BALL, BYE }

class BallEvent {
  constructor(
    public over: number,
    public ballInOver: number,
    public type: BallEventType,
    public runs: number
  ) {}
}

interface ScoreSubscriber {
  onScoreUpdate(match: Match): void;
}

class Innings {
  totalRuns = 0;
  wickets = 0;
  events: BallEvent[] = [];
  addEvent(e: BallEvent) {
    this.events.push(e);
    this.totalRuns += e.runs;
    if (e.type === BallEventType.WICKET) this.wickets++;
  }
}

class Match {
  private subscribers: ScoreSubscriber[] = [];
  constructor(public innings: Innings[]) {}

  subscribe(sub: ScoreSubscriber) { this.subscribers.push(sub); }
  recordBall(inningsIdx: number, event: BallEvent) {
    this.innings[inningsIdx].addEvent(event);
    this.subscribers.forEach(s => s.onScoreUpdate(this));
  }
}
\`\`\`

## 3. Key Design Decisions
- **Observer pattern for live updates** — \`Match\` is the subject; anything watching (a WebSocket connection handler, a push-notification service) subscribes and gets notified per ball, rather than polling for changes.
- **Ball-by-ball events as an append-only log** — \`Innings.events\` is never mutated, only appended to. This gives you a free audit trail and makes it trivial to reconstruct "what was the score after over 12.3?" by replaying events up to that point.
- **Separate the write path (few, official scorers) from the read/fan-out path (millions of viewers)** — the actual scoring input has low write volume; the challenge is entirely on the distribution side.

## 4. Deep Dive: Fan-Out to Millions of Viewers
Directly notifying millions of individual \`ScoreSubscriber\`s from one process doesn't scale. The real-world pattern layers on top of the Observer idea from the app's *System Design* section:
1. The scoring service publishes each ball event to a **Pub/Sub** topic (not directly to viewer connections).
2. A fleet of stateless "fan-out" servers, each holding a slice of WebSocket connections, subscribes to that topic and relays updates to *their* connected viewers.
3. A **CDN**/edge cache can serve the "current score" as a fast-refreshing polled value for viewers who don't need a live WebSocket (e.g. a scoreboard widget), further cutting direct fan-out load.

## Common Interview Follow-ups
- *"How do you handle a viewer joining mid-match?"* — send the current cumulative \`Match\` snapshot on connect, then stream only new events after that — never require replaying the entire ball-by-ball history over the wire.
- *"How do you handle out-of-order or corrected events (e.g. an umpire's decision overturned on review)?"* — model corrections as new events referencing the original (a compensating event), rather than mutating history, consistent with the append-only log design.
- *"How would you scale to many simultaneous matches?"* — shard by match ID — each match's event stream and subscriber fan-out is fully independent of every other match's.
		`
	},
	'Hotel Booking': {
		definition:
			'A classic LLD problem: design a hotel reservation system managing room types, availability search across date ranges, and booking without overbooking.',
		useCase:
			'Tests date-range modeling and safe concurrent booking, similar in spirit to Movie Booking seat-locking.',
		detailedMarkdown: `
# Design a Hotel Booking System

## 1. Requirements Gathering
**Functional:**
- Search room availability across a date range and room type.
- Book a room for a specific date range; view/cancel existing bookings.
- Support multiple room types per hotel (Standard, Deluxe, Suite) with different pricing.

**Non-functional:**
- Never allow two overlapping bookings for the same physical room (no overbooking).

## 2. Core Entities / Class Design
\`\`\`typescript
class RoomType {
  constructor(public name: string, public basePrice: number) {}
}

class Room {
  constructor(public id: string, public type: RoomType, public hotelId: string) {}
}

class DateRange {
  constructor(public checkIn: Date, public checkOut: Date) {}
  overlaps(other: DateRange): boolean {
    return this.checkIn < other.checkOut && other.checkIn < this.checkOut;
  }
}

class Booking {
  constructor(public room: Room, public guest: Guest, public dates: DateRange) {}
}

class BookingService {
  private bookings: Booking[] = [];

  isRoomAvailable(room: Room, dates: DateRange): boolean {
    return !this.bookings.some(b => b.room.id === room.id && b.dates.overlaps(dates));
  }

  book(room: Room, guest: Guest, dates: DateRange): Booking {
    if (!this.isRoomAvailable(room, dates)) throw new Error('Room not available for these dates');
    const booking = new Booking(room, guest, dates);
    this.bookings.push(booking);
    return booking;
  }
}
\`\`\`

## 3. Key Design Decisions
- **DateRange as a first-class value object with an \`overlaps()\` method** — this centralizes the one piece of logic the entire system's correctness depends on, so it's written once, tested thoroughly, and reused everywhere (availability search, booking, cancellation refund rules).
- **Availability search operates over RoomType, booking operates over a specific Room** — a guest searches "any Deluxe room available these dates," but the actual reservation must pin down one specific physical room; conflating the two levels is a common design mistake in this problem.

## 4. Deep Dive: Preventing Overbooking Under Concurrency
The check-then-book sequence above (\`isRoomAvailable\` then \`book\`) has the exact same race condition as the *Movie Booking* seat-locking problem: two requests can both pass the availability check before either commits. The fix is the same family of solution — make check-and-reserve **atomic**, typically via a database-level constraint (a \`UNIQUE\` or exclusion constraint on \`(room_id, date_range)\` using a range type, so the database itself rejects an overlapping insert) rather than trusting application-level sequencing alone.

## Common Interview Follow-ups
- *"How do you search availability efficiently across thousands of rooms and a date range?"* — an interval-tree or range-indexed structure per room (or a database range index) so you don't linearly scan every booking for every room on every search.
- *"How would you support dynamic pricing (higher price on weekends/holidays)?"* — a *Strategy* for pricing, parameterized by date, computed at booking time rather than a single static \`basePrice\`.
- *"How do you handle cancellations and refund policy?"* — attach a cancellation policy (free until N days before check-in, partial refund after) as its own rule object evaluated against the booking's dates and the cancellation timestamp.
		`
	}
};
