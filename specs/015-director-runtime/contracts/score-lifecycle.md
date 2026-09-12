# Contract — Score Model, Navigation & Lifecycle Ordering

**Feature**: `015-director-runtime` | **Spec**: [../spec.md](../spec.md) | **Source**:
`packages/director/src/engine/subsystem/score.js`,
`packages/director/src/engine/subsystem/context.js`

Requirements: FR-024–FR-027, R-03–R-09 and the handler-error clarify answer. Units: frames
1-based; channels 1..48 (0 = stage); tempo = frames/second.

## 1. Score model (FR-024, carried 004 decisions)

| Entity | Shape | Meaning |
|--------|-------|---------|
| Frame | `{ marker?: string, channels: Map<1..48, Cell> }` | ordered entry in `Score.frames`; normalization accepts a sparse object `{1: cell}` or an array (index+1 = channel); channels > 48 truncated, channel 0 ignored |
| Cell | `{ member, loc?, size?, visible?, ink?, blend?, rotation?, ...placement }` | opaque passthrough consumed by hydration/rendering |
| Marker | frame `marker` label | navigable label; `markers()` derives `[{ marker, frame }]` on demand (frame = index + 1) |
| Playhead | `Score.frame` (getter) | starts at `0` (no current frame); first `advance()` → `1` (R-05); `the.frame` reports it |
| Tempo | `Score.tempo` | movie-level fps; integer ≥ 1, default 30 |
| Stage | `STAGE` = frozen `{ isStage: true, member: null }` | `channel(0)`/`sprite(0)` resolution; inert stage sprite |

`Score` is subsystem state owned by `DirectorContext` (not a documented core object). Live sprites
cache per channel, re-hydrate on playhead changes, and persist script mutations between frames
(FR-027). Puppeted channels resolve from the puppet register instead of the cell.

## 2. Navigation semantics (FR-025, R-06)

| Operation | Input | Result |
|-----------|-------|--------|
| `advance()` | — | empty Score → no-op (playhead stays `0`); else playhead + 1 until the last frame, then holds |
| `go(target)` | marker name | first frame whose `marker` matches; unknown marker → no-op |
| `go(target)` | number | `floor(n)` clamped to `[1, frames.length]`; non-finite → no-op |
| `go`/`goNext`/`goPrevious`/`goLoop` | — | empty Score → no-op (unknown marker likewise) |
| `goLoop()` | — | current frame has a marker: go to the previous marker when one exists. Current frame has no marker: go to the nearest marker to the left. If no marker is to the left: next marker to the right when the current frame is markerless, else the current frame, else frame 1 when the Score has no markers |
| `goNext()` | — | next marker to the right; none → the last marker; no markers → frame 1 |
| `goPrevious()` | — | current frame has a marker: previous marker. Markerless: two markers back when two exist, else the nearest marker to the left. If none to the left: fall back like `goLoop` (right marker / current frame / frame 1) |

All navigation operates over the frames that exist; per-frame tempo overrides are not modeled.

## 3. Tempo authority (FR-025, R-07)

- `puppetTempo(n)` (Movie method) and tempo options mutate the **movie-level** Score tempo via
  `Score.setTempo(n)`: `max(1, floor(n))`, non-finite → 30. `the.frameTempo` reads the same value.
- The player event loop reads `score.tempo` and re-arms `setTimeout` after **each** tick, so tempo
  changes take effect on the next tick. No separate frame-tempo channel exists.
- Tempo 0/negative/non-integer clamps to a valid tempo (≥ 1 integer).

## 4. Lifecycle ordering (FR-026, R-04)

### Movie level

| Transition | When | Dispatch (on the `DirectorContext`) |
|------------|------|--------------------------------------|
| `prepareMovie` | once, before the loop starts | `CustomEvent("prepareMovie", { detail: { movie } })` |
| `startMovie` | once, when the loop starts | `CustomEvent("startMovie", { detail: { movie } })` |
| `stopMovie` | on destroy, after the loop stops | `CustomEvent("stopMovie", { detail: { movie } })` — exactly once |

### Per tick — exact R-04 order

1. `score.advance()`
2. `prepareFrame`
3. `enterFrame`
4. **all** `beginSprite` dispatches, channels ascending
5. **all** `endSprite` dispatches, channels ascending
6. `exitFrame`

Frame events fire every tick regardless of Score content. Sprite events fire for populated
channels **and** puppeted/scripted channels; an empty Score fires frame events only (zero sprite
events, no errors).

### Event payload shapes

| Event | `detail` |
|-------|----------|
| `prepareMovie` | `{ movie }` |
| `startMovie` | `{ movie }` |
| `stopMovie` | `{ movie }` |
| `prepareFrame` | `{ movie, score, frame }` |
| `enterFrame` | `{ movie, score, frame }` |
| `beginSprite` | `{ movie, score, frame, channel, cell, sprite }` |
| `endSprite` | `{ movie, score, frame, channel, cell, sprite }` |
| `exitFrame` | `{ movie, score, frame }` |
| `idle` | `{ movie }` |
| `timeout` | `{ movie }` |

`frame` is the advanced playhead (0 with no current frame); `sprite` is the **live**
`SpriteObject` for the channel, so handlers observe the same instance `sprite(n)` returns.

### Idle / timeout

- `idle` fires on a tick with no buffered input.
- `timeout` fires when the `the timeout` threshold elapses.
- Both dispatch `{ movie }` on the context and are Score-independent.

## 5. Handler-throw behavior (2026-09-12 clarify)

If a translated lifecycle handler throws during a frame tick inside the worker:

1. The error is posted to the host (`{ kind: "error", detail: { message } }`).
2. The movie is halted through `stopMovie`.
3. The loop does **not** continue; no further frame events fire after the error.

The same halt-and-error path applies to bundle import failures, invalid definitions, and ingest
errors (FR-065).

## 6. `stopMovie` on destroy (FR-023, FR-058)

- `DirectorContext.destroy()` is idempotent; it stops the loop, dispatches `stopMovie` exactly
  once, closes the audio context, releases the canvas reference, and detaches the active pointer;
  after destroy no lifecycle event may fire.
- `stop()` (handle/worker) is different: it halts the loop and leaves the context, Score, audio,
  and canvas alive, so a later `start()` resumes from the current context state.
- Frame-step contract: `frameStep()` advances the Score and dispatches the sequence in §4; the
  player loop calls it once per tick and then renders (and ticks audio).

Known code deviation: the current `frameStep()` interleaves `beginSprite`/`endSprite` per channel
instead of the R-04 two-pass order, and the destroy path can dispatch `stopMovie` twice — see
[../data-model.md](../data-model.md#known-implementation-gaps).