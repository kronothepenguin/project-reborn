# Phase 0 Research: Director Engine Syntax (005-engine-syntax)

## Summary

The 005 layer is a **port-and-align** of the eight existing `src/engine/syntax/` modules onto the `lingoscript-to-javascript` mapping contract (chained `char(n).of(str)` / `char(a).to(b).of(str)` reads, `put*(chunkExpression, value)` writes, and a data-driven `the` proxy). The current implementations were written against a pre-contract shape: `char(n, str)` positional reads, `put*(value, start, end, str)` value-first char-position writes, and an 874-line `the-proxy.js` that claims every property (`has` always true) and duplicates state instead of delegating to the 002 core singletons. Every module is re-examined against the doc anchors and the resolved clarify set (C1–C9); verified game call shapes (`apps/client/src/game/`, 48 `put*(` calls, dozens of `.of(` reads, `the.*` reads) confirm the contract forms.

---

## R1: Chunk-helper port design

**Decision**: Rewrite the four chunk modules to the chained selector contract and share one internal pure splitter.

- **Chained API shape** (C1, SKILL Chunk Mapping Rules, keywords.txt usage lines):
  - `char(n)` → selector `{ of(str), to(m) }`; `char(n).of(str)` reads char `n`; `char(a).to(b).of(str)` reads the range.
  - `item(n)`, `line(n)`, `word(n)` identical; `item(a).to(b)`, etc.
  - `.of()/.to()` take no delimiter argument; the container is the single string argument (per `char whichCharacter of fieldOrStringVariable` → `char(whichCharacter).of(fieldOrStringVariable)`; the range form `char(firstCharacter).to(lastCharacter).of(...)`).
- **Range stand-ins** (`charRange`/`itemRange`/`lineRange`/`wordRange`): thin aliases `charRange(a, b) ≡ char(a).to(b)` (return the range selector). Kept as exported names because the 12-name public surface is final (002 stabilization); re-exported unchanged from `index.js`.
- **Read return type**: `.of(str)` returns a `ChunkBound extends String` value — a real string value in every JS string context (`${}`, `==`, `.length`, String.prototype methods) that also carries non-enumerable metadata `{ kind, container, start, end }` so the put helpers (R2) can resolve exact boundaries from a read-shaped expression. This is the only mechanism that lets the mapping contract's `putInto(char(N).of(s), v)` carry position while reads remain plain string values. Contract note: equality with a primitive must use `==`/`String()`/template form (a `String` object does not pass `===` against a primitive) — translated code uses `==`; documented in the contract.
- **1-based indexing**: chars/items/lines/words are 1-based (`("$9.00").char[1..1]` → `"$"`).
- **Out-of-range / empty / clamps** (resolved Edge Cases + C2):
  - single read out of range (`char 0`, past end) → `""`
  - range end beyond length → clamp to actual last chunk (`item[3..5]` on 4 items → `"blue green, orange"`)
  - range `start > end` → `""`
  - range `start < 1` → `""` (**differs from current char.js which clamps start<1 to 1 — changed**)
  - empty string or non-string container → `""`, no error
- **Word delimiter**: spaces, where "any non-visible character, such as a tab or carriage return, is considered a space". Split on `/[ \t\r\n]/`; trailing/consecutive delimiters produce empty chunks.
- **Line delimiter**: carriage returns only (`"\r"`), not wrapping. **Current line.js splits on `"\n"` and reads `the.lineDelimiter` — both wrong (C8 removes the delimiter; docs say CR).**
- **Item delimiter**: live `itemDelimiter`, default `","`, resolved at call time from `globalThis.the.itemDelimiter` with `","` fallback (C3); range rejoin uses the delimiter current at call time.
- **Char splitting**: single ANSI characters per code unit; no surrogate-pair handling (deliberate boundary per docs).
- **Verified worth porting**: the range clamp logic (`end > parts.length → end = parts.length`; `end < start → ""`) in item.js/char.js is correct and kept; the surface, delimiters, and `start<1` behavior are changed.

**Rationale**: The docs' four keywords each state the read semantics; the skill's Chunk Mapping Rules state the JS call shape; C1/C2 resolve out-of-range/empty to the empty string; C3 resolves the item delimiter to the live property; C8 resolves word/line delimiters away. A single internal `chunk-split.js` (not exported) holds the four pure split rules used by both the selectors and the `the`-proxy function forms (R3) — one real consumer pair, no cycle.

**Alternatives considered**: keep positional forms (contradicts C1, game uses only chained — rejected); plain-string-only put target (can't carry position — rejected); drop range stand-ins (12-name surface final — rejected); `split(/\s+/)` collapsing runs (spec mandates empty chunks — rejected).

---

## R2: put-* port design

**Decision**: Rewrite all three put modules to `put*(chunkExpression, value)` (chunk first, value second — C1), returning the new string.

- **Target resolution**: the first argument is a chunk target that is either a **plain string** → the whole container (36 of 48 game call sites use this: `putAfter(tRetString, tChar)` accumulation), or a **`ChunkBound`** from a chained `.of(str)` → resolve exact chunk boundaries from its metadata (US2 scenario 1/3 and the game's `putInto(char(offset(...)).of(tString), tCharB)`).
- **Per-form semantics**: after/before insert without replacing container content; into replaces the target chunk. Whole-container: `putAfter(s,v) → s+v`; `putBefore(s,v) → v+s`; `putInto(s,v) → String(v)`.
- **Stringification**: value converted to a string first (`String(value ?? "")`).
- **Nonexistent target** → "inserted as appropriate into the container": a `ChunkBound` whose read resolved to `""` via out-of-range/empty-range inserts the value at the end (append). `putInto(char(99).of("abc"),"X") === "abcX"`.
- **Empty whole-container** `putInto` → the container becomes the value.
- **Boundary note**: game call sites that discard the returned string (mutation-by-reference expectation) are translation-quality issues explicitly out of 005 scope (spec Assumptions); the runtime contract is the documented by-value return.

**Alternatives**: value-first char positions (contradicts C1 — rejected); explicit `(container, kind, n)` triple (adds a second contract shape — rejected); `ChunkBound` as a plain object with `toString` (loses `.length`/String methods — the `String` subclass is chosen).

---

## R3: The `the` proxy redesign

**Decision**: Replace the 874-line hand-written switch with a small data-driven proxy over a **property table** and an **alias map**, delegating reads/writes to the 002 core singleton live bindings (`src/engine/subsystem/singletons.js`), with documented defaults only when a bound field is `undefined`, plus local-owner state for System/script properties the core objects do not carry (`itemDelimiter`, `floatPrecision`, `randomSeed`, selection).

- **Mechanism**:
  - `globalThis.the = new Proxy({}, { get, set, has, ownKeys, getOwnPropertyDescriptor })` installed at module load (kept — FR-007).
  - **get**: symbol → pass-through; resolve alias via `ALIASES` to the canonical key; **function forms** → return the callable; **unknown → throw script error (C6)**; Score/stage-backed (`noopUntil004`) → return the stable documented default; computed → compute from JS (C9); constant → return constant; else read the live singleton binding, and if the field is `=== undefined` return the table default, else the field value.
  - **set**: symbol → internal; alias-resolve; **unknown → throw (C6)**; **read-only → throw (C5)** `Cannot set read-only property: the <name>`; rw → write the singleton field when the core object owns it, else the proxy's local backing, coercing per the table.
  - **has**: `true` only for canonical keys + aliases + function-form names (replaces claim-everything — FR-012). **ownKeys/getOwnPropertyDescriptor**: enumerate canonical keys so `Object.keys(the)` is auditable (FR-013 source).
  - **function forms** (C4): `numberOfCharsIn(str)`, `numberOfItemsIn(str)` (live delim, C3), `numberOfLinesIn(str)`, `numberOfWordsIn(str)`, `lastCharIn(str)`, `lastWordIn(str)`, `lastItemIn(str)`, `lastLineIn(str)`; plus `numberOfCastMembersOfCastLib(castLib)` → 0 no-op until 004. Counts use the shared `chunk-split.js`; counts return numbers so `char(1).to(the.numberOfCharsIn(str)).of(str)` composes (tested).
  - **Removals (C8)**: `wordDelimiter`, `lineDelimiter` are absent; reading/writing them throws (C6) — surfaces the verified-zero game usage (FR-013).
  - **Fixes vs the current impl**, all doc-anchored: `maxInteger` = `2147483647` (was `Number.MAX_SAFE_INTEGER`); `the.void → null` (002 R2); defaults delegated to core classes (`beepOn` false, `centerStage` true, `soundLevel` 7, `soundEnabled` true, `exitLock` false, `keyboardFocusSprite` -1).
  - **Removals (FR-013, no anchor, no game use)**: `numberOfSounds`, `machineType` — removed.
  - **New property**: `randomSeed` (System, RW, default 0; doc-silent default recorded; game 6×; C7).
  - **Computed set (C9)**: `milliseconds`/`milliSeconds`, `date`/`time`/`longTime`/`long`/`short`/`abbreviated`/`abbreviatedTime`/`systemDate` (Intl/Date), `timer`/`ticks` (monotonic ms; ticks = 1/60 s). `timer` drops the settable backing.
  - **Kept** `_reset()` exported from the module (not the barrel) for the red-green reset leg.

**Alternatives**: keep the 874-line switch with backing (duplicates core state — the beepOn/centerStage/soundLevel mismatches are live evidence; can't express aliases/function forms cleanly; claim-everything `has` violates FR-012 — rejected); modify core objects to carry System props (engine/core is 002/003-owned — rejected; proxy local backing owns only props with no core field).

---

## R4: Test strategy

**Decision**: vitest + jsdom (already configured; vitest.config.js unchanged), no package-local shims. Nine new co-located feature test files under `packages/director/src/engine/syntax/__tests__/` (`char`, `item`, `line`, `word`, `put-after`, `put-before`, `put-into`, `the-proxy`, `surface`), plus the existing 7 files from 002 stay green. Red-green per FR-015: write all 9 first, run, observe red, then implement per user story.

- **Observing red with the current code** is concrete and needs no scaffolding: chunk tests fail `char(1).of is not a function`; put tests fail on argument order; line/word fail on delimiters; the-proxy fails on function forms absent, `the.zzz` not throwing, aliases missing, `maxInteger` wrong, `the.void` wrong, decentralized defaults, word/line delimiters present.
- **No-context observation**: tests import from `src/api/index.js` with no context activation; the singleton slots' default instances back `globalThis.the` reads. Context-swap tested only as a smoke assertion (isolation is 004's boundary).

**Alternatives**: happy-dom (jsdom already configured — rejected); shims (forbidden).

---

## R5: Port-vs-rewrite verdict per module

| File | Verdict | What changes |
| --- | --- | --- |
| `char.js` | **Rewrite** (port core) | new chained selector + `ChunkBound`; keep 1-based/out-of-range/end-clamp; change `start<1` → `""`; drop positional `char(n, str)`. |
| `item.js` | **Rewrite** (port core) | chained selector; keep live-delimiter + rejoin; drop positional delimiter arg; `itemRange` = alias. |
| `line.js` | **Rewrite** | delimiter `"\r"` only; remove `the.lineDelimiter` read (C8); drop positional arg; `lineRange` = alias. |
| `word.js` | **Rewrite** | delimiter class `/[ \t\r\n]/`; remove `the.wordDelimiter` read (C8); drop positional arg; `wordRange` = alias. |
| `chunk-split.js` | **NEW (internal, not exported)** | shared pure split functions for selectors + `the` function forms. |
| `put-after.js` | **Rewrite** | `putAfter(target, value)` contract; whole-container + `ChunkBound` targets; stringify; nonexistent→append. |
| `put-before.js` | **Rewrite** | same contract. |
| `put-into.js` | **Rewrite** | same contract; replace semantics. |
| `the-proxy.js` | **Rewrite** | data-driven property table + alias map + function forms; C5/C6 throws; remove claim-everything `has`; remove word/line delimiters + numberOfSounds/machineType; delegate to live singleton bindings; computed date/time (C9); `maxInteger` 2147483647, `the.void null`, `randomSeed` added; keep `globalThis.the` install + `_reset`. |
| `index.js` | **NO CHANGE** | 12 export names stable; `chunk-split` not exported. |
| `api/index.js` | **NO CHANGE** | already re-exports the syntax barrel (`export *`). |
| persist boundary | — | `.char[...]`/`.item[...]` member forms on text-member expressions are 003/006 member-object syntax, not 005 function-form scope. |

## Consolidation

All R1–R5 decisions are anchored to a doc line range, a skill mapping row, the resolved C1–C9 clarify set, or a verified repo file. No open decisions remain (FR-016 satisfied at plan time).