import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { gotoNetMovie } from "../gotoNetMovie.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { __resetForTests } from "../_netRegistry.js";

describe("gotoNetMovie", () => {
  beforeEach(() => {
    __resetForTests();
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported as a function", () => {
    expect(typeof gotoNetMovie).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    const id = gotoNetMovie("http://example.com/movie.dcr");
    expect(typeof id).toBe("number");
  });

  it("navigates the browser to the URL", () => {
    gotoNetMovie("http://example.com/movie.dcr");
    expect(window.location.href).toBe("http://example.com/movie.dcr");
  });

  it("marks the transaction Complete and OK", () => {
    const id = gotoNetMovie("http://example.com/movie.dcr");
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("OK");
  });

  it("accepts URL with a marker fragment", () => {
    gotoNetMovie("http://example.com/movie.dcr#Contents");
    expect(window.location.href).toBe("http://example.com/movie.dcr#Contents");
  });

  it("throws when URL is missing", () => {
    expect(() => gotoNetMovie("")).toThrow(/URL is required/);
  });
});
