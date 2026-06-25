## ADDED Requirements

### Requirement: Runtime SHALL be organized in runtime/ directory

The Director runtime SHALL be organized in `apps/client/src/director/runtime/` with each component in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 10: Events and Messages

**Files**:
- `apps/client/src/director/runtime/custom-elements.js`
- `apps/client/src/director/runtime/event-loop.js`
- `apps/client/src/director/runtime/cast-loader.js`
- `apps/client/src/director/runtime/script-lifecycle.js`
- `apps/client/src/director/runtime/canvas.js`
- `apps/client/src/director/runtime/index.js`

**Tests**:
- `apps/client/src/director/runtime/__tests__/custom-elements.test.js`
- `apps/client/src/director/runtime/__tests__/event-loop.test.js`
- `apps/client/src/director/runtime/__tests__/cast-loader.test.js`
- `apps/client/src/director/runtime/__tests__/script-lifecycle.test.js`
- `apps/client/src/director/runtime/__tests__/canvas.test.js`

#### Scenario: Runtime components are importable
- **WHEN** code imports `import { startEventLoop, loadCast } from "../../director/runtime"`
- **THEN** all runtime components are available

### Requirement: Custom elements SHALL replace Shockwave tags

The runtime SHALL provide custom elements `<x-object>` and `<x-param>` for embedding Director movies.

#### Scenario: x-object element initializes movie
- **WHEN** `<x-object>` element is added to DOM
- **THEN** Director movie is initialized

#### Scenario: x-param element sets parameters
- **WHEN** `<x-param name="src" value="movie.js">` is inside `<x-object>`
- **THEN** movie parameter "src" is set to "movie.js"

### Requirement: Event loop SHALL run at specified tempo

The runtime SHALL provide an event loop that processes frames at the movie's tempo.

#### Scenario: Event loop processes frames
- **WHEN** event loop is started with tempo 30
- **THEN** 30 frames are processed per second

#### Scenario: Event loop can be stopped
- **WHEN** `stopEventLoop()` is called
- **THEN** frame processing stops

### Requirement: Cast loader SHALL load cast libraries

The runtime SHALL provide functionality to load cast libraries from URLs.

#### Scenario: Cast library loads from URL
- **WHEN** `loadCast("casts/internal.js")` is called
- **THEN** cast library is loaded and registered

#### Scenario: Cast loading handles errors
- **WHEN** cast URL is invalid
- **THEN** error is logged and loading continues

### Requirement: Script lifecycle SHALL dispatch events

The runtime SHALL dispatch lifecycle events at appropriate times.

#### Scenario: prepareMovie event dispatched
- **WHEN** movie is about to start
- **THEN** `prepareMovie` event is dispatched

#### Scenario: enterFrame event dispatched
- **WHEN** playhead enters a frame
- **THEN** `enterFrame` event is dispatched

#### Scenario: exitFrame event dispatched
- **WHEN** playhead exits a frame
- **THEN** `exitFrame` event is dispatched

### Requirement: Canvas SHALL render stage

The runtime SHALL provide canvas rendering for the Director stage.

#### Scenario: Stage renders to canvas
- **WHEN** `updateStage()` is called
- **THEN** current frame is rendered to canvas

#### Scenario: Canvas resizes with stage
- **WHEN** stage dimensions change
- **THEN** canvas is resized accordingly

### Requirement: All runtime components SHALL match Director MX 2004 behavior

Each runtime component SHALL behave as documented in Director MX 2004.

#### Scenario: Runtime matches Director behavior
- **WHEN** runtime components are used
- **THEN** behavior matches Director MX 2004 documentation
