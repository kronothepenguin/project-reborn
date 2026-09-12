# Contract: Imperative Runtime (FR-019/FR-021/FR-028/FR-035/FR-037)

The imperative runtime API lives in `runtime/player/` (worker-host, event-loop, worker-shim, cast-loader, script-lifecycle) and is exported from `@/browser` (FR-022). The custom elements ([custom-elements.md](./custom-elements.md)) are a thin layer running the same imperative path.

## Public entry — `run()` (main thread)

```ts
run(input: string | MovieDefinition, options?: { canvas?: HTMLCanvasElement, externalParams?: {name;value}[] }): MainThreadImperativeHandle
```
- `input`: an ES module URL (`string`) — loaded inside the worker via dynamic `import()` (FR-026) — OR an inline `MovieDefinition` (forwarded to the worker as the ingest payload).
- `options.canvas`: optional host canvas (used by the declarative path; the custom element passes its own). If absent, the handle exposes no render surface.
- `options.externalParams`: optional bootstrap params (declarative path passes collected `<x-param>`s; imperative path passes caller-supplied params).
- Runs on the main thread; spawns a dedicated `Worker` for the movie (FR-019). The main thread creates and owns the worker.

## `MainThreadImperativeHandle` (return of `run()`) — `extends EventTarget`
- `start(): void` — posts `{ kind: "start" }`; worker activates context, runs ingest, starts event loop, dispatches `prepareMovie`/`startMovie`, then per-tick lifecycle events (FR-037).
- `stop(): void` — posts `{ kind: "stop" }`; worker halts the event loop but does NOT destroy the context (resumable).
- `destroy(): void` — posts `{ kind: "destroy" }`; worker dispatches `stopMovie`, closes `AudioContext`, tears down the context; main thread calls `worker.terminate()` and releases the `OffscreenCanvas`/`canvas` (FR-021). Idempotent.
- `goToFrame(n): void` — stubbed (no Score in v1, FR-031); posts `{ kind:"goToFrame", n }`; worker no-ops with documented behavior.
- `getLifecycleSnapshot(): Promise<*>` — single-shot poll for host-side lifecycle observation (FR-028: workers dispatch on `DirectorContext`, main thread polls via `postMessage`).
- Event: `externalEvent` (DOM `CustomEvent`, `detail: { name, args }`) — re-dispatched from worker `postMessage` `{ kind: "externalEvent", name, args }` (FR-035).
- Field `destroyed: boolean`.

### Main-thread ↔ worker message protocol (FR-019/FR-021/FR-028/FR-035)

| Direction | `kind` | Payload | Behavior |
| --------- | ------ | ------- | -------- |
| MT → W | `init` | `{ bundleUrl?\|MovieDefinition, externalParams, offscreenCanvas? }` | bootstrap the worker: worker-shim installs Director API on worker `globalThis`; worker loads bundle via dynamic `import()` if URL; ingest; activate DirectorContext |
| W → MT | `ready` | `{}` | worker ready to receive `start`/messages; handle flushes `pendingMessages` |
| W → MT | `error` | `{ message }` | `InvalidBundleError`, decode error, etc. — surfaced on the handle as a DOM `CustomEvent("error", { detail })` |
| W → MT | `lifecycle` | `{ event, data }` | (optional) periodic lifecycle snapshot for host polling (FR-028) |
| W → MT | `externalEvent` | `{ name, args }` | re-dispatched as `CustomEvent("externalEvent", {detail:{name,args}})` on the handle (imperative) — the declarative path re-dispatches on the element ([custom-elements.md](./custom-elements.md)) |
| W → MT | `gotoNetMovie` | `{ url }` | MT initiates loading a new bundle (per FR-033); new context/worker |
| W → MT | `gotoNetPage` | `{ url, target? }` | MT sets `location.href`/`window.open` (per FR-033) |
| MT → W | `start` | `{}` | begin event loop |
| MT → W | `stop` | `{}` | halt loop |
| MT → W | `destroy` | `{}` | teardown; then MT calls `worker.terminate()` |
| MT → W | `goToFrame` | `{ n }` | stubbed no-op (FR-031) |
| MT → W | `poll-lifecycle` | `{ since? }` | request lifecycle snapshot; W replies `lifecycle` |
| W ← MT | input forwarding (per [custom-elements.md](./custom-elements.md)) | `{ kind: "keydown"\|"keyup"\|"mousedown"\|"mouseup"\|"mousemove"\|"focus"\|"blur", … }` | feeds `_key`/`_mouse` singletons inside the worker (FR-030) |

## In-worker lifecycle (`DirectorContext` + event loop — FR-028/FR-037)
- `DirectorContext extends EventTarget`. Lifecycle events are `dispatchEvent(new CustomEvent(name, { detail }))` on the context — INSIDE the worker. The main thread does NOT receive them directly; host observation is via the `poll-lifecycle` message above (FR-028 final clarification).
- Per-tick order (FR-037, full implementation; Score-independent): `prepareFrame → enterFrame → beginSprite (per documented sprite) → endSprite (per documented sprite) → exitFrame`. Plus `on idle` when no input buffered on idle ticks; `on timeout` when `the timeout` threshold elapses. Movie-level: `prepareMovie`/`startMovie` fire once at start (before loop begins); `stopMovie` fires on destroy (after loop stops).
- Loop driver: `setTimeout`-re-arm at `1000 / tempo` ms; tempo is runtime-mutable (Director's `the frameTempo` is documented settable). Re-arm-on-tick allows tempo changes mid-playback.
- Score-deferral impact (FR-031): `prepareFrame`/`enterFrame`/`exitFrame`/`beginSprite`/`endSprite` still fire every tick (FR-037, post-clarification); they carry empty/no-op sprite data in v1. Stubs only apply to `go`/`goNext`/`goPrevious`/`goLoop` frame-navigation methods that REQUIRE Score data.

## Worker bootstrap (`runtime/player/worker-shim.js` — FR-027)
- Inside the worker, BEFORE any bundle is imported, install on worker `globalThis`:
  - All `@/lingo` exports (singletons live-bound, types, methods, constants) — per FR-016/FR-027.
  - `DirectorContext` constructor + `_installSingletons`/`activate` helper (so the bootstrap code in the worker can construct and activate a context before the bundle's scripts reference the singletons).
- Then: load the bundle via dynamic `import()` if a URL was supplied; otherwise use the inline `MovieDefinition`.
- Then: instantiate `DirectorContext`, run `cast-loader.js` ingest populating `MemberRegistry`, then `activate()` (writes singletons on `globalThis` + module slots — research.md R3).
- Then: optionally receive `OffscreenCanvas` via transfer (FR-029) and assign to `DirectorContext.canvas`.
- Then: post `ready` to main thread; main-thread handle flushes pending messages (e.g., a queued `start`).

## Net operations subsystem (`runtime/subsystems/net-state.js` — FR-033)
- Per-`DirectorContext` instance: `NetState`.
- Initiators (`getNetText`, `postNetText`, `preloadNetThing`, `downloadNetThing`, `gotoNetMovie`) call `fetch()` inside the worker, allocate a `netID`, return the `netID`, update status as the promise resolves/rejects. `netAbort(netID)` calls `AbortController.abort()`.
- Status/result accessors (`netDone`, `netError`, `netTextResult`, `netMIME`, `netLastModDate`, `getStreamStatus`) read `NetState` records by `netID`.
- `gotoNetMovie` posts `{kind:"gotoNetMovie", url}` to the MT (FR-033) — MT loads a new bundle (new context/worker; current context is torn down first per spec edge case).
- `gotoNetPage` posts `{kind:"gotoNetPage", url, target?}` to the MT — MT sets `location.href` or `window.open(url, target)`.

## externalEvent / externalParam bridge (FR-035)
- `externalEvent(name, ...args)` posts `{kind:"externalEvent", name, args}` from worker to MT.
- The MT handle dispatches `CustomEvent("externalEvent", { detail: { name, args } })` on itself (imperative path) — the declarative path dispatches on the `<x-object>`/`<x-embed>` element instead ([custom-elements.md](./custom-elements.md)).
- `externalParamName(i)`/`externalParamValue(i)` read from the frozen `externalParams: { name; value }[]` snapshot built at bootstrap from caller-supplied params (declarative: collected `<x-param>`s). Stored in the worker bootstrap config (FR-027). No DOM access from the worker.
- Edge case (spec): `<x-param>`s added/removed after connect are a stale snapshot — already flagged in spec Edge Cases.

## Testability
- Mount a movie via `run(definition)`; assert the returned handle's `EventTarget` lifecycle and `externalEvent` dispatch.
- `vi.useFakeTimers()` + the worker shim (research.md R1: mock `Worker` as in-process `EventTarget` mirroring `postMessage`/`onmessage`) to deterministically step the event loop and assert lifecycle order (FR-037) without a real browser.
- Per-context isolation: two `run()` calls yield two handles + two `Worker` mocks + two `DirectorContext`s; assert zero cross-leak of singletons / member registry / net state / audio graph (SC-002).