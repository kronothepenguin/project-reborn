# Research — 006 API (Method Audit + Owner Table)

**Branch**: `006-api` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Source of truth

- `docs/drmx2004_scripting_ref/director_core_objects.txt` — authoritative **owner table** (C2).
- `docs/drmx2004_scripting_ref/methods.txt` — per-method semantics (C1 audit).
- `docs/drmx2004_scripting_ref/properties.txt` — palette/read-only semantics (C4/C5).
- Current `packages/director/src/api/methods/*.js` (108 files incl. `_netRegistry.js`).

## Owner table (per director_core_objects.txt, two-column summaries verified)

| owner | methods |
|---|---|
| Movie | beginRecording, cancelIdleLoad, clearFrame, constrainH, constrainV, delay, deleteFrame, duplicateFrame, endRecording, finishIdleLoad, frameReady, go, goLoop, goNext, goPrevious, idleLoadDone, insertFrame, label, marker, newMember, preLoad, preLoadMember, preLoadMovie, printFrom, puppetPalette, puppetSprite, puppetTempo, puppetTransition, ramNeeded, rollOver, saveMovie, sendAllSprites, sendSprite, stopEvent, unLoad, unLoadMember, unLoadMovie, mergeDisplayTemplate, updateFrame, updateStage |
| Player | alert, appMinimize, cursor, externalParamName, externalParamValue, flushInputEvents, getPref, halt, open, quit, setPref, windowPresent |
| Sound | beep, channel |
| System | date, restart, shutDown, time |
| Global | clearGlobals, showGlobals |
| Key | keyPressed |
| Member | copyToClipBoard, duplicate, erase, importFileInto, move, pasteClipBoardInto, unLoad |
| Cast Library | findEmpty |
| Window | close, forget, maximize, mergeProps, minimize, moveToBack, moveToFront, restore |
| Sound Channel | breakLoop, fadeIn, fadeOut, fadeTo, getPlayList, isBusy, pause, play, playFile, playNext, queue, rewind, setPlayList, stop |
| Sprite Channel | makeScriptedSprite, removeScriptedSprite |
| top (free functions) | abort, abs, atan, bitAnd, bitNot, bitOr, bitXor, browserName, build, cacheSize, call, callAncestor, callFrame, camera, charToNum, chars, clearCache, cos, count, externalEvent, findLabel, flashToStage, float, floatP, getNetText, getStreamStatus, goToFrame, gotoNetMovie, gotoNetPage, handler, handlers, hitTest, ignoreWhiteSpace, ilk, image, integer, integerP, last, lastClick*, lastEvent, length, light, listP, log, makeList, makeSubList, max, mci, member*, min, netAbort, netDone, netError, netLastModDate, netMIME, netTextResult, numToChar, objectP, offset, postNetText, power, preloadNetThing, quit*, random, script, sin, sound*, sprite*, sqrt, string, stringP, symbol, symbolP, tan, union, value, voidP, window* |
| creator | color, list, point, propList, rect |

`*` = top-level wrapper that delegates to a core object (member→movie.castLib, sound→sound channels, sprite→sprite channels, window→player.window) but is itself a free top-level function.

## Method audit vs methods.txt (C1)

### WRONG — delete + recreate (docs contradict current body)

| file | current body | docs say | action |
|---|---|---|---|
| `color.js` | single-arg → gray `Color(n,n,n)` | single-int = 8-bit palette index; `color(r,g,b)` = RGB | recreate (C5; palette form + built-in palettes) |
| `value.js` | parseFloat + TRUE/FALSE/VOID/EMPTY + symbol | parse stringExpression, return logical value; unparseable → leading parsable portion; `"3+4"` → 7; `"penny"` → VOID | recreate (C7; expression engine) |
| `halt.js` | routes `_getMovie().halt()` | director_core_objects (C2): Player method; PlayerObject has `halt() {}` | recreate → route `_getPlayer().halt()` (movie.js has no halt) |
| `list.js` / `propList.js` | `new List()` / `new PropList()` (no Proxy) | base `list()`/`propList()` creators return bracket/list-syntax Proxy | recreate → delegate to base creators (keeps Proxy) |

### VERIFIED — body matches docs (no change)

abs, integer (`Math.round` — docs: "rounds to nearest" per `integer(3.75)`→4), float, string, random (1..N inclusive), min/max (incl. list form), bitAnd/bitNot/bitOr/bitXor, charToNum/numToChar, sqrt, chars (1-based), offset (0 if absent), count (list.count).

### DELEGATING — correct per owner; bodies stay, only the slot source changes (C8)

go, goLoop, goNext, goPrevious, marker, label(?) , halt, delay, cursor, stopEvent, alert, appMinimize, externalParamName, externalParamValue, flushInputEvents, quit, beep, beginRecording, insertFrame(d), idleLoadDone, sound, sprite, member, castLib, window, maximize, moveToFront/Back, close, forget, restore, minimize. These import `engine/subsystem/singletons.js` — the source flips to the active-context accessor (R2).

### PLACEHOLDER — stub bodies consistent with "core object owns it" (003), no top-level doc conflict

findLabel → 0 (docs: `_movie.findLabel`; real body 003), findEmpty → 0 (castLib owns; 003), goToFrame/maximize (sprite/window object methods; 003), lastClick (player state; 003). These stay until 003; the top-level method just delegates to the owner when the owner is live.

## No-context neutral map (R8)

| category | no-context return |
|---|---|
| movie/player/sound member/castLib | null / 0 / "" (neutral) |
| key | false / 0 / "" |
| system | null |
| global | undefined |
| net | false / "" |
| top (pure) | always computed (no context needed) |
| creator | always works |

## Singleton-retirement blast radius (C8/R3)

- `engine/subsystem/singletons.js` — `export let _ovie/_ire…` → **retire**. New `engine/subsystem/accessor.js`: `getActiveDirectorContext()/setActiveDirectorContext()`.
- `api/index.js` — 4 singleton re-exports → from accessor getters; creator re-exports → from `.methods/` (C6).
- `engine/syntax/the-proxy.js` — `SINGLETONS` map → `ctx = getActiveDirectorContext()` (R5).
- `engine/subsystem/context.js` — `activate()` calls `setActiveDirectorContext(this)`; `destroy()` clears; `_installSingletonsOnGlobal` removed (globalThis installs retired).
- `browser/index.js` — imports `_installSingletons/_resetSingletons` → rebind to accessor.
- Tests importing `_installSingletons/_resetSingletons/_ovie`: `context.test.js`, `singletons.test.js`, `movie-score-bridge.test.js`, `the-score-wiring.test.js` — rewritten to bind contexts directly.
- `_score` internal slot (score-slot.js) stayed until 006 R9 — replaced by the active-context accessor (movie.js + proxy resolve `ctx.score`).

## Net registry → subsystem (R9, user direction 2026-09-01)

- The 13 net method files routed through the module-global `api/methods/_netRegistry.js` — **deleted**. The transaction registry is the context-owned `engine/subsystem/net-state.js` `NetState` (004), now extended: `lastNetId`, `hasFinished()`, `errorString()`, `findByUrl()`, `get(id)`, `bytesSoFar/bytesTotal/localFile` in records + `update`.
- Net methods route through `_getNetState()` (singletons facade): active context's `netState`, else a module-scoped default `NetState` (stable per-worker, keeps `netID` continuity without a context).
- Reader mapping (old `_netRegistry` → `NetState`): `getLastNetId` → `lastNetId`; `getTransaction` → `get(id)`; `updateTransaction` → `update`; `findTransactionByUrl` → `findByUrl(url)`; `set/getAbortController` → `begin({abortController})`; `netDone` → `hasFinished`; `netError` → `errorString` (("OK"/message/"")); `netTextResult` → `textResult` (null → ""); `netMIME` → `mime`; `netLastModDate` → `lastModDate` ("" if none); `getStreamStatus` → maps `status` → "Complete"/"Error"/"InProgress", `bytesSoFar/Total`, URL, error text.
- `lastClick.js`/`lastEvent.js` module-global timers **deleted** → read `PlayerObject.lastClick`/`.lastEvent` (already the docs' Player-property home; 008 wires the times).
- Status vocab unified: `inflight`/`done`/`error` (NetState) replaces "InProgress/Connecting/Started/Complete/Error".

## value() expression engine scope (R7)

parse in order: literal number / ±number / constants TRUE/FALSE/VOID/EMPTY / binary `+ - * /` on numbers / bracketed list string `"[a, b]"` → live list / `"#sym"` → symbol / quoted string / leading-token fallback (`"3 5"` → 3; `"penny"` → VOID). NO eval(); NO user-handler invocation (documented deviation, spec edge cases).

## color() palette scope (R6)

`color(i)` (1 arg) → `{paletteIndex:i, red/green/blue:PALETTES[active][i]}`; `color(r,g,b)` → RGB (clamped); built-in symbols `#systemMac/#systemWin/#rainbow/#grayscale/…` → PALETTES table (Web-safe 216 + grayscale as default runtime palette); `paletteRef` symbol-key resolution; real cast-member palettes → 008; `rgb()` NOT added.