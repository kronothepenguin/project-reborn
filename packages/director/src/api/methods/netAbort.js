// @owner net
// netAbort(url, netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21212-21240.
// Cancels a network operation by netID if provided, otherwise by URL.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function netAbort(url, netID) {
  const nl = _getNetLingo();

  if (netID != null) {
    nl.netAbort(netID);
    return;
  }

  if (typeof url !== "string" || url.length === 0) {
    throw new Error("netAbort: URL is required when netID is not provided");
  }

  const id = nl.netState.findByUrl(url);
  if (id == null) return;
  nl.netAbort(id);
}