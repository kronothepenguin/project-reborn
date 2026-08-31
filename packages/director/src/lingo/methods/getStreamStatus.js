// getStreamStatus(netID)
// Per docs/drmx2004_scripting_ref.txt lines 17817-17872.
// Returns a property list with #URL, #state, #bytesSoFar, #bytesTotal, #error.

import { getTransaction, getLastNetId } from "./_netRegistry.js";

export function getStreamStatus(netID) {
  const id = netID != null ? netID : getLastNetId();
  const trans = getTransaction(id);
  if (!trans) {
    return {
      URL: "",
      state: "NoInformation",
      bytesSoFar: 0,
      bytesTotal: 0,
      error: "",
    };
  }
  return {
    URL: trans.url || "",
    state: trans.state || "NoInformation",
    bytesSoFar: trans.bytesSoFar || 0,
    bytesTotal: trans.bytesTotal || 0,
    error: trans.error || "",
  };
}
