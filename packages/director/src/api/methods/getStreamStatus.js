// @owner net
import { _getNetState } from "../../engine/subsystem/singletons.js";
// getStreamStatus(netID)
// Per docs/drmx2004_scripting_ref.txt lines 17817-17872.
// Returns a property list with #URL, #state, #bytesSoFar, #bytesTotal, #error.


export function getStreamStatus(netID) {
  const ns = _getNetState();
  const id = netID != null ? netID : ns.lastNetId;
  const rec = ns.get(id);
  if (!rec) {
    return {
      URL: "",
      state: "NoInformation",
      bytesSoFar: 0,
      bytesTotal: 0,
      error: "",
    };
  }
  return {
    URL: rec.url || "",
    state: rec.status === "done" ? "Complete" : rec.status === "error" ? "Error" : "InProgress",
    bytesSoFar: rec.bytesSoFar || 0,
    bytesTotal: rec.bytesTotal || 0,
    error: ns.errorString(id) === "OK" ? "" : ns.errorString(id),
  };
}
