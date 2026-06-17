## Context

The Director runtime currently exists as monolithic files:
- `apps/client/src/director/api.js` (546 lines, 39 empty stubs)
- `apps/client/src/director/core.js` (1261 lines, many empty methods)
- `apps/client/src/director/runtime.js` (132 lines)
- `apps/client/src/director/syntax.js` (448 lines)
- `apps/client/src/director/__tests__/` (28 test files)

The Director MX 2004 reference documentation defines:
- Chapter 12: Methods (486 entries, lines 11734-30369)
- Chapter 14: Properties (763 entries, lines 31405-57648)

**Inventory**: `docs/director-inventory.json` contains complete list with line numbers.

Current implementation is incomplete and disorganized. Tests are separated from implementation. Previous code may contain AI-hallucinated behavior not matching Director MX 2004.

## Goals / Non-Goals

**Goals:**
- Atomic file structure: one method/class per file
- Co-located tests: `api/__tests__/abs.test.js` next to `api/abs.js`
- Clear naming: `Ref` suffix for API-returned objects (MemberRef, SpriteRef, SoundRef)
- Complete implementation of all 2D Director methods and properties
- **Full Director MX 2004 documentation in each spec file** (not just line references)
- One task per method/property in implementation plan
- Exclude 3D methods (76) and DVD methods (15) - mark as "do not implement"

**Non-Goals:**
- 3D methods (addBackdrop, addCamera, meshDeform, etc.) - 76 methods excluded
- DVD methods (activateAtLoc, activateButton, etc.) - 15 methods excluded
- Xtra plugin architecture (stub only for now)
- Backward compatibility with current import paths

## Decisions

### Decision 1: Atomic folder structure

**Choice**: Each method/class gets its own file
```
apps/client/src/director/
├── api/
│   ├── __tests__/
│   │   └── abort.test.js
│   ├── abort.js
│   ├── abs.js
│   ├── index.js (barrel export)
│   └── ...
├── core/
│   ├── __tests__/
│   │   └── list.test.js
│   ├── list.js
│   ├── prop-list.js
│   ├── point.js
│   ├── rect.js
│   ├── member-ref.js
│   ├── sprite-ref.js
│   ├── index.js (barrel export)
│   └── ...
├── runtime/
│   ├── __tests__/
│   ├── index.js
│   └── ...
├── syntax/
│   ├── __tests__/
│   ├── the-proxy.js
│   ├── char.js
│   ├── item.js
│   ├── line.js
│   ├── word.js
│   ├── index.js
│   └── ...
└── index.js (main barrel export)
```

**Rationale**: Enables parallel implementation, clear progress tracking, atomic commits.

**Alternative considered**: Keep monolithic files with clear sections - rejected because it makes progress tracking impossible for 1249 methods/properties.

### Decision 2: Ref suffix for API objects

**Choice**: Classes returned by API functions use `Ref` suffix
- `Member` → `MemberRef` (returned by `member()`)
- `Sprite` → `SpriteRef` (returned by `sprite()`)
- `Sound` → `SoundRef` (returned by sound-related functions)
- `CastLibrary` → `CastLibraryRef` (returned by `castLib()`)

**Rationale**: Distinguishes between:
- Global singleton objects: `_sound`, `_movie`, `_player` (classes: SoundRef, MovieRef, PlayerRef)
- API-returned references: `member("name")` returns MemberRef

**Alternative considered**: Keep current naming - rejected because it creates confusion between `_sound` (global) and what `sound()` returns.

### Decision 3: Test co-location

**Choice**: Tests live in `__tests__/` folder within each module
- `api/__tests__/abort.test.js` tests `api/abort.js`
- `core/__tests__/list.test.js` tests `core/list.js`

**Rationale**: Tests are discovered naturally, easier to maintain, clear ownership.

**Alternative considered**: Keep centralized `__tests__/` folder - rejected because it separates tests from implementation.

### Decision 4: Full documentation in specs

**Choice**: Each spec file contains the complete Director MX 2004 documentation

**Rationale**:
- Prevents AI hallucination of behavior
- Ensures exact match with Director MX 2004
- Provides examples for test generation
- Allows verification of implementation correctness
- Single source of truth (docs/drmx2004_scripting_ref.txt)

**Alternative considered**: Just reference line numbers - rejected because:
1. Agents can't implement from references alone
2. No verification possible without the docs in the spec
3. AI hallucination risk - previous code may have invented behavior

### Decision 5: Implementation order

**Choice**: Phase-based implementation
1. **Phase 1 - Architecture**: Update specs, create folder structure (this change)
2. **Phase 2 - Core**: Data types (List, PropList, Point, Rect, Color) then ref classes
3. **Phase 3 - API**: Top-level functions grouped by category
4. **Phase 4 - Runtime**: Browser integration, DOM mounting, event loop
5. **Phase 5 - Syntax**: `the` proxy, chunk expressions

**Rationale**: API depends on core classes being complete. Runtime depends on both. Syntax is independent but logically last.

### Decision 6: Change organization

**Choice**: Separate OpenSpec changes per area
- `director-architecture` - This change (folder structure, conventions)
- `director-core-list` - List class + 15 methods
- `director-core-proplist` - PropList class + 16 methods
- `director-core-point` - Point class + methods
- `director-core-rect` - Rect class + properties
- `director-core-color` - Color class + properties
- `director-core-member-ref` - MemberRef class + properties + methods
- `director-core-sprite-ref` - SpriteRef class + properties
- `director-core-movie-ref` - MovieRef class + properties + methods
- `director-core-player-ref` - PlayerRef class + properties + methods
- `director-core-sound-ref` - SoundRef class + properties + methods
- `director-core-cast-library-ref` - CastLibraryRef + properties
- `director-api-math` - abs, atan, cos, sin, tan, sqrt, log, power, max, min, random
- `director-api-typechecks` - voidP, integerP, floatP, listP, objectP, stringP, symbolP, ilk
- `director-api-conversions` - integer, float, string, value, symbol, charToNum, numToChar
- `director-api-strings` - chars, length, offset
- `director-api-lists` - list, propList, getAt, getProp, getPropAt, findPos
- `director-api-members` - member, sprite, castLib, script, point, rect, color
- `director-api-network` - getNetText, postNetText, netDone, etc.
- `director-api-bitwise` - bitAnd, bitNot, bitOr, bitXor
- `director-api-control` - abort, halt, quit, stopEvent
- `director-api-sound` - beep, playSound, queueSound, soundBusy
- `director-api-other` - remaining functions
- `director-runtime` - canvas, custom elements, event loop, cast loader
- `director-syntax-the` - the proxy + properties
- `director-syntax-chunks` - char, item, line, word
- `director-syntax-put` - putInto, putBefore, putAfter
- `director-excluded-3d-dvd` - List of excluded methods

**Rationale**: Each change is manageable, can be implemented independently, clear scope.

## Risks / Trade-offs

**Risk**: Large number of files (1158+) may be overwhelming
→ **Mitigation**: Clear folder structure, barrel exports, one task per file

**Risk**: Breaking all existing imports
→ **Mitigation**: Main `index.js` provides backward-compatible barrel export

**Risk**: Ref naming may conflict with existing code
→ **Mitigation**: Search and replace across codebase, update all references

**Risk**: Extracting full documentation for 1158 items is time-consuming
→ **Mitigation**: Inventory script provides line numbers, can automate extraction

**Trade-off**: Atomic files vs. bundle size
→ **Acceptable**: Tree-shaking will eliminate unused imports in production build

**Trade-off**: Full documentation in specs vs. spec file size
→ **Acceptable**: Each spec file is self-contained, no need to cross-reference docs
