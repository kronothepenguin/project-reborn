// @owner net
// gotoNetPage(url, targetName?)
// Per docs/drmx2004_scripting_ref.txt lines 18196-18239.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function gotoNetPage(url, targetName) {
  return _getNetLingo().gotoNetPage(url, targetName);
}