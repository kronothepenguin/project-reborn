## MODIFIED Requirements

### Requirement: director-core SHALL implement reference classes for Director system objects

`director-core` SHALL implement reference classes that represent Director Core Objects not constructible from Ligo but usable from Ligo, per MX 2004 Chapter 5 (`docs/drmx2004_scripting_ref/director_core_objects.txt`). The classes SHALL use the `XObject` naming convention matching the Chapter-5 object names: `CastLibraryObject`, `GlobalObject`, `KeyObject`, `MemberObject`, `MouseObject`, `MovieObject`, `PlayerObject`, `SoundObject`, `SoundChannelObject`, `SpriteObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`. Each class SHALL expose the methods and properties documented for its Director MX 2004 counterpart, with method semantics from `docs/drmx2004_scripting_ref/methods.txt` and property semantics from `docs/drmx2004_scripting_ref/properties.txt`. The legacy `*Ref` class names SHALL NOT remain.

#### Scenario: Core implements the XObject class set
- **WHEN** the `packages/director/src/core/` directory is inspected
- **THEN** it contains `cast-library-object.js`, `global-object.js`, `key-object.js`, `member-object.js`, `mouse-object.js`, `movie-object.js`, `player-object.js`, `sound-object.js`, `sound-channel-object.js`, `sprite-object.js`, `sprite-channel-object.js`, `system-object.js`, and `window-object.js`, and NO `*-ref.js` system-object files remain

#### Scenario: Reference classes are instantiated by core, not by Ligo
- **WHEN** Ligo script calls `member(1)` or `sprite(5)`
- **THEN** `director-lingo` constructs or returns a `MemberObject` / `SpriteObject` instance from `director-core`; Ligo never invokes a `*Object` constructor directly

#### Scenario: Host bindings are instances of the renamed classes
- **WHEN** the `_movie`, `_player`, `_sound`, `_key`, `_mouse`, `_system`, and `_global` host bindings are inspected
- **THEN** they are instances of `MovieObject`, `PlayerObject`, `SoundObject`, `KeyObject`, `MouseObject`, `SystemObject`, and `GlobalObject` respectively (the underscore binding names themselves are unchanged)

#### Scenario: Renamed classes replace the Ref classes
- **WHEN** any source file in `packages/director/src/` imports a Chapter-5 system object from `../core/`
- **THEN** it imports the `*Object` class name; no `*Ref` identifier is referenced anywhere in `packages/director/src/`

#### Scenario: Factory functions return renamed classes
- **WHEN** the `castLib()`, `member()`, `sprite()`, `sound()`, `channel()`, and `window()` factory functions are called
- **THEN** they return `CastLibraryObject`, `MemberObject`, `SpriteObject`, `SoundObject`/`SoundChannelObject` (per factory), and `WindowObject` instances respectively

### Requirement: director-core SHALL remain private across follow-up renames and additions

Any follow-up change that renames existing classes (e.g. `MovieObject` → a new name), adds new core objects, adds media-type subclasses, adds `KEY_CODES`, or adds DVD/3D rejector classes SHALL update this spec via that follow-up change's delta. The `director-core-xobjects` change renames the prior `*Ref` classes to the `XObject` convention and adds `GlobalObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`; subsequent changes continue to update this spec via their own deltas.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change is archived
- **THEN** it modifies this `director-core` spec via its own delta spec to reflect the rename or addition it actually performs

## ADDED Requirements

### Requirement: director-core SHALL implement the Cast Library, Global, and Key XObjects

`director-core` SHALL implement `CastLibraryObject`, `GlobalObject`, and `KeyObject` exposing the methods and properties documented for their MX 2004 Core Objects.

- **`CastLibraryObject`**: method `findEmpty()`; properties `fileName`, `member`, `name`, `number`, `preLoadMode`, `selection`.
- **`GlobalObject`**: methods `clearGlobals()`, `showGlobals()`. It SHALL store global variables by name and SHALL support arbitrary named global-variable property get/set on the singleton (so translated `_global.<varName>` access works).
- **`KeyObject`**: method `keyPressed()`; properties `commandDown`, `controlDown`, `key`, `keyCode`, `optionDown`, `shiftDown`.

#### Scenario: CastLibraryObject exposes the documented surface
- **WHEN** a `CastLibraryObject` instance is operated on
- **THEN** `findEmpty()`, `fileName`, `member`, `name`, `number`, `preLoadMode`, and `selection` are available and behave per the MX 2004 Cast Library summary

#### Scenario: GlobalObject stores and clears global variables
- **WHEN** `_global.gSuccess = "Congratulations!"` is executed and then `_global.gSuccess` is read
- **THEN** the stored value is returned; after `clearGlobals()` the global-variable store is empty; `showGlobals()` returns a snapshot of all stored globals

#### Scenario: KeyObject exposes documented input state
- **WHEN** the `KeyObject` instance (`_key`) is queried
- **THEN** `key`, `keyCode`, `commandDown`, `controlDown`, `optionDown`, `shiftDown`, and `keyPressed()` are available; input-state setters are private (set by the runtime, throw if set publicly)

### Requirement: director-core SHALL implement the Member, Mouse, and Sprite XObjects

`director-core` SHALL implement `MemberObject`, `MouseObject`, and `SpriteObject` exposing the methods and properties documented for their MX 2004 Core Objects.

- **`MemberObject`**: methods `copyToClipBoard()`, `duplicate()`, `erase()`, `importFileInto()`, `move()`, `pasteClipBoardInto()`, `preLoad()`, `unLoad()`; properties `castLibNum`, `comments`, `creationDate`, `fileName`, `height`, `hilite`, `linked`, `loaded`, `media`, `mediaReady`, `modified`, `modifiedBy`, `modifiedDate`, `name`, `number`, `purgePriority`, `rect`, `regPoint`, `scriptText`, `size`, `thumbNail`, `type`, `width`.
- **`MouseObject`**: properties `clickLoc`, `clickOn`, `doubleClick`, `mouseChar`, `mouseDown`, `mouseH`, `mouseItem`, `mouseLine`, `mouseLoc`, `mouseMember`, `mouseUp`, `mouseV`, `mouseWord`, `rightMouseDown`, `rightMouseUp`, `stillDown`.
- **`SpriteObject`**: properties `backColor`, `blend`, `bottom`, `constraint`, `cursor`, `editable`, `endFrame`, `flipH`, `flipV`, `foreColor`, `height`, `ink`, `left`, `locH`, `locV`, `locZ`, `member`, `name`, `quad`, `rect`, `right`, `rotation`, `skew`, `spriteNum`, `startFrame`, `top`, `width`.

#### Scenario: MemberObject exposes the documented surface
- **WHEN** a `MemberObject` is operated on
- **THEN** its eight methods and 22 properties are available; read-only properties (per `properties.txt`) throw on set, read/write properties coerce and persist

#### Scenario: MouseObject exposes documented read-only input state
- **WHEN** the `MouseObject` instance (`_mouse`) is queried
- **THEN** all 17 documented mouse properties are available and are read-only (fed by the runtime)

#### Scenario: SpriteObject exposes documented geometry and appearance properties
- **WHEN** a `SpriteObject` is operated on
- **THEN** all 28 documented sprite properties are available; geometry properties (`locH`, `locV`, `left`, `top`, `right`, `bottom`, `width`, `height`, `rect`, `quad`) are mutually consistent

### Requirement: director-core SHALL implement the Movie and Player XObjects

`director-core` SHALL implement `MovieObject` and `PlayerObject` exposing the methods and properties documented for their MX 2004 Core Objects.

- **`MovieObject`**: the 40 methods and 64 properties listed in the MX 2004 Movie object summary, including the recording session methods (`beginRecording()`, `endRecording()`, `updateFrame()`), navigation (`go()`, `goLoop()`, `goNext()`, `goPrevious()`), puppet methods (`puppetSprite()`, `puppetTempo()`, `puppetPalette()`, `puppetTransition()`), and the `castLib`/`member`/`sprite`/`stage` accessors.
- **`PlayerObject`**: methods `alert()`, `appMinimize()`, `cursor()`, `externalParamName()`, `externalParamValue()`, `flushInputEvents()`, `getPref()`, `halt()`, `open()`, `quit()`, `setPref()`, `windowPresent()`; properties `activeCastLib`, `activeWindow`, `alertHook`, `applicationName`, `applicationPath`, `currentSpriteNum`, `debugPlaybackEnabled`, `digitalVideoTimeScale`, `disableImagingTransformation`, `emulateMultibuttonMouse`, `externalParamCount`, `frontWindow`, `inlineImeEnabled`, `lastClick`, `lastEvent`, `lastKey`, `lastRoll`, `mediaXtraList`, `netPresent`, `netThrottleTicks`, `organizationName`, `productName`, `productVersion`, `safePlayer`, `scriptingXtraList`, `searchCurrentFolder`, `searchPathList`, `serialNumber`, `sound`, `switchColorDepth`, `toolXtraList`, `transitionXtraList`, `userName`, `window`, `xtra`, `xtraList`.

#### Scenario: MovieObject exposes the documented recording, navigation, and puppet API
- **WHEN** a `MovieObject` instance is operated on
- **THEN** `beginRecording()`/`endRecording()` bracket a recording session, `go()` sets the frame, `puppetSprite()`/`puppetTempo()` set puppet state, and `updateFrame()` advances the recorded frame; the documented properties (`frame`, `frameTempo`, `name`, `path`, `actorList`, `exitLock`, `keyboardFocusSprite`, `castLib`, `member`, `sprite`, `stage`, `score`, `markerList`, `xtraList`, etc.) are available

#### Scenario: MovieObject authoring/printer methods are no-ops, not crashes
- **WHEN** translated Ligo calls `printFrom()`, `saveMovie()`, `puppetTransition()`, or `mergeDisplayTemplate()` on `MovieObject`
- **THEN** the call returns without throwing and without performing the desktop/authoring operation; documented-default-returning properties (`active3dRenderer`, `preferred3dRenderer`, `fileFreeSize`, `fileSize`, `fileVersion`, `useFastQuads`) return their documented default/empty values

#### Scenario: PlayerObject exposes documented surface
- **WHEN** the `PlayerObject` instance (`_player`) is operated on
- **THEN** `alert()`, `getPref()`/`setPref()`, `externalParamName()`/`externalParamValue()`, `cursor()`, `flushInputEvents()`, `quit()`, `halt()`, `appMinimize()`, `open()`, `windowPresent()` and all documented properties are available; Xtra-enumeration properties (`mediaXtraList`, `scriptingXtraList`, `toolXtraList`, `transitionXtraList`, `xtra`, `xtraList`) return their documented empty/list default

### Requirement: director-core SHALL implement the Sound and Sound Channel XObjects

`director-core` SHALL implement `SoundObject` and `SoundChannelObject` exposing the methods and properties documented for their MX 2004 Core Objects.

- **`SoundObject`**: methods `beep()`, `channel()`; properties `soundDevice`, `soundDeviceList`, `soundEnabled`, `soundKeepDevice`, `soundLevel`, `soundMixMedia`.
- **`SoundChannelObject`**: methods `breakLoop()`, `fadeIn()`, `fadeOut()`, `fadeTo()`, `getPlayList()`, `isBusy()`, `pause()`, `play()`, `playFile()`, `playNext()`, `queue()`, `rewind()`, `setPlayList()`, `stop()`; properties `channelCount`, `elapsedTime`, `endTime`, `member`, `pan`, `sampleCount`, `loopCount`, `loopEndTime`, `loopsRemaining`, `loopStartTime`, `sampleRate`, `startTime`, `status`, `volume`.

#### Scenario: SoundObject manages channels and device state
- **WHEN** the `SoundObject` instance (`_sound`) is operated on
- **THEN** `beep()` plays (no-op when `soundEnabled` is false), `channel(n)` returns a stable `SoundChannelObject` per channel number, and the device properties are available

#### Scenario: SoundChannelObject exposes playback and fade API
- **WHEN** a `SoundChannelObject` is operated on
- **THEN** `play()`, `stop()`, `pause()`, `rewind()`, `breakLoop()`, `fadeIn()`, `fadeOut()`, `fadeTo()`, `queue()`, `playFile()`, `playNext()`, `getPlayList()`/`setPlayList()`, `isBusy()` and the documented properties (`volume`, `pan`, `member`, `elapsedTime`, `startTime`, `endTime`, `status`, `loopCount`, `loopsRemaining`, `loopStartTime`, `loopEndTime`, `channelCount`, `sampleCount`, `sampleRate`) are available

### Requirement: director-core SHALL implement the Sprite Channel, System, and Window XObjects

`director-core` SHALL implement `SpriteChannelObject`, `SystemObject`, and `WindowObject` exposing the methods and properties documented for their MX 2004 Core Objects. These are new classes (not renames).

- **`SpriteChannelObject`**: methods `makeScriptedSprite()`, `removeScriptedSprite()`; properties `name`, `number`, `scripted`, `sprite`.
- **`SystemObject`**: methods `date()`, `restart()`, `shutDown()`, `time()`; properties `colorDepth`, `deskTopRectList`, `environmentPropList`, `milliseconds`.
- **`WindowObject`**: methods `close()`, `forget()`, `maximize()`, `mergeProps()`, `minimize()`, `moveToBack()`, `moveToFront()`, `open()`, `restore()`; properties `appearanceOptions`, `bgColor`, `dockingEnabled`, `drawRect`, `fileName`, `image`, `movie`, `name`, `picture`, `rect`, `resizable`, `sizeState`, `sourceRect`, `title`, `titlebarOptions`, `type`, `visible`, `windowBehind`, `windowInFront`.

#### Scenario: SpriteChannelObject manages scripted sprites
- **WHEN** a `SpriteChannelObject` is operated on
- **THEN** `makeScriptedSprite(member)` associates a `SpriteObject` with the channel, `removeScriptedSprite()` clears it, the `sprite` property returns the current `SpriteObject` (or null), and `name`, `number`, `scripted` are available

#### Scenario: SystemObject exposes environment info and no-op OS methods
- **WHEN** the `SystemObject` instance (`_system`) is operated on
- **THEN** `date()` and `time()` return the current JS `Date`/time string, `milliseconds` returns a monotonic-style integer, `colorDepth`, `deskTopRectList`, `environmentPropList` return documented defaults; `restart()` and `shutDown()` are no-ops that do not throw (the web runtime cannot restart the host OS)

#### Scenario: WindowObject manages a window registry
- **WHEN** `window("Sun")` is called and the `WindowObject` is operated on
- **THEN** the documented methods (`open()`, `close()`, `forget()`, `maximize()`, `minimize()`, `restore()`, `moveToFront()`, `moveToBack()`, `mergeProps()`) and properties (`name`, `title`, `movie`, `fileName`, `rect`, `sourceRect`, `drawRect`, `bgColor`, `visible`, `resizable`, `type`, `sizeState`, `appearanceOptions`, `titlebarOptions`, `image`, `picture`, `dockingEnabled`, `windowBehind`, `windowInFront`) are available; a reference to a named-but-not-present window returns null per the MX 2004 note

#### Scenario: Player window accessors reach the WindowObject registry
- **WHEN** `_player.window["Sun"]` or `_player.windowList` is accessed
- **THEN** it returns the registered `WindowObject` for "Sun" or the live window list, mirroring the `CastLibraryObject.castLib` static-registry pattern