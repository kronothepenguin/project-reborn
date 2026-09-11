// @owner net
// gotoNetMovie(url)
// Per docs/drmx2004_scripting_ref.txt lines 18162-18195.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function gotoNetMovie(url) {
  return _getNetLingo().gotoNetMovie(url);
}