// @owner net
// netMIME()
// Per docs/drmx2004_scripting_ref.txt lines 21466-21529.
// Returns the Content-Type (MIME) of the most recent network operation.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netMIME(netID) {
  return _getNetLingo().netMIME(netID);
}