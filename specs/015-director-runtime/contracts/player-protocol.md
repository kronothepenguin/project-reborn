# Contract — Player Protocol (main thread ⇄ worker)

**Feature**: `015-director-runtime` | **Spec**: [../spec.md](../spec.md) | **Source**:
`packages/director/src/player/`

Requirements: FR-054–FR-065, FR-071, FR-072, R-17–R-21 and the two 2026-09-12 clarify answers.
One dedicated worker per run is the isolation model; the main-thread handle is the only host
surface.

## 1. `run(input, options)` (FR-054, R-17, R-20)

```ts
run(input: string | MovieDefinition,
    options?: { canvas?: HTMLCanvasElement; externalParams?: { name: string; value: string }[] })
  : MainThreadImperativeHandle
```

- `input` is the **bundle URL** (primary form): the worker imports it and reads its default export
  as the C8 movie definition. An inline `MovieDefinition` object is accepted **for tests only**.
- `options.canvas` is host-owned. `run()` calls `canvas.transferControlToOffscreen()` when
  available and transfers the result inside `init`; otherwise the worker falls back to `paint`
  messages (R-20). With no canvas, no render surface is exposed.
- `options.externalParams` is cloned/frozen and forwarded in `init` (FR-072).
- Spawns one module worker per call and returns immediately (booting state); multiple runs are
  isolated (FR-071).

## 2. `MainThreadImperativeHandle` (FR-055, R-18)

`extends EventTarget`.

| Member | Kind | Semantics |
|--------|------|-----------|
| `ready` | boolean field | true after the worker posts `ready` |
| `destroyed` | boolean field | true after `destroy()`; terminal |
| `post(kind, payload?)` | method | post a tagged message to the worker; no-op after destroy |
| `start()` | method | begin the movie/event loop; queued until `ready` |
| `stop()` | method | halt the loop without destroying (resumable) |
| `destroy()` | method | terminal teardown; idempotent |
| `goToFrame(n)` | method | seek the Score to frame/marker `n` |
| `poll()` | method | post `poll-lifecycle` (host-side lifecycle observation only) |
| `getLifecycleSnapshot()` | method | single-shot promise/observation of the latest lifecycle snapshot |

Events (re-dispatched from worker messages):

| Event | `detail` |
|-------|----------|
| `ready` | worker's ready detail (movie name) |
| `error` | `{ message }` |
| `lifecycle` | snapshot `{ frame, channels, running }` (code shape; poll-only contract) |
| `paint` | `{ imageData, width, height, seq }` |
| `externalEvent` | `{ name, args }` |
| `gotoNetMovie` | `{ url }` |
| `gotoNetPage` | `{ url, target? }` |

**Queue-until-ready (R-19/FR-064):** every main-thread message issued before `ready` is queued by
the handle and flushed in order once `ready` arrives; `start()` before ready works through this
queue, and input is never dropped or reordered within a channel.

## 3. Message table (FR-055, R-18)

### Main thread → worker

| `kind` | Payload | Behavior |
|--------|---------|----------|
| `init` | `{ bundleUrl? , definition?, externalParams, offscreenCanvas? }` | install globals, import the bundle (URL) or ingest the inline definition, build renderer/audio, activate, post `ready` |
| `start` | `{}` | `prepareMovie` → `startMovie` → tempo-driven loop |
| `stop` | `{}` | halt the loop; context/audio/canvas stay alive (resumable) |
| `destroy` | `{}` | `stopMovie` once, close audio, release canvas, tear down; main thread terminates the worker |
| `goToFrame` | `{ n }` | seek the Score (`go` accepts a frame number or marker) |
| `poll-lifecycle` | `{}` | worker replies with a `lifecycle` snapshot |
| `setTempo` | `{ tempo }` | update the Score/loop tempo (R-07); the loop re-arms from the new value |
| `keydown` | `{ key, keyCode }` | feed `_key.key` / `_key.keyCode` |
| `keyup` | `{ key, keyCode }` | clear the key state |
| `mousedown` | `{ clientX, clientY, button? }` | `_mouse.mouseDown = true`, set `clickLoc` |
| `mouseup` | `{ clientX, clientY, button? }` | `_mouse.mouseDown = false` |
| `mousemove` | `{ clientX, clientY }` | update `_mouse.mouseH/mouseV` (stage space) |
| `focus` | `{}` | focus retained |
| `blur` | `{}` | release held keys (`_key.key`/`keyCode` cleared) |

`handle.post(kind, payload)` is the generic door for these and future tagged messages (R-18).

### Worker → main thread

| `kind` | Payload | Host behavior |
|--------|---------|---------------|
| `ready` | `{ name }` | set `ready`, flush queued messages, dispatch `ready` |
| `error` | `{ message }` | dispatch `error`, tear the worker down without affecting other runs |
| `lifecycle` | `{ frame, channels, running }` | lifecycle snapshot for `poll()`/`getLifecycleSnapshot()` |
| `paint` | `{ imageData, width, height, seq }` | dispatch `paint`; latest-wins coalescing |
| `externalEvent` | `{ name, args }` | dispatch `CustomEvent("externalEvent", { detail: { name, args } })` |
| `gotoNetMovie` | `{ url }` | handle tears down and re-runs the new bundle (see §8) |
| `gotoNetPage` | `{ url, target? }` | navigate the host page (`location.href` / `window.open`) |

## 4. Worker bootstrap and global getters (FR-056, R-02, R-26)

Boot order inside the worker, before the bundle is imported:

1. Install accessor getters for the seven singleton names, `the`, and the API method names on the
   worker global (`worker-shim.js` → `installGlobals(self)`), so translated scripts read
   `_movie`, `the`, `go`, … without imports.
2. If `bundleUrl` is present, `await import(bundleUrl)` and take `mod.default ?? mod`; otherwise
   use the inline definition.
3. `ingestDefinition(ctx, definition)` — casts/members (including empty slots and name-number
   lookup), options, optional Score; `ctx.activate()`.
4. Build the renderer (transferred `OffscreenCanvas` primary, `paint` fallback) and, when
   `AudioContext` exists, the 8-channel audio engine.
5. Install the worker→host post bridge, then post `{ kind: "ready", detail: { name } }`.

Each worker owns its own module graph, context, registries, Score, and audio — no cross-movie
leakage (FR-071). The worker never touches the DOM (FR-062, FR-072).

## 5. Rendering modes (FR-059, R-20)

- **Offscreen mode**: `run()` transfers the element-owned canvas; the worker draws each frame to
  its 2D context. Per tick: clear to the movie background color, then draw the current frame's
  populated channels in **ascending channel order** at each sprite's placement (flat 2D: loc,
  size/stretch, visibility; ink/rotation/blend deferred). Empty frames render only the clear.
- **Paint fallback**: when no `OffscreenCanvas` is available, the worker posts
  `paint { imageData, width, height, seq }`; the host paints the `ImageData` onto its DOM canvas.
  Slower hosts get latest-wins coalescing (newer frames supersede older ones).
- `updateStage` forces a synchronous re-render of the current frame.
- Missing/mid-load media is skipped without throwing; decode failures leave the renderer idle.

## 6. Input coordinates (FR-060)

- Forwarded mouse coordinates are translated to stage space: scaled from the element/client rect
  to the stage size, **y-flipped** for Director's bottom-left origin (`v = height − y`), and
  clamped to `[0,width] × [0,height]`.
- Key messages carry `key`/`keyCode`; mouse messages carry button state and click location.
- Focus loss releases held keys. Input is queued/coalesced per channel and never reordered.

## 7. Audio graph (FR-061, R-21)

- Eight sound channels inside the worker; each owns a `GainNode` (volume 0–1) and a `PannerNode`
  (pan −100..100 mapped to −1..1), with per-play buffer sources connected gain → panner →
  destination.
- `play(member)` decodes inline sound bytes with `decodeAudioData`; decode failure leaves the
  channel idle without throwing.
- `play`/`pause`/`stop`, volume, pan, and `fadeIn`/`fadeOut` operate per the SoundChannel
  semantics; fades ramp gain over ticks (`tick(1)` per frame). A suspended/locked `AudioContext`
  queues or plays silently until resumed — never crashes.

## 8. Net relay and navigation (FR-062, R-15)

- Net operations perform real `fetch()` **inside the worker**; `NetLingoObject` owns transaction
  state and the fail-soft rules (never throw; error completion with `netDone` true, truthy
  `netError`, `""` text).
- `gotoNetPage(url, target?)` is relayed as `{ kind: "gotoNetPage", url, target? }`; the main
  thread navigates (`location.href` or `window.open`).
- `gotoNetMovie(url)` is relayed as `{ kind: "gotoNetMovie", url }`. The handle tears the current
  runtime down (current context/worker terminated) and runs the new bundle in a **fresh worker**,
  preserving per-movie isolation (2026-09-12 clarify answer).
- The worker never reads/writes the DOM.

## 9. `externalEvent` / `externalParams` bridge (FR-063, FR-072)

- `externalEvent(name, ...args)` posts `{ kind: "externalEvent", name, args }` to the main thread.
- The handle re-dispatches `CustomEvent("externalEvent", { detail: { name, args } })` (imperative
  path); the custom element re-dispatches on itself for the declarative path. No host listener →
  no-op, no queue growth.
- `externalParams` is captured once at `run()`/connect time, cloned and frozen, forwarded in
  `init`, and read by `externalParamName`/`externalParamValue`; post-connect mutations are stale by
  contract. Runtime code must not read the DOM.

## 10. Lifecycle observation and backpressure (R-18, FR-058)

- Lifecycle events are dispatched on the worker-side `DirectorContext`; the host observes them
  only through `poll()`/`getLifecycleSnapshot()` (`poll-lifecycle` → `lifecycle`).
- `lifecycle` carries a snapshot (`frame`, `channels`, `running`); when frame events outpace host
  polling, the handle coalesces/backs off so the worker never blocks on the host.
- `start`/`stop`/`destroy` are control-plane messages, not lifecycle events.

## 11. Destroy semantics (FR-058, FR-023)

- `destroy()` is terminal and idempotent. It posts `destroy`, terminates the worker, releases the
  canvas reference, and marks the handle destroyed; a second call is a no-op.
- The worker dispatches `stopMovie` exactly once, closes the audio context, and tears down the
  context; no further lifecycle events fire on either side.
- `stop()` only halts the loop; the movie can be resumed with another `start()`.
- A failed bundle import / invalid definition / ingest error posts `error`, surfaces it on the
  handle, and tears that worker down without affecting other runs (FR-065).

Known code deviations from this contract (flat-vs-`detail` relay payloads, pre-ready queueing,
`stopMovie` double dispatch, missing `getLifecycleSnapshot`, missing `gotoNetMovie` sender) are
recorded in [../data-model.md](../data-model.md#known-implementation-gaps).
