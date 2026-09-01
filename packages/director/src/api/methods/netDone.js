// netDone(netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21241-21304.
// Returns true when a background loading operation is finished or
// terminated by an error; false while still in progress.

import { getTransaction, getLastNetId } from "./_netRegistry.js";

export function netDone(netID) {
  const id = netID != null ? netID : getLastNetId();
  const trans = getTransaction(id);
  if (!trans) return false;
  return trans.state === "Complete" || trans.state === "Error";
}
