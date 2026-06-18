// gotoNetPage(url, targetName?)
// Per docs/drmx2004_scripting_ref.txt lines 18196-18239.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
} from "./_netRegistry.js";

export function gotoNetPage(url, targetName) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("gotoNetPage: URL is required");
  }

  const id = createTransaction();
  updateTransaction(id, { url, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  if (typeof window !== "undefined" && window.location) {
    try {
      if (targetName) {
        window.open(url, targetName);
      } else {
        window.location.href = url;
      }
    } catch (err) {
      updateTransaction(id, {
        state: "Error",
        error: err && err.message ? err.message : "Navigation failed",
      });
      return id;
    }
  }

  updateTransaction(id, { state: "Complete", error: "OK" });
  return id;
}
