# Implementation Plan: 008 — Player (the Runner, co-planned with 007 pack)

**Branch**: `008-player` | **Date**: 2026-09-09 | **Spec**: [/specs/008-player/spec.md](./spec.md)

**Input**: Feature spec 008 (C1–C9 resolved), master roadmap `docs/shockwave-player-runtime.md` §008 + §007, 001 contracts (`imperative-runtime.md`, `custom-elements.md`), 004 `contracts/lifecycle.md` (Score contract), current `packages/director/src/player/*`.

## Summary

Build the player layer of `@project-reborn/director`: the Web-Worker runner that actually plays a movie. (1) **Runner-core**: `run()` on the main thread spawns a worker; worker-shim installs **frozen global getters** (C1) then imports the bundle (C7) and ingests the default-export definition; tempo-driven event loop dispatches per-004 lifecycle; `start/stop/destroy` per 001 contract. (2) **Score-rendering**: per-frame render of the current frame's populated channels ascending (z-order), flat-2D (C6) onto the render surface — `OffscreenCanvas` primary, `paint` postMessage fallback (C5). (3) **Media/net/input/events**: 8 Web Audio channels (C4), input forwarding → `_key`/`_mouse`, net relay (`gotoNetMovie`/`gotoNetPage`), `externalEvent` bridge. (4) **Pack contract + ingestion (007 co-plan)**: the MovieDefinition/CastDefinition/ScoreDefinition shape (C8) is consumed by the ingester; 007 generators emit habbo + fuse_client packs (C9) aligned with the builders. Message protocol = 001's table + `paint` only (C2); lifecycle = poll-only (C3).

## Technical Context

**Language/Version**: JS ES modules; Node ≥ 20; zero runtime deps; vitest + jsdom.
**Testing**: jsdom env; mock `Worker` with the 001 in-process EventTarget shim; jsdom lacks `OffscreenCanvas` → tests use the `paint` fallback (C5); stub `AudioContext` class for audio tests.
**Gate**: `pnpm --filter @project-reborn/director test` — 251 existing tests must stay green.

**Constraints**:
- No `#` private fields / no static members (AGENTS.md); no package-local test shims beyond the documented mocks (Worker/AudioContext/OffscreenCanvas-per-spec).
- 001 protocol table kept **verbatim**; only `paint` (+ optional `frameStats`) added (C2).
- Worker globals = **frozen getters** through the facade (C1) — no `globalThis._movie = …` writes anywhere.
- Rendering flat-2D only (C6); ink/rotation/blend + `sprite(n)` object bodies stay 003.
- `run(input)` = bundle URL first (C7); inline MovieDefinition only for tests.
- Net ops keep 006/`NetState` semantics in-worker; `gotoNetMovie`/`gotoNetPage` relay via tagged postMessage; `externalEvent` → DOM `CustomEvent`.
- `pack/movie.js` + `pack/cast.js` builders conform to the C8 definition shape; generated packs (007, C9) consume the same shape. `score` section per 004 `contracts/lifecycle.md`.

## R decisions (research/design, user-shown)

- **R1 — worker-shim install**: `worker-shim.js` gains `installGlobals(sandbox)`: for each of the 7 singleton names + `the` + every barrel method name, `Object.defineProperty(sandbox, name, { get: …, configurable: false, enumerable: true })`. Getters resolve via `_getMovie()`/…/facade; `the` is the shared export; methods re-exported from `api/index.js`. The `globalThis`-equivalent (bundle realm) gets them BEFORE `import(url)`.
- **R2 — ingester**: new `src/player/ingest.js` — `ingestDefinition(ctx, definition)`: builds casts per C8 (populate member registry with `registrationPoint`, create `CastLibraryObject`s incl. empty slots 3..73), sets `context.score` if the definition has a `score` section, then `ctx.activate()`. Reused by worker-shim + inline tests + WorkerShim.
- **R3 — event loop rewiring**: `event-loop.js` `_processFrame()` drops its bespoke `_movie.frame++` + manual dispatches; instead calls `ctx.frameStep()` (004's order: advance → prepareFrame → enterFrame → beginSprite→endSprite per channel → exitFrame) then the render hook + aframe idle/timeout checks. Tempo re-arm via setTimeout (001 contract" re-arm-on-tick").
- **R4 — renderer**: new `src/player/renderer.js` — `createRenderer({ canvas, offscreen, mode })`: `renderFrame(ctx)` iterates `ctx.score.populatedChannels()` ascending, per cell draws member media (resolved via `ctx.memberRegistry`/movie castLibs) at `loc/size/visible` flat-2D; empty frame → clear to `ctx.movie.bgColor`. Primary: draw to OffscreenCanvas 2d. Fallback: produce `ImageData`, post `{kind:"paint"}` with seq (latest-wins coalescing). `updateStage()` = `renderFrame(ctx)` synchronously.
- **R5 — audio engine**: new `src/player/audio.js` — `createAudioEngine(audioContext)`: 8 `SoundChannel`s each with GainNode + PannerNode; `SoundChannelObject.play(member)` decodes inline bytes (`decodeAudioData`) and connects buffer→gain→panner→destination; `.setVolume`, `.pan`, `.fadeIn/Out(n)` ramp over ticks (checked in the event-loop idle path). Failure → channel idle, no throw. Stub-friendly (accepts an injected `audioContext`).
- **R6 — input handler**: new `src/player/input.js` — `handleInputMessage(ctx, msg)`: applies key/mouse/focus messages to `_key`/`_mouse` fields (translated coords: stage-scale, origin bottom-left per Director), clamps out-of-stage.
- **R7 — run()/handle assembly**: rewrite `mount.js`/add `run.js` — `run(input, {canvas, externalParams})`: spawn worker (or WorkerShim in tests), post `init {bundleUrl?, externalParams, offscreenCanvas?}`; -> ready; handle extends EventTarget with `start/stop/destroy/goToFrame/poll{}` posting messages; re-dispatches `externalEvent`; `destroy` → post destroy + `worker.terminate()` (idempotent).
- **R8 — cast-loader alignment**: `cast-loader.js` conforms to C8 definition shape (`{kind:"cast", name, members[]}`) — registry population via member names (canonical) + numbers (registration order, metadata only); empty casts created by the ingester (not dynamic registration).
- **R9 — net relay + externalEvent**: worker-side net methods already post `gotoNetMovie`/`gotoNetPage` (001 contract, 006 relays) — wire the worker-shim to intercept those postMessages and forwarded to the host; `externalEvent(name, ...)` posts `{kind:"externalEvent"}`. Tests stub both sides of the port.
- **R10 — pack generators (007 slice)**: a Node script `packages/director/scripts/generate-pack.mjs` reading `Members.csv`/`Casts.csv` → emits the C8-shaped `index.js` for a cast/movie; run for habbo (Internal members + fuse_client cast ref + 70 empty slots) + fuse_client member pack. Inline base64 for PNG payloads (the `Filename` column → data URI). Generated files land under `apps/client/src/game/<cast>/index.js`.

## Phases

## Phase A — Runner-core (US1; R1/R2/R3/R7)
worker-shim globals install, ingester, event-loop rewiring, run()/handle. RED: worker message-flow tests (mock Worker), ingest tests, loop-order tests.

## Phase B — Score-rendering (US2; R4)
renderer (OffscreenCanvas + paint fallback), updateStage. RED: render tests (loop frame, channel order, empty clear, paint messages).

## Phase C — Input/audio/net/events (US3/4/5; R5/R6/R9)
input handler, audio engine (stubbed AudioContext), net relay, externalEvent bridge. RED: input translation tests, audio channel tests, relay/externalEvent tests.

## Phase D — Pack contract + ingestion (US6; R8/R10)
cast-loader alignment + builders conform + generator script + generate habbo + fuse_client packs. RED: ingest-fixture tests (73 casts, member lookup, score ingest), builder-shape tests.

## Phase E — Docs + review + commit
roadmap status (008/007 rows), quickstart, review summary before commit.

**Verification**: full gate green after each phase; `pnpm --filter @project-reborn/director test`.

**Out of scope (009/003)**: custom elements themselves (009 consumes run()), sprite-object bodies (003), real worker pixel transfer beyond OffscreenCanvas + paint fallback (008-later or browser 009).