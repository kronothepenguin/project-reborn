// @owner net
// netDone(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21241-21304.
// Returns true when a background loading operation is finished or
// terminated by an error; false while still in progress.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netDone(netID) {
  return _getNetLingo().netDone(netID);
}