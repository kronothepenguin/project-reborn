// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netTextResult(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21552-21596.
// Returns the text obtained by the specified (or last) network operation.


export function netTextResult(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  return ns.textResult(id);
}
