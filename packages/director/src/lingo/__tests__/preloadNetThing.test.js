import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { preloadNetThing } from "../preloadNetThing.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { netMIME } from "../netMIME.js";
import { __resetForTests } from "../_netRegistry.js";

describe("preloadNetThing", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof preloadNetThing).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        blob: async () => new Blob(["x"]),
      }),
    );
    const id = preloadNetThing("http://example.com/movie.dcr");
    expect(typeof id).toBe("number");
    expect(id).toBeGreaterThan(0);
  });

  it("starts a fetch for the URL", () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        blob: async () => new Blob(["x"]),
      }),
    );
    preloadNetThing("http://example.com/movie.dcr");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("http://example.com/movie.dcr");
  });

  it("uses force-cache to put the response in cache", () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        blob: async () => new Blob(["x"]),
      }),
    );
    preloadNetThing("http://example.com/movie.dcr");
    expect(fetchSpy.mock.calls[0][1].cache).toBe("force-cache");
  });

  it("marks Complete and OK on success", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (n) => (n.toLowerCase() === "content-type" ? "application/x-director" : null),
        },
        blob: async () => new Blob(["x"]),
      }),
    );
    const id = preloadNetThing("http://example.com/movie.dcr");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("OK");
    expect(netMIME()).toBe("application/x-director");
  });

  it("marks Error on HTTP failure", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        headers: { get: () => null },
        blob: async () => new Blob([]),
      }),
    );
    const id = preloadNetThing("http://example.com/missing.dcr");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("HTTP 404");
  });

  it("marks Error on network failure", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.reject(new Error("net-down")),
    );
    const id = preloadNetThing("http://example.com/movie.dcr");
    await new Promise((r) => setTimeout(r, 0));
    expect(netError(id)).toBe("net-down");
  });

  it("throws when URL is missing", () => {
    expect(() => preloadNetThing("")).toThrow(/URL is required/);
  });
});
