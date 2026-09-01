// @owner net
// preloadNetThing(url)
// Per docs/drmx2004_scripting_ref.txt lines 24153-24190.
// Preloads a file from the Internet into the browser cache so the
// current movie continues to play while the file is fetched.

import { _getNetState } from "../../engine/subsystem/singletons.js";

export function preloadNetThing(url) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("preloadNetThing: URL is required");
  }

  const net = _getNetState();
  const controller = new AbortController();
  const id = net.begin({ url, abortController: controller });

  fetch(url, { signal: controller.signal, cache: "force-cache" })
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
