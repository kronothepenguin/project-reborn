// @owner net
// netError(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21305-21422.
// Returns a text string describing the most recently encountered error.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netError(netID) {
  return _getNetLingo().netError(netID);
}