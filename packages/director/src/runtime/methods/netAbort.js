// netAbort(url, netID?)
// Per docs/drmx2004_scripting_ref.txt lines 21212-21240.
// Cancels a network operation by netID if provided, otherwise by URL.

import {
  getAbortController,
  findTransactionByUrl,
  updateTransaction,
  getTransaction,
} from "./_netRegistry.js";

export function netAbort(url, netID) {
  if (netID != null) {
    const controller = getAbortController(netID);
    if (controller) {
      try {
        controller.abort();
      } catch (_e) {
        // ignore
      }
    }
    const trans = getTransaction(netID);
    if (trans) {
      updateTransaction(netID, { state: "Error", error: "4242" });
    }
    return;
  }

  if (typeof url !== "string" || url.length === 0) {
    throw new Error("netAbort: URL is required when netID is not provided");
  }

  const id = findTransactionByUrl(url);
  if (id == null) return;
  const controller = getAbortController(id);
  if (controller) {
    try {
      controller.abort();
    } catch (_e) {
      // ignore
    }
  }
  updateTransaction(id, { state: "Error", error: "4242" });
}
