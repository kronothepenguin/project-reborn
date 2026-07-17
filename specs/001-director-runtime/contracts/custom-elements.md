# Contract: Custom Elements (FR-020/FR-029/FR-030/FR-035)

Three custom elements registered from `@/browser` (FR-022), defined in `runtime/player/custom-elements/`. They are a **thin layer** over the imperative runtime ([imperative-runtime.md](./imperative-runtime.md)) — they own no separate worker path (FR-019 assumption; SC-010).

## `<x-object>` (and `<x-embed>`)
Simulates HTML4 `<object>`/`<embed>` + the legacy Shockwave NPAPI plugin. Declarative host for a virtual JS movie bundle.

### Attributes
| Attribute | Type | Notes |
| --------- | ---- | ----- |
| `src` (or `data`) | `string` | ES module URL of the bundle (FR-026). Required for movie loading. |
| `width`, `height` | `string` (CSS) | stage dimensions; default 640×480 |

### Children
- `<x-param name="…" value="…">` — nested params collected at `connectedCallback` into a frozen `{ name; value }[]` snapshot (FR-035), forwarded to the worker via the imperative handle's `run()` `externalParams` option.

### Behavior
- `connectedCallback`:
  1. Read `src`/`data` (ES module URL).
  2. Insert a child `<canvas>` (sized from `width`/`height`); `transferControlToOffscreen()` and keep the `OffscreenCanvas` to pass to the worker (FR-029).
  3. Collect children `<x-param>`s into the `externalParams` snapshot.
  4. Call `run(src, { canvas: thisCanvas, externalParams })` — get a `MainThreadImperativeHandle`.
  5. Register the handle as the element's own `externalEvent` sink: any `externalEvent` dispatched on the handle is re-dispatched as `CustomEvent("externalEvent", {detail})` on the `<x-object>`/`<x-embed>` element itself (FR-035 — declarative path).
  6. Attach input listeners (keydown/keyup/mousedown/mouseup/mousemove/focus/blur) on the element and forward them to the worker via `handle`'s message protocol (FR-030) — feeding `_key`/`_mouse` singletons inside the worker.
- `disconnectedCallback`: call `handle.destroy()` (FR-021) — which posts `{kind:"destroy"}` to the worker, dispatches `stopMovie`, terminates the worker, and releases the canvas/`OffscreenCanvas`.

### `<x-embed>`
Equivalent behavior to `<x-object>` for the same `src`/params (FR-020). Attribute `src` (or `data`) carries the bundle URL.

## `<x-param>`
- Attributes: `name`, `value`. Used inside `<x-object>`/`<x-embed>`.
- Read only at element-connect time of its parent `x-object`/`x-embed`; post-connect mutation is an edge case (already flagged in spec Edge Cases; the snapshot is stale — documented behavior, not a bug in v1).
- No behavior of its own beyond declaring params; does NOT register itself with any registry.

## OffscreenCanvas contract (FR-029)
- The element owns the DOM `<canvas>` node; the worker owns the pixels (renders to the `OffscreenCanvas`).
- `transferControlToOffscreen()` is called on the main thread; the resulting `OffscreenCanvas` is sent to the worker via `postMessage` (transfer-list, so the main thread relinquishes) at `init` time.
- No per-frame pixel copy; no main-thread rendering of movie content.

## Input forwarding (FR-030)
- Element listeners forward keyboard/mouse/focus events to the worker as messages (per the protocol in [imperative-runtime.md](./imperative-runtime.md)).
- Inside the worker, the messages feed the `_key`/`_mouse` singletons' state and the event loop's idle/decision logic.
- The worker NEVER attaches listeners to the main-thread DOM directly (FR-030). Coordinates in forwarded mouse messages are translated to the canvas/stage coordinate space (Director point semantics).

## Equivalence with imperative path (SC-010)
- Mounting via `<x-object>` + `<x-param>` and via the imperative `run()` function MUST construct the same live Director API surface in the worker (the custom element is a thin wrapper over `run()`). Tests assert identical activated singletons / castLibs / members / event-loop behavior across both entry points.

## Testability (with `jsdom` — research.md R1)
- `customElements.define` is available in `jsdom`; `<x-object>`/`<x-embed>`/`<x-param>` can be instantiated as elements in tests.
- `OffscreenCanvas` must be shimmed in tests (jsdom doesn't implement it); transfer is a no-op returning a stub object.
- `transferControlToOffscreen` is mocked; the imperative handle receives the stub.
- Forwarded input events are asserted via the mocked `Worker.postMessage` calls; the in-worker state changes (e.g., `_key.keyDown` flips) via the worker `EventTarget` shim (research.md R1).
- Lifecycle observation (host-side): the element dispatches `externalEvent` and surfaces `error` as DOM events — assertable with `addEventListener` on the element.