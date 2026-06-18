import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { lastClick, _setLastClickForTests } from "../lastClick.js";

describe("lastClick", () => {
  beforeEach(() => {
    _setLastClickForTests(0);
  });

  afterEach(() => {
    _setLastClickForTests(0);
  });

  it("is exported as a function", () => {
    expect(typeof lastClick).toBe("function");
  });

  it("takes no parameters", () => {
    expect(lastClick.length).toBe(0);
  });

  it("returns the stored ticks value", () => {
    _setLastClickForTests(120);
    expect(lastClick()).toBe(120);
  });

  it("returns 0 by default", () => {
    expect(lastClick()).toBe(0);
  });

  it("matches the spec example shape (10s = 600 ticks)", () => {
    _setLastClickForTests(600);
    expect(lastClick() > 10 * 60).toBe(false);
  });
});
