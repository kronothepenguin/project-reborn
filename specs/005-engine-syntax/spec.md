# Feature Specification: 005 — Engine Syntax (Director Lingo Syntax Stand-ins)

**Feature Branch**: `005-engine-syntax`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Build the engine-syntax layer of the Director MX 2004 runtime simulator (`@project-reborn/director`): the chunk-expression stand-ins (char/item/line/word + range forms), the put-before/after/into helpers, and the `the` proxy — per the Director MX 2004 scripting reference and the authoritative Lingo→JS mapping contract (the `lingoscript-to-javascript` skill). Rebuild the deleted syntax test suite red-green (vitest + jsdom). Supersede 001's syntax decisions only where they conflict. Follow the master roadmap `docs/shockwave-player-runtime.md` and the ratified constitution v2.0.0."

**Governance**: Defined-Before-Built — everything below is stated before implementation; anything the docs do not settle is marked `[CLARIFY]` and must be decided with the user before code (No Silent Interpretation). KISS/YAGNI — no speculative `the` properties, no generic chunk plumbing. Red-green tests per constitution Test & Verification Discipline. This spec supersedes 001's syntax decisions only where they conflict (001 treated syntax files as lint-only; 005 port-and-aligns them with tests); 001 FR-013/014/015 are inherited.

## Clarifications

### Session 2026-08-31 (resolved)

- **C1/C2 — call contract**: Port the helpers to the mapping-contract shapes — `char(n).of(str)`, `char(a).to(b).of(str)`, etc., and `putBefore/putAfter/putInto(chunkExpression, value)` returning the new string (JS strings are immutable). Out-of-range and empty-range reads return the empty string. Game code uses only these shapes.
- **C3 — item count delimiter**: `the.numberOfItemsIn(...)` follows the live `itemDelimiter` (the `item...of` reading wins over the stale "commas" wording in `number (items)`).
- **C4 — `the`-function forms**: callable count/last forms (`the.numberOfCharsIn/ItemsIn/LinesIn/WordsIn(...)`, `the.lastCharIn/WordIn/ItemIn/LineIn(...)`, and chained count usage inside `.to(...)`) are implemented on the `the` proxy.
- **C5 — read-only write mechanism**: writing a read-only `the` property throws a script error (consistent with the 002 list/prop-list throwing convention).
- **C6 — unknown `the` property**: reading/writing a `the` property not in the property table throws a script error (surfaces translation bugs rather than hiding them).
- **C7 — casing aliases**: doc-backed names are canonical (`milliseconds`, `maxInteger`); camelCase aliases are provided for the exact variants game code uses (`milliSeconds`, `maxinteger`); `randomSeed` is added as a settable System property (per properties.txt 16596–16607) — game reads it (RC4 class).
- **C8 — word/line delimiters**: REMOVE `wordDelimiter`/`lineDelimiter` from the `the` surface. Verified repo-wide: the docs only document `itemDelimiter` as settable and the game uses only `itemDelimiter` (571 uses; zero uses of word/line delimiters). General user rule: *if it appears in the game, keep; if not, remove*.
- **C9 — date/time entries**: KEEP computed from JS (Date.now()/Intl) as the runtime's values. General user rule (recorded): **game > director docs** — the docs are not always up to date; if the game uses something, keep it; the docs inform defaults, the game dictates presence.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chunk-expression helpers behave per the docs and the translation mapping (Priority: P1)

Translated Lingo code uses `char(n)`, `item(n)`, `line(n)`, `word(n)` and the range forms (`.to(m)` chains) against any string container, per the Chunk Mapping Rules table of the `lingoscript-to-javascript` skill (authoritative translation contract) and the Director reference (char...of, item...of, line...of, word...of). Chunks are 1-based; out-of-range reads yield the empty string; range ends beyond the container clamp to the actual last chunk; words are delimited by spaces (non-visible chars such as Tab and Return count as spaces); lines are delimited by carriage returns (not wrapping); items are delimited by the current `itemDelimiter` (comma by default).

**Why this priority**: The translated game code already calls these as globals (hundreds of `.char[`/`.item[`/`.word[`/`.line[` member forms plus chained `char(n).of(str)` / `item(a).to(b).of(str)` function forms). Without correct, tested chunk semantics no translated script that reads or walks strings can run. Pure functions over strings — no player state — so this is the smallest standalone slice that delivers value.

**Independent Test**: A vitest suite (jsdom environment) exercising every documented form — single chunk, range, clamping, delimiter-driven item splitting, 1-based indexing, empty-string and out-of-range behavior — with no context activated, importing the helpers from the public lingo entry.

**Acceptance Scenarios**:

1. **Given** the string `"red,yellow,blue green,orange"` and the default item delimiter, **When** the third item is requested, **Then** the result is `"blue green"` (the entire chunk between commas).
2. **Given** the same string, **When** items 3 through 5 are requested, **Then** the result is `"blue green, orange"` (the fifth item does not exist, so the actual last item is returned — range clamping).
3. **Given** the string `"fox elk dog cat"`, **When** the fifth word is requested, **Then** the result is the empty string (out-of-range).
4. **Given** the string `"$9.00"`, **When** chars 1..1 and 1..5 are requested, **Then** the results are `"$"` and `"$9.00"`.
5. **Given** a multi-line string, **When** individual lines are requested (single and range), **Then** lines are split on carriage returns only, and range results preserve the delimiters between included chunks.
6. **Given** a string and the item-delimiter state, **When** the delimiter is changed and restored, **Then** item chunk reads use the live delimiter (and a later restore to comma returns prior behavior).
7. **Given** an empty string or a non-string container, **When** any chunk is requested, **Then** the result is the empty string and no error is raised.

---

### User Story 2 - put-before / put-after / put-into mutate the target chunk per the docs (Priority: P1)

Translated code uses `putAfter(chunkExpression, expression)`, `putBefore(chunkExpression, expression)`, and `putInto(chunkExpression, expression)` (Put Expression Rules) to insert a string before or after a chunk or to replace a chunk in a container, per the put...before / put...after / put...into keyword entries. The expression value is converted to a string; a nonexistent target chunk causes the string to be inserted "as appropriate" at the boundary rather than erroring.

**Why this priority**: Translated scripts already call these (tens of call sites; string-building loops depend on `putAfter` accumulation). The docs' semantics are distinct per form (insert-without-replacing vs replace); this slice is needed before any string-building logic can be exercised. Pure — no player state.

**Independent Test**: A vitest suite asserting, for each of the three forms, the documented result on known containers: after/before insertion without replacement, into replacement, value-to-string conversion, and the nonexistent-target behavior.

**Acceptance Scenarios**:

1. **Given** the string `"fox dog cat"`, **When** `putBefore` inserts `"elk "` before the second word, **Then** the result is `"fox elk dog cat"`.
2. **Given** a container string with content, **When** `putAfter` appends after the whole container, **Then** the content is extended without replacing existing content.
3. **Given** a two-line string, **When** `putInto` replaces the second line, **Then** the second line is replaced while the first is untouched.
4. **Given** a nonexistent target chunk, **When** any of the three forms executes, **Then** the value is inserted as appropriate at the boundary and no error is raised.
5. **Given** a non-string expression value, **When** any form inserts it, **Then** the value is converted to its string representation first.
6. **Given** an empty-string container, **When** `putInto` targets the whole container, **Then** the container's content becomes the inserted value.

---

### User Story 3 - The `the` proxy exposes the documented `the`-property surface globally and enforces read-only (Priority: P1)

A single global `the` object (installed on `globalThis`) exposes the documented `the`-property surface: movie, player, sound, key, mouse, and system state, read through the active singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`), with read-only vs read/write classification per the properties reference, and with the `the`-function forms (counts and "last X in") callable per the translation contract. Read-only writes are rejected per the docs. Installation happens at module load with no activated context; when a context is activated, the live-binding slot mechanism (established in 002) makes the same `the` object reflect the active context.

**Why this priority**: The translated game code reads `the.*` over 850 times (delimiter, mouse state, stage rect, movie state, key state, and count/last function forms). Without this surface no script that touches movie/input/playback state runs. Independently testable because the singleton slots have default (no-context) instances and the live-binding mechanism allows tests to swap context without the player.

**Independent Test**: A vitest suite where (a) `globalThis.the` exists after importing the public lingo entry with no context; (b) every property in the doc-derived property table reads a defined value of the documented type; (c) every read-only property rejects a write; (d) read/write properties store and return the new value; (e) the `the`-function forms return documented counts/last-chunk results; (f) after installing an activated context, reads delegate to that context's instances and return to defaults after reset.

**Acceptance Scenarios**:

1. **Given** no context activated, **When** the public lingo entry is imported, **Then** `globalThis.the` exists and reads like `the.itemDelimiter`, `the.mouseLoc`, `the.floatPrecision` return defined defaults without error.
2. **Given** a read-only property from the table, **When** a script attempts to write to it, **Then** the write is rejected per the docs' read-only classification and the value is unchanged.
3. **Given** a read/write property from the table (e.g., item-delimiter), **When** a script writes a new value and reads it back, **Then** the new value is returned and subsequent item chunking uses it.
4. **Given** an activated context `A`, **When** `the`-backed reads occur, **Then** they reflect context `A`'s instances; after reset, reads return the default no-context values.
5. **Given** the doc-defined `the`-function forms (e.g., number-of-items, last-char), **When** a translated call like `the.numberOfItemsIn(...)` or `the.lastCharIn(...)` executes, **Then** it returns the documented count/character.
6. **Given** a Score/stage-backed property read (e.g., current frame), **When** read in 005 without a Score subsystem, **Then** it returns the documented no-op default and never errors.

---

### User Story 4 - The syntax stand-ins are publicly available and usable with or without an active context (Priority: P2)

All 12 syntax stand-ins (char, charRange, item, itemRange, line, lineRange, word, wordRange, the, putInto, putBefore, putAfter) are importable from the public lingo entry and behave identically as pure helpers with no context, with the no-context default singletons, or with an activated context. Score/stage-backed `the` values carry documented no-op defaults until feature 004 wires them.

**Why this priority**: This is the integration slice — it proves the layer's public surface and context-independence, which API (006), player (008), and core (003) consumers rely on. P2 because the previous stories already deliver the behavior; this locks the packaging and context contract.

**Independent Test**: A vitest suite importing the 12 names from the public lingo entry, asserting (a) all 12 are exported, (b) every helper produces identical results with no context and with each singleton-swap scenario, and (c) undocumented properties are absent (YAGNI gate).

**Acceptance Scenarios**:

1. **Given** the public lingo entry, **When** the 12 stand-in names are imported, **Then** all 12 resolve to callable values.
2. **Given** no activated context, **When** a chunk read, a put operation, and a `the` property read are performed, **Then** all succeed with the same results as with default singletons.
3. **Given** a Score/stage-backed `the` property (e.g., number-of-cast-libraries, stage extents), **When** read, **Then** it returns a stable, documented default and documents that live values arrive with feature 004.

---

### Edge Cases

- **char 0 / char beyond length**: 1-based positions; index 0 and past-the-end yield the empty string (out-of-range convention per the word/item examples; chars/lines doc-silent — (C2: empty-string convention)).
- **Empty string / non-string container**: reads yield the empty string without error.
- **Line/word/item boundaries**: trailing delimiters produce a trailing empty chunk; consecutive delimiters produce empty chunks; chunks include empty ones — convention confirmed at clarify ((C8: empty-chunk convention)).
- **itemDelimiter changes mid-use**: item chunking reads the current delimiter state at call time; range results rejoin with the then-current delimiter; restore returns prior behavior.
- **Range with start > end**: denotes no chunks and yields the empty string ((C2: empty-string convention)).
- **Range end beyond length / start below 1**: end clamps to the actual last chunk; start below 1 is doc-silent ((C2: empty-string convention)).
- **put-* into empty/absent ranges**: a nonexistent target chunk inserts "as appropriate" at the boundary; an empty whole-chunk target becomes the inserted value.
- **the-proxy, Score/stage-backed read**: returns the documented no-op default in 005; wired for real in 004.
- **the-proxy, write to read-only property**: rejected per docs; mechanism per (C5: throw script error).
- **the-proxy, unknown property**: (C6: throw script error).
- **the-proxy, casing aliases**: (C7: canonical + aliases; randomSeed added).
- **Two contexts**: isolation is 004's concern; 005 uses the established live-binding slots (documented boundary).
- **the-function forms with no matching backing**: count/last on empty strings return documented zero/empty results.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The runtime MUST provide chunk helpers for all four documented chunk kinds — chars, items, lines, words — in both single-chunk and range forms, per the Chunk Mapping Rules table of the `lingoscript-to-javascript` skill (the authoritative translation contract) and the char...of / item...of / line...of / word...of keyword entries. *Testable: each documented usage form exercised and returning the documented result.*
- **FR-002**: All chunk positions MUST be 1-based; out-of-range single-chunk reads MUST return the empty string, and range ends beyond the container MUST clamp to the actual last chunk, per the item...of and word...of doc examples. *Testable: boundary cases in the suite.*
- **FR-003**: Word chunks MUST be delimited by spaces (any non-visible character such as Tab or Return counts as a space); line chunks MUST be delimited by carriage returns, not text wrapping; per the word...of and line...of descriptions. *Testable: strings containing tabs and CRs.*
- **FR-004**: Item chunking MUST use the current item delimiter (`","` by default, settable through the item-delimiter `the` property, per the item...of and itemDelimiter entries); range results MUST rejoin with the delimiter current at call time. *Testable: default split, delimiter change, restore, and rejoin.*
- **FR-005**: Empty ranges (end precedes start) MUST return the empty string (C2: empty-string convention). *Testable: start>end for all four kinds.*
- **FR-006**: The put helpers MUST implement the documented put...before / put...after / put...into semantics — evaluate and stringify the value, insert before or after the target chunk without replacing container content, or replace the target chunk — and MUST insert "as appropriate" when the target chunk does not exist, per the three put keyword entries. The call contract MUST match the Put Expression Rules table (C1: chunk first, value second; returns the new string). *Testable: the six doc-derived acceptance scenarios.*
- **FR-007**: The runtime MUST install a single `the` proxy as a global (`globalThis.the`) at module load, without requiring an activated context, exposing the documented `the`-property surface (movie/player/sound/key/mouse/system state and documented global constants). *Testable: global exists with no context; reads return defined values.*
- **FR-008**: `the` property reads MUST delegate to the active singletons through the established live-binding slots, so an activated context's instances are reflected automatically and the no-context defaults serve otherwise; where a property's live value derives from the Score/stage, 005 MUST provide the documented default/no-op read-only surface and defer live values to feature 004. *Testable: default-state reads, activated-context delegation, Score/stage boundary.*
- **FR-009**: The chunk-helper function forms `char(n)`, `item(n)`, `line(n)`, `word(n)` with `.of(...)` and range chaining (`.to(...)`), plus the range stand-ins, MUST behave per FR-001–FR-005 and the mapping contract ((C2: empty-string convention)); the already-implemented modules are ported to this contract where their shape diverges. *Testable: chained forms exercised.*
- **FR-010**: The `the`-function forms documented as chunk counts and last-chunk access (number of chars/items/lines/words, last char/word/item/line/chunk in/of) MUST be callable on the `the` proxy per the the Expression Rules table ((C4: callable count/last + chained usage)). *Testable: count and last-chunk results on known strings, including empty/no-match cases.*
- **FR-011**: The read-only vs read/write classification of every `the` property MUST follow the properties reference; writes to read-only properties MUST be rejected by throwing a script error (C5). *Testable: every classified read-only property has a write-rejection test; every read/write property has a store-and-read-back test.*
- **FR-012**: Reads and writes of `the` properties not present in the doc-derived property table MUST NOT be silently fabricated; unknown-property reads/writes MUST throw a script error (C6, replacing the claim-everything behavior). *Testable: unknown-property case per the decided convention.*
- **FR-013**: The runtime MUST NOT expose `the` properties beyond the doc-derived table and constants listed in the reference (YAGNI): no speculative properties, and no undocumented writable delimiters — wordDelimiter/lineDelimiter are REMOVED (C8; verified zero game usage). *Testable: surface audit — every property in the runtime appears in the table with a doc anchor or an approved clarify note.*
- **FR-014**: The full syntax surface (12 stand-ins) MUST be exported from the public lingo entry and MUST behave identically with no activated context, with default singletons, and with an activated context (pure helper behavior). *Testable: entry-import and context-independence suite (US4).*
- **FR-015**: Every behavior in FR-001–FR-014 MUST be delivered red-green: tests written first, observed failing, then implemented, with the vitest + jsdom suite as the gate. *Testable: the syntax test suite is green under the package test gate.*
- **FR-016**: Any doc-ambiguous behavior not resolved by implementation start MUST be listed in the clarify set and decided with the user before implementation (No Silent Interpretation). *Testable: every [CLARIFY] marker maps to a resolution recorded in the plan before its task is implemented.*

### Key Entities *(include if feature involves data)*

- **Chunk expression**: a string container plus a 1-based position/range addressing one of four chunk kinds (char, item, line, word); range results retain the delimiters between included chunks; single-chunk and range reads are pure over the container string.
- **Item delimiter state**: the runtime-wide delimiter used by item chunking; default `","`; settable via the item-delimiter `the` property; affects single reads, range reads (and their rejoining), and item counts.
- **The `the` property table**: the doc-derived registry mapping each documented `the` name to (a) its source — movie / player / sound / key / mouse / system / stage / score — (b) read-only vs read/write classification, and (c) its documented default where the docs state one; seeded by the plan-phase doc audit.
- **The `the`-function form set**: the doc-derived callable forms — number of chars/items/lines/words in a chunk expression, and last char/word/item/line/chunk in/of — returning counts and chunks over the supplied container.
- **The global `the` proxy binding**: the single proxy installed as `globalThis.the` at module load; reads/writes delegate through the live-binding singleton slots; no-context defaults back it until a context activates; the Score/stage-backed subset returns documented no-op defaults until feature 004.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every documented chunk form — char/item/line/word, single and range, per the mapping table — is exercised by the syntax test suite and passes (100% of the forms listed in FR-001–FR-005 have at least one test; the doc-example cases for each kind are included verbatim).
- **SC-002**: The `the` surface matches the doc-derived property table: 100% of the statable properties in the table are readable, and the read-only / read/write classification of each is verified by test (FR-011), with no property in the runtime outside the table or an approved clarify note (FR-013 audit passes).
- **SC-003**: 100% of read-only properties in the table have a passing write-rejection test, and 100% of read/write properties have a passing store-and-read-back test.
- **SC-004**: The 12 stand-ins are importable from the public lingo entry and every helper returns identical results with no context and with the default-singleton state (US4 suite green); Score/stage-backed `the` reads return stable documented defaults without error before 004.
- **SC-005**: The complete syntax test suite is green under the package test gate (vitest + jsdom) — a red phase is observable per task before implementation (red-green).
- **SC-006**: Zero undocumented properties or fabricated defaults: the property-table audit shows a doc anchor (file + entry) or an approved clarify resolution for every `the` name and every default value the runtime exposes.

## Assumptions

- The Director MX 2004 scripting reference (`docs/drmx2004_scripting_ref/`) is the authoritative behavioral source; where it is silent, the behavior is not invented — it is flagged for clarify.
- The "Chunk Mapping Rules", "Put Expression Rules", and "the Expression Rules" tables of the `lingoscript-to-javascript` skill are the translation contract this layer must satisfy; where a table row conflicts with existing implementation shapes, the conflict is resolved at clarify, not silently.
- Score/stage-backed `the` values are defined in 005 as documented no-op/default read-only surface; live Score-backed values are provided by feature 004 (roadmap decision, kept).
- Feature 002's stabilization stands: the 12 export names are final, `@/lingo` is the public entry, and the singleton live-binding slots are the context mechanism; 005 adds no new export names unless clarify explicitly approves an addition.
- The test gate is vitest with the jsdom environment (no package-local shims); tests are written before implementation and observed failing (red-green).
- Two-context interaction/isolation is feature 004's concern; 005's `the` behavior is specified only against the live-binding slots.
- Translation of Lingo to JavaScript (including translation quality of individual game files) is out of scope for this package; 005 defines the runtime surface the translations call.