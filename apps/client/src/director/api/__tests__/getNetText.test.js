import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getNetText } from "../getNetText.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { netTextResult } from "../netTextResult.js";
import { netMIME } from "../netMIME.js";
import { netLastModDate } from "../netLastModDate.js";
import { __resetForTests } from "../_netRegistry.js";

function makeResponse({ ok = true, status = 200, body = "", headers = {} } = {}) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    headers: {
      get: (name) => headers[name.toLowerCase()] || null,
    },
    text: async () => body,
    blob: async () => new Blob([body]),
  };
}

describe("getNetText", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        makeResponse({
          body: "hello world",
          headers: {
            "content-type": "text/plain",
            "content-length": "11",
            "last-modified": "Wed, 01 Jan 2020 00:00:00 GMT",
          },
        }),
      ),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof getNetText).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    const id = getNetText("http://example.com/data.txt");
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("starts a fetch for the URL", () => {
    getNetText("http://example.com/data.txt");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("http://example.com/data.txt");
  });

  it("netDone returns false while pending and true after success", async () => {
    const id = getNetText("http://example.com/data.txt");
    expect(netDone(id)).toBe(false);
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
  });

  it("netTextResult returns fetched text after success", async () => {
    const id = getNetText("http://example.com/data.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult(id)).toBe("hello world");
  });

  it("netError returns OK after success", async () => {
    const id = getNetText("http://example.com/data.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("OK");
  });

  it("captures MIME and last modified date from headers", async () => {
    getNetText("http://example.com/data.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netMIME()).toBe("text/plain");
    expect(netLastModDate()).toBe("Wed, 01 Jan 2020 00:00:00 GMT");
  });

  it("URL-encodes property list as query string", () => {
    getNetText("http://example.com/cgi-bin/query.cgi", { name: "Bill" });
    expect(fetchSpy.mock.calls[0][0]).toBe(
      "http://example.com/cgi-bin/query.cgi?name=Bill",
    );
  });

  it("strips leading # from property list keys", () => {
    getNetText("http://example.com/q.cgi", { "#name": "Bill" });
    expect(fetchSpy.mock.calls[0][0]).toBe("http://example.com/q.cgi?name=Bill");
  });

  it("uses property list as-is when given a string", () => {
    getNetText("http://example.com/q.cgi", "raw=value&x=1");
    expect(fetchSpy.mock.calls[0][0]).toBe(
      "http://example.com/q.cgi?raw=value&x=1",
    );
  });

  it("handles relative URLs by passing them through", () => {
    getNetText("data.txt");
    expect(fetchSpy.mock.calls[0][0]).toBe("data.txt");
  });

  it("marks Error on HTTP failure", async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve(makeResponse({ ok: false, status: 500 })),
    );
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("HTTP 500");
    expect(netTextResult(id)).toBe("");
  });

  it("marks Error on network failure", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("offline")));
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("offline");
  });

  it("throws when URL is missing", () => {
    expect(() => getNetText("")).toThrow(/URL is required/);
  });
});
