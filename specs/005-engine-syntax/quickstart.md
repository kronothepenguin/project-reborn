# Quickstart Validation: Director Engine Syntax

Runnable validation scenarios targeting **real vitest test files** (test-driven development — one test file per construct, co-located in `src/engine/syntax/__tests__/`). Every scenario below is a concrete test file that is written first (red), then made to pass (green) via the package test gate.

**Prerequisites**: Node ≥ 20; pnpm ≥ 10; repo installed. Package at `packages/director/`.

**Setup / test commands**

```bash
pnpm --filter @project-reborn/director test                       # full suite (002 + 005 files)
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/char.test.js   # single file
```

Test files for this feature (written in Foundational, kept green after):
`src/engine/syntax/__tests__/{char,item,line,word,put-after,put-before,put-into,the-proxy,surface}.test.js`

## Scenario 1 — Chained chunk reads (1-based, clamp, out-of-range, empty)

**Test file**: `src/engine/syntax/__tests__/char.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/char.test.js
```

Asserts (doc-example cases included verbatim):
- `char(1).of("$9.00") === "$"` and `char(1).to(5).of("$9.00") === "$9.00"` (keywords `char...of` examples)
- out-of-range → `""`: `char(9).of("$9.00")`, `char(0).of("abc")`, `char(-1).of("abc")`
- range end clamps: `char(1).to(99).of("hi") === "hi"`
- empty range: `char(3).to(2).of("abc") === ""` (FR-005)
- `start < 1` → `""` (C2)
- empty/non-string container → `""` without error

## Scenario 2 — item chunking + live itemDelimiter (C3 / US1 scenarios 1–2, 6)

**Test file**: `src/engine/syntax/__tests__/item.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/item.test.js
```

Asserts:
- `item(3).of("red,yellow,blue green,orange") === "blue green"` (doc example)
- range clamp + rejoin: `item(3).to(5).of(...) === "blue green, orange"`
- out-of-range → `""`: `item(9).of(...)`
- trailing/consecutive delimiters → empty chunks
- live delimiter: `the.itemDelimiter = ":"` → `item(2).of("a:b:c") === "b"`, range rejoin with `":"`, restore `","` returns prior behavior
- `itemRange(a,b) ≡ item(a).to(b)`

## Scenario 3 — line chunking (CR only) (US1 scenario 5)

**Test file**: `src/engine/syntax/__tests__/line.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/line.test.js
```

Asserts:
- `line(2).of("a\rb") === "b"` (CR-delimited, not `\n`)
- `line(1).to(2).of("a\rb") === "a\rb"` (range preserves delimiters)
- multi-line range; trailing CR → trailing empty chunk; out-of-range → `""`
- `lineRange` alias

## Scenario 4 — word chunking (whitespace class) (FR-003)

**Test file**: `src/engine/syntax/__tests__/word.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/word.test.js
```

Asserts:
- `word(1).to(3).of("fox dog cat") === "fox dog cat"`; `word(5).of("fox elk dog cat") === ""` (doc example keywords `word...of`)
- Tab and CR behave as spaces (`word(2).of("a\tb") === "b"`, `word(2).of("a\rb") === "b"`)
- consecutive delimiters → empty chunks
- `wordRange` alias

## Scenario 5 — putAfter (US2 + keywords `put...after`)

**Test file**: `src/engine/syntax/__tests__/put-after.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/put-after.test.js
```

Asserts:
- whole-container: `putAfter("abc","X") === "abcX"`
- chunk-target insert without replace: `putAfter(word(2).of("fox dog cat"),"X")` → `"fox dogX cat"`
- nonexistent target → append: `putAfter(char(99).of("abc"),"X") === "abcX"` (US2 scn 4)
- stringify: `putAfter("abc",5) === "abc5"`, `putAfter("abc",null) === "abc"`

## Scenario 6 — putBefore (US2 scn 1 + keywords `put...before`)

**Test file**: `src/engine/syntax/__tests__/put-before.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/put-before.test.js
```

Asserts:
- `putBefore(word(2).of("fox dog cat"),"elk ") === "fox elk dog cat"` (doc example)
- whole-container prepend: `putBefore("abc","X") === "Xabc"`
- nonexistent → append; stringify

## Scenario 7 — putInto (US2 scn 3/6 + keywords `put...into`)

**Test file**: `src/engine/syntax/__tests__/put-into.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/put-into.test.js
```

Asserts:
- replace target: `putInto(line(2).of("a\rb"),"Y") === "a\rY"` (first line intact)
- whole-container: `putInto("abc","X") === "X"`
- empty whole-container → value (US2 scn 6)
- nonexistent → append; stringify

## Scenario 8 — the proxy surface (US3: defaults, RO/RW, aliases, function forms)

**Test file**: `src/engine/syntax/__tests__/the-proxy.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/the-proxy.test.js
```

Asserts:
- `globalThis.the` installed with no activated context; row families read defined defaults of documented types (table from data-model.md)
- read-only rows reject writes (C5 — frame/mouseH/key/maxInteger/milliseconds)
- RW rows store-and-read-back (itemDelimiter, exitLock, beepOn, centerStage, keyboardFocusSprite, soundLevel, randomSeed, selStart/selEnd)
- function forms: `the.numberOfCharsIn/ItemsIn/LinesIn/WordsIn`, `lastCharIn/WordIn/ItemIn/LineIn`, live-delim item count (C3), chained `char(1).to(the.numberOfCharsIn(...)).of(...)` (C4)
- aliases: `the.milliSeconds` === `the.milliseconds`, `the.maxinteger` === `the.maxInteger` (C7)
- unknown read/write throws (C6); `the.wordDelimiter`/`the.lineDelimiter` throw (C8); `the.void === null`; `the.maxInteger === 2147483647`

## Scenario 9 — Score/stage-backed no-op defaults (until 004)

**Test file**: `src/engine/syntax/__tests__/the-proxy.test.js` (no-op-default describe block)

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/the-proxy.test.js -t "no-op"
```

Asserts: frame, frameLabel, framePalette, frameTempo, marker, label, markerList, labelList, lastChannel, timeoutLapsed, currentTime, numberOfCastLibs, numberOfMembers read stable documented defaults and never error; `the.numberOfCastMembersOfCastLib(1)` returns a number (0) without error. Live values arrive with feature 004.

## Scenario 10 — 12-name import surface (US4)

**Test file**: `src/engine/syntax/__tests__/surface.test.js`

```bash
pnpm --filter @project-reborn/director exec vitest run src/engine/syntax/__tests__/surface.test.js
```

Asserts: all 12 stand-ins (char, charRange, item, itemRange, line, lineRange, word, wordRange, the, putInto, putBefore, putAfter) import from `src/api/index.js`; helper results identical with no context vs default singletons; YAGNI absence — `"zzz" in globalThis.the` is false and reading throws; `numberOfSounds`/`machineType`/`wordDelimiter`/`lineDelimiter` absent.

## Full gate

```bash
pnpm --filter @project-reborn/director test
```

Expected: 16 files (7 from 002 + 9 from 005), all green, zero pre-existing failures. This gates SC-001..SC-006.

## Red-green record

- Red (T012): with the pre-005 code all 9 files fail — chunk tests `char(1).of is not a function`; put tests on argument order; line/word on delimiters; the-proxy on function forms missing, unknown props not throwing, aliases missing, `maxInteger`/`void` values, delegated defaults, word/lineDelimiter still present; surface on YAGNI-absence.
- Green: each user story's rewrites flip its test files green; the full gate is green at the end (T030).