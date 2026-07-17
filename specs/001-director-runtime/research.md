# Phase 0 Research: Director Runtime

## Summary

The spec's clarifications resolved every architecture-critical decision; Technical Context flagged only one testing-infrastructure unknown (worker integration tests under `vitest`/`jsdom`). This research resolves it and captures best-practice patterns the design depends on.

---

## R1: Worker + `OffscreenCanvas` + `AudioContext` test strategy in `vitest`

**Decision**: Use `vitest`'s built-in `worker` support via `tinypool` (`vitest` ≥ 4 ships with `pool: "threads"` and experimental worker support; for in-worker code, run via `vitest` with `environment: "jsdom"` for DOM-side tests and a separate `environment: "node"` / `@edge-runtime/vm` suite for in-worker code). Mock `OffscreenCanvas`, `AudioContext`, `Worker`, and `postMessage` at the integration boundary.

**Rationale**: `jsdom` does NOT implement `OffscreenCanvas`, `AudioContext` (an `AudioContext` in a worker isn't available in jsdom), or `Worker`/`import()` semantics. Blocking tests on real browser infrastructure is flaky and slow. The Director runtime's in-worker modules can be unit-tested directly (import the modules in a node/jsdom context) because they only require these APIs at *runtime* (when a movie is running), not at *import* time. The bootstrap (`worker-shim.js`) installs the Director API on a provided `globalThis`-like object, so tests pass a `vm.createContext()`-style sandbox (or `globalThis` in the test process) and assert slot binding. For the actual `Worker` lifecycle, mock `Worker` with a small in-process `EventTarget` shim that mirrors `postMessage`/`onmessage`, and assert the imperative handle drives teardown via message protocol.

**Alternatives considered**:
- *Playwright/WebDriver browser tests*: faithful but slow, flaky in CI, and the team's existing `vitest`+`jsdom` convention discourages adding a browser-test pipeline for a JS library feature. Defer real-browser smoke tests to the JS client integration (`apps/client`) — out of scope for this package's plan.
- *`vitest`'s `vite-node`*: works for sync module eval but lacks `OffscreenCanvas`/`Worker`; still needs shims.
- *Running tests INSIDE a real worker*: requires bundling each test entry as a worker script — far more friction than mocking, with no fidelity gain since the build target for the runtime is browser anyway.

---

## R2: `DirectorContext` as worker-side `EventTarget` (FR-028/FR-037)

**Decision**: `DirectorContext extends EventTarget` (the built-in). `activate()` writes the context's singleton instances onto the worker's `globalThis` slots AND keeps an internal reference so the event loop dispatches `CustomEvent`s via `this.dispatchEvent(...)`. Listeners attach via `context.addEventListener("prepareFrame", …)` inside the worker (translated scripts and runtime subsystems use this).

**Rationale**: `EventTarget` is natively available in workers and is the documented observer surface (per Q1 of the latest clarify session). Subclassing it gives the context a single instance with both lifecycle ownership and event dispatch — no extra wrapper. `DirectorContext.activate()` keeps the spec's "installs on globalThis" wording (FR-003/FR-027) by also writing to global slots, but the event surface is the context itself (not globalThis), so listeners aren't global pollution. This is the worker's own context — main thread observes via `postMessage` polling, never directly.

**Alternatives considered**:
- A free-standing `EventTarget` held by the context (composition): equivalent, more indirection; rejected unless `EventTarget` inheritance conflicts with another class hierarchy — it doesn't, because all core-object base classes are plain classes.
- `globalThis` as the dispatcher: rejected — global pollution risk and the spec explicitly didn't choose it.

---

## R3: Singleton live-binding slots vs worker `globalThis`

**Decision**: Per FR-003/FR-016/FR-027, the `singletons.js` module declares `let _movie; let _player; …` and re-exports them as live bindings getters; `DirectorContext.activate()` writes both to (a) these module slots and (b) the worker's `globalThis`. `@/lingo`'s `export { _movie }` resolves to the module slot's current value (live binding). Inside the worker, the bootstrap installs `@/lingo`'s exports onto `globalThis` so bundle code that references `_movie` (without importing) also resolves to the active context's instance.

**Rationale**: ES module exports are *live bindings* — `let` slots in the source module update to the current value across importers. `DirectorContext.activate()` writes the slots; consumers see the active context. Workers have their own `globalThis`, so the same module graph yields one slots-set per worker (per-movie isolation). Writing both the module slots and `globalThis` satisfies both consumers: those that import from `@/lingo` (live binding) and those that read `_movie` from global (bundle scripts translated from legacy Lingo often rely on global singletons). This matches the clarify-session Q2 answer exactly.

**Alternatives considered**:
- `globalThis` only (no module slots): breaks `<script type="module">` bundles that `import { _movie } from "@project-reborn/director/lingo"` — they wouldn't get a live binding. Rejected.
- Module slots only (no global install): contradicts the user's clarification (bundle scripts read singletons from global). Rejected.

---

## R4: Member registry subsystem (FR-004/FR-025)

**Decision**: A single `MemberRegistry` subsystem (lives in `runtime/subsystems/member-registry.js`) owns all member lookup. Each `DirectorContext` owns one `MemberRegistry` instance. The registry is populated by `cast-loader.js` during ingest and exposes: `byNumber(castLib, n)`, `byName(movie, name)` (searches the movie's castLibs), `byNameInCastLib(castLib, name)`, `register(castLib, member)`, `unregisterAll(castLib)`. `CastLibraryObject.member`, `MovieObject.member`, and the global `member()` top-level method all hold a reference to the active context's registry and delegate to it — no static methods on any class.

**Rationale**: FR-025 mandates exactly one subsystem be consulted by `CastLib.member` (by number or name), `Movie.member` (by number → current castLib; by name → search castLibs), and global `member()`. Earlier clarify-session note locks this in. Putting it in `subsystems/` keeps the class files clean (FR-005) and the only `static`-free shared state. The registry is a runtime instance per context (not a process-global), so two concurrently running movies in their workers have isolated registries — matches FR-003's per-worker isolation.

**Alternatives considered**:
- A `static` map on `CastLibraryObject`: rejected — violates FR-005.
- The movie owning a plain `Map`: duplicates logic across `Movie.member`/`CastLib.member`/`member()`. Rejected.

---

## R5: Builder pattern DSL shape (FR-017/FR-018)

**Decision**: Fluent immutable builders; mutation accumulates on a builder instance, `.build()` returns a frozen plain-objects definition:

- `movie(name)` → `MovieBuilder` with `.cast(castDefinition)`, `.dimension(w, h)`, `.tempo(fps)`, `.build()` → `MovieDefinition` (Object.freeze).
- `cast(name)` → `CastBuilder` with member-registration helpers per included type (e.g., `.bitmap(name, { pixels })`, `.field(name, { text })`, `.text(name, …)`, `.sound(name, { audioBytes })`, `.colorPalette(name, …)`, `.cursor(name, …)`, `.font(name, …)`, `.button(name, …)`, and a generic `.member(name, { type, payload })` for excluded types as stubs), and `.build()` → `CastDefinition` (frozen). Member numbers are assigned sequentially (1-indexed) by registration order, compacted (no gaps) — per clarify Q2.

**Rationale**: FR-017 ("a `movie` builder, a `cast` builder, and member-registration helpers on a cast that take a member's name (and, where relevant, an inline media payload)") and the clarify-session example `cast('Internal').movieScript('My Script', { content: importedScript })` together require name-first registration with typed inline payloads. Per-media-type helpers keep the bundle author's UX ergonomic and self-documenting; the generic `.member(name, { type, payload })` covers all 19 documented member types so excluded types still build (as stubs, per FR-012). `.build()` produces frozen plain objects (a pure data structure, per FR-017, "not live Director core objects").

**Alternatives considered**:
- Single `.member()` polymorphic helper with a typed `type:` field: viable, harder to author, less discoverable. Used as a fallback under the typed helpers — kept.
- Mutable builder that returns live `MovieObject`: rejected — contradicts FR-017.

---

## R6: Bundle ES module + dynamic `import()` (FR-026)

**Decision**: A bundle is `export default movieDefinition` (the frozen object from R5). The worker, after bootstrap (FR-027), calls `await import(bundleUrl)` and reads `.default`. If `.default` is missing or not a `MovieDefinition` (a structural check via `typeof === "object" && typeof name === "string" && Array.isArray(casts)`), the ingest path raises a documented `InvalidBundleError` and the main-thread handle reports it.

**Rationale**: Q1 clarify-session locks ES module + dynamic `import()` inside the worker. Structural validation keeps ingest honest; `.default` matches the builder output so authoring and loading share one contract. No `fetch()`+`eval`, no import-map, no manifest — exactly FR-026.

**Alternatives considered**: `fetch()`+`new Function`: rejected by FR-026. URL-resolved import-map: rejected by FR-026.

---

## R7: Event loop + lifecycle-event dispatch order (FR-019/FR-037)

**Decision**: A single `setTimeout`-driven loop in `event-loop.js` runs at `1000 / tempo` ms intervals. Per tick it dispatches the documented lifecycle order on `DirectorContext`: `prepareFrame` → `enterFrame` → (`beginSprite` per sprite) → (`exitFrame` per sprite) → `exitFrame`. (`Director's documented order; the implementation mirrors the doc's per-frame sequence.) `prepareMovie`/`startMovie` fire at start (before the loop begins); `stopMovie` fires on destroy (after the loop stops). `on idle` fires on a tick when no input is buffered; `on timeout` fires when `the timeout` threshold elapses (the docs' idle/timeout model). When the spec defers Score-data, the events still fire with empty `event.spriteData` / no per-sprite targets (FR-037 explicit).

**Rationale**: Clarify-session Q "Non-Score event-loop tick / idle behavior" → full implementation, Score-independent. The loop must produce observable/testable lifecycle events at tempo; the dispatched order follows the Director MX 2004 docs. `setTimeout` aligns with `setInterval`-equivalence but is re-armed each tick so tempo can be mutated at runtime (Director `the frameTempo` is documented as settable). Tests advance time with `vi.useFakeTimers()` and assert dispatch order.

**Alternatives considered**: `requestAnimationFrame`: not in workers. Fixed `setInterval`: tempo-mutation requires reset/recreate — awkward.

---

## R8: Web Audio graph in worker (FR-034)

**Decision**: `DirectorContext` owns one `AudioContext`; each `SoundChannelObject` constructs a `GainNode` (volume) → `StereoPannerNode` (pan) chain connected to `context.destination`. `SoundMember` instances, on `puppet`/`play`, decode their inline payload via `AudioContext.decodeAudioData(audioBytes)` → `AudioBuffer`; an `AudioBufferSourceNode` per play feeds the channel's input. `SoundChannel.volume`/`.pan` are getters/setters on the `GainNode`/`StereoPannerNode`. `AudioContext`-suspended (autoplay policy) is handled in an assumption: queued plays resolve silent until `resume()` (test fixture calls `ctx.resume()` manually).

**Rationale**: Clarify-session Q → Web Audio inside worker (Option A). `decodeAudioData` accepts typed-array payloads directly (FR-032 inline payload). Workers support `AudioContext` in Chrome/Edge/Firefox; Safari lags but the spec targets modern browsers. No `<audio>` elements (workers have no DOM).

**Alternatives considered**: main-thread `<audio>`: contradicts workers-only isolation.

---

## R9: Net ops via `fetch()` inside worker (FR-033)

**Decision**: A `NetState` subsystem (in `runtime/subsystems/net-state.js`) tracks each in-flight net operation by numeric `netID`. Initiators (`getNetText`, `postNetText`, `preloadNetThing`, `downloadNetThing`, `gotoNetMovie`) call `fetch()` inside the worker, allocate a `netID`, return it immediately, update state as the `fetch()` promise resolves/rejects. `netDone(netID)`/`netError(netID)`/`netTextResult(netID)`/`netMIME(netID)`/`netLastModDate(netID)`/`getStreamStatus(netID)` read the subsystem's state. `gotoNetMovie` posts a main-thread message to load a new bundle; `gotoNetPage` posts a main-thread message to set `location.href`/`window.open`. `netAbort(netID)` calls `AbortController.abort()`.

**Rationale**: Clarify-session Q2 → full `fetch()` implementation. A subsystem keeps `netDone`/`netError`/etc. fast (no per-call closure lookup) and off-core-object (FR-005). `AbortController` is JS-native and worker-safe. `gotoNetPage` MUST run main-thread (per FR-033) — relayed via `postMessage`.

**Alternatives considered**: per-method closures for state: rejected — duplicates state and complicates `netDone(netID)` lookup.

---

## R10: externalEvent / externalParam host bridge (FR-035)

**Decision**: A tagged `postMessage` from worker (e.g., `{ kind: "externalEvent", name, args }`) is received by the main-thread handle's `onmessage`; the handle dispatches a `CustomEvent("externalEvent", { detail: { name, args } })` on the imperative handle (an `EventTarget`) for the imperative path, or on the `<x-object>`/`<x-embed>` element for the declarative path. The handle's `EventTarget` type is documented in `contracts/imperative-runtime.md`. `externalParamName(i)`/`externalParamValue(i)` read from a frozen `externalParams: { name, value }[]` array built at connect/run-config time from collected `<x-param>`s and forwarded into the worker as part of its bootstrap config — no DOM access from the worker.

**Rationale**: Clarify-session Q4 → Option A exactly. Storing `externalParams` in the bootstrap config means `<x-param>` changes after connect are a stale-snapshot edge case (already logged in spec Edge Cases). The worker never touches the DOM (matches FR-030).

**Alternatives considered**: worker side reads DOM via `OffscreenCanvas`-unrelated API: workers have no DOM. Rejected.

---

## Consolidation

All Technical Context NEEDS CLARIFICATION resolved (only R1 was open). Best-practice patterns captured for: context-event dispatch (R2), live-binding slot + global install (R3), member registry (R4), builder DSL (R5), bundle contract (R6), event-loop order (R7), audio graph (R8), net subsystem (R9), external-event bridge (R10). Design proceeds to Phase 1.