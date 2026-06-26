import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cacheSize, _resetCacheSizeForTests } from "../cacheSize.js";
import { clearCache } from "../clearCache.js";

describe("cacheSize", () => {
  beforeEach(() => {
    _resetCacheSizeForTests();
  });

  afterEach(() => {
    _resetCacheSizeForTests();
  });

  it("is exported as a function", () => {
    expect(typeof cacheSize).toBe("function");
  });

  it("returns 0 by default", () => {
    expect(cacheSize()).toBe(0);
  });

  it("sets and returns the new value", () => {
    expect(cacheSize(1000)).toBe(1000);
    expect(cacheSize()).toBe(1000);
  });

  it("matches the spec example shape (set to 1MB)", () => {
    if (cacheSize() < 1000) {
      clearCache();
      cacheSize(1000);
    }
    expect(cacheSize()).toBe(1000);
  });

  it("coerces numeric strings to integers", () => {
    cacheSize("2048");
    expect(cacheSize()).toBe(2048);
  });

  it("ignores non-finite values", () => {
    cacheSize(500);
    cacheSize(NaN);
    expect(cacheSize()).toBe(500);
  });
});

describe("clearCache", () => {
  it("is exported as a function", () => {
    expect(typeof clearCache).toBe("function");
  });

  it("takes no parameters", () => {
    expect(clearCache.length).toBe(0);
  });

  it("does not throw", () => {
    expect(() => clearCache()).not.toThrow();
  });

  it("returns undefined", () => {
    expect(clearCache()).toBeUndefined();
  });

  it("matches the spec example shape (startMovie handler)", () => {
    const startMovie = () => {
      clearCache();
    };
    expect(() => startMovie()).not.toThrow();
  });
});
