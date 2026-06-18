// netError(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21305-21422.
// Returns "OK" on success, the error message/code on failure,
// or "" if no background operation has started or is in progress.

import { getTransaction, getLastNetId } from "./_netRegistry.js";

export function netError(netID) {
  const id = netID != null ? netID : getLastNetId();
  const trans = getTransaction(id);
  if (!trans) return "";
  return trans.error || "";
}
