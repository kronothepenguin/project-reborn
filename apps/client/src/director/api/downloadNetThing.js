// downloadNetThing(url, localFile)
// Per docs/drmx2004_scripting_ref.txt lines 15301-15333.
// Director movies in authoring mode and projectors support the
// downLoadNetThing command, but the Shockwave Player does not.
// In a browser context we use the fetch API to retrieve the URL and
// pass the result to the caller via the transaction registry so that
// netDone/netError can be polled. The local file write step is a
// no-op in the browser (no filesystem); callers may consume the
// bytes via fetch streams if they need to persist them.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
} from "./_netRegistry.js";

export function downloadNetThing(url, localFile) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("downloadNetThing: URL is required");
  }
  if (typeof localFile !== "string" || localFile.length === 0) {
    throw new Error("downloadNetThing: localFile is required");
  }

  const id = createTransaction();
  updateTransaction(id, { url, localFile, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  fetch(url, { signal: controller.signal })
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
