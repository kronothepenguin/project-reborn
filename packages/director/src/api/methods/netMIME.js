// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netMIME()
// Per docs/drmx2004_scripting_ref.txt lines 21466-21529.
// Returns the Content-Type (MIME) of the most recent network operation.


export function netMIME(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  return ns.mime(id);
}
