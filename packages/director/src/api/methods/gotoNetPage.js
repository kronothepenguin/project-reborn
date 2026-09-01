// @owner net
// gotoNetPage(url, targetName?)
// Per docs/drmx2004_scripting_ref.txt lines 18196-18239.

import { _getNetState } from "../../engine/subsystem/singletons.js";

export function gotoNetPage(url, targetName) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("gotoNetPage: URL is required");
  }

  const net = _getNetState();
  const controller = new AbortController();
  const id = net.begin({ url, abortController: controller });

  if (typeof window !== "undefined" && window.location) {
    try {
      if (targetName) {
        window.open(url, targetName);
      } else {
        window.location.href = url;
      }
    } catch (err) {
      net.update(id, { status: "error", error: err && err.message ? err.message : "Navigation failed" });
      return id;
    }
  }

  net.update(id, { status: "done", error: null });
  return id;
}
