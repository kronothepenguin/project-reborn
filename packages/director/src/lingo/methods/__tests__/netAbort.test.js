import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { netAbort } from "../netAbort.js";
import { getNetText } from "../getNetText.js";
import { downloadNetThing } from "../downloadNetThing.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { __resetForTests } from "../_netRegistry.js";

describe("netAbort", () => {
  let fetchSpy;

  beforeEach(() => {
    __resetForTests();
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => new Promise(() => {})); // never resolves
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof netAbort).toBe("function");
  });

  it("cancels an operation by netID", () => {
    const id = getNetText("http://example.com/data.txt");
    expect(netDone(id)).toBe(false);
    netAbort(null, id);
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("4242");
  });

  it("cancels an operation by URL", () => {
    const id = getNetText("http://example.com/data.txt");
    expect(netDone(id)).toBe(false);
    netAbort("http://example.com/data.txt");
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("4242");
  });

  it("does nothing for an unknown URL", () => {
    expect(() => netAbort("http://example.com/unknown.txt")).not.toThrow();
  });

  it("does nothing for an unknown netID", () => {
    expect(() => netAbort(null, 9999)).not.toThrow();
  });

  it("throws when called with neither netID nor URL", () => {
    expect(() => netAbort()).toThrow(/URL is required/);
  });

  it("also aborts downloadNetThing operations", () => {
    const id = downloadNetThing("http://example.com/f.zip", "/tmp/f.zip");
    expect(netDone(id)).toBe(false);
    netAbort(null, id);
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("4242");
  });
});
