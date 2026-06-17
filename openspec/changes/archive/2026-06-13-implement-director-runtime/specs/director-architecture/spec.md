## ADDED Requirements

### Requirement: Director runtime SHALL be organized into four modules

The Director runtime SHALL be organized into four distinct modules with clear responsibilities:

| Module | Visibility | Purpose |
|--------|-----------|---------|
| `api.js` | Public | Director API surface (constants, globals, functions from PDF) |
| `core.js` | Private | Implementation details (classes, loader, registries) |
| `runtime.js` | Public | Browser plugin replacement (custom elements, mount, run) |
| `syntax.js` | Public | Lingo syntax helpers (the proxy, chunk expressions) |

#### Scenario: Module separation
- **WHEN** importing Director API functions
- **THEN** use `import { voidP, list, member } from "../../director"` (barrel export from index.js)

#### Scenario: Private implementation not exported
- **WHEN** code tries to import from core.js
- **THEN** it fails (core.js is not exported from index.js)

### Requirement: api.js SHALL contain Director API surface

`api.js` SHALL contain all Director API elements documented in the PDF:

**Constants:**
- `VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`
- `TRUE`, `FALSE`, `ENTER`

**Globals:**
- `_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`

**Functions:**
- Type checks: `voidP()`, `integerP()`, `floatP()`, `listP()`, `objectP()`, `stringP()`, `symbolP()`, `ilk()`
- Data types: `list()`, `propList()`, `point()`, `rect()`, `color()`, `symbol()`
- Conversions: `integer()`, `float()`, `string()`, `value()`, `charToNum()`, `numToChar()`
- Math: `abs()`, `sqrt()`, `atan()`, `tan()`, `log()`, `power()`, `max()`, `min()`, `cos()`, `sin()`, `random()`
- Chunk helpers: `chars()`, `charOf()`, `itemOf()`, `lineOf()`, `wordOf()`
- Member access: `member()`, `script()`, `sprite()`, `field()`, `castLib()`
- Network: `getNetText()`, `postNetText()`, `netDone()`, `netError()`, `netTextResult()`, `preloadNetThing()`
- All other Director API functions from the PDF

#### Scenario: api.js exports Director API
- **WHEN** Lingo code calls `voidP(x)`
- **THEN** it imports from `api.js` via barrel export

#### Scenario: api.js exports globals
- **WHEN** Lingo code accesses `_global.gVar`
- **THEN** it imports `_global` from `api.js`

### Requirement: core.js SHALL contain private implementation

`core.js` SHALL contain implementation details used by `api.js`:

**Classes:**
- `List`, `PropList` - Lingo list types with Proxy wrappers
- `Member`, `Movie`, `Player`, `Sprite`, `Rect`, `Point`, `Color` - Director objects
- `CastLibrary`, `ScriptRef`, `ScriptObject` - Cast and script management
- `Sound`, `DirectorWindow`, `TimeoutRef`, `ImageObjectRef` - Media types

**Helpers:**
- `createList()`, `createPropList()` - Factory functions
- `createIndexedRegistry()` - 1-indexed registry proxy
- `createScriptObject()` - Script instance factory
- `createPointProxy()`, `createRectProxy()` - Geometric proxies

**Loader:**
- `loadImage()`, `loadModule()`, `loadPromise()` - Asset loading (merged from loader.js)
- `pending`, `loaded`, `total` - Loading state
- `addFinishedListener()` - Load completion callback

**Registries:**
- Member registries for cast libraries
- Script registries
- Timeout registries (`_timeouts`)

**Canvas:**
- Canvas reference management
- Image data handling

#### Scenario: core.js used by api.js
- **WHEN** `api.js` needs to create a List
- **THEN** it imports `createList` from `core.js`

#### Scenario: core.js not exported
- **WHEN** external code tries `import { List } from "../../director"`
- **THEN** it fails (List is not exported from index.js)

### Requirement: runtime.js SHALL provide browser plugin replacement

`runtime.js` SHALL provide the external API for running Director movies in browsers, replacing the deprecated NPAPI Shockwave plugin:

**Custom Elements:**
- `<x-object>` - Replaces `<object>` tag for .dcr files
- `<x-param>` - Replaces `<param>` tag for movie parameters

**Mount/Run Functions:**
- `setCanvas(canvas)` - Set the canvas element
- `setExternalParams(params)` - Set movie parameters from `<x-param>` elements
- `load()` - Load cast libraries
- `start()` - Start movie execution
- `registerCast(name, members)` - Register a cast library

**Record/Player:**
- Movie player abstraction (the "record" where casts execute)
- Window management (canvas + `window.open` for multiple windows)
- Animation frame loop
- Event dispatching (`prepareMovie`, etc.)

**External API:**
- Functions needed by external code to mount and run translated movies
- Configuration and initialization
- Integration with browser environment

#### Scenario: Custom element usage
- **WHEN** HTML contains `<x-object><x-param name="src" value="movie.js"></x-object>`
- **THEN** runtime.js loads and runs the movie

#### Scenario: External mount
- **WHEN** external code calls `setCanvas(canvas)` and `setExternalParams(params)`
- **THEN** runtime.js initializes the movie player

### Requirement: syntax.js SHALL contain Lingo syntax helpers

`syntax.js` SHALL contain helpers for Lingo syntax patterns:

**The Proxy:**
- `the` - Proxy object for system properties (`the.keyCode`, `the.milliSeconds`, etc.)

**Chunk Expressions:**
- `char()`, `item()`, `line()`, `word()` - Chunk access functions
- `charOf()`, `itemOf()`, `lineOf()`, `wordOf()` - Chunk helper proxies
- `range()` - Range helper for chunk expressions

**Utilities:**
- `numberOfCastMembersOfCastLib()` - Cast member count
- `putAfter()` - Chunk insertion

#### Scenario: The proxy usage
- **WHEN** Lingo code uses `the.keyCode`
- **THEN** it imports `the` from `syntax.js`

#### Scenario: Chunk expression usage
- **WHEN** Lingo code uses `charOf(str)[2]`
- **THEN** it imports `charOf` from `syntax.js`

### Requirement: index.js SHALL export public modules only

`index.js` SHALL be a barrel export file that exports only public modules:

```javascript
// Export public API
export * from "./api.js";
export * from "./runtime.js";
export * from "./syntax.js";

// NOT exported: core.js (private)
```

#### Scenario: Barrel export
- **WHEN** code imports `import { voidP, the, setCanvas } from "../../director"`
- **THEN** it gets functions from api.js, syntax.js, and runtime.js

#### Scenario: Core not accessible
- **WHEN** code tries `import { List } from "../../director"`
- **THEN** it fails (List is not in the barrel export)

### Requirement: Module dependencies SHALL follow a strict hierarchy

Module dependencies SHALL follow this hierarchy:

```
index.js (barrel)
  ↓
api.js (Director API)
  ↓
core.js (implementation)
  
runtime.js (browser plugin)
  ↓
core.js (implementation)

syntax.js (syntax helpers)
  ↓
core.js (implementation)
```

**Rules:**
- `api.js` can import from `core.js`
- `runtime.js` can import from `core.js`
- `syntax.js` can import from `core.js`
- `core.js` cannot import from `api.js`, `runtime.js`, or `syntax.js`
- No circular dependencies

#### Scenario: api.js imports from core.js
- **WHEN** `api.js` needs `createList`
- **THEN** it imports from `core.js`

#### Scenario: core.js does not import from api.js
- **WHEN** `core.js` is being implemented
- **THEN** it does not import anything from `api.js`

### Requirement: Migration from current structure SHALL preserve functionality

The migration from the current structure SHALL preserve all existing functionality:

**Current → New:**
- `runtime.js` (constants, globals, functions) → `api.js`
- `core.js` (classes, helpers) → `core.js` (refactored)
- `loader.js` → merged into `core.js`
- `syntax.js` → `syntax.js` (unchanged)
- `index.js` → `index.js` (updated barrel export)

**Steps:**
1. Create `api.js` with constants, globals, and API functions from current `runtime.js`
2. Refactor `core.js` to include loader.js functionality
3. Refactor `runtime.js` to contain only browser plugin replacement code
4. Update `index.js` to export api.js, runtime.js, syntax.js (not core.js)
5. Delete `loader.js` (merged into core.js)
6. Verify all imports still work

#### Scenario: No breaking changes
- **WHEN** existing code imports `import { voidP, list, member } from "../../director"`
- **THEN** it still works after migration (via barrel export)

#### Scenario: Loader functionality preserved
- **WHEN** code uses `loadImage()`, `loadModule()`
- **THEN** these functions are available from `core.js` (used internally by api.js)
