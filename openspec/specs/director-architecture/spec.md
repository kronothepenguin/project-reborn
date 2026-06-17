## Purpose

Defines the modular architecture of the Director runtime, organizing it into four distinct modules (api, core, runtime, syntax) with clear responsibilities, visibility rules, and dependency hierarchies for implementing Director MX 2004 compatibility in JavaScript.

## Requirements

### Requirement: Director runtime SHALL be organized into four modules

The Director runtime SHALL be organized into four distinct modules with clear responsibilities, each as a folder with atomic files:

| Module | Visibility | Purpose | Location |
|--------|-----------|---------|----------|
| `api/` | Public | Director API surface (constants, globals, functions) | `apps/client/src/director/api/` |
| `core/` | Private | Implementation details (classes, loader, registries) | `apps/client/src/director/core/` |
| `runtime/` | Public | Browser plugin replacement (custom elements, mount, run) | `apps/client/src/director/runtime/` |
| `syntax/` | Public | Lingo syntax helpers (the proxy, chunk expressions) | `apps/client/src/director/syntax/` |

Each module SHALL have:
- Individual files per method/class
- Co-located tests in `__tests__/` subfolder
- Barrel export via `index.js`

#### Scenario: Module separation
- **WHEN** importing Director API functions
- **THEN** use `import { voidP, list, member } from "../../director"` (barrel export from index.js)

#### Scenario: Private implementation not exported
- **WHEN** code tries to import from core
- **THEN** it uses `import { List } from "../../director/core"` (not exported from main index.js)

#### Scenario: Atomic file structure
- **WHEN** looking for abs() implementation
- **THEN** it exists at `api/abs.js` with test at `api/__tests__/abs.test.js`

### Requirement: api/ SHALL contain Director API surface

`api/` SHALL contain all Director API elements documented in the Director MX 2004 reference, organized as atomic files.

**Constants** (in `api/constants.js`):
- `VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`

**Globals** (in `api/globals.js`):
- `_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`

**Functions** (each in own file):
- Type checks: `voidP()`, `integerP()`, `floatP()`, `listP()`, `objectP()`, `stringP()`, `symbolP()`, `ilk()`
- Data types: `list()`, `propList()`, `point()`, `rect()`, `color()`, `symbol()`
- Conversions: `integer()`, `float()`, `string()`, `value()`, `charToNum()`, `numToChar()`
- Math: `abs()`, `sqrt()`, `atan()`, `tan()`, `log()`, `power()`, `max()`, `min()`, `cos()`, `sin()`, `random()`
- Member access: `member()`, `script()`, `sprite()`, `castLib()`
- Network: `getNetText()`, `postNetText()`, `netDone()`, `netError()`, `netTextResult()`, `preloadNetThing()`
- All other Director API functions from the reference

#### Scenario: api.js exports Director API
- **WHEN** Lingo code calls `voidP(x)`
- **THEN** it imports from `api/void-p.js` via barrel export

#### Scenario: api.js exports globals
- **WHEN** Lingo code accesses `_global.gVar`
- **THEN** it imports `_global` from `api/globals.js`

### Requirement: core/ SHALL contain private implementation

`core/` SHALL contain implementation details used by other modules:

**Classes** (each in own file):
- `List`, `PropList` - Lingo list types with Proxy wrappers
- `MemberRef`, `MovieRef`, `PlayerRef`, `SpriteRef`, `SoundRef` - Director objects (Ref suffix)
- `CastLibraryRef`, `ScriptRef`, `ScriptObject` - Cast and script management
- `Rect`, `Point`, `Color` - Geometric and color types
- `DirectorWindow`, `TimeoutRef`, `ImageObjectRef` - Media types

**Helpers:**
- `createList()`, `createPropList()` - Factory functions
- `createIndexedRegistry()` - 1-indexed registry proxy
- `createScriptObject()` - Script instance factory
- `createPointProxy()`, `createRectProxy()` - Geometric proxies

**Loader:**
- `loadImage()`, `loadModule()`, `loadPromise()` - Asset loading
- `pending`, `loaded`, `total` - Loading state
- `addFinishedListener()` - Load completion callback

**Registries:**
- Member registries for cast libraries
- Script registries
- Timeout registries (`_timeouts`)

#### Scenario: core/ used by api/
- **WHEN** `api/` needs to create a List
- **THEN** it imports `createList` from `core/list.js`

#### Scenario: core/ not exported from main
- **WHEN** external code tries `import { List } from "../../director"`
- **THEN** it fails (List is not in the main barrel export)

### Requirement: runtime/ SHALL provide browser plugin replacement

`runtime/` SHALL provide the external API for running Director movies in browsers:

**Custom Elements:**
- `<x-object>` - Replaces `<object>` tag for .dcr files
- `<x-param>` - Replaces `<param>` tag for movie parameters

**Functions:**
- `setCanvas(canvas)` - Set the canvas element
- `setExternalParams(params)` - Set movie parameters
- `registerCast(name, members)` - Register a cast library

**Event Loop:**
- Animation frame loop at specified tempo
- Event dispatching (`prepareMovie`, `enterFrame`, `exitFrame`, etc.)

#### Scenario: Custom element usage
- **WHEN** HTML contains `<x-object><x-param name="src" value="movie.js"></x-object>`
- **THEN** runtime loads and runs the movie

### Requirement: syntax/ SHALL contain Lingo syntax helpers

`syntax/` SHALL contain helpers for Lingo syntax patterns:

**The Proxy:**
- `the` - Proxy object for system properties (`the.keyCode`, `the.milliSeconds`, etc.)

**Chunk Expressions:**
- `char()`, `item()`, `line()`, `word()` - Chunk access functions
- `charOf()`, `itemOf()`, `lineOf()`, `wordOf()` - Chunk helper proxies

**Utilities:**
- `numberOfCastMembersOfCastLib()` - Cast member count
- `putAfter()` - Chunk insertion

#### Scenario: The proxy usage
- **WHEN** Lingo code uses `the.keyCode`
- **THEN** it imports `the` from `syntax/the-proxy.js`

### Requirement: index.js SHALL export public modules only

`index.js` SHALL be a barrel export file that exports only public modules:

```javascript
export * from "./api/index.js";
export * from "./runtime/index.js";
export * from "./syntax/index.js";

// NOT exported: core/ (private)
```

#### Scenario: Barrel export
- **WHEN** code imports `import { voidP, the, setCanvas } from "../../director"`
- **THEN** it gets functions from api/, syntax/, and runtime/

#### Scenario: Core not accessible
- **WHEN** code tries `import { List } from "../../director"`
- **THEN** it fails (List is not in the barrel export)

### Requirement: Module dependencies SHALL follow a strict hierarchy

Module dependencies SHALL follow this hierarchy:

```
index.js (barrel)
  ↓
api/ (Director API)
  ↓
core/ (implementation)
  
runtime/ (browser plugin)
  ↓
core/ (implementation)

syntax/ (syntax helpers)
  ↓
core/ (implementation)
```

**Rules:**
- `api/` can import from `core/`
- `runtime/` can import from `core/`
- `syntax/` can import from `core/`
- `core/` cannot import from `api/`, `runtime/`, or `syntax/`
- No circular dependencies

#### Scenario: Dependency direction enforced
- **WHEN** `core/list.js` needs a utility function
- **THEN** it implements locally or imports from another core file (never from api/, runtime/, or syntax/)

#### Scenario: Cross-module import allowed
- **WHEN** `api/abs.js` needs List class
- **THEN** it imports from `core/list.js` (downward dependency allowed)

### Requirement: Spec files SHALL contain full Director MX 2004 documentation

Each method and property spec file SHALL contain the complete documentation from the Director MX 2004 reference, not just line references. This ensures implementations match the official specification exactly.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Spec file structure**:
```markdown
## <name>

**Source**: `docs/drmx2004_scripting_ref.txt` lines <start>-<end>

### Usage
<exact Lingo syntax from documentation>

### Description
<exact description text from documentation>

### Parameters
<exact parameter descriptions from documentation, or "None.">

### Returns
<return value description if documented>

### Example
<exact example code from documentation - used for test generation>

### See also
<related methods/properties from documentation>

### Implementation
- **File**: `apps/client/src/director/<module>/<file>.js`
- **Test**: `apps/client/src/director/<module>/__tests__/<file>.test.js`
- **Dependencies**: <list of core classes or other API functions needed>
```

**Why full documentation?**
- Prevents AI hallucination of behavior
- Ensures exact match with Director MX 2004
- Provides examples for test generation
- Allows verification of implementation correctness

#### Scenario: Method spec contains full documentation
- **WHEN** creating spec for `abs()` method
- **THEN** spec includes exact Usage, Description, Parameters, Example from lines 11767-11797

#### Scenario: Property spec contains full documentation
- **WHEN** creating spec for `sprite.blend` property
- **THEN** spec includes exact Usage, Description from documentation
