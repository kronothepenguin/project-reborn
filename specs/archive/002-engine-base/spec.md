# Feature Specification: Director Engine Base

**Feature Branch**: `002-engine-base`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Build the engine base layer of the Director Shockwave runtime package (`@project-reborn/director`): the five Director MX 2004 data-types (Color, List, PropList, Point, Rect) exactly as documented in the Macromedia Director MX 2004 scripting reference, plus the Lingo constants (EMPTY, VOID, RETURN, SPACE, TAB, BACKSPACE, ENTER, QUOTE, TRUE, FALSE, PI). Also perform Phase 0 stabilization: a recent refactor moved code and left stale internal import paths, so the package currently does not import cleanly through its public entry points — consumers and later specs cannot build on it until fixed. Additionally, delete all existing unit tests in the package (132 stale `*.test.js` files, most of them tied to the old module layout) — they are stale relative to the new implementation and will be rebuilt per-spec under red-green discipline. 002 supersedes conflicting decisions from 001, which stays in place as historical reference."

## Clarifications

### Session 2026-08-31

- Q: The existing `Color` implementation carries undocumented convenience members (`hex`/`rgb` getters, `equals()`). FR-004 forbids undocumented members; keep, mark, or remove them? → A: Check the documentation first, then decide. Doc result: `color()` is the documented top-level function and data type creator (`color(intPaletteIndex)` or `color(intRed, intGreen, intBlue)`, methods.txt line 2196), with all values truncated to the 0–255 range; the data-type table (director_scripting_essentials.txt line 361) describes Color only as "Represents an object's color." No documentation exists for `hex`, `rgb` getters, or `equals()`. Decision: documented surface only — the undocumented convenience members are removed.
- Q: Is `rgb()` a documented alternative creator for Color? → A: `rgb()` has no dedicated entry in methods.txt or properties.txt; it appears only inside 3D examples as a literal color expression. A global `rgb()` helper's existence is therefore deferred to the API feature (006) and must not be added in 002.
- Q: Test cleanup scope — delete only the 132 stale `*.test.js` files, or also the custom browser-mock shims (`src/__test-shims__/`)? → A: Delete the shims too. Browser-like behavior in tests is provided by a standard DOM environment (jsdom or happy-dom), not by package-local shims.
- Note: The key character constants carry a documentation ambiguity. The constants chapter (constants.txt) maps `BACKSPACE`→51, `ENTER`→3, `RETURN`→36, `SPACE`→49, `TAB`→48 in its JavaScript column (keyCode values), while Lingo compares the constants against `_key.key` (the character produced). The current values (`String.fromCharCode(51)` for `BACKSPACE`, `String.fromCharCode(3)` for `ENTER`) mirror the keyCodes, which contradicts Lingo character semantics. The plan must resolve the doc-conformant values (leaning: Lingo character constants — `BACKSPACE` = backspace character, `RETURN` = `\r`, `SPACE` = `" "`, `TAB` = `"\t"` — and document the discrepancy); no silent guessing.
- Q: FR-002 requires documented list/bracket syntax access for `Point`/`Rect`/`List`/`PropList` (`pt[1]`, `myRect[3] - myRect[1]`, `list[2]`, `pl[#prop]`), but the bracket Proxies only exist on instances created by the creator functions, which the 002 plan had deferred to feature 006. Export them anyway? → A (amendment 2026-08-31): YES — the five creator functions `color()`, `list()`, `point()`, `propList()`, `rect()` are exported from `@/lingo` in 002, re-exported from the `engine/base` factories (they are documented as "Top level function and data type" — the constructors of these types, and the only path to the documented list-syntax behavior). For `color()` only the three-argument RGB form is exported in 002; the single-argument palette-index form remains 006-owned. `rgb()` stays absent. The `src/api/methods` creator modules remain dormant until 006 reconciles them.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Director Data-Types (Priority: P1)

A developer (or translated Lingo script) imports the five Director data-types — `Color`, `List`, `PropList`, `Point`, and `Rect` — from the package's lingo entry point and uses them exactly as described by the Macromedia Director MX 2004 scripting reference. Each type behaves per the documentation: documented members only, documented defaults, documented indexing, documented command results, documented error/return conventions, and the documented RGB channel clamping for `Color`. Where the documentation maps a Director type directly onto a JavaScript native, the native is reused; a custom representation exists only where the documentation truly requires one.

**Why this priority**: Data-types are the foundational layer of the entire runtime — every core object, top-level method, score/player feature, and later spec depends on them. They are independently constructible and testable against the docs, so this slice is a viable MVP on which everything else stacks. They gate all downstream work, hence P1.

**Independent Test**: Can be fully tested by importing the five types from the lingo entry point and exercising every documented operation against doc-defined expected results (channel clamping, 1-based indexing, list/property syntax access, command return conventions, defaults under omitted arguments). Delivers the complete documented data-type vocabulary the rest of the runtime consumes.

**Acceptance Scenarios**:

1. **Given** the lingo public entry point, **When** a consumer imports the five data-types, **Then** each type is available with exactly its documented member surface and no undocumented members.
2. **Given** a `Color` constructed with out-of-range and fractional channel values (e.g. negative, above 255, non-integer), **When** its channels are read and written, **Then** every channel is truncated to an integer within 0–255, per the documentation.
3. **Given** a `Point` and a `Rect`, **When** they are constructed with the documented argument forms and their coordinates are read and written via both property syntax and list syntax, **Then** both syntaxes produce the documented values.
4. **Given** a `List` created per the documentation, **When** the documented list commands are applied (add, addAt, append, deleteAt, deleteOne, setAt, sort, duplicate, getOne/getPos, getLast, and count), **Then** each command yields the documented result, including 1-based indexing, blank-padding on setAt beyond the end, and sorted-state persistence.
5. **Given** a `PropList` holding documented name/value pairs, **When** properties are added, set, queried, and deleted via the documented commands, **Then** missing-property lookups return the doc-defined result (VOID/0) where documented, duplicate properties behave per the docs, and property ordering follows the docs.
6. **Given** a documented command invoked with a wrong number of arguments, **When** it executes, **Then** it follows the documented default/error conventions rather than silently inventing behavior.

---

### User Story 2 - Lingo Constants (Priority: P1)

A developer (or translated Lingo script) imports the Lingo constants — `EMPTY`, `VOID`, `RETURN`, `SPACE`, `TAB`, `BACKSPACE`, `ENTER`, `QUOTE`, `TRUE`, `FALSE`, `PI` — from the lingo entry point and they represent exactly what the Director MX 2004 documentation defines: the empty string, void, carriage return, space, tab, backspace key, enter/return key, quotation mark, logical true and false (with their documented numeric coercion), and pi.

**Why this priority**: Constants are the smallest atomic building blocks of Lingo code; translated scripts reference them constantly (string handling, key handling, truth checks, numeric constants). They are trivially testable against the docs, are part of the same engine-base layer as the data-types, and everything above (syntax, methods, objects) assumes they are correct.

**Independent Test**: Can be fully tested by importing all eleven constants and asserting each value and each documented semantic (e.g. FALSE as 0 in numeric contexts, any nonzero integer as TRUE in comparisons, character constants as their documented characters). Delivers the documented constant vocabulary the runtime and translated scripts rely on.

**Acceptance Scenarios**:

1. **Given** the lingo public entry point, **When** a consumer imports the constants, **Then** all eleven documented constants are present.
2. **Given** each character constant (`EMPTY`, `RETURN`, `SPACE`, `TAB`, `BACKSPACE`, `ENTER`, `QUOTE`), **When** read, **Then** its value matches the documented character semantics.
3. **Given** `TRUE` and `FALSE`, **When** used in logical and numeric contexts, **Then** `FALSE` behaves as the numerical value 0 and any nonzero integer evaluates to `TRUE`, per the documentation.
4. **Given** `VOID`, `PI`, and `EMPTY`, **When** read, **Then** each returns its documented value.
5. **Given** the key character constants (`BACKSPACE`, `ENTER`, `RETURN`, `TAB`), **When** their values are verified against the documentation during implementation, **Then** they represent the documented key characters (platform notes in the docs honored as documented).

---

### User Story 3 - Package Stabilization - Phase 0 (Priority: P1)

A consumer (the client, translated Lingo bundles, the test suite, or a later spec) imports the `@project-reborn/director` package through any of its three public entry points — package root, lingo surface, and browser host — and the import always succeeds: no module-resolution errors, no references to removed or relocated modules, no import-time failures, and no requirement to activate a context merely to import. The refactor that reorganized the package left stale internal import paths behind; this story removes that fragility so the package is a trustworthy foundation.

**Why this priority**: The user explicitly treats stabilization as a prerequisite. While the package does not import cleanly, no consumer and no later spec can build, test, or run anything on it — the data-types and constants are unreachable even though they exist. This is P1 because it unblocks US1/US2 verification and every subsequent feature in the series.

**Independent Test**: Can be fully tested by importing all three public entry points in a fresh process (no context activation) and asserting zero module-resolution errors, plus a static audit of every import reachable from the public entry points. Delivers a consumer-safe package foundation that later specs can build on.

**Acceptance Scenarios**:

1. **Given** the package in its post-refactor state, **When** a fresh process imports each public entry point, **Then** no module-resolution error occurs for any of them.
2. **Given** the module graph reachable from the public entry points, **When** it is audited statically, **Then** no import references a module that is missing, removed, or relocated relative to its prefix.
3. **Given** a consumer importing a public entry point without an activated runtime context, **When** the import completes, **Then** it succeeds without import-time errors or side effects.
4. **Given** the package after stabilization, **When** a consumer imports the lingo surface and reads the singleton/constant/type exports, **Then** the documented public surface is present and usable.
5. **Given** the stabilization regression coverage, **When** the package test command runs, **Then** entry-point import assertions pass with no pre-existing failures.

---

### User Story 4 - Test Cleanup - Phase 0 (Priority: P2)

The package's 132 existing unit tests and its custom browser-mock shims (`src/__test-shims__/`) are deleted as the starting move of the rebuild. They assert behavior from the old implementation and old module layout, so they are misleading: they do not describe the new implementation's contract, several reference removed APIs or old import paths, and they obscure the actual state of the package. Removing them gives the package a clean slate on which tests are then rebuilt per-spec under red-green discipline — write the test, observe it fail, then implement. Browser-like behavior in tests is provided by a standard DOM environment (jsdom or happy-dom), not by package-local shims.

**Why this priority**: This is deliberately P2 rather than P1: it never blocks consumers (the stale tests do not prevent imports once US3 lands), but it must happen before any new per-spec tests are written so the suite is unambiguous and red-green has a clean starting point. It supports the constitution's Test & Verification Discipline by ensuring no stale assertions survive to mislead later work.

**Independent Test**: Can be fully tested by running the package test command and inspecting the test tree: zero stale tests remain (the 132 removed), and no remaining test references a removed API or pre-refactor layout. Delivers an unambiguous, truthful suite state that red-green rebuilding starts from.

**Acceptance Scenarios**:

1. **Given** the package's 132 existing unit tests and its custom test shims, **When** Phase 0 cleanup completes, **Then** all stale tests and package-local shims have been removed and none remain in the package.
2. **Given** the remaining test tree after cleanup, **When** inspected, **Then** no test file references a removed API, a removed module path, or the pre-refactor layout.
3. **Given** the deletion, **When** any previously stale test is considered for revival later, **Then** it is rewritten fresh against the new implementation contract under red-green, never silently adapted.
4. **Given** the package at the end of this feature, **When** the test command runs, **Then** it executes the fresh in-scope tests (data-types and constants) and reports no pre-existing failures.

---

### Edge Cases

- **List/PropList out-of-range access**: indexes below 1 or above the current count — reading returns the doc-defined result (0/VOID-style), writing at position beyond the end behaves per the docs (e.g. linear-list blank-padding on setAt, script-error convention for property lists), deleting an absent position is a no-op or doc-defined error.
- **PropList missing keys**: property lookups for keys not present return the doc-defined VOID/0-style result; `setaProp`-style semantics add the property when absent per docs; `getProp`-style semantics signal the doc-defined script error.
- **Color channel clamping**: negative, above-255, and fractional channel inputs truncate to 0–255 per the docs; the documented clamping holds on both construction and assignment.
- **List helper boundary behavior**: missing values in lookup helpers return the documented 0/VOID-style sentinel; duplicate values resolve to first-occurrence semantics; sorted-state persists across adds and deletes per docs; sorting orders numbers before strings per docs.
- **Empty/void values**: empty lists and property lists (count 0), the `EMPTY` string, and `VOID` as an entry value behave per the documented semantics of each command.
- **Wrong argument counts and defaults**: documented optional arguments default as specified; omitted required arguments follow documented default behavior rather than invented coercion.
- **TRUE/FALSE numeric interplay**: `FALSE` is 0 in numeric contexts and `0` is treated as `FALSE`; any nonzero integer evaluates to `TRUE` in comparisons.
- **Key constant values**: `BACKSPACE` and `ENTER` currently carry values that must be verified against the documentation during the plan/implementation phase; the spec requires doc-conformant values, whatever they are determined to be.
- **Stale imports breaking consumers**: any public entry point import must never surface a module-resolution error; the stabilization must cover the whole graph reachable from the entries, not just the top-level files.
- **Tests referencing removed APIs**: such tests are deleted (not patched) in cleanup; content that must be preserved is re-expressed as fresh red-green tests later, never silently rewritten to assert something new.
- **Two active contexts**: interaction and isolation between concurrently active contexts is a later spec's concern; 002 does not alter current isolation semantics (assumption below).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose the five documented Director data-types — `Color`, `List`, `PropList`, `Point`, `Rect` — from the package's lingo public entry point, each with its documented constructor/creation capability.
- **FR-002**: Each data-type MUST implement exactly the behavior documented in the Director MX 2004 scripting reference, including documented members, defaults, 1-based list indexing, list/property syntax access for `Point`/`Rect`, list command semantics, and documented return/error conventions — with no fabricated behavior beyond the docs.
- **FR-003**: System MUST reuse JavaScript natives wherever the documentation maps a Director type or value directly to a native (strings, booleans, numbers), introducing custom representations only where the documentation genuinely requires them.
- **FR-004**: Each data-type MUST expose exactly the documented member surface — no undocumented members, no invented convenience members, no fabricated derivations.
- **FR-005**: System MUST expose the eleven documented Lingo constants (`EMPTY`, `VOID`, `RETURN`, `SPACE`, `TAB`, `BACKSPACE`, `ENTER`, `QUOTE`, `TRUE`, `FALSE`, `PI`) from the lingo public entry point, each with its documented value.
- **FR-006**: `TRUE` and `FALSE` MUST honor the documented numeric semantics (FALSE = 0; any nonzero integer evaluates to TRUE) in addition to their logical meaning.
- **FR-007**: All three public entry points (package root, lingo surface, browser host) MUST import successfully in a fresh process with no module-resolution errors, and importing them MUST NOT require an activated runtime context or produce import-time side effects.
- **FR-008**: The package MUST contain no stale internal import paths in any module reachable from its public entry points — no import may reference a module that is missing, removed, or relocated relative to the current layout.
- **FR-009**: All stale unit tests — tests asserting removed behavior, referencing removed APIs, or tied to the pre-refactor layout — MUST be removed from the package, along with the package-local browser-mock shims, so the test suite is a clean slate for per-spec red-green rebuilding.
- **FR-010**: Tests for this feature's scope (the five data-types and the constants, and the public entry points) MUST be introduced first, observed failing, and then made to pass (red-green per the constitution's Test & Verification Discipline); at feature completion the package test command MUST pass with no pre-existing failures. Browser-like behavior in tests MUST come from a standard DOM environment (jsdom or happy-dom), not package-local shims.
- **FR-011**: Where the documentation is silent, ambiguous, or contradictory about runtime behavior, the system MUST NOT guess: the ambiguity MUST be surfaced and resolved before implementation (No Silent Interpretation).

### Key Entities *(include if feature involves data)*

- **Color**: The Director RGB color data type; three channels (red, green, blue), each an integer 0–255 with documented truncation of all other values; no palette behavior in scope for 002 beyond what the docs define for construction.
- **Point**: The Director coordinate data type; two integer coordinates (horizontal and vertical); supports both property access and the documented list-syntax access.
- **Rect**: The Director rectangle data type; four integer edges (left, top, right, bottom) relative to the Stage; supports both property access and documented list-syntax access; width/height are computed by the consumer from the edges per the docs.
- **List**: The Director linear list data type; an ordered collection of values with 1-based indexing and the documented list command set (add, addAt, append, deleteAt, deleteOne, deleteProp, duplicate, getAt, getOne, getPos, getLast, setAt, sort, count); sorted state persists per docs; blank-fills beyond the end on setAt per docs.
- **PropList**: The Director property list data type; an ordered collection of name/value pairs with 1-based indexing and the documented command set (addProp, deleteAt, deleteOne, deleteProp, duplicate, findPos, findPosNear, getaProp, getAt, getOne, getPos, getProp, getPropAt, setaProp, setAt, sort, count); missing-property and duplicate-property behavior per docs.
- **Lingo Constants**: The eleven documented constants representing the empty string, void, carriage return, space, tab, backspace key, enter/return key, quotation mark, logical true, logical false, and pi — reused from JavaScript natives where the docs map directly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All five data-types expose exactly the documented member surface — verified by audit against the scripting reference with zero undocumented members present.
- **SC-002**: Every documented operation of the five data-types is exercised by the test suite with doc-defined expected results, and 100% of those assertions pass at feature completion.
- **SC-003**: All eleven Lingo constants are exported from the lingo entry point with values matching the documentation, verified by test assertions.
- **SC-004**: The three public entry points import in a fresh process with zero module-resolution errors, and a regression test asserting entry-point importability passes at feature completion.
- **SC-005**: Zero stale tests and zero package-local browser-mock shims remain after cleanup — all 132 pre-existing test files and the shims removed — and no remaining test references a removed API or the pre-refactor layout.
- **SC-006**: `pnpm --filter @project-reborn/director test` completes with no failures attributable to pre-existing package state at feature completion.
- **SC-007**: A static audit of the module graph reachable from the public entry points finds zero imports referencing missing or relocated modules.

## Assumptions

- The Macromedia Director MX 2004 scripting reference (under `docs/drmx2004_scripting_ref/`) is the authoritative source for all type, constant, and member semantics; where the docs define behavior, the docs win over convention.
- JavaScript natives are reused wherever the documentation maps directly (logical constants as booleans, numeric constants as numbers, character constants as strings); custom classes exist only where the docs require a distinct representation.
- 002 and later specs in this series supersede conflicting decisions from 001; 001 remains in place as historical reference and is not amended by this spec.
- Binary Director/Shockwave file formats (`.dcr`/`.dir`/`.cct`/`.cst`) remain out of scope and are not affected by this feature.
- Later specs in the series will cover core objects, context, syntax, the public API, the player, packaging, and browser integration; 002 covers only the data-types, constants, package stabilization, and test cleanup.
- One worker per movie is the isolation model; interaction between two active contexts is a later spec's concern, and 002 does not change the current isolation semantics.
- Whether the existing data-type implementations are ported or rewritten is a plan-level decision for the 002 plan; 002's requirement is only that the documented behavior be correct at feature end.
- Test deletion is confined to the package's stale unit tests and package-local shims; no test suites outside the package are touched by this feature.
- The package test environment uses a standard DOM environment (e.g. jsdom or happy-dom) for any browser-like behavior; no package-local shims are reintroduced.
- The package test command is the verification gate for this feature's test-related criteria.