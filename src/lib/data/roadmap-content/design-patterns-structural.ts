import type { RoadmapDetailMap } from './types';

/**
 * TOPICS TO COVER IN THIS FILE (fill in every one as a key below):
  // - Adapter
  // - Decorator
  // - Facade
  // - Proxy
  // - Composite
  // - Bridge
 */
export const DesignPatternsStructuralContent: RoadmapDetailMap = {
	Adapter: {
		definition:
			'A structural design pattern that converts the interface of a class into another interface that clients expect, letting otherwise incompatible classes work together.',
		useCase:
			'Plugging a legacy analytics SDK with a clunky, old-style API into a modern app that only knows how to talk to a clean, standardized Logger interface.',
		detailedMarkdown: `
# Adapter Pattern

The **Adapter** pattern acts as a translator between two interfaces that were never designed to work together. It wraps an "incompatible" object and exposes the interface your code actually expects, without touching either side's original source.

## The Problem
Imagine your application is built entirely around a modern \`Printer\` interface with a single method, \`print(text: string)\`. Now you need to support an old, third-party \`OldPrinter\` class that only exposes \`printOldFormat(data: string, isDoubleSided: boolean)\`. You can't rewrite the vendor's class (you may not even have the source), and littering your checkout/report code with special-case \`if (printer instanceof OldPrinter)\` branches would violate the Open/Closed Principle and make every call site aware of a detail it shouldn't care about.

## The Solution
Create an **Adapter** class that implements the interface your client code expects (\`Printer\`), and internally holds a reference to the incompatible object (\`OldPrinter\`). The adapter's job is purely translation: it receives calls in the "new" shape and re-issues them in the "old" shape.

## Code Example (TypeScript)
\`\`\`typescript
// The interface our application understands
interface Printer {
    print(text: string): void;
}

// The incompatible, legacy class we cannot modify
class OldPrinter {
    printOldFormat(data: string, isDoubleSided: boolean): void {
        console.log('[Legacy] Printing: ' + data + ' (double-sided: ' + isDoubleSided + ')');
    }
}

// The Adapter bridges the gap
class OldPrinterAdapter implements Printer {
    constructor(private legacyPrinter: OldPrinter) {}

    print(text: string): void {
        // Translate the modern call into the legacy call the old class understands
        this.legacyPrinter.printOldFormat(text, false);
    }
}

// Client code only ever talks to the "Printer" interface
function printDocument(printer: Printer, text: string) {
    printer.print(text);
}

const legacy = new OldPrinter();
const adapter = new OldPrinterAdapter(legacy);
printDocument(adapter, 'Quarterly Report'); // Client has no idea it's using a legacy printer
\`\`\`

## Real-World Analogy
Think of a **power plug adapter**. A laptop charger built for a US-style plug can't physically fit into a European wall socket. You don't rewire your house or redesign the charger — you plug a small adapter block in between. The adapter doesn't change how electricity works on either side; it simply reshapes the interface (the plug pins) so the two incompatible standards can connect.

## Object Adapter vs Class Adapter
- **Object Adapter** (shown above) uses composition — the adapter *holds* an instance of the adaptee. This is the more common and flexible approach in TypeScript/JavaScript since it works even with adaptees that are \`final\`/sealed, and one adapter can wrap multiple different adaptee subtypes.
- **Class Adapter** uses inheritance — the adapter extends the adaptee and implements the target interface simultaneously. This requires multiple inheritance (available in languages like C++, but not directly in TypeScript), so it's rarely used here.

## When to Use It
- You want to use an existing class, but its interface doesn't match what the rest of your code expects.
- You're integrating a third-party library or legacy code you cannot or should not modify.
- You want to create a reusable class that cooperates with classes that don't necessarily share a common interface.

Avoid overusing Adapter as a permanent fix — if you control both sides of the interface, it's cleaner to simply align them. Adapter shines specifically when one side is fixed and out of your control.
	`
	},
	Decorator: {
		definition:
			'A structural design pattern that lets you attach new behaviors to objects dynamically by wrapping them in special "decorator" objects that share the same interface.',
		useCase:
			'Building a coffee shop ordering system where a customer can add any combination of milk, sugar, or whipped cream to a base coffee, each adding its own cost and description at runtime.',
		detailedMarkdown: `
# Decorator Pattern

The **Decorator** pattern lets you add responsibilities to an individual object, dynamically, without affecting other instances of the same class. It works by wrapping the original object inside one or more "decorator" objects that implement the same interface and forward calls to the wrapped object — adding their own behavior before or after.

## The Problem
Say you're building a coffee shop app. You start with a \`Coffee\` class. Then customers want milk. So you create \`CoffeeWithMilk\`. Then sugar: \`CoffeeWithSugar\`, \`CoffeeWithMilkAndSugar\`, \`CoffeeWithMilkAndSugarAndWhippedCream\`... You quickly get a **combinatorial explosion of subclasses** — one for every possible combination of add-ons. Using inheritance to model "optional extras" doesn't scale, and the extras can't be added or removed at runtime.

## The Solution
Instead of subclassing for every combination, define a common \`Coffee\` interface. Build one concrete base class (\`SimpleCoffee\`), and then a set of **decorator classes** (\`MilkDecorator\`, \`SugarDecorator\`) that also implement \`Coffee\` but wrap another \`Coffee\` instance internally. Each decorator calls through to the wrapped object and layers on its own cost/description. Because decorators implement the same interface they wrap, you can stack them in any order, any number of times.

## Code Example (TypeScript)
\`\`\`typescript
interface Coffee {
    cost(): number;
    description(): string;
}

class SimpleCoffee implements Coffee {
    cost(): number { return 2.0; }
    description(): string { return 'Coffee'; }
}

// Base decorator: implements Coffee and holds a reference to another Coffee
abstract class CoffeeDecorator implements Coffee {
    constructor(protected wrapped: Coffee) {}
    abstract cost(): number;
    abstract description(): string;
}

class MilkDecorator extends CoffeeDecorator {
    cost(): number { return this.wrapped.cost() + 0.5; }
    description(): string { return this.wrapped.description() + ' + Milk'; }
}

class SugarDecorator extends CoffeeDecorator {
    cost(): number { return this.wrapped.cost() + 0.25; }
    description(): string { return this.wrapped.description() + ' + Sugar'; }
}

// Stack decorators freely, at runtime, in any combination
let order: Coffee = new SimpleCoffee();
order = new MilkDecorator(order);
order = new SugarDecorator(order);

console.log(order.description()); // "Coffee + Milk + Sugar"
console.log(order.cost());        // 2.75
\`\`\`

Notice that \`order\` is still just a \`Coffee\` as far as any client code is concerned — it doesn't know or care that it's actually three nested objects.

## Decorator vs Inheritance
Inheritance extends behavior **statically**, at compile time, and applies to an entire class. Decorator extends behavior **dynamically**, at runtime, and applies to a single object instance. You could give one customer's coffee milk and sugar while another customer's plain \`SimpleCoffee\` object is untouched — inheritance can't express "this one specific object, right now" the way composition-based decoration can. This is a direct application of the principle "favor composition over inheritance."

## When to Use It
- You need to add responsibilities to individual objects dynamically, without affecting other objects of the same class.
- Extending behavior via subclassing would be impractical because of the sheer number of independent combinations.
- You want responsibilities that can be added and withdrawn at runtime.

Common real-world examples include Java I/O streams (\`BufferedReader\` wrapping a \`FileReader\`), UI toolkits adding scrollbars/borders to widgets, and HTTP middleware chains that each add logging, auth, or compression around a base request handler.
	`
	},
	Facade: {
		definition:
			'A structural design pattern that provides a simplified, unified, higher-level interface to a complex set of classes, libraries, or subsystems.',
		useCase:
			'Exposing a single convertVideo(file, format) method that hides away separate codec, audio-extraction, bitrate-compression, and file-writing subsystems the client should never need to touch directly.',
		detailedMarkdown: `
# Facade Pattern

The **Facade** pattern gives you a simple front door into a subsystem that, behind the scenes, may involve dozens of interacting classes. The client talks to one clean object; the facade talks to everything else.

## The Problem
A real video conversion library isn't one class — it's likely dozens: codec selectors, bitrate managers, audio extractors, subtitle mixers, file writers, and more. If client code (say, an upload handler in your web app) has to correctly instantiate and orchestrate all of those classes in the right order just to convert one file, then:
- Every place that needs conversion becomes tightly coupled to the internal structure of the video library.
- Client code becomes verbose and error-prone (easy to call things in the wrong order).
- If the subsystem's internals change, every call site that talks to it directly might break.

## The Solution
Introduce a **Facade** class that exposes a small number of high-level methods (e.g. \`convertToMp4\`) and internally does all the heavy lifting of talking to the codec, audio, and video subsystems in the correct sequence. Client code only ever depends on the facade — never on the subsystem classes directly.

## Code Example (TypeScript)
\`\`\`typescript
// --- Complex subsystem (many moving parts) ---
class CodecFactory {
    extract(file: string): string { return 'raw-codec-data-for-' + file; }
}

class AudioMixer {
    normalize(codecData: string): string { return codecData + '::audio-normalized'; }
}

class BitrateCompressor {
    compress(data: string, quality: 'low' | 'high'): string {
        return data + '::compressed-' + quality;
    }
}

class FileWriter {
    write(data: string, outputPath: string): void {
        console.log('Wrote "' + data + '" to ' + outputPath);
    }
}

// --- Facade: the ONE thing client code talks to ---
class VideoConverterFacade {
    private codecFactory = new CodecFactory();
    private audioMixer = new AudioMixer();
    private compressor = new BitrateCompressor();
    private writer = new FileWriter();

    convertToMp4(inputFile: string, outputFile: string): void {
        const codecData = this.codecFactory.extract(inputFile);
        const mixed = this.audioMixer.normalize(codecData);
        const compressed = this.compressor.compress(mixed, 'high');
        this.writer.write(compressed, outputFile);
    }
}

// --- Client code: blissfully unaware of the subsystem ---
const converter = new VideoConverterFacade();
converter.convertToMp4('lecture.mov', 'lecture.mp4');
\`\`\`

The client calls one method, \`convertToMp4\`, and never has to know that four different subsystem classes were coordinated to make it happen.

## Why It Reduces Coupling
Without the facade, every caller that needs conversion would import and understand \`CodecFactory\`, \`AudioMixer\`, \`BitrateCompressor\`, and \`FileWriter\` — meaning four classes' worth of implementation detail leaking into unrelated parts of your app. With the facade:
- There's exactly **one** dependency for callers: \`VideoConverterFacade\`.
- The subsystem is free to be refactored, re-ordered, or have new steps added, as long as the facade's public methods keep their contract.
- Testing and mocking become simpler — you can mock the single facade in tests for calling code, rather than mocking four subsystem classes.

## Facade vs Adapter
It's easy to confuse these because both "wrap" something. **Adapter** makes one incompatible interface *look like* another interface a client already expects (a 1-to-1 translation). **Facade** doesn't translate — it *simplifies* by providing a new, smaller interface over many classes at once (a many-to-1 simplification). A facade can even be built on top of an adapter.

## When to Use It
- You want a simple entry point into a complex subsystem with many interdependent classes.
- You want to layer your code — the facade sits between high-level client logic and low-level subsystem details, reducing the number of things any given layer needs to know about.
- You're wrapping a poorly designed or overly complex third-party API with something cleaner that fits your codebase's conventions.
	`
	},
	Proxy: {
		definition:
			'A structural design pattern that provides a stand-in object which controls access to another object, letting you run code before or after the request reaches the original.',
		useCase:
			'Building a lazy-loading ImageProxy in a photo gallery app so a large image file is only read from disk and decoded the first time it actually needs to be rendered, not when the gallery list is built.',
		detailedMarkdown: `
# Proxy Pattern

The **Proxy** pattern gives you an object that implements the exact same interface as a "real" object, but sits in front of it to control access — adding lazy initialization, permission checks, caching, logging, or network indirection, all without the client knowing the difference.

## The Problem
Suppose your app renders a gallery of high-resolution images. If you eagerly load and decode every full-size image the moment the gallery list is constructed, you pay a huge memory and I/O cost up front — even for images the user may never scroll to see. You want the real, expensive \`RealImage\` object to be created only when it's actually needed, but you don't want every part of your rendering code to be cluttered with "has this loaded yet?" checks.

## The Solution
Create an \`ImageProxy\` that implements the same \`Image\` interface as \`RealImage\`. The proxy holds only a file path at first. The first time \`display()\` is called, the proxy lazily constructs the real, expensive object and delegates to it. Every subsequent call reuses the already-loaded real object. To the client, the proxy is indistinguishable from the real thing.

## Code Example (TypeScript)
\`\`\`typescript
interface Image {
    display(): void;
}

// The "real" object — expensive to create
class RealImage implements Image {
    constructor(private filename: string) {
        this.loadFromDisk();
    }
    private loadFromDisk(): void {
        console.log('Loading ' + this.filename + ' from disk (expensive!)');
    }
    display(): void {
        console.log('Displaying ' + this.filename);
    }
}

// The Proxy — cheap to create, defers the real work
class ImageProxy implements Image {
    private realImage: RealImage | null = null;

    constructor(private filename: string) {}

    display(): void {
        if (this.realImage === null) {
            this.realImage = new RealImage(this.filename); // created only on first use
        }
        this.realImage.display();
    }
}

// Client code
const gallery: Image[] = [
    new ImageProxy('sunset.png'),
    new ImageProxy('mountains.png')
];

// Nothing has been loaded from disk yet!
console.log('Gallery built. No images loaded.');

// Loading happens only now, and only for the one the user actually views:
gallery[0].display();
\`\`\`

## Common Types of Proxy
- **Virtual Proxy** — defers creation of an expensive object until it's actually needed (the \`ImageProxy\` above).
- **Protection Proxy** — checks permissions before forwarding a request to the real object, e.g. a \`BankAccountProxy\` that verifies the caller is authenticated before allowing \`withdraw()\` to reach the real \`BankAccount\`.
- **Remote Proxy** — represents an object that lives in a different address space (another process or server), handling network communication behind a local-looking interface. This is essentially what gRPC/RPC client stubs are.
- **Caching Proxy** — stores results of expensive operations and returns the cached result for repeated requests instead of recomputing.
- **Logging Proxy** — records information (arguments, timing) about calls before forwarding them, useful for debugging or auditing.

## Proxy vs Decorator
Both wrap an object behind the same interface, which is why they're often confused. The distinction is *intent*: **Decorator** adds new behavior/responsibilities to an object the client already has full, unrestricted access to. **Proxy** controls or manages *access* to an object the client shouldn't (or can't, yet) reach directly — the interface stays identical, but the proxy's job is gatekeeping, not feature addition.

## When to Use It
- You need lazy initialization of a resource-heavy object (virtual proxy).
- You need to control or restrict access to an object based on permissions (protection proxy).
- You're wrapping a remote resource behind a local-feeling interface (remote proxy).
- You want to add caching or logging around calls to an object transparently, without changing the object itself or its clients.
	`
	},
	Composite: {
		definition:
			'A structural design pattern that lets you compose objects into tree structures and then treat individual objects and entire compositions of objects through the exact same interface.',
		useCase:
			'Modeling a file system where you need to compute the total size of an arbitrary folder — one that may itself contain files and other nested folders — without writing separate logic for "single file" versus "folder of things."',
		detailedMarkdown: `
# Composite Pattern

The **Composite** pattern organizes objects into a tree, where both leaf nodes (simple objects) and branch nodes (containers of other objects, including other containers) implement one shared interface. Client code doesn't need to know or care whether it's holding a single leaf or an entire subtree — it just calls the same method either way.

## The Problem
Model a file system: a \`File\` has a name and a size. A \`Folder\` has a name and contains other files and folders. Now you want a \`getSize()\` operation that works on anything — a lone file, or a deeply nested folder tree. Without a shared abstraction, client code ends up littered with type checks: "if this is a File, return its size; if it's a Folder, loop over children and recursively sum" — and that branching logic has to be duplicated everywhere a size is needed (rendering a tree view, computing disk usage, exporting a zip, etc).

## The Solution
Define a common \`FileSystemItem\` interface with a \`getSize()\` method (and anything else both files and folders need, like \`getName()\`). \`File\` implements it directly. \`Folder\` also implements it — but its \`getSize()\` simply asks each of its children for *their* size and sums them, recursively. A folder's children can themselves be folders, and the recursion naturally handles trees of any depth.

## Code Example (TypeScript)
\`\`\`typescript
interface FileSystemItem {
    getName(): string;
    getSize(): number;
}

// Leaf: a simple object with no children
class File implements FileSystemItem {
    constructor(private name: string, private size: number) {}
    getName(): string { return this.name; }
    getSize(): number { return this.size; }
}

// Composite: a container that holds other FileSystemItems (leaves OR composites)
class Folder implements FileSystemItem {
    private children: FileSystemItem[] = [];

    constructor(private name: string) {}

    add(item: FileSystemItem): void {
        this.children.push(item);
    }

    getName(): string { return this.name; }

    getSize(): number {
        // Delegate to children and sum — works no matter how deep the tree is
        return this.children.reduce((total, child) => total + child.getSize(), 0);
    }
}

// Build a small tree
const readme = new File('README.md', 2);
const indexTs = new File('index.ts', 5);
const srcFolder = new Folder('src');
srcFolder.add(indexTs);

const projectRoot = new Folder('project');
projectRoot.add(readme);
projectRoot.add(srcFolder); // a Folder added inside a Folder — recursion just works

console.log(projectRoot.getSize()); // 7 — no special-casing needed anywhere
\`\`\`

Client code that calls \`projectRoot.getSize()\` never needs an \`if (item instanceof File)\` check. \`File\` and \`Folder\` are both just \`FileSystemItem\`s.

## Why Treat Leaves and Composites Uniformly?
This uniformity is the entire point of the pattern. Any operation you add to the interface — \`getName()\`, \`render()\`, \`delete()\`, \`export()\` — automatically works correctly on single items and entire trees, because a composite's implementation simply forwards the call down to its children. New client code never has to be taught how to walk the tree; the tree walks itself.

## When to Use It
- Your domain is naturally a **part-whole hierarchy** — file systems, UI component trees (a \`Panel\` containing \`Button\`s and other \`Panel\`s), org charts, menu structures, graphics scenes made of shapes and groups of shapes.
- You want client code to treat simple and complex elements identically, ignoring the differences between them wherever possible.
- Operations need to cascade recursively down a tree (e.g. rendering, permission checks, total-cost calculations).

Be mindful of one trade-off: because the interface has to be broad enough to cover both leaves and composites, some methods (like \`add()\`/\`remove()\`) may not make sense on a leaf and need sensible no-op or error-throwing defaults.
	`
	},
	Bridge: {
		definition:
			'A structural design pattern that splits a large class (or a set of closely related classes) into two separate hierarchies — abstraction and implementation — that can be developed and varied independently of each other.',
		useCase:
			'Building a RemoteControl abstraction (basic, advanced) that can operate any Device implementation (TV, Radio, SmartSpeaker) without creating a separate class for every remote-times-device combination.',
		detailedMarkdown: `
# Bridge Pattern

The **Bridge** pattern decouples an abstraction (the "what") from its implementation (the "how"), putting each in its own class hierarchy connected by composition rather than inheritance. Both hierarchies can then grow independently — new abstractions don't require touching implementations, and vice versa.

## The Problem
Say you're modeling remote controls for devices. You start with a \`RemoteControl\` base class and a \`TVRemoteControl\` subclass. Then you need an \`AdvancedRemoteControl\` (adds a mute button) for TVs, so you write \`AdvancedTVRemoteControl\`. Then a \`Radio\` shows up, so you need \`RadioRemoteControl\` and \`AdvancedRadioRemoteControl\`. Add a \`SmartSpeaker\` and a third remote variant, and the number of subclasses explodes multiplicatively: **(number of remote types) × (number of device types)**. This is the same combinatorial explosion problem Decorator solves for optional features — except here it's two independent dimensions of variation (control complexity, and device type) crammed into one inheritance chain.

## The Solution
Split the two dimensions into two separate hierarchies:
1. **Abstraction** — \`RemoteControl\` and its subclass \`AdvancedRemoteControl\`, describing *what a remote can do*.
2. **Implementation** — a \`Device\` interface with concrete \`TV\` and \`Radio\` classes, describing *how a device actually responds*.

The abstraction holds a **reference** to an implementation object (composition, not inheritance) and delegates the low-level work to it. Now any remote can be paired with any device at runtime, and adding a new remote type or a new device type requires writing exactly one new class — not a whole new grid of combinations.

## Code Example (TypeScript)
\`\`\`typescript
// --- Implementation hierarchy: "how" ---
interface Device {
    turnOn(): void;
    turnOff(): void;
    setVolume(percent: number): void;
}

class TV implements Device {
    turnOn(): void { console.log('TV: powering on'); }
    turnOff(): void { console.log('TV: powering off'); }
    setVolume(percent: number): void { console.log('TV: volume set to ' + percent + '%'); }
}

class Radio implements Device {
    turnOn(): void { console.log('Radio: powering on'); }
    turnOff(): void { console.log('Radio: powering off'); }
    setVolume(percent: number): void { console.log('Radio: volume set to ' + percent + '%'); }
}

// --- Abstraction hierarchy: "what" ---
class RemoteControl {
    constructor(protected device: Device) {} // bridge: holds a reference, doesn't inherit

    togglePower(isOn: boolean): void {
        isOn ? this.device.turnOn() : this.device.turnOff();
    }

    volumeUp(): void {
        this.device.setVolume(75);
    }
}

class AdvancedRemoteControl extends RemoteControl {
    mute(): void {
        this.device.setVolume(0);
    }
}

// Any remote works with any device — no combinatorial subclassing
const basicOnTv = new RemoteControl(new TV());
basicOnTv.togglePower(true);

const advancedOnRadio = new AdvancedRemoteControl(new Radio());
advancedOnRadio.togglePower(true);
advancedOnRadio.mute();
\`\`\`

Adding a \`SmartSpeaker\` device or a \`VoiceRemoteControl\` abstraction each requires exactly one new class, and they immediately work with everything on the other side of the bridge.

## Bridge vs Adapter
These are structurally similar (both involve one object holding/delegating to another) but solve opposite problems and appear at different times in a project's life:

| | **Adapter** | **Bridge** |
|---|---|---|
| **When applied** | After the fact — the two interfaces already exist and don't match | Up front — designed from the start to let two dimensions vary independently |
| **Intent** | Make incompatible interfaces work together | Prevent an interface from being tied to one specific implementation |
| **Typical use** | Wrapping legacy code or third-party libraries | Cross-platform code, driver/device abstractions, UI toolkits with multiple rendering backends |
| **Number of interfaces involved** | Usually reconciles exactly two mismatched interfaces | Deliberately maintains two independent hierarchies (abstraction + implementation) |

In short: reach for **Adapter** when you're stuck retrofitting compatibility onto existing, unrelated code. Reach for **Bridge** when you're designing something new and can already foresee it needs to vary along two separate axes.

## When to Use It
- You want to avoid a permanent binding between an abstraction and one specific implementation (e.g. swapping a rendering engine, database driver, or platform-specific API at runtime or via configuration).
- Both the abstraction and the implementation need to be extensible via subclassing, independently of each other.
- Changes in the implementation should have zero impact on client code that only depends on the abstraction.
	`
	}
};
