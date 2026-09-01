# Data Model — Engine Subsystem + Score (Phase 1)

**Branch**: `004-engine-subsystem` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

Units of measure: frames 1-based; channels 1..48; tempo = frames/second.

## Score (`src/engine/subsystem/score.js`)

```js
const score = new Score({
  frames: [ { marker: "start", channels: { 1: cell, 7: cell2 } }, … ],
  tempo: 30,                // ≥1, clamp on set
});
```

| Member | Type | Read/Write | Notes |
|---|---|---|---|
| `frame` | getter → number | read (0 with no frames) | playhead position; `the.frame` reads this |
| `frameLabel` | getter → string | read | current frame's `marker` label, `""` when markerless |
| `tempo` | number | read | live movie tempo (fps); mutator is `setTempo` |
| `setTempo(n)` | method | — | `puppetTempo`; stores `Math.max(1, Math.floor(n))` |
| `advance()` | method | — | `frame++` clamped at last frame (hold); no-op empty |
| `go(frameNameOrNum)` | method | — | number → clamp; string → marker lookup; unknown → no-op |
| `goLoop()` | method | — | R6: prev-marker semantics + fallback chain |
| `goNext()` | method | — | R6: next marker; fallback last marker / frame 1 |
| `goPrevious()` | method | — | R6: two-back / one-back semantics + fallback |
| `channel(n)` | method → cell \| null | read | cell at (frame, n); `n === 0` → `STAGE` |
| `populatedChannels()` | method → number[] | read | sorted populated channels (1..48) of current frame |
| `markers()` | method → `[{marker, frame}]` | read | derived on demand; frame = 1-based index |

`STAGE` = module-level frozen `{ isStage: true, member: null }` shared marker (channel 0).

Frame normalization: `frames` array of `{ marker?, channels? }`. `channels` may be a
sparse object `{1: cell, 5: cell}` or an array (index+1 = channel; index 0 ignored;
channels > 48 truncated). Cells passed through unchanged (opaque). Markerless frames
have `marker: undefined`.

Amendment to 005: the rows `the.frame` / `the.frameLabel` / `the.frameTempo` move from
noop/core defaults to `score`-kind live reads (see `the-proxy` section).

## DirectorContext (`src/engine/subsystem/context.js` — extended)

| Member | Type | Notes |
|---|---|---|
| `score` | Score | `new Score({ frames: options.score?.frames ?? [], tempo: options.tempo ?? 30 })` |
| `frameStep()` | method | R4 order: advance → prepareFrame → enterFrame → beginSprite×N → endSprite×N → exitFrame |
| `beginSprite(channel, cell)` | method | dispatches `beginSprite` CustomEvent |
| `endSprite(channel, cell)` | method | dispatches `endSprite` CustomEvent |

Unchanged: `movie/player/sound/key/mouse/system/global`, `memberRegistry/netState/
windowRegistry`, `name/src/tempo/width/height`, `castLibs`, `audioContext/canvas/
eventLoopHandle`, `externalParams` (frozen), `destroyed`, `activate`, `destroy`,
`prepareMovie/startMovie/stopMovie/prepareFrame/enterFrame/exitFrame/idle/timeout`.

## singletons.js (`src/engine/subsystem/singletons.js` — extended)

| Export | Type | Notes |
|---|---|---|
| `_score` | Score | default `new Score()`; `_installSingletons` → `ctx.score`; `_resetSingletons` → new Score(); NOT on `globalThis` |

Seven documented singletons unchanged (`_movie … _global`).

## the-proxy (`src/engine/syntax/the-proxy.js` — 3 rows rewired)

New row kind `score` → `_score[row.field]`.

| Row | Read | Write | 005's value | 004's value |
|---|---|---|---|---|
| `frame` | score.frame | ro | noop def 0 | live playhead (0 empty) |
| `frameLabel` | score.frameLabel | ro | noop def 0 | live marker label / `""` |
| `frameTempo` | score.tempo | ro | core→movie.frameTempo def 15 | live tempo (30 default) |

All other rows (incl. `marker`/`markerList`/`label`/`labelList`/`lastChannel`) unchanged.

## MovieObject bridge (`src/engine/core/movie.js` — 5 bodies wired)

| Method | Body |
|---|---|
| `go(frameNameOrNum, movieName)` | `_score.go(frameNameOrNum)` (movieName ignored — MIAW) |
| `goLoop()` | `_score.goLoop()` |
| `goNext()` | `_score.goNext()` |
| `goPrevious()` | `_score.goPrevious()` |
| `puppetTempo(intTempo)` | `_score.setTempo(intTempo)` |

No JSDoc edits; import `{ _score }` from `../subsystem/singletons.js`.