// NetState subsystem (FR-033, 006 R9)
//
// Per `DirectorContext`-instance registry that tracks every in-flight net
// operation. Net-op initiators (`getNetText`, `postNetText`, `preloadNetThing`,
// `downloadNetThing`, `gotoNetMovie`, `gotoNetPage`) call `fetch()` inside the
// worker, allocate a `netID` via `begin()`, return the `netID` immediately,
// and update the record as the `fetch()` promise resolves/rejects
// (research.md R9).
//
// Status/result accessors (`netDone`, `netError`, `netTextResult`, `netMIME`,
// `netLastModDate`, `getStreamStatus`) read records by `netID`.
// `netAbort(netID)` calls `AbortController.abort()` on the matching record.
//
// 006 R9: the api/methods `_netRegistry.js` module-global was merged INTO this
// subsystem (the user's directive — registry state belongs to the context, not
// module globals). The net methods resolve the active context's `netState` (or
// a module-scoped default) via the singletons facade `_getNetState()`.
//
// `gotoNetMoviePendingUrl` is the main-thread relay flag: when `gotoNetMovie`
// fires, this is set so the main-thread worker-host can read and clear it.

export class NetState {
  constructor() {
    this.nextId = 1;
    this.ops = new Map();
    this._lastNetId = 0;
    this.gotoNetMoviePendingUrl = null;
  }

  // Allocate a `netID` and record the initial "inflight" state. Returns the
  // new `netID`. The caller passes an `AbortController` so `netAbort()` can
  // signal abort across the in-flight `fetch()`.
  begin({ abortController = new AbortController(), url = null, localFile = null } = {}) {
    const id = this.nextId++;
    this._lastNetId = id;
    this.ops.set(id, {
      status: "inflight",
      response: null,
      data: null,
      error: null,
      mime: null,
      lastMod: null,
      abortController,
      stream: null,
      url,
      localFile,
      bytesSoFar: 0,
      bytesTotal: 0,
    });
    return id;
  }

  // Last allocated netID (the `netID` used by single-arg accessors).
  get lastNetId() {
    return this._lastNetId;
  }

  // Update record state. Safe to call with a subset of fields.
  update(netID, patch = {}) {
    const rec = this.ops.get(netID);
    if (!rec) return;
    if (patch.status !== undefined) rec.status = patch.status;
    if (patch.response !== undefined) rec.response = patch.response;
    if (patch.data !== undefined) rec.data = patch.data;
    if (patch.error !== undefined) rec.error = patch.error;
    if (patch.mime !== undefined) rec.mime = patch.mime;
    if (patch.lastMod !== undefined) rec.lastMod = patch.lastMod;
    if (patch.stream !== undefined) rec.stream = patch.stream;
    if (patch.url !== undefined) rec.url = patch.url;
    if (patch.localFile !== undefined) rec.localFile = patch.localFile;
    if (patch.bytesSoFar !== undefined) rec.bytesSoFar = patch.bytesSoFar;
    if (patch.bytesTotal !== undefined) rec.bytesTotal = patch.bytesTotal;
  }

  // Was the operation ever resolved without an error?
  // - returns `true` when status is "done"
  // - returns `false` when still "inflight" or "error"
  // - returns `false` (documented default) when the `netID` is unknown
  isDone(netID) {
    const rec = this.ops.get(netID);
    return rec ? rec.status === "done" : false;
  }

  // Did the operation encounter an error?
  isError(netID) {
    const rec = this.ops.get(netID);
    return rec ? rec.status === "error" : false;
  }

  // Finished = done OR error (the Lingo `netDone()` semantics: true when a
  // background loading operation is finished or terminated by an error).
  hasFinished(netID) {
    return this.isDone(netID) || this.isError(netID);
  }

  // Human-readable error text for a record. `null`/no error → "OK" (the
  // Lingo `netError()` "OK" convention); unknown id → "".
  errorString(netID) {
    const rec = this.ops.get(netID);
    if (!rec) return "";
    if (!rec.error) return "OK";
    return typeof rec.error === "string" ? rec.error : rec.error.message ?? String(rec.error);
  }

  // Result body for a completed text fetch.
  textResult(netID) {
    const rec = this.ops.get(netID);
    return rec ? (rec.data == null ? "" : rec.data) : "";
  }

  // MIME type reported by the response (or `""` when unknown).
  mime(netID) {
    const rec = this.ops.get(netID);
    return rec ? rec.mime ?? "" : "";
  }

  // `Last-Modified` header parsed into a `Date`, or `null` when missing.
  lastModDate(netID) {
    const rec = this.ops.get(netID);
    return rec ? rec.lastMod ?? null : null;
  }

  // Stream-status accessor (FR-033 `getStreamStatus`): returns a snapshot of
  // the record's status fields. Documented defaults when the `netID` is
  // unknown.
  streamStatus(netID) {
    const rec = this.ops.get(netID);
    if (!rec) return { status: "done", bytesSoFar: 0, error: "" };
    return {
      status: rec.status,
      bytesSoFar: rec.data ? rec.data.length : 0,
      error: rec.error ? String(rec.error.message ?? rec.error) : "",
    };
  }

  // Full record snapshot (006 R9 — replaces `_netRegistry.getTransaction`).
  get(netID) {
    return this.ops.get(netID) ?? null;
  }

  // Find the netID the first in-flight/completed operation for `url`.
  // (006 R9 — replaces `_netRegistry.findTransactionByUrl`.)
  findByUrl(url) {
    for (const [id, rec] of this.ops) {
      if (rec.url === url) return id;
    }
    return null;
  }

  // Abort the in-flight operation. Idempotent.
  abort(netID) {
    const rec = this.ops.get(netID);
    if (!rec) return;
    try { rec.abortController.abort(); } catch { /* noop */ }
    if (rec.status === "inflight") rec.status = "error";
    if (!rec.error) rec.error = new Error("aborted");
  }

  // Drop the record (call after the caller is done reading results).
  forget(netID) {
    this.ops.delete(netID);
  }

  // Set the main-thread relay flag for `gotoNetMovie`. The worker-host picks
  // this up and posts a `{kind:"gotoNetMovie", url}` message to the main
  // thread (FR-033).
  setGotoNetMoviePending(url) {
    this.gotoNetMoviePendingUrl = url;
  }

  takeGotoNetMoviePending() {
    const url = this.gotoNetMoviePendingUrl;
    this.gotoNetMoviePendingUrl = null;
    return url;
  }
}