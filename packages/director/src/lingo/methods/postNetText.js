// postNetText(url, propertyListOrText, serverOSString?, serverCharSetString?)
// Per docs/drmx2004_scripting_ref.txt lines 23877-23943.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
} from "./_netRegistry.js";

function buildPostBody(payload) {
  if (payload == null) return "";
  if (typeof payload === "string") return payload;
  const params = new URLSearchParams();
  for (const key of Object.keys(payload)) {
    const value = payload[key];
    const name = String(key).replace(/^#/, "");
    params.append(name, value == null ? "" : String(value));
  }
  return params.toString();
}

function isPropertyList(value) {
  if (value == null) return false;
  if (typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  return true;
}

export function postNetText(url, propertyListOrText, _serverOSString, _serverCharSetString) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("postNetText: URL is required");
  }
  if (propertyListOrText == null) {
    throw new Error("postNetText: propertyList or postText is required");
  }

  const id = createTransaction();
  updateTransaction(id, { url, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  const isForm = isPropertyList(propertyListOrText);
  const body = buildPostBody(propertyListOrText);
  const headers = isForm
    ? { "Content-Type": "application/x-www-form-urlencoded" }
    : { "Content-Type": "text/plain" };

  fetch(url, {
    method: "POST",
    headers,
    body,
    signal: controller.signal,
  })
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
      return response.text();
    })
    .then((text) => {
      if (text == null) return;
      updateTransaction(id, {
        state: "Complete",
        bytesSoFar: text.length,
        result: text,
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
