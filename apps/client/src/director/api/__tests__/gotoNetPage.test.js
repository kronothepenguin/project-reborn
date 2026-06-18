import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { gotoNetPage } from "../gotoNetPage.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { __resetForTests } from "../_netRegistry.js";

describe("gotoNetPage", () => {
  beforeEach(() => {
    __resetForTests();
    delete window.location;
    window.location = { href: "" };
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is exported as a function", () => {
    expect(typeof gotoNetPage).toBe("function");
  });

  it("returns a numeric transaction ID", () => {
    const id = gotoNetPage("http://example.com/page.html");
    expect(typeof id).toBe("number");
  });

  it("navigates the current page when no target", () => {
    gotoNetPage("http://example.com/page.html");
    expect(window.location.href).toBe("http://example.com/page.html");
  });

  it("opens a new window when targetName is given", () => {
    gotoNetPage("http://example.com/news.html", "frwin");
    expect(window.open).toHaveBeenCalledWith("http://example.com/news.html", "frwin");
  });

  it("uses _new to open a new window", () => {
    gotoNetPage("http://example.com/news.html", "_new");
    expect(window.open).toHaveBeenCalledWith("http://example.com/news.html", "_new");
  });

  it("marks the transaction Complete and OK", () => {
    const id = gotoNetPage("http://example.com/page.html");
    expect(netDone(id)).toBe(true);
    expect(netError(id)).toBe("OK");
  });

  it("throws when URL is missing", () => {
    expect(() => gotoNetPage("")).toThrow(/URL is required/);
  });
});
