// Lingo public surface
// Re-exports docs-defined singletons, constants, syntax stand-ins, and
// top-level Lingo methods. Intended for translated `.ls -> .js` Lingo code,
// the JS client, and consumers of the Director runtime.
//
// The 7 singleton names (`_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/`_global`)
// resolve to the ACTIVE DirectorContext's core-object instances (006 C8).
// `DirectorContext.activate()` installs itself as the active context; the
// accessor module owns that single pointer. No globalThis installs, no mutable
// module-level slots. `_getMovie()`/… are the concrete getters; the bare names
// are alias re-exports for translated Lingo code.

// --- Singletons (Chapter 5) ---
export { _getMovie as _movie, _getPlayer as _player, _getSound as _sound,
         _getKey as _key, _getMouse as _mouse, _getSystem as _system,
         _getGlobal as _global } from "../engine/subsystem/singletons.js";

// --- Constants (Chapter 9) ---
export * from "../engine/base/constants.js";

// --- Syntax stand-ins ---
export * from "../engine/syntax/index.js";

// --- Top-level Lingo methods (Chapter 12) ---
export { abort } from "./methods/abort.js";
export { abs } from "./methods/abs.js";
export { alert } from "./methods/alert.js";
export { appMinimize } from "./methods/appMinimize.js";
export { atan } from "./methods/atan.js";
export { beep } from "./methods/beep.js";
export { beginRecording } from "./methods/beginRecording.js";
export { bitAnd } from "./methods/bitAnd.js";
export { bitNot } from "./methods/bitNot.js";
export { bitOr } from "./methods/bitOr.js";
export { bitXor } from "./methods/bitXor.js";
export { breakLoop } from "./methods/breakLoop.js";
export { browserName } from "./methods/browserName.js";
export { build } from "./methods/build.js";
export { cacheSize } from "./methods/cacheSize.js";
export { callAncestor } from "./methods/callAncestor.js";
export { callFrame } from "./methods/callFrame.js";
export { call } from "./methods/call.js";
export { camera } from "./methods/camera.js";
export { castLib } from "./methods/castLib.js";
export { chars } from "./methods/chars.js";
export { charToNum } from "./methods/charToNum.js";
export { clearCache } from "./methods/clearCache.js";
export { cos } from "./methods/cos.js";
export { count } from "./methods/count.js";
export { cursor } from "./methods/cursor.js";
export { delay } from "./methods/delay.js";
export { downloadNetThing } from "./methods/downloadNetThing.js";
export { duplicate } from "./methods/duplicate.js";
export { externalEvent } from "./methods/externalEvent.js";
export { externalParamName } from "./methods/externalParamName.js";
export { externalParamValue } from "./methods/externalParamValue.js";
export { findEmpty } from "./methods/findEmpty.js";
export { findLabel } from "./methods/findLabel.js";
export { flashToStage } from "./methods/flashToStage.js";
export { float } from "./methods/float.js";
export { floatP } from "./methods/floatP.js";
export { flushInputEvents } from "./methods/flushInputEvents.js";
export { getNetText } from "./methods/getNetText.js";
export { getStreamStatus } from "./methods/getStreamStatus.js";
export { go } from "./methods/go.js";
export { goLoop } from "./methods/goLoop.js";
export { goNext } from "./methods/goNext.js";
export { goPrevious } from "./methods/goPrevious.js";
export { goToFrame } from "./methods/goToFrame.js";
export { gotoNetMovie } from "./methods/gotoNetMovie.js";
export { gotoNetPage } from "./methods/gotoNetPage.js";
export { halt } from "./methods/halt.js";
export { handler } from "./methods/handler.js";
export { handlers } from "./methods/handlers.js";
export { hitTest } from "./methods/hitTest.js";
export { idleLoadDone } from "./methods/idleLoadDone.js";
export { ignoreWhiteSpace } from "./methods/ignoreWhiteSpace.js";
export { ilk } from "./methods/ilk.js";
export { image } from "./methods/image.js";
export { insertFrame } from "./methods/insertFrame.js";
export { integer } from "./methods/integer.js";
export { integerP } from "./methods/integerP.js";
export { lastClick } from "./methods/lastClick.js";
export { lastEvent } from "./methods/lastEvent.js";
export { last } from "./methods/last.js";
export { length } from "./methods/length.js";
export { light } from "./methods/light.js";
export { listP } from "./methods/listP.js";
export { log } from "./methods/log.js";
export { makeList } from "./methods/makeList.js";
export { makeSubList } from "./methods/makeSubList.js";
export { marker } from "./methods/marker.js";
export { max } from "./methods/max.js";
export { maximize } from "./methods/maximize.js";
export { mci } from "./methods/mci.js";
export { member } from "./methods/member.js";
export { min } from "./methods/min.js";
export { netAbort } from "./methods/netAbort.js";
export { netDone } from "./methods/netDone.js";
export { netError } from "./methods/netError.js";
export { netLastModDate } from "./methods/netLastModDate.js";
export { netMIME } from "./methods/netMIME.js";
export { netTextResult } from "./methods/netTextResult.js";
export { numToChar } from "./methods/numToChar.js";
export { objectP } from "./methods/objectP.js";
export { offset } from "./methods/offset.js";
export { postNetText } from "./methods/postNetText.js";
export { power } from "./methods/power.js";
export { preloadNetThing } from "./methods/preloadNetThing.js";
export { quit } from "./methods/quit.js";
export { random } from "./methods/random.js";
export { script } from "./methods/script.js";
export { sin } from "./methods/sin.js";
export { sound } from "./methods/sound.js";
export { sprite } from "./methods/sprite.js";
export { sqrt } from "./methods/sqrt.js";
export { stopEvent } from "./methods/stopEvent.js";
export { string } from "./methods/string.js";
export { stringP } from "./methods/stringP.js";
export { symbol } from "./methods/symbol.js";
export { symbolP } from "./methods/symbolP.js";
export { tan } from "./methods/tan.js";
export { union } from "./methods/union.js";
export { value } from "./methods/value.js";
export { voidP } from "./methods/voidP.js";
export { window } from "./methods/window.js";

// --- Data-type classes (Chapter 2 data types) ---
export { Color } from "../engine/base/color.js";
export { List } from "../engine/base/list.js";
export { PropList } from "../engine/base/prop-list.js";
export { Point } from "../engine/base/point.js";
export { Rect } from "../engine/base/rect.js";

// --- Data-type creators (Chapter 2 data types) ---
// The creators live in api/methods/ (method layer over the engine/base
// classes). color() supports both the 8-bit palette-index form and the RGB
// form (006 C5); list/point/propList/rect delegate to engine/base types.
export { color } from "./methods/color.js";
export { list } from "./methods/list.js";
export { point } from "./methods/point.js";
export { propList } from "./methods/propList.js";
export { rect } from "./methods/rect.js";
