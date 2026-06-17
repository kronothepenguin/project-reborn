## Why

The Habbo Hotel R26 client uses Macromedia Director's Lingo scripting language. We are rebuilding the client in JavaScript by implementing the Director runtime API. The runtime (`apps/client/src/director/`) currently has ~65 functions implemented, but the Director MX 2004 API contains 310 methods, 577 properties, and numerous system properties accessed via the `the` keyword. Without a complete runtime, LingoScript cannot be faithfully translated to JavaScript.

## What Changes

- **Refactor module structure**: Split current `runtime.js` into `api.js` (Director API surface), `core.js` (private implementation), and `runtime.js` (browser plugin replacement)
- **Merge loader.js into core.js**: Consolidate asset loading functionality into core implementation
- **Update index.js barrel export**: Export `api.js`, `runtime.js`, `syntax.js` (not `core.js` which is private)
- Implement ~245 missing Director API methods (math, list operations, property list operations, network, sound, window management)
- Add lowercase aliases for type-check functions (`voidp` → `voidP`, `integerp` → `integerP`, etc.) to match Lingo's case-insensitive nature
- Implement 37 missing `the` properties (`the keyCode`, `the doubleClick`, `the stage`, `the selStart`, etc.)
- Document all 310 methods with signatures, descriptions, and JavaScript equivalents
- Document all 577 properties organized by Director object (_movie, _player, _mouse, _key, _system, _window)
- Document naming mismatches between Lingo and JavaScript (e.g., `new` → `newFn`, `delete` → `deleteFn`)

## Capabilities

### New Capabilities

- `director-architecture`: Module structure defining four distinct files: `api.js` (Director API surface from PDF), `core.js` (private implementation), `runtime.js` (browser plugin replacement), `syntax.js` (Lingo syntax helpers). Establishes clear separation between public API and private implementation.
- `director-methods`: Complete documentation and implementation of all 310 Director API methods, including math functions, list operations, property list operations, type checking, string operations, network functions, and instance creation.
- `director-properties`: Documentation of all 577 Director properties organized by object (_movie, _player, _mouse, _key, _system, _window, Member, Sprite, etc.).
- `director-constants`: Documentation of all Director constants (VOID, EMPTY, PI, RETURN, SPACE, TAB, QUOTE, TRUE, FALSE, ENTER).
- `director-syntax`: Documentation of Lingo syntax patterns including the `the` keyword proxy (56 system properties), chunk expressions, operators, and special syntax forms.

### Modified Capabilities

(none - no existing specs to modify)

## Impact

- **Code structure**: Refactor `apps/client/src/director/` into four modules: `api.js` (new), `core.js` (refactored), `runtime.js` (refactored), `syntax.js` (unchanged). Delete `loader.js` (merged into core.js).
- **API surface**: `apps/client/src/director/api.js` (~245 new function implementations), `apps/client/src/director/syntax.js` (37 new `the` properties)
- **Browser integration**: `apps/client/src/director/runtime.js` becomes the public API for mounting and running Director movies in browsers (custom elements, canvas management, window handling)
- **Documentation**: Five spec files documenting the complete Director API and architecture
- **Dependencies**: No new external dependencies; uses existing JavaScript Math, Date, and standard library
- **Systems**: Enables faithful 1:1 translation of LingoScript to JavaScript; TypeScript LSP will recognize all Director API imports
- **Naming**: Establishes convention for handling case mismatches (export both `voidP` and `voidp`) and JS reserved word conflicts (`new` → `newFn`)
- **Module visibility**: `core.js` is private (not exported), `api.js`/`runtime.js`/`syntax.js` are public (exported via index.js barrel)
