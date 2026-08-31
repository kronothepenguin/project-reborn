import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netDone } from "../netDone.js";
import { getNetText } from "../getNetText.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netDone", () => {
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
    expect(typeof netDone).toBe("function");
  });

  it("returns false for unknown netID", () => {
    expect(netDone(9999)).toBe(false);
  });

  it("returns false while operation is in progress", () => {
    const id = getNetText("http://example.com/x.txt");
    expect(netDone(id)).toBe(false);
  });

  it("returns true after successful completion", async () => {
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
  });

  it("returns true after error", async () => {
    fetchSpy.mockImplementation(() => Promise.reject(new Error("boom")));
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone(id)).toBe(true);
  });

  it("defaults to last transaction when no netID provided", async () => {
    const id = getNetText("http://example.com/last.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netDone()).toBe(true);
    expect(id).toBeGreaterThan(0);
  });

  it("returns FALSE (boolean false) per spec semantics for pending", () => {
    const id = getNetText("http://example.com/pending.txt");
    expect(netDone(id)).toBe(false);
  });
});
