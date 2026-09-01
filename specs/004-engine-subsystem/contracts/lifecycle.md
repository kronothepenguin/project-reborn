# Lifecycle Dispatch Contract — 004 → 008 (event loop consumer)

**Branch**: `004-engine-subsystem` | **Date**: 2026-09-01 | **Consumed by**: 008 player event loop (and tests)

The event loop (008) drives the context; 004 provides the dispatch service and Score advance.

## Movie-level

| Transition | When | Dispatch (on context) |
|---|---|---|
| `prepareMovie` | before loop starts | `CustomEvent("prepareMovie", { detail: { movie } })` |
| `startMovie` | loop starts | `CustomEvent("startMovie", { detail: { movie } })` |
| `stopMovie` | destroy (after loop stops) | `CustomEvent("stopMovie", { detail: { movie } })` — exactly once |

## Per tick (`context.frameStep()`)

Order is authoritative (supersedes 001 R7's "exitFrame per sprite" wording):

1. `score.advance()`
2. `CustomEvent("prepareFrame", { detail: { movie, score, frame } })`
3. `CustomEvent("enterFrame", { detail: { movie, score, frame } })`
4. For each `n` in `score.populatedChannels()` (ascending):
   - `CustomEvent("beginSprite", { detail: { movie, score, frame, channel: n, cell } })`
5. For each `n` in `score.populatedChannels()` (ascending):
   - `CustomEvent("endSprite", { detail: { movie, score, frame, channel: n, cell } })`
6. `CustomEvent("exitFrame", { detail: { movie, score, frame } })`

Frame events fire every tick; sprite events fire only for populated channels (empty
score / empty frame → frame events only — FR-037, zero sprite suppression).

`beginSprite`/`endSprite` per-tick semantics are the v1 contract (both fire each tick
for every populated channel). Live-sprite enter/leave (per-frame begin/end across
frame boundaries) is deferred to 003's live-sprite pass (C3).

## Idle / timeout

- `idle` → `CustomEvent("idle", …)` on a tick with no buffered input (001 model kept).
- `timeout` → `CustomEvent("timeout", …)` when `the timeout` threshold elapses (001 model kept).

## Consumers

- 008 event loop: calls `prepareMovie`/`startMovie` once, `frameStep()` per timer tick,
  `stopMovie()` on the destroy path; reads `score.tempo` for the next re-arm interval
  (re-arm is 008's job — C2).
- Translated scripts: register listeners on the context via `addEventListener`
  (frame scripts, `on enterFrame` etc. — 006/008 wire them to handlers).