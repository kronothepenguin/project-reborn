# director-runtime Specification

## Purpose
TBD - created by archiving change director-specs-foundation. Update Purpose after archive.
## Requirements
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

### Requirement: director-runtime SHALL be the private low-level host-integration layer

`director-runtime` SHALL be the private internal layer under `packages/director/src/runtime/` that wraps host (browser) APIs and exposes primitives consumed by `director-core`, `director-syntax`, and `director-browser`. It SHALL NOT be exported as a public subpath.

At refactor state (this change), it SHALL hold the following files (as moved or kept by this refactor):
- `event-loop.js` — frame-based event loop driven by `requestAnimationFrame`
- `script-lifecycle.js` — dispatchers for `prepareMovie`, `startMovie`, `stopMovie`, `prepareFrame`, `enterFrame`, `exitFrame`, and the `LIFECYCLE_EVENTS` list
- `canvas.js` — canvas 2D context wrappers (`setCanvas`, `getCanvas`, `getContext`, `updateStage`, `resizeCanvas`, `setBackgroundColor`, `getStageSize`, `resetCanvas`, `_setCanvas`)
- `cast-loader.js` — low-level cast library fetch from a URL
- `index.js` — slimmed; re-exports the above. Does NOT re-export custom-elements primitives (those moved to `director-browser`).

It SHALL NOT host custom-elements registration or movie/cast registration helpers (those live in `director-browser`).

This refactor change locks the layer role and the `_setCanvas` / `startEventLoop` / `stopEventLoop` consumer contract used by `src/browser/custom-elements.js`. Concrete event-loop cadence, canvas rendering behaviour, script-lifecycle semantics are described at high level here; follow-up changes (e.g. `director-runtime-value-types`, future lifecycle work) extend this requirement with their own deltas.

**Package**: `packages/director/`
**Source**: `packages/director/src/runtime/`
**Reference**: `docs/drmx2004_scripting_ref/` (`events_and_messages.txt` for lifecycle event list).

#### Scenario: Runtime is not a public export
- **WHEN** `packages/director/package.json` `exports` is inspected after this refactor
- **THEN** `./runtime` is absent

#### Scenario: Custom elements are not in runtime after refactor
- **WHEN** `packages/director/src/runtime/` is inspected after this refactor
- **THEN** the directory does not contain `custom-elements.js`; it has moved to `packages/director/src/browser/custom-elements.js`

#### Scenario: Runtime keeps host-API wrappers
- **WHEN** `packages/director/src/runtime/` is inspected after this refactor
- **THEN** it still contains `event-loop.js`, `script-lifecycle.js`, `canvas.js`, `cast-loader.js`, `index.js`, plus the existing `__tests__/` for those (with `custom-elements.test.js` removed if it was a runtime test, moved to `src/browser/__tests__/`)

#### Scenario: Runtime index re-exports slim down
- **WHEN** `packages/director/src/runtime/index.js` is inspected after this refactor
- **THEN** it re-exports `startEventLoop`, `stopEventLoop`, `setTempo`, `isEventLoopRunning` from `./event-loop.js`; `loadCast` from `./cast-loader.js`; `dispatchPrepareMovie`, `dispatchStartMovie`, `dispatchStopMovie`, `dispatchPrepareFrame`, `dispatchEnterFrame`, `dispatchExitFrame`, `dispatchAll`, `LIFECYCLE_EVENTS` from `./script-lifecycle.js`; and the canvas primitives listed above from `./canvas.js`. It does NOT re-export `registerCustomElements` or `_createMovie`.

### Requirement: director-runtime SHALL host Director value data types after the follow-up move (transition state)

`director-runtime` SHALL be the permanent home of Director value data types (`List`, `PropList`, `Point`, `Rect`, `Color`); per the MX 2004 reference these are data types, not core objects (Chapter 5), and belong in the low-level host-integration layer.

At refactor state (this change), the value-type files still physically live in `src/core/` because this refactor is mechanical-only and does not move them. The follow-up change `director-runtime-value-types` moves them to `src/runtime/` and updates this requirement to record the post-move reality.

At refactor state (this change), the value-type files still physically live in `src/core/` because this refactor is mechanical-only and does not move them. The follow-up change `director-runtime-value-types` moves them to `src/runtime/` and updates this requirement to record the post-move reality.

#### Scenario (refactor state): Value types are NOT yet in runtime
- **WHEN** `packages/director/src/runtime/` is inspected after this refactor
- **THEN** `list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` are NOT present; they remain in `src/core/`

#### Scenario (target state, follow-up): Value types move to runtime
- **WHEN** the follow-up change `director-runtime-value-types` is archived
- **THEN** that change's delta updates this requirement to record that the files now live in `src/runtime/`, and the refactor-state scenario above is removed

### Requirement: director-runtime SHALL expose `_setCanvas` and event-loop controls to `director-browser`

`director-runtime` SHALL expose `setCanvas` (or the private `_setCanvas`) so `director-browser`'s custom elements can install the DOM canvas into the runtime's rendering target. It SHALL expose `startEventLoop`, `stopEventLoop`, `setTempo`, `isEventLoopRunning` so `director-browser`'s custom elements can drive frame playback. This refactor preserves the existing function names and signatures; only their import paths change.

#### Scenario: browser custom-elements consume runtime canvas setter
- **WHEN** `packages/director/src/browser/custom-elements.js` initialises a movie element
- **THEN** it imports and calls `_setCanvas` from `../runtime/canvas.js` (path after the move)

#### Scenario: browser custom-elements consume runtime event loop
- **WHEN** `packages/director/src/browser/custom-elements.js` starts and stops movie playback
- **THEN** it imports `startEventLoop` and `stopEventLoop` from `../runtime/event-loop.js` (path after the move)

