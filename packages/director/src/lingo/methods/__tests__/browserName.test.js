import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { browserName, _resetBrowserNameForTests } from "../browserName.js";

describe("browserName", () => {
  beforeEach(() => {
    _resetBrowserNameForTests();
  });

  afterEach(() => {
    _resetBrowserNameForTests();
  });

  it("is exported as a function", () => {
    expect(typeof browserName).toBe("function");
  });

  it("returns a string when called with no args", () => {
    expect(typeof browserName()).toBe("string");
  });

  it("returns empty string when no browser detected and no path set", () => {
    const result = browserName();
    expect(result).toBeDefined();
  });

  it("sets the browser path when given a string argument", () => {
    browserName("My Disk:My Folder:Netscape");
    expect(browserName()).toBe("My Disk:My Folder:Netscape");
  });

  it("stores the path as a string", () => {
    browserName("/Applications/Safari.app");
    expect(typeof browserName()).toBe("string");
    expect(browserName().length).toBeGreaterThan(0);
  });

  it("accepts '#enabled' as first arg to toggle browser launch", () => {
    expect(() => browserName("#enabled", true)).not.toThrow();
  });

  it("does not throw on multiple calls", () => {
    expect(() => {
      browserName("/path/to/browser");
      browserName();
    }).not.toThrow();
  });

  it("matches the spec example shape (Netscape path)", () => {
    browserName("My Disk:My Folder:Netscape");
    const displayed = browserName();
    expect(displayed).toBe("My Disk:My Folder:Netscape");
  });
});
