## MODIFIED Requirements

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