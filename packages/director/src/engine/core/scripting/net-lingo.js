// NetLingo scripting object (011).
//
// "Enables you to perform network operations such as obtaining or streaming
// media from a network, checking network availability, checking the progress
// of a network operation, and so on." — docs/drmx2004_scripting_ref/
// scripting_objects.txt.
//
// The user's directive (011 clarify): the net LOGIC and net STATE live HERE,
// on the NetLingo object; the top-level api net methods (006) delegate to it.
// Each active DirectorContext owns one NetLingoObject; the underlying
// transaction registry (NetState) is internal state owned by the object.

import { NetState } from "../../subsystem/net-state.js";

function parseLastModified(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function encodePropertyList(propertyList) {
  if (propertyList == null) return "";
  if (typeof propertyList === "string") return propertyList;
  const params = new URLSearchParams();
  for (const key of Object.keys(propertyList)) {
    const value = propertyList[key];
    const name = String(key).replace(/^#/, "");
    params.append(name, value == null ? "" : String(value));
  }
  return params.toString();
}

function isPropertyList(value) {
  if (value == null) return false;
  return typeof value === "object" && !Array.isArray(value);
}

/**
 * NetLingo scripting object (Chapter 7: Scripting Objects — "NetLingo").
 *
 * Enables you to perform network operations such as obtaining or streaming
 * media from a network, checking network availability, checking the progress
 * of a network operation, and so on.
 *
 * You can create a reference to a NetLingo object by using the new operator:
 * `new xtra("netlingo")`.
 *
 * Method summary: browserName(), cacheDocVerify(), cacheSize(), clearCache(),
 * downloadNetThing(), externalEvent(), getLatestNetID(), getNetText(),
 * getStreamStatus(), gotoNetMovie(), gotoNetPage(), netAbort(), netDone(),
 * netError(), netLastModDate(), netMIME(), netStatus(), netTextResult(),
 * postNetText(), preloadNetThing(), proxyServer(), tellStreamStatus(),
 * URLEncode().
 */
export class NetLingoObject {
  constructor() {
    // The transaction registry: internal state of the NetLingo object (011).
    this.netState = new NetState();
  }

  // ── status/result accessors ────────────────────────────────────────────

  /**
   * Returns TRUE when a background loading operation is finished or terminated
   * by an error; FALSE while still in progress.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {boolean}
   */
  netDone(netID) {
    const id = netID != null ? netID : this.netState.lastNetId;
    return this.netState.hasFinished(id);
  }

  /**
   * Returns a text string describing the most recently encountered error.
   * Returns "OK" (<Void> in Director) when no error occurred.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {string}
   */
  netError(netID) {
    const id = netID != null ? netID : this.netState.lastNetId;
    return this.netState.errorString(id);
  }

  /**
   * Returns the Content-Type (MIME) of the most recent network operation.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {string}
   */
  netMIME(netID) {
    const id = netID != null ? netID : this.netState.lastNetId;
    return this.netState.mime(id);
  }

  /**
   * Returns the date the network operation's document was last modified, as a
   * date string.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {string|null}
   */
  netLastModDate(netID) {
    const id = netID != null ? netID : this.netState.lastNetId;
    const d = this.netState.lastModDate(id);
    return d ? d.toString() : d;
  }

  /**
   * Returns the text obtained by the specified (or last) network operation.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {string}
   */
  netTextResult(netID) {
    const id = netID != null ? netID : this.netState.lastNetId;
    return this.netState.textResult(id);
  }

  /**
   * Returns the ID of the most recent network operation.
   *
   * @returns {number}
   */
  getLatestNetID() {
    return this.netState.lastNetId;
  }

  /**
   * Returns a stream-status snapshot for a network operation.
   *
   * @param {number} [netID] Optional. The ID of a previous network operation.
   * @returns {object}
   */
  getStreamStatus(netID) {
    return this.netState.streamStatus(netID);
  }

  /**
   * Aborts a previous network operation.
   *
   * @param {number} netID Required. The ID of a previous network operation.
   * @returns {void}
   */
  netAbort(netID) {
    this.netState.abort(netID);
  }

  // ── net-op initiators (the fetch logic lives here — 011) ──────────────

  /**
   * Gets text from a specified URL; returns a netID immediately and updates
   * the transaction as the fetch resolves/rejects.
   *
   * @param {string} url Required. The URL of the text to retrieve.
   * @param {object|string} [propertyList] Optional. URL-encoded property list or query text.
   * @param {string} [_serverOSString] Ignored (deterministic v1).
   * @param {string} [_characterSet] Ignored (deterministic v1).
   * @returns {number}
   */
  getNetText(url, propertyList, _serverOSString, _characterSet) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("getNetText: URL is required");
    }
    const encoded = encodePropertyList(propertyList);
    const finalUrl = encoded ? `${url}?${encoded}` : url;

    const controller = new AbortController();
    const id = this.netState.begin({ url: finalUrl, abortController: controller });

    fetch(finalUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          this.netState.update(id, { status: "error", error: `HTTP ${response.status}` });
          return null;
        }
        const total = Number(response.headers.get("content-length")) || 0;
        this.netState.update(id, {
          status: "inflight",
          bytesTotal: total,
          mime: response.headers.get("content-type") || "",
          lastMod: parseLastModified(response.headers.get("last-modified")),
        });
        return response.text();
      })
      .then((text) => {
        if (text == null) return;
        this.netState.update(id, {
          status: "done",
          data: text,
          error: null,
          bytesSoFar: text.length,
        });
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          this.netState.update(id, { status: "error", error: "4242" });
        } else {
          this.netState.update(id, {
            status: "error",
            error: err && err.message ? err.message : "Network error",
          });
        }
      });

    return id;
  }

  /**
   * Posts text to a specified URL; returns a netID immediately.
   *
   * @param {string} url Required. The URL to post to.
   * @param {object|string} propertyListOrText Required. A property list (form-encoded) or plain text.
   * @param {string} [_serverOSString] Ignored (deterministic v1).
   * @param {string} [_serverCharSetString] Ignored (deterministic v1).
   * @returns {number}
   */
  postNetText(url, propertyListOrText, _serverOSString, _serverCharSetString) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("postNetText: URL is required");
    }
    if (propertyListOrText == null) {
      throw new Error("postNetText: propertyList or postText is required");
    }

    const controller = new AbortController();
    const id = this.netState.begin({ url, abortController: controller });

    const isForm = isPropertyList(propertyListOrText);
    const body = encodePropertyList(propertyListOrText);
    const headers = isForm
      ? { "Content-Type": "application/x-www-form-urlencoded" }
      : { "Content-Type": "text/plain" };

    fetch(url, { method: "POST", headers, body, signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          this.netState.update(id, { status: "error", error: `HTTP ${response.status}` });
          return null;
        }
        const total = Number(response.headers.get("content-length")) || 0;
        this.netState.update(id, {
          status: "inflight",
          bytesTotal: total,
          mime: response.headers.get("content-type") || "",
        });
        return response.text();
      })
      .then((text) => {
        if (text == null) return;
        this.netState.update(id, {
          status: "done",
          data: text,
          error: null,
          bytesSoFar: text.length,
        });
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          this.netState.update(id, { status: "error", error: "4242" });
        } else {
          this.netState.update(id, {
            status: "error",
            error: err && err.message ? err.message : "Network error",
          });
        }
      });

    return id;
  }

  /**
   * Preloads a file from the Internet into the browser cache so the current
   * movie continues to play while the file is fetched.
   *
   * @param {string} url Required. The URL of the file to preload.
   * @returns {number}
   */
  preloadNetThing(url) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("preloadNetThing: URL is required");
    }

    const controller = new AbortController();
    const id = this.netState.begin({ url, abortController: controller });

    fetch(url, { signal: controller.signal, cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          this.netState.update(id, { status: "error", error: `HTTP ${response.status}` });
          return null;
        }
        const total = Number(response.headers.get("content-length")) || 0;
        this.netState.update(id, {
          status: "inflight",
          bytesTotal: total,
          mime: response.headers.get("content-type") || "",
        });
        return response.text();
      })
      .then((text) => {
        if (text == null) return;
        this.netState.update(id, {
          status: "done",
          data: text,
          error: null,
          bytesSoFar: text.length,
        });
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          this.netState.update(id, { status: "error", error: "4242" });
        } else {
          this.netState.update(id, {
            status: "error",
            error: err && err.message ? err.message : "Network error",
          });
        }
      });

    return id;
  }

  /**
   * Downloads a file from the Internet to a local file. Director movies in
   * authoring mode and projectors support the command, but the Shockwave
   * Player does not. The local-file write step is a no-op in the browser
   * (no filesystem); callers may consume the bytes via the transaction.
   *
   * @param {string} url Required. The URL of the file to download.
   * @param {string} localFile Required. The local file name (ignored in the browser).
   * @returns {number}
   */
  downloadNetThing(url, localFile) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("downloadNetThing: URL is required");
    }
    if (typeof localFile !== "string" || localFile.length === 0) {
      throw new Error("downloadNetThing: localFile is required");
    }

    const controller = new AbortController();
    const id = this.netState.begin({ url, localFile, abortController: controller });

    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          this.netState.update(id, { status: "error", error: `HTTP ${response.status}` });
          return null;
        }
        const total = Number(response.headers.get("content-length")) || 0;
        this.netState.update(id, {
          status: "inflight",
          bytesTotal: total,
          mime: response.headers.get("content-type") || "",
        });
        return response.blob();
      })
      .then((blob) => {
        if (blob == null) return;
        this.netState.update(id, {
          status: "done",
          data: blob,
          error: null,
          bytesSoFar: blob.size,
        });
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          this.netState.update(id, { status: "error", error: "4242" });
        } else {
          this.netState.update(id, {
            status: "error",
            error: err && err.message ? err.message : "Network error",
          });
        }
      });

    return id;
  }

  /**
   * Branches to a specified Director or Shockwave movie on the Internet.
   *
   * @param {string} url Required. The URL of the movie to branch to.
   * @returns {number}
   */
  gotoNetMovie(url) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("gotoNetMovie: URL is required");
    }
    this.netState.setGotoNetMoviePending(url);
    if (typeof window !== "undefined" && window.location) {
      try {
        window.location.href = url;
      } catch {
        // no-op — navigation handled by the main-thread relay
      }
    }
    const controller = new AbortController();
    const id = this.netState.begin({ url, abortController: controller });
    this.netState.update(id, { status: "done", error: null });
    return id;
  }

  /**
   * Opens a specified URL in a specified browser window.
   *
   * @param {string} url Required. The URL of the page to open.
   * @param {string} [targetName] Optional. The name of the browser window.
   * @returns {number}
   */
  gotoNetPage(url, targetName) {
    if (typeof url !== "string" || url.length === 0) {
      throw new Error("gotoNetPage: URL is required");
    }
    if (typeof window !== "undefined" && window.location) {
      try {
        if (targetName) {
          window.open(url, targetName);
        } else {
          window.location.href = url;
        }
      } catch {
        // no-op
      }
    }
    const controller = new AbortController();
    const id = this.netState.begin({ url, abortController: controller });
    this.netState.update(id, { status: "done", error: null });
    return id;
  }

  // ── deterministic / stub surface ───────────────────────────────────────

  /**
   * Returns the name of the browser from which the Director movie was launched.
   *
   * @returns {string}
   */
  browserName() {
    return "browser"; // deterministic v1stub (runtime has no browser identity)
  }

  /**
   * Returns the number of bytes of the document at the specified URL that are
   * currently cached on disk.
   *
   * @param {string} url Required. The URL to check.
   * @returns {number}
   */
  cacheDocVerify(url) {
    return 0; // no on-disk cache in the runtime
  }

  /**
   * Returns the number of the cache directory currently in use.
   *
   * @returns {number}
   */
  cacheSize() {
    return 0;
  }

  /**
   * Clears the memory cache.
   *
   * @returns {void}
   */
  clearCache() {
    // no cache in the runtime — no-op
  }

  /**
   * Returns details on a network operation's state.
   *
   * @returns {object}
   */
  netStatus() {
    return { done: this.netState.hasFinished(this.netState.lastNetId), lastNetId: this.netState.lastNetId };
  }

  /**
   * Returns the name of the proxy server used by the current web browser.
   *
   * @returns {string}
   */
  proxyServer() {
    return ""; // deterministic v1 stub
  }

  /**
   * URL-encodes a string.
   *
   * @param {string} stringToEncode Required. The string to encode.
   * @returns {string}
   */
  URLEncode(stringToEncode) {
    return encodeURIComponent(String(stringToEncode ?? ""));
  }

  /**
   * Tells the Shockwave player to call the streamStatus callback for the
   * specified download.
   *
   * @param {number} netID Required. The ID of the download.
   * @returns {void}
   */
  tellStreamStatus(netID) {
    this.netState.streamStatus(netID);
  }

  /**
   * Generates an external event that can be received by the host application.
   * (Delegates to the top-level externalEvent() bridge — see api/methods;
   * the object form is a deterministic no-op stub in v1.)
   *
   * @param {string} _name The name of the event.
   * @param {...*} _args Event arguments.
   * @returns {void}
   */
  externalEvent(_name, ..._args) {
    // TODO(011): route through the worker→host bridge when a host is bound.
  }
}