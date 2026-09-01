# Data Model: Director Engine Syntax

Entities: the chunk-expression addressing model, the item-delimiter runtime state, the `the` property table (the feature's core deliverable), the function-form set, and the no-op-default convention.

---

## Chunk-expression addressing model

- **Chunk kinds**: char, item, line, word.
- **Addressing**: 1-based `n` (single) or inclusive 1-based range `a..b`; ends clamp to the actual last chunk; `start > end` or `start < 1` → empty string.
- **ChunkBound** (returned by `.of(str)` of any selector): a `String` subclass instance carrying non-enumerable metadata `{ kind, container, start, end }`; reads coerce to the chunk text in every string context. `===` against a primitive is false — contract: use `==`/`String()`/template form (translated code uses `==`).
- **Split rules** (in `chunk-split.js`, not exported):
  - `splitChars(str)` = `str.split("")` (ANSI chars).
  - `splitItems(str, delim)` = `str.split(delim)`; delim = live `itemDelimiter`, default `","`.
  - `splitLines(str)` = `str.split("\r")` (CR only).
  - `splitWords(str)` = `str.split(/[ \t\r\n]/)`.
  - Empty chunks are real chunks (trailing/consecutive delimiters → empty chunks).
- **Selectors**: `char(n)`/`item(n)`/`line(n)`/`word(n)` → `{ of(str), to(m) }`; `charRange(a,b) ≡ char(a).to(b)` etc. Reads of empty/non-string containers return `""`.
- **Put targets**: a plain string = whole container; a `ChunkBound` = its resolved chunk boundaries; nonexistent target → append at the end.

## Item-delimiter state

Runtime-global delimiter used by item single reads, range rejoins, item counts, and `the.lastItemIn`; default `","`; settable via `the.itemDelimiter` (RW). Owned by the `the`-proxy local backing; item helpers import `the` and read `the.itemDelimiter` with `","` fallback at call time (C3 — live).

## The `the` property table (deliverable — 79 rows)

| canonical | aliases | source | RW | default | note |
| --- | --- | --- | --- | --- | --- |
| itemDelimiter | — | system(local) | RW | `","` | C3 |
| floatPrecision | — | system(local) | RW | 4 | |
| randomSeed | — | system(local) | RW | 0 | C7; doc-silent default recorded |
| mouseH / mouseV | — | mouse | RO | 0 | |
| mouseLoc / clickLoc | — | mouse | RO | point(0,0) | |
| mouseDown / mouseUp | — | mouse | RO | false | |
| clickOn | — | mouse | RO | 0 | |
| doubleClick | — | mouse | RO | false | game 53× |
| rollover | — | mouse | RO | 0 | game 8× |
| key | — | key | RO | `""` | |
| keyCode | — | key | RO | 0 | game 14× |
| shiftDown / controlDown / commandDown / optionDown | — | key | RO | false | |
| frame | — | score | RO no-op | 0 | until 004 |
| frameLabel / framePalette | — | score | RO no-op | 0 | until 004 |
| frameTempo | — | score | RO no-op | 15 | game 5×; until 004 |
| marker / label | — | score | RO no-op | `""` | until 004 |
| markerList | — | score | RO no-op | `[]` | until 004 |
| labelList | — | score | RO no-op | `""` | until 004 |
| lastChannel | — | score | RO no-op | 0 | until 004 |
| timeoutLapsed | — | script | RO no-op | 0 | until 004 |
| currentTime | — | score | RO no-op | 0 | until 004 |
| movieName / moviePath / path / name | — | movie | RO | `""` | game>docs presence |
| copyrightInfo | — | movie | RO | `""` | |
| exitLock | — | movie | RW | false | |
| beepOn | — | movie | RW | false | core movie.js |
| centerStage | — | movie | RW | true | core movie.js |
| keyboardFocusSprite | — | movie | RW | -1 | game 7× |
| editShortCutsEnabled | — | movie | RW | true | |
| alertHook | — | player | RW | null | game 6× |
| debugPlaybackEnabled | — | player | RW | false | game 3× |
| runMode | — | player | RO | `"Plugin"` | game 18× |
| productName | — | player | RO | `"Director"` | |
| productVersion / version | — | player | RO | `"MX 2004"` | |
| platform | — | system | RO | UA-derived | game 3× |
| colorDepth | — | system | RO | 32 | game 5× |
| soundEnabled | — | sound | RW | true | |
| soundLevel | — | sound | RW | 7 | |
| numberOfCastLibs | — | score | RO no-op | 1 | game 12×; until 004 |
| numberOfMembers | — | score | RO no-op | 0 | until 004 |
| numberOfXtras | — | player | RO no-op | 0 | |
| numberOfMenus | — | menu | RO no-op | 0 | |
| selection / selStart / selEnd | — | script(local) | RW | `""`/0/0 | game 3×/2× |
| milliseconds | milliSeconds | system | RO computed | Date.now() | C7; game 138× |
| date / time / longTime / long / short / abbreviated / abbreviatedTime / systemDate | — | system | RO computed | Intl/Date formats | C9 |
| timer / ticks | — | system | RO computed | monotonic ms / ms/1000*60 | C9 |
| pi | — | constant | RO | `Math.PI` | |
| maxInteger | maxinteger | constant | RO | `2147483647` | C7; fix from MAX_SAFE_INTEGER |
| true / false | — | constant | RO | `true`/`false` | |
| void | — | constant | RO | `null` | fix from undefined |
| empty | — | constant | RO | `""` | |
| tab / space / return / quote | — | constant | RO | `"\t"`/`" "`/`"\r"`/`'"'` | |

REMOVED (FR-013): wordDelimiter, lineDelimiter (C8), numberOfSounds, machineType (no anchor, zero game reads).

## Function-form set (C4)

Callable on the proxy: `numberOfCharsIn(str)`, `numberOfItemsIn(str)` (live delim, C3), `numberOfLinesIn(str)`, `numberOfWordsIn(str)`, `lastCharIn(str)`, `lastWordIn(str)`, `lastItemIn(str)`, `lastLineIn(str)` (empty string when no chunk), and `numberOfCastMembersOfCastLib(castLib)` → 0 no-op until 004 (game 6×, game>docs). Counts return numbers so `char(1).to(the.numberOfCharsIn(str)).of(str)` composes (C4 chained count usage).

## No-op-default convention (Score/stage-backed until 004)

Score/stage-backed rows (frame, frameLabel, framePalette, frameTempo, marker, label, markerList, labelList, lastChannel, timeoutLapsed, currentTime, numberOfCastLibs, numberOfMembers, numberOfCastMembersOfCastLib) read a stable, documented default and never error in 005; live values are wired in feature 004.