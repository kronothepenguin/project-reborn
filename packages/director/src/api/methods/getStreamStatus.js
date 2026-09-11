// @owner net
// getStreamStatus(netID)
// Per docs/drmx2004_scripting_ref.txt lines 17817-17872.
// Returns a stream-status snapshot for a network operation.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function getStreamStatus(netID) {
  return _getNetLingo().getStreamStatus(netID);
}