## ADDED Requirements

### Requirement: Custom element lifecycle SHALL be tested

The runtime SHALL provide tests for custom element registration and lifecycle:

**Elements to test:**
- `<x-object>` - Replaces `<object>` tag for .dcr files
- `<x-param>` - Replaces `<param>` tag for movie parameters

#### Scenario: x-object element is registered
- **WHEN** custom elements are queried
- **THEN** `x-object` is defined as a custom element

#### Scenario: x-param element is registered
- **WHEN** custom elements are queried
- **THEN** `x-param` is defined as a custom element

#### Scenario: x-object connectedCallback is called
- **WHEN** `<x-object>` element is added to DOM
- **THEN** connectedCallback lifecycle method is invoked

#### Scenario: x-param connectedCallback is called
- **WHEN** `<x-param>` element is added to DOM
- **THEN** connectedCallback lifecycle method is invoked

### Requirement: setCanvas SHALL update canvas reference

The runtime SHALL provide tests for canvas management:

#### Scenario: setCanvas stores canvas reference
- **WHEN** `setCanvas(canvasElement)` is called
- **THEN** internal canvas reference is updated

#### Scenario: setCanvas accepts null
- **WHEN** `setCanvas(null)` is called
- **THEN** internal canvas reference is cleared

#### Scenario: setCanvas with valid canvas element
- **WHEN** `setCanvas(document.createElement('canvas'))` is called
- **THEN** does not throw error

### Requirement: setExternalParams SHALL parse parameters

The runtime SHALL provide tests for parameter parsing:

#### Scenario: setExternalParams stores parameters
- **WHEN** `setExternalParams({ src: "movie.js", quality: "high" })` is called
- **THEN** parameters are stored in `_params`

#### Scenario: setExternalParams extracts src parameter
- **WHEN** `setExternalParams({ src: "movie.js" })` is called
- **THEN** movie loading is triggered with "movie.js"

#### Scenario: setExternalParams handles empty params
- **WHEN** `setExternalParams({})` is called
- **THEN** does not throw error

### Requirement: Event dispatching SHALL update global state

The runtime SHALL provide tests for event handling and global state updates:

**Events to test:**
- `mousemove` - Updates `_mouse.mouseH`, `_mouse.mouseV`, `_mouse.mouseLoc`
- `mousedown` - Updates `_mouse.clickOn`, `_mouse.clickLoc`
- `mouseup` - Updates mouse button state
- `keydown` - Updates `_key.keyCode`, `_key.key`, `_key.shiftDown`, etc.
- `keyup` - Updates key state flags

#### Scenario: mousemove updates mouseH and mouseV
- **WHEN** mousemove event fires with clientX=100, clientY=200
- **THEN** `_mouse.mouseH` equals 100 and `_mouse.mouseV` equals 200

#### Scenario: mousemove updates mouseLoc
- **WHEN** mousemove event fires with clientX=100, clientY=200
- **THEN** `_mouse.mouseLoc` returns Point with x=100, y=200

#### Scenario: keydown updates keyCode
- **WHEN** keydown event fires with keyCode=65 (A key)
- **THEN** `_key.keyCode` equals 65

#### Scenario: keydown updates key property
- **WHEN** keydown event fires with key="a"
- **THEN** `_key.key` equals "a"

#### Scenario: keydown with shift updates shiftDown
- **WHEN** keydown event fires with shiftKey=true
- **THEN** `_key.shiftDown` equals true

#### Scenario: keydown with ctrl updates controlDown
- **WHEN** keydown event fires with ctrlKey=true
- **THEN** `_key.controlDown` equals true

#### Scenario: keydown with alt updates optionDown
- **WHEN** keydown event fires with altKey=true
- **THEN** `_key.optionDown` equals true

#### Scenario: keydown with meta updates commandDown
- **WHEN** keydown event fires with metaKey=true
- **THEN** `_key.commandDown` equals true

#### Scenario: keyup clears key state
- **WHEN** keyup event fires
- **THEN** `_key.key` is cleared or updated appropriately

### Requirement: prepareMovie event SHALL be dispatched

The runtime SHALL provide tests for movie lifecycle events:

#### Scenario: prepareMovie event is dispatched on canvas
- **WHEN** movie initialization completes
- **THEN** `prepareMovie` custom event is dispatched on canvas element

#### Scenario: prepareMovie event listeners are called
- **WHEN** prepareMovie event is dispatched
- **THEN** all registered listeners are invoked

#### Scenario: movie scripts receive prepareMovie callback
- **WHEN** movie script has prepareMovie handler
- **THEN** handler is called during initialization

### Requirement: Animation frame loop SHALL be tested

The runtime SHALL provide tests for the animation frame loop:

#### Scenario: requestAnimationFrame is called
- **WHEN** movie starts
- **THEN** requestAnimationFrame is scheduled

#### Scenario: animation frame respects tempo
- **WHEN** `_movie._tempo` is set to 30
- **THEN** frame updates occur approximately every 33ms

#### Scenario: animation frame updates frame counter
- **WHEN** animation frame callback executes
- **THEN** `_movie._frame` is incremented

### Requirement: Member creation functions SHALL be tested

The runtime SHALL provide tests for member creation:

#### Scenario: createBitmapMember creates bitmap member
- **WHEN** `createBitmapMember("logo", "logo.png")` is called
- **THEN** returns Member with type `Symbol.for("bitmap")`

#### Scenario: createFieldMember creates field member
- **WHEN** `createFieldMember("text", "Hello")` is called
- **THEN** returns Member with type `Symbol.for("field")`

#### Scenario: createScriptMember creates script member
- **WHEN** `createScriptMember("MyScript", PARENT_SCRIPT, factory)` is called
- **THEN** returns Member with type `Symbol.for("script")`

#### Scenario: createScriptMember stores factory
- **WHEN** `createScriptMember("MyScript", PARENT_SCRIPT, factory)` is called
- **THEN** member._raw equals factory function

### Requirement: registerCast SHALL register cast library

The runtime SHALL provide tests for cast registration:

#### Scenario: registerCast adds cast to movie
- **WHEN** `registerCast("Internal", members)` is called
- **THEN** cast is added to `_movie._castRegistry`

#### Scenario: registerCast assigns cast number
- **WHEN** `registerCast("Internal", members)` is called
- **THEN** cast._number is set to sequential value

#### Scenario: registerCast stores members
- **WHEN** `registerCast("Internal", [member1, member2])` is called
- **THEN** members are accessible via cast._member

#### Scenario: multiple casts can be registered
- **WHEN** `registerCast("Cast1", [])` and `registerCast("Cast2", [])` are called
- **THEN** both casts are accessible in `_movie.castLib`

### Requirement: Loader functions SHALL be tested

The runtime SHALL provide tests for asset loading:

#### Scenario: loadImage creates Image element
- **WHEN** `loadImage("test.png")` is called
- **THEN** returns HTMLImageElement with src set

#### Scenario: loadImage tracks pending loads
- **WHEN** `loadImage("test.png")` is called
- **THEN** `totalObjects()` increments

#### Scenario: loadImage completes tracking on load
- **WHEN** image load event fires
- **THEN** `objectsLoaded()` increments

#### Scenario: loadModule imports module
- **WHEN** `loadModule("movie.js")` is called
- **THEN** dynamic import is initiated

#### Scenario: loadModule tracks pending loads
- **WHEN** `loadModule("movie.js")` is called
- **THEN** `totalObjects()` increments

#### Scenario: addFinishedListener registers callback
- **WHEN** `addFinishedListener(callback)` is called and all loads complete
- **THEN** callback is invoked

#### Scenario: finished returns true when no pending loads
- **WHEN** all loads complete
- **THEN** `finished()` returns true

### Requirement: Global handler registration SHALL be tested

The runtime SHALL provide tests for global handler registration:

#### Scenario: movie script handlers are registered globally
- **WHEN** movie script with handlers is loaded
- **THEN** handlers are accessible via `globalThis._director`

#### Scenario: prepareMovie handler is registered
- **WHEN** movie script has prepareMovie method
- **THEN** it's added as event listener on canvas

### Requirement: Script reference creation SHALL be tested

The runtime SHALL provide tests for script references:

#### Scenario: script() returns ScriptRef for valid script
- **WHEN** `script("MyScript")` is called with existing script member
- **THEN** returns ScriptRef instance

#### Scenario: script() returns stub for missing script
- **WHEN** `script("NonExistent")` is called
- **THEN** returns stub object with new() and handler() methods

#### Scenario: ScriptRef.new() creates instance
- **WHEN** `scriptRef.new()` is called
- **THEN** returns new script instance

### Requirement: Integration test setup SHALL use jsdom environment

The test suite SHALL configure jsdom for DOM testing:

#### Scenario: jsdom environment is configured
- **WHEN** tests run
- **THEN** DOM APIs (document, window, HTMLElement) are available

#### Scenario: custom elements can be created in tests
- **WHEN** test creates `<x-object>` element
- **THEN** element is instance of HTMLElement

#### Scenario: events can be dispatched in tests
- **WHEN** test dispatches CustomEvent
- **THEN** event listeners are invoked

### Requirement: Test coverage SHALL verify Director MX 2004 reference compliance

The test suite SHALL verify implementation matches Director MX 2004 reference documentation:

#### Scenario: All API functions match reference behavior
- **WHEN** tests run
- **THEN** all Director API functions behave according to Director MX 2004 reference

#### Scenario: All `the` properties match reference behavior
- **WHEN** tests run
- **THEN** all `the` proxy properties behave according to Director MX 2004 reference

#### Scenario: Reference examples are verified
- **WHEN** Director MX 2004 reference provides examples
- **THEN** those examples are included as test cases
