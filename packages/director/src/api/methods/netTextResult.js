// @owner net
// netTextResult(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21552-21596.
// Returns the text obtained by the specified (or last) network operation.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netTextResult(netID) {
  return _getNetLingo().netTextResult(netID);
}