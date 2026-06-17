## ADDED Requirements

### Requirement: Director runtime SHALL be organized in runtime/ directory

The Director runtime (browser integration) SHALL be organized in `apps/client/src/director/runtime/`. Tests SHALL be co-located in `apps/client/src/director/runtime/__tests__/`.

**File structure:**
```
apps/client/src/director/runtime/
├── __tests__/
│   ├── canvas.test.js
│   ├── custom-elements.test.js
│   ├── event-loop.test.js
│   └── ...
├── canvas.js
├── custom-elements.js
├── event-loop.js
├── cast-loader.js
├── script-lifecycle.js
├── index.js (barrel export)
└── ...
```

#### Scenario: Runtime exports are available
- **WHEN** code imports `import { setCanvas, registerCast } from "../director/runtime"`
- **THEN** runtime functions are available

### Requirement: setCanvas() SHALL set the rendering canvas

The `setCanvas()` function SHALL set the HTML canvas element for Director rendering.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Stage and display concepts in Chapter 5

**Parameters**:
- `canvas` Required. HTMLCanvasElement or null

#### Scenario: setCanvas stores canvas reference
- **WHEN** `setCanvas(canvasElement)` is called
- **THEN** internal canvas reference is updated

#### Scenario: setCanvas accepts null
- **WHEN** `setCanvas(null)` is called
- **THEN** internal canvas reference is cleared

### Requirement: setExternalParams() SHALL set movie parameters

The `setExternalParams()` function SHALL set external parameters for the movie.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Parameters in Chapter 14

**Parameters**:
- `params` Required. Object with parameter key/value pairs

#### Scenario: setExternalParams stores parameters
- **WHEN** `setExternalParams({ src: "movie.js" })` is called
- **THEN** parameters are stored and movie loads if src provided

### Requirement: Custom elements SHALL replace Shockwave object tags

The runtime SHALL provide custom elements that replace Shockwave `<object>` and `<param>` tags.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Shockwave Player concepts in Chapter 1

**Elements:**
- `<x-object>` - Replaces `<object>` for .dcr/.js movies
- `<x-param>` - Replaces `<param>` for movie parameters

#### Scenario: x-object element is registered
- **WHEN** custom elements are queried
- **THEN** `x-object` is defined as a custom element

#### Scenario: x-param element is registered
- **WHEN** custom elements are queried
- **THEN** `x-param` is defined as a custom element

#### Scenario: x-object initializes Director
- **WHEN** `<x-object>` element is added to DOM
- **THEN** Director runtime initializes with specified movie

### Requirement: Event loop SHALL drive movie playback

The runtime SHALL provide an event loop that drives movie playback at the specified tempo.

**Reference**: `docs/drmx2004_scripting_ref.txt` - frameTempo and playback in Chapter 14

#### Scenario: Event loop runs at specified tempo
- **WHEN** movie tempo is 30 fps
- **THEN** event loop runs approximately 30 times per second

#### Scenario: Event loop dispatches frame events
- **WHEN** playhead enters a frame
- **THEN** enterFrame event is dispatched

### Requirement: Cast loader SHALL load cast libraries

The runtime SHALL provide functionality to load cast libraries from external sources.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Cast libraries in Chapter 5

#### Scenario: Cast library loads from URL
- **WHEN** cast library with fileName is loaded
- **THEN** members are available via member() function

### Requirement: Script lifecycle SHALL handle movie events

The runtime SHALL handle the Director script lifecycle events.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Events in Chapter 10

**Lifecycle events:**
- `prepareMovie` - Movie is about to start
- `startMovie` - Movie has started
- `stopMovie` - Movie is stopping
- `prepareFrame` - Frame is about to be displayed
- `enterFrame` - Playhead entered frame
- `exitFrame` - Playhead is leaving frame

#### Scenario: prepareMovie handler is called
- **WHEN** movie starts
- **THEN** prepareMovie handlers in movie scripts are called

#### Scenario: enterFrame handler is called
- **WHEN** playhead enters a frame
- **THEN** enterFrame handlers are called

### Requirement: createBitmapMember() SHALL create bitmap member

The `createBitmapMember()` function SHALL create a bitmap cast member from an image source.

**Parameters**:
- `name` Required. Member name
- `src` Required. Image URL

**Returns**: MemberRef with bitmap type

#### Scenario: createBitmapMember creates member
- **WHEN** `createBitmapMember("logo", "/images/logo.png")` is called
- **THEN** returns bitmap MemberRef that loads image

### Requirement: createFieldMember() SHALL create field member

The `createFieldMember()` function SHALL create a field (text) cast member.

**Parameters**:
- `name` Required. Member name
- `content` Required. Initial text content

**Returns**: MemberRef with field type

#### Scenario: createFieldMember creates text member
- **WHEN** `createFieldMember("myField", "Hello World")` is called
- **THEN** returns field MemberRef with text content

### Requirement: createScriptMember() SHALL create script member

The `createScriptMember()` function SHALL create a script cast member.

**Parameters**:
- `name` Required. Member name
- `type` Required. Script type symbol (behavior, movie, parent)
- `factory` Required. Factory function that returns script prototype

**Returns**: MemberRef with script type

#### Scenario: createScriptMember creates movie script
- **WHEN** `createScriptMember("main", Symbol.for("movie"), factory)` is called
- **THEN** returns movie script MemberRef

### Requirement: registerCast() SHALL register cast library

The `registerCast()` function SHALL register a cast library with the movie.

**Parameters**:
- `name` Required. Cast library name
- `members` Required. Array of MemberRef instances

#### Scenario: registerCast makes members available
- **WHEN** `registerCast("Internal", [member1, member2])` is called
- **THEN** members are accessible via member() function
