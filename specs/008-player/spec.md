# Feature Specification: 008 — Player (the Runner)

**Feature Branch**: `008-player`

**Created**: 2026-09-09

**Status**: Draft

**Input**: Build the player layer of the Director MX 2004 runtime simulator (`@project-reborn/director`): the Web-Worker runner that actually plays a movie — worker bootstrap, bundle ingestion, tempo-driven event loop, Score-backed per-frame rendering to an `OffscreenCanvas`, input forwarding, Web Audio channels, net relay, and `externalEvent` bridging — per the master roadmap `docs/shockwave-player-runtime.md` §008 (and §007 co-planned for the pack-definition contract), 001's ratified contracts (`imperative-runtime.md`, `custom-elements.md`), and the constitution v2.0.0. Plan 007 + 008 together for the definition contract; 008 is the consumer of the pack shape.

**Governance**: Defined-Before-Built — everything below is stated before implementation; anything the docs/roadmap do not settle is marked `[CLARIFY]` and must be decided with the user before code (No Silent Interpretation). KISS/YAGNI. Red-green tests per constitution. Supersedes 001's FR-026/020/029/030/032/033/034/035 only where the roadmap + this spec's decisions conflict.

## Background (from the roadmap, §008 + §007)

**008 — player (Priority P1, size L — split)**
- **Loading (decided)**: main thread reads `<x-param>`s (`sw1..sw9`), transfers the `OffscreenCanvas`, spawns the worker with the **bundle URL**; the worker **imports the bundle itself** (`import(url)` in-worker — default export = the movie definition; JS classes stay in-realm; no postMessage of definitions). One worker per `<x-embed>` (decided).
- **Globals**: install API + singletons on worker `globalThis` BEFORE the bundle import (translated scripts read `_movie`, `the`, `_key`, … as globals). *(006 C8 changed the singleton mechanism — this spec reconciles "install globals" with the new active-context style: workers still need `_movie` etc. resolvable; but 006 retired `globalThis._movie` installs on the MAIN thread; in the WORKER the bundle imports `@/lingo` names through the facade. Reconcile in clarify C1.)*
- **Event loop**: tempo-driven per tick; lifecycle dispatch per 004 (`frameStep()`).
- **Rendering (in scope — decides)**: per-frame Score rendering — iterate the frame's channels in channel order (z-order), apply sprite placement (loc, size, rotation, ink, blend), draw cast-member media (PNG via `createImageBitmap` on base64 data), `updateStage` semantics. Worker owns pixels via `OffscreenCanvas`; fallback (no OffscreenCanvas) = worker posts ImageData/commands, main thread paints.
- **Input**: forwarded from the element as messages → feeds `_key`/`_mouse`; coordinates translated to stage space; `sprite(n).hitTest` via 003.
- **Media/audio**: Web Audio inside worker — 8 `SoundChannel`s, gain/pan chains, `decodeAudioData` on inline bytes.
- **Net**: net-* fully via `fetch`; `gotoNetMovie`/`gotoNetPage` relayed to main (per 001 contract).
- **externalEvent**: worker→main tagged message → DOM `CustomEvent`.
- **Supersedes 001**: FR-026 (bundle = single static module — kept, now produced by Vite + 007 packs), FR-020/029/030 (canvas handoff + input), FR-032 (inline media — kept, PNG base64), FR-033/034/035 (net/audio/externalEvent).
- **Depends on**: 002, 004 (context+Score), 005 (the proxy), 006 (methods), 007 (pack), 003 (objects referenced by scenes).

**007 — pack (Priority P1, size M)** — co-planned here for the definition contract:
- Virtual files: `habbo/index.js` ↔ `habbo.dcr`; per-cast `fuse_client/index.js` ↔ `fuse_client.cst`. `index.js` = Vite-bundled module; default export = the movie/cast **definition** (pure data: members, media, optional score). PNGs become **base64 inline data**.
- Identity: cast member **name + type canonical**; `number` implicit in registration order (CSV row order preserved), metadata only. `Members.csv`/`Casts.csv` are generator input.
- Movie↔cast wiring: movie pack declares castLibs table (slot#, name, optional cast-file ref — `Casts.csv` slot 2 → `fuse_client.cst`); each cast pack registers its members; empty slots (70 of 73 in habbo) filled as empty casts. Naming resolution = player's job (008) against in-memory casts.
- Builders `movie()/cast()` exist; aligned with folder/CSV model + optional `score` section.
- The `director-cast-to-javascript` skill becomes real: per-cast `index.js` from `Members.csv`, movie `index.js` from `Casts.csv`.

## Clarifications

### Session 2026-09-09 (resolved — all recommended options confirmed)

- **C1 — worker global installation**: **frozen getters** on the worker `globalThis` (and the worker-shim's sandbox `globalThis`), each resolving through the singleton facade (`_getMovie()` etc.); `the`, the API method names, and the 7 singleton names installed as getters. No mutable slots, no globalThis assignments at activate — consistent with 006 C8. The getters are always-live to the active context.
- **C2 — message protocol**: 001's `imperative-runtime.md` table kept **verbatim**; the ONLY additions are the rendering-fallback messages: W→MT `{ kind: "paint", imageData, width, height, seq }` (+ optional `frameStats`).
- **C3 — lifecycle observation**: **poll-only** (001 FR-028). No periodic push.
- **C4 — audio depth**: **all 8 `SoundChannel`s**, minimal per-channel: GainNode (volume), pan (PannerNode, −100..100), `fadeIn/Out` tweens ramp gain over ticks, `decodeAudioData` on inline member bytes. No streaming/Xtra.
- **C5 — rendering surface**: **both** — worker renders to `OffscreenCanvas` (transferred at init) as primary; fallback (no OffscreenCanvas — jsdom/tests) = worker posts `{ kind: "paint", imageData, width, height, seq }`; MT paints via `putImageData`. Tests use the fallback.
- **C6 — sprite fidelity**: **flat 2D** v1 — loc, size (stretch), visibility; draw the member's media scaled. Ink/rotation/blend deferred to 003.
- **C7 — `run()` input**: **bundle URL first** (`run(bundleUrl, {canvas, externalParams})`; worker imports the bundle, default export = definition). Inline `MovieDefinition` stays for tests.
- **C8 — pack-definition contract (007)**: **confirmed** — movie `{ name, casts: CastDefinition[], options: {tempo,width,height,src}, score?: ScoreDefinition }`; cast `{ kind: "cast", name, members: MemberDefinition[] }`; member `{ kind: "member", name, mediaType, payload, registrationPoint? }`; `ScoreDefinition` per 004 `contracts/lifecycle.md`. 007 generators emit this shape.
- **C9 — casts generated this pass**: **habbo + fuse_client** only. The movie pack (Internal members from `Internal_Members.csv` + fuse_client cast ref + 70 empty slots) + the fuse_client cast pack; the other ~60 casts generated incrementally in later 007 runs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — `run()` boots a movie bundle in a worker and plays it (P1, runner-core)

`run(bundleUrl, { canvas, externalParams })` spawns a worker; worker-shim installs globals (C1); the worker imports the bundle; the default-export definition ingest (activates a `DirectorContext` with casts + score); `start()` begins the tempo-driven event loop dispatching per-004 lifecycle; `stop()`/`destroy()` halt/teardown per 001' contract. Host sees `ready`, then `externalEvent`s; lifecycle via poll.

**Independent Test**: a jsdom test with a mocked `Worker` (in-process EventTarget shim, per 001 research R1) — asserts the message sequence (init → ready → start → lifecycle-ready), the bundle's default export is consumed, `context.movie`/`castLibs` populated from the definition, `stop`/`destroy` teardown idempotent. No OffscreenCanvas needed (fallback path).

**Acceptance Scenarios**:
1. **Given** a valid bundle URL, **When** `run()` is called with a stub canvas, **Then** the worker reaches `ready` and the context owns the definition's casts + score.
2. **Given** `handle.start()`, **When** the loop ticks, **Then** `prepareFrame→enterFrame→beginSprite→endSprite→exitFrame` fire on the context per 004's order with the right frame numbers.
3. **Given** `handle.stop()`, **When** called after start, **Then** the loop halts (no further frame events) without destroying the context; `start()` again resumes.
4. **Given** `handle.destroy()`, **When** called, **Then** `stopMovie` fires once, resources release, and the worker terminates (idempotent).
5. **Given** a bundle whose default export is invalid, **When** ingested, **Then** the worker posts `error` and the handle surfaces it.

### User Story 2 — Score-backed per-frame rendering (P2, score-rendering)

The loop's render step iterates the current frame's populated channels ascending (z-order), draws each sprite's member media at its placement (loc/size/visibility — flat 2D per C6) onto the render surface (OffscreenCanvas primary; `paint` messages fallback). Empty frames → the stage is cleared to `bgColor`. `updateStage` forces a render of the current frame.

**Independent Test**: a jsdom test using the fallback path — assert the `paint`/canvas content (count of draw calls, order by channel, loc/size + which member image) for a 2-sprite frame; empty frame clears; `updateStage` re-renders.

**Acceptance Scenarios**:
1. **Given** a frame with channels {1: Logo, 7: Field} (z-order 1 < 7), **When** the tick renders, **Then** Logo draws before Field (ascending channel order).
2. **Given** a sprite at loc (50, 60) size (100, 80) with a bitmap member, **When** rendered, **Then** the draw is at (50,60) sized (100,80) using the member's image.
3. **Given** an empty frame, **When** rendered, **Then** the surface clears to `bgColor` and no draws occur.
4. **Given** `updateStage` after a score change, **When** called, **Then** the current frame re-renders synchronously.

### User Story 3 — Input forwarding feeds `_key`/`_mouse` (P2, runner-input)

The element (custom-elements, 009) forwards key/mouse/focus messages per 001 protocol; the worker updates `_key`/`_mouse` state and translated coordinates (stage space).

**Independent Test**: jsdom + worker shim — post a `keydown`/`mousedown` with client coords; assert `_key`/`_mouse` fields + coordinate translation.

**Acceptance Scenarios**:
1. **Given** a `keydown` message `{ keyCode, key }`, **When** the worker ingests it, **Then** `_key.key`/`_key.keyCode` reflect it (and the key object's documented fields).
2. **Given** a `mousemove` with client coords over a 720×480 canvas, **When** translated, **Then** the mouse loc is in stage space (scaled, y-flipped per Director origin).
3. **Given** `focus`/`blur`, **When** ingested, **Then** the corresponding key/mouse state flips (e.g. keyUp for any held key on blur).

### User Story 4 — Audio: 8 channels with gain/pan/fade (P3, media)

Web Audio inside the worker: each of the 8 `SoundChannel`s owns a gain node (volume), a panner (pan −100..100), and `decodeAudioData` of inline member bytes. `sound(1).play(member)`, `pause`, `setVolume`, `fadeIn/Out` tween volume over ticks. No hardware needed in tests (stubbed `AudioContext`).

**Independent Test**: jsdom with a stubbed `AudioContext` class — assert channel count 8, play/pause/volume/pan/fade metadata changes; audio graph node wiring (gain/pan) recorded by the stub.

**Acceptance Scenarios**:
1. **Given** 8 channels, **When** the context constructs, **Then** `_sound.channel(1..8)` each have a gain + pan node wired.
2. **Given** a decode success, **When** `sound(1).play(member("x"))`, **Then** the channel is playing with the decoded buffer.
3. **Given** `sound(1).setVolume(0.5)`, **When** applied, **Then** the channel's gain node value is 0.5.
4. **Given** fade over N ticks, **When** the loop advances, **Then** the gain ramps toward the target.

### User Story 5 — Net relay + externalEvent bridge (P3, net + events)

`getNetText`/etc. work inside the worker via fetch (006 already); `gotoNetMovie`/`gotoNetPage` post tagged messages to MT; MT performs navigation. `externalEvent(name, ...args)` posts `{kind:"externalEvent"}` → MT dispatches DOM `CustomEvent` on the handle/element.

**Independent Test**: jsdom — stub fetch; call a net method in-worker; assert MT receives `gotoNetMovie`/`gotoNetPage` messages and performs the navigation action; assert `externalEvent` → CustomEvent on the handle with `{name, args}`.

**Acceptance Scenarios**:
1. **Given** `gotoNetPage("https://x", "_blank")`, **When** called in the worker, **Then** MT receives `{kind:"gotoNetPage", url, target}` and calls `window.open`.
2. **Given** `externalEvent("foo", 1, "a")`, **When** called in the worker, **Then** the handle dispatches `CustomEvent("externalEvent", { detail: { name:"foo", args:[1,"a"] } })`.
3. **Given** a successful `getNetText` in-worker, **When** the promise resolves, **Then** `netDone`/`netTextResult` reflect the result (006 semantics, in-worker).

### User Story 6 — 007 pack consumers: cast-loader + builder alignment (P2, pack contract)

The 007-generated `habbo/index.js` (movie: casts table + options) and `fuse_client/index.js` (cast: members) are consumable: the worker's ingrester builds a `DirectorContext` with the movie's casts + score; empty cast slots become empty `CastLibraryObject`s (70 of 73); the `member()`/`castLib()` lookups resolve against the loaded casts.

**Independent Test**: jsdom — ingest the generated `habbo` definition (or its shape-faithful inline fixture), assert `castLib(1)` name Internal with the 4 members, `castLib(2)` = fuse_client, `castLib(3..73)` empty, and `member("Logo")` resolves.

**Acceptance Scenarios**:
1. **Given** the habbo movie definition, **When** ingested, **Then** all 73 casts exist, slots 1-2 populated (names from Casts.csv), 3..73 empty.
2. **Given** `member("Logo")`, **When** queried post-ingest, **Then** it returns the Logo bitmap member (from Internal, slot 1).
3. **Given** a `score` section in the definition, **When** ingested, **Then** `context.score` reflects it (tempo, frames).
4. **Given** the builder `movie(name).cast(...).score(...).build()`, **When** called, **Then** the frozen output conforms to the same definition contract.

### Edge Cases

- Worker `import(url)` fails (404/bad module) → `error` message, handle surfaces it, worker tears down.
- `start()` before `ready` → queued (handle flushes pending messages per 001).
- Tempo `0`/negative → clamped (004 `setTempo`).
- Multiple runs: each `run()` = its own worker (one per embed, decided); destroy one doesn't affect others.
- Media payload missing for a bitmap member → renders nothing (no draw) without throwing.
- Input before context ready → buffered or dropped (choose: dropped, with the `ready` flush as the contract — confirm).
- `paint` fallback backpressure: if MT paints slower than worker frames, the worker coalesces (latest-wins) — confirm.
- Audio decode failure (bad inline bytes) → channel stays idle, no throw.
- Mouse coords outside stage → clamped to the stage rect.

## Dependencies / Sequence

- **Prereq**: 002, 004 (context+Score), 005, 006 (all done). 007 co-planned (this spec C8/C9). 003 NOT required for v1 player (sprites flat-rendered from Score cells; `sprite(n)` object bodies = 003).
- **Split (roadmap)**: runner-core (bootstrap+loop+lifecycle) → MS1; score-rendering → MS2; media+net+events → MS3; pack contract + habbo/fuse_client ingestion → MS4.
- **Out of scope (009)**: custom elements themselves (009 consumes run()); 003's sprite object internals (sprite.js bodies); real browser worker-pixel transfer beyond OffscreenCanvas + paint fallback.