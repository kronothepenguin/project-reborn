# Implementation Plan: Director Engine Syntax

**Branch**: `005-engine-syntax` | **Date**: 2026-08-31 | **Spec**: [/specs/005-engine-syntax/spec.md](./spec.md)

**Input**: Feature spec 005, `lingoscript-to-javascript` skill, docs/drmx2004_scripting_ref/*, current `packages/director/src/engine/syntax/*`.

## Summary

Build the engine-syntax layer of `@project-reborn/director`: port the four chunk-expression stand-ins (`char/item/line/word` + range forms) onto the chained mapping contract (`char(n).of(str)`, `char(a).to(b).of(str)`), rewrite the three put helpers to the chunk-first `put*(chunkExpression, value)` contract returning the new string, and rewrite the `the` proxy as a data-driven property table (79 rows) with read/write enforcement (C5), unknown-property throwing (C6), casing aliases (C7), removed word/line delimiters (C8), computed date/time (C9), and delegation to the 002 live-binding singletons. Rebuild the deleted syntax test suite red-green (vitest+jsdom). Approach (research.md R1–R5): reads are pure string reads (with a location-carrying `ChunkBound` for put targeting), put/selector share one internal splitter, the proxy owns only state the core objects lack; `index.js` and `api/index.js` are untouched (12 export names stable). 9 new test files, 9 source files touched/created, 31 tasks.

## Technical Context

**Language/Version**: JavaScript, ES modules (`"type": "module"`), Node ≥ 20.

**Primary Dependencies**: zero runtime dependencies (package.json devDependencies only; vitest ^4.1.8, jsdom ^29.1.1 already declared).

**Storage**: N/A (pure in-memory string helpers + one runtime-global `the` state; no persistence).

**Testing**: vitest `environment: "jsdom"` (already configured in `vitest.config.js` — no edits); gate `pnpm --filter @project-reborn/director test`.

**Target Platform**: Browser (worker) runtime + Node test environment; platform-neutral pure helpers.

**Project Type**: library package (workspace member `@project-reborn/director`).

**Performance Goals**: negligible — O(n) splits for scans; the game's `repeat`/scan loops are fine.

**Constraints**:
- The 12 export names from `src/engine/syntax/index.js` are final (002 stabilization) — 005 changes no export names and adds no new exported name; `chunk-split.js` is internal.
- No `#` private fields, no static members (package AGENTS.md); internal selector state uses non-enumerable metadata on `ChunkBound`.
- No package-local test shims; jsdom only.
- Public `the` surface strictly per the doc-derived property table (FR-013); zero properties outside the table or an approved clarify note.
- No edits to `engine/core/*` (002/003-owned, verbatim JSDoc) — System/script props the core lacks live in the proxy's local backing.
- Translation of Lingo→JS is out of scope (spec Assumptions).

**Scale/Scope**: 9 source files + 9 new test files; `index.js`/`api/index.js` verified unchanged; 31 tasks.

## Constitution Check

*GATE: passed before Phase 0 research; re-checked after Phase 1 design.* Checked against ratified v2.0.0. **PASS — no violations, gates genuinely met:**

- **I. Defined Before Built**: every behavior is defined by spec 005 (C1–C9, FR-001–FR-016) or this plan's explicitly-recorded research decisions (R1–R5).
- **II. No Silent Interpretation**: all ambiguous doc points were resolved in clarify (C1–C9); the remaining doc-silent values (`randomSeed` default, `maxInteger` value, `start<1` behavior) are explicitly decided and anchored (R1/R3); the `ChunkBound` put-target mechanism is an explicitly recorded interpretation of the C1/C2 contract shape, not a runtime guess; the `.char[]` member-form boundary and mutation-by-reference game-file divergence are recorded as out-of-scope notes.
- **III. Specification-Driven Development**: artifacts under `specs/005-engine-syntax/` (spec, plan, research, data-model, contract, quickstart, tasks).
- **IV. Test & Verification Discipline**: red-green mandated by FR-015; research R4 defines observable red legs against the current code; gate = `pnpm --filter @project-reborn/director test`; no orphaned tests (syntax tests were deleted in 002 per its spec and are rebuilt fresh here).
- **V. KISS**: port-don't-reinvent (R1/R5); word/line delimiters removed — complexity removed; one internal splitter with two real consumers; the data-driven `the` table replaces an 874-line switch (~4× smaller).
- **VI. YAGNI**: no speculative `the` properties — every row has a doc anchor, a game-usage anchor, or an approved clarify note; `numberOfSounds`/`machineType`/`wordDelimiter`/`lineDelimiter` removed (no anchor, zero game use); the "game > director docs" rule (C9) is bounded by game evidence.
- **VII. SOLID**: one module per construct; selectors/put/splitter/the-proxy each have a single reason to change; the property table is a data/behavior separation.

**Complexity Tracking**: No violations; the mechanisms (one internal splitter; `ChunkBound`; the table) are required by the contract/tests, not added generality. Table intentionally left empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-engine-syntax/
├── plan.md              # This file
├── research.md          # Phase 0 output (R1–R5)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/syntax-lingo.md  # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (packages/director)

```text
src/engine/syntax/
├── index.js             # NO CHANGE — 12 export names final (api/index.js re-export unchanged)
├── char.js              # REWRITE: chained selector char(n).of(str)/char(a).to(b).of(str) + ChunkBound
├── item.js              # REWRITE: chained selector; live itemDelimiter (C3); drop positional delimiter arg
├── line.js              # REWRITE: CR-only split ("\r"); remove lineDelimiter read (C8)
├── word.js              # REWRITE: whitespace-class split /[ \t\r\n]/; remove wordDelimiter read (C8)
├── chunk-split.js       # NEW (internal, NOT exported): splitChars/splitItems/splitLines/splitWords
├── put-after.js         # REWRITE: putAfter(chunkTarget, value) return new string
├── put-before.js        # REWRITE: putBefore(chunkTarget, value)
├── put-into.js          # REWRITE: putInto(chunkTarget, value)
├── the-proxy.js         # REWRITE: property-table proxy (exported `the`; NO globalThis self-install — player registers globals in 008) + alias map + function forms + C5/C6
└── __tests__/           # NEW (9 files): char/item/line/word/put-after/put-before/put-into/the-proxy/surface
src/api/index.js         # NO CHANGE — already `export * from "../engine/syntax/index.js"`
```

**Structure Decision**: co-located `__tests__/` per the package convention and the existing vitest include pattern; only the syntax layer is touched; `api/index.js` and `engine/core/*` remain untouched.

## Complexity Tracking

No constitution violations (see Constitution Check). Table intentionally left empty.