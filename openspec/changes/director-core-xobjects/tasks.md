## 1. Rename existing `*Ref` Core Object classes to `*Object`

- [x] 1.1 Rename `cast-library-ref.js` → `cast-library-object.js`, class `CastLibraryRef` → `CastLibraryObject` (file + all internal `CastLibraryRef.` static references + `CastLibraryObject.castLib` proxy)
- [x] 1.2 Rename `key-ref.js` → `key-object.js`, class `KeyRef` → `KeyObject`; keep `_key` singleton name
- [x] 1.3 Rename `member-ref.js` → `member-object.js`, class `MemberRef` → `MemberObject`
- [x] 1.4 Rename `mouse-ref.js` → `mouse-object.js`, class `MouseRef` → `MouseObject`; keep `_mouse`
- [x] 1.5 Rename `movie-ref.js` → `movie-object.js`, class `MovieRef` → `MovieObject`; keep `_movie`; update `castLib`/`sprite`/`member`/`stage` proxies and `CastLibraryRef.castLib` static reference to `CastLibraryObject.castLib`
- [x] 1.6 Rename `player-ref.js` → `player-object.js`, class `PlayerRef` → `PlayerObject`; keep `_player`
- [x] 1.7 Rename `sound-ref.js` → `sound-object.js`, class `SoundRef` → `SoundObject`; keep `_sound`; update `SoundChannelRef` import → `SoundChannelObject`
- [x] 1.8 Rename `sound-channel-ref.js` → `sound-channel-object.js`, class `SoundChannelRef` → `SoundChannelObject`
- [x] 1.9 Rename `sprite-ref.js` → `sprite-object.js`, class `SpriteRef` → `SpriteObject`
- [x] 1.10 Update `src/core/index.js` exports to the renamed `*Object` classes and `_*` singletons; remove all `*Ref` exports
- [x] 1.11 Grep-verify zero remaining `*-ref.js`, `*Ref` identifiers in `packages/director/src/`

## 2. Add the four missing Core Object classes

- [x] 2.1 Create `global-object.js` (`GlobalObject`): private global-variable map; `clearGlobals()`, `showGlobals()`; Proxy-backed named global-variable get/set; export `_global` singleton
- [x] 2.2 Create `sprite-channel-object.js` (`SpriteChannelObject`): `name`, `number`, `scripted`, `sprite` props; `makeScriptedSprite()`, `removeScriptedSprite()` methods
- [x] 2.3 Create `system-object.js` (`SystemObject`): `date()`, `time()`, `restart()` (no-op), `shutDown()` (no-op); props `colorDepth`, `deskTopRectList`, `environmentPropList`, `milliseconds`; export `_system` singleton
- [x] 2.4 Create `window-object.js` (`WindowObject`): 9 methods + 19 props per design D3; static `window`/`windowList` proxy registry mirroring `CastLibraryObject.castLib` pattern
- [x] 2.5 Export the new `*Object` classes (`GlobalObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`) and `_global`/`_system` singletons from `src/core/index.js`

## 3. Expand each `*Object` to its documented Chapter-5 surface

Reference: `docs/drmx2004_scripting_ref/director_core_objects.txt` + `methods.txt` + `properties.txt`.

- [x] 3.1 `CastLibraryObject`: add `findEmpty()`; add props `selection`, ensure `fileName`/`member`/`name`/`number`/`preLoadMode` match docs
- [x] 3.2 `KeyObject`: add `keyPressed()`; verify props `commandDown`/`controlDown`/`key`/`keyCode`/`optionDown`/`shiftDown` match docs
- [x] 3.3 `MemberObject`: add methods `copyToClipBoard()`, `duplicate()`, `erase()`, `importFileInto()`, `move()`, `pasteClipBoardInto()`, `preLoad()`, `unLoad()`; add props `comments`, `creationDate`, `hilite`, `linked`, `loaded`, `media`, `mediaReady`, `modified`, `modifiedBy`, `modifiedDate`, `purgePriority`, `scriptText`, `size`, `thumbNail`, `type`
- [x] 3.4 `MouseObject`: add props `clickLoc`, `clickOn`, `doubleClick`, `mouseChar`, `mouseDown`, `mouseH`, `mouseItem`, `mouseLine`, `mouseLoc`, `mouseMember`, `mouseUp`, `mouseV`, `mouseWord`, `rightMouseDown`, `rightMouseUp`, `stillDown` (all runtime-fed, read-only)
- [x] 3.5 `MovieObject`: add missing methods (`cancelIdleLoad`, `clearFrame`, `constrainH`, `constrainV`, `deleteFrame`, `duplicateFrame`, `finishIdleLoad`, `frameReady`, `label`, `mergeDisplayTemplate`, `newMember`, `preLoad`, `preLoadMember`, `preLoadMovie`, `printFrom`, `puppetPalette`, `puppetTransition`, `ramNeeded`, `saveMovie`, `sendAllSprites`, `sendSprite`, `unLoad`, `unLoadMember`, `unLoadMovie`, `updateFrame`); add missing props (aboutInfo, active3dRenderer, allow*, beepOn, buttonStyle, centerStage, displayTemplate, dockingEnabled, enableFlashLingo, fileFreeSize, fileSize, fileVersion, fixStageSize, frameLabel, framePalette, frameScript, frameSound1, frameSound2, frameTransition, idle*, image*, lastFrame, markerList, paletteMapping, preferred3dRenderer, preLoadEventAbort, score, scoreSelection, script, traceLoad, traceLogFile, updateLock, useFastQuads); authoring/printer methods = no-ops
- [x] 3.6 `PlayerObject`: add methods `halt()`, `open()`, `windowPresent()`; add props `activeCastLib`, `activeWindow`, `applicationName`, `applicationPath`, `currentSpriteNum`, `digitalVideoTimeScale`, `disableImagingTransformation`, `emulateMultibuttonMouse`, `externalParamCount`, `frontWindow`, `inlineImeEnabled`, `lastClick`, `lastEvent`, `lastKey`, `lastRoll`, `mediaXtraList`, `netPresent`, `netThrottleTicks`, `organizationName`, `productName`, `productVersion`, `safePlayer`, `scriptingXtraList`, `searchCurrentFolder`, `searchPathList`, `serialNumber`, `switchColorDepth`, `toolXtraList`, `transitionXtraList`, `userName`, `window`, `windowList`; wire `_player.window`/{windowList} to the `WindowObject` registry; Xtra-enumeration props return documented empty/list defaults
- [x] 3.7 `SoundObject`: add props `soundDevice`, `soundDeviceList`, `soundKeepDevice`, `soundLevel`, `soundMixMedia`
- [x] 3.8 `SoundChannelObject`: add methods `fadeIn`, `fadeOut`, `fadeTo`, `getPlayList`, `isBusy`, `pause`, `playFile`, `playNext`, `queue`, `setPlayList`; add props `channelCount`, `elapsedTime`, `endTime`, `loopCount`, `loopEndTime`, `loopsRemaining`, `loopStartTime`, `sampleCount`, `sampleRate`, `startTime`, `status`
- [x] 3.9 `SpriteObject`: add props `bottom`, `constraint`, `cursor`, `editable`, `endFrame`, `flipH`, `flipV`, `locZ`, `quad`, `rotation`, `skew`, `spriteNum`, `startFrame`, `top`; keep existing geometry mutually consistent

## 4. Wire `director-lingo` + `director-syntax` + `director-browser` + `director-runtime` to renamed/new objects

- [x] 4.1 Update `src/lingo/ilk.js` imports (`SoundRef`/`PlayerRef`/`MovieRef`/`SpriteRef`/`MemberRef`/`CastLibraryRef` → `*Object`)
- [x] 4.2 Update `src/lingo/index.js`: change `_movie` re-export source to `../core/movie-object.js`; switch `_global` from `globalThis` to `GlobalObject` (`_global` singleton); add `window` factory; verify any other `../core/*-ref.js` imports
- [x] 4.3 Update `src/syntax/the-proxy.js` imports (`_movie`/`_mouse`/`_key`/`_player`/`_sound`/`CastLibraryRef` → `*Object`)
- [x] 4.4 Update `src/runtime/cast-loader.js` (`CastLibraryRef` → `CastLibraryObject`)
- [x] 4.5 Add `window` Lingo factory function (new `src/lingo/window.js`) returning `WindowObject`; register in `src/lingo/index.js`
- [x] 4.6 Add `system` access surface: re-export `_system`/`_global` from `src/lingo/index.js` so translated code can reference them as host bindings

## 5. Tests

- [x] 5.1 Rename `src/core/__tests__/*-ref.test.js` → `*-object.test.js`; update all `*Ref` references to `*Object`; add `_set*` retained tests
- [x] 5.2 Add `global-object.test.js`: store/clear/showGlobals; named-var get/set on singleton
- [x] 5.3 Add `sprite-channel-object.test.js`: makeScriptedSprite/removeScriptedSprite; props
- [x] 5.4 Add `system-object.test.js`: date()/time()/milliseconds; restart()/shutDown() no-ops return without throwing
- [x] 5.5 Add `window-object.test.js`: open()/close()/forget()/moveToFront()/moveToBack()/mergeProps(); null on not-present named window; registry
- [x] 5.6 Add/extend per-object surface-coverage tests asserting every documented method/prop name exists on each `*Object` (object-key scan) to lock the Chapter-5 surface
- [x] 5.7 Update `src/lingo/__tests__/*` references (`CastLibraryRef`/`MemberRef`/`SpriteRef`/`SoundChannelRef`/`_player`/`_movie`/`_sound` import paths → `*-object.js`); add `window.test.js` for the new factory
- [x] 5.8 Update `src/syntax/__tests__/the-proxy.test.js` and `src/runtime/__tests__/cast-loader.test.js` imports

## 6. Verification

- [x] 6.1 `pnpm --filter @project-reborn/director test` (vitest) green — 1181 pass, 15 pre-existing failures (env: no jsdom `window`, unrelated to this change)
- [x] 6.2 Grep-verify no `*-ref.js` / `*Ref` / `globalThis`-as-`_global` remnants in `packages/director/src/`
- [x] 6.3 `openspec validate director-core-xobjects` passes; review the `director-core` spec delta for misplaced headers (`####` scenario depth)
- [x] 6.4 Spot-check each `*Object` against `director_core_objects.txt` method/property summary tables for completeness