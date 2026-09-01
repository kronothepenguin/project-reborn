// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// netAbort(url, netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21212-21240.
// Cancels a network operation by netID if provided, otherwise by URL.


export function netAbort(url, netID) {
  const ns = _getNetState();
  if (netID != null) {
    ns.abort(netID);
    return;
  }

  if (typeof url !== "string" || url.length === 0) {
    throw new Error("netAbort: URL is required when netID is not provided");
  }

  const id = ns.findByUrl(url);
  if (id == null) return;
  ns.abort(id);
}
