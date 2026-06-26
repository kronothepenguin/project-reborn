# director-syntax Specification

## Purpose
TBD - created by archiving change director-layer-architecture. Update Purpose after archive.
## Requirements
### Requirement: director-syntax SHALL be the private emulation layer for Ligo language constructs

`director-syntax` SHALL provide JavaScript emulations of Ligo language constructs that are not ordinary function calls. It SHALL live under `packages/director/src/syntax/` and SHALL be private (not exported as a public subpath). It SHALL be re-exported by `director-lingo` so that translated code imports a single public path.

**Package**: `packages/director/`
**Source**: `packages/director/src/syntax/`
**Reference**: `docs/drmx2004_scripting_ref/` (`keywords.txt` — `char...of`, `word...of`, `item...of`, `line...of`, `put...after`, `put...before`, `put...into`; `properties.txt` for `the` system properties).

At refactor state (this change), `director-syntax` already exists as a folder and already exports the constructs below. This change formalises the layer role and the privacy; it does NOT change existing call shapes or add new constructs. Follow-up `director-syntax-chunk-of` migrates chunk helpers to the `char(n).of(str)` chainable shape and updates this requirement via its own delta.

#### Scenario: syntax is not a public export
- **WHEN** `packages/director/package.json` `exports` is inspected after this refactor
- **THEN** `./syntax` is absent

#### Scenario: syntax constructs are reachable through lingo
- **WHEN** translated code imports `the`, `char`, `word`, `item`, `line`, `putInto`, `putAfter`, `putBefore` from `@project-reborn/director/lingo`
- **THEN** they resolve to the implementations in `packages/director/src/syntax/` via `src/lingo/index.js`

### Requirement: director-syntax SHALL own the the-proxy, chunk expressions, and put statements

`director-syntax` SHALL own the implementations of:
- the `the` proxy over Director system properties (reads + writes for properties documented as writable)
- chunk expressions `char`, `word`, `item`, `line` and their range variants
- put statements `putInto`, `putAfter`, `putBefore`

At refactor state (this change), the call shape of the chunk expressions is the EXISTING shape (positional: e.g. `char(2, "abc")`). The target shape `char(n).of(str)` and `char(n).to(m).of(str)` is a follow-up change and updates this requirement via its own delta.

#### Scenario (refactor state): the-proxy exposes system properties
- **WHEN** translated code accesses `the.mouseV`, `the.itemDelimiter`, `the.numberOfCastLibs`
- **THEN** the proxy returns the current value of the corresponding Director system property held in `director-core`

#### Scenario (refactor state): the-proxy writes writable system properties
- **WHEN** translated code assigns `the.itemDelimiter = "|"`
- **THEN** the proxy updates the Director item-delimiter state in `director-core`, and subsequent chunk expression reads honour the new delimiter

#### Scenario (refactor state): chunk expression uses positional shape
- **WHEN** translated code evaluates `char(2, "hello")`
- **THEN** it returns `"e"` (1-indexed, per Ligo `char 2 of "hello"`) using the existing positional call shape

#### Scenario (refactor state): chunk ranges use positional shape
- **WHEN** translated code evaluates `charRange(2, 4, "hello")` (or the equivalent exported helper)
- **THEN** it returns `"ell"` using the existing positional call shape

#### Scenario (refactor state): item chunks honor itemDelimiter
- **WHEN** `the.itemDelimiter` has been set to `"|"` and translated code evaluates `item(2, "a|b|c")`
- **THEN** it returns `"b"`

#### Scenario (refactor state): put statements mutate targets
- **WHEN** translated code runs `putInto(target, value)`, `putBefore(target, value)`, or `putAfter(target, value)`
- **THEN** the target is mutated per Director `put into`, `put before`, `put after` semantics using the existing implementations

### Requirement: director-syntax SHALL depend only on director-core and director-runtime

`director-syntax` SHALL import state-holding objects and value types from `director-core` and `director-runtime`. It SHALL NOT import from `director-lingo` or `director-browser`, and SHALL NOT be imported by `director-core` or `director-runtime`.

#### Scenario: syntax imports are downward only
- **WHEN** `packages/director/src/syntax/` source files are inspected after this refactor
- **THEN** every relative import resolves to `../core/` or `../runtime/`, never to `../lingo/` or `../browser/`

### Requirement: director-syntax SHALL be extended only via follow-up change deltas

Any follow-up change that migrates chunk call shape (e.g. `director-syntax-chunk-of`), adds new syntax constructs, or renames internal helpers SHALL update this spec via that change's own delta. This refactor change locks ownership and privacy; it does not change call shapes or add constructs.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change (e.g. `director-syntax-chunk-of`) is archived
- **THEN** it modifies this `director-syntax` spec via its own delta spec to record the new call shape it actually introduces; this refactor change does not anticipate that shape

