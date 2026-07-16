// getNetText(url, propertyList?, serverOSString?, characterSet?)
// Per docs/drmx2004_scripting_ref.txt lines 17308-17368.

import {
  createTransaction,
  updateTransaction,
  setAbortController,
} from "./_netRegistry.js";

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

export function getNetText(url, propertyList, _serverOSString, _characterSet) {
  if (typeof url !== "string" || url.length === 0) {
    throw new Error("getNetText: URL is required");
  }

  const id = createTransaction();
  const encoded = encodePropertyList(propertyList);
  const finalUrl = encoded ? `${url}?${encoded}` : url;
  updateTransaction(id, { url: finalUrl, state: "Connecting" });

  const controller = new AbortController();
  setAbortController(id, controller);

  fetch(finalUrl, { signal: controller.signal })
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
