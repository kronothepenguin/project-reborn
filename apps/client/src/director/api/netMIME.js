// netMIME()
// Per docs/drmx2004_scripting_ref.txt lines 21466-21529.
// Returns the Content-Type (MIME) of the most recent network operation.

import { getLastNetId, getTransaction } from "./_netRegistry.js";

export function netMIME() {
  const id = getLastNetId();
  const trans = getTransaction(id);
  if (!trans) return "";
  return trans.mime || "";
}
