# Implementation Plan: Director Engine Base

**Branch**: `002-engine-base` | **Date**: 2026-08-31 | **Spec**: [/specs/002-engine-base/spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-engine-base/spec.md`

## Summary

Build the engine-base layer of `@project-reborn/director`: the five Director
MX 2004 data-types (`Color`, `List`, `PropList`, `Point`, `Rect`) exposing
exactly their documented member surface and behavior, plus the eleven Lingo
constants with doc-conformant values; stabilize the package's three public entry
points after the bad refactor (folders renamed to the layer taxonomy per user
directive, then minimal import-path repair against that layout); and delete the
132 stale tests + `src/__test-shims__/`,
rebuilding coverage per-spec under red-green with vitest/jsdom only. Approach
(research.md): port-with-fixes on `src/engine/base/*` (List/PropList proxy and
sentinel corrections, Color undocumented-member removal, typed sort comparator),
one constant value fix (`BACKSPACE` → chr(8)), mechanical import repair across 8
barrel/glue files + 35 method files, and 7 fresh test files.

## Technical Context

**Language/Version**: JavaScript, ES modules (`"type": "module"`), Node ≥ 20.

**Primary Dependencies**: zero runtime dependencies (verified `package.json`
devDependencies only). Dev: `vitest ^4.1.8`, `jsdom ^29.1.1` (already declared).

**Storage**: N/A (pure in-memory data types; no persistence).

**Testing**: vitest with `environment: "jsdom"` (already configured in
`vitest.config.js`); gate `pnpm --filter @project-reborn/director test`.

**Target Platform**: Browser (worker) runtime + Node test environment; the
data types and constants are platform-neutral.

**Project Type**: library package (workspace member, `@project-reborn/director`).

**Performance Goals**: negligible for these types — O(n) linear-list operations
(scan-based lookup per the docs' command semantics) are fine; no optimization
work.

**Constraints**:
- No `#` private field syntax; no `static` members of any kind; one class per
  module; one JSDoc block per documented member quoted VERBATIM from
  `docs/drmx2004_scripting_ref/` (package AGENTS.md rules 1–6; FR-013/FR-014).
- No package-local test shims; browser-like behavior in tests only from jsdom.
- Public member surface strictly per the 002 spec enumerations (FR-004) — no
  invented convenience members (Color `hex`/`rgb`/`equals` removed).
- Constants values per Lingo character semantics (research.md R2).

**Scale/Scope**: 5 data-type classes, 11 constants, 3 public barrels; 42 source
files with broken imports repaired; 132 test files + 4 shim files deleted;
7 new test files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Checked against the ratified v2.0.0 constitution (`.specify/memory/constitution.md`,
2026-08-29). **PASS — no violations, gates genuinely met:**

- **I. Defined Before Built**: every behavior in scope is defined by the 002
  spec (documented member surfaces, acceptance scenarios, edge cases) or by
  this plan's explicitly-recorded decisions (D-1…D-4 below); nothing is built
  that was not defined first.
- **II. No Silent Interpretation**: the constants keyCode/character ambiguity was
  surfaced in the clarify session and resolved here (research.md R2);
  doc-silent points (setAt filler value, deleteAt absent-position behavior,
  getLast-on-empty sentinel, findPosNear algorithm) are surfaced as explicit
  plan decisions D-2…D-4, all authorized by the spec's Edge Cases; the
  Surfaced-and-Not-Implemented list (JS rect arithmetic, palette-index color,
  `symbol()`/`value()`/`ilk()` type relationship) is documented with deferral
  reasons (no guessing at runtime).
- **III. Specification-Driven Development**: artifacts under
  `specs/002-engine-base/` (this plan + research + data-model + contract +
  quickstart); refactor documents the patterns removed (stale import paths,
  dangling exports, dead scaffold trees) and the target state (the layer
  taxonomy, per the 2026-08-31 user-directive amendment).
- **IV. Test & Verification Discipline**: red-green flow defined (research.md
  R4); the 132 stale tests are deleted per FR-009 (spec-ordered — the
  refactor-do-not-orphan rule is satisfied because deletion is the spec's
  explicit requirement and coverage is rebuilt fresh in the same feature);
  gate = `pnpm --filter @project-reborn/director test`.
- **V. KISS**: port-don't-rewrite for all five types; repairs are mechanical
  path fixes; no wrappers, no factories, no base classes.
- **VI. YAGNI**: creators `color()/list()/point()/propList()/rect()` deferred
  to 006 (not exported, modules dormant with fixed imports); no speculative
  abstractions; the obsolete internal `runtime/index.js` barrel is deleted
  (superseded by `api/index.js`).
- **VII. SOLID**: one class per module (S); data types are closed, extension
  flows through spec pipeline (O); no static state (D inverts to the classes
  owning their storage).

Recorded plan decisions (spec-authorized Edge Cases, not constitution
violations):
- **D-1** — Implementation storage fields (`List.items`, `List.sorted`,
  `PropList.entries`, `PropList.sorted`, `Color._red/_green/_blue`) remain
  plain public fields (AGENTS.md rule 3 bans `#`); they are itemized in the
  contract's member tables with explicit "implementation field" status so the
  FR-004 surface audit is mechanical instead of silent.
- **D-2** — `List.setAt` beyond the end pads with `0` (spec Edge Cases:
  "linear-list blank-padding on setAt"; docs say "expands the list's blank
  entries" without naming the filler — methods.txt 15740–15742).
- **D-3** — `List.deleteAt` with position < 1 or > count is a no-op; `getLast()`
  on an empty list returns VOID (`null`). Spec Edge Cases authorize "no-op or
  doc-defined error" for absent-position deletion; getLast-on-empty is
  doc-silent and uses the docs' VOID no-value sentinel.
- **D-4** — `PropList.findPosNear` finds the nearest entry by alphanumeric
  (sort) order — the classic Director binary-search-insertion semantics; the
  doc phrase "most similar alphanumeric name" (methods.txt 4636–4639) with the
  `#Ni → 1` example (4646–4649) passes; the current Levenshtein implementation
  is dropped (invented, not documented).

## Project Structure

### Documentation (this feature)

```text
specs/002-engine-base/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── library-lingo-api.md   # Phase 1 output — @/lingo 002 export contract
└── tasks.md             # Phase 2 output (NOT created by this plan)
```

### Source Code (packages/director)

> **Amendment 2026-08-31 (user directive)**: source folders are renamed to the
> layer taxonomy (base/core/subsystem/syntax/api/player/pack/browser) so folders
> reflect where they belong. This supersedes the earlier "no file moves" and "no
> package.json change" statements below; the only `package.json` change is the
> `./lingo` export target (`src/lingo/index.js` → `src/api/index.js`).

Target layout = layer taxonomy (research.md R3).

```text
packages/director/
├── package.json                     # CHANGE: ./lingo export → ./src/api/index.js (only change)
├── vitest.config.js                 # FIX: remove setupFiles (shims deleted); jsdom stays
├── AGENTS.md                        # DOCS: Architecture rewritten to layer taxonomy (done in Block A0)
├── src/
│   ├── __test-shims__/              # DELETE (4 files: index, worker-shim,
│   │                                #   audio-context-shim, offscreen-canvas-shim)
│   ├── __tests__/public-barrels.test.js      # DELETE (stale; coverage re-expressed)
│   ├── __tests__/entry-points.test.js        # NEW (3 entry imports + surface, FR-007/SC-004)
│   ├── index.js                     # CHANGE: re-exports ./api/index.js (Block A0)
│   ├── api/                         # ← src/lingo (moved in Block A0)
│   │   ├── index.js                 # FIX: 107 ../runtime/methods/X → ./methods/X;
│   │   │                            #   ../runtime/{constants,syntax,singletons} →
│   │   │                            #   ../engine/{base,syntax,subsystem}/…;
│   │   │                            #   ../engine/types/* → ../engine/base/*;
│   │   │                            #   REMOVE 5 creator exports (color, list, point,
│   │   │                            #   propList, rect) → deferred to 006;
│   │   │                            #   ADD 5 class exports from ../engine/base/*.js
│   │   └── methods/                 # FIX (35 files): ../singletons.js →
│   │       │                        #   ../../engine/subsystem/singletons.js (24 files);
│   │       │                        #   ../types/X → ../../engine/base/X (10 files);
│   │       │                        #   ilk.js: 5 types + 7 objects paths → ../../engine/{base,core}/…
│   │       ├── alert.js … stopEvent.js   # (see research.md R3 table for the 35)
│   │       ├── color|list|point|propList|rect.js  # imports fixed; modules dormant for 006
│   │       └── __tests__/           # DELETE (106 test files)
│   ├── engine/
│   │   ├── base/                    # ← src/engine/types (+ runtime/constants.js)
│   │   │   ├── constants.js         # FIX: BACKSPACE = String.fromCharCode(8) ("\b")
│   │   │   ├── color.js             # FIX: remove hex/rgb/equals + toHex2 + JSDoc
│   │   │   ├── list.js              # FIX: typed sort comparator; getAt/`[]` read throws
│   │   │   │                        #   out-of-range; deleteAt no-op; getLast → VOID
│   │   │   ├── prop-list.js         # FIX: proxy get (string+symbol keys; missing read
│   │   │   │                        #   throws); getaProp/findPos → VOID(null); setAt
│   │   │   │                        #   beyond → throw; findPosNear → sort-order nearest
│   │   │   ├── point.js             # NO CHANGE
│   │   │   ├── rect.js              # NO CHANGE
│   │   │   └── __tests__/           # DELETE 5 stale files → NEW 6 files (color, list,
│   │   │                            #   prop-list, point, rect, constants)
│   │   ├── core/                    # ← src/engine/objects
│   │   │   ├── index.js             # FIX: 5 × ../types/X → ../base/X
│   │   │   ├── *.js                 # 13 core + 4 scripting objects (NO CHANGE)
│   │   │   └── media/               # member subclasses (NO CHANGE)
│   │   ├── subsystem/               # ← src/runtime/{subsystems,context,singletons}
│   │   │   ├── context.js           # FIX: 7 × ./objects/X → ../core/X
│   │   │   ├── singletons.js        # FIX: 7 × ./objects/X → ../core/X
│   │   │   ├── member-registry.js, net-state.js, window-registry.js   # NO CHANGE
│   │   │   └── __tests__/           # DELETE (3 stale test files)
│   │   ├── syntax/                  # ← src/runtime/syntax
│   │   │   ├── the-proxy.js         # FIX: ../objects/cast-library.js → ../core/cast-library.js
│   │   │   └── …                    # chunk helpers (NO CHANGE); __tests__/ DELETE (8)
│   │   └── packaging/               # DELETE (2 stale stub files, zero importers)
│   ├── player/                      # ← src/runtime/player (minus custom-elements)
│   │   ├── worker-shim.js           # FIX: ../context.js → ../engine/subsystem/context.js
│   │   ├── cast-loader.js           # FIX: ../objects/cast-library.js → ../engine/core/cast-library.js
│   │   ├── worker-host.js, event-loop.js, canvas.js, script-lifecycle.js, mount.js
│   │   │                           # NO CHANGE (+ resolver pass for any stale imports)
│   │   └── __tests__/               # DELETE (4 stale test files)
│   ├── pack/                        # ← src/runtime/package
│   │   ├── movie.js, cast.js        # NO CHANGE (builders)
│   │   └── __tests__/               # DELETE (1 stale test file)
│   └── browser/
│       ├── index.js                 # FIX: creators → ../pack/{movie,cast}.js;
│       │                            #   REMOVE dangling defineMovie/defineCast exports
│       └── custom-elements/         # ← src/runtime/player/custom-elements (NO CHANGE)
│           └── __tests__/           # DELETE (1 stale test file)
└── architecture/                    # DELETE (4 dead scaffold files, zero importers)
```

**Structure Decision**: the layer taxonomy is final (research.md R3, amendment
2026-08-31); this feature moves folders to that taxonomy (Block A0), repairs
imports against it, fixes values/semantics in place, and deletes stale or dead
trees (`engine/packaging/`, `architecture/` — both unreferenced, verified by
full-repo grep; `src/runtime/` remnant `__tests__/`) plus the spec-ordered
test/shims deletion. Test files are co-located `__tests__/` per package
convention and the existing vitest `include` pattern — no test-dir relocation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations (see Constitution Check). The only plan-level
decisions (D-1…D-4) are spec-authorized behavior resolutions, not added
complexity, and are recorded in the decision log. Table intentionally left
empty.