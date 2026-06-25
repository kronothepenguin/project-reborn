## ADDED Requirements

### Requirement: director-runtime SHALL be the host/browser integration surface

`director-runtime` SHALL provide everything a host environment (web browser, embedded client, test harness) needs to mount and run a Director movie: custom HTML elements for embedding, the frame-based event loop, cast library loading, script lifecycle dispatch, and stage rendering. It SHALL be exported from `packages/director/package.json` as `./runtime`. It SHALL use `director-core` internally and SHALL NOT re-export `director-core` types.

**Package**: `packages/director/`
**Source**: `packages/director/src/runtime/`
**Reference**: `docs/drmx2004_scripting_ref.txt` (Chapter 10: Events and Messages), `docs/director-inventory.json` (script-lifecycle and stage-related entries).

#### Scenario: Host imports runtime to mount a movie
- **WHEN** a host wants to mount and run a Director movie
- **THEN** it imports from `@project-reborn/director/runtime` and only from that path

#### Scenario: Core types are not re-exported
- **WHEN** a consumer imports from `@project-reborn/director/runtime`
- **THEN** it cannot reach `director-core` classes by that import; core is reachable only internally within the package

#### Scenario: Runtime does not export ligo-surface names
- **WHEN** a consumer imports from `@project-reborn/director/runtime`
- **THEN** it does not receive `director-lingo` Functions, Globals, Constants, or Syntax constructs; those live under `./lingo`

### Requirement: director-runtime SHALL provide custom elements that replace Shockwave embedding

`director-runtime` SHALL register custom HTML elements that replace the deprecated `<object>`/`<embed>`/`<param>` tags used to load `.dcr` movies in browsers. The elements SHALL accept the movie source and `<param>`-style configuration, and SHALL initialize the Director subsystem when connected to the DOM.

**Reference**: Shockwave embedding conventions; `docs/drmx2004_scripting_ref.txt` for parameter names documented as movie parameters.

#### Scenario: x-object element initializes a movie
- **WHEN** an `<x-object>` element is connected to the DOM with a movie source
- **THEN** the Director subsystem is initialized for that element

#### Scenario: x-param element sets movie parameters
- **WHEN** `<x-param name="src" value="movie.js">` is a child of `<x-object>`
- **THEN** the movie parameter `src` is set to `movie.js` before the movie starts

#### Scenario: x-embed element embeds a cast or asset
- **WHEN** an `<x-embed>` element is used to embed a cast library or asset
- **THEN** the referenced resource is loaded into the Director subsystem

### Requirement: director-runtime SHALL run a frame-based event loop

`director-runtime` SHALL run an event loop that processes frames at the movie's `frameTempo` (frames per second). The loop SHALL dispatch the per-frame script lifecycle events (`prepareFrame`, `enterFrame`, `exitFrame`) and SHALL be startable and stoppable.

**Reference**: `docs/drmx2004_scripting_ref.txt` Chapter 10 — `prepareFrame`, `enterFrame`, `exitFrame`, `frameTempo`.

#### Scenario: Event loop runs at the movie tempo
- **WHEN** the event loop is started with a movie whose `frameTempo` is 30
- **THEN** approximately 30 frames are processed per second

#### Scenario: Event loop dispatches per-frame events in order
- **WHEN** a frame is processed
- **THEN** `prepareFrame`, then `enterFrame`, then `exitFrame` are dispatched in that order

#### Scenario: Event loop can be stopped
- **WHEN** `stopEventLoop()` is called
- **THEN** frame processing stops and no further per-frame events are dispatched

### Requirement: director-runtime SHALL load cast libraries from URLs

`director-runtime` SHALL load Director cast libraries (`.cct` equivalents, represented as JavaScript modules) from URLs and register them with the movie's cast library list. Loading SHALL handle errors without aborting the movie.

**Reference**: `docs/drmx2004_scripting_ref.txt` — `castLib`, `castLibs`, cast library loading.

#### Scenario: Cast library loads and registers
- **WHEN** `loadCast("casts/internal.js")` is called
- **THEN** the cast library is loaded and registered with the movie's cast library list

#### Scenario: Cast loading errors do not abort the movie
- **WHEN** a cast URL is invalid or the fetch fails
- **THEN** the error is logged and the movie continues with the remaining cast libraries

### Requirement: director-runtime SHALL dispatch script lifecycle events

`director-runtime` SHALL dispatch the Director script lifecycle events at the appropriate times: `prepareMovie`, `startMovie`, `stopMovie`, `prepareFrame`, `enterFrame`, `exitFrame`, and any other events documented in Chapter 10 of the MX 2004 reference. Handlers SHALL be invokable on movie scripts, cast scripts, and behavior scripts.

**Reference**: `docs/drmx2004_scripting_ref.txt` Chapter 10 — full event list.

#### Scenario: Movie lifecycle events fire on movie start
- **WHEN** a movie is about to start
- **THEN** `prepareMovie` is dispatched, followed by `startMovie`

#### Scenario: Movie lifecycle events fire on movie stop
- **WHEN** a movie is stopped
- **THEN** `stopMovie` is dispatched

### Requirement: director-runtime SHALL render the stage to a canvas

`director-runtime` SHALL render the Director stage (sprites, members, score) to an HTML5 canvas (or equivalent render target). It SHALL update the stage when frames are processed and SHALL resize the canvas when the stage dimensions change.

**Reference**: `docs/drmx2004_scripting_ref.txt` — `stage`, `the stage`, stage-related properties.

#### Scenario: Stage renders to canvas
- **WHEN** `updateStage()` is called during frame processing
- **THEN** the current frame's sprites and members are rendered to the canvas

#### Scenario: Canvas resizes with the stage
- **WHEN** the stage dimensions change (e.g. via `the stageRect` or movie rect)
- **THEN** the canvas is resized to match

### Requirement: director-runtime SHALL remain the host surface across internal refactors

`director-runtime`'s public surface (the set of names importable from `./runtime`) SHALL be defined by the host-integration responsibility (mount, run, render, load casts, dispatch lifecycle), not by the current `src/runtime/` file split. Internal file organization SHALL NOT change the imported surface.

#### Scenario: Folder refactor does not break hosts
- **WHEN** `packages/director/src/runtime/` is reorganized
- **THEN** existing imports from `@project-reborn/director/runtime` continue to resolve, because the surface is the responsibility set, not the file set
