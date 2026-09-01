// Lingo public surface
// Re-exports docs-defined singletons, constants, syntax stand-ins, and
// top-level Lingo methods. Intended for translated `.ls -> .js` Lingo code,
// the JS client, and consumers of the Director runtime.
//
// Singleton slots (`_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/`_global`)
// are live bindings owned by `runtime/singletons.js`. `DirectorContext.activate()`
// reassigns them so any consumer importing these names sees the active context's
// instances. The internal `_installSingletons` / `_resetSingletons` setters are
// deliberately NOT re-exported here.

// --- Singletons (Chapter 5) ---
export { _movie } from "../runtime/singletons.js";
export { _player } from "../runtime/singletons.js";
export { _sound } from "../runtime/singletons.js";
export { _key } from "../runtime/singletons.js";
export { _mouse } from "../runtime/singletons.js";
export { _system } from "../runtime/singletons.js";
export { _global } from "../runtime/singletons.js";

// --- Constants (Chapter 9) ---
export * from "../runtime/constants.js";

// --- Syntax stand-ins ---
export * from "../runtime/syntax/index.js";

// --- Top-level Lingo methods (Chapter 12) ---
export { abort } from "../runtime/methods/abort.js";
export { abs } from "../runtime/methods/abs.js";
export { alert } from "../runtime/methods/alert.js";
export { appMinimize } from "../runtime/methods/appMinimize.js";
export { atan } from "../runtime/methods/atan.js";
export { beep } from "../runtime/methods/beep.js";
export { beginRecording } from "../runtime/methods/beginRecording.js";
export { bitAnd } from "../runtime/methods/bitAnd.js";
export { bitNot } from "../runtime/methods/bitNot.js";
export { bitOr } from "../runtime/methods/bitOr.js";
export { bitXor } from "../runtime/methods/bitXor.js";
export { breakLoop } from "../runtime/methods/breakLoop.js";
export { browserName } from "../runtime/methods/browserName.js";
export { build } from "../runtime/methods/build.js";
export { cacheSize } from "../runtime/methods/cacheSize.js";
export { callAncestor } from "../runtime/methods/callAncestor.js";
export { callFrame } from "../runtime/methods/callFrame.js";
export { call } from "../runtime/methods/call.js";
export { camera } from "../runtime/methods/camera.js";
export { castLib } from "../runtime/methods/castLib.js";
export { chars } from "../runtime/methods/chars.js";
export { charToNum } from "../runtime/methods/charToNum.js";
export { clearCache } from "../runtime/methods/clearCache.js";
export { color } from "../runtime/methods/color.js";
export { cos } from "../runtime/methods/cos.js";
export { count } from "../runtime/methods/count.js";
export { cursor } from "../runtime/methods/cursor.js";
export { delay } from "../runtime/methods/delay.js";
export { downloadNetThing } from "../runtime/methods/downloadNetThing.js";
export { duplicate } from "../runtime/methods/duplicate.js";
export { externalEvent } from "../runtime/methods/externalEvent.js";
export { externalParamName } from "../runtime/methods/externalParamName.js";
export { externalParamValue } from "../runtime/methods/externalParamValue.js";
export { findEmpty } from "../runtime/methods/findEmpty.js";
export { findLabel } from "../runtime/methods/findLabel.js";
export { flashToStage } from "../runtime/methods/flashToStage.js";
export { float } from "../runtime/methods/float.js";
export { floatP } from "../runtime/methods/floatP.js";
export { flushInputEvents } from "../runtime/methods/flushInputEvents.js";
export { getNetText } from "../runtime/methods/getNetText.js";
export { getStreamStatus } from "../runtime/methods/getStreamStatus.js";
export { go } from "../runtime/methods/go.js";
export { goLoop } from "../runtime/methods/goLoop.js";
export { goNext } from "../runtime/methods/goNext.js";
export { goPrevious } from "../runtime/methods/goPrevious.js";
export { goToFrame } from "../runtime/methods/goToFrame.js";
export { gotoNetMovie } from "../runtime/methods/gotoNetMovie.js";
export { gotoNetPage } from "../runtime/methods/gotoNetPage.js";
export { halt } from "../runtime/methods/halt.js";
export { handler } from "../runtime/methods/handler.js";
export { handlers } from "../runtime/methods/handlers.js";
export { hitTest } from "../runtime/methods/hitTest.js";
export { idleLoadDone } from "../runtime/methods/idleLoadDone.js";
export { ignoreWhiteSpace } from "../runtime/methods/ignoreWhiteSpace.js";
export { ilk } from "../runtime/methods/ilk.js";
export { image } from "../runtime/methods/image.js";
export { insertFrame } from "../runtime/methods/insertFrame.js";
export { integer } from "../runtime/methods/integer.js";
export { integerP } from "../runtime/methods/integerP.js";
export { lastClick } from "../runtime/methods/lastClick.js";
export { lastEvent } from "../runtime/methods/lastEvent.js";
export { last } from "../runtime/methods/last.js";
export { length } from "../runtime/methods/length.js";
export { light } from "../runtime/methods/light.js";
export { list } from "../runtime/methods/list.js";
export { listP } from "../runtime/methods/listP.js";
export { log } from "../runtime/methods/log.js";
export { makeList } from "../runtime/methods/makeList.js";
export { makeSubList } from "../runtime/methods/makeSubList.js";
export { marker } from "../runtime/methods/marker.js";
export { max } from "../runtime/methods/max.js";
export { maximize } from "../runtime/methods/maximize.js";
export { mci } from "../runtime/methods/mci.js";
export { member } from "../runtime/methods/member.js";
export { min } from "../runtime/methods/min.js";
export { netAbort } from "../runtime/methods/netAbort.js";
export { netDone } from "../runtime/methods/netDone.js";
export { netError } from "../runtime/methods/netError.js";
export { netLastModDate } from "../runtime/methods/netLastModDate.js";
export { netMIME } from "../runtime/methods/netMIME.js";
export { netTextResult } from "../runtime/methods/netTextResult.js";
export { numToChar } from "../runtime/methods/numToChar.js";
export { objectP } from "../runtime/methods/objectP.js";
export { offset } from "../runtime/methods/offset.js";
export { point } from "../runtime/methods/point.js";
export { postNetText } from "../runtime/methods/postNetText.js";
export { power } from "../runtime/methods/power.js";
export { preloadNetThing } from "../runtime/methods/preloadNetThing.js";
export { propList } from "../runtime/methods/propList.js";
export { quit } from "../runtime/methods/quit.js";
export { random } from "../runtime/methods/random.js";
export { rect } from "../runtime/methods/rect.js";
export { script } from "../runtime/methods/script.js";
export { sin } from "../runtime/methods/sin.js";
export { sound } from "../runtime/methods/sound.js";
export { sprite } from "../runtime/methods/sprite.js";
export { sqrt } from "../runtime/methods/sqrt.js";
export { stopEvent } from "../runtime/methods/stopEvent.js";
export { string } from "../runtime/methods/string.js";
export { stringP } from "../runtime/methods/stringP.js";
export { symbol } from "../runtime/methods/symbol.js";
export { symbolP } from "../runtime/methods/symbolP.js";
export { tan } from "../runtime/methods/tan.js";
export { union } from "../runtime/methods/union.js";
export { value } from "../runtime/methods/value.js";
export { voidP } from "../runtime/methods/voidP.js";
export { window } from "../runtime/methods/window.js";
