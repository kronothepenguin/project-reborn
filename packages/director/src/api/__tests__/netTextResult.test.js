import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netTextResult } from "../netTextResult.js";
import { getNetText } from "../getNetText.js";
import { postNetText } from "../postNetText.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netTextResult", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof netTextResult).toBe("function");
  });

  it("returns empty string for unknown netID", () => {
    expect(netTextResult(9999)).toBe("");
  });

  it("returns fetched text after successful getNetText", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "fetched body",
      }),
    );
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult(id)).toBe("fetched body");
  });

  it("returns server response after successful postNetText", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "ok-from-server",
      }),
    );
    const id = postNetText("http://example.com/api", "data");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult(id)).toBe("ok-from-server");
  });

  it("returns empty string when no operation has occurred", () => {
    expect(netTextResult()).toBe("");
  });

  it("defaults to last transaction when no netID provided", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "last",
      }),
    );
    getNetText("http://example.com/last.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult()).toBe("last");
  });

  it("returns empty string on failure", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.reject(new Error("boom")),
    );
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netTextResult(id)).toBe("");
  });
});
