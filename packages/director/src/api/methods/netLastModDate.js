// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netLastModDate()
// Per docs/drmx2004_scripting_ref.txt lines 21423-21465.
// Returns the Last-Modified HTTP header string (GMT format) for
// the most recent network operation, or "" if not available.


export function netLastModDate(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  const d = ns.lastModDate(id);
  return d ? d : "";
}
