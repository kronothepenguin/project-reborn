# director-lingo Specification

## Purpose
TBD - created by archiving change director-specs-foundation. Update Purpose after archive.
## Requirements
### Requirement: director-lingo SHALL be the Ligo-script-facing surface of the package

`director-lingo` SHALL be the single import surface for everything Ligo script uses: functions, globals, constants, and syntax constructs. It SHALL be exported from `packages/director/package.json` as `./lingo`. It SHALL use `director-core` internally and SHALL NOT re-export `director-core` types.

**Package**: `packages/director/`
**Source today**: `packages/director/src/api/` + `packages/director/src/syntax/` (a future change may unify these under `packages/director/src/lingo/`; that refactor is out of scope here).
**Reference**: `docs/director-inventory.json` (methods section — 486 entries, 91 excluded for 3D/DVD), `docs/drmx2004_scripting_ref.txt` (Chapter 12: Methods, lines 11735–30369; Chapter 14: Properties, lines 31406–57648).

#### Scenario: Ligo script imports from one path
- **WHEN** LigoScript transpiled to JavaScript needs any Director standard-library name (`abs`, `member`, `_movie`, `VOID`, `the`, `putInto`, etc.)
- **THEN** it imports from `@project-reborn/director/lingo` and only from that path

#### Scenario: Core types are not re-exported
- **WHEN** a consumer imports from `@project-reborn/director/lingo`
- **THEN** it cannot reach `director-core` classes (`MovieRef`, `List`, `Color`, …) by that import; core is reachable only internally within the package

### Requirement: director-lingo Functions SHALL be the Director standard library

`director-lingo` SHALL expose every Director MX 2004 function not excluded for 3D/DVD (486 total − 91 excluded = 395 to implement, per `docs/director-inventory.json`). Each function SHALL behave as documented in `docs/drmx2004_scripting_ref.txt` at the line range recorded in the inventory. Functions SHALL be pure-ish (no hidden global state of their own) and SHALL obtain Director runtime state by reading the Globals (see below) or by receiving explicit arguments.

**Reference**: `docs/director-inventory.json` `methods[]` array — each entry's `name`, `startLine`, `endLine`, and `category` (control, math, list, sound, bitwise, access, conversion, network, typecheck, general).

#### Scenario: Functions match the MX 2004 reference
- **WHEN** any Director function listed in `docs/director-inventory.json` is called with arguments matching its documented usage
- **THEN** its return value and side effects match `docs/drmx2004_scripting_ref.txt` at the function's recorded line range

#### Scenario: Functions use core, not vice versa
- **WHEN** a function needs a Director data structure or reference object (e.g. `member()` returns a `MemberRef`, `list()` returns a `List`)
- **THEN** it constructs or obtains that object from `director-core`; `director-core` never calls back into `director-lingo` Functions

#### Scenario: Excluded functions are not present
- **WHEN** a 3D method (76 entries) or DVD method (15 entries) listed in `docs/director-inventory.json` is imported from `@project-reborn/director/lingo`
- **THEN** it is not available; the excluded set is tracked in `docs/director-inventory.json` and a separate `director-excluded-3d-dvd` concern

### Requirement: director-lingo Globals SHALL be stateful singleton Ref instances from director-core

`director-lingo` SHALL expose the Director globals `_global`, `_movie`, `_player`, `_sound`, `_mouse`, `_key`, `_system`, and `_window`. Each global SHALL be a singleton instance of its corresponding `*Ref` class from `director-core` (`_movie` → `MovieRef`, `_player` → `PlayerRef`, `_sound` → `SoundRef`, etc.). These globals SHALL hold the runtime state that some Functions read implicitly (e.g. `member(1)` with no castLib argument resolves against `_movie`'s current cast library context). This is the architectural coupling point between `director-lingo` and `director-core`.

**Reference**: `docs/drmx2004_scripting_ref.txt` — global object reference chapters.

#### Scenario: Globals are Ref instances, not plain objects
- **WHEN** `_movie` is inspected at runtime
- **THEN** it is an instance of `MovieRef` from `director-core`, and `_player`, `_sound`, etc. are instances of their respective `*Ref` classes

#### Scenario: Globals carry state that functions read implicitly
- **WHEN** `member(1)` is called without a castLib argument while `_movie`'s current cast library context is `1`
- **THEN** the lookup resolves against cast library `1`, reflecting the implicit coupling between the `member` Function and the `_movie` Global

#### Scenario: Globals are singletons for the package lifetime
- **WHEN** `_movie` is imported in two different modules
- **THEN** both imports refer to the same `MovieRef` instance

### Requirement: director-lingo Constants SHALL be immutable Ligo values

`director-lingo` SHALL expose the Director constants `VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, and `QUOTE`. Each SHALL be an immutable value matching its Director MX 2004 definition. Constants SHALL NOT be functions, Ref instances, or Proxy objects.

**Reference**: `docs/drmx2004_scripting_ref.txt` — constants chapter.

#### Scenario: Constants are immutable values
- **WHEN** any constant is imported and inspected
- **THEN** it is a primitive value (`string` for `EMPTY`, `RETURN`, `SPACE`, `TAB`, `QUOTE`; `number` for `PI`; a sentinel for `VOID`) and cannot be mutated

#### Scenario: Constants are distinct from Globals
- **WHEN** a constant (`VOID`, `EMPTY`, `PI`, …) is compared to a global (`_movie`, `_player`, …)
- **THEN** they are different kinds of bindings: constants are values, globals are `*Ref` instances

### Requirement: director-lingo Syntax constructs SHALL emulate Ligo language forms

`director-lingo` SHALL provide emulations of Ligo language constructs that are not callable functions: the `the`-proxy (a `Proxy` over Director system properties such as `the mouseV`, `the itemDelimiter`, `the number of castLibs`), chunk expressions (`char X to Y of Z`, `item … of`, `line … of`, `word … of`), and `put` statements (`put … into`, `put … before`, `put … after`). These constructs SHALL be consumed by transpiler output, not by hand-written JavaScript authors primarily.

**Reference**: `docs/drmx2004_scripting_ref.txt` — `the` property reference, chunk expression syntax, `put` statement syntax.

#### Scenario: the-proxy exposes system properties
- **WHEN** transpiled code accesses `the.mouseV` or `the.itemDelimiter`
- **THEN** the `the` proxy returns the current value of the corresponding Director system property

#### Scenario: the-proxy writes system properties when documented as writable
- **WHEN** transpiled code assigns `the.itemDelimiter = "|"`
- **THEN** the proxy updates the Director item-delimiter state, and subsequent chunk expression reads reflect the new delimiter

#### Scenario: Chunk expressions parse Ligo slice forms
- **WHEN** transpiled code evaluates a chunk expression (`char 2 to 5 of someString`, `word 3 of someString`, `line 1 to 3 of someString`, `item 2 of someList`)
- **THEN** the construct returns the substring or sublist per Director MX 2004 semantics, honoring the current `the.itemDelimiter`

#### Scenario: put statements mutate variables
- **WHEN** transpiled code runs `putInto(x, value)`, `putBefore(x, value)`, or `putAfter(x, value)`
- **THEN** the target variable is mutated per Director `put into`, `put before`, `put after` semantics

#### Scenario: Syntax constructs use core, not Functions
- **WHEN** a syntax construct needs a Director data structure or reference object
- **THEN** it obtains it from `director-core`, never from `director-lingo` Functions; syntax and Functions are sibling sections of the same capability, not layered on each other

### Requirement: director-lingo SHALL remain the single ligo surface across internal refactors

`director-lingo`'s public surface (the set of names importable from `./lingo`) SHALL be defined by the Director MX 2004 reference (Functions + Globals + Constants + Syntax), not by the current `src/api/` and `src/syntax/` folder split. Internal file organization (one-file-per-function, grouped category files, a unified `src/lingo/` tree, etc.) SHALL NOT change the imported surface.

#### Scenario: Folder unification does not break consumers
- **WHEN** `packages/director/src/api/` and `packages/director/src/syntax/` are merged into `packages/director/src/lingo/` with subfolders for functions, globals, constants, and syntax
- **THEN** existing imports from `@project-reborn/director/lingo` continue to resolve, because the surface is the name set, not the file set

