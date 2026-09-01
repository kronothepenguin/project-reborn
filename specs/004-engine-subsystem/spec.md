# Feature Specification: 004 — Engine Subsystem (Glue + State) + Score

**Feature Branch**: `004-engine-subsystem`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "Build the engine-subsystem layer of the Director MX 2004 runtime simulator (`@project-reborn/director`): `DirectorContext` (owns per-movie singletons + subsystems + audioContext + canvas + loop handle + externalParams; extends EventTarget; `activate()` installs into worker `globalThis` slots AND the singletons module live-bindings), the singleton live-binding slots (`_movie`…`_global`), the shared subsystems (member-registry, net-state, window-registry), and the new Score subsystem (the runtime's playhead/channel/rendering data model) — per the master roadmap `docs/shockwave-player-runtime.md`, superseding 001's FR-031 (Score stubbed; now real). Port and verify with rewritten red-green tests (vitest + jsdom), per the ratified constitution v2.0.0."

**Governance**: Defined-Before-Built — everything below is stated before implementation; anything the docs do not settle is marked `[CLARIFY]` and must be decided with the user before code (No Silent Interpretation). KISS/YAGNI — no speculative Score/capability beyond what lifecycle, frame navigation, and sprite wiring require. Red-green tests per constitution Test & Verification Discipline. This spec supersedes 001's decisions where they conflict (001 FR-031 stubbed the Score; 004 makes it real) — recorded in the master roadmap.

## Clarifications

### Session 2026-09-01 (resolved)

- **C1 — Score data-model shape (resolved: A — empty-score canonical)**: The exact score-section
  serialized shape will be verified against a real `.cst` in Macromedia Director when 004/007
  planning reaches it; **004 models the in-memory structure only** — frames in order, ≤48
  sprite channels per frame, per-frame markers, sprite cells per channel (member reference +
  placement props). Playback is canonical with an **EMPTY score** (zero frames/sprite cells,
  Lingo-driven stage); frame navigation runs over whatever frame list exists (including
  none). No `newFrame`-style programmatic frame building surface (YAGNI) — the frame list is
  fed by the movie definition / pack.
- **C2 — temporal semantics (resolved: A — movie-level tempo only)**: ONE tempo authority —
  the movie-level tempo (`context.tempo`, frames/second, default 30). All ticks advance at it;
  `puppetTempo(n)` mutates it and the next tick reflects the change. Per-frame timing
  overrides are DEFERRED (the frame variants ship with 007/008 when score data lands, per C1).
  The re-arm semantics of the timer itself remain 008's event-loop job.
- **C3 — beginSprite/endSprite + puppets (resolved: A — events only; 003 wires sprites)**:
  004 dispatches beginSprite/endSprite events with **channel/cell payloads** (no live `Sprite`
  objects). The Score exposes channel/cell data readably + `sprite(0)` → stage resolution;
  `puppetTempo` mutates the Score's tempo state (read by 008's loop); `puppetSprite` remains
  a Movie surface stub (003's turf). Live Sprite objects joining those events is 003's job.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A DirectorContext owns the per-movie singletons and subsystems, activating them into both binding surfaces (Priority: P1)

A movie needs one context per worker that ties together the seven singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`), the shared subsystems (member registry, net state, window registry), and the ambient resources (audio context, canvas, loop handle, external params). `activate()` installs the context's instances into (a) the module-level singleton live-binding slots and (b) the worker's `globalThis` slots — so both `import { _movie } from "@/lingo"` and unqualified `_movie` reads inside a bundle resolve to this context's instances. Destroy releases resources idempotently.

**Why this priority**: Everything else (API methods in 006, player in 008, core objects in 003) reads state through these singletons/slot bindings. Without the context + binding surfaces no translated script can resolve `_movie`/`_player` at all — this is the glue that makes 003/006/008 valid.

**Independent Test**: A vitest suite constructs a `DirectorContext`, calls `activate()`, and asserts both binding surfaces resolve to the same instances (module-level singleton exports and `globalThis` slots); switching contexts re-binds both; `destroy()` is idempotent and releases the resources it owns. Testable with jsdom (EventTarget + minimal audio stub), no worker required.

**Acceptance Scenarios**:

1. **Given** a freshly constructed context with default options, **When** it is activated, **Then** the singletons module exports and the `globalThis` slots both point at the context's instances for all seven keys.
2. **Given** two contexts, **When** the second is activated, **Then** both binding surfaces now resolve to the second context's instances (last-activate-wins) and the first is fully detached.
3. **Given** an activated context, **When** `destroy()` is called twice, **Then** the second call is a no-op and resources (audio context, loop handle, canvas) are released exactly once.
4. **Given** a context with `externalParams`, **When** read after activation, **Then** the params (`sw1`..`sw9`, etc.) are the frozen values captured at construction.
5. **Given** a context, **When** lifecycle events are subscribed via `addEventListener`, **Then** the context dispatches them on itself (it is an EventTarget) — unsubscribing works, and no events leak to any other context.
6. **Given** no context activated, **When** singletons are read, **Then** default (per-module) instances exist so tests and no-context modules still resolve.

---

### User Story 2 - The Score subsystem models frames × channels and a playhead that advances at tempo (Priority: P1)

The Score is the runtime's playhead/channel/rendering data model: frames in order, each frame carrying up to 48 sprite channels, a playhead that advances frame by frame at the movie's tempo, and frame navigation (`go`/`goLoop`/`goNext`/`goPrevious`). `sprite(0)` is the stage; `the.frame` reflects the current frame. Playback must run even with an EMPTY score (no sprite cells) — with `puppetTempo` mutating the tempo at runtime. This supersedes 001 FR-031 (Score stubbed).

**Why this priority**: The event loop (008), frame scripts, `go`-style navigation in translated game code, and the sprite objects (003) all read this data model. It is the state layer the player runs on.

**Independent Test**: A vitest suite drives a Score instance directly: appending frames (empty and populated), advancing the playhead at tempo (fake timers), navigating via `go`/`goNext`/`goPrevious`/`goLoop`, reading `the.frame`, clamping at first/last frame, and `puppetTempo` mutation taking effect on the next tick. No rendering involved — pure data model + timer authority.

**Acceptance Scenarios**:

1. **Given** a Score with N frames and playhead at frame 1, **When** the playhead advances, **Then** `the.frame` reads the next frame and `goNext`/`goPrevious` clamp at the first/last frame.
2. **Given** an empty Score (no frames), **When** the loop ticks, **Then** playback continues with blank state and no errors (empty-score playback).
3. **Given** a tempo of 30 fps, **When** `puppetTempo(60)` is called mid-play, **Then** the next tick interval reflects 60 fps, not 30.
4. **Given** a Score with a marker list, **When** `go("marker")` is called, **Then** the playhead jumps to that marker's frame; `goLoop` jumps back to the previous marker in the score.
5. **Given** a frame with sprite cells across channels, **When** the frame is current, **Then** each channel exposes its cell data (member reference, placement props) and `sprite(0)` resolves to the stage.
6. **Given** only movie-level tempo (C2 — per-frame timing deferred), **When** the tempo is stable, **Then** every tick advances at the same interval; per-frame timing model is NOT part of 004 (lands with 007/008).
7. **Given** playhead navigation to a nonexistent marker, **When** `go("unknownMarker")` runs, **Then** behavior matches the docs' script-error / no-op convention (verified in clarify).

---

### User Story 3 - The lifecycle sequence dispatches in documented order over the Score (Priority: P2)

The lifecycle sequence (`prepareMovie` → `startMovie` → per tick `prepareFrame → enterFrame → (beginSprite → endSprite per channel) → exitFrame` → `stopMovie` on destroy, with `on idle`/`on timeout` handling) must dispatch in the documented order over the Score, Score-independent when the score is empty (sprites fire only where sprite cells exist). The tick timing is provided by the 008 event loop; this spec provides the lifecycle dispatch service and the beginSprite/endSprite semantics against Score channels — 003 later wires live Sprite objects into those channels.

**Why this priority**: 008's event loop must be able to drive the sequence with no score (empty-sprite playback), and the stop transition must be defined before the player can mount a bundle.

**Independent Test**: A vitest suite calls the context's tick/dispatch with fake timers and asserts dispatch order per the documented sequence, both with an empty score (only frame events) and a populated score (per-channel beginSprite/endSprite interleaved in the documented order), plus `stopMovie` on destroy and idle/timeout dispatch.

**Acceptance Scenarios**:

1. **Given** a movie starting, **When** the first tick runs, **Then** events dispatch in the order `prepareMovie → startMovie → prepareFrame → enterFrame → exitFrame` (frame events), and this order is stable across ticks.
2. **Given** a frame with sprites in channels 1..k, **When** a tick runs, **Then** `beginSprite`/`endSprite` dispatch per channel in channel-number order (only for channels with cells) nested inside the frame lifecycle per the docs.
3. **Given** a movie playing, **When** `destroy()` is called, **Then** `stopMovie` dispatches once, and no further frame events fire.
4. **Given** a tick with no buffered input, **When** idle conditions hold, **Then** `on idle` fires per the docs' model; when the timeout threshold elapses, `on timeout` fires.
5. **Given** an empty score, **When** the sequence runs, **Then** the events still fire in order with no sprite events (FR-037 semantics preserved — no event is suppressed by absent sprite data).

---

### User Story 4 - The shared subsystems (member registry, net state, window registry) are context-owned and usable in isolation (Priority: P3)

Each context owns exactly one `MemberRegistry`, one `NetState`, and one `WindowRegistry` as its fields, sharing the state that 006 (net-*), 003 (members), and 008 (windows/movies) read. Each registry keeps its existing contracts (member lookup by name/number, net op tracking, window registration) verified by per-registry tests; cross-context isolation is asserted.

**Why this priority**: These already exist and are used by the API layer; this story is the verification/port pass — no new behavior beyond per-context ownership isolation.

**Independent Test**: A vitest suite exercises each registry through its public surface (no context activation needed) and then through a context instance to assert context ownership and isolation (two contexts → state does not bleed).

**Acceptance Scenarios**:

1. **Given** a `MemberRegistry`, **When** members are registered by name and by number per castLib, **Then** lookups by name, by number, and by castLib slot return the expected member or the documented empty result.
2. **Given** a `NetState`, **When** a net op is started, **Then** its status/length are tracked and complete/fail transitions update it per the net-* contract.
3. **Given** two contexts each with a `WindowRegistry`, **When** a window is registered in one, **Then** the other's registry does not see it.
4. **Given** context ownership, **When** any registry is destroyed with the context, **Then** no stale references survive (destroy path cleans up).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The runtime MUST provide one `DirectorContext` per worker/movie that owns the seven singletons (`_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, `_global`) as instances, plus exactly one each of `MemberRegistry`, `NetState`, `WindowRegistry`, plus the Score subsystem, plus the ambient fields documented in US1 (audio context, canvas, loop handle, frozen external params).
- **FR-002**: `DirectorContext` MUST extend the platform EventTarget API surface (lifecycle events dispatch on it) and MUST expose `activate()` and `destroy()`.
- **FR-003**: `activate()` MUST install the context's singleton instances into BOTH the module-level singleton live-binding slots and each corresponding `globalThis` slot; subsequent activations MUST re-bind both surfaces (last-activate-wins); a context destroyed or superseded MUST be detached from both surfaces.
- **FR-004**: `destroy()` MUST be idempotent and MUST release the resources the context owns: stop the loop handle if one is running, close the audio context if open, release the canvas reference. After destroy, MUST NOT dispatch further lifecycle events.
- **FR-005**: The singleton live-binding slots MUST exist as module-level exports with default instances so modules resolve them without any context activation (test/no-context case) and reset cleanly.
- **FR-006**: The runtime MUST provide a Score subsystem that models frames in order, up to 48 sprite channels per frame, a playhead (current frame), the movie tempo (frames/second), markers, and sprite cells per channel (member reference + placement props). Per-frame timing overrides are NOT modeled in 004 (deferred per C2 — the movie tempo is the single authority).
- **FR-007**: The Score MUST advance the playhead at the movie-level tempo when driven by the tick authority, honoring `puppetTempo` mutations; playback MUST continue with an empty score (no frames/sprite cells) without error.
- **FR-008**: The Score MUST expose frame navigation: `go` (frame number or marker name; unknown marker → no-op without error, consistent with the docs' silent marker fallback), `goLoop` (back to previous marker), `goNext`, `goPrevious` with clamping at first/last frame.
- **FR-009**: The Score MUST expose `the.frame` (current frame number) and resolve `sprite(0)` to the stage.
- **FR-010**: The runtime MUST provide a lifecycle dispatch service implementing the documented sequence: `prepareMovie → startMovie → per tick (prepareFrame → enterFrame → [per populated channel beginSprite → endSprite] → exitFrame) → stopMovie` on destroy, plus `on idle` / `on timeout` per the docs' model; the sequence MUST run with an empty score (no sprite events, no suppressed frame events).
- **FR-011**: When sprite cells exist, the lifecycle MUST dispatch beginSprite/endSprite per channel in channel order (only for populated channels), nested in the documented order relative to enterFrame/exitFrame.
- **FR-012**: `MemberRegistry`, `NetState`, and `WindowRegistry` MUST remain context-owned (one per context) with unchanged public contracts; state MUST NOT bleed across contexts; the destroy path MUST clean up references.
- **FR-013**: All of the above MUST be covered by red-green vitest (jsdom) tests written before implementation per the constitution's Test Discipline.

### Key Entities

- **DirectorContext**: one per worker/movie; owns singletons, subsystems, Score, ambient resources; activate/destroy lifecycle; EventTarget surface.
- **Score**: frames × channels timeline, playhead + tempo + markers.
- **Frame**: ordered unit of the Score; carries up to 48 channels and optional per-frame timing.
- **Sprite channel / cell**: one cell per channel in a frame — member reference + placement props (later consumed by 003 Sprite objects and 008 rendering).
- **Playhead**: current-frame cursor with go*/goLoop navigation.
- **Singleton slots**: module-level live bindings + globalThis slots both resolved to the active context.
- **MemberRegistry / NetState / WindowRegistry**: per-context shared state stores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The rewritten subsystem test suite is green and at least covers the prior behavior count; zero regressions in the rest of the package (002/005 remain green).
- **SC-002**: A Score with ≤48 channels per frame runs and navigates with no errors at a stable tempo under fake timers; empty-score playback runs indefinitely without error.
- **SC-003**: Lifecycle dispatch order is asserted by tests for both empty and populated scores; beginSprite/endSprite fire exactly for populated channels in channel order.
- **SC-004**: Two contexts can live in one module graph; activating either re-binds both binding surfaces, and no state leaks between them (asserted by test).
- **SC-005**: `destroy()` release semantics are asserted (double-destroy no-op, resource release exactly once).

## Assumptions

- The tick/timer authority (setTimeout re-arm at 1000/tempo, tempo-mutation re-arm) is owned by the 008 event loop; 004 provides the dispatch service and Score advance — the player later calls it.
- The exact score-section data shape ships via 007's pack schema; 004 models the in-memory structure that schema serializes into; verifying against a real `.cst` happens when 004/007 planning reaches it (C1) — until then the empty-score + programmatic frame list is canonical.
- Live `Sprite` objects (beginSprite/endSprite targets, `puppetSprite` puppeteering) are 003's job; 004 exposes the channel/cell data + the dispatch service and dispatches events with channel/cell payloads (C3). `puppetTempo` mutates Score tempo state here (read by 008's loop); `puppetSprite` stays a Movie-surface stub.
- Per-frame timing overrides are deferred (C2): the movie tempo is the single tick authority; the frame-level variants land with 007/008 when the score data shape ships.
- The subsystem sources in `src/engine/subsystem/` are reused as-is where green (imports repaired in 002); only the Score subsystem is net-new.
- `updateStage`/rendering (008), net-* over fetch (006), and window/movie mounting (008) consume these state stores later; no consumer behavior is built in 004 beyond the dispatch service and Score model.
- The 001 data-model Phase B decision stands: the context mirrors the movie definition's `name`/`src`/`tempo`/`width`/`height`; `tempo` default 30 fps.