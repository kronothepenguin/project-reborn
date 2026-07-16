# Feature Specification: Director Runtime

**Feature Branch**: `001-director-runtime`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Create a Macromedia Director MX 2004 runtime as its own package at @packages/director/. Use the Director documentation to build a runtime that is 1:1 to the original Lingo: core objects, scripting objects, and the extra data-types Director provides. Focus on Lingo-to-JavaScript code — implement the Director Lingo API for JavaScript. No .dcr/.dir/.cct/.cst file formats; every movie is a JS bundle exporting a movie/cast definition (a data structure describing the virtual space of movies, casts, members). Custom elements <x-object>, <x-embed>, <x-param> simulate the HTML4 <object>/<embed>/<param> + NPAPI plugin behavior. Builder-pattern helpers define the virtual space. Public properties only (no # private syntax). Keep classes clean per docs — no static methods/subsystems unless docs explicitly mention them; if a subsystem is needed, stop, stub, build + document the shared subsystem, and make all code use it. Do not implement anything not mentioned in the docs. Priority ordering: 1) data types, 2) context + subsystems to make core objects work, 3) core & scripting objects, 4) media-type member subclasses (implement included, stub excluded), 5) public Director API — top-level methods and singleton properties, 6) packaging system (builder pattern), 7) imperative runtime API, 8) custom elements (built on the imperative API). @/lingo exports the Director public API only; @/browser exports packaging + imperative runtime + custom elements; the package root exports everything. Out of scope: Lingo-to-JS translation, binary Director/Shockwave file formats."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Director Data-Types (Priority: P1)

A developer (or translated Lingo script) imports the Director data-types from `@project-reborn/director/lingo` and uses them exactly as described by the Macromedia Director MX 2004 documentation. Some types map directly to JavaScript natives where the docs support it; others require their own representation built strictly per the docs. The runtime implements the five documented Director data-types: `Color`, `List`, `PropList`, `Point`, and `Rect`.

**Why this priority**: Data-types are the foundational building blocks every core/scripting object, method, and consumer relies on. A viable MVP starts here because types are independently constructible and testable, and everything above layers on them.

**Independent Test**: Can be fully tested by importing each data-type from `@/lingo` and asserting its documented properties, methods, and operators behave per spec, without any objects, methods, packaging, or host integration. Delivers a usable, verifiable Director data-type surface.

**Acceptance Scenarios**:

1. **Given** the Director MX 2004 docs describe a data-type that maps to a JavaScript native, **When** a consumer uses it via `@/lingo`, **Then** it behaves as that native per the documented Director semantics (no fabricated behavior).
2. **Given** the docs describe `Color`, **When** a consumer constructs and operates on it, **Then** its documented properties/methods (e.g., RGB components, named constants) behave as specified.
3. **Given** the docs describe `List`, **When** a consumer constructs and operates on it, **Then** its documented methods (add, get, count, etc.) behave per the docs.
4. **Given** the docs describe `PropList`, **When** a consumer constructs and operates on it, **Then** its documented property-name/value behavior behaves per the docs.
5. **Given** the docs describe `Point`, **When** a consumer constructs and operates on it, **Then** its documented properties (locH, locV) and methods/operators behave per the docs.
6. **Given** the docs describe `Rect`, **When** a consumer constructs and operates on it, **Then** its documented properties (left, top, right, bottom, width, height) and methods behave per the docs.

---

### User Story 2 - Context & Subsystems Enabling Core Objects (Priority: P2)

A developer (internally) uses a `DirectorContext` and a set of shared subsystems to make the core objects work. Each `DirectorContext` owns the live instances of the singletons for one movie and, on activation, installs them into the singleton slots so any consumer importing `_movie`/`_player`/etc. sees the active context's instances. Distinct contexts remain isolated. Where the Director API requires shared state that no single class should own (e.g., a member registry consulted by both `CastLib.member` and the global `member()` method), a documented subsystem is built once and every caller routes through it; no class grows undocumented `static` methods/registries.

**Why this priority**: Core objects (P3) cannot function without a context to bind singletons and shared subsystems to resolve cross-class concerns. Building context + subsystems first keeps classes clean per the docs and avoids duplicated registries.

**Independent Test**: Can be tested by creating/activating multiple contexts and asserting singleton slot binding, per-context isolation, and that each subsystem owns exactly one concern with all callers routed through it — without exercising the full object API.

**Acceptance Scenarios**:

1. **Given** a `DirectorContext`, **When** it is activated, **Then** the singleton slots (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`) reflect that context's instances.
2. **Given** two contexts, **When** each is activated in turn (or in separate isolation scopes), **Then** their singletons and member registries do not leak across contexts.
3. **Given** a shared concern spanning multiple documented classes (e.g., member lookup), **When** it is implemented, **Then** exactly one documented subsystem owns it and every caller routes through it (no duplicated statics/registries).
4. **Given** the docs do NOT mention a static method or subsystem on a class, **When** the class is inspected, **Then** no undocumented static method or subsystem is attached to it.
5. **Given** implementation reaches a point requiring an undocumented subsystem, **When** that happens, **Then** the touching code is left as a stub, the subsystem is built + documented, all callers are wired to it, and only then implementation continues.

---

### User Story 3 - Core & Scripting Objects (Priority: P3)

A developer imports the Director core objects and scripting objects from `@/lingo` and uses them exactly as described by the Director MX 2004 documentation. The thirteen core objects are implemented: `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, and `Window`. The four scripting objects are implemented: `Fileio`, `NetLingo`, `SpeechXtra`, and `XMLParser`. Scripting objects live in the same folder as core objects (`packages/director/src/runtime/objects/`). Per project convention each class is named `X...Object` while its source file keeps the documented name (e.g., `cast-library.js` exports `CastLibraryObject`; `window.js` exports `WindowObject`).

**Why this priority**: Core and scripting objects are the heart of the Lingo surface; they layer on the data-types (P1) and the context/subsystems (P2), and are independently testable via their documented properties/methods.

**Independent Test**: Can be fully tested by importing each core/scripting object class from `@/lingo` and asserting every documented property/method behaves per spec.

**Acceptance Scenarios**:

1. **Given** the Director MX 2004 docs list a property/method on a core object, **When** a consumer accesses/invokes it from `@/lingo`, **Then** it exists, is public, and matches the documented signature and behavior.
2. **Given** the docs list a property/method on a scripting object, **When** a consumer accesses/invokes it from `@/lingo`, **Then** it exists, is public, and matches the documented signature and behavior.
3. **Given** the project naming convention, **When** the source files are inspected, **Then** each `cast-library.js`/`window.js`/etc. exports the `X...Object` class (e.g., `CastLibraryObject`, `WindowObject`).
4. **Given** scripting objects, **When** the source tree is inspected, **Then** `Fileio`, `NetLingo`, `SpeechXtra`, and `XMLParser` live alongside core objects in `runtime/objects/`.
5. **Given** the docs do NOT mention a static method or subsystem on a core/scripting object class, **When** the class is inspected, **Then** no undocumented static method or subsystem is attached to it.

---

### User Story 4 - Member Base & Media-Type Subclasses (Priority: P4)

A developer uses the `Member` core object and its documented base properties/methods from `@/lingo`. To avoid polluting `MemberObject` with media-specific information, the base class is implemented once and extended for specific media types. For this iteration the included media-type subclasses (implemented) are: `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, and `Text` — each named `X...Member` (e.g., `BitmapMember`, `FieldMember`, `SoundMember`) and exposing only the documented properties/methods for its media type. The remaining documented member media types are excluded (stubbed): `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, and `WindowsMedia` — each a `MemberObject` subclass with no media-specific implementation, so the runtime recognizes the type without failing.

**Why this priority**: Member subclasses give the runtime typed, media-aware members; they layer on core objects (P3) and on the context/subsystems (P2).

**Independent Test**: Can be tested by constructing each member subclass and asserting included types expose exactly their documented media-specific properties/methods, while excluded types are `MemberObject` subclasses with no media-specific behavior.

**Acceptance Scenarios**:

1. **Given** the `Member` object, **When** a consumer uses the base `MemberObject`, **Then** only the documented base properties/methods of `Member` are present (no media-specific pollution).
2. **Given** an included media type (Bitmap, Button, ColorPalette, Cursor, Field, Font, Sound, Text), **When** a consumer constructs its `X...Member` subclass, **Then** it extends `MemberObject` and exposes exactly the documented properties/methods for that media type.
3. **Given** an excluded media type, **When** the runtime references it, **Then** it returns a stub `MemberObject` subclass instance rather than throwing.
4. **Given** an excluded subclass, **When** it is inspected, **Then** it adds no undocumented media-specific behavior beyond the `Member` base.
5. **Given** a member instance, **When** the runtime ingests a built movie definition referencing that member's type, **Then** the corresponding subclass instance is constructed.

---

### User Story 5 - Public Director API: Top-Level Methods & Singletons (Priority: P5)

A developer (or translated Lingo script) uses the public Director API from `@/lingo`: the documented top-level Lingo methods (e.g., `go`, `member`, `sprite`, `sound`, `point`, `rect`, `list`, `propList`, `symbol`, `integer`, `string`, the math/string/list functions, net operations, etc.) and the documented singleton properties — `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`. Each method behaves per the Director MX 2004 docs; each singleton resolves to the active context's instance. No undocumented top-level method or singleton is exported.

**Why this priority**: The public API is the consumer-facing surface that ties objects, data-types, context, and subsystems together. It layers on P1–P4 and is independently exercisable by scripts.

**Independent Test**: Can be tested by importing each documented top-level method and singleton from `@/lingo` and asserting behavior/signature per the docs, and that singletons reflect the active context.

**Acceptance Scenarios**:

1. **Given** the Director MX 2004 docs list a top-level Lingo method, **When** a consumer imports and invokes it from `@/lingo`, **Then** it exists and matches the documented signature and behavior.
2. **Given** the documented singletons, **When** a consumer imports `_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/`_global`, **Then** they resolve to the active context's instances.
3. **Given** a context is activated, **When** singletons are read, **Then** they reflect that context's instances; switching context updates the slots.
4. **Given** the docs do NOT mention a top-level method or singleton, **When** `@/lingo` is inspected, **Then** it is not exported.

---

### User Story 6 - Packaging System (Builder-Pattern Movie/Cast/Member Definitions) (Priority: P6)

A developer defines a virtual movie as a JS bundle using builder-pattern helpers that produce pure definition data structures (not live Director core objects). The packaging system follows the builder pattern: a `movie` builder, a `cast` builder, and member-registration helpers on a cast that take a member's name (and, where relevant, a payload) to register members within the cast. The definition describes the movie, its internal casts, and their members. The runtime consumes such a bundle to build up the live `Movie`, `CastLib`, `Member`, and related Director API objects.

**Why this priority**: Bundles are the unit the runtime mounts; they require the live objects from P1–P5 to exist first.

**Independent Test**: Can be tested by constructing a definition via the builder helpers and asserting the produced structure declares the expected casts/members with stable identities, without invoking the runtime or rendering.

**Acceptance Scenarios**:

1. **Given** the `movie` builder and `cast` builder, **When** a developer chains a movie with one or more cast definitions and builds, **Then** a complete movie definition object is produced describing the movie and its casts.
2. **Given** a `cast` builder, **When** a developer registers members by name (and, where relevant, a payload) and builds, **Then** the cast definition lists its members with stable, addressable identities (by name and by number).
3. **Given** a built movie definition, **When** the runtime ingests it, **Then** live Director API objects (`Movie`, `CastLib`, `Member`, …) are constructed and wired to the shared subsystems.
4. **Given** two independently built movie definitions, **When** each is mounted in its own context, **Then** their casts/members do not collide (per-context isolation).

---

### User Story 7 - Imperative Runtime API (Priority: P7)

A developer who does not want DOM custom elements can run a movie imperatively: a programmatic entry point ingests a movie definition (built via the P6 helpers or imported from a bundle) and starts the runtime — constructing the `DirectorContext`, activating singletons, loading casts, and starting the event loop — returning a control handle the caller can start/stop/destroy.

**Why this priority**: The imperative path is the programmatic entry; it layers on P1–P6 and is the foundation the custom elements (P8) build on.

**Independent Test**: Can be tested by calling the imperative run function with a built definition and asserting the context activates, the event loop starts/stops on the returned handle, and resources are released on destroy.

**Acceptance Scenarios**:

1. **Given** a built movie definition, **When** the imperative run function is called with it, **Then** a `DirectorContext` is created, singletons activated, casts loaded, and a control handle returned.
2. **Given** an active runtime started imperatively, **When** the handle is stopped/destroyed, **Then** the event loop stops, the context is destroyed, and resources are released.
3. **Given** two imperative runs in the same process, **When** each runs in its own isolation scope, **Then** their contexts/singletons do not interfere.

---

### User Story 8 - Custom Elements Host Integration (<x-object>, <x-embed>, <x-param>) (Priority: P8)

In a browser host, a declarative page uses `<x-object>` (and `<x-embed>`) with nested `<x-param>` elements to reference the source of a virtual JS movie, the way the legacy Shockwave plugin read `<object>`/`<embed>`/`<param>` and an NPAPI plugin played `.dcr`/`.cct`. The runtime's custom elements read those tags, resolve the referenced bundle source, and run the movie via the imperative runtime API (P7) underneath — no native plugin involved.

**Why this priority**: Declarative hosting is the flagship browser experience; it depends on P1–P7 and is a thin layer over the imperative runtime.

**Independent Test**: Can be tested by mounting `<x-object>`/`<x-embed>` with `<x-param>` in a DOM fixture and asserting the runtime resolves the referenced bundle and runs the movie via the imperative API.

**Acceptance Scenarios**:

1. **Given** an `<x-object>` with a source reference and nested `<x-param>`s, **When** the element connects, **Then** it resolves the referenced JS movie bundle, reads the params, and runs the movie via the imperative runtime API.
2. **Given** an `<x-embed>` referencing a movie source with params, **When** it connects, **Then** it behaves equivalently to `<x-object>` for the same source/params.
3. **Given** conflicting or malformed `<x-param>`s, **When** the element connects, **Then** the runtime reports a clear error without crashing the host page.
4. **Given** the element is removed from the DOM, **When** it disconnects, **Then** the underlying imperative handle is destroyed, the context torn down, and resources released.

### Edge Cases

- What happens when a movie definition references a cast/member not declared in its bundle?
- How does the runtime handle a member referenced by both name and number where they disagree?
- What happens when `<x-object>` and `<x-embed>` are present for the same movie source with conflicting params?
- How does the system behave when a context is destroyed while translated scripts still hold references to its singletons?
- What happens when a documented method is invoked with wrong argument count/types per Director semantics (e.g., a `Point` constructed with a single argument)?
- What happens when two built definitions declare members with the same name/number (per-context vs. globally)?
- How does the runtime treat an excluded member media type present in an otherwise valid bundle?
- What happens when a data-type constructor receives values outside documented ranges (e.g., color channel > 255)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The runtime MUST implement the five documented Director data-types — `Color`, `List`, `PropList`, `Point`, and `Rect` — exactly as described by the Macromedia Director MX 2004 documentation, including documented properties, methods, and operators.
- **FR-002**: Where a Director data-type maps to a JavaScript native per the docs, the runtime MUST use that native with the documented Director semantics; where the data-type requires its own representation, the runtime MUST implement its own class strictly per the docs and MUST NOT fabricate undocumented behavior.
- **FR-003**: The runtime MUST provide a `DirectorContext` that owns the live singleton instances for one movie; activating a context MUST install those instances into the singleton slots so any consumer importing `_movie`/`_player`/etc. sees the active context's instances, and distinct contexts MUST remain isolated.
- **FR-004**: When a shared concern spans multiple documented classes (e.g., member lookup used by `CastLib.member` and global `member()`), the runtime MUST provide exactly one documented subsystem owning that concern, and every caller MUST route through it.
- **FR-005**: The runtime MUST NOT attach static methods, registries, or subsystems to a class unless the Director MX 2004 documentation explicitly describes them for that class.
- **FR-006**: When implementation reaches a point requiring an undocumented subsystem, the runtime MUST leave the touching code as a stub, build and document the subsystem, wire all callers to it, and only then continue — never duplicate the logic across classes.
- **FR-007**: The runtime MUST implement the thirteen documented core objects — `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, `Window` — each with all documented properties and methods.
- **FR-008**: The runtime MUST implement the four documented scripting objects — `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` — each living alongside core objects at `packages/director/src/runtime/objects/`.
- **FR-009**: Per project convention, each core/scripting object class MUST be named `X...Object` (e.g., `CastLibraryObject`, `WindowObject`) while its source file keeps the documented name (e.g., `cast-library.js`, `window.js`).
- **FR-010**: The runtime MUST implement a base `MemberObject` exposing only the documented base properties/methods of the `Member` object, and MUST NOT pollute it with media-specific content.
- **FR-011**: The runtime MUST extend `MemberObject` with per-media-type subclasses named `X...Member` for the included types — `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, `Text` — each exposing exactly the documented properties/methods for that media type.
- **FR-012**: The runtime MUST provide stub subclasses for the excluded media types — `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, `WindowsMedia` — each extending `MemberObject` with no media-specific implementation, so the runtime recognizes the type without failing.
- **FR-013**: Every property on runtime objects MUST be public; the implementation MUST NOT use `#` private field syntax to hide documented properties.
- **FR-014**: The runtime MUST NOT implement behavior not mentioned in the Director MX 2004 documentation; undocumented behavior is out of scope (stubbed until clarified).
- **FR-015**: The package MUST expose the public Director API via `@/lingo`: all documented top-level Lingo methods (e.g., `go`, `member`, `sprite`, `sound`, `point`, `rect`, `list`, `propList`, `symbol`, `integer`, `string`, math/string/list functions, net operations) and the documented singletons — `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`.
- **FR-016**: Each documented singleton MUST be a live-binding slot that resolves to the active context's instances; switching context MUST update the slots, and `@/lingo` MUST NOT export undocumented top-level methods or singletons.
- **FR-017**: The package MUST provide builder-pattern helpers to define the virtual space: a `movie` builder, a `cast` builder, and member-registration helpers on a cast that take a member's name (and, where relevant, a payload), producing pure definition data structures (not live Director core objects).
- **FR-018**: A built movie definition MUST describe its casts and members with stable, addressable identities (by name and by number) so the runtime can construct live `CastLib`/`Member` objects from it.
- **FR-019**: The runtime MUST provide an imperative run entry point in `@/browser` that ingests a built movie definition and starts the runtime (context creation, singleton activation, cast loading, event loop) without requiring DOM custom elements, returning a control handle.
- **FR-020**: The runtime MUST provide custom elements `<x-object>`, `<x-embed>`, and `<x-param>` in `@/browser` that simulate the HTML4 `<object>`/`<embed>`/`<param>` + legacy NPAPI plugin behavior; `<x-object>` (or `<x-embed>`) with nested `<x-param>`s references the source of a virtual JS movie bundle, which the element resolves and runs via the imperative runtime API (P7).
- **FR-021**: When a custom element disconnects or an imperative handle is destroyed, the runtime MUST tear down the associated context, stop its event loop, and release resources.
- **FR-022**: The package root (`@project-reborn/director`) MUST export the full public API, the packaging system, the custom elements, and the imperative runtime functions; the `@/lingo` subpath MUST export only the Director public API (data-types, core objects, scripting objects, singletons, top-level methods); the `@/browser` subpath MUST export the packaging system, the imperative runtime functions, and the custom elements.
- **FR-023**: The runtime MUST NOT support the binary Director/Shockwave file formats (`.dcr`, `.dir`, `.cct`, `.cst`); movies and casts are JS bundles only.
- **FR-024**: Lingo-to-JavaScript translation tooling is explicitly out of scope; the runtime must execute already-translated JS that consumes the Lingo public API.

### Key Entities *(include if feature involves data)*

- **Director Data-Types**: `Color`, `List`, `PropList`, `Point`, `Rect` — implemented 1:1 against the Director MX 2004 documentation; some wrap JavaScript natives per the docs, others are their own classes.
- **DirectorContext**: Owns the live singleton instances and runtime state for one movie; activates the singleton slots and coordinates lifecycle for its movie.
- **Subsystems**: Documented shared components owning cross-class concerns (e.g., a member registry consulted by `CastLib.member` and global `member()`). Implemented once and reused by all callers.
- **Core Objects**: `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, `Window` — implemented as `X...Object` classes; singletons provided where documented.
- **Scripting Objects**: `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` — implemented alongside core objects.
- **Member Subclasses**: `X...Member` subclasses extending the base `MemberObject` — included: `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, `Text`; excluded (stubbed): `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, `WindowsMedia`.
- **Public Director API**: Documented top-level Lingo methods and the documented singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`).
- **Movie Definition (bundle)**: A pure data structure describing one virtual movie: name, source, dimensions, tempo, casts. Produced by the `movie` builder. Not a Director core object.
- **Cast Definition**: A pure data structure describing one cast within a movie: name and member definitions. Produced by the `cast` builder.
- **Member Definition**: A pure data structure describing one member within a cast, identified by name (and number), with a payload where relevant.
- **Custom Elements**: `<x-object>`, `<x-embed>`, `<x-param>` — declarative host integration referencing a JS movie bundle source, run via the imperative runtime API.
- **Imperative Handle**: A control object returned by the imperative run entry point, allowing the caller to start/stop/destroy a runtime instance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the documented Director MX 2004 data-types (`Color`, `List`, `PropList`, `Point`, `Rect`) are present on `@/lingo` with matching properties, methods, and operators per the docs.
- **SC-002**: A `DirectorContext` can be activated and its singleton slots reflect its instances; two concurrently active contexts maintain fully isolated singletons and member registries (zero cross-context leakage in tests).
- **SC-003**: 100% of the documented properties and methods for the thirteen core objects and four scripting objects are present on the runtime surface with matching signatures and documented behavior.
- **SC-004**: The base `MemberObject` exposes zero media-specific properties; each of the eight included `X...Member` subclasses exposes 100% of its documented media-type properties and nothing undocumented.
- **SC-005**: Each of the eleven excluded `X...Member` subclasses is a stub `MemberObject` subclass with zero media-specific behavior.
- **SC-006**: 100% of the documented Director top-level methods and singletons are present on `@/lingo` with matching signatures/behavior; no undocumented top-level method or singleton is exported.
- **SC-007**: Every implemented class contains only members documented for that class (zero undocumented static methods or subsystems attached to classes).
- **SC-008**: Every identified shared concern has exactly one subsystem implementation, and zero duplicated implementations exist across classes.
- **SC-009**: A developer can define a movie with at least one cast and multiple members using the builder helpers and have the runtime construct the live Director objects end-to-end.
- **SC-010**: A developer can mount a movie via `<x-object>` + `<x-param>` and via the imperative run function, and in both cases the runtime constructs the same live Director API surface — demonstrating the two entry points are equivalent (the custom element runs the imperative API underneath).
- **SC-011**: 100% of the documented export paths (`@project-reborn/director`, `@/lingo`, `@/browser`) expose exactly the categories specified for each and nothing extra.

## Assumptions

- The authoritative reference for "what the API is" is the Macromedia Director MX 2004 documentation; where the docs are silent on a behavior, that behavior is out of scope (stubbed until clarified).
- "Public properties, no `#` private syntax" applies to documented properties; internal-only helper state that is NOT a documented property may be implemented privately as long as it is not exposed as a documented member.
- Builder helpers produce immutable-on-build definition structures; mutation happens during the build phase only.
- The runtime targets modern browsers with ES module + Web Components support; legacy NPAPI/ActiveX is never used (the custom elements are a behavioral simulation only).
- Per-context isolation is achieved via worker module graphs and/or main-thread slot swapping via `DirectorContext.activate()`, consistent with the existing runtime design.
- The existing `packages/director/` scaffold (singletons, context, object classes, methods) is treated as current state to evolve; this feature defines the target spec the package must ultimately satisfy.
- Where the docs map a Director type to a native JS type, that mapping is followed literally; no custom class is added where the docs do not require one.
- Member subclasses representing included media drive value in this iteration; excluded subclasses exist solely as non-failing stubs and gain behavior in a later iteration.
- Custom elements are a thin layer over the imperative runtime API (P7); they share no separate execution path of their own.