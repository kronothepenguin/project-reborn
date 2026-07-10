## Context

`director-core` (`packages/director/src/core/`) is the private language-object layer for `@project-reborn/director`. The locked `director-core` spec (see `Out of Scope` note in `openspec/specs/director-core/spec.md:88,118-124`) names the `XObject` rename and the missing Chapter-5 objects as the explicit follow-up change `director-core-xobjects`. This design is that follow-up.

Current state: nine system-object classes exist as `*Ref` (`CastLibraryRef`, `KeyRef`, `MemberRef`, `MouseRef`, `MovieRef`, `PlayerRef`, `SoundRef`, `SoundChannelRef`, `SpriteRef`), each exposing a partial subset of its MX 2004 surface. Three Chapter-5 objects are absent entirely (`Global`, `Sprite Channel`, `System`, `Window`). The full documented object/method/property set is in `docs/drmx2004_scripting_ref/director_core_objects.txt`, with method semantics in `methods.txt` and property semantics in `properties.txt`.

## Goals / Non-Goals

**Goals:**
- Rename all `*Ref` system-object classes to the `XObject` convention matching Chapter 5 object names, so the code surface reads the same as the MX 2004 reference (e.g. `castLib("scripts")` returns a `CastLibraryObject`).
- Add the four missing Chapter-5 Core Objects: `GlobalObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`.
- Bring each Core Object's exposed methods and properties to parity with its MX 2004 Chapter-5 summary, with semantics cross-checked against `methods.txt` and `properties.txt`.
- Keep `core` private (no `package.json` `exports` change); keep the rename invisible to translated Lingo (which only sees the `_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/`_global` host bindings and the `castLib()`/`member()`/`sprite()`/`channel()`/`sound()`/`window()` factory functions).

**Non-Goals:**
- 3D / DVD / Vector surfaces (permanently excluded by the locked spec).
- Wiring objects to a live render/score/audio engine — backing stores are state holders, not a real Director runtime.
- Media-type subclasses (bitmap/text/field/shape) — that is a separate capability (`director-core` media-types requirement, untouched here).
- Renaming the value data types (`List`, `PropList`, `Point`, `Rect`, `Color`) — they are not Chapter-5 "Core Objects" and keep their names.
- Adding `ScriptRef` — it is a scripting object, not a Chapter-5 Core Object; left to a later change.

## Decisions

### D1 — Rename, not alias, the `*Ref` classes
Rename files (`*-ref.js` → `*-object.js`) and class identifiers to `*Object`. Do **not** keep `*Ref` compatibility aliases — `core` is private and all importers are in-repo, so a clean rename is cheaper than a dual-name maintenance burden. The singleton constants (`_key`, `_mouse`, `_movie`, `_player`, `_sound`) keep their underscore names (they are host bindings, not class names).

**Why not alias**: two names forever invites drift; the locked spec already commits to the `XObject` convention as the end state.

### D2 — Chapter-5-object → class-name map
| MX 2004 Core Object | Class | File | Status |
|---|---|---|---|
| Cast Library | `CastLibraryObject` | `cast-library-object.js` | rename from `CastLibraryRef` |
| Global | `GlobalObject` | `global-object.js` | new |
| Key | `KeyObject` | `key-object.js` | rename from `KeyRef` |
| Member | `MemberObject` | `member-object.js` | rename from `MemberRef` |
| Mouse | `MouseObject` | `mouse-object.js` | rename from `MouseRef` |
| Movie | `MovieObject` | `movie-object.js` | rename from `MovieRef` |
| Player | `PlayerObject` | `player-object.js` | rename from `PlayerRef` |
| Sound | `SoundObject` | `sound-object.js` | rename from `SoundRef` |
| Sound Channel | `SoundChannelObject` | `sound-channel-object.js` | rename from `SoundChannelRef` |
| Sprite | `SpriteObject` | `sprite-object.js` | rename from `SpriteRef` |
| Sprite Channel | `SpriteChannelObject` | `sprite-channel-object.js` | new |
| System | `SystemObject` | `system-object.js` | new |
| Window | `WindowObject` | `window-object.js` | new |

### D3 — Per-object exposed surface (from `director_core_objects.txt`)
Each class SHALL expose exactly the method/property set listed for its object in Chapter 5. Cross-references in parentheses (e.g. `fileName (Cast)`, `preLoad() (Movie)`) disambiguate which object owns the member.

- **CastLibraryObject**: `findEmpty()`; props `fileName`, `member`, `name`, `number`, `preLoadMode`, `selection`.
- **GlobalObject**: `clearGlobals()`, `showGlobals()`; global-variable store keyed by name.
- **KeyObject**: `keyPressed()`; props `commandDown`, `controlDown`, `key`, `keyCode`, `optionDown`, `shiftDown`.
- **MemberObject**: methods `copyToClipBoard()`, `duplicate()`, `erase()`, `importFileInto()`, `move()`, `pasteClipBoardInto()`, `preLoad()`, `unLoad()`; props `castLibNum`, `comments`, `creationDate`, `fileName`, `height`, `hilite`, `linked`, `loaded`, `media`, `mediaReady`, `modified`, `modifiedBy`, `modifiedDate`, `name`, `number`, `purgePriority`, `rect`, `regPoint`, `scriptText`, `size`, `thumbNail`, `type`, `width`.
- **MouseObject**: props `clickLoc`, `clickOn`, `doubleClick`, `mouseChar`, `mouseDown`, `mouseH`, `mouseItem`, `mouseLine`, `mouseLoc`, `mouseMember`, `mouseUp`, `mouseV`, `mouseWord`, `rightMouseDown`, `rightMouseUp`, `stillDown`.
- **MovieObject**: methods `beginRecording()`, `cancelIdleLoad()`, `clearFrame()`, `constrainH()`, `constrainV()`, `delay()`, `deleteFrame()`, `duplicateFrame()`, `endRecording()`, `finishIdleLoad()`, `frameReady()`, `go()`, `goLoop()`, `goNext()`, `goPrevious()`, `idleLoadDone()`, `insertFrame()`, `label()`, `marker()`, `mergeDisplayTemplate()`, `newMember()`, `preLoad()`, `preLoadMember()`, `preLoadMovie()`, `printFrom()`, `puppetPalette()`, `puppetSprite()`, `puppetTempo()`, `puppetTransition()`, `ramNeeded()`, `rollOver()`, `saveMovie()`, `sendAllSprites()`, `sendSprite()`, `stopEvent()`, `unLoad()`, `unLoadMember()`, `unLoadMovie()`, `updateFrame()`, `updateStage()`; props `aboutInfo`, `active3dRenderer`, `actorList`, `allowCustomCaching`, `allowGraphicMenu`, `allowSaveLocal`, `allowTransportControl`, `allowVolumeControl`, `allowZooming`, `beepOn`, `buttonStyle`, `castLib`, `centerStage`, `copyrightInfo`, `displayTemplate`, `dockingEnabled`, `editShortCutsEnabled`, `enableFlashLingo`, `exitLock`, `fileFreeSize`, `fileSize`, `fileVersion`, `fixStageSize`, `frame`, `frameLabel`, `framePalette`, `frameScript`, `frameSound1`, `frameSound2`, `frameTempo`, `frameTransition`, `idleHandlerPeriod`, `idleLoadMode`, `idleLoadPeriod`, `idleLoadTag`, `idleReadChunkSize`, `imageCompression`, `imageQuality`, `keyboardFocusSprite`, `lastChannel`, `lastFrame`, `markerList`, `member`, `name`, `paletteMapping`, `path`, `preferred3dRenderer`, `preLoadEventAbort`, `score`, `scoreSelection`, `script`, `sprite`, `stage`, `timeoutList`, `traceLoad`, `traceLogFile`, `traceScript`, `updateLock`, `useFastQuads`, `xtraList`.
- **PlayerObject**: methods `alert()`, `appMinimize()`, `cursor()`, `externalParamName()`, `externalParamValue()`, `flushInputEvents()`, `getPref()`, `halt()`, `open()`, `quit()`, `setPref()`, `windowPresent()`; props `activeCastLib`, `activeWindow`, `alertHook`, `applicationName`, `applicationPath`, `currentSpriteNum`, `debugPlaybackEnabled`, `digitalVideoTimeScale`, `disableImagingTransformation`, `emulateMultibuttonMouse`, `externalParamCount`, `frontWindow`, `inlineImeEnabled`, `lastClick`, `lastEvent`, `lastKey`, `lastRoll`, `mediaXtraList`, `netPresent`, `netThrottleTicks`, `organizationName`, `productName`, `productVersion`, `safePlayer`, `scriptingXtraList`, `searchCurrentFolder`, `searchPathList`, `serialNumber`, `sound`, `switchColorDepth`, `toolXtraList`, `transitionXtraList`, `userName`, `window`, `xtra`, `xtraList`.
- **SoundObject**: methods `beep()`, `channel()`; props `soundDevice`, `soundDeviceList`, `soundEnabled`, `soundKeepDevice`, `soundLevel`, `soundMixMedia`.
- **SoundChannelObject**: methods `breakLoop()`, `fadeIn()`, `fadeOut()`, `fadeTo()`, `getPlayList()`, `isBusy()`, `pause()`, `play()`, `playFile()`, `playNext()`, `queue()`, `rewind()`, `setPlayList()`, `stop()`; props `channelCount`, `elapsedTime`, `endTime`, `member`, `pan`, `sampleCount`, `loopCount`, `loopEndTime`, `loopsRemaining`, `loopStartTime`, `sampleRate`, `startTime`, `status`, `volume`.
- **SpriteObject**: props `backColor`, `blend`, `bottom`, `constraint`, `cursor`, `editable`, `endFrame`, `flipH`, `flipV`, `foreColor`, `height`, `ink`, `left`, `locH`, `locV`, `locZ`, `member`, `name`, `quad`, `rect`, `right`, `rotation`, `skew`, `spriteNum`, `startFrame`, `top`, `width`.
- **SpriteChannelObject**: methods `makeScriptedSprite()`, `removeScriptedSprite()`; props `name`, `number`, `scripted`, `sprite`.
- **SystemObject**: methods `date()`, `restart()`, `shutDown()`, `time()`; props `colorDepth`, `deskTopRectList`, `environmentPropList`, `milliseconds`.
- **WindowObject**: methods `close()`, `forget()`, `maximize()`, `mergeProps()`, `minimize()`, `moveToBack()`, `moveToFront()`, `open()`, `restore()`; props `appearanceOptions`, `bgColor`, `dockingEnabled`, `drawRect`, `fileName`, `image`, `movie`, `name`, `picture`, `rect`, `resizable`, `sizeState`, `sourceRect`, `title`, `titlebarOptions`, `type`, `visible`, `windowBehind`, `windowInFront`.

### D4 — Backing semantics: real state vs. documented no-ops
The web/R26 runtime cannot honor desktop/authoring-only behavior (printing, real 3D renderers, Xtra enumeration, OS restart). To keep the API truthful and the surface complete:
- **State-backed (read/write)**: properties with meaningful runtime state (positions, volumes, names, flags, lists, frame numbers). Getters return private fields; setters coerce (`Number`/`Boolean`/`String`) or throw on documented read-only accessors. Same pattern as the existing `*Ref` classes.
- **Read-only with host feed**: input state (`KeyObject.*`, `MouseObject.*`, `PlayerObject.lastClick/lastEvent/lastKey/lastRoll`) is set only by the runtime via `_set*` methods; public setters throw.
- **Documented no-ops**: methods/properties that are authoring/desktop/printer/Xtra/3D-only (`printFrom`, `saveMovie`, `puppetTransition`, `restart`, `shutDown`, `mediaXtraList`, `scriptingXtraList`, `transitionXtraList`, `toolXtraList`, `active3dRenderer`, `preferred3dRenderer`, etc.) SHALL exist on the surface and return the documented default/empty value, never `throw`. They are stubs so translated Lingo that calls them does not crash.
- **`GlobalObject`** owns a plain object map of global variables; `clearGlobals()` empties it, `showGlobals()` returns a snapshot. `_global` host binding (currently `globalThis` in `lingo/index.js`) becomes the `GlobalObject` singleton.

### D5 — Singletons and factory wiring
- Singletons (host bindings) defined in their object file and re-exported from `core/index.js`: `_key`, `_mouse`, `_movie`, `_player`, `_sound`, plus new `_system`, `_global`.
- `director-lingo` factory functions (`castLib`, `member`, `sprite`, `sound`, `channel`) and a new `window` factory return the renamed `*Object` instances. `CastLibraryObject.castLib` static proxy and `MovieObject`'s `castLib`/`sprite`/`member` proxies are preserved verbatim under the new names.
- `_player.window` and `_player.windowList` proxy to a `WindowObject` registry (mirrors the existing `CastLibraryObject.castLib` static-registry pattern).

### D6 — Naming of member vs. object
Several properties are shared by multiple objects (e.g. `name`, `number`, `fileName`, `rect`, `member`). Each `*Object` owns its own backing field for the property; no shared mixin is introduced. This preserves the documented per-object semantics and keeps `core` dependency-light.

## Risks / Trade-offs

- **[Rename breaks in-repo importers]** → Mitigation: update every `../core/*-ref.js` import across `src/lingo`, `src/syntax`, `src/browser`, `src/runtime` in the same change; `vitest` + an import grep are the verification gates.
- **[Surface completeness vs. real behavior gap]** → Mitigation: no-op methods/properties are documented as such in the spec scenarios (return documented default, never throw) so tests assert the contract, not an illusion of real playback.
- **[`_global` was `globalThis`]** → Mitigation: `GlobalObject` wraps a private map; `_global.<varName>` access on the singleton still works because `GlobalObject` supports arbitrary named global-variable properties via a `Proxy` or explicit getter trap, preserving the existing `_global.gSuccess = "…"` translation pattern.
- **[Large churn in one change]** → Mitigation: the change is mechanical for renamed objects (file/class rename + re-export) and additive for new objects; the per-object surface lists in D3 bound the scope tightly. Tests are renamed alongside sources.

## Open Questions

- Whether `ScriptRef` belongs in this change or a later "scripting objects" change. **Decision**: later — `ScriptRef` is a Scripting Object (Chapter 6+), not a Chapter-5 Core Object. Listed here only to record the boundary.