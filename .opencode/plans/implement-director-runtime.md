# Plan: Implement Director Runtime in JavaScript

## Overview

Implement the complete Director MX 2004 runtime API in JavaScript, extracted from the official PDF reference (`docs/drmx2004_scripting_ref.pdf`). This enables faithful 1:1 translation of LingoScript to JavaScript.

**PDF extracted to:** `/tmp/director_ref.txt` (57,647 lines)

---

## Current State

### Already Implemented in `runtime.js` (65 functions)
Type checks, data types, conversions, chunk helpers, math, member access, network, constants, and core objects.

### Already Implemented in `syntax.js` (11 functions/constants)
Chunk expression helpers (`charOf`, `itemOf`, `lineOf`, `wordOf`), `the` proxy, `range()`, `numberOfCastMembersOfCastLib()`, `putAfter()`.

### Director API from PDF
- **Methods**: 310 functions (from PDF index)
- **Properties**: 577 properties (organized by object)
- **Constants**: 7+ constants
- **`the` properties**: 56 unique patterns used across .ls files

---

## Functions Used in .ls Files But Missing from Runtime

### True Director API Functions (need implementation)

| Function | PDF Ref | Notes |
|----------|---------|-------|
| `abs()` | p.228 | Absolute value |
| `atan()` | PDF | Arctangent |
| `count()` | PDF | List count (may be property) |
| `error()` | PDF | Error handler |
| `floatP()` | PDF | Already exists as `floatP` (case mismatch: .ls uses `floatp`) |
| `getProp()` | PDF | Property list access |
| `getPropAt()` | PDF | Property list access by index |
| `integerP()` | PDF | Already exists as `integerP` (case mismatch: .ls uses `integerp`) |
| `listP()` | PDF | Already exists as `listP` (case mismatch: .ls uses `listp`) |
| `new()` | PDF | Create new instance |
| `objectP()` | PDF | Already exists as `objectP` (case mismatch: .ls uses `objectp`) |
| `queue()` | PDF | Sound queue |
| `rollOver()` | PDF | Already exists (case mismatch: .ls uses `rollover`) |
| `setVariable()` | PDF | Set variable (also movie script?) |
| `stringP()` | PDF | Already exists as `stringP` (case mismatch: .ls uses `stringp`) |
| `symbolP()` | PDF | Already exists as `symbolP` (case mismatch: .ls uses `symbolp`) |
| `union()` | PDF | List union |
| `updateStage()` | PDF | Update stage |
| `voidP()` | PDF | Already exists as `voidP` (case mismatch: .ls uses `voidp`) |

### Case Mismatches (Lingo uses lowercase, we use camelCase)
The LingoScript files use lowercase type-check functions:
- `voidp` → should alias to `voidP`
- `integerp` → should alias to `integerP`
- `floatp` → should alias to `floatP`
- `listp` → should alias to `listP`
- `objectp` → should alias to `objectP`
- `stringp` → should alias to `stringP`
- `symbolp` → should alias to `symbolP`
- `rollover` → should alias to `rollOver`

### Movie Script Handlers (NOT Director API - from fuse_client)
These are defined in fuse_client and accessed via `_director.`:
- `createWindow`, `getWindow`, `removeWindow`, `windowExists`
- `getVariable`, `setVariable`, `variableExists`, `getIntVariable`
- `createTimeout`, `timeoutExists`, `removeTimeout`
- `getObject`, `createObject`, `removeObject`, `objectExists`
- `getText`, `setText`, `textExists`
- `error`, `executeMessage`, `fatalError`
- `resetClient`, `sendProcessTracking`
- All `construct*Manager`, `deconstruct*Manager` functions
- All `get*Manager`, `remove*Manager` functions
- ~200+ more handlers

---

## `the` Properties Used in .ls Files (56 total)

### Already Implemented in `the` proxy (19)
`alertHook`, `environment`, `frame`, `itemDelimiter`, `keyboardFocusSprite`, `lastChannel`, `longTime`, `milliSeconds`, `mouseH`, `mouseLoc`, `mouseV`, `numberOfCastLibs`, `runMode`, `stageBottom`, `stageLeft`, `stageRight`, `stageTop`

### Missing from `the` proxy (37)
| Property | Usage Count | Maps to |
|----------|-------------|---------|
| `doubleClick` | 53 | `_mouse.doubleClick` |
| `stage` | 54 | Stage dimensions |
| `number` | 25 | Context-dependent (count) |
| `keyCode` | 14 | `_key.keyCode` |
| `time` | 8 | `_system.time` or `time()` |
| `shiftDown` | 8 | `_key.shiftDown` |
| `rollover` | 8 | `_mouse.rollOver` |
| `key` | 7 | `_key.key` |
| `randomSeed` | 6 | `_system.randomSeed` |
| `optionDown` | 5 | `_key.optionDown` |
| `long` | 5 | Format modifier |
| `frameTempo` | 5 | `_movie.frameTempo` |
| `date` | 5 | `date()` or `_system.date` |
| `colorDepth` | 5 | `_system.colorDepth` |
| `timer` | 4 | `_system.timer` |
| `moviePath` | 4 | `_movie.moviePath` |
| `last` | 4 | Context-dependent |
| `selStart` | 3 | Selection start |
| `platform` | 3 | `_system.platform` |
| `paramCount` | 3 | Already in runtime as `paramCount()` |
| `list` | 3 | Context-dependent |
| `floatPrecision` | 3 | `_system.floatPrecision` |
| `debugPlaybackEnabled` | 3 | `_player.debugPlaybackEnabled` |
| `transaction` | 2 | Network transaction |
| `server` | 2 | Network server |
| `selEnd` | 2 | Selection end |
| `reply` | 2 | Network reply |
| `remote` | 2 | Network remote |
| `maxinteger` | 2 | Max integer value |
| `frame` | 2 | `_movie.frame` |
| `xtraList` | 1 | `_player.xtraList` |
| `parameters` | 1 | `_player.parameters` |
| `Netscape` | 1 | Browser detection |
| `model` | 1 | 3D model |
| `exitLock` | 1 | `_player.exitLock` |
| `editShortcutsEnabled` | 1 | `_player.editShortcutsEnabled` |
| `download` | 1 | Network download |
| `doorbell` | 1 | Sound doorbell |
| `content` | 1 | Content type |
| `commandDown` | 1 | `_key.commandDown` |
| `clickOn` | 1 | `_mouse.clickOn` |
| `browser` | 1 | Browser detection |

---

## Implementation Plan

### Phase 1: Core Runtime Functions

**Priority: High** - Functions needed for vertical slice (hh_entry_init)

1. **Math functions**
   - `abs(numericExpression)` → `Math.abs()`
   - `atan(angle)` → `Math.atan()`
   - `sqrt(number)` → `Math.sqrt()`
   - `max(list)` or `max(a, b)` → `Math.max()`
   - `min(list)` or `min(a, b)` → `Math.min()`
   - `power(base, exponent)` → `Math.pow()`
   - `log(number)` → `Math.log()`
   - `tan(angle)` → `Math.tan()`

2. **Type checking aliases** (lowercase versions)
   - Export `voidp` as alias for `voidP`
   - Export `integerp` as alias for `integerP`
   - Export `floatp` as alias for `floatP`
   - Export `listp` as alias for `listP`
   - Export `objectp` as alias for `objectP`
   - Export `stringp` as alias for `stringP`
   - Export `symbolp` as alias for `symbolP`
   - Export `rollover` as alias for `rollOver`

3. **List operations**
   - `getAt(list, position)` → already stubbed, implement
   - `union(list1, list2)` → list union
   - `count` → list property (already on List class)

4. **Property list operations**
   - `getProp(propList, symbol)` → get property by symbol
   - `getPropAt(propList, index)` → get property at position

5. **String operations**
   - `offset(sub, str)` → already implemented
   - `contains(str, sub)` → string contains
   - `starts(str, prefix)` → string starts with

### Phase 2: `the` Properties

Add missing properties to the `the` proxy in `syntax.js`:

```javascript
// High priority (used in hh_entry_init)
doubleClick: 0,           // _mouse.doubleClick
stage: { rect: ... },     // Stage dimensions
keyCode: 0,               // _key.keyCode
time: "",                 // formatted time
shiftDown: false,         // _key.shiftDown
key: "",                  // _key.key

// Medium priority
randomSeed: 0,            // _system.randomSeed
optionDown: false,        // _key.optionDown
frameTempo: 0,            // _movie.frameTempo
date: "",                 // formatted date
colorDepth: 32,           // _system.colorDepth
timer: 0,                 // _system.timer
moviePath: "",            // _movie.moviePath
selStart: 0,              // selection start
selEnd: 0,                // selection end
platform: "",             // _system.platform
floatPrecision: 4,        // _system.floatPrecision
debugPlaybackEnabled: false, // _player.debugPlaybackEnabled
maxinteger: Number.MAX_SAFE_INTEGER,
commandDown: false,       // _key.commandDown
clickOn: 0,               // _mouse.clickOn
```

### Phase 3: Instance Creation

- `new(scriptRef)` → create new instance from parent script
- `rawNew(scriptRef)` → create without initialization

### Phase 4: Network Functions

- `netAbort(netID)` → abort network operation
- `netLastModDate(netID)` → last modified date
- `netMIME(netID)` → MIME type

### Phase 5: Sound Functions

- `soundBusy(channel)` → check if sound playing
- `playSound(channel, member)` → play sound
- `queueSound(channel, member)` → queue sound

### Phase 6: Window/Stage Functions

- `updateStage()` → refresh stage
- `moveToFront(window)` → bring to front
- `moveToBack(window)` → send to back

### Phase 7: Cast/Media Functions

- `newMember(type)` → create new cast member
- `unLoadMember(member)` → unload member
- `preLoadMember(member)` → preload member
- `resetCastLibs()` → reset cast libraries

### Phase 8: Advanced/3D (Low Priority)

Most 3D functions are not used in Habbo. Implement only if needed:
- `camera()`, `light()`, `shader()`, `texture()`, `vector()`
- 3D modifier methods
- World operations

---

## Spec Structure

### `director-api/spec.md`

One spec file covering:
1. **Methods** - All 310 functions with signatures, descriptions, JS equivalents
2. **Properties** - All 577 properties organized by object
3. **Constants** - VOID, EMPTY, PI, etc.
4. **`the` keyword** - All system properties
5. **Operators** - Lingo to JS operator mapping
6. **Syntax** - Chunk expressions, special forms

Each method/property gets:
- Requirement with SHALL/MUST
- Signature
- Parameters and return type
- Lingo example
- JavaScript implementation
- Scenario for testing

---

## Naming Mismatches to Document

| Lingo | Our Implementation | Notes |
|-------|-------------------|-------|
| `voidp` | `voidP` | Case difference |
| `integerp` | `integerP` | Case difference |
| `floatp` | `floatP` | Case difference |
| `listp` | `listP` | Case difference |
| `objectp` | `objectP` | Case difference |
| `stringp` | `stringP` | Case difference |
| `symbolp` | `symbolP` | Case difference |
| `rollover` | `rollOver` | Case difference |
| `new` | `newFn` | JS reserved word |
| `delete` | `deleteFn` | JS reserved word |
| `try` | `tryFn` | JS reserved word |
| `catch` | `catchFn` | JS reserved word |

---

## Execution Steps

1. **Create change**: `openspec new change "implement-director-runtime"`
2. **Write proposal.md**: Scope and motivation
3. **Write specs**:
   - `specs/director-methods/spec.md` - All 310 methods
   - `specs/director-properties/spec.md` - All properties by object
   - `specs/director-constants/spec.md` - Constants
   - `specs/director-syntax/spec.md` - `the` properties, operators, chunk expressions
4. **Write design.md**: Implementation approach
5. **Write tasks.md**: Phase-by-phase implementation tasks
6. **Implement**: Work through tasks, updating runtime.js and syntax.js
7. **Verify**: Build succeeds, TypeScript LSP recognizes all imports

---

## Module Architecture

### Four-Module Structure

```
apps/client/src/director/
├── api.js          # Director native API (from PDF) - PUBLIC
├── core.js         # Private implementation (classes, loader) - PRIVATE
├── runtime.js      # Browser plugin replacement - PUBLIC
├── syntax.js       # Lingo syntax helpers - PUBLIC
├── index.js        # Barrel export (api, runtime, syntax)
└── (loader.js)     # Merged into core.js
```

### api.js - Director Native API

Contains everything from the Director MX 2004 PDF:
- **Constants**: `VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`
- **Globals**: `_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`
- **Functions**: All 310 methods from PDF (voidP, list, member, abs, etc.)

### core.js - Private Implementation

Internal classes and helpers (NOT exported from index.js):
- **Classes**: `List`, `PropList`, `Member`, `Movie`, `Player`, `Sprite`, `Rect`, `Point`, `Color`
- **Factories**: `createList()`, `createPropList()`, `createScriptObject()`
- **Loader**: `loadImage()`, `loadModule()`, `loadPromise()` (merged from loader.js)
- **Registries**: Member registries, script registries, timeout registries
- **Canvas**: Canvas reference management, image data handling

### runtime.js - Browser Plugin Replacement

Public API for mounting and running Director movies in browsers:

**Cast Registration Helpers:**
- `registerCast(castName, members[])` - Register a complete cast library
- `createBitmapMember(name, url)` - Create bitmap member from Vite-bundled URL
- `createFieldMember(name, content)` - Create field (text) member
- `createScriptMember(name, scriptType, factory)` - Create script member
- `BEHAVIOR_SCRIPT`, `MOVIE_SCRIPT`, `PARENT_SCRIPT` - Script type constants

**Movie Mounting:**
- `setCanvas(canvas)` - Set the canvas element
- `setExternalParams(params)` - Set movie parameters
- `load()` - Load cast libraries
- `start()` - Start movie execution

**Custom Elements:**
- `<x-object>` - Replaces `<object>` tag for .dcr files
- `<x-param>` - Replaces `<param>` tag for movie parameters

### syntax.js - Lingo Syntax Helpers

Helpers for Lingo-specific syntax patterns:
- **The Proxy**: `the.keyCode`, `the.milliSeconds`, etc.
- **Chunk Expressions**: `charOf()`, `itemOf()`, `lineOf()`, `wordOf()`
- **Utilities**: `range()`, `numberOfCastMembersOfCastLib()`, `putAfter()`

### Cast Bundle Pattern

Each cast is an ESM module (folder with index.js) that uses runtime.js helpers:

```javascript
// Example: apps/client/src/game/hh_entry_init/index.js
import { 
  registerCast, 
  createBitmapMember, 
  createFieldMember, 
  createScriptMember,
  BEHAVIOR_SCRIPT 
} from "../../director";

// Import Vite-bundled assets
import openhrsIll from "./22_openhrs_ill.png";
import threadIndex from "./1_thread.index.txt?raw";
import variableIndex from "./2_variable.index.txt?raw";

// Import translated scripts
import loginInterfaceClass from "./login-interface-class.js";
import loginComponentClass from "./login-component-class.js";

// Register all cast members in order
registerCast("hh_entry_init", [
  createFieldMember("thread.index", threadIndex),
  createFieldMember("variable.index", variableIndex),
  createScriptMember("Login Interface Class", BEHAVIOR_SCRIPT, loginInterfaceClass),
  createScriptMember("Login Component Class", BEHAVIOR_SCRIPT, loginComponentClass),
  createBitmapMember("openhrs_ill", openhrsIll),
]);
```

### Module Dependencies

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
- `api.js`, `runtime.js`, `syntax.js` can import from `core.js`
- `core.js` cannot import from the other modules
- No circular dependencies
- `core.js` is private (not exported from index.js)

---

## Open Questions

1. **`the` property implementation**: Continue with proxy approach (current) vs direct object access?
   - **Decision**: Proxy approach (makes .ls ↔ .js comparison easier)

2. **Case sensitivity**: Should we export both `voidP` and `voidp`?
   - **Recommendation**: Export both, with lowercase as aliases

3. **Scope**: Implement ALL 310 methods or only those used in .ls files?
   - **Recommendation**: Focus on methods used in .ls files first, add others as needed

4. **3D functions**: Skip entirely or implement stubs?
   - **Recommendation**: Skip unless needed for Habbo

5. **Xtra functions**: Many functions are Xtra-specific (QuickTime, Flash, etc.)
   - **Recommendation**: Skip Xtra functions not used in Habbo
