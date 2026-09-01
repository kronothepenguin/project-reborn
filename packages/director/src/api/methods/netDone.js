// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netDone(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21241-21304.
// Returns true when a background loading operation is finished or
// terminated by an error; false while still in progress.


export function netDone(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  return ns.hasFinished(id);
}
