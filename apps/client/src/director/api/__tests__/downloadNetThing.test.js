import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { downloadNetThing } from "../downloadNetThing.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { netMIME } from "../netMIME.js";
import { netLastModDate } from "../netLastModDate.js";
import { __resetForTests } from "../_netRegistry.js";

function makeResponse({ ok = true, status = 200, body = "", headers = {} } = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const blob = new Blob([text]);
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    headers: {
      get: (name) => headers[name.toLowerCase()] || null,
    },
    blob: async () => blob,
    text: async () => text,
  };
}

describe("downloadNetThing", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        makeResponse({
          body: "file-bytes",
          headers: {
            "content-type": "application/octet-stream",
            "content-length": "10",
            "last-modified": "Thu, 30 Jan 1997 12:00:00 GMT",
          },
        }),
      ),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof downloadNetThing).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    const id = downloadNetThing("http://example.com/file.zip", "/tmp/file.zip");
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("starts a fetch for the URL", () => {
    downloadNetThing("http://example.com/file.zip", "/tmp/file.zip");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("http://example.com/file.zip");
  });

  it("marks the transaction Complete after success", async () => {
    const id = downloadNetThing("http://example.com/file.zip", "/tmp/file.zip");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("OK");
  });

  it("captures MIME and last modified date from headers", async () => {
    const id = downloadNetThing("http://example.com/file.zip", "/tmp/file.zip");
    await new Promise((r) => setTimeout(r, 0));
    expect(netMIME()).toBe("application/octet-stream");
    expect(netLastModDate()).toBe("Thu, 30 Jan 1997 12:00:00 GMT");
  });

  it("marks Error on HTTP failure", async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve(makeResponse({ ok: false, status: 404 })),
    );
    const id = downloadNetThing("http://example.com/missing.zip", "/tmp/missing.zip");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("HTTP 404");
  });

  it("throws when URL is missing", () => {
    expect(() => downloadNetThing("", "/tmp/file.zip")).toThrow(/URL is required/);
  });

  it("throws when localFile is missing", () => {
    expect(() => downloadNetThing("http://example.com/file.zip", "")).toThrow(/localFile is required/);
  });

  it("marks Error on network failure", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("boom")));
    const id = downloadNetThing("http://example.com/x.zip", "/tmp/x.zip");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("boom");
  });
});
