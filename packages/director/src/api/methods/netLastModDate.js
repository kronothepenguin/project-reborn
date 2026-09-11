// @owner net
// netLastModDate(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21423-21465.
// Returns the date the network operation's document was last modified.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netLastModDate(netID) {
  return _getNetLingo().netLastModDate(netID);
}