import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netLastModDate } from "../netLastModDate.js";
import { getNetText } from "../getNetText.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netLastModDate", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof netLastModDate).toBe("function");
  });

  it("returns empty string when no operation has occurred", () => {
    expect(netLastModDate()).toBe("");
  });

  it("returns the Last-Modified header from a successful fetch", async () => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: (name) =>
            name.toLowerCase() === "last-modified"
              ? "Thu, 30 Jan 1997 12:00:00 AM GMT"
              : null,
        },
        text: async () => "x",
      }),
    );
    getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(netLastModDate()).toBe("Thu, 30 Jan 1997 12:00:00 AM GMT");
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
    expect(netLastModDate()).toBe("");
  });
});
