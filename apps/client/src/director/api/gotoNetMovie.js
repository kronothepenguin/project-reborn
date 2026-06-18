// gotoNetMovie(url)
// Per docs/drmx2004_scripting_ref.txt lines 18162-18195.
// A second gotoNetMovie while one is in progress cancels the first.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
  getAbortController,
  findTransactionByUrl,
} from "./_netRegistry.js";

export function gotoNetMovie(url) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("gotoNetMovie: URL is required");
  }

  const previousId = findTransactionByUrl(url);
  if (previousId != null) {
    const prevController = getAbortController(previousId);
    if (prevController) prevController.abort();
  }

  const id = createTransaction();
  updateTransaction(id, { url, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  if (typeof window !== "undefined" && window.location) {
    try {
      window.location.href = url;
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
