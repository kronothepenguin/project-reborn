// netTextResult(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21552-21596.
// Returns the text obtained by the specified (or last) network operation.

import { getLastNetId, getTransaction } from "./_netRegistry.js";

export function netTextResult(netID) {
  const id = netID != null ? netID : getLastNetId();
  const trans = getTransaction(id);
  if (!trans) return "";
  return trans.result == null ? "" : trans.result;
}
