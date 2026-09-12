# Data Model — Director Runtime (015)

**Feature**: `015-director-runtime` | **Spec**: [spec.md](./spec.md) | **Status**: authoritative design;
code is `packages/director/src/`.

Units: frames 1-based; sprite channels 1..48 (0 = stage); tempo = frames/second; pan −100..100;
volume 0–1 (Web Audio gain) vs Director channel volume 0–255 (field on `SoundChannelObject`).

Where code and this model disagree, the spec wins; disagreements found in the implementation are
listed in [Known implementation gaps](#known-implementation-gaps) at the end.

---

## 1. Data types & constants

### 1.1 `Color` — `engine/base/color.js` (R-11, FR-009)

Purpose: RGB or 8-bit palette-index color value.

| Field | Type | Meaning |
|-------|------|---------|
| `red` | number | red channel, integer 0–255 (truncated, clamped on set) |
| `green` | number | green channel, integer 0–255 (truncated, clamped on set) |
| `blue` | number | blue channel, integer 0–255 (truncated, clamped on set) |
| `paletteIndex` | number \| undefined | read-only; set when built from a palette index, cleared when an RGB channel is assigned |

Relationships: constructor `new Color(r,g,b)` defaults each channel to `0`; the `color()` creator
(`api/methods/color.js`, owner `creator`) is the public form: one argument = palette index (derives
RGB from the palette and records `paletteIndex`), three arguments = RGB. Built-in palettes are
addressed by symbol (`#rainbow`, `#systemMac`, `#systemWin`, `#grayscale`); unknown palette symbols
fall back to the default palette.

Validation: fractional/out-of-range channels are truncated then clamped to 0–255; no `hex`, `rgb`,
or `equals` members; `rgb()` is absent from the API (FR-009, R-11).

### 1.2 `List` — `engine/base/list.js` (FR-010)

Purpose: 1-based linear list.

| Field | Type | Meaning |
|-------|------|---------|
| `items` | array | entry storage; index 0 is position 1 |
| `sorted` | boolean | sticky sorted state; `sort()` sets it, `add()` inserts in order while true |
| `count` | number (getter) | derived from `items.length` |

Commands: `add`, `addAt`, `append`, `deleteAt`, `deleteOne`, `deleteProp`, `duplicate`, `getAt`,
`getOne`, `getPos`, `getLast`, `setAt`, `sort`; `Symbol.iterator`; bracket/`list()` proxy maps
integer properties to `getAt`/`setAt`/`in`.

Validation / doc rules: 1-based indexing; `setAt` past the end pads with `0`; `deleteAt` on an
absent position is a no-op; `getOne`/`getPos` return `0` when missing; `getLast()` on empty is
`VOID` (null); `getAt` out of range is a script error; `sort()` orders numbers before strings
alphanumerically; `duplicate()` deep-copies nested `List`s and preserves `sorted`.

### 1.3 `PropList` — `engine/base/prop-list.js` (FR-011)

Purpose: ordered property-name/value list.

| Field | Type | Meaning |
|-------|------|---------|
| `entries` | array of `{ symbol, value }` | ordered entries; `symbol` may be a string or `Symbol.for(...)` |
| `sorted` | boolean | sticky; sorted by property name |
| `count` | number (getter) | derived from `entries.length` |

Commands: `addProp` (duplicates an existing property), `deleteAt`, `deleteOne`, `deleteProp`,
`duplicate`, `findPos`, `findPosNear`, `getaProp`, `getAt`, `getOne` (returns the property),
`getPos`, `getProp`, `getPropAt`, `setaProp`, `setAt`, `sort`; bracket/symbol-key proxy.

Validation / doc rules: `getaProp`/`findPos` on a missing property return `VOID`; `getProp`,
`getPropAt`, and out-of-range `getAt` throw script errors; `getPropAt` out of range throws;
`setaProp` adds when missing; `setAt` out of range throws; `findPosNear` is the nearest
alphanumeric property (or `length + 1`); `deleteAt` on an absent position is a no-op; missing
property access through the `propList()` proxy throws a script error.

### 1.4 `Point` / `Rect` — `engine/base/point.js`, `engine/base/rect.js` (FR-012, R-01)

| Type | Fields | Bracket access | Notes |
|------|--------|----------------|-------|
| `Point` | `locH`, `locV` (number, default 0) | `[1]` = `locH`, `[2]` = `locV` | proxy returned by `point()` |
| `Rect` | `left`, `top`, `right`, `bottom` (number, default 0) | `[1]`..`[4]` in that order | **no** `width`/`height` members — consumers derive `right − left`, `bottom − top` (R-01) |

Validation: documented members only; property and bracket syntax agree; no invented normalization.

### 1.5 Constants — `engine/base/constants.js` (FR-014, R-10)

| Constant | Value | Notes |
|----------|-------|-------|
| `EMPTY` | `""` | |
| `VOID` | `null` | |
| `RETURN` | `"\r"` | carriage return |
| `SPACE` | `" "` | |
| `TAB` | `"\t"` | |
| `BACKSPACE` | `"\b"` (charCode 8) | |
| `ENTER` | `"\x03"` (charCode 3) | numeric-keypad Enter |
| `QUOTE` | `'"'` | |
| `TRUE` | `true` | numeric semantics: nonzero integers evaluate true |
| `FALSE` | `false` | numeric semantics: `FALSE` behaves as 0 |
| `PI` | `Math.PI` | |

The `constants.txt` JavaScript-column keyCodes are alternatives for `_key.keyCode` comparisons,
not Lingo constant values (R-10).

---

## 2. Chunk expressions — `engine/syntax/` (FR-015..FR-017, R-25)

Purpose: Lingo chunk reads/writes over a container string.

Selector surface (12 exports): `char(n)`, `charRange(a,b)` ≡ `char(a).to(b)`, `item`, `itemRange`,
`line`, `lineRange`, `word`, `wordRange`, `putInto`, `putBefore`, `putAfter`, `the`.

| Concept | Shape | Meaning |
|---------|-------|---------|
| selector | `char(n)` → `{ of(str), to(m) }` | single read / range read |
| `ChunkBound` | `String` subclass + non-enumerable `meta` | string-valued read result; `meta = { kind, container, charStart, charEnd }`; also used by `put*` as the target span |
| `put*` target | plain string or `ChunkBound` | plain string addresses the whole container; `charStart < 0` marks a nonexistent target |
| `put*` result | string | new whole container |

Split rules (`chunk-split.js`):

| Kind | Split | Notes |
|------|-------|-------|
| chars | `str.split("")` | UTF-16 code units |
| items | live `the.itemDelimiter` | default `","`; read at call time |
| lines | `str.split("\r")` | CR only; no `\n` |
| words | `str.split(/[ \t\r\n]/)` | spaces/whitespace |

Validation / doc rules: 1-based positions; out-of-range singles read `""`; range ends clamp to the
last chunk; `start > end` or `start < 1` reads `""`; empty/non-string containers read `""`; empty
chunks count (trailing/consecutive delimiters); item ranges rejoin included parts (`,`-default
rejoin renders as `", "` per the US2 example); `putInto` replaces the target chunk, `putBefore`/
`putAfter` insert without replacing; nonexistent targets append at the boundary; every `put*`
takes the chunk expression first, stringifies the value, and returns the new string (FR-017).

Relationship: `ChunkBound` is string-valued in string contexts, `String()`, and `==` comparisons;
`===` against a primitive is false (translated code uses `==`) (R-25).

---

## 3. `the` property table — `engine/syntax/the-proxy.js` (FR-018..FR-020)

Purpose: a single exported proxy exposing the doc-derived `the` surface. It is **not** installed
on `globalThis` at import (R-26); the runner installs it (see `worker-shim.js`). Reads/writes
delegate live through the active context's core objects and the Score; with no context each row
returns its documented default. Writes to read-only rows throw `Cannot set read-only property:
the <name>`; unknown names throw `Script error: unknown the property: <name>`.

Kinds: `local` (proxy backing), `core` (field on a named singleton), `score` (live Score field),
`computed` (Date-derived), `constant`, `noop` (stable documented default until its source lands).

| Property | Aliases | Kind/source | RW | Default | Notes |
|----------|---------|-------------|----|---------|-------|
| `itemDelimiter` | | local | RW | `","` | drives item chunking |
| `floatPrecision` | | local | RW | `4` | |
| `randomSeed` | | local | RW | `0` | |
| `selection` / `selStart` / `selEnd` | | local | RW | `""` / `0` / `0` | |
| `rollover` | | local | RO | `0` | |
| `movieName` / `moviePath` | | local | RO | `""` | |
| `platform` | | local | RO | `"JavaScript"` | |
| `mouseH` / `mouseV` | | `_mouse` | RO | `0` | |
| `mouseDown` / `mouseUp` | | `_mouse` | RO | `false` | |
| `clickOn` | | `_mouse` | RO | `0` | |
| `clickLoc` | | `_mouse` | RO | `null` | |
| `doubleClick` | | `_mouse` | RO | `false` | |
| `key` | | `_key` | RO | `""` | |
| `keyCode` | | `_key` | RO | `0` | |
| `shiftDown` / `controlDown` / `commandDown` / `optionDown` | | `_key` | RO | `false` | |
| `frame` | | score | RO | `0` | live playhead (0 with no current frame) |
| `frameLabel` | | score | RO | `""` | current frame marker, `""` when markerless |
| `frameTempo` | | score | RO | `30` | live movie tempo |
| `framePalette` | | noop | RO | `0` | |
| `marker` / `label` / `labelList` | | noop | RO | `""` | |
| `markerList` | | noop | RO | `[]` | |
| `lastChannel` / `currentTime` / `timeoutLapsed` / `numberOfMembers` / `numberOfXtras` / `numberOfMenus` | | noop | RO | `0` | |
| `numberOfCastLibs` | | noop | RO | `1` | |
| `path` / `name` / `copyrightInfo` | | `_movie` | RO | `""` | |
| `exitLock` / `beepOn` | | `_movie` | RW | `false` | |
| `centerStage` / `editShortCutsEnabled` | | `_movie` | RW | `true` | |
| `keyboardFocusSprite` | | `_movie` | RW | `-1` | |
| `alertHook` | | `_player` | RW | `null` | |
| `debugPlaybackEnabled` | | `_player` | RW | `false` | |
| `runMode` | | `_player` | RO | `"Plugin"` | |
| `productName` / `productVersion` | `version` | `_player` | RO | `"Director"` / `"MX 2004"` | |
| `colorDepth` | | `_system` | RO | `32` | |
| `soundEnabled` | | `_sound` | RW | `true` | |
| `soundLevel` | | `_sound` | RW | `7` | |
| `milliseconds` | `milliSeconds` | computed | RO | `Date.now()` | |
| `timer` / `ticks` | | computed | RO | monotonic ms / 60ths | |
| `time` / `date` / `longTime` / `long` / `short` / `abbreviated` / `abbreviatedTime` / `systemDate` | | computed | RO | `Date`/`Intl` locale formats | |
| `pi` | | constant | RO | `Math.PI` | |
| `maxInteger` | `maxinteger` | constant | RO | `2147483647` | |
| `true` / `false` / `void` / `empty` | | constant | RO | `true` / `false` / `null` / `""` | |
| `tab` / `space` / `return` / `quote` | | constant | RO | `"\t"` / `" "` / `"\r"` / `'"'` | |

Function forms (callable on the proxy): `numberOfCharsIn(str)`, `numberOfItemsIn(str)` (live
delimiter), `numberOfLinesIn(str)`, `numberOfWordsIn(str)`, `lastCharIn(str)`, `lastWordIn(str)`,
`lastItemIn(str)`, `lastLineIn(str)`, `numberOfCastMembersOfCastLib(castLib)` (no-op `0`).

Validation: no `wordDelimiter`/`lineDelimiter` (or any other undocumented row) exists;
`frame`/`frameLabel`/`frameTempo` are the only live Score-backed rows; casing aliases are limited
to `milliSeconds` and `maxinteger` (FR-018..FR-020).

---

## 4. Runtime state machine

One `DirectorContext` and one event loop per worker; the main-thread handle mirrors the worker
state. Transitions:

| State | Entered when | Behavior | Leaves to |
|-------|--------------|----------|-----------|
| `booting` | `run()` spawns the worker and posts `init` | worker installs globals, imports the bundle, ingests, activates, builds renderer/audio | `ready` or `error` |
| `ready` | `init` succeeds and `{kind:"ready"}` is posted | host may flush queued MT messages; `start` is accepted | `running` (start) or `destroyed` (destroy) / `error` |
| `running` | `start` accepted | `prepareMovie` → `startMovie`, then the tempo-driven tick loop (`frameStep` per tick) | `stopped` (stop) or `destroyed` (destroy / error halt) |
| `stopped` | `stop` accepted | loop cleared/timer disarmed; context, score, audio, and canvas stay alive | `running` (start again) or `destroyed` |
| `destroyed` | `destroy` accepted | terminal and idempotent: `stopMovie` once, audio `close()`, canvas released, active pointer detached, worker terminated; no further lifecycle events | — |
| `error halt` | bundle import / ingest failure, or a lifecycle handler throws | `{kind:"error"}` posted; movie halted (`stopMovie`); the loop does not continue; host surfaces the error and tears the worker down | `destroyed` |

Validation: `destroy` is idempotent (`context.destroy()` and `handle.destroy()` both guard);
`stop` is resumable; an error during `init` never reaches `ready`; no lifecycle event may fire
after destroy (FR-023, FR-058, FR-065).

---

## 5. `DirectorContext` — `engine/subsystem/context.js` (FR-021..FR-023)

Purpose: the per-worker movie aggregate and lifecycle `EventTarget`.

| Field | Type | Meaning |
|-------|------|---------|
| `movie`, `player`, `sound`, `key`, `mouse`, `system`, `global` | `X...Object` | the seven core-object instances as consts; they **are** the global state (R-02) |
| `name`, `src`, `tempo`, `width`, `height` | string/number | movie identity/stage state, defaults `""`, `""`, `30`, `640`, `480` |
| `castLibs` | `CastLibraryObject[]` | cast slot table (populated + empty) built by ingest |
| `memberRegistry` | `MemberRegistry` | exactly one per context |
| `netLingo` | `NetLingoObject` | exactly one; owns net logic + `netState` |
| `netState` | `NetState` | compatibility alias of `netLingo.netState` (R-14) |
| `windowRegistry` | `WindowRegistry` | exactly one |
| `score` | `Score` | playhead/channel/tempo model |
| `puppetSprites` | `Map<number, SpriteObject>` | puppet register keyed 1..48; preempts the Score |
| `_liveSprites` / `_liveHydratedAt` / `_spriteChannels` / `_stageSprite` | `Map`/`SpriteObject` | live-sprite cache, hydration frame marks, `SpriteChannelObject` cache, inert stage sprite |
| `audioContext` | `AudioContext \| null` | host ambient resource |
| `canvas` | canvas \| null | transferred/owned render target reference |
| `eventLoopHandle` | `{ stop() } \| null` | loop stop handle |
| `externalParams` | frozen `{name,value}[]` | cloned at construction; runtime must not read the DOM (FR-072) |
| `destroyed` | boolean | terminal flag |

Methods: `activate()`; `sprite(n)` (puppet register → Score cell hydrate, `0` stage, unknown
`null`); `spriteChannel(n)`; `puppetSprite(n, bool)`; `isScripted(n)`; `destroy()`; lifecycle
hooks `prepareMovie/startMovie/stopMovie/prepareFrame/enterFrame/exitFrame/beginSprite/endSprite/
idle/timeout`; `frameStep()` (see [score-lifecycle.md](./contracts/score-lifecycle.md)).

Relationships: owns all subsystem instances; the API methods and `the` resolve it through the
accessor; `EventTarget` dispatch target for all lifecycle events; sprite objects hydrate from its
Score and resolve members through its `memberRegistry`.

Validation: exactly one per worker/movie (FR-021, FR-071); activation must not mutate module-level
slots or `globalThis` (R-02); `destroy()` releases canvas/audio/loop and detaches.

State transitions: see §4.

---

## 6. Active-context accessor — `engine/subsystem/accessor.js` (FR-022, R-02)

Purpose: the single module-local pointer that every method/proxy/registry consumer resolves.

| Field | Type | Meaning |
|-------|------|---------|
| `_activeContext` | `DirectorContext \| null` | last `activate()`d context, or `null` |

Functions: `getActiveDirectorContext()`, `setActiveDirectorContext(ctx)`.

`engine/subsystem/singletons.js` is the facade over it: `_getMovie()`…`_getGlobal()` resolve the
active context's field or fall back to a module-scoped default instance (fresh defaults exist so
modules/tests work with no context — FR-022). `_getNetLingo()`/`_getNetState()` likewise fall back
to module-scoped default NetLingo/NetState. The bare names `_movie`…`_global` re-export those
getters. Retired: 001/004's mutable live-binding slots and `globalThis` writes at activate.

Validation: one pointer per module graph ⇒ one per worker; two contexts do not leak state; no
context reads never throw.

---

## 7. Registries

### 7.1 `MemberRegistry` — `engine/subsystem/member-registry.js` (FR-025, FR-057)

Purpose: owns all member lookup for the context's movie (FR-005).

| Field | Type | Meaning |
|-------|------|---------|
| `byNumber` | `Map<castKey, Map<number, member>>` | per-castLib by-number index |
| `byNameInCastLib` | `Map<castKey, Map<string, member>>` | per-castLib by-name index |
| `byNameAcrossCastLibs` | `Map<string, member[]>` | cross-castLib name index (declaration order) |
| `nextNumberByCastLib` | `Map<castKey, number>` | next sequential number |

Methods: `register(castLib, member)`, `unregisterAll(castLib)`, `lookupByNumber(castLib, n)`,
`lookupByNameInCastLib(castLib, name)`, `lookupByNameInMovie(movie, name)`. `castLib` is a
`CastLibraryObject` or its name string; the key is the cast name.

Validation: a member without a positive number gets the next sequential number; an explicit number
is preserved and bumps the counter; numbers compact by registration position (FR-050); name is
canonical; cross-castLib lookup walks `movie.castLibs` in declaration order and returns the first
match (FR-025); a member not declared returns the documented empty result, no crash.

### 7.2 `WindowRegistry` — `engine/subsystem/window-registry.js` (FR-005, FR-033)

Purpose: per-context window (MIAW) registry replacing static class registries.

| Field | Type | Meaning |
|-------|------|---------|
| `_byName` | `Map<string, WindowObject>` | name lookup |
| `_order` | `WindowObject[]` | back-to-front z-order list |

Methods: `register`, `unregister`, `lookup`, `list` (snapshot), `frontWindow` (top of z-order or
`null`), `moveToFront`, `moveToBack`, `reset`. Validation: MIAW `openMovie`/sibling-movie
execution remain documented no-ops (FR-033, FR-073); the root/stage window path works.

---

## 8. NetLingo & NetState (FR-041, R-14, R-15)

### 8.1 `NetLingoObject` — `engine/core/scripting/net-lingo.js`

Purpose: owns net logic and transaction state; created via `new xtra("netlingo")`; exactly one per
context; `context.netState` aliases `netLingo.netState`.

| Field | Type | Meaning |
|-------|------|---------|
| `netState` | `NetState` | internal transaction registry |

Methods: status/accessors `netDone`, `netError`, `netMIME`, `netLastModDate`, `netTextResult`,
`getLatestNetID`, `getStreamStatus`, `netAbort`; initiators `getNetText`, `postNetText`,
`preloadNetThing`, `downloadNetThing`, `gotoNetMovie`, `gotoNetPage` (real `fetch()`); deterministic
stubs `browserName`, `cacheDocVerify`, `cacheSize`, `clearCache`, `netStatus`, `proxyServer`,
`URLEncode`, `tellStreamStatus`, `externalEvent` (object-form no-op in v1).

### 8.2 `NetState` — `engine/subsystem/net-state.js`

| Field | Type | Meaning |
|-------|------|---------|
| `nextId` | number | next `netID` |
| `ops` | `Map<number, record>` | transactions |
| `_lastNetId` | number | most recently allocated id (single-arg accessors) |
| `gotoNetMoviePendingUrl` | string \| null | relay flag for `gotoNetMovie` |

Transaction record: `{ status: "inflight"|"done"|"error", response, data, error, mime, lastMod,
abortController, stream, url, localFile, bytesSoFar, bytesTotal }`.

Methods: `begin`, `update`, `isDone`, `isError`, `hasFinished` (done or error — Lingo `netDone`
semantics), `errorString` (`"OK"` when no error, `""` for unknown id), `textResult` (`""` when
none), `mime`, `lastModDate`, `streamStatus`, `get`, `findByUrl`, `abort` (idempotent; in-flight
becomes error), `forget`, `setGotoNetMoviePending`, `takeGotoNetMoviePending`.

Validation (R-15/FR-046): net calls never throw; a rejected/failed fetch completes as error with
`netDone()` true, truthy `netError()`, `netTextResult()` `""`; HTTP failures report
`"HTTP 404"`-style messages; unknown `netAbort` ids are no-ops; aborts record error `"4242"`.

Relationships: top-level `net*` API methods (`api/methods/*`) delegate to the active context's
NetLingo; the worker performs fetches (worker never touches the DOM).

---

## 9. Score — `engine/subsystem/score.js` (FR-024, FR-025, R-05..R-07)

Purpose: playhead/channel/tempo model consumed by sprite resolution, lifecycle, and rendering.

| Field | Type | Meaning |
|-------|------|---------|
| `frames` | array of normalized frames | ordered; `{ marker?, channels: Map<1..48, cell> }` |
| `tempo` | number | movie-level fps (integer ≥ 1, default 30) |
| `_playhead` / `frame` | number | 1-based playhead; starts at `0` (no current frame) |
| `frameLabel` | string (getter) | current frame marker or `""` |

Methods: `setTempo(n)` (puppet tempo; `max(1, floor(n))`, non-finite → 30), `advance()` (increments
until the last frame, then holds; no-op when empty), `go(frameOrMarker)`, `goLoop()`, `goNext()`,
`goPrevious()`, `channel(n)` (`0` → shared frozen `STAGE` marker `{ isStage: true, member: null }`),
`populatedChannels()` (sorted), `markers()` (`[{ marker, frame }]`).

Cell shape (opaque passthrough): `{ member, loc?, size?, visible?, ink?, blend?, rotation?,
puppet?, flipH?, flipV?, skew?, constraint?, moveableSprite?, editable?, cursor?, locZ?,
backColor?, foreColor?, castLib?, memberNum?, quad?, volume? }`.

Validation: frames normalize from `{channels: {n: cell}}` or an array (index+1); channels > 48 are
truncated, channel 0 ignored; navigation over an empty Score is a no-op; tempo clamps to ≥1 integer.

Navigation semantics and tick ordering live in [score-lifecycle.md](./contracts/score-lifecycle.md).

---

## 10. Core objects (13) — `engine/core/` (FR-028)

All are `X...Object` classes, one per module, public plain fields, verbatim documented JSDoc; no
undocumented statics or subsystems (FR-004).

| Class | File | Owned state (documented defaults) | Live behavior |
|-------|------|-----------------------------------|---------------|
| `CastLibraryObject` | `cast-library.js` | `fileName`, `member` map, `name`, `number`, `preLoadMode`, `selection`; `findEmpty()` | populated by ingest (`member` keyed by name and number) |
| `GlobalObject` | `global.js` | — | `clearGlobals()`, `showGlobals()` (surface) |
| `KeyObject` | `key.js` | `key`, `keyCode`, `shiftDown`, `controlDown`, `commandDown`, `optionDown`; `keyPressed()` | input messages update it |
| `MemberObject` | `member.js` | base Member surface (`type`, `name`, `number`, `castLibNum`, `comments`, `rect`, `regPoint`, `media`, `payload` added by ingest, `hilite`, `width`/`height`, …) | `newMember()` subclass + registry registration; payload stays on `payload` (FR-037) |
| `MouseObject` | `mouse.js` | `mouseH`, `mouseV`, `mouseLoc`, `mouseDown`, `mouseUp`, `clickLoc`, `clickOn`, `doubleClick`, `mouseMember`, `mouseChar`/`mouseItem`/`mouseLine`/`mouseWord`, `rightMouse*`, `stillDown` | input messages update it |
| `MovieObject` | `movie.js` | full documented Movie surface (defaults as documented) | `go`/`goLoop`/`goNext`/`goPrevious`/`puppetTempo` delegate to the active Score; `puppetSprite` to the register; `constrainH/V` clamp via helpers; `newMember` |
| `PlayerObject` | `player.js` | full documented Player surface (`productName` `"Director"`, `productVersion` `"MX 2004"`, `runMode` `"Plugin"`, …) | `halt()` (owner Player, R-23), `externalParamName/Value`, `windowPresent` surface |
| `SoundObject` | `sound.js` | `soundDevice`, `soundDeviceList`, `soundEnabled`, `soundKeepDevice`, `soundLevel`, `soundMixMedia`; `beep()`, `channel(n)` | audio graph is player-side (8 channels) |
| `SoundChannelObject` | `sound-channel.js` | `channel`, `volume`, `pan`, `member`, `currentTime`, `elapsedTime`, `startTime`/`endTime`, loop fields, `sampleRate`/`sampleCount`, `channelCount`, `status`, `isPlaying`; play/queue/fade/etc. | document/stub surface; Web Audio engine is separate |
| `SpriteObject` | `sprite.js` | all documented sprite fields (`loc`, `locH`, `locV`, `left`/`top`/`right`/`bottom`, `width`/`height`, `visible`, `member`, `memberNum`, `puppet`, `constraint`, `ink`, `blend`, `rotation`, `locZ`, …); `hitTest()` | hydrated from Score cells; `sprite(n)` returns live objects (FR-029..FR-032) |
| `SpriteChannelObject` | `sprite-channel.js` | `number`, `name`, `scripted`, `sprite` | `makeScriptedSprite`/`removeScriptedSprite` route through the puppet register |
| `SystemObject` | `system.js` | `colorDepth`, `deskTopRectList`, `environmentPropList`, `milliseconds`; `date()`, `restart()`, `shutDown()`, `time()` | surface/stubs |
| `WindowObject` | `window.js` | documented Window surface (`rect`, `drawRect`, `sourceRect`, `bgColor`, `visible`, `type`, `sizeState`, appearance/titlebar options, …) | root/stage window; MIAW `open()`/sibling execution no-op (FR-033) |

### 10.1 Puppet register & scripted sprites (FR-030)

`context.puppetSprites: Map<channel, SpriteObject>`:

- `puppetSprite(n, TRUE)` — resolves the channel's cell (or an empty sprite) and stores it in the
  register with `puppet = true`; resolution of `sprite(n)` checks the register first.
- `puppetSprite(n, FALSE)` — clears `puppet`, deletes the register entry, re-arms Score
  re-hydration on the next resolution.
- `makeScriptedSprite(member?, loc?)` — puppets the channel and optionally places the member/loc
  (no `loc` → stage center); `removeScriptedSprite()` — returns control to the Score.
- Unknown channels via `sprite(n)` resolve to `null`; `sprite(0)` is the inert stage sprite
  (`visible = false`); channel must be finite and > 0.

### 10.2 Sprite hydration — `engine/subsystem/sprite-hydrate.js` (FR-029, FR-031, R-08, R-09)

`hydrateSprite(ctx, sprite, cell)` copies the placement fields and maps:

| Cell | Sprite result |
|------|---------------|
| `loc: [h, v]` | `loc` object, `locH`, `locV`, `left`, `top`, and `right`/`bottom` mirrors |
| `size: [w, h]` | `width`, `height`, bounds mirrors recomputed |
| `visible` | `visible` |
| `member: name` | resolved via `memberRegistry.lookupByNameInMovie`; unresolved names stay as the name; `memberNum` set when resolved |
| `ink`/`blend`/`rotation`/`puppet`/`flipH`/`flipV`/`skew`/`constraint`/`locZ`/`backColor`/`foreColor`/`castLib`/`memberNum`/`quad`/`volume` | copied as-is |

Re-hydration happens when the playhead changes (`_liveHydratedAt`); script mutations between frames
persist. `syncBounds(sprite)` keeps the mirrors consistent after `locH`/`locV`/`constrain*`.
`constrainIfNeeded` clamps a constrained sprite's loc into the constrainer's bounds (R-09);
`hitTest` bounds derive from `locH`/`locV` + `width`/`height`, selecting the topmost visible
sprite by `(locZ, channel)` (R-08/FR-031).

---

## 11. Member media classes — `engine/core/media/` (FR-034..FR-038, R-22)

Base: `MemberObject` (only the documented Member surface; payload stays on `MemberObject.payload`,
no media field mirroring — FR-034/FR-037).

Functional (8) — extend `MemberObject`, documented fields/defaults only:

| Class | Own fields |
|-------|-----------|
| `BitmapMember` | `alphaThreshold`, `backColor`, `blend`, `depth`, `dither`, `foreColor`, `image`, `imageCompression` (`#png`), `imageQuality`, `palette`, `picture`, `rect`, `trimWhiteSpace`, `useAlpha`; `crop()`, `pictureP()` |
| `ButtonMember` | `hilite` |
| `ColorPaletteMember` | `color(index)`, `palette`, `paletteMapping` (`#casePalette`), `depth` |
| `CursorMember` | `castMemberList`, `cursorSize`, `hotSpot`, `interval` |
| `FieldMember` | full documented field surface (`alignment`, `autoTab`, `border`, `boxDropShadow`, `boxType`, `dropShadow`, `editable`, `font`, `fontStyle`, `fontSize`, `lineCount`, `margin`, `pageHeight`, `scrollTop`, `selEnd`, `selStart`, `text`, `wordWrap`; loc/point helpers) |
| `FontMember` | `bitmapSizes`, `characterSet`, `fontStyle`, `originalFont`, `recordFont` |
| `SoundMember` | none — no own API (controlled by Sound/Sound Channel) |
| `TextMember` | full documented text surface (`antiAlias`, `antiAliasThreshold`, `bottomSpacing`, `charSpacing`, `firstIndent`, `fixedLineSpace`, `font`, `fontStyle`, `HTML`, `hyperlink*`, `kerning`, `kerningThreshold`, `RTF`, `selectedText`, `useHypertextStyles`; point helpers) |

Documented stubs (11) — accepted by the runtime, must add no media-specific behavior (FR-036):
`AnimatedGIFMember`, `DVDMember`, `FilmLoopMember`, `FlashComponentMember`, `LinkedMovieMember`,
`QuickTimeMember`, `RealMediaMember`, `Shockwave3DMember`, `ShockwaveAudioMember`,
`VectorShapeMember`, `WindowsMediaMember`. `FlashMember` is a legacy unclassified stub that may
remain but is not one of the 19 documented types (R-22).

`newMember(type)` (FR-038): symbol or string type; maps to `MEDIA_CLASS_BY_TYPE`
(`bitmap`, `button`, `palette`, `cursor`, `field`, `font`, `sound`, `text`, `animgif`, `dvd`,
`filmLoop`, `flash`, `flashcomponent`, `movie`, `QuickTime`, `realMedia`, `shockwave3D`, `swa`,
`shockwaveAudio`, `vectorShape`, `windowsMedia`); unknown types → generic `MemberObject` carrying
the type symbol; with an active context registers in the first empty cast slot (next free number
per cast library), otherwise returns the member unregistered.

---

## 12. Scripting objects — `engine/core/scripting/` (FR-039..FR-042)

| Class | Purpose | Surface |
|-------|---------|---------|
| `FileioObject` | file I/O | full documented surface as deterministic stubs (no filesystem): `openFile`/`closeFile`/`read*`/`write*`/`get*`/`set*`, `displayOpen/Save`, `status`, `version`, `error`, `_fileName`/`_position` bookkeeping |
| `NetLingoObject` | net logic + state | see §8 |
| `SpeechXtraObject` | text-to-speech | full documented voice surface as deterministic stubs (`voice*`), `_speaking` flag |
| `XMLParserObject` | XML parsing | minimally real via `DOMParser`: `parseString`, `count`, `doneParsing`, `getError`, `ignoreWhiteSpace`, `makeList`/`makeSubList`; `child` is a property; malformed input sets a documented error string and returns false |

Factory: `xtra(name)` (`api/methods/xtra.js`, owner `top`) is case-insensitive and returns the
class for `fileio`/`netlingo`/`speechxtra`/`xmlparser` or `null`; `new xtra("fileio")` constructs
the object (FR-040). `XTRA_CLASSES` in `scripting/index.js` is the lookup map.

---

## 13. API owner registry — `api/methods/registry.js` (FR-043, R-24)

Purpose: bind every top-level method module to its documented owner and enforce the file set.

| Field | Type | Meaning |
|-------|------|---------|
| `METHODS_OWNERS` | object | `methodName → owner` for every `api/methods/*.js` except `registry.js` |
| `OWNER_CATEGORIES` | frozen string[] | allowed owners: `movie`, `player`, `sound`, `key`, `mouse`, `system`, `global`, `member`, `castLib`, `sprite`, `channel`, `window`, `net`, `creator`, `top` |
| `ownerOf(name)` | function | registry lookup or `null` |

Contract: every method module carries `// @owner <owner>` matching its registry entry; the registry
equals the method file set (audit test `api/methods/__tests__/registry.test.js`); ownership derives
from `director_core_objects.txt` (FR-043); no fixed count is normative (R-24). `halt` is owned by
`player` (R-23); the five creators are owned by `creator`; `xtra` by `top`.

Relationships: each method module resolves state through the singleton facade / accessor; pure
methods (`top`) need no context; stateful methods return neutral values with no context (FR-045).

---

## 14. Pack definitions (C8) — `pack/`, `scripts/generate-pack.mjs`

The full shape/validation contract lives in [contracts/pack-definition.md](./contracts/pack-definition.md).
Entity summary:

| Entity | Identity | Fields | Validation |
|--------|----------|--------|------------|
| `MovieDefinition` | `name` | `name`, `totalCastSlots?`, `casts[]`, `options {tempo,width,height,src}`, `score?` | must be `kind: "movie"` with non-empty name and casts (FR-053) |
| `CastDefinition` | `name` | `kind: "cast"`, `name`, `members[]` | empty slots are `{kind:"cast", name, members: []}` |
| `MemberDefinition` | `name` canonical; `number` metadata | `kind: "member"`, `name`, `mediaType`, `payload?`, `registrationPoint?`, `number?` | numbers assigned sequentially by registration position (compacted) |
| `ScoreDefinition` | frames order | `{ frames: [{ marker?, channels? }], tempo? }` | normalizes per the Score model |

Builder output (`pack/movie.js`, `pack/cast.js`) is frozen pure data (R-16); the generator writes
C8-shaped `index.js` files with the generated header; both feed the same ingester (FR-049..FR-052).

---

## 15. MainThreadImperativeHandle & message protocol (FR-054..FR-058, R-17..R-20)

`run(input, { canvas, externalParams })` returns the handle (full contract in
[contracts/player-protocol.md](./contracts/player-protocol.md)).

| Field | Type | Meaning |
|-------|------|---------|
| `ready` | boolean | set when the worker posts `ready` |
| `destroyed` | boolean | terminal flag |
| `_worker` | Worker | the dedicated worker (one per run) |
| `_pendingInit` / `_input` / `_canvas` / `_externalParams` | internal | init payload pieces |

Methods: `post(kind, payload)`, `start()`, `stop()`, `destroy()`, `goToFrame(n)`, `poll()`,
`getLifecycleSnapshot()`; `EventTarget` events: `ready`, `error`, `lifecycle`, `paint`,
`externalEvent`, `gotoNetMovie`, `gotoNetPage` (FR-055).

Message kinds: MT→W `init`, `start`, `stop`, `destroy`, `goToFrame`, `poll-lifecycle`,
`setTempo`, and input (`keydown`, `keyup`, `mousedown`, `mouseup`, `mousemove`, `focus`, `blur`);
W→MT `ready`, `error`, `lifecycle`, `paint`, `externalEvent`, `gotoNetMovie`, `gotoNetPage`.

Validation: messages issued before `ready` are queued and flushed in order (R-19); multiple runs
are isolated (one worker each, FR-065/FR-071); `destroy` is terminal/idempotent (FR-058).

---

## 16. Custom elements — `browser/custom-elements/index.js` (FR-066..FR-070)

Tag surface: `<x-object>` and `<x-embed>` (equivalent) with attributes `src` (alias `data`,
required), `width`/`height` (default 640×480), optional `tempo`; child `<x-param name value>`.

| Element state | Type | Meaning |
|---------------|------|---------|
| `_handle` | handle \| null | the `run()` handle (`.handle` getter) |
| `_canvas` | HTMLCanvasElement \| null | element-owned canvas |
| `_params` | `{name,value}[]` | frozen-at-connect snapshot |
| `_frame` | number | latest painted `seq` (`.frame` getter) |
| `_connected` | boolean | connect guard / reconnect support |

Debug getters: `.handle`, `.movieName` (the `src`/`data` value), `.frame`. Contract details and
connect/disconnect ordering live in [contracts/custom-elements.md](./contracts/custom-elements.md).

---

## 17. Lifecycle event payload shapes (FR-026, R-04)

Dispatched as `CustomEvent`s on the `DirectorContext` (`detail`):

| Event | Detail fields | When |
|-------|---------------|------|
| `prepareMovie` | `{ movie }` | once before the loop starts |
| `startMovie` | `{ movie }` | once at loop start |
| `prepareFrame` | `{ movie, score, frame }` | each tick, after `score.advance()` |
| `enterFrame` | `{ movie, score, frame }` | each tick after `prepareFrame` |
| `beginSprite` | `{ movie, score, frame, channel, cell, sprite }` | per channel (ascending) |
| `endSprite` | `{ movie, score, frame, channel, cell, sprite }` | per channel (ascending) |
| `exitFrame` | `{ movie, score, frame }` | each tick, last |
| `stopMovie` | `{ movie }` | once on destroy |
| `idle` | `{ movie }` | tick with no buffered input |
| `timeout` | `{ movie }` | when `the timeout` threshold elapses |

`frame` is the advanced playhead (1-based; `0` with no current frame); `cell` is the opaque Score
cell; `sprite` is the **live** `SpriteObject` (FR-026). Dispatch ordering per tick is fixed by
R-04: `score.advance()` → `prepareFrame` → `enterFrame` → all `beginSprite` ascending → all
`endSprite` ascending → `exitFrame`; empty Score fires frame events only; errors halt the movie.

---

## Known implementation gaps

Factual code-vs-spec inconsistencies found while writing this model (spec wins; later fixes are
point-by-point per R-27). Line numbers are as of this writing.

1. **Tick order interleaves `beginSprite`/`endSprite`.** `engine/subsystem/context.js:265` runs one
   loop that dispatches `beginSprite` then `endSprite` per channel; R-04/FR-026 require all
   `beginSprite` dispatches (ascending) before all `endSprite` dispatches. Tests assert the
   interleaved order (`engine/subsystem/__tests__/lifecycle.test.js:29`,
   `engine/subsystem/__tests__/frame-step-sprite.test.js:36`).
2. **`cast-loader.js` references statics that do not exist.** `player/cast-loader.js:27,28,31,41,
   47,51` uses `CastLibraryObject.castLib`, `._register()`, `._addMember()`, and passes an options
   object to `new CastLibraryObject(...)` whose class has no constructor; the file is legacy and
   unused by `worker-entry.js`.
3. **Dual `externalEvent`.** The API method `api/methods/externalEvent.js:2` is a no-op, while the
   real worker→host bridge `player/external-event.js:18` is never imported by the API or worker
   bootstrap; `externalEvent()` in a translated script cannot reach the host (FR-063). The worker
   `NetLingoObject.externalEvent` is likewise a stub (`net-lingo.js:524`).
4. **Payload shape mismatches on W→MT relay.** Worker posts are flat (`player/external-event.js:20`
   sends `{kind, name, args}`; `player/renderer.js:60` / `worker-entry.js:70` send
   `{kind:"paint", imageData, width, height, seq}`), but `player/run.js:78-99` reads
   `e.data.detail?.name` / `detail?.imageData`, so real worker `externalEvent`/`paint` payloads
   arrive empty (tests fabricate `detail` wrappers).
5. **`gotoNetMovie` has no sender.** `net-lingo.js:390-406` sets
   `netState.gotoNetMoviePendingUrl` but nothing in `worker-entry.js` drains
   `takeGotoNetMoviePending()` or posts `{kind:"gotoNetMovie", url}`; only the handle's receiver
   exists (`run.js:100`). The method also touches `window.location.href` when a `window` global
   exists and throws on a missing URL (net calls must never throw — R-15).
6. **`mount.js` wires the loop to the wrong target.** `player/mount.js:34-37` dispatches
   `prepareMovie`/`startMovie` on `ctx.movie` and calls `startEventLoop({ movie: ctx.movie })`;
   `event-loop.js:57` then invokes `ctx.frameStep()`, which only exists on `DirectorContext`.
7. **Builder omits `totalCastSlots` and empty-slot padding.** `pack/movie.js:43-55` `.build()`
   returns `{name, casts, options?, score?}` without `totalCastSlots` and without filling empty
   cast slots, unlike `generate-pack.mjs:136-144` (FR-049/FR-051); `builder-shape.test.js:6` does
   not assert the field. Neither the builder nor the generator emits `kind: "movie"`
   (`generate-pack.mjs:136-144`), and the ingester never checks it (FR-053).
8. **Handle queue/poll surface incomplete.** `run.js:105-108` only queues `start()` until `ready`
   (FR-064/R-19 require all MT messages queued and flushed in order); there is no
   `getLifecycleSnapshot()` (FR-055) and `lifecycle` messages are ignored by `_onMessage`
   (`run.js:71-103`). `run.js:139` also dispatches a main-thread `stopMovie` CustomEvent on the
   handle, which is not part of the specified handle event set.
9. **`stopMovie` fires twice on destroy.** `worker-entry.js:122` calls `ctx.stopMovie()` and then
   `ctx.destroy()`, which calls `stopMovie()` again (`context.js:182`); FR-023/FR-058 require
   exactly one.
10. **Media stubs are not empty.** `AnimatedGIFMember` carries 5 fields and 2 methods
    (`media/animated-gif-member.js:16-62`) and `LinkedMovieMember` carries `scriptsEnabled`
    (`media/linked-movie-member.js:21`), contradicting R-22/FR-036; the test labels 12 classes as
    "11 excluded stubs" (`media/__tests__/media-classes.test.js:16-20,30`).
11. **Paint fallback emits a blank frame and is not re-dispatched.** `renderer.js:56-61` sends an
    all-zero `Uint8ClampedArray` instead of drawing the frame (FR-059), and the element draws it
    but does not relay `paint` as a CustomEvent (`custom-elements/index.js:100`, FR-067).
12. **No `InvalidBundleError`.** `player/ingest.js:30-89` performs no `kind`/`name`/`casts`
    validation; malformed definitions fail with generic errors or ingest silently (FR-053).
13. **`externalParamName`/`externalParamValue` do not read the snapshot.** `player.js:456-479`
    return `null`/`undefined`; `context.externalParams` is never consulted (FR-063).
14. **`halt()` is a no-op.** `player.js:515` is empty and the top-level `api/methods/halt.js`
    delegates to it, so the movie is not stopped through the Player (FR-048, R-23); `updateStage()`
    (`movie.js:1523`) is likewise empty despite FR-059.
15. **`SoundObject.channel(n)` is unwired.** `sound.js:97-100` constructs a fresh stub
    `SoundChannelObject` instead of reaching the context/`player/audio.js` Web Audio graph
    (FR-061); `_player.sound` and `player.audioContext` remain disconnected
    (`player.js:306`, `player.js:305` TODO).
16. **Owner registry category drift.** `registry.js:123-139` uses `castLib`, `sprite`, and
    `channel` while FR-043 names `castlib`, `spritechannel`, and `soundchannel`; `breakLoop` is
    assigned to `channel`.
17. **`the.movieName` never tracks the context.** `the-proxy.js:116-117` reads a local backing row
    that ingest never writes (`ingest.js:35-37` writes `context.name`/`movie.name`), so
    `the.movieName` stays `""` (FR-018).
18. **Stale worker subpath reference.** `player/worker-host.js:8` tells consumers to import
    `@project-reborn/director/worker`, but `package.json:9-13` exposes only `.`, `./lingo`, and
    `./browser` (which is what FR-002 mandates); `run()` bypasses `WorkerHost` and points directly
    at `./worker-entry.js` (`run.js:21`).
19. **`createContext({worker:"auto"})` never spins a worker.** `browser/index.js:49-52` accepts the
    option and falls through to main-thread behavior (TODO), so per-movie isolation only exists on
    the `run()` path.
20. **`Color` uses accessor-backed `_red`/`_green`/`_blue` rather than plain public fields** and a
    `paletteIndex` getter (`base/color.js:52-118`), a deliberate FR-009 exception but a deviation
    from FR-004's plain-field rule; `the` rows `movieName`/`moviePath`/`platform` are local-only.
21. **Empty-Score `goLoop`/`goPrevious` move the playhead.** `score.js:85-88` and `score.js:140-143`
    set `_playhead = 1` when there are no frames, while R-06/FR-025 require empty-Score navigation
    to be a no-op (`goNext` guards correctly at `score.js:100`).
