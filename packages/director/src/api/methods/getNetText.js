// @owner net
// getNetText(url, propertyList?, serverOSString?, characterSet?)
// Per docs/drmx2004_scripting_ref.txt lines 17308-17368.

import { _getNetState } from "../../engine/subsystem/singletons.js";

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

  const net = _getNetState();
  const encoded = encodePropertyList(propertyList);
  const finalUrl = encoded ? `${url}?${encoded}` : url;

  const controller = new AbortController();
  const id = net.begin({ url: finalUrl, abortController: controller });

  fetch(finalUrl, { signal: controller.signal })
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
        lastMod: parseLastModified(response.headers.get("last-modified")),
      });
      return response.text();
    })
    .then((text) => {
      if (text == null) return;
      net.update(id, {
        status: "done",
        data: text,
        error: null,
        bytesSoFar: text.length,
      });
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

function parseLastModified(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}