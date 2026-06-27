## MODIFIED Requirements

### Requirement: director-runtime SHALL be the private low-level host-integration layer

`director-runtime` SHALL be the private internal layer under `packages/director/src/runtime/` that wraps host (browser) APIs and exposes primitives consumed by `director-core`, `director-syntax`, and `director-browser`. It SHALL NOT be exported as a public subpath.

At refactor state (this change), it SHALL hold the following files (as moved or kept by this refactor):
- `event-loop.js` — frame-based event loop driven by `requestAnimationFrame`
- `script-lifecycle.js` — dispatchers for `prepareMovie`, `startMovie`, `stopMovie`, `prepareFrame`, `enterFrame`, `exitFrame`, and the `LIFECYCLE_EVENTS` list
- `canvas.js` — canvas 2D context wrappers (`setCanvas`, `getCanvas`, `getContext`, `updateStage`, `resizeCanvas`, `setBackgroundColor`, `getStageSize`, `resetCanvas`, `_setCanvas`)
- `cast-loader.js` — low-level cast library fetch from a URL
- `index.js` — slimmed; re-exports the above. Does NOT re-export custom-elements primitives (those moved to `director-browser`).

It SHALL NOT host custom-elements registration or movie/cast registration helpers (those live in `director-browser`).

It SHALL NOT host Director value data types (`List`, `PropList`, `Point`, `Rect`, `Color`); those are owned by `director-core` under `src/core/`.

This refactor change locks the layer role and the `_setCanvas` / `startEventLoop` / `stopEventLoop` consumer contract used by `src/browser/custom-elements.js`. Concrete event-loop cadence, canvas rendering behaviour, script-lifecycle semantics are described at high level here; future lifecycle follow-up changes extend this requirement with their own deltas.

**Package**: `packages/director/`
**Source**: `packages/director/src/runtime/`
**Reference**: `docs/drmx2004_scripting_ref/` (`events_and_messages.txt` for lifecycle event list).

#### Scenario: Runtime is not a public export
- **WHEN** `packages/director/package.json` `exports` is inspected after this refactor
- **THEN** `./runtime` is absent

#### Scenario: Custom elements are not in runtime after refactor
- **WHEN** `packages/director/src/runtime/` is inspected after this refactor
- **THEN** the directory does not contain `custom-elements.js`; it has moved to `packages/director/src/browser/custom-elements.js`

#### Scenario: Runtime keeps host-API wrappers
- **WHEN** `packages/director/src/runtime/` is inspected after this refactor
- **THEN** it still contains `event-loop.js`, `script-lifecycle.js`, `canvas.js`, `cast-loader.js`, `index.js`, plus the existing `__tests__/` for those (with `custom-elements.test.js` removed if it was a runtime test, moved to `src/browser/__tests__/`)

#### Scenario: Runtime index re-exports slim down
- **WHEN** `packages/director/src/runtime/index.js` is inspected after this refactor
- **THEN** it re-exports `startEventLoop`, `stopEventLoop`, `setTempo`, `isEventLoopRunning` from `./event-loop.js`; `loadCast` from `./cast-loader.js`; `dispatchPrepareMovie`, `dispatchStartMovie`, `dispatchStopMovie`, `dispatchPrepareFrame`, `dispatchEnterFrame`, `dispatchExitFrame`, `dispatchAll`, `LIFECYCLE_EVENTS` from `./script-lifecycle.js`; and the canvas primitives listed above from `./canvas.js`. It does NOT re-export `registerCustomElements` or `_createMovie`.

#### Scenario: Value data types are not in runtime
- **WHEN** `packages/director/src/runtime/` is inspected
- **THEN** `list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` are NOT present; they live in `packages/director/src/core/`

## REMOVED Requirements

### Requirement: director-runtime SHALL host Director value data types after the follow-up move (transition state)

**Reason**: `director-runtime` does not host Director value data types. They are owned permanently by `director-core` (see the `director-core` delta for this same change). The `director-runtime-value-types` follow-up move referenced by this requirement is cancelled — it will not happen.

**Migration**: None. The value-type files already live in `packages/director/src/core/` and stay there. No consumer of `director-runtime` imported them; no code change is required.