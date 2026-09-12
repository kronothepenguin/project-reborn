# Phase 1 Refactor Design: Director Runtime

This artifact documents the cleanup pass that must precede (and unblock) implementation of the v1 spec. It is consumed by `/speckit.tasks` to generate the per-file refactor wave. Source-tree paths are project-relative; references point at the spec, contracts, and other plan artifacts.

---

## Authoritative docs (Director MX 2004 Scripting Reference)

- PDF source: `docs/drmx2004_scripting_ref.pdf`
- Full text extraction: `docs/drmx2004_scripting_ref.txt`
- Per-chapter text under `docs/drmx2004_scripting_ref/`:

| File | Feeds | Spec ref |
| ---- | ----- | -------- |
| `director_core_objects.txt` | 13 core `X…Object` classes (Cast Library, Global, Key, Member, Mouse, Movie, Player, Sound, Sound Channel, Sprite, Sprite Channel, System, Window) — method/property summaries + listings | FR-007 |
| `media_types.txt` | 19 `X…Member` subclasses incl. the 8 included full impls (Bitmap, Button, ColorPalette, Cursor, Field, Font, Sound, Text) + 11 excluded stubs (AnimatedGIF, DVD, FilmLoop, FlashComponent, LinkedMovie, QuickTime, RealMedia, Shockwave3D, ShockwaveAudio, VectorShape, WindowsMedia) | FR-011/FR-012 |
| `scripting_objects.txt` | 4 scripting `X…Object` classes (Fileio, NetLingo, SpeechXtra, XMLParser) | FR-008 |
| `methods.txt` | ~130 top-level Lingo methods (one per file under `runtime/methods/`); the net-* methods here drive the `NetState` subsystem surface (FR-033) | FR-015 |
| `properties.txt` | Verbatim JSDoc body text for every documented property (each class's properties are quoted from the corresponding property entry) | FR-013/FR-014 |
| `events_and_messages.txt` | The lifecycle event sequence dispatched by the event loop (FR-037) and the `DirectorContext` `EventTarget` surface (FR-028) | FR-028/FR-037 |
| `constants.txt` | Constants re-exported from `@/lingo` (Chapter 9) | FR-015 |
| `keywords.txt` | Lingo keywords (translated scripts depend on these as syntax stand-ins under `runtime/syntax/`) | FR-015 |
| `operators.txt` | Operators implemented via JS-native equivalents (no separate runtime surface — they map to JS operators) | FR-002 |
| `director_scripting_essentials.txt` | Data-types chapter: `Color`, `List`, `PropList`, `Point`, `Rect` semantics (Chapter 2) | FR-001/FR-002 |

### JSDoc convention (verified against the canon files)

`cast-library.js`/`member.js`/`mouse.js`/etc. already quote verbatim from `properties.txt` (and `methods.txt` for methods): the doc paragraph above each documented field/method is the property/method entry text from the docs. **Refactors must preserve this 1:1 quoting** — no paraphrasing, no "best effort", no adding behavior not in the source paragraph. This is the spec's FR-014 ("no fabricated behavior") made concrete: every default value, read-only/read-write annotation, allowed-values list, and example in the JSDoc comes from the docs, not from intuition.

In the per-chapter files:
- `director_core_objects.txt` lists each object's "Method summary" and "Property summary" as tables — use these to verify the *set* of members to implement (completeness check against SC-003).
- `properties.txt` and `methods.txt` carry the full per-entry descriptions — quote these into JSDoc verbatim (trimming only the Lingo↔JavaScript syntax examples where redundant).

## Reference style (the canonical "good" files)

These files already follow the spec rules and are the style template for the refactors:

- `packages/director/src/runtime/objects/cast-library.js`
- `packages/director/src/runtime/objects/global.js`
- `packages/director/src/runtime/objects/key.js`
- `packages/director/src/runtime/objects/member.js`
- `packages/director/src/runtime/objects/mouse.js`
- `packages/director/src/runtime/objects/system.js`

Builder style template (incomplete but the right shape):

- `packages/director/src/runtime/package/movie.js`

### Style rules distilled from the canon files

1. **One ES module per class; one `export class X…Object { … }`** (or `X…Member` for member media types).
2. **No `import` lines** unless a documented property/method actually references another Director type (e.g., `MemberObject` imports `Point`/`Rect`; `MouseObject` imports `Point`). Avoid speculative imports.
3. **All documented properties are plain public class fields** with sensible defaults: `name = "";`, `number = 0;`, `hilite = false;`, `mediaReady = false;`. **No getters/setters, no coercion, no read-only enforcement.**
4. **One JSDoc `/** … */` block above each documented property/method**, quoting the Director MX 2004 docs (purpose, read-write/read-only, allowed values, examples when the docs have them). Cite option strings/symbols exactly (e.g., `Symbol.for("bitmap")` for the `type` field).
5. **Methods return documented default values** when deterministic in v1 (e.g., `findEmpty() { return 0; }`).
6. **No `static` members of any kind on the class** (FR-005).
7. **No `#` private field syntax for documented properties** (FR-013). (The only allowed internal state is `runtime/subsystems/` state that isn't a documented member.)
8. **No fabricated behavior.** Anything not in the docs is a stub per FR-014/FR-006.

### Builder style (from `runtime/package/movie.js`)

- Function `xxx(name)` returns `new XxxBuilder(name)`; `class XxxBuilder` lives in the same file (not exported).
- Per-instance accumulators use `_underscored` names (`_name`, `_casts`, `_tempo`, …). These ARE allowed — they are not documented properties.
- Fluent methods (`cast(c)`, `tempo(v)`, `width(v)`, …) return `this`.
- `.build()` returns a plain `{ … }` object per the `XxxDefinition` shape in [data-model.md](./data-model.md) and [contracts/packaging-builders.md](./contracts/packaging-builders.md). **Spec recommends deep-`Object.freeze`** (the canon `movie.js` currently returns an unfrozen object — minor follow-up in the tasks phase).

---

## Folder purposes (alignment recap)

| Folder | Purpose | Spec ref |
| ------ | ------- | -------- |
| `packages/director/src/runtime/objects/` | 13 core `X…Object` + 4 scripting `X…Object` classes; pure docs surface; no statics | FR-007/FR-008/FR-005 |
| `packages/director/src/runtime/objects/media/` | 19 `X…Member` subclasses (8 included full + 11 excluded stubs) | FR-011/FR-012 |
| `packages/director/src/runtime/methods/` | Top-level Lingo methods (one per file); delegates to singletons, subsystems, classes — exports via `@/lingo` | FR-015/FR-022 |
| `packages/director/src/runtime/syntax/` | Chunk syntax (`char`/`line`/`word`/`item` + `put-before`/`put-after`/`put-into` + `the-proxy`); part of `@/lingo` — the special syntax/chunks Lingo has, including the object proxy that maps `the.*` and the `char(n).of(str)` chunk form | FR-015 |
| `packages/director/src/runtime/player/` | Imperative API to run movies (main-thread `Worker` owner, worker bootstrap, event-loop, cast-loader, custom elements) — **AI scaffolded, redesign per [contracts/imperative-runtime.md](./contracts/imperative-runtime.md) and [contracts/custom-elements.md](./contracts/custom-elements.md)** | FR-019/FR-020/FR-028/FR-037 |
| `packages/director/src/runtime/subsystems/` (**NEW**) | Documented cross-class glue: `member-registry.js`, `net-state.js`, `window-registry.js`; no state on classes | FR-004/FR-005/FR-025/FR-033 |
| `packages/director/src/runtime/context.js` | `DirectorContext extends EventTarget`; owns singletons + subsystems + audio graph + canvas + loop handle + `externalParams`; `activate()` writes both worker `globalThis` slots AND `runtime/singletons.js` module slots; dispatches lifecycle events per FR-028/FR-037 | FR-003/FR-016/FR-027/FR-028/FR-037 |

---

## Refactor scope — files the user listed for this pass

### `objects/player.js` — rewrite

**Spec-violating patterns today**:
- 39 `#`-private fields (FR-013)
- Proxy-based `sound`, `xtra`, `window`, `windowList` members (FR-014 — not in the docs)
- Reads `WindowObject.window`/`windowList`/`frontWindow` static registries (FR-005)
- `getPref`/`setPref` via `globalThis.localStorage` (FR-014)
- `externalParamValue` falls back to `URLSearchParams`/`globalThis.location` (FR-014)
- `quit()` calls `globalThis.close()` (browser-API assumption not in docs)
- `runMode` read-only enforced via throwing setter (ref style ignores read-only enforcement)

**Target**: plain class with public documented fields (per the canon files). Documented properties to retain (from the existing implementation, vetted against Director MX 2004 docs): `alertHook`, `debugPlaybackEnabled`, `editShortcutsEnabled`, `exitLock`, `parameters` (object), `activeCastLib`, `activeWindow`, `applicationName`, `applicationPath`, `currentSpriteNum`, `digitalVideoTimeScale`, `disableImagingTransformation`, `emulateMultibuttonMouse`, `externalParamCount` (derived from `parameters`/`externalParams` count), `frontWindow` (returns the active/stage window or `null` in v1 — MIAW deferred per FR-036), `inlineImeEnabled`, `lastClick`, `lastEvent`, `lastKey`, `lastRoll`, `mediaXtraList`, `netPresent`, `netThrottleTicks`, `organizationName`, `productName`, `productVersion`, `runMode` (plain `= "Plugin"`), `safePlayer`, `scriptingXtraList`, `searchCurrentFolder`, `searchPathList`, `serialNumber`, `switchColorDepth`, `toolXtraList`, `transitionXtraList`, `userName`, `currentCursor`. Documented methods: `alert`, `appMinimize`, `cursor`, `externalParamName`, `externalParamValue`, `flushInputEvents`, `getPref`, `halt`, `open`, `quit`, `setPref`, `windowPresent`, `makeChromeless`, `addMenu`, `insertMenu`, `removeMenu` (verify against docs in tasks phase).

**Cross-cutting wiring (per FR-006)**: where a method needs state owned by a subsystem (e.g., `externalParamName`/`externalParamValue` reading `<x-param>` snapshot per FR-035), the file leaves a stub returning documented defaults and a `// TODO(subsystems): route through X` comment for the tasks phase to wire it. No statics, no Proxy.

### `objects/sound-channel.js` — rewrite

**Spec-violating patterns today**:
- 19 `#`-private fields + getter/setter pairs with coercion and read-only throws (FR-013; not in canon style)

**Target**: plain public class fields for every documented SoundChannel property: `channel`, `volume`, `pan`, `loop`, `currentTime`, `elapsedTime`, `endTime`, `loopCount`, `loopEndTime`, `loopStartTime`, `loopsRemaining`, `sampleCount`, `sampleRate`, `startTime`, `status`, `member`, `channelCount`, `isPlaying`. Documented methods as plain methods: `play`, `stop`, `pause`, `rewind`, `breakLoop`, `fadeIn`, `fadeOut`, `fadeTo`, `getPlayList`, `setPlayList`, `queue`, `playFile`, `playNext`, `isBusy`.

**Future wiring**: per [contracts/imperative-runtime.md](./contracts/imperative-runtime.md), the actual audio graph (`GainNode`/`StereoPannerNode`) belongs to the `DirectorContext.audioContext` (FR-034), not on the class. v1 stub: `play()`/`stop()` keep documented state flags; no Web Audio wiring in this file (left for the audio subsystem phase, per FR-006).

### `objects/sprite-channel.js` — rewrite

**Spec-violating patterns today**:
- 4 `#`-private fields + getter/setter pairs with read-only throws (FR-013)

**Target (per FR-007 — SpriteChannel is an API-only shell in v1)**: plain public fields `number`, `name`, `scripted`, `sprite` (defaults: `0`, `""`, `false`, `null`). Constructor takes `number`. `makeScriptedSprite(member)` is stubbed per FR-031 (Score-dependent): sets nothing or only the `sprite` field to `member` as a no-op data store — decision in tasks phase, but no real sprite placement. `removeScriptedSprite()` clears the fields. No getters/setters, no throws.

### `objects/sprite.js` — rewrite

**Spec-violating patterns today**:
- 38+ `#`-private fields + getter/setter pairs
- Derived-geometry bookkeeping (`locH` → `left`/`right`, `width` → `right`, etc.) that consumes Score placement data (violates FR-031 since Sprite is API-only shell in v1 — derived geometry is Score-dependent)
- `imports { Point, point }` and `{ Rect, rect }` for live computation

**Target** (per FR-007/FR-031): split the documented property surface into:
- **Pure identity/type surface (kept, plain public fields)**: `num`, `name`, `member` (null), `memberNum` (0), `castLib` (0), `spriteNum` (set in ctor).
- **Score-dependent surface (present as stubbed plain public fields with documented no-op/empty defaults — `loc`, `locH`, `locV`, `left`, `top`, `right`, `bottom`, `width`, `height`, `rect` (=`new Rect()`), `ink`, `blend` (=100), `visible` (=true), `foreColor`/`backColor`, `rotation`, `skew`, `flipH`/`flipV`, `quad`, `constraint`, `cursor`, `editable`, `startFrame`, `endFrame`, `locZ`, `puppet`, `moveableSprite`, `volume`, `currentTime`)**: all are plain fields. **No derived setters** — writing `locH` does NOT mutate `left`/`right` in v1 (the spec defers derived geometry to the Score phase). Plain assignment only.

**Methods**:
- `callFrame(frame)`/`goToFrame(frame)` — stubbed (Score frame-nav per FR-031c, no-op).
- `hitTest(point)` — returns documented default `Symbol.for("background")`.
- `flashToStage(point)` — returns `point` unchanged (documented no-op fallback).
- `trackCount()`/`trackStartTime(n)`/`trackStopTime(n)`/`trackType(n)` — return documented defaults `0`/`0`/`0`/`null`.
- Drop `_setTracks` (test-only seam, violates no-fabricated-behavior; let tests set a documented `tracks` field instead, plain public field).

### `methods/sound.js` — already spec-aligned (no change)

Today: `import { _sound } from "../singletons.js"; export function sound(intSoundChannel) { return _sound.channel(intSoundChannel); }`. Approaches the singleton via the live-binding slot — spec-correct per FR-016. **No change needed.** Marked compliant in the inventory; the tasks phase may add JSDoc.

### `methods/window.js` — rewrite

**Spec-violating patterns today**:
- Reads `WindowObject.window` static registry (FR-005)

**Target** (per FR-036 — MIAW deferred): `window(name)` constructs and returns a fresh `WindowObject` instance (so the documented property surface is testable). Lookup-by-name (a single `WindowObject` per name across the movie) requires a `WindowRegistry` subsystem in `runtime/subsystems/window-registry.js` (NEW). Until that subsystem exists, the method constructs fresh instances — marked as a stub per FR-006 (`// TODO(subsystems): route through WindowRegistry`). Empty/non-string `name` returns `null`.

---

## Files with the same patterns, NOT in this pass (surfaced for follow-up)

These were not listed for this pass but carry the same spec-violating patterns. Tracked as a future wave in the tasks phase per `/speckit.specify→plan→tasks` flow:

| File | Pattern | Suggested action |
| ---- | ------- | ----------------- |
| `objects/window.js` | `#`-privates (FR-013); `static #windows`/`#windowsByName` registries; Proxy `WindowObject.window` static; `_register`/`_unregister`/`_bringToFront`/`_sendToBack`/`_reset` statics (FR-005) | Refactor to plain public documented fields per FR-036 (full surface; `openMovie`/MIAW stubbed). Move registry to `runtime/subsystems/window-registry.js` |
| `objects/sound.js` | `#`-privates (FR-013); `#channels` Map; ad-hoc `AudioContext` inside `beep()` | Refactor to plain public fields. Per FR-034, the `AudioContext` graph belongs to `DirectorContext`; `beep()` routes through the context's audio graph (subsystem-wired in tasks phase) |
| `runtime/context.js` | Currently does not expose `EventTarget` lifecycle dispatch, audio context, net state, member registry, external params | Becomes `DirectorContext extends EventTarget` per [data-model.md](./data-model.md) Phase B and [contracts/imperative-runtime.md](./contracts/imperative-runtime.md). Tasks phase adds subsystem instances + lifecycle dispatch |
| `runtime/player/*` | AI scaffolding, not aligned with the worker bootstrap / event-loop / cast-loader / mount-imperative-run design | Redesign per [contracts/imperative-runtime.md](./contracts/imperative-runtime.md) and [contracts/custom-elements.md](./contracts/custom-elements.md). See "Subsystems and player redesign" below |

---

## Subsystems and the imperative `runtime/player/` redesign (the "glue")

### New `runtime/subsystems/` folder (introduced by [plan.md](./plan.md))

| Subsystem | File | Owns | Caller-side wiring | FR |
| --------- | ---- | ---- | ------------------ | -- |
| **MemberRegistry** | `member-registry.js` | Per-cast by-number and per-cast/movie by-name member lookup | `CastLibraryObject.member`, `MovieObject.member`, global `member()` all hold a ref to the active context's registry and delegate | FR-004/FR-025 |
| **NetState** | `net-state.js` | Per-`netID` in-flight `fetch()` state, status/result accessors | `NetLingoObject` and the net-* top-level methods delegate; `gotoNetMovie`/`gotoNetPage` post main-thread relay messages | FR-033 |
| **WindowRegistry** | `window-registry.js` | Per-context named Window lookup/insert/order (replaces `WindowObject.window` static) | `WindowObject` ctor registers; `WindowObject.forget`/`moveToFront`/`moveToBack` route; `frontWindow` and `window(name)` look up by name | FR-005/FR-036 |
| **(Audio graph)** | Held by `DirectorContext.audioContext` (not a separate subsystem file) | One `AudioContext` per worker; `SoundChannelObject` accesses its `GainNode`/`StereoPannerNode` chain via the context | `Sound`/`SoundChannel`/`SoundMember` route through `DirectorContext` set during activation | FR-034 |

### `runtime/context.js` redesign (becomes the glue)

`DirectorContext extends EventTarget`. Fields per [data-model.md](./data-model.md) Phase B: `movie`, `player`, `sound`, `key`, `mouse`, `system`, `global` (singletons); `castLibs`; `memberRegistry`; `netState`; `audioContext`; `canvas`; `eventLoopHandle`; `externalParams` (frozen `{name,value}[]` from bootstrap); `destroyed` flag; the MovieDefinition's `name`/`src`/`tempo`/`width`/`height` mirrored. Methods: `activate()` (writes singletons to worker `globalThis` slots AND `runtime/singletons.js` module live-binding slots per Research R3), `destroy()` (stops loop, closes `AudioContext`, releases canvas, idempotent flag). Lifecycle events dispatched on `this` (FR-028/FR-037).

### `runtime/player/` redesign (imperative API — see contracts)

| File | Role | Spec ref |
| ---- | ---- | -------- |
| `mount.js` (or new `run.js`) | Main-thread `run(input, options)` entry returning `MainThreadImperativeHandle` (`EventTarget`); spawns the `Worker`; owns its lifecycle; queues messages until `ready` | FR-019/FR-021 |
| `worker-host.js` | Main-thread side: `Worker` owner, `postMessage` protocol dispatcher per [contracts/imperative-runtime.md](./contracts/imperative-runtime.md) message table | FR-019/FR-021/FR-028/FR-035 |
| `worker-shim.js` | Worker side: bootstrap installed on worker `globalThis` BEFORE bundle import; installs `@/lingo` exports, `DirectorContext`, `_installSingletons`; consumes the `init` message and loads the bundle via dynamic `import()` | FR-026/FR-027 |
| `event-loop.js` | Worker side: `setTimeout`-re-arm loop at `1000/tempo`; dispatches the full documented lifecycle sequence on `DirectorContext` per FR-037, Score-independent | FR-019/FR-028/FR-037 |
| `cast-loader.js` | Worker side: walks `MovieDefinition.casts[].members[]`; constructs live `CastLibraryObject`/`MemberObject` via the `MemberRegistry` subsystem; decodes inline media payloads via JS-native backends (per FR-032/FR-011) | FR-011/FR-032/FR-025 |
| `script-lifecycle.js` | Worker side: runs movie-level script handlers (e.g., `startMovie`/`stopMovie`); details deferred to tasks phase | FR-037 |
| `canvas.js` | Main-thread side: `OffscreenCanvas` host-node + transferable wiring | FR-029 |
| `custom-elements.js` + `custom-elements/` | `<x-object>`/`<x-embed>`/`<x-param>` definitions per [contracts/custom-elements.md](./contracts/custom-elements.md); thin layer over `run()` | FR-020/FR-029/FR-030/FR-035 |
| `__tests__/` (existing) | AI-authored; assert patterns no longer in scope per the new design | To be rewritten/removed in the tasks phase |

---

## Test handling (decision deferred to `/speckit.tasks`)

The existing `__tests__` co-located with these objects assert spec-violating behavior (Proxy/static/localStorage/throw-on-set read-only enforcers). They were authored alongside the violating source. The three candidate strategies surfaced for the tasks phase:

- **Rewrite tests per refactored file** (recommended) — drop Proxy/static/localStorage assertions; keep documented-behavior tests (e.g., SoundChannel `play()`/`stop()` state); add new tests for plain-field defaults.
- **Delete tests for refactored files** — re-author later once subsystems land (loses interim coverage).
- **Leave tests failing** — mark the spec-violations for follow-up; smallest change, red suite.

This plan recommends **rewrite tests per refactored file**. `/speckit.tasks` finalizes the per-file test-edit list.

---

## Packaging API redesign (`runtime/package/`) — delete and restart

### What's wrong with the AI scaffold

| File | Problem |FR/Principle violation |
| ---- | ------- | ---------------------- |
| `member-factories.js` | 12 factory functions + a shared `applyCommon()` helper — creates `MemberObject` instances (live objects) with type symbols. Premature abstraction: each factory is 2–4 lines that could live inline in the cast builder. | FR-017 (build returns pure data, not live objects); YAGNI/KISS |
| `cast.js` | `CastBuilder` delegates each `.bitmap()`/`.field()`/etc. to a factory function in `member-factories.js`. `.build()` returns a live `CastLibraryObject` and calls `CastLibraryObject._register()` (static registry). | FR-017 (must return pure definition data); FR-005 (no statics); YAGNI (indirection to factories) |
| `define-cast.js` | Convenience wrapper with a `METHODS` lookup table that re-dispatches to `cast(name)`. Unnecessary layer. | YAGNI — the builder itself is the API; no second convenience layer |
| `define-movie.js` | Convenience wrapper that builds a `DirectorContext` and calls `activate()`. Mixes packaging (pure data) with runtime (context construction) — the runtime consumes the definition, the builder should NOT create contexts. | FR-017/separation of packaging vs. runtime |
| `movie.js` | The ONLY file to keep — clean builder style, returns a plain `{ … }` object. The user confirmed this is the style template. | ✅ Compliant |

### Redesign directives (YAGNI / KISS)

1. **Delete** `member-factories.js`, `define-cast.js`, `define-movie.js`. Their functionality is either unnecessary (convenience wrappers) or belongs inline in the builder.
2. **Keep** `movie.js` as-is (the style template). Optionally add `Object.freeze` to `.build()` output per the spec.
3. **Rewrite** `cast.js`:
   - `cast(name)` returns `new CastBuilder(name)`.
   - `CastBuilder` lives in the same file (not exported).
   - Per-type member methods (`.bitmap(name, opts)`, `.field(name, opts)`, etc.) are **inline** — each constructs a plain `{ kind: "member", name, mediaType: "…", payload: opts }` object directly in the method body and pushes it to `this._members`. **No factory file, no `applyCommon()` helper, no delegation.**
   - `.build()` constructs and returns a frozen `{ kind: "cast", name, members }` plain object. **Not** a `CastLibraryObject` — pure data per FR-017.
   - Member numbers are assigned sequentially by `build()` (1-indexed, compact) per FR-017 — inline in the `build()` method, not via a registry or a `nextCastLibNumber()` helper.
   - No `CastLibraryObject._register()` call, no static registry — the definition is inert data; the `cast-loader` in the worker constructs live objects from it.
4. **No external method calls from within builder methods** — the code lives in the method body. This is the user's explicit directive: "the code should live almost always in the same method without calling external methods."
5. **`defineMovie` is NOT rebuilt** — if the runtime needs to ingest a movie definition, it does so via the imperative `run()` entry point ([contracts/imperative-runtime.md](./contracts/imperative-runtime.md)), not via a packaging helper. The packaging system produces definitions only; the runtime consumes them.

### What the redesign keeps from the AI version (external API shape)

- `movie(name).cast(castDefinition).build()` — the chain shape works.
- `cast(name).<memberType>(name, opts).build()` — per-type registration methods are the API surface.
- `.build()` returns a plain object — the shape the runtime consumes.

The user confirmed: "you can look it as an example because externally worked fine, but internally was a mess." So the external method signatures stay; the internals become inline plain-object construction.

### Output shape (per [data-model.md](./data-model.md) Phase A and [contracts/packaging-builders.md](./contracts/packaging-builders.md))

```js
// movie.js .build() output (unchanged style):
{ kind: "movie", name, casts: [...], tempo, width, height, src }

// cast.js .build() output (redesigned — pure data, member numbers assigned by build):
{
  kind: "cast",
  name,
  members: [
    { kind: "member", name: "Intro", number: 1, mediaType: "field", payload: { text: "Welcome" } },
    { kind: "member", name: "Beep",   number: 2, mediaType: "sound", payload: { audioBytes: … } },
    …
  ]
}
```

### Files after redesign

```text
runtime/package/
├── __tests__/          # rewrite to match the new inline builders
├── cast.js             # rewrite: inline member construction, pure data .build()
└── movie.js           # keep (style template)
```

Deleted: `member-factories.js`, `define-cast.js`, `define-movie.js`.

---

## Tracking TODOs for `/speckit.tasks`

- Per-file refactor wave: `player.js`, `sound-channel.js`, `sprite-channel.js`, `sprite.js`, `methods/window.js` (source); optional JSDoc on `methods/sound.js`.
- Co-located test rewrites per the chosen test-handling strategy.
- Add `runtime/subsystems/` folder + `member-registry.js`, `net-state.js`, `window-registry.js` stubs (per FR-006; wire callers in subsequent tasks).
- Redesign `runtime/context.js` to `extends EventTarget` with the full glue shape.
- Redesign `runtime/player/` per the table above; rename/merge `mount.js` → `run()` entry.
- Add deep-`Object.freeze` to the canon `runtime/package/movie.js` `build()` output and propagate to the upcoming `cast()`/member-registration helpers.
- Future wave: refactor `objects/window.js` and `objects/sound.js` to align with the same canon style.

Plan stays in design — no source changes were made in this turn.