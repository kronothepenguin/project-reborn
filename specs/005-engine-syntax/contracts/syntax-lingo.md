# Contract: Lingo Syntax Surface — `syntax-lingo.md` (005 scope)

The `@project-reborn/director/lingo` entry re-exports the 12 syntax stand-ins unchanged from `src/engine/syntax/index.js` (`src/api/index.js` line 25, `export *`). This contract defines the exact call signatures, the `the` proxy contract, the no-op-until-004 convention, and the game>docs boundary.

## The 12 export names (stable, from `@/lingo`)

| Name | Signature | Behavior |
| --- | --- | --- |
| `char(n)` | selector `{ of(str), to(m) }`; `charRange(a,b) ≡ char(a).to(b)` | 1-based char read; range end clamps; out-of-range/start<1/start>end/empty/non-string → `""` |
| `item(n)` | selector; `itemRange(a,b) ≡ item(a).to(b)` | item split by live `itemDelimiter` (default `","`); range rejoin with then-current delimiter |
| `line(n)` | selector; `lineRange(a,b) ≡ line(a).to(b)` | CR (`"\r"`) only; range preserves internal `\r` |
| `word(n)` | selector; `wordRange(a,b) ≡ word(a).to(b)` | whitespace-class `[ \t\r\n]` delimiter |
| `the` | `globalThis.the` proxy (below) | property table reads/writes + function forms |
| `putInto(chunkTarget, value)` | returns new string | replace target chunk (whole string when target is a plain string) |
| `putBefore(chunkTarget, value)` | returns new string | insert before target, no replace |
| `putAfter(chunkTarget, value)` | returns new string | insert after target, no replace |

- chunk reads return a `ChunkBound` (String subclass carrying `kind/container/start/end`); use `==`/`String()`/template for comparison (a String object is not `===` a primitive). Read forms are pure over the container.
- put: chunkTarget = plain string (whole container) or a `ChunkBound` from a chained read; value stringified (`String(value ?? "")`); nonexistent target → append at end ("inserted as appropriate").

## The `the` proxy contract

- Installed as `globalThis.the` at module load with NO activated context (FR-007); reads delegate through the ESM live-binding singleton slots (`src/engine/subsystem/singletons.js`), so an activated context's instances are reflected automatically; no-context defaults otherwise (FR-008).
- Reads: alias-resolved; unknown names THROW a script error (C6); read-only is by table row; Score/stage-backed rows return the documented no-op default.
- Writes: unknown names THROW (C6); read-only rows THROW `Cannot set read-only property: the <name>` (C5); rw rows store (singleton field or proxy-local backing) and reflect on read-back.
- `has` returns true only for known canonical keys, aliases, and function-form names (FR-012: no claim-everything).
- Aliases (C7): `milliSeconds` → `milliseconds`; `maxinteger` → `maxInteger`.
- Function forms (C4): `the.numberOfCharsIn/ItemsIn/LinesIn/WordsIn(str)`, `the.lastCharIn/WordIn/ItemIn/LineIn(str)`; `the.numberOfCastMembersOfCastLib(castLib)` → 0 until 004. Counts return numbers (compose in `.to(...)`).
- Constants: `the.true/false/void/empty/tab/space/return/quote/pi/maxInteger` (values per data-model; `void` = `null` per 002 R2).
- `wordDelimiter`/`lineDelimiter` are ABSENT — reading/writing throws (C8, FR-013).

## No-op-default-until-004 contract

Score/stage-backed `the` rows (frame, frameLabel, framePalette, frameTempo, marker, label, markerList, labelList, lastChannel, timeoutLapsed, currentTime, numberOfCastLibs, numberOfMembers, numberOfCastMembersOfCastLib) read a stable, documented default (data-model table) and never error in 005. Live values arrive with feature 004; 005 specifies only the read-only no-op surface.

## Game > docs boundary

The docs inform defaults and values; the game dictates presence (C9). Where a game-verified `the` name or function form is not a standalone documented entry (movieName, moviePath, currentTime, timeoutLapsed, numberOfCastMembersOfCastLib), it is kept with a documented anchor (go() usage, `the moviePath` doc examples, game read counts) — never silently dropped (FR-013 audit). Conversely, names with zero game use and no doc anchor are removed (word/line delimiters, numberOfSounds, machineType).

## Out of scope (recorded boundary)

- `.char[` / `.item[` / `.word[` / `.line[` member forms on text-member expressions (003/006 member-object syntax).
- Mutation-by-reference expectations in individual game files (JS strings are immutable; the runtime contract is by-value return, C1/C2; game translation quality is explicitly out of scope per spec Assumptions).