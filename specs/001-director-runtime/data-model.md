# Data Model: Director Runtime

Entities are pure data (built via the packaging DSL; see [packaging-builders.md](./contracts/packaging-builders.md)) or live runtime objects (constructed by the runtime on ingest into a worker's `DirectorContext`). Fields below are the contract shape; sub-bullets cite the FR that constrains each.

---

## Phase A — Packaging definitions (built via builders; frozen on `.build()`)

### `MovieDefinition`
The default export of a bundle ES module (FR-026). Produced by `movie(name).cast(c).build()`.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `kind` | `"movie"` | structural discriminator (FR-026 validation) |
| `name` | `string` | authored movie name; non-empty |
| `source` | `string \| undefined` | ES module URL the bundle was loaded from (set by loader, not author) |
| `width` | `number` | stage width in pixels (default 640) |
| `height` | `number` | stage height in pixels (default 480) |
| `tempo` | `number` | frames per second (default 30; ≥1) |
| `casts` | `CastDefinition[]` | ordered list; ≥1 |
| `externalParams` | `{ name: string; value: string }[] \| undefined` | bootstrap-supplied (declarative path from `<x-param>`s); immutable snapshot |

Validation: `kind` === `"movie"` && `typeof name === "string"` && `Array.isArray(casts) && casts.every(c => c.kind === "cast")` (FR-026). On invalid → `InvalidBundleError`.

### `CastDefinition`
Produced by `cast(name).<member…>.build()`.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `kind` | `"cast"` | |
| `name` | `string` | non-empty |
| `members` | `MemberDefinition[]` | registration order = member number order (1-indexed, compact, FR-017) |

### `MemberDefinition`
Base shape; per-media-type variants add a `payload` field (FR-032 inline typed array/string). Excluded (stub) types use the base shape only.

| Field | Type | Notes |
| ----- | ---- | ----- |
| `kind` | `"member"` | |
| `name` | `string` | authored, unique within the cast (duplicate-name across castLibs is allowed; resolved by Movie.member per FR-025 search order) |
| `number` | `number` | auto-assigned by registration order (NOT authored); 1-indexed; gaps compacted (FR-017) |
| `mediaType` | `string` | one of the 19 documented Director media types (8 included + 11 excluded) — selects the `X...Member` subclass to construct (FR-011/FR-012) |
| `payload` | `Uint8Array \| Int8Array \| Uint16Array \| Int16Array \| Uint32Array \| Int32Array \| Float32Array \| Float64Array \| string \| undefined` | inline media bytes/text; never a URL (FR-032); `undefined` for excluded-stub types and pure-metadata members |

### State transitions (packaging phase)
`movie Builder accumulating` —(`.cast(c)`)→ accumulating —(`.build()`)→ **frozen MovieDefinition** (immutable).

---

## Phase B — Live runtime objects (in worker, per `DirectorContext`)

### `DirectorContext` (single per worker)
Owns the live singletons, the member registry, the audio graph, net state, the event-loop handle, and the `OffscreenCanvas` (render surface).

| Field | Type | Notes |
| ----- | ---- | ----- |
| `name`, `src`, `tempo`, `width`, `height` | as per MovieDefinition | mirrored into context at ingest |
| `movie`, `player`, `sound`, `key`, `mouse`, `system`, `global` | live `X...Object` singletons | `activate()` writes to worker `globalThis` slots AND `singletons.js` module slots (FR-003/FR-016/FR-027) |
| `castLibs` | `CastLibraryObject[]` | constructed from `MovieDefinition.casts` |
| `memberRegistry` | `MemberRegistry` subsystem instance | consulted by `CastLibraryObject.member`, `MovieObject.member`, global `member()` (FR-004/FR-025) |
| `netState` | `NetState` subsystem instance | tracks `netID` → inflight `fetch()` state (FR-033) |
| `audioContext` | `AudioContext` (worker) | graph root for `Sound`/`SoundChannel`/`SoundMember` decode/playback (FR-034) |
| `canvas` | `OffscreenCanvas \| null` | transferred from main-thread canvas (FR-029) |
| `eventLoopHandle` | `{ stop(): void } \| null` | from `event-loop.js` `setTimeout` re-arm; cleared on `destroy()` (FR-019/FR-021) |
| `externalParams` | `{ name; value }[]` | frozen snapshot from bootstrap (FR-035) |
| `isEventTarget` (implicit) | `extends EventTarget` | lifecycle events dispatched here (FR-028/FR-037) |
| `destroyed` | `boolean` | set by `destroy()`; idempotent |

### `MemberRegistry` (subsystem, per context)
| Field | Type | Notes |
| ----- | ---- | ----- |
| `byNumber` | `Map<{castLibName}, Map<number, MemberObject>>` | O(1) per-castLib lookup |
| `byName` | `Map<string, MemberObject[]>` | name → member(s). Multiple castLibs may share a name; `Movie.member`(byName) returns the first in castLib order (FR-025); edge case flagged in spec |
| `byNameInCastLib` | `Map<{castLibName}, Map<string, MemberObject>>` | O(1) per-castLib by-name |
| `register(castLib, member)`, `unregisterAll(castLib)`, `lookupByNumber(castLib, n)`, `lookupByNameInCastLib(castLib, name)`, `lookupByNameInMovie(movie, name)` | methods | single code path — no static methods on any object class (FR-005) |

### `NetState` (subsystem, per context)
| Field | Type | Notes |
| ----- | ---- | ----- |
| `nextId` | `number` | monotonic |
| `ops` | `Map<number, { status: "inflight"\|"done"\|"error"; response?: Response; data?: *\|null; error?: Error\|null; mime?: string; lastMod?: Date\|null; abortController: AbortController; stream?: ReadableStream }>` | per-`netID` record (FR-033) |
| `gotoNetMoviePendingUrl` | `string\|null` | main-thread-relay flag |

### `SoundChannelObject` (core object) Web Audio wiring (per-channel, owned by DirectorContext.audioContext)
| Field | Type | Notes |
| ----- | ---- | ----- |
| `input` | `AudioNode` | where source `AudioBufferSourceNode`s connect |
| `gainNode` | `GainNode` | volume |
| `pannerNode` | `StereoPannerNode` | pan |
| `volume` (get/set) | `number` | proxy to `gainNode.gain` (FR-034) |
| `pan` (get/set) | `number` | proxy to `pannerNode.pan` (FR-034) |
| chain: `input → gainNode → pannerNode → audioContext.destination` (FR-034) | | |

### Member subclass construction (per context, built by `cast-loader.js`)
The cast-loader walks `MovieDefinition.casts[].members[]`:
- `member.number` ← `MemberDefinition.number` (already assigned by the builder per FR-017)
- `member.mediaType` ← `MemberDefinition.mediaType` selects the `X...Member` subclass (FR-011/FR-012)
- included types pass `MemberDefinition.payload` to the subclass's JS-native decoder (e.g., `SoundMember` → `AudioContext.decodeAudioData`; `BitmapMember` → `OffscreenCanvas`/`createImageBitmap` from Blob, *decoding the inline typed-array*; `FieldMember`/`TextMember` → decode string)
- excluded types construct the stub `X...Member` with no decoder; `payload` is ignored (FR-012)
- the constructed `MemberObject` is registered in `MemberRegistry` keyed by `(castLib, number)` and `(castLib, name)` (FR-025)

---

## Phase C — Data-type classes (P1; see [lingo-public-api.md](./contracts/lingo-public-api.md) for full documented surface)

Per Director docs (1:1); natives are used where docs map a Director type to JS native:

| Director type | JS representation | Notes |
| ------------- | ----------------- | ----- |
| `Color` | class `Color` (RGB, named constants follow docs) | docs say it's its own type |
| `List` | class `List` wrapping a JS `Array` | docs have `add`/`get`/`count`/`deleteAt`/etc. — Director semantics, NOT raw Array API |
| `PropList` | class `PropList` wrapping paired arrays/`Map` | same methods as `List` + property-name/value |
| `Point` | class `Point` (locH, locV) + operators | docs-documented properties/methods |
| `Rect` | class `Rect` (left, top, right, bottom, derived width/height) + methods | docs-documented |

---

## Phase D — Main-thread data shapes (imperative handle + custom element)

### `MainThreadImperativeHandle` (returned by `run()`, `EventTarget`)
| Field | Type | Notes |
| ----- | ---- | ----- |
| `worker` | `Worker` | owned by the main thread (FR-019) |
| `pendingMessages` | `any[]` | queued before worker `READY` |
| `addEventListener` (inherited) | | for `externalEvent` (FR-035) and start/stop/destroy events |
| methods: `start()`, `stop()`, `destroy()`, `goToFrame()` (stubbed, no Score) | | delegate via `postMessage` (FR-019/FR-021); `destroy()` posts `{kind:"destroy"}` then `worker.terminate()`; raises `destroyed:true` on the handle (FR-021) |

### `XObjectElement` / `XEmbedElement` / `XParamElement` (custom element state)
| Field | Type | Notes |
| ----- | ---- | ----- |
| `bundleUrl` | `string\|null` | from `[src]` attribute (x-object/x-embed) |
| `params` | `{ name; value }[]` | from children `<x-param name=… value=…>` collected at `connectedCallback`; frozen and forwarded to worker (FR-035) — edge case: post-connect mutation is a stale snapshot (spec Edge Cases) |
| `handle` | `MainThreadImperativeHandle\|null` | the underlying imperative handle (P8 = thin layer over P7); `disconnectedCallback` calls `handle.destroy()` (FR-021) |
| `canvasElement` | `HTMLCanvasElement` | inserted by the element; `transferControlToOffscreen()` called and sent to the worker (FR-029) |

---

## Validation rules (consolidated, by source FR)
- FR-017: member numbers NOT authored; assigned sequentially; gaps compacted.
- FR-025: `Movie.member(byName)` searches castLibs in declaration order, returns first match.
- FR-026: bundle MUST be an ES module with a valid `MovieDefinition` as `default`; else `InvalidBundleError`.
- FR-031: no Score section; `Sprite`/`SpriteChannel` Score-dependent surface stubbed; frame-nav methods stubbed but lifecycle events fire (FR-037).
- FR-032: media payloads MUST be inline typed arrays/strings; never URLs; worker decodes in-memory.
- FR-036: `Window` exposes full surface; `openMovie`/sibling-movie returns documented no-op.

## State transitions (runtime lifecycle per worker)
```
[mounted bundle URL] → import() → [MovieDefinition] → ingest →
  build DirectorContext (empty) → cast-loader populates MemberRegistry →
  activate() [installs singletons on globalThis + module slots] →
  transfer OffscreenCanvas from main thread → start event-loop (setTimeout@tempo) →
  dispatch prepareMovie/startMovie → tick (prepareFrame→enterFrame→…→exitFrame; idle; timeout) → … →
  [destroy()] stop event-loop → dispatch stopMovie → AudioContext.close+suspend →
  postMessage({kind:"destroy"}) → main thread worker.terminate() → DirectorContext.destroyed=true
```