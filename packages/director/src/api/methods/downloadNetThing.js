// @owner net
// downloadNetThing(url, localFile)
// Per docs/drmx2004_scripting_ref.txt lines 15301-15333.
// Director movies in authoring mode and projectors support the
// downLoadNetThing command, but the Shockwave Player does not.
// In a browser context we use the fetch API to retrieve the URL and
// pass the result to the caller via the transaction registry so that
// netDone/netError can be polled. The local file write step is a
// no-op in the browser (no filesystem); callers may consume the
// bytes via fetch streams if they need to persist them.

import { _getNetState } from "../../engine/subsystem/singletons.js";

export function downloadNetThing(url, localFile) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("downloadNetThing: URL is required");
  }
  if (typeof localFile !== "string" || localFile.length === 0) {
    throw new Error("downloadNetThing: localFile is required");
  }

  const net = _getNetState();
  const controller = new AbortController();
  const id = net.begin({ url, localFile, abortController: controller });

  fetch(url, { signal: controller.signal })
    .then((response) => {
      if (!response.ok) {
        net.update(id, { status: "error", error: `HTTP ${response.status}` });
        return null;
      }
      const total = Number(response.headers.get("content-length")) || 0;
      net.update(id, {
        status: "inflight",
        bytesTotal: total,
        mime: response.headers.get("content-type") || "",
      });
      return response.blob();
    })
    .then((blob) => {
      if (blob == null) return;
      net.update(id, { status: "done", data: blob, error: null, bytesSoFar: blob.size });
    })
    .catch((err) => {
      if (err && err.name === "AbortError") {
        net.update(id, { status: "error", error: "4242" });
      } else {
        net.update(id, {
          status: "error",
          error: err && err.message ? err.message : "Network error",
        });
      }
    });

  return id;
}
