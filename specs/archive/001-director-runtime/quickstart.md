# Quickstart Validation: Director Runtime

Runnable validation scenarios that prove the v1 feature works end-to-end. Uses the project's existing tooling (`vitest`, `jsdom`, `pnpm`). No real browser required for unit/integration tests (research.md R1: workers/`OffscreenCanvas`/`AudioContext` shims).

## Prerequisites
- Node ≥ 20; pnpm ≥ 10.
- Workstation in repo root: `pnpm install` (was already run for the workspace per AGENTS.md).
- The `@project-reborn/director` package exists at `packages/director/` with `vitest` + `jsdom` devDeps (already declared in its `package.json`).

## Setup commands
```bash
cd packages/director
pnpm install        # workspace-managed; idempotent
```

## Test command
```bash
pnpm --filter @project-reborn/director test
# or, cd packages/director && pnpm test
# underlying: vitest run
```

## Expected outcomes (which proves the feature works)

### Scenario 1 — Data-types surface 1:1 (P1)
**File**: `src/runtime/types/__tests__/*.test.js`
`import { Color, List, PropList, Point, Rect } from "@project-reborn/director/lingo"` — each data-type constructs and exposes the documented properties/methods/operators per the Director MX 2004 docs. Asserts SC-001.

### Scenario 2 — Context isolation + singleton slot binding (P2)
**File**: `src/runtime/__tests__/context.test.js` (already exists)
`new DirectorContext()`, `activate()` against a test `globalThis` sandbox → `_movie`/`_player`/etc. slots reflect this context's instances. Two contexts activated in two `vm.createContext()`-style sandboxes → zero cross-leak of singletons or `MemberRegistry`. Asserts SC-002 and FR-003/FR-025.

### Scenario 3 — Core & scripting objects surface (P3)
**Files**: `src/runtime/objects/__tests__/*.test.js` (per object)
Each `X...Object` and scripting object (`Fileio`/`NetLingo`/`SpeechXtra`/`XMLParser`) imports from `@/lingo` and asserts its documented properties/methods per the docs. `Sprite`/`SpriteChannel` Score-dependent surface returns documented no-op/empty values (FR-007/FR-031). `Window.openMovie` returns documented no-op (FR-036). Asserts SC-003.

### Scenario 4 — Member subclasses (P4)
**Files**: `src/runtime/objects/media/__tests__/*.test.js`
8 included `X...Member` subclasses pass their inline payloads through JS-native decoders (`SoundMember` → `AudioContext.decodeAudioData` mock; `BitmapMember` → `createImageBitmap` mock; `FieldMember`/`TextMember`/`FontMember`/`ColorPaletteMember`/`CursorMember`/`ButtonMember` per their documented surface). 11 excluded subclasses are stubs extending `MemberObject` with no media-specific behavior (FR-012). Asserts SC-004/SC-005.

### Scenario 5 — Public API + singletons (P5)
**File**: `src/lingo/__tests__/public-api.test.js`
`src/lingo/index.js` exports exactly the documented methods and singletons; no undocumented method or singleton is exported. Each singleton resolves to the active context's instance (live binding changes after `activate()` of a fresh context). Asserts SC-006 and the strict output requirement.

### Scenario 6 — Packaging builders (P6)
**Files**: `src/runtime/package/__tests__/*.test.js` (creators tests exist)
`movie(name).cast(cast(name).field("Intro", { text: "Welcome" }).build()).build()` returns a frozen `MovieDefinition`. Member numbers are assigned sequentially (1, 2, …) by registration order; gaps compacted. Two built definitions are independent. Refer [packaging-builders.md](./contracts/packaging-builders.md). Asserts SC-009 / FR-017/FR-018.

### Scenario 7 — Imperative runtime end-to-end (P7)
**Files**: `src/runtime/player/__tests__/*.test.js` (event-loop, cast-loader, script-lifecycle exist)
With `vi.useFakeTimers()` and the mocked `Worker` shim:
1. `import { run } from "@project-reborn/director/browser"`; `run(movieDefinition)` returns a `MainThreadImperativeHandle` (`EventTarget`).
2. `handle.start()` → the worker shim ingests the definition; `DirectorContext.activate()` installs singletons; cast-loader populates `MemberRegistry`; event loop (`setTimeout@1000/tempo`) fires lifecycle events in the documented order (`prepareMovie → startMovie → (prepareFrame → enterFrame → beginSprite → endSprite → exitFrame)ⁿ → … → stopMovie` on destroy) — independent of Score data (FR-037).
3. `handle.destroy()` → `stopMovie` dispatched; `AudioContext.close()`; main thread calls `worker.terminate()`; `handle.destroyed === true` (FR-021).
4. `externalEvent(name, args)` from the worker → `handle` dispatches `CustomEvent("externalEvent", {detail:{name,args}})` on itself (FR-035).
Refer [imperative-runtime.md](./contracts/imperative-runtime.md). Asserts SC-010.

### Scenario 8 — Custom elements (P8)
**Files**: `src/runtime/player/custom-elements/__tests__/*.test.js` (exist)
With `jsdom` (`customElements.define` available) and shims for `OffscreenCanvas`/`Worker`:
1. `customElements.define("x-object", …)` and friends; mount `<x-object src="…"><x-param name="wmode" value="opaque"></x-object>`.
2. `connectedCallback`: child `<canvas>` inserted; `transferControlToOffscreen()` called (mocked); `run(src, {canvas, externalParams})` returns a handle; `externalEvent` on the handle re-dispatches on the element.
3. Input events dispatched on the element are forwarded via the mocked `Worker.postMessage` to the worker (feeding `_key`/`_mouse`).
4. `disconnectedCallback` calls `handle.destroy()`.
5. Exact-same bundle produces identical activated singletons/castLibs/members via the imperative path (SC-010).
Refer [custom-elements.md](./contracts/custom-elements.md).

## Notes
- No full implementation code, model bodies, or migration scripts belong here — only the run/validation guide. Tasks and implementation bodies live in `tasks.md` (Phase 2 `/speckit.tasks`) and the implementation phase.
- For worker-only API surfaces (`OffscreenCanvas`, `AudioContext`, `Worker`), tests use shims per research.md R1 — a real-browser smoke test is deferred to the JS client integration (`apps/client`); out of scope for this package's plan.