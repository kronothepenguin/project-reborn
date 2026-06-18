import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netMIME } from "../netMIME.js";
import { getNetText } from "../getNetText.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netMIME", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof netMIME).toBe("function");
  });

  it("returns empty string when no operation has occurred", () => {
    expect(netMIME()).toBe("");
  });

  it("returns the Content-Type header from a successful fetch", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (name) =>
            name.toLowerCase() === "content-type" ? "text/html; charset=utf-8" : null,
        },
        text: async () => "x",
      }),
    );
    getNetText("http://example.com/x.html");
    await new Promise((r) => setTimeout(r, 0));
    expect(netMIME()).toBe("text/html; charset=utf-8");
  });

  it("handles image/jpeg content type", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: (n) => (n.toLowerCase() === "content-type" ? "image/jpeg" : null) },
        text: async () => "x",
      }),
    );
    getNetText("http://example.com/i.jpg");
    await new Promise((r) => setTimeout(r, 0));
    expect(netMIME()).toBe("image/jpeg");
  });

  it("returns empty string when header is missing", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "x",
      }),
    );
    getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netMIME()).toBe("");
  });
});
