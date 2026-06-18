import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netError } from "../netError.js";
import { getNetText } from "../getNetText.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netError", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "ok",
      }),
    );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof netError).toBe("function");
  });

  it("returns empty string for unknown netID", () => {
    expect(netError(9999)).toBe("");
  });

  it("returns OK on success", async () => {
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("OK");
  });

  it("returns the error message on failure", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("offline")));
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("offline");
  });

  it("returns HTTP status code on non-2xx response", async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: { get: () => null },
        text: async () => "",
      }),
    );
    const id = getNetText("http://example.com/missing.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("HTTP 404");
  });

  it("defaults to last transaction when no netID provided", async () => {
    getNetText("http://example.com/last.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError()).toBe("OK");
  });
});
