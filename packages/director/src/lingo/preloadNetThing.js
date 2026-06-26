// preloadNetThing(url)
// Per docs/drmx2004_scripting_ref.txt lines 24153-24190.
// Preloads a file from the Internet into the browser cache so the
// current movie continues to play while the file is fetched.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
} from "./_netRegistry.js";

export function preloadNetThing(url) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("preloadNetThing: URL is required");
  }

  const id = createTransaction();
  updateTransaction(id, { url, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  fetch(url, { signal: controller.signal, cache: "force-cache" })
    .then((response) => {
      if (!response.ok) {
        updateTransaction(id, {
          state: "Error",
          error: `HTTP ${response.status}`,
        });
        return null;
      }
      const total = Number(response.headers.get("content-length")) || 0;
      updateTransaction(id, {
        state: "Started",
        bytesTotal: total,
        mime: response.headers.get("content-type") || "",
        lastModDate: response.headers.get("last-modified") || "",
      });
      return response.blob();
    })
    .then((blob) => {
      if (blob == null) return;
      updateTransaction(id, {
        state: "Complete",
        bytesSoFar: blob.size,
        result: blob,
        error: "OK",
      });
    })
    .catch((err) => {
      if (err && err.name === "AbortError") {
        updateTransaction(id, { state: "Error", error: "4242" });
      } else {
        updateTransaction(id, {
          state: "Error",
          error: err && err.message ? err.message : "Network error",
        });
      }
    });

  return id;
}
