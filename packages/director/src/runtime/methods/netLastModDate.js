// netLastModDate()
// Per docs/drmx2004_scripting_ref.txt lines 21423-21465.
// Returns the Last-Modified HTTP header string (GMT format) for
// the most recent network operation, or "" if not available.

import { getLastNetId, getTransaction } from "./_netRegistry.js";

export function netLastModDate() {
  const id = getLastNetId();
  const trans = getTransaction(id);
  if (!trans) return "";
  return trans.lastModDate || "";
}
