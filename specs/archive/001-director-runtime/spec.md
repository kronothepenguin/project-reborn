# Feature Specification: Director Runtime

**Feature Branch**: `001-director-runtime`

**Created**: 2026-07-16

**Status**: Draft

**Input**: User description: "Create a Macromedia Director MX 2004 runtime as its own package at @packages/director/. Use the Director documentation to build a runtime that is 1:1 to the original Lingo: core objects, scripting objects, and the extra data-types Director provides. Focus on Lingo-to-JavaScript code — implement the Director Lingo API for JavaScript. No .dcr/.dir/.cct/.cst file formats; every movie is a JS bundle exporting a movie/cast definition (a data structure describing the virtual space of movies, casts, members). Custom elements <x-object>, <x-embed>, <x-param> simulate the HTML4 <object>/<embed>/<param> + NPAPI plugin behavior. Builder-pattern helpers define the virtual space. Public properties only (no # private syntax). Keep classes clean per docs — no static methods/subsystems unless docs explicitly mention them; if a subsystem is needed, stop, stub, build + document the shared subsystem, and make all code use it. Do not implement anything not mentioned in the docs. Priority ordering: 1) data types, 2) context + subsystems to make core objects work, 3) core & scripting objects, 4) media-type member subclasses (implement included, stub excluded), 5) public Director API — top-level methods and singleton properties, 6) packaging system (builder pattern), 7) imperative runtime API, 8) custom elements (built on the imperative API). @/lingo exports the Director public API only; @/browser exports packaging + imperative runtime + custom elements; the package root exports everything. Out of scope: Lingo-to-JS translation, binary Director/Shockwave file formats."

## Clarifications

### Session 2026-07-16

- Q: Context isolation unit — workers, main-thread slot-swapping, or both? → A: Workers only
- Q: Member numbering in packaging — how are numbers assigned during build? → A: Auto-assigned sequentially by build position within the cast
- Q: Implementation depth for included member subclasses for v1? → A: Full documented surface with JS-native backends
- Q: Bundle source reference — how does the runtime reference/load a movie bundle into a worker? → A: ES module URL fetched via dynamic `import()` inside the worker; the module's default export is the movie definition
- Q: How does the Director API (`@/lingo`, singletons, context) become available inside the worker? → A: `@/lingo` binds singletons to `globalThis` per worker; context activation mutates the global slots; any script (including the bundle) reads singletons from the global
- Q: Who owns the movie worker's lifecycle in the imperative path? → A: The main thread creates and owns the `Worker`; the imperative control handle is a main-thread proxy that posts messages to it
- Q: What drives the event loop / frame timing? → A: Timer-driven inside the worker (`setTimeout`/`setInterval`) at the movie's tempo (FPS); the runtime dispatches a set of custom lifecycle events inside the worker (see "On which EventTarget…" below for dispatch target)
- Q: How does the worker's visual output reach the `<x-object>` element? → A: Worker renders to an `OffscreenCanvas` transferred from a canvas inside `<x-object>`; input events are forwarded from the element to the worker via messages
- Q: Score representation in the movie bundle for v1? → A: No Score in v1; Sprite/SpriteChannel objects are API-only shells, the event loop ticks with no score data, and frame/sprite/score behavior is deferred to a later iteration
- Q: Media payload provenance in v1 bundles — where do the actual media bytes come from? → A: Media bytes are embedded inline in the bundle as typed arrays/strings (no URL references); the worker decodes them in-memory
- Q: On which EventTarget do lifecycle events dispatch so the host can observe them? → A: Only inside the worker on the `DirectorContext` (worker-side `EventTarget`); host tools that need observation poll the worker via `postMessage`
- Q: NetLingo / net-* methods in v1 — real network or stubs? → A: Full implementation: all net-* methods and `NetLingo` perform real HTTP via `fetch()` inside the worker; `netDone`/`netError`/`netTextResult` reflect real async state
- Q: Sound/SoundChannel/SoundMember playback backend? → A: Web Audio API inside the worker (`AudioContext` + `AudioBufferSourceNode`/`GainNode`); `SoundMember` decoded via `decodeAudioData`, channels map to `AudioNode` chains with volume/pan control
- Q: ExternalEvent / externalParamName / externalParamValue host bridge? → A: `externalEvent` posts worker→main-thread; the imperative handle / `<x-object>` re-dispatches as a DOM `CustomEvent` (args in `detail`) on the element (declarative) or handle (imperative); `externalParamName`/`externalParamValue` read `<x-param>`s collected at connect/run-config and forwarded into the worker
- Q: MIAW (Movies-In-A-Window) / Window core object in v1? → A: `Window` exposes its full documented property/method surface (title, rect, visibility, modal, name, etc.) but `openMovie`/sibling-movie execution is stubbed in v1; MIAW is deferred to a later iteration
- Q: Non-Score event-loop tick / idle behavior in v1? → A: Full implementation of lifecycle events; they dispatch in the documented order, and the Score is NOT required to drive them — the event loop fires the full frame lifecycle (`prepareFrame`/`enterFrame`/`exitFrame`/`beginSprite`/`endSprite`) every tick, independent of Score data
- Note (from user): `Movie.member` accesses members of the current castLib by number, or of any castLib by name; `CastLib.member` accesses by number or name. Both are a shared member-registry subsystem concern.
- _More clarifications may be appended below as questions are answered._

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

1. **Given** a `DirectorContext`, **When** it is activated, **Then** the worker's `globalThis` singleton slots (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`) reflect that context's instances.
2. **Given** two contexts (each in its own worker), **When** both are active, **Then** their singletons and member registries do not leak across contexts/workers (each worker's `globalThis` is its own).
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
6. **Given** `Sprite` and `SpriteChannel`, **When** a consumer accesses their Score-dependent surface in v1, **Then** the properties/methods are present as stubs returning documented no-op/empty values (the Score timeline is deferred per FR-031), while their non-Score identity/type surface behaves per the docs.
7. **Given** `Window`, **When** a consumer accesses its documented property surface or uses the root/stage window, **Then** it behaves per the docs; but `Window.openMovie`/sibling-movie execution MUST be a documented no-op in v1 (MIAW deferred per FR-036).

---

### User Story 4 - Member Base & Media-Type Subclasses (Priority: P4)

A developer uses the `Member` core object and its documented base properties/methods from `@/lingo`. To avoid polluting `MemberObject` with media-specific information, the base class is implemented once and extended for specific media types. For this iteration the included media-type subclasses (fully implemented) are: `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, and `Text` — each named `X...Member` (e.g., `BitmapMember`, `FieldMember`, `SoundMember`) and exposing the full documented surface for its media type, including the documented native media behaviors (e.g., bitmap decoding, palette decode, cursor glyph rendering, sound playback) backed by JS-native implementations (no native/legacy plugin code paths). The remaining documented member media types are excluded (stubbed): `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, and `WindowsMedia` — each a `MemberObject` subclass with no media-specific implementation, so the runtime recognizes the type without failing.

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
3. **Given** a context is activated in its worker, **When** singletons are read, **Then** they reflect that context's instances within that worker.
4. **Given** the docs do NOT mention a top-level method or singleton, **When** `@/lingo` is inspected, **Then** it is not exported.

---

### User Story 6 - Packaging System (Builder-Pattern Movie/Cast/Member Definitions) (Priority: P6)

A developer defines a virtual movie as a JS bundle using builder-pattern helpers that produce pure definition data structures (not live Director core objects). The packaging system follows the builder pattern: a `movie` builder, a `cast` builder, and member-registration helpers on a cast that take a member's name (and, where relevant, a payload) to register members within the cast. The definition describes the movie, its internal casts, and their members. The runtime consumes such a bundle to build up the live `Movie`, `CastLib`, `Member`, and related Director API objects.

**Why this priority**: Bundles are the unit the runtime mounts; they require the live objects from P1–P5 to exist first.

**Independent Test**: Can be tested by constructing a definition via the builder helpers and asserting the produced structure declares the expected casts/members with stable identities, without invoking the runtime or rendering.

**Acceptance Scenarios**:

1. **Given** the `movie` builder and `cast` builder, **When** a developer chains a movie with one or more cast definitions and builds, **Then** a complete movie definition object is produced describing the movie and its casts.
2. **Given** a `cast` builder, **When** a developer registers members by name (and, where relevant, a payload) and builds, **Then** the cast definition lists its members with stable, addressable identities — by name (as authored) and by number (auto-assigned sequentially by registration position).
3. **Given** a built movie definition, **When** the runtime ingests it, **Then** live Director API objects (`Movie`, `CastLib`, `Member`, …) are constructed and wired to the shared subsystems.
4. **Given** two independently built movie definitions, **When** each is mounted in its own context, **Then** their casts/members do not collide (per-context isolation).

---

### User Story 7 - Imperative Runtime API (Priority: P7)

A developer who does not want DOM custom elements can run a movie imperatively: a programmatic entry point on the main thread ingests a movie definition (built via the P6 helpers or imported from a bundle) and starts the runtime — spawning a dedicated `Worker`, which constructs the `DirectorContext`, activates singletons on the worker's `globalThis`, loads casts, and starts the event loop — returning a main-thread control handle that proxies the worker, letting the caller start/stop/destroy the runtime instance.

**Why this priority**: The imperative path is the programmatic entry; it layers on P1–P6 and is the foundation the custom elements (P8) build on.

**Independent Test**: Can be tested by calling the imperative run function with a built definition and asserting the context activates, the event loop starts/stops on the returned handle, and resources are released on destroy.

**Acceptance Scenarios**:

1. **Given** a built movie definition, **When** the imperative run function is called with it, **Then** a `DirectorContext` is created, singletons activated, casts loaded, and a control handle returned.
2. **Given** an active runtime started imperatively, **When** the handle is stopped/destroyed, **Then** the event loop stops, the context is destroyed, and resources are released.
3. **Given** two imperative runs in the same process, **When** each runs in its own isolation scope, **Then** their contexts/singletons do not interfere.

---

### User Story 8 - Custom Elements Host Integration (<x-object>, <x-embed>, <x-param>) (Priority: P8)

In a browser host, a declarative page uses `<x-object>` (and `<x-embed>`) with nested `<x-param>` elements to reference the source of a virtual JS movie, the way the legacy Shockwave plugin read `<object>`/`<embed>`/`<param>` and an NPAPI plugin played `.dcr`/`.cct`. The runtime's custom elements read those tags, resolve the referenced bundle source, and run the movie via the imperative runtime API (P7) underneath — no native plugin involved. The element hosts a canvas whose `OffscreenCanvas` is transferred to the movie worker for rendering; keyboard/mouse/focus events captured on the element are forwarded to the worker as messages, where they feed the Director `_key`/`_mouse` singletons and the event loop.

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
- When `Movie.member` is called by name and two castLibs each have a member with that name, which one resolves?
- What happens when `<x-object>` and `<x-embed>` are present for the same movie source with conflicting params?
- How does the system behave when a context is destroyed while translated scripts still hold references to its singletons?
- What happens when a documented method is invoked with wrong argument count/types per Director semantics (e.g., a `Point` constructed with a single argument)?
- What happens when two built definitions declare members with the same name/number (per-context vs. globally)?
- How does the runtime treat an excluded member media type present in an otherwise valid bundle?
- What happens when a data-type constructor receives values outside documented ranges (e.g., color channel > 255)?
- What happens when a bundle's ES module default export is missing or not a valid movie definition?
- What happens when dynamic `import()` of a bundle URL fails inside the worker (network error, CORS, bad module)?
- What happens when an embedded inline media payload is malformed or its typed-array shape doesn't match the declared member type?
- What happens when a bundle with embedded media payloads exceeds practical size limits (memory/decode budget)?
- What happens when net-asset downloads initiated by `preloadNetThing`/`downloadNetThing` fail (network error, CORS, 404) — does `netError` capture it and `netDone` flip to false?
- What happens when `gotoNetMovie` is called mid-run — does the current context tear down before the new bundle loads (per-movie isolation)?
- What happens when the worker's `AudioContext` is suspended/locked (no user gesture) — do queued sounds block, or play silent until resumed?
- What happens when `externalEvent` is dispatched but no host `addEventListener('externalEvent', …)` is attached — does it no-op, queue, or drop?
- What happens when `<x-param>`s are added/removed after connect (declarative path) — do `externalParamName`/`externalParamValue` see the stale run-config snapshot?
- What happens when `Window.openMovie` is called in v1 — does it return a stub `Window` with a documented no-op, or throw?
- What happens when a movie tries to set `Window` properties beyond its own root/stage window (a named child window that cannot open in v1)?
- What happens when the event-loop tempo is set to 0 or an invalid value (e.g., > display refresh, negative)?
- What happens when a lifecycle event handler throws inside the worker during a frame?
- What happens when host `postMessage` polling for lifecycle observation lags behind high-frequency frame events (backpressure/coalescing)?
- What happens when frame navigation (`go`/`goNext`/`goLoop`) is called in v1, where there is no Score to advance?
- What data do `prepareFrame`/`enterFrame`/`exitFrame`/`beginSprite`/`endSprite` events carry in v1, given there is no Score sprite-placement data?
- What happens if the host browser does not support `OffscreenCanvas` (transfer fails)?
- What happens to forwarded input events when the worker is busy or mid-frame?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The runtime MUST implement the five documented Director data-types — `Color`, `List`, `PropList`, `Point`, and `Rect` — exactly as described by the Macromedia Director MX 2004 documentation, including documented properties, methods, and operators.
- **FR-002**: Where a Director data-type maps to a JavaScript native per the docs, the runtime MUST use that native with the documented Director semantics; where the data-type requires its own representation, the runtime MUST implement its own class strictly per the docs and MUST NOT fabricate undocumented behavior.
- **FR-003**: The runtime MUST provide a `DirectorContext` that owns the live singleton instances for one movie. Each movie MUST run inside a dedicated worker, which is the sole isolation boundary. `DirectorContext.activate()` MUST install its instances into that worker's `globalThis` singleton slots (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`), so any script (including the imported bundle) reading them from the global sees that context's instances. Distinct movies run in distinct workers and MUST remain fully isolated (no main-thread slot-swapping, no shared singleton slots across movies; each worker's `globalThis` is its own).
- **FR-004**: When a shared concern spans multiple documented classes (e.g., member lookup used by `CastLib.member` and global `member()`), the runtime MUST provide exactly one documented subsystem owning that concern, and every caller MUST route through it.
- **FR-005**: The runtime MUST NOT attach static methods, registries, or subsystems to a class unless the Director MX 2004 documentation explicitly describes them for that class.
- **FR-006**: When implementation reaches a point requiring an undocumented subsystem, the runtime MUST leave the touching code as a stub, build and document the subsystem, wire all callers to it, and only then continue — never duplicate the logic across classes.
- **FR-007**: The runtime MUST implement the thirteen documented core objects — `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, `Window` — each with all documented properties and methods, with the exception that `Sprite` and `SpriteChannel` are API-only shells in v1: their Score-dependent properties/methods (anything requiring per-frame sprite placement/timeline data) are present as stubs and return documented no-op/empty values, since the Score timeline is out of scope for v1 (per FR-031). Their non-Score-dependent, pure API surface (constructors, identity, type) MUST still be implemented. `Window` exposes its full documented property/method surface (name, title, rect, visibility, modal flag, etc.) and the root/stage window bound to `<x-object>`/`<x-embed>` MUST work, but `Window.openMovie` and sibling-movie (MIAW) execution are stubbed in v1 (per FR-036).
- **FR-008**: The runtime MUST implement the four documented scripting objects — `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` — each living alongside core objects at `packages/director/src/runtime/objects/`.
- **FR-009**: Per project convention, each core/scripting object class MUST be named `X...Object` (e.g., `CastLibraryObject`, `WindowObject`) while its source file keeps the documented name (e.g., `cast-library.js`, `window.js`).
- **FR-010**: The runtime MUST implement a base `MemberObject` exposing only the documented base properties/methods of the `Member` object, and MUST NOT pollute it with media-specific content.
- **FR-011**: The runtime MUST extend `MemberObject` with per-media-type subclasses named `X...Member` for the included types — `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, `Text` — each exposing the full documented surface for that media type, including documented native media behaviors (e.g., bitmap decoding, palette decode, cursor glyph rendering, sound playback), implemented via JS-native backends (no native/legacy plugin code paths; no fabricated undocumented behavior). The media payload for these subclasses is embedded inline in the bundle as typed arrays/strings (per FR-032) and decoded in-memory in the worker — no URL references or runtime fetch.
- **FR-012**: The runtime MUST provide stub subclasses for the excluded media types — `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, `WindowsMedia` — each extending `MemberObject` with no media-specific implementation, so the runtime recognizes the type without failing.
- **FR-013**: Every property on runtime objects MUST be public; the implementation MUST NOT use `#` private field syntax to hide documented properties.
- **FR-014**: The runtime MUST NOT implement behavior not mentioned in the Director MX 2004 documentation; undocumented behavior is out of scope (stubbed until clarified).
- **FR-015**: The package MUST expose the public Director API via `@/lingo`: all documented top-level Lingo methods (e.g., `go`, `member`, `sprite`, `sound`, `point`, `rect`, `list`, `propList`, `symbol`, `integer`, `string`, math/string/list functions, net operations) and the documented singletons — `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`.
- **FR-016**: Each documented singleton MUST be exposed via `globalThis` within a movie's worker and resolve to that worker's active context's instances; `DirectorContext.activate()` MUST mutate the global slots. `@/lingo` MUST export the same singleton names as aliases of the `globalThis` slots, so scripts that import them resolve to the active context's instances; `@/lingo` MUST NOT export undocumented top-level methods or singletons.
- **FR-027**: Inside a worker, the Director API (`@/lingo`, the singleton slots, and `DirectorContext.activate()`) MUST be installed on that worker's `globalThis` before the bundle module is imported, so the bundle and any translated scripts read the activated singletons from the global. No per-import context injection or parameter passing is used; singletons are global per worker.
- **FR-017**: The package MUST provide builder-pattern helpers to define the virtual space: a `movie` builder, a `cast` builder, and member-registration helpers on a cast that take a member's name (and, where relevant, an inline media payload), producing pure definition data structures (not live Director core objects). Member numbers are NOT authored; they are assigned automatically and sequentially by the member's position within the cast (compacted, no gaps). The member payload (where relevant) MUST be embedded inline as typed arrays/strings (per FR-032), not referenced by URL.
- **FR-018**: A built movie definition MUST describe its casts and members with stable, addressable identities — by name (as authored) and by number (as auto-assigned per FR-017) — so the runtime can construct live `CastLib`/`Member` objects from it.
- **FR-025**: The member registry subsystem (per FR-004) MUST serve three documented access paths consistently: `CastLib.member` (by number or by name), `Movie.member` (by number resolves against the current/active castLib; by name searches across the movie's castLibs), and the global `member()` method. All paths MUST resolve through the single registry with no duplicated lookup logic.
- **FR-019**: The runtime MUST provide an imperative run entry point in `@/browser` that ingests a built movie definition and starts the runtime without requiring DOM custom elements, returning a control handle. The entry point MUST run on the main thread and spawn a dedicated `Worker` for the movie; the main thread creates and owns that worker. The worker loads the bundle (per FR-026), activates its `DirectorContext` (installs singletons on the worker's `globalThis` per FR-003/FR-027), loads casts, and runs the event loop. The event loop MUST be driven by timer APIs inside the worker (`setTimeout`/`setInterval`) at the movie's tempo (frames per second); the worker is self-driven (no main-thread frame-pumping). The entry point MUST accept either an inline movie definition object or an ES module URL referencing a bundle (per FR-026).
- **FR-028**: The runtime MUST define a documented set of custom lifecycle events it dispatches during the event loop and on state transitions (e.g., the Director frame lifecycle: `prepareFrame`, `enterFrame`, `exitFrame`, plus `beginSprite`/`endSprite` and other documented events the runtime triggers). These events MUST be dispatched inside the movie's worker on the `DirectorContext` (which is a worker-side `EventTarget`); the main thread and the host page do NOT receive these events directly. Tools that need host-side observation MUST obtain it by polling the worker via `postMessage` (the main-thread handle forwards requests and receives event snapshots); the runtime does NOT re-dispatch lifecycle events on the imperative handle or on `<x-object>`/`<x-embed>`. Events are a pure notification channel; they MUST NOT be the timing source.
- **FR-037**: The full documented lifecycle event sequence MUST be implemented and dispatched in v1, in the order defined by the Director MX 2004 docs, independent of the Score. On each event-loop tick at the movie's tempo, the runtime MUST dispatch the documented frame lifecycle (`prepareFrame`, `enterFrame`, `exitFrame`) and sprite lifecycle (`beginSprite`, `endSprite`) events on the worker-side `DirectorContext`, plus movie lifecycle (`prepareMovie`, `startMovie`, `stopMovie`) at the appropriate transitions and idle/timeout events (`on idle`, `on timeout`) per the docs. The Score's absence (per FR-031) only means sprite-placement data is unavailable — it MUST NOT prevent the events themselves from firing in order. No event is stubbed (except where its data source is purely Score-bound, in which case the event still fires with documented empty/no-op data, not a no-fire stub).
- **FR-020**: The runtime MUST provide custom elements `<x-object>`, `<x-embed>`, and `<x-param>` in `@/browser` that simulate the HTML4 `<object>`/`<embed>`/`<param>` + legacy NPAPI plugin behavior; `<x-object>` (or `<x-embed>`) with nested `<x-param>`s references the source of a virtual JS movie bundle (an ES module URL per FR-026), which the element resolves and runs via the imperative runtime API (P7). `<x-object>`/`<x-embed>` MUST host a canvas element whose `OffscreenCanvas` is transferred to the movie worker for rendering (per FR-029).
- **FR-029**: The movie worker MUST render to an `OffscreenCanvas` transferred from a canvas element owned by `<x-object>`/`<x-embed>` on the main thread; the worker owns the pixels, the element owns the DOM node. No per-frame pixel copy or main-thread drawing of movie content.
- **FR-030**: Input events captured on the `<x-object>`/`<x-embed>` element (keyboard, mouse, focus) MUST be forwarded to the movie worker as messages; inside the worker they feed the Director `_key`/`_mouse` singletons and the event loop. The worker MUST NOT attach listeners to the main-thread DOM directly.
- **FR-026**: A movie bundle MUST be an ES module whose default export is the movie definition produced by the P6 builder helpers. The runtime MUST load a bundle by its ES module URL via dynamic `import()` performed inside the movie's dedicated worker. The imperative run entry point and the custom elements MUST use this single load mechanism; no `fetch()`+`eval` loader, in-memory manifest, or import-map resolution is used.
- **FR-021**: When a custom element disconnects or an imperative handle is destroyed, the runtime MUST tear down the associated context, stop its event loop, terminate/release the owned `Worker`, and release resources. Because the main thread owns the worker (per FR-019), teardown MUST be driven from the main thread by posting a stop/destroy message to the worker, then terminating the worker.
- **FR-022**: The package root (`@project-reborn/director`) MUST export the full public API, the packaging system, the custom elements, and the imperative runtime functions; the `@/lingo` subpath MUST export only the Director public API (data-types, core objects, scripting objects, singletons, top-level methods); the `@/browser` subpath MUST export the packaging system, the imperative runtime functions, and the custom elements.
- **FR-023**: The runtime MUST NOT support the binary Director/Shockwave file formats (`.dcr`, `.dir`, `.cct`, `.cst`); movies and casts are JS bundles only.
- **FR-024**: Lingo-to-JavaScript translation tooling is explicitly out of scope; the runtime must execute already-translated JS that consumes the Lingo public API.
- **FR-033**: The net operations surface (the `NetLingo` scripting object and the documented top-level net methods — `getNetText`, `postNetText`, `preloadNetThing`, `downloadNetThing`, `gotoNetMovie`, `gotoNetPage`, `netAbort`, `netDone`, `netError`, `netTextResult`, `netMIME`, `netLastModDate`, `getStreamStatus`, etc.) MUST be fully implemented in v1: initiators perform real HTTP via `fetch()` inside the movie's worker, and status/result accessors (`netDone`, `netError`, `netTextResult`, `netMIME`, `netLastModDate`, `getStreamStatus`) reflect real async state per the Director MX 2004 docs. Network I/O is the runtime's only external fetch besides the bundle's own dynamic `import()` (per FR-026) and is exempt from the inline-media-payload rule (FR-032), which governs bundled media only — `preloadNetThing`/`downloadNetThing` fetch remote resources at runtime by URL. `gotoNetPage` navigates the host page (main-thread), so it MUST be relayed from the worker to the main-thread handle for execution.
- **FR-034**: `Sound`, `SoundChannel`, and the `SoundMember` subclass MUST implement full documented audio playback via the Web Audio API inside the movie's worker: an `AudioContext` owns the audio graph; a `SoundMember`'s inline payload (per FR-032) is decoded via `AudioContext.decodeAudioData`; each `SoundChannel` maps to an `AudioNode` chain whose `GainNode`/pan nodes expose the documented volume/pan (and rate) properties; play/stop/queuing follow Director's `SoundChannel` semantics. No `<audio>` elements and no main-thread audio nodes are used; audio stays entirely in the worker.
- **FR-035**: The `externalEvent` top-level method MUST post a message from the worker to the main-thread handle carrying the event name and arguments; the handle MUST re-dispatch it as a DOM `CustomEvent` (typed as `externalEvent`, args in `detail`) on the `<x-object>`/`<x-embed>` element for the declarative path, or on the imperative handle (an `EventTarget`) for the imperative path. `externalParamName`/`externalParamValue` MUST read `<x-param>` values collected at element-connect time (declarative) or supplied in the imperative run-config (imperative), forwarded into the worker as part of the run config. The worker MUST NOT inspect the DOM directly.
- **FR-036**: MIAW (Movies In A Window) — i.e., `Window.openMovie` and running sibling/child movie windows — is explicitly out of scope for v1. The `Window` core object MUST expose its full documented property/method surface (1:1, testable: name, title, rect, visibility, modal flag, etc.), and the root/stage window bound to the movie's `<x-object>`/`<x-embed>` (or imperative handle) MUST work, but any `Window` method that would load/run a sibling movie in another window MUST return a documented no-op/empty value. Multi-worker sibling-movie coordination and multi-`OffscreenCanvas` compositing are deferred to a later iteration.
- **FR-031**: The Score (Director's per-frame timeline of sprite placements, frame script bindings, and the channel/frame matrix) is explicitly out of scope for v1 and MUST NOT be part of the movie definition bundle. Consequences: (a) the P6 movie/cast builders do not include a score section; (b) `Sprite`/`SpriteChannel` are API-only shells (per FR-007); (c) the event loop (per FR-019) ticks at the movie's tempo but advances no Score frame — frame navigation methods (`go`, `goNext`, `goPrevious`, `goLoop`) that require Score data are stubbed; however, the lifecycle events themselves MUST still dispatch in the documented order every tick (per FR-037) and are NOT dependent on Score data; (d) non-Score frame-iteration behavior (idle, timer, member/cast access, top-level methods, lifecycle events per FR-037) MUST work. The Score and full sprite/score-driven property behavior are deferred to a later iteration.
- **FR-032**: Member definitions that carry media payloads (e.g., `Bitmap` pixel data, `Sound` audio bytes, `Field`/`Text` text content, `ColorPalette` RGB arrays, `Cursor` glyph data, `Font` glyph data) MUST embed the payload inline in the bundle as typed arrays or strings — never as a URL or external reference. At ingest, the worker decodes the inline payload in-memory using JS-native backends (per FR-011); no runtime fetch of media by URL is performed.

### Key Entities *(include if feature involves data)*

- **Director Data-Types**: `Color`, `List`, `PropList`, `Point`, `Rect` — implemented 1:1 against the Director MX 2004 documentation; some wrap JavaScript natives per the docs, others are their own classes.
- **DirectorContext**: Owns the live singleton instances and runtime state for one movie; activates the singleton slots and coordinates lifecycle for its movie.
- **Subsystems**: Documented shared components owning cross-class concerns (e.g., a member registry consulted by `CastLib.member` and global `member()`). Implemented once and reused by all callers.
- **Core Objects**: `CastLibrary`, `Global`, `Key`, `Member`, `Mouse`, `Movie`, `Player`, `Sound`, `SoundChannel`, `Sprite`, `SpriteChannel`, `System`, `Window` — implemented as `X...Object` classes; singletons provided where documented. `Sprite`/`SpriteChannel` are Score-stub shells (per FR-031); `Window` exposes its full surface but MIAW execution is stubbed (per FR-036).
- **Scripting Objects**: `Fileio`, `NetLingo`, `SpeechXtra`, `XMLParser` — implemented alongside core objects.
- **Member Subclasses**: `X...Member` subclasses extending the base `MemberObject` — included: `Bitmap`, `Button`, `ColorPalette`, `Cursor`, `Field`, `Font`, `Sound`, `Text`; excluded (stubbed): `AnimatedGIF`, `DVD`, `FilmLoop`, `FlashComponent`, `LinkedMovie`, `QuickTime`, `RealMedia`, `Shockwave3D`, `ShockwaveAudio`, `VectorShape`, `WindowsMedia`.
- **Public Director API**: Documented top-level Lingo methods and the documented singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`).
- **Movie Definition (bundle)**: A pure data structure describing one virtual movie: name, source (ES module URL), dimensions, tempo, casts. Produced by the `movie` builder and shipped as the default export of an ES module bundle. Not a Director core object.
- **Cast Definition**: A pure data structure describing one cast within a movie: name and member definitions. Produced by the `cast` builder.
- **Member Definition**: A pure data structure describing one member within a cast, identified by name (and number), with an inline media payload where relevant (typed arrays/strings embedded in the bundle, per FR-032). Never a URL reference.
- **Custom Elements**: `<x-object>`, `<x-embed>`, `<x-param>` — declarative host integration referencing a JS movie bundle source, run via the imperative runtime API. The element hosts a canvas whose `OffscreenCanvas` is transferred to the worker; input captured on the element is forwarded to the worker via messages.
- **Imperative Handle**: A main-thread control object returned by the imperative run entry point, owning/controlling the movie's `Worker`. It posts messages to the worker to start/stop/destroy the runtime instance; the caller never touches the worker directly.
- **Lifecycle Events**: A documented set of custom events the runtime dispatches inside the worker on the `DirectorContext` (a worker-side `EventTarget`) during the event loop and on state transitions (e.g., `prepareFrame`, `enterFrame`, `exitFrame`). Notification-only; timing comes from the worker timer, not the events. Host observation is via `postMessage` polling, not direct DOM-event listening.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the documented Director MX 2004 data-types (`Color`, `List`, `PropList`, `Point`, `Rect`) are present on `@/lingo` with matching properties, methods, and operators per the docs.
- **SC-002**: A `DirectorContext` can be activated inside its dedicated worker and its singleton slots reflect its instances; two concurrently active movies (in separate workers) maintain fully isolated singletons and member registries (zero cross-context/cross-worker leakage in tests).
- **SC-003**: 100% of the documented properties and methods for the thirteen core objects and four scripting objects are present on the runtime surface with matching signatures and documented behavior, except for (a) the Score-dependent surface of `Sprite`/`SpriteChannel` which is stubbed in v1 (per FR-007/FR-031) and (b) `Window`'s MIAW/sibling-movie execution (e.g., `openMovie`) which is stubbed in v1 (per FR-036) — both deferred to a later iteration. `Window`'s own property/method surface and the root/stage window MUST still be fully implemented and behave per the docs.
- **SC-004**: The base `MemberObject` exposes zero media-specific properties; each of the eight included `X...Member` subclasses exposes 100% of its documented media-type properties/behaviors (including JS-native-backed media behaviors) and nothing undocumented.
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
- Per-movie isolation is achieved via dedicated workers (one movie per worker); each worker's `globalThis` owns its singleton slots. Main-thread singleton slot-swapping is NOT used; the main thread hosts custom elements and the imperative entry point, which spawn a worker per movie. `DirectorContext.activate()` installs a context's instances into its worker's `globalThis` slots only; the bundle and any translated scripts read the activated singletons from `globalThis` (no parameter passing, no per-import injection).
- The existing `packages/director/` scaffold (singletons, context, object classes, methods) is treated as current state to evolve; this feature defines the target spec the package must ultimately satisfy.
- Where the docs map a Director type to a native JS type, that mapping is followed literally; no custom class is added where the docs do not require one.
- Member subclasses representing included media are fully implemented in this iteration, including documented native media behaviors (bitmap, palette, cursor, sound, field/text, font, button), backed by JS-native implementations (browser/worker APIs); excluded subclasses exist solely as non-failing stubs and gain behavior in a later iteration.
- "JS-native backends" means browser/worker Web APIs plus the runtime's own pure-JS code — never native/legacy NPAPI/ActiveX plugin code paths and never the binary Director/Shockwave file formats.
- Media payloads (bitmaps, sounds, fields/text, palettes, cursors, fonts) are embedded inline in the bundle as typed arrays/strings (never URL references); the worker decodes them in-memory using JS-native backends. No runtime fetch of media by URL; the only network fetch is the bundle ES module's dynamic `import()` itself.
- The event loop is self-driven inside the worker using timer APIs (`setTimeout`/`setInterval`) at the movie's tempo (FPS); the main thread does not pump frames to the worker.
- The runtime dispatches a documented set of custom lifecycle events inside the worker on the `DirectorContext` (a worker-side `EventTarget`); the host page does NOT receive these events directly. Host-side observation is via `postMessage` polling through the main-thread handle, not via DOM `addEventListener` on the handle/element; the imperative handle and `<x-object>`/`<x-embed>` do NOT re-dispatch lifecycle events. Events are a notification channel only and are NOT the timing source.
- The Score (Director's per-frame sprite/channel timeline and frame script bindings) is out of scope for v1: no score section in the bundle, `Sprite`/`SpriteChannel` are API-only shells, the event loop ticks at tempo but advances no Score frame, and frame-navigation methods that require Score data (`go`/`goNext`/`goPrevious`/`goLoop`) are stubbed. However, the lifecycle EVENTS themselves (`prepareFrame`/`enterFrame`/`exitFrame`/`beginSprite`/`endSprite`/`prepareMovie`/`startMovie`/`stopMovie`/`on idle`/`on timeout`) MUST fire fully and in the documented order every tick (per FR-037), independent of Score data — the Score's absence only removes sprite-placement data, it does NOT suppress the events. Non-Score runtime behavior (member/cast access, top-level methods, data-types, singletons) MUST work. The Score and full sprite/score-driven property behavior are deferred to a later iteration.
- MIAW (Movies In A Window) — `Window.openMovie` and sibling-movie execution — is out of scope for v1: `Window` exposes its full documented property/method surface (testable) and the root/stage window works, but loading/running a sibling movie in another window is a documented no-op. Multi-worker sibling-movie coordination and multi-`OffscreenCanvas` compositing are deferred to a later iteration.
- `gotoNetMovie` (a net operation, per FR-033) is distinct from Score frame navigation (`go`/`goNext`/`goPrevious`/`goLoop`, deferred per FR-031): `gotoNetMovie` triggers loading a different movie bundle ES module URL and starting it in a new context/worker; it is NOT Score-frame advancement and MUST work in v1.
- The imperative run entry point runs on the main thread and spawns (and owns) a dedicated `Worker` per movie; the control handle is a main-thread proxy that posts messages to the worker. Custom elements use the same imperative entry/handle, so they own no separate worker path either.
- The worker renders to an `OffscreenCanvas` transferred from a canvas inside `<x-object>`/`<x-embed>`; the element owns the DOM canvas node, the worker owns the pixels. Input captured on the element is forwarded to the worker as messages; the worker never touches the DOM directly.
- Audio (`Sound`/`SoundChannel`/`SoundMember`) uses the Web Audio API entirely inside the worker — an `AudioContext` owns the graph, `SoundMember` payloads decode via `decodeAudioData`, `SoundChannel` properties (volume/pan/rate) drive `GainNode`/pan nodes. No `<audio>` elements, no main-thread audio nodes; the worker's audio output goes straight to the worker's audio sink.
- Custom elements are a thin layer over the imperative runtime API (P7); they share no separate execution path of their own.