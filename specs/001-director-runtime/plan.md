# Implementation Plan: Director Runtime

**Branch**: `001-director-runtime` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-director-runtime/spec.md`

## Summary

Build a 1:1 JavaScript implementation of the Macromedia Director MX 2004 Lingo runtime as the `@project-reborn/director` package (existing scaffold under `packages/director/`). The runtime provides Director data-types (Color, List, PropList, Point, Rect), a `DirectorContext` plus shared subsystems binding singletons to a per-movie worker's `globalThis`, thirteen core objects and four scripting objects, eight included media-type `Member` subclasses with JS-native media backends (Web Audio, CanvasDecode, palette/cursor/font decode), the public Lingo API (top-level methods + singletons) exported from `@/lingo`, a builder-pattern packaging system (movie/cast/member definitions, inline typed-array media payloads), an imperative runtime entry (`@/browser`) owning one `Worker` per movie with a timer-driven event loop and a main-thread control handle, and `<x-object>`/`<x-embed>`/`<x-param>` custom elements that host an `OffscreenCanvas`-transferred render surface and forward input via messages. Out of scope: Lingo→JS translation, binary `.dcr/.dir/.cct/.cst` formats, Score sprite-placement data, MIAW sibling-movie execution.

## Technical Context

**Language/Version**: JavaScript (ES modules), Node ≥ 20 for tests; browsers with ES modules + Web Components + `OffscreenCanvas` + Web Audio (`AudioContext` in workers) + `Worker` + `fetch`.

**Primary Dependencies**: `vitest` (dev, tests), `jsdom` (dev, DOM fixtures). No runtime production deps — JS-native browser APIs only (`AudioContext`, `OffscreenCanvas`, `Worker`, `postMessage`, `EventTarget`, `CustomEvent`, `crypto`, `fetch`, dynamic `import()`). Existing `@project-reborn/director` scaffold is reference/current state.

**Storage**: None persisted. Per-movie state lives in the worker's `DirectorContext` (in-memory); bundles are ES modules loaded by dynamic `import()`.

**Testing**: `vitest` + `jsdom`. Unit tests per file under `__tests__/`; integration tests via the imperative API in `src/__tests__/` and DOM fixtures via `jsdom` + custom-element registration for `<x-object>`/`<x-embed>`/`<x-param>`. Worker behavior tested via `vitest` with `jsdom`/`@edge-runtime/vm` or `tinypool` worker shims (TBD in research.md — workers require `import()` + `OffscreenCanvas` which jsdom lacks; integration strategy resolved Phase 0).

**Target Platform**: Modern browsers (Chrome/Edge/Firefox/Safari latest 2 versions). No legacy NPAPI/ActiveX.

**Project Type**: Library (workspace package `@project-reborn/director`, subpaths `@/lingo` + `@/browser`).

**Performance Goals**: Movie event loop stable at authored tempo (e.g., 30 FPS default, 60 FPS achievable); single-worker decode + render within one frame budget at authored tempo; member-registry lookups O(1) by name and by number per castLib; net operations async, non-blocking the loop.

**Constraints**: Workers-only isolation (one movie per worker; no main-thread singleton slot-swapping); bundled media must be inline typed arrays/strings (no URL media refs); no `#` private fields on documented properties; no undocumented static methods/registries attached to classes; the Director MX 2004 docs are the authoritative 1:1 reference (no fabricated behavior).

**Scale/Scope**: Per the docs — 5 data-types, 13 core objects, 4 scripting objects, ~130 top-level Lingo methods, 19 `Member` subclasses (8 included full + 11 excluded stubs), 1 packaging builder API, 1 imperative entry, 3 custom elements. v1 supports one mounted movie at a time per element/handle; multiple concurrent movies via multiple elements/handles (each its own worker).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is the unfilled template (placeholder values `[PRINCIPLE_N_NAME]`, `[SECTION_N_CONTENT]`). No project-specific principles or governance have been ratified yet. Per speckit integration, an unfilled constitution provides **no enforced gates** to evaluate against. The plan therefore has **no Constitution Check violations** — every gate is vacuously satisfied — and no `## Complexity Tracking` entries are required.

The aspirational placeholders (Library-First, CLI Interface, Test-First, Observability, Versioning, Simplicity) implicitly align with the existing `packages/director/` project conventions and the spec's own assumptions (1:1 docs-faithful, public-property-first, JS-native backends). If/when the constitution is ratified, this gate MUST be re-evaluated; relevant pending items to track:
- *Test-First*: the package already uses `vitest`/`jsdom`; `__tests__/` co-located per file is the convention — honor it.
- *Simplicity / no fabricated behavior*: matches FR-014 (no undocumented behavior) and FR-005/FR-011 (no undocumented statics/subsystems on classes).
- *Library-First*: the package is library-shaped (`@/lingo` + `@/browser` subpaths), exposing functionality via ES module imports rather than CLI. The "CLI Interface" placeholder does NOT apply at feature scope; it's a workspace-level concern outside this feature.

**Verdict**: PASS (vacuous — unfilled constitution). Re-check after Phase 1 (also vacuous unless the file is edited mid-flight).

## Project Structure

### Documentation (this feature)

```text
specs/001-director-runtime/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── lingo-public-api.md      # @/lingo surface (types, objects, singletons, top-level methods)
│   ├── packaging-builders.md   # movie/cast/member builder DSL + bundle ES module contract
│   ├── imperative-runtime.md   # @/browser imperative run() + handle + main-thread↔worker protocol
│   └── custom-elements.md      # <x-object>/<x-embed>/<x-param> behavior + attributes
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/director/
├── package.json
├── vitest.config.js
└── src/
    ├── index.js                  # re-exports @/lingo + @/browser (root surface)
    ├── lingo/
    │   └── index.js              # public Director API: singletons, constants, types, top-level methods
    ├── browser/
    │   └── index.js              # packaging builders, imperative run(), custom elements
    └── runtime/
        ├── index.js              # internal barrel for runtime surface
        ├── context.js            # DirectorContext (worker-side EventTarget, activate() installs on globalThis)
        ├── singletons.js         # _movie/_player/_sound/_key/_mouse/_system/_global live slots (worker globalThis aliases)
        ├── constants.js          # documented constants (Chapter 9)
        ├── types/                # data-types: color, list, prop-list, point, rect (+ __tests__)
        ├── objects/              # core + scripting objects (X...Object) (+ media/ + __tests__)
        │   ├── media/            # X...Member subclasses (+ __tests__)
        │   ├── cast-library.js … window.js
        │   ├── fileio.js netlingo.js speech-xtra.js xml-parser.js
        │   └── member.js         # base MemberObject
        ├── methods/              # ~130 top-level Lingo methods (+ __tests__): net ops use fetch()
        ├── syntax/               # chunk/put/the stand-ins (+ __tests__)
        ├── package/              # builder DSL: movie(), cast(), member-registration helpers (+ __tests__)
        ├── player/
        │   ├── event-loop.js     # timer-driven (setTimeout) tick at tempo; dispatches lifecycle events on DirectorContext (FR-037)
        │   ├── canvas.js         # OffscreenCanvas host-side node + transferToImageBitmap wiring
        │   ├── worker-host.js    # main-thread Worker owner + message protocol
        │   ├── worker-shim.js    # bootstrap installed on worker globalThis before bundle import (FR-027)
        │   ├── script-lifecycle.js
        │   ├── cast-loader.js    # ingest movie definition → live CastLib/Member subsystems
        │   └── custom-elements/  # <x-object>, <x-embed>, <x-param> definitions (+ __tests__)
        └── subsystems/           # NEW: documented shared subsystems (member-registry, net-state, audio-graph) — no class statics
            └── member-registry.js
```

**Structure Decision**: Extend the existing `packages/director/src/` layout (already structured as `runtime/{types,objects,methods,syntax,package,player}` + `lingo/` + `browser/`). One new folder is introduced: `runtime/subsystems/` — the documented shared subsystems (FR-004/FR-025/FR-006) for cross-class concerns (member registry, net state, audio graph). This keeps subsystems out of individual core-object classes (per FR-005) while staying inside the existing `runtime/` tree. No root-level `src/`/`tests/` split — tests stay co-located in `__tests__/` next to each file (matches the existing convention visible across `runtime/methods/__tests__/`, `runtime/objects/__tests__/`, etc.).

## Complexity Tracking

> **Not filled** — Constitution Check has no violations to justify (unfilled constitution).