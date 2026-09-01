// @owner net
// gotoNetMovie(url)
// Per docs/drmx2004_scripting_ref.txt lines 18162-18195.
// A second gotoNetMovie while one is in progress cancels the first.

import { _getNetState } from "../../engine/subsystem/singletons.js";

export function gotoNetMovie(url) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("gotoNetMovie: URL is required");
  }

  const net = _getNetState();
  const previousId = net.findByUrl(url);
  if (previousId != null) net.abort(previousId);

  const controller = new AbortController();
  const id = net.begin({ url, abortController: controller });

  if (typeof window !== "undefined" && window.location) {
    try {
      window.location.href = url;
    } catch (err) {
      net.update(id, { status: "error", error: err && err.message ? err.message : "Navigation failed" });
      return id;
    }
  }

  net.update(id, { status: "done", error: null });
  return id;
}
