# Contract — Browser Custom Elements

**Feature**: `015-director-runtime` | **Spec**: [../spec.md](../spec.md) | **Source**:
`packages/director/src/browser/custom-elements/index.js`

Requirements: FR-066–FR-070, R-20, SC-012. The elements are a **thin wrapper over `run()`**: they
create the canvas, snapshot params, forward input, relay events/paint, and destroy on disconnect.
They own no separate runtime path.

## 1. Tag and attribute surface (FR-066)

| Tag | Attributes | Behavior |
|-----|------------|----------|
| `<x-embed>` | `src` (alias `data`) required; `width`, `height` (default 640×480); `tempo` optional | declarative host; equivalent to `<x-object>` |
| `<x-object>` | same as `<x-embed>` | alias with identical surface (SC `el ≡ run()`) |
| `<x-param>` | `name`, `value` | child of either host element; declares one external param |

- `src`/`data`: ES module URL of the bundle. With neither present the element does nothing (no
  canvas, no `run()`).
- `width`/`height`: positive numbers; non-positive/missing → 640×480. Used both for the DOM canvas
  and the stage size forwarded to the worker.
- `tempo`: when present and positive, posted as `setTempo` after `ready` and before `start`;
  absent → the bundle's tempo applies.
- Shockwave-era plugin attributes are ignored.
- Registration is idempotent (`registerCustomElements()` guards + per-tag `customElements.get`);
  the module auto-registers when imported in a DOM environment with `customElements`.

## 2. Connect step order (FR-067)

`connectedCallback` runs once per connection (`_connected` guard; re-connection after disconnect
creates a fresh handle):

1. Read `src` (fallback `data`); return early when absent.
2. Compute the stage size from `width`/`height`.
3. Style the element (`inline-block`, stage-sized, `relative`, `overflow: hidden`).
4. Create a `<canvas>` sized to the stage and append it to the element.
5. Snapshot child `<x-param>`s — see §3.
6. Call `run(src, { canvas, externalParams })`, which calls `transferControlToOffscreen()` on the
   canvas when supported and transfers the result in `init`.
7. Register relays on the handle: `externalEvent`, `error`, `gotoNetMovie`, `gotoNetPage` are
   re-dispatched as `CustomEvent`s on the element with the same `detail`; `paint` is drawn (and,
   per FR-067, is also part of the element's relayed event surface).
8. On `ready` (once): if the `tempo` attribute is present, `handle.post("setTempo", { tempo })`;
   then `handle.start()`.
9. Attach input listeners for `keydown`/`keyup`/`mousedown`/`mouseup`/`mousemove`/`focus`/`blur`
   on the element.

Disconnect destroys: no host-side resources remain attached to a running worker.

## 3. `<x-param>` snapshot semantics (FR-066, FR-068)

- Collected from direct `x-param` descendants in document order; each becomes `{ name, value }`
  (attribute values or `""`); entries with an empty name are dropped.
- The snapshot is built **once at connect** and forwarded in `init`; post-connect additions,
  removals, or attribute changes are stale by contract (no `MutationObserver`) — FR-068.
- The element path and the imperative path pass the same `{ name, value }[]` shape; the runtime
  clones/freezes it and reads it only through `externalParamName`/`externalParamValue`.

## 4. Canvas and `OffscreenCanvas` transfer (R-20, FR-067)

- The element creates and owns the DOM `<canvas>` and appends it.
- `run()` calls `canvas.transferControlToOffscreen()` when available and transfers the resulting
  `OffscreenCanvas` in the `init` message (main thread relinquishes the pixels). After transfer,
  the main thread must not draw to the canvas (the browser enforces this).
- When unsupported (or the transfer throws), no offscreen canvas is sent and the worker uses the
  `paint` fallback.

## 5. Paint fallback drawing (FR-068)

- The element listens for the handle's `paint` event and draws `detail.imageData` at `(0,0)` with
  `putImageData` on its DOM canvas.
- Latest-wins: `detail.seq` updates the element's `frame`; stale/detached `ImageData` is dropped
  without throwing, and faster frame streams coalesce rather than queue.
- Drawing is skipped if the canvas or 2D context is unavailable.

## 6. Input forwarding (FR-069)

- Listeners on the element forward the browser event through `handle.post(kind, payload)`.
- Keyboard: `payload.key` / `payload.keyCode` from the DOM event (`keyCode` or `which`).
- Mouse: element-relative coordinates scaled from the element's `getBoundingClientRect()` to the
  stage size, then clamped by the worker; `button` forwarded for down/up. The worker applies the
  Director y-flip (bottom-left origin).
- `focus`/`blur` forwarded as-is; blur releases held keys worker-side.
- Forwarding stops once the handle is destroyed; events are queued/coalesced and never reordered
  within a channel.
- The element does not attach listeners inside the worker or mutate the runtime directly.

## 7. Event re-dispatch (FR-067, FR-070)

- `ready`, `error`, `externalEvent`, `gotoNetMovie`, `gotoNetPage`, `paint`, and lifecycle
  observations surface to page code as DOM `CustomEvent`s on the element (relayed from the handle)
  or, for drag/seek control, through `.handle`.
- `externalEvent` detail is `{ name, args }`; `paint` drawing also updates `.frame`.
- No listener on the page → the dispatch is a normal no-op (no queue growth).

## 8. Debug getters (FR-069)

| Getter | Value |
|--------|-------|
| `.handle` | the current `MainThreadImperativeHandle` (or `null`) |
| `.movieName` | the element's `src`/`data` value |
| `.frame` | latest painted frame sequence (starts at 0) |

These are the only element-level public members; they are for debugging only and are not part of
the movie contract.

## 9. Disconnect (FR-069)

`disconnectedCallback` removes the input listeners, calls `handle.destroy()` (post `destroy`,
terminate the worker, release the canvas), and clears `_handle`/`_canvas`. Destroy is idempotent;
re-appending the element connects again and starts a fresh run.

## 10. Element ≡ `run()` equivalence (FR-070)

For the same bundle URL and params, the element path and the imperative `run()` path MUST expose
the same observable surface:

- `run()` is the only runtime entry the element uses (same handle kind).
- Same event set and `detail` shapes (ready/error/externalEvent/paint/gotoNetMovie/gotoNetPage).
- Same forwarded `externalParams` snapshot (names/values/order).
- Same auto-start behavior (start after ready; optional `setTempo` first).
- The declarative-only extras are exactly: canvas creation/insertion, param collection, input
  listeners, and event re-dispatch on the element.

Known code deviations (paint not re-dispatched as a CustomEvent, flat-vs-`detail` relay shapes)
are recorded in [../data-model.md](../data-model.md#known-implementation-gaps).
