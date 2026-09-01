// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netError(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21305-21422.
// Returns "OK" on success, the error message/code on failure,
// or "" if no background operation has started or is in progress.


export function netError(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  return ns.errorString(id);
}
