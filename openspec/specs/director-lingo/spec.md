# director-lingo Specification

## Purpose
TBD - created by archiving change director-specs-foundation. Update Purpose after archive.
## Requirements
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

### Requirement: director-lingo SHALL be the public top-level consumer surface for translated Ligo code

`director-lingo` SHALL be exported from `packages/director/package.json` as `./lingo`. It SHALL re-export the Director top-level Functions (per MX 2004 Chapter 12; the existing set in `packages/director/src/api/` immediately before this refactor), the Lingo globals (`_global`, `_movie`, `_player`, `_sound`, `_mouse`, `_key`), the Lingo constants actually present before this refactor (`EMPTY`, `VOID`, `TRUE`, `FALSE`), and re-exports of the syntax constructs owned by `director-syntax` (`the`, `char`, `word`, `item`, `line`, `putInto`, `putAfter`, `putBefore`).

**Package**: `packages/director/`
**Source**: `packages/director/src/lingo/` (renamed via `git mv` from `packages/director/src/api/`).
**Reference**: `docs/drmx2004_scripting_ref/` (`methods.txt`, `constants.txt`), `docs/director-inventory.json`.

This refactor moves the source folder verbatim. It does NOT add new constants, new globals, or new functions. It does NOT rename any function file. The re-exports above are the refactor-state public surface; follow-up changes (`director-lingo-constants`, `director-core-system-window`, future API additions) will extend this requirement with their own deltas.

#### Scenario: Single public import path for translated code
- **WHEN** translated JS needs any Ligo top-level name (Function, global, constant, or syntax construct) that exists at refactor state
- **THEN** it imports from `@project-reborn/director/lingo` and only from that path

#### Scenario: api/ folder is renamed, not deleted
- **WHEN** the `packages/director/src/lingo/` directory is inspected after this refactor
- **THEN** every method file previously in `packages/director/src/api/` (`member.js`, `sprite.js`, `sound.js`, `castLib.js`, `abs.js`, `_netRegistry.js`, …) is present under `src/lingo/` with identical implementation; only the path changed

#### Scenario: api/ index content migrated verbatim
- **WHEN** `packages/director/src/lingo/index.js` is inspected after this refactor
- **THEN** it re-exports every Function the pre-refactor `src/api/index.js` re-exported, with identical source-line content for each re-export

#### Scenario: Syntax constructs are re-exported from lingo
- **WHEN** translated code imports `the`, `char`, `word`, `item`, `line`, `putInto`, `putAfter`, `putBefore` from `@project-reborn/director/lingo`
- **THEN** they resolve to the implementations in `packages/director/src/syntax/` via `src/lingo/index.js`

#### Scenario: ./api and ./syntax are no longer public
- **WHEN** `packages/director/package.json` `exports` is inspected after this refactor
- **THEN** only `.`, `./lingo`, and `./browser` are present; `./api`, `./syntax`, and `./runtime` are absent

#### Scenario: Existing constants set unchanged in refactor state
- **WHEN** `EMPTY`, `VOID`, `TRUE`, `FALSE` are imported from `@project-reborn/director/lingo` at refactor state
- **THEN** their values match the pre-refactor `src/api/index.js` values (`""`, `undefined`, `true`, `false`); no new constants are added by this refactor

### Requirement: director-lingo Globals SHALL be instances of core Director language objects

`director-lingo` SHALL re-export the globals (`_movie`, `_player`, `_sound`, `_mouse`, `_key`, `_global`) as singleton instances constructed in `director-core`. At refactor state these are instances of `MovieRef`, `PlayerRef`, `SoundRef`, `MouseRef`, `KeyRef` respectively, and `_global` is `globalThis`. Follow-up class renames (e.g. `MovieRef` → `MovieObject`) SHALL update this requirement via that change's delta.

#### Scenario: Globals are Ref singleton instances at refactor state
- **WHEN** `_movie` is inspected at runtime immediately after this refactor
- **THEN** it is an instance of `MovieRef` from `director-core`; `_player`, `_sound`, `_mouse`, `_key` likewise are instances of `PlayerRef`, `SoundRef`, `MouseRef`, `KeyRef`

#### Scenario: _global is globalThis at refactor state
- **WHEN** `_global` is inspected at runtime
- **THEN** it is `globalThis` (a live reference, not a snapshot) so that movie-script handlers assigned via `Object.assign(globalThis, module)` are reachable from any translated code

### Requirement: director-lingo SHALL remain the single Ligo surface across follow-up extensions

Each follow-up change that adds new constants (`PI`, `RETURN`, `TAB`, `SPACE`, `QUOTE`, `BACKSPACE`, `ENTER`, `INF`, `NAN`), new globals (`_system`, `_window`), new functions, or new syntax re-exports SHALL update this requirement via its own delta spec to reflect what it actually adds. This refactor change locks the source-folder location and the public-export contract; it does not add names.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change (e.g. `director-lingo-constants`) is archived
- **THEN** it modifies this `director-lingo` spec via its own delta spec to record the constants it adds; this refactor change does not anticipate those additions

