import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { postNetText } from "../postNetText.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { netTextResult } from "../netTextResult.js";
import { __resetForTests } from "../_netRegistry.js";

describe("postNetText", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (name) =>
            name.toLowerCase() === "content-type" ? "text/plain" : null,
        },
        text: async () => "server-response",
      }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof postNetText).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    const id = postNetText("http://example.com/api", "data=value");
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("POSTs string payload with text/plain Content-Type", () => {
    postNetText("http://example.com/api", "raw=data");
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("http://example.com/api");
    expect(init.method).toBe("POST");
    expect(init.body).toBe("raw=data");
    expect(init.headers["Content-Type"]).toBe("text/plain");
  });

  it("POSTs property list with x-www-form-urlencoded Content-Type", () => {
    postNetText("http://example.com/api", { FName: "John", LName: "Doe" });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(init.body).toBe("FName=John&LName=Doe");
  });

  it("strips leading # from property list keys (symbol style)", () => {
    postNetText("http://example.com/api", { "#name": "Bill" });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.body).toBe("name=Bill");
  });

  it("converts numeric property values to strings", () => {
    postNetText("http://example.com/api", { Score: 42 });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init.body).toBe("Score=42");
  });

  it("netDone returns false while pending and true after success", async () => {
    const id = postNetText("http://example.com/api", "data");
    expect(netDone(id)).toBe(false);
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
  });

  it("netTextResult returns server response after success", async () => {
    const id = postNetText("http://example.com/api", "data");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult(id)).toBe("server-response");
  });

  it("netError returns OK on success", async () => {
    const id = postNetText("http://example.com/api", "data");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("OK");
  });

  it("marks Error on HTTP failure", async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: { get: () => null },
        text: async () => "",
      }),
    );
    const id = postNetText("http://example.com/api", "data");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("HTTP 500");
  });

  it("marks Error on network failure", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("offline")));
    const id = postNetText("http://example.com/api", "data");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("offline");
  });

  it("throws when URL is missing", () => {
    expect(() => postNetText("", "data")).toThrow(/URL is required/);
  });

  it("throws when payload is missing", () => {
    expect(() => postNetText("http://example.com/api", null)).toThrow(/required/);
  });
});
